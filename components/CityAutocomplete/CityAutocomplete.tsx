"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { searchCities } from "@/lib/api";
import type { GeocodeCity } from "@/lib/types";
import styles from "./cityAutocomplete.module.css";

type CityAutocompleteProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export default function CityAutocomplete({
  id,
  name = "location",
  value: controlledValue,
  defaultValue,
  onChange,
  onBlur,
  placeholder = "Start typing a city...",
  className = "",
  disabled = false,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(controlledValue ?? defaultValue ?? "");
  const [suggestions, setSuggestions] = useState<GeocodeCity[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledValue !== undefined;

  useEffect(() => {
    if (isControlled) setInputValue(controlledValue);
  }, [isControlled, controlledValue]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchCities(q, 10);
      setSuggestions(data);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: GeocodeCity) => {
    const val = city.displayName;
    setInputValue(val);
    onChange?.(val);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    onChange?.(v);
  };

  return (
    <div ref={containerRef} className={`${styles.wrapper} ${className}`}>
      <input
        type="text"
        id={id}
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={onBlur}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={styles.input}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="city-suggestions"
      />
      {loading && <span className={styles.spinner} aria-hidden />}
      {isOpen && suggestions.length > 0 && (
        <ul
          id="city-suggestions"
          className={styles.list}
          role="listbox"
        >
          {suggestions.map((city) => (
            <li
              key={city.id}
              role="option"
              className={styles.item}
              onClick={() => handleSelect(city)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {city.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
