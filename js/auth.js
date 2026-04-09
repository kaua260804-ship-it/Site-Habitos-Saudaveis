// ============================================
// SISTEMA DE AUTENTICAÇÃO
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
                <input type="text" id="cadastroApelido" placeholder="Apelido (será exibido no ranking)" autocomplete="off">
            </div>
            <div class="input-group">
                <i class="fas fa-calendar-alt"></i>
                <input type="number" id="cadastroIdade" placeholder="Sua idade" min="5" max="120">
            </div>
            <div class="input-group">
                <i class="fas fa-lock"></i>
                <input type="password" id="cadastroSenha" placeholder="Criar senha">
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

// Fazer login
function fazerLogin() {
    const apelido = document.getElementById("loginApelido")?.value.trim();
    const senha = document.getElementById("loginSenha")?.value;
    
    if (!apelido || !senha) {
        mostrarToast("Preencha todos os campos!", "error");
        return;
    }
    
    const usuario = buscarUsuario(apelido, senha);
    
    if (usuario) {
        salvarUsuarioAtual(usuario);
        fecharModalAuth();
        carregarUsuarioLogado();
        mostrarToast(`Bem-vindo de volta, ${usuario.apelido}! 🎉`, "success");
        
        // Recarregar ranking e pontos
        if (typeof carregarPontosDoUsuario !== 'undefined') {
            carregarPontosDoUsuario();
        }
        if (typeof atualizarRanking !== 'undefined') {
            atualizarRanking();
        }
    } else {
        mostrarToast("Apelido ou senha incorretos!", "error");
    }
}

// Fazer cadastro
function fazerCadastro() {
    const nome = document.getElementById("cadastroNome")?.value.trim();
    const apelido = document.getElementById("cadastroApelido")?.value.trim();
    const idade = document.getElementById("cadastroIdade")?.value;
    const senha = document.getElementById("cadastroSenha")?.value;
    const confirmarSenha = document.getElementById("cadastroConfirmarSenha")?.value;
    
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
    
    const novoUsuario = {
        nome: nome,
        apelido: apelido,
        idade: idadeNum,
        senha: senha,
        pontos: 0,
        dataCriacao: new Date().toISOString()
    };
    
    const resultado = salvarUsuario(novoUsuario);
    
    if (resultado.sucesso) {
        salvarUsuarioAtual(novoUsuario);
        fecharModalAuth();
        carregarUsuarioLogado();
        mostrarToast(`Conta criada com sucesso! Bem-vindo, ${apelido}! 🎉`, "success");
        
        // Recarregar ranking
        if (typeof atualizarRanking !== 'undefined') {
            atualizarRanking();
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
        
        // Mostrar botão de logout se existir
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
function fazerLogout() {
    removerUsuarioAtual();
    carregarUsuarioLogado();
    
    // Resetar pontos globais
    if (typeof pontos !== 'undefined') {
        window.pontos = 0;
        localStorage.setItem("pontos", 0);
    }
    if (typeof atualizarHeader !== 'undefined') {
        atualizarHeader();
    }
    if (typeof atualizarRanking !== 'undefined') {
        atualizarRanking();
    }
    
    mostrarToast("Você saiu da sua conta!", "info");
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

// Mostrar toast (notificação)
function mostrarToast(mensagem, tipo = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${mensagem}</span>
    `;
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: ${tipo === 'success' ? '#48bb78' : tipo === 'error' ? '#ef4444' : '#3b82f6'};
        color: white; padding: 12px 20px; border-radius: 12px;
        z-index: 3000; animation: slideInRight 0.3s ease;
        display: flex; align-items: center; gap: 10px;
        font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

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

console.log("Auth.js carregado com sucesso!");