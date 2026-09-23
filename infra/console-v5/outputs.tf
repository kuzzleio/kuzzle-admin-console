output "bucket_name" {
  description = "Valeur à poser dans la variable de dépôt CONSOLE_V5_S3_BUCKET."
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "Valeur à poser dans la variable de dépôt CONSOLE_V5_CLOUDFRONT_ID."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "Nom de domaine CloudFront, utile pour tester avant la propagation DNS."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "url" {
  description = "URL publique une fois le DNS propagé."
  value       = "https://${var.domain_name}"
}

# Les deux commandes qui branchent la CI sur l'infra qu'on vient de créer.
# Le job `deploy-v5` de push_5_dev.workflow.yml est ignoré tant que ces deux
# variables sont vides (ADR-0030) ; il s'allume dès qu'elles sont posées, sans
# PR ni modification de workflow.
output "wire_up_ci" {
  description = "À copier-coller pour activer le déploiement automatique."
  value       = <<-EOT
    gh variable set CONSOLE_V5_S3_BUCKET     --repo kuzzleio/kuzzle-admin-console --body '${aws_s3_bucket.site.id}'
    gh variable set CONSOLE_V5_CLOUDFRONT_ID --repo kuzzleio/kuzzle-admin-console --body '${aws_cloudfront_distribution.site.id}'
  EOT
}
