import { WelcomeScreen } from './welcome.js';
import { GoalForm } from './goalForm.js';
import { Home } from './home.js';
import { GoalsList } from './goalsList.js';
import { CalendarView } from './calendarView.js';
import { Settings } from './settings.js';
import { AuthScreen } from './auth.js';
import { firebaseService } from './firebase.js';

class App {
    constructor() {
        this.currentScreen = 'loading';
        this.currentGoal = null;
        this.goals = [];
        this.hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
        this.settings = { dailyDescription: true };
        this.selectedGoalId = null;
        this.firebaseService = firebaseService;
        this.isOfflineMode = localStorage.getItem('offlineMode') === 'true';
        this.init();
    }

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

    checkInitialScreen() {
        if (this.hasSeenWelcome) {
            this.showHome();
        } else {
            this.showWelcome();
        }
        this.checkDailyGoals();
    }

    async loadFromFirebase() {
        try {
            this.goals = await this.firebaseService.getGoals();
            this.settings = await this.firebaseService.getSettings();
        } catch (error) {
            console.error('Error al cargar datos de Firebase:', error);
            this.loadFromLocalStorage();
        }
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('goals');
        this.goals = stored ? JSON.parse(stored) : [];
        
        const storedSettings = localStorage.getItem('settings');
        this.settings = storedSettings ? JSON.parse(storedSettings) : { dailyDescription: true };
    }

    showWelcome() {
        this.currentScreen = 'welcome';
        const welcome = new WelcomeScreen(this);
        this.render(welcome.render());
    }

    showGoalForm(editGoal = null) {
        this.currentScreen = 'goalForm';
        this.currentGoal = editGoal;
        const form = new GoalForm(this, editGoal);
        this.render(form.render());
    }

    showHome(selectedGoalId = null, viewType = 'dual') {
        this.currentScreen = 'home';
        this.selectedGoalId = selectedGoalId;
        const home = new Home(this, selectedGoalId, viewType);
        this.render(home.render());
    }

    showGoalsList() {
        this.currentScreen = 'goalsList';
        const list = new GoalsList(this);
        this.render(list.render());
    }

    showAuth(isLogin = true) {
        this.currentScreen = 'auth';
        const auth = new AuthScreen(this, isLogin);
        this.render(auth.render());
    }

    continueOffline() {
        this.isOfflineMode = true;
        localStorage.setItem('offlineMode', 'true');
        this.loadFromLocalStorage();
        this.checkInitialScreen();
    }

    async handleAuthSuccess() {
        // Sincronizar datos locales con Firebase si existen
        const localGoals = localStorage.getItem('goals');
        if (localGoals) {
            const goals = JSON.parse(localGoals);
            if (goals.length > 0) {
                const syncConfirm = confirm('¿Deseas sincronizar tus objetivos locales con tu cuenta?');
                if (syncConfirm) {
                    await this.firebaseService.syncLocalToFirebase(goals, this.settings);
                }
            }
        }
        
        // Cargar datos de Firebase
        await this.loadFromFirebase();
        this.checkInitialScreen();
    }

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

    showSettings() {
        this.currentScreen = 'settings';
        const settings = new Settings(this);
        this.render(settings.render());
    }

    render(html) {
        document.getElementById('app').innerHTML = html;
    }

    completeWelcome() {
        localStorage.setItem('hasSeenWelcome', 'true');
        this.hasSeenWelcome = true;
        this.showHome();
    }

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

    checkDailyGoals() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
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

    getGoalProgress(goal) {
        const completed = goal.days.filter(d => d.status === 'completed').length;
        const total = goal.days.length;
        return {
            completed,
            total,
            percentage: Math.round((completed / total) * 100)
        };
    }

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