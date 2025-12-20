export class GoalsList {
    constructor(app) {
        this.app = app;
    }

    render() {
        setTimeout(() => this.attachEvents(), 0);

        if (this.app.goals.length === 0) {
            return this.renderEmpty();
        }

        return `
            <div class="container">
                <h2 style="margin-bottom: 20px;">Mis Objetivos</h2>
                <div class="goals-list">
                    ${this.app.goals.map(goal => this.renderGoalItem(goal)).join('')}
                </div>
            </div>
            ${this.renderFooter()}
        `;
    }

    renderEmpty() {
        return `
            <div class="container">
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">📝</div>
                    <h2>No tienes objetivos</h2>
                    <p style="color: var(--text-light); margin-bottom: 30px;">
                        Crea tu primer objetivo y comienza a alcanzar tus metas
                    </p>
                    <button class="btn btn-primary" onclick="app.showGoalForm()">
                        Crear objetivo
                    </button>
                </div>
            </div>
            ${this.renderFooter()}
        `;
    }

    renderGoalItem(goal) {
        const progress = this.app.getGoalProgress(goal);
        const streak = this.app.getGoalStreak(goal);
        const startDate = new Date(goal.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        const endDate = new Date(goal.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

        return `
            <div class="goal-item" style="border-left-color: ${goal.color}; opacity: ${goal.hidden ? 0.5 : 1};">
                <div class="goal-item-header">
                    <div>
                        <div class="goal-item-title">${goal.title}</div>
                        ${goal.description ? `<p style="color: var(--text-light); font-size: 0.9rem; margin-top: 5px;">${goal.description}</p>` : ''}
                    </div>
                    <div class="goal-item-actions">
                        <button class="icon-btn" data-action="edit" data-id="${goal.id}" title="Editar">
                            ✏️
                        </button>
                        <button class="icon-btn" data-action="toggle" data-id="${goal.id}" title="${goal.hidden ? 'Mostrar' : 'Ocultar'}">
                            ${goal.hidden ? '👁️' : '🙈'}
                        </button>
                        <button class="icon-btn" data-action="delete" data-id="${goal.id}" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div style="margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 0.9rem; color: var(--text-light);">
                            📅 ${startDate} - ${endDate}
                        </span>
                        <span style="font-weight: 600; color: ${goal.color};">
                            ${progress.percentage}%
                        </span>
                    </div>
                    <div class="progress-bar-container" style="height: 8px;">
                        <div class="progress-bar" style="width: ${progress.percentage}%; background-color: ${goal.color};"></div>
                    </div>
                </div>

                <div style="display: flex; gap: 20px; margin-top: 15px; font-size: 0.9rem;">
                    <div>
                        <span style="color: var(--text-light);">Racha:</span>
                        <strong> ${streak} días</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-light);">Completado:</span>
                        <strong> ${progress.completed}/${progress.total}</strong>
                    </div>
                </div>

                <button class="btn btn-secondary" data-action="view" data-id="${goal.id}" style="margin-top: 15px; padding: 10px;">
                    Ver calendario
                </button>
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
                <button class="nav-btn" id="homeBtn">
                    <div class="nav-btn-icon">🏠</div>
                    <div class="nav-btn-label">Inicio</div>
                </button>
                <button class="nav-btn active" id="goalsListBtn">
                    <div class="nav-btn-icon">📋</div>
                    <div class="nav-btn-label">Objetivos</div>
                </button>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('addGoalBtn').addEventListener('click', () => {
            this.app.showGoalForm();
        });

        document.getElementById('homeBtn').addEventListener('click', () => {
            this.app.showHome();
        });

        document.getElementById('goalsListBtn').addEventListener('click', () => {
            this.app.showGoalsList();
        });

        const actionButtons = document.querySelectorAll('[data-action]');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action || e.target.closest('[data-action]').dataset.action;
                const goalId = e.target.dataset.id || e.target.closest('[data-action]').dataset.id;
                this.handleAction(action, goalId);
            });
        });
    }

    handleAction(action, goalId) {
        const goal = this.app.goals.find(g => g.id === goalId);
        if (!goal) return;

        switch (action) {
            case 'edit':
                this.app.showGoalForm(goal);
                break;
            case 'toggle':
                this.app.toggleGoalVisibility(goalId);
                this.app.showGoalsList();
                break;
            case 'delete':
                if (confirm(`¿Estás seguro de que deseas eliminar "${goal.title}"?`)) {
                    this.app.deleteGoal(goalId);
                }
                break;
            case 'view':
                this.app.showHome(goalId);
                break;
        }
    }
}