import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);

  // ================= DOWNLOAD FUNCTION =================
  const handleDownload = async (url, fileType) => {
    try {
      const cleanUrl = url?.replace("/fl_attachment", "");

      const response = await fetch(cleanUrl);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const buffer = await response.arrayBuffer();

      const blob = new Blob([buffer], { type: fileType });

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;

      // 🔥 FIX filename properly
      const fileName = cleanUrl.split("/").pop().split("?")[0];
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // ================= FETCH =================
  useEffect(() => {
    if (selectedUser?._id && authUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();

      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, authUser]);

  // ================= SCROLL =================
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto relative">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isMe =
            message.senderId?.toString() === authUser?._id?.toString();

          const fileUrl = message.file?.replace("/fl_attachment", "");

          return (
            <div
              key={message._id}
              className={`chat ${isMe ? "chat-end" : "chat-start"}`}
            >
              {/* AVATAR */}
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isMe
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile"
                  />
                </div>
              </div>

              {/* TIME */}
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              {/* MESSAGE */}
              <div className="chat-bubble flex flex-col gap-1">

                {/* ================= FILE ================= */}
                {message.file && (
                  <div className="mb-2">

                    {/* IMAGE */}
                    {message.fileType?.startsWith("image/") ? (
                      <div className="relative group">
                        <img
                          src={fileUrl}
                          alt="img"
                          className="max-w-[220px] rounded-lg cursor-pointer"
                          onClick={() => setPreviewImage(fileUrl)}
                        />

                        {/* Hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                          <button
                            onClick={() => setPreviewImage(fileUrl)}
                            className="btn btn-xs"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleDownload(fileUrl, message.fileType)}
                            className="btn btn-xs"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* FILE CARD */
                      <div className="bg-base-200 px-4 py-3 rounded-lg flex items-center gap-3 shadow-sm">

                        {/* ICON */}
                        <div className="text-2xl">
                          {message.fileType?.includes("pdf")
                            ? "📄"
                            : message.fileType?.includes("word")
                              ? "📝"
                              : message.fileType?.includes("zip")
                                ? "🗜"
                                : "📎"}
                        </div>

                        {/* INFO */}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {fileUrl.split("/").pop()}
                          </span>
                          <span className="text-xs opacity-60">
                            {message.fileType}
                          </span>
                        </div>

                        {/* DOWNLOAD */}
                        <button
                          onClick={() => handleDownload(fileUrl)}
                          className="ml-auto btn btn-sm"
                        >
                          ⬇
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TEXT */}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}

        <div ref={messageEndRef}></div>
      </div>

      <MessageInput />

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={previewImage}
              alt="preview"
              className="max-h-[80vh] rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 btn btn-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;