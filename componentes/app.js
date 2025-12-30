import { WelcomeScreen } from './welcome.js';
import { GoalForm } from './goalForm.js';
import { Home } from './home.js';
import { GoalsList } from './goalsList.js';
import { CalendarView } from './calendarView.js';
import { Settings } from './settings.js';
import { AuthScreen } from './auth.js';
import { firebaseService } from './firebase.js';

/**
 * @class App
 * @description Clase principal que orquesta la lógica de la aplicación, el manejo de estado y la navegación.
 * Actúa como el controlador central, coordinando la interacción entre componentes, la persistencia de datos
 * (LocalStorage o Firebase) y la gestión de la autenticación.
 */
class App {
    /**
     * @constructor
     * @description Inicializa el estado de la aplicación, configuraciones y servicios.
     * Configura el modo offline/online y dispara la inicialización.
     */
    constructor() {
        /** @type {string} Pantalla actual mostrada */
        this.currentScreen = 'loading';
        /** @type {?Object} Objetivo actualmente seleccionado o en edición */
        this.currentGoal = null;
        /** @type {Array<Object>} Lista de objetivos del usuario */
        this.goals = [];
        /** @type {boolean} Indica si el usuario ya vio la pantalla de bienvenida */
        this.hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
        /** @type {Object} Configuraciones de usuario (tema, descripciones, etc.) */
        this.settings = { dailyDescription: true, theme: 'light', heavyStyle: false };
        /** @type {?string} ID del objetivo seleccionado para vista detallada */
        this.selectedGoalId = null;
        /** @type {FirebaseService} Servicio de backend */
        this.firebaseService = firebaseService;
        /** @type {boolean} Bandera para forzar modo offline */
        this.isOfflineMode = localStorage.getItem('offlineMode') === 'true';
        this.init();
    }

    /**
     * @async
     * @method init
     * @description Inicializa la aplicación mostrando el loader y suscribiéndose a cambios de autenticación.
     * Determina la fuente de datos (Firebase o LocalStorage) basándose en el estado de autenticación y red.
     */
    async init() {
        // Mostrar loading
        this.render('<div class="welcome-screen"><div class="welcome-icon">⏳</div><h2>Cargando...</h2></div>');

        // Escuchar cambios de autenticación
        this.firebaseService.onAuthChange(async (user) => {
            if (user && !this.isOfflineMode) {
                // Usuario autenticado - cargar datos de Firebase
                await this.loadFromFirebase();
                this.checkInitialScreen();
            } else if (!this.isOfflineMode && !user) {
                // No hay usuario - mostrar pantalla de login
                this.showAuth();
            } else {
                // Modo offline - cargar datos locales
                this.loadFromLocalStorage();
                this.checkInitialScreen();
            }
        });
    }

    /**
     * @method checkInitialScreen
     * @description Determina qué pantalla mostrar al inicio (Home o Welcome) basándose en el historial del usuario.
     * También verifica el estado de los objetivos diarios.
     */
    checkInitialScreen() {
        if (this.hasSeenWelcome) {
            this.showHome();
        } else {
            this.showWelcome();
        }
        this.checkDailyGoals();
    }

    /**
     * @async
     * @method loadFromFirebase
     * @description Carga objetivos y configuraciones desde Firestore.
     * Si falla, hace fallback a almacenamiento local.
     * @throws {Error} Si hay problemas de red o permisos.
     */
    async loadFromFirebase() {
        try {
            this.goals = await this.firebaseService.getGoals();
            this.settings = await this.firebaseService.getSettings();
            this.applyTheme();
            this.applyStyle();
        } catch (error) {
            console.error('Error al cargar datos de Firebase:', error);
            this.loadFromLocalStorage();
        }
    }

    /**
     * @method loadFromLocalStorage
     * @description Carga datos persistidos en el navegador cuando no hay conexión o sesión.
     * Recupera objetivos y configuraciones, aplicando temas visuales.
     */
    loadFromLocalStorage() {
        const stored = localStorage.getItem('goals');
        this.goals = stored ? JSON.parse(stored) : [];
        
        const storedSettings = localStorage.getItem('settings');
        this.settings = storedSettings ? JSON.parse(storedSettings) : { dailyDescription: true, theme: 'light', heavyStyle: false };
        
        // Aplicar tema y estilo
        this.applyTheme();
        this.applyStyle();
    }

