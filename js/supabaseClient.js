// ============================================
// CLIENTE SUPABASE - BANCO DE DADOS REAL
// ============================================

// Configuração do Supabase - SEUS DADOS REAIS
const SUPABASE_URL = 'https://ejldlvlacidyzizxucdr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YDWCWLgn0t9wrayWljnnaA_immbdkj8';

let supabaseClient = null;

// Inicializar cliente Supabase
async function initSupabase() {
    try {
        // Carregar biblioteca dinamicamente
        if (!window.supabase) {
            await loadSupabaseScript();
        }
        
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // Testar conexão
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('count')
            .limit(1);
        
        if (error) {
            console.warn('⚠️ Tabela "usuarios" não encontrada. Execute o SQL primeiro!');
            console.warn('Usando modo offline (localStorage)');
            return false;
        }
        
        console.log('✅ Supabase conectado com sucesso!');
        console.log(`📊 Projeto: ${SUPABASE_URL}`);
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao conectar Supabase:', error.message);
        console.warn('Usando modo offline (localStorage)');
        return false;
    }
}

// Carregar script do Supabase
function loadSupabaseScript() {
    return new Promise((resolve, reject) => {
        // Verificar se já está carregado
        if (window.supabase) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            console.log('📦 Supabase JS carregado');
            resolve();
        };
        script.onerror = () => reject(new Error('Falha ao carregar Supabase'));
        document.head.appendChild(script);
    });
}

// ========== OPERAÇÕES DO BANCO ==========

// Salvar usuário
async function salvarUsuarioDB(usuario) {
    if (!supabaseClient) {
        console.warn('⚠️ Supabase offline, usando localStorage');
        return { sucesso: false, mensagem: 'Modo offline' };
    }
    
    try {
        // Verificar se apelido já existe
        const { data: existente } = await supabaseClient
            .from('usuarios')
            .select('apelido')
            .eq('apelido', usuario.apelido)
            .maybeSingle();
        
        if (existente) {
            return { sucesso: false, mensagem: 'Apelido já existe! Escolha outro.' };
        }
        
        // Inserir novo usuário
        const { data, error } = await supabaseClient
            .from('usuarios')
            .insert({
                nome: usuario.nome,
                apelido: usuario.apelido,
                idade: usuario.idade,
                senha: usuario.senha,
                pontos: usuario.pontos || 0,
                titulo: usuario.titulo || '🌿 Iniciante Saudável',
                quizzes_completados: usuario.quizzes_completados || []
            })
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Usuário salvo no Supabase:', data.apelido);
        
        // Atualizar ranking
        await refreshRankingView();
        
        return { sucesso: true, mensagem: 'Cadastro realizado com sucesso!', dados: data };
        
    } catch (error) {
        console.error('❌ Erro ao salvar usuário:', error.message);
        return { sucesso: false, mensagem: 'Erro ao cadastrar. Tente novamente.' };
    }
}

// Login
async function loginDB(apelido, senha) {
    if (!supabaseClient) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('apelido', apelido)
            .eq('senha', senha)
            .maybeSingle();
        
        if (error) throw error;
        if (!data) return null;
        
        console.log('✅ Login realizado:', data.apelido);
        return data;
        
    } catch (error) {
        console.error('❌ Erro no login:', error.message);
        return null;
    }
}

// Atualizar pontos
async function atualizarPontosDB(apelido, novosPontos, quizzesFeitos) {
    if (!supabaseClient) return false;
    
    try {
        // Calcular novo título
        let novoTitulo = '🌿 Iniciante Saudável';
        if (novosPontos >= 1000) novoTitulo = '👑 Mestre da Saúde Supremo';
        else if (novosPontos >= 500) novoTitulo = '🫡 Capitão Saúde';
        else if (novosPontos >= 250) novoTitulo = '💪 Farmou Aura no Exercício';
        else if (novosPontos >= 100) novoTitulo = '🍎 Six Seven do Alimentos';
        
        const { error } = await supabaseClient
            .from('usuarios')
            .update({
                pontos: novosPontos,
                titulo: novoTitulo,
                quizzes_completados: quizzesFeitos || []
            })
            .eq('apelido', apelido);
        
        if (error) throw error;
        
        // Atualizar view do ranking
        await refreshRankingView();
        
        console.log('✅ Pontos atualizados:', novosPontos, '- Título:', novoTitulo);
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar pontos:', error.message);
        return false;
    }
}

