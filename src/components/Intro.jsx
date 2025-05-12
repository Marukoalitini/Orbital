import {useEffect, useRef, useState} from "react";
import p5 from "p5";


export default function Intro({onVoltarMenu}) {
    // Referências para o contêiner e instância do p5
    const containerRef = useRef(null);
    const p5InstanceRef = useRef(null);
    // Referências para os arquivos de áudio
    const audio1Ref = useRef(null);
    const audio2Ref = useRef(null);
    // Estados para controlar a música
    const [currentTrack, setCurrentTrack] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Função para alternar entre as músicas
    const toggleMusic = () => {
        if (currentTrack === 1) {
            audio1Ref.current.pause();
            audio2Ref.current.play();
            setCurrentTrack(2);
        } else {
            audio2Ref.current.pause();
            audio1Ref.current.play();
            setCurrentTrack(1);
        }
    };

    // Função para ativar/desativar o som
    const toggleMute = () => {
        const newMuteState = !isMuted;
        setIsMuted(newMuteState);

        // Aplica o estado de mudo aos dois elementos de áudio
        if (audio1Ref.current) audio1Ref.current.muted = newMuteState;
        if (audio2Ref.current) audio2Ref.current.muted = newMuteState;
    };

    // Efeito para inicializar a reprodução de áudio
    useEffect(() => {
        // Tenta iniciar a reprodução do áudio quando o componente é montado
        const initAudio = () => {
            if (audio1Ref.current) {
                // Define o volume inicial
                audio1Ref.current.volume = 0.7;
                // Tenta iniciar a reprodução (pode ser bloqueada pelo navegador)
                audio1Ref.current.play().catch(e => console.log("Reprodução automática bloqueada pelo navegador:", e));
            }
            if (audio2Ref.current) {
                audio2Ref.current.volume = 0.7;
                // Pausa a segunda música inicialmente
                audio2Ref.current.pause();
            }
        };

        // Chama a função de inicialização após um pequeno atraso
        const timer = setTimeout(initAudio, 1000);

        return () => {
            clearTimeout(timer);
            // Pausa os áudios quando o componente é desmontado
            if (audio1Ref.current) audio1Ref.current.pause();
            if (audio2Ref.current) audio2Ref.current.pause();
        };
    }, []);

    useEffect(() => {
        // Função principal do sketch p5.js
        const sketch = (p) => {
            const easeInOutQuad = (t) => {
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            };

            // Variáveis de posição central
            let centroX, centroY;
            let passoTutorial = 0;
            let planetaTutorial = null;
            let tempoInicioPasso = 0;
            let posicaoInicial = { x: 0, y: 0 };
            let posicaoAlvo = { x: 0, y: 0 };
            let tutorialAtivo = true;

            // Configurações do tutorial
            const duracaoArrastro = 3000; // 3 segundos para completar o arrasto
            const tempoAntesLancamento = 2000; // 2 segundos antes de soltar
            const forcaDemonstracao = 0.15; // Força do lançamento demonstrativo
            const tempoExibicaoTexto = 4000; // 4 segundos para exibir cada texto
            const tempoPrimeiraMensagem = 6000; // 6 segundos para a primeira mensagem
            let tempoUltimoPasso = 0; // Controle de tempo para transições

            // Função para avançar os passos do tutorial
            const avancarPassoTutorial = () => {
                passoTutorial++;
                tempoUltimoPasso = p.millis();
            };

            // Função para resetar o tutorial
            const resetarTutorial = () => {
                passoTutorial = 0;
                planetaTutorial = null;
                tutorialConcluido = false;
                tempoUltimoPasso = 0;
            };

            // Configurações do universo baseadas na dificuldade
            const numBuracosNegros = 1;
            const diametroBuracoNegro = 100; // Tamanho do buraco negro
            const G = 20; // Constante gravitacional
            const massaCentral = 1000; // Massa do buraco negro
            const diametroPlaneta = 30; // Tamanho dos planetas
            const fatorForca = 0.09; // Fator de força ao lançar planetas
            const gravidadePlaneta = 10; // Gravidade entre planetas

            // Arrays para armazenar objetos
            let buracosNegros = []; // Lista de buracos negros
            let planetas = []; // Lista de planetas
            let planetaAtual = null; // Planeta sendo arrastado
            let explosoes = []; // Lista de explosões
            let particulasNebulosa = []; // Partículas da nebulosa de fundo
            let estrelas = []; // Estrelas de fundo

            // Quantidade de objetos de fundo
            const numEstrelas = 300; // Número de estrelas no fundo
            const numParticulasNebulosa = 250; // Número de partículas da nebulosa

            // Cores aleatórias para os planetas com mais variedade e vibração
            const coresPlanetas = [
                [255, 102, 0],    // Laranja
                [0, 153, 255],    // Azul
                [255, 51, 153],   // Rosa
                [51, 255, 102],   // Verde
                [255, 255, 102],  // Amarelo
                [178, 102, 255],  // Roxo
                [255, 80, 80],    // Vermelho claro
                [100, 255, 218],  // Turquesa
                [255, 180, 0],    // Dourado
                [180, 255, 100],  // Verde limão
                [130, 0, 255],    // Violeta
                [0, 210, 255]     // Azul celeste
            ];

            // Classe que representa um buraco negro
            class BuracoNegro {
                constructor(x, y) {
                    // Posição do buraco negro
                    this.x = x;
                    this.y = y;
                    // Rotação do disco de acreção
                    this.rotacao = 0;
                    // Fase da pulsação do buraco negro
                    this.fasePulsacao = 0;
                    // Partículas ao redor do buraco negro
                    this.particulas = [];
                    // Cache para os gradientes
                    this.gradientes = {};

                    // Criar partículas para o efeito de atração
                    for (let i = 0; i < 30; i++) {
                        this.particulas.push({
                            angulo: p.random(p.TWO_PI),
                            distancia: p.random(diametroBuracoNegro * 1.2, diametroBuracoNegro * 2.5),
                            tamanho: p.random(1, 3),
                            velocidade: p.random(0.01, 0.03),
                            alpha: p.random(150, 255)
                        });
                    }

                    // Inicializa os gradientes
                    this.criarGradientes();
                }

                // Método para criar e cachear os gradientes
                criarGradientes() {
                    const ctx = p.drawingContext;

                    // Gradiente para a distorção do espaço
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    const gradienteEspaco = ctx.createRadialGradient(0, 0, 0, 0, 0, diametroBuracoNegro * 3);
                    gradienteEspaco.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
                    gradienteEspaco.addColorStop(0.5, 'rgba(50, 0, 80, 0.1)');
                    gradienteEspaco.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    this.gradientes.espaco = gradienteEspaco;
                    ctx.restore();

                    // Gradiente para o disco de acreção
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    const gradienteDisco = ctx.createRadialGradient(0, 0, diametroBuracoNegro/2, 0, 0, diametroBuracoNegro * 1.8);
                    gradienteDisco.addColorStop(0, 'rgba(255, 140, 0, 0.9)');
                    gradienteDisco.addColorStop(0.2, 'rgba(255, 215, 0, 0.8)');
                    gradienteDisco.addColorStop(0.4, 'rgba(255, 100, 100, 0.7)');
                    gradienteDisco.addColorStop(0.6, 'rgba(180, 0, 180, 0.6)');
                    gradienteDisco.addColorStop(0.8, 'rgba(100, 0, 150, 0.5)');
                    gradienteDisco.addColorStop(1, 'rgba(50, 0, 100, 0.3)');
                    this.gradientes.disco = gradienteDisco;
                    ctx.restore();

                    // Gradiente para o buraco negro
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    const gradienteBuracoNegro = ctx.createRadialGradient(0, 0, 0, 0, 0, diametroBuracoNegro/2);
                    gradienteBuracoNegro.addColorStop(0, 'rgba(0, 0, 0, 1)');
                    gradienteBuracoNegro.addColorStop(0.7, 'rgba(20, 0, 40, 0.95)');
                    gradienteBuracoNegro.addColorStop(0.9, 'rgba(40, 0, 80, 0.9)');
                    gradienteBuracoNegro.addColorStop(1, 'rgba(60, 0, 120, 0.8)');
                    this.gradientes.buracoNegro = gradienteBuracoNegro;
                    ctx.restore();

                    // Gradiente para o brilho ao redor do horizonte de eventos
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    const gradienteBrilho = ctx.createRadialGradient(0, 0, diametroBuracoNegro/2 * 0.8, 0, 0, diametroBuracoNegro/2 * 1.2);
                    gradienteBrilho.addColorStop(0, 'rgba(100, 0, 150, 0)');
                    gradienteBrilho.addColorStop(1, 'rgba(150, 50, 200, 0.3)');
                    this.gradientes.brilho = gradienteBrilho;
                    ctx.restore();

                    // Gradiente para o brilho do anel
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    const brilhoAnel = ctx.createRadialGradient(0, 0, diametroBuracoNegro/1.9, 0, 0, diametroBuracoNegro/1.7);
                    brilhoAnel.addColorStop(0, 'rgba(200, 100, 255, 0)');
                    brilhoAnel.addColorStop(0.5, 'rgba(200, 100, 255, 0.2)');
                    brilhoAnel.addColorStop(1, 'rgba(200, 100, 255, 0)');
                    this.gradientes.anel = brilhoAnel;
                    ctx.restore();
                }

                // Método para desenhar o buraco negro
                desenhar(deltaTime) {
                    const ctx = p.drawingContext;
                    // Atualiza a fase de pulsação, ajustada pelo deltaTime
                    this.fasePulsacao += 0.03 * deltaTime * 60;
                    // Calcula o fator de pulsação baseado na fase
                    const fatorPulsacao = 1 + 0.05 * Math.sin(this.fasePulsacao);

                    // Efeito de distorção do espaço
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    // Usa o gradiente cacheado para a distorção do espaço
                    ctx.fillStyle = this.gradientes.espaco;
                    ctx.beginPath();
                    ctx.arc(0, 0, diametroBuracoNegro * 3, 0, p.TWO_PI);
                    ctx.fill();
                    ctx.restore();

                    // Partículas sendo atraídas para o buraco negro
                    ctx.save();
                    // Atualiza e desenha cada partícula
                    for (let particula of this.particulas) {
                        // Atualiza o ângulo e a distância da partícula, ajustados pelo deltaTime
                        particula.angulo += particula.velocidade * deltaTime * 60;
                        particula.distancia -= 0.3 * deltaTime * 60;

                        // Reinicia a partícula se ela chegar muito perto do centro
                        if (particula.distancia < diametroBuracoNegro/2) {
                            particula.distancia = p.random(diametroBuracoNegro * 1.8, diametroBuracoNegro * 2.5);
                            particula.angulo = p.random(p.TWO_PI);
                        }

                        // Calcula a posição da partícula
                        const x = this.x + Math.cos(particula.angulo) * particula.distancia;
                        const y = this.y + Math.sin(particula.angulo) * particula.distancia;

                        // Desenha a partícula
                        ctx.fillStyle = `rgba(255, 255, 255, ${particula.alpha/255})`;
                        ctx.beginPath();
                        ctx.arc(x, y, particula.tamanho, 0, p.TWO_PI);
                        ctx.fill();
                    }
                    ctx.restore();

                    // Disco de acreção com efeito de rotação
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    // Aplica rotação ao disco de acreção
                    ctx.rotate(this.rotacao);

                    // Usa o gradiente cacheado para o disco
                    ctx.fillStyle = this.gradientes.disco;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, diametroBuracoNegro * 1.8 * fatorPulsacao, diametroBuracoNegro/2.2, 0, 0, p.TWO_PI);
                    ctx.fill();

                    // Adicionar detalhes ao disco de acreção - primeiro anel
                    ctx.strokeStyle = 'rgba(255, 200, 50, 0.7)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, diametroBuracoNegro * 1.4, diametroBuracoNegro/2.8, 0, 0, p.TWO_PI);
                    ctx.stroke();

                    // Segundo anel
                    ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, diametroBuracoNegro * 1.6, diametroBuracoNegro/2.5, 0, 0, p.TWO_PI);
                    ctx.stroke();
                    ctx.restore();

                    // Horizonte de eventos com efeito de lente gravitacional
                    ctx.save();
                    ctx.translate(this.x, this.y);

                    // Usa o gradiente cacheado para o buraco negro
                    ctx.fillStyle = this.gradientes.buracoNegro;
                    ctx.beginPath();
                    ctx.arc(0, 0, diametroBuracoNegro/2 * fatorPulsacao, 0, p.TWO_PI);
                    ctx.fill();

                    // Usa o gradiente cacheado para o brilho
                    ctx.fillStyle = this.gradientes.brilho;
                    ctx.beginPath();
                    ctx.arc(0, 0, diametroBuracoNegro/2 * 1.2, 0, p.TWO_PI);
                    ctx.fill();
                    ctx.restore();

                    // Anel externo com efeito de brilho
                    ctx.save();
                    ctx.translate(this.x, this.y);

                    // Usa o gradiente cacheado para o brilho do anel
                    ctx.fillStyle = this.gradientes.anel;
                    ctx.beginPath();
                    ctx.arc(0, 0, diametroBuracoNegro/1.8, 0, p.TWO_PI);
                    ctx.fill();

                    // Desenha o primeiro anel externo
                    ctx.strokeStyle = 'rgba(220, 120, 255, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, diametroBuracoNegro/1.8 * fatorPulsacao, 0, p.TWO_PI);
                    ctx.stroke();

                    // Segundo anel para mais detalhe
                    ctx.strokeStyle = 'rgba(180, 80, 255, 0.4)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, diametroBuracoNegro/1.6, 0, p.TWO_PI);
                    ctx.stroke();
                    ctx.restore();

                    // Incrementa a rotação para o próximo frame, ajustada pelo deltaTime
                    this.rotacao += 0.003 * deltaTime * 60; // Rotação mais rápida para efeito mais dinâmico
                }
            }

            // Função para obter o tamanho do contêiner
            const obterTamanhoConteiner = () => ({
                largura: window.innerWidth,
                altura: window.innerHeight,
            });

            // Função para criar uma explosão quando um planeta é destruído
            const criarExplosao = (x, y, cor = [255, 0, 0]) => {
                const particulas = [];
                // Mais partículas para um efeito mais dramático
                for (let i = 0; i < 40; i++) {
                    // Gera ângulo e velocidade aleatórios para cada partícula
                    const angulo = p.random(p.TWO_PI);
                    const velocidade = p.random(2, 5);
                    const tamanho = p.random(3, 8);
                    // Variação de cor para cada partícula
                    const variacaoCor = p.random(-30, 30);

                    // Criar uma variação de cor baseada na cor original
                    const corParticula = [
                        Math.min(255, Math.max(0, cor[0] + variacaoCor)),
                        Math.min(255, Math.max(0, cor[1] + variacaoCor)),
                        Math.min(255, Math.max(0, cor[2] + variacaoCor))
                    ];

                    // Adiciona a partícula ao array
                    particulas.push({
                        x, // Posição X
                        y, // Posição Y
                        vx: p.cos(angulo) * velocidade, // Velocidade X
                        vy: p.sin(angulo) * velocidade, // Velocidade Y
                        tamanho, // Tamanho da partícula
                        cor: corParticula, // Cor da partícula
                        tempoVida: 255, // Tempo de vida da partícula
                        decaimento: p.random(3, 7), // Taxa de decaimento
                        rotacao: p.random(p.TWO_PI), // Rotação inicial
                        velocidadeRotacao: p.random(-0.1, 0.1) // Velocidade de rotação
                    });
                }

                // Adicionar onda de choque
                const ondaChoque = {
                    x, // Posição X
                    y, // Posição Y
                    raio: 5, // Raio inicial
                    raioMaximo: 100, // Raio máximo
                    velocidade: 3, // Velocidade de expansão
                    alpha: 200 // Transparência
                };

                return { particulas, ondaChoque };
            };

            // Configuração inicial do sketch
            p.setup = () => {
                // Obtém o tamanho da tela
                const { largura, altura } = obterTamanhoConteiner();
                // Cria o canvas com o tamanho da tela
                const canvas = p.createCanvas(largura, altura);
                // Configura o estilo do canvas
                canvas.style("display", "block");
                canvas.style("margin", "0");
                canvas.style("padding", "0");
                // Define o centro da tela
                centroX = largura / 2;
                centroY = altura / 2;

                // Cria as estrelas de fundo
                for (let i = 0; i < numEstrelas; i++) {
                    estrelas.push({
                        x: p.random(largura),
                        y: p.random(altura),
                        tamanho: p.random(1, 3)
                    });
                }

                // Cria as partículas da nebulosa
                for (let i = 0; i < numParticulasNebulosa; i++) {
                    particulasNebulosa.push({
                        x: p.random(largura),
                        y: p.random(altura),
                        tamanho: p.random(2, 6),
                        vx: p.random(-0.2, 0.2),
                        vy: p.random(-0.2, 0.2),
                        alpha: p.random(50, 150)
                    });
                }

                // Cria buracos negros com a classe BuracoNegro
                if (numBuracosNegros === 1) {
                    // Um buraco negro no centro
                    buracosNegros = [new BuracoNegro(centroX, centroY)];
                } else if (numBuracosNegros === 2) {
                    // Dois buracos negros, um em cada terço da tela
                    buracosNegros = [
                        new BuracoNegro(largura / 3, centroY),
                        new BuracoNegro((2 * largura) / 3, centroY),
                    ];
                }
            };

            // Cache para os gradientes do fundo
            let gradientesFundo = null;
            let gradientesNebulosa = [];

            // Função para criar os gradientes do fundo
            const criarGradientesFundo = () => {
                let ctx = p.drawingContext;
                gradientesFundo = {};

                // Gradiente de fundo mais vibrante e colorido
                const gradiente = ctx.createRadialGradient(
                    p.width / 2, // Centro X
                    p.height / 2, // Centro Y
                    p.width / 8, // Raio interno
                    p.width / 2, // Centro X
                    p.height / 2, // Centro Y
                    p.width / 1.2 // Raio externo
                );
                // Define as cores do gradiente
                gradiente.addColorStop(0, "rgba(100, 0, 100, 0.7)"); // Roxo no centro
                gradiente.addColorStop(0.3, "rgba(50, 0, 80, 0.6)"); // Roxo escuro
                gradiente.addColorStop(0.6, "rgba(20, 0, 60, 0.7)"); // Azul escuro
                gradiente.addColorStop(0.8, "rgba(5, 0, 30, 0.8)"); // Quase preto
                gradiente.addColorStop(1, "rgba(0, 0, 10, 1)"); // Preto nas bordas
                gradientesFundo.principal = gradiente;

                // Cria gradientes para as nuvens de nebulosa
                gradientesNebulosa = [];

                // Define cores diferentes para cada nuvem
                const coresNebulosa = [
                    [80, 0, 120, 0.1],  // Roxo
                    [0, 30, 100, 0.1],  // Azul
                    [120, 0, 50, 0.1]   // Magenta
                ];

                for (let i = 0; i < 3; i++) {
                    // Calcula a posição de cada nuvem de nebulosa
                    const posicaoNebulaX = p.width * (i * 0.3 + 0.2);
                    const posicaoNebulaY = p.height * 0.5;
                    const tamanhoNebula = p.width * 0.4;

                    // Cria um gradiente radial para a nuvem
                    const gradienteNebulosa = ctx.createRadialGradient(
                        posicaoNebulaX, posicaoNebulaY, 0, // Centro
                        posicaoNebulaX, posicaoNebulaY, tamanhoNebula // Borda
                    );

                    // Define as cores do gradiente da nebulosa
                    gradienteNebulosa.addColorStop(0, `rgba(${coresNebulosa[i][0]}, ${coresNebulosa[i][1]}, ${coresNebulosa[i][2]}, 0.3)`);
                    gradienteNebulosa.addColorStop(0.5, `rgba(${coresNebulosa[i][0]}, ${coresNebulosa[i][1]}, ${coresNebulosa[i][2]}, 0.1)`);
                    gradienteNebulosa.addColorStop(1, `rgba(${coresNebulosa[i][0]}, ${coresNebulosa[i][1]}, ${coresNebulosa[i][2]}, 0)`);

                    // Armazena o gradiente e suas propriedades
                    gradientesNebulosa.push({
                        gradiente: gradienteNebulosa,
                        x: posicaoNebulaX,
                        y: posicaoNebulaY,
                        tamanho: tamanhoNebula
                    });
                }
            };

            // Função para desenhar o fundo de nebulosa
            const desenharFundoNebulosa = (deltaTime) => {
                let ctx = p.drawingContext;

                // Cria os gradientes se ainda não existirem
                if (!gradientesFundo) {
                    criarGradientesFundo();
                }

                // Aplica o gradiente principal
                ctx.fillStyle = gradientesFundo.principal;
                p.noStroke(); // Sem contorno
                p.rect(0, 0, p.width, p.height); // Desenha um retângulo cobrindo toda a tela

                // Adicionar nuvens de nebulosa com cores variadas
                for (let i = 0; i < gradientesNebulosa.length; i++) {
                    const nebulosa = gradientesNebulosa[i];

                    // Desenha a nuvem de nebulosa
                    ctx.fillStyle = nebulosa.gradiente;
                    ctx.beginPath();
                    ctx.arc(nebulosa.x, nebulosa.y, nebulosa.tamanho, 0, p.TWO_PI);
                    ctx.fill();
                }

                // Função auxiliar para criar o gradiente de uma partícula
                function criarGradienteParticula(particula) {
                    const brilhoParticula = ctx.createRadialGradient(
                        particula.x, particula.y, 0,
                        particula.x, particula.y, particula.tamanho * 2
                    );
                    // Define as cores do gradiente
                    brilhoParticula.addColorStop(0, `rgba(${particula.cor[0]}, ${particula.cor[1]}, ${particula.cor[2]}, ${particula.alpha/255 * 0.8})`);
                    brilhoParticula.addColorStop(1, `rgba(${particula.cor[0]}, ${particula.cor[1]}, ${particula.cor[2]}, 0)`);
                    return brilhoParticula;
                }

                // Partículas da nebulosa com cores mais variadas e brilho
                p.noStroke();
                // Atualiza e desenha cada partícula da nebulosa
                for (let particula of particulasNebulosa) {
                    // Atualiza a posição da partícula, ajustada pelo deltaTime
                    particula.x += particula.vx * deltaTime * 60;
                    particula.y += particula.vy * deltaTime * 60;

                    // Adiciona movimento mais orgânico com pequenas variações aleatórias, ajustadas pelo deltaTime
                    particula.vx += p.random(-0.01, 0.01) * deltaTime * 60;
                    particula.vy += p.random(-0.01, 0.01) * deltaTime * 60;

                    // Limita a velocidade para evitar movimentos muito rápidos
                    particula.vx = p.constrain(particula.vx, -0.3, 0.3);
                    particula.vy = p.constrain(particula.vy, -0.3, 0.3);

                    // Faz as partículas reaparecerem do outro lado da tela quando saem
                    if (particula.x < 0) particula.x = p.width;
                    if (particula.x > p.width) particula.x = 0;
                    if (particula.y < 0) particula.y = p.height;
                    if (particula.y > p.height) particula.y = 0;

                    // Atribui cores variadas às partículas se ainda não tiverem
                    if (!particula.cor) {
                        // Opções de cores para as partículas
                        const opcoesCores = [
                            [180, 100, 255],  // Roxo claro
                            [100, 50, 255],   // Azul roxeado
                            [255, 100, 200],  // Rosa
                            [50, 100, 200],   // Azul
                            [200, 50, 100]    // Vermelho roxeado
                        ];
                        // Escolhe uma cor aleatória
                        particula.cor = opcoesCores[Math.floor(p.random(opcoesCores.length))];
                        // Configura a pulsação da partícula
                        particula.velocidadePulso = p.random(0.02, 0.05);
                        particula.fasePulso = p.random(p.TWO_PI);

                        // Inicializa a última posição
                        particula.ultimaPosicao = { x: particula.x, y: particula.y };
                    }

                    // Atualiza o efeito de pulsação para as partículas, ajustado pelo deltaTime
                    particula.fasePulso += particula.velocidadePulso * deltaTime * 60;
                    const fatorPulso = 0.7 + 0.3 * Math.sin(particula.fasePulso);

                    // Atualiza o gradiente se a partícula se moveu significativamente
                    if (!particula.gradiente ||
                        Math.abs(particula.x - particula.ultimaPosicao.x) > 5 ||
                        Math.abs(particula.y - particula.ultimaPosicao.y) > 5) {
                        particula.gradiente = criarGradienteParticula(particula);
                        particula.ultimaPosicao = { x: particula.x, y: particula.y };
                    }

                    // Desenha a partícula com efeito de brilho
                    ctx.save();

                    // Usa o gradiente cacheado
                    ctx.fillStyle = particula.gradiente;
                    ctx.beginPath();
                    ctx.arc(particula.x, particula.y, particula.tamanho * 2 * fatorPulso, 0, p.TWO_PI);
                    ctx.fill();

                    // Desenha o centro da partícula
                    ctx.fillStyle = `rgba(${particula.cor[0]}, ${particula.cor[1]}, ${particula.cor[2]}, ${particula.alpha/255})`;
                    ctx.beginPath();
                    ctx.arc(particula.x, particula.y, particula.tamanho * fatorPulso, 0, p.TWO_PI);
                    ctx.fill();
                    ctx.restore();
                }

                // Função auxiliar para criar o gradiente de uma estrela
                function criarGradienteEstrela(estrela, fatorCintilacao) {
                    const brilhoEstrela = ctx.createRadialGradient(
                        estrela.x, estrela.y, 0,
                        estrela.x, estrela.y, estrela.tamanho * 3
                    );
                    // Define as cores do gradiente
                    brilhoEstrela.addColorStop(0, `rgba(255, 255, 255, ${0.7 * fatorCintilacao})`);
                    brilhoEstrela.addColorStop(0.5, `rgba(200, 220, 255, ${0.3 * fatorCintilacao})`);
                    brilhoEstrela.addColorStop(1, "rgba(150, 180, 255, 0)");
                    return brilhoEstrela;
                }

                // Estrelas com efeito de cintilação
                for (const estrela of estrelas) {
                    // Inicializa as propriedades de cintilação se ainda não existirem
                    if (!estrela.cintilacao) {
                        estrela.cintilacao = {
                            fase: p.random(p.TWO_PI), // Fase inicial aleatória
                            velocidade: p.random(0.03, 0.1), // Velocidade de cintilação
                            min: p.random(0.6, 0.8), // Brilho mínimo
                            max: p.random(1.0, 1.2), // Brilho máximo
                            ultimoFator: 0 // Último fator de cintilação usado
                        };
                        // Inicializa o gradiente
                        estrela.gradiente = null;
                    }

                    // Atualiza a fase de cintilação, ajustada pelo deltaTime
                    estrela.cintilacao.fase += estrela.cintilacao.velocidade * deltaTime * 60;
                    // Calcula o fator de cintilação baseado na fase
                    const fatorCintilacao = estrela.cintilacao.min + (estrela.cintilacao.max - estrela.cintilacao.min) *
                        (0.5 + 0.5 * Math.sin(estrela.cintilacao.fase));

                    // Atualiza o gradiente se o fator de cintilação mudou significativamente
                    if (!estrela.gradiente || Math.abs(fatorCintilacao - estrela.cintilacao.ultimoFator) > 0.1) {
                        estrela.gradiente = criarGradienteEstrela(estrela, fatorCintilacao);
                        estrela.cintilacao.ultimoFator = fatorCintilacao;
                    }

                    // Desenha a estrela com efeito de brilho
                    ctx.save();

                    // Usa o gradiente cacheado
                    ctx.fillStyle = estrela.gradiente;
                    ctx.beginPath();
                    ctx.arc(estrela.x, estrela.y, estrela.tamanho * 3, 0, p.TWO_PI);
                    ctx.fill();

                    // Desenha o centro da estrela
                    ctx.fillStyle = `rgba(255, 255, 255, ${fatorCintilacao})`;
                    ctx.beginPath();
                    ctx.arc(estrela.x, estrela.y, estrela.tamanho * fatorCintilacao, 0, p.TWO_PI);
                    ctx.fill();

                    // Adiciona raios de luz para estrelas maiores
                    if (estrela.tamanho > 2) {
                        const comprimentoRaio = estrela.tamanho * 5 * fatorCintilacao;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * fatorCintilacao})`;
                        ctx.lineWidth = 0.5;

                        // Desenha 4 raios em direções diferentes
                        for (let i = 0; i < 4; i++) {
                            const angulo = i * Math.PI / 2 + estrela.cintilacao.fase / 3;
                            ctx.beginPath();
                            ctx.moveTo(estrela.x, estrela.y);
                            ctx.lineTo(
                                estrela.x + Math.cos(angulo) * comprimentoRaio,
                                estrela.y + Math.sin(angulo) * comprimentoRaio
                            );
                            ctx.stroke();
                        }
                    }
                    ctx.restore();
                }
            };

            // Função principal de desenho, executada a cada frame
            p.draw = () => {
                // Calcula o deltaTime (tempo entre frames) e limita para evitar problemas ao trocar de aba
                let deltaTime = p.deltaTime / 1000; // Converte para segundos
                // Limita o deltaTime para evitar saltos muito grandes quando a aba fica inativa
                const maxDeltaTime = 0.1; // 100ms como limite máximo
                deltaTime = Math.min(deltaTime, maxDeltaTime);

                // Desenha o fundo de nebulosa
                desenharFundoNebulosa(deltaTime);

                /* Exibe o contador de FPS (quadros por segundo) e o deltaTime
                const fps = Math.round(p.frameRate());
                const dtMs = Math.round(deltaTime * 1000); // Converte para milissegundos para exibição
                p.push();
                p.fill(255);
                p.noStroke();
                p.textSize(16);
                p.textAlign(p.RIGHT, p.TOP);
                p.text(`FPS: ${fps} | DT: ${dtMs}ms`, p.width - 10, 10);
                p.pop();
                 */

                // Desenha os buracos negros
                buracosNegros.forEach(bn => bn.desenhar(deltaTime));

                // Física dos planetas - cálculo de forças gravitacionais e movimento
                for (let planeta of planetas) {
                    // Se o planeta não está sendo arrastado, aplica física
                    if (planeta.ehTutorial && planeta.arrastando) {
                        continue; // Não aplica física durante o arrasto do tutorial
                    }
                    if (!planeta.arrastando) {
                        // Aplica a força gravitacional de cada buraco negro
                        for (const bn of buracosNegros) {
                            // Calcula a direção e distância ao buraco negro
                            let dx = bn.x - planeta.x;
                            let dy = bn.y - planeta.y;
                            // Calcula o quadrado da distância (evita raiz quadrada desnecessária)
                            let distanciaQuadrado = dx * dx + dy * dy || 0.1; // Evita divisão por zero
                            // Calcula a distância real
                            let distancia = p.sqrt(distanciaQuadrado);
                            // Calcula a aceleração gravitacional (Lei de Newton)
                            let aceleracao = (G * massaCentral) / distanciaQuadrado;
                            // Aplica a aceleração ao vetor de velocidade, ajustada pelo deltaTime
                            planeta.vx += (dx / distancia) * aceleracao * deltaTime * 60;
                            planeta.vy += (dy / distancia) * aceleracao * deltaTime * 60;
                        }

                        // Aplica a força gravitacional de outros planetas
                        for (const outro of planetas) {
                            if (outro !== planeta && !outro.arrastando) {
                                // Calcula a direção e distância ao outro planeta
                                let dx2 = outro.x - planeta.x;
                                let dy2 = outro.y - planeta.y;
                                // Calcula o quadrado da distância
                                let distQuadrado2 = dx2 * dx2 + dy2 * dy2;
                                if (distQuadrado2 < 0.1) distQuadrado2 = 0.1; // Evita divisão por zero
                                // Calcula a distância real
                                let d2 = p.sqrt(distQuadrado2);
                                // Calcula a aceleração gravitacional entre planetas
                                let aceleracao2 = gravidadePlaneta / distQuadrado2;
                                // Aplica a aceleração ao vetor de velocidade, ajustada pelo deltaTime
                                planeta.vx += (dx2 / d2) * aceleracao2 * deltaTime * 60;
                                planeta.vy += (dy2 / d2) * aceleracao2 * deltaTime * 60;
                            }
                        }

                        // Atualiza a posição do planeta com base na velocidade e deltaTime
                        planeta.x += planeta.vx * deltaTime * 60; // Multiplicamos por 60 para manter a velocidade similar à original em 60 FPS
                        planeta.y += planeta.vy * deltaTime * 60;
                    } else {
                        // Se o planeta está sendo arrastado, segue o mouse
                        planeta.x = p.mouseX;
                        planeta.y = p.mouseY;
                    }
                }

                // Detecção e resolução de colisões entre planetas
                for (let i = 0; i < planetas.length; i++) {
                    for (let j = i + 1; j < planetas.length; j++) {
                        // Verifica se nenhum dos planetas está sendo arrastado
                        if (!planetas[i].arrastando && !planetas[j].arrastando) {
                            // Calcula a distância entre os planetas
                            let dx = planetas[j].x - planetas[i].x;
                            let dy = planetas[j].y - planetas[i].y;
                            let distancia = p.sqrt(dx * dx + dy * dy);

                            // Se a distância for menor que o diâmetro, ocorreu uma colisão
                            if (distancia < diametroPlaneta) {
                                // Calcula o vetor normal da colisão
                                let nx = dx / distancia;
                                let ny = dy / distancia;

                                // Calcula a velocidade relativa na direção normal
                                let vxRel = planetas[i].vx - planetas[j].vx;
                                let vyRel = planetas[i].vy - planetas[j].vy;
                                let produtoEscalar = vxRel * nx + vyRel * ny;

                                // Aplica o impulso da colisão (conservação de momento)
                                planetas[i].vx -= produtoEscalar * nx;
                                planetas[i].vy -= produtoEscalar * ny;
                                planetas[j].vx += produtoEscalar * nx;
                                planetas[j].vy += produtoEscalar * ny;

                                // Corrige a sobreposição para evitar que os planetas fiquem presos
                                let sobreposicao = diametroPlaneta - distancia;
                                planetas[i].x -= (sobreposicao / 2) * nx;
                                planetas[i].y -= (sobreposicao / 2) * ny;
                                planetas[j].x += (sobreposicao / 2) * nx;
                                planetas[j].y += (sobreposicao / 2) * ny;
                            }
                        }
                    }
                }

                // Remove planetas que saíram da tela ou colidiram com buracos negros
                const planetasRestantes = [];
                for (const planeta of planetas) {
                    // Verifica se o planeta está fora dos limites da tela
                    const foraDoLimite =
                        planeta.x < 0 ||
                        planeta.x > p.width ||
                        planeta.y < 0 ||
                        planeta.y > p.height;

                    // Verifica se o planeta colidiu com algum buraco negro
                    let colidiu = false;
                    for (const bn of buracosNegros) {
                        // Calcula a distância entre o planeta e o buraco negro
                        if (p.dist(bn.x, bn.y, planeta.x, planeta.y) < (diametroBuracoNegro / 2 + diametroPlaneta / 2)) {
                            colidiu = true;
                            break;
                        }
                    }

                    // Se o planeta saiu da tela ou colidiu, cria uma explosão
                    if (foraDoLimite || colidiu) {
                        // Usa a cor do planeta para a explosão
                        explosoes.push(criarExplosao(planeta.x, planeta.y, planeta.cor));
                    } else {
                        // Caso contrário, mantém o planeta
                        planetasRestantes.push(planeta);
                    }
                }
                // Atualiza a lista de planetas
                planetas = planetasRestantes;

                // Renderiza as explosões com efeitos visuais melhorados
                for (let i = explosoes.length - 1; i >= 0; i--) {
                    const explosao = explosoes[i];
                    const ctx = p.drawingContext;

                    // Função auxiliar para criar o gradiente de uma onda de choque
                    function criarGradienteOndaChoque(oc) {
                        const gradienteChoque = ctx.createRadialGradient(
                            oc.x, oc.y, 0,
                            oc.x, oc.y, oc.raio
                        );
                        // Define as cores do gradiente
                        gradienteChoque.addColorStop(0, `rgba(255, 255, 255, 0)`);
                        gradienteChoque.addColorStop(0.7, `rgba(255, 200, 100, ${oc.alpha / 255 * 0.1})`);
                        gradienteChoque.addColorStop(0.9, `rgba(255, 100, 50, ${oc.alpha / 255 * 0.3})`);
                        gradienteChoque.addColorStop(1, `rgba(255, 50, 0, 0)`);
                        return gradienteChoque;
                    }

                    // Renderiza a onda de choque da explosão
                    if (explosao.ondaChoque) {
                        const oc = explosao.ondaChoque;

                        // Inicializa propriedades de cache se necessário
                        if (!oc.ultimoRaio) {
                            oc.ultimoRaio = oc.raio;
                            oc.ultimaAlpha = oc.alpha;
                            oc.gradiente = null;
                        }

                        // Aumenta o raio da onda de choque, ajustado pelo deltaTime
                        oc.raio += oc.velocidade * deltaTime * 60;
                        // Diminui a transparência conforme a onda se expande, ajustado pelo deltaTime
                        oc.alpha -= oc.velocidade * 2 * deltaTime * 60;

                        // Desenha a onda de choque enquanto estiver dentro do raio máximo
                        if (oc.raio <= oc.raioMaximo) {
                            // Atualiza o gradiente se o raio ou alpha mudaram significativamente
                            if (!oc.gradiente ||
                                Math.abs(oc.raio - oc.ultimoRaio) > 5 ||
                                Math.abs(oc.alpha - oc.ultimaAlpha) > 10) {
                                oc.gradiente = criarGradienteOndaChoque(oc);
                                oc.ultimoRaio = oc.raio;
                                oc.ultimaAlpha = oc.alpha;
                            }

                            ctx.save();
                            // Usa o gradiente cacheado
                            ctx.fillStyle = oc.gradiente;
                            ctx.beginPath();
                            ctx.arc(oc.x, oc.y, oc.raio, 0, p.TWO_PI);
                            ctx.fill();
                            ctx.restore();
                        }
                    }

                    // Renderiza as partículas da explosão com efeitos visuais melhorados
                    for (let j = explosao.particulas.length - 1; j >= 0; j--) {
                        const particula = explosao.particulas[j];
                        // Atualiza a posição da partícula com base no deltaTime
                        particula.x += particula.vx * deltaTime * 60;
                        particula.y += particula.vy * deltaTime * 60;
                        // Diminui o tempo de vida da partícula com base no deltaTime
                        particula.tempoVida -= particula.decaimento * deltaTime * 60;
                        // Atualiza a rotação da partícula com base no deltaTime
                        particula.rotacao += particula.velocidadeRotacao * deltaTime * 60;

                        // Aplica efeito de desaceleração para movimento mais natural, ajustado pelo deltaTime
                        // Fórmula: base^(deltaTime * 60) onde base = 0.98 para 60 FPS
                        const fatorDesaceleracao = Math.pow(0.98, deltaTime * 60);
                        particula.vx *= fatorDesaceleracao;
                        particula.vy *= fatorDesaceleracao;

                        // Função auxiliar para criar o gradiente de uma partícula de explosão
                        function criarGradienteParticulaExplosao(particula) {
                            const brilhoParticula = ctx.createRadialGradient(
                                particula.x, particula.y, 0,
                                particula.x, particula.y, particula.tamanho * 2
                            );
                            // Define as cores do gradiente com base na cor da partícula
                            brilhoParticula.addColorStop(0, `rgba(${particula.cor[0]}, ${particula.cor[1]}, ${particula.cor[2]}, ${particula.tempoVida / 255 * 0.8})`);
                            brilhoParticula.addColorStop(1, `rgba(${particula.cor[0]}, ${particula.cor[1]}, ${particula.cor[2]}, 0)`);
                            return brilhoParticula;
                        }

                        // Inicializa propriedades de cache se necessário
                        if (!particula.ultimaPosicao) {
                            particula.ultimaPosicao = { x: particula.x, y: particula.y, tempoVida: particula.tempoVida };
                            particula.gradiente = null;
                        }

                        // Atualiza o gradiente se a partícula se moveu significativamente ou o tempo de vida mudou
                        if (!particula.gradiente ||
                            Math.abs(particula.x - particula.ultimaPosicao.x) > 5 ||
                            Math.abs(particula.y - particula.ultimaPosicao.y) > 5 ||
                            Math.abs(particula.tempoVida - particula.ultimaPosicao.tempoVida) > 20) {
                            particula.gradiente = criarGradienteParticulaExplosao(particula);
                            particula.ultimaPosicao = { x: particula.x, y: particula.y, tempoVida: particula.tempoVida };
                        }

                        // Cria efeito de brilho ao redor da partícula
                        ctx.save();

                        // Usa o gradiente cacheado
                        ctx.fillStyle = particula.gradiente;
                        ctx.beginPath();
                        ctx.arc(particula.x, particula.y, particula.tamanho * 2, 0, p.TWO_PI);
                        ctx.fill();

                        // Define a cor da partícula principal
                        ctx.fillStyle = `rgba(${particula.cor[0]}, ${particula.cor[1]}, ${particula.cor[2]}, ${particula.tempoVida / 255})`;

                        // Posiciona e rotaciona para desenhar formas variadas
                        ctx.translate(particula.x, particula.y);
                        ctx.rotate(particula.rotacao);

                        // Desenha diferentes formas para as partículas baseado no índice
                        if (j % 3 === 0) {
                            // Partículas triangulares
                            ctx.beginPath();
                            ctx.moveTo(0, -particula.tamanho);
                            ctx.lineTo(particula.tamanho, particula.tamanho);
                            ctx.lineTo(-particula.tamanho, particula.tamanho);
                            ctx.closePath();
                            ctx.fill();
                        } else if (j % 3 === 1) {
                            // Partículas quadradas
                            ctx.fillRect(-particula.tamanho/2, -particula.tamanho/2, particula.tamanho, particula.tamanho);
                        } else {
                            // Partículas circulares
                            ctx.beginPath();
                            ctx.arc(0, 0, particula.tamanho/2, 0, p.TWO_PI);
                            ctx.fill();
                        }

                        ctx.restore();

                        // Remove partículas que já terminaram seu tempo de vida
                        if (particula.tempoVida <= 0) {
                            explosao.particulas.splice(j, 1);
                        }
                    }

                    // Remove a explosão quando todas as partículas desaparecerem e a onda de choque terminar
                    const ondaChoqueTerminada = !explosao.ondaChoque || explosao.ondaChoque.raio >= explosao.ondaChoque.raioMaximo;
                    // Se não há mais partículas e a onda de choque terminou, remove a explosão
                    if (explosao.particulas.length === 0 && ondaChoqueTerminada) {
                        explosoes.splice(i, 1);
                    }
                }

                // Desenha planetas coloridos com efeitos de brilho e textura
                for (const planeta of planetas) {
                    const ctx = p.drawingContext;

                    // Cria efeito de brilho ao redor do planeta
                    ctx.save();
                    // Cria um gradiente radial para o brilho
                    const brilho = ctx.createRadialGradient(
                        planeta.x, planeta.y, diametroPlaneta/2 * 0.8, // Centro e raio interno
                        planeta.x, planeta.y, diametroPlaneta * 1.2    // Centro e raio externo
                    );
                    // Define as cores do gradiente com base na cor do planeta
                    brilho.addColorStop(0, `rgba(${planeta.cor[0]}, ${planeta.cor[1]}, ${planeta.cor[2]}, 0)`);
                    brilho.addColorStop(0.5, `rgba(${planeta.cor[0]}, ${planeta.cor[1]}, ${planeta.cor[2]}, 0.2)`);
                    brilho.addColorStop(1, `rgba(${planeta.cor[0]}, ${planeta.cor[1]}, ${planeta.cor[2]}, 0)`);

                    // Desenha o brilho ao redor do planeta
                    ctx.fillStyle = brilho;
                    ctx.beginPath();
                    ctx.arc(planeta.x, planeta.y, diametroPlaneta * 1.2, 0, p.TWO_PI);
                    ctx.fill();
                    ctx.restore();

                    // Desenha a linha de arrasto quando o planeta está sendo arrastado
                    if (planeta.arrastando) {
                        ctx.save();
                        // Cria um gradiente linear para a linha de arrasto
                        const gradienteArrasto = ctx.createLinearGradient(
                            planeta.x, planeta.y, // Posição atual do planeta
                            planeta.inicioArrasto.x, planeta.inicioArrasto.y // Posição inicial do arrasto
                        );
                        // Define as cores do gradiente com base na cor do planeta
                        gradienteArrasto.addColorStop(0, `rgba(${planeta.cor[0]}, ${planeta.cor[1]}, ${planeta.cor[2]}, 0.8)`);
                        gradienteArrasto.addColorStop(1, `rgba(${planeta.cor[0]}, ${planeta.cor[1]}, ${planeta.cor[2]}, 0.1)`);

                        // Desenha a linha de arrasto
                        ctx.strokeStyle = gradienteArrasto;
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(planeta.x, planeta.y);
                        ctx.lineTo(planeta.inicioArrasto.x, planeta.inicioArrasto.y);
                        ctx.stroke();
                        ctx.restore();
                    }

                    // Desenha o planeta com gradiente para criar efeito 3D
                    ctx.save();
                    // Cria um gradiente radial para simular iluminação 3D
                    const gradientePlaneta = ctx.createRadialGradient(
                        planeta.x - diametroPlaneta/4, planeta.y - diametroPlaneta/4, 0, // Fonte de luz
                        planeta.x, planeta.y, diametroPlaneta/2 // Centro e raio do planeta
                    );
                    // Define as cores do gradiente para criar efeito de iluminação
                    gradientePlaneta.addColorStop(0, `rgba(${planeta.cor[0] + 50 > 255 ? 255 : planeta.cor[0] + 50}, ${planeta.cor[1] + 50 > 255 ? 255 : planeta.cor[1] + 50}, ${planeta.cor[2] + 50 > 255 ? 255 : planeta.cor[2] + 50}, 1)`); // Parte iluminada
                    gradientePlaneta.addColorStop(0.7, `rgba(${planeta.cor[0]}, ${planeta.cor[1]}, ${planeta.cor[2]}, 1)`); // Cor normal
                    gradientePlaneta.addColorStop(1, `rgba(${planeta.cor[0] * 0.7}, ${planeta.cor[1] * 0.7}, ${planeta.cor[2] * 0.7}, 1)`); // Sombra

                    // Desenha o corpo principal do planeta
                    ctx.fillStyle = gradientePlaneta;
                    ctx.beginPath();
                    ctx.arc(planeta.x, planeta.y, diametroPlaneta/2, 0, p.TWO_PI);
                    ctx.fill();

                    // Adiciona detalhes de superfície ao planeta
                    if (!planeta.detalhes) {
                        // Inicializa os detalhes do planeta
                        planeta.detalhes = {
                            manchas: [], // Manchas na superfície
                            aneis: Math.random() > 0.7 // 30% de chance de ter anéis
                        };

                        // Cria manchas aleatórias na superfície do planeta
                        const numManchas = Math.floor(p.random(2, 6)); // Número aleatório de manchas
                        for (let i = 0; i < numManchas; i++) {
                            // Adiciona cada mancha com posição, tamanho e cor aleatórios
                            planeta.detalhes.manchas.push({
                                deslocamentoX: p.random(-0.3, 0.3) * diametroPlaneta/2, // Posição X relativa
                                deslocamentoY: p.random(-0.3, 0.3) * diametroPlaneta/2, // Posição Y relativa
                                tamanho: p.random(0.1, 0.25) * diametroPlaneta/2, // Tamanho da mancha
                                cor: [
                                    // Cor baseada na cor do planeta, mas mais escura
                                    planeta.cor[0] * p.random(0.6, 0.8),
                                    planeta.cor[1] * p.random(0.6, 0.8),
                                    planeta.cor[2] * p.random(0.6, 0.8)
                                ]
                            });
                        }
                    }

                    // Desenha as manchas na superfície do planeta
                    for (const mancha of planeta.detalhes.manchas) {
                        // Define a cor da mancha
                        ctx.fillStyle = `rgba(${mancha.cor[0]}, ${mancha.cor[1]}, ${mancha.cor[2]}, 0.7)`;
                        // Desenha a mancha
                        ctx.beginPath();
                        ctx.arc(planeta.x + mancha.deslocamentoX, planeta.y + mancha.deslocamentoY, mancha.tamanho, 0, p.TWO_PI);
                        ctx.fill();
                    }

                    // Desenha anéis para alguns planetas (30% de chance)
                    if (planeta.detalhes.aneis) {
                        ctx.save();
                        // Posiciona no centro do planeta
                        ctx.translate(planeta.x, planeta.y);
                        // Inclina os anéis para dar perspectiva
                        ctx.rotate(p.PI / 6);

                        // Cria um gradiente radial para os anéis
                        const gradienteAneis = ctx.createRadialGradient(
                            0, 0, diametroPlaneta/2, // Começa na borda do planeta
                            0, 0, diametroPlaneta * 1.1 // Termina além do planeta
                        );
                        // Define as cores do gradiente com base na cor do planeta
                        gradienteAneis.addColorStop(0, `rgba(${planeta.cor[0]}, ${planeta.cor[1]}, ${planeta.cor[2]}, 0.1)`); // Transparente perto do planeta
                        gradienteAneis.addColorStop(0.3, `rgba(${planeta.cor[0]}, ${planeta.cor[1]}, ${planeta.cor[2]}, 0.6)`); // Mais opaco no meio
                        gradienteAneis.addColorStop(0.7, `rgba(${planeta.cor[0]}, ${planeta.cor[1]}, ${planeta.cor[2]}, 0.3)`); // Menos opaco
                        gradienteAneis.addColorStop(1, `rgba(${planeta.cor[0]}, ${planeta.cor[1]}, ${planeta.cor[2]}, 0.1)`); // Transparente na borda

                        // Desenha os anéis como uma elipse
                        ctx.fillStyle = gradienteAneis;
                        ctx.beginPath();
                        ctx.ellipse(0, 0, diametroPlaneta * 1.1, diametroPlaneta/4, 0, 0, p.TWO_PI);
                        ctx.fill();
                        ctx.restore();
                    }

                    // Adiciona brilho especular (reflexo de luz) na superfície do planeta
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Branco semi-transparente
                    ctx.beginPath();
                    // Posiciona o brilho no quadrante superior esquerdo do planeta
                    ctx.arc(planeta.x - diametroPlaneta/5, planeta.y - diametroPlaneta/5, diametroPlaneta/8, 0, p.TWO_PI);
                    ctx.fill();

                    // Restaura o contexto de desenho
                    ctx.restore();
                }
                if (tutorialAtivo) {
                    const agora = p.millis();

                    switch (passoTutorial) {
                        case 0: // Iniciar tutorial
                            posicaoInicial = { x: centroX + 150, y: centroY - 72};
                            planetaTutorial = {
                                x: posicaoInicial.x,
                                y: posicaoInicial.y,
                                cor: [200, 200, 255],
                                vx: 0,
                                vy: 0,
                                diametro: diametroPlaneta,
                                arrastando: true,
                                inicioArrasto: { ...posicaoInicial },
                                ehTutorial: true
                            };
                            planetas.push(planetaTutorial);
                            tempoInicioPasso = agora;
                            tempoUltimoPasso = agora;
                            passoTutorial = 1;
                            break;

                        case 1: // Simular arrasto
                            if (planetaTutorial) {
                                const tempoDecorrido = agora - tempoInicioPasso;
                                const progresso = p.constrain(tempoDecorrido / duracaoArrastro, 0, 1);

                                if (progresso >= 1 && agora - tempoUltimoPasso >= tempoPrimeiraMensagem) {
                                    tempoInicioPasso = agora;
                                    tempoUltimoPasso = agora;
                                    passoTutorial = 2;
                                }
                                else {
                                    const progressoSuavizado = easeInOutQuad(progresso);
                                    posicaoAlvo = { x: posicaoInicial.x, y: posicaoInicial.y + 72 };
                                    planetaTutorial.x = p.lerp(posicaoInicial.x, posicaoAlvo.x, progressoSuavizado);
                                    planetaTutorial.y = p.lerp(posicaoInicial.y, posicaoAlvo.y, progressoSuavizado);
                                }
                            }
                            break;

                        case 2: // Preparar lançamento
                            if (agora - tempoUltimoPasso >= tempoExibicaoTexto) {
                                tempoInicioPasso = agora;
                                tempoUltimoPasso = agora;
                                passoTutorial = 3;
                            }
                            break;

                        case 3: // Executar lançamento
                            if (planetaTutorial) {
                                const tempoDecorrido = agora - tempoInicioPasso;

                                if (tempoDecorrido >= tempoAntesLancamento) {
                                    const dx = posicaoInicial.x - posicaoAlvo.x;
                                    const dy = posicaoInicial.y - posicaoAlvo.y;

                                    planetaTutorial.vx = dx * forcaDemonstracao;
                                    planetaTutorial.vy = dy * forcaDemonstracao;
                                    planetaTutorial.arrastando = false;
                                    planetaTutorial.ehTutorial = false;

                                    tempoInicioPasso = agora;
                                    tempoUltimoPasso = agora;
                                    passoTutorial = 4;
                                }
                            }
                            break;

                        case 4: // Esperar reinício
                            const tempoDecorrido = agora - tempoInicioPasso;
                            const planetaExiste = planetas.includes(planetaTutorial);

                            if (!planetaExiste || tempoDecorrido > 10000) {
                                planetas = planetas.filter(p => p !== planetaTutorial);
                                planetaTutorial = null;
                                passoTutorial = 0; // Reiniciar ciclo
                            }
                            break;
                    }


                    // Desenhar instruções
                    p.push();
                    p.fill(255);
                    p.textSize(24);
                    p.textAlign(p.CENTER, p.CENTER);

                    if (passoTutorial === 1) {
                        p.text("Bem-vindo ao Orbital!", centroX, centroY * 0.2);
                        p.textSize(18);
                        p.text("Clique para criar um planeta, arraste-o para criar uma força", centroX, centroY * 0.2 + 30);
                        p.text("Quanto mais você arrastar, mais forte será o lançamento", centroX, centroY * 0.2 + 55);
                    }
                    else if (passoTutorial === 2) {
                        p.text("Perfeito! Agora solte o planeta", centroX, centroY * 0.2);
                        p.textSize(18);
                        p.text("A força do lançamento determinará a trajetória", centroX, centroY * 0.2 + 30);
                    }
                    else if (passoTutorial === 3) {
                        p.text("Observe como o planeta orbita!", centroX, centroY * 0.2);
                        p.textSize(18);
                        p.text("A gravidade do buraco negro afeta sua trajetória", centroX, centroY * 0.2 + 30);
                    }
                    p.pop();
                }
            };

            {/*
                // Função chamada quando o mouse é pressionado - cria um novo planeta
            p.mousePressed = () => {
                // Seleciona uma cor aleatória da lista de cores disponíveis
                const corAleatoria = coresPlanetas[Math.floor(p.random(coresPlanetas.length))];

                // Cria um novo objeto planeta
                const novoPlaneta = {
                    x: p.mouseX, // Posição X do mouse
                    y: p.mouseY, // Posição Y do mouse
                    cor: corAleatoria, // Cor aleatória
                    vx: 0, // Velocidade X inicial
                    vy: 0, // Velocidade Y inicial
                    diametro: diametroPlaneta, // Diâmetro do planeta
                    arrastando: true, // Indica que o planeta está sendo arrastado
                    inicioArrasto: { x: p.mouseX, y: p.mouseY } // Posição inicial do arrasto
                };

                // Adiciona o novo planeta à lista de planetas
                planetas.push(novoPlaneta);
                // Define o planeta atual como o novo planeta criado
                planetaAtual = novoPlaneta;
            };

            // Função chamada quando o botão do mouse é solto - lança o planeta
            p.mouseReleased = () => {
                // Verifica se existe um planeta sendo arrastado
                if (planetaAtual) {
                    // Calcula a diferença entre a posição inicial e a posição atual do mouse
                    const dx = planetaAtual.inicioArrasto.x - p.mouseX;
                    const dy = planetaAtual.inicioArrasto.y - p.mouseY;

                    // Define a velocidade do planeta com base na distância e direção do arrasto
                    planetaAtual.vx = dx * fatorForca;
                    planetaAtual.vy = dy * fatorForca;

                    // Marca o planeta como não mais sendo arrastado
                    planetaAtual.arrastando = false;
                    // Remove a referência ao planeta atual
                    planetaAtual = null;
                }
            };
            */}

            // Função chamada quando a janela é redimensionada
            p.windowResized = () => {
                // Obtém o novo tamanho do contêiner
                const { largura, altura } = obterTamanhoConteiner();
                // Redimensiona o canvas para o novo tamanho
                p.resizeCanvas(largura, altura);
                // Atualiza a posição central
                centroX = largura / 2;
                centroY = altura / 2;

                // Reseta os gradientes para que sejam recalculados no próximo frame
                gradientesFundo = null;
                gradientesNebulosa = [];

                // Limpa e recria as estrelas de fundo
                estrelas = [];
                for (let i = 0; i < numEstrelas; i++) {
                    estrelas.push({
                        x: p.random(largura),
                        y: p.random(altura),
                        tamanho: p.random(1, 3)
                    });
                }

                // Limpa e recria as partículas da nebulosa
                particulasNebulosa = [];
                for (let i = 0; i < numParticulasNebulosa; i++) {
                    particulasNebulosa.push({
                        x: p.random(largura),
                        y: p.random(altura),
                        tamanho: p.random(2, 6),
                        vx: p.random(-0.2, 0.2),
                        vy: p.random(-0.2, 0.2),
                        alpha: p.random(50, 150)
                    });
                }

                // Recria os buracos negros com as novas posições
                if (numBuracosNegros === 1) {
                    // Um buraco negro no centro
                    buracosNegros = [new BuracoNegro(centroX, centroY)];
                } else if (numBuracosNegros === 2) {
                    // Dois buracos negros, um em cada terço da tela
                    buracosNegros = [
                        new BuracoNegro(largura / 3, altura / 2),
                        new BuracoNegro((2 * largura) / 3, altura / 2)
                    ];
                }
            };
        };

        const p5Instance = new p5(sketch, containerRef.current);
        p5InstanceRef.current = p5Instance;
        return () => {
            if (p5InstanceRef.current) {
                p5InstanceRef.current.remove();
                p5InstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="w-full h-full" />

            {/* Elementos de áudio */}
            <audio
                ref={audio1Ref}
                src="/music1.mp3"
                loop
                autoPlay={currentTrack === 1}
            />
            <audio
                ref={audio2Ref}
                src="/music2.mp3"
                loop
                autoPlay={currentTrack === 2}
            />
            <div className="absolute top-2 left-2 bg-purple-900 bg-opacity-80 rounded-lg p-4 shadow-lg min-w-[200px]">
                <div className="flex flex-col space-y-3">
                    {/* Botão para voltar ao menu */}
                    <button
                        onClick={onVoltarMenu}
                        className="bg-purple-800 bg-opacity-70 text-white px-4 py-2 rounded-md shadow hover:bg-purple-700 transition-colors w-full text-left"
                    >
                        Voltar ao Menu
                    </button>

                    {/* Separador */}
                    <div className="border-t border-purple-700 my-2"></div>

                    {/* Botão para ativar/desativar o som */}
                    <button
                        onClick={toggleMute}
                        className="bg-purple-800 bg-opacity-70 text-white px-4 py-2 rounded-md shadow hover:bg-purple-700 transition-colors flex items-center"
                    >
                        <span className="mr-2">{isMuted ? "🔇" : "🔊"}</span>
                        <span>{isMuted ? "Ativar Som" : "Desativar Som"}</span>
                    </button>

                    {/* Botão para alternar entre as músicas */}
                    <button
                        onClick={toggleMusic}
                        className="bg-purple-800 bg-opacity-70 text-white px-4 py-2 rounded-md shadow hover:bg-purple-700 transition-colors"
                    >
                        Música {currentTrack === 1 ? '1' : '2'}
                    </button>
                </div>
            </div>
        </div>
    )
};