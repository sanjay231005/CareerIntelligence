import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import UploadMeeting from "@/pages/UploadMeeting";
import Transcripts from "@/pages/Transcripts";
import TranscriptDetail from "@/pages/TranscriptDetail";
import MeetingIntelligence from "@/pages/MeetingIntelligence";
import ActionItems from "@/pages/ActionItems";
import Participants from "@/pages/Participants";
import SentimentAnalysis from "@/pages/SentimentAnalysis";
import Reports from "@/pages/Reports";
import Validation from "@/pages/Validation";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import { getTheme } from "@/lib/storage";

const queryClient = new QueryClient();

function ThemeInit() {
  useEffect(() => {
    const theme = getTheme();
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInit />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadMeeting />} />
            <Route path="/transcripts" element={<Transcripts />} />
            <Route path="/transcripts/:id" element={<TranscriptDetail />} />
            <Route path="/intelligence" element={<MeetingIntelligence />} />
            <Route path="/intelligence/:id" element={<MeetingIntelligence />} />
            <Route path="/action-items" element={<ActionItems />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="/sentiment" element={<SentimentAnalysis />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/validation" element={<Validation />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
