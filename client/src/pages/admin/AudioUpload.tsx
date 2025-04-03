import { useState, useRef, ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AudioSnippet } from "@shared/schema";

const AudioUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get all audio snippets
  const { data: audioFiles = [], isLoading } = useQuery<AudioSnippet[]>({
    queryKey: ["/api/audio"],
  });

  // Mutation for uploading audio
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("audio", file);
      const response = await fetch("/api/audio", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload file");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Audio uploaded",
        description: "Audio file has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/audio"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting audio
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/audio/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Audio deleted",
        description: "Audio file has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/audio"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleUpload = (file: File) => {
    // Validate file type
    const allowedMimeTypes = [
      "audio/mpeg",      // MP3
      "audio/wav",       // WAV
      "audio/wave",      // WAV alternative
      "audio/x-wav",     // WAV alternative
      "audio/x-pn-wav",  // WAV alternative
      "audio/vnd.wave"   // WAV alternative
    ];
    
    // Check file extension as fallback
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidExtension = fileExtension === 'mp3' || fileExtension === 'wav';
    
    // Check either MIME type or extension
    if (!allowedMimeTypes.includes(file.type) && !isValidExtension) {
      console.log("Rejected file with type:", file.type, "and extension:", fileExtension);
      toast({
        title: "Invalid file type",
        description: "Only MP3 and WAV files are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteAudio = (id: number) => {
    if (confirm("Are you sure you want to delete this audio file?")) {
      deleteMutation.mutate(id);
    }
  };

  const handlePlayAudio = (filename: string) => {
    const audio = new Audio(`/api/uploads/${filename}`);
    audio.play();
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium mb-4">Upload Audio Snippets</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Upload MP3 or WAV files (2-10 seconds long) for participants to evaluate.
        </p>

        <div
          className={`border-2 border-dashed ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700"
          } rounded-lg p-6 text-center`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="audio-upload"
            className="hidden"
            accept=".mp3,.wav"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <label htmlFor="audio-upload" className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop files here or click to browse
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              MP3 or WAV format, 2-10 seconds long
            </p>
          </label>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Uploaded Audio Files</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : audioFiles.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center text-gray-500">
              No audio files uploaded yet.
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
              {audioFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">{file.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {formatDuration(file.duration)} • {file.mimeType.includes("mpeg") ? "MP3" : "WAV"} • Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePlayAudio(file.filename)}
                      className="text-gray-500 hover:text-primary"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAudio(file.id)}
                      className="text-gray-500 hover:text-red-500 ml-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioUpload;
