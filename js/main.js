// ============================================
// SISTEMA PRINCIPAL - VERSÃO SUPABASE
// ============================================

let pontos = localStorage.getItem("pontos") ? parseInt(localStorage.getItem("pontos")) : 0;
let nomeJogador = localStorage.getItem("nome") || "";

// ========== ATUALIZAR HEADER ==========
function atualizarHeader() {
    const usuario = getUsuarioAtual();
    const playerNameEl = document.getElementById("playerName");
    const playerPointsEl = document.getElementById("playerPoints");
    const playerTitleEl = document.getElementById("playerTitle");
    
    if (usuario && playerNameEl) {
        playerNameEl.innerHTML = `<i class="fas fa-user-astronaut"></i> ${usuario.apelido} (${usuario.idade || '?'}a)`;
    } else if (playerNameEl) {
        playerNameEl.innerHTML = `<i class="fas fa-user-astronaut"></i> Entrar`;
    }
    
    const pontosAtuais = usuario ? (usuario.pontos || 0) : pontos;
    
    if (playerPointsEl) {
        playerPointsEl.innerHTML = `<i class="fas fa-star"></i> ${pontosAtuais} pontos`;
    }
    
    let titulo = "🌿 Iniciante Saudável";
    if (pontosAtuais >= 1000) titulo = "👑 Mestre da Saúde Supremo";
    else if (pontosAtuais >= 500) titulo = "🫡 Capitão Saúde";
    else if (pontosAtuais >= 250) titulo = "💪 Farmou Aura no Exercício";
    else if (pontosAtuais >= 100) titulo = "🍎 Six Seven do Alimentos";
    
    if (playerTitleEl) playerTitleEl.innerText = titulo;
}

// ========== ADICIONAR PONTOS (FUNÇÃO GLOBAL) ==========
window.adicionarPontos = async function(qtd) {
    console.log('⭐ Adicionando ' + qtd + ' pontos...');
    
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    
    if (usuario) {
        // Atualizar pontos do usuário logado
        usuario.pontos = (usuario.pontos || 0) + qtd;
        
        // Salvar no localStorage
        if (typeof salvarUsuarioAtual !== 'undefined') {
            salvarUsuarioAtual(usuario);
        }
        localStorage.setItem("pontos", usuario.pontos.toString());
        
        // Salvar no Supabase
        if (typeof atualizarPontosDB !== 'undefined' && typeof supabaseClient !== 'undefined' && supabaseClient) {
            const sucesso = await atualizarPontosDB(
                usuario.apelido,
                usuario.pontos,
                usuario.quizzes_completados || []
            );
            
            if (sucesso) {
                console.log('✅ Pontos salvos no Supabase:', usuario.pontos);
            } else {
                console.warn('⚠️ Não foi possível salvar no Supabase');
            }
        }
        
        // Atualizar pontos globais
        window.pontos = usuario.pontos;
    } else {
        // Usuário não logado - usar variável global
        window.pontos = (window.pontos || 0) + qtd;
        localStorage.setItem("pontos", window.pontos.toString());
        console.log('⭐ Pontos (offline):', window.pontos);
    }
    
    // Atualizar toda a interface
    if (typeof atualizarHeader !== 'undefined') {
        atualizarHeader();
    }
    if (typeof atualizarRanking !== 'undefined') {
        await atualizarRanking();
    }
    if (typeof atualizarEstatisticas !== 'undefined') {
        atualizarEstatisticas();
    }
    
    const pontosFinais = usuario ? usuario.pontos : window.pontos;
    console.log('⭐ Pontos atualizados:', pontosFinais);
};

// ========== CARREGAR PONTOS DO USUÁRIO ==========
function carregarPontosParaQuiz() {
    const usuario = getUsuarioAtual();
    if (usuario) {
        pontos = usuario.pontos || 0;
    } else {
        pontos = parseInt(localStorage.getItem("pontos") || "0");
    }
    return pontos;
}

