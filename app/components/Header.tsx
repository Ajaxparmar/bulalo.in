'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

const menuLinks = [
  {
    href: '/register',
    icon: 'fas fa-store',
    label: 'Listing with us',
  },
  {
    href: '/listing/top-listings',
    icon: 'fas fa-star',
    label: 'Top Listing',
  },
  {
    href: '/contact-us',
    icon: 'fas fa-headset',
    label: 'Help',
  },
];

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMenuOpen]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get('search') ?? '').trim();

    if (query) {
      router.push(`/search-business?search=${encodeURIComponent(query)}`);
    }
  }

  function closeMenu() {
    setIsMenuOpen(false);
    menuToggleRef.current?.focus();
  }

  return (
    <>
      <header className="site-header">
        <Link href="/" className="site-logo" aria-label="Bulalo.in home">
          <span className="site-logo-primary">BULA</span>
          <span className="site-logo-accent">LO</span>
          <span className="site-logo-domain">.IN</span>
        </Link>

        <form className="site-search" onSubmit={handleSearch}>
          <input
            type="search"
            name="search"
            placeholder="Search for Property Dealer"
            minLength={3}
            required
          />
          <button type="submit" aria-label="Search">
            <i className="fas fa-search" />
          </button>
        </form>

        <nav className="desktop-menu" aria-label="Desktop menu">
          <Link
            href="/register"
            className="desktop-listing-link"
          >
            <span>Grow Your Business</span>
            Listing with us
          </Link>
          <Link href="/login">
            <i className="fas fa-user" />
            Login
          </Link>
          <Link href="/listing/top-listings">Top Listing</Link>
          <Link href="/contact-us">
            <i className="fas fa-headset" />
            Help
          </Link>
          <button type="button" className="desktop-location">
            <i className="fas fa-map-marker-alt" />
            Jind
          </button>
        </nav>

        <button
          ref={menuToggleRef}
          type="button"
          className={`menu-toggle ${isMenuOpen ? 'is-open' : ''}`}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="menu-sidebar"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <button
        type="button"
        className={`menu-overlay ${isMenuOpen ? 'is-open' : ''}`}
        aria-label="Close menu"
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={closeMenu}
      />

      <aside
        id="menu-sidebar"
        className={`menu-sidebar ${isMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
      >
        <div className="menu-sidebar-header">
          <div>
            <span className="menu-eyebrow">Welcome to</span>
            <h2>Bulalo.in</h2>
          </div>
          <button
            type="button"
            className="menu-close"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <nav className="menu-sidebar-nav" aria-label="Main menu">
          {menuLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMenu}
            >
              <i className={link.icon} />
              <span>{link.label}</span>
              <i className="fas fa-chevron-right" />
            </Link>
          ))}
          <button type="button" className="menu-location">
            <i className="fas fa-map-marker-alt" />
            <span>
              <small>Your location</small>
              Jind
            </span>
            <i className="fas fa-chevron-right" />
          </button>
        </nav>

        <div className="menu-contact">
          <h3>Need help?</h3>
          <a href="tel:+919812866228">
            <i className="fas fa-phone-volume" />
            +91 98128 66228
          </a>
          <a href="mailto:help@bulalo.in">
            <i className="far fa-envelope" />
            help@bulalo.in
          </a>
        </div>

        <div className="menu-social">
          <span>Follow us</span>
          <a href="https://www.facebook.com/bulalo.in" target="_blank" rel="noreferrer" aria-label="Facebook">
            <i className="fab fa-facebook-f" />
          </a>
          <a href="https://www.instagram.com/bulalo.in" target="_blank" rel="noreferrer" aria-label="Instagram">
            <i className="fab fa-instagram" />
          </a>
          <a href="https://twitter.com/bulalo.in" target="_blank" rel="noreferrer" aria-label="Twitter">
            <i className="fab fa-twitter" />
          </a>
        </div>
      </aside>
    </>
  );
}
