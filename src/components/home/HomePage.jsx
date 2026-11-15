import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroLogo from './HeroLogo';
import FeaturedBuild from '../FeaturedBuild';
import { AnimatedBoltIcon, GoldCubeIcon, DeWittGLBIcon } from '../Services';
import './home.css';

// ── Content ───────────────────────────────────────────────────────────────

const PANTRY = ['React', 'Vite', 'Three.js', 'Node.js', 'Express', 'MySQL', 'Capacitor', 'Android'];

const MENU = [
  {
    icon: <AnimatedBoltIcon />,
    title: 'High-Performance Web',
    desc: 'Blazing fast websites built with React & Next.js. We prioritize SEO, speed, and conversion-focused architectures.',
  },
  {
    icon: <GoldCubeIcon />,
    title: 'Immersive 3D Experiences',
    desc: 'Captivate your audience with interactive 3D elements. From product showcases (like the logo above) to full virtual environments.',
  },
  {
    icon: <DeWittGLBIcon />,
    title: 'Strategic Branding',
    desc: 'Visual identities that stick. We forge logos, color systems, and design languages that tell your story at a glance.',
  },
];

const FROZEN = [
  'The same theme as a thousand other sites',
  'Plugins stacked on plugins',
  'Heavy pages that load slowly',
  'Boxed in by what the template allows',
];
const SCRATCH = [
  'Designed around your brand, not a theme',
  'Only the code your site actually needs',
  'Fast by design, on phones and desktops',
  'Built to grow as your business does',
];

const RECIPE = [
  { step: '01', name: 'Taste test', desc: 'We learn your business, your customers, and what your current site is not doing for you.' },
  { step: '02', name: 'Prep', desc: 'Look, layout, and brand come together on the page before any code is written.' },
  { step: '03', name: 'Cook', desc: 'Your site is hand-built, tuned for speed, and checked on real phones and desktops.' },
  { step: '04', name: 'Serve', desc: 'We launch it with you and make sure everything runs the way it should.' },
];

// ── Behavior ──────────────────────────────────────────────────────────────

// Fades sections in the first time they scroll into view.
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.home [data-reveal]'));
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Page ──────────────────────────────────────────────────────────────────

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);
  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="home">
      <a className="skip-link" href="#main">Skip to content</a>

      {/* ── Navigation ── */}
      <nav className={`home-nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Main">
        <a className="wordmark" href="#top">DeWhitt <span>Designs</span></a>
        <div className="nav-links">
          <a href="#menu">Services</a>
          <a href="#recipe">Process</a>
          <a href="#work">Work</a>
          <Link to="/fit">DeWhitt Fit</Link>
        </div>
        <div className="nav-actions">
          <Link className="btn btn-ghost" to="/login">Log In</Link>
          <Link className="btn btn-gold" to="/register">Start Project</Link>
        </div>
      </nav>

      <main id="main">
        {/* ── Hero ── */}
        <header className="hero" id="top">
          <div className="hero-glow" aria-hidden="true" />
          <HeroLogo />
          <p className="eyebrow">Custom web design &amp; development</p>
          <h1>
            Stop with the boring websites.
            <em>Built from scratch, built to last.</em>
          </h1>
          <p className="hero-sub">
            You deserve a dish made from scratch. Let your competitors enjoy the frozen meals
            everyone else is serving up. Let us cook!
          </p>
          <div className="hero-cta">
            <Link className="btn btn-gold btn-lg" to="/register">Start Your Project</Link>
            <a className="btn btn-ghost btn-lg" href="#work">See what we cooked</a>
          </div>
        </header>

        {/* ── Pantry strip ── */}
        <section className="pantry" aria-label="Technologies we build with">
          <span className="pantry-label">In the pantry</span>
          <ul>
            {PANTRY.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        {/* ── Services ── */}
        <section className="section" id="menu">
          <div className="section-head" data-reveal>
            <p className="eyebrow">The menu</p>
            <h2>Secret <em>ingredients</em></h2>
          </div>
          <div className="menu-grid">
            {MENU.map((item, i) => (
              <article className="menu-card" key={item.title} data-reveal style={{ '--delay': `${i * 90}ms` }}>
                <div className="menu-top">
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-num">0{i + 1}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Frozen vs. from scratch ── */}
        <section className="section" id="difference">
          <div className="section-head" data-reveal>
            <p className="eyebrow">The difference</p>
            <h2>Frozen meal, or <em>made from scratch?</em></h2>
          </div>
          <div className="compare">
            <article className="compare-card" data-reveal>
              <h3>The frozen meal</h3>
              <p className="compare-sub">Template and page-builder sites</p>
              <ul>
                {FROZEN.map((line) => <li key={line}><span aria-hidden="true">×</span>{line}</li>)}
              </ul>
            </article>
            <article className="compare-card is-good" data-reveal style={{ '--delay': '90ms' }}>
              <h3>Made from scratch</h3>
              <p className="compare-sub">A DeWhitt Designs build</p>
              <ul>
                {SCRATCH.map((line) => <li key={line}><span aria-hidden="true">✓</span>{line}</li>)}
              </ul>
            </article>
          </div>
        </section>

        {/* ── Process ── */}
        <section className="section" id="recipe">
          <div className="section-head" data-reveal>
            <p className="eyebrow">The recipe</p>
            <h2>How we <em>cook</em></h2>
          </div>
          <ol className="recipe">
            {RECIPE.map((item, i) => (
              <li key={item.step} data-reveal style={{ '--delay': `${i * 90}ms` }}>
                <span className="recipe-step">{item.step}</span>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Featured build (existing component) ── */}
        <FeaturedBuild />

        {/* ── Call to action ── */}
        <section className="cta" data-reveal>
          <p className="eyebrow">Ready to upgrade?</p>
          <h2>Let&rsquo;s make something <em>from scratch.</em></h2>
          <div className="hero-cta">
            <Link className="btn btn-gold btn-lg" to="/register">Start Your Project</Link>
            <Link className="btn btn-ghost btn-lg" to="/fit">Try DeWhitt Fit</Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <a className="wordmark" href="#top">DeWhitt <span>Designs</span></a>
        <nav aria-label="Footer">
          <a href="#menu">Services</a>
          <a href="#recipe">Process</a>
          <a href="#work">Work</a>
          <Link to="/fit">DeWhitt Fit</Link>
          <Link to="/login">Log In</Link>
        </nav>
        <p>&copy; {new Date().getFullYear()} DeWhitt Designs. Built from scratch.</p>
      </footer>
    </div>
  );
};

export default HomePage;
