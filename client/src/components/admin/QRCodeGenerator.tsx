import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import QRCode from "qrcode.react";
import { Download, Printer } from "lucide-react";

interface Participant {
  id: number;
  participantId: string;
  createdAt: string;
}

export default function QRCodeGenerator() {
  const [qrCount, setQrCount] = useState<number>(10);
  const [prefix, setPrefix] = useState<string>("CONF");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { toast } = useToast();
  
  const generateQRCodesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", `/api/participants/batch?count=${qrCount}&prefix=${prefix}`);
      return res.json();
    },
    onSuccess: (data) => {
      setParticipants(data);
      toast({
        title: "QR Codes Generated",
        description: `Successfully generated ${data.length} QR codes`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Generate QR Codes",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const generateQRCodes = () => {
    if (qrCount < 1 || qrCount > 100) {
      toast({
        title: "Invalid Count",
        description: "Please enter a number between 1 and 100",
        variant: "destructive",
      });
      return;
    }
    
    generateQRCodesMutation.mutate();
  };

  const downloadQR = (participantId: string) => {
    const canvas = document.getElementById(`qr-${participantId}`) as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-${participantId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQR = (participantId: string) => {
    const canvas = document.getElementById(`qr-${participantId}`) as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Print Failed",
        description: "Unable to open print window. Please check your browser settings.",
        variant: "destructive",
      });
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code: ${participantId}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; }
            .container { text-align: center; }
            img { max-width: 300px; }
            p { font-family: Arial, sans-serif; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${url}" alt="QR Code" />
            <p>${participantId}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const downloadAllQRCodes = () => {
    if (participants.length === 0) {
      toast({
        title: "No QR Codes",
        description: "Generate QR codes first",
        variant: "destructive",
      });
      return;
    }
    
    // Create a zip file with all QR codes
    // For simplicity, we'll just trigger individual downloads
    participants.forEach((participant) => {
      downloadQR(participant.participantId);
    });
    
    toast({
      title: "Download Started",
      description: `Downloading ${participants.length} QR codes`,
    });
  };

  // Get the base URL for QR codes
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const domains = process.env.REPLIT_DOMAINS 
        ? process.env.REPLIT_DOMAINS.split(',')
        : [window.location.origin];
      return domains[0];
    }
    return '';
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Generate QR Codes</h2>
          <p className="text-gray-600 mb-6">Create unique QR codes for conference participants.</p>
          
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="qr-count" className="text-sm font-medium text-gray-700 mb-1">Number of QR Codes</Label>
              <Input
                id="qr-count"
                type="number"
                min={1}
                max={100}
                value={qrCount}
                onChange={(e) => setQrCount(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="qr-prefix" className="text-sm font-medium text-gray-700 mb-1">Prefix (Optional)</Label>
              <Input
                id="qr-prefix"
                type="text"
                placeholder="CONF"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={generateQRCodes}
              disabled={generateQRCodesMutation.isPending}
              className="whitespace-nowrap"
            >
              {generateQRCodesMutation.isPending && <Spinner size="sm" className="mr-2" />}
              Generate QR Codes
            </Button>
          </div>
          
          {generateQRCodesMutation.isPending ? (
            <div className="text-center py-10">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-500">Generating QR codes...</p>
            </div>
          ) : participants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="bg-gray-50 p-4 rounded-md text-center">
                    <div className="bg-white p-2 rounded-md mb-3 mx-auto w-40 h-40 flex items-center justify-center">
                      <QRCode
                        id={`qr-${participant.participantId}`}
                        value={`${getBaseUrl()}/evaluate/${participant.participantId}`}
                        size={140}
                        level="H"
                        renderAs="canvas"
                      />
                    </div>
                    <p className="font-medium">{participant.participantId}</p>
                    <div className="mt-2 flex justify-center space-x-2">
                      <button 
                        onClick={() => downloadQR(participant.participantId)}
                        className="text-sm text-primary flex items-center"
                      >
                        <Download className="h-3 w-3 mr-1" /> Download
                      </button>
                      <button 
                        onClick={() => printQR(participant.participantId)}
                        className="text-sm text-gray-600 flex items-center"
                      >
                        <Printer className="h-3 w-3 mr-1" /> Print
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button onClick={downloadAllQRCodes}>
                  <Download className="h-4 w-4 mr-2" /> Download All QR Codes
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Generate QR codes to see them here
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
