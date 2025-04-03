import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AudioUpload from "./AudioUpload";
import QRCodes from "./QRCodes";
import Responses from "./Responses";

const Admin = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"upload" | "qr-codes" | "responses">("upload");
  const { toast } = useToast();
  const [isMatch] = useRoute("/admin");

  // Check if user is authenticated
  const { data: session, isLoading, error } = useQuery({
    queryKey: ["/api/auth/check"],
    retry: false,
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !session && !error?.message?.includes("401")) {
      toast({
        title: "Authentication required",
        description: "Please login to access the admin dashboard",
        variant: "destructive",
      });
      setLocation("/admin/login");
    }
  }, [session, isLoading, error, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogout = () => {
    // In a real app, this would call an API to logout
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    setLocation("/admin/login");
  };

  if (!isMatch) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-darkBg">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-primary">Cough Conference Admin</h1>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={handleLogout}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "upload"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("upload")}
            >
              Upload Audio
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "qr-codes"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("qr-codes")}
            >
              QR Codes
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "responses"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("responses")}
            >
              View Responses
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "upload" && <AudioUpload />}
        {activeTab === "qr-codes" && <QRCodes />}
        {activeTab === "responses" && <Responses />}
      </div>
    </div>
  );
};

export default Admin;
