/* ─── HOME PAGE SCHOOL FUNCTIONALITY ─── */

let allSchools = [];
let comparisonSchools = [];

/* Load schools from database on page load */
async function loadSchoolsGrid() {
  try {
    const response = await fetch('/api/schools');
    const data = await response.json();
    
    if (data.success) {
      allSchools = data.schools || [];
      renderSchools(allSchools);
      populateCompareSelects();
    } else {
      console.error('Failed to load schools:', data.error);
    }
  } catch (error) {
    console.error('Error loading schools:', error);
    document.getElementById('schoolsGrid').innerHTML = 
      '<p style="text-align:center; grid-column:1/-1; color:#e05c5c;">Failed to load schools. Please try again.</p>';
  }
}

/* Render schools in grid */
function renderSchools(schoolsToRender) {
  const grid = document.getElementById('schoolsGrid');
  
  if (!schoolsToRender || schoolsToRender.length === 0) {
    grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:#7A8A9A;">No schools found matching your criteria.</p>';
    return;
  }

  grid.innerHTML = schoolsToRender.map(school => `
    <div class="school-card" onclick="openSchoolModal(${JSON.stringify(school).replace(/"/g, '&quot;')})">
      <div class="school-card-header">
        <div class="school-emoji">${school.emoji || '🏫'}</div>
        <div class="school-info-top">
          <h3>${school.name}</h3>
          <div class="school-location">📍 ${school.city}</div>
        </div>
      </div>
      <div class="school-card-body">
        <div class="card-stat">
          <span class="label">Type</span>
          <span class="value">${school.type}</span>
        </div>
        <div class="card-stat">
          <span class="label">Fee/Month</span>
          <span class="value">PKR ${school.fee?.monthly ? school.fee.monthly.toLocaleString() : 'Contact'}</span>
        </div>
        <div class="card-stat">
          <span class="label">Students</span>
          <span class="value">${school.totalStudents || '—'}</span>
        </div>
        <div class="card-stat">
          <span class="label">Rating</span>
          <span class="value stars">${'★'.repeat(Math.round(school.rating))}${'☆'.repeat(5 - Math.round(school.rating))}</span>
        </div>
      </div>
      <div class="school-card-footer">
        <button class="view-btn" onclick="event.stopPropagation(); openSchoolModal(${JSON.stringify(school).replace(/"/g, '&quot;')})">View Details</button>
      </div>
    </div>
  `).join('');
}

/* Filter schools by type or city */
function filterSchools(filter, buttonElement) {
  let filtered = allSchools;
  
  if (filter !== 'all') {
    filtered = allSchools.filter(s => 
      s.type === filter || s.city === filter
    );
  }
  
  renderSchools(filtered);
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  buttonElement.classList.add('active');
}

/* Hero search functionality */
function doSearch() {
  const name = document.getElementById('heroSearch').value.toLowerCase();
  const city = document.getElementById('heroCity').value;
  const type = document.getElementById('heroType').value;

  let filtered = allSchools.filter(s => {
    const matchName = !name || s.name.toLowerCase().includes(name);
    const matchCity = !city || s.city === city;
    const matchType = !type || s.type === type;
    return matchName && matchCity && matchType;
  });

  renderSchools(filtered);
  
  // Scroll to results
  document.getElementById('schools').scrollIntoView({ behavior: 'smooth' });
}

/* Populate comparison selects */
function populateCompareSelects() {
  const selectA = document.getElementById('compareA');
  const selectB = document.getElementById('compareB');

  const options = allSchools.map(s => 
    `<option value="${s.id}">${s.name} (${s.city})</option>`
  ).join('');

  selectA.innerHTML = '<option value="">Select first school...</option>' + options;
  selectB.innerHTML = '<option value="">Select second school...</option>' + options;
}

