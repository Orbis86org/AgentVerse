import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // or any style you like


export default function ChatAgent({ agentSlug, walletAddress }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [maximized, setMaximized] = useState(false);
    const chatContainerRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Load previous chat
    useEffect(() => {
        if (!agentSlug || !walletAddress || initialized) return;

        const loadChat = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/history/${agentSlug}?walletAddress=${walletAddress}`);
                const data = await res.json();
                if (res.ok && Array.isArray(data.messages)) {
                    setMessages(data.messages);
                }
            } catch (err) {
                console.error('Error loading chat history:', err);
            } finally {
                setInitialized(true);
            }
        };

        loadChat();
    }, [agentSlug, walletAddress, initialized]);

    const sendMessage = async (prompt = null) => {
        const content = typeof prompt === 'string' ? prompt : input.trim();
        if (!content || !agentSlug || !walletAddress) {
            console.warn('Missing input, slug, or walletAddress:', { content, agentSlug, walletAddress });
            return;
        }

        const userMessage = {  id: uuidv4(), role: 'user', content, timestamp: new Date().toISOString() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const url = `${process.env.REACT_APP_BACKEND_URL}/api/chat-hcs`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: content, agentSlug, walletAddress }),
            });

            const data = await res.json();
            const assistantMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: data.output,
                timestamp: new Date().toISOString(),
                suggestions: data.suggestions || [],
            };

            const finalMessages = [...updatedMessages, assistantMessage];
            setMessages(finalMessages);

            // Save to history
            await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/history/${agentSlug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: finalMessages, walletAddress }),
            });
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Error fetching response.',
                timestamp: new Date().toISOString(),
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearHistory = async () => {
        if (!agentSlug || !walletAddress) return;
        try {
            await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/history/${agentSlug}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress }),
            });
            setMessages([]);
        } catch (err) {
            console.error('Failed to clear chat:', err);
        }
    };

    const exportChat = () => {
        const fileData = JSON.stringify(messages, null, 2);
        const blob = new Blob([fileData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `chat-${agentSlug}-${new Date().toISOString()}.json`;
        link.href = url;
        link.click();
    };


    return (
        <>
            <div
                style={{
                    background: '#1e1e1e',
                    color: '#fff',
                    padding: maximized ? 24 : 16,
                    borderRadius: 8,
                    position: maximized ? 'fixed' : 'relative',
                    top: 0,
                    left: 0,
                    width: maximized ? '100vw' : '100%',
                    height: maximized ? '100vh' : 'auto',
                    zIndex: maximized ? 9999 : 'auto',
                    overflow: 'hidden',
                }}
            >
                <div style={{textAlign: 'right', marginBottom: 8}}>
                    <button
                        onClick={() => setMaximized(!maximized)}
                        style={{
                            padding: '4px 10px',
                            fontSize: '0.8rem',
                            backgroundColor: '#444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                        }}
                    >
                        {maximized ? 'Minimize' : 'Maximize'}
                    </button>
                </div>
                <div
                    ref={chatContainerRef}
                    style={{
                        height: maximized ? 'calc(100vh - 180px)' : 300,
                        overflowY: 'auto',
                        marginBottom: 12,
                        paddingRight: 8,
                        transition: 'all 0.3s ease'
                    }}
                >
                    {messages.map((msg, i) => (
                        <div key={i} style={{marginBottom: '1rem', textAlign: msg.role === 'user' ? 'right' : 'left'}}>
                            <div
                                style={{
                                    display: 'inline-block',
                                    padding: '10px 14px',
                                    borderRadius: 16,
                                    background: msg.role === 'user' ? '#007bff' : '#333',
                                    color: '#fff',
                                    maxWidth: '80%',
                                    textAlign: 'left',
                                }}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                                        p: ({ children }) => <p style={{ marginBottom: 8 }}>{children}</p>,
                                        strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                                        code({ node, inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline ? (
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match?.[1] || 'text'}
                                                    PreTag="div"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code
                                                    style={{
                                                        background: '#333',
                                                        padding: '2px 4px',
                                                        borderRadius: 4,
                                                        fontSize: '0.9em',
                                                    }}
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        },
                                    }}
                                >
                                    {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                                </ReactMarkdown>

                                <div style={{fontSize: '0.75rem', marginTop: 4, opacity: 0.7}}>
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                            </div>

                            {msg.suggestions?.length > 0 && (
                                <div style={{marginTop: 8}}>
                                    {msg.suggestions.map((sug, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sendMessage(sug)}
                                            style={{
                                                margin: '4px 4px 0 0',
                                                padding: '4px 10px',
                                                fontSize: '0.8rem',
                                                backgroundColor: '#444',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 4,
                                            }}
                                        >
                                            {sug}
                                        </button>
                                    ))}
                                </div>
                            )}

                        </div>
                    ))}
                    {loading && <div><em>Agent is typing...</em></div>}
                </div>

                <textarea
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask the agent something..."
                    style={{
                        width: '100%',
                        background: '#2a2a2a',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: 10,
                        borderRadius: 4,
                    }}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10}}>
                    <div>
                        <button
                            onClick={clearHistory}
                            style={{
                                padding: '6px 12px',
                                marginRight: 10,
                                backgroundColor: '#dc3545',
                                border: 'none',
                                borderRadius: 4,
                                color: '#fff',
                            }}
                        >
                            Clear History
                        </button>
                        <button
                            onClick={exportChat}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#6c757d',
                                border: 'none',
                                borderRadius: 4,
                                color: '#fff',
                            }}
                        >
                            Export Chat
                        </button>
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            opacity: !input.trim() ? 0.6 : 1,
                            cursor: !input.trim() ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </>
    );
}
