# 🔧 Harness Pipeline 가이드

> 서버리스 웹 프로젝트의 **Harness CI/CD 파이프라인** 구성 및 운영 가이드

---

## 개요

Harness는 **AI 기반 소프트웨어 딜리버리 플랫폼**으로, 본 프로젝트에서는 다음 모듈을 활용합니다:

| 모듈 | 용도 |
|------|------|
| **Harness CI** | 빌드, 테스트, 보안 스캔 자동화 |
| **Harness CD** | 서버리스 함수 및 프론트엔드 배포 자동화 |
| **Harness CV** | 배포 후 자동 검증 (Continuous Verification) |
| **Harness Feature Flags** | 점진적 기능 롤아웃 |
| **Harness CCM** | 클라우드 비용 관리 |

---

## 📁 파이프라인 파일 구조

```
.harness/
├── pipeline.yaml           # 메인 CI/CD 파이프라인
├── triggers.yaml           # Git 트리거 정의
├── templates/
│   ├── ci-steps.yaml       # CI 공통 스텝 템플릿
│   ├── deploy-lambda.yaml  # Lambda 배포 템플릿
│   └── verify-cv.yaml      # CV 검증 템플릿
└── environments/
    ├── dev.yaml            # 개발 환경 설정
    ├── staging.yaml        # 스테이징 환경 설정
    └── production.yaml     # 프로덕션 환경 설정
```

---

## 🏗️ 메인 파이프라인 구성

### 전체 파이프라인 흐름

```
[Git Push / PR]
      │
      ▼
┌─────────────┐
│  CI Stage   │  ← 빌드 & 테스트
│             │
│  ① Lint     │
│  ② Test     │
│  ③ Scan     │
│  ④ Build    │
└──────┬──────┘
       │ 성공 시
       ▼
┌─────────────┐
│  DEV Deploy │  ← develop 브랜치 자동 배포
│  (자동)      │
└──────┬──────┘
       │ 성공 시
       ▼
┌─────────────┐
│  Staging    │  ← 통합 테스트 실행
│  Deploy     │
│  (자동)      │
└──────┬──────┘
       │ 승인 요청
       ▼
┌─────────────┐
│  Production │  ← Canary 배포 + CV 검증
│  Deploy     │
│  (수동 승인) │
└─────────────┘
```

### pipeline.yaml 예시

