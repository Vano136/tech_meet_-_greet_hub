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

// 🔹 Google-ის SVG აიკონი
const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// =========================================
// 🔹 ენების ლექსიკონი (UI Translations)
// =========================================
const UI_TRANSLATIONS = {
  ka: {
    nav: {
      home: "მთავარი",
      events: "ივენთები",
      blogs: "ბლოგი",
      packages: "პაკეტები",
      tenders: "ტენდერები",
      cabinet: "კაბინეტი",
      logout: "გამოსვლა",
      login: "შესვლა / რეგისტრაცია",
    },
    landing: {
      heroTitle: "TechMeet",
      heroSub: "აღმოაჩინე და დაესწარი საუკეთესო IT ივენთებსა და ბიზნეს შეხვედრებს",
      joinBtn: "შემოგვიერთდი ახლავე",
      whyUs: "რატომ ჩვენ?",
      features: [
        "ცენტრალიზებული ტექ-ფოკუსი",
        "სმარტ ვიზუალური ფილტრაცია",
        "ინტეგრირებული კალათა და დაჯავშნა",
        "ქართულ ბაზართან ინტეგრაცია"
      ],
      howItWorks: "როგორ მუშაობს",
      steps: ["გაიარე რეგისტრაცია", "აღმოაჩინე ივენთი", "დაესწარი და განვითარდი"],
      ready: "მზად ხარ ახალი გამოწვევებისთვის?",
      futurePartners: "ჩვენი მომავალი პარტნიორები",
    },
    events: {
      back: "უკან ივენთების სიაში",
      about: "ღონისძიების შესახებ",
      program: "ბანაკის პროგრამა",
      mapLocation: "ლოკაცია რუკაზე",
      ticketPrice: "ბილეთის ფასი",
      free: "უფასო",
      details: "დეტალები",
      register: "რეგისტრაცია",
      registerExt: "რეგისტრაცია ↗",
      registered: "რეგისტრირებული ხართ ✓",
      registeredShort: "რეგისტრირებული",
      notFound: "ივენთები ამ ფილტრებით არ მოიძებნა.",
      mapTitle: "ჩვენი ივენთების ლოკაციები",
      mapDesc: "გამოიკვლიე ტექ-ჰაბები და შეხვედრის ადგილები საქართველოში (თბილისი, ბათუმი, ქუთაისი)"
    },
    blogs: {
      title: "TechMeet ბლოგი",
      desc: "სიახლეები, რჩევები და ანალიტიკა ტექნოლოგიური სამყაროდან",
      back: "უკან ბლოგების სიაში",
      readTime: "წაკითხვა",
      full: "სრულად →"
    },
    packages: {
      title: "აირჩიეთ პაკეტი",
      desc: "აირჩიეთ თქვენთვის სასურველი წვდომის დონე.",
      free: "უფასო",
      current: "მიმდინარე",
      pro: "პრო",
      rec: "რეკომენდებული",
      featuresFree: ["✓ წვდომა პირველ 8 ივენთზე", "✓ წვდომა ბლოგის ყველა სტატიაზე", "✓ ძირითადი ფილტრაციის სისტემა"],
      featuresPro: ["✓ ყველა (9+) ივენთის განბლოკვა", "✓ AI ასისტენტის შეუზღუდავი გამოყენება", "✓ წვდომა დახურულ ტენდერებზე & დეტალებზე", "✓ ყველაზე მოთხოვნადი ივენთების სტატისტიკა"],
      buy: "ყიდვა - 40 ₾",
      bought: "შეძენილია"
    },
    tenders: {
      title: "ტენდერები & პროექტები",
      desc: "ექსკლუზიური შეკვეთები და შესაძლებლობები IT პროფესიონალებისა და სააგენტოებისთვის.",
      back: "უკან ტენდერების სიაში",
      locked: "ტენდერებზე წვდომისთვის შეიძინეთ პრო პაკეტი 40 ₾-ად",
      buyPro: "შეიძინეთ PRO",
      budget: "ბიუჯეტი",
      deadline: "განაცხადის მიღების ვადა",
      techDesc: "ტექნიკური აღწერა",
      reqs: "ძირითადი მოთხოვნები & Deliverables",
      send: "შეთავაზების გაგზავნა (Bid Project)",
      deadlinePrefix: "ვადა: ",
      details: "დეტალები →"
    },
    footer: {
      desc: "საუკეთესო IT ივენთები და ნეტვორქინგი",
      rights: "ყველა უფლება დაცულია."
    },
    auth: {
      loginTitle: "ავტორიზაცია",
      regTitle: "რეგისტრაცია",
      name: "სახელი",
      email: "ელ-ფოსტა",
      pass: "პაროლი",
      loginBtn: "შესვლა",
      regBtn: "რეგისტრაცია",
      googleBtn: "Google-ით შესვლა",
      noAccount: "არ გაქვთ ანგარიში?",
      haveAccount: "უკვე გაქვთ ანგარიში?",
      or: "ან"
    },
    regForm: {
      title: "ივენთზე რეგისტრაცია",
      firstName: "სახელი",
      lastName: "გვარი",
      age: "ასაკი",
      email: "ელ-ფოსტა",
      phone: "ტელეფონის ნომერი",
      experience: "გამოცდილება (IT სფეროში)",
      expOptions: ["არ მაქვს", "დამწყები (0-1 წელი)", "საშუალო (1-3 წელი)", "პროფესიონალი (3+ წელი)"],
      comment: "თქვენი კომენტარი (სურვილისამებრ)",
      submit: "გაგზავნა",
      ageError: "თქვენი ასაკი არ შეესაბამება მოთხოვნას (საჭიროა: {limit})",
      success: "თქვენი განაცხადი წარმატებით გაიგზავნა!"
    }
  },
  en: {
    nav: {
      home: "Home",
      events: "Events",
      blogs: "Blogs",
      packages: "Pricing",
      tenders: "Tenders",
      cabinet: "Cabinet",
      logout: "Logout",
      login: "Login / Register",
    },
    landing: {
      heroTitle: "TechMeet",
      heroSub: "Discover and attend the best IT events and business meetings",
      joinBtn: "Join Us Now",
      whyUs: "Why Us?",
      features: [
        "Centralized Tech Focus",
        "Smart Visual Filtering",
        "Integrated Cart & Booking",
        "Georgian Market Integration"
      ],
      howItWorks: "How It Works",
      steps: ["Register Account", "Discover Events", "Attend & Grow"],
      ready: "Ready for new challenges?",
      futurePartners: "Our Future Partners",
    },
    events: {
      back: "Back to Events List",
      about: "About Event",
      program: "Camp Program",
      mapLocation: "Location on Map",
      ticketPrice: "Ticket Price",
      free: "Free",
      details: "Details",
      register: "Register",
      registerExt: "Register ↗",
      registered: "Registered ✓",
      registeredShort: "Registered",
      notFound: "No events found with these filters.",
      mapTitle: "Our Event Locations",
      mapDesc: "Explore tech hubs and meeting places in Georgia (Tbilisi, Batumi, Kutaisi)"
    },
    blogs: {
      title: "TechMeet Blog",
      desc: "News, tips, and analytics from the tech world",
      back: "Back to Blogs List",
      readTime: "read",
      full: "Read more →"
    },
    packages: {
      title: "Choose a Package",
      desc: "Select your preferred access level.",
      free: "Free",
      current: "Current",
      pro: "Pro",
      rec: "Recommended",
      featuresFree: ["✓ Access first 8 events", "✓ Access all blog articles", "✓ Basic filtering system"],
      featuresPro: ["✓ Unlock all (9+) events", "✓ Unlimited AI Assistant usage", "✓ Access closed tenders & details", "✓ Most demanded events statistics"],
      buy: "Buy - 40 ₾",
      bought: "Purchased"
    },
    tenders: {
      title: "Tenders & Projects",
      desc: "Exclusive requests and opportunities for IT professionals and agencies.",
      back: "Back to Tenders List",
      locked: "Buy Pro package for 40 ₾ to access tenders",
      buyPro: "Buy PRO",
      budget: "Budget",
      deadline: "Application Deadline",
      techDesc: "Technical Description",
      reqs: "Main Requirements & Deliverables",
      send: "Submit Bid (Bid Project)",
      deadlinePrefix: "Deadline: ",
      details: "Details →"
    },
    footer: {
      desc: "The Best IT Events & Networking",
      rights: "All rights reserved."
    },
    auth: {
      loginTitle: "Login",
      regTitle: "Register",
      name: "Full Name",
      email: "Email Address",
      pass: "Password",
      loginBtn: "Sign In",
      regBtn: "Sign Up",
      googleBtn: "Continue with Google",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      or: "or"
    },
    regForm: {
      title: "Event Registration",
      firstName: "First Name",
      lastName: "Last Name",
      age: "Age",
      email: "Email",
      phone: "Phone Number",
      experience: "Experience (in IT)",
      expOptions: ["None", "Beginner (0-1 years)", "Intermediate (1-3 years)", "Professional (3+ years)"],
      comment: "Your Comment (Optional)",
      submit: "Submit Application",
      ageError: "Your age does not meet the requirements (required: {limit})",
      success: "Your application has been submitted successfully!"
    }
  }
};

