---
description: Vercel 자동 배포 (승인 없이 자동 진행)
---

// turbo-all

# 🚀 Vercel 자동 배포 워크플로우

> 모든 단계가 자동으로 진행됩니다.

## 실행 명령어

```bash
# 1. 빌드 테스트
npm run build

# 2. GitHub Push
git add .
git commit -m "Deploy update"
git push origin main

# 3. Vercel 배포
npx -y vercel --prod --yes
```

## 완료 조건
- 배포 URL 접속 가능
- 메인 페이지 정상 로딩
