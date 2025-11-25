"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyButtonProps {
  character: string;
  className?: string;
}

export function CopyButton({ character, className = "" }: CopyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(character);
    toast.success("Copied!");
  };

  return (
    <button
      onClick={handleCopy}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-all duration-150 text-sm font-medium cursor-pointer ${
        isPressed ? "transform scale-95" : ""
      } ${className}`}
      title="Copy character to clipboard"
    >
      <Copy className="w-4 h-4" />
      Copy
    </button>
  );
}