export interface EventItem {
  id: string | number;
  title: string;
  category: string;
  city: string;
  date: string;
  price: number;
  format?: string;
  image?: string;
  description?: string;
  participantsCount?: number;
  duration?: string;
  ageLimit?: string;
  program?: string[];
  externalLink?: string;
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

export interface TenderItem {
  id: string | number;
  title: string;
  company: string;
  budget: string;
  deadline: string;
  category: string;
  image: string;
  description: string;
  fullRequirements: string[];
}

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 1,
    title: "როგორ შევარჩიოთ პირველი IT კონფერენცია საქართველოში?",
    category: "კარიერა",
    author: "ნიკა ბერიძე",
    date: "18 ოქტომბერი, 2026",
    readTime: "4 წთ",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    summary: "კონფერენციებზე დასწრება ნეტვორქინგისა და ახალი ტექნოლოგიების გაცნობის საუკეთესო გზაა. გაეცანით რჩევებს დამწყებთათვის.",
    content: `ტექნოლოგიური ღონისძიებები და კონფერენციები არ არის მხოლოდ პრეზენტაციების მოსასმენი ადგილი. ეს არის უნიკალური შესაძლებლობა, პირისპირ შეხვდეთ ინდუსტრიის ლიდერებს, გაიცნოთ მომავალი დამსაქმებლები და იპოვოთ თანამოაზრეები საკუთარი სტარტაპ იდეებისთვის.

1. **წინასწარ შეისწავლეთ სპიკერების სია:** სანამ კონფერენციაზე წახვალთ, გადახედეთ განრიგს და მონიშნეთ ის გამოსვლები, რომლებიც თქვენს ინტერესებს ყველაზე მეტად ემთხვევა.
2. **ნუ მოგერიდებათ შეკითხვების დასმა:** სპიკერები ყოველთვის აფასებენ აქტიურ მსმენელებს. პრეზენტაციის შემდეგ მიდით და გაესაუბრეთ მათ პირადად.
3. **მოამზადეთ მოკლე თვითპრეზენტაცია (Elevator Pitch):** იყავით მზად, 30 წამში მოყვეთ ვინ ხართ და რა მიმართულებით ვითარდებით.`,
  },
  {
    id: 2,
    title: "ხელოვნური ინტელექტის მომავალი და ქართული სტარტაპ ეკოსისტემა",
    category: "AI & Tech",
    author: "სალომე კვარაცხელია",
    date: "12 ოქტომბერი, 2026",
    readTime: "6 წთ",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    summary: "როგორ ცვლის Gemini და თანამედროვე LLM მოდელები ქართული ბიზნესების ყოველდღიურ პროდუქტიულობას.",
    content: `გენერაციული ხელოვნური ინტელექტი უკვე აღარ არის მხოლოდ ექსპერიმენტი. ქართული ტექნოლოგიური კომპანიები აქტიურად ნერგავენ ჭკვიან აგენტებსა და ავტომატიზაციის ხელსაწყოებს მომხმარებელთა მომსახურებასა და პროგრამულ უზრუნველყოფაში.

TechMeet-ის პლატფორმაზე წარმოდგენილი არაერთი ჰაკათონი და ვორქშოფი სწორედ AI ტექნოლოგიების პრაქტიკულ გამოყენებას ეძღვნება. სტარტაპებისთვის AI წარმოადგენს უდიდეს ბერკეტს, რათა მცირე გუნდით შექმნან გლობალური მასშტაბის პროდუქტები.`,
  },
  {
    id: 3,
    title: "ჰაკათონისთვის მზადების 5 ოქროს წესი",
    category: "ჰაკათონი",
    author: "გიორგი მამარდაშვილი",
    date: "05 ოქტომბერი, 2026",
    readTime: "5 წთ",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    summary: "როგორ გადავანაწილოთ როლები 48-საათიან მარათონში და შევქმნათ გამარჯვებული MVP.",
    content: `ჰაკათონში გამარჯვება მხოლოდ კოდის წერაზე არ არის დამოკიდებული. წარმატების 70% სწორ სტრატეგიაში, მკაფიო იდეასა და გუნდურ კოორდინაციაშია.

- **განსაზღვრეთ MVP-ის მინიმალური ზღვარი:** ნუ შეეცდებით მთელი სისტემის აწყობას 48 საათში. გააკეთეთ ერთი ფუნქცია, მაგრამ იდეალურად.
- **პრეზენტაცია გადამწყვეტია:** ბოლო 4-5 საათი აუცილებლად დაუთმეთ დემოს მომზადებას და პრეზენტაციის რეპეტიციას.
- **ძილი და ენერგია:** გამოუძინებელი დეველოპერი კრიტიკულ მომენტში შეცდომებს უშვებს. გაინაწილეთ დასვენების გრაფიკი.`,
  },
];

