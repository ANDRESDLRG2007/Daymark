export class WelcomeScreen {
    constructor(app) {
        this.app = app;
    }

    render() {
        return `
            <div class="welcome-screen">
                <div class="welcome-icon">🎯</div>
                <h1>Bienvenido a tu Planificador de Objetivos</h1>
                <p>
                    Organiza tus metas, define plazos y mantén un seguimiento visual 
                    de tu progreso. Cada día cuenta para alcanzar tus sueños.
                </p>
                <button class="btn btn-primary" onclick="app.completeWelcome()">
                    Comenzar
                </button>
            </div>
        `;
    }
}