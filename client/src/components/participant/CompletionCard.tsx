import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { CheckCircle } from "lucide-react";

export default function CompletionCard() {
  return (
    <Card className="max-w-md mx-auto mt-8 border-blue-200 shadow-md">
      <CardContent className="pt-6 pb-8 px-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          
          <p className="text-gray-600 mb-6">
            Your evaluation has been successfully submitted.
            Your contribution helps improve our audio classification models.
          </p>
          
          <div className="bg-blue-50 rounded-md p-4 mb-6 w-full">
            <p className="text-sm text-blue-800 font-medium">
              All your responses have been recorded. You may now close this window or return to the home page.
            </p>
          </div>
          
          <Link href="/">
            <Button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              Return to Home
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}