/* Update comparison view */
function updateCompare() {
  const idA = document.getElementById('compareA').value;
  const idB = document.getElementById('compareB').value;
  const result = document.getElementById('compareResult');

  if (!idA || !idB) {
    result.innerHTML = '';
    return;
  }

  const schoolA = allSchools.find(s => s.id == idA);
  const schoolB = allSchools.find(s => s.id == idB);

  if (!schoolA || !schoolB) return;

  result.innerHTML = `
    <table class="compare-table">
      <tr>
        <th>Criteria</th>
        <th>${schoolA.name}</th>
        <th>${schoolB.name}</th>
      </tr>
      <tr>
        <td>City</td>
        <td>${schoolA.city}</td>
        <td>${schoolB.city}</td>
      </tr>
      <tr>
        <td>Type</td>
        <td>${schoolA.type}</td>
        <td>${schoolB.type}</td>
      </tr>
      <tr>
        <td>Monthly Fee</td>
        <td>PKR ${schoolA.fee?.monthly?.toLocaleString() || 'N/A'}</td>
        <td>PKR ${schoolB.fee?.monthly?.toLocaleString() || 'N/A'}</td>
      </tr>
      <tr>
        <td>Admission Fee</td>
        <td>PKR ${schoolA.fee?.admission?.toLocaleString() || 'N/A'}</td>
        <td>PKR ${schoolB.fee?.admission?.toLocaleString() || 'N/A'}</td>
      </tr>
      <tr>
        <td>Total Students</td>
        <td>${schoolA.totalStudents || 'N/A'}</td>
        <td>${schoolB.totalStudents || 'N/A'}</td>
      </tr>
      <tr>
        <td>Rating</td>
        <td><span class="stars">${'★'.repeat(Math.round(schoolA.rating))}${'☆'.repeat(5 - Math.round(schoolA.rating))}</span></td>
        <td><span class="stars">${'★'.repeat(Math.round(schoolB.rating))}${'☆'.repeat(5 - Math.round(schoolB.rating))}</span></td>
      </tr>
      <tr>
        <td>Address</td>
        <td>${schoolA.address || 'N/A'}</td>
        <td>${schoolB.address || 'N/A'}</td>
      </tr>
      <tr>
        <td>Contact</td>
        <td><a href="tel:${schoolA.phone || '#'}" style="color:#c9a84c;">${schoolA.phone || 'N/A'}</a></td>
        <td><a href="tel:${schoolB.phone || '#'}" style="color:#c9a84c;">${schoolB.phone || 'N/A'}</a></td>
      </tr>
    </table>
  `;
}

/* School detail modal */
function openSchoolModal(school) {
  if (typeof school === 'string') {
    school = JSON.parse(school);
  }

  const modal = document.getElementById('modal');
  const overlay = document.getElementById('modalOverlay');
  
  document.getElementById('modalName').textContent = school.name;
  document.getElementById('modalLocation').textContent = `📍 ${school.address || school.city}`;
  
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <div class="modal-section">
      <h4>Overview</h4>
      <p>${school.description || 'No description available.'}</p>
    </div>

    <div class="modal-section">
      <h4>Key Information</h4>
      <div class="modal-grid">
        <div class="modal-item">
          <span class="modal-label">School Type</span>
          <span class="modal-value">${school.type}</span>
        </div>
        <div class="modal-item">
          <span class="modal-label">City</span>
          <span class="modal-value">${school.city}</span>
        </div>
        <div class="modal-item">
          <span class="modal-label">Medium</span>
          <span class="modal-value">${school.medium || 'English'}</span>
        </div>
        <div class="modal-item">
          <span class="modal-label">Established</span>
          <span class="modal-value">${school.established || 'N/A'}</span>
        </div>
        <div class="modal-item">
          <span class="modal-label">Total Students</span>
          <span class="modal-value">${school.totalStudents || 'N/A'}</span>
        </div>
        <div class="modal-item">
          <span class="modal-label">Rating</span>
          <span class="modal-value">${'★'.repeat(Math.round(school.rating))}${'☆'.repeat(5 - Math.round(school.rating))}</span>
        </div>
      </div>
    </div>

    <div class="modal-section">
      <h4>Fee Structure</h4>
      <table class="fee-table">
        <tr><td>Admission Fee:</td><td>PKR ${school.fee?.admission?.toLocaleString() || 'Contact'}</td></tr>
        <tr><td>Monthly Fee:</td><td>PKR ${school.fee?.monthly?.toLocaleString() || 'Contact'}</td></tr>
        <tr><td>Annual Charges:</td><td>PKR ${school.fee?.annual?.toLocaleString() || 'Contact'}</td></tr>
        <tr><td>Transport:</td><td>PKR ${school.fee?.transport?.toLocaleString() || 'Contact'}</td></tr>
      </table>
    </div>

    <div class="modal-section">
      <h4>Contact</h4>
      <p>
        <strong>Phone:</strong> <a href="tel:${school.phone || '#'}" style="color:#c9a84c;">${school.phone || 'N/A'}</a><br>
        <strong>Email:</strong> <a href="mailto:${school.email || '#'}" style="color:#c9a84c;">${school.email || 'N/A'}</a><br>
        <strong>Website:</strong> <a href="${school.website || '#'}" target="_blank" style="color:#c9a84c;">${school.website || 'N/A'}</a>
      </p>
    </div>
  `;
  
  overlay.classList.add('show');
  modal.classList.add('show');
}

function closeModal(event) {
  if (event && event.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('modal').classList.remove('show');
}

function closeModalDirect() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('modal').classList.remove('show');
}

/* Initialize on page load */
document.addEventListener('DOMContentLoaded', loadSchoolsGrid);
