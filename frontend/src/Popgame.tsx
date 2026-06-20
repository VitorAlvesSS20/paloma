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

interface Heart {
  id: number;
  x: number;
  y: number;
}

interface PopgameProps {
  onBackToMenu?: () => void;
}

export default function Popgame({ onBackToMenu }: PopgameProps) {
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover" | "victory">("start");
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem("popcorn_highscore")) || 0;
  });
  const [popcorns, setPopcorns] = useState<Popcorn[]>([]);
  const [hearts, setHearts] = useState<Heart[]>([]);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const bucketRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const bucketXRef = useRef<number>(50);
  const stateRef = useRef({ gameState, score, lives });

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    stateRef.current = { gameState, score, lives };
  }, [gameState, score, lives]);

  useEffect(() => {
    if (score >= 100 && gameState === "playing") {
      setGameState("victory");
    }
  }, [score, gameState]);

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
    } else if (gameState === "gameover" || gameState === "victory") {
      audioRef.current.pause();
    }
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setPopcorns([]);
    setHearts([]);
    bucketXRef.current = 50;
    if (bucketRef.current) {
      bucketRef.current.style.left = "50%";
    }
    setGameState("playing");
  };

  const updateBucketPosition = (clientX: number) => {
    if (stateRef.current.gameState !== "playing" || !gameAreaRef.current || !bucketRef.current) return;
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

  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setPopcorns((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 90 + 5,
          y: -10,
          speed: 0.4 + Math.random() * 0.25 + stateRef.current.score * 0.005, 
          size: 24 + Math.random() * 12,
          rotation: Math.random() * 360,
        },
      ]);
    }, 950);

    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;

    let animationFrameId: number;

    const updatePhysics = () => {
      if (stateRef.current.gameState !== "playing") return;

      setPopcorns((prevPopcorns: Popcorn[]) => {
        const updated: Popcorn[] = [];

        for (const pop of prevPopcorns) {
          const nextY = pop.y + pop.speed;

          if (nextY > 84 && nextY < 90) {
            const distance = Math.abs(pop.x - bucketXRef.current);
            if (distance < 10) {
              setScore((s: number) => {
                // Aqui a pontuação passa a aumentar de 2 em 2
                const newScore = s + 2; 
                if (newScore > highScore) {
                  setHighScore(newScore);
                  localStorage.setItem("popcorn_highscore", String(newScore));
                }
                return newScore;
              });

              setHearts((h: Heart[]) => [...h, { id: Date.now() + Math.random(), x: pop.x, y: 78 }]);
              continue;
            }
          }

          if (nextY > 102) {
            setLives((currentLives) => {
              const remainingLives = currentLives - 1;
              if (remainingLives <= 0) {
                setTimeout(() => setGameState("gameover"), 0);
              }
              return remainingLives;
            });
            continue;
          }

          updated.push({ ...pop, y: nextY });
        }

        return updated;
      });

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, highScore]);

  useEffect(() => {
    if (hearts.length === 0) return;
    const timeout = setTimeout(() => {
      setHearts((prev: Heart[]) => prev.slice(1));
    }, 800);
    return () => clearTimeout(timeout);
  }, [hearts]);

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
          <div className="popgame-hud-card" style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <span>🍿 Pipocas: {score}/100</span>
            <span style={{ letterSpacing: "2px" }}>
              {"❤️".repeat(Math.max(0, lives))}{"🖤".repeat(Math.max(0, 3 - lives))}
            </span>
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

        <AnimatePresence>
          {hearts.map((heart) => (
            <motion.div
              key={heart.id}
              className="popgame-heart"
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -80, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ left: `${heart.x}%` }}
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
                Mova o mouse ou deslize o dedo para controlar o balde. Você tem 3 corações, tente coletar 100 pipocas para ajudar a alquimista Violeta!
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

          {gameState === "gameover" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="popgame-screen-gameover"
            >
              <span className="popgame-gameover-icon">💔</span>
              <h2 className="popgame-gameover-title">Fim de Jogo!</h2>
              <p className="popgame-gameover-desc">
                As vidas acabaram e algumas pipocas mágicas escaparam. Você coletou {score} pipocas!
              </p>
              <div style={{ display: "flex", gap: "15px", flexDirection: "column", width: "100%", maxWidth: "280px" }}>
                <button 
                  onClick={startGame}
                  style={{ 
                    padding: "14px 28px", 
                    width: "100%",
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
                  Tentar Novamente
                </button>
                {onBackToMenu && (
                  <button 
                    onClick={onBackToMenu}
                    style={{ 
                      padding: "14px 28px", 
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "#fff",
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