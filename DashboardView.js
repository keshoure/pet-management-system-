import { store } from '../services/store.js';
import { formatDate, getDaysUntil } from '../utils/helpers.js';
import { BottomSheet } from '../components/BottomSheet.js';
import { Toast } from '../components/Toast.js';

export class DashboardView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const activePet = store.getActivePet();
    if (!activePet) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-paw"></i></div>
          <h3 class="empty-title">No Pet Profiles Found</h3>
          <p class="empty-desc">Create your first pet profile to begin managing their health and care schedule.</p>
        </div>
      `;
      return;
    }

    const appointments = store.getAppointments(activePet.id);
    const nextAppt = appointments.find(a => a.status === 'upcoming') || appointments[0];
    const vaccines = store.getVaccines(activePet.id);
    const upToDateCount = vaccines.filter(v => v.status === 'uptodate').length;
    const dueSoonCount = vaccines.filter(v => v.status === 'duesoon').length;
    const overdueCount = vaccines.filter(v => v.status === 'overdue').length;

    const reminders = store.getReminders(activePet.id);
    const medications = store.getMedications(activePet.id);

    this.container.innerHTML = `
      <div class="dashboard-view">
        <!-- Top Greeting -->
        <div class="greeting-section">
          <div class="greeting-text">
            <h2>Hello, Pet Parent! 👋</h2>
            <p>Here's ${activePet.name}'s health & routine overview</p>
          </div>
          <div class="user-avatar-badge" id="dash-switch-pet-btn" title="Switch Pet">
            <img src="${activePet.avatar}" alt="${activePet.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" onerror="this.src='/images/pets/default-avatar.svg'" />
          </div>
        </div>

        <!-- Active Pet Hero Card -->
        <div class="active-pet-hero">
          <i class="fa-solid fa-paw pet-hero-bg-paw"></i>
          <div class="pet-hero-top">
            <div class="pet-hero-photo-wrap">
              <img src="${activePet.avatar}" alt="${activePet.name}" class="pet-hero-photo" onerror="this.src='/images/pets/default-avatar.svg'" />
              <div class="pet-hero-species-badge">
                <i class="fa-solid ${activePet.species.toLowerCase() === 'cat' ? 'fa-cat' : 'fa-dog'}"></i>
              </div>
            </div>
            <div class="pet-hero-info">
              <div class="pet-hero-name">
                <span>${activePet.name}</span>
                <span class="badge ${dueSoonCount > 0 || overdueCount > 0 ? 'badge-duesoon' : 'badge-uptodate'}" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;">
                  <i class="fa-solid ${dueSoonCount > 0 || overdueCount > 0 ? 'fa-triangle-exclamation' : 'fa-shield-heart'}"></i>
                  ${dueSoonCount > 0 || overdueCount > 0 ? 'Booster Due' : 'Protected'}
                </span>
              </div>
              <div class="pet-hero-breed">${activePet.breed} • ${activePet.gender}</div>
            </div>
          </div>

          <div class="pet-hero-stats-row">
            <div class="pet-hero-stat-item">
              <span class="pet-hero-stat-label">Weight</span>
              <span class="pet-hero-stat-value">${activePet.weight} ${activePet.weightUnit}</span>
            </div>
            <div class="pet-hero-stat-item">
              <span class="pet-hero-stat-label">Age</span>
              <span class="pet-hero-stat-value">${activePet.age}</span>
            </div>
            <div class="pet-hero-stat-item">
              <span class="pet-hero-stat-label">Species</span>
              <span class="pet-hero-stat-value">${activePet.species}</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions Row -->
        <div class="quick-actions-row">
          <div class="quick-action-card" id="qa-log-weight">
            <div class="quick-action-icon bg-teal">
              <i class="fa-solid fa-weight-scale"></i>
            </div>
            <span class="quick-action-label">Log Weight</span>
          </div>

          <div class="quick-action-card" id="qa-add-vaccine">
            <div class="quick-action-icon bg-indigo">
              <i class="fa-solid fa-syringe"></i>
            </div>
            <span class="quick-action-label">Add Vaccine</span>
          </div>

          <div class="quick-action-card" id="qa-book-vet">
            <div class="quick-action-icon bg-amber">
              <i class="fa-solid fa-calendar-plus"></i>
            </div>
            <span class="quick-action-label">Book Vet</span>
          </div>

          <div class="quick-action-card" id="qa-view-passport">
            <div class="quick-action-icon bg-rose">
              <i class="fa-solid fa-id-card"></i>
            </div>
            <span class="quick-action-label">Passport</span>
          </div>
        </div>

        <!-- Next Vet Appointment Banner -->
        ${nextAppt ? `
          <div>
            <div class="section-header-row">
              <h3 class="section-title"><i class="fa-regular fa-calendar-check text-primary-brand"></i> Upcoming Vet Visit</h3>
              <span class="section-see-all" id="see-all-appts-btn">View All <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem;"></i></span>
            </div>
            <div class="appointment-banner-card" id="dash-appt-card" style="cursor: pointer;">
              <div class="appt-date-block">
                <span class="appt-date-month">${new Date(nextAppt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                <span class="appt-date-day">${new Date(nextAppt.date).getDate()}</span>
              </div>
              <div class="appt-banner-details">
                <h4 class="appt-banner-title">${nextAppt.title}</h4>
                <p class="appt-banner-subtitle">
                  <i class="fa-solid fa-location-dot"></i> ${nextAppt.clinic} • ${nextAppt.time}
                </p>
              </div>
              <div style="color: var(--accent-indigo-500); font-size: 0.9rem;">
                <i class="fa-solid fa-chevron-right"></i>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Vaccination Immunity Status Summary -->
        <div>
          <div class="section-header-row">
            <h3 class="section-title"><i class="fa-solid fa-shield-halved text-primary-brand"></i> Health & Immunization</h3>
            <span class="section-see-all" id="see-all-vaccines-btn">Manage <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem;"></i></span>
          </div>
          <div class="glass-card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">Immunization Coverage</span>
                <p class="text-secondary" style="font-size: 0.75rem;">${upToDateCount} of ${vaccines.length} vaccines current</p>
              </div>
              <div style="display: flex; gap: 0.35rem;">
                <span class="badge badge-uptodate">${upToDateCount} Active</span>
                ${dueSoonCount > 0 ? `<span class="badge badge-duesoon">${dueSoonCount} Due</span>` : ''}
                ${overdueCount > 0 ? `<span class="badge badge-overdue">${overdueCount} Expired</span>` : ''}
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="width: 100%; height: 8px; background: var(--bg-subtle); border-radius: var(--radius-full); overflow: hidden; display: flex;">
              <div style="width: ${(upToDateCount / (vaccines.length || 1)) * 100}%; background: var(--primary-500); height: 100%;"></div>
              <div style="width: ${(dueSoonCount / (vaccines.length || 1)) * 100}%; background: var(--accent-amber-500); height: 100%;"></div>
              <div style="width: ${(overdueCount / (vaccines.length || 1)) * 100}%; background: var(--accent-rose-500); height: 100%;"></div>
            </div>
          </div>
        </div>

        <!-- Today's Routine & Medication Checklist -->
        <div>
          <div class="section-header-row">
            <h3 class="section-title"><i class="fa-solid fa-clipboard-list text-primary-brand"></i> Today's Care Routine</h3>
            <span class="section-see-all" id="see-all-reminders-btn">All Tasks <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem;"></i></span>
          </div>
          <div class="reminders-mini-list">
            ${reminders.slice(0, 3).map(r => `
              <div class="reminder-mini-item" data-reminder-id="${r.id}" style="cursor: pointer;">
                <div class="reminder-mini-left">
                  <div class="reminder-checkbox-btn ${r.completed ? 'checked' : ''}" data-toggle-rem="${r.id}">
                    <i class="fa-solid fa-check"></i>
                  </div>
                  <div class="reminder-mini-info">
                    <h4 style="${r.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${r.title}</h4>
                    <p><i class="fa-regular fa-clock"></i> ${r.time}</p>
                  </div>
                </div>
                <span class="badge badge-primary" style="font-size: 0.68rem;">${r.category}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Today's Medications -->
        ${medications.length > 0 ? `
          <div>
            <div class="section-header-row">
              <h3 class="section-title"><i class="fa-solid fa-pills text-primary-brand"></i> Prescribed Medications</h3>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${medications.map(m => `
                <div class="medication-card" style="padding: 0.75rem 1rem;">
                  <div class="medication-icon-wrap" style="width: 36px; height: 36px; font-size: 0.95rem;">
                    <i class="fa-solid fa-prescription-bottle-medical"></i>
                  </div>
                  <div class="medication-details">
                    <h4 class="medication-name" style="font-size: 0.9rem;">${m.name}</h4>
                    <span class="medication-dosage" style="font-size: 0.76rem;">${m.dosage} • ${m.time}</span>
                  </div>
                  <button class="take-med-btn ${m.takenToday ? 'taken' : ''}" data-med-id="${m.id}">
                    <i class="fa-solid ${m.takenToday ? 'fa-check' : 'fa-plus'}"></i>
                    ${m.takenToday ? 'Taken' : 'Take'}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Switch pet button
    const switchPetBtn = document.getElementById('dash-switch-pet-btn');
    if (switchPetBtn) {
      switchPetBtn.onclick = () => {
        const header = window.appHeader;
        if (header) header.openPetSwitcherSheet();
      };
    }

    // Quick Actions
    const qaLogWeight = document.getElementById('qa-log-weight');
    if (qaLogWeight) {
      qaLogWeight.onclick = () => this.openLogWeightSheet();
    }

    const qaAddVaccine = document.getElementById('qa-add-vaccine');
    if (qaAddVaccine) {
      qaAddVaccine.onclick = () => this.openAddVaccineSheet();
    }

    const qaBookVet = document.getElementById('qa-book-vet');
    if (qaBookVet) {
      qaBookVet.onclick = () => this.openBookVetSheet();
    }

    const qaViewPassport = document.getElementById('qa-view-passport');
    if (qaViewPassport) {
      qaViewPassport.onclick = () => {
        if (window.appRouter) window.appRouter.navigate('passport');
      };
    }

    // See all buttons
    const seeAppts = document.getElementById('see-all-appts-btn');
    if (seeAppts) {
      seeAppts.onclick = () => {
        if (window.appRouter) window.appRouter.navigate('appointments');
      };
    }

    const dashApptCard = document.getElementById('dash-appt-card');
    if (dashApptCard) {
      dashApptCard.onclick = () => {
        if (window.appRouter) window.appRouter.navigate('appointments');
      };
    }

    const seeVaccines = document.getElementById('see-all-vaccines-btn');
    if (seeVaccines) {
      seeVaccines.onclick = () => {
        if (window.appRouter) window.appRouter.navigate('vaccines');
      };
    }

    const seeReminders = document.getElementById('see-all-reminders-btn');
    if (seeReminders) {
      seeReminders.onclick = () => {
        if (window.appRouter) window.appRouter.navigate('reminders');
      };
    }

    // Reminders toggle checkboxes
    this.container.querySelectorAll('[data-toggle-rem]').forEach(box => {
      box.onclick = (e) => {
        e.stopPropagation();
        const remId = box.getAttribute('data-toggle-rem');
        store.toggleReminderCompleted(remId);
        Toast.show('Routine task status updated!', 'success');
        this.render();
      };
    });

    // Medications Take toggle
    this.container.querySelectorAll('[data-med-id]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const medId = btn.getAttribute('data-med-id');
        store.toggleMedicationTaken(medId);
        Toast.show('Medication dosage updated!', 'success');
        this.render();
      };
    });
  }

  openLogWeightSheet() {
    const activePet = store.getActivePet();
    const html = `
      <form id="form-log-weight">
        <div class="form-group">
          <label class="form-label">Current Weight for ${activePet.name} (${activePet.weightUnit})</label>
          <div class="input-icon-wrapper">
            <i class="fa-solid fa-weight-scale"></i>
            <input type="number" step="0.1" class="form-input" id="weight-input" value="${activePet.weight}" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Measurement Date</label>
          <input type="date" class="form-input" id="weight-date-input" value="${new Date().toISOString().split('T')[0]}" required />
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top: var(--space-4);">
          <i class="fa-solid fa-check"></i> Save Weight Entry
        </button>
      </form>
    `;

    BottomSheet.open(`Log Weight - ${activePet.name}`, html, (content) => {
      const form = content.querySelector('#form-log-weight');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const w = content.querySelector('#weight-input').value;
          const d = content.querySelector('#weight-date-input').value;
          store.logWeight(activePet.id, w, d);
          BottomSheet.close();
          Toast.show(`Logged new weight: ${w} ${activePet.weightUnit}`, 'success');
          this.render();
        };
      }
    });
  }

  openAddVaccineSheet() {
    const activePet = store.getActivePet();
    const html = `
      <form id="form-add-vaccine">
        <div class="form-group">
          <label class="form-label">Vaccine Name</label>
          <input type="text" class="form-input" id="vac-name-input" placeholder="e.g. Bordetella (Kennel Cough)" required />
        </div>
        <div class="form-group">
          <label class="form-label">Target Disease / Core Type</label>
          <input type="text" class="form-input" id="vac-target-input" placeholder="e.g. Infectious Tracheobronchitis" />
        </div>
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Administered Date</label>
            <input type="date" class="form-input" id="vac-admin-date" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div>
            <label class="form-label">Next Due Date</label>
            <input type="date" class="form-input" id="vac-due-date" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Clinic / Administered By</label>
          <input type="text" class="form-input" id="vac-provider-input" value="${activePet.vetClinic}" />
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top: var(--space-4);">
          <i class="fa-solid fa-shield-virus"></i> Register Vaccine Record
        </button>
      </form>
    `;

    BottomSheet.open(`Add Vaccine - ${activePet.name}`, html, (content) => {
      const form = content.querySelector('#form-add-vaccine');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const name = content.querySelector('#vac-name-input').value;
          const targetDisease = content.querySelector('#vac-target-input').value;
          const administeredDate = content.querySelector('#vac-admin-date').value;
          const nextDueDate = content.querySelector('#vac-due-date').value;
          const provider = content.querySelector('#vac-provider-input').value;

          store.addVaccine({
            petId: activePet.id,
            name,
            targetDisease,
            administeredDate,
            nextDueDate,
            provider,
            status: 'uptodate'
          });

          BottomSheet.close();
          Toast.show(`Vaccination record for "${name}" registered!`, 'success');
          this.render();
        };
      }
    });
  }

  openBookVetSheet() {
    const activePet = store.getActivePet();
    const html = `
      <form id="form-book-vet">
        <div class="form-group">
          <label class="form-label">Reason for Visit / Appointment Title</label>
          <input type="text" class="form-input" id="appt-title-input" placeholder="e.g. Annual Booster & Dental Check" required />
        </div>
        <div class="form-group">
          <label class="form-label">Visit Type</label>
          <select class="form-select" id="appt-type-input">
            <option value="Checkup">General Wellness Checkup</option>
            <option value="Vaccination">Vaccination / Booster</option>
            <option value="Dental">Dental Care</option>
            <option value="Grooming">Grooming & Spa</option>
            <option value="Specialist">Specialist Consultation</option>
            <option value="Surgery">Surgery / Procedure</option>
          </select>
        </div>
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Date</label>
            <input type="date" class="form-input" id="appt-date-input" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div>
            <label class="form-label">Time</label>
            <input type="time" class="form-input" id="appt-time-input" value="10:00" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Clinic Name</label>
          <input type="text" class="form-input" id="appt-clinic-input" value="${activePet.vetClinic}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Special Notes / Symptoms</label>
          <textarea class="form-textarea" id="appt-notes-input" rows="2" placeholder="Fasting instructions, allergies, symptoms..."></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top: var(--space-4);">
          <i class="fa-regular fa-calendar-plus"></i> Schedule Appointment
        </button>
      </form>
    `;

    BottomSheet.open(`Book Vet Appointment`, html, (content) => {
      const form = content.querySelector('#form-book-vet');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const title = content.querySelector('#appt-title-input').value;
          const type = content.querySelector('#appt-type-input').value;
          const date = content.querySelector('#appt-date-input').value;
          const time = content.querySelector('#appt-time-input').value;
          const clinic = content.querySelector('#appt-clinic-input').value;
          const notes = content.querySelector('#appt-notes-input').value;

          store.addAppointment({
            petId: activePet.id,
            title,
            type,
            date,
            time,
            clinic,
            notes
          });

          BottomSheet.close();
          Toast.show(`Appointment "${title}" scheduled!`, 'success');
          this.render();
        };
      }
    });
  }
}
