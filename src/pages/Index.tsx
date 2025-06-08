import React, { useState } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { CapabilitiesManagement } from "@/components/CapabilitiesManagement";
import { PlansView } from "@/components/PlansView";
import { MilestoneManagement } from "@/components/MilestoneManagement";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");

  // Listen for navigation events from Dashboard quick actions
  React.useEffect(() => {
    const handleNavigate = (event: any) => {
      setActiveView(event.detail);
    };

    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "capabilities":
        return <CapabilitiesManagement />;
      case "plans":
        return <PlansView />;
      case "milestones":
        return <MilestoneManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
