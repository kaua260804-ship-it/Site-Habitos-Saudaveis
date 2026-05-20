// ============================================
// PAINEL ADMIN - GERENCIAMENTO COMPLETO (V3.0 - COM EDIÇÃO)
// ============================================

let adminLogado = false;
let adminDados = null;
let editandoQuizId = null;
let editandoLinkId = null;
let editandoConteudoId = null;
let quizPagina = 0;
const QUIZ_POR_PAGINA = 10;

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
                    <p style="color: #718096; font-size: 14px;">Gerencie quizzes, links e conteúdos • ✏️ Clique em Editar para modificar</p>
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
                <div class="admin-form" id="formQuiz">
                    <h3 id="formQuizTitulo">➕ Adicionar Quiz</h3>
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
                            <input type="text" id="quizOpcaoC" placeholder="Resposta C (opcional)">
                        </div>
                        <div class="form-group">
                            <label>Opção D</label>
                            <input type="text" id="quizOpcaoD" placeholder="Resposta D (opcional)">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Resposta Correta (0=A, 1=B, 2=C, 3=D)</label>
                            <input type="number" id="quizCorreta" min="0" max="3" value="0">
                        </div>
                        <div class="form-group">
                            <label>Pontos</label>
                            <input type="number" id="quizPontos" value="10" min="1" max="100">
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-admin" id="btnSalvarQuiz" onclick="salvarQuiz()">
                            <i class="fas fa-save"></i> Salvar Quiz
                        </button>
                        <button class="btn-admin" id="btnCancelarQuiz" onclick="cancelarEdicaoQuiz()" style="display: none; background: #a0aec0;">
                            <i class="fas fa-times"></i> Cancelar Edição
                        </button>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 25px;">
                    <h3>📋 Quizzes Existentes</h3>
                    <div>
                        <input type="text" id="buscaQuiz" placeholder="🔍 Buscar quiz..." 
                               oninput="carregarQuizzes()" 
                               style="padding: 8px 15px; border-radius: 20px; border: 2px solid #e2e8f0; font-family: Poppins;">
                    </div>
                </div>
                <div id="listaQuizzes" style="overflow-x: auto;"></div>
                <div id="paginacaoQuizzes" style="text-align: center; margin-top: 15px;"></div>
            </div>
            
            <!-- Links -->
            <div class="admin-content" id="tab-links">
                <div class="admin-form" id="formLink">
                    <h3 id="formLinkTitulo">➕ Adicionar Link</h3>
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
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-admin" id="btnSalvarLink" onclick="salvarLink()">
                            <i class="fas fa-save"></i> Salvar Link
                        </button>
                        <button class="btn-admin" id="btnCancelarLink" onclick="cancelarEdicaoLink()" style="display: none; background: #a0aec0;">
                            <i class="fas fa-times"></i> Cancelar Edição
                        </button>
                    </div>
                </div>
                
                <h3 style="margin-top: 25px;">📋 Links Existentes</h3>
                <div id="listaLinks" style="overflow-x: auto;"></div>
            </div>
            
            <!-- Conteúdos -->
            <div class="admin-content" id="tab-conteudos">
                <div class="admin-form" id="formConteudo">
                    <h3 id="formConteudoTitulo">➕ Adicionar Conteúdo</h3>
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
                        <label>Resumo (aparece no card)</label>
                        <textarea id="conteudoResumo" placeholder="Resumo curto..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Conteúdo Completo</label>
                        <textarea id="conteudoCompleto" placeholder="Texto completo..." style="min-height: 120px;"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Dica/Desafio</label>
                        <input type="text" id="conteudoDica" placeholder="ex: DESAFIO: Beba 2L de água hoje!">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-admin" id="btnSalvarConteudo" onclick="salvarConteudo()">
                            <i class="fas fa-save"></i> Salvar Conteúdo
                        </button>
                        <button class="btn-admin" id="btnCancelarConteudo" onclick="cancelarEdicaoConteudo()" style="display: none; background: #a0aec0;">
                            <i class="fas fa-times"></i> Cancelar Edição
                        </button>
                    </div>
                </div>
                
                <h3 style="margin-top: 25px;">📋 Conteúdos Existentes</h3>
                <div id="listaConteudos" style="overflow-x: auto;"></div>
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
                
                <h3 style="margin-top: 25px;">📋 Temas Existentes</h3>
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
        
        if (temaId) query = query.eq('tema_id', temaId);
        
        const { data } = await query;
        
        select.innerHTML = '<option value="">Selecione um subtópico...</option>';
        data?.forEach(item => {
            select.innerHTML += `<option value="${item.subtopico_id}">${item.subtopico_nome} (${item.tema_nome})</option>`;
        });
        
    } catch (error) {
        console.error('Erro ao carregar subtópicos:', error);
    }
}

