import KBar from "@/components/kbar";
import Header from "@/components/layout/header";
import { SidebarInset, SidebarMenuSkeleton, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getNavMenus } from "./_lib/queries";
import { Suspense } from "react";
import SidebarLeft from "@/components/layout/sidebar-left";
import { SidebarRight } from "@/components/layout/sidebar-right";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import ChatPage from "../ai/page";

export const metadata: Metadata = {
  title: "Next Shadcn Dashboard Starter",
  description: "Basic dashboard with Next.js and Shadcn",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  const promises = Promise.all([
    getNavMenus(),
  ]);

  return (
    <KBar promises={promises}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <Suspense fallback={<SidebarMenuSkeleton showIcon={true} />}>
          <SidebarLeft promises={promises} />
        </Suspense>
        <SidebarInset>
          <Header />
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={75}>
              {/* page main content */}
              {children}
              {/* page main content ends */}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} maxSize={50}>
              <ChatPage />
            </ResizablePanel>
          </ResizablePanelGroup>
        </SidebarInset>
        
        
      </SidebarProvider>
    </KBar>
  );
}

//  <SidebarInset>
//    <Header />
//    <ResizablePanelGroup direction="horizontal">
//      <ResizablePanel defaultSize={75}>
//        {/* page main content */}
//        {children}
//        {/* page main content ends */}
//      </ResizablePanel>
//      <ResizableHandle withHandle />
//      <ResizablePanel defaultSize={25} maxSize={50}>
//        <ChatPage />
//      </ResizablePanel>
//    </ResizablePanelGroup>
//  </SidebarInset>;

{/* <ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={75}>
    <SidebarInset>
      <Header />
      {children}
    </SidebarInset>
  </ResizablePanel>
  <ResizableHandle withHandle />

  <ResizablePanel defaultSize={25} maxSize={50}>
    <ChatPage />
  </ResizablePanel>
</ResizablePanelGroup>; */}