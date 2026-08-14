"use client";

import { useEffect, useRef, useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  className = "",
}: {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-sky bg-cream-soft px-4 py-2 text-sm font-semibold text-brown transition-colors hover:border-sky-deep"
      >
        {label}
        <svg
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
          className={`h-2.5 w-2.5 shrink-0 text-sky-deep transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-30 mt-2 w-56 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-lg border border-sky bg-cream-soft shadow-lg"
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left text-sm font-semibold transition-colors hover:bg-sky-soft ${
                  value === opt.value ? "bg-sky-soft text-sky-deep" : "text-brown"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
