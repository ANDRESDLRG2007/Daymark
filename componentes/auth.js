/**
 * @class AuthScreen
 * @description Componente de interfaz de usuario para el manejo de autenticación.
 * Gestiona tanto el inicio de sesión como el registro de nuevos usuarios.
 * Interactúa directamente con la instancia de App para delegar la lógica de autenticación.
 */
export class AuthScreen {
    /**
     * @constructor
     * @param {App} app - Instancia principal de la aplicación.
     * @param {boolean} [isLogin=true] - Estado inicial: true para Login, false para Registro.
     */
    constructor(app, isLogin = true) {
        this.app = app;
        this.isLogin = isLogin;
    }

    /**
     * @method render
     * @description Genera el HTML del formulario de autenticación.
     * @returns {string} HTML del componente.
     */
    render() {
        setTimeout(() => this.attachEvents(), 0);

        return `
            <div class="welcome-screen" style="min-height: 100vh;">
                <div style="max-width: 400px; width: 90%; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 3rem; margin-bottom: 10px;">🎯</div>
                        <h2 style="color: var(--text-dark); margin-bottom: 10px;">
                            ${this.isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </h2>
                        <p style="color: var(--text-light); font-size: 0.9rem;">
                            ${this.isLogin ? 'Bienvenido de nuevo' : 'Comienza a alcanzar tus metas'}
                        </p>
                    </div>

                    <div id="authForm">
                        <div class="form-group">
                            <label for="email">Correo electrónico</label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="tu@email.com"
                                autocomplete="email"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="${this.isLogin ? 'Tu contraseña' : 'Mínimo 6 caracteres'}"
                                autocomplete="${this.isLogin ? 'current-password' : 'new-password'}"
                                required
                            >
                        </div>

                        ${!this.isLogin ? `
                            <div class="form-group">
                                <label for="confirmPassword">Confirmar contraseña</label>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    placeholder="Repite tu contraseña"
                                    autocomplete="new-password"
                                    required
                                >
                            </div>
                        ` : ''}

                        <div id="errorMessage" style="display: none; padding: 12px; background: #ffebee; color: #c62828; border-radius: 8px; margin-bottom: 15px; font-size: 0.9rem;"></div>

                        <button class="btn btn-secondary" id="authButton" style="margin-top: 10px;">
                            ${this.isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </button>

                        <div style="text-align: center; margin-top: 20px;">
                            <button 
                                id="toggleAuth" 
                                style="background: none; border: none; color: var(--primary-color); cursor: pointer; text-decoration: underline; font-size: 0.9rem;"
                            >
                                ${this.isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                            </button>
                        </div>

                        ${this.isLogin ? `
                            <div style="text-align: center; margin-top: 15px;">
                                <button 
                                    id="continueOffline" 
                                    style="background: none; border: none; color: var(--text-light); cursor: pointer; font-size: 0.85rem;"
                                >
                                    Continuar sin cuenta
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * @method attachEvents
     * @description Asocia los event listeners a los elementos del DOM después del renderizado.
     * Maneja clics en botones y la tecla Enter en inputs.
     */
    attachEvents() {
        const authButton = document.getElementById('authButton');
        const toggleAuth = document.getElementById('toggleAuth');
        const continueOffline = document.getElementById('continueOffline');
        const email = document.getElementById('email');
        const password = document.getElementById('password');

        authButton.addEventListener('click', () => this.handleAuth());

        toggleAuth.addEventListener('click', () => {
            this.app.showAuth(!this.isLogin);
        });

        if (continueOffline) {
            continueOffline.addEventListener('click', () => {
                this.app.continueOffline();
            });
        }

        // Enter para enviar
        [email, password].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleAuth();
                }
            });
        });
    }

    /**
     * @async
     * @method handleAuth
     * @description Procesa la solicitud de autenticación.
     * Valida entradas, gestiona el estado de carga y delega la operación a FirebaseService.
     * @returns {Promise<void>}
     */
    async handleAuth() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        const authButton = document.getElementById('authButton');

        // Validaciones
        if (!email || !password) {
            this.showError('Por favor completa todos los campos');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Correo electrónico inválido');
            return;
        }

        if (!this.isLogin) {
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (password !== confirmPassword) {
                this.showError('Las contraseñas no coinciden');
                return;
            }
            if (password.length < 6) {
                this.showError('La contraseña debe tener al menos 6 caracteres');
                return;
            }
        }

        // Deshabilitar botón y mostrar loading
        authButton.disabled = true;
        authButton.textContent = this.isLogin ? 'Iniciando sesión...' : 'Creando cuenta...';
        errorMessage.style.display = 'none';

        try {
            let result;
            if (this.isLogin) {
                result = await this.app.firebaseService.login(email, password);
            } else {
                result = await this.app.firebaseService.register(email, password);
            }

            if (result.success) {
                // Login exitoso - la app manejará el cambio de estado
                await this.app.handleAuthSuccess();
            } else {
                this.showError(result.error);
                authButton.disabled = false;
                authButton.textContent = this.isLogin ? 'Iniciar Sesión' : 'Crear Cuenta';
            }
        } catch (error) {
            this.showError('Error de conexión. Verifica tu internet');
            authButton.disabled = false;
            authButton.textContent = this.isLogin ? 'Iniciar Sesión' : 'Crear Cuenta';
        }
    }

    /**
     * @method showError
     * @description Muestra mensajes de error en la interfaz.
     * @param {string} message - Mensaje a mostrar.
     */
    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    /**
     * @method isValidEmail
     * @description Valida el formato del correo electrónico usando Regex.
     * @param {string} email - Correo a validar.
     * @returns {boolean} True si es válido.
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}