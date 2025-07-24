class MenuLateral {
    constructor() {
        this.itensMenu = document.querySelectorAll('#sidebar .side-menu.top li a');
        this.botaoMenu = document.querySelector('#content nav .bx.bx-menu');
        this.barraLateral = document.getElementById('sidebar');
        this.inicializar();
    }
    inicializar() {
        this.itensMenu.forEach(item => {
            item.addEventListener('click', () => this.ativarItemMenu(item));
        });
        if (this.botaoMenu) {
            this.botaoMenu.addEventListener('click', () => this.alternarBarraLateral());
        }
        if (window.innerWidth < 768) {
            this.barraLateral.classList.add('hide');
        }
    }
    ativarItemMenu(item) {
        this.itensMenu.forEach(i => {
            i.parentElement.classList.remove('active');
        });
        item.parentElement.classList.add('active');
    }
    alternarBarraLateral() {
        this.barraLateral.classList.toggle('hide');
    }
}

class ThemeManager {
    constructor() {
        this.switchMode = document.getElementById('switch-mode');
        this.init();
    }
    init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            if (this.switchMode) this.switchMode.checked = true;
        }

        if (this.switchMode) {
            this.switchMode.addEventListener('change', () => {
                if (this.switchMode.checked) {
                    document.body.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.body.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                }
            });
        }
    }
}

// Lista de ícones pré-definidos com foco em tecnologia e usando as 3 classes de cores
const ICONS_PREDEFINIDOS = [
    { name: 'Programação', class: 'bx bx-code-alt', colorClass: 'prog-icon' }, // Amarelo
    { name: 'Base de Dados', class: 'bx bxs-data', colorClass: 'info-icon' }, // Laranja
    { name: 'Redes', class: 'bx bx-git-branch', colorClass: 'ai-icon' }, // Azul
    { name: 'Inteligência Artificial', class: 'bx bxs-brain', colorClass: 'prog-icon' }, // Amarelo
    { name: 'Design Gráfico', class: 'bx bxs-paint', colorClass: 'info-icon' }, // Laranja
    { name: 'Robótica', class: 'bx bxs-bot', colorClass: 'ai-icon' }, // Azul
    { name: 'Edição de Vídeo', class: 'bx bxs-video-recording', colorClass: 'prog-icon' }, // Amarelo
    { name: 'Segurança', class: 'bx bxs-shield-x', colorClass: 'info-icon' }, // Laranja
    { name: 'Hardware', class: 'bx bxs-chip', colorClass: 'ai-icon' }, // Azul
];


function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('#sidebar .side-menu.top li').forEach(item => item.classList.remove('active'));
    
    const selectedTab = document.getElementById(tabId + '-tab');
    if (selectedTab) selectedTab.classList.add('active');
    
    const selectedMenuItem = document.querySelector(`#sidebar .side-menu.top li[data-tab="${tabId}"]`);
    if (selectedMenuItem) selectedMenuItem.classList.add('active');
}

function displayMessage(message, type) {
    const mainContent = document.querySelector('#content main');
    let messageDiv = document.querySelector('.message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        mainContent.prepend(messageDiv);
    }
    messageDiv.className = 'message ' + type;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
}

