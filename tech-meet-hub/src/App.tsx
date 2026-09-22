import { useState, useEffect, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import initialEvents from "./data/events.json";
import { AdminPanel } from "./components/AdminPanel";
import { FilterBar } from "./components/FilterBar";
import { UserCabinetModal } from "./components/UserCabinetModal";
import { AIAgentWidget } from "./components/AIAgentWidget";
import { ThemeToggle } from "./components/ThemeToggle";
import { Logo } from "./components/Logo";
import { supabase } from "./lib/supabase";
import {
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  CheckIcon,
  SparklesIcon,
  FireIcon,
} from "./components/Icons";
import "./App.css";

export interface EventItem {
  id: string | number;
  title: string;
  category: string;
  city: string;
  date: string;
  price: number;
  format?: string;
  image?: string;
  participantsCount?: number;
}

const CURRENCY_RATES: Record<string, number> = {
  GEL: 1,
  USD: 0.37,
  EUR: 0.34,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  GEL: "₾",
  USD: "$",
  EUR: "€",
};

const MOCK_TENDERS = [
  {
    id: 1,
    title: "ვებსაიტის დამზადება",
    budget: "5000 ₾",
    deadline: "2026-11-20",
    description: "კომპანიისთვის თანამედროვე, სწრაფი და ადაპტირებული ვებსაიტის შექმნა.",
  },
  {
    id: 2,
    title: "სერვერული ინფრასტრუქტურის მოწყობა",
    budget: "18000 ₾",
    deadline: "2026-12-05",
    description: "სერვერების, ქსელისა და სარეზერვო სისტემის დაგეგმვა და მონტაჟი.",
  },
  {
    id: 3,
    title: "მობილური აპლიკაციის განვითარება",
    budget: "24000 ₾",
    deadline: "2027-01-15",
    description: "iOS და Android პლატფორმებისთვის მომხმარებელზე ორიენტირებული აპლიკაციის შექმნა.",
  },
  {
    id: 4,
    title: "კიბერუსაფრთხოების აუდიტი",
    budget: "8500 ₾",
    deadline: "2026-12-18",
    description: "ორგანიზაციის ინფორმაციული სისტემების უსაფრთხოების შეფასება და რეკომენდაციები.",
  },
  {
    id: 5,
    title: "მონაცემთა ანალიტიკის პლატფორმა",
    budget: "15000 ₾",
    deadline: "2027-02-01",
    description: "ანგარიშგებისა და ბიზნეს-ანალიტიკის ერთიანი პლატფორმის დანერგვა.",
  },
];

const getParticipantsCount = (id: string | number) => {
  const numericId = typeof id === "number"
    ? id
    : Array.from(id).reduce((total, character) => total + character.charCodeAt(0), 0);
  return 50 + ((numericId * 137) % 451);
};

export const getDefaultImage = (category: string): string => {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory.includes("ჰაკატონი")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80";
  }
  if (normalizedCategory.includes("ვორქშოფი")) {
    return "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80";
  }
  if (normalizedCategory.includes("კონფერენცია")) {
    return "https://images.unsplash.com/photo-1475721025505-23126fbb1e60?auto=format&fit=crop&w=800&q=80";
  }

  return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80";
};

