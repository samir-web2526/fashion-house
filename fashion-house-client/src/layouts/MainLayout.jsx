import { Outlet } from "react-router";
import Navbar from "@/pages/sharedPages/Navbar";
import FloatingButtons from "@/components/ui/FloatingButtons";
import StickyCardDrawer from "@/components/shared/StickyCardDrawer";

export default function MainLayout() {
  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <Navbar />

        <main id="main-scroll" className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <FloatingButtons />
      <StickyCardDrawer />
    </>
  );
}
