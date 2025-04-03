import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, AlertCircle, Volume2 } from "lucide-react";

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

  // Generate a more varied waveform with smaller bars in the middle
  const generateBars = () => {
    return Array.from({ length: 30 }, (_, i) => {
      // Create a pattern that's fuller on the edges and thinner in the middle
      const position = i / 30;
      const distanceFromCenter = Math.abs(position - 0.5) * 2; // 0 at center, 1 at edges
      const baseHeight = 30 + distanceFromCenter * 40; // Higher at edges
      return baseHeight + Math.random() * 30; // Add randomness
    });
  };

  const bars = generateBars();

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    const handleLoaded = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
      setError(null);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleError = () => {
      setError("Could not load audio. Please try again.");
      setIsLoaded(false);
      setIsPlaying(false);
    };
    
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    
    // Clean up function
    return () => {
      audio.pause();
      audio.src = "";
      
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
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
      <div className="w-full bg-hyfe-lightgrey bg-opacity-30 p-4 rounded-xl mb-6">
        {/* Sound wave visualization */}
        <div className="w-full h-24 mb-4 flex items-end justify-between gap-[2px]">
          {bars.map((height, i) => {
            // Create dynamic effects based on playback position
            const isActive = (i / bars.length) * 100 <= progress;
            const animationOffset = Math.sin((i / 4) + (currentTime * 4)) * 8;
            const dynamicHeight = isPlaying 
              ? height + (isActive ? animationOffset : 0) 
              : height;
              
            return (
              <div 
                key={i} 
                className={`rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary' 
                    : isPlaying 
                      ? 'bg-hyfe-grey' 
                      : 'bg-hyfe-grey bg-opacity-60'
                }`}
                style={{ 
                  height: `${dynamicHeight}%`,
                  width: `${100 / bars.length - 0.3}%`,
                  opacity: isActive ? 1 : isPlaying ? 0.7 : 0.5,
                  transform: isPlaying && isActive ? `scaleY(${1 + Math.sin(i + currentTime*5) * 0.1})` : 'none',
                }}
              />
            );
          })}
        </div>
        
        {/* Loading/error states */}
        {!isLoaded && !error && (
          <div className="text-center text-hyfe-grey text-sm absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
            Loading audio...
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-sm mb-4 flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Playback controls */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-sm">
              <div
                className="h-full bg-primary rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-secondary-medium w-full mt-2">
              <span className="font-medium">{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="ml-4">
            <Button
              onClick={togglePlay}
              disabled={disabled || !isLoaded || !!error}
              className="bg-primary hover:bg-primary-hover text-secondary w-12 h-12 rounded-full flex items-center justify-center shadow-md ml-2"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center text-xs text-secondary gap-2">
        <Volume2 className="w-4 h-4 text-hyfe-grey" />
        <span>Make sure your volume is turned up</span>
      </div>
    </div>
  );
};

export default AudioPlayer;
