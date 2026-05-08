// ============================================
// PAINEL ADMIN - GERENCIAMENTO COMPLETO (CORRIGIDO)
// ============================================

let adminLogado = false;
let adminDados = null;

// Verificar se usuário é admin
async function verificarAdmin() {
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    if (!usuario) return false;
    
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
            .maybeSingle();
        
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
        await carregarTodosSelects();
    }
    
    document.getElementById('adminPanel').classList.add('active');
    carregarDashboard();
}

// Criar painel admin
function criarPainelAdmin() {
    const panel = document.createElement('div');
    panel.id = 'adminPanel';
    panel.className = 'admin-panel';
    panel.innerHTML = `
        <div class="admin-container">
            <div class="admin-header">
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
                                <option value="">Selecione um tema...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Subtópico</label>
                            <select id="quizSubtopico">
                                <option value="">Primeiro selecione o tema...</option>
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
                            <label>Resposta Correta (0=A, 1=B, 2=C, 3=D)</label>
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
                
                <h3 style="margin-top: 20px;">📋 Quizzes Existentes</h3>
                <div id="listaQuizzes" style="overflow-x: auto;"></div>
            </div>
            
            <!-- Links -->
            <div class="admin-content" id="tab-links">
                <div class="admin-form">
                    <h3>➕ Adicionar Link</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Subtópico</label>
                            <select id="linkSubtopico">
                                <option value="">Carregando subtópicos...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Nome do Link</label>
                            <input type="text" id="linkNome" placeholder="Ex: Toda Matéria - Pirâmide Alimentar">
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
                
                <h3 style="margin-top: 20px;">📋 Links Existentes</h3>
                <div id="listaLinks" style="overflow-x: auto;"></div>
            </div>
            
            <!-- Conteúdos -->
            <div class="admin-content" id="tab-conteudos">
                <div class="admin-form">
                    <h3>➕ Adicionar/Editar Conteúdo</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tema</label>
                            <select id="conteudoTema">
                                <option value="">Selecione ou digite novo...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Subtópico ID (sem espaços)</label>
                            <input type="text" id="conteudoSubtopicoid" placeholder="ex: alimentacao_frutas">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Nome do Subtópico</label>
                        <input type="text" id="conteudoNome" placeholder="Ex: Frutas da Estação">
                    </div>
                    <div class="form-group">
                        <label>Resumo</label>
                        <textarea id="conteudoResumo" placeholder="Resumo curto para o card..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Conteúdo Completo</label>
                        <textarea id="conteudoCompleto" placeholder="Texto completo..." style="min-height: 150px;"></textarea>
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
                    <h3>➕ Adicionar Novo Tema</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>ID do Tema (sem espaços)</label>
                            <input type="text" id="temaId" placeholder="ex: esportes">
                        </div>
                        <div class="form-group">
                            <label>Nome do Tema</label>
                            <input type="text" id="temaNome" placeholder="Ex: Esportes Radicais">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Emoji do Tema</label>
                        <input type="text" id="temaEmoji" placeholder="🏄">
                    </div>
                    <button class="btn-admin" onclick="salvarTema()">
                        <i class="fas fa-save"></i> Salvar Tema
                    </button>
                </div>
                
                <h3 style="margin-top: 20px;">📋 Temas Existentes</h3>
                <div id="listaTemas"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
}

// ========== CARREGAR SELECTS ==========

async function carregarTodosSelects() {
    await carregarTemasNoSelect('quizTema');
    await carregarTemasNoSelect('conteudoTema');
    await carregarSubtopicosNoSelect('linkSubtopico');
}

async function carregarTemasNoSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    try {
        const { data } = await supabaseClient
            .from('conteudos')
            .select('tema_id, tema_nome, tema_emoji')
            .order('tema_id');
        
        // Remover duplicados
        const temasUnicos = [];
        const ids = new Set();
        data?.forEach(item => {
            if (!ids.has(item.tema_id)) {
                ids.add(item.tema_id);
                temasUnicos.push(item);
            }
        });
        
        select.innerHTML = '<option value="">Selecione um tema...</option>';
        temasUnicos.forEach(tema => {
            select.innerHTML += `<option value="${tema.tema_id}">${tema.tema_emoji || '📚'} ${tema.tema_nome}</option>`;
        });
        
    } catch (error) {
        console.error('Erro ao carregar temas:', error);
        select.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

async function carregarSubtopicosNoSelect(selectId, temaId = null) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    try {
        let query = supabaseClient
            .from('conteudos')
            .select('subtopico_id, subtopico_nome, tema_nome')
            .order('subtopico_nome');
        
        if (temaId) {
            query = query.eq('tema_id', temaId);
        }
        
        const { data } = await query;
        
        select.innerHTML = '<option value="">Selecione um subtópico...</option>';
        data?.forEach(item => {
            select.innerHTML += `<option value="${item.subtopico_id}">${item.subtopico_nome} (${item.tema_nome})</option>`;
        });
        
    } catch (error) {
        console.error('Erro ao carregar subtópicos:', error);
        select.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

// Atualizar select de subtópicos baseado no tema
async function atualizarSubtopicoSelect(temaSelectId, subtopicoSelectId) {
    const temaId = document.getElementById(temaSelectId)?.value;
    if (!temaId) return;
    
    await carregarSubtopicosNoSelect(subtopicoSelectId, temaId);
}

// ========== CARREGAR LISTAS ==========

async function carregarQuizzes() {
    const { data } = await supabaseClient
        .from('quizzes')
        .select('*')
        .order('criado_em', { ascending: false });
    
    const container = document.getElementById('listaQuizzes');
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color: #718096; padding: 20px;">Nenhum quiz cadastrado</p>';
        return;
    }
    
    let html = '<table class="admin-table"><tr><th>Subtópico</th><th>Pergunta</th><th>Correta</th><th>Pontos</th><th>Ações</th></tr>';
    data.forEach(q => {
        const opcoes = [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d];
        html += `
            <tr>
                <td><small>${q.subtopico_nome}</small></td>
                <td>${q.pergunta.substring(0, 40)}...</td>
                <td>${String.fromCharCode(65 + q.correta)}) ${opcoes[q.correta]?.substring(0, 15)}</td>
                <td>${q.pontos}</td>
                <td>
                    <button class="btn-admin" onclick="excluirQuiz(${q.id})" style="padding: 5px 10px; font-size: 11px;">
                        🗑️ Excluir
                    </button>
                </td>
            </tr>
        `;
    });
    html += '</table>';
    container.innerHTML = html;
}

async function carregarLinks() {
    const { data } = await supabaseClient
        .from('links')
        .select('*')
        .order('criado_em', { ascending: false });
    
    const container = document.getElementById('listaLinks');
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color: #718096; padding: 20px;">Nenhum link cadastrado</p>';
        return;
    }
    
    let html = '<table class="admin-table"><tr><th>Subtópico</th><th>Nome</th><th>URL</th><th>Ações</th></tr>';
    data.forEach(l => {
        html += `
            <tr>
                <td><small>${l.subtopico_id}</small></td>
                <td>${l.nome}</td>
                <td><a href="${l.url}" target="_blank" style="color: #667eea;">Abrir 🔗</a></td>
                <td>
                    <button class="btn-admin" onclick="excluirLink(${l.id})" style="padding: 5px 10px; font-size: 11px;">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
    html += '</table>';
    container.innerHTML = html;
}

