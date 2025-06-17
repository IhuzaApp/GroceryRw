import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Avatar, Input } from 'rsuite';
import { formatMessageDate } from '../../lib/formatters';
import { ChevronRight, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text?: string;
  message?: string;
  senderId: string;
  senderType: "customer" | "shopper";
  recipientId: string;
  timestamp: any;
  read: boolean;
  image?: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  shopper: any;
  messages?: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e?: React.FormEvent) => void;
  isSending: boolean;
  currentUserId: string;
}

const Message: React.FC<{
  message: Message;
  isCurrentUser: boolean;
  senderName: string;
}> = ({ message, isCurrentUser, senderName }) => {
  const messageContent = message.text || message.message || "";

  return (
    <div className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      {!isCurrentUser && <Avatar color="blue" circle size="xs" />}
      <div
        className={`max-w-[85%] ${
          isCurrentUser
            ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
            : "bg-blue-100 text-gray-900 dark:bg-blue-900 dark:text-blue-100"
        } rounded-[20px] p-3`}
      >
        {!isCurrentUser && (
          <div className="mb-1 flex gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
            {senderName}{" "}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatMessageDate(message.timestamp)}
            </span>
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm">{messageContent}</div>
        {message.image && (
          <div className="mt-2">
            <Avatar color="blue" circle />
          </div>
        )}
      </div>
      {isCurrentUser && <Avatar color="green" circle size="xs" />}
    </div>
  );
};

export default function ChatDrawer({
  isOpen,
  onClose,
  order,
  shopper,
  messages = [],
  newMessage,
  setNewMessage,
  handleSendMessage,
  isSending,
  currentUserId,
}: ChatDrawerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate loading time for messages and data
      const timer = setTimeout(() => {
        setIsLoading(false);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopper?.id) {
      console.error("Cannot send message: Shopper ID is missing");
      return;
    }
    handleSendMessage(e);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-0 z-[1000] hidden h-[calc(100vh-4rem)] w-96 transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-800 md:block">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Button
            appearance="ghost"
            onClick={onClose}
            className="p-2"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div>
            <h6 className="font-medium text-gray-900 dark:text-white">
              Order #{order?.id}
            </h6>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {shopper?.name || "Shopper"}
            </p>
          </div>
        </div>
        <Button
          appearance="ghost"
          onClick={() => router.push(`/Messages/${order?.id}`)}
          className="p-2"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-green-500 dark:border-gray-600 dark:border-t-green-400"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {(messages || []).map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  isCurrentUser={message.senderId === currentUserId}
                  senderName={
                    message.senderId === currentUserId
                      ? "You"
                      : shopper?.name || "Shopper"
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={setNewMessage}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  appearance="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="ml-2"
                >
                  Send
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
