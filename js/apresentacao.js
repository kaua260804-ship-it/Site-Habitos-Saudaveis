// ============================================
// APRESENTACAO.JS - CONTROLADOR MODULAR (FUNCIONAL)
// ============================================

const App = {
    // Estado da aplicação
    slideAtual: 0,
    totalSlides: 8,
    modoSelecionado: null,
    quizDemoIndice: 0,
    perguntasQuiz: [],
    slidesCarregados: false,
    
    // IDs dos slides (ordem)
    slidesIds: [
        'slide-escolha',
        'slide-titulo',
        'slide-conteudo1',
        'slide-conteudo2',
        'slide-quiz',
        'slide-regras',
        'slide-contagem',
        'slide-ranking'
    ],
    
    // Dados dos modos
    dadosModos: {
        alimentacao_exercicios: {
            emoji: '🍎🤸',
            titulo: 'Alimentação + Exercícios',
            subtitulo: 'Comer bem e se mexer!',
            classeTitulo: 'modo1',
            conteudos: [
                {
                    titulo: '🍎 Pirâmide Alimentar',
                    texto: 'A base da pirâmide tem arroz, pães e frutas (comer MAIS). O topo tem doces e frituras (comer MENOS). Um prato colorido é um prato saudável! 🌈'
                },
                {
                    titulo: '🤸 Mexa-se!',
                    texto: '1 hora de exercício por dia já faz diferença! Pular corda, jogar bola ou andar de bicicleta fortalece os ossos e libera endorfina, o hormônio da felicidade! 😄'
                }
            ],
            quizzesLocal: [
                { pergunta: 'O que fica na BASE da pirâmide alimentar?', opcoes: ['Doces e gorduras', 'Arroz, pães e frutas', 'Refrigerantes', 'Fast food'], correta: 1 },
                { pergunta: 'Quantos minutos de exercício por dia?', opcoes: ['15', '30', '60', '120'], correta: 2 }
            ],
            temasSupabase: ['alimentacao', 'exercicios']
        },
        sono_postura: {
            emoji: '😴📚',
            titulo: 'Sono + Postura',
            subtitulo: 'Dormir bem e sentar direitinho!',
            classeTitulo: 'modo2',
            conteudos: [
                {
                    titulo: '😴 Sono dos Campeões',
                    texto: 'Crianças precisam dormir de 8 a 12 horas por noite! Desligue o celular 1 hora antes de dormir. Um quarto escuro e silencioso ajuda a dormir melhor! 🌙'
                },
                {
                    titulo: '📚 Postura Nota 10',
                    texto: 'Costas retas, pés no chão! A mochila deve ser usada nas DUAS costas e pesar no máximo 10% do seu corpo. Levante o celular na altura dos olhos para não curvar o pescoço! 🎒'
                }
            ],
            quizzesLocal: [
                { pergunta: 'Quantas horas de sono uma criança precisa?', opcoes: ['4-5h', '8-12h', '2-3h', '15h'], correta: 1 },
                { pergunta: 'Como a mochila deve ser usada?', opcoes: ['Em uma costas só', 'Nas duas costas', 'Na barriga', 'Arrastando no chão'], correta: 1 }
            ],
            temasSupabase: ['sono', 'postura']
        }
    },
    
    // ========== INICIALIZAÇÃO ==========
    async init() {
        console.log('🚀 Inicializando apresentação...');
        this.criarEstrelas();
        
        // Carregar todos os slides
        await this.carregarSlides();
        
        // Mostrar primeiro slide
        this.irParaSlide(0);
        
        console.log('✅ Apresentação pronta! Slides carregados:', this.slidesCarregados);
    },
    
    // ========== ESTRELAS ==========
    criarEstrelas() {
        const container = document.getElementById('starsContainer');
        if (!container) return;
        
        for (let i = 0; i < 80; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = (Math.random() * 3 + 1) + 'px';
            star.style.height = star.style.width;
            star.style.setProperty('--duration', (Math.random() * 3 + 1) + 's');
            star.style.setProperty('--delay', Math.random() * 3 + 's');
            container.appendChild(star);
        }
    },
    
    // ========== CARREGAR SLIDES ==========
    async carregarSlides() {
        const container = document.getElementById('slideContainer');
        if (!container) {
            console.error('❌ Container não encontrado!');
            return;
        }
        
        const slideFiles = [
            'slides/slide-escolha.html',
            'slides/slide-titulo.html',
            'slides/slide-conteudo1.html',
            'slides/slide-conteudo2.html',
            'slides/slide-quiz.html',
            'slides/slide-regras.html',
            'slides/slide-contagem.html',
            'slides/slide-ranking.html'
        ];
        
        console.log('📂 Carregando', slideFiles.length, 'slides...');
        
        for (const file of slideFiles) {
            try {
                const response = await fetch(file);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const html = await response.text();
                container.innerHTML += html;
                console.log('✅ Slide carregado:', file);
            } catch (e) {
                console.error('❌ Erro ao carregar slide:', file, e.message);
            }
        }
        
        this.slidesCarregados = true;
        console.log('📂 Todos slides processados');
    },
    
    // ========== NAVEGAÇÃO ==========
    irParaSlide(index) {
        if (index < 0 || index >= this.totalSlides) return;
        
        // Esconder todos
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
        
        // Mostrar o atual
        const slideId = this.slidesIds[index];
        const slideEl = document.getElementById(slideId);
        
        if (slideEl) {
            slideEl.classList.add('active');
            console.log('📄 Slide ativo:', slideId);
        } else {
            console.warn('⚠️ Slide não encontrado:', slideId);
        }
        
        this.slideAtual = index;
        
        // Ações específicas por slide
        if (index === 4) {
            // Slide do quiz - carregar pergunta
            setTimeout(() => {
                if (this.perguntasQuiz.length > 0) {
                    this.carregarQuizDemo();
                }
            }, 200);
        }
        
        if (index === 7) {
            // Slide do ranking
            this.carregarRankingFinal();
        }
    },
    
    proximoSlide() {
        if (this.slideAtual < this.totalSlides - 1) {
            this.irParaSlide(this.slideAtual + 1);
        }
    },
    
    slideAnterior() {
        if (this.slideAtual > 0) {
            this.irParaSlide(this.slideAtual - 1);
        }
    },
    
    // ========== ESCOLHER MODO ==========
    async escolherModo(modo) {
        console.log('🎯 Modo selecionado:', modo);
        this.modoSelecionado = modo;
        const dados = this.dadosModos[modo];
        
        if (!dados) {
            console.error('❌ Modo não encontrado:', modo);
            return;
        }
        
        // Atualizar slide título
        const temaEmoji = document.getElementById('temaEmoji');
        const temaTitulo = document.getElementById('temaTitulo');
        const temaSubtitulo = document.getElementById('temaSubtitulo');
        
        if (temaEmoji) temaEmoji.textContent = dados.emoji;
        if (temaTitulo) {
            temaTitulo.textContent = dados.titulo;
            temaTitulo.className = 'titulo-slide ' + (dados.classeTitulo || '');
        }
        if (temaSubtitulo) temaSubtitulo.textContent = dados.subtitulo;
        
        // Atualizar slide conteúdo 1
        const conteudo1Titulo = document.getElementById('conteudo1Titulo');
        const conteudo1Texto = document.getElementById('conteudo1Texto');
        if (conteudo1Titulo) conteudo1Titulo.textContent = dados.conteudos[0].titulo;
        if (conteudo1Texto) conteudo1Texto.textContent = dados.conteudos[0].texto;
        
        // Atualizar slide conteúdo 2
        const conteudo2Titulo = document.getElementById('conteudo2Titulo');
        const conteudo2Texto = document.getElementById('conteudo2Texto');
        if (conteudo2Titulo) conteudo2Titulo.textContent = dados.conteudos[1].titulo;
        if (conteudo2Texto) conteudo2Texto.textContent = dados.conteudos[1].texto;
        
        // Carregar quizzes
        this.perguntasQuiz = await this.carregarQuizzesSupabase(dados.temasSupabase);
        
        if (this.perguntasQuiz.length === 0) {
            console.log('📋 Usando quizzes locais');
            this.perguntasQuiz = dados.quizzesLocal;
        } else {
            console.log('☁️ Quizzes carregados do Supabase:', this.perguntasQuiz.length);
        }
        
        this.quizDemoIndice = 0;
        this.irParaSlide(1);
    },
    
    // ========== CARREGAR QUIZZES DO SUPABASE ==========
    async carregarQuizzesSupabase(temas) {
        try {
            const url = `https://ejldlvlacidyzizxucdr.supabase.co/rest/v1/quizzes?tema=in.(${temas.join(',')})&select=*&limit=10`;
            console.log('🔍 Buscando quizzes:', url);
            
            const response = await fetch(url, {
                headers: {
                    'apikey': 'sb_publishable_YDWCWLgn0t9wrayWljnnaA_immbdkj8'
                }
            });
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                return data.map(q => ({
                    pergunta: q.pergunta,
                    opcoes: [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(o => o && o.trim()),
                    correta: q.correta
                }));
            }
        } catch (e) {
            console.log('⚠️ Offline - usando quizzes locais');
        }
        return [];
    },
    
    // ========== QUIZ DEMO ==========
    carregarQuizDemo() {
        console.log('❓ Carregando pergunta', this.quizDemoIndice + 1, 'de', this.perguntasQuiz.length);
        
        const quizPergunta = document.getElementById('quizPergunta');
        const quizOpcoes = document.getElementById('quizOpcoes');
        const quizFeedback = document.getElementById('quizFeedback');
        const btnProximoQuiz = document.getElementById('btnProximoQuiz');
        const btnFinalizarQuiz = document.getElementById('btnFinalizarQuiz');
        
        if (!quizPergunta || !quizOpcoes) {
            console.warn('⚠️ Elementos do quiz não encontrados');
            return;
        }
        
        if (this.quizDemoIndice >= this.perguntasQuiz.length) {
            quizPergunta.textContent = '🎉 Demonstração concluída!';
            quizOpcoes.innerHTML = '';
            if (quizFeedback) quizFeedback.textContent = '';
            if (btnProximoQuiz) btnProximoQuiz.style.display = 'none';
            if (btnFinalizarQuiz) btnFinalizarQuiz.style.display = 'inline-block';
            return;
        }
        
        const p = this.perguntasQuiz[this.quizDemoIndice];
        quizPergunta.textContent = '❓ ' + p.pergunta;
        if (quizFeedback) {
            quizFeedback.textContent = '';
            quizFeedback.className = 'feedback-quiz';
        }
        if (btnProximoQuiz) btnProximoQuiz.style.display = 'none';
        if (btnFinalizarQuiz) btnFinalizarQuiz.style.display = 'none';
        
        let html = '';
        p.opcoes.forEach((opcao, i) => {
            html += `<button class="quiz-option" onclick="App.responderQuiz(${i})" id="opcao${i}">
                ${String.fromCharCode(65 + i)}) ${opcao}
            </button>`;
        });
        quizOpcoes.innerHTML = html;
    },
    
    responderQuiz(escolha) {
        const p = this.perguntasQuiz[this.quizDemoIndice];
        const feedback = document.getElementById('quizFeedback');
        const btnProximoQuiz = document.getElementById('btnProximoQuiz');
        
        // Bloquear todas as opções
        document.querySelectorAll('.quiz-option').forEach((btn, i) => {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
            if (i === p.correta) btn.classList.add('correct');
            if (i === escolha && escolha !== p.correta) btn.classList.add('wrong');
        });
        
        if (feedback) {
            if (escolha === p.correta) {
                feedback.textContent = '✅ CORRETO! +10 pontos! ⭐';
                feedback.className = 'feedback-quiz acerto';
            } else {
                feedback.textContent = '❌ A resposta era: ' + p.opcoes[p.correta];
                feedback.className = 'feedback-quiz erro';
            }
        }
        
        if (btnProximoQuiz) {
            btnProximoQuiz.style.display = 'inline-block';
        }
    },
    
    proximoQuizDemo() {
        this.quizDemoIndice++;
        this.carregarQuizDemo();
    },
    
    // ========== CONTAGEM ==========
    iniciarContagem() {
        const btn = document.getElementById('btnIniciarContagem');
        if (btn) btn.style.display = 'none';
        
        let contador = 3;
        const el = document.getElementById('contador');
        if (!el) return;
        
        const intervalo = setInterval(() => {
            contador--;
            if (contador <= 0) {
                clearInterval(intervalo);
                el.textContent = 'GO! 🚀';
                el.style.webkitTextFillColor = '#48bb78';
                el.style.background = '#48bb78';
                setTimeout(() => this.proximoSlide(), 1500);
            } else {
                el.textContent = contador;
            }
        }, 1000);
    },
    
    // ========== RANKING FINAL ==========
    async carregarRankingFinal() {
        const container = document.getElementById('rankingFinal');
        if (!container) return;
        
        try {
            const response = await fetch(
                'https://ejldlvlacidyzizxucdr.supabase.co/rest/v1/usuarios?select=apelido,pontos&order=pontos.desc&limit=5',
                {
                    headers: { 'apikey': 'sb_publishable_YDWCWLgn0t9wrayWljnnaA_immbdkj8' }
                }
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                let html = '';
                data.forEach((j, idx) => {
                    const medalha = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx+1}º`;
                    html += `<div class="ranking-item" style="animation-delay:${idx*0.2}s">
                        ${medalha} <strong>${j.apelido}</strong> — ⭐ ${j.pontos} pts
                    </div>`;
                });
                container.innerHTML = html;
            } else {
                container.innerHTML = '<p>🥇 1º: ______<br>🥈 2º: ______<br>🥉 3º: ______</p>';
            }
        } catch (e) {
            container.innerHTML = '<p>🥇 1º lugar: _______<br>🥈 2º lugar: _______<br>🥉 3º lugar: _______</p>';
        }
    },
    
    // ========== CONFETES ==========
    dispararConfetes() {
        const emojis = ['🎉','🎊','⭐','🏆','🌟','💫','✨','🎯','💪','👏','🥇','🎖️'];
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const c = document.createElement('div');
                c.className = 'confetti';
                c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                c.style.left = Math.random() * 100 + '%';
                c.style.fontSize = (Math.random() * 30 + 20) + 'px';
                c.style.animation = `confeteFall ${Math.random() * 2 + 2}s ease-out forwards`;
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 4000);
            }, i * 80);
        }
    }
};

// ========== EVENTOS DE TECLADO ==========
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        App.proximoSlide();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        App.slideAnterior();
    }
});

// ========== INICIAR QUANDO A PÁGINA CARREGAR ==========
window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, iniciando App...');
    App.init();
});

// Expor o App globalmente
window.App = App;
