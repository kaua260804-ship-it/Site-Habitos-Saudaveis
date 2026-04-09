// ============================================
// LINKS REAIS E ÚTEIS PARA CADA SUBTÓPICO
// ============================================

const linksData = {
    // ALIMENTAÇÃO
    'alimentacao_piramide': {
        links: [
            { nome: '🥗 Toda Matéria - Pirâmide Alimentar', url: 'https://www.todamateria.com.br/piramide-alimentar/' },
            { nome: '🍎 Brasil Escola - Alimentação Saudável', url: 'https://brasilescola.uol.com.br/saude/alimentacao-saudavel.htm' },
            { nome: '🥦 Ministério da Saúde - Guia Alimentar', url: 'https://www.gov.br/saude/pt-br/assuntos/saude-brasil/publicacoes-para-promocao-da-saude/guia_alimentar_populacao_brasileira_2ed.pdf' }
        ]
    },
    'alimentacao_frutas': {
        links: [
            { nome: '🍉 Tua Saúde - Frutas da Época', url: 'https://www.tuasaude.com/frutas-da-epoca/' },
            { nome: '🍓 Calendário das Frutas - Cada Fruta no Seu Tempo', url: 'https://www.calendariodasfrutas.com.br/' }
        ]
    },
    'alimentacao_agua': {
        links: [
            { nome: '💧 UNICEF - Importância da Água', url: 'https://www.unicef.org/brazil/agua-e-saneamento' },
            { nome: '🚰 Tua Saúde - Benefícios da Água', url: 'https://www.tuasaude.com/beneficios-da-agua/' },
            { nome: '💦 Ministério da Saúde - Hidratação', url: 'https://www.gov.br/saude/pt-br/assuntos/saude-brasil/eu-quero-me-alimentar-melhor/noticias/2023/hidratacao-e-essencial-para-o-bom-funcionamento-do-organismo' }
        ]
    },
    'alimentacao_ultraprocessados': {
        links: [
            { nome: '🚫 Brasil Escola - Ultraprocessados', url: 'https://brasilescola.uol.com.br/saude/alimentos-ultraprocessados.htm' },
            { nome: '📚 Tua Saúde - Malefícios dos Ultraprocessados', url: 'https://www.tuasaude.com/maleficios-dos-alimentos-industrializados/' }
        ]
    },
    'alimentacao_cafe': {
        links: [
            { nome: '☀️ Tua Saúde - Café da Manhã Saudável', url: 'https://www.tuasaude.com/cafe-da-manha-saudavel/' },
            { nome: '🥛 UNICEF - Alimentação na Infância', url: 'https://www.unicef.org/brazil/alimentacao-na-infancia' }
        ]
    },
    
    // EXERCÍCIOS
    'exercicios_beneficios': {
        links: [
            { nome: '🏃 Saúde.gov - Benefícios da Atividade Física', url: 'https://www.gov.br/saude/pt-br/assuntos/saude-brasil/eu-quero-me-exercitar/noticias/2023/conheca-os-beneficios-da-pratica-de-atividades-fisicas' },
            { nome: '⚽ Tua Saúde - Benefícios do Exercício', url: 'https://www.tuasaude.com/beneficios-do-exercicio-fisico/' },
            { nome: '🏀 OMS - Atividade Física', url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity' }
        ]
    },
    'exercicios_alongamento': {
        links: [
            { nome: '🧘 Drauzio Varella - Alongamento', url: 'https://drauziovarella.uol.com.br/medicina-esportiva/alongamento-importancia-e-beneficios/' },
            { nome: '🙆 Tua Saúde - Alongamento Diário', url: 'https://www.tuasaude.com/alongamento/' }
        ]
    },
    'exercicios_brincadeiras': {
        links: [
            { nome: '🎪 Toda Matéria - Brincadeiras Antigas', url: 'https://www.todamateria.com.br/brincadeiras-antigas/' },
            { nome: '🤸 UNICEF - Brincar é Saúde', url: 'https://www.unicef.org/brazil/relatos/importancia-de-brincar-para-criancas' }
        ]
    },
    'exercicios_equipe': {
        links: [
            { nome: '⚽ Brasil Escola - Esportes Coletivos', url: 'https://brasilescola.uol.com.br/educacao-fisica/esportes-coletivos.htm' },
            { nome: '🏐 Toda Matéria - Esportes em Equipe', url: 'https://www.todamateria.com.br/esportes-coletivos/' }
        ]
    },
    'exercicios_arlivre': {
        links: [
            { nome: '🌳 UNICEF - Brincar ao Ar Livre', url: 'https://www.unicef.org/brazil/relatos/importancia-de-brincar-ao-ar-livre-na-infancia' },
            { nome: '🚴 Tua Saúde - Benefícios do Ar Livre', url: 'https://www.tuasaude.com/beneficios-de-estar-na-natureza/' }
        ]
    },
    
    // HIGIENE
    'higiene_maos': {
        links: [
            { nome: '🧴 UNICEF - Higiene das Mãos', url: 'https://www.unicef.org/brazil/higiene-das-maos' },
            { nome: '🫧 Saúde.gov - Lavagem das Mãos', url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/l/lavagem-das-maos' },
            { nome: '🧼 Tua Saúde - Como Lavar as Mãos', url: 'https://www.tuasaude.com/lavagem-das-maos/' }
        ]
    },
    'higiene_banho': {
        links: [
            { nome: '🚿 Tua Saúde - Benefícios do Banho', url: 'https://www.tuasaude.com/beneficios-do-banho/' },
            { nome: '🛁 Drauzio Varella - Higiene Pessoal', url: 'https://drauziovarella.uol.com.br/criancas/higiene-pessoal/' }
        ]
    },
    'higiene_dentes': {
        links: [
            { nome: '🦷 Drauzio Varella - Saúde Bucal', url: 'https://drauziovarella.uol.com.br/entrevistas-2/saude-bucal-2/' },
            { nome: '😁 Tua Saúde - Escovação Correta', url: 'https://www.tuasaude.com/escovacao-dos-dentes/' },
            { nome: '🪥 Saúde Bucal - Ministério da Saúde', url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-bucal' }
        ]
    },
    'higiene_unhas': {
        links: [
            { nome: '✂️ Tua Saúde - Cuidados com Unhas', url: 'https://www.tuasaude.com/cuidados-com-as-unhas/' }
        ]
    },
    'higiene_roupas': {
        links: [
            { nome: '👕 Higiene Infantil - Troca de Roupas', url: 'https://www.saudeinfantil.com/higiene-pessoal-criancas/' }
        ]
    },
    
    // SONO
    'sono_horas': {
        links: [
            { nome: '😴 Sleep Foundation - Horas de Sono', url: 'https://www.sleepfoundation.org/children-and-sleep/how-much-sleep-do-kids-need' },
            { nome: '🛌 Tua Saúde - Quantidade de Sono', url: 'https://www.tuasaude.com/quantidade-de-sono/' }
        ]
    },
    'sono_telas': {
        links: [
            { nome: '📱 Tua Saúde - Luz Azul e Sono', url: 'https://www.tuasaude.com/luz-azul/' }
        ]
    },
    
    // SAÚDE MENTAL
    'saudemental_oque': {
        links: [
            { nome: '🧠 UNICEF - Saúde Mental Infantil', url: 'https://www.unicef.org/brazil/saude-mental-das-criancas' },
            { nome: '💭 Instituto Ame Sua Mente', url: 'https://www.amesuamente.org.br/' },
            { nome: '🆘 CVV - Centro de Valorização da Vida (188)', url: 'https://www.cvv.org.br/' }
        ]
    },
    
    // POSTURA
    'postura_sentar': {
        links: [
            { nome: '🪑 Tua Saúde - Postura Correta', url: 'https://www.tuasaude.com/postura-corporal-correta/' },
            { nome: '📚 Brasil Escola - Postura na Escola', url: 'https://brasilescola.uol.com.br/educacao-fisica/postura-corporal.htm' }
        ]
    },
    'postura_mochila': {
        links: [
            { nome: '🎒 Drauzio Varella - Mochila Escolar', url: 'https://drauziovarella.uol.com.br/criancas/mochila-escolar-como-evitar-lesoes/' }
        ]
    },
    'postura_celular': {
        links: [
            { nome: '📱 Tua Saúde - Text Neck', url: 'https://www.tuasaude.com/text-neck/' }
        ]
    },
    
    // HIDRATAÇÃO
    'hidratacao_quantidade': {
        links: [
            { nome: '💧 Tua Saúde - Quantidade de Água', url: 'https://www.tuasaude.com/quantidade-de-agua-por-dia/' }
        ]
    },
    'hidratacao_sinais': {
        links: [
            { nome: '⚠️ Tua Saúde - Desidratação', url: 'https://www.tuasaude.com/sintomas-de-desidratacao/' }
        ]
    },
    
    // BULLYING
    'bullying_oque': {
        links: [
            { nome: '🤝 UNICEF - Bullying', url: 'https://www.unicef.org/brazil/bullying' },
            { nome: '📚 Brasil Escola - Bullying', url: 'https://brasilescola.uol.com.br/educacao/bullying.htm' },
            { nome: '🆘 Disque 100 - Direitos Humanos', url: 'https://www.gov.br/mdh/pt-br/acesso-a-informacao/ouvidoria/disque-100' }
        ]
    },
    'bullying_cyberbullying': {
        links: [
            { nome: '💻 SaferNet - Cyberbullying', url: 'https://new.safernet.org.br/cyberbullying' },
            { nome: '🛡️ UNICEF - Cyberbullying', url: 'https://www.unicef.org/brazil/cyberbullying-o-que-e-e-como-parar' }
        ]
    },
    
    // MEIO AMBIENTE
    'meioambiente_reciclagem': {
        links: [
            { nome: '♻️ Toda Matéria - Reciclagem', url: 'https://www.todamateria.com.br/reciclagem/' },
            { nome: '🌍 Brasil Escola - Importância da Reciclagem', url: 'https://brasilescola.uol.com.br/geografia/reciclagem.htm' }
        ]
    },
    'meioambiente_agua': {
        links: [
            { nome: '💧 Toda Matéria - Economizar Água', url: 'https://www.todamateria.com.br/como-economizar-agua/' }
        ]
    },
    'meioambiente_plastico': {
        links: [
            { nome: '🌊 Greenpeace - Plástico nos Oceanos', url: 'https://www.greenpeace.org/brasil/campanha/oceano/plastico/' }
        ]
    }
};

// Função para buscar links de um subtópico
function getLinks(subtopicoId) {
    return linksData[subtopicoId] || { links: [] };
}

console.log("✅ linksData.js carregado com sucesso!");