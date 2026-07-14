// ══════════════════════════════════════════
//   BelajarBareng.id — Auth Nav (shared)
//   Kalau user sudah login: ganti SELURUH
//   nav-links jadi menu aplikasi yang konsisten
//   (Dashboard, Materi, AI Tutor, Leaderboard)
//   + chip nama pengguna & dropdown profil.
//   Kalau belum login: nav dibiarkan apa adanya
//   (nav marketing / "Masuk →").
//   Pasang di semua halaman sebelum </body>:
//   <script src="auth-nav.js"></script>
// ══════════════════════════════════════════

(function () {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const raw = localStorage.getItem('bb_current');
  if (!raw) return; // belum login, biarkan nav apa adanya

  let user;
  try { user = JSON.parse(raw); } catch (e) { return; }

  const firstName = (user.nama || 'Pelajar').split(' ')[0];
  const initial = (firstName[0] || 'P').toUpperCase();

  // Halaman aktif saat ini, buat nandain menu yang lagi dibuka
  const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // ── Menu aplikasi, beda untuk siswa vs guru/ortu ──
  const appMenu = (user.role === 'guru_ortu')
    ? [
        { href: 'dashboard-guru.html', label: 'Dashboard Guru/Ortu' },
        { href: 'leaderboard.html',    label: 'Leaderboard' },
      ]
    : [
        { href: 'dashboard.html',   label: 'Dashboard' },
        { href: 'materi.html',      label: 'Materi' },
        { href: 'tutor.html',       label: 'AI Tutor' },
        { href: 'leaderboard.html', label: 'Leaderboard' },
      ];

  navLinks.innerHTML = appMenu.map(item => {
    const active = path === item.href;
    return `<a href="${item.href}"${active ? ' class="btn-nav"' : ''}>${item.label}</a>`;
  }).join('');

  // ── Profile chip + dropdown ──
  const wrap = document.createElement('div');
  wrap.style.position = 'relative';
  wrap.innerHTML = `
    <button id="navProfileBtn" style="
      display:flex; align-items:center; gap:.5rem;
      background:var(--card); border:1px solid var(--border);
      border-radius:999px; padding:.35rem .9rem .35rem .35rem;
      cursor:pointer; color:var(--text); font-family:inherit;
      font-size:.85rem; font-weight:600;">
      <span style="
        width:26px; height:26px; border-radius:50%;
        background:linear-gradient(135deg, var(--purple), var(--blue));
        display:flex; align-items:center; justify-content:center;
        font-size:.75rem; font-weight:700; color:#fff; flex-shrink:0;">${initial}</span>
      ${firstName}
      <span style="font-size:.7rem; color:var(--muted);">▾</span>
    </button>
    <div id="navProfileMenu" style="
      display:none; position:absolute; right:0; top:calc(100% + .6rem);
      background:var(--card); border:1px solid var(--border);
      border-radius:14px; padding:.4rem; min-width:190px;
      box-shadow:0 16px 40px rgba(0,0,0,.45); z-index:300;">
      <a href="${user.role === 'guru_ortu' ? 'dashboard-guru.html' : 'dashboard.html'}" style="display:block; padding:.6rem .75rem; border-radius:9px; color:var(--text); text-decoration:none; font-size:.85rem;">📊 Dashboard</a>
      <a href="profile.html" style="display:block; padding:.6rem .75rem; border-radius:9px; color:var(--text); text-decoration:none; font-size:.85rem;">⚙️ Pengaturan Profil</a>
      <div style="height:1px; background:var(--border); margin:.35rem 0;"></div>
      <button id="navLogoutBtn" style="display:block; width:100%; text-align:left; padding:.6rem .75rem; border-radius:9px; background:transparent; border:none; color:#FCA5A5; cursor:pointer; font-size:.85rem; font-family:inherit;">🚪 Keluar</button>
    </div>
  `;
  navLinks.appendChild(wrap);

  wrap.querySelectorAll('#navProfileMenu a, #navLogoutBtn').forEach(el => {
    el.addEventListener('mouseenter', () => el.style.background = 'rgba(124,58,237,.15)');
    el.addEventListener('mouseleave', () => el.style.background = 'transparent');
  });

  const btn  = wrap.querySelector('#navProfileBtn');
  const menu = wrap.querySelector('#navProfileMenu');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', () => { menu.style.display = 'none'; });

  wrap.querySelector('#navLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('bb_current');
    window.location.href = 'index.html';
  });
})();
