import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import carinhoso from "./assets/carinhoso.mp3";
import running from "./assets/running.mp3";
import senhorvenha from "./assets/senhorvenha.mp3";
import roi from "./assets/roi.mp3";
import meianoite from "./assets/meianoite.mp3";
import melevapracasa from "./assets/melevapracasa.mp3";
import risesthemoon from "./assets/risesthemoon.mp3";
import ninguemexplicadeus from "./assets/ninguemexplicadeus.mp3";
import naohanada from "./assets/naohanada.mp3";
import inbox from "./assets/inbox.mp3";
import avistadaqui from "./assets/avistadaqui.mp3";

import "./Playlist.css";

interface Track {
  id: number;
  title: string;
  artist: string;
  src: string;
  coverGradient: string;
}

const TRACKS: Track[] = [
  { id: 1, title: "Carinhoso", artist: "Nossa Música", src: carinhoso, coverGradient: "linear-gradient(135deg, #ea1d5d 0%, #631233 100%)" },
  { id: 2, title: "Running Up That Hill", artist: "Trilha Sonora", src: running, coverGradient: "linear-gradient(135deg, #b65eff 0%, #2a0f1a 100%)" },
  { id: 3, title: "Até que o Senhor Venha", artist: "Trilha Sonora", src: senhorvenha, coverGradient: "linear-gradient(135deg, #d8b46a 0%, #4a3718 100%)" },
  { id: 4, title: "Roi", artist: "Trilha Sonora", src: roi, coverGradient: "linear-gradient(135deg, #3b82f6 0%, #1d3557 100%)" },
  { id: 5, title: "Meia Noite", artist: "Trilha Sonora", src: meianoite, coverGradient: "linear-gradient(135deg, #475569 0%, #0f172a 100%)" },
  { id: 6, title: "Me Leva Pra Casa", artist: "Trilha Sonora", src: melevapracasa, coverGradient: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)" },
  { id: 7, title: "Rises the Moon", artist: "Trilha Sonora", src: risesthemoon, coverGradient: "linear-gradient(135deg, #f59e0b 0%, #7c2d12 100%)" },
  { id: 8, title: "Ninguém Explica Deus", artist: "Trilha Sonora", src: ninguemexplicadeus, coverGradient: "linear-gradient(135deg, #a855f7 0%, #4c1d95 100%)" },
  { id: 9, title: "Não há nada que o teu Amor não possa", artist: "Trilha Sonora", src: naohanada, coverGradient: "linear-gradient(135deg, #f43f5e 0%, #881337 100%)" },
  { id: 10, title: "Inbox", artist: "Trilha Sonora", src: inbox, coverGradient: "linear-gradient(135deg, #14b8a6 0%, #115e59 100%)" },
  { id: 11, title: "A Vista Daqui", artist: "Trilha Sonora", src: avistadaqui, coverGradient: "linear-gradient(135deg, #06b6d4 0%, #164e63 100%)" },
];

const COFFEE_THOUGHTS = [
  "O amor é como uma boa xícara de café: quente, profundo e reconfortante.",
  "Músicas calmas, mentes tranquilas e um aroma suave no ar.",
  "Que a sua caminhada seja leve e cheia de pausas para saborear o que importa.",
  "Cada nota musical carrega um pedacinho de uma boa memória que vive em nós.",
];

