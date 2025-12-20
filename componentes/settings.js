export class Settings {
    constructor(app) {
        this.app = app;
    }

    render() {
        setTimeout(() => this.attachEvents(), 0);

        const user = this.app.firebaseService.getCurrentUser();
        const isOnline = !this.app.isOfflineMode && user;

        return `
            <div class="container">
                <h2 style="margin-bottom: 20px;">⚙️ Configuración</h2>
                
                <div class="settings-container">
                    ${isOnline ? `
                        <div class="setting-item">
                            <div class="setting-label">
                                <div class="setting-title">👤 Cuenta</div>
                                <div class="setting-description">
                                    ${user.email}
                                </div>
                            </div>
                        </div>
                    ` : ''}

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
                            <div class="setting-title">Modo oscuro</div>
                            <div class="setting-description">
                                Cambiar entre tema claro y oscuro
                            </div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="themeToggle" ${this.app.settings.theme === 'dark' ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Recordatorios diarios</div>
                            <div class="setting-description">
                                Mostrar notificación al abrir la app si hay días pendientes
                            </div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="notificationsToggle" ${this.app.settings.notifications ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="setting-item">
                        <div class="setting-label">
                            <div class="setting-title">Acerca de</div>
                            <div class="setting-description">
                                Planificador de Objetivos v0.2
                            </div>
                        </div>
                    </div>

                    ${isOnline ? `
                        <div class="setting-item" style="border-bottom: none;">
                            <button class="btn btn-danger" id="logoutBtn" style="width: 100%;">
                                🚪 Cerrar Sesión
                            </button>
                        </div>
                    ` : `
                        <div class="setting-item" style="border-bottom: none;">
                            <div class="setting-label">
                                <div class="setting-title">Modo offline</div>
                                <div class="setting-description">
                                    Estás usando la app sin cuenta. Tus datos solo se guardan en este dispositivo.
                                </div>
                            </div>
                            <button class="btn btn-primary" id="loginBtn" style="margin-top: 10px; width: 100%;">
                                🔑 Iniciar Sesión / Registrarse
                            </button>
                        </div>
                    `}
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
            this.app.saveData();
        });

        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('change', (e) => {
            this.app.settings.theme = e.target.checked ? 'dark' : 'light';
            this.app.applyTheme();
            this.app.saveData();
        });

        const notificationsToggle = document.getElementById('notificationsToggle');
        notificationsToggle.addEventListener('change', async (e) => {
            this.app.settings.notifications = e.target.checked;
            if (e.target.checked) {
                // Pedir permiso para notificaciones
                if ('Notification' in window) {
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                        alert('Permiso denegado para notificaciones');
                        e.target.checked = false;
                        this.app.settings.notifications = false;
                    }
                } else {
                    alert('Tu navegador no soporta notificaciones');
                    e.target.checked = false;
                    this.app.settings.notifications = false;
                }
            }
            this.app.saveData();
        });

        document.getElementById('backBtn').addEventListener('click', () => {
            this.app.showHome();
        });

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                    await this.app.firebaseService.logout();
                    localStorage.removeItem('offlineMode');
                    window.location.reload();
                }
            });
        }

        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.app.showAuth();
            });
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
    }
}