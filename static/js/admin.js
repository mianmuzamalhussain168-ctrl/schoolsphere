  /* ─── Data (DB se load hoga) ─── */
  let schools = [];
  let accounts = [
    { school:"City School",   city:"Lahore",    email:"admin@cityschool.edu.pk",  role:"School Admin", last:"Today",      status:"active"    },
    { school:"Beacon House",  city:"Karachi",   email:"info@beaconhouse.net",     role:"School Admin", last:"2 days ago", status:"active"    },
    { school:"Roots IVY",     city:"Islamabad", email:"contact@rootsivy.edu.pk", role:"School Admin", last:"1 week ago", status:"suspended" },
    { school:"LGS Phase 5",   city:"Lahore",    email:"lgs.p5@lgs.edu.pk",       role:"School Admin", last:"Yesterday",  status:"active"    },
  ];

  let pendingDeleteIndex = -1;

  /* ─── Load schools from database ─── */
  async function loadSchools() {
    try {
      const res = await fetch('/api/admin/schools');
      schools = await res.json();
      updateStats();
    } catch(e) {
      console.error('Failed to load schools:', e);
      schools = [];
    }
  }

  /* ─── Helpers ─── */
  function stars(n) { return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)); }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  function getFiltered() {
    const q = (document.getElementById('search-input')?.value || '').toLowerCase();
    return schools.filter(s =>
      s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
    );
  }

  /* ─── Navigation ─── */
  const titles = {
    overview: 'Dashboard Overview', add: 'Add New School',
    manage: 'Manage Schools', ratings: 'Manage Ratings', accounts: 'School Accounts',
  };

  function showView(id, el) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + id).classList.add('active');
    document.getElementById('page-title').textContent = titles[id] || '';
    document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    if (id === 'overview') updateStats();
    if (id === 'manage')   renderSchoolTable();
    if (id === 'ratings')  renderRatings();
    if (id === 'accounts') renderAccounts();
  }

  /* ─── Stats ─── */
  function updateStats() {
    const total   = schools.length;
    const active  = schools.filter(s => s.status === 'active').length;
    const pending = schools.filter(s => s.status === 'pending').length;
    const avgRating = total ? (schools.reduce((a,s) => a + s.rating, 0) / total).toFixed(1) : '0';
    document.getElementById('stat-total').textContent   = total;
    document.getElementById('stat-active').textContent  = active;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-rating').textContent  = avgRating;

    const recent = document.getElementById('recent-tbody');
    recent.innerHTML = schools.slice(0, 5).map(s => `
      <tr>
        <td><div class="school-name">${s.name}</div><div class="school-city">${s.city}</div></td>
        <td style="color:var(--ss-muted)">${s.type}</td>
        <td><span class="status-badge badge-${s.status}">${s.status.charAt(0).toUpperCase()+s.status.slice(1)}</span></td>
      </tr>`).join('');
  }

  /* ─── Add School → DATABASE ─── */
  async function saveSchool() {
    const name  = document.getElementById('f-name').value.trim();
    const city  = document.getElementById('f-city').value;
    const type  = document.getElementById('f-type').value;
    if (!name || !city || !type) { toast('⚠ Please fill required fields (*)'); return; }

    const payload = {
      name,
      city,
      type,
      area:          document.getElementById('f-area')?.value || city,
      address:       document.getElementById('f-address').value || city,
      description:   document.getElementById('f-desc').value || '',
      medium:        document.getElementById('f-medium')?.value || 'English',
      established:   parseInt(document.getElementById('f-established')?.value) || 2000,
      total_students:parseInt(document.getElementById('f-students').value) || 0,
      status:        document.getElementById('f-status').value,
      rating:        parseFloat(document.getElementById('f-rating').value),
      emoji:         document.getElementById('f-emoji')?.value || '🏫',
      color:         document.getElementById('f-color')?.value || '#1A2E42',
      fee_monthly:   parseInt(document.getElementById('f-fee').value) || 0,
      fee_admission: parseInt(document.getElementById('f-fee-admission')?.value) || 0,
      fee_annual:    parseInt(document.getElementById('f-fee-annual')?.value) || 0,
      fee_transport: parseInt(document.getElementById('f-fee-transport')?.value) || 0,
    };

    const editIdx = document.getElementById('f-edit-index').value;

    try {
      let res, data;
      if (editIdx && editIdx !== '-1') {
        res  = await fetch(`/api/admin/schools/${editIdx}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
        data = await res.json();
        toast('✓ School updated!');
      } else {
        res  = await fetch('/api/admin/schools', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
        data = await res.json();
        if (data.success) toast('✓ School added to database & website!');
        else { toast('Error: ' + data.error); return; }
      }
      await loadSchools();
      clearForm();
      showView('manage', null);
    } catch(e) {
      toast('Network error: ' + e.message);
    }
  }

  function clearForm() {
    ['f-name','f-fee','f-fee-admission','f-fee-annual','f-fee-transport',
     'f-students','f-address','f-desc','f-established','f-area', 'f-phone', 'f-email', 'f-web'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('f-city').value   = '';
    document.getElementById('f-type').value   = '';
    document.getElementById('f-status').value = 'active';
    document.getElementById('f-rating').value = '3';
    document.getElementById('f-edit-index').value = '-1';
    document.getElementById('add-panel-title').textContent  = 'Add New School';
    document.getElementById('submit-btn-text').textContent  = 'Add School';
    document.getElementById('cancel-edit-btn').style.display = 'none';
  }

  function cancelEdit() { clearForm(); toast('Edit cancelled.'); }

  /* ─── Logout ─── */
  function logout() {
    if (confirm('Are you sure you want to log out?')) {
      window.location.href = '/admin/logout';
    }
  }

  /* ─── School Table ─── */
  function renderSchoolTable() {
    const filtered = getFiltered();
    const tbody = document.getElementById('school-tbody');
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--ss-muted);padding:20px;font-family:sans-serif;">No schools found</td></tr>`;
      return;
    }
    tbody.innerHTML = filtered.map((s, i) => {
      const schoolIdx = schools.findIndex(sch => sch.id === s.id);
      return `
      <tr>
        <td><div class="school-name">${s.name}</div><div class="school-city">${s.city}</div></td>
        <td style="color:var(--ss-muted)">${s.type}</td>
        <td style="color:var(--ss-muted)">PKR ${s.fee && s.fee.monthly ? s.fee.monthly.toLocaleString() : '—'}</td>
        <td><span class="stars">${stars(s.rating)}</span></td>
        <td><span class="status-badge badge-${s.status}">${s.status.charAt(0).toUpperCase()+s.status.slice(1)}</span></td>
        <td>
          <div class="row-actions">
            <div class="icon-btn" title="Edit" onclick="editSchool(${schoolIdx})"><i class="ti ti-edit"></i></div>
            <div class="icon-btn" title="Toggle Status" onclick="toggleStatus(${schoolIdx})"><i class="ti ti-refresh"></i></div>
            <div class="icon-btn" title="Delete" style="color:var(--ss-red)" onclick="openDeleteModal(${schoolIdx})"><i class="ti ti-trash"></i></div>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  /* ─── Toggle Status → DATABASE ─── */
  async function toggleStatus(schoolIdx) {
    const s = schools[schoolIdx];
    if (!s) return;
    const map = { active:'suspended', pending:'active', suspended:'active' };
    const newStatus = map[s.status];
    try {
      await fetch(`/api/admin/schools/${s.id}`, {
        method: 'PATCH',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ status: newStatus })
      });
      await loadSchools();
      renderSchoolTable();
      toast('✓ Status updated to: ' + newStatus);
    } catch(e) { toast('Error: ' + e.message); }
  }

  /* ─── Edit School ─── */
  function editSchool(schoolIdx) {
    const s = schools[schoolIdx];
    if (!s) return;
    document.getElementById('f-name').value   = s.name;
    document.getElementById('f-city').value   = s.city;
    document.getElementById('f-type').value   = s.type;
    document.getElementById('f-fee').value    = s.fee && s.fee.monthly ? s.fee.monthly : 0;
    document.getElementById('f-fee-admission').value = s.fee && s.fee.admission ? s.fee.admission : 0;
    document.getElementById('f-fee-annual').value = s.fee && s.fee.annual ? s.fee.annual : 0;
    document.getElementById('f-fee-transport').value = s.fee && s.fee.transport ? s.fee.transport : 0;
    document.getElementById('f-status').value = s.status;
    document.getElementById('f-rating').value = s.rating;
    document.getElementById('f-students').value = s.totalStudents || 0;
    document.getElementById('f-address').value  = s.address || '';
    document.getElementById('f-desc').value     = s.description || '';
    document.getElementById('f-phone').value    = s.phone || '';
    document.getElementById('f-email').value    = s.email || '';
    document.getElementById('f-web').value      = s.website || '';
    document.getElementById('f-edit-index').value = schoolIdx;
    document.getElementById('add-panel-title').textContent = 'Edit School — ' + s.name;
    document.getElementById('submit-btn-text').textContent = 'Save Changes';
    document.getElementById('cancel-edit-btn').style.display = 'inline-flex';
    showView('add', null);
    toast('Editing: ' + s.name);
  }

  /* ─── Delete Modal ─── */
  function openDeleteModal(schoolIdx) {
    const s = schools[schoolIdx];
    if (!s) return;
    pendingDeleteIndex = schoolIdx;
    document.getElementById('delete-school-name').textContent = s.name;
    document.getElementById('delete-modal').classList.add('show');
  }

  function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('show');
    pendingDeleteIndex = -1;
  }

  async function confirmDelete() {
    if (pendingDeleteIndex === -1) return;
    const s = schools[pendingDeleteIndex];
    if (!s) return;
    try {
      await fetch(`/api/admin/schools/${s.id}`, { method: 'DELETE' });
      closeDeleteModal();
      await loadSchools();
      renderSchoolTable();
      toast('🗑 School deleted from database.');
    } catch(e) { toast('Error: ' + e.message); }
  }

  /* ─── Ratings → DATABASE ─── */
  function renderRatings() {
    const el = document.getElementById('rating-list');
    el.innerHTML = schools.map((s, si) => `
      <div class="rating-row">
        <div>
          <div class="r-name">${s.name}</div>
          <div class="r-city">${s.city}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="star-select">
            ${[1,2,3,4,5].map(n => `
              <button class="star-btn ${n <= s.rating ? 'on' : ''}"
                onclick="setRating(${s.id},${n},${si})">★</button>`).join('')}
          </div>
          <span style="font-family:sans-serif;font-size:12px;color:var(--ss-muted);min-width:16px;">${s.rating}/5</span>
        </div>
      </div>`).join('');
  }

  async function setRating(schoolId, val, si) {
    try {
      await fetch(`/api/admin/schools/${schoolId}`, {
        method: 'PATCH',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ rating: val })
      });
      schools[si].rating = val;
      renderRatings();
      toast('✓ Rating updated to ' + val + ' ★');
    } catch(e) { toast('Error: ' + e.message); }
  }

  /* ─── Accounts ─── */
  function renderAccounts() {
    const tbody = document.getElementById('accounts-tbody');
    tbody.innerHTML = accounts.map((a, i) => `
      <tr>
        <td><div class="school-name">${a.school}</div><div class="school-city">${a.city}</div></td>
        <td style="color:var(--ss-muted);font-size:11px;">${a.email}</td>
        <td style="color:var(--ss-muted);font-size:11px;">${a.role}</td>
        <td style="color:var(--ss-muted);font-size:11px;">${a.last}</td>
        <td><span class="status-badge badge-${a.status}">${a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span></td>
        <td>
          <div class="row-actions">
            <div class="icon-btn" title="Edit"><i class="ti ti-edit"></i></div>
            <div class="icon-btn" title="${a.status==='active'?'Suspend':'Activate'}"
              style="color:${a.status==='active'?'var(--ss-red)':'var(--ss-green)'}"
              onclick="toggleAccount(${i})">
              <i class="ti ti-${a.status==='active'?'ban':'circle-check'}"></i>
            </div>
          </div>
        </td>
      </tr>`).join('');
  }

  function toggleAccount(i) {
    accounts[i].status = accounts[i].status === 'active' ? 'suspended' : 'active';
    renderAccounts();
    toast('✓ Account status updated.');
  }

  document.getElementById('delete-modal').addEventListener('click', function(e) {
    if (e.target === this) closeDeleteModal();
  });

  /* ─── Init ─── */
  loadSchools();
