import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  disabled?: boolean;
}

const AudioPlayer = ({ audioUrl, disabled = false }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Visualization bars (static for demo purposes)
  const bars = Array.from({ length: 16 }, () => Math.random() * 70 + 30);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    });
    
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
    
    audio.addEventListener("error", () => {
      setError("Failed to load audio file");
      setIsLoaded(false);
    });
    
    return () => {
      audio.pause();
      audio.src = "";
      
      audio.removeEventListener("loadedmetadata", () => {});
      audio.removeEventListener("timeupdate", () => {});
      audio.removeEventListener("ended", () => {});
      audio.removeEventListener("error", () => {});
    };
  }, [audioUrl]);
  
  const togglePlay = () => {
    if (!audioRef.current || !isLoaded) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        setError('Failed to play audio: ' + err.message);
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const progress = duration ? (currentTime / duration) * 100 : 0;
  
  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto mb-6">
      {/* Sound wave visualization */}
      <div className="w-full h-24 mb-4 flex items-end justify-between">
        {bars.map((height, i) => (
          <div 
            key={i} 
            className={`w-1.5 rounded-t transition-all duration-300 ${
              isPlaying ? 'bg-primary' : 'bg-hyfe-grey'
            }`}
            style={{ 
              height: `${isPlaying ? height + Math.sin(i/3 + currentTime*3) * 15 : height}%`,
              opacity: isPlaying ? 1 : 0.5 
            }}
          />
        ))}
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}
      
      <div className="flex justify-center mb-4">
        <Button
          onClick={togglePlay}
          disabled={disabled || !isLoaded || !!error}
          className="bg-primary hover:bg-primary-hover text-secondary w-14 h-14 rounded-full flex items-center justify-center shadow-md"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>
      </div>
      
      <div className="w-full h-2 bg-hyfe-lightgrey rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-secondary-medium w-full mt-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioPlayer;
