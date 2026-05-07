// ============================================
// ADMIN QUIZ - Gerenciar Quizzes
// ============================================

let subtopicos = JSON.parse(localStorage.getItem('admin_subtopicos') || '[]');
let quizzes = JSON.parse(localStorage.getItem('admin_quizzes') || '[]');

function salvarSubtopicos() {
    localStorage.setItem('admin_subtopicos', JSON.stringify(subtopicos));
}

function salvarQuizzes() {
    localStorage.setItem('admin_quizzes', JSON.stringify(quizzes));
}

// Renderizar tabela de subtópicos
function renderizarSubtopicos() {
    const container = document.getElementById('adminContent');
    
    let html = `
        <div class="admin-section-header">
            <h2><i class="fas fa-list"></i> Gerenciar Subtópicos</h2>
            <button class="admin-btn-add" onclick="abrirModalSubtopico()">
                <i class="fas fa-plus"></i> Novo Subtópico
            </button>
        </div>
    `;
    
    if (subtopicos.length === 0) {
        html += `
            <div class="admin-empty-state">
                <i class="fas fa-list-alt"></i>
                <p>Nenhum subtópico cadastrado</p>
            </div>
        `;
    } else {
        html += `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Tópico</th>
                        <th>Nome</th>
                        <th>Quiz Vinculado</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        subtopicos.forEach(sub => {
            const temQuiz = quizzes.find(q => q.subtema_id === sub.id);
            
            html += `
                <tr>
                    <td><span class="admin-badge" style="background: #eef2ff; color: #4338ca;">${sub.tema_id}</span></td>
                    <td><strong>${sub.nome}</strong></td>
                    <td>
                        ${temQuiz ? '<span class="admin-badge active">✅ Sim</span>' : '<span class="admin-badge inactive">❌ Não</span>'}
                    </td>
                    <td>
                        <span class="admin-badge ${sub.ativo ? 'active' : 'inactive'}">
                            ${sub.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>
                        <div class="admin-actions">
                            <button class="admin-btn-edit" onclick="abrirModalSubtopico('${sub.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="admin-btn-delete" onclick="excluirSubtopico('${sub.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="admin-btn-edit" onclick="abrirModalQuiz('${sub.id}')" style="background: #fef3c7; color: #d97706;">
                                <i class="fas fa-question-circle"></i> Quiz
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

// Renderizar tabela de quizzes
function renderizarQuizzes() {
    const container = document.getElementById('adminContent');
    
    let html = `
        <div class="admin-section-header">
            <h2><i class="fas fa-question-circle"></i> Gerenciar Quizzes</h2>
        </div>
    `;
    
    if (quizzes.length === 0) {
        html += `
            <div class="admin-empty-state">
                <i class="fas fa-question"></i>
                <p>Nenhum quiz cadastrado. Vá em "Subtópicos" e clique no botão "Quiz" para criar.</p>
            </div>
        `;
    } else {
        html += `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Subtopico</th>
                        <th>Perguntas</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        quizzes.forEach(quiz => {
            const sub = subtopicos.find(s => s.id === quiz.subtema_id);
            
            html += `
                <tr>
                    <td><strong>${sub ? sub.nome : quiz.subtema_id}</strong></td>
                    <td>${quiz.perguntas.length} perguntas</td>
                    <td>
                        <span class="admin-badge ${quiz.ativo ? 'active' : 'inactive'}">
                            ${quiz.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>
                        <div class="admin-actions">
                            <button class="admin-btn-edit" onclick="abrirModalQuiz('${quiz.subtema_id}')">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="admin-btn-delete" onclick="excluirQuiz('${quiz.id}')">
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

// Abrir modal de quiz
function abrirModalQuiz(subtemaId) {
    const modal = document.getElementById('adminModal');
    const modalContent = document.getElementById('adminModalContent');
    const sub = subtopicos.find(s => s.id === subtemaId);
    
    if (!sub) {
        mostrarToast('Subtópico não encontrado!', 'error');
        return;
    }
    
    let quiz = quizzes.find(q => q.subtema_id === subtemaId);
    
    if (!quiz) {
        quiz = {
            id: 'quiz_' + subtemaId,
            subtema_id: subtemaId,
            perguntas: [
                { id: 1, pergunta: '', opcoes: ['', '', '', ''], correta: 0, pontos: 10 }
            ],
            ativo: true
        };
    }
    
    let perguntasHTML = '';
    quiz.perguntas.forEach((p, index) => {
        perguntasHTML += `
            <div class="quiz-builder-pergunta">
                <h4 style="margin-bottom: 15px;">📝 Pergunta ${index + 1}</h4>
                <div class="admin-form-group">
                    <label>Pergunta</label>
                    <input type="text" name="pergunta_${index}" value="${p.pergunta}" required>
                </div>
                <div class="quiz-opcoes-builder">
        `;
        
        p.opcoes.forEach((opcao, oIndex) => {
            const letra = String.fromCharCode(65 + oIndex);
            perguntasHTML += `
                <div class="quiz-opcao-builder">
                    <input type="radio" name="correta_${index}" value="${oIndex}" ${p.correta === oIndex ? 'checked' : ''}>
                    <input type="text" name="opcao_${index}_${oIndex}" value="${opcao}" placeholder="Opção ${letra}" required>
                </div>
            `;
        });
        
        perguntasHTML += `
                </div>
                <div class="admin-form-group" style="margin-top: 10px;">
                    <label>Pontos por acerto</label>
                    <input type="number" name="pontos_${index}" value="${p.pontos}" required min="1" max="100">
                </div>
                <button type="button" onclick="removerPergunta(this, ${index})" style="background: #ef4444; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 12px;">
                    <i class="fas fa-trash"></i> Remover Pergunta
                </button>
            </div>
        `;
    });
    
    modalContent.innerHTML = `
        <div class="admin-modal-header">
            <h3>🎮 Quiz: ${sub.nome}</h3>
            <button class="admin-modal-close" onclick="fecharModal()">✕</button>
        </div>
        <form onsubmit="salvarQuiz(event, '${subtemaId}')">
            <div id="perguntasContainer">
                ${perguntasHTML}
            </div>
            <button type="button" onclick="adicionarPergunta()" style="background: #48bb78; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; margin: 10px 0; font-size: 14px;">
                <i class="fas fa-plus"></i> Adicionar Pergunta
            </button>
            <div class="admin-form-group" style="margin-top: 15px;">
                <label>
                    <input type="checkbox" name="ativo" ${quiz.ativo ? 'checked' : ''}> Quiz ativo
                </label>
            </div>
            <button type="submit" class="admin-btn-save">
                <i class="fas fa-save"></i> Salvar Quiz
            </button>
        </form>
    `;
    
    modal.classList.add('active');
}

// Adicionar pergunta nova
function adicionarPergunta() {
    const container = document.getElementById('perguntasContainer');
    const index = container.querySelectorAll('.quiz-builder-pergunta').length;
    
    const div = document.createElement('div');
    div.className = 'quiz-builder-pergunta';
    div.innerHTML = `
        <h4 style="margin-bottom: 15px;">📝 Nova Pergunta</h4>
        <div class="admin-form-group">
            <label>Pergunta</label>
            <input type="text" name="pergunta_${index}" required>
        </div>
        <div class="quiz-opcoes-builder">
            <div class="quiz-opcao-builder">
                <input type="radio" name="correta_${index}" value="0" checked>
                <input type="text" name="opcao_${index}_0" placeholder="Opção A" required>
            </div>
            <div class="quiz-opcao-builder">
                <input type="radio" name="correta_${index}" value="1">
                <input type="text" name="opcao_${index}_1" placeholder="Opção B" required>
            </div>
            <div class="quiz-opcao-builder">
                <input type="radio" name="correta_${index}" value="2">
                <input type="text" name="opcao_${index}_2" placeholder="Opção C" required>
            </div>
            <div class="quiz-opcao-builder">
                <input type="radio" name="correta_${index}" value="3">
                <input type="text" name="opcao_${index}_3" placeholder="Opção D" required>
            </div>
        </div>
        <div class="admin-form-group" style="margin-top: 10px;">
            <label>Pontos por acerto</label>
            <input type="number" name="pontos_${index}" value="10" required min="1" max="100">
        </div>
        <button type="button" onclick="removerPergunta(this, ${index})" style="background: #ef4444; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 12px;">
            <i class="fas fa-trash"></i> Remover Pergunta
        </button>
    `;
    
    container.appendChild(div);
}

// Remover pergunta
function removerPergunta(btn, index) {
    if (confirm('Remover esta pergunta?')) {
        btn.parentElement.remove();
        mostrarToast('Pergunta removida!', 'warning');
    }
}

// Salvar quiz
function salvarQuiz(event, subtemaId) {
    event.preventDefault();
    const form = event.target;
    const perguntasDivs = document.querySelectorAll('.quiz-builder-pergunta');
    
    const perguntas = [];
    perguntasDivs.forEach((div, index) => {
        const pergunta = div.querySelector(`[name="pergunta_${index}"]`)?.value || '';
        const correta = parseInt(div.querySelector(`[name="correta_${index}"]:checked`)?.value || '0');
        const pontos = parseInt(div.querySelector(`[name="pontos_${index}"]`)?.value || '10');
        
        const opcoes = [];
        for (let i = 0; i < 4; i++) {
            const opcao = div.querySelector(`[name="opcao_${index}_${i}"]`)?.value || '';
            opcoes.push(opcao);
        }
        
        perguntas.push({ id: index + 1, pergunta, opcoes, correta, pontos });
    });
    
    const quiz = {
        id: 'quiz_' + subtemaId,
        subtema_id: subtemaId,
        perguntas: perguntas,
        ativo: form.ativo.checked
    };
    
    // Remover quiz antigo se existir
    quizzes = quizzes.filter(q => q.id !== quiz.id);
    quizzes.push(quiz);
    
    salvarQuizzes();
    fecharModal();
    renderizarSubtopicos();
    mostrarToast('Quiz salvo com sucesso! 🎉', 'success');
}

// Excluir quiz
function excluirQuiz(id) {
    if (confirm('Excluir este quiz?')) {
        quizzes = quizzes.filter(q => q.id !== id);
        salvarQuizzes();
        renderizarQuizzes();
        mostrarToast('Quiz excluído!', 'warning');
    }
}

console.log('🎮 Admin Quiz carregado!');