async function carregarConteudos() {
    const { data } = await supabaseClient
        .from('conteudos')
        .select('*')
        .order('tema_id');
    
    // Só mostra no console por enquanto
    console.log('📚 Conteúdos:', data?.length || 0);
}

async function carregarTemas() {
    const { data } = await supabaseClient
        .from('conteudos')
        .select('tema_id, tema_nome, tema_emoji')
        .order('tema_id');
    
    const container = document.getElementById('listaTemas');
    if (!container) return;
    
    const temasUnicos = [];
    const ids = new Set();
    data?.forEach(item => {
        if (!ids.has(item.tema_id)) {
            ids.add(item.tema_id);
            temasUnicos.push(item);
        }
    });
    
    if (temasUnicos.length === 0) {
        container.innerHTML = '<p style="color: #718096; padding: 20px;">Nenhum tema cadastrado</p>';
        return;
    }
    
    let html = '<table class="admin-table"><tr><th>ID</th><th>Nome</th><th>Emoji</th></tr>';
    temasUnicos.forEach(t => {
        html += `
            <tr>
                <td>${t.tema_id}</td>
                <td>${t.tema_nome}</td>
                <td style="font-size: 30px;">${t.tema_emoji || '📚'}</td>
            </tr>
        `;
    });
    html += '</table>';
    container.innerHTML = html;
}

