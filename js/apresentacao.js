// ============================================
// APRESENTACAO.JS - CONTROLADOR MODULAR
// ============================================

const App = {
    // Estado da aplicação
    slideAtual: 0,
    totalSlides: 8,
    modoSelecionado: null,
    quizDemoIndice: 0,
    perguntasQuiz: [],
    
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
        this.criarEstrelas();
        await this.carregarSlides();
        this.irParaSlide(0);
    },
    
    // ========== ESTRELAS ==========
    criarEstrelas() {
        const container = document.getElementById('starsContainer');
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
        
        for (const file of slideFiles) {
            try {
                const response = await fetch(file);
                const html = await response.text();
                container.innerHTML += html;
            } catch (e) {
                console.error('Erro ao carregar slide:', file, e);
            }
        }
    },
    
    // ========== NAVEGAÇÃO ==========
    irParaSlide(index) {
        // Esconder todos
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
        
        // Mostrar o atual
        const slideId = this.slidesIds[index];
        const slideEl = document.getElementById(slideId);
        if (slideEl) {
            slideEl.classList.add('active');
        }
        
        this.slideAtual = index;
        
        // Ações específicas por slide
        if (index === 7) this.carregarRankingFinal();
    },
    
    proximoSlide() {
        if (this.slideAtual < this.totalSlides - 1) {
            this.irParaSlide(this.slideAtual + 1);
        }
    },
    
    // ========== ESCOLHER MODO ==========
    async escolherModo(modo) {
        this.modoSelecionado = modo;
        const dados = this.dadosModos[modo];
        
        // Atualizar slide título
        document.getElementById('temaEmoji').textContent = dados.emoji;
        document.getElementById('temaTitulo').textContent = dados.titulo;
        document.getElementById('temaTitulo').className = 'titulo-slide ' + (dados.classeTitulo || '');
        document.getElementById('temaSubtitulo').textContent = dados.subtitulo;
        
        // Atualizar slide conteúdo 1
        document.getElementById('conteudo1Titulo').textContent = dados.conteudos[0].titulo;
        document.getElementById('conteudo1Texto').textContent = dados.conteudos[0].texto;
        
        // Atualizar slide conteúdo 2
        document.getElementById('conteudo2Titulo').textContent = dados.conteudos[1].titulo;
        document.getElementById('conteudo2Texto').textContent = dados.conteudos[1].texto;
        
        // Carregar quizzes
        this.perguntasQuiz = await this.carregarQuizzesSupabase(dados.temasSupabase);
        
        // Fallback para quizzes locais se não encontrar no Supabase
        if (this.perguntasQuiz.length === 0) {
            this.perguntasQuiz = dados.quizzesLocal;
        }
        
        this.quizDemoIndice = 0;
        this.irParaSlide(1);
    },
    
    // ========== CARREGAR QUIZZES DO SUPABASE ==========
    async carregarQuizzesSupabase(temas) {
        try {
            const response = await fetch(
                `https://ejldlvlacidyzizxucdr.supabase.co/rest/v1/quizzes?tema=in.(${temas.join(',')})&select=*&limit=10`,
                {
                    headers: {
                        'apikey': 'sb_publishable_YDWCWLgn0t9wrayWljnnaA_immbdkj8'
                    }
                }
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                return data.map(q => ({
                    pergunta: q.pergunta,
                    opcoes: [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(o => o && o.trim()),
                    correta: q.correta
                }));
            }
        } catch (e) {
            console.log('Usando quizzes locais (offline)');
        }
        return [];
    },
    
    // ========== QUIZ DEMO ==========
    carregarQuizDemo() {
        if (this.quizDemoIndice >= this.perguntasQuiz.length) {
            document.getElementById('quizPergunta').textContent = '🎉 Demonstração concluída!';
            document.getElementById('quizOpcoes').innerHTML = '';
            document.getElementById('quizFeedback').textContent = '';
            document.getElementById('btnProximoQuiz').style.display = 'none';
            document.getElementById('btnFinalizarQuiz').style.display = 'inline-block';
            return;
        }
        
        const p = this.perguntasQuiz[this.quizDemoIndice];
        document.getElementById('quizPergunta').textContent = '❓ ' + p.pergunta;
        document.getElementById('quizFeedback').textContent = '';
        document.getElementById('quizFeedback').className = 'feedback-quiz';
        document.getElementById('btnProximoQuiz').style.display = 'none';
        document.getElementById('btnFinalizarQuiz').style.display = 'none';
        
        let html = '';
        p.opcoes.forEach((opcao, i) => {
            html += `<button class="quiz-option" onclick="App.responderQuiz(${i})" id="opcao${i}">
                ${String.fromCharCode(65 + i)}) ${opcao}
            </button>`;
        });
        document.getElementById('quizOpcoes').innerHTML = html;
    },
    
    responderQuiz(escolha) {
        const p = this.perguntasQuiz[this.quizDemoIndice];
        const feedback = document.getElementById('quizFeedback');
        
        document.querySelectorAll('.quiz-option').forEach((btn, i) => {
            btn.disabled = true;
            if (i === p.correta) btn.classList.add('correct');
            if (i === escolha && escolha !== p.correta) btn.classList.add('wrong');
        });
        
        if (escolha === p.correta) {
            feedback.textContent = '✅ CORRETO! +10 pontos! ⭐';
            feedback.className = 'feedback-quiz acerto';
        } else {
            feedback.textContent = '❌ A resposta era: ' + p.opcoes[p.correta];
            feedback.className = 'feedback-quiz erro';
        }
        
        document.getElementById('btnProximoQuiz').style.display = 'inline-block';
    },
    
    proximoQuizDemo() {
        this.quizDemoIndice++;
        this.carregarQuizDemo();
    },
    
    // ========== CONTAGEM ==========
    iniciarContagem() {
        const btn = document.getElementById('btnIniciarContagem');
        btn.style.display = 'none';
        let contador = 3;
        const el = document.getElementById('contador');
        
        const intervalo = setInterval(() => {
            contador--;
            if (contador <= 0) {
                clearInterval(intervalo);
                el.textContent = 'GO! 🚀';
                el.style.webkitTextFillColor = '#48bb78';
                setTimeout(() => this.proximoSlide(), 1500);
            } else {
                el.textContent = contador;
            }
        }, 1000);
    },
    
    // ========== RANKING FINAL ==========
    async carregarRankingFinal() {
        const container = document.getElementById('rankingFinal');
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
    } else if (e.key === 'ArrowLeft')
