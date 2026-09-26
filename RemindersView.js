import { store } from '../services/store.js';
import { BottomSheet } from '../components/BottomSheet.js';
import { Toast } from '../components/Toast.js';

export class RemindersView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const activePet = store.getActivePet();
    if (!activePet) {
      this.container.innerHTML = `<div class="empty-state"><p>No active pet selected.</p></div>`;
      return;
    }

    const reminders = store.getReminders(activePet.id);
    const completedCount = reminders.filter(r => r.completed).length;

    this.container.innerHTML = `
      <div class="reminders-view">
        <!-- Header -->
        <div class="flex-between">
          <div>
            <h2 style="font-size: 1.25rem;">Daily Care Routines</h2>
            <p class="text-secondary" style="font-size: 0.82rem;">${completedCount} of ${reminders.length} tasks completed today</p>
          </div>
          <button class="btn btn-primary btn-sm" id="rem-add-btn">
            <i class="fa-solid fa-plus"></i> Add Routine
          </button>
        </div>

        <!-- Progress Overview Card -->
        <div class="glass-card" style="padding: var(--space-4); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span style="font-size: 0.95rem; font-weight: 700;">Daily Routine Goal</span>
            <p class="text-secondary" style="font-size: 0.78rem;">Keep ${activePet.name}'s daily schedule consistent</p>
          </div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary-500);">
            ${Math.round((completedCount / (reminders.length || 1)) * 100)}%
          </div>
        </div>

        <!-- Reminders List -->
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${reminders.length === 0 ? `
            <div class="empty-state" style="padding: var(--space-6) var(--space-4);">
              <div class="empty-icon"><i class="fa-solid fa-clipboard-check"></i></div>
              <h4 class="empty-title">No daily routines</h4>
              <p class="empty-desc">Add walks, feeding times, brushing, or medication schedules.</p>
            </div>
          ` : reminders.map(r => `
            <div class="reminder-item-card ${r.completed ? 'completed' : ''}">
              <div class="reminder-left-group">
                <div class="reminder-checkbox-btn ${r.completed ? 'checked' : ''}" data-rem-toggle-chk="${r.id}" title="Toggle Completed">
                  <i class="fa-solid fa-check"></i>
                </div>
                <div class="reminder-icon-box" style="background: ${r.color === 'teal' ? 'rgba(16, 185, 129, 0.12)' : r.color === 'rose' ? 'rgba(244, 63, 94, 0.12)' : r.color === 'indigo' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(245, 158, 11, 0.12)'}; color: ${r.color === 'teal' ? 'var(--primary-600)' : r.color === 'rose' ? 'var(--accent-rose-500)' : r.color === 'indigo' ? 'var(--accent-indigo-500)' : 'var(--accent-amber-500)'};">
                  <i class="fa-solid ${r.icon}"></i>
                </div>
                <div>
                  <h4 class="reminder-title">${r.title}</h4>
                  <div class="reminder-time-tag">
                    <i class="fa-regular fa-clock"></i>
                    <span>${r.time}</span>
                    <span class="badge badge-primary" style="font-size: 0.65rem; margin-left: 0.35rem;">${r.category}</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <label class="switch-toggle" title="Enable/Disable Alert">
                  <input type="checkbox" ${r.enabled ? 'checked' : ''} data-rem-switch="${r.id}" />
                  <span class="slider-round"></span>
                </label>
                <button class="btn btn-sm" data-rem-del="${r.id}" style="padding: 0.2rem 0.4rem; color: var(--text-muted); font-size: 0.75rem;">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Add Routine Button
    const addBtn = document.getElementById('rem-add-btn');
    if (addBtn) {
      addBtn.onclick = () => this.openAddReminderSheet();
    }

    // Toggle Complete Checkbox
    this.container.querySelectorAll('[data-rem-toggle-chk]').forEach(box => {
      box.onclick = () => {
        const rid = box.getAttribute('data-rem-toggle-chk');
        store.toggleReminderCompleted(rid);
        Toast.show('Routine task status updated!', 'success');
        this.render();
      };
    });

    // Toggle Enabled Switch
    this.container.querySelectorAll('[data-rem-switch]').forEach(sw => {
      sw.onchange = () => {
        const rid = sw.getAttribute('data-rem-switch');
        store.toggleReminderEnabled(rid);
        Toast.show('Reminder alert toggled', 'info');
      };
    });

    // Delete Reminder
    this.container.querySelectorAll('[data-rem-del]').forEach(btn => {
      btn.onclick = () => {
        const rid = btn.getAttribute('data-rem-del');
        if (confirm('Delete this routine task?')) {
          store.deleteReminder(rid);
          Toast.show('Routine task removed', 'info');
          this.render();
        }
      };
    });
  }

  openAddReminderSheet() {
    const activePet = store.getActivePet();
    const html = `
      <form id="add-rem-form">
        <div class="form-group">
          <label class="form-label">Routine / Task Name</label>
          <input type="text" class="form-input" id="r-title" placeholder="e.g. Evening Brush & Dental Chew" required />
        </div>
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Time</label>
            <input type="time" class="form-input" id="r-time" value="18:00" required />
          </div>
          <div>
            <label class="form-label">Category</label>
            <select class="form-select" id="r-category">
              <option value="exercise">Exercise / Walk</option>
              <option value="food">Feeding & Nutrition</option>
              <option value="medication">Medication & Rx</option>
              <option value="grooming">Grooming & Hygiene</option>
              <option value="general">General Care</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Icon Representation</label>
          <select class="form-select" id="r-icon">
            <option value="fa-person-walking">Walking / Exercise</option>
            <option value="fa-bowl-food">Food / Meal Bowl</option>
            <option value="fa-pills">Pills / Medication</option>
            <option value="fa-spa">Grooming / Spa</option>
            <option value="fa-moon">Evening / Sleep</option>
            <option value="fa-heart">Health & Love</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top: var(--space-4);">
          <i class="fa-solid fa-bell"></i> Save Routine Task
        </button>
      </form>
    `;

    BottomSheet.open(`Add Daily Routine (${activePet.name})`, html, (content) => {
      const form = content.querySelector('#add-rem-form');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const title = content.querySelector('#r-title').value;
          const time = content.querySelector('#r-time').value;
          const category = content.querySelector('#r-category').value;
          const icon = content.querySelector('#r-icon').value;

          let color = 'teal';
          if (category === 'medication') color = 'rose';
          else if (category === 'grooming') color = 'indigo';
          else if (category === 'food') color = 'amber';

          store.addReminder({
            petId: activePet.id,
            title,
            time,
            category,
            icon,
            color
          });

          BottomSheet.close();
          Toast.show(`Routine task added for ${activePet.name}`, 'success');
          this.render();
        };
      }
    });
  }
}
