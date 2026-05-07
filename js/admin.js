// ============================================
// PAINEL ADMIN - GERENCIAMENTO COMPLETO
// ============================================

let adminLogado = false;
let adminDados = null;

// Verificar se usuário é admin
async function verificarAdmin() {
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    if (!usuario) return false;
    
    // Verificar cache primeiro
    const cacheAdmin = sessionStorage.getItem('admin_status');
    if (cacheAdmin === 'true' && sessionStorage.getItem('admin_apelido') === usuario.apelido) {
        adminLogado = true;
        adminDados = { nivel: 'admin' };
        return true;
    }
    
    try {
        const { data } = await supabaseClient
            .from('admins')
            .select('*')
            .eq('usuario_apelido', usuario.apelido)
            .single();
        
        if (data) {
            adminLogado = true;
            adminDados = data;
            sessionStorage.setItem('admin_status', 'true');
            sessionStorage.setItem('admin_apelido', usuario.apelido);
            return true;
        }
    } catch (error) {
        console.log('Não é admin');
    }
    
    return false;
}

// Abrir painel admin
async function abrirAdmin() {
    if (!await verificarAdmin()) {
        mostrarToast('🔒 Acesso restrito a administradores!', 'error');
        return;
    }
    
    const panel = document.getElementById('adminPanel');
    if (!panel) {
        criarPainelAdmin();
    }
    
    document.getElementById('adminPanel').classList.add('active');
    carregarDashboard();
}