async function atualizarSubtopicoSelect(temaSelectId, subtopicoSelectId) {
    const temaId = document.getElementById(temaSelectId)?.value;
    if (!temaId) return;
    await carregarSubtopicosNoSelect(subtopicoSelectId, temaId);
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

// ========== CARREGAR LISTAS ==========

async function carregarQuizzes() {
    const busca = document.getElementById('buscaQuiz')?.value?.toLowerCase() || '';
    
    let query = supabaseClient
        .from('quizzes')
        .select('*', { count: 'exact' })
        .order('criado_em', { ascending: false });
    
    if (busca) {
        query = query.or(`pergunta.ilike.%${busca}%,subtopico_nome.ilike.%${busca}%`);
    }
    
    query = query.range(quizPagina * QUIZ_POR_PAGINA, (quizPagina + 1) * QUIZ_POR_PAGINA - 1);
    
    const { data, count } = await query;
    
    const container = document.getElementById('listaQuizzes');
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color: #718096; padding: 20px; text-align: center;">Nenhum quiz encontrado</p>';
        document.getElementById('paginacaoQuizzes').innerHTML = '';
        return;
    }
    
    let html = '<table class="admin-table"><tr><th>ID</th><th>Subtópico</th><th>Pergunta</th><th>Correta</th><th>Pts</th><th style="min-width: 140px;">Ações</th></tr>';
    data.forEach(q => {
        const opcoes = [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(o => o);
        const corretaLetra = String.fromCharCode(65 + q.correta);
        const corretaTexto = opcoes[q.correta] || '?';
        
        html += `
            <tr>
                <td><small>${q.id}</small></td>
                <td><small>${q.subtopico_nome || q.subtopico_id}</small></td>
                <td>${q.pergunta.substring(0, 50)}${q.pergunta.length > 50 ? '...' : ''}</td>
                <td><strong>${corretaLetra})</strong> ${corretaTexto.substring(0, 20)}</td>
                <td>${q.pontos}</td>
                <td style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="btn-admin" onclick="editarQuiz(${q.id})" style="padding: 5px 10px; font-size: 11px; background: #3b82f6;">
                        ✏️ Editar
                    </button>
                    <button class="btn-admin" onclick="duplicarQuiz(${q.id})" style="padding: 5px 10px; font-size: 11px; background: #8b5cf6;">
                        📋 Duplicar
                    </button>
                    <button class="btn-admin danger" onclick="excluirQuiz(${q.id})" style="padding: 5px 10px; font-size: 11px;">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
    html += '</table>';
    container.innerHTML = html;
    
    // Paginação
    const totalPaginas = Math.ceil((count || 0) / QUIZ_POR_PAGINA);
    let pagHtml = '';
    if (totalPaginas > 1) {
        pagHtml += `<button onclick="quizPagina=0;carregarQuizzes()" ${quizPagina === 0 ? 'disabled' : ''} style="padding: 5px 15px; margin: 0 5px; border-radius: 20px; border: none; cursor: pointer;">⏮️</button>`;
        pagHtml += `<button onclick="quizPagina=${Math.max(0, quizPagina - 1)};carregarQuizzes()" ${quizPagina === 0 ? 'disabled' : ''} style="padding: 5px 15px; margin: 0 5px; border-radius: 20px; border: none; cursor: pointer;">◀️</button>`;
        pagHtml += `<span style="margin: 0 10px; color: #4a5568;">Pág ${quizPagina + 1} de ${totalPaginas}</span>`;
        pagHtml += `<button onclick="quizPagina=${Math.min(totalPaginas - 1, quizPagina + 1)};carregarQuizzes()" ${quizPagina >= totalPaginas - 1 ? 'disabled' : ''} style="padding: 5px 15px; margin: 0 5px; border-radius: 20px; border: none; cursor: pointer;">▶️</button>`;
        pagHtml += `<button onclick="quizPagina=${totalPaginas - 1};carregarQuizzes()" ${quizPagina >= totalPaginas - 1 ? 'disabled' : ''} style="padding: 5px 15px; margin: 0 5px; border-radius: 20px; border: none; cursor: pointer;">⏭️</button>`;
    }
    document.getElementById('paginacaoQuizzes').innerHTML = pagHtml;
}

async function carregarLinks() {
    const { data } = await supabaseClient
        .from('links')
        .select('*')
        .order('criado_em', { ascending: false });
    
    const container = document.getElementById('listaLinks');
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color: #718096; padding: 20px; text-align: center;">Nenhum link cadastrado</p>';
        return;
    }
    
    let html = '<table class="admin-table"><tr><th>ID</th><th>Subtópico</th><th>Nome</th><th>URL</th><th style="min-width: 100px;">Ações</th></tr>';
    data.forEach(l => {
        html += `
            <tr>
                <td><small>${l.id}</small></td>
                <td><small>${l.subtopico_id}</small></td>
                <td>${l.nome}</td>
                <td><a href="${l.url}" target="_blank" style="color: #667eea;">🔗 Abrir</a></td>
                <td style="display: flex; gap: 5px;">
                    <button class="btn-admin" onclick="editarLink(${l.id})" style="padding: 5px 10px; font-size: 11px; background: #3b82f6;">
                        ✏️
                    </button>
                    <button class="btn-admin danger" onclick="excluirLink(${l.id})" style="padding: 5px 10px; font-size: 11px;">
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
        .order('tema_id')
        .order('ordem');
    
    const container = document.getElementById('listaConteudos');
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color: #718096; padding: 20px; text-align: center;">Nenhum conteúdo cadastrado</p>';
        return;
    }
    
    let html = '<table class="admin-table"><tr><th>ID</th><th>Tema</th><th>Subtópico</th><th>Resumo</th><th style="min-width: 100px;">Ações</th></tr>';
    data.forEach(c => {
        html += `
            <tr>
                <td><small>${c.id}</small></td>
                <td>${c.tema_emoji || ''} ${c.tema_nome}</td>
                <td><strong>${c.subtopico_nome}</strong><br><small>${c.subtopico_id}</small></td>
                <td>${(c.resumo || '').substring(0, 60)}...</td>
                <td style="display: flex; gap: 5px;">
                    <button class="btn-admin" onclick="editarConteudo(${c.id})" style="padding: 5px 10px; font-size: 11px; background: #3b82f6;">
                        ✏️
                    </button>
                    <button class="btn-admin danger" onclick="excluirConteudo(${c.id})" style="padding: 5px 10px; font-size: 11px;">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
    html += '</table>';
    container.innerHTML = html;
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
        container.innerHTML = '<p style="color: #718096; padding: 20px; text-align: center;">Nenhum tema cadastrado</p>';
        return;
    }
    
    let html = '<table class="admin-table"><tr><th>ID</th><th>Nome</th><th>Emoji</th><th>Subtópicos</th></tr>';
    temasUnicos.forEach(t => {
        const numSubtopicos = data?.filter(d => d.tema_id === t.tema_id).length || 0;
        html += `
            <tr>
                <td><code>${t.tema_id}</code></td>
                <td>${t.tema_nome}</td>
                <td style="font-size: 30px;">${t.tema_emoji || '📚'}</td>
                <td>${numSubtopicos}</td>
            </tr>
        `;
    });
    html += '</table>';
    container.innerHTML = html;
}

// ========== EDITAR ==========

async function editarQuiz(id) {
    const { data } = await supabaseClient.from('quizzes').select('*').eq('id', id).single();
    if (!data) return;
    
    editandoQuizId = id;
    
    // Rolar para o formulário
    document.getElementById('formQuiz').scrollIntoView({ behavior: 'smooth' });
    
    // Atualizar título
    document.getElementById('formQuizTitulo').innerHTML = '✏️ <b>Editando Quiz #' + id + '</b>';
    document.getElementById('btnSalvarQuiz').innerHTML = '<i class="fas fa-save"></i> Atualizar Quiz';
    document.getElementById('btnCancelarQuiz').style.display = 'inline-flex';
    
    // Preencher campos
    document.getElementById('quizTema').value = data.tema || '';
    await atualizarSubtopicoSelect('quizTema', 'quizSubtopico');
    setTimeout(() => {
        document.getElementById('quizSubtopico').value = data.subtopico_id || '';
    }, 500);
    
    document.getElementById('quizPergunta').value = data.pergunta || '';
    document.getElementById('quizOpcaoA').value = data.opcao_a || '';
    document.getElementById('quizOpcaoB').value = data.opcao_b || '';
    document.getElementById('quizOpcaoC').value = data.opcao_c || '';
    document.getElementById('quizOpcaoD').value = data.opcao_d || '';
    document.getElementById('quizCorreta').value = data.correta || 0;
    document.getElementById('quizPontos').value = data.pontos || 10;
}

async function editarLink(id) {
    const { data } = await supabaseClient.from('links').select('*').eq('id', id).single();
    if (!data) return;
    
    editandoLinkId = id;
    
    document.getElementById('formLink').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('formLinkTitulo').innerHTML = '✏️ <b>Editando Link #' + id + '</b>';
    document.getElementById('btnSalvarLink').innerHTML = '<i class="fas fa-save"></i> Atualizar Link';
    document.getElementById('btnCancelarLink').style.display = 'inline-flex';
    
    document.getElementById('linkSubtopico').value = data.subtopico_id || '';
    document.getElementById('linkNome').value = data.nome || '';
    document.getElementById('linkUrl').value = data.url || '';
}

async function editarConteudo(id) {
    const { data } = await supabaseClient.from('conteudos').select('*').eq('id', id).single();
    if (!data) return;
    
    editandoConteudoId = id;
    
    document.getElementById('formConteudo').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('formConteudoTitulo').innerHTML = '✏️ <b>Editando Conteúdo #' + id + '</b>';
    document.getElementById('btnSalvarConteudo').innerHTML = '<i class="fas fa-save"></i> Atualizar Conteúdo';
    document.getElementById('btnCancelarConteudo').style.display = 'inline-flex';
    
    document.getElementById('conteudoTema').value = data.tema_id || '';
    document.getElementById('conteudoSubtopicoid').value = data.subtopico_id || '';
    document.getElementById('conteudoNome').value = data.subtopico_nome || '';
    document.getElementById('conteudoResumo').value = data.resumo || '';
    document.getElementById('conteudoCompleto').value = data.conteudo_completo || '';
    document.getElementById('conteudoDica').value = data.dica_desafio || '';
}

// ========== CANCELAR EDIÇÃO ==========

function cancelarEdicaoQuiz() {
    editandoQuizId = null;
    document.getElementById('formQuizTitulo').innerHTML = '➕ Adicionar Quiz';
    document.getElementById('btnSalvarQuiz').innerHTML = '<i class="fas fa-save"></i> Salvar Quiz';
    document.getElementById('btnCancelarQuiz').style.display = 'none';
    limparFormQuiz();
    document.getElementById('quizTema').scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicaoLink() {
    editandoLinkId = null;
    document.getElementById('formLinkTitulo').innerHTML = '➕ Adicionar Link';
    document.getElementById('btnSalvarLink').innerHTML = '<i class="fas fa-save"></i> Salvar Link';
    document.getElementById('btnCancelarLink').style.display = 'none';
    document.getElementById('linkNome').value = '';
    document.getElementById('linkUrl').value = '';
}

function cancelarEdicaoConteudo() {
    editandoConteudoId = null;
    document.getElementById('formConteudoTitulo').innerHTML = '➕ Adicionar Conteúdo';
    document.getElementById('btnSalvarConteudo').innerHTML = '<i class="fas fa-save"></i> Salvar Conteúdo';
    document.getElementById('btnCancelarConteudo').style.display = 'none';
    document.getElementById('conteudoSubtopicoid').value = '';
    document.getElementById('conteudoNome').value = '';
    document.getElementById('conteudoResumo').value = '';
    document.getElementById('conteudoCompleto').value = '';
    document.getElementById('conteudoDica').value = '';
}

function limparFormQuiz() {
    document.getElementById('quizPergunta').value = '';
    document.getElementById('quizOpcaoA').value = '';
    document.getElementById('quizOpcaoB').value = '';
    document.getElementById('quizOpcaoC').value = '';
    document.getElementById('quizOpcaoD').value = '';
    document.getElementById('quizCorreta').value = '0';
    document.getElementById('quizPontos').value = '10';
}

// ========== SALVAR (CRIAR OU ATUALIZAR) ==========

async function salvarQuiz() {
    const tema = document.getElementById('quizTema').value;
    const subtopicoId = document.getElementById('quizSubtopico').value;
    const subtopicoNome = document.getElementById('quizSubtopico').selectedOptions[0]?.text?.split(' (')[0] || '';
    const pergunta = document.getElementById('quizPergunta').value.trim();
    const opcaoA = document.getElementById('quizOpcaoA').value.trim();
    const opcaoB = document.getElementById('quizOpcaoB').value.trim();
    const opcaoC = document.getElementById('quizOpcaoC').value.trim();
    const opcaoD = document.getElementById('quizOpcaoD').value.trim();
    const correta = parseInt(document.getElementById('quizCorreta').value);
    const pontos = parseInt(document.getElementById('quizPontos').value);
    
    if (!tema || !subtopicoId || !pergunta || !opcaoA || !opcaoB) {
        mostrarToast('Preencha tema, subtópico, pergunta, opção A e B!', 'warning');
        return;
    }
    
    const dados = {
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
    };
    
    let resultado;
    
    if (editandoQuizId) {
        // Atualizar existente
        resultado = await supabaseClient.from('quizzes').update(dados).eq('id', editandoQuizId);
    } else {
        // Criar novo
        resultado = await supabaseClient.from('quizzes').insert(dados);
    }
    
    if (resultado.error) {
        mostrarToast('Erro: ' + resultado.error.message, 'error');
    } else {
        mostrarToast(editandoQuizId ? '✅ Quiz atualizado!' : '✅ Quiz criado!', 'success');
        cancelarEdicaoQuiz();
        carregarQuizzes();
        carregarDashboard();
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
    
    const dados = { subtopico_id: subtopicoId, nome, url };
    let resultado;
    
    if (editandoLinkId) {
        resultado = await supabaseClient.from('links').update(dados).eq('id', editandoLinkId);
    } else {
        resultado = await supabaseClient.from('links').insert(dados);
    }
    
    if (resultado.error) {
        mostrarToast('Erro: ' + resultado.error.message, 'error');
    } else {
        mostrarToast(editandoLinkId ? '✅ Link atualizado!' : '✅ Link criado!', 'success');
        cancelarEdicaoLink();
        carregarLinks();
        carregarDashboard();
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
    
    const dados = {
        tema_id: temaId,
        subtopico_id: subtopicoId,
        subtopico_nome: nome,
        resumo,
        conteudo_completo: completo,
        dica_desafio: dica
    };
    
    let resultado;
    
    if (editandoConteudoId) {
        resultado = await supabaseClient.from('conteudos').update(dados).eq('id', editandoConteudoId);
    } else {
        resultado = await supabaseClient.from('conteudos').upsert(dados, { onConflict: 'subtopico_id' });
    }
    
    if (resultado.error) {
        mostrarToast('Erro: ' + resultado.error.message, 'error');
    } else {
        mostrarToast(editandoConteudoId ? '✅ Conteúdo atualizado!' : '✅ Conteúdo criado!', 'success');
        cancelarEdicaoConteudo();
        carregarConteudos();
        carregarDashboard();
        carregarTodosSelects();
    }
}

// ========== DUPLICAR ==========

async function duplicarQuiz(id) {
    const { data } = await supabaseClient.from('quizzes').select('*').eq('id', id).single();
    if (!data) return;
    
    const { error } = await supabaseClient.from('quizzes').insert({
        subtopico_id: data.subtopico_id,
        tema: data.tema,
        subtopico_nome: data.subtopico_nome,
        pergunta: data.pergunta + ' (CÓPIA)',
        opcao_a: data.opcao_a,
        opcao_b: data.opcao_b,
        opcao_c: data.opcao_c,
        opcao_d: data.opcao_d,
        correta: data.correta,
        pontos: data.pontos
    });
    
    if (error) {
        mostrarToast('Erro ao duplicar: ' + error.message, 'error');
    } else {
        mostrarToast('✅ Quiz duplicado!', 'success');
        carregarQuizzes();
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

async function excluirConteudo(id) {
    if (!confirm('Excluir este conteúdo? Isso NÃO remove quizzes vinculados.')) return;
    await supabaseClient.from('conteudos').delete().eq('id', id);
    carregarConteudos();
    carregarDashboard();
    carregarTodosSelects();
    mostrarToast('Conteúdo excluído!', 'info');
}

// ========== TEMAS ==========

async function salvarTema() {
    const temaId = document.getElementById('temaId').value.trim();
    const temaNome = document.getElementById('temaNome').value.trim();
    const temaEmoji = document.getElementById('temaEmoji').value.trim() || '📚';
    
    if (!temaId || !temaNome) {
        mostrarToast('Preencha ID e nome do tema!', 'warning');
        return;
    }
    
    const { error } = await supabaseClient.from('conteudos').upsert({
        tema_id: temaId,
        tema_nome: temaNome,
        tema_emoji: temaEmoji,
        subtopico_id: temaId + '_inicial',
        subtopico_nome: 'Introdução',
        resumo: 'Conteúdo introdutório sobre ' + temaNome
    }, { onConflict: 'subtopico_id' });
    
    if (error) {
        mostrarToast('Erro: ' + error.message, 'error');
    } else {
        mostrarToast('✅ Tema criado!', 'success');
        carregarTemas();
        carregarTodosSelects();
        carregarDashboard();
        document.getElementById('temaId').value = '';
        document.getElementById('temaNome').value = '';
        document.getElementById('temaEmoji').value = '';
    }
}

// ========== DASHBOARD ==========

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
    
    mostrarToast('✅ Dados exportados!', 'success');
}

// ========== FECHAR ==========

function fecharAdmin() {
    document.getElementById('adminPanel').classList.remove('active');
}

// ========== BOTÃO ADMIN ==========

function adicionarBotaoAdmin() {
    const existente = document.querySelector('.btn-admin-flutuante');
    if (existente) existente.remove();
    
    const btn = document.createElement('button');
    btn.className = 'btn-admin-flutuante';
    btn.innerHTML = '🔧';
    btn.title = 'Painel Administrativo';
    btn.onclick = abrirAdmin;
    btn.style.cssText = `
        position: fixed; bottom: 20px; left: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white; width: 55px; height: 55px;
        border-radius: 50%; border: none; cursor: pointer;
        font-size: 24px; z-index: 9999;
        box-shadow: 0 4px 15px rgba(102,126,234,0.4);
        transition: all 0.3s ease;
        display: flex; align-items: center; justify-content: center;
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
            console.log('🔧 Painel Admin disponível!');
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
window.editarQuiz = editarQuiz;
window.editarLink = editarLink;
window.editarConteudo = editarConteudo;
window.duplicarQuiz = duplicarQuiz;
window.cancelarEdicaoQuiz = cancelarEdicaoQuiz;
window.cancelarEdicaoLink = cancelarEdicaoLink;
window.cancelarEdicaoConteudo = cancelarEdicaoConteudo;
window.excluirQuiz = excluirQuiz;
window.excluirLink = excluirLink;
window.excluirConteudo = excluirConteudo;
window.atualizarSubtopicoSelect = atualizarSubtopicoSelect;
window.exportarDados = exportarDados;
window.adicionarBotaoAdmin = adicionarBotaoAdmin;
window.verificarAdmin = verificarAdmin;

console.log('🔧 Admin.js carregado! (v3.0 - Com edição)');
