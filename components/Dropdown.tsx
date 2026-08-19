"use client";

import { useEffect, useRef, useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  deletable?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  onDeleteOption,
  className = "",
}: {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  onDeleteOption?: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
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

  function handleToggle() {
    if (!open && ref.current) {
      // Flip the option list upward when there isn't much room below the
      // button (e.g. a field low on a long form) and there's more room
      // above -- otherwise it opens off the bottom of the viewport.
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpward(spaceBelow < 240 && spaceAbove > spaceBelow);
    }
    setOpen((o) => !o);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
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
          className={`absolute right-0 z-30 w-56 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-lg border border-sky bg-cream-soft shadow-lg ${
            openUpward ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {options.map((opt) => (
            <li key={opt.value} className="flex items-center">
              <button
                type="button"
                role="option"
                aria-selected={value === opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`block flex-1 px-4 py-2 text-left text-sm font-semibold transition-colors hover:bg-sky-soft ${
                  value === opt.value ? "bg-sky-soft text-sky-deep" : "text-brown"
                }`}
              >
                {opt.label}
              </button>
              {opt.deletable && onDeleteOption && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteOption(opt.value);
                  }}
                  aria-label={`Delete ${opt.label}`}
                  title={`Delete ${opt.label}`}
                  className="mr-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-red-700 transition-colors hover:bg-cream"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 7h16" />
                    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
