class MenuLateral {
    constructor() {
        // Seleciona todos os itens do menu lateral
        this.itensMenu = document.querySelectorAll('#sidebar .side-menu.top li a');
        // Seleciona o ícone do menu na barra de navegação
        this.botaoMenu = document.querySelector('#content nav .bx.bx-menu');
        // Seleciona a barra lateral
        this.barraLateral = document.getElementById('sidebar');
        this.inicializar();
    }

    // Inicializa os eventos do menu lateral
    inicializar() {
        // Adiciona evento de clique para cada item do menu
        this.itensMenu.forEach(item => {
            item.addEventListener('click', () => this.ativarItemMenu(item));
        });

        // Adiciona evento de clique para alternar a visibilidade da barra lateral
        this.botaoMenu.addEventListener('click', () => this.alternarBarraLateral());

        // Colapsa a barra lateral em telas pequenas (< 768px) ao carregar
        if (window.innerWidth < 768) {
            this.barraLateral.classList.add('hide');
        }
    }

    // Ativa o item de menu clicado e desativa os outros
    ativarItemMenu(item) {
        this.itensMenu.forEach(i => {
            i.parentElement.classList.remove('active');
        });
        item.parentElement.classList.add('active');
    }

    // Alterna a visibilidade da barra lateral
    alternarBarraLateral() {
        this.barraLateral.classList.toggle('hide');
    }
}

// Classe para gerenciar o menu lateral e o tema
class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.menuBtn = document.querySelector('#content nav .bx.bx-menu');
        this.switchMode = document.getElementById('switch-mode');
        this.themeIcon = document.querySelector('.theme-icon');
        
        this.initEventListeners();
        this.loadThemePreference();
    }
    
    initEventListeners() {
        // Toggle sidebar
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('hide');
                document.getElementById('content').classList.toggle('sidebar-open');
            });
        }
        
        // Toggle theme
        if (this.switchMode) {
            this.switchMode.addEventListener('change', () => {
                this.toggleTheme();
            });
        }
        
        // Responsive sidebar
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                this.sidebar.classList.add('hide');
                document.getElementById('content').classList.remove('sidebar-open');
            } else {
                this.sidebar.classList.remove('hide');
            }
        });
    }
    
    toggleTheme() {
        document.body.classList.toggle('dark');
        
        // Update theme icon
        if (document.body.classList.contains('dark')) {
            this.themeIcon.classList.replace('bx-sun', 'bx-moon');
            localStorage.setItem('theme', 'dark');
        } else {
            this.themeIcon.classList.replace('bx-moon', 'bx-sun');
            localStorage.setItem('theme', 'light');
        }
    }
    
    loadThemePreference() {
        // Check if theme preference exists in localStorage
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            this.themeIcon.classList.replace('bx-sun', 'bx-moon');
            if (this.switchMode) this.switchMode.checked = true;
        } else {
            document.body.classList.remove('dark');
            this.themeIcon.classList.replace('bx-moon', 'bx-sun');
            if (this.switchMode) this.switchMode.checked = false;
        }
    }
}

// Script para garantir a persistência do tema entre páginas
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se existe preferência de tema salva
    const savedTheme = localStorage.getItem('theme');
    const switchMode = document.getElementById('switch-mode');
    const themeIcon = document.querySelector('.theme-icon');
    
    // Aplicar tema salvo
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        if (themeIcon) themeIcon.classList.replace('bx-sun', 'bx-moon');
        if (switchMode) switchMode.checked = true;
    } else {
        document.body.classList.remove('dark');
        if (themeIcon) themeIcon.classList.replace('bx-moon', 'bx-sun');
        if (switchMode) switchMode.checked = false;
    }
    
    // Adicionar event listener para alternar tema
    if (switchMode) {
        switchMode.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                if (themeIcon) themeIcon.classList.replace('bx-sun', 'bx-moon');
            } else {
                document.body.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                if (themeIcon) themeIcon.classList.replace('bx-moon', 'bx-sun');
            }
        });
    }

    // Initialize all dynamic content and form handlers
    loadAllCursos();
    loadAllTurmas();
    loadAllAlunos();
    loadDashboardStats();
    loadGradeHorarios();
});

