"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, User } from "lucide-react";
import axios from "axios";

interface Message {
    role: "user" | "model";
    content: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", content: "您好！我是您的專屬私人購物顧問 ✨\n請問您今天想找什麼樣的商品？我可以記錄您的需求並為您推薦最適合的選擇喔！" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`https://manager-ec-backend-164815154526.asia-east1.run.app/chat`, {
                messages: updatedMessages
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            
            if (res.data.reply) {
                setMessages(prev => [...prev, { role: "model", content: res.data.reply }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "model", content: "抱歉，系統似乎遇到一點問題，請稍後再試。" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    const renderMessage = (content: string) => {
        const parts = [];
        let lastIndex = 0;
        const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push(content.substring(lastIndex, match.index));
            }
            parts.push(
                <a 
                    key={match.index} 
                    href={match[2]} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-moso-pink hover:text-moso-red underline font-bold"
                >
                    {match[1]}
                </a>
            );
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
        }

        return parts;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-16 right-0 w-80 md:w-96 h-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-moso-pink text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Sparkles size={20} />
                                <h3 className="font-bold">私人購物顧問</h3>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900 flex flex-col gap-4">
                            {messages.map((msg, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-slate-200 dark:bg-slate-700" : "bg-moso-pink/20 text-moso-pink"}`}>
                                        {msg.role === "user" ? <User size={16} className="text-slate-500 dark:text-slate-300" /> : <Sparkles size={16} />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${
                                        msg.role === "user" 
                                            ? "bg-moso-pink text-white rounded-tr-none" 
                                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-tl-none"
                                    }`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.role === "model" ? renderMessage(msg.content) : msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 max-w-[85%] self-start">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-moso-pink/20 text-moso-pink">
                                        <Sparkles size={16} />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-tl-none flex items-center gap-1">
                                        <motion.div className="w-2 h-2 bg-slate-300 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                                        <motion.div className="w-2 h-2 bg-slate-300 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                                        <motion.div className="w-2 h-2 bg-slate-300 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="輸入您的問題..."
                                className="flex-1 bg-slate-100 dark:bg-slate-900 border-transparent rounded-full px-4 text-sm focus:ring-2 focus:ring-moso-pink focus:border-transparent outline-none text-slate-800 dark:text-slate-200"
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isLoading}
                                className="w-10 h-10 rounded-full bg-moso-pink text-white flex items-center justify-center hover:bg-moso-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                            >
                                <Send size={18} className="ml-1" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                id="chat-widget-trigger"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${isOpen ? 'bg-slate-800 text-white scale-90' : 'bg-moso-pink hover:bg-moso-red text-white scale-100'}`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}
