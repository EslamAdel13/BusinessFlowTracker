import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth.tsx";
import AppLayout from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/auth";
import Timeline from "@/pages/timeline";
import Tasks from "@/pages/tasks";
import Projects from "@/pages/projects";
import Settings from "@/pages/settings";
import { useAuthStore } from "@/store/authStore";

function Router() {
  const { user, checkAuth } = useAuthStore();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user && location !== "/auth") {
      setLocation("/auth");
    }
    if (user && location === "/auth") {
      setLocation("/timeline");
    }
  }, [user, location, setLocation]);

  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/timeline">
        {user ? (
          <AppLayout>
            <Timeline />
          </AppLayout>
        ) : (
          <Auth />
        )}
      </Route>
      <Route path="/tasks">
        {user ? (
          <AppLayout>
            <Tasks />
          </AppLayout>
        ) : (
          <Auth />
        )}
      </Route>
      <Route path="/projects">
        {user ? (
          <AppLayout>
            <Projects />
          </AppLayout>
        ) : (
          <Auth />
        )}
      </Route>
      <Route path="/settings">
        {user ? (
          <AppLayout>
            <Settings />
          </AppLayout>
        ) : (
          <Auth />
        )}
      </Route>
      <Route path="/">
        {user ? (
          <AppLayout>
            <Timeline />
          </AppLayout>
        ) : (
          <Auth />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
