// ============================================
// SISTEMA DE AUTENTICAÇÃO - VERSÃO SUPABASE
// ============================================

// Mostrar modal de login/cadastro
function mostrarModalAuth() {
    const modal = document.getElementById("modalAuth");
    if (modal) {
        modal.style.display = "flex";
        mostrarTelaLogin();
    }
}

function fecharModalAuth() {
    const modal = document.getElementById("modalAuth");
    if (modal) {
        modal.style.display = "none";
    }
}

// Mostrar tela de login
function mostrarTelaLogin() {
    const container = document.getElementById("authContainer");
    if (!container) return;
    
    container.innerHTML = `
        <div class="auth-tabs">
            <button class="auth-tab active" onclick="mostrarTelaLogin()">Entrar</button>
            <button class="auth-tab" onclick="mostrarTelaCadastro()">Cadastrar</button>
        </div>
        <div class="auth-form">
            <h3>🎮 Bem-vindo de volta!</h3>
            <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text" id="loginApelido" placeholder="Seu apelido" autocomplete="off">
            </div>
            <div class="input-group">
                <i class="fas fa-lock"></i>
                <input type="password" id="loginSenha" placeholder="Sua senha">
            </div>
            <button class="auth-btn" onclick="fazerLogin()">
                <i class="fas fa-sign-in-alt"></i> Entrar
            </button>
            <p class="auth-link" onclick="mostrarTelaCadastro()">Não tem conta? Cadastre-se</p>
        </div>
    `;
}

// Mostrar tela de cadastro
function mostrarTelaCadastro() {
    const container = document.getElementById("authContainer");
    if (!container) return;
    
    container.innerHTML = `
        <div class="auth-tabs">
            <button class="auth-tab" onclick="mostrarTelaLogin()">Entrar</button>
            <button class="auth-tab active" onclick="mostrarTelaCadastro()">Cadastrar</button>
        </div>
        <div class="auth-form">
            <h3>✨ Criar nova conta</h3>
            <div class="input-group">
                <i class="fas fa-user-circle"></i>
                <input type="text" id="cadastroNome" placeholder="Seu nome completo" autocomplete="off">
            </div>
            <div class="input-group">
                <i class="fas fa-tag"></i>
                <input type="text" id="cadastroApelido" placeholder="Apelido (aparece no ranking)" autocomplete="off">
            </div>
            <div class="input-group">
                <i class="fas fa-calendar-alt"></i>
                <input type="number" id="cadastroIdade" placeholder="Sua idade" min="5" max="120">
            </div>
            <div class="input-group">
                <i class="fas fa-lock"></i>
                <input type="password" id="cadastroSenha" placeholder="Criar senha (mínimo 3 caracteres)">
            </div>
            <div class="input-group">
                <i class="fas fa-check-circle"></i>
                <input type="password" id="cadastroConfirmarSenha" placeholder="Confirmar senha">
            </div>
            <button class="auth-btn" onclick="fazerCadastro()">
                <i class="fas fa-user-plus"></i> Cadastrar
            </button>
            <p class="auth-link" onclick="mostrarTelaLogin()">Já tem conta? Faça login</p>
        </div>
    `;
}

// Fazer login (ATUALIZADO COM SUPABASE)
async function fazerLogin() {
    const apelido = document.getElementById("loginApelido")?.value.trim();
    const senha = document.getElementById("loginSenha")?.value;
    
    if (!apelido || !senha) {
        mostrarToast("Preencha todos os campos!", "error");
        return;
    }
    
    let usuario = null;
    
    // Tentar login no Supabase primeiro
    if (typeof loginDB !== 'undefined' && supabaseClient) {
        mostrarToast("Conectando ao servidor...", "info");
        usuario = await loginDB(apelido, senha);
    }
    
    // Fallback para localStorage se Supabase falhar
    if (!usuario) {
        console.log("Tentando login local...");
        usuario = buscarUsuario(apelido, senha);
    }
    
    if (usuario) {
        salvarUsuarioAtual(usuario);
        fecharModalAuth();
        carregarUsuarioLogado();
        
        // Sincronizar dados com Supabase se disponível
        if (typeof sincronizarDadosLocais !== 'undefined' && supabaseClient) {
            await sincronizarDadosLocais(usuario);
        }
        
        mostrarToast(`Bem-vindo de volta, ${usuario.apelido}! 🎉`, "success");
        
        // Atualizar interface
        if (typeof carregarPontosDoUsuario !== 'undefined') {
            carregarPontosDoUsuario();
        }
        if (typeof atualizarRanking !== 'undefined') {
            atualizarRanking();
        }
        if (typeof atualizarEstatisticas !== 'undefined') {
            atualizarEstatisticas();
        }
    } else {
        mostrarToast("Apelido ou senha incorretos!", "error");
    }
}

