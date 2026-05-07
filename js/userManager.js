// ============================================
// GERENCIAMENTO DE USUÁRIOS
// ============================================

const USERS_KEY = "habitosaudaveis_usuarios";
const CURRENT_USER_KEY = "habitosaudaveis_usuario_atual";

// Salvar usuário no localStorage
function salvarUsuario(usuario) {
    let usuarios = getTodosUsuarios();
    
    // Verificar se apelido já existe
    const existe = usuarios.find(u => u.apelido === usuario.apelido);
    if (existe) {
        return { sucesso: false, mensagem: "Apelido já está em uso! Escolha outro." };
    }
    
    usuarios.push(usuario);
    localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
    return { sucesso: true, mensagem: "Usuário cadastrado com sucesso!" };
}

// Buscar todos os usuários
function getTodosUsuarios() {
    const usuarios = localStorage.getItem(USERS_KEY);
    return usuarios ? JSON.parse(usuarios) : [];
}

// Buscar usuário por apelido e senha
function buscarUsuario(apelido, senha) {
    const usuarios = getTodosUsuarios();
    return usuarios.find(u => u.apelido === apelido && u.senha === senha);
}

// Buscar usuário por apelido apenas
function buscarUsuarioPorApelido(apelido) {
    const usuarios = getTodosUsuarios();
    return usuarios.find(u => u.apelido === apelido);
}

// Salvar usuário atual (logado)
function salvarUsuarioAtual(usuario) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuario));
}

// Buscar usuário atual (logado)
function getUsuarioAtual() {
    const usuario = localStorage.getItem(CURRENT_USER_KEY);
    return usuario ? JSON.parse(usuario) : null;
}

// Remover usuário atual (logout)
function removerUsuarioAtual() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

// Atualizar pontos do usuário
function atualizarPontosUsuario(apelido, novosPontos) {
    let usuarios = getTodosUsuarios();
    const index = usuarios.findIndex(u => u.apelido === apelido);
    
    if (index !== -1) {
        usuarios[index].pontos = novosPontos;
        localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
        
        // Atualizar também o usuário atual se for ele
        const atual = getUsuarioAtual();
        if (atual && atual.apelido === apelido) {
            atual.pontos = novosPontos;
            salvarUsuarioAtual(atual);
        }
    }
}

// Obter ranking completo (com Nome, Apelido, Idade, Pontos)
function getRankingCompleto() {
    const usuarios = getTodosUsuarios();
    return usuarios
        .map(u => ({
            nome: u.nome,
            apelido: u.apelido,
            idade: u.idade,
            pontos: u.pontos || 0
        }))
        .sort((a, b) => b.pontos - a.pontos);
}

// Expor funções globalmente
window.salvarUsuario = salvarUsuario;
window.getTodosUsuarios = getTodosUsuarios;
window.buscarUsuario = buscarUsuario;
window.buscarUsuarioPorApelido = buscarUsuarioPorApelido;
window.salvarUsuarioAtual = salvarUsuarioAtual;
window.getUsuarioAtual = getUsuarioAtual;
window.removerUsuarioAtual = removerUsuarioAtual;
window.atualizarPontosUsuario = atualizarPontosUsuario;
window.getRankingCompleto = getRankingCompleto;

console.log("UserManager.js carregado com sucesso!");