const MOCK_TENDERS: TenderItem[] = [
  {
    id: 1,
    title: "კორპორატიული პლატფორმის დამზადება & UI/UX",
    company: "FinTech Georgia",
    budget: "7,500 ₾",
    deadline: "2026-11-20",
    category: "Web Development",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    description: "საფინანსო კომპანიისთვის თანამედროვე, სწრაფი, უსაფრთხო და ადაპტირებული ვებსაიტის დამზადება React/Next.js-ზე.",
    fullRequirements: [
      "სრული რესპონსივ დიზაინი (Mobile, Tablet, Desktop)",
      "Next.js / React + TailwindCSS გამოყენება",
      "SEO ოპტიმიზაცია და Core Web Vitals-ის 90+ მაჩვენებელი",
      "ადმინ პანელის ინტეგრაცია კონტენტის სამართავად",
    ],
  },
  {
    id: 2,
    title: "სერვერული ინფრასტრუქტურის & DevOps გამართვა",
    company: "CloudCore Labs",
    budget: "18,000 ₾",
    deadline: "2026-12-05",
    category: "Cloud & DevOps",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    description: "სერვერების, ქსელური უსაფრთხოების, CI/CD პაიპლაინებისა და ავტომატური სარეზერვო (Backup) სისტემის არქიტექტურა.",
    fullRequirements: [
      "Kubernetes კლასტერის კონფიგურაცია AWS/GCP გარემოში",
      "GitHub Actions CI/CD სრული ავტომატიზაცია",
      "სარეზერვო ასლების ავტომატური შექმნა და Disaster Recovery გეგმა",
      "Prometheus & Grafana მონიტორინგის სისტემის აწყობა",
    ],
  },
  {
    id: 3,
    title: "მობილური აპლიკაციის განვითარება (iOS & Android)",
    company: "SmartDelivery Solutions",
    budget: "24,000 ₾",
    deadline: "2027-01-15",
    category: "Mobile Apps",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    description: "კურიერული მომსახურების სერვისისთვის რეალურ დროში GPS თრექინგით აღჭურვილი აპლიკაციის შექმნა Flutter-ზე.",
    fullRequirements: [
      "Flutter ან React Native კროს-პლატფორმული შემუშავება",
      "Live GPS ლოკაციის თრექინგი და რუკების ინტეგრაცია",
      "Push შეტყობინებების სერვისი (FCM)",
      "საბანკო გადახდების ინტეგრაცია (Apple Pay, Google Pay, ქართული ბანკები)",
    ],
  },
  {
    id: 4,
    title: "კიბერუსაფრთხოების ყოვლისმომცველი აუდიტი",
    company: "BankTech Security",
    budget: "8,500 ₾",
    deadline: "2026-12-18",
    category: "Cybersecurity",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    description: "ორგანიზაციის შიდა და გარე ვებ-აპლიკაციების შეღწევადობის ტესტირება (Penetration Testing) და რეკომენდაციები.",
    fullRequirements: [
      "OWASP Top 10 სისუსტეების სრული შემოწმება",
      "API ენდფოინთების უსაფრთხოების ტესტირება",
      "დეტალური ანგარიში რისკების კლასიფიკაციითა და გამოსწორების გზებით",
    ],
  },
  {
    id: 5,
    title: "მონაცემთა ანალიტიკისა & BI პლატფორმის დანერგვა",
    company: "Retail Group Georgia",
    budget: "15,000 ₾",
    deadline: "2027-02-01",
    category: "Data Science",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    description: "საცალო გაყიდვების მონაცემების ცენტრალიზებული დამუშავება, ვიზუალიზაცია და პროგნოზირების მოდელების ჩაშენება.",
    fullRequirements: [
      "ETL პაიპლაინების აწყობა PostgreSQL-დან მონაცემთა საწყობში",
      "Power BI / Tableau ინტერაქციული დეშბორდების აგება",
      "მომხმარებელთა ქცევის ანალიზის მოდულების შემუშავება",
    ],
  },
];

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

const getParticipantsCount = (id: string | number) => {
  const numericId = typeof id === "number"
    ? id
    : Array.from(String(id)).reduce((total, character) => total + character.charCodeAt(0), 0);
  return 50 + ((numericId * 137) % 451);
};

