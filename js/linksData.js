// ============================================
// LINKS REAIS E ÚTEIS PARA CADA SUBTÓPICO
// 1 LINK POR SUBTÓPICO - VERSÃO ATUALIZADA
// ============================================

const linksData = {
    // ========== ALIMENTAÇÃO SAUDÁVEL ==========
    'alimentacao_piramide': {
        links: [
            { nome: '🥗 Toda Matéria - Pirâmide Alimentar', url: 'https://www.todamateria.com.br/piramide-alimentar/' }
        ]
    },
    'alimentacao_frutas': {
        links: [
            { nome: '🍓 Organis - Frutas de Cada Estação', url: 'https://organis.org.br/as-frutas-de-cada-estacao/' }
        ]
    },
    'alimentacao_agua': {
        links: [
            { nome: '💧 Toda Matéria - Importância da Água', url: 'https://www.todamateria.com.br/a-importancia-da-agua/' }
        ]
    },
    'alimentacao_ultraprocessados': {
        links: [
            { nome: '🚫 Tua Saúde - Alimentos Ultraprocessados', url: 'https://www.tuasaude.com/alimentos-ultraprocessados/' }
        ]
    },
    'alimentacao_cafe': {
        links: [
            { nome: '☀️ Tia Sônia - Café da Manhã Saudável', url: 'https://www.tiasonia.com.br/posts/cafe-da-manha-saudavel-7-opcoes-saudaveis-e-gostosas' }
        ]
    },

    // ========== ATIVIDADE FÍSICA ==========
    'exercicios_beneficios': {
        links: [
            { nome: '🏃 Unimed - Benefícios do Esporte', url: 'https://www.unimedcampinas.com.br/blog/viver-com-saude/conheca-4-beneficios-do-esporte-para-a-saude-e-saiba-como-escolher-o-melhor-para-voce' }
        ]
    },
    'exercicios_alongamento': {
        links: [
            { nome: '🧘 Correio Braziliense - Alongamento Diário', url: 'https://www.correiobraziliense.com.br/cbradar/por-que-o-alongamento-diario-e-o-habito-que-reduz-dores-no-corpo-e-melhora-sua-disposicao-ao-longo-do-dia/' }
        ]
    },
    'exercicios_brincadeiras': {
        links: [
            { nome: '🎪 Milium - Brincadeiras Infantis', url: 'https://blog.milium.com.br/dicas/brincadeiras-infantis-que-estimulam-o-crescimento-saudavel/' }
        ]
    },
    'exercicios_equipe': {
        links: [
            { nome: '⚽ Educa Mais Brasil - Esportes Coletivos', url: 'https://www.educamaisbrasil.com.br/enem/educacao-fisica/esportes-coletivos' }
        ]
    },
    'exercicios_arlivre': {
        links: [
            { nome: '🌳 Politécnico - Brincar ao Ar Livre', url: 'https://www.politecnicosorocaba.com.br/brincar-ao-ar-livre-traz-beneficios-para-as-criancas/' }
        ]
    },

    // ========== HIGIENE PESSOAL ==========
    'higiene_maos': {
        links: [
            { nome: '🧼 Fiocruz - Lavagem das Mãos', url: 'https://fiocruz.br/biosseguranca/Bis/virtual%20tour/hipertextos/up1/lavagem_de_maos.html' }
        ]
    },
    'higiene_banho': {
        links: [
            { nome: '🚿 Drauzio Varella - Banho Diário', url: 'https://drauziovarella.uol.com.br/dermatologia/tomar-banho-todos-os-dias-pode-fazer-mal/' }
        ]
    },
    'higiene_dentes': {
        links: [
            { nome: '🪥 Ideal Odonto - Escovação dos Dentes', url: 'https://www.idealodonto.com.br/blog/escova-de-dentes-descubra-o-que-faz-a-diferenca-na-sua-saude-bucal/' }
        ]
    },
    'higiene_unhas': {
        links: [
            { nome: '✂️ SBD - Cuidados com Unhas', url: 'https://www.sbd.org.br/cuidados/cuidados-com-as-unhas/' }
        ]
    },
    'higiene_roupas': {
        links: [
            { nome: '👕 Pita Rosa - Troca de Roupas', url: 'https://pitarosa.com.br/glossario/para-que-serve-troca-de-roupas-beneficios-e-impactos/' }
        ]
    },

    // ========== SONO E DESCANSO ==========
    'sono_horas': {
        links: [
            { nome: '😴 Children\'s Colorado - Horas de Sono', url: 'https://www.childrenscolorado.org/just-ask-childrens/articles/kids-sleep-benefits/' }
        ]
    },
    'sono_rotina': {
        links: [
            { nome: '📅 Clínica PBSF - Rotina do Sono', url: 'https://clinicapbsf.com.br/a-importancia-da-rotina-do-sono-para-as-criancas/' }
        ]
    },
    'sono_telas': {
        links: [
            { nome: '📱 Tua Saúde - Evitar Telas', url: 'https://www.tuasaude.com/news/2026/03/09/8-beneficios-de-fazer-uma-pausa-no-uso-de-telas-antes-de-dormir/' }
        ]
    },
    'sono_ambiente': {
        links: [
            { nome: '🛌 Construtora Laguna - Ambiente Aconchegante', url: 'https://blog.construtoralaguna.com.br/construtora/estilo-de-vida/como-tornar-os-ambientes-mais-ludicos-e-estimular-a-autonomia-das-criancas/' }
        ]
    },
    'sono_cochilo': {
        links: [
            { nome: '😴 Portal AMS - Soneca à Tarde', url: 'https://www.portalams.com.br/noticias/longevidade/o-impacto-da-soneca-a-tarde/' }
        ]
    },

    // ========== SAÚDE MENTAL ==========
    'saudemental_oque': {
        links: [
            { nome: '🧠 OPAS - Saúde Mental', url: 'https://www.paho.org/pt/topicos/saude-mental' }
        ]
    },
    'saudemental_sentimentos': {
        links: [
            { nome: '🗣️ Escola Saudavelmente - Falar sobre Sentimentos', url: 'https://escolasaudavelmente.pt/alunos/criancas/minhas-emocoes-pensamentos-e-comportamentos/falar-sobre-sentimentos' }
        ]
    },
    'saudemental_respiracao': {
        links: [
            { nome: '🌬️ Drauzio Varella - Respiração para Acalmar', url: 'https://drauziovarella.uol.com.br/psiquiatria/tecnicas-de-respiracao-para-aliviar-a-ansiedade/' }
        ]
    },
    'saudemental_hobbies': {
        links: [
            { nome: '🎨 Sempre Bem - Hobbies e Lazer', url: 'https://semprebem.paguemenos.com.br/posts/mente-e-comportamento/lista-de-hobbies' }
        ]
    },
    'saudemental_ajuda': {
        links: [
            { nome: '🆘 RTP Ensina - Pedir Ajuda', url: 'https://ensina.rtp.pt/artigo/pedir-ajuda/' }
        ]
    },

    // ========== POSTURA CORRETA ==========
    'postura_sentar': {
        links: [
            { nome: '🪑 Brasil Escola - Postura na Sala de Aula', url: 'https://educador.brasilescola.uol.com.br/sugestoes-pais-professores/boa-postura-na-sala-aula.htm' }
        ]
    },
    'postura_mochila': {
        links: [
            { nome: '🎒 Tribuna do Norte - Uso da Mochila', url: 'https://tribunadonorte.com.br/tn-familia/uso-adequado-da-mochila-escolar/' }
        ]
    },
    'postura_celular': {
        links: [
            { nome: '📱 Olhar Digital - Ficar no Celular', url: 'https://olhardigital.com.br/2024/05/15/medicina-e-saude/ficar-muito-tempo-no-celular-e-perigoso-entenda-o-que-acontece-no-seu-cerebro/' }
        ]
    },
    'postura_alongamento': {
        links: [
            { nome: '🧘 Daniel Souto - Alongamento no Dia a Dia', url: 'https://danielsoutoortopedista.com.br/fazer-alongamentos-ajuda-nas-atividades-simples-do-dia-a-dia/' }
        ]
    },
    'postura_dormir': {
        links: [
            { nome: '😴 Luck Puma - Melhor Lado para Dormir', url: 'https://luckspuma.com.br/melhor-lado-para-dormir/' }
        ]
    },

    // ========== HIDRATAÇÃO ==========
    'hidratacao_quantidade': {
        links: [
            { nome: '💧 Panvel - Hidratação Infantil', url: 'https://www.panvel.com/blog/bebe-e-crianca/hidratacao-infantil/' }
        ]
    },
    'hidratacao_sinais': {
        links: [
            { nome: '⚠️ TJSC - Sinais de Desidratação', url: 'https://www.tjsc.jus.br/web/servidor/dicas-de-saude/-/asset_publisher/0rjJEBzj2Oes/content/desidratacao-e-sintomas-que-voce-nao-imagina-que-ela-pode-causar' }
        ]
    },
    'hidratacao_sucos': {
        links: [
            { nome: '🥤 Forma Utilidades - Sucos Naturais', url: 'https://www.formautilidades.com.br/blog/para-servir/sucos-naturais' }
        ]
    },
    'hidratacao_refrigerante': {
        links: [
            { nome: '🥤 Tua Saúde - Evitar Refrigerantes', url: 'https://www.tuasaude.com/maleficios-do-refrigerante/' }
        ]
    },
    'hidratacao_sede': {
        links: [
            { nome: '💧 Correio Braziliense - Beber Antes da Sede', url: 'https://www.correiobraziliense.com.br/cbradar/beber-agua-antes-de-sentir-sede-faz-alguma-diferenca/' }
        ]
    },

    // ========== ALIMENTAÇÃO EQUILIBRADA ==========
    'alimentacao_prato': {
        links: [
            { nome: '🍽️ Pão de Açúcar - Prato Colorido', url: 'https://content.paodeacucar.com/saudabilidade/por-que-prato-colorido' }
        ]
    },
    'alimentacao_carboidratos': {
        links: [
            { nome: '🍚 Sociedade Brasileira de Diabetes - Carboidratos', url: 'https://diabetes.org.br/carboidratos-o-grande-combustivel-do-nosso-organismo/' }
        ]
    },
    'alimentacao_proteinas': {
        links: [
            { nome: '🥚 Toda Matéria - Proteínas', url: 'https://www.todamateria.com.br/proteinas/' }
        ]
    },
    'alimentacao_gorduras': {
        links: [
            { nome: '🥑 Tua Saúde - Gorduras Boas', url: 'https://www.tuasaude.com/gorduras-boas-para-o-coracao/' }
        ]
    },
    'alimentacao_mastigar': {
        links: [
            { nome: '🦷 Tua Saúde - Comer Devagar', url: 'https://www.tuasaude.com/comer-devagar-emagrece/' }
        ]
    },

    // ========== RESPEITO E BULLYING ==========
    'bullying_oque': {
        links: [
            { nome: '🤝 Brasil Escola - Bullying', url: 'https://brasilescola.uol.com.br/sociologia/bullying.htm' }
        ]
    },
    'bullying_denunciar': {
        links: [
            { nome: '🆘 UNICEF - Como Denunciar Bullying', url: 'https://www.unicef.org/parenting/child-care/bullying' }
        ]
    },
    'bullying_cyberbullying': {
        links: [
            { nome: '💻 Brasil Escola - Cyberbullying', url: 'https://brasilescola.uol.com.br/sociologia/cyberbullying.htm' }
        ]
    },
    'bullying_aliado': {
        links: [
            { nome: '🦸 FADC - Ser um Aliado', url: 'https://www.fadc.org.br/noticias/cyberbullying' }
        ]
    },
    'bullying_respeito': {
        links: [
            { nome: '🌈 MPF - Respeitar Diferenças', url: 'https://respeiteadiferenca.mpf.mp.br/www/respeite-diferencas.html' }
        ]
    },

    // ========== MEIO AMBIENTE ==========
    'meioambiente_ar': {
        links: [
            { nome: '🌬️ Aeris - Importância do Ar Puro', url: 'https://www.aerisrs.com.br/a-importancia-do-ar-puro-para-a-nossa-saude' }
        ]
    },
    'meioambiente_reciclagem': {
        links: [
            { nome: '♻️ Toda Matéria - Reciclagem', url: 'https://www.todamateria.com.br/reciclagem/' }
        ]
    },
    'meioambiente_agua': {
        links: [
            { nome: '💧 Brasil Escola - Economizar Água', url: 'https://brasilescola.uol.com.br/biologia/dicas-para-economizar-agua.htm' }
        ]
    },
    'meioambiente_natureza': {
        links: [
            { nome: '🌳 WWF - Benefícios da Natureza', url: 'https://www.wwf.org.br/?86440/Pesquisas-mostram-beneficios-da-conexao-com-a-natureza-para-saude-fisica-e-mental' }
        ]
    },
    'meioambiente_plastico': {
        links: [
            { nome: '🚫 Menos Um Plástico - Reduzir Plástico', url: 'https://www.menosumplastico.com/' }
        ]
    }
};

// Função para buscar links de um subtópico
function getLinks(subtopicoId) {
    if (linksData[subtopicoId]) {
        return linksData[subtopicoId];
    }
    return { links: [] };
}

console.log("LinksData.js carregado com sucesso!");