// --- LÓGICA DE CURSOS ---
async function loadAllCursos() {
    try {
        const response = await fetch('/api/cursos');
        const cursos = await response.json();
        
        const listaCursosHorarios = document.getElementById('lista-cursos-botoes');
        const listaCursosTurmas = document.getElementById('lista-cursos-turmas');
        const selectsDeCurso = document.querySelectorAll('#ciclo-curso-select, #curso_select, #filtro-curso');
        
        if (listaCursosHorarios) listaCursosHorarios.innerHTML = '';
        if (listaCursosTurmas) listaCursosTurmas.innerHTML = '';

        cursos.forEach(curso => {
            const cursoHTML = `
                <button class="curso-btn styled-btn">
                    <span class="curso-icon ${curso.icone_cor_classe || ''}"><i class='${curso.icone || 'bx bx-question-mark'}'></i></span>
                    <span class="curso-text">${curso.nome_do_curso}</span>
                </button>
            `;

            // Adiciona na aba Horários (com botão de excluir)
            if (listaCursosHorarios) {
                const cursoItemHorarios = document.createElement('li');
                cursoItemHorarios.classList.add('curso-btn-item');
                cursoItemHorarios.innerHTML = cursoHTML + `<button class="btn-delete" data-id="${curso.id}" title="Excluir Curso">X</button>`;
                listaCursosHorarios.appendChild(cursoItemHorarios);
            }

            // Adiciona na aba Turmas com evento para abrir o modal
            if (listaCursosTurmas) {
                const cursoItemTurmas = document.createElement('li');
                cursoItemTurmas.innerHTML = cursoHTML.replace('<button class="', `<button data-id="${curso.id}" data-nome="${curso.nome_do_curso}" class="`);
                
                cursoItemTurmas.querySelector('.curso-btn').addEventListener('click', (event) => {
                    const targetButton = event.currentTarget;
                    const cursoId = targetButton.dataset.id;
                    const cursoNome = targetButton.dataset.nome;
                    abrirModalDetalhesTurma(cursoId, cursoNome);
                });

                listaCursosTurmas.appendChild(cursoItemTurmas);
            }
        });

        // Adiciona evento de exclusão APENAS para a lista da aba Horários
        if (listaCursosHorarios) {
            listaCursosHorarios.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    const cursoId = event.target.dataset.id;
                    if (confirm('Tem certeza que deseja excluir este curso? Todos os ciclos, turmas e inscrições associados serão perdidos!')) {
                        await deleteCurso(cursoId);
                    }
                });
            });
        }
        
        // Popula os menus dropdown
        selectsDeCurso.forEach(select => {
            if (select) {
                const currentVal = select.value;
                select.innerHTML = `<option value="">Selecione um curso</option>`;
                cursos.forEach(curso => {
                    const option = document.createElement('option');
                    option.value = curso.id;
                    option.textContent = curso.nome_do_curso;
                    select.appendChild(option);
                });
                select.value = currentVal;
            }
        });

    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
    }
}

async function handleCursoFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.icone) {
        displayMessage('Por favor, selecione um ícone para o curso.', 'error');
        return;
    }

    try {
        const response = await fetch('/cursos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            displayMessage(result.message, 'success');
            form.reset();
            document.getElementById('icone-preview').innerHTML = `<i class='bx bx-question-mark'></i>`;
            loadAllCursos();
        } else {
            displayMessage(result.message, 'error');
        }
    } catch (error) {
        displayMessage('Erro de conexão ao criar curso.', 'error');
    }
}

async function deleteCurso(cursoId) {
    try {
        const response = await fetch(`/api/cursos/${cursoId}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            displayMessage(result.message, 'success');
            loadAllCursos();
            loadAllCiclos();
            loadAllTurmas();
        } else {
            displayMessage(result.message, 'error');
        }
    } catch (error) {
        displayMessage('Erro de conexão ao deletar curso.', 'error');
    }
}

function setupIconModal() {
    const modal = document.getElementById('icone-modal');
    if (!modal) return;

    const openBtn = document.getElementById('btn-selecionar-icone');
    const closeBtn = document.getElementById('modal-close-btn');
    const iconGrid = document.getElementById('icone-grid');
    const hiddenInputIcon = document.getElementById('curso-icone');
    const hiddenInputColor = document.getElementById('curso-icone-cor');
    const preview = document.getElementById('icone-preview');

    iconGrid.innerHTML = '';
    ICONS_PREDEFINIDOS.forEach(icon => {
        const item = document.createElement('div');
        item.classList.add('icone-item');
        item.dataset.iconClass = icon.class;
        item.dataset.colorClass = icon.colorClass;
        item.innerHTML = `
            <i class='${icon.class}'></i>
            <span>${icon.name}</span>
        `;
        item.addEventListener('click', () => {
            hiddenInputIcon.value = icon.class;
            hiddenInputColor.value = icon.colorClass;
            preview.innerHTML = `<i class='${icon.class}'></i>`;
            modal.classList.add('hidden');
        });
        iconGrid.appendChild(item);
    });

    openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

// --- LÓGICA DE CICLOS ---
async function loadAllCiclos() {
    try {
        const response = await fetch('/api/ciclos');
        const ciclos = await response.json();
        
        const listaCiclosDiv = document.getElementById('lista-ciclos');
        const turmaCicloSelect = document.getElementById('turma-ciclo-select');

        if (listaCiclosDiv) {
            listaCiclosDiv.innerHTML = '';
            ciclos.forEach(ciclo => {
                const cicloItem = document.createElement('div');
                cicloItem.classList.add('ciclo-item');
                cicloItem.innerHTML = `
                    <div class="item-info">
                        <h5>${ciclo.nome_ciclo}</h5>
                        <p>Curso: ${ciclo.curso_nome}</p>
                    </div>
                    <button class="btn-delete" data-id="${ciclo.id}" title="Excluir Ciclo">Excluir</button>
                `;
                listaCiclosDiv.appendChild(cicloItem);
            });

            listaCiclosDiv.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const cicloId = event.target.dataset.id;
                    if (confirm('Tem certeza que deseja excluir este ciclo? As turmas associadas também serão removidas.')) {
                        await deleteCiclo(cicloId);
                    }
                });
            });
        }
        
        if (turmaCicloSelect) {
            const currentVal = turmaCicloSelect.value;
            turmaCicloSelect.innerHTML = `<option value="">Selecione um ciclo</option>`;
            ciclos.forEach(ciclo => {
                const option = document.createElement('option');
                option.value = ciclo.id;
                option.textContent = `${ciclo.nome_ciclo} (${ciclo.curso_nome})`;
                option.dataset.cursoId = ciclo.curso_id;
                turmaCicloSelect.appendChild(option);
            });
            turmaCicloSelect.value = currentVal;
        }

    } catch (error) {
        console.error('Erro ao carregar ciclos:', error);
    }
}

async function deleteCiclo(cicloId) {
    try {
        const response = await fetch(`/api/ciclos/${cicloId}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            displayMessage(result.message, 'success');
            loadAllCiclos();
            loadAllTurmas();
        } else {
            displayMessage(result.message, 'error');
        }
    } catch (error) {
        displayMessage('Erro de conexão ao deletar ciclo.', 'error');
    }
}

