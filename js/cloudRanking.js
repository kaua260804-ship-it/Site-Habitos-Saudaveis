// ============================================
// RANKING ONLINE - VERSÃO CORRIGIDA
// ============================================

// URL da planilha PUBLICADA (CSV)
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTjA4WHKwKLXyxXeqQWIvjEn_xjcBRrPHlsKCO6T76Jqe1SeIlTKxZoTXruIKBHRnXeHXWMblLXWRnW/pub?output=csv";

// URL do Apps Script para escrita
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXcYHrJCibtHzU5js5QjsJ0geusyQg54bvQICA7cQ3KGuEpG60QshNeHuS6ckIrzx6Yw/exec";

// Buscar ranking online via CSV
async function buscarRankingOnline() {
    try {
        console.log("📊 Buscando ranking da planilha...");
        const response = await fetch(CSV_URL);
        const csvText = await response.text();
        
        // Converter CSV para array
        const linhas = csvText.trim().split('\n');
        const ranking = [];
        
        // Pular cabeçalho (primeira linha)
        for (let i = 1; i < linhas.length; i++) {
            const colunas = linhas[i].split(',');
            if (colunas.length >= 4 && colunas[0]) {
                ranking.push({
                    apelido: colunas[0].replace(/"/g, ''),
                    nome: colunas[1] ? colunas[1].replace(/"/g, '') : '',
                    idade: parseInt(colunas[2]) || 0,
                    pontos: parseInt(colunas[3]) || 0,
                    data_atualizacao: colunas[4] || '',
                    quizzes_feitos: parseInt(colunas[5]) || 0
                });
            }
        }
        
        ranking.sort((a, b) => b.pontos - a.pontos);
        console.log(`✅ Ranking carregado: ${ranking.length} usuários`);
        return ranking;
        
    } catch (error) {
        console.error("❌ Erro ao buscar ranking:", error);
        return [];
    }
}

// Salvar usuário online
async function salvarUsuarioOnline(usuario) {
    if (!usuario || !usuario.apelido) return false;
    
    try {
        console.log("💾 Salvando usuário:", usuario.apelido);
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apelido: usuario.apelido,
                nome: usuario.nome || "",
                idade: usuario.idade || 0,
                pontos: usuario.pontos || 0,
                quizzes_feitos: usuario.quizzes_feitos || 0
            })
        });
        
        const resultado = await response.text();
        console.log("✅ Resposta:", resultado);
        return true;
    } catch (error) {
        console.error("❌ Erro ao salvar:", error);
        return false;
    }
}

// Atualizar ranking na tela
async function atualizarRankingOnline
