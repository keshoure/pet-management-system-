import { store } from './services/store.js';
import { Header } from './components/Header.js';
import { BottomNav } from './components/BottomNav.js';
import { DashboardView } from './views/DashboardView.js';
import { PetsView } from './views/PetsView.js';
import { VaccinesView } from './views/VaccinesView.js';
import { AppointmentsView } from './views/AppointmentsView.js';
import { RemindersView } from './views/RemindersView.js';
import { PassportView } from './views/PassportView.js';

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.views = {};
    this.init();
  }

  init() {
    // 1. Set initial theme
    const savedTheme = store.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Setup Header & Navigation
    const headerContainer = document.getElementById('app-header');
    const bottomNavContainer = document.getElementById('bottom-nav');
    const mainContainer = document.getElementById('app-main');

    window.appHeader = new Header(headerContainer);
    
    this.bottomNav = new BottomNav(bottomNavContainer, (tab) => {
      this.navigate(tab);
    });

    // 3. Initialize View instances
    this.views = {
      dashboard: new DashboardView(mainContainer),
      pets: new PetsView(mainContainer),
      vaccines: new VaccinesView(mainContainer),
      appointments: new AppointmentsView(mainContainer),
      reminders: new RemindersView(mainContainer),
      passport: new PassportView(mainContainer)
    };

    // 4. Setup Desktop Frame View Switcher button
    this.setupDesktopFrameToggle();

    // 5. Global Router
    window.appRouter = {
      navigate: (viewName) => this.navigate(viewName)
    };

    // 6. Listen to active pet / state changes to re-render active view
    store.subscribe('activePetChanged', () => {
      this.renderCurrentView();
    });
    store.subscribe('themeChanged', () => {
      // Re-render chart or themes if needed
      if (this.currentView === 'pets') {
        this.renderCurrentView();
      }
    });

    // 7. Initial render
    this.navigate('dashboard');
  }

  navigate(viewName) {
    if (!this.views[viewName]) return;
    this.currentView = viewName;
    this.bottomNav.setActiveTab(viewName);
    this.renderCurrentView();

    // Scroll to top of app main on view change
    const mainContainer = document.getElementById('app-main');
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
  }

  renderCurrentView() {
    const view = this.views[this.currentView];
    if (view && typeof view.render === 'function') {
      view.render();
    }
  }

  setupDesktopFrameToggle() {
    if (window.self !== window.top) return; // Hide inside iframe preview
    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'desktop-view-toggle';
    toggleBtn.id = 'desktop-view-toggle-btn';
    toggleBtn.innerHTML = `
      <i class="fa-solid fa-mobile-screen"></i>
      <span>Toggle View Size</span>
    `;

    toggleBtn.onclick = () => {
      const mode = store.toggleViewMode();
      toggleBtn.innerHTML = mode === 'expanded' 
        ? `<i class="fa-solid fa-mobile-screen-button"></i> <span>Mobile Phone View</span>`
        : `<i class="fa-solid fa-tablet-screen-button"></i> <span>Expanded View</span>`;
    };

    appRoot.appendChild(toggleBtn);
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
