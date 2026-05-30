let schools = []; // Global variable to hold data from API

// Fetch schools from Flask Backend
async function fetchSchools() {
  try {
    const response = await fetch('/api/schools');
    schools = await response.json();
    renderSchools(schools);
    populateCompare();
  } catch (error) {
    console.error("Error fetching schools:", error);
    document.getElementById('schoolsGrid').innerHTML = '<p style="text-align:center; grid-column:1/-1; color:red;">Failed to load schools. Is the backend running?</p>';
  }
}

function renderSchools(list) {
  const grid = document.getElementById('schoolsGrid');
  if(list.length === 0) {
    grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:#7A8A9A;">No schools found matching your criteria.</p>';
    return;
  }
  
  grid.innerHTML = list.map(s => `
    <div class="school-card" onclick="openModal(${s.id})">
      <div style="position:relative">
        <div class="school-img-bg" style="background:${s.color}20; font-size:72px">
          <div style="position:absolute;inset:0;background:linear-gradient(135deg,${s.color}88,${s.color}22);display:flex;align-items:center;justify-content:center;font-size:72px">${s.emoji}</div>
          <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,${s.color}CC)"></div>
        </div>
        <div class="school-badge">${s.type}</div>
        <div class="school-rating">★ ${s.rating}</div>
      </div>
      <div class="school-body">
        <div class="school-name">${s.name}</div>
        <div class="school-location">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${s.area}, ${s.city}
        </div>
        <div class="school-tags">
          <span class="tag">${s.medium}</span>
          <span class="tag">Est. ${s.established}</span>
          <span class="tag">${s.totalStudents.toLocaleString()} Students</span>
        </div>
        <div class="school-footer">
          <div class="school-fee">
            Monthly Fee<br>
            <strong>PKR ${s.fee.monthly.toLocaleString()}</strong>
          </div>
          <button class="view-btn">View Profile →</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterSchools(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const list = filter === 'all' ? schools : schools.filter(s => s.type === filter || s.city === filter);
  renderSchools(list);
}

function doSearch() {
  const q = document.getElementById('heroSearch').value.toLowerCase();
  const city = document.getElementById('heroCity').value;
  const type = document.getElementById('heroType').value;
  let list = schools;
  if (q) list = list.filter(s => s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q));
  if (city) list = list.filter(s => s.city === city);
  if (type) list = list.filter(s => s.type === type);
  renderSchools(list);
  document.getElementById('schools').scrollIntoView({ behavior:'smooth' });
}

function openModal(id) {
  const s = schools.find(x => x.id === id);
  if(!s) return;
  
  document.getElementById('modalName').textContent = s.name;
  document.getElementById('modalLocation').textContent = `📍 ${s.address}`;
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-section">
      <h4>School Overview</h4>
      <p style="font-size:15px;color:var(--text-mid);line-height:1.7;margin-bottom:20px">${s.description}</p>
      <div class="info-grid">
        <div class="info-item"><span class="info-label">Type</span><span class="info-value">${s.type}</span></div>
        <div class="info-item"><span class="info-label">City</span><span class="info-value">${s.city}</span></div>
        <div class="info-item"><span class="info-label">Medium</span><span class="info-value">${s.medium}</span></div>
        <div class="info-item"><span class="info-label">Established</span><span class="info-value">${s.established}</span></div>
        <div class="info-item"><span class="info-label">Total Students</span><span class="info-value">${s.totalStudents.toLocaleString()}</span></div>
        <div class="info-item"><span class="info-label">Rating</span><span class="info-value">⭐ ${s.rating} / 5.0</span></div>
      </div>
    </div>
    <div class="modal-section">
      <h4>Fee Structure</h4>
      <table class="fee-table">
        <tr><th>Fee Type</th><th>Amount (PKR)</th></tr>
        <tr><td>Admission Fee (One-time)</td><td>${s.fee.admission.toLocaleString()}</td></tr>
        <tr><td>Monthly Tuition</td><td>${s.fee.monthly.toLocaleString()}</td></tr>
        <tr><td>Annual Charges</td><td>${s.fee.annual.toLocaleString()}</td></tr>
        <tr><td>Transport (Monthly)</td><td>${s.fee.transport.toLocaleString()}</td></tr>
        <tr style="background:var(--cream)"><td><strong>Approx. Annual Total</strong></td><td><strong>${((s.fee.monthly * 12) + s.fee.annual + s.fee.admission).toLocaleString()}</strong></td></tr>
      </table>
    </div>
    <div class="modal-section">
      <h4>Teacher Portfolio</h4>
      <div class="teacher-grid">
        ${s.teachers.map(t => `
          <div class="teacher-card">
            <div class="teacher-avatar">${t.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
            <div class="teacher-name">${t.name}</div>
            <div class="teacher-subject">${t.subject}</div>
            <div class="teacher-exp">${t.exp} • ${t.qual}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="modal-section">
      <h4>Facilities & Amenities</h4>
      <div class="facilities-list">
        ${s.facilities.map(f => `<div class="facility-chip">✓ ${f}</div>`).join('')}
      </div>
    </div>
    <div class="modal-section">
      <h4>Location Map</h4>
      <iframe class="map-embed"
        src="https://maps.google.com/maps?q=${s.mapQuery}&output=embed"
        allowfullscreen loading="lazy">
      </iframe>
      <p style="font-size:13px;color:var(--text-light);margin-top:8px">📍 ${s.address}</p>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function populateCompare() {
  ['compareA','compareB'].forEach(id => {
    const sel = document.getElementById(id);
    // Clear existing options except the first one
    while (sel.options.length > 1) sel.remove(1);
    
    schools.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id; opt.textContent = s.name;
      sel.appendChild(opt);
    });
  });
}

function updateCompare() {
  const aId = parseInt(document.getElementById('compareA').value);
  const bId = parseInt(document.getElementById('compareB').value);
  const res = document.getElementById('compareResult');
  
  if (!aId || !bId) { 
    res.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:20px">Please select two schools to compare.</p>'; 
    return; 
  }
  
  const a = schools.find(s => s.id === aId);
  const b = schools.find(s => s.id === bId);
  
  const rows = [
    ['City', a.city, b.city, null],
    ['Type', a.type, b.type, null],
    ['Medium', a.medium, b.medium, null],
    ['Rating', a.rating + ' / 5', b.rating + ' / 5', a.rating > b.rating ? 'a' : b.rating > a.rating ? 'b' : null],
    ['Established', a.established, b.established, null],
    ['Total Students', a.totalStudents.toLocaleString(), b.totalStudents.toLocaleString(), null],
    ['Monthly Fee', 'PKR ' + a.fee.monthly.toLocaleString(), 'PKR ' + b.fee.monthly.toLocaleString(), a.fee.monthly < b.fee.monthly ? 'a' : b.fee.monthly < a.fee.monthly ? 'b' : null],
    ['Admission Fee', 'PKR ' + a.fee.admission.toLocaleString(), 'PKR ' + b.fee.admission.toLocaleString(), a.fee.admission < b.fee.admission ? 'a' : b.fee.admission < a.fee.admission ? 'b' : null],
    ['No. of Teachers', a.teachers.length + ' on profile', b.teachers.length + ' on profile', null],
    ['Facilities', a.facilities.length + ' listed', b.facilities.length + ' listed', a.facilities.length > b.facilities.length ? 'a' : b.facilities.length > a.facilities.length ? 'b' : null],
  ];
  
  res.innerHTML = `
    <table class="compare-table">
      <tr>
        <th>Criteria</th>
        <th>${a.name.split(' ').slice(0,2).join(' ')}</th>
        <th>${b.name.split(' ').slice(0,2).join(' ')}</th>
      </tr>
      ${rows.map(([label, av, bv, better]) => `
        <tr>
          <td>${label}</td>
          <td class="${better === 'a' ? 'better' : ''}">${av} ${better === 'a' ? '✓' : ''}</td>
          <td class="${better === 'b' ? 'better' : ''}">${bv} ${better === 'b' ? '✓' : ''}</td>
        </tr>
      `).join('')}
    </table>
    <p style="font-size:12px;color:var(--text-light);margin-top:14px;text-align:center">✓ indicates the better value for that metric</p>
  `;
}

// Initialize on page load
window.onload = fetchSchools;
document.getElementById('compareResult').innerHTML = '<p style="text-align:center;color:var(--text-light);padding:20px">Please select two schools to compare.</p>';