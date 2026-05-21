import { ArrowRightIcon } from '@/components/site/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface DocErrorProps {
  dict: Dictionary['libraries'];
  githubUrl: string;
}

export function DocError({ dict, githubUrl }: DocErrorProps): React.ReactElement {
  return (
    <div className="glass-card rounded-xl px-6 py-8 text-center">
      <p className="text-sm text-on-surface-variant">{dict.loadError}</p>
      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 font-mono text-sm text-primary hover:underline"
      >
        GitHub
        <ArrowRightIcon className="h-4 w-4" />
      </a>
    </div>
  );
}
