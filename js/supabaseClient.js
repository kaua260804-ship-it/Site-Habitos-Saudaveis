// ============================================
// CLIENTE SUPABASE - BANCO DE DADOS REAL
// ============================================

// Configuração do Supabase
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co'; // Substitua pelo seu
const SUPABASE_KEY = 'SEU_ANON_KEY'; // Substitua pela sua chave anon

let supabaseClient = null;

// Inicializar cliente Supabase
async function initSupabase() {
    try {
        // Carregar biblioteca dinamicamente
        if (!window.supabase) {
            await loadSupabaseScript();
        }
        
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase conectado!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar Supabase:', error);
        return false;
    }
}

// Carregar script do Supabase
function loadSupabaseScript() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ========== OPERAÇÕES DO BANCO ==========

// Salvar usuário
async function salvarUsuarioDB(usuario) {
    if (!supabaseClient) {
        console.error('Supabase não inicializado');
        return { sucesso: false, mensagem: 'Banco de dados offline' };
    }
    
    try {
        // Verificar se apelido existe
        const { data: existente } = await supabaseClient
            .from('usuarios')
            .select('apelido')
            .eq('apelido', usuario.apelido)
            .single();
        
        if (existente) {
            return { sucesso: false, mensagem: 'Apelido já existe!' };
        }
        
        // Inserir usuário
        const { data, error } = await supabaseClient
            .from('usuarios')
            .insert({
                nome: usuario.nome,
                apelido: usuario.apelido,
                idade: usuario.idade,
                senha: usuario.senha,
                pontos: 0,
                titulo: '🌿 Iniciante Saudável'
            })
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Usuário salvo:', data);
        return { sucesso: true, mensagem: 'Cadastro realizado!', dados: data };
        
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        return { sucesso: false, mensagem: 'Erro ao cadastrar' };
    }
}

// Buscar usuário para login
async function loginDB(apelido, senha) {
    if (!supabaseClient) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('apelido', apelido)
            .eq('senha', senha)
            .single();
        
        if (error || !data) return null;
        
        console.log('✅ Login realizado:', data.apelido);
        return data;
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        return null;
    }
}

// Atualizar pontos do usuário
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
                quizzes_completados: quizzesFeitos || [],
                atualizado_em: new Date()
            })
            .eq('apelido', apelido);
        
        if (error) throw error;
        
        // Atualizar view do ranking
        await supabaseClient.rpc('refresh_ranking');
        
        console.log('✅ Pontos atualizados:', novosPontos);
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar pontos:', error);
        return false;
    }
}

// Buscar ranking
async function buscarRankingDB() {
    if (!supabaseClient) return [];
    
    try {
        const { data, error } = await supabaseClient
            .from('ranking_view')
            .select('*')
            .order('posicao')
            .limit(50);
        
        if (error) throw error;
        
        console.log('✅ Ranking carregado:', data?.length || 0, 'usuários');
        return data || [];
        
    } catch (error) {
        console.error('❌ Erro ao buscar ranking:', error);
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
            .single();
        
        return data;
    } catch (error) {
        return null;
    }
}

// Função para sincronizar dados locais com banco
async function sincronizarDadosLocais(usuarioLocal) {
    if (!usuarioLocal || !supabaseClient) return;
    
    const dadosRemotos = await buscarUsuarioDB(usuarioLocal.apelido);
    
    if (dadosRemotos) {
        // Atualizar localStorage com dados mais recentes
        usuarioLocal.pontos = dadosRemotos.pontos;
        usuarioLocal.titulo = dadosRemotos.titulo;
        usuarioLocal.quizzes_completados = dadosRemotos.quizzes_completados || [];
        
        if (typeof salvarUsuarioAtual !== 'undefined') {
            salvarUsuarioAtual(usuarioLocal);
        }
    }
}

// Atualizar view do ranking (admin)
async function refreshRankingView() {
    if (!supabaseClient) return;
    
    try {
        await supabaseClient.rpc('refresh_ranking');
        console.log('✅ Ranking atualizado!');
    } catch (error) {
        console.error('❌ Erro ao atualizar ranking:', error);
    }
}

// Inicializar quando carregar
document.addEventListener('DOMContentLoaded', async () => {
    const conectado = await initSupabase();
    
    if (conectado) {
        // Sincronizar usuário logado
        if (typeof getUsuarioAtual !== 'undefined') {
            const usuario = getUsuarioAtual();
            if (usuario) {
                await sincronizarDadosLocais(usuario);
            }
        }
        
        // Atualizar interface
        if (typeof atualizarRanking !== 'undefined') {
            atualizarRanking();
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

console.log('☁️ SupabaseClient.js carregado!');