output "bucket_name" {
  value = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "Valeur utilisée par le job deploy-staging de push_dev.workflow.yml, sur 4-dev."
  value       = aws_cloudfront_distribution.site.id
}

output "url" {
  value = "https://next-console.kuzzle.io"
}
