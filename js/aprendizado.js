// ============================================
// SISTEMA DE APRENDIZADO - VERSÃO CORRIGIDA
// ============================================

async function abrirAprendizado(tema) {
    console.log("Abrindo aprendizado do tema:", tema);
    
    try {
        const response = await fetch("data/conteudos.json");
        const dados = await response.json();
        const conteudo = dados[tema];
        
        if (!conteudo) {
            alert("Conteudo nao encontrado!");
            return;
        }
        
        const emojisTema = {
            alimentacao: "🍎",
            exercicios: "🤸", 
            higiene: "🧼",
            sono: "😴",
            saudemental: "🧠",
            postura: "📚",
            agua: "💧",
            alimentacaoequilibrada: "🥗",
            bullying: "🤝",
            meioambiente: "🌍"
        };
        
        const subtopicos = conteudo.subtemas.map(function(sub, idx) {
            var id = sub.nome.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/g, '_');
            
            var mapIds = {
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
                'troca_de_roupas': 'higiene_roupas',
                'horas_de_sono_ideais': 'sono_horas',
                'rotina_do_sono': 'sono_rotina',
                'evitar_telas_antes_de_dormir': 'sono_telas',
                'ambiente_aconchegante': 'sono_ambiente',
                'cochilos_e_descanso': 'sono_cochilo',
                'o_que_e_saude_mental': 'saudemental_oque',
                'falar_sobre_sentimentos': 'saudemental_sentimentos',
                'respiracao_para_acalmar': 'saudemental_respiracao',
                'hobbies_e_lazer': 'saudemental_hobbies',
                'pedir_ajuda': 'saudemental_ajuda',
                'sentar_corretamente': 'postura_sentar',
                'usar_mochila_corretamente': 'postura_mochila',
                'celular_e_pescoco': 'postura_celular',
                'alongamentos_no_dia': 'postura_alongamento',
                'dormir_com_postura_correta': 'postura_dormir',
                'quantidade_de_agua': 'hidratacao_quantidade',
                'sinais_de_desidratacao': 'hidratacao_sinais',
                'sucos_naturais': 'hidratacao_sucos',
                'evitar_refrigerantes': 'hidratacao_refrigerante',
                'beber_antes_da_sede': 'hidratacao_sede',
                'prato_colorido': 'alimentacao_prato',
                'carboidratos': 'alimentacao_carboidratos',
                'proteinas': 'alimentacao_proteinas',
                'gorduras_boas': 'alimentacao_gorduras',
                'mastigar_devagar': 'alimentacao_mastigar',
                'o_que_e_bullying': 'bullying_oque',
                'como_denunciar': 'bullying_denunciar',
                'cyberbullying': 'bullying_cyberbullying',
                'ser_um_aliado': 'bullying_aliado',
                'respeitar_diferencas': 'bullying_respeito',
                'ar_puro': 'meioambiente_ar',
                'reciclagem': 'meioambiente_reciclagem',
                'economizar_agua': 'meioambiente_agua',
                'contato_com_a_natureza': 'meioambiente_natureza',
                'menos_plastico': 'meioambiente_plastico'
            };
            
            return {
                id: mapIds[id] || tema + '_' + idx,
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
        alert("Erro ao carregar conteudo. Recarregue a pagina.");
    }
}

function criarCardsSubtopicos(tema, subtopicos) {
    var emojisLista = ['🥗', '🏃', '🪥', '😴', '🧠', '🪑', '💧', '🍽️', '🤝', '🌍'];
    
    var html = '<div class="aprendizado-container">' +
        '<div class="aprendizado-header">' +
            '<div class="aprendizado-emoji">' + tema.emoji + '</div>' +
            '<h2>' + tema.titulo + '</h2>' +
            '<p>🌟 Clique em qualquer card para aprender mais e depois faca o quiz!</p>' +
        '</div>' +
        '<div class="aprendizado-grid">';
    
    for (var i = 0; i < subtopicos.length; i++) {
        var sub = subtopicos[i];
        var emoji = emojisLista[i % emojisLista.length];
        var feito = '';
        if (typeof quizJaFoiFeito !== 'undefined' && quizJaFoiFeito(sub.id)) {
            feito = '✅';
        }
        
        var nomeEscaped = sub.nome.replace(/'/g, "\\'");
        var conteudoEscaped = (sub.conteudo || '').replace(/'/g, "\\'");
        
        html += '<div class="aprendizado-card" onclick="abrirSubtopicoDetalhe(\'' + sub.id + '\', \'' + nomeEscaped + '\', \'' + conteudoEscaped + '\')">' +
            '<div class="aprendizado-card-icon">' + emoji + '</div>' +
            '<h3>' + sub.nome + ' ' + feito + '</h3>' +
            '<p>' + (sub.resumo || '').substring(0, 100) + '...</p>' +
            '<button class="btn-quiz-card" onclick="event.stopPropagation(); iniciarQuizSubtopico(\'' + sub.id + '\', \'' + nomeEscaped + '\')">' +
                '🎮 Fazer Quiz' +
            '</button>' +
        '</div>';
    }
    
    html += '</div>' +
        '<div class="aprendizado-footer">' +
            '<button class="btn-fechar-aprendizado" onclick="fecharModalAprendizado()">📖 Voltar</button>' +
        '</div>' +
    '</div>';
    
    document.getElementById("aprendizadoArea").innerHTML = html;
    document.getElementById("modalAprendizado").style.display = "flex";
}

function abrirSubtopicoDetalhe(id, nome, conteudo) {
    console.log("Abrindo detalhe do subtopico:", id, nome);
    
    var linksInfo = { links: [] };
    if (typeof getLinks !== 'undefined') {
        linksInfo = getLinks(id);
    }
    var links = linksInfo.links || [];
    
    var conteudosDetalhados = {
        'alimentacao_piramide': {
            texto: 'A piramide alimentar e um guia visual que mostra quais alimentos devemos comer em maior quantidade (base: arroz, paes, massas, frutas, legumes) e quais devemos comer menos (topo: doces, gorduras, frituras).',
            dica: '🍎 DESAFIO: Desenhe sua propria piramide alimentar com os alimentos que voce mais gosta!'
        },
        'alimentacao_frutas': {
            texto: 'Comer frutas da epoca significa que elas estao mais saborosas, nutritivas e baratas. Ex: verao (melancia, manga, abacaxi), inverno (morango, laranja, banana).',
            dica: '🌟 DESAFIO: Esta semana, compre uma fruta que voce nunca experimentou antes!'
        },
        'alimentacao_agua': {
            texto: 'A agua representa cerca de 60% do nosso corpo. Beber 1,5 a 2 litros por dia ajuda a transportar nutrientes, regular a temperatura, eliminar toxinas e manter o cerebro funcionando bem.',
            dica: '🥤 DESAFIO: Leve uma garrafinha de agua para a escola todos os dias e beba entre as aulas!'
        },
        'alimentacao_ultraprocessados': {
            texto: 'Ultraprocessados sao alimentos industrializados cheios de acucar, sal, gorduras ruins e conservantes. Exemplos: refrigerantes, salgadinhos de pacote, bolachas recheadas, macarrao instantaneo, nuggets.',
            dica: '🏆 DESAFIO: Fique 1 semana sem refrigerante e substitua por agua ou suco natural!'
        },
        'alimentacao_cafe': {
            texto: 'O cafe da manha e a refeicao mais importante do dia! Ele da energia para estudar, brincar e se concentrar. Um bom cafe da manha deve ter: carboidratos (pao, cereal), proteinas (leite, iogurte, ovo) e frutas.',
            dica: '⭐ DESAFIO: Prepare seu proprio cafe da manha amanha com a ajuda dos seus pais!'
        }
    };
    
    var info = conteudosDetalhados[id];
    if (!info) {
        info = {
            texto: conteudo || 'Conteudo educativo em breve!',
            dica: '📚 Leia com atencao e depois faca o quiz para ganhar pontos!'
        };
    }
    
    var jaFez = false;
    if (typeof quizJaFoiFeito !== 'undefined') {
        jaFez = quizJaFoiFeito(id);
    }
    
    var linksHtml = '';
    if (links && links.length > 0) {
        linksHtml = '<div class="aprendizado-links">' +
            '<p style="margin-bottom: 10px; color: #ed8936; font-weight: 600;">📚 Quer saber mais? Clique nos links abaixo:</p>' +
            '<div class="links-container">';
        for (var i = 0; i < links.length; i++) {
            linksHtml += '<a href="' + links[i].url + '" target="_blank" rel="noopener noreferrer" class="link-button">' +
                '<i class="fas fa-external-link-alt"></i> ' + links[i].nome +
            '</a>';
        }
        linksHtml += '</div></div>';
    } else {
        linksHtml = '<div class="aprendizado-links">' +
            '<p style="margin-bottom: 10px; color: #a0aec0;">📚 Em breve mais links sobre este tema!</p>' +
        '</div>';
    }
    
    var nomeEscaped = nome.replace(/'/g, "\\'");
    
    var html = '<div class="aprendizado-container">' +
        '<div class="aprendizado-header">' +
            '<div class="aprendizado-emoji">📚</div>' +
            '<h2>' + nome + '</h2>' +
            '<p>🌟 Leia com atencao e depois faca o quiz para ganhar pontos!</p>' +
        '</div>' +
        '<div class="aprendizado-card-detalhe">' +
            '<div class="conteudo-texto">' +
                '<i class="fas fa-book-open" style="color: #667eea; margin-right: 10px;"></i>' +
                '<strong>📖 Sobre este tema</strong>' +
                '<p>' + info.texto + '</p>' +
            '</div>' +
            linksHtml +
            '<div class="desafio-box">' +
                '<i class="fas fa-trophy" style="color: #f59e0b; font-size: 20px;"></i>' +
                '<strong>🎯 ' + info.dica + '</strong>' +
            '</div>';
    
    if (jaFez) {
        html += '<div class="quiz-completed-badge"><i class="fas fa-check-circle"></i> ✅ Voce ja completou este quiz e ganhou os pontos!</div>';
    }
    
    html += '<button class="btn-quiz-principal" onclick="iniciarQuizSubtopico(\'' + id + '\', \'' + nomeEscaped + '\')">' +
                '<i class="fas fa-gamepad"></i> 🎮 Fazer Quiz Agora!' +
            '</button>' +
        '</div>' +
        '<div class="aprendizado-footer">' +
            '<button class="btn-fechar-aprendizado" onclick="fecharModalAprendizado()">' +
                '<i class="fas fa-arrow-left"></i> 📖 Voltar para os temas' +
            '</button>' +
        '</div>' +
    '</div>';
    
    document.getElementById("aprendizadoArea").innerHTML = html;
    document.getElementById("modalAprendizado").style.display = "flex";
}

function fecharModalAprendizado() {
    var modal = document.getElementById("modalAprendizado");
    if (modal) {
        modal.style.display = "none";
    }
}

window.abrirAprendizado = abrirAprendizado;
window.criarCardsSubtopicos = criarCardsSubtopicos;
window.abrirSubtopicoDetalhe = abrirSubtopicoDetalhe;
window.fecharModalAprendizado = fecharModalAprendizado;

console.log("Aprendizado.js carregado com sucesso!");