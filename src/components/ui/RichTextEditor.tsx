"use client";

import { useRef, useEffect, useState } from "react";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "",
  rows = 8,
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isFocused) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, isFocused]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      // Preserve line breaks by converting them to <br>
      const lines = text.split("\n");
      lines.forEach((line, index) => {
        const textNode = document.createTextNode(line);
        range.insertNode(textNode);

        if (index < lines.length - 1) {
          const br = document.createElement("br");
          range.insertNode(br);
        }
      });

      // Move cursor after inserted content
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          document.execCommand("bold", false);
          handleInput();
          return;
        case "i":
          e.preventDefault();
          document.execCommand("italic", false);
          handleInput();
          return;
        case "u":
          e.preventDefault();
          document.execCommand("underline", false);
          handleInput();
          return;
      }
    }

    // Handle Enter key for auto-numbering and auto-bullets
    if (e.key === "Enter" && editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Create a range from start of editor to cursor
        const textRange = document.createRange();
        textRange.selectNodeContents(editorRef.current);
        textRange.setEnd(range.startContainer, range.startOffset);

        // Clone the contents up to cursor
        const fragment = textRange.cloneContents();
        const tempDiv = document.createElement("div");
        tempDiv.appendChild(fragment);

        // Get text content, replacing <br> with newlines
        let textWithBreaks = "";
        const walker = document.createTreeWalker(
          tempDiv,
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
          null
        );

        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (node.nodeType === Node.TEXT_NODE) {
            textWithBreaks += (node as Text).textContent || "";
          } else if (node.nodeName === "BR") {
            textWithBreaks += "\n";
          }
        }

        // Split by line breaks and get the last line
        const lines = textWithBreaks.split(/\r?\n/);
        const currentLine = lines[lines.length - 1] || "";

        // Check for numbered pattern (1. , 2. , etc.)
        const numberedMatch = currentLine.match(/^(\d+)\.\s?/);

        // Check for bullet pattern (- , * , etc.) - with or without space
        const bulletMatch = currentLine.match(/^([-*])\s?/);

        if (numberedMatch) {
          e.preventDefault();
          const currentNumber = parseInt(numberedMatch[1]);
          const nextNumber = currentNumber + 1;

          // Delete any selected content first
          range.deleteContents();

          // If cursor is in the middle of a text node, split it
          if (range.startContainer.nodeType === Node.TEXT_NODE) {
            const textNode = range.startContainer as Text;
            const offset = range.startOffset;
            const text = textNode.textContent || "";

            if (offset < text.length) {
              // Split the text node
              const afterText = text.substring(offset);
              const beforeText = text.substring(0, offset);

              // Update current node with text before cursor
              textNode.textContent = beforeText;

              // Create new text node for text after cursor
              const afterNode = document.createTextNode(afterText);
              textNode.parentNode?.insertBefore(
                afterNode,
                textNode.nextSibling
              );

              // Update range to point to the new node
              range.setStart(afterNode, 0);
              range.collapse(true);
            }
          }

          // Insert line break
          const br = document.createElement("br");
          range.insertNode(br);

          // Move range to after the line break
          range.setStartAfter(br);
          range.collapse(true);

          // Insert the next number
          const nextNumberText = document.createTextNode(`${nextNumber}. `);
          range.insertNode(nextNumberText);

          // Move cursor to after the number
          range.setStartAfter(nextNumberText);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);

          handleInput();
          return;
        } else if (bulletMatch) {
          e.preventDefault();

          // Delete any selected content first
          range.deleteContents();

          // If cursor is in the middle of a text node, split it
          if (range.startContainer.nodeType === Node.TEXT_NODE) {
            const textNode = range.startContainer as Text;
            const offset = range.startOffset;
            const text = textNode.textContent || "";

            if (offset < text.length) {
              // Split the text node
              const afterText = text.substring(offset);
              const beforeText = text.substring(0, offset);

              // Update current node with text before cursor
              textNode.textContent = beforeText;

              // Create new text node for text after cursor
              const afterNode = document.createTextNode(afterText);
              textNode.parentNode?.insertBefore(
                afterNode,
                textNode.nextSibling
              );

              // Update range to point to the new node
              range.setStart(afterNode, 0);
              range.collapse(true);
            }
          }

          // Insert line break
          const br = document.createElement("br");
          range.insertNode(br);

          // Move range to after the line break
          range.setStartAfter(br);
          range.collapse(true);

          // Insert the bullet with space (use the matched bullet character)
          const bulletChar = bulletMatch[1]; // Get the matched character (- or *)
          const bulletText = document.createTextNode(`${bulletChar} `);
          range.insertNode(bulletText);

          // Move cursor to after the bullet
          range.setStartAfter(bulletText);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);

          handleInput();
          return;
        }
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${className}`}
        style={{
          minHeight: `${rows * 1.5}rem`,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `,
        }}
      />

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Use toolbar buttons or keyboard shortcuts (Ctrl+B for bold, Ctrl+I for
        italic, Ctrl+U for underline)
      </p>
    </div>
  );
}
