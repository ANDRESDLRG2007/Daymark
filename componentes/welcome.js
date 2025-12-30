/**
 * @class WelcomeScreen
 * @description Pantalla de bienvenida que se muestra la primera vez que se inicia la aplicación.
 * Ofrece una breve introducción y un botón para comenzar.
 */
export class WelcomeScreen {
    /**
     * @constructor
     * @param {App} app - Instancia principal de la aplicación.
     */
    constructor(app) {
        this.app = app;
    }

    /**
     * @method render
     * @description Genera el HTML de la pantalla de bienvenida.
     * Incluye título, descripción y botón de inicio que llama a app.completeWelcome().
     * @returns {string} HTML del componente.
     */
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