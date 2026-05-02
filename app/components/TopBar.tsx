'use client';

import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type NavItem =
  | { kind: 'route'; href: string; label: string }
  | { kind: 'anchor'; id: string; label: string };

export function TopBar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const navItems: NavItem[] = useMemo(
    () => [
      { kind: 'route', href: '/', label: 'Home' },
      { kind: 'anchor', id: 'services', label: 'Services' },
      { kind: 'anchor', id: 'portfolio', label: 'Portfolio' },
      { kind: 'anchor', id: 'contact', label: 'Contact' },
      { kind: 'route', href: '/about', label: 'About' },
    ],
    []
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('top');

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const sections = navItems
      .filter((i): i is Extract<NavItem, { kind: 'anchor' }> => i.kind === 'anchor')
      .map((i) => document.getElementById(i.id))
      .filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { root: null, rootMargin: '-30% 0px -60% 0px', threshold: [0.01, 0.1, 0.2, 0.35, 0.5] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome, navItems]);

  function scrollToId(id: string) {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const activeLabel =
    pathname === '/about'
      ? 'About'
      : isHome
        ? (() => {
            const match = navItems.find(
              (i) => i.kind === 'anchor' && i.id === activeSection
            ) as Extract<NavItem, { kind: 'anchor' }> | undefined;
            return match?.label ?? 'Home';
          })()
        : 'Home';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/90 shadow-[0_1px_0_0_rgba(15,23,42,0.06)] backdrop-blur-md dark:border-white/9 dark:bg-[#0b1120]/92 dark:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06)] dark:backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo - Left */}
          <Link
            href="/"
            className="group flex items-center gap-3 shrink-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              setMobileOpen(false);
            }}
          >
            <Image
              src="/elvoria.png"
              alt="Elvoriatech"
              width={40}
              height={40}
              priority
              sizes="40px"
              className="h-10 w-10"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-wide text-foreground">Elvoriatech</span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                {'AI-First Digital & Software Development Partner'}
              </span>
            </div>
          </Link>

          {/* Navigation - Center */}
          <nav className="hidden md:block flex-1">
            <ul className="flex justify-center gap-2">
              {navItems.map((item) => (
                <li key={item.kind === 'route' ? item.href : item.id}>
                  {item.kind === 'route' ? (
                    <Link
                      href={item.href}
                      className={[
                        'relative rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60',
                        'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
                        activeLabel === item.label ? 'text-foreground' : '',
                      ].join(' ')}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={[
                          'pointer-events-none absolute left-3 right-3 -bottom-px h-px bg-linear-to-r from-purple-400/0 via-purple-400/60 to-blue-400/0 transition-opacity',
                          activeLabel === item.label ? 'opacity-100' : 'opacity-0',
                        ].join(' ')}
                      />
                    </Link>
                  ) : (
                    <a
                      href={`/#${item.id}`}
                      className={[
                        'relative rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60',
                        'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
                        isHome && activeSection === item.id ? 'text-foreground' : '',
                      ].join(' ')}
                      onClick={(e) => {
                        if (!isHome) return;
                        e.preventDefault();
                        scrollToId(item.id);
                      }}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={[
                          'pointer-events-none absolute left-3 right-3 -bottom-px h-px bg-linear-to-r from-purple-400/0 via-purple-400/60 to-blue-400/0 transition-opacity',
                          isHome && activeSection === item.id ? 'opacity-100' : 'opacity-0',
                        ].join(' ')}
                      />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:block">
              <a
                href={isHome ? '#contact' : '/#contact'}
                onClick={(e) => {
                  if (!isHome) return;
                  e.preventDefault();
                  scrollToId('contact');
                }}
                className="bg-linear-to-r from-(--brand-accent) to-(--brand-primary) hover:shadow-lg hover:shadow-(color:--brand-primary)/30 text-white px-5 py-2.5 rounded-lg transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60 text-sm font-semibold"
              >
                Get Started
              </a>
            </div>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#0b1120]/96 dark:shadow-xl dark:backdrop-blur-md">
              <nav className="p-2">
                <ul className="flex flex-col">
                  {navItems.map((item) => (
                    <li key={item.kind === 'route' ? item.href : item.id}>
                      {item.kind === 'route' ? (
                        <Link
                          href={item.href}
                          className={[
                            'block rounded-lg px-3 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60',
                            activeLabel === item.label ? 'bg-foreground/5 text-foreground' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                          ].join(' ')}
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <a
                          href={isHome ? `#${item.id}` : `/#${item.id}`}
                          className={[
                            'block rounded-lg px-3 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60',
                            isHome && activeSection === item.id
                              ? 'bg-foreground/5 text-foreground'
                              : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                          ].join(' ')}
                          onClick={(e) => {
                            if (!isHome) return;
                            e.preventDefault();
                            scrollToId(item.id);
                            setMobileOpen(false);
                          }}
                        >
                          {item.label}
                        </a>
                      )}
                    </li>
                  ))}
                  <li className="pt-2">
                    <a
                      href={isHome ? '#contact' : '/#contact'}
                      className="block rounded-lg px-3 py-3 text-white bg-linear-to-r from-(--brand-accent) to-(--brand-primary) hover:shadow-lg hover:shadow-(color:--brand-primary)/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60 font-semibold"
                      onClick={(e) => {
                        if (!isHome) return;
                        e.preventDefault();
                        scrollToId('contact');
                        setMobileOpen(false);
                      }}
                    >
                      Get Started
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
