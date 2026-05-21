import 'server-only';

const RAW_HOST = 'https://raw.githubusercontent.com/';
const REVALIDATE_SECONDS = 3600;

export interface LoadedDoc {
  source: string;
  rawBaseDir: string;
  blobBaseDir: string;
}

export async function loadDoc(rawFileUrl: string): Promise<LoadedDoc> {
  const res = await fetch(rawFileUrl, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch doc (${res.status}): ${rawFileUrl}`);
  }
  const source = await res.text();

  const rawBaseDir = `${rawFileUrl.slice(0, rawFileUrl.lastIndexOf('/'))}/`;
  const [owner, repo, ref, ...dirs] = rawBaseDir.slice(RAW_HOST.length).split('/');
  const dir = dirs.filter(Boolean).join('/');
  const blobBaseDir = `https://github.com/${owner}/${repo}/blob/${ref}/${
    dir ? `${dir}/` : ''
  }`;

  return { source, rawBaseDir, blobBaseDir };
}
