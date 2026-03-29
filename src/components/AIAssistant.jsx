import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Sparkles, Send, Mic, MapPin, Briefcase } from 'lucide-react';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Merhaba! Ben Kadromatik Akıllı Rehber. Geleceğini sesinle kurmana yardımcı olmaya geldim. 🎙️✨' },
        { id: 2, type: 'bot', text: 'Senin için en yakın işleri bulabilir, Sesli CV oluştururken ipuçları verebilirim. Hangi konuda yardıma ihtiyacın var?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulating bot response
        setTimeout(() => {
            let response = "Anladım! Bu konuda sana yardımcı olmamı ister misin?";
            if (input.toLowerCase().includes("cv") || input.toLowerCase().includes("sesli")) {
                response = "Harika bir Sesli CV için: Özgeçmişinden bahsederken enerjik olmanı ve en son çalıştığın 2 projeyi kısaca özetlemeni öneririm. 🎙️ Başlayalım mı?";
            } else if (input.toLowerCase().includes("iş") || input.toLowerCase().includes("ilan")) {
                response = "Şu an Afyon ve çevresinde Naturel A.Ş. dahil 124 aktif ilanım var. Harita üzerinden sana en yakınları hemen filtreleyebiliriz! 📍";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: response }]);
        }, 1000);
    };

    return createPortal(
        <>
            {/* Floating Toggle Button */}
            <div style={{ position: 'fixed', bottom: '2.5rem', right: '2.5rem', zIndex: 3000 }}>
                <motion.button
                    style={{
                        width: 64, height: 64,
                        background: 'var(--primary)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                        border: '4px solid white',
                        cursor: 'pointer',
                        position: 'relative',
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                    {!isOpen && (
                        <span style={{
                            position: 'absolute', top: -4, right: -4,
                            width: 18, height: 18,
                            background: 'var(--success)',
                            borderRadius: '50%',
                            border: '2px solid white',
                            animation: 'pulse 2s ease-in-out infinite'
                        }} />
                    )}
                </motion.button>
            </div>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        style={{
                            position: 'fixed',
                            bottom: '7rem', right: '2.5rem',
                            zIndex: 3000,
                            width: 400,
                            maxWidth: 'calc(100vw - 2rem)',
                            height: 550,
                            background: 'white',
                            borderRadius: 32,
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            overflow: 'hidden',
                            border: '1px solid var(--light)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    >
                        {/* Header */}
                        <div style={{ background: 'var(--primary)', padding: '1.5rem 2rem', color: 'white', flexShrink: 0 }}>
                            <div className="flex items-center gap-4">
                                <div style={{
                                    width: 48, height: 48,
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: 16,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Sparkles size={24} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Akıllı Rehber</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>Kadromatik AI • Çevrimiçi</div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8f9fa' }}>
                            {messages.map((msg) => (
                                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        background: msg.type === 'user' ? 'var(--primary)' : 'white',
                                        color: msg.type === 'user' ? 'white' : 'var(--dark)',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                        border: msg.type === 'bot' ? '1px solid var(--light)' : 'none',
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Suggestions */}
                        <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', flexShrink: 0 }}>
                            <SuggestionChip text="Sesli CV İpuçları" icon={<Mic size={14} />} />
                            <SuggestionChip text="Yakın İş İlanları" icon={<MapPin size={14} />} />
                            <SuggestionChip text="Nasıl Kullanılır?" icon={<Briefcase size={14} />} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} style={{ padding: '1rem 1.5rem', background: 'white', borderTop: '1px solid var(--light)', display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                            <input
                                type="text"
                                placeholder="Mesajınızı yazın..."
                                style={{ flex: 1, background: 'var(--light)', border: 'none', outline: 'none', padding: '0.75rem 1rem', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600 }}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>,
        document.body
    );
};

const SuggestionChip = ({ text, icon }) => (
    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-light rounded-full text-xs font-bold text-muted whitespace-nowrap hover:border-primary hover:text-primary transition-all shadow-sm">
        {icon} {text}
    </button>
);

export default AIAssistant;