// Function to show the correct tab and update the menu
function showTab(tabId) {
    const allTabContents = document.querySelectorAll('.tab-content');
    allTabContents.forEach(content => {
        content.classList.remove('active');
    });

    const allMenuItems = document.querySelectorAll('#sidebar .side-menu.top li');
    allMenuItems.forEach(item => {
        item.classList.remove('active');
    });

    const selectedTabContent = document.getElementById(tabId + '-tab');
    if (selectedTabContent) {
        selectedTabContent.classList.add('active');
    }

    const selectedMenuItem = document.querySelector(`#sidebar .side-menu.top li[data-tab="${tabId}"]`);
    if (selectedMenuItem) {
        selectedMenuItem.classList.add('active');
    }
}

// Event Listeners for menu clicks
document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('#sidebar .side-menu.top li');

    menuItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault(); 
            
            const tabId = item.getAttribute('data-tab');
            if (tabId) {
                window.history.pushState(null, '', '#' + tabId);
                showTab(tabId);
            }
        });
    });

    const initialTab = window.location.hash.substring(1);
    if (initialTab) {
        showTab(initialTab);
    } else {
        showTab('painel');
    }
});

// --- Dynamic Content Loading and Form Handlers ---

// Function to display messages (success/error)
function displayMessage(message, type) {
    const mainContent = document.querySelector('#content main');
    let messageDiv = document.querySelector('.message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        mainContent.prepend(messageDiv);
    }
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// --- CURSOS ---
const cursoForm = document.getElementById('curso-form');
if (cursoForm) {
    cursoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(cursoForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/cursos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                displayMessage(result.message, 'success');
                cursoForm.reset();
                loadAllCursos(); // Reload courses to update list
                loadCursoSelects(); // Reload course selects in other forms
            } else {
                displayMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao criar curso:', error);
            displayMessage('Erro ao conectar com o servidor.', 'error');
        }
    });
}

async function loadAllCursos() {
    try {
        const response = await fetch('/api/cursos');
        const cursos = await response.json();
        const listaCursosDiv = document.getElementById('lista-cursos');
        if (listaCursosDiv) {
            listaCursosDiv.innerHTML = '';
            cursos.forEach(curso => {
                const cursoItem = document.createElement('div');
                cursoItem.classList.add('curso-item');
                cursoItem.innerHTML = `
                    <h5>${curso.nome_do_curso}</h5>
                    <p>Início: ${curso.mes_inicio}/${curso.ano_inicio} | Duração: ${curso.duracao} meses</p>
                    <div class="item-actions">
                        <button class="btn-edit">Editar</button>
                        <button class="btn-delete" data-id="${curso.id}">Excluir</button>
                    </div>
                `;
                listaCursosDiv.appendChild(cursoItem);
            });

            // Add event listeners for delete buttons
            listaCursosDiv.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const cursoId = event.target.dataset.id;
                    if (confirm('Tem certeza que deseja excluir este curso?')) {
                        await deleteCurso(cursoId);
                    }
                });
            });
        }
        loadCursoSelects(); // Also load courses into select elements
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
    }
}

