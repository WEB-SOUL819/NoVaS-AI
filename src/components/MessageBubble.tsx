
import React from "react";
import { cn } from "@/lib/utils";
import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  className,
}) => {
  // Determine styles based on message role
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const isSystem = message.role === "system";

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "px-4 py-3 rounded-xl max-w-[80%] text-sm",
          isUser
            ? "bg-nova-600 text-white rounded-tr-none"
            : isError
            ? "bg-destructive text-destructive-foreground rounded-tl-none"
            : isSystem
            ? "bg-muted text-muted-foreground"
            : "bg-purple-700 text-white rounded-tl-none glass-panel",
          message.isProcessing && "animate-pulse"
        )}
      >
        {message.content}
        
        <div className={cn(
          "text-xs mt-1 opacity-60 text-right",
          isUser ? "text-white/60" : "text-white/60"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
