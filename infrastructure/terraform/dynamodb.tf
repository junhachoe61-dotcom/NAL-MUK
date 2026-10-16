resource "aws_dynamodb_table" "subscriptions" {
  name         = "subtrack-${var.environment}-subscriptions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  attribute {
    name = "GSI2PK"
    type = "S"
  }

  attribute {
    name = "GSI2SK"
    type = "S"
  }

  # GSI1: 구독 ID 및 결제일 기준 정렬 조회
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  # GSI2: 카테고리별 및 금액 기준 정렬 조회
  global_secondary_index {
    name            = "GSI2"
    hash_key        = "GSI2PK"
    range_key       = "GSI2SK"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "prod" ? true : false
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "subtrack-${var.environment}-subscriptions"
  }
}

output "dynamodb_table_name" {
  value       = aws_dynamodb_table.subscriptions.name
  description = "DynamoDB Main Single Table Name"
}

output "dynamodb_table_arn" {
  value       = aws_dynamodb_table.subscriptions.arn
  description = "DynamoDB Main Single Table ARN"
}