async function deleteCurso(cursoId) {
    try {
        const response = await fetch(`/api/cursos/${cursoId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            displayMessage(result.message, 'success');
            loadAllCursos();
            loadCursoSelects();
        } else {
            displayMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao deletar curso:', error);
        displayMessage('Erro ao conectar com o servidor.', 'error');
    }
}

async function loadCursoSelects() {
    try {
        const response = await fetch('/api/cursos');
        const cursos = await response.json();

        const cursoSelectEnrollment = document.getElementById('curso_select');
        const turmaCursoSelect = document.getElementById('turma-curso');
        const filtroCursoSelect = document.getElementById('filtro-curso');

        [cursoSelectEnrollment, turmaCursoSelect, filtroCursoSelect].forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">Selecione um curso</option>';
                cursos.forEach(curso => {
                    const option = document.createElement('option');
                    option.value = curso.id;
                    option.textContent = curso.nome_do_curso;
                    select.appendChild(option);
                });
            }
        });
    } catch (error) {
        console.error('Erro ao carregar selects de cursos:', error);
    }
}

// --- CICLOS ---

async function loadCiclosForTurma() {
    const turmaCursoSelect = document.getElementById('turma-curso');
    const turmaCicloSelect = document.getElementById('turma-ciclo');
    const novoCicloGroup = document.getElementById('novo-ciclo-group');
    
    // Clear previous options
    turmaCicloSelect.innerHTML = '<option value="">Selecione um ciclo</option><option value="new">Criar Novo Ciclo</option>';
    novoCicloGroup.style.display = 'none'; // Hide new cycle input by default

    const cursoId = turmaCursoSelect.value;
    if (!cursoId) return; // Only load cycles if a course is selected

    try {
        const response = await fetch('/api/ciclos');
        const ciclos = await response.json();
        
        ciclos.forEach(ciclo => {
            const option = document.createElement('option');
            option.value = ciclo.id;
            option.textContent = ciclo.nome_ciclo;
            turmaCicloSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar ciclos:', error);
    }
}

async function loadCiclosForEnrollment() {
    const cursoSelectEnrollment = document.getElementById('curso_select');
    const cicloSelectEnrollment = document.getElementById('ciclo_select_enrollment');
    const turmaSelectEnrollment = document.getElementById('turma_select_enrollment');

    // Clear previous options
    cicloSelectEnrollment.innerHTML = '<option value="">Selecione um ciclo</option>';
    turmaSelectEnrollment.innerHTML = '<option value="">Selecione uma turma</option>';

    const cursoId = cursoSelectEnrollment.value;
    if (!cursoId) return;

    try {
        const response = await fetch('/api/ciclos');
        const ciclos = await response.json();
        
        ciclos.forEach(ciclo => {
            const option = document.createElement('option');
            option.value = ciclo.id;
            option.textContent = ciclo.nome_ciclo;
            cicloSelectEnrollment.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar ciclos para inscrição:', error);
    }
}

// Event listener for "Criar Novo Ciclo" option
const turmaCicloSelect = document.getElementById('turma-ciclo');
if (turmaCicloSelect) {
    turmaCicloSelect.addEventListener('change', () => {
        const novoCicloGroup = document.getElementById('novo-ciclo-group');
        if (turmaCicloSelect.value === 'new') {
            novoCicloGroup.style.display = 'flex';
        } else {
            novoCicloGroup.style.display = 'none';
        }
    });
}

async function createNewCiclo(nomeCiclo) {
    try {
        const response = await fetch('/api/ciclos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome_ciclo: nomeCiclo })
        });
        const result = await response.json();
        if (result.success) {
            displayMessage(result.message, 'success');
            return result.id; // Return the ID of the newly created cycle
        } else {
            displayMessage(result.message, 'error');
            return null;
        }
    } catch (error) {
        console.error('Erro ao criar novo ciclo:', error);
        displayMessage('Erro ao conectar com o servidor.', 'error');
        return null;
    }
}

// --- TURMAS ---
const turmaForm = document.getElementById('turma-form');
if (turmaForm) {
    turmaForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const cursoId = document.getElementById('turma-curso').value;
        let cicloId = document.getElementById('turma-ciclo').value;
        const nomeTurma = document.getElementById('turma-nome').value;
        const limiteAlunos = document.getElementById('turma-limite').value;
        const dataInicio = document.getElementById('turma-data-inicio').value;
        const horarioInicio = document.getElementById('turma-horario-inicio').value;
        const horarioFim = document.getElementById('turma-horario-fim').value;
        const diasSemana = document.getElementById('turma-dias').value;

        if (cicloId === 'new') {
            const novoCicloNome = document.getElementById('novo-ciclo-nome').value;
            if (!novoCicloNome) {
                displayMessage('Por favor, insira o nome para o novo ciclo.', 'error');
                return;
            }
            cicloId = await createNewCiclo(novoCicloNome);
            if (!cicloId) { // If cycle creation failed
                return;
            }
        }

        const data = {
            curso_id: cursoId,
            ciclo_id: cicloId,
            nome_turma: nomeTurma,
            limite_alunos: limiteAlunos,
            data_inicio: dataInicio,
            horario_inicio: horarioInicio,
            horario_fim: horarioFim,
            dias_semana: diasSemana
        };

        try {
            const response = await fetch('/api/turmas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                displayMessage(result.message, 'success');
                turmaForm.reset();
                loadAllTurmas();
                loadCiclosForTurma(); // Reload cycles
                // Reset turma-ciclo select and hide new cycle input
                document.getElementById('turma-ciclo').value = '';
                document.getElementById('novo-ciclo-group').style.display = 'none';
            } else {
                displayMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao criar turma:', error);
            displayMessage('Erro ao conectar com o servidor.', 'error');
        }
    });
}

async function loadAllTurmas() {
    try {
        const response = await fetch('/api/turmas');
        const turmas = await response.json();
        const turmasListDiv = document.getElementById('turmas-list');
        const gradeHorariosBody = document.getElementById('grade-horarios');

        if (turmasListDiv) {
            turmasListDiv.innerHTML = '';
            turmas.forEach(turma => {
                const turmaCard = document.createElement('div');
                turmaCard.classList.add('turma-card');
                turmaCard.innerHTML = `
                    <div class="turma-header">
                        <h3>${turma.nome_turma} (${turma.ciclo_nome})</h3>
                        <div class="item-actions">
                            <button class="btn-edit">Editar</button>
                            <button class="btn-delete" data-id="${turma.id}">Excluir</button>
                        </div>
                    </div>
                    <div class="turma-info">
                        <div class="info-item">
                            <label>Curso:</label>
                            <span>${turma.curso_nome}</span>
                        </div>
                        <div class="info-item">
                            <label>Alunos:</label>
                            <span>${turma.alunos_inscritos} / ${turma.limite_alunos}</span>
                        </div>
                        <div class="info-item">
                            <label>Início:</label>
                            <span>${turma.data_inicio}</span>
                        </div>
                        <div class="info-item">
                            <label>Horário:</label>
                            <span>${turma.horario_inicio} - ${turma.horario_fim}</span>
                        </div>
                        <div class="info-item">
                            <label>Dias:</label>
                            <span>${turma.dias_semana}</span>
                        </div>
                    </div>
                    <div class="alunos-list">
                        <h4>Alunos na Turma:</h4>
                        <div id="alunos-turma-${turma.id}"></div>
                    </div>
                `;
                turmasListDiv.appendChild(turmaCard);
                // Placeholder for loading students into each turma card (not implemented in Flask yet)
                // loadAlunosForTurma(turma.id, `alunos-turma-${turma.id}`);
            });
        }
        
        // Update Grade de Horários
        if (gradeHorariosBody) {
            gradeHorariosBody.innerHTML = '';
            turmas.forEach(turma => {
                const row = document.createElement('tr');
                const status = turma.alunos_inscritos >= turma.limite_alunos ? 'Cheia' : 'Disponível';
                const statusClass = turma.alunos_inscritos >= turma.limite_alunos ? 'completed' : 'process'; // Use existing status classes
                row.innerHTML = `
                    <td>${turma.curso_nome}</td>
                    <td>${turma.ciclo_nome}</td>
                    <td>${turma.nome_turma}</td>
                    <td>${turma.horario_inicio} - ${turma.horario_fim}</td>
                    <td>${turma.dias_semana}</td>
                    <td>${turma.alunos_inscritos}</td>
                    <td>${turma.limite_alunos}</td>
                    <td><span class="status ${statusClass}">${status}</span></td>
                `;
                gradeHorariosBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar turmas:', error);
    }
}

async function loadTurmasForEnrollment() {
    const cursoId = document.getElementById('curso_select').value;
    const cicloId = document.getElementById('ciclo_select_enrollment').value;
    const turmaSelectEnrollment = document.getElementById('turma_select_enrollment');

    turmaSelectEnrollment.innerHTML = '<option value="">Selecione uma turma</option>';
    if (!cursoId || !cicloId) return;

    try {
        const response = await fetch(`/api/turmas/por_curso_ciclo?curso_id=${cursoId}&ciclo_id=${cicloId}`);
        const turmas = await response.json();
        
        turmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = `${turma.nome_turma} (Vagas: ${turma.limite_alunos})`;
            turmaSelectEnrollment.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar turmas para inscrição:', error);
    }
}


// --- ALUNOS ---
const inscricaoForm = document.getElementById('inscricao-form');
if (inscricaoForm) {
    inscricaoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(inscricaoForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/alunos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                displayMessage(result.message, 'success');
                inscricaoForm.reset();
                loadAllAlunos(); // Reload students list
                loadDashboardStats(); // Update dashboard counts
            } else {
                displayMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao inscrever aluno:', error);
            displayMessage('Erro ao conectar com o servidor.', 'error');
        }
    });
}

async function loadAllAlunos() {
    try {
        const response = await fetch('/api/alunos');
        const alunos = await response.json();
        const listaAlunosBody = document.getElementById('lista-alunos');
        if (listaAlunosBody) {
            listaAlunosBody.innerHTML = '';
            alunos.forEach(aluno => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${aluno.nome}</td>
                    <td>${aluno.cpf}</td>
                    <td>${aluno.telefone}</td>
                    <td>${aluno.curso}</td>
                    <td>${aluno.turma}</td>
                    <td>${aluno.data_inscricao.split(' ')[0]}</td>
                    <td>
                        <button class="btn-edit">Editar</button>
                        <button class="btn-delete" data-id="${aluno.id}">Excluir</button>
                    </td>
                `;
                listaAlunosBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
    }
}

async function filtrarAlunos() {
    // This is a placeholder. Actual filtering logic would be implemented in Flask or here with more complex client-side filtering.
    // For now, it just reloads all students.
    loadAllAlunos(); 
    displayMessage('Filtro aplicado (apenas um exemplo, sem lógica de filtro real ainda).', 'warning');
}

// --- DASHBOARD STATS ---
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/dashboard_stats');
        const stats = await response.json();

        document.getElementById('total-alunos').textContent = stats.total_alunos;
        document.getElementById('total-turmas').textContent = stats.total_turmas;
        document.getElementById('total-cursos').textContent = stats.total_cursos;

        const turmasPopularesBody = document.getElementById('turmas-populares');
        if (turmasPopularesBody) {
            turmasPopularesBody.innerHTML = '';
            stats.turmas_populares.forEach(turma => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${turma.nome}</td>
                    <td>${turma.alunos}</td>
                    <td><span class="status ${turma.alunos >= turma.limite ? 'completed' : 'process'}">${turma.limite}</span></td>
                `;
                turmasPopularesBody.appendChild(row);
            });
        }

        const cursosPopularesBody = document.getElementById('cursos-populares');
        if (cursosPopularesBody) {
            cursosPopularesBody.innerHTML = '';
            stats.cursos_populares.forEach(curso => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${curso.nome}</td>
                    <td>${curso.total_alunos}</td>
                `;
                cursosPopularesBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas do dashboard:', error);
    }
}

// --- GRADE DE HORÁRIOS ---
async function loadGradeHorarios() {
    // This function now just calls loadAllTurmas to populate the grade table, as loadAllTurmas already handles it.
    // If 'Grade de Horários' needs different data or presentation, this function would fetch its own data.
    loadAllTurmas(); 
}

// Initial loads on page load
document.addEventListener('DOMContentLoaded', () => {
    // Instancia as classes para ativar as funcionalidades
    const menuLateral = new MenuLateral();
    const sidebarManager = new SidebarManager(); // Renamed to avoid conflict if you had an AlternadorTema

    // Load initial data for all tabs that need it
    loadAllCursos(); // For 'Horários' tab and select dropdowns
    loadAllTurmas(); // For 'Turmas' tab and 'Grade de Horários' tab
    loadAllAlunos(); // For 'Alunos' tab
    loadDashboardStats(); // For 'Painel Geral' tab
    loadCiclosForTurma(); // Load cycles when 'Horários' tab is initially shown or interacted with
});