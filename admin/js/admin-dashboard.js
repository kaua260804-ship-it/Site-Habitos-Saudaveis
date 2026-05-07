// ============================================
// ADMIN DASHBOARD - Controlador Principal
// ============================================

// Verificar se está logado
if (!verificarAdminLogado()) {
    window.location.href = 'index.html';
}

let tabAtual = 'temas';

// Mudar de tab
function mudarTab(tab) {
    tabAtual = tab;
    
    // Atualizar tabs ativas
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Renderizar conteúdo
    switch(tab) {
        case 'temas':
            renderizarTemas();
            break;
        case 'subtopicos':
            renderizarSubtopicos();
            break;
        case 'quizzes':
            renderizarQuizzes();
            break;
        case 'usuarios':
            renderizarUsuarios();
            break;
    }
}

// Fechar modal ao clicar fora
document.getElementById('adminModal').addEventListener('click', function(e) {
    if (e.target === this) {
        fecharModal();
    }
});

// Iniciar com temas
document.addEventListener('DOMContentLoaded', function() {
    renderizarTemas();
});

console.log('📊 Dashboard Admin carregado!');