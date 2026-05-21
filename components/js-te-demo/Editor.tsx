'use client';

import { javascript } from '@codemirror/lang-javascript';
import CodeMirror from '@uiw/react-codemirror';
import { useMemo } from 'react';

interface EditorProps {
  value: string;
  onChange: (next: string) => void;
  readOnly?: boolean;
  height?: string;
}

export function Editor({
  value,
  onChange,
  readOnly = false,
  height = '320px',
}: EditorProps): React.ReactElement {
  const extensions = useMemo(() => [javascript({ jsx: false, typescript: false })], []);
  return (
    <CodeMirror
      value={value}
      height={height}
      theme="dark"
      readOnly={readOnly}
      editable={!readOnly}
      extensions={extensions}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: !readOnly,
        autocompletion: false,
      }}
    />
  );
}