// ========== CONFIGURAÇÃO DOS TEMAS ==========
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

// ========== CARREGAR CARDS DE TEMAS ==========
async function carregarCards() {
    const container = document.getElementById("cardsContainer");
    if (!container) return;
    
    try {
        // Tentar carregar do Supabase primeiro
        let temas = null;
        
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('conteudos')
                    .select('tema_id, tema_nome, tema_emoji')
                    .eq('ativo', true);
                
                if (!error && data && data.length > 0) {
                    // Agrupar por tema
                    const temasAgrupados = {};
                    data.forEach(item => {
                        if (!temasAgrupados[item.tema_id]) {
                            temasAgrupados[item.tema_id] = {
                                nome: item.tema_nome,
                                emoji: item.tema_emoji,
                                numSubtemas: 0
                            };
                        }
                        temasAgrupados[item.tema_id].numSubtemas++;
                    });
                    temas = temasAgrupados;
                    console.log('✅ Temas carregados do Supabase:', Object.keys(temas).length);
                }
            } catch (err) {
                console.warn('⚠️ Erro ao carregar temas do Supabase:', err.message);
            }
        }
        
        // Fallback: carregar do JSON local
        if (!temas) {
            const response = await fetch("data/conteudos.json");
            const dadosJson = await response.json();
            temas = {};
            
            for (let [chave, valor] of Object.entries(dadosJson)) {
                temas[chave] = {
                    nome: valor.titulo,
                    emoji: valor.titulo?.split(' ')[0] || '📚',
                    numSubtemas: valor.subtemas?.length || 5
                };
            }
            console.log('✅ Temas carregados do JSON local');
        }
        
        container.innerHTML = "";
        
        for (let [chave, valor] of Object.entries(temas)) {
            const config = temasConfig[chave] || { 
                nome: valor.nome || chave, 
                emoji: valor.emoji || "📚", 
                cor: "#667eea", 
                corEscura: "#764ba2" 
            };
            
            const card = document.createElement("div");
            card.className = "card";
            card.setAttribute("data-tema", chave);
            card.style.borderTop = "5px solid " + config.cor;
            card.innerHTML = `
                <div class="card-header" style="background: linear-gradient(135deg, ${config.cor}, ${config.corEscura});">
                    <div class="emoji">${config.emoji}</div>
                    <h3>${config.nome}</h3>
                </div>
                <div class="card-content">
                    <p>📚 ${valor.numSubtemas || 5} temas para aprender!</p>
                    <div class="card-buttons">
                        <button class="btn btn-aprender" data-tema="${chave}">📖 Aprender</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        }
        
        // Adicionar eventos aos botões
        document.querySelectorAll(".btn-aprender").forEach(function(btn) {
            btn.addEventListener("click", function(e) {
                e.stopPropagation();
                const tema = btn.getAttribute("data-tema");
                if (typeof abrirAprendizado !== 'undefined') {
                    abrirAprendizado(tema);
                }
            });
        });
        
        // Adicionar evento de clique nos cards também
        document.querySelectorAll(".card").forEach(function(card) {
            card.addEventListener("click", function() {
                const tema = card.getAttribute("data-tema");
                if (typeof abrirAprendizado !== 'undefined') {
                    abrirAprendizado(tema);
                }
            });
        });
        
    } catch (error) {
        console.error("❌ Erro ao carregar cards:", error);
        container.innerHTML = `
            <div style="text-align:center; padding:50px; color:white;">
                <i class="fas fa-exclamation-triangle" style="font-size: 40px;"></i>
                <p>❌ Erro ao carregar temas. Recarregue a página.</p>
                <button onclick="location.reload()" class="btn-hero" style="margin-top: 20px;">
                    🔄 Recarregar
                </button>
            </div>
        `;
    }
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", async function() {
    console.log('🚀 Inicializando site...');
    
    // Evento de clique no nome do jogador
    const playerNameEl = document.getElementById("playerName");
    if (playerNameEl) {
        playerNameEl.addEventListener("click", function() {
            const usuario = getUsuarioAtual();
            if (usuario) {
                const opcao = confirm(`${usuario.apelido} (${usuario.idade || '?'}a)\n⭐ ${usuario.pontos || 0} pontos\n🏅 ${usuario.titulo || '🌿 Iniciante'}\n\nDeseja sair da sua conta?`);
                if (opcao && typeof fazerLogout !== 'undefined') {
                    fazerLogout();
                }
            } else {
                if (typeof mostrarModalAuth !== 'undefined') {
                    mostrarModalAuth();
                }
            }
        });
    }
    
    // Fechar modal do quiz ao clicar no X
    const closeModal = document.querySelector("#modalQuiz .close");
    if (closeModal) {
        closeModal.onclick = function() {
            document.getElementById("modalQuiz").style.display = "none";
            document.getElementById("quizArea").innerHTML = "";
        };
    }
    
    // Fechar modais ao clicar fora
    window.onclick = function(e) {
        const modalQuiz = document.getElementById("modalQuiz");
        const modalAprendizado = document.getElementById("modalAprendizado");
        const modalAuth = document.getElementById("modalAuth");
        
        if (e.target === modalQuiz) {
            modalQuiz.style.display = "none";
            document.getElementById("quizArea").innerHTML = "";
        }
        if (e.target === modalAprendizado) {
            if (typeof fecharModalAprendizado !== 'undefined') {
                fecharModalAprendizado();
            }
        }
        if (e.target === modalAuth) {
            if (typeof fecharModalAuth !== 'undefined') {
                fecharModalAuth();
            }
        }
    };
    
    // Carregar dados
    await carregarCards();
    
    // Carregar usuário logado
    if (typeof carregarUsuarioLogado !== 'undefined') {
        carregarUsuarioLogado();
    }
    if (typeof carregarPontosDoUsuario !== 'undefined') {
        carregarPontosDoUsuario();
    }
    
    // Atualizar header e ranking
    if (typeof atualizarHeader !== 'undefined') {
        atualizarHeader();
    }
    
    // Aguardar Supabase inicializar
    setTimeout(async () => {
        if (typeof atualizarRanking !== 'undefined') {
            await atualizarRanking();
        }
        if (typeof atualizarEstatisticas !== 'undefined') {
            atualizarEstatisticas();
        }
    }, 1500);
    
    console.log('✅ Site inicializado!');
    console.log('👤 Usuário:', getUsuarioAtual()?.apelido || 'Não logado');
    console.log('⭐ Pontos:', getUsuarioAtual()?.pontos || pontos);
});

// ========== FUNÇÕES GLOBAIS ==========

// Função para lidar com clique no player (chamada do HTML)
window.handlePlayerClick = function() {
    const usuario = getUsuarioAtual();
    
    if (usuario) {
        const opcao = confirm(
            `🎮 ${usuario.apelido}\n` +
            `⭐ ${usuario.pontos || 0} pontos\n` +
            `🏅 ${usuario.titulo || '🌿 Iniciante'}\n` +
            `📊 ${(usuario.quizzes_completados || []).length} quizzes feitos\n\n` +
            'Clique OK para sair ou Cancelar para continuar'
        );
        
        if (opcao && typeof fazerLogout !== 'undefined') {
            fazerLogout();
        }
    } else {
        if (typeof mostrarModalAuth !== 'undefined') {
            mostrarModalAuth();
        }
    }
};

// Exportar funções principais
window.adicionarPontos = window.adicionarPontos; // já definida como async
window.carregarPontosParaQuiz = carregarPontosParaQuiz;
window.atualizarHeader = atualizarHeader;
window.carregarCards = carregarCards;

console.log("✅ main.js carregado com sucesso! (v3.0 - Supabase)");