// ========== CARREGAR DASHBOARD ==========

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

// ========== MOSTRAR TABS ==========

function mostrarTabAdmin(tab) {
    document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    
    const tabContent = document.getElementById(`tab-${tab}`);
    const tabButton = document.querySelector(`.admin-tab[onclick*="${tab}"]`);
    
    if (tabContent) tabContent.classList.add('active');
    if (tabButton) tabButton.classList.add('active');
    
    if (tab === 'quizzes') carregarQuizzes();
    if (tab === 'links') {
        carregarSubtopicosNoSelect('linkSubtopico');
        carregarLinks();
    }
    if (tab === 'conteudos') carregarConteudos();
    if (tab === 'temas') carregarTemas();
}

// ========== SALVAR DADOS ==========

async function salvarQuiz() {
    const temaSelect = document.getElementById('quizTema');
    const subtopicoSelect = document.getElementById('quizSubtopico');
    
    const tema = temaSelect.value;
    const subtopicoId = subtopicoSelect.value;
    const subtopicoNome = subtopicoSelect.selectedOptions[0]?.text.split(' (')[0] || '';
    const pergunta = document.getElementById('quizPergunta').value.trim();
    const opcaoA = document.getElementById('quizOpcaoA').value.trim();
    const opcaoB = document.getElementById('quizOpcaoB').value.trim();
    const opcaoC = document.getElementById('quizOpcaoC').value.trim();
    const opcaoD = document.getElementById('quizOpcaoD').value.trim();
    const correta = parseInt(document.getElementById('quizCorreta').value);
    const pontos = parseInt(document.getElementById('quizPontos').value);
    
    if (!tema || !subtopicoId || !pergunta || !opcaoA || !opcaoB) {
        mostrarToast('Preencha pelo menos tema, subtópico, pergunta, opção A e B!', 'warning');
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
        mostrarToast('Erro: ' + error.message, 'error');
    } else {
        mostrarToast('✅ Quiz salvo com sucesso!', 'success');
        carregarQuizzes();
        carregarDashboard();
        document.getElementById('quizPergunta').value = '';
        document.getElementById('quizOpcaoA').value = '';
        document.getElementById('quizOpcaoB').value = '';
        document.getElementById('quizOpcaoC').value = '';
        document.getElementById('quizOpcaoD').value = '';
    }
}

async function salvarLink() {
    const subtopicoId = document.getElementById('linkSubtopico').value;
    const nome = document.getElementById('linkNome').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    
    if (!subtopicoId || !nome || !url) {
        mostrarToast('Preencha todos os campos!', 'warning');
        return;
    }
    
    const { error } = await supabaseClient.from('links').insert({
        subtopico_id: subtopicoId,
        nome,
        url
    });
    
    if (error) {
        mostrarToast('Erro: ' + error.message, 'error');
    } else {
        mostrarToast('✅ Link salvo!', 'success');
        carregarLinks();
        carregarDashboard();
        document.getElementById('linkNome').value = '';
        document.getElementById('linkUrl').value = '';
    }
}

async function salvarConteudo() {
    const temaId = document.getElementById('conteudoTema').value;
    const subtopicoId = document.getElementById('conteudoSubtopicoid').value.trim();
    const nome = document.getElementById('conteudoNome').value.trim();
    const resumo = document.getElementById('conteudoResumo').value.trim();
    const completo = document.getElementById('conteudoCompleto').value.trim();
    const dica = document.getElementById('conteudoDica').value.trim();
    
    if (!temaId || !subtopicoId || !nome) {
        mostrarToast('Preencha tema, ID e nome!', 'warning');
        return;
    }
    
    const { error } = await supabaseClient.from('conteudos').upsert({
        tema_id: temaId,
        subtopico_id: subtopicoId,
        subtopico_nome: nome,
        resumo,
        conteudo_completo: completo,
        dica_desafio: dica
    }, { onConflict: 'subtopico_id' });
    
    if (error) {
        mostrarToast('Erro: ' + error.message, 'error');
    } else {
        mostrarToast('✅ Conteúdo salvo!', 'success');
        carregarDashboard();
    }
}

