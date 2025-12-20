export class CalendarView {
    constructor(app, goal, viewType = 'dual') {
        this.app = app;
        this.goal = goal;
        this.viewType = viewType;
        this.startDate = new Date(goal.startDate);
        this.endDate = new Date(goal.endDate);
    }

    render() {
        const progress = this.app.getGoalProgress(this.goal);
        const streak = this.app.getGoalStreak(this.goal);

        return `
            <div class="calendar-view">
                <div class="view-header">
                    <h2>${this.goal.title}</h2>
                </div>
                
                ${this.goal.description ? `
                    <p style="color: var(--text-light); margin-bottom: 20px;">
                        ${this.goal.description}
                    </p>
                ` : ''}

                ${this.renderStats(progress, streak)}
                ${this.renderViewSwitcher()}
                ${this.renderViewContent()}
            </div>
        `;
    }

    renderStats(progress, streak) {
        return `
            <div class="stats-container">
                <h3 style="margin-bottom: 10px;">Tu progreso</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${progress.percentage}%</div>
                        <div class="stat-label">Completado</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${streak}</div>
                        <div class="stat-label">Racha actual</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${progress.completed}</div>
                        <div class="stat-label">Días logrados</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${progress.total - progress.completed}</div>
                        <div class="stat-label">Días restantes</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderViewSwitcher() {
        return `
            <div class="view-switcher">
                <button class="view-btn ${this.viewType === 'dual' ? 'active' : ''}" data-view="dual">
                    Dual
                </button>
                <button class="view-btn ${this.viewType === 'bar' ? 'active' : ''}" data-view="bar">
                    Barra
                </button>
                <button class="view-btn ${this.viewType === 'single' ? 'active' : ''}" data-view="single">
                    Simple
                </button>
            </div>
        `;
    }

    renderViewContent() {
        switch (this.viewType) {
            case 'dual':
                return this.renderDualView();
            case 'bar':
                return this.renderBarView();
            case 'single':
                return this.renderSingleView();
            default:
                return this.renderDualView();
        }
    }

    renderDualView() {
        const startMonth = this.getMonthData(this.startDate);
        const endMonth = this.getMonthData(this.endDate);

        return `
            <div>
                <h3 style="margin: 20px 0 10px 0; text-align: center;">Mes de inicio</h3>
                ${this.renderCalendar(startMonth, this.startDate)}
                
                <h3 style="margin: 30px 0 10px 0; text-align: center;">Mes de finalización</h3>
                ${this.renderCalendar(endMonth, this.endDate)}
            </div>
        `;
    }

    renderBarView() {
        const startMonth = this.getMonthData(this.startDate);
        const progress = this.app.getGoalProgress(this.goal);

        return `
            <div>
                <h3 style="margin: 20px 0 10px 0; text-align: center;">Mes de inicio</h3>
                ${this.renderCalendar(startMonth, this.startDate)}
                ${this.renderProgressBar(progress)}
            </div>
        `;
    }

    renderSingleView() {
        const startMonth = this.getMonthData(this.startDate);
        const progress = this.app.getGoalProgress(this.goal);

        return `
            <div>
                ${this.renderCalendar(startMonth, this.startDate)}
                ${this.renderProgressBar(progress)}
            </div>
        `;
    }

    renderProgressBar(progress) {
        return `
            <div class="progress-container">
                <div class="progress-info">
                    <span>${progress.completed} / ${progress.total} días</span>
                    <span>${progress.percentage}%</span>
                </div>
                <div class="progress-bar-container">
                    <div 
                        class="progress-bar" 
                        style="width: ${progress.percentage}%; background-color: ${this.goal.color};"
                    >
                        ${progress.percentage > 10 ? progress.percentage + '%' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getMonthData(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        return {
            year,
            month,
            monthName: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
            firstDay: firstDay.getDay(),
            daysInMonth: lastDay.getDate()
        };
    }

    renderCalendar(monthData, highlightDate) {
        const today = new Date().toISOString().split('T')[0];
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        let html = `
            <div class="calendar">
                <div class="calendar-header">${monthData.monthName}</div>
                <div class="calendar-grid">
                    ${days.map(day => `<div class="day-name">${day}</div>`).join('')}
        `;

        // Días vacíos antes del primer día del mes
        for (let i = 0; i < monthData.firstDay; i++) {
            html += '<div class="day empty"></div>';
        }

        // Días del mes
        for (let day = 1; day <= monthData.daysInMonth; day++) {
            const date = new Date(monthData.year, monthData.month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = this.goal.days.find(d => d.date === dateStr);
            
            let className = 'day';
            let style = '';
            
            if (dateStr === today) {
                className += ' today';
            }

            if (dayData) {
                if (dayData.status === 'completed') {
                    className += ' completed';
                    style = `background-color: ${this.goal.color};`;
                } else if (dayData.status === 'pending' && dateStr <= today) {
                    className += ' pending';
                    style = `border-color: ${this.goal.color}; color: ${this.goal.color};`;
                } else if (dayData.status === 'pending') {
                    className += ' pending';
                    const rgb = this.hexToRgb(this.goal.color);
                    style = `background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3); color: ${this.goal.color};`;
                } else if (dayData.status === 'skipped') {
                    className += ' skipped';
                } else if (dayData.status === 'failed') {
                    className += ' failed';
                }
            }

            html += `<div class="${className}" style="${style}" data-date="${dateStr}">${day}</div>`;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
}