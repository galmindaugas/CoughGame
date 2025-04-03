import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, Check, X, Music } from "lucide-react";

type FileStatus = "pending" | "uploading" | "success" | "error";

interface FileWithStatus {
  file: File;
  id: string;
  status: FileStatus;
  error?: string;
}

export default function AudioUpload() {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        id: crypto.randomUUID(),
        status: 'pending' as FileStatus
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
        .filter(file => {
          const ext = file.name.split('.').pop()?.toLowerCase();
          return ext === 'mp3' || ext === 'wav';
        })
        .map(file => ({
          file,
          id: crypto.randomUUID(),
          status: 'pending' as FileStatus
        }));
      
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadFile = async (fileWithStatus: FileWithStatus) => {
    try {
      const formData = new FormData();
      formData.append('file', fileWithStatus.file);
      
      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === fileWithStatus.id ? { ...f, status: 'uploading' } : f
      ));
      
      const response = await fetch('/api/audio', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      // Update file status on success
      setFiles(prev => prev.map(f => 
        f.id === fileWithStatus.id ? { ...f, status: 'success' } : f
      ));
      
      return response.json();
    } catch (error) {
      console.error("Upload error:", error);
      
      // Update file status on error
      setFiles(prev => prev.map(f => 
        f.id === fileWithStatus.id 
          ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed' 
            } 
          : f
      ));
      
      throw error;
    }
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) {
      toast({ 
        title: "No files to upload", 
        description: "Please add audio files first",
        variant: "destructive" 
      });
      return;
    }
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast({ 
        title: "No new files", 
        description: "All files have already been processed",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const results = await Promise.allSettled(
        pendingFiles.map(file => uploadFile(file))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (successful > 0) {
        // Invalidate audio files query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['/api/audio'] });
        
        toast({
          title: "Upload complete",
          description: `Successfully uploaded ${successful} file${successful !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}.`,
          variant: successful > 0 ? "default" : "destructive"
        });
      } else {
        toast({
          title: "Upload failed",
          description: "All files failed to upload. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload error",
        description: "An error occurred while uploading files",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Calculate audio duration in seconds (approximate)
  const getAudioDuration = (file: File) => {
    // For demo purposes, we'll just use a formula based on file size and bitrate
    // In a real app, we'd use the Web Audio API to get the actual duration
    const avgBitrate = 128 * 1024; // 128 kbps
    const durationSec = (file.size * 8) / avgBitrate;
    return durationSec.toFixed(1) + 's';
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upload New Audio Snippets</h2>
          <p className="text-gray-600 mb-6">Upload MP3 or WAV files (2-10 seconds long) for evaluation.</p>
        
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="mb-2">Drag and drop audio files here</p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <Button>
              Browse Files
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".mp3,.wav"
                multiple
                onChange={handleFileChange}
              />
            </Button>
          </div>
        </div>
        
        {files.length > 0 && (
          <div className="mt-6 space-y-4 max-h-80 overflow-y-auto">
            {files.map((fileWithStatus) => (
              <div key={fileWithStatus.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <Music className="text-gray-500 mr-3 h-5 w-5" />
                  <div>
                    <p className="font-medium">{fileWithStatus.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {getAudioDuration(fileWithStatus.file)} • {formatFileSize(fileWithStatus.file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {fileWithStatus.status === 'pending' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Ready</span>
                  )}
                  {fileWithStatus.status === 'uploading' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Uploading</span>
                  )}
                  {fileWithStatus.status === 'success' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">Uploaded</span>
                  )}
                  {fileWithStatus.status === 'error' && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full" title={fileWithStatus.error}>
                      Failed
                    </span>
                  )}
                  <button 
                    onClick={() => removeFile(fileWithStatus.id)}
                    className="text-gray-500 hover:text-red-500"
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={uploadAllFiles}
            disabled={isUploading || files.filter(f => f.status === 'pending').length === 0}
          >
            {isUploading ? 'Uploading...' : 'Upload All Files'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
