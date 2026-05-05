'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { setCookie } from '@/lib/cookies';
import { COOKIE_NAME, locales, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface LocaleSwitcherProps {
  currentLocale: Locale;
  dict: Dictionary['header']['localeSwitcher'];
}

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export function LocaleSwitcher({ currentLocale, dict }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current
        && !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  const select = (locale: Locale) => {
    setCookie(COOKIE_NAME, locale, THIRTY_DAYS_SECONDS);
    const segments = pathname.split('/');
    segments[1] = locale;
    const next = segments.join('/') || `/${locale}`;
    router.replace(next);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(0);
    }
  };

  const onItemKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index + 1) % locales.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index - 1 + locales.length) % locales.length);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={dict.label}
        onClick={() => {
          setOpen((value) => !value);
          setActiveIndex(0);
        }}
        onKeyDown={onTriggerKey}
        className="flex items-center gap-1 rounded-md border border-stone px-2.5 py-1 text-sm hover:bg-stone/30"
      >
        <span aria-hidden="true">🌐</span>
        <span>{currentLocale.toUpperCase()}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-stone bg-cream shadow-md"
        >
          {locales.map((loc, index) => (
            <li key={loc} role="none">
              <button
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                role="menuitem"
                type="button"
                onClick={() => select(loc)}
                onKeyDown={(event) => onItemKey(event, index)}
                aria-current={loc === currentLocale ? 'true' : undefined}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-stone/30 ${
                  loc === currentLocale ? 'font-medium text-forest' : ''
                }`}
              >
                {dict[loc]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
