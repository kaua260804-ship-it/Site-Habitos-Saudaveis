// ============================================
// SISTEMA DE RANKING - COM SUPORTE ONLINE
// ============================================

function atualizarRanking() {
    if (typeof atualizarRankingOnline !== 'undefined') {
        atualizarRankingOnline();
    } else {
        atualizarRankingLocal();
    }
}

function atualizarRankingLocal() {
    let ranking = JSON.parse(localStorage.getItem("ranking") || "[]");
    const usuarioAtual = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    const pontosAtuais = usuarioAtual ? (usuarioAtual.pontos || 0) : (typeof pontos !== 'undefined' ? pontos : 0);
    
    const jogadorExistente = ranking.find(j => j.nome === (usuarioAtual ? usuarioAtual.apelido : nomeJogador));
    
    if (jogadorExistente) {
        jogadorExistente.pontos = pontosAtuais;
    } else if (usuarioAtual) {
        ranking.push({ 
            nome: usuarioAtual.apelido,
            nomeCompleto: usuarioAtual.nome,
            idade: usuarioAtual.idade,
            pontos: pontosAtuais
        });
    }
    
    ranking.sort((a, b) => b.pontos - a.pontos);
    ranking = ranking.slice(0, 10);
    localStorage.setItem("ranking", JSON.stringify(ranking));
    
    const lista = document.getElementById("rankingList");
    if (!lista) return;
    
    lista.innerHTML = "";
    if (ranking.length === 0) {
        lista.innerHTML = '<li>✨ Seja o primeiro no ranking!</li>';
    } else {
        ranking.forEach((jogador, idx) => {
            const medalha = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx+1}º`;
            const isCurrentUser = usuarioAtual && usuarioAtual.apelido === jogador.nome;
            lista.innerHTML += `<li ${isCurrentUser ? 'style="background:#fef3c7; font-weight:bold;"' : ''}>${medalha} ${jogador.nome} - ⭐ ${jogador.pontos} pts</li>`;
        });
    }
}

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

// Sobrescrever adicionarPontos para salvar online
if (typeof window.adicionarPontosOriginal === 'undefined') {
    window.adicionarPontosOriginal = window.adicionarPontos;
}

window.adicionarPontos = function(qtd) {
    if (typeof window.adicionarPontosOriginal === 'function') {
        window.adicionarPontosOriginal(qtd);
    }
    
    // Atualizar pontos do usuário atual
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    if (usuario) {
        usuario.pontos = (usuario.pontos || 0) + qtd;
        if (typeof salvarUsuarioAtual !== 'undefined') {
            salvarUsuarioAtual(usuario);
        }
        if (typeof salvarPontuacaoOnline !== 'undefined') {
            salvarPontuacaoOnline(usuario);
        }
    }
    
    // Atualizar ranking
    atualizarRanking();
    atualizarEstatisticas();
};

// Atualizar ranking periodicamente
setInterval(() => {
    atualizarRanking();
}, 10000);

document.addEventListener("DOMContentLoaded", function() {
    atualizarRanking();
    atualizarEstatisticas();
});

window.atualizarRanking = atualizarRanking;
window.atualizarEstatisticas = atualizarEstatisticas;
