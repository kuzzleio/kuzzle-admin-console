variable "region" {
  description = "Région du bucket S3 et de la distribution. Les deux environnements existants sont en us-west-2."
  type        = string
  default     = "us-west-2"
}

variable "domain_name" {
  description = "Nom de domaine public servi par CloudFront."
  type        = string
  default     = "console-v5.kuzzle.io"
}

variable "bucket_name" {
  description = <<-EOT
    Nom du bucket S3. La convention du compte veut le bucket en notation pointée
    et le domaine en tiret : `next.console.kuzzle.io` sert `next-console.kuzzle.io`.
  EOT
  type        = string
  default     = "v5.console.kuzzle.io"
}

variable "hosted_zone_name" {
  description = "Zone Route 53 publique qui porte l'enregistrement."
  type        = string
  default     = "kuzzle.io."
}

variable "price_class" {
  description = "Classe de prix CloudFront. PriceClass_100 = Amérique du Nord et Europe, comme les deux autres environnements."
  type        = string
  default     = "PriceClass_100"
}

variable "default_ttl" {
  description = <<-EOT
    TTL par défaut, en secondes. 300 comme en staging : sur un environnement de
    revue, on veut voir son déploiement vite. Le déploiement invalide `/*` de
    toute façon, ce TTL n'est qu'un filet.
  EOT
  type        = number
  default     = 300
}

variable "tags" {
  description = "Étiquettes posées sur les ressources qui en acceptent."
  type        = map(string)
  default = {
    Project     = "kuzzle-admin-console"
    Environment = "v5"
    ManagedBy   = "terraform"
    Repository  = "kuzzleio/kuzzle-admin-console"
  }
}
