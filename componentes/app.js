import { WelcomeScreen } from './welcome.js';
import { GoalForm } from './goalForm.js';
import { Home } from './home.js';
import { GoalsList } from './goalsList.js';
import { CalendarView } from './calendarView.js';

class App {
    constructor() {
        this.currentScreen = 'welcome';
        this.currentGoal = null;
        this.goals = this.loadGoals();
        this.hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
        this.settings = this.loadSettings();
        this.init();
    }

    loadGoals() {
        const stored = localStorage.getItem('goals');
        return stored ? JSON.parse(stored) : [];
    }

    saveGoals() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }

    loadSettings() {
        const stored = localStorage.getItem('settings');
        return stored ? JSON.parse(stored) : {
            dailyDescription: true
        };
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    init() {
        if (this.hasSeenWelcome) {
            this.showHome();
        } else {
            this.showWelcome();
        }
        this.checkDailyGoals();
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

    showHome(selectedGoalId = null) {
        this.currentScreen = 'home';
        const home = new Home(this, selectedGoalId);
        this.render(home.render());
    }

    showGoalsList() {
        this.currentScreen = 'goalsList';
        const list = new GoalsList(this);
        this.render(list.render());
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
        this.saveGoals();
        this.showHome(goal.id);
    }

    updateGoal(goalId, updatedGoal) {
        const index = this.goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
            updatedGoal.days = this.generateDays(updatedGoal.startDate, updatedGoal.endDate);
            this.goals[index] = { ...this.goals[index], ...updatedGoal };
            this.saveGoals();
            this.showHome(goalId);
        }
    }

    deleteGoal(goalId) {
        this.goals = this.goals.filter(g => g.id !== goalId);
        this.saveGoals();
        this.showGoalsList();
    }

    toggleGoalVisibility(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.hidden = !goal.hidden;
            this.saveGoals();
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
                this.saveGoals();
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
        
        this.saveGoals();
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