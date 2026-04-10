"use client";

import { useState, useRef, useEffect } from "react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ value, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [allSuggestions, setAllSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/places/tags", { signal: controller.signal })
      .then((r) => r.json())
      .then((tags: string[]) => setAllSuggestions(Array.isArray(tags) ? tags : []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const filteredSuggestions = inputValue.trim()
    ? allSuggestions.filter(
        (t) =>
          t.toLowerCase().includes(inputValue.trim().toLowerCase()) &&
          !value.some((v) => v.toLowerCase() === t.toLowerCase()),
      )
    : [];

  const showCreateOption =
    inputValue.trim() !== "" &&
    !allSuggestions.some((t) => t.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !value.some((v) => v.toLowerCase() === inputValue.trim().toLowerCase());

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setInputValue("");
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  }

  function handleBlur() {
    // Delay to allow onMouseDown on dropdown items to fire first
    setTimeout(() => setShowDropdown(false), 150);
  }

  const dropdownVisible = showDropdown && (filteredSuggestions.length > 0 || showCreateOption);

  return (
    <div className="relative">
      <div
        className="flex min-h-10 flex-wrap gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="cursor-pointer leading-none text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? "Add tag…" : ""}
          className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {dropdownVisible && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover py-1 shadow-md">
          {filteredSuggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(tag);
              }}
              className="w-full cursor-pointer px-3 py-1.5 text-left text-sm hover:bg-muted"
            >
              {tag}
            </button>
          ))}
          {showCreateOption && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(inputValue.trim());
              }}
              className="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted"
            >
              Create &ldquo;{inputValue.trim()}&rdquo;…
            </button>
          )}
        </div>
      )}
    </div>
  );
}