    /**
     * @method showWelcome
     * @description Renderiza la pantalla de bienvenida.
     */
    showWelcome() {
        this.currentScreen = 'welcome';
        const welcome = new WelcomeScreen(this);
        this.render(welcome.render());
    }

    /**
     * @method showGoalForm
     * @description Muestra el formulario para crear o editar un objetivo.
     * @param {?Object} [editGoal=null] - Objeto objetivo si se está editando, null si es nuevo.
     */
    showGoalForm(editGoal = null) {
        this.currentScreen = 'goalForm';
        this.currentGoal = editGoal;
        const form = new GoalForm(this, editGoal);
        this.render(form.render());
    }

    /**
     * @method showHome
     * @description Renderiza la pantalla principal (Dashboard).
     * @param {?string} [selectedGoalId=null] - ID del objetivo a pre-seleccionar.
     * @param {string} [viewType='dual'] - Tipo de vista ('dual', 'list', etc.).
     */
    showHome(selectedGoalId = null, viewType = 'dual') {
        this.currentScreen = 'home';
        this.selectedGoalId = selectedGoalId;
        const home = new Home(this, selectedGoalId, viewType);
        this.render(home.render());
    }

    /**
     * @method showGoalsList
     * @description Muestra la lista completa de objetivos.
     */
    showGoalsList() {
        this.currentScreen = 'goalsList';
        const list = new GoalsList(this);
        this.render(list.render());
    }

    /**
     * @method showAuth
     * @description Muestra la pantalla de autenticación (Login/Registro).
     * @param {boolean} [isLogin=true] - True para Login, False para Registro.
     */
    showAuth(isLogin = true) {
        this.currentScreen = 'auth';
        const auth = new AuthScreen(this, isLogin);
        this.render(auth.render());
    }

    /**
     * @method continueOffline
     * @description Activa el modo offline explícito, desconectando la sincronización con Firebase
     * y usando solo LocalStorage. Persiste la preferencia.
     */
    continueOffline() {
        this.isOfflineMode = true;
        localStorage.setItem('offlineMode', 'true');
        this.loadFromLocalStorage();
        this.checkInitialScreen();
    }

    /**
     * @async
     * @method handleAuthSuccess
     * @description Maneja la transición exitosa a un estado autenticado.
     * Desactiva modo offline, verifica datos locales para sincronización y carga datos remotos.
     */
    async handleAuthSuccess() {
        // Cambiar a modo online
        this.isOfflineMode = false;
        localStorage.removeItem('offlineMode');
        
        // Sincronizar datos locales con Firebase si existen
        const localGoals = localStorage.getItem('goals');
        if (localGoals) {
            const goals = JSON.parse(localGoals);
            if (goals.length > 0) {
                await this.showSyncModal(goals);
            }
        }
        
        // Cargar datos de Firebase
        await this.loadFromFirebase();
        this.checkInitialScreen();
    }

