// ============================================
// SISTEMA DE APRENDIZADO - COM LINKS REAIS
// ============================================

async function abrirAprendizado(tema) {
    console.log("Abrindo aprendizado do tema:", tema);
    
    try {
        const response = await fetch("data/conteudos.json");
        const dados = await response.json();
        const conteudo = dados[tema];
        
        if (!conteudo) {
            alert("Conteúdo não encontrado!");
            return;
        }
        
        const emojisTema = {
            alimentacao: "🍎", exercicios: "🤸", higiene: "🧼", sono: "😴",
            saudemental: "🧠", postura: "📚", agua: "💧", alimentacaoequilibrada: "🥗",
            bullying: "🤝", meioambiente: "🌍"
        };
        
        const subtopicos = conteudo.subtemas.map((sub, idx) => {
            let id = sub.nome.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/g, '_');
            
            const mapIds = {
                'piramide_alimentar': 'alimentacao_piramide',
                'frutas_da_estacao': 'alimentacao_frutas',
                'importancia_da_agua': 'alimentacao_agua',
                'evitar_ultraprocessados': 'alimentacao_ultraprocessados',
                'cafe_da_manha_poderoso': 'alimentacao_cafe',
                'beneficios_do_esporte': 'exercicios_beneficios',
                'alongamento_diario': 'exercicios_alongamento',
                'brincadeiras_ativas': 'exercicios_brincadeiras',
                'esportes_em_equipe': 'exercicios_equipe',
                'atividades_ao_ar_livre': 'exercicios_arlivre',
                'lavagem_das_maos': 'higiene_maos',
                'banho_diario': 'higiene_banho',
                'escovacao_dos_dentes': 'higiene_dentes',
                'cuidados_com_unhas': 'higiene_unhas',
                'troca_de_roupas': 'higiene_roupas'
            };
            
            return {
                id: mapIds[id] || `${tema}_${idx}`,
                nome: sub.nome,
                resumo: sub.resumo,
                conteudo: sub.resumo
            };
        });
        
        criarCardsSubtopicos({
            titulo: conteudo.titulo,
            emoji: emojisTema[tema] || "📚"
        }, subtopicos);
        
    } catch (error) {
        console.error("Erro ao abrir aprendizado:", error);
        alert("Erro ao carregar conteúdo. Recarregue a página.");
    }
}

function criarCardsSubtopicos(tema, subtopicos) {
    const emojisLista = ['🥗', '🏃', '🪥', '😴', '🧠', '🪑', '💧', '🍽️', '🤝', '🌍'];
    
    let html = `
        <div class="aprendizado-container">
            <div class="aprendizado-header">
                <div class="aprendizado-emoji">${tema.emoji}</div>
                <h2>${tema.titulo}</h2>
                <p>🌟 Clique em qualquer card para aprender mais e depois faça o quiz!</p>
            </div>
            <div class="aprendizado-grid">
    `;
    
    for (let i = 0; i < subtopicos.length; i++) {
        const sub = subtopicos[i];
        const emoji = emojisLista[i % emojisLista.length];
        const feito = (typeof quizJaFoiFeito !== 'undefined' && quizJaFoiFeito(sub.id)) ? '✅' : '';
        
        html += `
            <div class="aprendizado-card" onclick="abrirSubtopicoDetalhe('${sub.id}', '${sub.nome.replace(/'/g, "\\'")}', '${(sub.conteudo || '').replace(/'/g, "\\'")}')">
                <div class="aprendizado-card-icon">${emoji}</div>
                <h3>${sub.nome} ${feito}</h3>
                <p>${(sub.resumo || '').substring(0, 100)}...</p>
                <button class="btn-quiz-card" onclick="event.stopPropagation(); iniciarQuizSubtopico('${sub.id}', '${sub.nome.replace(/'/g, "\\'")}')">
                    🎮 Fazer Quiz
                </button>
            </div>
        `;
    }
    
    html += `
            </div>
            <div class="aprendizado-footer">
                <button class="btn-fechar-aprendizado" onclick="fecharModalAprendizado()">
                    📖 Voltar
                </button>
            </div>
        </div>
    `;
    
    document.getElementById("aprendizadoArea").innerHTML = html;
    document.getElementById("modalAprendizado").style.display = "flex";
}

