import type { Dictionary } from '@/lib/i18n/dictionaries';

interface FooterProps {
  dict: Dictionary;
}

export function Footer({ dict }: FooterProps) {
  const year = new Date().getFullYear();
  const copyright = dict.footer.copyright.replace('{{year}}', String(year));
  return (
    <footer className="mt-16 border-t border-stone">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 text-sm text-olive">
        <span>{copyright}</span>
        <a
          href="https://github.com/dannysir"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-cocoa"
        >
          {dict.footer.githubProfile}
        </a>
      </div>
    </footer>
  );
}
