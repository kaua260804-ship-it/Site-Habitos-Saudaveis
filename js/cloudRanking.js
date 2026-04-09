// ============================================
// RANKING ONLINE COM GOOGLE SHEETS
// CONFIGURADO PARA SUA PLANILHA E APPS SCRIPT
// ============================================

// SUAS CONFIGURAÇÕES
const SHEET_ID = "1sbQFgBWe5JfgCkmHx48_4RXKMlVmwxc1seqAvIFYobc";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMrh75U3Z-Dmr7ZoMX206UOaFi9hVdvpjjhRm2eWCgKGKO2RDhvKjoqgIjN3arG9Vu/exec";

// Cache do ranking
let rankingCache = [];
let ultimaAtualizacao = 0;
const CACHE_TTL = 30000; // 30 segundos

// ============================================
// BUSCAR RANKING ONLINE
// ============================================
async function buscarRankingOnline() {
    // Usar cache se estiver fresco
    if (Date.now() - ultimaAtualizacao < CACHE_TTL && rankingCache.length > 0) {
        console.log("Usando cache do ranking:", rankingCache.length, "usuarios");
        return rankingCache;
    }
    
    try {
        console.log("Buscando ranking online da planilha...");
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Extrair JSON do formato do Google
        const jsonStart = text.indexOf('(');
        const jsonEnd = text.lastIndexOf(')');
        const jsonText = text.substring(jsonStart + 1, jsonEnd);
        const data = JSON.parse(jsonText);
        
        const ranking = [];
        const rows = data.table.rows;
        
        console.log("Total de linhas encontradas:", rows.length);
        
        // Pular cabeçalho (linha 0)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].c;
            if (row && row[0] && row[0].v) {
                ranking.push({
                    apelido: row[0]?.v || "",
                    nome: row[1]?.v || "",
                    idade: row[2]?.v || 0,
                    pontos: row[3]?.v || 0,
                    data_atualizacao: row[4]?.v || "",
                    quizzes_feitos: row[5]?.v || 0
                });
            }
        }
        
        // Ordenar por pontos (maior para menor)
        ranking.sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
        
        // Atualizar cache
        rankingCache = ranking;
        ultimaAtualizacao = Date.now();
        
        console.log("Ranking carregado:", ranking.length, "usuarios");
        if (ranking.length > 0) {
            console.log("Top 3:", ranking.slice(0, 3));
        }
        return ranking;
        
    } catch (error) {
        console.error("Erro ao buscar ranking online:", error);
        return rankingCache;
    }
}

// ============================================
// SALVAR PONTUACAO ONLINE
// ============================================
async function salvarPontuacaoOnline(usuario) {
    if (!usuario || !usuario.apelido) {
        console.error("Usuario invalido para salvar");
        return false;
    }
    
    try {
        console.log("Salvando pontuacao online para:", usuario.apelido, "pontos:", usuario.pontos);
        
        // Preparar dados
        const dados = {
            apelido: usuario.apelido,
            nome: usuario.nome || "",
            idade: usuario.idade || 0,
            pontos: usuario.pontos || 0,
            quizzes_feitos: usuario.quizzes_feitos || 0,
            data_atualizacao: new Date().toISOString()
        };
        
        // Enviar para o Google Apps Script
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });
        
        // Invalidar cache para forcar recarga
        ultimaAtualizacao = 0;
        
        console.log("Pontuacao salva com sucesso!");
        return true;
        
    } catch (error) {
        console.error("Erro ao salvar pontuacao:", error);
        return false;
    }
}

// ============================================
// ATUALIZAR RANKING NA INTERFACE
// ============================================
async function atualizarRankingOnline() {
    console.log("Atualizando ranking online na interface...");
    const ranking = await buscarRankingOnline();
    const lista = document.getElementById("rankingList");
    const usuarioAtual = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    
    if (!lista) {
        console.error("Elemento rankingList nao encontrado");
        return;
    }
    
    lista.innerHTML = "";
    
    if (!ranking || ranking.length === 0) {
        lista.innerHTML = '<li><i class="fas fa-star"></i> ✨ Ninguem no ranking ainda</li>';
        console.log("Ranking vazio");
        return;
    }
    
    console.log("Exibindo ranking com", ranking.length, "usuarios");
    
    for (let i = 0; i < Math.min(ranking.length, 20); i++) {
        const jogador = ranking[i];
        const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i+1) + "º";
        const isCurrentUser = usuarioAtual && usuarioAtual.apelido === jogador.apelido;
        
        const li = document.createElement("li");
        li.className = isCurrentUser ? "current-player-row" : "";
        li.innerHTML = `
            <div class="ranking-position">${medalha}</div>
            <div class="ranking-info">
                <strong>${escapeHtml(jogador.apelido)}</strong>
                <span class="ranking-name">${escapeHtml(jogador.nome || "")}</span>
                <span class="ranking-age">${jogador.idade || 0} anos</span>
            </div>
            <div class="ranking-points">⭐ ${jogador.pontos || 0} pts</div>
        `;
        lista.appendChild(li);
    }
}

// ============================================
// FUNCOES AUXILIARES
// ============================================
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// SINCRONIZAR USUARIO ATUAL
// ============================================
async function sincronizarUsuarioOnline() {
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    if (usuario && usuario.pontos !== undefined) {
        console.log("Sincronizando usuario:", usuario.apelido);
        await salvarPontuacaoOnline(usuario);
        await atualizarRankingOnline();
        return true;
    } else {
        console.log("Nenhum usuario logado para sincronizar");
        return false;
    }
}

// ============================================
// FUNCAO DE TESTE
// ============================================
async function testarConexaoOnline() {
    console.log("=== TESTE DE CONEXAO ONLINE ===");
    console.log("Planilha ID:", SHEET_ID);
    console.log("Apps Script URL:", SCRIPT_URL);
    
    try {
        console.log("Buscando dados da planilha...");
        const ranking = await buscarRankingOnline();
        console.log("Dados obtidos:", ranking);
        
        if (ranking && ranking.length > 0) {
            console.log("✅ Conexao funcionando!");
            console.log("Primeiro usuario:", ranking[0]);
        } else {
            console.log("⚠️ Conexao ok, mas ranking vazio");
        }
        return ranking;
    } catch (error) {
        console.error("❌ Erro na conexao:", error);
        return null;
    }
}

// ============================================
// INICIALIZACAO
// ============================================
console.log("CloudRanking.js carregado!");
console.log("Planilha ID:", SHEET_ID);
console.log("Apps Script URL:", SCRIPT_URL);

// Exportar funcoes globalmente
window.buscarRankingOnline = buscarRankingOnline;
window.salvarPontuacaoOnline = salvarPontuacaoOnline;
window.atualizarRankingOnline = atualizarRankingOnline;
window.sincronizarUsuarioOnline = sincronizarUsuarioOnline;
window.testarConexaoOnline = testarConexaoOnline;
