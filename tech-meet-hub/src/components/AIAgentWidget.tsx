import React, { useState, useRef, useEffect } from "react";

export interface EventItem {
  id: number | string;
  title: string;
  category: string;
  city: string;
  date: string;
  price: number;
}

interface AIAgentWidgetProps {
  events: EventItem[];
  dbEvents: any[];
  onOpenCabinet: () => void;
  onToggleTheme?: () => void;
  onGoToPricing?: () => void;
  isProUser: boolean;
}

export const AIAgentWidget: React.FC<AIAgentWidgetProps> = ({
  events = [],
  dbEvents = [],
  onGoToPricing,
  isProUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: "ai" | "user"; text: string }[]
  >([
    {
      sender: "ai",
      text: "გამარჯობა! მე ვარ TechMeet AI ასისტენტი. რით შემიძლია დაგეხმარო? მკითხე ივენთებზე, ბილეთებზე ან ტექნოლოგიურ სიახლეებზე!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // გაერთიანებული ივენთების სია
  const allEvents = dbEvents.length > 0 ? dbEvents : events;

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // დამზღვევი ჭკვიანი პასუხი, თუ Google-ის API-სთან კავშირი შეფერხდა
  const getSmartFallbackResponse = (userText: string): string => {
    const q = userText.toLowerCase();

    if (q.includes("გამარჯობა") || q.includes("სალამი") || q.includes("მოგესალმებით")) {
      return "გამარჯობა! მოხარული ვარ თქვენი ნახვით TechMeet-ზე. რა მიმართულების IT ივენთები გაინტერესებთ?";
    }

    if (q.includes("უფასო") || q.includes("free")) {
      const freeList = allEvents.filter((e) => Number(e.price) === 0);
      if (freeList.length > 0) {
        const names = freeList.slice(0, 3).map((e) => `• ${e.title} (${e.city || "თბილისი"})`).join("\n");
        return `ჩვენს პლატფორმაზე ხელმისაწვდომია უფასო ივენთები:\n${names}\n\nშეგიძლიათ პირდაპირ დარეგისტრირდეთ!`;
      }
      return "ამ ეტაპზე ყველა ივენთი ფასიანია, თუმცა რეგისტრაცია მარტივად შეგიძლიათ მთავარ გვერდზე.";
    }

    if (q.includes("ai") || q.includes("ხელოვნურ") || q.includes("ინტელექტ")) {
      const aiList = allEvents.filter((e) => 
        (e.title && e.title.toLowerCase().includes("ai")) || 
        (e.category && e.category.toLowerCase().includes("ai"))
      );
      if (aiList.length > 0) {
        const names = aiList.slice(0, 3).map((e) => `• ${e.title} — ${e.date || "მალე"}`).join("\n");
        return `ხელოვნური ინტელექტის თემატიკაზე გვაქვს შემდეგი ივენთები:\n${names}`;
      }
    }

    if (q.includes("პრო") || q.includes("pro") || q.includes("ფასი") || q.includes("პაკეტ")) {
      return "TechMeet PRO პაკეტი ღირს 40₾. ის გაძლევთ შეუზღუდავ წვდომას ყველა ივენთზე, დახურულ ტენდერებსა და AI ასისტენტზე!";
    }

    if (allEvents.length > 0) {
      const sample = allEvents.slice(0, 2).map((e) => `• ${e.title} (${e.date})`).join("\n");
      return `TechMeet-ზე უამრავი საინტერესო ღონისძიებაა! მაგალითად:\n${sample}\n\nრომელი მიმართულება გაინტერესებთ უფრო დეტალურად?`;
    }

    return "TechMeet-ის პლატფორმაზე შეგიძლიათ იპოვოთ საუკეთესო IT ივენთები, ჰაკათონები და ტენდერები. რით შემიძლია კიდევ დაგეხმაროთ?";
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setIsLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    if (!apiKey) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "ai", text: getSmartFallbackResponse(userMsg) }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    const systemPrompt = `შენ ხარ TechMeet-ის პერსონალური AI ასისტენტი. 
უპასუხე ქართულად, მოკლედ, ზრდილობიანად და მეგობრულად.
ინფორმაცია პლატფორმის შესახებ:
- სტანდარტული წვდომა უფასოა (პირველი 8 ივენთი).
- PRO პაკეტი ღირს 40₾ (განბლოკილია ყველა 9+ ივენთი, ტენდერები და AI ასისტენტი).
აქ არის ბაზაში არსებული მიმდინარე ივენთები:
${JSON.stringify(allEvents.map((ev) => ({ title: ev.title, category: ev.category, city: ev.city, date: ev.date, price: ev.price })))}
თუ გეკითხებიან ივენთებზე, ურჩიე ამ სიიდან. თუ არარელევანტურ თემაზე გკითხავენ, მოკლედ უთხარი რომ შენი მიზანი TechMeet-ის მომხმარებლების დახმარებაა.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nმომხმარებლის შეკითხვა: ${userMsg}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiReply) {
        setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
      } else {
        setMessages((prev) => [...prev, { sender: "ai", text: getSmartFallbackResponse(userMsg) }]);
      }
    } catch (error) {
      console.warn("Gemini REST API fallback activated:", error);
      // შეცდომის ჩვენების ნაცვლად მომენტალურად ერთვება ჭკვიანი ასისტენტი
      setMessages((prev) => [...prev, { sender: "ai", text: getSmartFallbackResponse(userMsg) }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="ai-widget-shell"
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <style>{`
        .ai-widget-chat {
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .ai-widget-shell {
            right: 20px !important;
            bottom: 80px !important;
            z-index: 9999 !important;
          }

          .ai-widget-chat {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100dvh !important;
            min-height: 100dvh !important;
            margin: 0 !important;
            border-radius: 0 !important;
            z-index: 9999 !important;
          }

          .ai-widget-chat-header {
            padding: max(16px, env(safe-area-inset-top)) 20px 16px !important;
            min-height: 64px;
          }

          .ai-widget-close {
            width: 44px !important;
            height: 44px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 1.5rem !important;
          }

          .ai-widget-messages {
            min-height: 0 !important;
            overscroll-behavior: contain;
          }

          .ai-widget-form {
            flex-shrink: 0 !important;
            padding: 12px 12px max(12px, env(safe-area-inset-bottom)) !important;
          }
        }
      `}</style>
      {isOpen && (
        <div
          className="ai-widget-chat"
          style={{
            width: "360px",
            height: "480px",
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            marginBottom: "16px",
            minHeight: 0,
          }}
        >
          {/* Header */}
          <div
            className="ai-widget-chat-header"
            style={{
              padding: "16px 20px",
              background: "#1e293b",
              borderBottom: "1px solid #334155",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                  <path d="M12 12L2.1 12a10 10 0 0 1 9.9-10v10z"></path>
                  <path d="M12 12v9.9a10 10 0 0 1-9.9-9.9H12z"></path>
                </svg>
              </div>
              <div>
                <h4
                  style={{
                    margin: 0,
                    color: "#f8fafc",
                    fontSize: "0.95rem",
                  }}
                >
                  Hub AI
                </h4>
                <span style={{ fontSize: "0.75rem", color: "#4ade80" }}>
                  ● ონლაინშია
                </span>
              </div>
            </div>
            <button
              className="ai-widget-close"
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {isProUser ? (
            <>
              {/* Chat Messages */}
              <div
                className="ai-widget-messages"
                style={{
                  flex: 1,
                  minHeight: 0,
                  padding: "16px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                      padding: "10px 14px",
                      borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                      background: msg.sender === "user" ? "linear-gradient(135deg, #38bdf8, #6366f1)" : "#1e293b",
                      color: "#f8fafc",
                      fontSize: "0.9rem",
                      lineHeight: "1.4",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                {isLoading && (
                  <div style={{ alignSelf: "flex-start", padding: "10px 14px", borderRadius: "16px 16px 16px 2px", background: "#1e293b", color: "#94a3b8", fontSize: "0.9rem" }}>
                    AI ფიქრობს...
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Form Input */}
              <form className="ai-widget-form" onSubmit={handleSend} style={{ padding: "12px", background: "#1e293b", borderTop: "1px solid #334155", display: "flex", gap: "8px" }}>
                <input 
                  type="text" 
                  placeholder="ჩაწერე შეკითხვა..." 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #334155", background: "#0f172a", color: "#fff", outline: "none", fontSize: "0.88rem" }} 
                />
                <button 
                  type="submit" 
                  style={{ padding: "10px 14px", background: "linear-gradient(135deg, #38bdf8, #6366f1)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", backgroundColor: "var(--bg-main)" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "20px" }}>
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>PRO ფუნქცია</h3>
              <p style={{ color: "var(--text-secondary)", textAlign: "center", marginBottom: "24px" }}>
                AI ასისტენტით სარგებლობისთვის და პერსონალური რჩევებისთვის გესაჭიროებათ PRO პაკეტი.
              </p>
              <button
                onClick={() => {
                  onGoToPricing?.();
                  setIsOpen(false);
                }}
                style={{ backgroundColor: "var(--accent-color)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px 20px", cursor: "pointer", fontWeight: "700" }}
              >
                პრო პაკეტის შეძენა
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #38bdf8, #6366f1)",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px 0 rgba(56, 189, 248, 0.4)",
          transition: "transform 0.2s ease",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </div>
  );
};