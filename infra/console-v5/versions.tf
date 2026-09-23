terraform {
  # `use_lockfile` (verrou natif S3, sans table DynamoDB) exige Terraform >= 1.10.
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Le compte Kuzzle a déjà un bucket d'état, en us-east-2, versionné, avec des
  # clés à plat nommées `<ressource>.tfstate`. On s'y range plutôt que d'en
  # ouvrir un autre.
  backend "s3" {
    bucket       = "kuzzle.terraform.states"
    key          = "console-v5.kuzzle.io.tfstate"
    region       = "us-east-2"
    use_lockfile = true
  }
}

provider "aws" {
  region = var.region
}

# Un certificat servi par CloudFront doit vivre dans us-east-1, quelle que soit
# la région du bucket. D'où ce second provider, qui ne sert qu'à le lire.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
