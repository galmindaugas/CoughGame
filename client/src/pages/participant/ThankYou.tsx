import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Home } from "lucide-react";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-0">
        <CardContent className="pt-6 pb-8 px-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
            <p className="text-gray-600 mb-6">
              Your evaluation has been successfully completed.
              Your contribution helps improve our audio classification models.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 w-full">
              <p className="text-sm text-blue-800">
                Your session is now complete. You may close this window or return to the home page.
              </p>
            </div>
            
            <Link href="/">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                <Home className="w-4 h-4" />
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}