import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "@/components/ui/audio-player";
import { AudioSnippetWithStats, ResponseOption } from "@shared/schema";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { apiRequest } from "@/lib/queryClient";
import { Participant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ResponseButtonProps {
  option: ResponseOption;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}

function ResponseButton({
  option,
  selected,
  onClick,
  disabled,
}: ResponseButtonProps) {
  let label = "";
  let color = "";
  let iconEmoji = "";

  switch (option) {
    case "cough":
      label = "Cough";
      color = selected ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800";
      iconEmoji = "💨";
      break;
    case "throat-clear":
      label = "Throat Clear";
      color = selected ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-800";
      iconEmoji = "🗣️";
      break;
    case "other":
      label = "Other Sound";
      color = selected ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-800";
      iconEmoji = "🔊";
      break;
  }

  return (
    <Button
      className={`flex-1 h-16 text-lg flex flex-col gap-1 justify-center hover:bg-opacity-90 ${color} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="text-xl">{iconEmoji}</span>
      <span className="text-sm">{label}</span>
    </Button>
  );
}

interface ParticipantEvaluationProps {
  sessionId: string;
  audioSnippets: AudioSnippetWithStats[];
  participant: Participant;
  onComplete: () => void;
}

export default function ParticipantEvaluation({
  sessionId,
  audioSnippets,
  participant,
  onComplete,
}: ParticipantEvaluationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, ResponseOption>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const currentSnippet = audioSnippets[currentIndex];
  const totalSnippets = audioSnippets.length;
  const completedCount = Object.keys(responses).length;
  const currentResponse = responses[currentSnippet.id];
  const currentHasPlayed = hasPlayed[currentSnippet.id] || false;

  // Handle selection of response option
  const handleResponseSelect = async (responseOption: ResponseOption) => {
    setResponses((prev) => ({
      ...prev,
      [currentSnippet.id]: responseOption,
    }));

    // Submit the response
    try {
      await apiRequest("POST", "/api/responses", {
        participantId: participant.id,
        audioSnippetId: currentSnippet.id,
        responseOption,
      });

      // Move to next snippet if available
      if (currentIndex < totalSnippets - 1) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 500);
      } else {
        // All snippets evaluated
        toast({
          title: "Evaluation complete",
          description: "Thank you for your participation!",
        });
        onComplete();
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error",
        description: "Failed to submit your response. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle audio playback
  const handlePlay = () => {
    setIsPlaying(true);
    setHasPlayed((prev) => ({
      ...prev,
      [currentSnippet.id]: true,
    }));
  };

  // Simple message based on current state
  let message = "";
  if (!currentHasPlayed) {
    message = "Please listen to the audio first";
  } else if (!currentResponse) {
    message = "Now classify what you heard";
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <ProgressSteps currentStep={currentIndex + 1} totalSteps={totalSnippets} />
        <div className="text-center text-sm text-gray-500 mt-2">
          {completedCount} of {totalSnippets} evaluated
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Audio Snippet {currentIndex + 1}
            </h2>
            <p className="text-sm text-gray-500">
              Listen carefully and identify if this is a cough, throat clear, or other sound
            </p>
          </div>

          <div className="mb-6">
            <AudioPlayer 
              audioUrl={`/api/audio/${currentSnippet.filename}`} 
              duration={currentSnippet.duration}
              onPlay={handlePlay} 
            />
          </div>

          {message && (
            <div className="text-center text-sm font-medium text-blue-600 mb-4">
              {message}
            </div>
          )}

          <div className="flex gap-2">
            <ResponseButton
              option="cough"
              selected={currentResponse === "cough"}
              onClick={() => handleResponseSelect("cough")}
              disabled={!currentHasPlayed}
            />
            <ResponseButton
              option="throat-clear"
              selected={currentResponse === "throat-clear"}
              onClick={() => handleResponseSelect("throat-clear")}
              disabled={!currentHasPlayed}
            />
            <ResponseButton
              option="other"
              selected={currentResponse === "other"}
              onClick={() => handleResponseSelect("other")}
              disabled={!currentHasPlayed}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}