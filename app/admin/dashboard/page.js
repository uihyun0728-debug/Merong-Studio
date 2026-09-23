'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

const CATEGORY_LABELS = {
  mood: '추구미 참고',
  outfit: '의상',
  hair: '헤어스타일',
  makeup: '메이크업',
  props: '액세서리/소품',
};

async function resolveImageUrls(images) {
  const allPaths = [];
  Object.values(images || {}).forEach((arr) => {
    (arr || []).forEach((p) => allPaths.push(p));
  });
  if (allPaths.length === 0) return {};

  const { data, error } = await supabase.storage
    .from('shoot-images')
    .createSignedUrls(allPaths, 3600);

  const urlMap = {};
  if (!error && data) {
    data.forEach((d) => {
      if (d.path && d.signedUrl) urlMap[d.path] = d.signedUrl;
    });
  }

  const result = {};
  Object.entries(images || {}).forEach(([category, paths]) => {
    result[category] = (paths || []).map((p) => urlMap[p]).filter(Boolean);
  });
  return result;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('데이터를 불러오지 못했습니다: ' + error.message);
      setLoading(false);
      return;
    }

    setSubmissions(data || []);

    const urls = {};
    for (const row of data || []) {
      urls[row.id] = await resolveImageUrls(row.images);
    }
    setImageUrls(urls);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.replace('/admin/login');
        return;
      }
      setChecking(false);
      loadSubmissions();
    });
    return () => {
      active = false;
    };
  }, [router, loadSubmissions]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }

  if (checking) return null;

  return (
    <div className="wrap">
      <div className="masthead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="kicker">MERONG STUDIO · ADMIN</div>
          <h1 style={{ fontSize: 28 }}>제출된 기획서</h1>
        </div>
        <button className="btn ghost" onClick={handleLogout}>로그아웃</button>
      </div>

      {error && <div className="msg error">{error}</div>}
      {loading && <p>불러오는 중...</p>}
      {!loading && submissions.length === 0 && <p>아직 제출된 기획서가 없습니다.</p>}

      {submissions.map((row) => (
        <div className="admin-row" key={row.id}>
          <h3>{row.model_name || '(이름 없음)'}</h3>
          <div className="meta">
            연락처: {row.contact || '-'} · 촬영 가능일: {row.shoot_date || '-'} · 시간: {row.shoot_time || '-'} · 제출일시: {new Date(row.created_at).toLocaleString('ko-KR')}
          </div>

          <p><strong>원하는 이미지 및 분위기:</strong> {row.mood_line || '-'}</p>
          <p><strong>피하고 싶은 느낌:</strong> {row.avoid_note || '-'}</p>
          <p><strong>헤어메이크업 아티스트 동반:</strong> {row.hmua_note || '-'}</p>
          <p><strong>강조하고 싶은 부분:</strong> {row.emphasize_note || '-'}</p>
          <p><strong>메모:</strong> {row.memo || '-'}</p>

          {Object.entries(imageUrls[row.id] || {}).map(([cat, urls]) =>
            urls.length > 0 ? (
              <div key={cat} style={{ marginTop: 10 }}>
                <label>{CATEGORY_LABELS[cat] || cat}</label>
                <div className="admin-grid">
                  {urls.map((u, i) => (
                    <img key={i} src={u} alt={cat} />
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      ))}
    </div>
  );
}
