import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AIAssistantChat } from "./AIAssistantChat";
import { useAdmin } from "@/admin/context/AdminContext";
import { cn } from "@/admin/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  hideAIAssistant?: boolean;
}

export function AdminLayout({
  children,
  title,
  subtitle,
  hideAIAssistant = false,
}: AdminLayoutProps) {
  const { sidebarCollapsed } = useAdmin();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <AdminHeader title={title} subtitle={subtitle} />
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-64",
        )}
      >
        <div className="p-6">{children}</div>
      </main>
      {/* AI Assistant Chat - Floating component */}
      {!hideAIAssistant && <AIAssistantChat />}
    </div>
  );
}
