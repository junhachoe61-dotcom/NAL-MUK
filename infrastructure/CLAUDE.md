# CLAUDE.md — infrastructure (인프라 코드)

상위 컨텍스트: [루트 CLAUDE.md](../CLAUDE.md)

---

## 📌 이 디렉토리의 역할

**IaC(Infrastructure as Code)** 코드를 관리합니다.  
Terraform과 Serverless Framework 두 가지 도구를 함께 사용합니다.

```
infrastructure/
├── terraform/                  ← Terraform (고정 인프라)
│   ├── main.tf                 ← 프로바이더, 백엔드 설정
│   ├── variables.tf            ← 변수 정의
│   ├── outputs.tf              ← 출력값
│   ├── modules/                ← 재사용 모듈
│   │   ├── vpc/
│   │   ├── dynamodb/
│   │   ├── cognito/
│   │   └── cloudfront-s3/
│   └── environments/           ← 환경별 변수값
│       ├── dev.tfvars
│       ├── staging.tfvars
│       └── production.tfvars
│
└── serverless.yml              ← Serverless Framework (Lambda + API GW)
```

---

## 🔧 도구별 역할 분리

| 도구 | 담당 리소스 |
|------|------------|
| **Terraform** | VPC, DynamoDB, Cognito, S3, CloudFront, IAM, ElastiCache |
| **Serverless Framework** | Lambda 함수, API Gateway, Lambda IAM Role, Event Sources |

> **중요**: Lambda 함수 리소스는 Terraform으로 중복 관리 금지.  
> Serverless Framework가 Lambda를 전담 관리합니다.

---

## 📋 Terraform 작성 규칙

```hcl
# ✅ 리소스 네이밍: {project}-{env}-{resource}-{suffix}
resource "aws_dynamodb_table" "users" {
  name         = "${var.project_name}-${var.environment}-users"
  billing_mode = "PAY_PER_REQUEST"   # 서버리스 — On-Demand 필수
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  # ✅ 프로덕션은 삭제 방지
  lifecycle {
    prevent_destroy = true
  }

  tags = local.common_tags
}

# ✅ 공통 태그 — 모든 리소스에 적용
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Team        = "platform"
  }
}
```

---

## 📋 serverless.yml 작성 규칙

```yaml
# 새 Lambda 함수 추가 시 이 패턴 사용
functions:
  getUser:
    handler: src/functions/api/users/handler.handler
    description: "사용자 상세 조회"
    memorySize: 512
    timeout: 30
    environment:
      DYNAMODB_TABLE: !Ref UsersTable
    iamRoleStatements:
      - Effect: Allow
        Action:
          - dynamodb:GetItem
        Resource: !GetAtt UsersTable.Arn  # ✅ 최소 권한 — 필요한 Action만
    events:
      - httpApi:
          path: /users/{userId}
          method: GET
          authorizer:
            name: jwtAuthorizer
```

---

## 🚫 인프라 작업 금지 사항

- 프로덕션 리소스 수동 콘솔 변경 금지 → 반드시 코드로 변경
- `prevent_destroy = true` 가 설정된 리소스 삭제 시 팀 승인 필수
- `terraform apply` 전 반드시 `terraform plan` 출력 검토
- IAM 와일드카드(`*`) Action 사용 금지 → 필요한 권한만 명시

---

## ⚡ 자주 사용하는 명령어

```bash
# Terraform
cd infrastructure/terraform
terraform init
terraform plan -var-file="environments/dev.tfvars"
terraform apply -var-file="environments/dev.tfvars"

# Serverless Framework
cd infrastructure
serverless deploy --stage dev
serverless deploy function --function getUser --stage dev  # 단일 함수만 배포 (빠름)
serverless logs --function getUser --stage dev --tail     # 실시간 로그
serverless invoke local --function getUser                # 로컬 실행
```
