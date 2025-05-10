import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Avatar, Loader } from "rsuite";
import { formatMessageDate, formatMessageTime } from "../../lib/formatters";
import { useChat } from "../../context/ChatContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface ChatMessage {
  id: string;
  sender: "customer" | "shopper";
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  image?: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
}

export default function ChatDrawer({
  isOpen,
  onClose,
  orderId,
  customerId,
  customerName,
  customerAvatar = "/placeholder.svg?height=80&width=80",
}: ChatDrawerProps) {
  const { sendMessage, getMessages, markMessagesAsRead } = useChat();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Get messages from context
  const messages = getMessages(orderId);

  // Mark messages as read when drawer opens and when new messages arrive
  useEffect(() => {
    if (isOpen) {
      markMessagesAsRead(orderId);
    }
  }, [isOpen, markMessagesAsRead, orderId, messages]);

  // Scroll to bottom when messages change or drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    try {
      setIsSending(true);
      await sendMessage(orderId, message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachmentClick = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setUploadingImage(true);
        const file = e.target.files[0];

        // Upload image to Firebase Storage
        const storage = getStorage();
        const storageRef = ref(
          storage,
          `chat_images/${orderId}/${Date.now()}_${file.name}`
        );

        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Send message with image
        await sendMessage(orderId, "", downloadURL);

        setShowAttachmentOptions(false);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Group messages by date for better display
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";
    let currentGroup: ChatMessage[] = [];

    messages.forEach((message) => {
      const messageDate = formatMessageDate(message.timestamp);

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col bg-white shadow-lg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center">
          <Button
            appearance="subtle"
            className="mr-3 flex h-8 w-8 items-center justify-center p-0"
            onClick={onClose}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Button>
          <div className="flex items-center">
            <Avatar
              src={customerAvatar}
              alt={customerName}
              size="sm"
              circle
              className="mr-3"
            />
            <div>
              <h1 className="font-bold">{customerName}</h1>
              <div className="text-xs text-gray-500">Order #{orderId}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mb-3 h-12 w-12"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>No messages yet</p>
            <p className="text-sm">
              Start the conversation with {customerName}
            </p>
          </div>
        ) : (
          <div>
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-6">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                    {group.date}
                  </div>
                </div>

                {group.messages.map((msg, index) => {
                  const isShopperMessage = msg.sender === "shopper";
                  const showAvatar =
                    index === 0 ||
                    group.messages[index - 1].sender !== msg.sender;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isShopperMessage ? "justify-end" : "justify-start"
                      } mb-4`}
                    >
                      {!isShopperMessage && showAvatar && (
                        <Avatar
                          src={customerAvatar}
                          alt={customerName}
                          size="xs"
                          circle
                          className="mb-1 mr-2 self-end"
                        />
                      )}

                      <div
                        className={`max-w-[75%] ${
                          !isShopperMessage && !showAvatar ? "ml-8" : ""
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isShopperMessage
                              ? "rounded-tr-none bg-blue-500 text-white"
                              : "rounded-tl-none bg-white text-gray-800"
                          }`}
                        >
                          {msg.text && (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          )}
                          {msg.image && (
                            <div className="mt-2">
                              <Image
                                src={msg.image}
                                alt="Shared image"
                                width={300}
                                height={200}
                                className="max-w-full rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                        <div className="mt-1 flex items-center">
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(msg.timestamp)}
                          </span>
                          {isShopperMessage && (
                            <span className="ml-1">
                              {msg.status === "sent" ? (
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="h-3 w-3 text-gray-400"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="h-3 w-3 text-blue-500"
                                >
                                  <path d="M18 6L7 17L2 12" />
                                  <path d="M22 6L11 17L8 14" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {isShopperMessage && showAvatar && (
                        <Avatar
                          src="/placeholder.svg?height=80&width=80"
                          alt="Shopper"
                          size="xs"
                          circle
                          className="mb-1 ml-2 self-end"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Replies */}
      <div className="overflow-x-auto whitespace-nowrap border-t bg-white p-2">
        <div className="flex gap-2">
          <Button
            appearance="ghost"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setMessage("I found it")}
          >
            I found it
          </Button>
          <Button
            appearance="ghost"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setMessage("They&#39;re out of stock")}
          >
            They&#39;re out of stock
          </Button>
          <Button
            appearance="ghost"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setMessage("Would you like an alternative?")}
          >
            Alternative?
          </Button>
        </div>
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 border-t bg-white p-3">
        <div className="relative flex items-center">
          <div className="relative">
            <Button
              appearance="subtle"
              className="flex h-10 w-10 items-center justify-center p-0"
              onClick={handleAttachmentClick}
              disabled={isSending || uploadingImage}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5 text-gray-500"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
            </Button>

            {/* Attachment Options Popup */}
            {showAttachmentOptions && (
              <div className="absolute bottom-12 left-0 z-10 rounded-lg bg-white p-2 shadow-lg">
                <div className="flex flex-col gap-2">
                  <button
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5 text-blue-500"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Gallery</span>
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100"
                    onClick={() =>
                      alert("Camera functionality would open here")
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5 text-red-500"
                    >
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>Camera</span>
                  </button>
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <textarea
            className="flex-1 resize-none rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            style={{ maxHeight: "100px" }}
            disabled={isSending || uploadingImage}
          />

          <Button
            appearance={message.trim() ? "primary" : "subtle"}
            className={`ml-2 flex h-10 w-10 items-center justify-center rounded-full p-0 ${
              message.trim() ? "bg-blue-500 text-white" : "text-gray-400"
            }`}
            onClick={handleSendMessage}
            disabled={(!message.trim() && !uploadingImage) || isSending}
          >
            {isSending || uploadingImage ? (
              <Loader size="sm" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
