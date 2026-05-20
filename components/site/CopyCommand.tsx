'use client';

import { useState } from 'react';

import { CheckIcon, CopyIcon } from '@/components/site/icons';

interface CopyCommandProps {
  command: string;
}

export function CopyCommand({ command }: CopyCommandProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-outline-variant/30 bg-code-bg p-2">
      <span className="flex-1 px-2 font-mono text-sm text-tertiary">
        <span className="text-on-surface-variant/50">$ </span>
        {command}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="copy"
        className="rounded p-1.5 text-on-surface-variant transition-colors hover:text-primary"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-tertiary" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
