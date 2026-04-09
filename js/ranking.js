// ============================================
// SISTEMA DE RANKING - VERSÃO ONLINE
// ============================================

// Função principal de atualização do ranking
async function atualizarRanking() {
    console.log("Atualizando ranking...");
    
    // Tentar buscar do online primeiro
    if (typeof buscarRankingOnline !== 'undefined') {
        const rankingOnline = await buscarRankingOnline();
        if (rankingOnline && rankingOnline.length > 0) {
            atualizarListaRanking(rankingOnline);
            return;
        }
    }
    
    // Fallback para localStorage se offline
    atualizarRankingLocal();
}

// Atualizar a lista do ranking na tela
function atualizarListaRanking(ranking) {
    const lista = document.getElementById("rankingList");
    const usuarioAtual = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    
    if (!lista) return;
    
    lista.innerHTML = "";
    
    if (!ranking || ranking.length === 0) {
        lista.innerHTML = '<li>✨ Ninguém no ranking ainda</li>';
        return;
    }
    
    for (let i = 0; i < Math.min(ranking.length, 20); i++) {
        const jogador = ranking[i];
        const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}º`;
        const isCurrentUser = usuarioAtual && usuarioAtual.apelido === jogador.apelido;
        
        const li = document.createElement("li");
        li.className = isCurrentUser ? "current-player-row" : "";
        li.innerHTML = `
            <div class="ranking-position">${medalha}</div>
            <div class="ranking-info">
                <strong>${escapeHtml(jogador.apelido || jogador.nome || "?")}</strong>
                <span class="ranking-name">${escapeHtml(jogador.nome || "")}</span>
                <span class="ranking-age">${jogador.idade || 0} anos</span>
            </div>
            <div class="ranking-points">⭐ ${jogador.pontos || 0} pts</div>
        `;
        lista.appendChild(li);
    }
}

// Ranking local (fallback)
function atualizarRankingLocal() {
    let ranking = JSON.parse(localStorage.getItem("ranking") || "[]");
    const usuarioAtual = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    
    ranking.sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
    ranking = ranking.slice(0, 10);
    
    const lista = document.getElementById("rankingList");
    if (!lista) return;
    
    lista.innerHTML = "";
    
    if (ranking.length === 0) {
        lista.innerHTML = '<li>✨ Seja o primeiro no ranking!</li>';
    } else {
        ranking.forEach((jogador, idx) => {
            const medalha = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx+1}º`;
            const isCurrentUser = usuarioAtual && usuarioAtual.apelido === jogador.nome;
            lista.innerHTML += `<li ${isCurrentUser ? 'style="background:#fef3c7; font-weight:bold;"' : ''}>${medalha} ${jogador.nome} - ⭐ ${jogador.pontos || 0} pts</li>`;
        });
    }
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const progressBar = document.getElementById("progressBar");
    const nextTitleSpan = document.getElementById("nextTitle");
    const quizzesDoneSpan = document.getElementById("quizzesDone");
    const usuarioAtual = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    const pontosAtuais = usuarioAtual ? (usuarioAtual.pontos || 0) : (typeof pontos !== 'undefined' ? pontos : 0);
    
    if (progressBar) {
        let porcentagem = 0;
        let nextTitle = "🍎 Six Seven (100 pts)";
        
        if (pontosAtuais < 100) {
            porcentagem = (pontosAtuais / 100) * 100;
            nextTitle = "🍎 Six Seven do Alimentos (100 pts)";
        } else if (pontosAtuais < 250) {
            porcentagem = ((pontosAtuais - 100) / 150) * 100;
            nextTitle = "💪 Farmou Aura no Exercício (250 pts)";
        } else if (pontosAtuais < 500) {
            porcentagem = ((pontosAtuais - 250) / 250) * 100;
            nextTitle = "🫡 Capitão Saúde (500 pts)";
        } else if (pontosAtuais < 1000) {
            porcentagem = ((pontosAtuais - 500) / 500) * 100;
            nextTitle = "👑 Mestre da Saúde Supremo (1000 pts)";
        } else {
            porcentagem = 100;
            nextTitle = "🏆 Lenda da Saúde!";
        }
        
        progressBar.style.width = `${Math.min(porcentagem, 100)}%`;
        if (nextTitleSpan) nextTitleSpan.innerText = nextTitle;
    }
    
    if (quizzesDoneSpan) {
        const completados = JSON.parse(localStorage.getItem("quizzes_completados") || "[]");
        quizzesDoneSpan.innerText = completados.length;
    }
}

// Sobrescrever adicionarPontos
if (typeof window.adicionarPontosOriginal === 'undefined') {
    window.adicionarPontosOriginal = window.adicionarPontos;
}

window.adicionarPontos = async function(qtd) {
    if (typeof window.adicionarPontosOriginal === 'function') {
        window.adicionarPontosOriginal(qtd);
    }
    
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    if (usuario) {
        usuario.pontos = (usuario.pontos || 0) + qtd;
        if (typeof salvarUsuarioAtual !== 'undefined') {
            salvarUsuarioAtual(usuario);
        }
        if (typeof salvarPontuacaoOnline !== 'undefined') {
            await salvarPontuacaoOnline(usuario);
        }
    }
    
    await atualizarRanking();
    atualizarEstatisticas();
};

// Função auxiliar
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Inicialização
setInterval(atualizarRanking, 10000);
document.addEventListener("DOMContentLoaded", function() {
    atualizarRanking();
    atualizarEstatisticas();
});

window.atualizarRanking = atualizarRanking;
window.atualizarEstatisticas = atualizarEstatisticas;