```yaml
pipeline:
  name: serverless-web-pipeline
  identifier: serverless_web_pipeline
  projectIdentifier: p1_project
  orgIdentifier: default
  tags:
    project: serverless-web
    team: backend

  stages:
    # ─────────────────────────────────────────
    # Stage 1: CI - 빌드 & 테스트
    # ─────────────────────────────────────────
    - stage:
        name: Build & Test
        identifier: ci_stage
        type: CI
        spec:
          cloneCodebase: true
          platform:
            os: Linux
            arch: Amd64
          runtime:
            type: Cloud
            spec: {}
          execution:
            steps:
              - step:
                  type: Run
                  name: Install Dependencies
                  identifier: install_deps
                  spec:
                    connectorRef: account.github
                    image: node:20-alpine
                    command: npm ci

              - step:
                  type: Run
                  name: Lint Check
                  identifier: lint_check
                  spec:
                    image: node:20-alpine
                    command: npm run lint

              - step:
                  type: Run
                  name: Unit Tests
                  identifier: unit_tests
                  spec:
                    image: node:20-alpine
                    command: |
                      npm run test:unit -- --coverage
                      npm run test:report

              - step:
                  type: Owasp
                  name: Security Scan
                  identifier: security_scan
                  spec:
                    mode: orchestration
                    config: default
                    target:
                      type: repository
                      name: p1-repo
                      variant: <+codebase.branch>

              - step:
                  type: Run
                  name: Build
                  identifier: build
                  spec:
                    image: node:20-alpine
                    command: |
                      npm run build
                      npm run package

    # ─────────────────────────────────────────
    # Stage 2: Deploy to DEV
    # ─────────────────────────────────────────
    - stage:
        name: Deploy to DEV
        identifier: deploy_dev
        type: Deployment
        spec:
          serviceConfig:
            serviceRef: serverless-web-service
          infrastructure:
            environmentRef: dev
            infrastructureDefinition:
              type: ServerlessAwsLambda
              spec:
                connectorRef: account.aws_dev
                region: ap-northeast-2
                stage: dev
          execution:
            steps:
              - step:
                  type: ServerlessAwsLambdaDeploy
                  name: Deploy Lambda (DEV)
                  identifier: deploy_lambda_dev
                  spec:
                    skipDryRun: false

              - step:
                  type: Run
                  name: Integration Tests
                  identifier: integration_tests_dev
                  spec:
                    image: node:20-alpine
                    command: |
                      BASE_URL=<+env.variables.API_BASE_URL> npm run test:integration

    # ─────────────────────────────────────────
    # Stage 3: Deploy to Staging
    # ─────────────────────────────────────────
    - stage:
        name: Deploy to Staging
        identifier: deploy_staging
        type: Deployment
        spec:
          serviceConfig:
            serviceRef: serverless-web-service
          infrastructure:
            environmentRef: staging
            infrastructureDefinition:
              type: ServerlessAwsLambda
              spec:
                connectorRef: account.aws_staging
                region: ap-northeast-2
                stage: staging
          execution:
            steps:
              - step:
                  type: ServerlessAwsLambdaDeploy
                  name: Deploy Lambda (Staging)
                  identifier: deploy_lambda_staging

              - step:
                  type: Run
                  name: E2E Tests
                  identifier: e2e_tests
                  spec:
                    image: mcr.microsoft.com/playwright:v1.40.0
                    command: npx playwright test --reporter=html

    # ─────────────────────────────────────────
    # Stage 4: Deploy to Production
    # ─────────────────────────────────────────
    - stage:
        name: Deploy to Production
        identifier: deploy_production
        type: Deployment
        spec:
          serviceConfig:
            serviceRef: serverless-web-service
          infrastructure:
            environmentRef: production
            infrastructureDefinition:
              type: ServerlessAwsLambda
              spec:
                connectorRef: account.aws_prod
                region: ap-northeast-2
                stage: prod
          execution:
            steps:
              - step:
                  type: HarnessApproval
                  name: Production Deployment Approval
                  identifier: prod_approval
                  spec:
                    approvalMessage: |
                      프로덕션 배포 승인이 필요합니다.
                      - 빌드: <+pipeline.sequenceId>
                      - 커밋: <+codebase.commitSha>
                      - 작성자: <+codebase.gitUser>
                    includePipelineExecutionHistory: true
                    approvers:
                      minimumCount: 1
                      disallowPipelineExecutor: false
                      userGroups:
                        - account.platform-team

              - step:
                  type: ServerlessAwsLambdaCanaryDeploy
                  name: Canary Deploy (10%)
                  identifier: canary_deploy_10
                  spec:
                    instanceSelection:
                      type: Percentage
                      spec:
                        percentage: 10

              - step:
                  type: Verify
                  name: Verify Canary (CV)
                  identifier: verify_canary
                  spec:
                    isMultiServicesOrEnvs: false
                    type: Canary
                    monitoredServiceRef: TEMPLATE
                    healthSources:
                      - identifier: cloudwatch_metrics
                    spec:
                      sensitivity: MEDIUM
                      duration: 15m
                      failOnNoAnalysis: true

              - step:
                  type: ServerlessAwsLambdaCanaryDeploy
                  name: Full Deploy (100%)
                  identifier: canary_deploy_100
                  spec:
                    instanceSelection:
                      type: Percentage
                      spec:
                        percentage: 100
```

---

## 🔀 트리거 설정

### triggers.yaml 예시

```yaml
trigger:
  name: Push to develop
  identifier: push_to_develop
  enabled: true
  orgIdentifier: default
  projectIdentifier: p1_project
  pipelineIdentifier: serverless_web_pipeline
  source:
    type: Webhook
    spec:
      type: Github
      spec:
        type: Push
        spec:
          connectorRef: account.github
          autoAbortPreviousExecutions: true
          repoName: p1
          actions: []
          pathFilters:
            - src/**
            - infrastructure/**
          branchFilter:
            type: Regex
            pattern: "^(main|develop|feature/.*)$"
```

