"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { LoaderCircleIcon } from "lucide-react";

export interface AutocompleteOption {
  label: string;
  value: string;
  sublabel?: string;
  meta?: Record<string, string>;
}

interface AutocompleteInputProps {
  id?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<AutocompleteOption[]>;
  onSelect?: (option: AutocompleteOption) => void;
  required?: boolean;
  autoFocus?: boolean;
}

export function AutocompleteInput({
  id,
  value,
  placeholder,
  onChange,
  onSearch,
  onSelect,
  required,
  autoFocus,
}: AutocompleteInputProps) {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      onChange(v);
      setHighlighted(-1);

      if (timerRef.current) clearTimeout(timerRef.current);

      if (v.length < 2) {
        setOptions([]);
        setOpen(false);
        return;
      }

      timerRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const results = await onSearch(v);
          setOptions(results);
          setOpen(results.length > 0);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [onChange, onSearch],
  );

  function handleSelect(opt: AutocompleteOption) {
    onChange(opt.value);
    onSelect?.(opt);
    setOpen(false);
    setOptions([]);
    setHighlighted(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      handleSelect(options[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => options.length > 0 && setOpen(true)}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
      />
      {loading && (
        <LoaderCircleIcon className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
      {open && options.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-popover shadow-md">
          {options.map((opt, i) => (
            <button
              key={`${opt.value}-${i}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
              className={`flex w-full flex-col px-3 py-2 text-left transition-colors ${
                i === highlighted ? "bg-accent" : "hover:bg-accent"
              }`}
            >
              <span className="text-sm font-medium leading-5">{opt.label}</span>
              {opt.sublabel && (
                <span className="text-xs leading-4 text-muted-foreground">{opt.sublabel}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
