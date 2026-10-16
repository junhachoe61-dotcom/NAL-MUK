# CLAUDE.md — .harness (Harness 파이프라인 디렉토리)

상위 컨텍스트: [루트 CLAUDE.md](../CLAUDE.md)

---

## 📌 이 디렉토리의 역할

**Harness CI/CD 파이프라인** YAML 정의 파일을 관리합니다.  
이 디렉토리의 변경은 CI/CD 흐름 전체에 영향을 미치므로 **특히 신중하게** 작업하세요.

```
.harness/
├── pipeline.yaml          ← 메인 파이프라인 (CI → DEV → STG → PROD)
├── triggers.yaml          ← Git 이벤트 트리거
└── templates/
    ├── ci-steps.yaml      ← CI 공통 스텝 템플릿
    ├── deploy-lambda.yaml ← Lambda 배포 스텝 템플릿
    └── verify-cv.yaml     ← Continuous Verification 템플릿
```

---

## ⚠️ 파이프라인 수정 전 체크리스트

파이프라인 YAML을 수정하기 전에 반드시 확인:

- [ ] `harness pipeline validate` 명령으로 YAML 구문 검증
- [ ] 변경 대상 Stage/Step 파악 (영향 범위 최소화)
- [ ] 시크릿 참조 형식 확인: `<+secrets.getValue("key_name")>`
- [ ] 환경 참조 형식 확인: `<+env.variables.KEY>`
- [ ] 파이프라인 변수 참조 형식 확인: `<+pipeline.variables.KEY>`

---

## 📋 YAML 작성 규칙

```yaml
# ✅ 올바른 시크릿 참조
command: |
  export API_KEY=<+secrets.getValue("prod_api_key")>

# ❌ 금지: 값을 직접 입력
command: |
  export API_KEY=sk-live-xxxx  # 절대 금지!

# ✅ 올바른 identifier 형식 (camelCase 또는 snake_case, 공백 금지)
identifier: deploy_lambda_prod

# ❌ 금지: 공백 포함
identifier: "deploy lambda prod"  # 오류 발생
```

---

## 🔄 Loop Engineering과 파이프라인 매핑

| Loop 단계 | 파이프라인 Stage |
|-----------|----------------|
| BUILD | `ci_stage` (Lint → Test → Scan → Build) |
| DEPLOY | `deploy_dev` → `deploy_staging` → `deploy_production` |
| MONITOR | Harness CV (`verify_canary` step) |
| FEEDBACK | Harness Analytics + 알림 (`notificationRules`) |

---

## 🚫 파이프라인 수정 금지 사항

- `deploy_production` Stage의 `HarnessApproval` step 삭제 금지
- `Verify` step (CV) 우회하는 배포 흐름 생성 금지
- Production 환경에 Canary 없는 직접 배포 설정 금지
- 시크릿 값을 YAML에 하드코딩 금지

---

## 📚 Harness YAML 문법 참고

- [Harness Pipeline Schema](https://developer.harness.io/docs/platform/pipelines/harness-yaml-quickstart)
- [내장 변수 목록](https://developer.harness.io/docs/platform/variables-and-expressions/harness-variables)
- [시크릿 참조](https://developer.harness.io/docs/platform/secrets/add-use-text-secrets)
- [CV 설정](https://developer.harness.io/docs/continuous-delivery/verify/cv-concepts/cv-core-concepts)
