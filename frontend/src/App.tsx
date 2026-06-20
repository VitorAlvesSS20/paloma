import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import "./index.css";
import carinhoso from "./assets/carinhoso.mp3";
import Popgame from "./Popgame"; 

interface Milestone {
  chapter: string;
  title: string;
  description: string;
  image: string; 
}

const MILESTONES: Milestone[] = [
  {
    chapter: "Capítulo 1",
    title: "Como tudo começou",
    description:
      "Lembra quando você tava conversando com o João Paulo e eu apareci de repente? Eu queria falar com ele, mas quando percebi, estava conversando mais com você, e então veio nosso primeiro joguinho, o Jenga, um joguinho sobre equilibrio que, de alguma forma, se tornou a metáfora perfeita pro que a gente tem hoje, e reutilizar as bases para construir uma torre mais alta... Enfim, que bom que você apareceu naquele dia, né?",
    image: "https://media.discordapp.net/attachments/1462535091342541005/1516779659696537700/723647c652c3f7eb02830797993a6c2f.jpg?ex=6a33e2a3&is=6a329123&hm=311afd8c18c44fadb73b09a7e2c38c82c53bb2042b286319339d01057082158e&=&format=webp&width=521&height=695", 
  },
  {
    chapter: "Capítulo 2",
    title: "Netflix na biblioteca",
    description:
      "Lembra quando a gente ia pra biblioteca de novo ficar assistindo coisinhas, Em principal o Stranger Things... Praticamente todo dia eu ia pra lá conferir se você estava, as vezes eu chegava tão cedo que ia embora da biblioteca e você aparecia depois, e inclusive, eu só assisti tudo por causa de você, quería ter visto tudo contigo, mas acontece. Enfim, ainda bem que você gosta das mesmas séries que eu, né?",
    image: "https://media.discordapp.net/attachments/1462535091342541005/1516779660095000616/fb72cea909cf79e9e6899ceae0dffb49.jpg?ex=6a33e2a3&is=6a329123&hm=75b18db006c01d71c8ad7c874f1155504775f8c9afc3bc8075e8528ce88a6604&=&format=webp&width=695&height=695", 
  },
  {
    chapter: "Capítulo 3",
    title: "Tempo de qualidade",
    description:
      "Tem casal que vai pra festas, beber... A gente, faz caminhada juntos na BR, ou pelo menos fazia né, foi bom enquanto durou, e certamente foi um forte pilar na nossa  relação, passar um tempinho com você enquanto damos a volta pela cidade quase todo dia só fez eu te amar mais ainda. E em um dia como qualquer outro, você apareceu com aquela Cartinha... decisiva, que iria decidir nosso futuro, e então finalmente eu te pedi em namoro, para concretizar o que a gente estava sentindo, e era tanto que eu nem sabia como reagir, apenas concordava sabendo que teria uma vida feliz ao seu lado.",
    image: "https://media.discordapp.net/attachments/1462535091342541005/1516781946074566867/32b816a3fea967ec72be6a7782353a0c.jpg?ex=6a33e4c4&is=6a329344&hm=e2926be56c4ac8161a6c7898b094263a487d469eccf3a1f6d67f4ff925efe2d9&=&format=webp&width=538&height=825", 
  },
  {
    chapter: "Capítulo 4",
    title: "Filminho",
    description:
      "Trazendo agora para os dias de hoje, ignorando os 'nadas', não há lugar melhor para se estar do que com você na caminha com espaço quase suficiente para nós dois, assistindo alguma coisa no notebook enquanto come, geralmente pipoca, ou salgado, é o refúgio após um dia cansativo de trabalho.",
    image: "https://media.discordapp.net/attachments/1462535091342541005/1516784643347583136/8f215943-c445-42bb-8967-07b9c4fea6b4.jpg?ex=6a33e747&is=6a3295c7&hm=cc38ff58c9ac1b30fbad6860520eee77dc3c76679991f8832e88c04c3b8db0cf&=&format=webp&width=901&height=825", 
  },
];

const MESSAGES: string[] = [
  "Você é o motivo dos meus dias melhores. 💜",
  "Cada maratona de filminho com você é, sem exagero, um dos meus momentos favoritos da semana.",
  "Eu escolheria você de novo, incondicionalmente, em qualquer universo.",
  "Te amo. Sem fórmula, sem medida, sem pressa.",
  "Segurar a sua mão faz qualquer lugar do mundo parecer o lugar certo pra estar. 🪐",
  "Obrigado por ser minha parceria de piadas bobas, de conversas sérias e de finais de tarde inteiros sem fazer nada.",
];

function useReveal(): Variants {
  const reduceMotion = useReducedMotion();
  return {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 36 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.01 : 0.85, ease: [0.22, 1, 0.36, 1] },
    },
  };
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