export const getDefaultImage = (category: string): string => {
  const normalizedCategory = category.toLowerCase();
  if (normalizedCategory.includes("ჰაკათონი") || normalizedCategory.includes("hackathon")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80";
  }
  if (normalizedCategory.includes("ვორქშოფი") || normalizedCategory.includes("workshop")) {
    return "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80";
  }
  if (normalizedCategory.includes("კონფერენცია") || normalizedCategory.includes("conference")) {
    return "https://images.unsplash.com/photo-1475721025505-23126fbb1e60?auto=format&fit=crop&w=800&q=80";
  }
  if (normalizedCategory.includes("ბანაკი") || normalizedCategory.includes("camp")) {
    return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
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

  // 🔹 ენის სთეითი
  const [lang, setLang] = useState<"ka" | "en">(
    () => (localStorage.getItem("lang") as "ka" | "en") || "ka"
  );

  // აქტიური ენის ობიექტი
  const t = UI_TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleLang = () => {
    setLang((prev) => (prev === "ka" ? "en" : "ka"));
  };

  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState<"home" | "events" | "blogs" | "tenders" | "packages">("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🔹 დეტალური ხედების სთეითი
  const [selectedEventId, setSelectedEventId] = useState<string | number | null>(null);
  const [selectedBlogId, setSelectedBlogId] = useState<string | number | null>(null);
  const [selectedTenderId, setSelectedTenderId] = useState<string | number | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const [mapModalEvent, setMapModalEvent] = useState<{ title: string; city: string } | null>(null);

  // 🔹 ბლოგების სთეითი
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem("techmeet_blogs");
      return saved ? JSON.parse(saved) : INITIAL_BLOGS;
    } catch {
      return INITIAL_BLOGS;
    }
  });

  // 🔹 ტენდერები
  const [tenders] = useState<TenderItem[]>(MOCK_TENDERS);

  // 🔹 ივენთების სთეითი
  const [eventList, setEventList] = useState<EventItem[]>(() => {
    try {
      const savedEvents = localStorage.getItem("techmeet_events");
      if (savedEvents) {
        const parsed = JSON.parse(savedEvents);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse saved events:", e);
    }

    const realProjects: EventItem[] = [
      {
        id: "gita-startup-academy",
        title: "GITA სტარტაპ აკადემია",
        category: "ვორქშოფი",
        city: "თბილისი",
        date: "2026-10-15",
        price: 0,
        format: "ჰიბრიდული",
        image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80",
        description: "საქართველოს ინოვაციების და ტექნოლოგიების სააგენტოს (GITA) სტარტაპ აკადემია. ისწავლე ბიზნესის განვითარება, პიჩინგი და მოიზიდე ინვესტიციები შენი იდეისთვის.",
        participantsCount: 250,
        externalLink: "https://apps.mygita.ge/zs/kKtqql"
      },
      {
        id: "cdc-rethink-camp",
        title: "CDC / Rethink Vibe Coding Camp",
        category: "ბანაკი",
        city: "ბათუმი",
        date: "2026-10-25",
        price: 0,
        format: "ადგილზე",
        duration: "7 დღე",
        ageLimit: "14-18 წელი",
        program: ["ვებ-დეველოპმენტი (HTML/CSS/JS)", "ალგორითმული აზროვნება", "გუნდური პროექტები"],
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
        description: "ინტენსიური Coding Camp ახალგაზრდებისთვის. შეისწავლე პროგრამირების საფუძვლები, იმუშავე რეალურ პროექტებზე და გაატარე დრო თანამოაზრეებთან ერთად.",
        participantsCount: 85,
        externalLink: "https://apps.mygita.ge/zs/DMtAGs"
      },
      {
        id: "gita-arteast-artwest",
        title: "GITA Tech Park ArtEast - ArtWest",
        category: "ჰაკათონი",
        city: "თბილისი",
        date: "2026-11-05",
        price: 0,
        format: "ადგილზე",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        description: "GITA-ს მასშტაბური პროექტი ArtEast - ArtWest. შეაერთე ხელოვნება და ტექნოლოგიები, შექმენი ინოვაციური პროექტები და მოიპოვე დაფინანსება შენი იდეისთვის.",
        participantsCount: 150,
        externalLink: "https://apps.mygita.ge/zs/MhCZ3r?fbclid=IwY2xjawUfeddwZG9mBWV4dG4DYWVtAjEwAGJyaWQRMU1sb21WZlZpN2ZnYmxydGtzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeq8Xg2YDykPCOSxdHo2LUVk711pTaTyxRXS76TIz3mqDoRx4wSiM9bvZmvYk_aem_ZVqbOzhf6SNCxm6lS1OcoQ"
      },
      ...initialEvents.map((event: any) => ({
        ...event,
        participantsCount: getParticipantsCount(event.id),
        description: event.description || "ამ ივენთზე გაეცნობით უახლეს IT ტრენდებს, მიიღებთ პრაქტიკულ გამოცდილებას და გაიცნობთ ინდუსტრიის პროფესიონალებს.",
      }))
    ];

    return realProjects;
  });

  useEffect(() => {
    localStorage.setItem("techmeet_events", JSON.stringify(eventList));
  }, [eventList]);

  useEffect(() => {
    localStorage.setItem("techmeet_blogs", JSON.stringify(blogs));
  }, [blogs]);

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

  // 🔹 რეგისტრაციის მოდალის სთეითი
  const [registrationModal, setRegistrationModal] = useState<{
    isOpen: boolean;
    eventId: string | number | null;
    ageError: string | null;
  }>({ isOpen: false, eventId: null, ageError: null });

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

  useEffect(() => {
    let mounted = true;
    const fetchDatabaseEvents = async () => {
      try {
        const { data, error } = await supabase.from("events").select("*");
        if (error) {
          console.warn("Supabase events fetch warning:", error);
          return;
        }
        if (mounted && data && data.length > 0) {
          setDbEvents(data);
          if (!localStorage.getItem("techmeet_events")) {
            setEventList(data);
          }
        }
      } catch (err) {
        console.warn("Database sync offline, using local storage fallback.");
      }
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

  // 🔹 ივენთის სარეგისტრაციო ფორმის გახსნა
  const openRegistrationForm = (eventId: string | number) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setRegistrationModal({ isOpen: true, eventId, ageError: null });
  };

  // 🔹 სარეგისტრაციო ფორმის გაგზავნა (ასაკის შემოწმებით)
  const handleRegFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ageStr = formData.get("age") as string;
    const age = parseInt(ageStr, 10);
    const evId = registrationModal.eventId;

    if (evId) {
      const eventToRegister = eventList.find(ev => ev.id === evId);
      
      // ასაკობრივი შეზღუდვის შემოწმება
      if (eventToRegister?.ageLimit) {
        const nums = eventToRegister.ageLimit.match(/\d+/g);
        if (nums) {
          if (nums.length === 2) {
            const min = parseInt(nums[0], 10);
            const max = parseInt(nums[1], 10);
            if (age < min || age > max) {
              setRegistrationModal(prev => ({
                ...prev, 
                ageError: t.regForm.ageError.replace("{limit}", eventToRegister.ageLimit as string)
              }));
              return;
            }
          } else if (nums.length === 1) {
            const min = parseInt(nums[0], 10);
            if (age < min) {
              setRegistrationModal(prev => ({
                ...prev, 
                ageError: t.regForm.ageError.replace("{limit}", eventToRegister.ageLimit as string)
              }));
              return;
            }
          }
        }
      }

      // წარმატებული რეგისტრაცია
      const strId = String(evId);
      setRegisteredEventIds((prev) => {
        if (prev.includes(strId)) return prev;
        return [...prev, strId];
      });

      alert(t.regForm.success);
      setRegistrationModal({ isOpen: false, eventId: null, ageError: null });
    }
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

  // 🔹 Google-ით შესვლის ლოგიკა
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      alert(error.message);
    }
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

  const handleNavigation = (tab: "home" | "events" | "blogs" | "tenders" | "packages") => {
    if (tab !== "home" && !currentUser) {
      setIsAuthModalOpen(true);
      setIsMobileMenuOpen(false);
      return;
    }

    setActiveTab(tab);
    setSelectedEventId(null);
    setSelectedBlogId(null);
    setSelectedTenderId(null);
    setIsMobileMenuOpen(false);
  };

  const registeredEvents = eventList.filter((event) =>
    registeredEventIds.includes(String(event.id)),
  );

  const handleAddEventNew = (newEvent: any) => {
    const isCamp = newEvent.category === "ბანაკი";
    const formattedEvent: EventItem = {
      ...newEvent,
      id: Date.now(),
      category: newEvent.category || "Web Development",
      format: isCamp ? "ადგილზე" : (newEvent.format || "Online"),
      city: newEvent.city || "თბილისი",
      price: Number(newEvent.price) || 0,
      description: newEvent.description || "ღონისძიების დეტალური აღწერა მალე განახლდება.",
      participantsCount: getParticipantsCount(Date.now()),
    };

    setEventList((prev) => {
      const updated = [formattedEvent, ...prev];
      localStorage.setItem("techmeet_events", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteEvent = (id: string | number) => {
    setEventList((prev) => {
      const updated = prev.filter((ev) => String(ev.id) !== String(id));
      localStorage.setItem("techmeet_events", JSON.stringify(updated));
      return updated;
    });
    handleUnregisterEvent(id);
    if (selectedEventId === id) setSelectedEventId(null);
  };

  const handleUpdateEvent = (updatedEvent: any) => {
    const isCamp = updatedEvent.category === "ბანაკი";
    const fixedEvent = {
      ...updatedEvent,
      format: isCamp ? "ადგილზე" : updatedEvent.format,
    };
    
    setEventList((prev) => {
      const updated = prev.map((ev) =>
        String(ev.id) === String(fixedEvent.id) ? { ...ev, ...fixedEvent } : ev,
      );
      localStorage.setItem("techmeet_events", JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddBlog = (newBlog: Omit<BlogPost, "id">) => {
    const created: BlogPost = {
      ...newBlog,
      id: Date.now(),
    };
    setBlogs((prev) => {
      const updated = [created, ...prev];
      localStorage.setItem("techmeet_blogs", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteBlog = (id: string | number) => {
    setBlogs((prev) => {
      const updated = prev.filter((b) => String(b.id) !== String(id));
      localStorage.setItem("techmeet_blogs", JSON.stringify(updated));
      return updated;
    });
    if (selectedBlogId === id) setSelectedBlogId(null);
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
    if (priceInGEL === 0) return t.events.free;
    const rate = CURRENCY_RATES[currency] || 1;
    const convertedPrice = Math.round(priceInGEL * rate);
    const symbol = CURRENCY_SYMBOLS[currency] || "₾";

    return currency === "USD" || currency === "EUR"
      ? `${symbol}${convertedPrice}`
      : `${convertedPrice} ${symbol}`;
  };

  const activeEventDetail = useMemo(() => {
    if (!selectedEventId) return null;
    return eventList.find((ev) => String(ev.id) === String(selectedEventId));
  }, [selectedEventId, eventList]);

  const activeBlogDetail = useMemo(() => {
    if (!selectedBlogId) return null;
    return blogs.find((b) => String(b.id) === String(selectedBlogId));
  }, [selectedBlogId, blogs]);

  const activeTenderDetail = useMemo(() => {
    if (!selectedTenderId) return null;
    return tenders.find((t) => String(t.id) === String(selectedTenderId));
  }, [selectedTenderId, tenders]);

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
        blogs={blogs}
        onAddBlog={handleAddBlog}
        onDeleteBlog={handleDeleteBlog}
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
          backgroundColor: theme === "dark" ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
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
          {/* ლოგო და ანიმაციური ლურჯ-შავი გრადიენტ-ტექსტი */}
          <div
            onClick={() => handleNavigation("home")}
            style={{
              fontSize: "1.35rem",
              fontWeight: "850",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              letterSpacing: "-0.03em",
              userSelect: "none",
            }}
          >
            <style>{`
              @keyframes techMeetFlow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }

              .techmeet-gradient-text {
                background: linear-gradient(
                  90deg,
                  #0284c7 0%,
                  #38bdf8 25%,
                  #090d16 50%,
                  #2563eb 75%,
                  #0284c7 100%
                );
                background-size: 250% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: techMeetFlow 3.8s ease-in-out infinite;
                display: inline-block;
              }

              [data-theme="light"] .techmeet-gradient-text {
                background: linear-gradient(
                  90deg,
                  #0284c7 0%,
                  #38bdf8 25%,
                  #0f172a 50%,
                  #1d4ed8 75%,
                  #0284c7 100%
                );
                background-size: 250% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: techMeetFlow 3.8s ease-in-out infinite;
              }
            `}</style>
            <Logo size={32} />
            <span className="techmeet-gradient-text">TechMeet</span>
          </div>

          <div className="desktop-nav" style={{ gap: "18px", alignItems: "center" }}>
            <button className="nav-link" onClick={() => handleNavigation("home")} style={{ background: "none", border: "none", color: "var(--text-primary)", fontWeight: activeTab === "home" ? "600" : "500", cursor: "pointer", fontSize: "0.95rem" }}>{t.nav.home}</button>
            <button className="nav-link" onClick={() => handleNavigation("events")} style={{ background: "none", border: "none", color: "var(--text-primary)", fontWeight: activeTab === "events" ? "600" : "500", cursor: "pointer", fontSize: "0.95rem" }}>{t.nav.events}</button>
            <button className="nav-link" onClick={() => handleNavigation("blogs")} style={{ background: "none", border: "none", color: "var(--text-primary)", fontWeight: activeTab === "blogs" ? "600" : "500", cursor: "pointer", fontSize: "0.95rem" }}>{t.nav.blogs}</button>
            <button className="nav-link" onClick={() => handleNavigation("packages")} style={{ background: "none", border: "none", color: "var(--text-primary)", fontWeight: activeTab === "packages" ? "600" : "500", cursor: "pointer", fontSize: "0.95rem" }}>{t.nav.packages}</button>
            <button className="nav-link" onClick={() => handleNavigation("tenders")} style={{ background: "none", border: "none", color: "var(--text-primary)", fontWeight: activeTab === "tenders" ? "600" : "500", cursor: "pointer", fontSize: "0.95rem" }}>{t.nav.tenders}</button>
            
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            
            {/* 🔹 ენის შეცვლის ღილაკი (Desktop) */}
            <button
              onClick={toggleLang}
              style={{
                background: "none",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "700"
              }}
            >
              {lang === "ka" ? "EN" : "GE"}
            </button>

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
                  <span>{currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "User"}</span>
                  {isProUser && (
                    <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "#facc15", color: "#422006", fontSize: "0.65rem", fontWeight: "800" }}>
                      PRO
                    </span>
                  )}
                  {registeredEventIds.length > 0 && (
                    <span style={{ backgroundColor: "#ef4444", color: "#ffffff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                      {registeredEventIds.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  style={{ background: "none", border: "1px solid var(--border-color)", color: "var(--text-secondary)", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem" }}
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{ padding: "8px 18px", backgroundColor: "var(--accent-color)", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" }}
              >
                {t.nav.login}
              </button>
            )}
          </div>

          <div className="mobile-toggle" style={{ alignItems: "center", gap: "12px" }}>
            {/* 🔹 ენის შეცვლის ღილაკი (Mobile) */}
            <button
              onClick={toggleLang}
              style={{
                background: "none",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "700"
              }}
            >
              {lang === "ka" ? "EN" : "GE"}
            </button>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: theme === "light" ? "#f1f5f9" : "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* 🔹 მობილურის ბურგერ მენიუ */}
        {isMobileMenuOpen && (
          <div
            className="mobile-menu"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "14px",
              padding: "16px",
              borderRadius: "14px",
              backgroundColor: theme === "light" ? "#ffffff" : "#0f172a",
              border: theme === "light" ? "1px solid #e2e8f0" : "1px solid #334155",
              boxShadow: theme === "light" ? "0 10px 25px rgba(0,0,0,0.08)" : "0 10px 25px rgba(0,0,0,0.5)",
            }}
          >
            <button className="nav-link" onClick={() => handleNavigation("home")} style={{ background: activeTab === "home" ? (theme === "light" ? "#f1f5f9" : "#1e293b") : "none", border: "none", borderRadius: "8px", padding: "10px 12px", color: "var(--text-primary)", fontWeight: activeTab === "home" ? "700" : "500", cursor: "pointer", textAlign: "left", fontSize: "0.98rem" }}>{t.nav.home}</button>
            <button className="nav-link" onClick={() => handleNavigation("events")} style={{ background: activeTab === "events" ? (theme === "light" ? "#f1f5f9" : "#1e293b") : "none", border: "none", borderRadius: "8px", padding: "10px 12px", color: "var(--text-primary)", fontWeight: activeTab === "events" ? "700" : "500", cursor: "pointer", textAlign: "left", fontSize: "0.98rem" }}>{t.nav.events}</button>
            <button className="nav-link" onClick={() => handleNavigation("blogs")} style={{ background: activeTab === "blogs" ? (theme === "light" ? "#f1f5f9" : "#1e293b") : "none", border: "none", borderRadius: "8px", padding: "10px 12px", color: "var(--text-primary)", fontWeight: activeTab === "blogs" ? "700" : "500", cursor: "pointer", textAlign: "left", fontSize: "0.98rem" }}>{t.nav.blogs}</button>
            <button className="nav-link" onClick={() => handleNavigation("tenders")} style={{ background: activeTab === "tenders" ? (theme === "light" ? "#f1f5f9" : "#1e293b") : "none", border: "none", borderRadius: "8px", padding: "10px 12px", color: "var(--text-primary)", fontWeight: activeTab === "tenders" ? "700" : "500", cursor: "pointer", textAlign: "left", fontSize: "0.98rem" }}>{t.nav.tenders}</button>
            <button className="nav-link" onClick={() => handleNavigation("packages")} style={{ background: activeTab === "packages" ? (theme === "light" ? "#f1f5f9" : "#1e293b") : "none", border: "none", borderRadius: "8px", padding: "10px 12px", color: "var(--text-primary)", fontWeight: activeTab === "packages" ? "700" : "500", cursor: "pointer", textAlign: "left", fontSize: "0.98rem" }}>{t.nav.packages}</button>

            {currentUser ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                <button
                  onClick={() => { setIsCabinetOpen(true); setIsMobileMenuOpen(false); }}
                  style={{ padding: "10px 14px", backgroundColor: "var(--accent-color)", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <UserIcon size={16} />
                  <span>{currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "User"}</span>
                  {isProUser && (
                    <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "#facc15", color: "#422006", fontSize: "0.65rem", fontWeight: "800" }}>
                      PRO
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  style={{ padding: "10px", background: "none", border: "1px solid var(--border-color)", color: "var(--text-secondary)", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                style={{ padding: "12px", backgroundColor: "var(--accent-color)", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", marginTop: "10px" }}
              >
                {t.nav.login}
              </button>
            )}
          </div>
        )}
      </nav>

      {/* 🔹 ძირითადი კონტენტი */}
      <div style={{ padding: "32px 16px", flex: 1 }}>
        <main style={{ maxWidth: "1100px", margin: "0 auto" }}>
          
          {/* =========================================
              🔹 1. ივენთის (და ბანაკის) დეტალური გვერდი
             ========================================= */}
          {activeTab === "events" && activeEventDetail ? (
            <section style={{ maxWidth: "800px", margin: "0 auto" }}>
              <button
                onClick={() => setSelectedEventId(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: "600",
                  marginBottom: "24px",
                }}
              >
                ← {t.events.back}
              </button>

              <div
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={activeEventDetail.image && activeEventDetail.image.trim() !== "" ? activeEventDetail.image : getDefaultImage(activeEventDetail.category)}
                  alt={activeEventDetail.title}
                  style={{ width: "100%", maxHeight: "360px", objectFit: "cover" }}
                />

                <div style={{ padding: "32px" }}>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <span style={{ padding: "4px 12px", borderRadius: "6px", backgroundColor: "var(--badge-bg)", color: "var(--badge-text)", fontSize: "0.85rem", fontWeight: "600" }}>
                      {activeEventDetail.category}
                    </span>
                    {activeEventDetail.format && (
                      <span style={{ padding: "4px 12px", borderRadius: "6px", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: "600", border: "1px solid var(--border-color)" }}>
                        {activeEventDetail.format}
                      </span>
                    )}
                    {/* 🔹 თუ ბანაკია: ხანგრძლივობა და ასაკი */}
                    {activeEventDetail.category === "ბანაკი" && activeEventDetail.duration && (
                      <span style={{ padding: "4px 12px", borderRadius: "6px", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: "600", border: "1px solid var(--border-color)" }}>
                        ⏳ {activeEventDetail.duration}
                      </span>
                    )}
                    {activeEventDetail.category === "ბანაკი" && activeEventDetail.ageLimit && (
                      <span style={{ padding: "4px 12px", borderRadius: "6px", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: "600", border: "1px solid var(--border-color)" }}>
                        👥 {activeEventDetail.ageLimit}
                      </span>
                    )}
                  </div>

                  <h1 style={{ margin: "0 0 16px 0", fontSize: "2rem", color: "var(--text-primary)", lineHeight: 1.25 }}>
                    {activeEventDetail.title}
                  </h1>

                  <div style={{ display: "flex", gap: "20px", color: "var(--text-secondary)", marginBottom: "28px", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <CalendarIcon size={18} color="var(--text-muted)" />
                      {activeEventDetail.date}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <MapPinIcon size={18} color="var(--text-muted)" />
                      {activeEventDetail.city}
                    </span>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px", marginBottom: "32px" }}>
                    <h3 style={{ margin: "0 0 12px 0", color: "var(--text-primary)" }}>{t.events.about}</h3>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "1.05rem", whiteSpace: "pre-line" }}>
                      {activeEventDetail.description}
                    </p>
                  </div>

                  {/* 🔹 თუ ბანაკია: პროგრამის სია */}
                  {activeEventDetail.category === "ბანაკი" && activeEventDetail.program && activeEventDetail.program.length > 0 && (
                    <div style={{ marginBottom: "32px", padding: "20px", backgroundColor: "var(--bg-main)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                      <h3 style={{ margin: "0 0 16px 0", color: "var(--text-primary)" }}>{t.events.program}</h3>
                      <ul style={{ margin: 0, paddingLeft: "24px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        {activeEventDetail.program.map((p, idx) => (
                          <li key={idx} style={{ marginBottom: "8px" }}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ marginBottom: "32px" }}>
                    <h3 style={{ margin: "0 0 12px 0", color: "var(--text-primary)" }}>{t.events.mapLocation}</h3>
                    <div style={{ height: "260px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                      <iframe
                        title="Detail Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(activeEventDetail.city + ', Georgia')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
                    <div>
                      <small style={{ color: "var(--text-secondary)", display: "block" }}>{t.events.ticketPrice}</small>
                      <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)" }}>
                        {formatPrice(activeEventDetail.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (activeEventDetail.externalLink) {
                          window.open(activeEventDetail.externalLink, "_blank");
                        } else {
                          const isRegistered = registeredEventIds.includes(String(activeEventDetail.id));
                          if (isRegistered) {
                            handleUnregisterEvent(activeEventDetail.id);
                          } else {
                            openRegistrationForm(activeEventDetail.id);
                          }
                        }
                      }}
                      style={{
                        padding: "14px 28px",
                        backgroundColor: activeEventDetail.externalLink ? "var(--accent-color)" : (registeredEventIds.includes(String(activeEventDetail.id)) ? "var(--badge-bg)" : "var(--accent-color)"),
                        color: activeEventDetail.externalLink ? "#ffffff" : (registeredEventIds.includes(String(activeEventDetail.id)) ? "var(--badge-text)" : "#ffffff"),
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: "1rem",
                      }}
                    >
                      {activeEventDetail.externalLink 
                        ? t.events.registerExt 
                        : (registeredEventIds.includes(String(activeEventDetail.id)) ? t.events.registered : t.events.register)
                      }
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : activeTab === "blogs" && activeBlogDetail ? (
            /* =========================================
               🔹 2. ბლოგის ცალკე დეტალური გვერდი
               ========================================= */
            <article style={{ maxWidth: "800px", margin: "0 auto" }}>
              <button
                onClick={() => setSelectedBlogId(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: "600",
                  marginBottom: "24px",
                }}
              >
                ← {t.blogs.back}
              </button>

              <div
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={activeBlogDetail.image}
                  alt={activeBlogDetail.title}
                  style={{ width: "100%", maxHeight: "380px", objectFit: "cover" }}
                />

                <div style={{ padding: "36px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ padding: "4px 12px", borderRadius: "6px", backgroundColor: "var(--badge-bg)", color: "var(--badge-text)", fontSize: "0.85rem", fontWeight: "600" }}>
                      {activeBlogDetail.category}
                    </span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {activeBlogDetail.readTime} {t.blogs.readTime}
                    </span>
                  </div>

                  <h1 style={{ margin: "0 0 16px 0", fontSize: "2.2rem", color: "var(--text-primary)", lineHeight: 1.25 }}>
                    {activeBlogDetail.title}
                  </h1>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-secondary)", marginBottom: "32px", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--accent-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700" }}>
                      {activeBlogDetail.author[0]}
                    </div>
                    <div>
                      <strong style={{ color: "var(--text-primary)", display: "block" }}>{activeBlogDetail.author}</strong>
                      <small>{activeBlogDetail.date}</small>
                    </div>
                  </div>

                  <div style={{ color: "var(--text-primary)", fontSize: "1.1rem", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                    {activeBlogDetail.content}
                  </div>
                </div>
              </div>
            </article>
          ) : activeTab === "tenders" && activeTenderDetail ? (
            /* =========================================
               🔹 3. ტენდერის ცალკე დეტალური გვერდი
               ========================================= */
            <section style={{ maxWidth: "800px", margin: "0 auto" }}>
              <button
                onClick={() => setSelectedTenderId(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: "600",
                  marginBottom: "24px",
                }}
              >
                ← {t.tenders.back}
              </button>

              <div
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={activeTenderDetail.image}
                  alt={activeTenderDetail.title}
                  style={{ width: "100%", maxHeight: "360px", objectFit: "cover" }}
                />

                <div style={{ padding: "36px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ padding: "4px 12px", borderRadius: "6px", backgroundColor: "var(--badge-bg)", color: "var(--badge-text)", fontSize: "0.85rem", fontWeight: "600" }}>
                      {activeTenderDetail.category}
                    </span>
                    <span style={{ padding: "4px 10px", borderRadius: "6px", backgroundColor: "#facc15", color: "#422006", fontSize: "0.75rem", fontWeight: "800" }}>
                      PRO
                    </span>
                  </div>

                  <h1 style={{ margin: "0 0 12px 0", fontSize: "2rem", color: "var(--text-primary)", lineHeight: 1.25 }}>
                    {activeTenderDetail.title}
                  </h1>
                  <p style={{ margin: "0 0 24px 0", color: "var(--accent-color)", fontWeight: "700", fontSize: "1.1rem" }}>
                    {activeTenderDetail.company}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "16px", borderRadius: "12px", backgroundColor: "var(--bg-main)", marginBottom: "32px", border: "1px solid var(--border-color)" }}>
                    <div>
                      <small style={{ color: "var(--text-secondary)", display: "block" }}>{t.tenders.budget}</small>
                      <strong style={{ fontSize: "1.3rem", color: "var(--text-primary)" }}>{activeTenderDetail.budget}</strong>
                    </div>
                    <div>
                      <small style={{ color: "var(--text-secondary)", display: "block" }}>{t.tenders.deadline}</small>
                      <strong style={{ fontSize: "1.1rem", color: "#ef4444" }}>{activeTenderDetail.deadline}</strong>
                    </div>
                  </div>

                  <div style={{ marginBottom: "28px" }}>
                    <h3 style={{ margin: "0 0 12px 0", color: "var(--text-primary)" }}>{t.tenders.techDesc}</h3>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "1rem" }}>
                      {activeTenderDetail.description}
                    </p>
                  </div>

                  <div style={{ marginBottom: "36px" }}>
                    <h3 style={{ margin: "0 0 16px 0", color: "var(--text-primary)" }}>{t.tenders.reqs}</h3>
                    <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "10px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {activeTenderDetail.fullRequirements.map((req, idx) => (
                        <li key={idx}><strong style={{ color: "var(--text-primary)" }}>{req}</strong></li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => alert(`Submitted to "${activeTenderDetail.company}"!`)}
                    style={{ width: "100%", padding: "16px", backgroundColor: "var(--accent-color)", color: "#ffffff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "1.1rem" }}
                  >
                    {t.tenders.send}
                  </button>
                </div>
              </div>
            </section>
          ) : activeTab === "blogs" ? (
            /* =========================================
               🔹 4. ბლოგების სია
               ========================================= */
            <section>
              <div style={{ marginBottom: "32px", textAlign: "center" }}>
                <h2 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: "2.2rem" }}>
                  {t.blogs.title}
                </h2>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "1.05rem" }}>
                  {t.blogs.desc}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "24px",
                }}
              >
                {blogs.map((blog) => (
                  <article
                    key={blog.id}
                    onClick={() => setSelectedBlogId(blog.id)}
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s ease, border-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor = "var(--accent-color)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "var(--border-color)";
                    }}
                  >
                    <img
                      src={blog.image}
                      alt={blog.title}
                      style={{ width: "100%", height: "200px", objectFit: "cover" }}
                    />
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ padding: "3px 8px", borderRadius: "6px", backgroundColor: "var(--badge-bg)", color: "var(--badge-text)", fontSize: "0.75rem", fontWeight: "600" }}>
                          {blog.category}
                        </span>
                        <small style={{ color: "var(--text-secondary)" }}>{blog.readTime}</small>
                      </div>

                      <h3 style={{ margin: "0 0 10px 0", color: "var(--text-primary)", fontSize: "1.2rem", lineHeight: 1.35 }}>
                        {blog.title}
                      </h3>

                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, margin: "0 0 20px 0", flex: 1 }}>
                        {blog.summary}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
                        <small style={{ color: "var(--text-muted)" }}>{blog.author} • {blog.date}</small>
                        <span style={{ color: "var(--accent-color)", fontWeight: "700", fontSize: "0.9rem" }}>{t.blogs.full}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : activeTab === "packages" ? (
            /* =========================================
               🔹 5. პაკეტები
               ========================================= */
            <section style={{ textAlign: "center" }}>
              <h2 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: "2rem" }}>
                {t.packages.title}
              </h2>
              <p style={{ margin: "0 0 32px", color: "var(--text-secondary)" }}>
                {t.packages.desc}
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
                  <h3 style={{ margin: "0 0 12px", color: "var(--text-primary)" }}>{t.packages.free}</h3>
                  <div style={{ marginBottom: "24px", color: "var(--text-primary)", fontSize: "2rem", fontWeight: "800" }}>0 ₾</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", color: "var(--text-secondary)" }}>
                    {t.packages.featuresFree.map((feat, i) => <span key={i}>{feat}</span>)}
                  </div>
                  <button
                    disabled
                    style={{ width: "100%", marginTop: "28px", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--bg-main)", color: "var(--text-secondary)", fontWeight: "700" }}
                  >
                    {t.packages.current}
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
                  <div style={{ marginBottom: "10px", color: "var(--accent-color)", fontSize: "0.8rem", fontWeight: "800", letterSpacing: "0.08em" }}>{t.packages.rec}</div>
                  <h3 style={{ margin: "0 0 12px", color: "var(--text-primary)" }}>{t.packages.pro}</h3>
                  <div style={{ marginBottom: "24px", color: "var(--text-primary)", fontSize: "2rem", fontWeight: "800" }}>40 ₾</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", color: "var(--text-secondary)" }}>
                    {t.packages.featuresPro.map((feat, i) => <span key={i}>{feat}</span>)}
                  </div>
                  <button
                    onClick={handleBuyPro}
                    disabled={isProUser}
                    style={{ width: "100%", marginTop: "28px", padding: "12px", border: "none", borderRadius: "8px", background: isProUser ? "var(--badge-bg)" : "var(--accent-color)", color: isProUser ? "var(--badge-text)" : "#ffffff", cursor: isProUser ? "default" : "pointer", fontWeight: "800" }}
                  >
                    {isProUser ? t.packages.bought : t.packages.buy}
                  </button>
                </article>
              </div>
            </section>
          ) : activeTab === "tenders" ? (
            /* =========================================
               🔹 6. ტენდერები
               ========================================= */
            <section>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ margin: "0 0 8px", color: "var(--text-primary)" }}>{t.tenders.title}</h2>
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                  {t.tenders.desc}
                </p>
              </div>
              {isProUser ? (
                <div className="events-grid">
                  {tenders.map((tender) => (
                    <article
                      key={tender.id}
                      onClick={() => setSelectedTenderId(tender.id)}
                      style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "16px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        transition: "transform 0.2s ease, border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.borderColor = "var(--accent-color)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "var(--border-color)";
                      }}
                    >
                      <img
                        src={tender.image}
                        alt={tender.title}
                        style={{ width: "100%", height: "180px", objectFit: "cover" }}
                      />
                      <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1, gap: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ padding: "3px 8px", borderRadius: "6px", backgroundColor: "var(--badge-bg)", color: "var(--badge-text)", fontSize: "0.75rem", fontWeight: "600" }}>
                            {tender.category}
                          </span>
                          <small style={{ color: "var(--text-secondary)" }}>{t.tenders.deadlinePrefix}{tender.deadline}</small>
                        </div>
                        <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "1.15rem", lineHeight: 1.3 }}>
                          {tender.title}
                        </h3>
                        <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.5, fontSize: "0.9rem", flex: 1 }}>
                          {tender.description}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "14px", marginTop: "auto" }}>
                          <strong style={{ color: "var(--accent-color)", fontSize: "1.2rem" }}>{tender.budget}</strong>
                          <span style={{ color: "var(--accent-color)", fontWeight: "700", fontSize: "0.9rem" }}>{t.tenders.details}</span>
                        </div>
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
                    {tenders.map((tender) => (
                      <article
                        key={tender.id}
                        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", overflow: "hidden" }}
                      >
                        <img src={tender.image} alt="" style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                        <div style={{ padding: "24px" }}>
                          <h3 style={{ margin: "0 0 16px", color: "var(--text-primary)" }}>{tender.title}</h3>
                          <p style={{ color: "var(--text-secondary)" }}>{tender.description}</p>
                          <strong>{tender.budget}</strong>
                        </div>
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
                        {t.tenders.locked}
                      </h3>
                      <button
                        onClick={handleBuyPro}
                        style={{ padding: "11px 20px", border: "none", borderRadius: "8px", background: "#facc15", color: "#422006", cursor: "pointer", fontWeight: "800" }}
                      >
                        {t.tenders.buyPro}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          ) : activeTab === "home" ? (
            /* =========================================
               🔹 7. მთავარი გვერდი (Landing)
               ========================================= */
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
                  <span>{t.landing.heroTitle}</span>
                  <SparklesIcon size={32} color="var(--accent-color)" />
                </h1>
                <p style={{ position: "relative", zIndex: 2, maxWidth: "600px", margin: "24px auto 32px", color: "#e2e8f0", fontSize: "1.15rem", lineHeight: 1.6 }}>
                  {t.landing.heroSub}
                </p>
                <button
                  className="landing-cta"
                  onClick={() => currentUser ? handleNavigation("events") : setIsAuthModalOpen(true)}
                  style={{ position: "relative", zIndex: 2, padding: "14px 24px", border: "none", borderRadius: "10px", backgroundColor: "var(--accent-color)", color: "#ffffff", cursor: "pointer", fontSize: "1rem", fontWeight: "800" }}
                >
                  {t.landing.joinBtn}
                </button>
              </section>

              {/* 🔹 ჩვენი მომავალი პარტნიორები (მხოლოდ დაბლარული ლოგოებით) */}
              <section style={{ marginBottom: "64px", textAlign: "center" }}>
                <h3 style={{ margin: "0 0 24px", color: "var(--text-secondary)", fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "700" }}>
                  {t.landing.futurePartners}
                </h3>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                  
                  {/* Rethink Preview */}
                  <div style={{ position: "relative", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", width: "260px", height: "120px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <img src="/image_cc07fd.png" alt="Rethink Innovation Center" style={{ maxWidth: "100%", maxHeight: "100%", filter: "blur(8px)", userSelect: "none", opacity: 0.85 }} />
                  </div>

                  {/* CDC Preview */}
                  <div style={{ position: "relative", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", width: "260px", height: "120px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <img src="/image_cc07f9.jpg" alt="Center of Digital Careers" style={{ maxWidth: "100%", maxHeight: "100%", filter: "blur(8px)", userSelect: "none", opacity: 0.85 }} />
                  </div>

                </div>
              </section>

              <section className="landing-features" style={{ marginBottom: "72px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "28px", fontSize: "2rem" }}>{t.landing.whyUs}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
                  {t.landing.features.map((feat, idx) => (
                    <article key={idx} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}>
                      <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{feat}</h3>
                    </article>
                  ))}
                </div>
              </section>

              <section className="landing-steps" style={{ marginBottom: "72px" }}>
                <h2 style={{ margin: "0 0 28px", color: "var(--text-primary)", textAlign: "center", fontSize: "2rem" }}>{t.landing.howItWorks}</h2>
                <div className="landing-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "18px", alignItems: "center" }}>
                  {t.landing.steps.map((step, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ flexShrink: 0, width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--accent-color)", color: "#ffffff", fontWeight: "800" }}>{index + 1}</div>
                      <span style={{ color: "var(--text-primary)", fontWeight: "700", lineHeight: 1.35 }}>{step}</span>
                      {index < 2 && <span style={{ marginLeft: "auto", color: "var(--accent-color)", fontSize: "1.5rem" }}>→</span>}
                    </div>
                  ))}
                </div>
              </section>

              <section style={{ padding: "44px 24px", borderRadius: "18px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)", textAlign: "center" }}>
                <h2 style={{ margin: "0 0 22px", color: "var(--text-primary)", fontSize: "clamp(1.5rem, 4vw, 2.2rem)" }}>{t.landing.ready}</h2>
                <button
                  className="landing-cta"
                  onClick={() => currentUser ? handleNavigation("events") : setIsAuthModalOpen(true)}
                  style={{ padding: "14px 26px", border: "none", borderRadius: "10px", backgroundColor: "var(--accent-color)", color: "#ffffff", cursor: "pointer", fontSize: "1rem", fontWeight: "800" }}
                >
                  {t.landing.joinBtn}
                </button>
              </section>
            </section>
          ) : activeTab === "events" ? (
            /* =========================================
               🔹 8. ივენთების სია
               ========================================= */
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
                        onClick={() => setSelectedEventId(item.id)}
                        style={{
                          width: "100%",
                          height: "180px",
                          backgroundImage: `url("${imageUrl}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          position: "relative",
                          cursor: "pointer",
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
                          <h3
                            onClick={() => setSelectedEventId(item.id)}
                            style={{ margin: "0 0 8px 0", fontSize: "1.15rem", color: "var(--text-primary)", cursor: "pointer" }}
                          >
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

                            <button
                              onClick={() => setMapModalEvent({ title: item.title, city: item.city })}
                              title={t.events.mapLocation}
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

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => setSelectedEventId(item.id)}
                              style={{
                                padding: "10px 14px",
                                background: "var(--bg-main)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "0.85rem",
                              }}
                            >
                              {t.events.details}
                            </button>

                            {/* 🔹 გარე ლინკის შემოწმება მთავარ სიაშიც */}
                            <button
                              onClick={() => {
                                if (item.externalLink) {
                                  window.open(item.externalLink, "_blank");
                                } else {
                                  if (isRegistered) {
                                    handleUnregisterEvent(item.id);
                                  } else {
                                    openRegistrationForm(item.id);
                                  }
                                }
                              }}
                              style={{
                                padding: "10px 18px",
                                backgroundColor: item.externalLink ? "var(--accent-color)" : (isRegistered ? "var(--badge-bg)" : "var(--accent-color)"),
                                color: item.externalLink ? "#ffffff" : (isRegistered ? "var(--badge-text)" : "#ffffff"),
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
                              {item.externalLink 
                                ? t.events.registerExt 
                                : (isRegistered ? (
                                    <>
                                      <CheckIcon size={14} />
                                      <span>{t.events.registeredShort}</span>
                                    </>
                                  ) : t.events.register
                                )
                              }
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {filteredEvents.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  <p>{t.events.notFound}</p>
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
                      <span>{t.events.mapTitle}</span>
                    </h3>
                    <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      {t.events.mapDesc}
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
          {t.footer.desc}
        </p>
        <small>© 2026 TechMeet. {t.footer.rights}</small>
      </footer>

      <AIAgentWidget events={eventList} dbEvents={dbEvents} isProUser={isProUser} onOpenCabinet={() => setIsCabinetOpen(true)} onToggleTheme={toggleTheme} onGoToPricing={() => handleNavigation("packages")} />

      {/* 🔹 ივენთის სარეგისტრაციო ფორმა (მოდალი) */}
      {registrationModal.isOpen && (
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
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "var(--shadow-lg)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700", color: "var(--text-primary)" }}>
                {t.regForm.title}
              </h2>
              <button
                onClick={() => setRegistrationModal({ isOpen: false, eventId: null, ageError: null })}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", color: "var(--text-secondary)" }}>{t.regForm.firstName} *</label>
                  <input type="text" name="firstName" required style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", color: "var(--text-secondary)" }}>{t.regForm.lastName} *</label>
                  <input type="text" name="lastName" required style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", color: "var(--text-secondary)" }}>{t.regForm.age} *</label>
                <input type="number" name="age" min="1" required style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: registrationModal.ageError ? "1px solid #ef4444" : "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box" }} />
                {registrationModal.ageError && (
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#ef4444", fontWeight: "600" }}>
                    {registrationModal.ageError}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", color: "var(--text-secondary)" }}>{t.regForm.email} *</label>
                <input type="email" name="email" required defaultValue={currentUser?.email || ""} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", color: "var(--text-secondary)" }}>{t.regForm.phone} *</label>
                <input type="tel" name="phone" required style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", color: "var(--text-secondary)" }}>{t.regForm.experience} *</label>
                <select name="experience" required style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box", appearance: "none" }}>
                  <option value="">-- აირჩიეთ --</option>
                  {t.regForm.expOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px", color: "var(--text-secondary)" }}>{t.regForm.comment}</label>
                <textarea name="comment" rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box", resize: "none" }}></textarea>
              </div>

              <button
                type="submit"
                style={{ padding: "14px", backgroundColor: "var(--accent-color)", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", marginTop: "8px", fontSize: "1rem" }}
              >
                {t.regForm.submit}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 Login / Register Modal (ნათარგმნი + Google) */}
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
                {authMode === "login" ? t.auth.loginTitle : t.auth.regTitle}
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

            {/* 🔹 Google Auth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-primary)",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "16px"
              }}
            >
              <GoogleIcon />
              {t.auth.googleBtn}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }}></div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{t.auth.or}</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }}></div>
            </div>

            <form
              onSubmit={handleAuthSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {authMode === "register" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px" }}>{t.auth.name}</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box" }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px" }}>{t.auth.email}</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "6px" }}>{t.auth.pass}</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-main)", color: "var(--text-primary)", boxSizing: "border-box" }}
                />
              </div>

              <button
                type="submit"
                style={{ padding: "12px", backgroundColor: "var(--accent-color)", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", marginTop: "8px" }}
              >
                {authMode === "login" ? t.auth.loginBtn : t.auth.regBtn}
              </button>
            </form>

            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              {authMode === "login" ? (
                <p>{t.auth.noAccount} <span onClick={() => setAuthMode("register")} style={{ color: "var(--accent-color)", cursor: "pointer", fontWeight: "600" }}>{t.auth.regTitle}</span></p>
              ) : (
                <p>{t.auth.haveAccount} <span onClick={() => setAuthMode("login")} style={{ color: "var(--accent-color)", cursor: "pointer", fontWeight: "600" }}>{t.auth.loginTitle}</span></p>
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
        user={currentUser ? { name: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "User", email: currentUser.email || "" } : null}
        isProUser={isProUser}
        onNavigateToPackages={() => {
          setIsCabinetOpen(false);
          setActiveTab("packages");
        }}
      />
    </div>
  );
}