const createSeededRandom = (seed: number) => {
  let value = seed >>> 0;

  return () => {
    value += 0x6D2B79F5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const getSeedFromDateString = (dateString: string) => {
  let seed = 0;

  for (let index = 0; index < dateString.length; index += 1) {
    seed = (seed * 31 + dateString.charCodeAt(index)) >>> 0;
  }

  return seed;
};

const parseEventDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  const georgianMonths: Record<string, number> = {
    "იანვარი": 0, "თებერვალი": 1, "მარტი": 2, "აპრილი": 3, "მაისი": 4, "ივნისი": 5,
    "ივლისი": 6, "აგვისტო": 7, "სექტემბერი": 8, "ოქტომბერი": 9, "ნოემბერი": 10, "დეკემბერი": 11
  };

  const standardDateMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (standardDateMatch) {
    const [, year, month, day] = standardDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1].replace(/,/g, '');
    const year = parts.length >= 3 ? parseInt(parts[2], 10) : new Date().getFullYear();

    const month = georgianMonths[monthStr];
    if (month !== undefined && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  return null;
};

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("theme") as "dark" | "light") || "dark",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState<"home" | "events" | "tenders" | "packages">("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isProUser, setIsProUser] = useState<boolean>(false);

  // 🔹 რუკის მოდალის სთეითი
  const [mapModalEvent, setMapModalEvent] = useState<{ title: string; city: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`techmeet_pro_${currentUser.id}`, String(isProUser));
    }
  }, [isProUser]);

  useEffect(() => {
    const loadProStatus = async () => {
      if (!currentUser) {
        setIsProUser(false);
        return;
      }

      const savedPro = localStorage.getItem(`techmeet_pro_${currentUser.id}`) === "true";
      if (savedPro) setIsProUser(true);

      const { data } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", currentUser.id)
        .single();

      if (data?.is_pro) {
        setIsProUser(true);
        localStorage.setItem(`techmeet_pro_${currentUser.id}`, "true");
      }
    };

    void loadProStatus();
  }, [currentUser]);

  useEffect(() => {
    const loadSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setCurrentUser(session.user);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', session.user.id)
          .single() as { data: { is_pro: boolean } | null, error: any };
          
        setIsProUser(profile?.is_pro || false);
      }
    };

    loadSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', session.user.id)
          .single() as { data: { is_pro: boolean } | null, error: any };
          
        setIsProUser(profile?.is_pro || false);
      } else {
        setCurrentUser(null);
        setIsProUser(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [format, setFormat] = useState("all");
  const [currency, setCurrency] = useState("GEL");

  const [isCabinetOpen, setIsCabinetOpen] = useState(false);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [eventList, setEventList] = useState<EventItem[]>(() =>
    initialEvents.map((event) => ({
      ...event,
      participantsCount: getParticipantsCount(event.id),
    })),
  );

  useEffect(() => {
    let mounted = true;

    const fetchDatabaseEvents = async () => {
      const { data, error } = await supabase.from("events").select("*");
      if (error) {
        console.error("Failed to fetch Supabase events:", error);
        return;
      }
      if (mounted) setDbEvents(data || []);
    };

    void fetchDatabaseEvents();
    return () => {
      mounted = false;
    };
  }, []);

  const mostPopularEventIds = useMemo(() => {
    return new Set(
      [...eventList]
        .sort((first, second) => (second.participantsCount ?? 0) - (first.participantsCount ?? 0))
        .slice(0, 3)
        .map((event) => String(event.id)),
    );
  }, [eventList]);

  const minEventPrice = useMemo(() => {
    if (eventList.length === 0) return 0;
    return Math.min(...eventList.map((e) => e.price));
  }, [eventList]);

  const maxEventPrice = useMemo(() => {
    if (eventList.length === 0) return 1000;
    return Math.max(...eventList.map((e) => e.price));
  }, [eventList]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    setPriceRange([minEventPrice, maxEventPrice]);
  }, [minEventPrice, maxEventPrice]);

  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("registered_events");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("registered_events", JSON.stringify(registeredEventIds));
  }, [registeredEventIds]);

  const handleRegisterEvent = (eventId: string | number) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const strId = String(eventId);
    setRegisteredEventIds((prev) => {
      if (prev.includes(strId)) return prev;
      return [...prev, strId];
    });
  };

  const handleUnregisterEvent = (eventId: string | number) => {
    const strId = String(eventId);
    setRegisteredEventIds((prev) => prev.filter((id) => id !== strId));
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    const { error } = authMode === "login"
      ? await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      : await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { full_name: authName } },
        });

    if (error) {
      alert(error.message);
      return;
    }

    setIsAuthModalOpen(false);
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
  };

  const handleLogout = async () => {
    localStorage.removeItem(`techmeet_pro_${currentUser?.id}`);
    setIsProUser(false);
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    setIsCabinetOpen(false);
  };

  const handleBuyPro = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: currentUser.id,
        is_pro: true,
        email: currentUser.email,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setIsProUser(true);
    localStorage.setItem(`techmeet_pro_${currentUser.id}`, "true");
    alert("გილოცავთ! თქვენ წარმატებით გააქტიურეთ PRO პაკეტი.");
  };

  const handleNavigation = (tab: "home" | "events" | "tenders" | "packages") => {
    if (tab !== "home" && !currentUser) {
      setIsAuthModalOpen(true);
      setIsMobileMenuOpen(false);
      return;
    }

    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const registeredEvents = eventList.filter((event) =>
    registeredEventIds.includes(String(event.id)),
  );

  const handleAddEventNew = (newEvent: any) => {
    const formattedEvent = {
      ...newEvent,
      id: Date.now(),
      category: newEvent.category || "Web Development",
      format: newEvent.format || "Online",
      city: newEvent.city || "თბილისი",
      price: Number(newEvent.price) || 0,
      participantsCount: getParticipantsCount(Date.now()),
    };
    setEventList((prev) => [formattedEvent, ...prev]);
  };

  const handleDeleteEvent = (id: string | number) => {
    setEventList((prev) => prev.filter((ev) => String(ev.id) !== String(id)));
    handleUnregisterEvent(id);
  };

  const handleUpdateEvent = (updatedEvent: any) => {
    setEventList((prev) =>
      prev.map((ev) =>
        String(ev.id) === String(updatedEvent.id) ? updatedEvent : ev,
      ),
    );
  };

  const currentDateString = new Date().toDateString();
  const dailyShuffledEvents = useMemo(() => {
    const random = createSeededRandom(getSeedFromDateString(currentDateString));
    const shuffledEvents = [...eventList];

    for (let index = shuffledEvents.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffledEvents[index], shuffledEvents[swapIndex]] = [
        shuffledEvents[swapIndex],
        shuffledEvents[index],
      ];
    }

    return shuffledEvents;
  }, [currentDateString, eventList]);

  const filteredEvents = dailyShuffledEvents.filter((e) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query || e.title?.toLowerCase().includes(query) || e.city?.toLowerCase().includes(query);

    const matchesCategory =
      category === "all" || category === "ყველა" || e.category?.toLowerCase() === category.toLowerCase();

    const matchesFormat =
      format === "all" || format === "ყველა" || (e.format && e.format.toLowerCase() === format.toLowerCase());

    const matchesPrice = e.price >= priceRange[0] && e.price <= priceRange[1];

    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const eventDate = parseEventDate(e.date);
      if (!eventDate) matchesDate = false;

      if (dateRange.start && eventDate) {
        const startDate = parseEventDate(dateRange.start);
        if (startDate && eventDate < startDate) matchesDate = false;
      }

      if (dateRange.end && eventDate) {
        const endDate = parseEventDate(dateRange.end);
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
          if (eventDate > endDate) matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesCategory && matchesFormat && matchesPrice && matchesDate;
  });

  const formatPrice = (priceInGEL: number) => {
    if (priceInGEL === 0) return "უფასო";

    const rate = CURRENCY_RATES[currency] || 1;
    const convertedPrice = Math.round(priceInGEL * rate);
    const symbol = CURRENCY_SYMBOLS[currency] || "₾";

    return currency === "USD" || currency === "EUR"
      ? `${symbol}${convertedPrice}`
      : `${convertedPrice} ${symbol}`;
  };

  if (currentPath === "/admin-panel") {
    return (
      <AdminPanel
        isOpen={true}
        onClose={() => {
          window.history.pushState({}, "", "/");
          setCurrentPath("/");
        }}
        events={eventList}
        onAddEvent={handleAddEventNew}
        onDeleteEvent={handleDeleteEvent}
        onUpdateEvent={handleUpdateEvent}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-main)",
        color: "var(--text-primary)",
      }}
    >
      {/* 🔹 ნავბარი */}
      <nav
        className="app-navbar"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px 24px",
          backgroundColor: theme === "dark" ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.05)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            onClick={() => handleNavigation("home")}
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            <Logo size={30} />
            <span>TechMeet</span>
          </div>

          <div
            className="desktop-nav"
            style={{ gap: "20px", alignItems: "center" }}
          >
            <button
              className="nav-link"
              onClick={() => handleNavigation("home")}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-primary)",
                fontWeight: activeTab === "home" ? "600" : "500",
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              მთავარი
            </button>

            <button
              className="nav-link"
              onClick={() => handleNavigation("events")}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-primary)",
                fontWeight: activeTab === "events" ? "600" : "500",
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              ივენთები
            </button>

            <button
              className="nav-link"
              onClick={() => handleNavigation("packages")}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-primary)",
                fontWeight: activeTab === "packages" ? "600" : "500",
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              პაკეტები
            </button>

            <button
              className="nav-link"
              onClick={() => handleNavigation("tenders")}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-primary)",
                fontWeight: activeTab === "tenders" ? "600" : "500",
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              ტენდერები
            </button>

            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

            {currentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={() => setIsCabinetOpen(true)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "var(--accent-color)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.88rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <UserIcon size={16} />
                  <span>{currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "მომხმარებელი"}</span>
                  {isProUser && (
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "#facc15",
                        color: "#422006",
                        fontSize: "0.65rem",
                        fontWeight: "800",
                      }}
                    >
                      PRO
                    </span>
                  )}
                  {registeredEventIds.length > 0 && (
                    <span
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                      }}
                    >
                      {registeredEventIds.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  გამოსვლა
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  padding: "8px 18px",
                  backgroundColor: "var(--accent-color)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                შესვლა / რეგისტრაცია
              </button>
            )}
          </div>

          <div
            className="mobile-toggle"
            style={{ alignItems: "center", gap: "12px" }}
          >
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: "none",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                padding: "6px 10px",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className="mobile-menu"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "14px",
              paddingTop: "14px",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <button
              className="nav-link"
              onClick={() => handleNavigation("home")}
              style={{ background: "none", border: "none", color: "var(--text-primary)", fontWeight: activeTab === "home" ? "600" : "500", cursor: "pointer", textAlign: "left", fontSize: "1rem" }}
            >
              მთავარი
            </button>
            <button
              className="nav-link"
              onClick={() => handleNavigation("events")}
              style={{ background: "none", border: "none", color: "var(--text-primary)", fontWeight: activeTab === "events" ? "600" : "500", cursor: "pointer", textAlign: "left", fontSize: "1rem" }}
            >
              ივენთები
            </button>
            <button
              className="nav-link"
              onClick={() => handleNavigation("tenders")}
              style={{ background: "none", border: "none", color: "var(--text-primary)", fontWeight: activeTab === "tenders" ? "600" : "500", cursor: "pointer", textAlign: "left", fontSize: "1rem" }}
            >
              ტენდერები
            </button>
            <button
              className="nav-link"
              onClick={() => handleNavigation("packages")}
              style={{ background: "none", border: "none", color: "var(--text-primary)", fontWeight: activeTab === "packages" ? "600" : "500", cursor: "pointer", textAlign: "left", fontSize: "1rem" }}
            >
              პაკეტები
            </button>

            {currentUser ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                <button
                  onClick={() => { setIsCabinetOpen(true); setIsMobileMenuOpen(false); }}
                  style={{ padding: "10px", backgroundColor: "var(--accent-color)", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <UserIcon size={16} />
                  <span>{currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "მომხმარებელი"}</span>
                  {isProUser && (
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "#facc15",
                        color: "#422006",
                        fontSize: "0.65rem",
                        fontWeight: "800",
                      }}
                    >
                      PRO
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  style={{ padding: "10px", background: "none", border: "1px solid var(--border-color)", color: "var(--text-secondary)", borderRadius: "8px", cursor: "pointer" }}
                >
                  გამოსვლა
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                style={{ padding: "10px", backgroundColor: "var(--accent-color)", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", marginTop: "8px" }}
              >
                შესვლა / რეგისტრაცია
              </button>
            )}
          </div>
        )}
      </nav>

      {/* 🔹 ძირითადი კონტენტი */}
      <div style={{ padding: "32px 16px", flex: 1 }}>
        <main style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {activeTab === "packages" ? (
            <section style={{ textAlign: "center" }}>
              <h2 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: "2rem" }}>
                აირჩიეთ პაკეტი
              </h2>
              <p style={{ margin: "0 0 32px", color: "var(--text-secondary)" }}>
                აირჩიეთ თქვენთვის სასურველი წვდომის დონე.
              </p>
              <div
                className="packages-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "24px",
                  textAlign: "left",
                }}
              >
                <article
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px",
                    padding: "28px",
                  }}
                >
                  <h3 style={{ margin: "0 0 12px", color: "var(--text-primary)" }}>უფასო</h3>
                  <div style={{ marginBottom: "24px", color: "var(--text-primary)", fontSize: "2rem", fontWeight: "800" }}>0 ₾</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", color: "var(--text-secondary)" }}>
                    <span>✓ წვდომა პირველ 8 ივენთზე</span>
                    <span>✓ ძირითადი ფილტრაციის სისტემა</span>
                  </div>
                  <button
                    disabled
                    style={{ width: "100%", marginTop: "28px", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--bg-main)", color: "var(--text-secondary)", fontWeight: "700" }}
                  >
                    მიმდინარე
                  </button>
                </article>

                <article
                  style={{
                    background: "linear-gradient(145deg, var(--bg-card), rgba(99, 102, 241, 0.16))",
                    border: "2px solid var(--accent-color)",
                    borderRadius: "16px",
                    padding: "28px",
                    boxShadow: "0 16px 35px rgba(99, 102, 241, 0.2)",
                    transform: "scale(1.02)",
                  }}
                >
                  <div style={{ marginBottom: "10px", color: "var(--accent-color)", fontSize: "0.8rem", fontWeight: "800", letterSpacing: "0.08em" }}>რეკომენდებული</div>
                  <h3 style={{ margin: "0 0 12px", color: "var(--text-primary)" }}>პრო</h3>
                  <div style={{ marginBottom: "24px", color: "var(--text-primary)", fontSize: "2rem", fontWeight: "800" }}>40 ₾</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", color: "var(--text-secondary)" }}>
                    <span>✓ ყველა (9+) ივენთის განბლოკვა</span>
                    <span>✓ AI ასისტენტის შეუზღუდავი გამოყენება</span>
                    <span>✓ წვდომა დახურულ ტენდერებზე</span>
                    <span>✓ ყველაზე მოთხოვნადი ივენთების სტატისტიკა</span>
                  </div>
                  <button
                    onClick={handleBuyPro}
                    disabled={isProUser}
                    style={{ width: "100%", marginTop: "28px", padding: "12px", border: "none", borderRadius: "8px", background: isProUser ? "var(--badge-bg)" : "var(--accent-color)", color: isProUser ? "var(--badge-text)" : "#ffffff", cursor: isProUser ? "default" : "pointer", fontWeight: "800" }}
                  >
                    {isProUser ? "შეძენილია" : "ყიდვა - 40 ₾"}
                  </button>
                </article>
              </div>
            </section>
          ) : activeTab === "tenders" ? (
            <section>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ margin: "0 0 8px", color: "var(--text-primary)" }}>ტენდერები</h2>
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                  ტექნოლოგიური პროექტების შესაძლებლობები ბიზნესებისთვის.
                </p>
              </div>
              {isProUser ? (
                <div className="events-grid">
                  {MOCK_TENDERS.map((tender) => (
                    <article
                      key={tender.id}
                      style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "12px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <h3 style={{ margin: 0, color: "var(--text-primary)" }}>{tender.title}</h3>
                      <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.5 }}>{tender.description}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "auto" }}>
                        <strong style={{ color: "var(--accent-color)" }}>{tender.budget}</strong>
                        <span style={{ color: "var(--text-secondary)" }}>ვადა: {tender.deadline}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div style={{ position: "relative", minHeight: "420px" }}>
                  <div
                    className="events-grid"
                    style={{ filter: "blur(7px)", opacity: 0.55, userSelect: "none", pointerEvents: "none" }}
                  >
                    {MOCK_TENDERS.map((tender) => (
                      <article
                        key={tender.id}
                        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}
                      >
                        <h3 style={{ margin: "0 0 16px", color: "var(--text-primary)" }}>{tender.title}</h3>
                        <p style={{ color: "var(--text-secondary)" }}>{tender.description}</p>
                        <strong>{tender.budget}</strong>
                      </article>
                    ))}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "24px",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "460px",
                        width: "100%",
                        padding: "28px",
                        border: "1px solid rgba(250, 204, 21, 0.45)",
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #292524, #422006)",
                        textAlign: "center",
                        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.35)",
                      }}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🔒</div>
                      <h3 style={{ margin: "0 0 18px", color: "#fef3c7" }}>
                        ტენდერებზე წვდომისთვის შეიძინეთ პრო პაკეტი 40 ₾-ად
                      </h3>
                      <button
                        onClick={handleBuyPro}
                        style={{ padding: "11px 20px", border: "none", borderRadius: "8px", background: "#facc15", color: "#422006", cursor: "pointer", fontWeight: "800" }}
                      >
                        შეიძინეთ PRO
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          ) : activeTab === "home" ? (
            <section>
              <style>{`
                .landing-cta {
                  transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
                }
                .landing-cta:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.3);
                }
                .landing-feature-card {
                  transition: transform 180ms ease, border-color 180ms ease;
                }
                .landing-feature-card:hover {
                  transform: translateY(-4px);
                  border-color: var(--accent-color) !important;
                }
              `}</style>

              <section
                className="landing-hero"
                style={{
                  position: "relative",
                  padding: "100px 24px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "24px",
                  overflow: "hidden",
                  marginBottom: "48px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.6)), url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  textAlign: "center",
                  boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)",
                }}
              >
                <h1
                  style={{
                    position: "relative",
                    zIndex: 2,
                    margin: 0,
                    color: "#ffffff",
                    fontSize: "clamp(2.3rem, 6vw, 4.6rem)",
                    lineHeight: 1.05,
                    fontWeight: "850",
                    letterSpacing: "-0.04em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <span>TechMeet</span>
                  <SparklesIcon size={32} color="var(--accent-color)" />
                </h1>
                <p style={{ position: "relative", zIndex: 2, maxWidth: "600px", margin: "24px auto 32px", color: "#e2e8f0", fontSize: "1.15rem", lineHeight: 1.6 }}>
                  აღმოაჩინე და დაესწარი საუკეთესო IT ივენთებსა და ბიზნეს შეხვედრებს
                </p>
                <button
                  className="landing-cta"
                  onClick={() => currentUser ? handleNavigation("events") : setIsAuthModalOpen(true)}
                  style={{ position: "relative", zIndex: 2, padding: "14px 24px", border: "none", borderRadius: "10px", backgroundColor: "var(--accent-color)", color: "#ffffff", cursor: "pointer", fontSize: "1rem", fontWeight: "800" }}
                >
                  შემოგვიერთდი ახლავე
                </button>
              </section>

              <section className="landing-features" style={{ marginBottom: "72px" }}>
                <h2 style={{ margin: "0 0 28px", color: "var(--text-primary)", textAlign: "center", fontSize: "2rem" }}>რატომ ჩვენ?</h2>
                <div className="landing-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
                  {[
                    { title: "ცენტრალიზებული ტექ-ფოკუსი", icon: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></> },
                    { title: "სმარტ ვიზუალური ფილტრაცია", icon: <><path d="M4 5h16M7 12h10M10 19h4" /><circle cx="8" cy="5" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></> },
                    { title: "ინტეგრირებული კალათა და დაჯავშნა", icon: <><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L20 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></> },
                    { title: "ქართულ ბაზართან ინტეგრაცია", icon: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></> },
                  ].map((feature) => (
                    <article
                      key={feature.title}
                      className="landing-feature-card"
                      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}
                    >
                      <div style={{ width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px", borderRadius: "10px", backgroundColor: "var(--badge-bg)", color: "var(--accent-color)" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{feature.icon}</svg>
                      </div>
                      <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "1.05rem", lineHeight: 1.35 }}>{feature.title}</h3>
                    </article>
                  ))}
                </div>
              </section>

              <section className="landing-steps" style={{ marginBottom: "72px" }}>
                <h2 style={{ margin: "0 0 28px", color: "var(--text-primary)", textAlign: "center", fontSize: "2rem" }}>როგორ მუშაობს</h2>
                <div className="landing-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "18px", alignItems: "center" }}>
                  {["გაიარე რეგისტრაცია", "აღმოაჩინე ივენთი", "დაესწარი და განვითარდი"].map((step, index) => (
                    <div key={step} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ flexShrink: 0, width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--accent-color)", color: "#ffffff", fontWeight: "800" }}>{index + 1}</div>
                      <span style={{ color: "var(--text-primary)", fontWeight: "700", lineHeight: 1.35 }}>{step}</span>
                      {index < 2 && <span style={{ marginLeft: "auto", color: "var(--accent-color)", fontSize: "1.5rem" }}>→</span>}
                    </div>
                  ))}
                </div>
              </section>

              <section style={{ padding: "44px 24px", borderRadius: "18px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)", textAlign: "center" }}>
                <h2 style={{ margin: "0 0 22px", color: "var(--text-primary)", fontSize: "clamp(1.5rem, 4vw, 2.2rem)" }}>მზად ხარ ახალი გამოწვევებისთვის?</h2>
                <button
                  className="landing-cta"
                  onClick={() => currentUser ? handleNavigation("events") : setIsAuthModalOpen(true)}
                  style={{ padding: "14px 26px", border: "none", borderRadius: "10px", backgroundColor: "var(--accent-color)", color: "#ffffff", cursor: "pointer", fontSize: "1rem", fontWeight: "800" }}
                >
                  შემოგვიერთდი ახლავე
                </button>
              </section>
            </section>
          ) : activeTab === "events" ? (
            <section>
              <FilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                category={category}
                setCategory={setCategory}
                format={format}
                setFormat={setFormat}
                currency={currency}
                setCurrency={setCurrency}
                theme={theme}
                dateRange={dateRange}
                setDateRange={setDateRange}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minEventPrice={minEventPrice}
                maxEventPrice={maxEventPrice}
              />

              <div className="events-grid">
                {filteredEvents.map((item, index) => {
                  const isRegistered = registeredEventIds.includes(String(item.id));
                  const isBlurred = index >= 8 && !isProUser;
                  const isMostPopular = isProUser && mostPopularEventIds.has(String(item.id));
                  const imageUrl = item.image && item.image.trim() !== ""
                    ? item.image
                    : getDefaultImage(item.category);

                  return (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "12px",
                        padding: 0,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        overflow: "hidden",
                        ...(isBlurred
                          ? {
                              filter: "blur(6px)",
                              opacity: "0.6",
                              pointerEvents: "none",
                              userSelect: "none",
                            }
                          : {}),
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "180px",
                          backgroundImage: `url("${imageUrl}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          position: "relative",
                        }}
                      >
                        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "8px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              backgroundColor: "var(--badge-bg)",
                              color: "var(--badge-text)",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                            }}
                          >
                            {item.category}
                          </span>
                          {item.format && (
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                backgroundColor: "var(--bg-card)",
                                color: "var(--text-primary)",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                              }}
                            >
                              {item.format}
                            </span>
                          )}
                          {isMostPopular && (
                            <span
                              title="ყველაზე მოთხოვნადი"
                              style={{
                                padding: "6px",
                                borderRadius: "50%",
                                backgroundColor: "#f59e0b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FireIcon size={16} color="#ffffff" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "24px",
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.15rem", color: "var(--text-primary)" }}>
                            {item.title}
                          </h3>

                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.88rem",
                              marginBottom: "16px",
                              display: "flex",
                              gap: "16px",
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <CalendarIcon size={15} color="var(--text-muted)" />
                              {item.date}
                            </span>

                            {/* 🔹 ქალაქის და რუკის ღილაკი ქარდში */}
                            <button
                              onClick={() => setMapModalEvent({ title: item.title, city: item.city })}
                              title="ნახე რუკაზე"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "var(--badge-bg)",
                                color: "var(--accent-color)",
                                border: "none",
                                borderRadius: "6px",
                                padding: "3px 8px",
                                cursor: "pointer",
                                fontSize: "0.82rem",
                                fontWeight: "600",
                                transition: "opacity 0.2s",
                              }}
                            >
                              <MapPinIcon size={14} color="var(--accent-color)" />
                              <span>{item.city}</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polygon points="12 8 8 12 12 16 12 8"></polygon>
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "auto",
                            borderTop: "1px solid var(--border-color)",
                            paddingTop: "16px",
                          }}
                        >
                          <span style={{ fontSize: "1.05rem", fontWeight: "700" }}>
                            {formatPrice(item.price)}
                          </span>

                          <button
                            onClick={() => {
                              if (isRegistered) {
                                handleUnregisterEvent(item.id);
                              } else {
                                handleRegisterEvent(item.id);
                              }
                            }}
                            style={{
                              padding: "10px 18px",
                              backgroundColor: isRegistered ? "var(--badge-bg)" : "var(--accent-color)",
                              color: isRegistered ? "var(--badge-text)" : "#ffffff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "0.85rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {isRegistered ? (
                              <>
                                <CheckIcon size={14} />
                                <span>რეგისტრირებული</span>
                              </>
                            ) : (
                              "რეგისტრაცია"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {filteredEvents.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  <p>ივენთები ამ ფილტრებით არ მოიძებნა.</p>
                </div>
              )}

              {/* 🔹 მხოლოდ ივენთების გვერდზე: რუკის ინტერაქციული სექცია */}
              <section
                style={{
                  marginTop: "64px",
                  padding: "32px",
                  backgroundColor: "var(--bg-card)",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "1.4rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPinIcon size={20} color="var(--accent-color)" />
                      <span>ჩვენი ივენთების ლოკაციები</span>
                    </h3>
                    <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      გამოიკვლიე ტექ-ჰაბები და შეხვედრის ადგილები საქართველოში (თბილისი, ბათუმი, ქუთაისი)
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "360px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <iframe
                    title="TechMeet Locations Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src="https://maps.google.com/maps?q=Tbilisi,Georgia&t=&z=12&ie=UTF8&iwloc=&output=embed"
                  />
                </div>
              </section>
            </section>
          ) : null}
        </main>
      </div>

      {/* 🔹 ლოკაციის მოდალი (ქარდზე დაჭერისას) */}
      {mapModalEvent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              maxWidth: "600px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h4 style={{ margin: 0, color: "var(--text-primary)", fontSize: "1.1rem" }}>
                  {mapModalEvent.title}
                </h4>
                <small style={{ color: "var(--accent-color)", fontWeight: "600" }}>
                  📍 {mapModalEvent.city}
                </small>
              </div>
              <button
                onClick={() => setMapModalEvent(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.4rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ height: "340px", width: "100%" }}>
              <iframe
                title={`Map for ${mapModalEvent.title}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapModalEvent.city + ', Georgia')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          </div>
        </div>
      )}

      <footer
        className="app-footer"
        style={{
          backgroundColor: "var(--bg-card)",
          padding: "40px 24px",
          marginTop: "64px",
          textAlign: "center",
          borderTop: "1px solid var(--border-color)",
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: "800", marginBottom: "10px" }}>
          TechMeet
        </div>
        <p style={{ margin: "0 0 20px", lineHeight: 1.5 }}>
          საუკეთესო IT ივენთები და ნეტვორქინგი
        </p>
        <small>© 2026 TechMeet. ყველა უფლება დაცულია.</small>
      </footer>

      <AIAgentWidget events={eventList} dbEvents={dbEvents} isProUser={isProUser} onOpenCabinet={() => setIsCabinetOpen(true)} onToggleTheme={toggleTheme} onGoToPricing={() => handleNavigation("packages")} />

      {/* 🔹 Login / Register Modal */}
      {isAuthModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700" }}>
                {authMode === "login" ? "ავტორიზაცია" : "რეგისტრაცია"}
              </h2>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleAuthSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {authMode === "register" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px" }}>სახელი</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="გიორგი გიორგაძე"
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box" }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px" }}>ელ-ფოსტა</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px" }}>პაროლი</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box" }}
                />
              </div>

              <button
                type="submit"
                style={{ padding: "12px", backgroundColor: "var(--accent-color)", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", marginTop: "8px" }}
              >
                {authMode === "login" ? "შესვლა" : "რეგისტრირება"}
              </button>
            </form>

            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              {authMode === "login" ? (
                <p>არ გაქვთ ანგარიში? <span onClick={() => setAuthMode("register")} style={{ color: "var(--accent-color)", cursor: "pointer", fontWeight: "600" }}>რეგისტრაცია</span></p>
              ) : (
                <p>უკვე გაქვთ ანგარიში? <span onClick={() => setAuthMode("login")} style={{ color: "var(--accent-color)", cursor: "pointer", fontWeight: "600" }}>შესვლა</span></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🔹 UserCabinetModal */}
      <UserCabinetModal
        isOpen={isCabinetOpen}
        onClose={() => setIsCabinetOpen(false)}
        tickets={registeredEvents}
        onDeleteTicket={handleUnregisterEvent}
        isLoggedIn={!!currentUser}
        user={currentUser ? { name: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "მომხმარებელი", email: currentUser.email || "" } : null}
        isProUser={isProUser}
        onNavigateToPackages={() => {
          setIsCabinetOpen(false);
          setActiveTab("packages");
        }}
      />
    </div>
  );
}