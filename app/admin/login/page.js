'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError('로그인에 실패했습니다. 이메일/비밀번호를 확인해주세요.');
      return;
    }
    router.push('/admin/dashboard');
  }

  return (
    <div className="wrap" style={{ maxWidth: 400 }}>
      <div className="masthead">
        <div className="kicker">MERONG STUDIO · ADMIN</div>
        <h1 style={{ fontSize: 28 }}>관리자 로그인</h1>
      </div>
      <form onSubmit={handleLogin}>
        {error && <div className="msg error">{error}</div>}
        <div className="field">
          <label>이메일</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