async function handleCicloFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.curso_id) {
        displayMessage('Por favor, selecione um curso para criar o ciclo.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/ciclos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            displayMessage(result.message, 'success');
            form.reset();
            loadAllCiclos();
        } else {
            displayMessage(result.message, 'error');
        }
    } catch (error) {
        displayMessage('Erro de conexão ao criar ciclo.', 'error');
    }
}

// --- LÓGICA DE TURMAS ---
async function handleTurmaFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const cicloSelect = document.getElementById('turma-ciclo-select');
    const selectedOption = cicloSelect.options[cicloSelect.selectedIndex];
    if (selectedOption && selectedOption.dataset.cursoId) {
        data.curso_id = selectedOption.dataset.cursoId;
    } else if (!data.ciclo_id) {
         displayMessage('Por favor, selecione um ciclo.', 'error');
         return;
    } else {
        displayMessage('Ciclo inválido. Não foi possível encontrar o curso associado.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/turmas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            displayMessage(result.message, 'success');
            form.reset();
            loadAllTurmas();
            loadDashboardStats();
        } else {
            displayMessage(result.message, 'error');
        }
    } catch (error) {
        displayMessage('Erro de conexão ao criar turma.', 'error');
    }
}

async function loadAllTurmas() {
    try {
        const response = await fetch('/api/turmas');
        const turmas = await response.json();
        const gradeHorariosBody = document.getElementById('grade-horarios');
        
        if (gradeHorariosBody) {
            gradeHorariosBody.innerHTML = '';
            turmas.forEach(turma => {
                const row = document.createElement('tr');
                const status = turma.alunos_inscritos >= turma.limite_alunos ? 'Cheia' : 'Disponível';
                const statusClass = turma.alunos_inscritos >= turma.limite_alunos ? 'completed' : 'process';
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
    } catch (error) { console.error('Erro ao carregar turmas:', error); }
}

// --- LÓGICA DE INSCRIÇÃO DE ALUNOS ---
async function loadCiclosForEnrollment() {
    const cursoId = document.getElementById('curso_select').value;
    const cicloSelect = document.getElementById('ciclo_select_enrollment');
    const turmaSelect = document.getElementById('turma_select_enrollment');

    cicloSelect.innerHTML = '<option value="">Selecione um ciclo</option>';
    turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
    if (!cursoId) return;

    try {
        const response = await fetch(`/api/ciclos/por_curso?curso_id=${cursoId}`);
        const ciclos = await response.json();
        ciclos.forEach(ciclo => {
            const option = document.createElement('option');
            option.value = ciclo.id;
            option.textContent = ciclo.nome_ciclo;
            cicloSelect.appendChild(option);
        });
    } catch (error) { console.error('Erro ao carregar ciclos para inscrição:', error); }
}

async function loadTurmasForEnrollment() {
    const cursoId = document.getElementById('curso_select').value;
    const cicloId = document.getElementById('ciclo_select_enrollment').value;
    const turmaSelect = document.getElementById('turma_select_enrollment');

    turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
    if (!cursoId || !cicloId) return;

    try {
        const response = await fetch(`/api/turmas/por_curso_ciclo?curso_id=${cursoId}&ciclo_id=${cicloId}`);
        const turmas = await response.json();
        turmas.forEach(turma => {
            const vagas = turma.limite_alunos;
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = `${turma.nome_turma} (Vagas: ${vagas})`;
            turmaSelect.appendChild(option);
        });
    } catch (error) { console.error('Erro ao carregar turmas para inscrição:', error); }
}

async function handleInscricaoFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/alunos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            displayMessage(result.message, 'success');
            form.reset();
            loadAllAlunos();
            loadDashboardStats();
            loadAllTurmas();
        } else {
            displayMessage(result.message, 'error');
        }
    } catch (error) { displayMessage('Erro de conexão ao inscrever aluno.', 'error'); }
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
                    <td>${aluno.nome}</td><td>${aluno.cpf}</td><td>${aluno.telefone}</td>
                    <td>${aluno.curso}</td><td>${aluno.turma}</td><td>${new Date(aluno.data_inscricao).toLocaleDateString()}</td>
                    <td><button class="btn-edit">E</button><button class="btn-delete">X</button></td>`;
                listaAlunosBody.appendChild(row);
            });
        }
    } catch (error) { console.error('Erro ao carregar alunos:', error); }
}

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
            stats.turmas_populares.forEach(t => {
                turmasPopularesBody.innerHTML += `<tr><td>${t.nome}</td><td>${t.alunos}</td><td><span class="status process">${t.limite}</span></td></tr>`;
            });
        }
        const cursosPopularesBody = document.getElementById('cursos-populares');
        if (cursosPopularesBody) {
            cursosPopularesBody.innerHTML = '';
            stats.cursos_populares.forEach(c => {
                cursosPopularesBody.innerHTML += `<tr><td>${c.nome}</td><td>${c.total_alunos}</td></tr>`;
            });
        }
    } catch (error) { console.error('Erro ao carregar estatísticas:', error); }
}

function filtrarAlunos() {
    displayMessage('Funcionalidade de filtro ainda não implementada.', 'warning');
}

document.addEventListener('DOMContentLoaded', () => {
    new MenuLateral();
    new ThemeManager();

    document.querySelectorAll('#sidebar .side-menu.top li').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            if (tabId) {
                window.history.pushState({tabId}, '', `#${tabId}`);
                showTab(tabId);
            }
        });
    });

    const initialTab = window.location.hash.substring(1) || 'painel';
    showTab(initialTab);
    
    document.getElementById('curso-form')?.addEventListener('submit', handleCursoFormSubmit);
    document.getElementById('ciclo-form')?.addEventListener('submit', handleCicloFormSubmit);
    document.getElementById('turma-form')?.addEventListener('submit', handleTurmaFormSubmit);
    document.getElementById('inscricao-form')?.addEventListener('submit', handleInscricaoFormSubmit);
    
    setupIconModal();
    loadAllCursos();
    loadAllCiclos();
    loadAllTurmas();
    loadAllAlunos();
    loadDashboardStats();
});

