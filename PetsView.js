import { store } from '../services/store.js';
import { renderWeightChart, formatDate, calculateAge } from '../utils/helpers.js';
import { Modal } from '../components/Modal.js';
import { BottomSheet } from '../components/BottomSheet.js';
import { Toast } from '../components/Toast.js';

export class PetsView {
  constructor(container) {
    this.container = container;
    window.petsView = this;
  }

  render() {
    const pets = store.getPets();
    const activePet = store.getActivePet();
    const currentTheme = store.getTheme();

    this.container.innerHTML = `
      <div class="pets-view">
        <!-- Top Title Row & Add Pet Button -->
        <div class="flex-between">
          <div>
            <h2 style="font-size: 1.25rem;">Pet Profiles</h2>
            <p class="text-secondary" style="font-size: 0.82rem;">Manage your furry family members (${pets.length})</p>
          </div>
          <button class="btn btn-primary btn-sm" id="pets-add-pet-btn">
            <i class="fa-solid fa-plus"></i> Add Pet
          </button>
        </div>

        <!-- Pets List -->
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${pets.map(p => `
            <div class="pet-card ${p.id === activePet?.id ? 'active-selected' : ''}" data-pet-select-id="${p.id}">
              <div class="pet-card-top">
                <img src="${p.avatar}" alt="${p.name}" class="pet-card-avatar" onerror="this.src='/images/pets/default-avatar.svg'" />
                <div class="pet-card-main">
                  <div class="pet-card-name-row">
                    <span class="pet-card-name">${p.name}</span>
                    ${p.id === activePet?.id ? '<span class="badge badge-primary"><i class="fa-solid fa-check"></i> Active</span>' : '<span class="badge" style="background: var(--bg-subtle); color: var(--text-muted);">Switch</span>'}
                  </div>
                  <span class="pet-card-breed">${p.species} • ${p.breed}</span>
                  <div class="pet-card-tags">
                    <span class="pet-tag"><i class="fa-regular fa-calendar"></i> ${p.age}</span>
                    <span class="pet-tag"><i class="fa-solid fa-weight-scale"></i> ${p.weight} ${p.weightUnit}</span>
                    <span class="pet-tag"><i class="fa-solid fa-dna"></i> ${p.gender}</span>
                  </div>
                </div>
              </div>

              <div class="pet-card-actions">
                <button class="btn btn-sm btn-secondary" data-edit-pet-id="${p.id}" style="padding: 0.3rem 0.65rem;">
                  <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="btn btn-sm btn-secondary" data-log-w-id="${p.id}" style="padding: 0.3rem 0.65rem;">
                  <i class="fa-solid fa-weight-scale"></i> Log Weight
                </button>
                ${pets.length > 1 ? `
                  <button class="btn btn-sm btn-secondary" data-delete-pet-id="${p.id}" style="padding: 0.3rem 0.6rem; color: var(--accent-rose-500);">
                    <i class="fa-regular fa-trash-can"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        ${activePet ? `
          <!-- Active Pet Weight Progression Chart -->
          <div class="glass-card" style="padding: var(--space-4); margin-top: var(--space-2);">
            <div class="flex-between" style="margin-bottom: var(--space-2);">
              <div>
                <h3 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">
                  <i class="fa-solid fa-chart-line text-primary-brand"></i> Weight History (${activePet.name})
                </h3>
                <span class="text-secondary" style="font-size: 0.76rem;">Track weight changes and trend curve</span>
              </div>
              <button class="btn btn-sm btn-outline" id="chart-log-weight-btn">
                <i class="fa-solid fa-plus"></i> Entry
              </button>
            </div>

            <div style="position: relative; width: 100%; height: 180px;">
              <canvas id="weight-trend-canvas" class="weight-chart-canvas"></canvas>
            </div>

            <!-- Recent Weight Entries -->
            <div style="margin-top: var(--space-3); border-top: 1px solid var(--border-subtle); padding-top: var(--space-3);">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">
                <span>Date Recorded</span>
                <span>Weight</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                ${(activePet.weightHistory || []).slice(-4).reverse().map(entry => `
                  <div style="display: flex; justify-content: space-between; font-size: 0.82rem; padding: 0.3rem 0.5rem; background: var(--bg-subtle); border-radius: var(--radius-sm);">
                    <span class="text-secondary"><i class="fa-regular fa-calendar-check text-muted"></i> ${formatDate(entry.date)}</span>
                    <span class="font-bold text-primary-brand">${entry.weight} ${activePet.weightUnit}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Medical Info & Allergies -->
          <div class="glass-card" style="padding: var(--space-4);">
            <h3 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-shield-virus text-primary-brand"></i> Dietary & Allergy Profile
            </h3>
            
            <div style="margin-bottom: var(--space-3);">
              <span class="form-label" style="font-size: 0.75rem; text-transform: uppercase;">Known Allergies</span>
              <div class="condition-tag-list">
                ${activePet.allergies && activePet.allergies.length > 0 
                  ? activePet.allergies.map(a => `<span class="condition-pill allergy"><i class="fa-solid fa-triangle-exclamation"></i> ${a}</span>`).join('')
                  : '<span class="text-secondary" style="font-size: 0.8rem;">No known allergies</span>'
                }
              </div>
            </div>

            <div>
              <span class="form-label" style="font-size: 0.75rem; text-transform: uppercase;">Dietary Instructions</span>
              <p style="font-size: 0.82rem; color: var(--text-secondary); background: var(--bg-subtle); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); margin-top: 0.25rem;">
                <i class="fa-solid fa-bowl-food" style="color: var(--accent-amber-500); margin-right: 0.3rem;"></i>
                ${activePet.diet || 'Standard nutrition formula'}
              </p>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Render Canvas Weight Chart
    setTimeout(() => {
      const canvas = document.getElementById('weight-trend-canvas');
      if (canvas && activePet && activePet.weightHistory) {
        renderWeightChart(canvas, activePet.weightHistory, currentTheme);
      }
    }, 50);

    this.bindEvents();
  }

  bindEvents() {
    const addPetBtn = document.getElementById('pets-add-pet-btn');
    if (addPetBtn) {
      addPetBtn.onclick = () => this.openAddPetModal();
    }

    const chartLogWeightBtn = document.getElementById('chart-log-weight-btn');
    if (chartLogWeightBtn) {
      chartLogWeightBtn.onclick = () => {
        const activePet = store.getActivePet();
        if (activePet) this.openLogWeightSheet(activePet.id);
      };
    }

    // Select Pet Cards
    this.container.querySelectorAll('[data-pet-select-id]').forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest('button')) return;
        const pid = card.getAttribute('data-pet-select-id');
        store.setActivePet(pid);
        Toast.show(`Active pet set to ${store.getPet(pid)?.name}`, 'success');
        this.render();
      };
    });

    // Edit Pet buttons
    this.container.querySelectorAll('[data-edit-pet-id]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-edit-pet-id');
        this.openEditPetModal(pid);
      };
    });

    // Log Weight buttons
    this.container.querySelectorAll('[data-log-w-id]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-log-w-id');
        this.openLogWeightSheet(pid);
      };
    });

    // Delete Pet buttons
    this.container.querySelectorAll('[data-delete-pet-id]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-delete-pet-id');
        const pet = store.getPet(pid);
        if (confirm(`Are you sure you want to delete profile for "${pet.name}"?`)) {
          store.deletePet(pid);
          Toast.show(`Deleted ${pet.name}`, 'info');
          this.render();
        }
      };
    });
  }

  openLogWeightSheet(petId) {
    const pet = store.getPet(petId);
    const html = `
      <form id="form-log-weight-sub">
        <div class="form-group">
          <label class="form-label">Current Weight for ${pet.name} (${pet.weightUnit})</label>
          <input type="number" step="0.1" class="form-input" id="sub-weight-val" value="${pet.weight}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Date</label>
          <input type="date" class="form-input" id="sub-weight-date" value="${new Date().toISOString().split('T')[0]}" required />
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top: var(--space-4);">
          <i class="fa-solid fa-check"></i> Save Weight
        </button>
      </form>
    `;

    BottomSheet.open(`Log Weight (${pet.name})`, html, (content) => {
      const form = content.querySelector('#form-log-weight-sub');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const w = content.querySelector('#sub-weight-val').value;
          const d = content.querySelector('#sub-weight-date').value;
          store.logWeight(petId, w, d);
          BottomSheet.close();
          Toast.show(`Logged weight ${w} ${pet.weightUnit}`, 'success');
          this.render();
        };
      }
    });
  }

  openAddPetModal() {
    let selectedAvatar = '/images/pets/luna.jpg';

    const html = `
      <form id="form-add-new-pet">
        <!-- Photo Selection -->
        <div class="photo-picker-container">
          <div class="photo-preview-wrap">
            <img src="${selectedAvatar}" alt="Pet Avatar" id="add-pet-avatar-preview" class="photo-preview-img" onerror="this.src='/images/pets/default-avatar.svg'" />
          </div>
          <span class="text-secondary" style="font-size: 0.78rem;">Choose an avatar:</span>
          <div class="preset-avatars-row">
            <div class="preset-avatar-btn selected" data-avatar-src="/images/pets/luna.jpg">
              <img src="/images/pets/luna.jpg" alt="Luna" />
            </div>
            <div class="preset-avatar-btn" data-avatar-src="/images/pets/milo.jpg">
              <img src="/images/pets/milo.jpg" alt="Milo" />
            </div>
            <div class="preset-avatar-btn" data-avatar-src="/images/pets/cooper.jpg">
              <img src="/images/pets/cooper.jpg" alt="Cooper" />
            </div>
            <div class="preset-avatar-btn" data-avatar-src="/images/pets/default-avatar.svg">
              <img src="/images/pets/default-avatar.svg" alt="Default" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Pet Name</label>
          <input type="text" class="form-input" id="new-pet-name" placeholder="e.g. Charlie" required />
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Species</label>
            <select class="form-select" id="new-pet-species">
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="form-label">Breed</label>
            <input type="text" class="form-input" id="new-pet-breed" placeholder="e.g. Beagle" required />
          </div>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Gender</label>
            <select class="form-select" id="new-pet-gender">
              <option value="Male (Neutered)">Male (Neutered)</option>
              <option value="Female (Spayed)">Female (Spayed)</option>
              <option value="Male (Intact)">Male (Intact)</option>
              <option value="Female (Intact)">Female (Intact)</option>
            </select>
          </div>
          <div>
            <label class="form-label">Date of Birth</label>
            <input type="date" class="form-input" id="new-pet-dob" value="2023-01-01" required />
          </div>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Weight (kg)</label>
            <input type="number" step="0.1" class="form-input" id="new-pet-weight" value="10.0" required />
          </div>
          <div>
            <label class="form-label">Color / Markings</label>
            <input type="text" class="form-input" id="new-pet-color" placeholder="e.g. Tri-color" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Known Allergies (comma separated)</label>
          <input type="text" class="form-input" id="new-pet-allergies" placeholder="e.g. Chicken, Pollen" />
        </div>

        <div class="form-group">
          <label class="form-label">Primary Vet Hospital / Clinic</label>
          <input type="text" class="form-input" id="new-pet-vet" placeholder="e.g. Metropolis Animal Hospital" />
        </div>

        <button type="submit" class="btn btn-primary btn-block" style="margin-top: var(--space-4);">
          <i class="fa-solid fa-paw"></i> Create Pet Profile
        </button>
      </form>
    `;

    Modal.open('Add New Pet Profile', html, (content) => {
      // Avatar selector binding
      content.querySelectorAll('.preset-avatar-btn').forEach(btn => {
        btn.onclick = () => {
          content.querySelectorAll('.preset-avatar-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedAvatar = btn.getAttribute('data-avatar-src');
          content.querySelector('#add-pet-avatar-preview').src = selectedAvatar;
        };
      });

      const form = content.querySelector('#form-add-new-pet');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const name = content.querySelector('#new-pet-name').value;
          const species = content.querySelector('#new-pet-species').value;
          const breed = content.querySelector('#new-pet-breed').value;
          const gender = content.querySelector('#new-pet-gender').value;
          const dob = content.querySelector('#new-pet-dob').value;
          const weight = content.querySelector('#new-pet-weight').value;
          const color = content.querySelector('#new-pet-color').value;
          const allergies = content.querySelector('#new-pet-allergies').value;
          const vetClinic = content.querySelector('#new-pet-vet').value;

          const created = store.addPet({
            name,
            species,
            breed,
            gender,
            dob,
            age: calculateAge(dob),
            weight,
            color,
            allergies,
            vetClinic,
            avatar: selectedAvatar
          });

          Modal.close();
          Toast.show(`Welcome, ${name}! Profile created.`, 'success');
          this.render();
        };
      }
    });
  }

  openEditPetModal(petId) {
    const pet = store.getPet(petId);
    if (!pet) return;

    const html = `
      <form id="form-edit-pet">
        <div class="form-group">
          <label class="form-label">Pet Name</label>
          <input type="text" class="form-input" id="edit-pet-name" value="${pet.name}" required />
        </div>
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Species</label>
            <input type="text" class="form-input" id="edit-pet-species" value="${pet.species}" required />
          </div>
          <div>
            <label class="form-label">Breed</label>
            <input type="text" class="form-input" id="edit-pet-breed" value="${pet.breed}" required />
          </div>
        </div>
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div>
            <label class="form-label">Gender</label>
            <input type="text" class="form-input" id="edit-pet-gender" value="${pet.gender}" />
          </div>
          <div>
            <label class="form-label">Date of Birth</label>
            <input type="date" class="form-input" id="edit-pet-dob" value="${pet.dob}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Known Allergies (comma separated)</label>
          <input type="text" class="form-input" id="edit-pet-allergies" value="${(pet.allergies || []).join(', ')}" />
        </div>
        <div class="form-group">
          <label class="form-label">Diet & Nutrition Instructions</label>
          <textarea class="form-textarea" id="edit-pet-diet" rows="2">${pet.diet || ''}</textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top: var(--space-4);">
          <i class="fa-solid fa-floppy-disk"></i> Save Profile Changes
        </button>
      </form>
    `;

    Modal.open(`Edit Profile (${pet.name})`, html, (content) => {
      const form = content.querySelector('#form-edit-pet');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const name = content.querySelector('#edit-pet-name').value;
          const species = content.querySelector('#edit-pet-species').value;
          const breed = content.querySelector('#edit-pet-breed').value;
          const gender = content.querySelector('#edit-pet-gender').value;
          const dob = content.querySelector('#edit-pet-dob').value;
          const allergiesStr = content.querySelector('#edit-pet-allergies').value;
          const diet = content.querySelector('#edit-pet-diet').value;

          store.updatePet(petId, {
            name,
            species,
            breed,
            gender,
            dob,
            age: calculateAge(dob),
            allergies: allergiesStr ? allergiesStr.split(',').map(s => s.trim()).filter(Boolean) : [],
            diet
          });

          Modal.close();
          Toast.show(`Updated profile for ${name}`, 'success');
          this.render();
        };
      }
    });
  }
}
