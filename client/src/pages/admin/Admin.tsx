import { useState } from "react";
import { useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import AudioUpload from "./AudioUpload";
import QRCodes from "./QRCodes";
import Responses from "./Responses";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "qr-codes" | "responses">("upload");
  const { toast } = useToast();
  const [isMatch] = useRoute("/admin");

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
              {/* Removed logout button as it's no longer needed */}
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
