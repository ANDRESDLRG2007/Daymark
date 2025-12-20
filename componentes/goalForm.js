export class GoalForm {
    constructor(app, editGoal = null) {
        this.app = app;
        this.editGoal = editGoal;
        this.selectedColor = editGoal ? editGoal.color : '#4a90e2';
        this.colors = [
            '#4a90e2', '#e74c3c', '#2ecc71', '#f39c12', 
            '#9b59b6', '#1abc9c', '#e67e22', '#3498db',
            '#e91e63', '#00bcd4'
        ];
    }

    render() {
        const title = this.editGoal ? 'Editar Objetivo' : 'Nuevo Objetivo';
        const goal = this.editGoal || { title: '', description: '', startDate: '', endDate: '' };
        
        setTimeout(() => this.attachEvents(), 0);
        
        return `
            <div class="container">
                <div class="goal-form">
                    <h2>${title}</h2>
                    
                    <div class="form-group">
                        <label for="goalTitle">Título del objetivo *</label>
                        <input 
                            type="text" 
                            id="goalTitle" 
                            placeholder="Ej: Hacer ejercicio"
                            value="${goal.title}"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="goalDescription">Descripción (opcional)</label>
                        <textarea 
                            id="goalDescription" 
                            placeholder="Ej: Hacer ejercicio con mi hermana"
                        >${goal.description}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="startDate">Día de inicio del objetivo *</label>
                        <input 
                            type="date" 
                            id="startDate" 
                            value="${goal.startDate}"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="endDate">Día de finalización del objetivo *</label>
                        <input 
                            type="date" 
                            id="endDate" 
                            value="${goal.endDate}"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label>Definir color</label>
                        <div class="color-selector">
                            ${this.colors.map(color => `
                                <div 
                                    class="color-option ${color === this.selectedColor ? 'selected' : ''}" 
                                    style="background-color: ${color}"
                                    data-color="${color}"
                                ></div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <button class="btn btn-secondary" id="submitGoal">
                        ${this.editGoal ? 'Actualizar' : 'Continuar'}
                    </button>
                    
                    <button class="btn" id="cancelEdit" style="background: var(--gray-color); color: white; margin-top: 10px;">
                        Volver al inicio
                    </button>
                </div>
            </div>
        `;
    }

    attachEvents() {
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedColor = e.target.dataset.color;
            });
        });

        document.getElementById('submitGoal').addEventListener('click', () => {
            this.handleSubmit();
        });

        const cancelBtn = document.getElementById('cancelEdit');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.app.showHome(this.editGoal?.id);
            });
        }
    }

    handleSubmit() {
        const title = document.getElementById('goalTitle').value.trim();
        const description = document.getElementById('goalDescription').value.trim();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!title || !startDate || !endDate) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('La fecha de inicio no puede ser posterior a la fecha de finalización');
            return;
        }

        const goalData = {
            title,
            description,
            startDate,
            endDate,
            color: this.selectedColor,
            hidden: false
        };

        if (this.editGoal) {
            this.app.updateGoal(this.editGoal.id, goalData);
        } else {
            this.app.addGoal(goalData);
        }
    }
}