// --- LÓGICA DO MODAL DE DETALHES DE TURMA (ATUALIZADO) ---

const modalDetalhes = document.getElementById('turma-details-modal');
const modalCloseBtn = document.getElementById('modal-details-close-btn');

const ciclosContainer = document.getElementById('modal-ciclos-container');
const turmasContainer = document.getElementById('modal-turmas-container');
const alunosContainer = document.getElementById('modal-alunos-container');

// Função principal para abrir e iniciar o modal
function abrirModalDetalhesTurma(cursoId, cursoNome) {
    document.getElementById('modal-curso-nome').textContent = `Detalhes de: ${cursoNome}`;
    
    ciclosContainer.style.display = 'block';
    turmasContainer.style.display = 'none';
    alunosContainer.style.display = 'none';

    document.getElementById('modal-lista-ciclos').innerHTML = '';
    document.getElementById('modal-lista-turmas').innerHTML = '';
    document.getElementById('modal-lista-alunos').innerHTML = '';

    modalDetalhes.classList.remove('hidden');
    carregarCiclosNoModal(cursoId);
}

// Carrega os ciclos do curso selecionado
async function carregarCiclosNoModal(cursoId) {
    const listaCiclos = document.getElementById('modal-lista-ciclos');
    listaCiclos.innerHTML = '<p>Carregando ciclos...</p>';
    document.querySelector('#modal-ciclos-container h4').innerHTML = "<i class='bx bx-layer'></i> 1. Selecione o Ciclo";

    try {
        const response = await fetch(`/api/ciclos/por_curso?curso_id=${cursoId}`);
        const ciclos = await response.json();
        listaCiclos.innerHTML = '';

        if (ciclos.length === 0) {
            listaCiclos.innerHTML = '<p>Nenhum ciclo cadastrado para este curso.</p>';
            return;
        }

        ciclos.forEach(ciclo => {
            const btn = document.createElement('button');
            btn.className = 'btn-modal-select';
            // ATUALIZAÇÃO: Adiciona ícone ao botão
            btn.innerHTML = `<i class='bx bxs-arrow-to-right'></i> ${ciclo.nome_ciclo}`;
            btn.onclick = () => carregarTurmasNoModal(cursoId, ciclo.id);
            listaCiclos.appendChild(btn);
        });
    } catch (error) {
        console.error('Erro ao buscar ciclos para o modal:', error);
        listaCiclos.innerHTML = '<p>Erro ao carregar os ciclos.</p>';
    }
}

