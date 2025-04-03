import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AudioSnippetWithStats } from "@shared/schema";
import AudioPlayer from "@/components/AudioPlayer";
import ResponseOption from "@/components/ResponseOption";
import ProgressIndicator from "@/components/ProgressIndicator";
import FeedbackModal from "@/components/FeedbackModal";
import { feedbackMessages } from "@shared/schema";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";
import { HyfeLogo } from "@/components/ui/hyfe-logo";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";

interface EvaluationProps {
  sessionId: string;
}

interface EvaluationData {
  participant: {
    id: number;
    sessionId: string;
    sessionName?: string;
  };
  audioSnippets: (AudioSnippetWithStats & { hasResponded: boolean })[];
}

const Evaluation = ({ sessionId }: EvaluationProps) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  // Add a key to force AudioPlayer remounting when audio changes
  const [audioPlayerKey, setAudioPlayerKey] = useState<number>(0);
  const [feedbackStats, setFeedbackStats] = useState<{
    coughPercentage: number;
    throatClearPercentage: number;
    otherPercentage: number;
    message: string;
  } | null>(null);

  // Get evaluation data (participant info and audio snippets)
  const { data, isLoading, error } = useQuery<EvaluationData>({
    queryKey: [`/api/evaluation/${sessionId}`],
    retry: false,
  });

  // Submit response mutation
  const responseMutation = useMutation({
    mutationFn: async ({
      audioSnippetId,
      selectedOption,
    }: {
      audioSnippetId: number;
      selectedOption: string;
    }) => {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          participantId: data?.participant.id,
          audioSnippetId,
          selectedOption,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error submitting response");
      }

      return res.json();
    },
    onSuccess: (responseData) => {
      // Get a random feedback message
      const randomMessage = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
      
      setFeedbackStats({
        coughPercentage: responseData.stats.coughPercentage,
        throatClearPercentage: responseData.stats.throatClearPercentage,
        otherPercentage: responseData.stats.otherPercentage,
        message: randomMessage,
      });
      
      setShowFeedback(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Redirect to error page if no valid session ID
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Invalid session or QR code",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [error, setLocation, toast]);

  // Prevent invalid access
  if (isLoading) {
    return (
      <HexagonPattern className="min-h-screen flex flex-col items-center justify-center p-6">
        <HyfeLogo size="large" className="mb-8" />
        <Spinner size="lg" className="text-primary" />
        <p className="mt-6 text-secondary-medium">Loading audio samples...</p>
      </HexagonPattern>
    );
  }

  if (!data || !data.audioSnippets || data.audioSnippets.length === 0) {
    return (
      <HexagonPattern className="min-h-screen flex flex-col items-center justify-center p-6">
        <HyfeLogo size="large" className="mb-8" />
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-semibold mb-2 text-secondary">No Audio Available</h1>
          <p className="text-secondary-medium mb-6">
            There are no audio samples available for evaluation at this time.
          </p>
          <p className="text-hyfe-grey text-sm">
            Please contact the conference organizer or try again later.
          </p>
        </div>
      </HexagonPattern>
    );
  }

  const currentAudio = data.audioSnippets[currentAudioIndex];
  const completedCount = data.audioSnippets.filter(a => a.hasResponded).length;
  const totalCount = data.audioSnippets.length;

  const handleOptionSelect = (option: string) => {
    responseMutation.mutate({
      audioSnippetId: currentAudio.id,
      selectedOption: option,
    });
  };

  const handleNextAudio = () => {
    setShowFeedback(false);
    
    if (currentAudioIndex < data.audioSnippets.length - 1) {
      // Increment the key to force a remount of the AudioPlayer component
      setAudioPlayerKey(prev => prev + 1);
      setCurrentAudioIndex(currentAudioIndex + 1);
    } else {
      // All done, go to thank you page
      setLocation("/thank-you");
    }
  };

  return (
    <HexagonPattern className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-center">
        <HyfeLogo size="medium" />
      </header>

      {/* Main content */}
      <div className="flex-grow flex flex-col p-4">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-4 max-w-md mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary">
              Audio Snippet <span className="text-primary">{currentAudioIndex + 1}</span>/{totalCount}
            </h2>
          </div>

          {/* Force a remount of the AudioPlayer when the audio changes */}
          <AudioPlayer
            key={audioPlayerKey}
            audioUrl={`/api/uploads/${currentAudio.filename}`}
            disabled={responseMutation.isPending}
          />

          <div className="text-center text-secondary-medium my-6">
            Choose what you think this audio represents:
          </div>

          <div className="grid grid-cols-1 gap-4">
            <ResponseOption
              option="cough"
              label="Cough"
              icon="😷"
              color="primary"
              onSelect={handleOptionSelect}
              disabled={responseMutation.isPending}
            />
            <ResponseOption
              option="throat-clear"
              label="Throat Clear"
              icon="😐"
              color="secondary"
              onSelect={handleOptionSelect}
              disabled={responseMutation.isPending}
            />
            <ResponseOption
              option="other"
              label="Other"
              icon="🤔"
              color="hyfe-grey"
              onSelect={handleOptionSelect}
              disabled={responseMutation.isPending}
            />
          </div>
        </div>

        {/* Progress indicator */}
        <ProgressIndicator
          currentStep={currentAudioIndex + 1}
          totalSteps={totalCount}
          completedSteps={completedCount}
        />
      </div>

      {/* Feedback modal */}
      {showFeedback && feedbackStats && (
        <FeedbackModal
          stats={feedbackStats}
          onClose={handleNextAudio}
        />
      )}
    </HexagonPattern>
  );
};

export default Evaluation;