function FloatingParticles() {
  const reduceMotion = useReducedMotion();
  const particles = useMemo<Particle[]>(() => {
    if (reduceMotion) return [];
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 12,
      size: 3 + Math.random() * 5,
    }));
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div className="particles" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="particle"
          style={{ left: `${p.left}%`, width: p.size, height: p.size }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

interface FallingHeartType {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

function FallingHearts() {
  const reduceMotion = useReducedMotion();
  const hearts = useMemo<FallingHeartType[]>(() => {
    if (reduceMotion) return [];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 8,
      size: 14 + Math.random() * 14,
    }));
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }} aria-hidden="true">
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          style={{
            position: "absolute",
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
          }}
          initial={{ y: "-10vh", opacity: 0 }}
          animate={{ y: "110vh", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ❤️
        </motion.span>
      ))}
    </div>
  );
}

function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(carinhoso);
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      toast("Música pausada", { icon: "⏸️" });
    } else {
      audioRef.current.play().catch(() => {
        toast.error("Clique novamente para reproduzir o áudio.");
      });
      setIsPlaying(true);
      toast("Tocando nossa música... 🎵", { icon: "❤️" });
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 50 }}>
      <button
        type="button"
        className="btn btn-primary"
        onClick={togglePlayback}
        style={{
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 20px"
        }}
      >
        <span>{isPlaying ? "⏸️ Pausar" : "▶️ Ouvir Música"}</span>
      </button>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

