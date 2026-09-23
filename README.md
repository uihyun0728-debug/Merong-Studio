# 메롱스튜디오 촬영 기획서 (모바일 대응)

모델이 각자 촬영 기획서를 작성·제출하고(이미지 첨부 포함, 모바일 카메라/갤러리 모두 지원),
관리자만 로그인 후 전체 제출 내역을 확인할 수 있는 웹앱입니다.

- 모델 여러 명이 동시에 제출해도 서로 충돌하지 않습니다 (각자 독립된 행으로 저장).
- 모델은 자신이 제출한 내용을 포함해 어떤 데이터도 다시 조회할 수 없습니다 (DB 권한상 INSERT만 허용).
- 이미지 업로드는 `<input type="file" accept="image/*">` 방식이라 모바일에서 카메라 촬영과 갤러리 선택을 모두 지원합니다.

## 1. Supabase 프로젝트 준비

1. https://supabase.com 에서 새 프로젝트 생성
2. 좌측 메뉴 **SQL Editor** 에서 `supabase/schema.sql` 파일 내용을 전체 붙여넣고 실행
   - `submissions` 테이블, RLS 정책, `shoot-images` 스토리지 버킷이 한 번에 생성됩니다.
3. 좌측 메뉴 **Authentication > Users** 에서 관리자로 쓸 계정을 이메일/비밀번호로 1개 직접 생성
   (회원가입 페이지는 따로 만들지 않았습니다. 관리자 1인 체제 기준입니다.)
4. **Project Settings > API** 에서 `Project URL`과 `anon public` 키를 복사해둡니다.

## 2. 로컬에서 환경변수 설정

`.env.local.example`을 복사해 `.env.local`로 만들고 값을 채웁니다.

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. 로컬 실행 (선택)

```bash
npm install
npm run dev
```

`http://localhost:3000` → 모델용 기획서 폼
`http://localhost:3000/admin/login` → 관리자 로그인

## 4. GitHub에 올리기

```bash
git init
git add .
git commit -m "메롱스튜디오 촬영 기획서"
git branch -M main
git remote add origin <본인의 GitHub 저장소 주소>
git push -u origin main
```

## 5. Vercel 배포

1. https://vercel.com 에서 New Project → 방금 만든 GitHub 저장소 Import
2. 배포 설정 화면의 **Environment Variables** 에 아래 두 개를 추가
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy 클릭

배포가 끝나면 발급된 주소(예: `https://merong-shoot.vercel.app`)를 모델들에게 공유하면 됩니다.
관리자 페이지는 `https://merong-shoot.vercel.app/admin/login` 입니다.

## 폴더 구조

```
app/
  page.js               모델용 기획서 작성/제출 폼
  admin/login/page.js   관리자 로그인
  admin/dashboard/page.js  관리자 전용 제출 목록 (로그인 필요)
  layout.js, globals.css
lib/supabaseClient.js   Supabase 클라이언트 설정
supabase/schema.sql     테이블 + 권한(RLS) + 스토리지 버킷 생성 SQL
```

## 나중에 더 필요할 수 있는 것들

- 모델 이름/연락처 등 입력값 형식 검증 강화 (예: 전화번호 형식 체크)
- 제출 완료 후 카카오톡/이메일 알림 (Supabase Edge Function 또는 외부 알림 서비스 연동)
- 관리자 여러 명 지원 (지금은 로그인만 되면 모두 같은 데이터를 봄 — 세분화하려면 역할(role) 테이블 추가 필요)
- 이미지 압축 (현재는 원본 그대로 업로드 — 고화질 이미지가 많으면 업로드 시간이 길어질 수 있음)
