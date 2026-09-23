-- ============================================================
-- 메롱스튜디오 촬영 기획서 - Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 전체 붙여넣고 실행하세요.
-- ============================================================

-- 1) 제출 데이터 테이블
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  model_name text,
  contact text,
  shoot_date text,
  shoot_time text,
  mood_line text,
  avoid_note text,
  mood_captions jsonb default '[]'::jsonb,
  hmua_note text,
  emphasize_note text,
  memo text,
  images jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table submissions enable row level security;

-- 아무나(비로그인 포함) 새 기획서를 "추가"만 할 수 있음
drop policy if exists "anyone can submit" on submissions;
create policy "anyone can submit"
  on submissions
  for insert
  to public
  with check (true);

-- 로그인한 관리자만 전체 목록을 "조회" 가능
drop policy if exists "only authenticated can read" on submissions;
create policy "only authenticated can read"
  on submissions
  for select
  to authenticated
  using (true);

-- 2) 이미지 저장용 스토리지 버킷 (비공개)
insert into storage.buckets (id, name, public)
values ('shoot-images', 'shoot-images', false)
on conflict (id) do nothing;

-- 아무나 이미지 업로드 가능 (모델이 직접 첨부)
drop policy if exists "anyone can upload shoot images" on storage.objects;
create policy "anyone can upload shoot images"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'shoot-images');

-- 로그인한 관리자만 이미지 열람 가능
drop policy if exists "only authenticated can view shoot images" on storage.objects;
create policy "only authenticated can view shoot images"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'shoot-images');

-- ============================================================
-- 관리자 계정은 Supabase 대시보드 > Authentication > Users 에서
-- 직접 이메일/비밀번호로 1명 생성해서 사용하세요. (별도 가입 절차 없음)
-- ============================================================
