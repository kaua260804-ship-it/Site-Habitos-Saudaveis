// ============================================
// SISTEMA DE RANKING - VERSÃO SUPABASE
// ============================================

// Função principal de atualização
async function atualizarRanking() {
    console.log("📊 Atualizando ranking...");
    
    let ranking = [];
    let usandoOnline = false;
    
    // Tentar buscar do Supabase primeiro
    if (typeof buscarRankingDB !== 'undefined' && supabaseClient) {
        try {
            ranking = await buscarRankingDB();
            usandoOnline = true;
            console.log(`✅ Ranking online: ${ranking.length} jogadores`);
        } catch (error) {
            console.warn('⚠️ Erro ao buscar ranking online, usando local:', error);
        }
    }
    
    // Fallback para localStorage
    if (ranking.length === 0) {
        ranking = getRankingLocal();
        usandoOnline = false;
    }
    
    // Ordenar por pontos (garantir mesmo sem view)
    ranking.sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
    
    // Renderizar
    renderizarRanking(ranking.slice(0, 20), usandoOnline);
}

// Buscar ranking do localStorage (fallback)
function getRankingLocal() {
    if (typeof getRankingCompleto !== 'undefined') {
        return getRankingCompleto();
    }
    
    const ranking = JSON.parse(localStorage.getItem("ranking") || "[]");
    return ranking.map((item, idx) => ({
        ...item,
        posicao: idx + 1
    }));
}

