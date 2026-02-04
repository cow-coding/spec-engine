# VS Code Marketplace 배포 가이드

## ✅ 완료된 준비사항

- [x] 아이콘 생성 (icon.png, icon.svg)
- [x] package.json 메타데이터 추가
- [x] README.md 작성 완료
- [x] GitHub 저장소 연동

## 📋 배포 단계

### Step 1: Azure DevOps Publisher 계정 생성

1. **Visual Studio Marketplace 접속**
   - URL: https://marketplace.visualstudio.com/manage
   - Microsoft 계정으로 로그인

2. **Publisher 생성**
   - "Create Publisher" 버튼 클릭
   - **Publisher ID** 입력
     - 예시: `cow-coding`, `your-name`, `your-company`
     - ⚠️ 한 번 설정하면 변경 불가하니 신중하게!
     - 소문자, 숫자, 하이픈(-) 만 사용 가능
   - **Display Name** 입력 (마켓플레이스에 표시될 이름)
   - **Description** 입력 (선택사항)

3. **생성 완료 후 Publisher ID 기억**
   - 이 ID를 package.json에 추가해야 함

### Step 2: Personal Access Token (PAT) 발급

1. **Azure DevOps 접속**
   - URL: https://dev.azure.com/

2. **Token 생성**
   - 우측 상단 Settings (톱니바퀴) → Personal Access Tokens
   - "New Token" 클릭

3. **Token 설정**
   - **Name**: `vscode-marketplace` (또는 원하는 이름)
   - **Organization**: `All accessible organizations` 선택
   - **Expiration**: 90일 또는 원하는 기간
   - **Scopes**:
     - "Marketplace" 섹션 찾기
     - **"Marketplace > Manage"** 체크 ✅

4. **Token 생성 및 저장**
   - "Create" 클릭
   - ⚠️ **매우 중요**: Token이 화면에 표시되면 즉시 복사하여 안전한 곳에 저장
   - 이 Token은 다시 볼 수 없음!

### Step 3: package.json 업데이트

1. **Publisher ID 업데이트**
   ```bash
   # package.json 파일에서 다음 부분 수정
   "publisher": "YOUR_PUBLISHER_ID"

   # 예시:
   "publisher": "cow-coding"
   ```

2. **변경사항 커밋**
   ```bash
   git add package.json
   git commit -m "Update publisher ID"
   git push
   ```

### Step 4: vsce 설치 및 로그인

1. **vsce 설치** (VS Code Extension Manager)
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Publisher 로그인**
   ```bash
   vsce login <your-publisher-id>
   ```

   - 프롬프트가 나타나면 Step 2에서 생성한 **PAT 입력**
   - 성공 메시지 확인: `Successfully logged in as <publisher-id>`

### Step 5: 확장 프로그램 패키징

1. **빌드 확인**
   ```bash
   npm run compile
   ```

2. **VSIX 파일 생성**
   ```bash
   vsce package
   ```

   - 성공하면 `spec-engine-0.1.0.vsix` 파일 생성됨
   - 이 파일로 로컬 설치 테스트 가능:
     ```bash
     code --install-extension spec-engine-0.1.0.vsix
     ```

### Step 6: 마켓플레이스 배포

#### 옵션 A: CLI로 배포 (추천)

```bash
vsce publish
```

- 자동으로 버전 증가 및 배포
- 배포 후 마켓플레이스 URL 출력됨

#### 옵션 B: 수동 업로드

1. https://marketplace.visualstudio.com/manage 접속
2. Publisher 선택
3. "New Extension" → "Upload" 클릭
4. `.vsix` 파일 업로드

### Step 7: 배포 확인

1. **마켓플레이스에서 확인**
   - 배포 후 5-10분 정도 소요
   - URL: `https://marketplace.visualstudio.com/items?itemName=<publisher-id>.spec-engine`

2. **VS Code에서 검색**
   - VS Code 열기 → Extensions (`Cmd+Shift+X`)
   - "Spec Engine" 검색
   - 설치 버튼이 보이면 성공!

## 🔄 업데이트 배포

### 버전 업데이트 방법

```bash
# 패치 버전 증가 (0.1.0 → 0.1.1)
vsce publish patch

# 마이너 버전 증가 (0.1.0 → 0.2.0)
vsce publish minor

# 메이저 버전 증가 (0.1.0 → 1.0.0)
vsce publish major
```

또는 수동으로:

```bash
# package.json에서 버전 수정 후
vsce publish
```

## 📊 배포 후 관리

### 통계 확인

- https://marketplace.visualstudio.com/manage
- Publisher 선택 → Extension 클릭
- Downloads, Ratings, Reviews 확인

### 이슈 관리

- GitHub Issues에서 관리: https://github.com/cow-coding/spec-engine/issues
- 사용자 피드백 확인 및 대응

## 🛠️ 트러블슈팅

### "publisher not found" 에러

- Step 1에서 Publisher 계정 생성 확인
- `vsce login` 재시도

### "Invalid publisher name" 에러

- package.json의 publisher 필드 확인
- 소문자, 숫자, 하이픈만 사용

### "Authentication failed" 에러

- PAT가 만료되었거나 권한 부족
- Step 2에서 새 PAT 발급 (Marketplace > Manage 권한 확인)

### 패키징 실패

```bash
# dependencies를 devDependencies로 이동 (선택사항)
# canvas는 개발용이므로 제거 가능
npm uninstall canvas
npm run compile
vsce package
```

## 📝 체크리스트

배포 전 최종 확인:

- [ ] README.md 완성도 확인
- [ ] CHANGELOG.md 작성 (선택사항)
- [ ] 아이콘 표시 확인 (128x128)
- [ ] package.json 메타데이터 완성
- [ ] Publisher ID 업데이트
- [ ] 로컬 테스트 완료
- [ ] Git tag 생성 (선택사항):
  ```bash
  git tag v0.1.0
  git push --tags
  ```

## 🎉 배포 완료 후

1. **소셜 미디어 공유**
   - Twitter, LinkedIn 등에 공유
   - #vscode #ai #ollama 해시태그 활용

2. **README 배지 추가**
   ```markdown
   [![Version](https://img.shields.io/visual-studio-marketplace/v/publisher-id.spec-engine)](https://marketplace.visualstudio.com/items?itemName=publisher-id.spec-engine)
   [![Downloads](https://img.shields.io/visual-studio-marketplace/d/publisher-id.spec-engine)](https://marketplace.visualstudio.com/items?itemName=publisher-id.spec-engine)
   ```

3. **사용자 피드백 모니터링**
   - GitHub Issues
   - Marketplace Reviews
   - 개선사항 반영

---

**다음 단계**: Step 1부터 순서대로 진행하세요!
