import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Paperclip, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const socket = useAuthStore.getState().socket;

  // ================= FILE CHANGE =================
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // ❌ remove image-only restriction
    // ❌ remove 2MB limit

    setFile(selectedFile);

    // preview only if image
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  // ================= REMOVE FILE =================
  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ================= TYPING =================
  const handleTyping = () => {
    if (!socket || !selectedUser) return;
    socket.emit("typing", { to: selectedUser._id });
  };

  // ================= SEND =================
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !file) return;

    try {
      setIsSending(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("text", text.trim());

      if (file) {
        formData.append("file", file);
      }

      await sendMessage(formData, setUploadProgress);

      setText("");
      removeFile();

    } catch (error) {
      toast.error("Send failed");
    } finally {
      setIsSending(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-4 w-full">

      {/* ================= PROGRESS ================= */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-gray-200 h-2 rounded mb-2">
          <div
            className="bg-green-500 h-2 rounded"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* ================= PREVIEW ================= */}
      {file && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">

            {filePreview ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border"
              />
            ) : (
              <div className="px-3 py-2 bg-base-200 rounded-lg text-sm">
                📎 {file.name}
              </div>
            )}

            <button
              onClick={removeFile}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* ================= INPUT ================= */}
      <form onSubmit={handleSendMessage} className="flex gap-2">

        <input
          type="text"
          placeholder="Type a message..."
          className="input input-bordered w-full"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
        />

        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-circle"
        >
          <Paperclip size={18} />
        </button>

        <button
          type="submit"
          className="btn btn-circle"
          disabled={isSending}
        >
          {isSending ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Send size={18} />
          )}
        </button>

      </form>
    </div>
  );
};

export default MessageInput;