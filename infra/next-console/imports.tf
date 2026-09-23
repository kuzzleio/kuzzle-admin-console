# Blocs d'import — l'infrastructure de next-console.kuzzle.io existe depuis des
# années et a été créée à la main. On ne crée rien ici : on la met sous
# Terraform telle qu'elle est.
#
# Le contrôle qui compte est un `plan` **vide**. Tant qu'il propose la moindre
# modification, la configuration ne décrit pas le réel — et un `apply` toucherait
# à un environnement que l'équipe regarde.

import {
  to = aws_s3_bucket.site
  id = "next.console.kuzzle.io"
}

import {
  to = aws_s3_bucket_website_configuration.site
  id = "next.console.kuzzle.io"
}

import {
  to = aws_s3_bucket_policy.site
  id = "next.console.kuzzle.io"
}

import {
  to = aws_cloudfront_distribution.site
  id = "E35G0B414M3IWU"
}

import {
  to = aws_route53_record.site
  id = "ZS36LQZ8E109R_next-console.kuzzle.io_A"
}
