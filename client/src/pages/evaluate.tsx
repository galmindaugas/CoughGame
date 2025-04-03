import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ParticipantEvaluation from "@/components/participant/ParticipantEvaluation";
import CompletionCard from "@/components/participant/CompletionCard";
import { Spinner } from "@/components/ui/spinner";

export default function Evaluate() {
  const { participantId } = useParams<{ participantId: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [sessionComplete, setSessionComplete] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [`/api/sessions/${participantId}`],
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "Failed to load evaluation session. Invalid or expired QR code.",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [isError, navigate, toast]);

  useEffect(() => {
    if (data?.session?.completed) {
      setSessionComplete(true);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Session Error</h2>
          <p className="text-gray-600">
            {String(error) || "Invalid or expired QR code. Please scan a valid QR code."}
          </p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return <CompletionCard />;
  }

  return (
    <ParticipantEvaluation
      participantId={participantId}
      currentAudioId={data.currentAudio.audioId}
      currentStep={data.currentStep}
      totalSteps={data.totalSteps}
      duration={data.currentAudio.duration}
      onComplete={() => setSessionComplete(true)}
    />
  );
}
