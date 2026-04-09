// ============================================
// RANKING ONLINE - VERSÃO CORRIGIDA
// ============================================

const SHEET_ID = "1sbQFgBWe5JfgCkmHx48_4RXKMlVmwxc1seqAvIFYobc";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-PfTd_N-xslN1DNItofZDHTUegYSe1yBdqfhTSSpTy1q-DJLlpUznFt7Y5kgwbeD0jQ/exec";

async function buscarRankingOnline() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const jsonStart = text.indexOf('(');
        const jsonEnd = text.lastIndexOf(')');
        const jsonText = text.substring(jsonStart + 1, jsonEnd);
        const data = JSON.parse(jsonText);
        
        const ranking = [];
        const rows = data.table.rows;
        
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
        return ranking;
    } catch (error) {
        console.error("Erro:", error);
        return [];
    }
}

async function salvarPontuacaoOnline(usuario) {
    if (!usuario || !usuario.apelido) return false;
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apelido: usuario.apelido,
                nome: usuario.nome || "",
                idade: usuario.idade || 0,
                pontos: usuario.pontos || 0,
                quizzes_feitos: usuario.quizzes_feitos || 0
            })
        });
        
        const resultado = await response.json();
        console.log("Salvo:", resultado);
        return resultado.status === "ok";
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
        lista.innerHTML = '<li>✨ Ninguém no ranking ainda</li>';
        return;
    }
    
    for (let i = 0; i < Math.min(ranking.length, 20); i++) {
        const j = ranking[i];
        const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}º`;
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

async function testarConexao() {
    console.log("=== TESTANDO CONEXÃO ===");
    const ranking = await buscarRankingOnline();
    console.log("Ranking lido:", ranking.length, "usuários");
    
    const teste = await salvarPontuacaoOnline({
        apelido: "teste_" + Date.now(),
        nome: "Usuário Teste",
        idade: 10,
        pontos: 100,
        quizzes_feitos: 1
    });
    console.log("Escrita funcionou?", teste);
    
    return { leitura: ranking.length, escrita: teste };
}

window.buscarRankingOnline = buscarRankingOnline;
window.salvarPontuacaoOnline = salvarPontuacaoOnline;
window.atualizarRankingOnline = atualizarRankingOnline;
window.testarConexao = testarConexao;

console.log("CloudRanking.js carregado!");
