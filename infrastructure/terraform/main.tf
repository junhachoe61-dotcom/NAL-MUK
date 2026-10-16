terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "subtrack-terraform-state"
    key            = "serverless-web/terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "subtrack-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "subtrack"
      Environment = var.environment
      ManagedBy   = "terraform"
      Methodology = "loop-engineering"
    }
  }
}

variable "aws_region" {
  type        = string
  default     = "ap-northeast-2"
  description = "AWS Region"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Deployment environment (dev, staging, prod)"
}
