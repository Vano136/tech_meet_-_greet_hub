import React, { useState } from "react";

interface EventItem {
  id: number | string;
  title: string;
  category: string;
  city: string;
  date: string;
  price: number;
  format?: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  onAddEvent: (event: EventItem) => void;
  onDeleteEvent: (id: number | string) => void;
  onUpdateEvent: (event: EventItem) => void;
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 16px",
  border: "1px solid var(--border-color)",
  borderRadius: "12px",
  backgroundColor: "var(--bg-main)",
  color: "var(--text-primary)",
  outline: "none",
  fontFamily: "inherit",
  fontSize: "0.95rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "var(--text-secondary)",
  fontSize: "0.9rem",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-card)",
  borderRadius: "20px",
  padding: "32px",
  border: "1px solid var(--border-color)",
  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  events,
  onAddEvent,
  onDeleteEvent,
  onUpdateEvent,
}) => {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ჰაკათონი");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [format, setFormat] = useState("ონლაინ");

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setCategory("ჰაკათონი");
    setCity("");
    setDate("");
    setPrice("");
    setFormat("ონლაინ");
  };

  const handleStartEdit = (event: EventItem) => {
    setEditingId(event.id);
    setTitle(event.title);
    setCategory(event.category);
    setCity(event.city);
    setDate(event.date);
    setPrice(String(event.price));
    setFormat(event.format || "ონლაინ");
    setActiveTab("create");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const eventData: EventItem = { id: editingId ?? Date.now(), title, category, city, date, price: Number(price), format };
    if (editingId !== null) onUpdateEvent(eventData);
    else onAddEvent(eventData);
    resetForm();
    setActiveTab("list");
  };

  const totalEvents = events.length;
  const freeEvents = events.filter((event) => event.price === 0).length;
  const paidEvents = totalEvents - freeEvents;

  if (!isOpen) return null;

  return (
    <div style={{ minHeight: "100vh", width: "100%", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", overflowX: "hidden" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", padding: "18px 24px", backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border-color)" }}>
        <div>
          <div style={{ color: "var(--text-primary)", fontSize: "clamp(1.25rem, 3vw, 1.7rem)", fontWeight: "800" }}>TechMeet Admin</div>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>მართვის პანელი</span>
        </div>
        <button onClick={onClose} style={{ padding: "10px 18px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", cursor: "pointer", fontWeight: "600" }}>← საიტზე დაბრუნება</button>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>ადმინ პანელი / მართვა</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>მართე პლატფორმის ივენთები ერთ სივრცეში.</p>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          {[["სულ ივენთი", totalEvents], ["უფასო ივენთები", freeEvents], ["ფასიანი ივენთები", paidEvents]].map(([label, value]) => (
            <article key={String(label)} style={cardStyle}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{label}</span>
              <strong style={{ display: "block", marginTop: "8px", color: "var(--accent-color)", fontSize: "2rem" }}>{value}</strong>
            </article>
          ))}
        </section>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>
          <button onClick={() => { setActiveTab("list"); resetForm(); }} style={{ padding: "12px 24px", border: "none", borderRadius: "12px", backgroundColor: activeTab === "list" ? "var(--accent-color)" : "var(--bg-card)", color: "#ffffff", cursor: "pointer", fontWeight: "700" }}>ივენთების მართვა ({events.length})</button>
          <button onClick={() => setActiveTab("create")} style={{ padding: "12px 24px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: activeTab === "create" ? "var(--accent-color)" : "var(--bg-card)", color: "#ffffff", cursor: "pointer", fontWeight: "700" }}>{editingId !== null ? "ივენთის რედაქტირება" : "+ ახალი ივენთის დამატება"}</button>
        </div>

        {activeTab === "list" && (
          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 24px", color: "var(--text-primary)" }}>ივენთების სია</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {events.map((event) => (
                <article key={event.id} style={{ padding: "20px", border: "1px solid var(--border-color)", borderRadius: "14px", backgroundColor: "var(--bg-main)" }}>
                  <h3 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "1.05rem" }}>{event.title}</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ padding: "4px 9px", borderRadius: "8px", backgroundColor: "var(--badge-bg)", color: "var(--badge-text)", fontSize: "0.78rem" }}>{event.category}</span>
                    <span style={{ padding: "4px 9px", borderRadius: "8px", border: "1px solid var(--border-color)", color: "var(--text-secondary)", fontSize: "0.78rem" }}>{event.format}</span>
                  </div>
                  <p style={{ margin: "0 0 16px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>{event.city} · {event.date} · {event.price === 0 ? "უფასო" : `${event.price} ₾`}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <button onClick={() => handleStartEdit(event)} style={{ padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "10px", backgroundColor: "var(--bg-card)", color: "var(--text-primary)", cursor: "pointer", fontWeight: "600" }}>რედაქტირება</button>
                    <button onClick={() => onDeleteEvent(event.id)} style={{ padding: "10px 14px", border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.12)", color: "#ef4444", cursor: "pointer", fontWeight: "600" }}>წაშლა</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "create" && (
          <section style={{ ...cardStyle, maxWidth: "760px", margin: "0 auto" }}>
            <h2 style={{ margin: "0 0 24px", color: "var(--text-primary)" }}>{editingId !== null ? "ივენთის რედაქტირება" : "ახალი ივენთის შექმნა"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>ივენთის სათაური</label><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="მაგ: AI & Web3 Hackathon 2026" style={fieldStyle} /></div>
              <div><label style={labelStyle}>კატეგორია</label><select value={category} onChange={(event) => setCategory(event.target.value)} style={fieldStyle}><option value="ჰაკათონი">ჰაკათონი</option><option value="ვორქშოფი">ვორქშოფი</option><option value="კონფერენცია">კონფერენცია</option></select></div>
              <div><label style={labelStyle}>ფორმატი</label><select value={format} onChange={(event) => setFormat(event.target.value)} style={fieldStyle}><option value="ონლაინ">ონლაინ</option><option value="ადგილზე">ადგილზე</option><option value="ჰიბრიდული">ჰიბრიდული</option></select></div>
              <div><label style={labelStyle}>ქალაქი / ლოკაცია</label><input required value={city} onChange={(event) => setCity(event.target.value)} placeholder="მაგ: თბილისი" style={fieldStyle} /></div>
              <div><label style={labelStyle}>თარიღი</label><input required type="date" value={date} onChange={(event) => setDate(event.target.value)} style={fieldStyle} /></div>
              <div><label style={labelStyle}>ფასი (GEL - 0 თუ უფასოა)</label><input required type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" style={fieldStyle} /></div>
              <div style={{ gridColumn: "1 / -1", display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
                <button type="submit" style={{ flex: "1 1 220px", padding: "12px 24px", border: "none", borderRadius: "12px", backgroundColor: "var(--accent-color)", color: "#ffffff", cursor: "pointer", fontWeight: "700" }}>{editingId !== null ? "შენახვა" : "ივენთის დამატება"}</button>
                {editingId !== null && <button type="button" onClick={() => { resetForm(); setActiveTab("list"); }} style={{ padding: "12px 24px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: "var(--bg-main)", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "700" }}>გაუქმება</button>}
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};