// Buscar ranking
async function buscarRankingDB() {
    if (!supabaseClient) return [];
    
    try {
        // Primeiro tenta usar a view materializada
        const { data, error } = await supabaseClient
            .from('ranking_view')
            .select('*')
            .order('posicao')
            .limit(50);
        
        if (!error && data) {
            console.log('✅ Ranking carregado:', data.length, 'jogadores');
            return data;
        }
        
        // Fallback: buscar direto da tabela
        console.warn('⚠️ View não encontrada, buscando direto da tabela...');
        const { data: usuarios, error: err2 } = await supabaseClient
            .from('usuarios')
            .select('apelido, nome, idade, pontos, titulo, quizzes_completados')
            .order('pontos', { ascending: false })
            .limit(50);
        
        if (err2) throw err2;
        
        // Formatar como a view
        const ranking = (usuarios || []).map((u, idx) => ({
            ...u,
            posicao: idx + 1,
            quizzes_feitos: u.quizzes_completados ? u.quizzes_completados.length : 0
        }));
        
        console.log('✅ Ranking carregado (tabela):', ranking.length, 'jogadores');
        return ranking;
        
    } catch (error) {
        console.error('❌ Erro ao buscar ranking:', error.message);
        return [];
    }
}

// Buscar usuário por apelido
async function buscarUsuarioDB(apelido) {
    if (!supabaseClient) return null;
    
    try {
        const { data } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('apelido', apelido)
            .maybeSingle();
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error.message);
        return null;
    }
}

// Sincronizar dados
async function sincronizarDadosLocais(usuarioLocal) {
    if (!usuarioLocal || !supabaseClient) return;
    
    try {
        const dadosRemotos = await buscarUsuarioDB(usuarioLocal.apelido);
        
        if (dadosRemotos) {
            usuarioLocal.pontos = dadosRemotos.pontos || 0;
            usuarioLocal.titulo = dadosRemotos.titulo || '🌿 Iniciante Saudável';
            usuarioLocal.quizzes_completados = dadosRemotos.quizzes_completados || [];
            
            if (typeof salvarUsuarioAtual !== 'undefined') {
                salvarUsuarioAtual(usuarioLocal);
            }
            console.log('✅ Dados sincronizados com Supabase');
        }
    } catch (error) {
        console.warn('⚠️ Erro na sincronização:', error.message);
    }
}

// Atualizar view do ranking
async function refreshRankingView() {
    if (!supabaseClient) return;
    
    try {
        // Tentar usar a função RPC
        const { error } = await supabaseClient.rpc('refresh_ranking');
        if (error) {
            // Se não existir, tenta criar a view
            console.warn('⚠️ Função refresh_ranking não encontrada');
        } else {
            console.log('✅ Ranking atualizado!');
        }
    } catch (error) {
        console.warn('⚠️ Erro ao atualizar view:', error.message);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔌 Conectando ao Supabase...');
    const conectado = await initSupabase();
    
    // Atualizar indicador de status
    const statusEl = document.getElementById('statusConexao');
    if (statusEl) {
        if (conectado) {
            statusEl.innerHTML = '<i class="fas fa-circle" style="color: #48bb78;"></i> 🟢 Modo Online';
            statusEl.style.color = '#48bb78';
        } else {
            statusEl.innerHTML = '<i class="fas fa-circle" style="color: #f59e0b;"></i> 🟡 Modo Offline';
            statusEl.style.color = '#f59e0b';
        }
    }
    
    if (conectado) {
        // Sincronizar usuário logado
        const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
        if (usuario) {
            await sincronizarDadosLocais(usuario);
        }
        
        // Atualizar interface
        if (typeof atualizarRanking !== 'undefined') {
            await atualizarRanking();
        }
        if (typeof atualizarHeader !== 'undefined') {
            atualizarHeader();
        }
    }
});

// Exportar funções
window.salvarUsuarioDB = salvarUsuarioDB;
window.loginDB = loginDB;
window.atualizarPontosDB = atualizarPontosDB;
window.buscarRankingDB = buscarRankingDB;
window.buscarUsuarioDB = buscarUsuarioDB;
window.sincronizarDadosLocais = sincronizarDadosLocais;
window.initSupabase = initSupabase;
window.refreshRankingView = refreshRankingView;

console.log('☁️ SupabaseClient.js carregado com sucesso!');
