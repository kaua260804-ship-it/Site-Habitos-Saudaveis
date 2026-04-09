// ============================================
// SISTEMA PRINCIPAL
// ============================================

let pontos = localStorage.getItem("pontos") ? parseInt(localStorage.getItem("pontos")) : 0;
let nomeJogador = localStorage.getItem("nome") || "Aventureiro";

function atualizarHeader() {
    const playerNameEl = document.getElementById("playerName");
    const playerPointsEl = document.getElementById("playerPoints");
    const playerTitleEl = document.getElementById("playerTitle");
    
    if (playerNameEl) playerNameEl.innerHTML = `<i class="fas fa-user-astronaut"></i> ${nomeJogador}`;
    if (playerPointsEl) playerPointsEl.innerHTML = `<i class="fas fa-star"></i> ${pontos} pontos`;
    
    let titulo = "🌿 Iniciante Saudável";
    if (pontos >= 100) titulo = "🍎 Six Seven do Alimentos";
    if (pontos >= 250) titulo = "💪 Farmou Aura no Exercício";
    if (pontos >= 500) titulo = "🫡 Capitão Saúde";
    if (pontos >= 1000) titulo = "👑 Mestre da Saúde Supremo";
    
    if (playerTitleEl) playerTitleEl.innerText = titulo;
}

function adicionarPontos(qtd) {
    pontos += qtd;
    localStorage.setItem("pontos", pontos);
    atualizarHeader();
    if (typeof atualizarRanking !== 'undefined') atualizarRanking();
    if (typeof atualizarEstatisticas !== 'undefined') atualizarEstatisticas();
}

function mudarNome() {
    let novoNome = prompt("Digite seu nome de herói da saúde:", nomeJogador);
    if (novoNome && novoNome.trim()) {
        nomeJogador = novoNome.trim();
        localStorage.setItem("nome", nomeJogador);
        atualizarHeader();
        if (typeof atualizarRanking !== 'undefined') atualizarRanking();
    }
}

const temasConfig = {
    alimentacao: { nome: "Alimentação Saudável", emoji: "🍎", cor: "#48bb78", corEscura: "#38a169" },
    exercicios: { nome: "Atividade Física", emoji: "🤸", cor: "#ed8936", corEscura: "#dd6b20" },
    higiene: { nome: "Higiene Pessoal", emoji: "🧼", cor: "#4299e1", corEscura: "#3182ce" },
    sono: { nome: "Sono e Descanso", emoji: "😴", cor: "#9f7aea", corEscura: "#805ad5" },
    saudemental: { nome: "Saúde Mental", emoji: "🧠", cor: "#f687b3", corEscura: "#ed64a6" },
    postura: { nome: "Postura Correta", emoji: "📚", cor: "#a0aec0", corEscura: "#718096" },
    agua: { nome: "Hidratação", emoji: "💧", cor: "#63b3ed", corEscura: "#4299e1" },
    alimentacaoequilibrada: { nome: "Alimentação Equilibrada", emoji: "🥗", cor: "#68d391", corEscura: "#48bb78" },
    bullying: { nome: "Respeito e Bullying", emoji: "🤝", cor: "#fc8181", corEscura: "#f56565" },
    meioambiente: { nome: "Meio Ambiente", emoji: "🌍", cor: "#4fd1c5", corEscura: "#38b2ac" }
};

async function carregarCards() {
    try {
        const response = await fetch("data/conteudos.json");
        const temas = await response.json();
        const container = document.getElementById("cardsContainer");
        if (!container) return;
        container.innerHTML = "";
        
        for (let [chave, valor] of Object.entries(temas)) {
            const config = temasConfig[chave] || { nome: chave, emoji: "📚", cor: "#667eea", corEscura: "#764ba2" };
            const numSubtemas = valor.subtemas ? valor.subtemas.length : 5;
            
            const card = document.createElement("div");
            card.className = "card";
            card.setAttribute("data-tema", chave);
            card.style.borderTop = `5px solid ${config.cor}`;
            card.innerHTML = `
                <div class="card-header" style="background: linear-gradient(135deg, ${config.cor}, ${config.corEscura});">
                    <div class="emoji">${config.emoji}</div>
                    <h3>${config.nome}</h3>
                </div>
                <div class="card-content">
                    <p>📚 ${numSubtemas} temas para aprender!</p>
                    <div class="card-buttons">
                        <button class="btn btn-aprender" data-tema="${chave}">📖 Aprender</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        }
        
        document.querySelectorAll(".btn-aprender").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const tema = btn.getAttribute("data-tema");
                if (typeof abrirAprendizado !== 'undefined') abrirAprendizado(tema);
            });
        });
        
    } catch (error) {
        console.error("Erro:", error);
        const container = document.getElementById("cardsContainer");
        if (container) container.innerHTML = '<div style="text-align:center;padding:50px;color:white;">❌ Erro ao carregar temas</div>';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("playerName")?.addEventListener("click", mudarNome);
    
    const closeModal = document.querySelector("#modalQuiz .close");
    if (closeModal) closeModal.onclick = () => document.getElementById("modalQuiz").style.display = "none";
    
    window.onclick = (e) => {
        if (e.target === document.getElementById("modalQuiz")) document.getElementById("modalQuiz").style.display = "none";
        if (e.target === document.getElementById("modalAprendizado")) document.getElementById("modalAprendizado").style.display = "none";
    };
    
    carregarCards();
    atualizarHeader();
    if (typeof atualizarRanking !== 'undefined') atualizarRanking();
    if (typeof atualizarEstatisticas !== 'undefined') atualizarEstatisticas();
});

window.adicionarPontos = adicionarPontos;