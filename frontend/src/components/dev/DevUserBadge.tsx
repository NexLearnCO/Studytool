'use client';

import * as React from 'react';
import { getDevUser, setDevUser, devIdentityEnabled, DEV_PROFILES, type Role } from '@/src/lib/auth/devAuth';

export function DevUserBadge() {
  if (!devIdentityEnabled()) return null;
  
  const [open, setOpen] = React.useState(false);
  const [user, setUser] = React.useState(() => getDevUser());
  const [userId, setUserId] = React.useState(user.user_id);
  const [orgId, setOrgId] = React.useState(user.org_id ?? '');
  const [courses, setCourses] = React.useState((user.course_ids || []).join(','));
  const [role, setRole] = React.useState<Role>(user.role);

  // 重新同步當前用戶狀態
  React.useEffect(() => {
    const currentUser = getDevUser();
    setUser(currentUser);
    setUserId(currentUser.user_id);
    setOrgId(currentUser.org_id ?? '');
    setCourses((currentUser.course_ids || []).join(','));
    setRole(currentUser.role);
  }, [open]);

  const onSave = () => {
    const course_ids = courses.split(',').map(s => s.trim()).filter(Boolean);
    const newUser = { 
      user_id: userId.trim() || 'demo-user', 
      role, 
      org_id: orgId.trim() || null, 
      course_ids 
    };
    setDevUser(newUser);
    setUser(newUser);
    setOpen(false);
    // 重新整理讓新身分立即生效
    if (typeof window !== 'undefined') {
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const loadProfile = (profileKey: keyof typeof DEV_PROFILES) => {
    const profile = DEV_PROFILES[profileKey];
    setUserId(profile.user_id);
    setRole(profile.role);
    setOrgId(profile.org_id || '');
    setCourses((profile.course_ids || []).join(','));
  };

  const currentUser = getDevUser();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', 
          right: 12, 
          bottom: 12, 
          zIndex: 9999,
          padding: '6px 10px', 
          borderRadius: 8, 
          border: '1px solid #e5e7eb',
          background: '#fff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
          fontSize: 12,
          fontFamily: 'monospace',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        title="切換 Dev 身分（僅開發環境顯示）"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }}
      >
        <span style={{ color: '#059669', fontWeight: 'bold' }}>Dev:</span>{' '}
        <span style={{ color: '#dc2626' }}>{currentUser.role}</span>@
        <span style={{ color: '#2563eb' }}>{currentUser.user_id}</span>
        {currentUser.org_id && (
          <>
            {' '}· <span style={{ color: '#7c3aed' }}>org:{currentUser.org_id}</span>
          </>
        )}
        {currentUser.course_ids?.length ? (
          <>
            {' '}· <span style={{ color: '#ea580c' }}>course:{currentUser.course_ids[0]}</span>
            {currentUser.course_ids.length > 1 && <span style={{ color: '#6b7280' }}>+{currentUser.course_ids.length - 1}</span>}
          </>
        ) : null}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.35)', 
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 420,
              maxWidth: '90vw',
              background: '#fff',
              borderRadius: 12, 
              padding: 20, 
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 18, color: '#111827' }}>
              🔧 Dev 身分設定
            </h3>
            
            {/* 快速預設身分 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                快速預設身分
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(DEV_PROFILES).map(([key, profile]) => (
                  <button
                    key={key}
                    onClick={() => loadProfile(key as keyof typeof DEV_PROFILES)}
                    style={{
                      ...quickProfileBtnStyle,
                      background: profile.role === role && profile.user_id === userId ? '#dbeafe' : '#f9fafb',
                      borderColor: profile.role === role && profile.user_id === userId ? '#3b82f6' : '#e5e7eb'
                    }}
                  >
                    {profile.role} ({profile.user_id})
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={labelStyle}>User ID</label>
                <input 
                  value={userId} 
                  onChange={e => setUserId(e.target.value)} 
                  style={inputStyle}
                  placeholder="demo-user"
                />
              </div>
              
              <div>
                <label style={labelStyle}>Role</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value as Role)} 
                  style={inputStyle}
                >
                  <option value="student">Student 學生</option>
                  <option value="parent">Parent 家長</option>
                  <option value="tutor">Tutor 導師</option>
                  <option value="admin">Admin 管理員</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Org ID</label>
                <input 
                  value={orgId} 
                  onChange={e => setOrgId(e.target.value)} 
                  style={inputStyle}
                  placeholder="nexlearn-org"
                />
              </div>

              <div>
                <label style={labelStyle}>Course IDs（逗號分隔）</label>
                <input 
                  value={courses} 
                  onChange={e => setCourses(e.target.value)} 
                  style={inputStyle}
                  placeholder="math-101,physics-201"
                />
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 8, 
              marginTop: 20, 
              justifyContent: 'flex-end' 
            }}>
              <button 
                onClick={() => setOpen(false)} 
                style={btnStyle}
              >
                取消
              </button>
              <button 
                onClick={onSave} 
                style={{
                  ...btnStyle, 
                  background: '#111827', 
                  color: '#fff',
                  border: '1px solid #111827'
                }}
              >
                保存並重載
              </button>
            </div>

            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              background: '#f9fafb', 
              borderRadius: 8, 
              fontSize: 11, 
              color: '#6b7280' 
            }}>
              💡 這個身分設定只在開發環境顯示，用於測試不同用戶角色的資料隔離。
              正式環境將使用 WordPress/LearnDash JWT 認證。
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', 
  padding: '10px 12px', 
  border: '1px solid #e5e7eb', 
  borderRadius: 8, 
  fontSize: 14,
  transition: 'border-color 0.2s ease',
  outline: 'none'
};

const btnStyle: React.CSSProperties = {
  padding: '10px 16px', 
  border: '1px solid #e5e7eb', 
  borderRadius: 8, 
  background: '#fff',
  cursor: 'pointer',
  fontSize: 14,
  transition: 'all 0.2s ease'
};

const quickProfileBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  background: '#f9fafb',
  cursor: 'pointer',
  fontSize: 11,
  transition: 'all 0.2s ease'
};

const labelStyle: React.CSSProperties = {
  display: 'block', 
  fontSize: 12, 
  color: '#6b7280', 
  marginBottom: 4,
  fontWeight: 500
};
