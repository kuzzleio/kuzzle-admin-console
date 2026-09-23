# console.kuzzle.io — la **production** de l'Admin Console.
#
# Alimentée par un push sur `master` (`.github/workflows/push_master.workflow.yml`,
# job `deploy-production`).
#
# Cette infrastructure existe depuis des années et a été créée à la main. Ce
# module ne la crée pas : il la met sous Terraform **telle qu'elle est**, par
# `import`. La configuration a été produite par
# `terraform plan -generate-config-out=`, puis relue et commentée.
#
# Règle de ce module : il décrit le réel, il ne le corrige pas. Plusieurs
# réglages ci-dessous mériteraient d'être changés — ils sont signalés par
# « HÉRITÉ ». Les changer est un geste séparé, qui se décide sur un `plan` lu à
# tête reposée, pas un effet de bord d'une mise sous IaC.
#
# Le contrôle qui compte : `terraform plan` doit annoncer **0 à modifier**.

# Attention au nom cherché : le certificat vivant a `kuzzle.io` pour nom
# principal et `*.kuzzle.io` en SAN. Il existe aussi un certificat nommé
# `*.kuzzle.io`, mais il est EXPIRÉ — chercher le wildcard paraît juste et ne
# renvoie rien.
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
  bucket = "console.kuzzle.io"
  region = "us-west-2"
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  region = "us-west-2"

  index_document {
    suffix = "index.html"
  }
}

# Le bucket n'a ni `public_access_block` ni `ownership_controls` : il est
# antérieur au blocage par défaut d'avril 2023, et son accès public repose sur
# cette seule politique. Ne rien ajouter ici — poser un `public_access_block`,
# même permissif, serait un changement réel sur un environnement servi.
resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  region = "us-west-2"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = ""
      Effect = "Allow"
      Principal = {
        AWS = "*"
      }
      Action   = "s3:GetObject"
      Resource = "${aws_s3_bucket.site.arn}/*"
    }]
  })
}

# --------------------------------------------------------------------------
# CloudFront
# --------------------------------------------------------------------------

# Remplace le bloc `forwarded_values` du comportement par défaut.
#
# Les TTL et la clé de cache sont repris à l'identique : aucune query string,
# aucun cookie, aucun en-tête, 0 / 300 / 31536000.
#
# **La seule différence de comportement** est `enable_accept_encoding_*` :
# l'ancienne API ne mettait pas `Accept-Encoding` dans la clé de cache, la
# nouvelle l'y met sous forme normalisée. C'est la configuration recommandée
# quand `compress = true`, et l'effet observable se limite à quelques
# `Miss from cloudfront` le temps que le cache se reconstitue par encodage. Sur
# du contenu qui est de toute façon invalidé à chaque déploiement, c'est sans
# conséquence. Ce changement a été appliqué et vérifié sur
# next-console.kuzzle.io avant d'arriver ici.
resource "aws_cloudfront_cache_policy" "site" {
  name        = "console-kuzzle-io-cache"
  comment     = "Reprend les TTL et la cle de cache de l ancien forwarded_values"
  min_ttl     = 0
  default_ttl = 300
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
  aliases             = ["console.kuzzle.io"]
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2"
  price_class         = "PriceClass_100"
  default_root_object = "index.html"

  # L'identifiant d'origine est le seul `prod-` de la famille qui soit
  # exact. Ne pas le renommer pour autant : cela forcerait le remplacement du
  # comportement de cache.
  origin {
    origin_id           = "prod-s3-console.kuzzle.io"
    domain_name         = "console.kuzzle.io.s3-website-us-west-2.amazonaws.com"
    connection_attempts = 3
    connection_timeout  = 5

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "http-only"
      origin_read_timeout      = 30
      origin_keepalive_timeout = 5

      # Sans effet observable : l'origine est jointe en `http-only`. Alignés
      # sur les deux autres environnements pour qu'un futur passage en HTTPS
      # vers l'origine ne réactive pas TLS 1.0 et 1.1 par inadvertance.
      origin_ssl_protocols = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id = "prod-s3-console.kuzzle.io"
    compress         = true
    cached_methods   = ["GET", "HEAD"]

    # Le seul changement de ce lot visible d'un client : une requête HTTP
    # reçoit un 301 vers HTTPS au lieu d'être servie en clair. Vérifié sur
    # next-console avant d'arriver ici.
    viewer_protocol_policy = "redirect-to-https"

    # Un site statique ne répond qu'en lecture. Sur staging, un POST reçoit
    # désormais 403 au lieu de tomber sans effet sur l'origine.
    allowed_methods = ["GET", "HEAD", "OPTIONS"]

    # Anciennement `forwarded_values`. Mêmes TTL, même clé de cache — voir le
    # commentaire de la politique pour la seule différence de comportement.
    cache_policy_id = aws_cloudfront_cache_policy.site.id
  }

  # Pas de page d'erreur : on cache seulement les 404 cinq minutes. Le routeur
  # de la console est en historique à dièse, aucune route applicative n'est un
  # chemin S3.
  custom_error_response {
    error_code            = 404
    error_caching_min_ttl = 300
    response_code         = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    # Le certificat `kuzzle.io`, qui porte `*.kuzzle.io` en SAN. Le même que
    # servent les trois environnements. Résolu par source de données plutôt
    # qu'écrit en dur : l'ARN contient l'identifiant du compte, et ce dépôt est
    # public.
    acm_certificate_arn = data.aws_acm_certificate.wildcard.arn
    ssl_support_method  = "sni-only"

    # Politique TLS de 2021 : mêmes versions acceptées, suites resserrées.
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# --------------------------------------------------------------------------
# DNS
# --------------------------------------------------------------------------

resource "aws_route53_record" "site" {
  # `-generate-config-out` émet ici `records`, `ttl`, `set_identifier` et
  # `multivalue_answer_routing_policy`, qui s'excluent mutuellement avec
  # `alias` et font échouer la validation. Limitation connue du générateur sur
  # les enregistrements d'alias : les quatre sont retirés à la main.
  name    = "console.kuzzle.io"
  type    = "A"
  zone_id = "ZS36LQZ8E109R"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = "Z2FDTNDATAQYW2"
    evaluate_target_health = false
  }
}