    /**
     * @async
     * @method showSyncModal
     * @description Muestra un modal preguntando al usuario si desea fusionar datos locales con la cuenta.
     * @param {Array<Object>} goals - Lista de objetivos locales a sincronizar.
     * @returns {Promise<boolean>} Resuelve true si se sincronizó, false si no.
     */
    async showSyncModal(goals) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>¿Sincronizar datos?</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <p>Se encontraron ${goals.length} objetivos locales. ¿Deseas sincronizarlos con tu cuenta de Firebase?</p>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn btn-secondary" id="syncYes">Sí, sincronizar</button>
                        <button class="btn btn-outline" id="syncNo">No, gracias</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.close-btn').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                    resolve(false);
                }
            });

            modal.querySelector('#syncYes').addEventListener('click', async () => {
                await this.firebaseService.syncLocalToFirebase(goals, this.settings);
                document.body.removeChild(modal);
                resolve(true);
            });

            modal.querySelector('#syncNo').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
        });
    }

    /**
     * @async
     * @method saveData
     * @description Persiste el estado actual (objetivos/configuración) en la capa de datos correspondiente.
     * Decide dinámicamente entre Firebase y LocalStorage según el estado de conexión.
     */
    async saveData() {
        if (!this.isOfflineMode && this.firebaseService.isAuthenticated()) {
            // Guardar en Firebase
            await this.firebaseService.saveSettings(this.settings);
        } else {
            // Guardar en localStorage
            localStorage.setItem('goals', JSON.stringify(this.goals));
            localStorage.setItem('settings', JSON.stringify(this.settings));
        }
    }

    /**
     * @method showSettings
     * @description Muestra la pantalla de configuración.
     */
    showSettings() {
        this.currentScreen = 'settings';
        const settings = new Settings(this);
        this.render(settings.render());
    }

    /**
     * @method render
     * @description Utilidad central para inyectar HTML en el contenedor principal de la aplicación.
     * @param {string} html - Cadena HTML a renderizar.
     */
    render(html) {
        document.getElementById('app').innerHTML = html;
    }

    /**
     * @method completeWelcome
     * @description Marca el tutorial de bienvenida como completado y redirige al Home.
     */
    completeWelcome() {
        localStorage.setItem('hasSeenWelcome', 'true');
        this.hasSeenWelcome = true;
        this.showHome();
    }

    /**
     * @method addGoal
     * @description Crea un nuevo objetivo, genera sus días de seguimiento y lo persiste.
     * @param {Object} goal - Objeto con datos del objetivo (título, fechas, etc.).
     */
    addGoal(goal) {
        goal.id = Date.now().toString();
        goal.days = this.generateDays(goal.startDate, goal.endDate);
        this.goals.push(goal);
        
        // Guardar
        if (!this.isOfflineMode && this.firebaseService.isAuthenticated()) {
            this.firebaseService.saveGoal(goal);
        } else {
            localStorage.setItem('goals', JSON.stringify(this.goals));
        }
        
        this.showHome(goal.id);
    }

    /**
     * @method updateGoal
     * @description Actualiza un objetivo existente. Maneja cambios de fecha que requieren regeneración de días.
     * @param {string} goalId - ID del objetivo a actualizar.
     * @param {Object} updatedGoal - Nuevos datos del objetivo.
     * @warning Si las fechas cambian, pide confirmación ya que se pierde el progreso diario.
     */
    updateGoal(goalId, updatedGoal) {
        const index = this.goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
            const oldGoal = this.goals[index];
            const datesChanged = oldGoal.startDate !== updatedGoal.startDate || 
                                oldGoal.endDate !== updatedGoal.endDate;
            
            if (datesChanged) {
                const confirmMsg = '⚠️ Al cambiar las fechas se perderá todo el progreso actual.\n\n¿Deseas continuar?';
                if (!confirm(confirmMsg)) {
                    this.showHome(goalId);
                    return;
                }
                updatedGoal.days = this.generateDays(updatedGoal.startDate, updatedGoal.endDate);
            } else {
                updatedGoal.days = oldGoal.days;
            }
            
            this.goals[index] = { ...oldGoal, ...updatedGoal };
            
            // Guardar
            if (!this.isOfflineMode && this.firebaseService.isAuthenticated()) {
                this.firebaseService.updateGoal(goalId, this.goals[index]);
            } else {
                localStorage.setItem('goals', JSON.stringify(this.goals));
            }
            
            this.showHome(goalId);
        }
    }

    /**
     * @method deleteGoal
     * @description Elimina un objetivo permanentemente del estado y persistencia.
     * @param {string} goalId - ID del objetivo a eliminar.
     */
    deleteGoal(goalId) {
        this.goals = this.goals.filter(g => g.id !== goalId);
        
        // Guardar
        if (!this.isOfflineMode && this.firebaseService.isAuthenticated()) {
            this.firebaseService.deleteGoal(goalId);
        } else {
            localStorage.setItem('goals', JSON.stringify(this.goals));
        }
        
        this.showGoalsList();
    }

    /**
     * @method toggleGoalVisibility
     * @description Alterna la visibilidad de un objetivo (soft delete / archivado).
     * @param {string} goalId - ID del objetivo.
     */
    toggleGoalVisibility(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.hidden = !goal.hidden;
            
            // Guardar
            if (!this.isOfflineMode && this.firebaseService.isAuthenticated()) {
                this.firebaseService.updateGoal(goalId, goal);
            } else {
                localStorage.setItem('goals', JSON.stringify(this.goals));
            }
        }
    }

    /**
     * @method applyTheme
     * @description Aplica el tema visual seleccionado (light/dark) al documento.
     */
    applyTheme() {
        document.body.setAttribute('data-theme', this.settings.theme || 'light');
    }

    /**
     * @method applyStyle
     * @description Aplica o remueve hojas de estilo adicionales (ej. heavy-style).
     */
    applyStyle() {
        const existingHeavy = document.getElementById('heavy-style');
        if (this.settings.heavyStyle) {
            if (!existingHeavy) {
                const link = document.createElement('link');
                link.id = 'heavy-style';
                link.rel = 'stylesheet';
                link.href = 'assets/heavy-style.css';
                document.head.appendChild(link);
            }
        } else {
            if (existingHeavy) {
                existingHeavy.remove();
            }
        }
    }

    /**
     * @method generateDays
     * @description Genera un array de objetos 'día' para el rango de fechas especificado.
     * Algoritmo clave para la estructura de seguimiento.
     * @param {string|Date} startDate - Fecha de inicio.
     * @param {string|Date} endDate - Fecha de fin.
     * @returns {Array<Object>} Array de objetos día inicializados en estado 'pending'.
     */
    generateDays(startDate, endDate) {
        const days = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            days.push({
                date: new Date(date).toISOString().split('T')[0],
                status: 'pending', // pending, completed, skipped, failed
                description: ''
            });
        }
        
        return days;
    }

    /**
     * @method markDay
     * @description Marca el estado de un día específico en un objetivo.
     * @param {string} goalId - ID del objetivo.
     * @param {string} dateStr - Fecha en formato YYYY-MM-DD.
     * @param {string} status - Nuevo estado ('completed', 'skipped', etc.).
     * @param {string} [description=''] - Nota opcional del día.
     */
    markDay(goalId, dateStr, status, description = '') {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            const day = goal.days.find(d => d.date === dateStr);
            if (day && day.status === 'pending') {
                day.status = status;
                day.description = description;
                
                // Guardar
                if (!this.isOfflineMode && this.firebaseService.isAuthenticated()) {
                    this.firebaseService.updateGoal(goalId, goal);
                } else {
                    localStorage.setItem('goals', JSON.stringify(this.goals));
                }
            }
        }
    }

    /**
     * @method getTodayString
     * @description Retorna la fecha actual en formato YYYY-MM-DD local.
     * @returns {string} Fecha actual.
     */
    getTodayString() {
        return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    }

    /**
     * @method checkDailyGoals
     * @description Verifica automáticamente los objetivos pasados que no fueron completados.
     * Marca como 'failed' los días anteriores a hoy que siguen 'pending'.
     * @critical Se ejecuta al inicio para mantener la consistencia de datos históricos.
     */
    checkDailyGoals() {
        const today = this.getTodayString();
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
        
        this.goals.forEach(goal => {
            if (!goal.hidden) {
                const yesterdayDay = goal.days.find(d => d.date === yesterday);
                if (yesterdayDay && yesterdayDay.status === 'pending') {
                    yesterdayDay.status = 'failed';
                }
            }
        });
        
        // Guardar
        if (!this.isOfflineMode && this.firebaseService.isAuthenticated()) {
            this.goals.forEach(goal => {
                this.firebaseService.updateGoal(goal.id, goal);
            });
        } else {
            localStorage.setItem('goals', JSON.stringify(this.goals));
        }
    }

    /**
     * @method getGoalProgress
     * @description Calcula las estadísticas de progreso de un objetivo.
     * @param {Object} goal - Objeto objetivo.
     * @returns {Object} { completed, total, percentage }
     */
    getGoalProgress(goal) {
        const completed = goal.days.filter(d => d.status === 'completed').length;
        const total = goal.days.length;
        return {
            completed,
            total,
            percentage: Math.round((completed / total) * 100)
        };
    }

    /**
     * @method getGoalStreak
     * @description Calcula la racha actual de días completados consecutivamente hasta hoy.
     * @param {Object} goal - Objeto objetivo.
     * @returns {number} Número de días en racha.
     */
    getGoalStreak(goal) {
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        
        for (let i = goal.days.length - 1; i >= 0; i--) {
            if (goal.days[i].date > today) continue;
            if (goal.days[i].status === 'completed') {
                streak++;
            } else if (goal.days[i].status !== 'skipped') {
                break;
            }
        }
        
        return streak;
    }
}

// Iniciar la aplicación
const app = new App();
window.app = app;