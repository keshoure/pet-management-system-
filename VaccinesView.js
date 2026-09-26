import { store } from '../services/store.js';
import { formatDate, getVaccineStatusInfo } from '../utils/helpers.js';
import { BottomSheet } from '../components/BottomSheet.js';
import { Toast } from '../components/Toast.js';

export class VaccinesView {
  constructor(container) {
    this.container = container;
    this.currentFilter = 'all'; // 'all' | 'uptodate' | 'duesoon' | 'overdue'
  }

  render() {
    const activePet = store.getActivePet();
    if (!activePet) {
      this.container.innerHTML = `<div class="empty-state"><p>No active pet profile selected.</p></div>`;
      return;
    }

    const allVaccines = store.getVaccines(activePet.id);
    const filteredVaccines = allVaccines.filter(v => {
      const statusInfo = getVaccineStatusInfo(v);
      if (this.currentFilter === 'all') return true;
      return statusInfo.status === this.currentFilter;
    });

    const medications = store.getMedications(activePet.id);

    this.container.innerHTML = `
      <div class="vaccines-view">
        <!-- Top Title & Add Vaccine -->
        <div class="flex-between">
          <div>
            <h2 style="font-size: 1.25rem;">Vaccines & Meds</h2>
            <p class="text-secondary" style="font-size: 0.82rem;">Immunization tracker for ${activePet.name}</p>
          </div>
          <button class="btn btn-primary btn-sm" id="vac-add-btn">
            <i class="fa-solid fa-plus"></i> Add Vaccine
          </button>
        </div>

        <!-- Filter Chips Row -->
        <div class="filter-chips-row">
          <button class="chip-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
            All (${allVaccines.length})
          </button>
          <button class="chip-btn ${this.currentFilter === 'uptodate' ? 'active' : ''}" data-filter="uptodate">
            <i class="fa-solid fa-circle-check" style="font-size: 0.75rem;"></i> Up to Date
          </button>
          <button class="chip-btn ${this.currentFilter === 'duesoon' ? 'active' : ''}" data-filter="duesoon">
            <i class="fa-solid fa-clock" style="font-size: 0.75rem;"></i> Due Soon
          </button>
          <button class="chip-btn ${this.currentFilter === 'overdue' ? 'active' : ''}" data-filter="overdue">
            <i class="fa-solid fa-circle-exclamation" style="font-size: 0.75rem;"></i> Overdue
          </button>
        </div>

        <!-- Vaccines List -->
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${filteredVaccines.length === 0 ? `
            <div class="empty-state" style="padding: var(--space-6) var(--space-4);">
              <div class="empty-icon"><i class="fa-solid fa-shield-virus"></i></div>
              <h4 class="empty-title">No vaccines found</h4>
              <p class="empty-desc">No immunization records match the current filter.</p>
            </div>
          ` : filteredVaccines.map(v => {
            const statusInfo = getVaccineStatusInfo(v);
            return `
              <div class="vaccine-card status-border-${statusInfo.status}">
                <div class="vaccine-card-top">
                  <div class="vaccine-info-main">
                    <div class="vaccine-name">
                      <i class="fa-solid fa-syringe text-primary-brand"></i>
                      <span>${v.name}</span>
                    </div>
                    <p class="vaccine-target">${v.targetDisease}</p>
                  </div>
                  <span class="badge ${statusInfo.badgeClass}">
                    ${statusInfo.label}
                  </span>
                </div>

                <div class="vaccine-dates-row">
                  <div class="vaccine-date-col">
                    <span class="vaccine-date-label">Administered</span>
                    <span class="vaccine-date-val">${formatDate(v.administeredDate)}</span>
                  </div>
                  <div class="vaccine-date-col">
                    <span class="vaccine-date-label">Next Due</span>
                    <span class="vaccine-date-val" style="${statusInfo.status === 'overdue' ? 'color: var(--accent-rose-500);' : ''}">
                      ${formatDate(v.nextDueDate)}
                    </span>
                  </div>
                </div>

                <div class="vaccine-card-footer">
                  <span class="vaccine-provider">
                    <i class="fa-solid fa-hospital-user"></i> ${v.provider}
                  </span>
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <span style="font-family: monospace; font-size: 0.7rem; color: var(--text-muted);">#${v.batchNo}</span>
                    <button class="btn btn-sm btn-secondary" data-del-vac="${v.id}" style="padding: 0.2rem 0.5rem; color: var(--accent-rose-500);">
                      <i class="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Prescribed Medications & Daily Rx -->
        <div style="margin-top: var(--space-3);">
          <div class="flex-between" style="margin-bottom: var(--space-3);">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-pills text-primary-brand"></i> Prescribed Medications
              </h3>
              <p class="text-secondary" style="font-size: 0.76rem;">Daily doses, flea/tick & prevention</p>
            </div>
            <button class="btn btn-sm btn-outline" id="med-add-btn">
              <i class="fa-solid fa-plus"></i> Add Med
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${medications.length === 0 ? `
              <div class="empty-state" style="padding: var(--space-4);">
                <p class="text-secondary" style="font-size: 0.82rem;">No prescribed medications logged for ${activePet.name}.</p>
              </div>
            ` : medications.map(m => `
              <div class="medication-card">
                <div class="medication-icon-wrap">
                  <i class="fa-solid fa-capsules"></i>
                </div>
                <div class="medication-details">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h4 class="medication-name">${m.name}</h4>
                    <button class="btn btn-sm" data-del-med="${m.id}" style="padding: 0.1rem 0.4rem; color: var(--text-muted); font-size: 0.75rem;">
                      <i class="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                  <p class="medication-dosage">${m.dosage} • ${m.purpose}</p>
                  <p class="medication-schedule">
                    <i class="fa-regular fa-clock"></i> ${m.frequency} (${m.time})
                  </p>
                </div>
                <button class="take-med-btn ${m.takenToday ? 'taken' : ''}" data-toggle-med-take="${m.id}">
                  <i class="fa-solid ${m.takenToday ? 'fa-check' : 'fa-plus'}"></i>
                  ${m.takenToday ? 'Taken' : 'Take'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Filter chip clicks
    this.container.querySelectorAll('[data-filter]').forEach(chip => {
      chip.onclick = () => {
        this.currentFilter = chip.getAttribute('data-filter');
        this.render();
      };
    });

    // Add Vaccine button
    const addVacBtn = document.getElementById('vac-add-btn');
    if (addVacBtn) {
      addVacBtn.onclick = () => this.openAddVaccineSheet();
    }

    // Add Medication button
    const addMedBtn = document.getElementById('med-add-btn');
    if (addMedBtn) {
      addMedBtn.onclick = () => this.openAddMedicationSheet();
    }

    // Delete Vaccine buttons
    this.container.querySelectorAll('[data-del-vac]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const vid = btn.getAttribute('data-del-vac');
        if (confirm('Delete this vaccination record?')) {
          store.deleteVaccine(vid);
          Toast.show('Vaccination record deleted', 'info');
          this.render();
        }
      };
    });

    // Delete Medication buttons
    this.container.querySelectorAll('[data-del-med]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const mid = btn.getAttribute('data-del-med');
        if (confirm('Delete this medication item?')) {
          store.deleteMedication(mid);
          Toast.show('Medication removed', 'info');
          this.render();
        }
      };
    });

    // Toggle medication taken
    this.container.querySelectorAll('[data-toggle-med-take]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const mid = btn.getAttribute('data-toggle-med-take');
        store.toggleMedicationTaken(mid);
        Toast.show('Medication status updated', 'success');
        this.render();
      };
    });
  }

  openAddVaccineSheet() {
    const activePet = store.getActivePet();
    const html = `
      <form id="vac-sheet-form">
        <div class="form-group">
          <label class="form-label">Vaccine / Core Immunization</label>
          <input type="text" class="form-input" id="v-name" placeholder="e.g. Rabies 3-Year, DHPP, Bordetella" required />
        </div>
        <div class="form-group">
          <label class="form-label">Target Diseases / Description</label>
          <input type="text" class="form-input" id="v-target" placeholder="e.g. Parvovirus, Distemper, Adenovirus" />
        </div>
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Administered Date</label>
            <input type="date" class="form-input" id="v-admin" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div>
            <label class="form-label">Next Due Date</label>
            <input type="date" class="form-input" id="v-due" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Batch / Lot Number</label>
          <input type="text" class="form-input" id="v-batch" placeholder="e.g. BAT-99301" />
        </div>
        <div class="form-group">
          <label class="form-label">Administered At Clinic</label>
          <input type="text" class="form-input" id="v-provider" value="${activePet.vetClinic}" />
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top: var(--space-4);">
          <i class="fa-solid fa-syringe"></i> Save Vaccination Record
        </button>
      </form>
    `;

    BottomSheet.open(`Add Vaccine Record`, html, (content) => {
      const form = content.querySelector('#vac-sheet-form');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const name = content.querySelector('#v-name').value;
          const targetDisease = content.querySelector('#v-target').value;
          const administeredDate = content.querySelector('#v-admin').value;
          const nextDueDate = content.querySelector('#v-due').value;
          const batchNo = content.querySelector('#v-batch').value;
          const provider = content.querySelector('#v-provider').value;

          store.addVaccine({
            petId: activePet.id,
            name,
            targetDisease,
            administeredDate,
            nextDueDate,
            batchNo,
            provider
          });

          BottomSheet.close();
          Toast.show(`Vaccination record added for ${activePet.name}`, 'success');
          this.render();
        };
      }
    });
  }

  openAddMedicationSheet() {
    const activePet = store.getActivePet();
    const html = `
      <form id="med-sheet-form">
        <div class="form-group">
          <label class="form-label">Medication Name</label>
          <input type="text" class="form-input" id="m-name" placeholder="e.g. Heartgard Plus, Apoquel" required />
        </div>
        <div class="form-group">
          <label class="form-label">Dosage & Instructions</label>
          <input type="text" class="form-input" id="m-dosage" placeholder="e.g. 1 tablet with morning food" required />
        </div>
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Frequency</label>
            <input type="text" class="form-input" id="m-frequency" placeholder="e.g. Daily, Monthly" value="Daily" required />
          </div>
          <div>
            <label class="form-label">Time</label>
            <input type="text" class="form-input" id="m-time" placeholder="e.g. 08:30 AM" value="08:00 AM" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Purpose / Condition</label>
          <input type="text" class="form-input" id="m-purpose" placeholder="e.g. Heartworm Prevention, Allergy Relief" />
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top: var(--space-4);">
          <i class="fa-solid fa-pills"></i> Add Medication Schedule
        </button>
      </form>
    `;

    BottomSheet.open(`Add Medication Schedule`, html, (content) => {
      const form = content.querySelector('#med-sheet-form');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const name = content.querySelector('#m-name').value;
          const dosage = content.querySelector('#m-dosage').value;
          const frequency = content.querySelector('#m-frequency').value;
          const time = content.querySelector('#m-time').value;
          const purpose = content.querySelector('#m-purpose').value;

          store.addMedication({
            petId: activePet.id,
            name,
            dosage,
            frequency,
            time,
            purpose
          });

          BottomSheet.close();
          Toast.show(`Medication added for ${activePet.name}`, 'success');
          this.render();
        };
      }
    });
  }
}
