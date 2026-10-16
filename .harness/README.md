# .harness 디렉토리

이 디렉토리는 Harness 파이프라인 정의 파일을 포함합니다.

## 파일 구조

```
.harness/
├── pipeline.yaml          # 메인 CI/CD 파이프라인 정의
├── triggers.yaml          # Git 이벤트 트리거 설정
└── templates/
    ├── ci-steps.yaml      # CI 공통 스텝 템플릿
    ├── deploy-lambda.yaml # Lambda 배포 스텝 템플릿
    └── verify-cv.yaml     # Continuous Verification 템플릿
```

## Harness 파이프라인 연결

1. [Harness Platform](https://app.harness.io)에서 프로젝트를 생성합니다.
2. Git 커넥터를 이 저장소에 연결합니다.
3. `.harness/pipeline.yaml`을 가져와 파이프라인을 초기화합니다.

자세한 설정은 [HARNESS_PIPELINE.md](../docs/HARNESS_PIPELINE.md)를 참고하세요.
