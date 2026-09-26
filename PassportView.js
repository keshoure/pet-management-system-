import { store } from '../services/store.js';
import { formatDate, generateQRCodeSVG } from '../utils/helpers.js';
import { BottomSheet } from '../components/BottomSheet.js';
import { Toast } from '../components/Toast.js';

export class PassportView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const activePet = store.getActivePet();
    if (!activePet) {
      this.container.innerHTML = `<div class="empty-state"><p>No active pet selected.</p></div>`;
      return;
    }

    const rabiesVaccine = store.getVaccines(activePet.id).find(v => v.name.toLowerCase().includes('rabies'));
    const medicalRecords = store.getMedicalRecords(activePet.id);

    this.container.innerHTML = `
      <div class="passport-view">
        <!-- Top Header & Export Print -->
        <div class="flex-between">
          <div>
            <h2 style="font-size: 1.25rem;">Pet Passport</h2>
            <p class="text-secondary" style="font-size: 0.82rem;">Official digital medical & travel ID</p>
          </div>
          <button class="btn btn-outline btn-sm" id="passport-print-btn">
            <i class="fa-solid fa-print"></i> Export / Print
          </button>
        </div>

        <!-- Official Digital Passport Card -->
        <div class="passport-card">
          <div class="passport-header">
            <div class="passport-title-wrap">
              <div class="passport-badge-icon">
                <i class="fa-solid fa-shield-cat"></i>
              </div>
              <div>
                <h3 class="passport-title">Pet Identification Passport</h3>
                <span class="passport-country">Official Health Registry</span>
              </div>
            </div>
            <span class="passport-id-badge">${activePet.passportId}</span>
          </div>

          <div class="passport-body">
            <div class="passport-photo-col">
              <img src="${activePet.avatar}" alt="${activePet.name}" class="passport-photo" onerror="this.src='/images/pets/default-avatar.svg'" />
              <span style="font-size: 0.65rem; color: #94a3b8; font-weight: 600;">VERIFIED ID</span>
            </div>

            <div class="passport-details-grid">
              <div class="passport-field-col">
                <span class="passport-field-label">Name</span>
                <span class="passport-field-val">${activePet.name}</span>
              </div>
              <div class="passport-field-col">
                <span class="passport-field-label">Species</span>
                <span class="passport-field-val">${activePet.species}</span>
              </div>
              <div class="passport-field-col">
                <span class="passport-field-label">Breed</span>
                <span class="passport-field-val">${activePet.breed}</span>
              </div>
              <div class="passport-field-col">
                <span class="passport-field-label">Gender</span>
                <span class="passport-field-val">${activePet.gender}</span>
              </div>
              <div class="passport-field-col">
                <span class="passport-field-label">Date of Birth</span>
                <span class="passport-field-val">${formatDate(activePet.dob)}</span>
              </div>
              <div class="passport-field-col">
                <span class="passport-field-label">Color / Coat</span>
                <span class="passport-field-val">${activePet.color || 'Standard'}</span>
              </div>
            </div>
          </div>

          <!-- Emergency QR Code Scan Section -->
          <div class="passport-qr-section">
            <div class="passport-qr-svg-wrap">
              ${generateQRCodeSVG(activePet.passportId || activePet.name)}
            </div>
            <div class="passport-qr-info">
              <h4 class="passport-qr-title">Emergency Medical & Contact QR</h4>
              <p class="passport-qr-sub">Scan to access emergency contacts, verified rabies certificate, and owner details.</p>
            </div>
          </div>
        </div>

        <!-- Rabies Certificate & Immunity Badge -->
        <div class="glass-card" style="padding: var(--space-4); border-left: 4px solid var(--primary-500);">
          <div class="flex-between">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <i class="fa-solid fa-certificate text-primary-brand" style="font-size: 1.5rem;"></i>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700;">Rabies Immunization Status</h4>
                <p class="text-secondary" style="font-size: 0.78rem;">
                  ${rabiesVaccine ? `Valid until ${formatDate(rabiesVaccine.nextDueDate)} (Batch: ${rabiesVaccine.batchNo})` : 'No rabies record found'}
                </p>
              </div>
            </div>
            <span class="badge ${rabiesVaccine ? 'badge-uptodate' : 'badge-overdue'}">
              ${rabiesVaccine ? 'Certified' : 'Missing'}
            </span>
          </div>
        </div>

        <!-- Emergency Veterinary Clinic Contact Card -->
        <div class="emergency-vet-card">
          <div class="emergency-header">
            <i class="fa-solid fa-hospital"></i>
            <span>Primary Veterinary Clinic</span>
          </div>
          <div>
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${activePet.vetClinic}</h4>
            <p class="text-secondary" style="font-size: 0.82rem;">${activePet.vetDoctor}</p>
            <p class="text-muted" style="font-size: 0.78rem; margin-top: 0.2rem;">
              <i class="fa-solid fa-location-dot"></i> ${activePet.vetAddress}
            </p>
          </div>
          <div class="emergency-btn-row">
            <a href="tel:${activePet.vetPhone}" class="btn btn-primary btn-sm">
              <i class="fa-solid fa-phone"></i> Call Clinic
            </a>
            <button class="btn btn-secondary btn-sm" id="passport-directions-btn">
              <i class="fa-solid fa-diamond-turn-right"></i> Directions
            </button>
          </div>
        </div>

        <!-- Medical History Log -->
        <div style="margin-top: var(--space-2);">
          <div class="flex-between" style="margin-bottom: var(--space-3);">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-file-medical text-primary-brand"></i> Clinical History & Lab Work
              </h3>
              <p class="text-secondary" style="font-size: 0.76rem;">Surgical records, blood panels, and past treatments</p>
            </div>
            <button class="btn btn-sm btn-outline" id="passport-add-rec-btn">
              <i class="fa-solid fa-plus"></i> Add Record
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${medicalRecords.length === 0 ? `
              <div class="empty-state" style="padding: var(--space-4);">
                <p class="text-secondary" style="font-size: 0.82rem;">No clinical records logged yet.</p>
              </div>
            ` : medicalRecords.map(rec => `
              <div class="medical-record-card">
                <div class="medical-record-header">
                  <span class="medical-record-title">
                    <i class="fa-solid fa-notes-medical text-primary-brand"></i>
                    ${rec.title}
                  </span>
                  <span class="badge badge-primary">${rec.type}</span>
                </div>
                <p class="medical-record-notes">${rec.notes}</p>
                <div class="medical-record-footer">
                  <span><i class="fa-regular fa-calendar"></i> ${formatDate(rec.date)}</span>
                  <span><i class="fa-solid fa-user-doctor"></i> ${rec.vet}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Print button
    const printBtn = document.getElementById('passport-print-btn');
    if (printBtn) {
      printBtn.onclick = () => {
        window.print();
      };
    }

    // Directions button
    const dirBtn = document.getElementById('passport-directions-btn');
    if (dirBtn) {
      dirBtn.onclick = () => {
        const activePet = store.getActivePet();
        Toast.show(`Opening maps for ${activePet.vetClinic}`, 'info');
      };
    }

    // Add Record button
    const addRecBtn = document.getElementById('passport-add-rec-btn');
    if (addRecBtn) {
      addRecBtn.onclick = () => this.openAddMedicalRecordSheet();
    }
  }

  openAddMedicalRecordSheet() {
    const activePet = store.getActivePet();
    const html = `
      <form id="add-rec-form">
        <div class="form-group">
          <label class="form-label">Record Title / Procedure</label>
          <input type="text" class="form-input" id="rec-title" placeholder="e.g. Annual Blood Panel, Dental X-Rays" required />
        </div>
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Date</label>
            <input type="date" class="form-input" id="rec-date" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div>
            <label class="form-label">Category</label>
            <select class="form-select" id="rec-type">
              <option value="Lab Work">Lab Work / Diagnostics</option>
              <option value="Surgery">Surgery / Procedure</option>
              <option value="Treatment">Treatment / Therapy</option>
              <option value="Checkup">General Exam</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Attending Veterinarian</label>
          <input type="text" class="form-input" id="rec-vet" value="${activePet.vetDoctor}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Clinical Notes & Findings</label>
          <textarea class="form-textarea" id="rec-notes" rows="3" placeholder="Diagnostic results, prescribed therapy, next steps..." required></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top: var(--space-4);">
          <i class="fa-solid fa-file-medical"></i> Save Clinical Record
        </button>
      </form>
    `;

    BottomSheet.open(`Add Medical Record (${activePet.name})`, html, (content) => {
      const form = content.querySelector('#add-rec-form');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const title = content.querySelector('#rec-title').value;
          const date = content.querySelector('#rec-date').value;
          const type = content.querySelector('#rec-type').value;
          const vet = content.querySelector('#rec-vet').value;
          const notes = content.querySelector('#rec-notes').value;

          store.addMedicalRecord({
            petId: activePet.id,
            title,
            date,
            type,
            vet,
            notes
          });

          BottomSheet.close();
          Toast.show(`Clinical record added for ${activePet.name}`, 'success');
          this.render();
        };
      }
    });
  }
}
