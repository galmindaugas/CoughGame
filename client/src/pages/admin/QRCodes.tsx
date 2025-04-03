import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ParticipantWithQR {
  id: number;
  sessionId: string;
  sessionName: string | null;
  createDate: string;
  qrCode: string;
  evaluationUrl: string;
}

const QRCodes = () => {
  const [numCodes, setNumCodes] = useState<number>(10);
  const [sessionName, setSessionName] = useState<string>("");
  const [generatedQRs, setGeneratedQRs] = useState<ParticipantWithQR[]>([]);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/participants/generate", {
        count: numCodes,
        sessionName: sessionName || undefined,
      });
      return res.json();
    },
    onSuccess: (data: ParticipantWithQR[]) => {
      setGeneratedQRs(data);
      toast({
        title: "QR Codes Generated",
        description: `Successfully generated ${data.length} QR codes.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateQRCodes = () => {
    if (numCodes < 1 || numCodes > 100) {
      toast({
        title: "Invalid number",
        description: "Please enter a number between 1 and 100.",
        variant: "destructive",
      });
      return;
    }
    
    generateMutation.mutate();
  };

  const handlePrintQR = (qrCode: string, sessionId: string) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - Participant #${sessionId}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              img { max-width: 300px; }
              .container { margin: 0 auto; max-width: 500px; }
              .qr-code { margin-bottom: 20px; }
              .session-id { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .instructions { font-size: 16px; margin-bottom: 20px; }
              .url { font-size: 14px; word-break: break-all; margin-bottom: 30px; }
              .footer { font-size: 12px; color: #666; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="qr-code">
                <img src="${qrCode}" alt="QR Code" />
              </div>
              <div class="session-id">Participant #${sessionId}</div>
              <div class="instructions">
                Scan this QR code to participate in the audio evaluation.
              </div>
              <div class="url">
                URL: ${window.location.origin}/evaluate/${sessionId}
              </div>
              <div class="footer">
                Cough Conference Audio Evaluation
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownloadQR = (qrCode: string, sessionId: string) => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `qrcode-${sessionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllQRCodes = () => {
    if (generatedQRs.length === 0) {
      toast({
        title: "No QR codes",
        description: "Generate QR codes first before downloading.",
        variant: "destructive",
      });
      return;
    }

    // Create a PDF-like HTML document with all QR codes
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>All QR Codes</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .qr-container { display: flex; flex-wrap: wrap; justify-content: center; }
              .qr-item { margin: 20px; text-align: center; page-break-inside: avoid; }
              .qr-code img { width: 200px; height: 200px; }
              .qr-info { margin-top: 10px; }
              .session-id { font-weight: bold; }
              .session-name { color: #666; font-size: 14px; }
              @media print {
                @page { size: A4; margin: 0.5cm; }
                body { margin: 1cm; }
              }
            </style>
          </head>
          <body>
            <h1 style="text-align: center;">Cough Conference QR Codes</h1>
            <p style="text-align: center;">Session: ${sessionName || "All Sessions"}</p>
            <div class="qr-container">
              ${generatedQRs.map(qr => `
                <div class="qr-item">
                  <div class="qr-code">
                    <img src="${qr.qrCode}" alt="QR Code for ${qr.sessionId}">
                  </div>
                  <div class="qr-info">
                    <div class="session-id">Participant #${qr.sessionId}</div>
                    ${qr.sessionName ? `<div class="session-name">${qr.sessionName}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium mb-4">Generate QR Codes</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Create unique QR codes for conference participants to scan.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="num-codes" className="block text-sm font-medium mb-2">
              Number of QR Codes
            </Label>
            <Input
              type="number"
              id="num-codes"
              min="1"
              max="100"
              value={numCodes}
              onChange={(e) => setNumCodes(parseInt(e.target.value) || 1)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="session-name" className="block text-sm font-medium mb-2">
              Session Name (Optional)
            </Label>
            <Input
              type="text"
              id="session-name"
              placeholder="Morning Session"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleGenerateQRCodes}
              disabled={generateMutation.isPending}
              className="w-full sm:w-auto bg-primary hover:bg-opacity-90"
            >
              {generateMutation.isPending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
              ) : (
                "Generate QR Codes"
              )}
            </Button>
          </div>
        </div>

        {generatedQRs.length > 0 && (
          <>
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Generated QR Codes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {generatedQRs.map((qr) => (
                  <div
                    key={qr.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
                  >
                    <img
                      src={qr.qrCode}
                      alt={`QR Code for participant ${qr.sessionId}`}
                      className="mx-auto mb-2 w-36 h-36"
                    />
                    <p className="font-medium">Participant #{qr.sessionId}</p>
                    {qr.sessionName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{qr.sessionName}</p>
                    )}
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handlePrintQR(qr.qrCode, qr.sessionId)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 px-2 py-1 rounded"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 inline mr-1 align-text-bottom"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                          />
                        </svg>
                        Print
                      </button>
                      <button
                        onClick={() => handleDownloadQR(qr.qrCode, qr.sessionId)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 px-2 py-1 rounded"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 inline mr-1 align-text-bottom"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleDownloadAllQRCodes}
                variant="outline"
                className="w-full border border-primary text-primary hover:bg-primary hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download All QR Codes (PDF)
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodes;
