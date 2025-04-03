import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/audio";

interface AudioPlayerProps {
  audioUrl: string;
  duration: number; // duration in milliseconds
  onPlay?: () => void;
}

export function AudioPlayer({ audioUrl, duration, onPlay }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Convert duration from ms to seconds
  const durationInSeconds = duration / 1000;

  // Calculate progress percentage
  const progressPercentage = 
    durationInSeconds > 0 ? (currentTime / durationInSeconds) * 100 : 0;

  // Handle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
      if (onPlay) onPlay();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle time update
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
  };

  // Handle click on progress bar
  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    audio.currentTime = percentage * durationInSeconds;
    setCurrentTime(percentage * durationInSeconds);
  };

  // Handle mute toggle
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume / 100;
    } else {
      audio.volume = 0;
    }
    setIsMuted(!isMuted);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    setVolume(newVolume);
    audio.volume = newVolume / 100;
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // Handle audio end
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Set initial volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
  }, [volume]);

  return (
    <div className="bg-gray-100 rounded-md p-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 rounded-full"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <div className="text-sm text-gray-600 font-medium min-w-[70px]">
          {formatDuration(currentTime)} / {formatDuration(durationInSeconds)}
        </div>
        
        <div className="relative ml-auto">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full"
            onClick={toggleMute}
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          {showVolumeSlider && (
            <div 
              className="absolute -left-16 bottom-full p-3 bg-white shadow-md rounded-md z-10"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <div className="h-20 w-5 relative flex items-center justify-center">
                <Slider
                  defaultValue={[volume]}
                  max={100}
                  step={1}
                  orientation="vertical"
                  onValueChange={handleVolumeChange}
                  className="h-full w-3"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div
        className="h-2 bg-gray-300 rounded-full overflow-hidden cursor-pointer relative"
        onClick={handleProgressBarClick}
        ref={progressBarRef}
      >
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}