// Criar painel admin dinamicamente
function criarPainelAdmin() {
    const panel = document.createElement('div');
    panel.id = 'adminPanel';
    panel.className = 'admin-panel';
    panel.innerHTML = `
        <div class="admin-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: white; border-radius: 20px 20px 0 0;">
            <div>
                <h2>🔧 Painel Administrativo</h2>
                <p style="color: #718096; font-size: 14px;">Gerencie quizzes, links e conteúdos</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-admin success" onclick="exportarDados()">
                    <i class="fas fa-download"></i> Exportar
                </button>
                <button class="btn-admin danger" onclick="fecharAdmin()">
                    <i class="fas fa-times"></i> Fechar
                </button>
            </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 0 0 20px 20px; max-height: 80vh; overflow-y: auto;">
            <!-- Stats -->
            <div class="admin-stats" id="adminStats">
                <div class="admin-stat">
                    <div class="stat-number" id="statQuizzes">0</div>
                    <div class="stat-label">Quizzes</div>
                </div>
                <div class="admin-stat">
                    <div class="stat-number" id="statLinks">0</div>
                    <div class="stat-label">Links</div>
                </div>
                <div class="admin-stat">
                    <div class="stat-number" id="statConteudos">0</div>
                    <div class="stat-label">Conteúdos</div>
                </div>
                <div class="admin-stat">
                    <div class="stat-number" id="statUsuarios">0</div>
                    <div class="stat-label">Usuários</div>
                </div>
            </div>
            
            <!-- Tabs -->
            <div class="admin-tabs">
                <button class="admin-tab active" onclick="mostrarTabAdmin('quizzes')">
                    <i class="fas fa-question-circle"></i> Quizzes
                </button>
                <button class="admin-tab" onclick="mostrarTabAdmin('links')">
                    <i class="fas fa-link"></i> Links
                </button>
                <button class="admin-tab" onclick="mostrarTabAdmin('conteudos')">
                    <i class="fas fa-book"></i> Conteúdos
                </button>
                <button class="admin-tab" onclick="mostrarTabAdmin('temas')">
                    <i class="fas fa-folder"></i> Temas
                </button>
            </div>
            
            <!-- Quizzes -->
            <div class="admin-content active" id="tab-quizzes">
                <div class="admin-form">
                    <h3>➕ Adicionar Quiz</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tema</label>
                            <select id="quizTema" onchange="atualizarSubtopicoSelect('quizTema', 'quizSubtopico')">
                                <option value="">Selecione...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Subtópico</label>
                            <select id="quizSubtopico">
                                <option value="">Selecione...</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Pergunta</label>
                        <input type="text" id="quizPergunta" placeholder="Digite a pergunta...">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Opção A</label>
                            <input type="text" id="quizOpcaoA" placeholder="Resposta A">
                        </div>
                        <div class="form-group">
                            <label>Opção B</label>
                            <input type="text" id="quizOpcaoB" placeholder="Resposta B">
                        </div>
                        <div class="form-group">
                            <label>Opção C</label>
                            <input type="text" id="quizOpcaoC" placeholder="Resposta C">
                        </div>
                        <div class="form-group">
                            <label>Opção D</label>
                            <input type="text" id="quizOpcaoD" placeholder="Resposta D">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Resposta Correta (0-3)</label>
                            <input type="number" id="quizCorreta" min="0" max="3" value="0">
                        </div>
                        <div class="form-group">
                            <label>Pontos</label>
                            <input type="number" id="quizPontos" value="10">
                        </div>
                    </div>
                    <button class="btn-admin" onclick="salvarQuiz()">
                        <i class="fas fa-save"></i> Salvar Quiz
                    </button>
                </div>
                
                <h3>📋 Quizzes Existentes</h3>
                <div id="listaQuizzes"></div>
            </div>
            
            <!-- Links -->
            <div class="admin-content" id="tab-links">
                <div class="admin-form">
                    <h3>➕ Adicionar Link</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Subtópico ID</label>
                            <select id="linkSubtopico">
                                <option value="">Selecione...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Nome do Link</label>
                            <input type="text" id="linkNome" placeholder="Nome do site/recurso">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>URL</label>
                        <input type="url" id="linkUrl" placeholder="https://...">
                    </div>
                    <button class="btn-admin" onclick="salvarLink()">
                        <i class="fas fa-save"></i> Salvar Link
                    </button>
                </div>
                
                <h3>📋 Links Existentes</h3>
                <div id="listaLinks"></div>
            </div>
            
            <!-- Conteúdos -->
            <div class="admin-content" id="tab-conteudos">
                <div class="admin-form">
                    <h3>➕ Adicionar Conteúdo</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tema</label>
                            <select id="conteudoTema" onchange="atualizarSubtopicoSelect('conteudoTema', 'conteudoSubtopico')">
                                <option value="">Selecione ou digite novo...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Subtópico ID</label>
                            <input type="text" id="conteudoSubtopicoid" placeholder="ex: alimentacao_frutas">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Nome do Subtópico</label>
                        <input type="text" id="conteudoNome" placeholder="Nome do subtópico">
                    </div>
                    <div class="form-group">
                        <label>Resumo</label>
                        <textarea id="conteudoResumo" placeholder="Resumo curto..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Conteúdo Completo</label>
                        <textarea id="conteudoCompleto" placeholder="Texto completo do conteúdo..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Dica/Desafio</label>
                        <input type="text" id="conteudoDica" placeholder="ex: DESAFIO: Beba 2L de água hoje!">
                    </div>
                    <button class="btn-admin" onclick="salvarConteudo()">
                        <i class="fas fa-save"></i> Salvar Conteúdo
                    </button>
                </div>
            </div>
            
            <!-- Temas -->
            <div class="admin-content" id="tab-temas">
                <div class="admin-form">
                    <h3>➕ Adicionar Tema</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>ID do Tema</label>
                            <input type="text" id="temaId" placeholder="ex: esportes">
                        </div>
                        <div class="form-group">
                            <label>Nome do Tema</label>
                            <input type="text" id="temaNome" placeholder="Nome do tema">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Emoji</label>
                        <input type="text" id="temaEmoji" placeholder="🍎">
                    </div>
                    <button class="btn-admin" onclick="salvarTema()">
                        <i class="fas fa-save"></i> Salvar Tema
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
    carregarTemasSelect();
}

// Fechar admin
function fecharAdmin() {
    document.getElementById('adminPanel').classList.remove('active');
}

// Mostrar tab
function mostrarTabAdmin(tab) {
    document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    
    document.getElementById(`tab-${tab}`).classList.add('active');
    event.target.closest('.admin-tab').classList.add('active');
    
    if (tab === 'quizzes') carregarQuizzes();
    if (tab === 'links') carregarLinks();
    if (tab === 'conteudos') carregarConteudos();
    if (tab === 'temas') carregarTemas();
}

// Carregar dashboard
async function carregarDashboard() {
    try {
        const { count: qCount } = await supabaseClient.from('quizzes').select('*', { count: 'exact', head: true });
        const { count: lCount } = await supabaseClient.from('links').select('*', { count: 'exact', head: true });
        const { count: cCount } = await supabaseClient.from('conteudos').select('*', { count: 'exact', head: true });
        const { count: uCount } = await supabaseClient.from('usuarios').select('*', { count: 'exact', head: true });
        
        document.getElementById('statQuizzes').textContent = qCount || 0;
        document.getElementById('statLinks').textContent = lCount || 0;
        document.getElementById('statConteudos').textContent = cCount || 0;
        document.getElementById('statUsuarios').textContent = uCount || 0;
    } catch (error) {
        console.error('Erro no dashboard:', error);
    }
}

// Salvar quiz
async function salvarQuiz() {
    const subtopicoId = document.getElementById('quizSubtopico').value;
    const tema = document.getElementById('quizTema').value;
    const subtopicoNome = document.getElementById('quizSubtopico').selectedOptions[0]?.text || '';
    const pergunta = document.getElementById('quizPergunta').value;
    const opcaoA = document.getElementById('quizOpcaoA').value;
    const opcaoB = document.getElementById('quizOpcaoB').value;
    const opcaoC = document.getElementById('quizOpcaoC').value;
    const opcaoD = document.getElementById('quizOpcaoD').value;
    const correta = parseInt(document.getElementById('quizCorreta').value);
    const pontos = parseInt(document.getElementById('quizPontos').value);
    
    if (!subtopicoId || !pergunta) {
        alert('Preencha todos os campos!');
        return;
    }
    
    const { error } = await supabaseClient.from('quizzes').insert({
        subtopico_id: subtopicoId,
        tema,
        subtopico_nome: subtopicoNome,
        pergunta,
        opcao_a: opcaoA,
        opcao_b: opcaoB,
        opcao_c: opcaoC,
        opcao_d: opcaoD,
        correta,
        pontos
    });
    
    if (error) {
        alert('Erro: ' + error.message);
    } else {
        mostrarToast('✅ Quiz salvo com sucesso!', 'success');
        carregarQuizzes();
        limparFormQuiz();
    }
}

// Carregar quizzes existentes
async function carregarQuizzes() {
    const { data } = await supabaseClient.from('quizzes').select('*').order('criado_em', { ascending: false });
    const container = document.getElementById('listaQuizzes');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color: #718096;">Nenhum quiz cadastrado</p>';
        return;
    }
    
    let html = '<table class="admin-table"><tr><th>Subtópico</th><th>Pergunta</th><th>Ações</th></tr>';
    data.forEach(q => {
        html += `
            <tr>
                <td>${q.subtopico_nome}</td>
                <td>${q.pergunta.substring(0, 50)}...</td>
                <td>
                    <button class="btn-admin" onclick="excluirQuiz(${q.id})" style="padding: 5px 10px; font-size: 12px;">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
    html += '</table>';
    container.innerHTML = html;
}