// Carrega as turmas do ciclo selecionado
async function carregarTurmasNoModal(cursoId, cicloId) {
    ciclosContainer.style.display = 'none';
    turmasContainer.style.display = 'block';
    
    const listaTurmas = document.getElementById('modal-lista-turmas');
    listaTurmas.innerHTML = '<p>Carregando turmas...</p>';
    document.querySelector('#modal-turmas-container h4').innerHTML = "<i class='bx bx-chalkboard'></i> 2. Selecione a Turma";
    
    try {
        const response = await fetch(`/api/turmas/por_curso_ciclo?curso_id=${cursoId}&ciclo_id=${cicloId}`);
        const turmas = await response.json();
        listaTurmas.innerHTML = '';

        if (turmas.length === 0) {
            listaTurmas.innerHTML = '<p>Nenhuma turma cadastrada para este ciclo.</p>';
            return;
        }
        
        turmas.forEach(turma => {
            const btn = document.createElement('button');
            btn.className = 'btn-modal-select';
             // ATUALIZAÇÃO: Adiciona ícone ao botão
            btn.innerHTML = `<i class='bx bxs-arrow-to-right'></i> ${turma.nome_turma}`;
            btn.onclick = () => carregarAlunosNoModal(turma.id);
            listaTurmas.appendChild(btn);
        });
    } catch (error) {
        console.error('Erro ao buscar turmas para o modal:', error);
        listaTurmas.innerHTML = '<p>Erro ao carregar as turmas.</p>';
    }
}

// Carrega os alunos da turma selecionada
async function carregarAlunosNoModal(turmaId) {
    turmasContainer.style.display = 'none';
    alunosContainer.style.display = 'block';
    
    const listaAlunos = document.getElementById('modal-lista-alunos');
    listaAlunos.innerHTML = '<tr><td colspan="4">Carregando alunos...</td></tr>';
    document.querySelector('#modal-alunos-container h4').innerHTML = "<i class='bx bxs-group'></i> 3. Alunos Inscritos";

    try {
        const response = await fetch(`/api/alunos/por_turma?turma_id=${turmaId}`);
        const alunos = await response.json();
        listaAlunos.innerHTML = '';

        if (alunos.length === 0) {
            listaAlunos.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Nenhum aluno inscrito nesta turma.</td></tr>';
            return;
        }

        alunos.forEach(aluno => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${aluno.nome}</td>
                <td>${aluno.idade}</td>
                <td>${aluno.cpf}</td>
                <td>${aluno.telefone}</td>
            `;
            listaAlunos.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao buscar alunos para o modal:', error);
        listaAlunos.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Erro ao carregar a lista de alunos.</td></tr>';
    }
}

// Eventos para fechar o modal
modalCloseBtn.addEventListener('click', () => modalDetalhes.classList.add('hidden'));
modalDetalhes.addEventListener('click', (e) => {
    if (e.target === modalDetalhes) {
        modalDetalhes.classList.add('hidden');
    }
});