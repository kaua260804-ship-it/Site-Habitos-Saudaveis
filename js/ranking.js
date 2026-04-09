// ============================================
// SISTEMA DE RANKING
// ============================================

function atualizarRanking() {
    let ranking = JSON.parse(localStorage.getItem("ranking") || "[]");
    const jogadorExistente = ranking.find(j => j.nome === nomeJogador);
    
    if (jogadorExistente) {
        jogadorExistente.pontos = pontos;
    } else {
        ranking.push({ nome: nomeJogador, pontos: pontos });
    }
    
    ranking.sort((a, b) => b.pontos - a.pontos);
    ranking = ranking.slice(0, 10);
    localStorage.setItem("ranking", JSON.stringify(ranking));
    
    const lista = document.getElementById("rankingList");
    if (!lista) return;
    
    lista.innerHTML = "";
    if (ranking.length === 0) {
        lista.innerHTML = '<li>✨ Ninguém no ranking ainda</li>';
    } else {
        ranking.forEach((jogador, idx) => {
            const medalha = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx+1}º`;
            const destaque = jogador.nome === nomeJogador ? 'style="background:#fef3c7; font-weight:bold;"' : "";
            lista.innerHTML += `<li ${destaque}>${medalha} ${jogador.nome} - ⭐ ${jogador.pontos} pts</li>`;
        });
    }
}

function atualizarEstatisticas() {
    const progressBar = document.getElementById("progressBar");
    const nextTitleSpan = document.getElementById("nextTitle");
    const quizzesDoneSpan = document.getElementById("quizzesDone");
    
    if (progressBar) {
        let porcentagem = 0;
        let nextTitle = "🍎 Six Seven (100 pts)";
        
        if (pontos < 100) {
            porcentagem = (pontos / 100) * 100;
            nextTitle = "🍎 Six Seven do Alimentos (100 pts)";
        } else if (pontos < 250) {
            porcentagem = ((pontos - 100) / 150) * 100;
            nextTitle = "💪 Farmou Aura no Exercício (250 pts)";
        } else if (pontos < 500) {
            porcentagem = ((pontos - 250) / 250) * 100;
            nextTitle = "🫡 Capitão Saúde (500 pts)";
        } else if (pontos < 1000) {
            porcentagem = ((pontos - 500) / 500) * 100;
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

function mostrarConfetes() {
    for (let i = 0; i < 50; i++) {
        const confete = document.createElement("div");
        confete.style.cssText = `
            position: fixed; left: ${Math.random() * 100}%; top: -10px;
            width: ${Math.random() * 10 + 5}px; height: ${Math.random() * 10 + 5}px;
            background: hsl(${Math.random() * 360}, 70%, 50%);
            border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
            animation: confettiFall ${Math.random() * 2 + 1}s linear forwards;
            z-index: 1999;
        `;
        document.body.appendChild(confete);
        setTimeout(() => confete.remove(), 3000);
    }
}

setInterval(atualizarRanking, 5000);
document.addEventListener("DOMContentLoaded", () => {
    atualizarRanking();
    atualizarEstatisticas();
});

window.atualizarRanking = atualizarRanking;
window.atualizarEstatisticas = atualizarEstatisticas;
window.mostrarConfetes = mostrarConfetes;