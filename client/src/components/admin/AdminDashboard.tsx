import { useState } from "react";
import { useAuth } from "@/lib/auth";
import AudioUpload from "./AudioUpload";
import QRCodeGenerator from "./QRCodeGenerator";
import ResponseTable from "./ResponseTable";
import AudioManagement from "./AudioManagement";

// Tab names
const TABS = {
  UPLOAD: "upload",
  QRCODES: "qrcodes",
  RESPONSES: "responses",
  AUDIO: "audio"
};

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.UPLOAD);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <nav className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Cough Evaluation Admin</h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm">Welcome, {user?.username}</span>
            <button 
              onClick={logout}
              className="px-3 py-1 bg-white text-primary rounded-md shadow-sm text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Admin Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto">
            <button 
              onClick={() => setActiveTab(TABS.UPLOAD)}
              className={`px-6 py-3 font-medium ${
                activeTab === TABS.UPLOAD 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-gray-500"
              }`}
            >
              Upload Audio
            </button>
            <button 
              onClick={() => setActiveTab(TABS.QRCODES)}
              className={`px-6 py-3 font-medium ${
                activeTab === TABS.QRCODES 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-gray-500"
              }`}
            >
              QR Codes
            </button>
            <button 
              onClick={() => setActiveTab(TABS.RESPONSES)}
              className={`px-6 py-3 font-medium ${
                activeTab === TABS.RESPONSES 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-gray-500"
              }`}
            >
              View Responses
            </button>
            <button 
              onClick={() => setActiveTab(TABS.AUDIO)}
              className={`px-6 py-3 font-medium ${
                activeTab === TABS.AUDIO 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-gray-500"
              }`}
            >
              Manage Audio
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto p-4 md:p-6">
        {activeTab === TABS.UPLOAD && <AudioUpload />}
        {activeTab === TABS.QRCODES && <QRCodeGenerator />}
        {activeTab === TABS.RESPONSES && <ResponseTable />}
        {activeTab === TABS.AUDIO && <AudioManagement />}
      </div>
    </div>
  );
}
