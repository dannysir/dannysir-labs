import 'server-only';

import type { Element, Root } from 'hast';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified, type Plugin } from 'unified';
import { visit } from 'unist-util-visit';

interface MarkdownProps {
  source: string;
  rawBaseDir: string;
  blobBaseDir: string;
}

interface AbsoluteUrlOptions {
  rawBaseDir: string;
  blobBaseDir: string;
}

const isAbsolute = (url: string): boolean =>
  /^(https?:)?\/\//.test(url) ||
  url.startsWith('#') ||
  url.startsWith('mailto:') ||
  url.startsWith('data:');

const resolveUrl = (base: string, rel: string): string => new URL(rel, base).href;

const rehypeAbsoluteUrls: Plugin<[AbsoluteUrlOptions], Root> =
  ({ rawBaseDir, blobBaseDir }) =>
  (tree) => {
    visit(tree, 'element', (node: Element) => {
      const { properties, tagName } = node;
      if (tagName === 'a' && typeof properties.href === 'string' && !isAbsolute(properties.href)) {
        properties.href = /\.md(#.*)?$/i.test(properties.href)
          ? resolveUrl(blobBaseDir, properties.href)
          : resolveUrl(rawBaseDir, properties.href);
      }
      if (tagName === 'img' && typeof properties.src === 'string' && !isAbsolute(properties.src)) {
        properties.src = resolveUrl(rawBaseDir, properties.src);
      }
    });
  };

export async function Markdown({
  source,
  rawBaseDir,
  blobBaseDir,
}: MarkdownProps): Promise<React.ReactElement> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAbsoluteUrls, { rawBaseDir, blobBaseDir })
    .use(rehypePrettyCode, { theme: 'github-dark', keepBackground: false })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(source);

  return (
    <div
      className="doc-prose"
      // Content comes from our own trusted library repositories.
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  );
}
