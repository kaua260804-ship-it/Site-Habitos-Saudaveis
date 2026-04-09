// ============================================
// SISTEMA DE QUIZ
// ============================================

const QUIZ_COMPLETED_KEY = "quizzes_completados";

function getQuizzesCompletados() {
    return JSON.parse(localStorage.getItem(QUIZ_COMPLETED_KEY) || "[]");
}

function salvarQuizCompletado(subtopicoId) {
    const completados = getQuizzesCompletados();
    if (!completados.includes(subtopicoId)) {
        completados.push(subtopicoId);
        localStorage.setItem(QUIZ_COMPLETED_KEY, JSON.stringify(completados));
        if (typeof atualizarEstatisticas !== 'undefined') {
            atualizarEstatisticas();
        }
    }
}

function quizJaFoiFeito(subtopicoId) {
    return getQuizzesCompletados().includes(subtopicoId);
}

function abrirModalQuiz() {
    const modal = document.getElementById("modalQuiz");
    if (modal) {
        modal.style.display = "flex";
    }
}

function fecharModalQuiz() {
    const modal = document.getElementById("modalQuiz");
    if (modal) {
        modal.style.display = "none";
    }
    const quizArea = document.getElementById("quizArea");
    if (quizArea) {
        quizArea.innerHTML = "";
    }
}

function mostrarFeedbackQuiz(mensagem, tipo) {
    const feedback = document.createElement("div");
    feedback.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: ${tipo === 'success' ? '#48bb78' : '#ef4444'};
        color: white; padding: 12px 24px; border-radius: 50px;
        font-weight: bold; z-index: 2000; animation: fadeInUp 0.3s ease;
    `;
    feedback.innerHTML = mensagem;
    document.body.appendChild(feedback);
    setTimeout(function() {
        feedback.remove();
    }, 1500);
}

async function iniciarQuizTema(tema) {
    try {
        const response = await fetch("data/perguntas.json");
        const todasPerguntas = await response.json();
        const perguntas = todasPerguntas[tema];
        
        if (!perguntas || perguntas.length === 0) {
            alert("📝 Este tema ainda não tem perguntas!");
            return;
        }
        
        let indice = 0;
        let acertos = 0;
        
        function mostrarPergunta() {
            if (indice >= perguntas.length) {
                const pontosGanhos = acertos * 10;
                alert("🎉 Você acertou " + acertos + " de " + perguntas.length + "!\n⭐ Ganhou " + pontosGanhos + " pontos!");
                if (typeof adicionarPontos !== 'undefined') {
                    adicionarPontos(pontosGanhos);
                }
                fecharModalQuiz();
                return;
            }
            
            const p = perguntas[indice];
            let html = '<div class="quiz-question">📝 ' + p.pergunta + '</div>';
            for (let i = 0; i < p.opcoes.length; i++) {
                const letra = String.fromCharCode(65 + i);
                html += '<div class="quiz-option" data-opcao="' + i + '">' + letra + '. ' + p.opcoes[i] + '</div>';
            }
            document.getElementById("quizArea").innerHTML = html;
            
            const options = document.querySelectorAll(".quiz-option");
            for (let i = 0; i < options.length; i++) {
                options[i].addEventListener("click", function(e) {
                    const escolhida = parseInt(e.currentTarget.getAttribute("data-opcao"));
                    if (escolhida === p.correta) {
                        acertos++;
                        mostrarFeedbackQuiz("✅ Correta! +10 pontos", "success");
                    } else {
                        mostrarFeedbackQuiz("❌ Errado! Resposta: " + p.opcoes[p.correta], "error");
                    }
                    indice++;
                    mostrarPergunta();
                });
            }
        }
        
        abrirModalQuiz();
        mostrarPergunta();
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao carregar o quiz.");
    }
}

async function iniciarQuizSubtopico(subtopicoId, subtopicoNome) {
    try {
        if (quizJaFoiFeito(subtopicoId)) {
            const treinar = confirm("⚠️ Você já fez o quiz de \"" + subtopicoNome + "\"!\nDeseja jogar novamente para treinar? (Sem pontos)");
            if (!treinar) {
                return;
            }
        }
        
        const response = await fetch("data/perguntas.json");
        const todasPerguntas = await response.json();
        const quizData = todasPerguntas[subtopicoId];
        
        if (!quizData || !quizData.perguntas || quizData.perguntas.length === 0) {
            alert("📝 Quiz de \"" + subtopicoNome + "\" em breve!");
            return;
        }
        
        let indice = 0;
        let acertos = 0;
        const perguntas = quizData.perguntas;
        
        function mostrarPergunta() {
            if (indice >= perguntas.length) {
                const pontosGanhos = acertos * 10;
                const jaFez = quizJaFoiFeito(subtopicoId);
                
                if (!jaFez) {
                    salvarQuizCompletado(subtopicoId);
                    if (typeof adicionarPontos !== 'undefined') {
                        adicionarPontos(pontosGanhos);
                    }
                    alert("🎉 Acertou " + acertos + "/" + perguntas.length + "!\n⭐ Ganhou " + pontosGanhos + " pontos!");
                    if (acertos === perguntas.length && typeof mostrarConfetes !== 'undefined') {
                        mostrarConfetes();
                    }
                } else {
                    alert("🎉 Treino: " + acertos + "/" + perguntas.length + " acertos! (Sem pontos)");
                }
                fecharModalQuiz();
                return;
            }
            
            const p = perguntas[indice];
            let html = '<div class="quiz-question">📝 ' + p.pergunta + '</div>';
            for (let i = 0; i < p.opcoes.length; i++) {
                const letra = String.fromCharCode(65 + i);
                html += '<div class="quiz-option" data-opcao="' + i + '">' + letra + '. ' + p.opcoes[i] + '</div>';
            }
            document.getElementById("quizArea").innerHTML = html;
            
            const options = document.querySelectorAll(".quiz-option");
            for (let i = 0; i < options.length; i++) {
                options[i].addEventListener("click", function(e) {
                    const escolhida = parseInt(e.currentTarget.getAttribute("data-opcao"));
                    if (escolhida === p.correta) {
                        acertos++;
                        mostrarFeedbackQuiz("✅ Correta! +10 pontos", "success");
                    } else {
                        mostrarFeedbackQuiz("❌ Errado! Resposta: " + p.opcoes[p.correta], "error");
                    }
                    indice++;
                    mostrarPergunta();
                });
            }
        }
        
        abrirModalQuiz();
        mostrarPergunta();
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao carregar o quiz.");
    }
}

// Exportar funções globalmente
window.iniciarQuizTema = iniciarQuizTema;
window.iniciarQuizSubtopico = iniciarQuizSubtopico;
window.abrirModalQuiz = abrirModalQuiz;
window.fecharModalQuiz = fecharModalQuiz;
window.quizJaFoiFeito = quizJaFoiFeito;
window.getQuizzesCompletados = getQuizzesCompletados;

console.log("✅ quiz.js carregado com sucesso!");