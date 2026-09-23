'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function ImageSlot({ file, onPick, onClear }) {
  const previewUrl = file ? URL.createObjectURL(file) : null;
  return (
    <div className={'thumb-box' + (file ? ' has-img' : '')}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          if (f) onPick(f);
          e.target.value = '';
        }}
      />
      {previewUrl ? (
        <img src={previewUrl} alt="" />
      ) : (
        <span className="thumb-label">이미지 추가</span>
      )}
      {file && (
        <button
          type="button"
          className="thumb-x"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

function MultiImageRow({ files, onChange, max = 4 }) {
  const slots = Array.from({ length: max }, (_, i) => files[i] || null);
  return (
    <div className="thumb-row">
      {slots.map((f, i) => (
        <ImageSlot
          key={i}
          file={f}
          onPick={(picked) => {
            const next = [...files];
            next[i] = picked;
            onChange(next.filter(Boolean));
          }}
          onClear={() => {
            const next = files.filter((_, idx) => idx !== i);
            onChange(next);
          }}
        />
      ))}
    </div>
  );
}

const emptyForm = {
  name: '', contact: '', date: '', time: '',
  moodLine: '', avoid: '', hmua: '', emphasize: '', memo: ''
};

export default function ShootBriefPage() {
  const [form, setForm] = useState(emptyForm);
  const [moodImages, setMoodImages] = useState([]);
  const [moodCaptions, setMoodCaptions] = useState(['', '', '', '']);
  const [styleImages, setStyleImages] = useState({ outfit: [], hair: [], makeup: [], props: [] });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'error'|'success', text }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadImages(submissionId, files, category) {
    const paths = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${submissionId}/${category}-${i + 1}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('shoot-images')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw new Error(`${category} 이미지 업로드 실패: ${error.message}`);
      paths.push(path);
    }
    return paths;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (!form.name.trim() || !form.contact.trim()) {
      setStatus({ type: 'error', text: '이름과 연락처는 꼭 입력해주세요.' });
      return;
    }

    setSubmitting(true);
    try {
      const submissionId = crypto.randomUUID();

      const [moodPaths, outfitPaths, hairPaths, makeupPaths, propsPaths] = await Promise.all([
        uploadImages(submissionId, moodImages, 'mood'),
        uploadImages(submissionId, styleImages.outfit, 'outfit'),
        uploadImages(submissionId, styleImages.hair, 'hair'),
        uploadImages(submissionId, styleImages.makeup, 'makeup'),
        uploadImages(submissionId, styleImages.props, 'props'),
      ]);

      const { error: insertError } = await supabase.from('submissions').insert({
        id: submissionId,
        model_name: form.name,
        contact: form.contact,
        shoot_date: form.date,
        shoot_time: form.time,
        mood_line: form.moodLine,
        avoid_note: form.avoid,
        mood_captions: moodCaptions,
        hmua_note: form.hmua,
        emphasize_note: form.emphasize,
        memo: form.memo,
        images: {
          mood: moodPaths,
          outfit: outfitPaths,
          hair: hairPaths,
          makeup: makeupPaths,
          props: propsPaths,
        },
      });

      if (insertError) throw new Error(insertError.message);

      setStatus({ type: 'success', text: '기획서가 제출되었습니다. 감사합니다!' });
      setForm(emptyForm);
      setMoodImages([]);
      setMoodCaptions(['', '', '', '']);
      setStyleImages({ outfit: [], hair: [], makeup: [], props: [] });
    } catch (err) {
      setStatus({ type: 'error', text: err.message || '제출 중 오류가 발생했습니다.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wrap">
      <div className="masthead">
        <div className="kicker">MERONG STUDIO · SHOOT BRIEF</div>
        <h1>메롱스튜디오 촬영 기획서</h1>
        <div className="sub">메롱스튜디오 촬영 준비를 위한 기획서입니다. 아는 것부터 편하게 채워주세요.</div>
      </div>

      <form onSubmit={handleSubmit}>
        {status && <div className={'msg ' + status.type}>{status.text}</div>}

        {/* 01 기본 정보 */}
        <div className="section">
          <div className="section-head">
            <span className="section-num">01</span>
            <h2 className="section-title">기본 정보</h2>
          </div>
          <div className="section-body no-hint">
            <div className="field-row">
              <div className="field">
                <label>촬영 대상자 이름</label>
                <input type="text" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="예: 김민서" />
              </div>
              <div className="field">
                <label>연락처</label>
                <input type="text" value={form.contact} onChange={(e) => setField('contact', e.target.value)} placeholder="예: 010-1234-5678" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>촬영 가능일</label>
                <input type="text" value={form.date} onChange={(e) => setField('date', e.target.value)} placeholder="예: 2026.10.12" />
              </div>
              <div className="field">
                <label>촬영 가능 시간</label>
                <input type="text" value={form.time} onChange={(e) => setField('time', e.target.value)} placeholder="예: 오전 10시 ~ 오후 1시" />
              </div>
            </div>
          </div>
        </div>

        {/* 02 촬영 컨셉, 무드 */}
        <div className="section">
          <div className="section-head">
            <span className="section-num">02</span>
            <h2 className="section-title">촬영 컨셉, 무드</h2>
          </div>
          <div className="section-body no-hint">
            <div className="field">
              <label>원하는 이미지 및 분위기</label>
              <input type="text" value={form.moodLine} onChange={(e) => setField('moodLine', e.target.value)} placeholder="예: 신뢰감 있고 담백한 전문가 무드" />
            </div>
            <div className="field">
              <label>피하고 싶은 스타일이나 느낌</label>
              <textarea value={form.avoid} onChange={(e) => setField('avoid', e.target.value)} placeholder="예: 지나치게 화려한 보정, 차가운 색감" />
            </div>

            <div className="divider-label">원하는 이미지 · 추구미</div>
            <div className="divider-note">닮고 싶은 분위기의 사진을 올려주세요. 한 줄 설명을 더하면 더 정확히 전달됩니다.</div>
            <div className="mood-grid">
              {[0, 1, 2, 3].map((i) => (
                <div className="mood-slot" key={i}>
                  <ImageSlot
                    file={moodImages[i] || null}
                    onPick={(f) => {
                      const next = [...moodImages];
                      next[i] = f;
                      setMoodImages(next);
                    }}
                    onClear={() => {
                      const next = [...moodImages];
                      next[i] = null;
                      setMoodImages(next.filter(Boolean));
                    }}
                  />
                  <input
                    type="text"
                    className="mood-cap"
                    value={moodCaptions[i]}
                    onChange={(e) => {
                      const next = [...moodCaptions];
                      next[i] = e.target.value;
                      setMoodCaptions(next);
                    }}
                    placeholder="참고하고 싶은 이유"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 03 스타일링 */}
        <div className="section">
          <div className="section-head">
            <span className="section-num">03</span>
            <h2 className="section-title">스타일링</h2>
          </div>
          <div className="section-hint">촬영에 입고 올 의상 사진 또는 참고 이미지</div>
          <div className="section-body">
            <div className="style-block">
              <label>의상</label>
              <MultiImageRow files={styleImages.outfit} onChange={(v) => setStyleImages((s) => ({ ...s, outfit: v }))} />
            </div>
            <div className="style-block">
              <label>헤어스타일</label>
              <MultiImageRow files={styleImages.hair} onChange={(v) => setStyleImages((s) => ({ ...s, hair: v }))} />
            </div>
            <div className="style-block">
              <label>메이크업</label>
              <MultiImageRow files={styleImages.makeup} onChange={(v) => setStyleImages((s) => ({ ...s, makeup: v }))} />
            </div>
            <div className="style-block">
              <label>액세서리 / 소품</label>
              <MultiImageRow files={styleImages.props} onChange={(v) => setStyleImages((s) => ({ ...s, props: v }))} />
            </div>
            <div className="field">
              <label>헤어메이크업 아티스트 동반 여부</label>
              <input type="text" value={form.hmua} onChange={(e) => setField('hmua', e.target.value)} placeholder="예: 동반 예정 / 본인 준비" />
            </div>
          </div>
        </div>

        {/* 04 기타 요청사항 */}
        <div className="section">
          <div className="section-head">
            <span className="section-num">04</span>
            <h2 className="section-title">기타 요청사항</h2>
          </div>
          <div className="section-hint">강조하고 싶은 부분과 특이사항을 남겨주세요.</div>
          <div className="section-body">
            <div className="field">
              <label>강조하고 싶은 부분 / 각도</label>
              <input type="text" value={form.emphasize} onChange={(e) => setField('emphasize', e.target.value)} placeholder="예: 왼쪽 얼굴 각도 선호" />
            </div>
            <div className="field">
              <label>기타 메모</label>
              <textarea value={form.memo} onChange={(e) => setField('memo', e.target.value)} placeholder="자유롭게 적어주세요." />
            </div>
          </div>
        </div>

        <div className="notice-box">
          <strong>촬영본 사용 안내</strong>
          촬영본은 메롱스튜디오의 포트폴리오 및 SNS 홍보 자료로 사용될 수 있으며, 상업적 용도로 사용할 수 있습니다.
        </div>

        <div style={{ marginTop: 24 }}>
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? '제출 중...' : '기획서 제출하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
