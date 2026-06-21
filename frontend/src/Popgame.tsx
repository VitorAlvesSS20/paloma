import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import backgroundImage from "./assets/popgame.png";
import backgroundMusic from "./assets/popgame.mp3";
import "./Popgame.css";

interface Popcorn {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
}

interface PopgameProps {
  onBackToMenu?: () => void;
}

export default function Popgame({ onBackToMenu }: PopgameProps) {
  const [gameState, setGameState] = useState<"start" | "playing" | "victory">("start");
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem("popcorn_highscore")) || 0;
  });
  const [popcorns, setPopcorns] = useState<Popcorn[]>([]);
  const [captureParticles, setCaptureParticles] = useState<HeartParticle[]>([]);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const bucketRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Otimização: Refs para usar dentro do loop de física sem causar re-renderizações ou re-crições de funções
  const bucketXRef = useRef<number>(50);
  const gameStateRef = useRef(gameState);
  const highScoreRef = useRef(highScore);

  // Sincroniza refs com estados
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  // Bloqueia scroll do corpo
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Condição de vitória
  useEffect(() => {
    if (score >= 100 && gameState === "playing") {
      setGameState("victory");
    }
  }, [score, gameState]);

  // Gerenciamento de Áudio
  useEffect(() => {
    audioRef.current = new Audio(backgroundMusic);
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (gameState === "playing") {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.log("Interação necessária para tocar áudio:", err));
    } else if (gameState === "victory") {
      audioRef.current.pause();
    }
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setPopcorns([]);
    setCaptureParticles([]);
    bucketXRef.current = 50;
    if (bucketRef.current) {
      bucketRef.current.style.left = "50%";
    }
    setGameState("playing");
  };

  const updateBucketPosition = (clientX: number) => {
    if (gameStateRef.current !== "playing" || !gameAreaRef.current || !bucketRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.max(5, Math.min(95, relativeX));
    
    bucketXRef.current = clampedX;
    bucketRef.current.style.left = `${clampedX}%`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateBucketPosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      updateBucketPosition(e.touches[0].clientX);
    }
  };

  // Spawn de pipocas
  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setPopcorns((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 90 + 5,
          y: -10,
          // Velocidade base ligeiramente maior para compensar a falta de perda
          speed: 0.5 + Math.random() * 0.3 + score * 0.006, 
          size: 24 + Math.random() * 12,
          rotation: Math.random() * 360,
        },
      ]);
    }, 850); // Spawn ligeiramente mais rápido

    return () => clearInterval(interval);
  }, [gameState, score]);

  // Loop de Física Otimizado
  useEffect(() => {
    let animationFrameId: number;

    const updatePhysics = () => {
      // Usa refs para checar estado atual sem depender do closure
      if (gameStateRef.current !== "playing") {
        animationFrameId = requestAnimationFrame(updatePhysics);
        return;
      }

      setPopcorns((prevPopcorns: Popcorn[]) => {
        const updated: Popcorn[] = [];
        let scoreChange = 0;
        const newParticles: HeartParticle[] = [];

        for (const pop of prevPopcorns) {
          const nextY = pop.y + pop.speed;

          // Colisão com o balde
          if (nextY > 84 && nextY < 90) {
            const distance = Math.abs(pop.x - bucketXRef.current);
            if (distance < 10) {
              scoreChange += 2;
              newParticles.push({ id: Date.now() + Math.random(), x: pop.x, y: 78 });
              continue; // Coletada, não adiciona ao array updated
            }
          }

          // Pipoca caiu fora
          if (nextY > 102) {
            scoreChange -= 1; // Perde 1 ponto
            continue; // Caiu, não adiciona ao array updated
          }

          updated.push({ ...pop, y: nextY });
        }

        // Atualiza pontuação e recorde de uma vez
        if (scoreChange !== 0) {
          setScore((s: number) => {
            const newScore = Math.max(0, s + scoreChange); // Garante que não fique negativo
            if (newScore > highScoreRef.current) {
              highScoreRef.current = newScore;
              setHighScore(newScore);
              localStorage.setItem("popcorn_highscore", String(newScore));
            }
            return newScore;
          });
        }

        if (newParticles.length > 0) {
          setCaptureParticles((h) => [...h, ...newParticles]);
        }

        return updated;
      });

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, []); // Roda apenas uma vez no mount para iniciar o loop

  // Limpeza de partículas visual de captura
  useEffect(() => {
    if (captureParticles.length === 0) return;
    const timeout = setTimeout(() => {
      setCaptureParticles((prev) => prev.slice(1));
    }, 800);
    return () => clearTimeout(timeout);
  }, [captureParticles]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#1a0f14",
        backgroundImage: `url("https://i.pinimg.com/1200x/ae/0c/87/ae0c87e4d25fab9ca15fd2b2b87efa95.jpg")`, 
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 9998,
        overflow: "hidden"
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <div 
        className="popgame-container"
        style={{ 
          cursor: gameState === "playing" ? "none" : "default",
          backgroundImage: `url(${backgroundImage})`
        }}
        ref={gameAreaRef}
      >
        <div className="popgame-bg-stripe" />

        <div className="popgame-hud">
          <div className="popgame-hud-card">
            🍿 Pipocas: {score}/100
          </div>
          <div className="popgame-hud-card">🏆 Recorde: {highScore}</div>
        </div>

        <AnimatePresence>
          {gameState === "playing" &&
            popcorns.map((pop) => (
              <div
                key={pop.id}
                className="popgame-popcorn"
                style={{
                  left: `${pop.x}%`,
                  top: `${pop.y}%`,
                  width: `${pop.size}px`,
                  height: `${pop.size}px`,
                  transform: `translate(-50%, -50%) rotate(${pop.rotation}deg)`,
                }}
              />
            ))}
        </AnimatePresence>

        {/* Partículas visuais de captura */}
        <AnimatePresence>
          {captureParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="popgame-heart"
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -80, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ left: `${particle.x}%` }}
            >
              ❤️
            </motion.div>
          ))}
        </AnimatePresence>

        <div
          ref={bucketRef}
          className="popgame-bucket"
          style={{ 
            left: "50%", 
            display: gameState === "playing" ? "block" : "none" 
          }}
        />

        <AnimatePresence>
          {gameState === "start" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="popgame-screen-start"
            >
              <h2 className="popgame-start-title">Piquenique da Pipoca! 🍿</h2>
              <p className="popgame-start-desc">
                Mova o mouse ou deslize o dedo para controlar o balde. Tente coletar 100 pipocas para ajudar a alquimista Violeta! Cuidado: se deixar cair, perde pontos!
              </p>
              <button 
                onClick={startGame} 
                style={{ 
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #ff4d7d 0%, #b65eff 100%)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50px",
                  fontWeight: 800,
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 10px 20px rgba(255, 77, 125, 0.3)"
                }}
              >
                Começar Jogo
              </button>
            </motion.div>
          )}

          {gameState === "victory" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="popgame-screen-victory"
            >
              <h2 className="popgame-victory-title">Parabéns!</h2>
              
              <div className="popgame-letter">
                <p>
                  "Ufa! Muito obrigada por recuperar todas as minhas pipocas mágicas!
                </p>
                <p>
                  Minha sopa de encantamentos acabou vazando um pouquinho de magia para o pote de milhos... Confesso que entrei em desespero quando eles criaram vida e começaram a pular pelo bosque! Graças à sua agilidade com esse balde, o desastre foi evitado.
                </p>
                <p>
                  Por sua bravura e reflexos impressionantes, eu lhe concedo oficialmente o título de <strong>Aprendiz de Alquimista</strong>!"
                </p>
                <span className="popgame-letter-signature">
                  Com gratidão,<br/>Violeta A. 💜
                </span>
              </div>

              <div style={{ display: "flex", gap: "15px", flexDirection: "column", width: "100%", maxWidth: "280px" }}>
                <button 
                  onClick={startGame}
                  style={{ 
                    padding: "14px 28px", 
                    width: "100%",
                    background: "linear-gradient(135deg, #b65eff 0%, #4ade80 100%)",
                    border: "none",
                    color: "#fff",
                    borderRadius: "50px",
                    fontWeight: 800,
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(74, 222, 128, 0.3)"
                  }}
                >
                  Jogar Novamente
                </button>
                {onBackToMenu && (
                  <button 
                    onClick={onBackToMenu}
                    style={{ 
                      padding: "14px 28px", 
                      width: "100%",
                      background: "rgba(0, 0, 0, 0.05)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      color: "#1e1217",
                      borderRadius: "50px",
                      fontWeight: 700,
                      fontSize: "1rem",
                      cursor: "pointer"
                    }}
                  >
                    Voltar ao Menu
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}