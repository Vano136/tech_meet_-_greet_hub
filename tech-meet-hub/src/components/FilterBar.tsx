import React from "react";
import { SearchIcon } from "./Icons";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  format: string;
  setFormat: (val: string) => void;
  currency: string;
  setCurrency: (val: string) => void;
  theme: string;
  dateRange: { start: string; end: string };
  setDateRange: (val: { start: string; end: string }) => void;
  priceRange: [number, number];
  setPriceRange: (val: [number, number]) => void;
  minEventPrice: number;
  maxEventPrice: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  format,
  setFormat,
  currency,
  setCurrency,
  dateRange,
  setDateRange,
  priceRange,
  setPriceRange,
  minEventPrice,
  maxEventPrice,
}) => {
  // სლაიდერის პროცენტების დათვლა პოზიციონირებისთვის
  const getPercent = (value: number) => {
    if (maxEventPrice === minEventPrice) return 0;
    return Math.round(((value - minEventPrice) / (maxEventPrice - minEventPrice)) * 100);
  };

  const minPercent = getPercent(priceRange[0]);
  const maxPercent = getPercent(priceRange[1]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), priceRange[1] - 1);
    setPriceRange([value, priceRange[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), priceRange[0] + 1);
    setPriceRange([priceRange[0], value]);
  };

  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₾";

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card, #1e293b)",
        padding: "24px",
        borderRadius: "16px",
        marginBottom: "32px",
        border: "1px solid var(--border-color, #334155)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* 🔹 CSS ორმაგი სლაიდერისთვის და ინფუთებისთვის */}
      <style>
        {`
          .filter-input, .filter-select {
            background-color: var(--bg-main, #0f172a);
            color: var(--text-primary, #fff);
            border: 1px solid var(--border-color, #334155);
            padding: 10px 14px;
            border-radius: 8px;
            outline: none;
            font-family: inherit;
            width: 100%;
            box-sizing: border-box;
            font-size: 0.9rem;
          }
          .filter-input:focus, .filter-select:focus {
            border-color: var(--accent-color, #38bdf8);
          }
          
          /* Dual Slider CSS */
          .slider-container {
            position: relative;
            width: 100%;
            height: 40px;
            margin-top: 30px;
          }
          .slider-track {
            position: absolute;
            width: 100%;
            height: 6px;
            background-color: var(--border-color, #334155);
            border-radius: 4px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1;
          }
          .slider-range {
            position: absolute;
            height: 6px;
            background-color: var(--accent-color, #38bdf8);
            border-radius: 4px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 2;
          }
          .slider-input {
            position: absolute;
            width: 100%;
            top: 50%;
            transform: translateY(-50%);
            -webkit-appearance: none;
            appearance: none;
            pointer-events: none;
            background: transparent;
            z-index: 3;
            margin: 0;
          }
          .slider-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            pointer-events: auto;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: var(--accent-color, #38bdf8);
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          }
          .slider-input::-moz-range-thumb {
            pointer-events: auto;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: var(--accent-color, #38bdf8);
            border: none;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          }
          
          /* Tooltip CSS */
          .slider-tooltip {
            position: absolute;
            top: -32px;
            background: #64748b;
            color: #fff;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            transform: translateX(-50%);
            white-space: nowrap;
            z-index: 4;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .slider-tooltip::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 4px 4px 0;
            border-style: solid;
            border-color: #64748b transparent transparent transparent;
          }
        `}
      </style>

      {/* ზედა რიგი: ძებნა და Dropdown-ები */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div style={{ flex: "1 1 250px", position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted, #64748b)" }}>
            <SearchIcon size={18} />
          </span>
          <input
            type="text"
            className="filter-input"
            placeholder="მოძებნე ივენთი..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "38px" }}
          />
        </div>

        <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: "1 1 150px" }}>
          <option value="all">ყველა კატეგორია</option>
          <option value="ვორქშოფი">ვორქშოფი</option>
          <option value="ჰაკათონი">ჰაკათონი</option>
          <option value="კონფერენცია">კონფერენცია</option>
        </select>

        <select className="filter-select" value={format} onChange={(e) => setFormat(e.target.value)} style={{ flex: "1 1 150px" }}>
          <option value="all">ყველა ფორმატი</option>
          <option value="ონლაინ">ონლაინ</option>
          <option value="ადგილზე">ადგილზე</option>
          <option value="ჰიბრიდული">ჰიბრიდული</option>
        </select>

        <select className="filter-select" value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ flex: "0 1 100px" }}>
          <option value="GEL">₾ (GEL)</option>
          <option value="USD">$ (USD)</option>
          <option value="EUR">€ (EUR)</option>
        </select>
      </div>

      {/* ქვედა რიგი: კალენდარი და ფასის სლაიდერი */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
        
        {/* კალენდრის ფილტრი */}
        <div style={{ flex: "1 1 300px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary, #94a3b8)", marginBottom: "8px", fontWeight: "600" }}>
            აირჩიე პერიოდი (დან - მდე)
          </label>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="date"
              className="filter-input"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span style={{ color: "var(--text-secondary)" }}>-</span>
            <input
              type="date"
              className="filter-input"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        {/* 🔹 ფასის დინამიური სლაიდერი */}
        <div style={{ flex: "1 1 300px", paddingRight: "10px" }}>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary, #94a3b8)", fontWeight: "600" }}>
            <span>ფასის ლიმიტი</span>
            <span>{minEventPrice} - {maxEventPrice} {currencySymbol}</span>
          </label>

          <div className="slider-container">
            {/* ფონის ხაზი */}
            <div className="slider-track"></div>
            {/* მონიშნული (აქტიური) ფერადი ხაზი */}
            <div 
              className="slider-range" 
              style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
            ></div>
            
            {/* Tooltip მინიმალური ფასისთვის */}
            <div className="slider-tooltip" style={{ left: `calc(${minPercent}% + (${10 - minPercent * 0.2}px))` }}>
              {priceRange[0]} {currencySymbol}
            </div>
            {/* ინფუთი მინიმალური ფასისთვის */}
            <input
              type="range"
              min={minEventPrice}
              max={maxEventPrice}
              value={priceRange[0]}
              onChange={handleMinChange}
              className="slider-input"
            />

            {/* Tooltip მაქსიმალური ფასისთვის */}
            <div className="slider-tooltip" style={{ left: `calc(${maxPercent}% + (${10 - maxPercent * 0.2}px))` }}>
              {priceRange[1]} {currencySymbol}
            </div>
            {/* ინფუთი მაქსიმალური ფასისთვის */}
            <input
              type="range"
              min={minEventPrice}
              max={maxEventPrice}
              value={priceRange[1]}
              onChange={handleMaxChange}
              className="slider-input"
            />
          </div>
        </div>

      </div>
    </div>
  );
};