---

## 🛡️ Continuous Verification (CV)

Harness CV는 배포 후 자동으로 서비스 상태를 검증합니다.

### 검증 지표

```yaml
# CV 헬스 소스 설정
healthSources:
  - name: CloudWatch Metrics
    identifier: cloudwatch_metrics
    type: CloudWatchMetrics
    spec:
      region: ap-northeast-2
      metricDefinitions:
        - identifier: lambda_error_rate
          metricName: Lambda Error Rate
          riskProfile:
            category: Errors
            metricType: ERROR
            thresholdTypes:
              - ACT_WHEN_HIGHER
          analysis:
            liveMonitoring:
              enabled: true
            deploymentVerification:
              serviceInstanceFieldName: functionName
              serviceInstanceMetricPath: <functionName>

  - name: CloudWatch Logs
    identifier: cloudwatch_logs
    type: CloudWatchLog
    spec:
      region: ap-northeast-2
      logGroupName: /aws/lambda/p1-prod
      serviceInstanceIdentifier: functionName
```

### CV 자동 롤백 조건

| 조건 | 임계값 | 액션 |
|------|--------|------|
| 에러율 증가 | Canary > Baseline × 2 | 즉시 롤백 |
| p99 레이턴시 | > 3000ms | 경고 후 10분 내 미해소 시 롤백 |
| Lambda 스로틀 | > 5% | 즉시 알림 |
| CV 분석 실패 | ML 이상 감지 | 자동 롤백 |

---

## 🔑 시크릿 관리

Harness Secret Manager를 통해 민감 정보를 관리합니다.

```yaml
# 파이프라인에서 시크릿 참조 방법
env:
  AWS_ACCESS_KEY_ID: <+secrets.getValue("aws_access_key_id")>
  AWS_SECRET_ACCESS_KEY: <+secrets.getValue("aws_secret_access_key")>
  DATABASE_URL: <+secrets.getValue("prod_database_url")>
  API_KEY: <+secrets.getValue("third_party_api_key")>
```

### 시크릿 네이밍 컨벤션

```
{환경}_{서비스}_{키이름}
예시:
  prod_lambda_db_password
  staging_api_stripe_key
  dev_aws_access_key
```

---

## 📊 파이프라인 모니터링

### 주요 파이프라인 메트릭

| 지표 | 설명 | 목표 |
|------|------|------|
| Pipeline Success Rate | 성공한 파이프라인 비율 | > 95% |
| Mean Pipeline Duration | 평균 파이프라인 실행 시간 | < 15분 |
| MTTR | 실패 후 복구까지 평균 시간 | < 30분 |
| Deployment Frequency | 배포 빈도 | 주 5회 이상 |

### 알림 설정

```yaml
notificationRules:
  - name: Pipeline Failure Alert
    enabled: true
    pipelineEvents:
      - type: PipelineFailed
      - type: StageFailedWithRollback
    notificationMethod:
      type: Slack
      spec:
        webhookUrl: <+secrets.getValue("slack_webhook_url")>
        userGroups: []
```

---

## 🚀 로컬에서 Harness 테스트

```bash
# Harness CLI 설치
npm install -g harness-cli

# 로그인
harness login --account-id <ACCOUNT_ID> --api-key <API_KEY>

# 파이프라인 유효성 검사
harness pipeline validate --pipeline-file .harness/pipeline.yaml

# 파이프라인 실행 (dry-run)
harness pipeline run \
  --pipeline serverless_web_pipeline \
  --project p1_project \
  --dry-run
```

---

## 📚 참고 자료

- [Harness Developer Hub](https://developer.harness.io/)
- [Harness CI 문서](https://developer.harness.io/docs/continuous-integration)
- [Harness CD 문서](https://developer.harness.io/docs/continuous-delivery)
- [Serverless AWS Lambda 배포](https://developer.harness.io/docs/continuous-delivery/deploy-srv-diff-platforms/serverless/serverless-lambda-cd-quickstart)
- [Continuous Verification](https://developer.harness.io/docs/continuous-delivery/verify/cv-concepts/cv-core-concepts)
