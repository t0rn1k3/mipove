"use client";

import { useState, useRef, useEffect, useId } from "react";
import type { CustomSelectProps, SelectOption } from "@/lib/types";
import styles from "./customSelect.module.css";

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
  triggerClassName = "",
  id,
  "aria-label": ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown" && isOpen) {
      e.preventDefault();
      const idx = options.findIndex((o) => o.value === value);
      const next = options[idx + 1];
      if (next) onChange(next.value);
    } else if (e.key === "ArrowUp" && isOpen) {
      e.preventDefault();
      const idx = options.findIndex((o) => o.value === value);
      const prev = options[idx - 1];
      if (prev) onChange(prev.value);
    }
  };

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`${styles.wrapper} ${className}`}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""} ${triggerClassName}`.trim()}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
      >
        <span className={selected ? styles.triggerText : styles.triggerPlaceholder}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul id={listboxId} role="listbox" className={styles.list}>
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`${styles.item} ${opt.value === value ? styles.itemSelected : ""}`}
              onClick={() => handleSelect(opt)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {opt.label}
              {opt.value === value && (
                <svg
                  className={styles.checkIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
