import type { Dictionary } from '@/lib/i18n/dictionaries';

interface FooterProps {
  dict: Dictionary;
}

export function Footer({ dict }: FooterProps) {
  const year = new Date().getFullYear();
  const copyright = dict.footer.copyright.replace('{{year}}', String(year));
  return (
    <footer className="mt-16 border-t border-outline-variant/10 bg-surface-lowest">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <span className="font-bold text-primary">{dict.siteName}</span>
          <span className="text-on-surface-variant/70">{copyright}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-on-surface-variant">
          <a
            href="mailto:dannysir0105@gmail.com"
            className="transition-colors hover:text-secondary"
          >
            dannysir0105@gmail.com
          </a>
          <span aria-hidden="true" className="text-outline-variant">|</span>
          <a
            href="https://github.com/dannysir"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-secondary"
          >
            {dict.footer.githubProfile}
          </a>
        </div>
      </div>
    </footer>
  );
}
