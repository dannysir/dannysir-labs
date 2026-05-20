import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CopyCommand } from '@/components/site/CopyCommand';
import {
  ArrowRightIcon,
  BoltIcon,
  ClaudeLogo,
  CodeIcon,
  NextLogo,
  PackageIcon,
  ReactLogo,
  SparkleIcon,
  TailwindLogo,
  TypeScriptLogo,
} from '@/components/site/icons';
import { LibraryCard } from '@/components/site/LibraryCard';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { libraries } from '@/lib/libraries';

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const dict = getDictionary(locale as Locale);
  return (
    <div className="relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/4 top-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-[100px]" />

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-16 pt-20 text-center">
        <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-surface-high px-3 py-1 font-mono text-xs uppercase tracking-widest text-primary">
          <SparkleIcon className="h-3.5 w-3.5" />
          {dict.landing.heroBadge}
        </span>
        <h1 className="glow-text text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          {dict.landing.heroTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-base text-on-surface-variant sm:text-lg">
          {dict.landing.heroSubtitle}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href={`/${locale}/libraries/floating-components`}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-6 py-3 font-mono text-sm font-bold text-on-primary shadow-[0_0_20px_rgba(138,235,255,0.4)] transition-shadow hover:shadow-[0_0_35px_rgba(138,235,255,0.6)]"
          >
            {dict.landing.tryFloating}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            href={`/${locale}/libraries/js-te`}
            className="rounded-lg border border-outline-variant bg-surface/50 px-6 py-3 font-mono text-sm font-medium text-on-surface backdrop-blur transition-colors hover:bg-surface-high"
          >
            {dict.landing.tryJsTe}
          </Link>
        </div>
      </section>

      {/* Library bento grid */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="mb-6 font-mono text-sm uppercase tracking-widest text-on-surface-variant/60">
          {dict.landing.librariesHeading}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {libraries.map((library) => (
            <LibraryCard
              key={library.id}
              library={library}
              locale={locale as Locale}
              dict={dict.card}
            />
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              Icon: BoltIcon,
              accent: 'text-primary',
              ring: 'border-primary/30 bg-primary/10',
              title: dict.landing.features.runTitle,
              desc: dict.landing.features.runDesc,
            },
            {
              Icon: PackageIcon,
              accent: 'text-secondary',
              ring: 'border-secondary/30 bg-secondary/10',
              title: dict.landing.features.npmTitle,
              desc: dict.landing.features.npmDesc,
            },
            {
              Icon: CodeIcon,
              accent: 'text-tertiary',
              ring: 'border-tertiary/30 bg-tertiary/10',
              title: dict.landing.features.ossTitle,
              desc: dict.landing.features.ossDesc,
            },
          ].map(({ Icon, accent, ring, title, desc }) => (
            <div key={title} className="glass-card rounded-xl p-5">
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg border ${ring} ${accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-mono text-base font-semibold text-on-surface">
                {title}
              </h3>
              <p className="mt-1 text-sm text-on-surface-variant">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Built with */}
      <section className="border-y border-outline-variant/10 bg-surface-low/40 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-outline-variant/40" />
            <p className="font-mono text-xs uppercase tracking-widest text-on-surface-variant/50">
              {dict.landing.builtWith}
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-outline-variant/40" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {[
              { name: 'Next.js', Logo: NextLogo },
              { name: 'React', Logo: ReactLogo },
              { name: 'TypeScript', Logo: TypeScriptLogo },
              { name: 'Tailwind CSS', Logo: TailwindLogo },
              { name: 'Claude Code', Logo: ClaudeLogo },
            ].map(({ name, Logo }) => (
              <div
                key={name}
                className="flex items-center gap-2.5 text-on-surface-variant/40 transition-colors duration-300 hover:text-on-surface"
              >
                <Logo className="h-6 w-6" />
                <span className="font-mono text-base font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Install CTA */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="glass-card relative overflow-hidden rounded-2xl p-10 text-center">
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-secondary/10 blur-[80px]" />
          <h2 className="relative text-2xl font-bold sm:text-3xl">{dict.landing.ctaTitle}</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-on-surface-variant">
            {dict.landing.ctaSubtitle}
          </p>
          <div className="relative mt-6 flex justify-center">
            <CopyCommand command="npm i @dannysir/floating-components" />
          </div>
        </div>
      </section>
    </div>
  );
}
