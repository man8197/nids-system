import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Particles } from "@/components/cyber/Particles";

const titles: Record<string, { t: string; s: string }> = {
  "/": { t: "Command Center", s: "Real-time network intrusion overview" },
  "/traffic": { t: "Traffic Monitor", s: "Live packet flow & protocol analysis" },
  "/threats": { t: "Threat Analysis", s: "AI-powered threat intelligence" },
  "/alerts": { t: "Alert Center", s: "Prioritized intrusion notifications" },
  "/map": { t: "Global Attack Map", s: "Worldwide cyber attack telemetry" },
  "/reports": { t: "Reports & Analytics", s: "AI-generated security insights" },
  "/logs": { t: "System Logs", s: "Audit trail & event history" },
  "/settings": { t: "Settings", s: "Platform configuration" },
  "/profile": { t: "User Profile", s: "Account & activity overview" },
};

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/_app") throw redirect({ to: "/" });
  },
  component: AppLayout,
});

function AppLayout() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const meta = titles[path] || { t: "Sentinel", s: "AI NIDS Platform" };
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"><Particles /></div>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar title={meta.t} subtitle={meta.s} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
