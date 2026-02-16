import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatStream } from "@/components/chat/ChatStream";

export const dynamic = "force-dynamic";

export default function QueryPage() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="grain" />
      <div className="grid-overlay" />

      <div className="relative z-10 flex min-h-[calc(100vh-3.5rem)] flex-1">
        <ChatSidebar />
        <div className="relative flex flex-1 flex-col min-w-0">
          <ChatStream />
        </div>
      </div>
    </main>
  );
}

