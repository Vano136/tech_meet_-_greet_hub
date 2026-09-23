import React, { useState, useEffect } from "react";

export interface EventItem {
  id: number | string;
  title: string;
  category: string;
  city: string;
  date: string;
  price: number;
  format?: string;
  description?: string;
  duration?: string;
  ageLimit?: string;
  program?: string[];
}

export interface BlogPost {
  id: string | number;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  summary: string;
  content: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  onAddEvent: (event: EventItem) => void;
  onDeleteEvent: (id: number | string) => void;
  onUpdateEvent: (event: EventItem) => void;
  blogs?: BlogPost[];
  onAddBlog?: (blog: Omit<BlogPost, "id">) => void;
  onDeleteBlog?: (id: string | number) => void;
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
  blogs = [],
  onAddBlog,
  onDeleteBlog,
}) => {
  const [mainSection, setMainSection] = useState<"events" | "blogs">("events");
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  
  // Event & Camp State
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ჰაკათონი");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [format, setFormat] = useState("ონლაინ");
  const [description, setDescription] = useState("");

  // 🔹 ბანაკის სპეციფიკური ველები
  const [duration, setDuration] = useState("7 დღე");
  const [ageLimit, setAgeLimit] = useState("14-18 წელი");
  const [program, setProgram] = useState("");

  // ჭკვიანი ლოგიკა: ბანაკის არჩევისას ფორმატი ხდება "ადგილზე"
  useEffect(() => {
    if (category === "ბანაკი") {
      setFormat("ადგილზე");
    }
  }, [category]);

  // Blog State
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("კარიერა");
  const [blogAuthor, setBlogAuthor] = useState("");
  const [blogReadTime, setBlogReadTime] = useState("5 წთ");
  const [blogImage, setBlogImage] = useState("");
  const [blogSummary, setBlogSummary] = useState("");
  const [blogContent, setBlogContent] = useState("");

  const resetEventForm = () => {
    setEditingId(null);
    setTitle("");
    setCategory("ჰაკათონი");
    setCity("");
    setDate("");
    setPrice("");
    setFormat("ონლაინ");
    setDescription("");
    setDuration("7 დღე");
    setAgeLimit("14-18 წელი");
    setProgram("");
  };

  const resetBlogForm = () => {
    setBlogTitle("");
    setBlogCategory("კარიერა");
    setBlogAuthor("");
    setBlogReadTime("5 წთ");
    setBlogImage("");
    setBlogSummary("");
    setBlogContent("");
  };

  const handleStartEdit = (event: EventItem) => {
    setEditingId(event.id);
    setTitle(event.title);
    setCategory(event.category);
    setCity(event.city);
    setDate(event.date);
    setPrice(String(event.price));
    setFormat(event.format || (event.category === "ბანაკი" ? "ადგილზე" : "ონლაინ"));
    setDescription(event.description || "");
    setDuration(event.duration || "7 დღე");
    setAgeLimit(event.ageLimit || "14-18 წელი");
    setProgram(event.program ? event.program.join("\n") : "");
    setActiveTab("create");
  };

  const handleEventSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const isCamp = category === "ბანაკი";
    
    const eventData: EventItem = { 
      id: editingId ?? Date.now(), 
      title, 
      category, 
      city, 
      date, 
      price: Number(price), 
      format: isCamp ? "ადგილზე" : format,
      description,
      duration: isCamp ? duration : undefined,
      ageLimit: isCamp ? ageLimit : undefined,
      program: isCamp && program.trim() ? program.split("\n").filter(p => p.trim() !== "") : undefined,
    };
    
    if (editingId !== null) onUpdateEvent(eventData);
    else onAddEvent(eventData);
    resetEventForm();
    setActiveTab("list");
  };

  const handleBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddBlog) return;

    onAddBlog({
      title: blogTitle,
      category: blogCategory,
      author: blogAuthor || "TechMeet გუნდი",
      date: new Date().toLocaleDateString("ka-GE", { year: "numeric", month: "long", day: "numeric" }),
      readTime: blogReadTime,
      image: blogImage || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
      summary: blogSummary,
      content: blogContent,
    });

    resetBlogForm();
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
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>მართე პლატფორმის ივენთები, ბანაკები და ბლოგ-სტატიები ერთ სივრცეში.</p>
        </div>

        {/* 🔹 მთავარი სექციების გადამრთველი */}
        <div style={{ display: "flex", gap: "14px", marginBottom: "28px", flexWrap: "wrap" }}>
          <button
            onClick={() => { setMainSection("events"); setActiveTab("list"); }}
            style={{
              padding: "12px 24px",
              border: "none",
              borderRadius: "12px",
              backgroundColor: mainSection === "events" ? "var(--accent-color)" : "var(--bg-card)",
              color: "#000000",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "1rem",
            }}
          >
            🎪 ივენთები & ბანაკები ({events.length})
          </button>
          <button
            onClick={() => { setMainSection("blogs"); setActiveTab("list"); }}
            style={{
              padding: "12px 24px",
              border: "none",
              borderRadius: "12px",
              backgroundColor: mainSection === "blogs" ? "var(--accent-color)" : "var(--bg-card)",
              color: "#000000",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "1rem",
            }}
          >
            📰 ბლოგ-პოსტები ({blogs.length})
          </button>
        </div>

        {/* =========================================
            🔹 EVENTS MANAGEMENT
           ========================================= */}
        {mainSection === "events" && (
          <>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
              {[["სულ ივენთი", totalEvents], ["უფასო ივენთები", freeEvents], ["ფასიანი ივენთები", paidEvents]].map(([label, value]) => (
                <article key={String(label)} style={cardStyle}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{label}</span>
                  <strong style={{ display: "block", marginTop: "8px", color: "var(--accent-color)", fontSize: "2rem" }}>{value}</strong>
                </article>
              ))}
            </section>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>
              <button onClick={() => { setActiveTab("list"); resetEventForm(); }} style={{ padding: "12px 24px", border: "none", borderRadius: "12px", backgroundColor: activeTab === "list" ? "var(--accent-color)" : "var(--bg-card)", color: "#000000", cursor: "pointer", fontWeight: "700" }}>ივენთების სია ({events.length})</button>
              <button onClick={() => setActiveTab("create")} style={{ padding: "12px 24px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: activeTab === "create" ? "var(--accent-color)" : "var(--bg-card)", color: "#000000", cursor: "pointer", fontWeight: "700" }}>{editingId !== null ? "ივენთის/ბანაკის რედაქტირება" : "+ ახლის დამატება"}</button>
            </div>

            {activeTab === "list" && (
              <section style={cardStyle}>
                <h2 style={{ margin: "0 0 24px", color: "var(--text-primary)" }}>ივენთების და ბანაკების სია</h2>
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
                <h2 style={{ margin: "0 0 24px", color: "var(--text-primary)" }}>{editingId !== null ? "რედაქტირება" : "ახალი ივენთის/ბანაკის შექმნა"}</h2>
                <form onSubmit={handleEventSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>სათაური</label>
                    <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="მაგ: Bakhmaro Tech Camp 2026" style={fieldStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>კატეგორია</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={fieldStyle}>
                      <option value="ჰაკათონი">ჰაკათონი</option>
                      <option value="ვორქშოფი">ვორქშოფი</option>
                      <option value="კონფერენცია">კონფერენცია</option>
                      <option value="ბანაკი">ბანაკი</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>ფორმატი {category === "ბანაკი" && "(ბანაკისთვის იბლოკება)"}</label>
                    <select 
                      value={format} 
                      disabled={category === "ბანაკი"}
                      onChange={(e) => setFormat(e.target.value)} 
                      style={{ ...fieldStyle, ...(category === "ბანაკი" ? { opacity: 0.6, cursor: "not-allowed" } : {}) }}
                    >
                      <option value="ონლაინ">ონლაინ</option>
                      <option value="ადგილზე">ადგილზე</option>
                      <option value="ჰიბრიდული">ჰიბრიდული</option>
                    </select>
                  </div>
                  <div><label style={labelStyle}>ქალაქი / ლოკაცია</label><input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="მაგ: ბახმარო / თბილისი" style={fieldStyle} /></div>
                  <div><label style={labelStyle}>თარიღი</label><input required type="date" value={date} onChange={(e) => setDate(e.target.value)} style={fieldStyle} /></div>
                  <div><label style={labelStyle}>ფასი (GEL - 0 თუ უფასოა)</label><input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" style={fieldStyle} /></div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>აღწერა (Description)</label>
                    <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ღონისძიების მოკლე აღწერა..." style={{ ...fieldStyle, resize: "vertical" }} />
                  </div>

                  {/* 🔹 თუ კატეგორია ბანაკია, გამოვაჩინოთ 3 ახალი ველი */}
                  {category === "ბანაკი" && (
                    <>
                      <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "20px", gridColumn: "1 / -1" }}>
                        <h4 style={{ margin: "0 0 16px", color: "var(--accent-color)" }}>ბანაკის სპეციფიკური დეტალები</h4>
                      </div>
                      <div>
                        <label style={labelStyle}>ხანგრძლივობა</label>
                        <input required value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="მაგ: 10 დღე" style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>ასაკობრივი ზღვარი</label>
                        <input required value={ageLimit} onChange={(e) => setAgeLimit(e.target.value)} placeholder="მაგ: 13-18 წელი" style={fieldStyle} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>ბანაკის პროგრამა (თითო ხაზზე თითო აქტივობა)</label>
                        <textarea rows={4} value={program} onChange={(e) => setProgram(e.target.value)} placeholder="AI ვორქშოფი&#10;ჰაკათონი&#10;მთაში ლაშქრობა" style={{ ...fieldStyle, resize: "vertical" }} />
                      </div>
                    </>
                  )}

                  <div style={{ gridColumn: "1 / -1", display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
                    <button type="submit" style={{ flex: "1 1 220px", padding: "12px 24px", border: "none", borderRadius: "12px", backgroundColor: "var(--accent-color)", color: "#000000", cursor: "pointer", fontWeight: "700" }}>{editingId !== null ? "შენახვა" : "დამატება"}</button>
                    {editingId !== null && <button type="button" onClick={() => { resetEventForm(); setActiveTab("list"); }} style={{ padding: "12px 24px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: "var(--bg-main)", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "700" }}>გაუქმება</button>}
                  </div>
                </form>
              </section>
            )}
          </>
        )}

        {/* =========================================
            🔹 BLOGS MANAGEMENT
           ========================================= */}
        {mainSection === "blogs" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>
              <button onClick={() => { setActiveTab("list"); resetBlogForm(); }} style={{ padding: "12px 24px", border: "none", borderRadius: "12px", backgroundColor: activeTab === "list" ? "var(--accent-color)" : "var(--bg-card)", color: "#000000", cursor: "pointer", fontWeight: "700" }}>სტატიების სია ({blogs.length})</button>
              <button onClick={() => setActiveTab("create")} style={{ padding: "12px 24px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: activeTab === "create" ? "var(--accent-color)" : "var(--bg-card)", color: "#000000", cursor: "pointer", fontWeight: "700" }}>+ ახალი სტატიის დამატება</button>
            </div>

            {activeTab === "list" && (
              <section style={cardStyle}>
                <h2 style={{ margin: "0 0 24px", color: "var(--text-primary)" }}>ბლოგის სტატიები</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {blogs.map((blog) => (
                    <article key={blog.id} style={{ padding: "20px", border: "1px solid var(--border-color)", borderRadius: "14px", backgroundColor: "var(--bg-main)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ padding: "4px 8px", borderRadius: "6px", backgroundColor: "var(--badge-bg)", color: "var(--badge-text)", fontSize: "0.75rem", fontWeight: "600" }}>{blog.category}</span>
                        <h3 style={{ margin: "10px 0 8px", color: "var(--text-primary)", fontSize: "1.05rem" }}>{blog.title}</h3>
                        <p style={{ margin: "0 0 14px", color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.4 }}>{blog.summary}</p>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                        <small style={{ color: "var(--text-muted)" }}>{blog.author} · {blog.date}</small>
                        <button onClick={() => onDeleteBlog?.(blog.id)} style={{ padding: "8px 12px", border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.12)", color: "#ef4444", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" }}>წაშლა</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "create" && (
              <section style={{ ...cardStyle, maxWidth: "760px", margin: "0 auto" }}>
                <h2 style={{ margin: "0 0 24px", color: "var(--text-primary)" }}>ახალი სტატიის დამატება</h2>
                <form onSubmit={handleBlogSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={labelStyle}>სტატიის სათაური</label>
                    <input required value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="მაგ: ხელოვნური ინტელექტი 2026 წელს" style={fieldStyle} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>კატეგორია</label>
                      <input required value={blogCategory} onChange={(e) => setBlogCategory(e.target.value)} placeholder="მაგ: AI & Tech, კარიერა..." style={fieldStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>ავტორის სახელი</label>
                      <input required value={blogAuthor} onChange={(e) => setBlogAuthor(e.target.value)} placeholder="გიორგი გიორგაძე" style={fieldStyle} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>წაკითხვის დრო</label>
                      <input value={blogReadTime} onChange={(e) => setBlogReadTime(e.target.value)} placeholder="მაგ: 5 წთ" style={fieldStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>სურათის URL (არასავალდებულო)</label>
                      <input value={blogImage} onChange={(e) => setBlogImage(e.target.value)} placeholder="https://..." style={fieldStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>მოკლე აღწერა (Summary ქარდისთვის)</label>
                    <textarea required rows={2} value={blogSummary} onChange={(e) => setBlogSummary(e.target.value)} placeholder="მოკლე შესავალი..." style={{ ...fieldStyle, resize: "vertical" }} />
                  </div>

                  <div>
                    <label style={labelStyle}>სრული ტექსტი (Content)</label>
                    <textarea required rows={6} value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="დაწერეთ სტატიის სრული ტექსტი..." style={{ ...fieldStyle, resize: "vertical" }} />
                  </div>

                  <button type="submit" style={{ padding: "14px 24px", border: "none", borderRadius: "12px", backgroundColor: "var(--accent-color)", color: "#000000", cursor: "pointer", fontWeight: "700", fontSize: "1rem" }}>
                    სტატიის გამოქვეყნება
                  </button>
                </form>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};