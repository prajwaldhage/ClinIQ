import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, Pill, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MedicineAutocompleteProps {
  value: string;
  onSelect: (medicine: string) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  hideIcon?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function MedicineAutocomplete({
  value,
  onSelect,
  onChange,
  placeholder = "Search medicine...",
  className,
  inputClassName,
  hideIcon = false,
  disabled,
  autoFocus
}: MedicineAutocompleteProps) {
  const [query, setQuery] = useState(value || "");
  const [medicines, setMedicines] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync prop changes
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Load medicines once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/medicines.json');
        const data = await res.json();
        if (mounted && Array.isArray(data)) {
          setMedicines(data);
        }
      } catch (e) {
        console.error("Failed to load medicines", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Memoized filtering
  const filteredOptions = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    
    // simple substring search, taking top 10
    const results: string[] = [];
    for (let i = 0; i < medicines.length; i++) {
        if (medicines[i].toLowerCase().includes(q)) {
            results.push(medicines[i]);
            if (results.length >= 10) break;
        }
    }
    return results;
  }, [debouncedQuery, medicines]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    setQuery(option);
    setIsOpen(false);
    onSelect(option);
    if (onChange) onChange(option);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        handleSelect(filteredOptions[activeIndex]);
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div className="relative">
        {!hideIcon && <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-subtle)]" />}
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:outline-none focus:border-blue-500/50 transition-colors",
            hideIcon ? "px-3" : "pl-9 pr-8",
            inputClassName
          )}
        />
        {query && (
          <button 
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors"
            onClick={() => {
              setQuery("");
              if (onChange) onChange("");
              setIsOpen(true);
              inputRef.current?.focus();
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && query.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 border border-blue-500/20 bg-[var(--surface-elevated)] shadow-xl max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 flex items-center justify-center">
                <p className="text-xs text-[var(--foreground-muted)] animate-pulse">Loading dataset...</p>
            </div>
          ) : filteredOptions.length > 0 ? (
            <div className="py-1">
              {filteredOptions.map((option, idx) => (
                <div
                  key={option}
                  className={cn(
                    "px-3 py-2 cursor-pointer text-sm flex items-center gap-2 transition-colors",
                    activeIndex === idx 
                        ? "bg-blue-500/10 text-blue-400" 
                        : "hover:bg-[var(--surface)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  )}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelect(option)}
                >
                  <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Pill className="w-3 h-3 text-blue-400" />
                  </div>
                  {option}
                </div>
              ))}
            </div>
          ) : debouncedQuery ? (
            <div className="p-4 text-center">
              <p className="text-xs text-[var(--foreground-muted)]">No match found.</p>
              <p className="text-[10px] text-[var(--foreground-subtle)] mt-1">Press enter to use "{debouncedQuery}"</p>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}
