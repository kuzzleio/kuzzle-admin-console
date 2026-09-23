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

      # HÉRITÉ — TLS 1.0 et 1.1 vers l'origine. Sans effet réel ici, l'origine
      # étant jointe en `http-only`, mais à nettoyer le jour où on y touche.
      origin_ssl_protocols = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id = "prod-s3-console.kuzzle.io"
    compress         = true
    cached_methods   = ["GET", "HEAD"]

    # HÉRITÉ — la production est joignable en HTTP en clair. console-v5 est en
    # `redirect-to-https`. À combler **après** staging, jamais avant : c'est
    # ici que la vérification coûte le plus cher.
    viewer_protocol_policy = "allow-all"

    # HÉRITÉ — méthodes d'écriture autorisées sur un site statique. Elles ne
    # mènent nulle part, mais les retirer est un changement, pas un import.
    allowed_methods = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]

    min_ttl     = 0
    default_ttl = 300
    max_ttl     = 31536000

    # HÉRITÉ — `forwarded_values` est l'API d'avant les politiques de cache
    # nommées, dépréciée par le provider. console-v5 utilise une
    # `aws_cloudfront_cache_policy` qui reproduit exactement ce comportement.
    # Migrer celle-ci est un changement réel, et c'est le seul de la liste qui
    # puisse modifier le cache observable. À ne faire qu'une fois la même
    # migration passée et vérifiée sur staging.
    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
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

    # HÉRITÉ — politique TLS de 2019.
    minimum_protocol_version = "TLSv1.2_2019"
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
