import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import HomeNavbar from "../components/home-navbar";
import HomeSidebar from "../components/home-sidebar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <SidebarProvider>
      <div className="w-full">
        <HomeNavbar />
        <div className="flex min-h-screen pt-[4rem] w-full">
          <HomeSidebar />
          <main className="flex-1 overflow-y-auto w-full min-w-0 max-w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default HomeLayout;
