// ============================================
// ADMIN AUTH - Autenticação do Painel Admin
// ============================================

const ADMIN_TOKEN_KEY = 'admin_token_habitos';
const ADMIN_USER_KEY = 'admin_user_habitos';

// Login do admin
document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('adminUsuario').value;
    const senha = document.getElementById('adminSenha').value;
    
    try {
        // Como temos db.json local, vamos simular a autenticação
        // Em produção, você usaria fetch() para seu backend
        
        // Simulação de admin local
        if (usuario === 'admin' && senha === 'admin123') {
            const adminData = {
                id: 1,
                usuario: 'admin',
                nome: 'Administrador',
                token: 'admin123',
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem(ADMIN_TOKEN_KEY, adminData.token);
            localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminData));
            
            window.location.href = 'dashboard.html';
        } else {
            mostrarErro('Usuário ou senha incorretos!');
        }
    } catch (error) {
        mostrarErro('Erro ao fazer login. Tente novamente.');
        console.error('Erro:', error);
    }
});

// Verificar se está logado
function verificarAdminLogado() {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const user = localStorage.getItem(ADMIN_USER_KEY);
    
    if (!token || !user) {
        window.location.href = 'index.html';
        return false;
    }
    
    try {
        const userData = JSON.parse(user);
        document.getElementById('adminUserName').textContent = `Olá, ${userData.nome}`;
        return true;
    } catch {
        window.location.href = 'index.html';
        return false;
    }
}

// Logout
function fazerLogoutAdmin() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    window.location.href = 'index.html';
}

// Mostrar erro no login
function mostrarErro(mensagem) {
    // Remover erro anterior se existir
    const erroAnterior = document.querySelector('.admin-login-error');
    if (erroAnterior) {
        erroAnterior.remove();
    }
    
    const erroDiv = document.createElement('div');
    erroDiv.className = 'admin-login-error';
    erroDiv.style.cssText = `
        background: #fde8e8;
        color: #c81e1e;
        padding: 10px 15px;
        border-radius: 10px;
        margin-bottom: 15px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    erroDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensagem}`;
    
    const form = document.getElementById('adminLoginForm');
    form.insertBefore(erroDiv, form.firstChild);
}

console.log('🔐 Admin Auth carregado!');