// Renderizar ranking na tela
function renderizarRanking(ranking, online = false) {
    const lista = document.getElementById("rankingList");
    const usuarioAtual = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    
    if (!lista) return;
    
    lista.innerHTML = "";
    
    if (ranking.length === 0) {
        lista.innerHTML = `
            <li style="text-align: center; padding: 20px;">
                <div style="font-size: 40px; margin-bottom: 10px;">🏆</div>
                <strong>Seja o primeiro no ranking!</strong>
                <br><small>Faça quizzes e ganhe pontos</small>
            </li>`;
        return;
    }
    
    // Adicionar indicador de fonte
    const fonteIndicador = document.createElement('li');
    fonteIndicador.style.cssText = `
        font-size: 10px;
        color: #a0aec0;
        text-align: center;
        padding: 5px;
        background: transparent;
        display: ${online ? 'block' : 'none'};
    `;
    fonteIndicador.innerHTML = online ? '🌐 Ranking Online' : '💾 Ranking Local';
    lista.appendChild(fonteIndicador);
    
    ranking.forEach((jogador, idx) => {
        const medalha = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx+1}º`;
        const isCurrentUser = usuarioAtual && usuarioAtual.apelido === jogador.apelido;
        
        const li = document.createElement("li");
        li.className = isCurrentUser ? "current-player-row" : "";
        
        // Efeito especial para top 3
        if (idx < 3) {
            li.style.background = idx === 0 
                ? 'linear-gradient(90deg, #fef3c7, #fff9e6)' 
                : idx === 1 
                    ? 'linear-gradient(90deg, #e2e8f0, #f7fafc)' 
                    : 'linear-gradient(90deg, #fce7c8, #fef9f0)';
        }
        
        // Destacar jogador atual
        if (isCurrentUser) {
            li.style.background = 'linear-gradient(90deg, #dbeafe, #eff6ff)';
            li.style.borderLeft = '4px solid #3b82f6';
            li.style.fontWeight = 'bold';
        }
        
        li.innerHTML = `
            <div class="ranking-position" style="font-size: 20px; min-width: 45px;">${medalha}</div>
            <div class="ranking-info">
                <strong>${escapeHtml(jogador.apelido || 'Anônimo')}</strong>
                ${jogador.nome ? `<span class="ranking-name">${escapeHtml(jogador.nome)}</span>` : ''}
                <span class="ranking-age">${jogador.idade ? jogador.idade + ' anos' : ''} • ${jogador.titulo || '🌿 Iniciante'}</span>
            </div>
            <div class="ranking-points">
                <span style="font-size: 16px;">⭐</span> ${jogador.pontos || 0} pts
            </div>
        `;
        
        // Animação de entrada
        li.style.animation = `fadeInLeft 0.3s ease ${idx * 0.05}s both`;
        
        lista.appendChild(li);
    });
    
    // Se usuário atual não está no top 20, mostrar posição dele
    if (usuarioAtual) {
        const posicaoUsuario = ranking.findIndex(j => j.apelido === usuarioAtual.apelido);
        if (posicaoUsuario > 19) {
            const separador = document.createElement('li');
            separador.style.cssText = 'text-align: center; color: #a0aec0; font-size: 12px;';
            separador.innerHTML = '...';
            lista.appendChild(separador);
            
            const li = document.createElement("li");
            li.className = "current-player-row";
            li.style.background = 'linear-gradient(90deg, #dbeafe, #eff6ff)';
            li.style.borderLeft = '4px solid #3b82f6';
            li.style.fontWeight = 'bold';
            li.innerHTML = `
                <div class="ranking-position">${posicaoUsuario + 1}º</div>
                <div class="ranking-info">
                    <strong>${escapeHtml(usuarioAtual.apelido)} (Você)</strong>
                    <span class="ranking-name">${escapeHtml(usuarioAtual.nome || '')}</span>
                    <span class="ranking-age">${usuarioAtual.idade} anos</span>
                </div>
                <div class="ranking-points">⭐ ${usuarioAtual.pontos || 0} pts</div>
            `;
            lista.appendChild(li);
        }
    }
}

// Função auxiliar para escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Atualizar estatísticas do jogador
async function atualizarEstatisticas() {
    const progressBar = document.getElementById("progressBar");
    const nextTitleSpan = document.getElementById("nextTitle");
    const quizzesDoneSpan = document.getElementById("quizzesDone");
    
    const usuarioAtual = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    const pontosAtuais = usuarioAtual ? (usuarioAtual.pontos || 0) : (typeof pontos !== 'undefined' ? pontos : 0);
    
    // Calcular progresso
    if (progressBar) {
        let porcentagem = 0;
        let nextTitle = "🍎 Six Seven (100 pts)";
        
        if (pontosAtuais >= 1000) {
            porcentagem = 100;
            nextTitle = "🏆 Lenda da Saúde!";
        } else if (pontosAtuais >= 500) {
            porcentagem = ((pontosAtuais - 500) / 500) * 100;
            nextTitle = "👑 Mestre da Saúde Supremo (1000 pts)";
        } else if (pontosAtuais >= 250) {
            porcentagem = ((pontosAtuais - 250) / 250) * 100;
            nextTitle = "🫡 Capitão Saúde (500 pts)";
        } else if (pontosAtuais >= 100) {
            porcentagem = ((pontosAtuais - 100) / 150) * 100;
            nextTitle = "💪 Farmou Aura no Exercício (250 pts)";
        } else {
            porcentagem = (pontosAtuais / 100) * 100;
            nextTitle = "🍎 Six Seven do Alimentos (100 pts)";
        }
        
        progressBar.style.width = `${Math.min(porcentagem, 100)}%`;
        
        // Animação suave na barra
        progressBar.style.transition = 'width 0.5s ease';
        
        if (nextTitleSpan) {
            nextTitleSpan.innerText = nextTitle;
            nextTitleSpan.style.color = '#667eea';
            nextTitleSpan.style.fontWeight = 'bold';
        }
    }
    
    // Atualizar quizzes completados
    if (quizzesDoneSpan) {
        const completados = JSON.parse(localStorage.getItem("quizzes_completados") || "[]");
        quizzesDoneSpan.innerText = completados.length;
        
        if (completados.length > 0) {
            quizzesDoneSpan.style.color = '#48bb78';
            quizzesDoneSpan.style.fontWeight = 'bold';
        }
    }
}

// Adicionar pontos (função global melhorada)
window.adicionarPontos = async function(qtd) {
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    
    if (usuario) {
        usuario.pontos = (usuario.pontos || 0) + qtd;
        
        // Salvar localmente
        if (typeof salvarUsuarioAtual !== 'undefined') {
            salvarUsuarioAtual(usuario);
        }
        
        // Atualizar no Supabase se disponível
        if (typeof atualizarPontosDB !== 'undefined' && supabaseClient) {
            await atualizarPontosDB(
                usuario.apelido, 
                usuario.pontos,
                usuario.quizzes_completados || []
            );
        }
        
        // Atualizar localStorage
        localStorage.setItem("pontos", usuario.pontos);
    } else {
        // Modo sem login
        window.pontos = (window.pontos || 0) + qtd;
        localStorage.setItem("pontos", window.pontos);
    }
    
    // Atualizar toda interface
    if (typeof atualizarHeader !== 'undefined') {
        atualizarHeader();
    }
    await atualizarRanking();
    atualizarEstatisticas();
    
    console.log(`⭐ +${qtd} pontos adicionados!`);
};

// Atualizar ranking a cada 30 segundos
setInterval(atualizarRanking, 30000);

// Inicialização
document.addEventListener("DOMContentLoaded", async function() {
    console.log("🚀 Inicializando sistema de ranking...");
    
    // Primeira carga
    await atualizarRanking();
    atualizarEstatisticas();
    
    // Sincronizar dados se usuário logado
    const usuario = typeof getUsuarioAtual !== 'undefined' ? getUsuarioAtual() : null;
    if (usuario && typeof sincronizarDadosLocais !== 'undefined' && supabaseClient) {
        await sincronizarDadosLocais(usuario);
        atualizarEstatisticas();
    }
    
    console.log("✅ Sistema de ranking pronto!");
});

// Exportar funções
window.atualizarRanking = atualizarRanking;
window.atualizarEstatisticas = atualizarEstatisticas;
window.escapeHtml = escapeHtml;

console.log("🏆 Ranking.js carregado com sucesso! (v2.0 - Supabase)");