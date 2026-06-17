"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Bot, Sparkles, Send, StopCircle, Lightbulb } from "lucide-react";
import { suggestedPrompts, getMockResponse } from "@/data";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function formatResponse(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h4 key={`h${i}`} className="text-xs font-semibold text-text-primary mt-4 mb-2">
          {trimmed.slice(4)}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      nodes.push(
        <h3 key={`h${i}`} className="text-sm font-semibold text-text-primary mt-5 mb-2">
          {trimmed.slice(3)}
        </h3>
      );
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      nodes.push(
        <p key={`p${i}`} className="text-xs font-semibold text-text-primary mt-3 mb-1">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else if (trimmed.startsWith("| ") && trimmed.includes("|---")) {
      continue;
    } else if (trimmed.startsWith("| ")) {
      if (!inTable) {
        inTable = true;
      }
      continue;
    } else if (trimmed.startsWith("1. ") || trimmed.startsWith("2. ") || trimmed.startsWith("3. ") || trimmed.startsWith("4. ") || trimmed.startsWith("5. ") || trimmed.startsWith("6. ")) {
      const num = trimmed.slice(0, 2);
      const content = trimmed.slice(3);
      const boldMatch = content.match(/^\*\*(.+?)\*\*\s*—\s*(.+)/);
      if (boldMatch) {
        nodes.push(
          <div key={`li${i}`} className="flex items-start gap-2 text-xs text-text-secondary py-0.5">
            <span className="text-text-muted shrink-0">{num}</span>
            <span><strong className="text-text-primary">{boldMatch[1]}</strong> — {boldMatch[2]}</span>
          </div>
        );
      } else {
        nodes.push(
          <div key={`li${i}`} className="flex items-start gap-2 text-xs text-text-secondary py-0.5">
            <span className="text-text-muted shrink-0">{num}</span>
            <span>{content}</span>
          </div>
        );
      }
    } else if (trimmed.startsWith("- **")) {
      const match = trimmed.match(/^- \*\*(.+?)\*\*(.*)/);
      if (match) {
        nodes.push(
          <div key={`li${i}`} className="flex items-start gap-2 text-xs text-text-secondary py-0.5">
            <span className="text-accent-cyan-light shrink-0 mt-0.5">•</span>
            <span><strong className="text-text-primary">{match[1]}</strong>{match[2]}</span>
          </div>
        );
      } else {
        nodes.push(
          <div key={`li${i}`} className="flex items-start gap-2 text-xs text-text-secondary py-0.5">
            <span className="text-text-muted shrink-0">•</span>
            <span>{trimmed.slice(2)}</span>
          </div>
        );
      }
    } else if (trimmed === "") {
      inTable = false;
      nodes.push(<div key={`sp${i}`} className="h-1" />);
    } else if (trimmed.startsWith("*Analysis") || trimmed.startsWith("*Summary")) {
      nodes.push(
        <p key={`p${i}`} className="text-[10px] text-text-muted italic mt-3 pt-2 border-t border-default-border/40">
          {trimmed.replace(/\*/g, "")}
        </p>
      );
    } else {
      const boldParts = trimmed.split(/(\*\*.+?\*\*)/g);
      const formatted = boldParts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={`b${j}`} className="text-text-primary">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      nodes.push(
        <p key={`p${i}`} className="text-xs text-text-secondary leading-relaxed">
          {formatted}
        </p>
      );
    }
  }

  return nodes;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI security assistant. I can help you analyze campaign results, identify risk patterns, and suggest improvements for your security awareness program. Try one of the suggested prompts below or ask your own question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = useCallback((text: string) => {
    const q = text.trim();
    if (!q || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setShowSuggestions(false);
    setIsTyping(true);

    setTimeout(() => {
      const response = getMockResponse(q);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  }, [isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handlePromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="AI Assistant"
        description="AI-powered assistant for phishing simulation insights and recommendations"
      />

      <div className="border border-default-border bg-surface rounded-xl flex flex-col h-[640px]">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center justify-center size-8 rounded-lg bg-accent-purple/10 shrink-0 mt-1">
                  <Bot className="size-4 text-accent-purple-light" />
                </div>
              )}

              <div
                className={`rounded-xl p-3.5 ${
                  msg.role === "user"
                    ? "bg-accent-blue/10 border border-accent-blue/20 max-w-[75%]"
                    : "bg-void border border-default-border/40 max-w-[85%]"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="space-y-0.5">{formatResponse(msg.content)}</div>
                ) : (
                  <p className="text-xs text-text-primary">{msg.content}</p>
                )}
              </div>

              {msg.role === "user" && (
                <div className="flex items-center justify-center size-8 rounded-lg bg-accent-blue/10 shrink-0 mt-1">
                  <Sparkles className="size-4 text-accent-blue-light" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center size-8 rounded-lg bg-accent-purple/10 shrink-0">
                <Bot className="size-4 text-accent-purple-light" />
              </div>
              <div className="bg-void border border-default-border/40 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-accent-purple-light animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="size-1.5 rounded-full bg-accent-purple-light animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="size-1.5 rounded-full bg-accent-purple-light animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {showSuggestions && messages.length === 1 && (
            <div className="pt-2 pb-1">
              <div className="flex items-center gap-1.5 mb-3">
                <Lightbulb className="size-3.5 text-status-warning" />
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">Suggested Prompts</span>
                <div className="flex-1 h-px bg-default-border/40" />
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-[11px] text-text-secondary bg-surface border border-default-border hover:border-accent-purple/30 hover:text-accent-purple-light rounded-lg px-2.5 py-1.5 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-default-border p-4">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about campaigns, risk analysis, or recommendations..."
              disabled={isTyping}
              className="flex-1 rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              aria-label={isTyping ? "Stop" : "Send message"}
              className="flex items-center justify-center size-8 rounded-lg bg-accent-blue hover:bg-accent-blue-dim text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isTyping ? <StopCircle className="size-4" /> : <Send className="size-4" />}
            </button>
          </div>
          <p className="text-[10px] text-text-muted mt-2">
            AI responses are generated from your organization's data. Responses may not reflect real-time changes.
          </p>
        </div>
      </div>
    </div>
  );
}
