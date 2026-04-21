import ActiveTabSwitch from "../components/ActiveTabSwitch.jsx";
import AnimatedGradientBorder from "../components/AnimatedGradientBorder.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import ChatList from "../components/ChatList.jsx";
import ContactList from "../components/ContactList.jsx";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder.jsx";
import ProfileHeader from "../components/ProfileHeader.jsx";
import { useCallSocket } from "../hooks/useCallSocket.js";
import { useChatStore } from "../store/useChatStore.js";



function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  useCallSocket();
  return (
    <div className="relative w-full max-w-6xl h-[800px]">
      <AnimatedGradientBorder>
        {/* LEFT SIDE */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </AnimatedGradientBorder>
    </div>
  );
}
export default ChatPage;