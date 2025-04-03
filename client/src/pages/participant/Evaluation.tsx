import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AudioSnippetWithStats } from "@shared/schema";
import AudioPlayer from "@/components/AudioPlayer";
import ResponseOption from "@/components/ResponseOption";
import ProgressIndicator from "@/components/ProgressIndicator";
import FeedbackModal from "@/components/FeedbackModal";
import { feedbackMessages } from "@shared/schema";

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
          participantId: data?.participant.id, // Add participant ID
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
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4">Loading audio samples...</p>
      </div>
    );
  }

  if (!data || !data.audioSnippets || data.audioSnippets.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-yellow-500 mx-auto mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="text-2xl font-semibold mb-2">No Audio Available</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            There are no audio samples available for evaluation at this time.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Please contact the conference organizer or try again later.
          </p>
        </div>
      </div>
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
      setCurrentAudioIndex(currentAudioIndex + 1);
    } else {
      // All done, go to thank you page
      setLocation("/thank-you");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 text-center">
        <h1 className="text-xl font-semibold text-primary">Cough Conference Audio Evaluation</h1>
      </header>

      {/* Main content */}
      <div className="flex-grow flex flex-col p-4">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-4 max-w-md mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">
              Audio Snippet <span>{currentAudioIndex + 1}</span>/{totalCount}
            </h2>
          </div>

          <AudioPlayer
            audioUrl={`/api/uploads/${currentAudio.filename}`}
            disabled={responseMutation.isPending}
          />

          <div className="text-center text-sm text-gray-500 my-4">
            Choose what you think this audio represents:
          </div>

          <div className="grid grid-cols-1 gap-3">
            <ResponseOption
              option="cough"
              label="Cough"
              icon="😷"
              color="blue"
              onSelect={handleOptionSelect}
              disabled={responseMutation.isPending}
            />
            <ResponseOption
              option="throat-clear"
              label="Throat Clear"
              icon="😐"
              color="orange"
              onSelect={handleOptionSelect}
              disabled={responseMutation.isPending}
            />
            <ResponseOption
              option="other"
              label="Other"
              icon="🤔"
              color="gray"
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
    </div>
  );
};

export default Evaluation;