function abrirSubtopicoDetalhe(id, nome, conteudo) {
    console.log("Abrindo detalhe do subtopico:", id, nome);
    
    // Buscar links do arquivo linksData.js
    const linksInfo = (typeof getLinks !== 'undefined') ? getLinks(id) : { links: [] };
    const links = linksInfo.links || [];
    
    // Conteúdo detalhado para cada subtópico
    const conteudosDetalhados = {
        'alimentacao_piramide': {
            texto: 'A pirâmide alimentar é um guia visual que mostra quais alimentos devemos comer em maior quantidade (base: arroz, pães, massas, frutas, legumes) e quais devemos comer menos (topo: doces, gorduras, frituras).',
            dica: '🍎 DESAFIO: Desenhe sua própria pirâmide alimentar com os alimentos que você mais gosta!'
        },
        'alimentacao_frutas': {
            texto: 'Comer frutas da época significa que elas estão mais saborosas, nutritivas e baratas. Ex: verão (melancia, manga, abacaxi), inverno (morango, laranja, banana).',
            dica: '🌟 DESAFIO: Esta semana, compre uma fruta que você nunca experimentou antes!'
        },
        'alimentacao_agua': {
            texto: 'A água representa cerca de 60% do nosso corpo. Beber 1,5 a 2 litros por dia ajuda a transportar nutrientes, regular a temperatura, eliminar toxinas e manter o cérebro funcionando bem.',
            dica: '🥤 DESAFIO: Leve uma garrafinha de água para a escola todos os dias e beba entre as aulas!'
        },
        'alimentacao_ultraprocessados': {
            texto: 'Ultraprocessados são alimentos industrializados cheios de açúcar, sal, gorduras ruins e conservantes. Exemplos: refrigerantes, salgadinhos de pacote, bolachas recheadas, macarrão instantâneo, nuggets.',
            dica: '🏆 DESAFIO: Fique 1 semana sem refrigerante e substitua por água ou suco natural!'
        },
        'alimentacao_cafe': {
            texto: 'O café da manhã é a refeição mais importante do dia! Ele dá energia para estudar, brincar e se concentrar. Um bom café da manhã deve ter: carboidratos (pão, cereal), proteínas (leite, iogurte, ovo) e frutas.',
            dica: '⭐ DESAFIO: Prepare seu próprio café da manhã amanhã com a ajuda dos seus pais!'
        }
    };
    
    const info = conteudosDetalhados[id] || {
        texto: conteudo || 'Conteúdo educativo em breve!',
        dica: '📚 Leia com atenção e depois faça o quiz para ganhar pontos!'
    };
    
    const jaFez = (typeof quizJaFoiFeito !== 'undefined' && quizJaFoiFeito(id)) ? true : false;
    
    // Gerar HTML dos links
    let linksHtml = '';
    if (links && links.length > 0) {
        linksHtml = `
            <div class="aprendizado-links">
                <p style="margin-bottom: 10px; color: #ed8936; font-weight: 600;">📚 Quer saber mais? Clique nos links abaixo:</p>
                <div class="links-container">
        `;
        links.forEach(link => {
            linksHtml += `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-button">
                <i class="fas fa-external-link-alt"></i> ${link.nome}
            </a>`;
        });
        linksHtml += `</div></div>`;
    } else {
        linksHtml = `<div class="aprendizado-links">
            <p style="margin-bottom: 10px; color: #a0aec0;">📚 Em breve mais links sobre este tema!</p>
        </div>`;
    }
    
    const html = `
        <div class="aprendizado-container">
            <div class="aprendizado-header">
                <div class="aprendizado-emoji">📚</div>
                <h2>${nome}</h2>
                <p>🌟 Leia com atenção e depois faça o quiz para ganhar pontos!</p>
            </div>
            <div class="aprendizado-card-detalhe">
                <div class="conteudo-texto">
                    <i class="fas fa-book-open" style="color: #667eea; margin-right: 10px;"></i>
                    <strong>📖 Sobre este tema</strong>
                    <p>${info.texto}</p>
                </div>
                ${linksHtml}
                <div class="desafio-box">
                    <i class="fas fa-trophy" style="color: #f59e0b; font-size: 20px;"></i>
                    <strong>🎯 ${info.dica}</strong>
                </div>
                ${jaFez ? '<div class="quiz-completed-badge"><i class="fas fa-check-circle"></i> ✅ Você já completou este quiz e ganhou os pontos!</div>' : ''}
                <button class="btn-quiz-principal" onclick="iniciarQuizSubtopico(\'' + id + '\', \'' + nome.replace(/'/g, "\\'") + '\')">
                    <i class="fas fa-gamepad"></i> 🎮 Fazer Quiz Agora!
                </button>
            </div>
            <div class="aprendizado-footer">
                <button class="btn-fechar-aprendizado" onclick="fecharModalAprendizado()">
                    <i class="fas fa-arrow-left"></i> 📖 Voltar para os temas
                </button>
            </div>
        </div>
    `;
    
    document.getElementById("aprendizadoArea").innerHTML = html;
    document.getElementById("modalAprendizado").style.display = "flex";
}

function fecharModalAprendizado() {
    document.getElementById("modalAprendizado").style.display = "none";
}

window.abrirAprendizado = abrirAprendizado;
window.criarCardsSubtopicos = criarCardsSubtopicos;
window.abrirSubtopicoDetalhe = abrirSubtopicoDetalhe;
window.fecharModalAprendizado = fecharModalAprendizado;

console.log("✅ aprendizado.js carregado com sucesso!");