import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Admin from "@/pages/admin/Admin";
import Login from "@/pages/admin/Login";
import Evaluation from "@/pages/participant/Evaluation";
import ThankYou from "@/pages/participant/ThankYou";

function Router() {
  return (
    <Switch>
      {/* Admin routes */}
      <Route path="/admin" component={Admin} />
      
      {/* Participant routes */}
      <Route path="/evaluate/:sessionId">
        {params => <Evaluation sessionId={params.sessionId} />}
      </Route>
      <Route path="/thank-you" component={ThankYou} />
      
      {/* Home route redirects to admin directly */}
      <Route path="/">
        {() => {
          window.location.href = "/admin";
          return null;
        }}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
