import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder.jsx";
import MessageInput from "./MessageInput";

import MessageLoadingSkeleton from "./MessageLoadingSkeleton.jsx";

function ChatContainer() {

//   selectedUser = jisse chat karni hai (Vinay)
// authUser = tum (Dheeraj)
// messages = abhi empty []
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

if (!authUser) return null; // jab tak login user nahi aata → kuch render mat karo

  useEffect(() => {
    if (!selectedUser) return;

    getMessagesByUserId(selectedUser.id); //Tumne Vinay pe click kiya toh selectedUser = { id: 6, username: "Vinay" }
    subscribeToMessages(); //👉 ab app live messages sun raha hai 📡

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    //ye hai auto scroll ke liye ki new message aate hi auto scroll krdo
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  console.log("authUser:", authUser);
// console.log("msg sender:", msg.sender_id, msg.senderId);
  return (
    <>
    
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              console.log("MSG DEBUG:", msg);
              const messageType = msg.message_type || msg.messageType;
              const fileUrl = msg.file_url || msg.fileUrl;
              const createdTime = msg.created_at || msg.createdAt;
              const senderId = msg.sender_id ?? msg.senderId;
              return (
              <div
                key={msg.id}
                className={`chat ${Number(senderId) === Number(authUser?.id) ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative ${
                    Number(senderId) === Number(authUser?.id)
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {/* Image (fallback if type missing but URL exists) */}
                  {fileUrl && (messageType === "image" || fileUrl.match(/\.(jpeg|jpg|png|webp|gif)$/i)) && (
                    <img
                      src={fileUrl}
                      alt="Shared"
                      className="rounded-lg max-w-[200px] object-cover"
                    />
                  )}

                  {/* Document */}
                  {messageType === "document" && fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 underline"
                    >
                      Download File
                    </a>
                  )}

                  {/* Text */}
                  {(msg.message_text ?? msg.text) && (
                    <p className="mt-2">{msg.message_text ?? msg.text}</p>
                  )}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(createdTime).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              );
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessageLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.username} />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;