import React, { useState, useEffect } from "react";
import { getDefaultImage } from "../App";
import { VerifiedIcon } from "./Icons";
import { supabase } from "../lib/supabase";

export interface Ticket {
  id: number | string;
  title: string;
  date: string;
  price: number;
  image?: string;
  category?: string;
}

interface UserCabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
  onDeleteTicket: (id: number | string) => void;
  isLoggedIn?: boolean;
  user?: { name: string; email: string } | null; // 🔹 დამატებულია user
  isProUser?: boolean;
  onNavigateToPackages: () => void;
}

export const UserCabinetModal: React.FC<UserCabinetModalProps> = ({
  isOpen,
  onClose,
  tickets = [],
  onDeleteTicket,
  isLoggedIn: externalIsLoggedIn,
  user: externalUser, // 🔹 ვიღებთ მომხმარებლის მონაცემებს
  isProUser = false,
  onNavigateToPackages,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    externalIsLoggedIn !== undefined ? externalIsLoggedIn : false
  );

  // 🔹 ავტორიზაციის სტატუსის სინქრონიზაცია App.tsx-თან
  useEffect(() => {
    if (externalIsLoggedIn !== undefined) {
      setIsLoggedIn(externalIsLoggedIn);
    }
  }, [externalIsLoggedIn]);

  // 🔹 მომხმარებლის მონაცემების სინქრონიზაცია
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    externalUser || null
  );

  useEffect(() => {
    if (externalUser !== undefined) {
      setUser(externalUser);
    }
  }, [externalUser]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 4) {
      alert("გთხოვთ შეიყვანოთ ვალიდური მეილი და პაროლი");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      return;
    }
    setEmail("");
    setPassword("");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || password.length < 4) {
      alert("გთხოვთ შეავსოთ ყველა ველი სწორად");
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      alert(error.message);
      return;
    }
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    setEmail("");
    setPassword("");
    setFullName("");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#1e293b",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          color: "#fff",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "#94a3b8",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        {isLoggedIn ? (
          /* LOGGED IN CABINET VIEW */
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(56, 189, 248, 0.3)",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            {/* 🔹 დინამიური სახელი და მეილი */}
            <h2 style={{ margin: "0 0 8px 0", fontSize: "1.5rem" }}>
              {user?.name || "მომხმარებელი"}
            </h2>
            <p style={{ color: "#94a3b8", margin: "0 0 24px 0" }}>
              {user?.email || "user@example.com"}
            </p>

            {isProUser ? (
              <div style={{ marginBottom: "24px", color: "#fde68a", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <VerifiedIcon size={16} color="var(--accent-color)" />
                <span>Pro User</span>
              </div>
            ) : (
              <button
                onClick={onNavigateToPackages}
                style={{
                  width: "100%",
                  marginBottom: "24px",
                  padding: "12px 16px",
                  border: "1px solid var(--accent-color)",
                  borderRadius: "10px",
                  background: "var(--accent-color)",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: "800",
                }}
              >
                პაკეტების შეძენა
              </button>
            )}

            {/* TICKETS SECTION */}
            <div
              style={{
                background: "#0f172a",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "24px",
                textAlign: "left",
                maxHeight: "220px",
                overflowY: "auto",
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", color: "#38bdf8" }}>
                ჩემი ბილეთები ({tickets.length})
              </h4>

              {tickets.length === 0 ? (
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>
                  ჯერჯერობით აქტიური ბილეთი არ გაქვთ.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#1e293b",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #334155",
                      }}
                    >
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "8px",
                          backgroundImage: `url("${ticket.image || getDefaultImage(ticket.category || "")}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "0.88rem",
                            color: "#f8fafc",
                          }}
                        >
                          {ticket.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {ticket.date} |{" "}
                          {ticket.price === 0 ? "უფასო" : `${ticket.price} ₾`}
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteTicket(ticket.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        წაშლა
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#fca5a5",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              გამოსვლა
            </button>
          </div>
        ) : (
          /* AUTHENTICATION FORM (LOGIN & REGISTER) */
          <div>
            <div
              style={{
                display: "flex",
                background: "#0f172a",
                padding: "4px",
                borderRadius: "12px",
                marginBottom: "24px",
              }}
            >
              <button
                onClick={() => setActiveTab("login")}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  background: activeTab === "login" ? "#3b82f6" : "transparent",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                შესვლა
              </button>
              <button
                onClick={() => setActiveTab("register")}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  background:
                    activeTab === "register" ? "#3b82f6" : "transparent",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                რეგისტრაცია
              </button>
            </div>

            <form
              onSubmit={
                activeTab === "login" ? handleLoginSubmit : handleRegisterSubmit
              }
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {activeTab === "register" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "0.85rem",
                      color: "#94a3b8",
                    }}
                  >
                    სრული სახელი
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="გიორგი გიორგაძე"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #334155",
                      background: "#0f172a",
                      color: "#fff",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.85rem",
                    color: "#94a3b8",
                  }}
                >
                  ელ. ფოსტა
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#fff",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.85rem",
                    color: "#94a3b8",
                  }}
                >
                  პაროლი
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#fff",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: "8px",
                  padding: "14px",
                  border: "none",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
                }}
              >
                {activeTab === "login" ? "ავტორიზაცია" : "რეგისტრაცია"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};