// Excluir quiz
async function excluirQuiz(id) {
    if (!confirm('Excluir este quiz?')) return;
    await supabaseClient.from('quizzes').delete().eq('id', id);
    carregarQuizzes();
}

// Salvar link
async function salvarLink() {
    const subtopicoId = document.getElementById('linkSubtopico').value;
    const nome = document.getElementById('linkNome').value;
    const url = document.getElementById('linkUrl').value;
    
    if (!subtopicoId || !nome || !url) {
        alert('Preencha todos os campos!');
        return;
    }
    
    const { error } = await supabaseClient.from('links').insert({ subtopico_id: subtopicoId, nome, url });
    
    if (error) {
        alert('Erro: ' + error.message);
    } else {
        mostrarToast('✅ Link salvo!', 'success');
        carregarLinks();
    }
}

// Salvar conteúdo
async function salvarConteudo() {
    const temaId = document.getElementById('conteudoTema').value;
    const subtopicoId = document.getElementById('conteudoSubtopicoid').value;
    const nome = document.getElementById('conteudoNome').value;
    const resumo = document.getElementById('conteudoResumo').value;
    const completo = document.getElementById('conteudoCompleto').value;
    const dica = document.getElementById('conteudoDica').value;
    
    if (!temaId || !subtopicoId || !nome) {
        alert('Preencha os campos obrigatórios!');
        return;
    }
    
    const { error } = await supabaseClient.from('conteudos').upsert({
        tema_id: temaId,
        subtopico_id: subtopicoId,
        subtopico_nome: nome,
        resumo,
        conteudo_completo: completo,
        dica_desafio: dica
    });
    
    if (error) {
        alert('Erro: ' + error.message);
    } else {
        mostrarToast('✅ Conteúdo salvo!', 'success');
    }
}