async function salvarTema() {
    const temaId = document.getElementById('temaId').value.trim();
    const temaNome = document.getElementById('temaNome').value.trim();
    const temaEmoji = document.getElementById('temaEmoji').value.trim() || '📚';
    
    if (!temaId || !temaNome) {
        mostrarToast('Preencha ID e nome do tema!', 'warning');
        return;
    }
    
    // Criar um subtópico placeholder para o tema existir
    const subtopicoId = temaId + '_inicial';
    
    const { error } = await supabaseClient.from('conteudos').upsert({
        tema_id: temaId,
        tema_nome: temaNome,
        tema_emoji: temaEmoji,
        subtopico_id: subtopicoId,
        subtopico_nome: 'Introdução',
        resumo: 'Conteúdo introdutório sobre ' + temaNome
    }, { onConflict: 'subtopico_id' });
    
    if (error) {
        mostrarToast('Erro: ' + error.message, 'error');
    } else {
        mostrarToast('✅ Tema criado! Agora adicione conteúdos a ele.', 'success');
        carregarTemas();
        carregarTodosSelects();
        carregarDashboard();
    }
}

// ========== EXCLUIR ==========

async function excluirQuiz(id) {
    if (!confirm('Excluir este quiz permanentemente?')) return;
    await supabaseClient.from('quizzes').delete().eq('id', id);
    carregarQuizzes();
    carregarDashboard();
    mostrarToast('Quiz excluído!', 'info');
}

async function excluirLink(id) {
    if (!confirm('Excluir este link?')) return;
    await supabaseClient.from('links').delete().eq('id', id);
    carregarLinks();
    carregarDashboard();
    mostrarToast('Link excluído!', 'info');
}

// ========== EXPORTAR ==========

async function exportarDados() {
    const [quizzes, links, conteudos] = await Promise.all([
        supabaseClient.from('quizzes').select('*'),
        supabaseClient.from('links').select('*'),
        supabaseClient.from('conteudos').select('*')
    ]);
    
    const dados = {
        quizzes: quizzes.data,
        links: links.data,
        conteudos: conteudos.data,
        exportado_em: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup_habitos_saudaveis_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarToast('✅ Dados exportados com sucesso!', 'success');
}

// ========== FECHAR ==========

function fecharAdmin() {
    const panel = document.getElementById('adminPanel');
    if (panel) panel.classList.remove('active');
}

// ========== BOTÃO ADMIN ==========

function adicionarBotaoAdmin() {
    // Remover botão existente se houver
    const existente = document.querySelector('.btn-admin-flutuante');
    if (existente) existente.remove();
    
    const btn = document.createElement('button');
    btn.className = 'btn-admin-flutuante';
    btn.innerHTML = '🔧';
    btn.title = 'Painel Administrativo';
    btn.onclick = abrirAdmin;
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        width: 55px;
        height: 55px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        font-size: 24px;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(102,126,234,0.4);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    document.body.appendChild(btn);
}

// ========== INICIALIZAÇÃO ==========

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        const isAdmin = await verificarAdmin();
        if (isAdmin) {
            adicionarBotaoAdmin();
            console.log('🔧 Painel Admin disponível! Clique no botão 🔧');
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
window.salvarTema = salvarTema;
window.excluirQuiz = excluirQuiz;
window.excluirLink = excluirLink;
window.atualizarSubtopicoSelect = atualizarSubtopicoSelect;
window.exportarDados = exportarDados;
window.adicionarBotaoAdmin = adicionarBotaoAdmin;
window.verificarAdmin = verificarAdmin;

console.log('🔧 Admin.js carregado! (v2.0 - Corrigido)');
