import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Slider } from "./slider";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  duration: number; // duration in milliseconds
}

export function AudioPlayer({ audioUrl, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create audio element
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.addEventListener('loadeddata', () => {
      setIsLoaded(true);
    });
    
    audio.addEventListener('error', () => {
      setError('Failed to load audio file');
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime * 1000);
    });
    
    // Set initial volume
    audio.volume = volume / 100;
    
    return () => {
      audio.pause();
      audio.src = '';
      
      audio.removeEventListener('loadeddata', () => {});
      audio.removeEventListener('error', () => {});
      audio.removeEventListener('ended', () => {});
      audio.removeEventListener('timeupdate', () => {});
    };
  }, [audioUrl]);

  // Play/Pause control
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        setError('Failed to play audio: ' + err.message);
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  // Volume control
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Format time display (mm:ss)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format duration time
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Audio Visualization (static for now) */}
      <div className="w-48 h-24 mb-4 flex items-end justify-between space-x-1">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className="bg-primary w-1.5 rounded-t"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}
      
      {/* Play/Pause button & progress */}
      <div className="flex items-center space-x-4 mb-6 w-full">
        <Button
          variant="default"
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-md p-0"
          onClick={togglePlayPause}
          disabled={!isLoaded || !!error}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        
        <div className="flex-1">
          <Slider 
            defaultValue={[0]} 
            max={duration} 
            step={10} 
            value={[currentTime]} 
            disabled
            className="cursor-default"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
            <span className="text-xs text-gray-500">{formatDuration(duration)}</span>
          </div>
        </div>
      </div>
      
      {/* Volume control */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Volume2 className="h-4 w-4" />
        <span>Volume</span>
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="w-32"
        />
      </div>
    </div>
  );
}
