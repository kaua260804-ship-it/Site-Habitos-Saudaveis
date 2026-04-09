// ============================================
// RANKING ONLINE COM GOOGLE SHEETS - CORRIGIDO
// ============================================

const SHEET_ID = "1sbQFgBWe5JfgCkmHx48_4RXKMlVmwxc1seqAvIFYobc";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMrh75U3Z-Dmr7ZoMX206UOaFi9hVdvpjjhRm2eWCgKGKO2RDhvKjoqgIjN3arG9Vu/exec";

let rankingCache = [];
let ultimaAtualizacao = 0;
const CACHE_TTL = 30000;

async function buscarRankingOnline() {
    if (Date.now() - ultimaAtualizacao < CACHE_TTL && rankingCache.length > 0) {
        return rankingCache;
    }
    
    try {
        console.log("Buscando ranking online da planilha...");
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        const jsonStart = text.indexOf('(');
        const jsonEnd = text.lastIndexOf(')');
        const jsonText = text.substring(jsonStart + 1, jsonEnd);
        const data = JSON.parse(jsonText);
        
        const ranking = [];
        const rows = data.table.rows;
        
        console.log("Total de linhas encontradas:", rows.length);
        
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
                console.log("Usuario encontrado:", row[0]?.v, "pontos:", row[3]?.v);
            }
        }
        
        ranking.sort((a, b) => b.pontos - a.pontos);
        rankingCache = ranking;
        ultimaAtualizacao = Date.now();
        
        console.log("Ranking carregado:", ranking.length, "usuarios");
        return ranking;
        
    } catch (error) {
        console.error("Erro ao buscar ranking:", error);
        return rankingCache;
    }
}

async function salvarPontuacaoOnline(usuario) {
    if (!usuario || !usuario.apelido) {
        console.error("Usuario invalido para salvar");
        return false;
    }
    
    try {
        console.log("Salvando pontuacao online para:", usuario.apelido, "pontos:", usuario.pontos);
        
        const dados = {
            apelido: usuario.apelido,
            nome: usuario.nome || "",
            idade: usuario.idade || 0,
            pontos: usuario.pontos || 0,
            quizzes_feitos: usuario.quizzes_feitos || 0
        };
        
        // Usar fetch com modo normal para ver resposta
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });
        
        const resposta = await response.text();
        console.log("Resposta do servidor:", resposta);
        
        ultimaAtualizacao = 0;
        return true;
        
    } catch (error) {
        console.error("Erro ao salvar:", error);
        return false;
    }
}

async function atualizarRankingOnline() {
    const ranking = await buscarRankingOnline();
    const lista = document.getElementById("rankingList");
    const usuarioAtual = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    
    if (!lista) return;
    
    lista.innerHTML = "";
    
    if (ranking.length === 0) {
        lista.innerHTML = '<li>✨ Ninguem no ranking ainda</li>';
        return;
    }
    
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

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

async function sincronizarUsuarioOnline() {
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    if (usuario) {
        console.log("Sincronizando usuario:", usuario.apelido);
        await salvarPontuacaoOnline(usuario);
        await atualizarRankingOnline();
    }
}

async function testarConexaoOnline() {
    console.log("=== TESTE DE CONEXÃO ===");
    console.log("1. Testando leitura da planilha...");
    const ranking = await buscarRankingOnline();
    console.log("Ranking lido:", ranking);
    
    console.log("2. Testando escrita...");
    const teste = await salvarPontuacaoOnline({
        apelido: "teste_" + Date.now(),
        nome: "Usuario Teste",
        idade: 10,
        pontos: 100,
        quizzes_feitos: 1
    });
    console.log("Escrita funcionou?", teste);
    
    return { leitura: ranking, escrita: teste };
}

window.buscarRankingOnline = buscarRankingOnline;
window.salvarPontuacaoOnline = salvarPontuacaoOnline;
window.atualizarRankingOnline = atualizarRankingOnline;
window.sincronizarUsuarioOnline = sincronizarUsuarioOnline;
window.testarConexaoOnline = testarConexaoOnline;

console.log("CloudRanking.js carregado!");
console.log("Planilha ID:", SHEET_ID);
console.log("Apps Script URL:", SCRIPT_URL);
