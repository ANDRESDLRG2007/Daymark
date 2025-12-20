export class Settings {
    constructor(app) {
        this.app = app;
    }

    render() {
        setTimeout(() => this.attachEvents(), 0);

        return `
            <div class="container">
                <h2 style="margin-bottom: 20px;">⚙️ Configuración</h2>
                
                <div class="settings-container">
                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Descripción diaria</div>
                            <div class="setting-description">
                                Pedir descripción al marcar cada día como completado
                            </div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="dailyDescriptionToggle" ${this.app.settings.dailyDescription ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Acerca de</div>
                            <div class="setting-description">
                                Planificador de Objetivos v1.0
                            </div>
                        </div>
                    </div>

                    <div class="setting-item" style="border-bottom: none;">
                        <div class="setting-label">
                            <div class="setting-title">Funciones futuras</div>
                            <div class="setting-description">
                                • Inicio de sesión para sincronizar entre dispositivos<br>
                                • Notificaciones diarias<br>
                                • Estadísticas avanzadas<br>
                                • Temas personalizados
                            </div>
                        </div>
                    </div>
                </div>

                <button class="btn btn-secondary" style="margin-top: 20px;" id="backBtn">
                    Volver al inicio
                </button>
            </div>
            ${this.renderFooter()}
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
                <button class="nav-btn" id="goalsListBtn">
                    <div class="nav-btn-icon">📋</div>
                    <div class="nav-btn-label">Objetivos</div>
                </button>
                <button class="nav-btn active" id="settingsBtn">
                    <div class="nav-btn-icon">⚙️</div>
                    <div class="nav-btn-label">Config</div>
                </button>
            </div>
        `;
    }

    attachEvents() {
        const dailyDescToggle = document.getElementById('dailyDescriptionToggle');
        dailyDescToggle.addEventListener('change', (e) => {
            this.app.settings.dailyDescription = e.target.checked;
            this.app.saveSettings();
        });

        document.getElementById('backBtn').addEventListener('click', () => {
            this.app.showHome();
        });

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
    }
}