import { useState } from 'react';
import Canvas from './components/Canvas.jsx';
import Menu from './components/Menu.jsx';
import Intro from "./components/Intro.jsx";

function App() {
  const [jogoIniciado, setJogoIniciado] = useState(false);
  const [dificuldade, setDificuldade] = useState('facil');
  const [mostraTutorial, setMostraTutorial] = useState(false);

  const iniciarJogo = (dificuldadeSelecionada) => {
    setDificuldade(dificuldadeSelecionada);
    setJogoIniciado(true);
    setMostraTutorial(false);
  };

  const voltarAoMenu = () => {
    setJogoIniciado(false);
    setMostraTutorial(false);
  };

  const abrirTutorial = () => {
    setJogoIniciado(false);
    setMostraTutorial(true);
  };

  return (
      <div className="min-h-screen">
        {mostraTutorial ? (
            <Intro onVoltarMenu={voltarAoMenu} />
        ) : !jogoIniciado ? (
            <Menu onStartGame={iniciarJogo} onTutorial={abrirTutorial} />
        ) : (
            <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
              <div className="w-full h-screen">
                <Canvas dificuldade={dificuldade} onVoltarMenu={voltarAoMenu} />
              </div>
            </div>
        )}
      </div>
  );
}

export default App;