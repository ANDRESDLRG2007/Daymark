import { CalendarView } from './calendarView.js';

export class Home {
    constructor(app, selectedGoalId = null, viewType = 'dual') {
        this.app = app;
        this.visibleGoals = app.goals.filter(g => !g.hidden);
        this.selectedGoal = selectedGoalId 
            ? this.visibleGoals.find(g => g.id === selectedGoalId) 
            : this.visibleGoals[0];
        this.currentView = viewType;
    }

    render() {
        if (!this.selectedGoal) {
            return this.renderEmpty();
        }

        setTimeout(() => this.attachEvents(), 0);

        const calendarView = new CalendarView(this.app, this.selectedGoal, this.currentView);

        return `
            <div class="container">
                ${this.renderGoalSelector()}
                ${calendarView.render()}
                ${this.renderActions()}
            </div>
            ${this.renderFooter()}
        `;
    }

    renderEmpty() {
        return `
            <div class="container">
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">📋</div>
                    <h2>No tienes objetivos todavía</h2>
                    <p style="color: var(--text-light); margin-bottom: 30px;">
                        Comienza a planificar tus metas y alcanza tus sueños
                    </p>
                    <button class="btn btn-primary" onclick="app.showGoalForm()">
                        Crear primer objetivo
                    </button>
                </div>
            </div>
            ${this.renderFooter()}
        `;
    }

    renderGoalSelector() {
        if (this.visibleGoals.length <= 1) return '';

        return `
            <div class="goal-selector" style="margin-bottom: 20px;">
                <select id="goalSelect" style="width: 100%; padding: 12px; border-radius: 10px; border: 2px solid var(--border-color); font-size: 1rem;">
                    ${this.visibleGoals.map(goal => `
                        <option value="${goal.id}" ${goal.id === this.selectedGoal.id ? 'selected' : ''}>
                            ${goal.title}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }

    renderActions() {
        const today = new Date().toISOString().split('T')[0];
        const todayDay = this.selectedGoal.days.find(d => d.date === today);
        const canMarkToday = todayDay && todayDay.status === 'pending';

        return `
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                ${canMarkToday ? `
                    <button class="btn btn-success" id="markCompleteBtn" style="flex: 1;">
                        ✓ Marcar como completado
                    </button>
                    <button class="btn btn-skip" id="skipDayBtn">
                        Omitir día
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderFooter() {
        return `
            <div class="footer-nav">
                <button class="nav-btn" id="addGoalBtn">
                    <div class="nav-btn-icon">➕</div>
                    <div class="nav-btn-label">Añadir</div>
                </button>
                <button class="nav-btn active" id="homeBtn">
                    <div class="nav-btn-icon">🏠</div>
                    <div class="nav-btn-label">Inicio</div>
                </button>
                <button class="nav-btn" id="goalsListBtn">
                    <div class="nav-btn-icon">📋</div>
                    <div class="nav-btn-label">Objetivos</div>
                </button>
                <button class="nav-btn" id="settingsBtn">
                    <div class="nav-btn-icon">⚙️</div>
                    <div class="nav-btn-label">Config</div>
                </button>
            </div>
        `;
    }

    attachEvents() {
        const goalSelect = document.getElementById('goalSelect');
        if (goalSelect) {
            goalSelect.addEventListener('change', (e) => {
                this.app.showHome(e.target.value);
            });
        }

        const markCompleteBtn = document.getElementById('markCompleteBtn');
        if (markCompleteBtn) {
            markCompleteBtn.addEventListener('click', () => this.showMarkCompleteModal());
        }

        const skipDayBtn = document.getElementById('skipDayBtn');
        if (skipDayBtn) {
            skipDayBtn.addEventListener('click', () => this.showSkipDayModal());
        }

        document.getElementById('addGoalBtn').addEventListener('click', () => {
            this.app.showGoalForm();
        });

        document.getElementById('homeBtn').addEventListener('click', () => {
            this.app.showHome();
        });

        document.getElementById('goalsListBtn').addEventListener('click', () => {
            this.app.showGoalsList();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.app.showSettings();
        });

        // Event listeners para cambiar vista
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newView = e.target.dataset.view;
                // Cambiar vista completa
                this.app.showHome(this.selectedGoal.id, newView);
            });
        });

        // Event listeners para los días
        const days = document.querySelectorAll('.day:not(.empty)');
        days.forEach(day => {
            day.addEventListener('click', (e) => {
                const date = e.target.dataset.date;
                const dayData = this.selectedGoal.days.find(d => d.date === date);
                if (dayData && (dayData.status === 'completed' || dayData.status === 'skipped')) {
                    this.showDayDetailsModal(dayData);
                }
            });
        });
    }

    showMarkCompleteModal() {
        if (!this.app.settings.dailyDescription) {
            const today = new Date().toISOString().split('T')[0];
            this.app.markDay(this.selectedGoal.id, today, 'completed');
            this.app.showHome(this.selectedGoal.id);
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>¿Cómo lo hiciste hoy?</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="form-group">
                    <label>Describe cómo cumpliste tu objetivo hoy</label>
                    <textarea id="completionDescription" placeholder="Ej: Hice 30 minutos de ejercicio cardiovascular"></textarea>
                </div>
                <button class="btn btn-secondary" id="confirmComplete">Completar</button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        modal.querySelector('#confirmComplete').addEventListener('click', () => {
            const description = document.getElementById('completionDescription').value.trim();
            const today = new Date().toISOString().split('T')[0];
            this.app.markDay(this.selectedGoal.id, today, 'completed', description);
            document.body.removeChild(modal);
            this.app.showHome(this.selectedGoal.id);
        });
    }

    showSkipDayModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Omitir día</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="form-group">
                    <label>¿Por qué deseas omitir este día?</label>
                    <textarea id="skipReason" placeholder="Ej: Estuve enfermo/a"></textarea>
                </div>
                <button class="btn btn-secondary" id="confirmSkip">Omitir</button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        modal.querySelector('#confirmSkip').addEventListener('click', () => {
            const reason = document.getElementById('skipReason').value.trim();
            const today = new Date().toISOString().split('T')[0];
            this.app.markDay(this.selectedGoal.id, today, 'skipped', reason);
            document.body.removeChild(modal);
            this.app.showHome(this.selectedGoal.id);
        });
    }

    showDayDetailsModal(dayData) {
        const date = new Date(dayData.date);
        const formattedDate = date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const statusText = dayData.status === 'completed' ? 'Completado' : 'Omitido';
        const statusEmoji = dayData.status === 'completed' ? '✓' : '⊘';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${statusEmoji} ${statusText}</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <p><strong>${formattedDate}</strong></p>
                <div style="margin-top: 20px; padding: 15px; background: var(--secondary-color); border-radius: 10px;">
                    <p>${dayData.description || 'Sin descripción'}</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
}