// Fazer cadastro (ATUALIZADO COM SUPABASE)
async function fazerCadastro() {
    const nome = document.getElementById("cadastroNome")?.value.trim();
    const apelido = document.getElementById("cadastroApelido")?.value.trim();
    const idade = document.getElementById("cadastroIdade")?.value;
    const senha = document.getElementById("cadastroSenha")?.value;
    const confirmarSenha = document.getElementById("cadastroConfirmarSenha")?.value;
    
    // Validações
    if (!nome || !apelido || !idade || !senha) {
        mostrarToast("Preencha todos os campos!", "error");
        return;
    }
    
    if (senha !== confirmarSenha) {
        mostrarToast("As senhas não coincidem!", "error");
        return;
    }
    
    if (senha.length < 3) {
        mostrarToast("A senha deve ter pelo menos 3 caracteres!", "error");
        return;
    }
    
    const idadeNum = parseInt(idade);
    if (isNaN(idadeNum) || idadeNum < 5 || idadeNum > 120) {
        mostrarToast("Digite uma idade válida (5 a 120 anos)!", "error");
        return;
    }
    
    // Verificar se apelido tem caracteres especiais
    if (!/^[a-zA-Z0-9_\s]+$/.test(apelido)) {
        mostrarToast("Apelido só pode ter letras, números e espaços!", "error");
        return;
    }
    
    const novoUsuario = {
        nome: nome,
        apelido: apelido,
        idade: idadeNum,
        senha: senha,
        pontos: 0,
        titulo: '🌿 Iniciante Saudável',
        quizzes_completados: [],
        dataCriacao: new Date().toISOString()
    };
    
    let resultado;
    
    // Tentar salvar no Supabase primeiro
    if (typeof salvarUsuarioDB !== 'undefined' && supabaseClient) {
        mostrarToast("Conectando ao servidor...", "info");
        resultado = await salvarUsuarioDB(novoUsuario);
    } else {
        // Fallback para localStorage
        console.log("Usando armazenamento local...");
        resultado = salvarUsuario(novoUsuario);
    }
    
    if (resultado.sucesso) {
        // Salvar localmente também para acesso offline
        const usuarioLocal = { 
            ...novoUsuario, 
            id: resultado.dados?.id || Date.now() 
        };
        salvarUsuarioAtual(usuarioLocal);
        
        fecharModalAuth();
        carregarUsuarioLogado();
        mostrarToast(`Conta criada com sucesso! Bem-vindo, ${apelido}! 🎉`, "success");
        
        // Atualizar interface
        if (typeof atualizarRanking !== 'undefined') {
            atualizarRanking();
        }
        if (typeof atualizarEstatisticas !== 'undefined') {
            atualizarEstatisticas();
        }
    } else {
        mostrarToast(resultado.mensagem, "error");
    }
}

// Carregar usuário logado na interface
function carregarUsuarioLogado() {
    const usuario = getUsuarioAtual();
    const playerNameEl = document.getElementById("playerName");
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (usuario && playerNameEl) {
        playerNameEl.innerHTML = `<i class="fas fa-user-astronaut"></i> ${usuario.apelido} (${usuario.idade}a)`;
        playerNameEl.style.cursor = "pointer";
        playerNameEl.title = "Clique para ver opções";
        
        if (logoutBtn) {
            logoutBtn.style.display = "flex";
        }
    } else if (playerNameEl) {
        playerNameEl.innerHTML = `<i class="fas fa-user-astronaut"></i> Fazer Login`;
        playerNameEl.style.cursor = "pointer";
        
        if (logoutBtn) {
            logoutBtn.style.display = "none";
        }
    }
}

// Fazer logout
async function fazerLogout() {
    const usuario = getUsuarioAtual();
    
    if (usuario) {
        // Última sincronização antes de sair
        if (typeof atualizarPontosDB !== 'undefined' && supabaseClient) {
            await atualizarPontosDB(
                usuario.apelido, 
                usuario.pontos || 0,
                usuario.quizzes_completados || []
            );
        }
        console.log(`👋 ${usuario.apelido} fez logout`);
    }
    
    removerUsuarioAtual();
    carregarUsuarioLogado();
    
    // Resetar interface
    if (typeof pontos !== 'undefined') {
        window.pontos = 0;
        localStorage.setItem("pontos", "0");
    }
    if (typeof atualizarHeader !== 'undefined') {
        atualizarHeader();
    }
    if (typeof atualizarRanking !== 'undefined') {
        atualizarRanking();
    }
    if (typeof atualizarEstatisticas !== 'undefined') {
        atualizarEstatisticas();
    }
    
    mostrarToast("Você saiu da sua conta! Até logo! 👋", "info");
}

// Carregar pontos do usuário logado
function carregarPontosDoUsuario() {
    const usuario = getUsuarioAtual();
    if (usuario && typeof pontos !== 'undefined') {
        window.pontos = usuario.pontos || 0;
        localStorage.setItem("pontos", window.pontos);
        if (typeof atualizarHeader !== 'undefined') {
            atualizarHeader();
        }
    }
}

// Mostrar toast (notificação melhorada)
function mostrarToast(mensagem, tipo = "success") {
    // Remover toasts anteriores
    const toastAntigo = document.querySelector('.toast-message');
    if (toastAntigo) toastAntigo.remove();
    
    const cores = {
        success: '#48bb78',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    const icones = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    const toast = document.createElement("div");
    toast.className = 'toast-message';
    toast.innerHTML = `
        <i class="fas ${icones[tipo] || icones.info}"></i>
        <span>${mensagem}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;cursor:pointer;margin-left:10px;">×</button>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${cores[tipo] || cores.info};
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        max-width: 400px;
    `;
    document.body.appendChild(toast);
    
    // Auto-remover após 3 segundos
    setTimeout(() => {
        toast.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Adicionar animações CSS para toast
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    .toast-message:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(0,0,0,0.3);
    }
`;
document.head.appendChild(styleSheet);

// Expor funções globalmente
window.mostrarModalAuth = mostrarModalAuth;
window.fecharModalAuth = fecharModalAuth;
window.mostrarTelaLogin = mostrarTelaLogin;
window.mostrarTelaCadastro = mostrarTelaCadastro;
window.fazerLogin = fazerLogin;
window.fazerCadastro = fazerCadastro;
window.fazerLogout = fazerLogout;
window.carregarUsuarioLogado = carregarUsuarioLogado;
window.carregarPontosDoUsuario = carregarPontosDoUsuario;
window.mostrarToast = mostrarToast;

console.log("✅ Auth.js carregado com sucesso! (v2.0 - Supabase)");