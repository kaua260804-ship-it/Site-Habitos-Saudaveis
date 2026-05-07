// ============================================
// ADMIN TOPICS - Gerenciar Tópicos
// ============================================

// Dados simulados (depois virão do db.json)
let temas = JSON.parse(localStorage.getItem('admin_temas') || '[]');

// Inicializar com dados padrão se vazio
if (temas.length === 0) {
    temas = [
        { id: 'alimentacao', nome: '🍎 Alimentação Saudável', emoji: '🍎', cor: '#48bb78', ordem: 1, ativo: true },
        { id: 'exercicios', nome: '🤸 Atividade Física', emoji: '🤸', cor: '#ed8936', ordem: 2, ativo: true },
        { id: 'higiene', nome: '🧼 Higiene Pessoal', emoji: '🧼', cor: '#4299e1', ordem: 3, ativo: true },
        { id: 'sono', nome: '😴 Sono e Descanso', emoji: '😴', cor: '#9f7aea', ordem: 4, ativo: true },
        { id: 'saudemental', nome: '🧠 Saúde Mental', emoji: '🧠', cor: '#f687b3', ordem: 5, ativo: true }
    ];
    salvarTemas();
}

function salvarTemas() {
    localStorage.setItem('admin_temas', JSON.stringify(temas));
}

// Renderizar tabela de temas
function renderizarTemas() {
    const container = document.getElementById('adminContent');
    
    let html = `
        <div class="admin-section-header">
            <h2><i class="fas fa-book"></i> Gerenciar Tópicos</h2>
            <button class="admin-btn-add" onclick="abrirModalTema()">
                <i class="fas fa-plus"></i> Novo Tópico
            </button>
        </div>
    `;
    
    if (temas.length === 0) {
        html += `
            <div class="admin-empty-state">
                <i class="fas fa-book-open"></i>
                <p>Nenhum tópico cadastrado ainda</p>
            </div>
        `;
    } else {
        html += `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Ordem</th>
                        <th>Emoji</th>
                        <th>Nome</th>
                        <th>Cor</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        temas.forEach(tema => {
            html += `
                <tr>
                    <td>#${tema.ordem}</td>
                    <td style="font-size: 24px;">${tema.emoji}</td>
                    <td><strong>${tema.nome}</strong></td>
                    <td>
                        <span style="display: inline-block; width: 30px; height: 30px; background: ${tema.cor}; border-radius: 50%;"></span>
                    </td>
                    <td>
                        <span class="admin-badge ${tema.ativo ? 'active' : 'inactive'}">
                            ${tema.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>
                        <div class="admin-actions">
                            <button class="admin-btn-edit" onclick="abrirModalTema('${tema.id}')">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="admin-btn-delete" onclick="excluirTema('${tema.id}')">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    container.innerHTML = html;
}

// Abrir modal para adicionar/editar tema
function abrirModalTema(id = null) {
    const modal = document.getElementById('adminModal');
    const modalContent = document.getElementById('adminModalContent');
    
    let tema = { id: '', nome: '', emoji: '📚', cor: '#667eea', ordem: 1, ativo: true };
    
    if (id) {
        tema = temas.find(t => t.id === id);
        if (!tema) return;
    }
    
    modalContent.innerHTML = `
        <div class="admin-modal-header">
            <h3>${id ? '✏️ Editar' : '➕ Novo'} Tópico</h3>
            <button class="admin-modal-close" onclick="fecharModal()">✕</button>
        </div>
        <form onsubmit="salvarTema(event, '${id || ''}')">
            <div class="admin-form-group">
                <label>ID do Tópico</label>
                <input type="text" name="id" value="${tema.id}" required ${id ? 'readonly' : ''} placeholder="Ex: alimentacao">
            </div>
            <div class="admin-form-group">
                <label>Nome do Tópico</label>
                <input type="text" name="nome" value="${tema.nome}" required placeholder="Ex: 🍎 Alimentação Saudável">
            </div>
            <div class="admin-form-group">
                <label>Emoji</label>
                <input type="text" name="emoji" value="${tema.emoji}" required placeholder="Ex: 🍎">
            </div>
            <div class="admin-form-group">
                <label>Cor (hex)</label>
                <input type="color" name="cor" value="${tema.cor}" style="height: 45px; width: 100px;">
            </div>
            <div class="admin-form-group">
                <label>Ordem</label>
                <input type="number" name="ordem" value="${tema.ordem}" required min="1">
            </div>
            <div class="admin-form-group">
                <label>
                    <input type="checkbox" name="ativo" ${tema.ativo ? 'checked' : ''}> Tópico ativo
                </label>
            </div>
            <button type="submit" class="admin-btn-save">
                <i class="fas fa-save"></i> Salvar Tópico
            </button>
        </form>
    `;
    
    modal.classList.add('active');
}

// Salvar tema
function salvarTema(event, idOriginal = '') {
    event.preventDefault();
    const form = event.target;
    
    const novoTema = {
        id: form.id.value,
        nome: form.nome.value,
        emoji: form.emoji.value,
        cor: form.cor.value,
        ordem: parseInt(form.ordem.value),
        ativo: form.ativo.checked
    };
    
    if (idOriginal) {
        // Editar
        const index = temas.findIndex(t => t.id === idOriginal);
        if (index !== -1) temas[index] = novoTema;
    } else {
        // Adicionar novo
        temas.push(novoTema);
    }
    
    salvarTemas();
    fecharModal();
    renderizarTemas();
    mostrarToast('Tópico salvo com sucesso! 🎉', 'success');
}

// Excluir tema
function excluirTema(id) {
    if (confirm('Tem certeza que deseja excluir este tópico? Todos os subtópicos e quizzes relacionados também serão afetados.')) {
        temas = temas.filter(t => t.id !== id);
        salvarTemas();
        renderizarTemas();
        mostrarToast('Tópico excluído com sucesso!', 'warning');
    }
}

// Fechar modal
function fecharModal() {
    document.getElementById('adminModal').classList.remove('active');
}

// Mostrar toast
function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `admin-toast ${tipo}`;
    toast.innerHTML = `<i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${mensagem}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

console.log('📚 Admin Topics carregado!');