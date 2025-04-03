import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-primary">Cough Audio Evaluation</h1>
            <p className="text-gray-600">
              A tool for evaluating audio snippets as cough, throat clear, or other sounds.
            </p>
            
            <div className="flex flex-col space-y-3 mt-6">
              <Link href="/login">
                <Button className="w-full">Admin Login</Button>
              </Link>
              <p className="text-sm text-gray-500 mt-3">
                Participants: Please scan your QR code to access the evaluation tool.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