// Carregar temas nos selects
async function carregarTemasSelect() {
    const { data } = await supabaseClient.from('conteudos').select('tema_id, tema_nome').order('tema_id');
    
    // Remover duplicados
    const temasUnicos = [...new Map(data?.map(item => [item.tema_id, item])).values()];
    
    const selects = ['quizTema', 'conteudoTema'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione...</option>';
        temasUnicos.forEach(tema => {
            select.innerHTML += `<option value="${tema.tema_id}">${tema.tema_nome}</option>`;
        });
    });
}

// Atualizar select de subtópicos
async function atualizarSubtopicoSelect(temaSelectId, subtopicoSelectId) {
    const temaId = document.getElementById(temaSelectId).value;
    const subtopicoSelect = document.getElementById(subtopicoSelectId);
    
    if (!temaId || !subtopicoSelect) return;
    
    const { data } = await supabaseClient
        .from('conteudos')
        .select('subtopico_id, subtopico_nome')
        .eq('tema_id', temaId);
    
    subtopicoSelect.innerHTML = '<option value="">Selecione...</option>';
    data?.forEach(item => {
        subtopicoSelect.innerHTML += `<option value="${item.subtopico_id}">${item.subtopico_nome}</option>`;
    });
}

// Exportar dados
async function exportarDados() {
    const { data: quizzes } = await supabaseClient.from('quizzes').select('*');
    const { data: links } = await supabaseClient.from('links').select('*');
    
    const dados = { quizzes, links };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup_dados.json';
    a.click();
    
    mostrarToast('✅ Dados exportados!', 'success');
}

// Adicionar botão admin
function adicionarBotaoAdmin() {
    const btn = document.createElement('button');
    btn.className = 'btn-admin-flutuante';
    btn.innerHTML = '🔧';
    btn.title = 'Painel Admin';
    btn.onclick = abrirAdmin;
    document.body.appendChild(btn);
}

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof supabaseClient !== 'undefined') {
        const isAdmin = await verificarAdmin();
        if (isAdmin) {
            adicionarBotaoAdmin();
            console.log('🔧 Painel Admin disponível');
        }
    }
});

// Exportar funções
window.abrirAdmin = abrirAdmin;
window.fecharAdmin = fecharAdmin;
window.mostrarTabAdmin = mostrarTabAdmin;
window.salvarQuiz = salvarQuiz;
window.salvarLink = salvarLink;
window.salvarConteudo = salvarConteudo;
window.excluirQuiz = excluirQuiz;
window.atualizarSubtopicoSelect = atualizarSubtopicoSelect;
window.exportarDados = exportarDados;

console.log('🔧 Admin.js carregado!');