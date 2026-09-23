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

// 🔹 დახვეწილი ვექტორული რობოტის აიკონი AI-სთვის
const RobotIcon: React.FC<{ size?: number }> = ({ size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0 2px 6px rgba(56, 189, 248, 0.45))",
        flexShrink: 0,
      }}
    >
      <defs>
        <linearGradient id="aiAntennaGrad" x1="50" y1="6" x2="50" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f43f5e" />
          <stop offset="1" stopColor="#e11d48" />
        </linearGradient>

        <linearGradient id="aiHeadBorderGrad" x1="20" y1="20" x2="80" y2="65" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>

        <linearGradient id="aiScreenGrad" x1="26" y1="26" x2="74" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#090d16" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="aiBodyGrad" x1="32" y1="68" x2="68" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>

        <linearGradient id="aiEarGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#64748b" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* ანტენა */}
      <rect x="47.5" y="15" width="5" height="10" rx="2.5" fill="#94a3b8" />
      <circle cx="50" cy="11" r="6" fill="url(#aiAntennaGrad)" />
      <circle cx="48" cy="9" r="2" fill="#ffe4e6" opacity="0.8" />

      {/* ყურები */}
      <rect x="12" y="34" width="7" height="16" rx="3.5" fill="url(#aiEarGrad)" />
      <rect x="81" y="34" width="7" height="16" rx="3.5" fill="url(#aiEarGrad)" />

      {/* თავის კორპუსი */}
      <rect x="18" y="22" width="64" height="42" rx="14" fill="url(#aiHeadBorderGrad)" />
      
      {/* ეკრანი */}
      <rect x="25" y="27" width="50" height="32" rx="9" fill="url(#aiScreenGrad)" stroke="#1e293b" strokeWidth="1.5" />

      {/* თვალები */}
      <circle cx="39" cy="40" r="5.5" fill="#38bdf8" />
      <circle cx="37.5" cy="38" r="1.8" fill="#ffffff" />
      <circle cx="61" cy="40" r="5.5" fill="#38bdf8" />
      <circle cx="59.5" cy="38" r="1.8" fill="#ffffff" />

      {/* ღაწვები */}
      <circle cx="32" cy="48" r="3" fill="#f43f5e" opacity="0.8" />
      <circle cx="68" cy="48" r="3" fill="#f43f5e" opacity="0.8" />

      {/* ღიმილი */}
      <path d="M44 48C47 52 53 52 56 48" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />

      {/* ყელი */}
      <rect x="45" y="64" width="10" height="4" rx="2" fill="#64748b" />

      {/* სხეული */}
      <rect x="32" y="68" width="36" height="24" rx="9" fill="url(#aiBodyGrad)" stroke="#818cf8" strokeWidth="1.2" />

      {/* ბირთვი */}
      <circle cx="50" cy="80" r="4.5" fill="#38bdf8" />
      <circle cx="50" cy="80" r="2" fill="#ffffff" />
    </svg>
  );
};

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
  const allEvents = dbEvents.length > 0 ? dbEvents : events;

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.25))",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* 🔹 რობოტის აიკონი ჩათის ჰედერში */}
                <RobotIcon size={26} />
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

      {/* 🔹 Floating Toggle Button რობოტის აიკონით */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        style={{
          width: "62px",
          height: "62px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
          border: "2px solid rgba(255, 255, 255, 0.25)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 30px 0 rgba(56, 189, 248, 0.45)",
          transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 14px 35px 0 rgba(99, 102, 241, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 10px 30px 0 rgba(56, 189, 248, 0.45)";
        }}
      >
        <RobotIcon size={36} />
      </button>
    </div>
  );
};