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

// Buscar ranking online
async function buscarRankingOnline() {
    // Usar cache se estiver fresco
    if (Date.now() - ultimaAtualizacao < CACHE_TTL && rankingCache.length > 0) {
        return rankingCache;
    }
    
    try {
        console.log("Buscando ranking online...");
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Extrair JSON do formato do Google
        const jsonStart = text.indexOf('(');
        const jsonEnd = text.lastIndexOf(')');
        const jsonText = text.substring(jsonStart + 1, jsonEnd);
        const data = JSON.parse(jsonText);
        
        const ranking = [];
        const rows = data.table.rows;
        
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
        ranking.sort((a, b) => b.pontos - a.pontos);
        
        // Atualizar cache
        rankingCache = ranking;
        ultimaAtualizacao = Date.now();
        
        console.log(ranking.length + " usuarios carregados do ranking online");
        return ranking;
        
    } catch (error) {
        console.error("Erro ao buscar ranking:", error);
        return rankingCache;
    }
}

// Salvar pontuacao do usuario online
async function salvarPontuacaoOnline(usuario) {
    if (!usuario || !usuario.apelido) {
        console.error("Usuario invalido para salvar");
        return false;
    }
    
    try {
        console.log("Salvando pontuacao online para:", usuario.apelido);
        
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
            mode: "no-cors",
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

// Atualizar ranking na interface
async function atualizarRankingOnline() {
    const ranking = await buscarRankingOnline();
    const lista = document.getElementById("rankingList");
    const usuarioAtual = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    
    if (!lista) return;
    
    lista.innerHTML = "";
    
    if (ranking.length === 0) {
        lista.innerHTML = '<li><i class="fas fa-star"></i> ✨ Ninguem no ranking ainda</li>';
    } else {
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
                    <span class="ranking-name">${escapeHtml(jogador.nome)}</span>
                    <span class="ranking-age">${jogador.idade} anos</span>
                </div>
                <div class="ranking-points">⭐ ${jogador.pontos} pts</div>
            `;
            lista.appendChild(li);
        }
    }
    
    // Atualizar estatisticas
    if (typeof atualizarEstatisticas !== 'undefined') {
        atualizarEstatisticas();
    }
}

// Funcao auxiliar para escapar HTML
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Sincronizar pontos do usuario atual com o ranking online
async function sincronizarUsuarioOnline() {
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    if (usuario && usuario.pontos !== undefined) {
        await salvarPontuacaoOnline(usuario);
    }
}

// Exportar funcoes globalmente
window.buscarRankingOnline = buscarRankingOnline;
window.salvarPontuacaoOnline = salvarPontuacaoOnline;
window.atualizarRankingOnline = atualizarRankingOnline;
window.sincronizarUsuarioOnline = sincronizarUsuarioOnline;

console.log("CloudRanking.js carregado com sucesso!");
console.log("Planilha conectada:", SHEET_ID);
console.log("Apps Script URL:", SCRIPT_URL);