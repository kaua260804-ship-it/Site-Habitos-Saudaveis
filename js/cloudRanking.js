// ============================================
// RANKING ONLINE - SOMENTE LEITURA
// ============================================

const SHEET_ID = "1sbQFgBWe5JfgCkmHx48_4RXKMlVmwxc1seqAvIFYobc";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// Buscar ranking online
async function buscarRankingOnline() {
    try {
        console.log("Buscando ranking da planilha...");
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Extrair JSON
        const jsonStart = text.indexOf('(');
        const jsonEnd = text.lastIndexOf(')');
        const jsonText = text.substring(jsonStart + 1, jsonEnd);
        const data = JSON.parse(jsonText);
        
        const ranking = [];
        const rows = data.table.rows;
        
        console.log("Linhas encontradas:", rows.length);
        
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
        
        ranking.sort((a, b) => b.pontos - a.pontos);
        console.log("Ranking carregado:", ranking.length, "usuarios");
        return ranking;
        
    } catch (error) {
        console.error("Erro ao buscar ranking:", error);
        return [];
    }
}

// Atualizar ranking na tela
async function atualizarRankingOnline() {
    console.log("Atualizando ranking online...");
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
        const j = ranking[i];
        const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i+1) + "º";
        const isCurrentUser = usuarioAtual && usuarioAtual.apelido === j.apelido;
        
        const li = document.createElement("li");
        li.className = isCurrentUser ? "current-player-row" : "";
        li.innerHTML = `
            <div class="ranking-position">${medalha}</div>
            <div class="ranking-info">
                <strong>${escapeHtml(j.apelido)}</strong>
                <span class="ranking-name">${escapeHtml(j.nome)}</span>
                <span class="ranking-age">${j.idade} anos</span>
            </div>
            <div class="ranking-points">⭐ ${j.pontos} pts</div>
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

// Forçar atualização
async function forcarAtualizacao() {
    console.log("Forcando atualizacao do ranking...");
    await atualizarRankingOnline();
}

window.buscarRankingOnline = buscarRankingOnline;
window.atualizarRankingOnline = atualizarRankingOnline;
window.forcarAtualizacao = forcarAtualizacao;

console.log("CloudRanking.js carregado!");
