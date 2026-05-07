// ============================================
// RANKING ONLINE COM GOOGLE SHEETS
// LEITURA + ESCRITA (compatível com seu Apps Script)
// ============================================

const SHEET_ID = "1sbQFgBWe5JfgCkmHx48_4RXKMlVmwxc1seqAvIFYobc";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/1sbQFgBWe5JfgCkmHx48_4RXKMlVmwxc1seqAvIFYobc/edit?gid=0#gid=0`;

// ⚠️ ATUALIZE A LINHA ABAIXO COM A SUA URL DO APPS SCRIPT (DEPOIS DE REIMPLANTAR)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXcYHrJCibtHzU5js5QjsJ0geusyQg54bvQICA7cQ3KGuEpG60QshNeHuS6ckIrzx6Yw/exec";

// ========== LEITURA (ranking) ==========
async function buscarRankingOnline() {
    try {
        console.log("📊 Buscando ranking da planilha...");
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
        console.log(`✅ Ranking carregado: ${ranking.length} usuários`);
        return ranking;
    } catch (error) {
        console.error("❌ Erro ao buscar ranking:", error);
        return [];
    }
}

// ========== ESCRITA (salvar usuário/pontos) ==========
async function salvarUsuarioOnline(usuario) {
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
        console.log("💾 Usuário salvo na planilha:", resultado);
        return true;
    } catch (error) {
        console.error("❌ Erro ao salvar usuário:", error);
        return false;
    }
}

// ========== ATUALIZAR TELA DO RANKING ==========
async function atualizarRankingOnline() {
    const ranking = await buscarRankingOnline();
    const lista = document.getElementById("rankingList");
    const usuarioAtual = (typeof getUsuarioAtual === 'function') ? getUsuarioAtual() : null;

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

// ========== FUNÇÃO DE TESTE RÁPIDO ==========
async function testarConexao() {
    console.log("=== TESTE DE CONEXÃO ===");
    const ranking = await buscarRankingOnline();
    console.log("Leitura OK:", ranking.length, "usuários");
    return ranking;
}

// EXPOR FUNÇÕES GLOBAIS
window.buscarRankingOnline = buscarRankingOnline;
window.salvarUsuarioOnline = salvarUsuarioOnline;
window.atualizarRankingOnline = atualizarRankingOnline;
window.testarConexao = testarConexao;

console.log("☁️ CloudRanking.js carregado com sucesso!");
console.log("📌 Planilha ID:", SHEET_ID);
console.log("📌 Apps Script URL (leitura/escrita):", SCRIPT_URL);