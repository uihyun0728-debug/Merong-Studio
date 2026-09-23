import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경변수가 비어있거나 잘못돼도 빌드가 죽지 않도록 안전한 더미 값으로 대체합니다.
// (실제 배포 환경에 올바른 값이 없으면 빌드는 통과하되, 실행 시 요청이 실패하며
//  브라우저 콘솔에 아래 경고가 표시됩니다.)
export const supabaseEnvOk = Boolean(rawUrl && rawKey && /^https?:\/\//.test(rawUrl.trim()));

if (!supabaseEnvOk) {
  console.warn(
    '[Supabase] 환경변수가 비어있거나 형식이 올바르지 않습니다. ' +
    'Vercel > Settings > Environment Variables 에서 ' +
    'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 값을 확인 후 재배포하세요.'
  );
}

const supabaseUrl = supabaseEnvOk ? rawUrl.trim() : 'https://placeholder.supabase.co';
const supabaseAnonKey = supabaseEnvOk ? rawKey.trim() : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