function TimeCounter() {
  const reveal = useReveal();
  const [timeMet, setTimeMet] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [timeDating, setTimeDating] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const dateMet = new Date("2025-09-17T00:00:00").getTime();
    const dateDating = new Date("2025-12-30T00:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();

      const diffMet = now - dateMet;
      const diffDating = now - dateDating;

      const calcTime = (diff: number) => {
        if (diff < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        };
      };

      setTimeMet(calcTime(diffMet));
      setTimeDating(calcTime(diffDating));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section 
      className="section universe-section" 
      style={{ marginTop: "40px", marginBottom: "40px" }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={reveal}
    >
      <div className="universe-content" style={{ textAlign: "center" }}>
        <Eyebrow>Nosso Tempo</Eyebrow>
        <h2 className="section-title" style={{ marginBottom: "20px" }}>Contando Cada Segundo</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "30px", marginTop: "20px" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", color: "var(--color-primary-dark)", marginBottom: "10px", fontWeight: 600 }}>
              Desde que nos conhecemos (17/09/2025):
            </h3>
            <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
              {Object.entries(timeMet).map(([unit, value]) => (
                <div key={unit} style={{ background: "rgba(255,255,255,0.6)", padding: "10px 18px", borderRadius: "12px", border: "var(--candy-border)", minWidth: "70px" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>{value}</div>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 500 }}>
                    {unit === "days" ? "Dias" : unit === "hours" ? "Horas" : unit === "minutes" ? "Min" : "Seg"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "1.15rem", color: "var(--color-primary-dark)", marginBottom: "10px", fontWeight: 600 }}>
              Desde o início do nosso namoro (30/12/2025):
            </h3>
            <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
              {Object.entries(timeDating).map(([unit, value]) => (
                <div key={unit} style={{ background: "rgba(255,255,255,0.6)", padding: "10px 18px", borderRadius: "12px", border: "var(--candy-border)", minWidth: "70px" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>{value}</div>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 500 }}>
                    {unit === "days" ? "Dias" : unit === "hours" ? "Horas" : unit === "minutes" ? "Min" : "Seg"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function HeroSection() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -60]);

  const letters = "NOSSA HISTÓRIA".split("");

  return (
    <header className="hero">
      <FloatingParticles />
      <motion.div
        className="hero-content"
        style={reduceMotion ? undefined : { opacity: heroOpacity, y: heroY }}
      >
        <motion.p
          className="hero-eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          Para Paloma — hoje e sempre
        </motion.p>

        <h1 className="hero-title" aria-label="Nossa História">
          {letters.map((char, i) => (
            <motion.span
              key={i}
              className="hero-letter"
              initial={{ opacity: 0, y: 40, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{
                delay: 0.4 + i * 0.035,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="hero-name"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          Momozi
        </motion.p>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 1 }}
        >
          Paloma, esse site é só seu. Construído com a mesma intensidade com
          que eu te amo.
        </motion.p>

        <motion.div
          className="scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
        >
          <span className="scroll-cue-line" />
          <img 
            src="https://media.discordapp.net/attachments/1462535091342541005/1516786084573614120/491843294_669239965969130_2342993592363884947_n.png?ex=6a33e89f&is=6a32971f&hm=6a46464b86b2d5a559edfe59d740ce3b3f5429155822cdaf2074f3b88015f9dd&=&format=webp&quality=lossless&width=800&height=800" 
            alt="Foto P" 
          />
        </motion.div>
      </motion.div>
    </header>
  );
}

function LetterSection() {
  const reveal = useReveal();
  return (
    <motion.section
      className="section letter-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={reveal}
    >
      <Eyebrow>Carta</Eyebrow>
      <h2 className="section-title">Uma carta para Momozi</h2>
      <div className="letter-body">
        <p>
          Tem gente que comemora aniversário. Eu prefiro comemorar você,
          todos os dias.
        </p>
        <p>
          Você é a pessoa que transformou tarde de caminha e maratona de
          desenho animado em um dos meus lugares favoritos do mundo. É a
          risada fácil, a teimosia linda, o jeito intenso de amar que você
          tem que me anima.
        </p>
        <p>
          Digo e repito, que sou um rapaz de bastante sorte por ter encontrado você, por ter pedido para sentar ao seu lado, ter procurado sua fotinha no whatsapp dentre centenas, ter ido atrás de você pelo IFCE, ter te chamado para assistir série, e ter dado a Hello Kitty para você, não sei se te contei tudo, mas quando comprei a Hello Kitty, era apenas pensando em algo que eu gostaria de dar a alguém, na época a gente não se conhecia tanto então não tinha ninguem em mente, até que eu senti que queria dar ela a você, e abri aquela porta onde você estava tocando teclado, te ver sorrindo daquele jeito me conquistou para que eu quisesse vê-la assim mais vezes.
        </p>
        <p className="letter-signoff">
          Com amor, Eu. 
        </p>
      </div>
    </motion.section>
  );
}

function BibleVerseSection() {
  const reveal = useReveal();
  return (
    <motion.section
      className="section bible-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={reveal}
      style={{ textAlign: "center", paddingBottom: "40px" }}
    >
      <div className="bible-verse">
        <p>
          "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha. Não maltrata, não procura seus interesses, não se ira facilmente, não guarda rancor. O amor não se alegra com a injustiça, mas se alegra com a verdade. Tudo sofre, tudo crê, tudo espera, tudo suporta."
        </p>
        <span className="verse-citation">
          1 Coríntios 13:4-7
        </span>
      </div>
    </motion.section>
  );
}

function ChaosBlobs() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="blobs" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`blob blob-${i}`}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 18, -12, 0],
                  y: [0, -14, 10, 0],
                }
          }
          transition={{
            duration: 14 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function UniverseSection() {
  const reveal = useReveal();

  return (
    <motion.section
      className="section universe-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={reveal}
    >
      <ChaosBlobs />
      <div className="universe-content">
        <Eyebrow>Universo</Eyebrow>
        <h2 className="section-title">
          Gumball
        </h2>
        <p className="universe-text">
          Um dos símbolos da nossa relação é um gatinho azul e um peixe laranja com pernas que só fazem maluquice. Foi o primeiro presente que você me deu, no dia que a gente foi tomar sorvete na praça, e de forma alguma foi algo pequeno, na verdade o maior dos presentes. O Gumball surge quando a gente quer ver algo juntos mas não temos muito tempo, por sorte os episódios são curtos o bastante para preencher os tempos de espera e impedir a gente de se despedir tão cedo.
        </p>
      </div>
    </motion.section>
  );
}

function Vinyl() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="vinyl"
      animate={reduceMotion ? undefined : { rotate: 360 }}
      transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      <div className="vinyl-grooves" />
      <div className="vinyl-label">
        <span>♪ Carinhoso</span>
      </div>
    </motion.div>
  );
}

function MusicSection() {
  const reveal = useReveal();
  return (
    <motion.section
      className="section music-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={reveal}
    >
      <div className="music-grid">
        <Vinyl />
        <div>
          <Eyebrow>Trilha sonora</Eyebrow>
          <h2 className="section-title">A canção que é a nossa</h2>
          <p>
            Muitos casais tem uma musica própria, eu acho, uma música tema, e aparentemente a nossa é essa que está tocando (se você tiver clicado no botão de ouvir música). A primeira vez que ouvi ela, eu estava com muita coisa na cabeça, e as emoções acabaram abafando a voz da cantora, e eu nem entendi quase nada da primeira vez... Quando a gente se despediu, que eu voltou para casa ouvindo a música, e prestei mais atenção na Letra, eu até me arrepiei, e passei a noite toda ouvindo e com um sorriso que só sumiu quando dormi. Que achado.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

function TimelineSection() {
  const reveal = useReveal();
  return (
    <section className="section timeline-section">
      <Eyebrow>Nossa história</Eyebrow>
      <h2 className="section-title">Quatro capítulos (de muitos)</h2>

      <div className="timeline">
        {MILESTONES.map((m, i) => (
          <motion.div
            key={m.title}
            className={`timeline-item ${i % 2 === 1 ? "reverse" : ""}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={reveal}
          >
            <div className="photo-placeholder" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img 
                src={m.image} 
                alt={m.title} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </div>
            <div className="timeline-text">
              <span className="timeline-chapter">{m.chapter}</span>
              <h3>{m.title}</h3>
              <p>{m.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

interface Heart {
  id: number;
  left: number;
  delay: number;
}

function LovePhrasesSection() {
  const reveal = useReveal();
  const [clicks, setClicks] = useState(0);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const reduceMotion = useReducedMotion();

  const spawnHearts = useCallback(() => {
    if (reduceMotion) return;
    const newHearts: Heart[] = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      left: 30 + Math.random() * 40,
      delay: Math.random() * 0.4,
    }));
    setHearts(newHearts);
    window.setTimeout(() => setHearts([]), 2200);
  }, [reduceMotion]);

  const handleMessageClick = useCallback(() => {
    const index = clicks % MESSAGES.length;
    toast(MESSAGES[index]);

    const nextCount = clicks + 1;
    setClicks(nextCount);

    if (nextCount % MESSAGES.length === 0) {
      toast.success(
        `Já se foram ${nextCount} mimos em texto — e meu amor por você continua crescendo.`,
        { duration: 5000 }
      );
      spawnHearts();
    }
  }, [clicks, spawnHearts]);

  return (
    <motion.section
      className="section surprise-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={reveal}
    >
      <Eyebrow>Pequenos mimos</Eyebrow>
      <h2 className="section-title">Lembretes para o seu coração</h2>
      <p className="surprise-text">
        Clica aí embaixo quantas vezes quiser. Eu espalhei várias frases e lembretes 
        sobre o quanto você é incrível e especial pra mim bem dentro desse botão.
      </p>
      <div className="surprise-button-wrap">
        <button type="button" className="btn btn-primary" onClick={handleMessageClick}>
          Ler uma frase carinhosa
        </button>
        <div className="burst" aria-hidden="true">
          {hearts.map((h) => (
            <motion.span
              key={h.id}
              className="burst-heart"
              style={{ left: `${h.left}%` }}
              initial={{ y: 0, opacity: 0, scale: 0.6 }}
              animate={{ y: -150, opacity: [0, 1, 1, 0], scale: 1 }}
              transition={{ duration: 1.8, delay: h.delay, ease: "easeOut" }}
            >
              💜
            </motion.span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function FooterSection() {
  const reveal = useReveal();
  return (
    <motion.footer
      className="section footer-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={reveal}
    >
      <p className="footer-line">
        De Vito momozi
      </p>
      <p className="footer-signature">Para Paloma, hoje e sempre. 💜</p>
    </motion.footer>
  );
}

export default function BirthdayPage() {
  const [view, setView] = useState<"landing" | "game">("landing");

  if (view === "game") {
    return (
      <div className="app" style={{ padding: "20px 10px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto 15px auto", textAlign: "left" }}>
          <button 
            onClick={() => setView("landing")} 
            className="btn"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              color: "var(--color-text, #1e1217)",
              padding: "8px 16px",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            ⬅ Voltar para Nossa História
          </button>
        </div>
        <Popgame />
      </div>
    );
  }

  return (
    <div className="app">
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4200,
          style: {
            background: "#2a0f1a",
            color: "#f1dcab",
            border: "1px solid #d8b46a",
            fontFamily: "'Sora', sans-serif",
            fontSize: "0.95rem",
            padding: "12px 18px",
            borderRadius: "10px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
          },
          success: { iconTheme: { primary: "#d8b46a", secondary: "#2a0f1a" } },
        }}
      />
      <FallingHearts />
      <BackgroundMusic />
      <HeroSection />
      <TimeCounter />
      <LetterSection />
      <BibleVerseSection />
      <UniverseSection />
      <MusicSection />
      <TimelineSection />
      <LovePhrasesSection />

      <div style={{ textAlign: "center", margin: "10px 0 50px 0", position: "relative", zIndex: 99 }}>
        <button 
          onClick={() => setView("game")} 
          className="btn btn-primary"
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "10px", 
            padding: "16px 32px",
            fontSize: "1.1rem",
            cursor: "pointer"
          }}
        >
          <span>Coletar Pipoca com a Momozi</span>
          <span style={{ fontSize: "1.3rem" }}>🍿</span>
        </button>
      </div>

      <FooterSection />
    </div>
  );
}