import React, { useState, useEffect } from 'react';

// Componente de Menu que exibe uma história sobre o jogo e opções de dificuldade
const Menu = ({ onStartGame , onTutorial }) => {
  // Estado para controlar a dificuldade selecionada
  const [dificuldadeSelecionada, setDificuldadeSelecionada] = useState('facil');
  // Estado para controlar a animação de estrelas
  const [estrelas, setEstrelas] = useState([]);

  // Efeito para criar estrelas animadas no fundo
  useEffect(() => {
    const novasEstrelas = [];
    // Cria 100 estrelas com posições e tamanhos aleatórios
    for (let i = 0; i < 100; i++) {
      novasEstrelas.push({
        x: Math.random() * 100, // Posição X em porcentagem
        y: Math.random() * 100, // Posição Y em porcentagem
        tamanho: Math.random() * 0.3 + 0.1, // Tamanho entre 0.1 e 0.4em
        animacao: Math.random() * 5 + 1, // Velocidade de animação entre 1s e 6s
        delay: Math.random() * 5 // Delay de início da animação
      });
    }
    setEstrelas(novasEstrelas);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4">
      {/* Estrelas animadas no fundo */}
      {estrelas.map((estrela, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${estrela.x}%`,
            top: `${estrela.y}%`,
            width: `${estrela.tamanho}em`,
            height: `${estrela.tamanho}em`,
            opacity: Math.random() * 0.7 + 0.3,
            animationDuration: `${estrela.animacao}s`,
            animationDelay: `${estrela.delay}s`
          }}
        />
      ))}

      {/* Título com efeito de brilho */}
      <div className="relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 animate-gradient">
          Órbita
        </h1>
        <div className="w-32 h-1 mx-auto bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full mb-8"></div>
      </div>

      {/* Conteúdo principal com efeito de vidro */}
      <div className="relative z-10 max-w-2xl backdrop-blur-md bg-black bg-opacity-30 p-8 rounded-xl mb-8 text-center border border-purple-500/30 shadow-lg">
        {/*<h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
          A História do Universo
        </h2>

        <p className="mb-4 text-gray-200">
          Em um universo distante, buracos negros exercem sua força gravitacional sobre os planetas ao redor.
          Como um criador cósmico, você tem o poder de criar novos mundos e observar como eles interagem
          com as poderosas forças da gravidade.
        </p>

        <p className="mb-4 text-gray-200">
          Clique para criar um planeta, arraste para dar velocidade e direção, e solte para ver
          como ele orbita ao redor dos buracos negros. Observe como os planetas interagem entre si,
          colidem, e são eventualmente consumidos pelos buracos negros.
        </p>

        <p className="mb-4 text-gray-200">
          Cada planeta tem suas próprias características e cores. Alguns possuem anéis, outros têm
          manchas em sua superfície. Todos estão sujeitos às leis da física neste universo simulado.
        </p>

        <p className="mb-6 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
          Você está pronto para se tornar um criador de mundos?
        </p>*/}
        <p className="mb-4 text-gray-200">
          Em um palco de veludo cósmico, onde os buracos negros entoam seu <span className="text-purple-300">canto gravitacional</span>,
          cada movimento é uma coreografia escrita nas leis do universo. Como arquiteto celestial, suas mãos moldam
          <span className="text-pink-300"> embriões estelares</span> que desafiam o abismo.
        </p>

        <p className="mb-4 text-gray-200">
          Com um toque, <span className="text-purple-300">despertas mundos do vácuo</span>. Com um gesto, traças <span className="text-pink-300">vetores de criação</span>.
          Ao soltar, testemunhas o primeiro suspiro de uma órbita - frágil equilíbrio entre fuga e rendição ao
          <span className="text-purple-300"> abraço do horizonte de eventos</span>.
        </p>

        <p className="mb-4 text-gray-200">
          Cada esfera carrega sua <span className="text-pink-300">assinatura cósmica</span>: algumas vestem anéis como regentes de Saturno, outras exibem
          cicatrizes de superfície que contam histórias de <span className="text-purple-300">renascimentos estelares</span>. Todas inscrevem no espaço
          <span className="text-pink-300"> equações vivas</span> de atração e repúdio.
        </p>

        <p className="mb-6 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
          Entre neste <span className="italic">balé gravitacional</span> - qual história escreverás no <span className="text-xl">📜</span> do cosmos?
          <div className="mt-2 animate-pulse text-teal-300 text-xl">▼</div>
        </p>

        <div className="flex justify-center mb-4">
          <button
              onClick={onTutorial}
              className="relative z-10 group bg-transparent border-2 border-teal-400 hover:bg-teal-900/30 text-teal-300 font-medium py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <span className="text-xl">❓</span>
            <span>Primeira vez jogando?</span>
            <span className="absolute inset-0 rounded-full bg-teal-400 opacity-0 group-hover:opacity-10 transition-opacity"></span>
          </button>
        </div>

        {/* Seleção de dificuldade */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-purple-300">Escolha a Dificuldade:</h3>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* Botão de dificuldade Fácil */}
            <button 
              onClick={() => setDificuldadeSelecionada('facil')}
              className={`flex-1 py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                dificuldadeSelecionada === 'facil' 
                  ? 'bg-green-600 border-2 border-green-400 shadow-lg shadow-green-500/30' 
                  : 'bg-green-700/50 hover:bg-green-600/70'
              }`}
            >
              <span className="text-lg font-medium">Fácil</span>
              <div className="flex">
                <span className="block w-3 h-3 rounded-full bg-white"></span>
              </div>
              <span className="text-sm text-green-200">1 Buraco Negro</span>
            </button>

            {/* Botão de dificuldade Difícil */}
            <button 
              onClick={() => setDificuldadeSelecionada('dificil')}
              className={`flex-1 py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                dificuldadeSelecionada === 'dificil' 
                  ? 'bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/30' 
                  : 'bg-red-700/50 hover:bg-red-600/70'
              }`}
            >
              <span className="text-lg font-medium">Difícil</span>
              <div className="flex">
                <span className="block w-3 h-3 rounded-full bg-white mr-1"></span>
                <span className="block w-3 h-3 rounded-full bg-white"></span>
              </div>
              <span className="text-sm text-red-200">2 Buracos Negros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Botão de iniciar com efeito de brilho */}
      <button 
        onClick={() => onStartGame(dificuldadeSelecionada)}
        className="relative z-10 group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <span>Iniciar Jogo</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
      </button>

      {/* Círculos decorativos */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
  );
};

export default Menu;
