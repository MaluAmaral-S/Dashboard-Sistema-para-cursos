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
});


// Instancia as classes para ativar as funcionalidades
const menuLateral = new MenuLateral();
const alternadorTema = new AlternadorTema();
const gerenciadorSimulados = new GerenciadorSimulados();