import { store } from '../services/store.js';
import { formatDate } from '../utils/helpers.js';
import { BottomSheet } from '../components/BottomSheet.js';
import { Toast } from '../components/Toast.js';

export class AppointmentsView {
  constructor(container) {
    this.container = container;
    this.tabMode = 'upcoming'; // 'upcoming' | 'past'
    this.selectedDayIndex = 0;
  }

  render() {
    const activePet = store.getActivePet();
    if (!activePet) {
      this.container.innerHTML = `<div class="empty-state"><p>No active pet selected.</p></div>`;
      return;
    }

    const allAppts = store.getAppointments(activePet.id);
    const filteredAppts = allAppts.filter(a => {
      if (this.tabMode === 'upcoming') {
        return a.status !== 'completed' && a.status !== 'cancelled';
      }
      return a.status === 'completed' || a.status === 'cancelled';
    });

    // Generate current week dates
    const today = new Date();
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      weekDays.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        num: d.getDate(),
        iso: d.toISOString().split('T')[0]
      });
    }

    this.container.innerHTML = `
      <div class="appointments-view">
        <!-- Top Title & Book Button -->
        <div class="flex-between">
          <div>
            <h2 style="font-size: 1.25rem;">Vet Appointments</h2>
            <p class="text-secondary" style="font-size: 0.82rem;">Scheduled visits & clinic logs</p>
          </div>
          <button class="btn btn-primary btn-sm" id="appt-book-btn">
            <i class="fa-solid fa-plus"></i> Book Visit
          </button>
        </div>

        <!-- Week Calendar Strip -->
        <div class="calendar-strip">
          ${weekDays.map((d, idx) => `
            <div class="calendar-day-card ${this.selectedDayIndex === idx ? 'active' : ''}" data-day-idx="${idx}" data-date-iso="${d.iso}">
              <span class="cal-day-name">${d.name}</span>
              <span class="cal-day-num">${d.num}</span>
              ${idx === 0 ? '<div class="cal-dot"></div>' : ''}
            </div>
          `).join('')}
        </div>

        <!-- Segmented Tab: Upcoming vs Past -->
        <div class="segmented-control">
          <button class="segment-btn ${this.tabMode === 'upcoming' ? 'active' : ''}" data-appt-tab="upcoming">
            <i class="fa-regular fa-clock"></i> Upcoming (${allAppts.filter(a => a.status !== 'completed').length})
          </button>
          <button class="segment-btn ${this.tabMode === 'past' ? 'active' : ''}" data-appt-tab="past">
            <i class="fa-solid fa-clock-rotate-left"></i> Past History
          </button>
        </div>

        <!-- Appointment Cards List -->
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${filteredAppts.length === 0 ? `
            <div class="empty-state" style="padding: var(--space-8) var(--space-4);">
              <div class="empty-icon"><i class="fa-regular fa-calendar-xmark"></i></div>
              <h4 class="empty-title">No appointments found</h4>
              <p class="empty-desc">No ${this.tabMode} appointments logged for ${activePet.name}.</p>
            </div>
          ` : filteredAppts.map(a => `
            <div class="appointment-card">
              <div class="appointment-card-header">
                <div>
                  <h4 class="appt-clinic-name">${a.title}</h4>
                  <div class="appt-vet-name">
                    <i class="fa-solid fa-user-doctor text-primary-brand"></i>
                    <span>${a.doctor || 'Veterinarian'} • ${a.clinic}</span>
                  </div>
                </div>
                <span class="appt-type-badge badge-primary">
                  <i class="fa-solid fa-stethoscope"></i> ${a.type}
                </span>
              </div>

              <div class="appt-time-box">
                <div>
                  <i class="fa-regular fa-calendar" style="margin-right: 0.35rem; color: var(--accent-indigo-500);"></i>
                  <span>${formatDate(a.date, 'full')}</span>
                </div>
                <div>
                  <i class="fa-regular fa-clock" style="margin-right: 0.35rem; color: var(--primary-500);"></i>
                  <span>${a.time}</span>
                </div>
              </div>

              ${a.notes ? `
                <div style="font-size: 0.8rem; color: var(--text-secondary); background: var(--bg-subtle); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm);">
                  <i class="fa-solid fa-circle-info" style="color: var(--accent-indigo-500); margin-right: 0.3rem;"></i>
                  ${a.notes}
                </div>
              ` : ''}

              <div class="appt-card-actions">
                <a href="tel:${a.phone || activePet.vetPhone}" class="appt-location-link" style="color: var(--primary-600); font-weight: 600;">
                  <i class="fa-solid fa-phone"></i> Call Clinic
                </a>
                <div class="appt-action-btns">
                  <button class="btn btn-sm btn-secondary" data-del-appt="${a.id}" style="padding: 0.3rem 0.6rem; color: var(--accent-rose-500);">
                    <i class="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Book Visit Button
    const bookBtn = document.getElementById('appt-book-btn');
    if (bookBtn) {
      bookBtn.onclick = () => this.openBookAppointmentSheet();
    }

    // Day Strip Click
    this.container.querySelectorAll('[data-day-idx]').forEach(dayCard => {
      dayCard.onclick = () => {
        this.selectedDayIndex = parseInt(dayCard.getAttribute('data-day-idx'));
        this.render();
      };
    });

    // Tab segment toggle
    this.container.querySelectorAll('[data-appt-tab]').forEach(btn => {
      btn.onclick = () => {
        this.tabMode = btn.getAttribute('data-appt-tab');
        this.render();
      };
    });

    // Delete appointment
    this.container.querySelectorAll('[data-del-appt]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const aid = btn.getAttribute('data-del-appt');
        if (confirm('Cancel this scheduled appointment?')) {
          store.deleteAppointment(aid);
          Toast.show('Appointment cancelled', 'info');
          this.render();
        }
      };
    });
  }

  openBookAppointmentSheet() {
    const activePet = store.getActivePet();
    const html = `
      <form id="book-appt-form">
        <div class="form-group">
          <label class="form-label">Appointment Purpose</label>
          <input type="text" class="form-input" id="b-title" placeholder="e.g. Routine Booster & Dental Check" required />
        </div>
        <div class="form-group">
          <label class="form-label">Service Type</label>
          <select class="form-select" id="b-type">
            <option value="Checkup">General Checkup</option>
            <option value="Vaccination">Vaccination / Booster</option>
            <option value="Dental">Dental Care</option>
            <option value="Grooming">Grooming & Bath</option>
            <option value="Surgery">Surgery / Procedure</option>
            <option value="Specialist">Specialist Consultation</option>
          </select>
        </div>
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Date</label>
            <input type="date" class="form-input" id="b-date" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div>
            <label class="form-label">Time</label>
            <input type="time" class="form-input" id="b-time" value="10:30" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Clinic / Hospital</label>
          <input type="text" class="form-input" id="b-clinic" value="${activePet.vetClinic}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Doctor / Attending Vet</label>
          <input type="text" class="form-input" id="b-doctor" value="${activePet.vetDoctor}" />
        </div>
        <div class="form-group">
          <label class="form-label">Notes & Instructions</label>
          <textarea class="form-textarea" id="b-notes" rows="2" placeholder="Fasting instructions, behavioral notes..."></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top: var(--space-4);">
          <i class="fa-regular fa-calendar-check"></i> Confirm Appointment
        </button>
      </form>
    `;

    BottomSheet.open(`Book Appointment (${activePet.name})`, html, (content) => {
      const form = content.querySelector('#book-appt-form');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const title = content.querySelector('#b-title').value;
          const type = content.querySelector('#b-type').value;
          const date = content.querySelector('#b-date').value;
          const time = content.querySelector('#b-time').value;
          const clinic = content.querySelector('#b-clinic').value;
          const doctor = content.querySelector('#b-doctor').value;
          const notes = content.querySelector('#b-notes').value;

          store.addAppointment({
            petId: activePet.id,
            title,
            type,
            date,
            time,
            clinic,
            doctor,
            notes
          });

          BottomSheet.close();
          Toast.show(`Appointment booked for ${activePet.name}!`, 'success');
          this.render();
        };
      }
    });
  }
}
