// ============================================
// CLIENTE SUPABASE - BANCO DE DADOS REAL (DEBUG)
// ============================================

const SUPABASE_URL = 'https://ejldlvlacidyzizxucdr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YDWCWLgn0t9wrayWljnnaA_immbdkj8';

let supabaseClient = null;

async function initSupabase() {
    try {
        if (!window.supabase) {
            await loadSupabaseScript();
        }
        
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // TESTE RÁPIDO
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('apelido')
            .limit(1);
        
        if (error) {
            console.error('❌ Erro na consulta:', error.message);
            console.error('Detalhes:', error);
            return false;
        }
        
        console.log('✅ Supabase conectado!');
        console.log('📊 Dados encontrados:', data?.length || 0);
        return true;
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return false;
    }
}

function loadSupabaseScript() {
    return new Promise((resolve, reject) => {
        if (window.supabase) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Script não carregou'));
        document.head.appendChild(script);
    });
}

// ========== LOGIN CORRIGIDO ==========
async function loginDB(apelido, senha) {
    if (!supabaseClient) {
        console.error('❌ Supabase não inicializado');
        return null;
    }
    
    try {
        console.log('🔍 Buscando usuário:', apelido);
        
        // Buscar SEM verificar senha primeiro (para debug)
        const { data: usuarioExiste, error: errExiste } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('apelido', apelido)
            .maybeSingle();
        
        if (errExiste) {
            console.error('❌ Erro na busca:', errExiste.message);
            return null;
        }
        
        if (!usuarioExiste) {
            console.log('❌ Usuário não encontrado:', apelido);
            console.log('💡 Apelidos disponíveis: (execute SELECT apelido FROM usuarios)');
            return null;
        }
        
        console.log('✅ Usuário encontrado:', usuarioExiste.apelido);
        console.log('🔑 Verificando senha...');
        
        // Agora verifica a senha
        if (usuarioExiste.senha === senha) {
            console.log('✅ SENHA CORRETA! Login autorizado');
            return usuarioExiste;
        } else {
            console.log('❌ SENHA INCORRETA');
            console.log('💡 Senha esperada: ' + usuarioExiste.senha);
            console.log('💡 Senha digitada: ' + senha);
            return null;
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return null;
    }
}

// ========== SALVAR USUÁRIO ==========
async function salvarUsuarioDB(usuario) {
    if (!supabaseClient) {
        return { sucesso: false, mensagem: 'Banco offline' };
    }
    
    try {
        // Verificar se existe
        const { data: existente } = await supabaseClient
            .from('usuarios')
            .select('apelido')
            .eq('apelido', usuario.apelido)
            .maybeSingle();
        
        if (existente) {
            return { sucesso: false, mensagem: 'Apelido já existe!' };
        }
        
        // Inserir
        const { data, error } = await supabaseClient
            .from('usuarios')
            .insert({
                nome: usuario.nome,
                apelido: usuario.apelido,
                idade: usuario.idade,
                senha: usuario.senha,
                pontos: 0,
                titulo: '🌿 Iniciante Saudável',
                quizzes_completados: []
            })
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Usuário criado:', data.apelido);
        return { sucesso: true, mensagem: 'Cadastro realizado!', dados: data };
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return { sucesso: false, mensagem: error.message };
    }
}

// ========== ATUALIZAR PONTOS ==========
async function atualizarPontosDB(apelido, novosPontos, quizzesFeitos) {
    if (!supabaseClient) return false;
    
    try {
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
        
        console.log('✅ Pontos atualizados:', novosPontos);
        return true;
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return false;
    }
}

// ========== BUSCAR RANKING ==========
async function buscarRankingDB() {
    if (!supabaseClient) return [];
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('apelido, nome, idade, pontos, titulo, quizzes_completados')
            .order('pontos', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        
        const ranking = (data || []).map((u, idx) => ({
            ...u,
            posicao: idx + 1,
            quizzes_feitos: u.quizzes_completados ? u.quizzes_completados.length : 0
        }));
        
        console.log('✅ Ranking:', ranking.length, 'jogadores');
        return ranking;
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return [];
    }
}

// ========== SINCRONIZAR ==========
async function sincronizarDadosLocais(usuarioLocal) {
    if (!usuarioLocal || !supabaseClient) return;
    
    try {
        const { data } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('apelido', usuarioLocal.apelido)
            .maybeSingle();
        
        if (data) {
            usuarioLocal.pontos = data.pontos || 0;
            usuarioLocal.titulo = data.titulo || '🌿 Iniciante Saudável';
            usuarioLocal.quizzes_completados = data.quizzes_completados || [];
            
            if (typeof salvarUsuarioAtual !== 'undefined') {
                salvarUsuarioAtual(usuarioLocal);
            }
            console.log('✅ Sincronizado');
        }
    } catch (error) {
        console.warn('⚠️ Erro:', error.message);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔌 Conectando ao Supabase...');
    const conectado = await initSupabase();
    
    const statusEl = document.getElementById('statusConexao');
    if (statusEl) {
        statusEl.innerHTML = conectado 
            ? '<i class="fas fa-circle" style="color: #48bb78;"></i> 🟢 Online'
            : '<i class="fas fa-circle" style="color: #f59e0b;"></i> 🟡 Offline';
    }
    
    if (conectado) {
        const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
        if (usuario) {
            await sincronizarDadosLocais(usuario);
        }
        if (typeof atualizarRanking !== 'undefined') {
            await atualizarRanking();
        }
        if (typeof atualizarHeader !== 'undefined') {
            atualizarHeader();
        }
    }
});

window.salvarUsuarioDB = salvarUsuarioDB;
window.loginDB = loginDB;
window.atualizarPontosDB = atualizarPontosDB;
window.buscarRankingDB = buscarRankingDB;
window.sincronizarDadosLocais = sincronizarDadosLocais;
window.initSupabase = initSupabase;

console.log('☁️ SupabaseClient.js carregado! (v3.0 - Debug)');
