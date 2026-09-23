output "bucket_name" {
  value = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "Valeur utilisée par le job deploy-production de push_master.workflow.yml."
  value       = aws_cloudfront_distribution.site.id
}

output "url" {
  value = "https://console.kuzzle.io"
}