const formatTime = (time: number) => {
  if (isNaN(time) || time < 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

interface TrackItemProps {
  track: Track;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: (track: Track) => void;
}

const TrackItem = memo(({ track, isSelected, isPlaying, onSelect }: TrackItemProps) => {
  return (
    <div 
      className={`track-item ${isSelected ? "active" : ""}`}
      onClick={() => onSelect(track)}
    >
      <div className="track-cover-wrapper" style={{ background: track.coverGradient }}>
        {isSelected && isPlaying && (
          <div className="premium-equalizer">
            <span className="eq-bar"></span>
            <span className="eq-bar"></span>
            <span className="eq-bar"></span>
          </div>
        )}
      </div>
      
      <div className="track-item-info">
        <div className="track-item-header">
          <span className="track-item-title">{track.title}</span>
        </div>
        <div className="track-item-artist">{track.artist}</div>
      </div>
    </div>
  );
});

TrackItem.displayName = "TrackItem";

interface PlaylistProps {
  onBack: () => void;
}

export default function Playlist({ onBack }: PlaylistProps) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [thoughtIndex, setThoughtIndex] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  const timeCurrentRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handleNext = useCallback(() => {
    setCurrentTrack((prev) => {
      if (!prev) return null;
      const currentIndex = TRACKS.findIndex(t => t.id === prev.id);
      if (currentIndex !== -1 && currentIndex < TRACKS.length - 1) {
        return TRACKS[currentIndex + 1];
      }
      return TRACKS[0];
    });
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentTrack((prev) => {
      if (!prev) return null;
      const currentIndex = TRACKS.findIndex(t => t.id === prev.id);
      if (currentIndex > 0) {
        return TRACKS[currentIndex - 1];
      }
      return TRACKS[TRACKS.length - 1];
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!currentTrack || !audio) return;

    audio.pause();
    audio.src = currentTrack.src;
    audio.load();
    audio.volume = volume;

    setThoughtIndex(Math.floor(Math.random() * COFFEE_THOUGHTS.length));
    setDuration(0);
    if (sliderRef.current) sliderRef.current.value = "0";
    if (timeCurrentRef.current) timeCurrentRef.current.innerText = "0:00";

    const updateProgress = () => {
      if (sliderRef.current) sliderRef.current.value = String(audio.currentTime);
      if (timeCurrentRef.current) timeCurrentRef.current.innerText = formatTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleNext);

    audio.play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.log("Erro de reprodução contido:", err));

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleNext);
    };
  }, [currentTrack, handleNext]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, currentTrack]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      if (timeCurrentRef.current) timeCurrentRef.current.innerText = formatTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const handleSelectTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
  }, []);

  return (
    <div className="playlist-container">
      <div className="playlist-nav">
        <button onClick={onBack} className="btn-playlist-back">
          <span className="nav-arrow"></span> Voltar para a História
        </button>
      </div>

      <header className="playlist-header">
        <h1 className="playlist-title">Nossa Playlist</h1>
        <p className="playlist-subtitle">Escolha uma música para tocar de fundo e aproveite o momento.</p>
      </header>

      <div className="playlist-content">
        <div className="playlist-menu">
          <div className="tracks-list">
            {TRACKS.map((track) => (
              <TrackItem
                key={track.id}
                track={track}
                isSelected={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                onSelect={handleSelectTrack}
              />
            ))}
          </div>
        </div>

        <div className="playlist-player-zone">
          <AnimatePresence mode="wait">
            {currentTrack ? (
              <motion.div 
                key={currentTrack.id}
                className="playlist-player-card"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="disc-wrapper">
                  <div className={`music-disc ${isPlaying ? "playing" : ""}`}>
                    <div className="disc-center" style={{ background: currentTrack.coverGradient }}>
                      <div className="disc-center-core"></div>
                    </div>
                  </div>
                </div>

                <div className="player-info">
                  <h3>{currentTrack.title}</h3>
                  <p>{currentTrack.artist}</p>
                </div>

                <div className="playlist-progress-wrapper">
                  <span ref={timeCurrentRef} className="time-indicator">0:00</span>
                  <input 
                    ref={sliderRef}
                    type="range"
                    min={0}
                    max={duration || 0}
                    defaultValue={0}
                    onChange={handleProgressChange}
                    className="playlist-slider progress-slider"
                  />
                  <span className="time-indicator">{formatTime(duration)}</span>
                </div>

                <div className="playlist-volume-wrapper">
                  <span className="volume-icon-visual"></span>
                  <input 
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="playlist-slider volume-slider"
                  />
                </div>

                <div className="player-controls">
                  <button onClick={handlePrev} className="btn-player-skip">⏮</button>
                  <button onClick={togglePlay} className="btn-playlist-play">
                    {isPlaying ? "Pausar" : "Tocar"}
                  </button>
                  <button onClick={handleNext} className="btn-player-skip">⏭</button>
                </div>

                <div className="player-thought-box">
                  <p>"{COFFEE_THOUGHTS[thoughtIndex]}"</p>
                </div>
              </motion.div>
            ) : (
              <div className="playlist-player-empty">
                <div className="empty-state-art">
                  <span className="art-line"></span>
                  <span className="art-line"></span>
                  <span className="art-line"></span>
                </div>
                <p>Selecione uma faixa ao lado para iniciar o player.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="coffee-separator">
        <div className="separator-icon"></div>
      </div>

      <footer className="playlist-footer-bible">
        <p className="bible-verse">
          "Habite ricamente em vocês a palavra de Cristo; instruam e aconselhem-se mutuamente em toda a sabedoria, louvando a Deus com salmos, hinos e cânticos espirituais, com gratidão no coração."
        </p>
        <span className="bible-reference">Colossenses 3:16</span>
      </footer>
    </div>
  );
}