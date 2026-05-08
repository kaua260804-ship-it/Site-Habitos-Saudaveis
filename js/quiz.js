// ============================================
// SISTEMA DE QUIZ - VERSÃO SUPABASE
// ============================================

const QUIZ_COMPLETED_KEY = "quizzes_completados";

function getQuizzesCompletados() {
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    if (usuario && usuario.quizzes_completados) {
        return usuario.quizzes_completados;
    }
    return JSON.parse(localStorage.getItem(QUIZ_COMPLETED_KEY) || "[]");
}

async function salvarQuizCompletado(subtopicoId) {
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    const completados = getQuizzesCompletados();
    
    if (!completados.includes(subtopicoId)) {
        completados.push(subtopicoId);
        localStorage.setItem(QUIZ_COMPLETED_KEY, JSON.stringify(completados));
        
        // Atualizar no usuário atual
        if (usuario) {
            usuario.quizzes_completados = completados;
            if (typeof salvarUsuarioAtual !== 'undefined') {
                salvarUsuarioAtual(usuario);
            }
        }
        
        // Salvar no Supabase
        if (typeof atualizarPontosDB !== 'undefined' && supabaseClient) {
            const pontosAtuais = usuario ? (usuario.pontos || 0) : (typeof pontos !== 'undefined' ? pontos : 0);
            await atualizarPontosDB(
                usuario?.apelido || 'anon',
                pontosAtuais,
                completados
            );
        }
        
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
        color: white; padding: 15px 30px; border-radius: 60px;
        font-weight: bold; z-index: 2000; animation: fadeInUp 0.3s ease;
        font-size: 18px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    `;
    feedback.innerHTML = mensagem;
    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.style.animation = "fadeOutDown 0.3s ease";
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}

// Função principal - Iniciar quiz de um subtópico
async function iniciarQuizSubtopico(subtopicoId, subtopicoNome) {
    console.log('🎮 Iniciando quiz:', subtopicoId, subtopicoNome);
    
    // Verificar se já foi feito
    if (quizJaFoiFeito(subtopicoId)) {
        const treinar = confirm(`⚠️ Você já completou "${subtopicoNome}"!\nDeseja treinar novamente? (Sem pontos)`);
        if (!treinar) return;
        
        // Modo treino
        await carregarPerguntasDoBanco(subtopicoId, subtopicoNome, true);
        return;
    }
    
    // Modo normal (com pontos)
    await carregarPerguntasDoBanco(subtopicoId, subtopicoNome, false);
}

// Carregar perguntas do Supabase (com fallback para JSON)
async function carregarPerguntasDoBanco(subtopicoId, subtopicoNome, modoTreino = false) {
    let perguntas = [];
    
    // Tentar carregar do Supabase primeiro
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('quizzes')
                .select('*')
                .eq('subtopico_id', subtopicoId)
                .eq('ativo', true);
            
            if (!error && data && data.length > 0) {
                perguntas = data.map(q => ({
                    pergunta: q.pergunta,
                    opcoes: [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d],
                    correta: q.correta,
                    pontos: q.pontos || 10
                }));
                console.log(`✅ ${perguntas.length} perguntas carregadas do Supabase`);
            }
        } catch (err) {
            console.warn('⚠️ Erro ao buscar quizzes do Supabase:', err.message);
        }
    }
    
    // Fallback: carregar do JSON local
    if (perguntas.length === 0) {
        try {
            const response = await fetch("data/perguntas.json");
            const todasPerguntas = await response.json();
            const quizData = todasPerguntas[subtopicoId];
            
            if (quizData && quizData.perguntas) {
                perguntas = quizData.perguntas;
                console.log(`✅ ${perguntas.length} perguntas carregadas do JSON local`);
            }
        } catch (err) {
            console.error('❌ Erro ao carregar JSON:', err);
        }
    }
    
    if (perguntas.length === 0) {
        alert(`📝 Nenhuma pergunta encontrada para "${subtopicoNome}"!\nUse o painel admin para adicionar.`);
        return;
    }
    
    // Iniciar o quiz
    iniciarQuiz(perguntas, subtopicoId, subtopicoNome, modoTreino);
}

// Iniciar quiz com as perguntas carregadas
function iniciarQuiz(perguntas, subtopicoId, subtopicoNome, modoTreino) {
    let indice = 0;
    let acertos = 0;
    const totalPerguntas = perguntas.length;
    
    function mostrarPergunta() {
        if (indice >= totalPerguntas) {
            // Quiz finalizado
            const pontosGanhos = modoTreino ? 0 : acertos * 10;
            
            let mensagem = '';
            if (modoTreino) {
                mensagem = `🎯 Treino concluído!\n${acertos}/${totalPerguntas} acertos\n(Sem pontos no modo treino)`;
            } else {
                mensagem = `🎉 Parabéns!\n${acertos}/${totalPerguntas} acertos\n⭐ +${pontosGanhos} pontos!`;
            }
            
            alert(mensagem);
            
            if (!modoTreino && acertos > 0) {
                // Salvar quiz completado
                salvarQuizCompletado(subtopicoId);
                
                // Adicionar pontos
                if (typeof adicionarPontos !== 'undefined') {
                    adicionarPontos(pontosGanhos);
                }
                
                // Mostrar confetes se acertou todas
                if (acertos === totalPerguntas && typeof mostrarConfetes !== 'undefined') {
                    mostrarConfetes();
                }
            }
            
            fecharModalQuiz();
            return;
        }
        
        const p = perguntas[indice];
        const letras = ['A', 'B', 'C', 'D'];
        
        let html = `
            <div class="quiz-header">
                <div class="quiz-progress">Pergunta ${indice + 1} de ${totalPerguntas}</div>
                <div class="quiz-progress-bar">
                    <div class="quiz-progress-fill" style="width: ${((indice) / totalPerguntas) * 100}%"></div>
                </div>
                <div class="quiz-title">📝 ${subtopicoNome}</div>
            </div>
            <div class="quiz-question">${p.pergunta}</div>
        `;
        
        for (let i = 0; i < p.opcoes.length; i++) {
            if (p.opcoes[i] && p.opcoes[i].trim() !== '') {
                html += `
                    <div class="quiz-option" data-opcao="${i}">
                        <div class="quiz-option-letter">${letras[i]}</div>
                        <div class="quiz-option-text">${p.opcoes[i]}</div>
                    </div>
                `;
            }
        }
        
        document.getElementById("quizArea").innerHTML = html;
        
        // Adicionar eventos
        document.querySelectorAll(".quiz-option").forEach(option => {
            option.addEventListener("click", function(e) {
                const escolhida = parseInt(this.getAttribute("data-opcao"));
                
                // Destacar resposta
                document.querySelectorAll(".quiz-option").forEach(o => {
                    o.style.pointerEvents = 'none';
                    const opcaoNum = parseInt(o.getAttribute("data-opcao"));
                    if (opcaoNum === p.correta) {
                        o.classList.add('correct');
                    }
                });
                
                if (escolhida === p.correta) {
                    acertos++;
                    this.classList.add('correct');
                    mostrarFeedbackQuiz("✅ Correto! +10 pontos", "success");
                } else {
                    this.classList.add('wrong');
                    mostrarFeedbackQuiz(`❌ Errado! Resposta: ${letras[p.correta]}. ${p.opcoes[p.correta]}`, "error");
                }
                
                // Avançar após 1.5 segundos
                setTimeout(() => {
                    indice++;
                    mostrarPergunta();
                }, 1500);
            });
        });
    }
    
    abrirModalQuiz();
    mostrarPergunta();
}

// Adicionar animações CSS para o feedback
const quizStyles = document.createElement("style");
quizStyles.textContent = `
    @keyframes fadeOutDown {
        from { opacity: 1; transform: translate(-50%, 0); }
        to { opacity: 0; transform: translate(-50%, 20px); }
    }
`;
document.head.appendChild(quizStyles);

// Exportar funções
window.iniciarQuizSubtopico = iniciarQuizSubtopico;
window.abrirModalQuiz = abrirModalQuiz;
window.fecharModalQuiz = fecharModalQuiz;
window.quizJaFoiFeito = quizJaFoiFeito;
window.getQuizzesCompletados = getQuizzesCompletados;
window.salvarQuizCompletado = salvarQuizCompletado;

console.log("✅ quiz.js carregado! (v3.0 - Supabase)");
