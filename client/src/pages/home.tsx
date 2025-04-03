import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle, Mic } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block p-3 rounded-full bg-blue-100 mb-4">
              <Mic className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">
              Audio Classification System
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A platform for evaluating audio snippets as coughs, throat clears, or other sounds
              to improve acoustic classification models.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-700">For Participants</h2>
                <HelpCircle className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-gray-600 mb-6">
                Scan your QR code to begin evaluating audio snippets. Your contribution helps
                improve our sound classification models.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                * You should receive a QR code from a researcher to participate
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-700">For Researchers</h2>
                <HelpCircle className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-gray-600 mb-6">
                Access the admin dashboard to upload audio files, generate QR codes,
                and view the collected data.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                onClick={() => navigate("/login")}
              >
                Login to Admin Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Audio Classification System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}