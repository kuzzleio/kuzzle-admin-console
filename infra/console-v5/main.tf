# Déploiement de console-v5.kuzzle.io — l'environnement de revue du chantier de
# modernisation (ADR-0030).
#
# Calqué sur next-console.kuzzle.io, relevé le 2026-09-23 : bucket S3 en mode
# site statique, exposé publiquement, servi par CloudFront en origine
# personnalisée. Les écarts assumés sont listés dans le README, chacun commenté
# ici à son emplacement.

data "aws_route53_zone" "this" {
  name         = var.hosted_zone_name
  private_zone = false
}

# Le certificat en vigueur couvre déjà console-v5.kuzzle.io : rien à émettre,
# rien à valider. C'est celui que servent les deux autres environnements.
#
# Attention au nom cherché : le certificat vivant a `kuzzle.io` pour nom
# principal et `*.kuzzle.io` en SAN. Il existe par ailleurs un certificat dont
# le nom principal est `*.kuzzle.io`, mais il est EXPIRÉ. Chercher le wildcard
# paraît donc juste et ne renvoie rien — ou pire, renverrait le mauvais si on
# omettait le filtre sur `ISSUED`.
data "aws_acm_certificate" "wildcard" {
  provider    = aws.us_east_1
  domain      = "kuzzle.io"
  statuses    = ["ISSUED"]
  most_recent = true
}

# --------------------------------------------------------------------------
# Bucket
# --------------------------------------------------------------------------

resource "aws_s3_bucket" "site" {
  bucket = var.bucket_name
  tags   = var.tags
}

# ÉCART 1 — les buckets créés depuis avril 2023 bloquent par défaut toute
# politique publique. Le bucket de staging est antérieur et n'a aucune
# configuration de ce type. Il faut donc désactiver explicitement ce que
# l'ancien n'avait jamais eu à désactiver, sinon la politique ci-dessous est
# refusée. Ce n'est pas un relâchement : c'est ce que fait déjà l'existant.
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# ÉCART 2 — staging n'a aucun contrôle de propriété (ACL héritées). On désactive
# les ACL : l'accès public passe par la politique de bucket, seul mécanisme
# réellement utilisé ici.
resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  # Pas de `error_document` : c'est la configuration de staging à l'identique.
  # Le routeur de la console est en `createWebHashHistory` — toutes les routes
  # applicatives vivent sous `/#/`, aucune n'est un chemin S3. Une réécriture
  # SPA n'aurait rien à réécrire.
  index_document {
    suffix = "index.html"
  }
}

data "aws_iam_policy_document" "public_read" {
  statement {
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.public_read.json

  # Sans cet ordre, la politique part avant la levée du blocage et AWS la
  # refuse.
  depends_on = [aws_s3_bucket_public_access_block.site]
}

# --------------------------------------------------------------------------
# CloudFront
# --------------------------------------------------------------------------

# Staging utilise `forwarded_values`, l'API de cache d'avant les politiques
# nommées, aujourd'hui dépréciée par le provider. Cette politique reproduit son
# comportement exact : aucune query string, aucun cookie, aucun en-tête dans la
# clé de cache, et les mêmes TTL.
resource "aws_cloudfront_cache_policy" "site" {
  name        = "${replace(var.domain_name, ".", "-")}-cache"
  comment     = "Reprend le comportement de cache de next-console.kuzzle.io"
  min_ttl     = 0
  default_ttl = var.default_ttl
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2"
  price_class         = var.price_class
  aliases             = [var.domain_name]
  default_root_object = "index.html"
  comment             = "Admin Console v5 — environnement de revue du chantier de modernisation"
  tags                = var.tags

  # L'origine est l'endpoint *site statique* de S3, pas l'endpoint REST : c'est
  # lui qui résout `index.html` sur un préfixe. Il ne parle que HTTP, d'où
  # `http-only` — identique à staging.
  origin {
    origin_id   = "s3-website-${var.bucket_name}"
    domain_name = aws_s3_bucket_website_configuration.site.website_endpoint

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "http-only"
      origin_ssl_protocols     = ["TLSv1.2"]
      origin_read_timeout      = 30
      origin_keepalive_timeout = 5
    }
  }

  default_cache_behavior {
    target_origin_id = "s3-website-${var.bucket_name}"
    compress         = true
    cache_policy_id  = aws_cloudfront_cache_policy.site.id

    # ÉCART 3 — staging est en `allow-all`, donc joignable en HTTP en clair.
    # Ouvrir un domaine neuf dans cet état serait une régression gratuite : la
    # console manipule des identifiants de connexion à un backend.
    viewer_protocol_policy = "redirect-to-https"

    # ÉCART 4 — staging autorise PUT, POST, DELETE et PATCH. Sur un site
    # statique, ces méthodes ne mènent nulle part ; on s'en tient à ce qui sert.
    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]
  }

  # Reprise de staging : on ne sert pas de page d'erreur, on se contente de
  # cacher les 404 cinq minutes pour ne pas marteler l'origine.
  custom_error_response {
    error_code            = 404
    error_caching_min_ttl = 300
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.wildcard.arn
    ssl_support_method  = "sni-only"

    # ÉCART 5 — staging est resté en TLSv1.2_2019. Rien n'oblige à reconduire
    # une politique de 2019 sur un domaine créé aujourd'hui.
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# --------------------------------------------------------------------------
# DNS
# --------------------------------------------------------------------------

resource "aws_route53_record" "site" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name = aws_cloudfront_distribution.site.domain_name
    # Zone fixe de CloudFront, identique pour toutes les distributions.
    zone_id                = "Z2FDTNDATAQYW2"
    evaluate_target_health = false
  }
}
