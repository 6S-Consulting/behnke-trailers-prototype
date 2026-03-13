import { useState, useRef, useEffect } from "react";
import { useAdmin } from "@/admin/context/AdminContext";
import {
    processQuery,
    generateMessageId,
    getTypingDelay,
    suggestedQueries,
    ChatMessage,
} from "@/admin/ai/adminAssistant";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import {
    MessageCircle,
    X,
    Send,
    Brain,
    Sparkles,
    Minimize2,
    Maximize2,
    BarChart3,
} from "lucide-react";
import { cn } from "@/admin/lib/utils";

export function AIAssistantChat() {
    const { products, orders, quotes, customers, globalSteelIndex } = useAdmin();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: generateMessageId(),
            type: 'assistant',
            content: "👋 Hi! I'm your AI assistant. Ask me about margins, customers, inventory, or sales forecasts.",
            timestamp: new Date(),
            metadata: {
                suggestions: suggestedQueries.slice(0, 4)
            }
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMessage: ChatMessage = {
            id: generateMessageId(),
            type: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        // Process query
        const context = {
            products,
            orders,
            quotes,
            customers,
            globalSteelIndex,
        };

        const response = processQuery(userMessage.content, context);

        // Simulate typing delay
        const delay = typeof response === 'string'
            ? getTypingDelay(response)
            : getTypingDelay(response.content);

        setTimeout(() => {
            const assistantMessage: ChatMessage = {
                id: generateMessageId(),
                type: 'assistant',
                content: typeof response === 'string' ? response : response.content,
                timestamp: new Date(),
                metadata: typeof response === 'object' ? response.metadata : undefined,
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsTyping(false);
        }, delay);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Render message content with markdown-like formatting
    const renderContent = (content: string) => {
        // Simple markdown rendering
        const lines = content.split('\n');
        return lines.map((line, idx) => {
            // Bold text
            let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Bullet points
            if (formatted.startsWith('•') || formatted.startsWith('-')) {
                return (
                    <p key={idx} className="ml-2 text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />
                );
            }
            // Numbered lists
            if (/^\d+\./.test(formatted)) {
                return (
                    <p key={idx} className="ml-2 text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />
                );
            }
            return (
                <p key={idx} className="text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />
            );
        });
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-105"
            >
                <Brain className="h-6 w-6 text-white" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                <div className="absolute right-full mr-3 px-3 py-1.5 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="text-sm font-medium">AI Assistant</span>
                </div>
            </button>
        );
    }

    return (
        <div
            className={cn(
                "fixed z-50 bg-card border border-border rounded-lg shadow-2xl flex flex-col transition-all duration-300",
                isExpanded
                    ? "bottom-4 right-4 w-[500px] h-[600px]"
                    : "bottom-6 right-6 w-[380px] h-[500px]"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-purple-600/10 to-blue-600/10">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-sm">AI Assistant</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Powered by Hydraulic Intelligence
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            "flex",
                            message.type === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[85%] rounded-lg px-4 py-3",
                                message.type === 'user'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/50 border border-border"
                            )}
                        >
                            {message.type === 'assistant' && (
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="h-3 w-3 text-purple-500" />
                                    <span className="text-xs font-medium text-purple-500">AI Insight</span>
                                </div>
                            )}
                            <div className="space-y-1">
                                {renderContent(message.content)}
                            </div>

                            {/* Metrics */}
                            {message.metadata?.metrics && (
                                <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
                                    {message.metadata.metrics.map((metric, idx) => (
                                        <div key={idx} className="text-center">
                                            <p className="text-xs text-muted-foreground">{metric.label}</p>
                                            <p className="text-sm font-bold">{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Mini Chart */}
                            {message.metadata?.chartData && (
                                <div className="mt-3 pt-3 border-t border-border/50">
                                    <div className="flex items-end gap-1 h-16">
                                        {message.metadata.chartData.map((item, idx) => {
                                            const maxValue = Math.max(...message.metadata!.chartData!.map(i => i.value));
                                            const height = (item.value / maxValue) * 100;
                                            return (
                                                <div key={idx} className="flex-1 flex flex-col items-center">
                                                    <div
                                                        className="w-full bg-primary/60 rounded-t"
                                                        style={{ height: `${height}%` }}
                                                    />
                                                    <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
                                                        {item.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Suggestions */}
                            {message.metadata?.suggestions && (
                                <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-2">
                                    {message.metadata.suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-muted/50 border border-border rounded-lg px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Brain className="h-3 w-3 text-purple-500 animate-pulse" />
                                <div className="flex gap-1">
                                    <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about margins, customers, inventory..."
                        className="flex-1"
                        disabled={isTyping}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        size="icon"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    AI responses are estimates based on available data
                </p>
            </div>
        </div>
    );
}

export default AIAssistantChat;
