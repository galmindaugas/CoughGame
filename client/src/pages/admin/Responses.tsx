import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ResponseStats, AudioSnippet } from "@shared/schema";

interface ResponseData {
  id: number;
  participantId: number;
  audioSnippetId: number;
  selectedOption: string;
  responseDate: string;
  participant: {
    id: number;
    sessionId: string;
    sessionName: string | null;
  };
  audioSnippet: AudioSnippet;
}

interface StatsData {
  audioStats: ResponseStats[];
  overallStats: {
    totalResponses: number;
    coughCount: number;
    throatClearCount: number;
    otherCount: number;
    coughPercentage: number;
    throatClearPercentage: number;
    otherPercentage: number;
  };
}

const Responses = () => {
  const [filterAudioId, setFilterAudioId] = useState<string>("all");
  const [filterResponse, setFilterResponse] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const { toast } = useToast();

  // Prepare query parameters
  const prepareQueryParams = () => {
    const params = new URLSearchParams();
    
    if (filterAudioId !== "all") {
      params.append("audioId", filterAudioId);
    }
    
    if (filterResponse !== "all") {
      params.append("responseType", filterResponse);
    }
    
    if (filterDate) {
      params.append("date", filterDate);
    }
    
    return params.toString() ? `?${params.toString()}` : "";
  };
  
  // Query for responses
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery<ResponseData[]>({
    queryKey: [`/api/responses${prepareQueryParams()}`, filterAudioId, filterResponse, filterDate],
  });

  // Query for audio snippets (for filter dropdown)
  const { data: audioSnippets = [] } = useQuery<AudioSnippet[]>({
    queryKey: ["/api/audio"],
  });

  // Query for stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
  });

  const exportResponses = () => {
    if (responses.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no responses to export.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["Participant ID", "Audio File", "Response", "Date/Time"];
    const csvContent = [
      headers.join(","),
      ...responses.map((response) => [
        response.participant?.sessionId || response.participantId,
        response.audioSnippet?.originalName,
        response.selectedOption,
        new Date(response.responseDate).toLocaleString(),
      ].join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `responses_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getResponseBadgeColor = (response: string) => {
    switch (response) {
      case "cough":
        return "bg-blue-100 text-blue-800";
      case "throat-clear":
        return "bg-orange-100 text-orange-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-4">Participant Responses</h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="filter-audio" className="block text-sm font-medium mb-2">
                Filter by Audio
              </Label>
              <Select value={filterAudioId} onValueChange={setFilterAudioId}>
                <SelectTrigger id="filter-audio">
                  <SelectValue placeholder="All Audio Files" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audio Files</SelectItem>
                  {audioSnippets.map((audio) => (
                    <SelectItem key={audio.id} value={String(audio.id)}>
                      {audio.originalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="filter-response" className="block text-sm font-medium mb-2">
                Filter by Response
              </Label>
              <Select value={filterResponse} onValueChange={setFilterResponse}>
                <SelectTrigger id="filter-response">
                  <SelectValue placeholder="All Responses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Responses</SelectItem>
                  <SelectItem value="cough">Cough</SelectItem>
                  <SelectItem value="throat-clear">Throat Clear</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="filter-date" className="block text-sm font-medium mb-2">
                Filter by Date
              </Label>
              <Input
                type="date"
                id="filter-date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>

          {isLoadingResponses ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : responses.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500">
              No responses found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Audio File
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date/Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {responses.map((response) => (
                    <tr key={response.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        #{response.participant?.sessionId || response.participantId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                          {response.audioSnippet?.originalName || `Audio #${response.audioSnippetId}`}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getResponseBadgeColor(
                            response.selectedOption
                          )}`}
                        >
                          {response.selectedOption.charAt(0).toUpperCase() + response.selectedOption.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {new Date(response.responseDate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={exportResponses}
              variant="outline"
              className="border border-primary text-primary hover:bg-primary hover:text-white"
              disabled={responses.length === 0}
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
              Export Data (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-4">Response Statistics</h2>

          {isLoadingStats ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : !stats ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500">
              No statistics available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-3">By Audio File</h3>
                {stats.audioStats.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center text-gray-500">
                    No audio stats available.
                  </div>
                ) : (
                  stats.audioStats.map((stat) => (
                    <div key={stat.audioSnippetId} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{stat.originalName}</span>
                        <span className="text-sm text-gray-500">{stat.totalResponses} responses</span>
                      </div>
                      <div className="flex h-2 mb-2 mt-1">
                        <div
                          className="bg-blue-500 h-full rounded-l-full"
                          style={{ width: `${stat.coughPercentage}%` }}
                        ></div>
                        <div
                          className="bg-orange-500 h-full"
                          style={{ width: `${stat.throatClearPercentage}%` }}
                        ></div>
                        <div
                          className="bg-gray-500 h-full rounded-r-full"
                          style={{ width: `${stat.otherPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex text-xs">
                        <div className="flex items-center mr-4">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          Cough ({stat.coughPercentage}%)
                        </div>
                        <div className="flex items-center mr-4">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                          Throat Clear ({stat.throatClearPercentage}%)
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                          Other ({stat.otherPercentage}%)
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Overall Distribution</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium flex items-center">
                          <span className="w-3 h-3 inline-block bg-blue-500 rounded-full mr-1"></span>
                          Cough
                        </span>
                        <span className="text-sm">{stats.overallStats.coughPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full"
                          style={{ width: `${stats.overallStats.coughPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium flex items-center">
                          <span className="w-3 h-3 inline-block bg-orange-500 rounded-full mr-1"></span>
                          Throat Clear
                        </span>
                        <span className="text-sm">{stats.overallStats.throatClearPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-orange-500 h-2.5 rounded-full"
                          style={{ width: `${stats.overallStats.throatClearPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium flex items-center">
                          <span className="w-3 h-3 inline-block bg-gray-500 rounded-full mr-1"></span>
                          Other
                        </span>
                        <span className="text-sm">{stats.overallStats.otherPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-gray-500 h-2.5 rounded-full"
                          style={{ width: `${stats.overallStats.otherPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Responses;
