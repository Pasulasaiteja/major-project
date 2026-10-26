/**
 * landing.js — Premium Cinematic Landing Page for Federated Sentinel
 * Dark theme, floating bank cards, glassmorphism, parallax, micro-animations
 */

window.LandingPage = {
  protected: false,
  _animFrame: null,
  _scrollHandler: null,
  _mouseHandler: null,
  _resizeHandler: null,

  render: async () => {
    const div = document.createElement('div');
    div.id = 'landing-root';
    div.innerHTML = `
      <style>
        /* ============================================================
           CINEMATIC LANDING — SCOPED STYLES
           ============================================================ */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        #landing-root {
          --accent: #8B5CF6;
          --accent-light: #A78BFA;
          --accent-glow: rgba(139, 92, 246, 0.35);
          --accent-dim: rgba(139, 92, 246, 0.12);
          --surface-dark: #050208;
          --surface-card: rgba(255,255,255,0.04);
          --border-subtle: rgba(255,255,255,0.06);
          --text-primary: #F5F3FF;
          --text-secondary: rgba(245,243,255,0.55);
          --text-muted: rgba(245,243,255,0.35);
          font-family: 'Inter', 'Space Grotesk', system-ui, sans-serif;
          background: var(--surface-dark);
          color: var(--text-primary);
          overflow-x: hidden;
          min-height: 100vh;
          position: relative;
        }

        #landing-root *, #landing-root *::before, #landing-root *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* === HERO BACKGROUND === */
        .hero-bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: url('/assets/hero-bg.jpg') center bottom / cover no-repeat;
          will-change: transform;
        }
        .hero-vignette {
          position: fixed;
          inset: 0;
          z-index: 1;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(5,2,8,0.95) 0%, transparent 70%),
            radial-gradient(ellipse 90% 50% at 50% 100%, transparent 30%, rgba(5,2,8,0.6) 100%),
            linear-gradient(to bottom, rgba(5,2,8,0.7) 0%, transparent 40%, transparent 70%, rgba(5,2,8,0.5) 100%);
          pointer-events: none;
        }

        /* === FLOATING PARTICLES === */
        .particles-container {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          overflow: hidden;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0;
          animation: particleFloat linear infinite;
        }
        @keyframes particleFloat {
          0% { opacity: 0; transform: translateY(100vh) scale(0); }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-10vh) scale(1); }
        }

        /* === NAVBAR === */
        .nav-sentinel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 0 2rem;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
        }
        .nav-sentinel.scrolled {
          background: rgba(5,2,8,0.75);
          backdrop-filter: blur(20px) saturate(1.5);
          -webkit-backdrop-filter: blur(20px) saturate(1.5);
          border-bottom: 1px solid var(--border-subtle);
          box-shadow: 0 4px 30px rgba(0,0,0,0.3);
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          cursor: pointer;
        }
        .nav-logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent), #6D28D9);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px var(--accent-glow);
          position: relative;
          overflow: hidden;
        }
        .nav-logo::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .nav-logo svg {
          width: 22px;
          height: 22px;
          fill: white;
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.4));
        }
        .nav-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.04em;
          color: var(--text-primary);
        }
        .nav-subtitle {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: 1px;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* === BUTTONS === */
        .btn-ghost {
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid var(--border-subtle);
          background: rgba(255,255,255,0.03);
          color: var(--text-secondary);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(8px);
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.07);
          color: var(--text-primary);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-1px);
        }
        .btn-primary-landing {
          padding: 12px 28px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, var(--accent), #7C3AED);
          color: white;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .btn-primary-landing::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        .btn-primary-landing:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .btn-primary-landing:hover::before {
          transform: translateX(100%);
        }

        .btn-hero-large {
          padding: 18px 40px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, var(--accent), #7C3AED, #6D28D9);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          color: white;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.2);
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .btn-hero-large:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 48px rgba(139,92,246,0.6), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .btn-outline-hero {
          padding: 18px 36px;
          border-radius: 16px;
          border: 1px solid rgba(139,92,246,0.3);
          background: rgba(139,92,246,0.06);
          color: var(--accent-light);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.4s ease;
          backdrop-filter: blur(8px);
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .btn-outline-hero:hover {
          background: rgba(139,92,246,0.12);
          border-color: rgba(139,92,246,0.5);
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(139,92,246,0.2);
        }

        /* === HERO SECTION === */
        .hero-section {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 2rem 80px;
          text-align: center;
          overflow: hidden;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 100px;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.15);
          color: var(--accent-light);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 32px;
          backdrop-filter: blur(8px);
          animation: fadeSlideUp 0.8s ease-out 0.2s both;
        }
        .hero-badge .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34D399;
          box-shadow: 0 0 8px rgba(52,211,153,0.5);
          animation: pulseBadge 2s ease-in-out infinite;
        }
        @keyframes pulseBadge {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }

        .hero-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(42px, 7vw, 88px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          max-width: 900px;
          margin-bottom: 24px;
          animation: fadeSlideUp 0.8s ease-out 0.4s both;
        }
        .hero-headline .accent-word {
          background: linear-gradient(135deg, #A78BFA, #8B5CF6, #C084FC);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }
        .hero-headline .accent-word::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent), transparent);
          border-radius: 2px;
          opacity: 0.5;
        }
        .hero-sub {
          font-size: clamp(16px, 2vw, 20px);
          line-height: 1.6;
          color: var(--text-secondary);
          max-width: 600px;
          margin-bottom: 48px;
          font-weight: 400;
          animation: fadeSlideUp 0.8s ease-out 0.6s both;
        }
        .hero-cta-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeSlideUp 0.8s ease-out 0.8s both;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* === FLOATING CARDS === */
        .cards-scene {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          perspective: 1200px;
          overflow: hidden;
        }
        .floating-card {
          position: absolute;
          width: 320px;
          height: 200px;
          border-radius: 16px;
          background: linear-gradient(145deg, rgba(139,92,246,0.15), rgba(109,40,217,0.08));
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          box-shadow:
            0 8px 32px rgba(0,0,0,0.3),
            0 0 60px rgba(139,92,246,0.06),
            inset 0 1px 0 rgba(255,255,255,0.05);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          will-change: transform;
          transform-style: preserve-3d;
        }
        .floating-card::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        }
        .card-chip {
          width: 40px;
          height: 28px;
          border-radius: 6px;
          background: linear-gradient(135deg, #D4AF37, #F5D464, #D4AF37);
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
          position: relative;
        }
        .card-chip::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 4px;
          right: 4px;
          height: 1px;
          background: rgba(0,0,0,0.15);
        }
        .card-number {
          font-family: 'Space Grotesk', monospace;
          font-size: 15px;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.6);
          font-weight: 500;
        }
        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .card-holder {
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
        }
        .card-holder-name {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.05em;
          margin-top: 2px;
          font-weight: 600;
        }
        .card-network {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 700;
          font-style: italic;
          color: rgba(255,255,255,0.4);
        }

        /* === TRUST STRIP === */
        .trust-strip {
          position: relative;
          z-index: 10;
          padding: 48px 2rem;
          display: flex;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(5,2,8,0.6);
          backdrop-filter: blur(20px);
        }
        .trust-item {
          text-align: center;
          animation: fadeSlideUp 0.6s ease-out both;
        }
        .trust-value {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--text-primary), var(--accent-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .trust-label {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 4px;
          font-weight: 500;
        }

        /* === FEATURES SECTION === */
        .features-section {
          position: relative;
          z-index: 10;
          padding: 120px 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .section-label {
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent-light);
          font-weight: 600;
          margin-bottom: 16px;
        }
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin-bottom: 16px;
          line-height: 1.15;
        }
        .section-desc {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 600px;
          line-height: 1.6;
          margin-bottom: 64px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }
        .feature-card {
          background: var(--surface-card);
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          padding: 36px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(139,92,246,0.2);
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.3), 0 0 40px rgba(139,92,246,0.05);
        }
        .feature-card:hover::before {
          opacity: 1;
        }
        .feature-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 24px;
          position: relative;
        }
        .feature-icon.violet {
          background: rgba(139,92,246,0.1);
          color: var(--accent-light);
          box-shadow: 0 0 24px rgba(139,92,246,0.08);
        }
        .feature-icon.emerald {
          background: rgba(16,185,129,0.1);
          color: #34D399;
          box-shadow: 0 0 24px rgba(16,185,129,0.08);
        }
        .feature-icon.amber {
          background: rgba(251,191,36,0.1);
          color: #FBBF24;
          box-shadow: 0 0 24px rgba(251,191,36,0.08);
        }
        .feature-icon.rose {
          background: rgba(244,63,94,0.1);
          color: #FB7185;
          box-shadow: 0 0 24px rgba(244,63,94,0.08);
        }
        .feature-icon.cyan {
          background: rgba(6,182,212,0.1);
          color: #22D3EE;
          box-shadow: 0 0 24px rgba(6,182,212,0.08);
        }
        .feature-icon.indigo {
          background: rgba(99,102,241,0.1);
          color: #818CF8;
          box-shadow: 0 0 24px rgba(99,102,241,0.08);
        }
        .feature-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
        }
        .feature-desc {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* === ARCHITECTURE SECTION === */
        .arch-section {
          position: relative;
          z-index: 10;
          padding: 120px 2rem;
          text-align: center;
          overflow: hidden;
        }
        .arch-visual {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .arch-row {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .arch-node {
          padding: 16px 28px;
          border-radius: 14px;
          background: var(--surface-card);
          border: 1px solid var(--border-subtle);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
          position: relative;
        }
        .arch-node:hover {
          border-color: rgba(139,92,246,0.3);
          background: rgba(139,92,246,0.06);
          transform: translateY(-2px);
        }
        .arch-node .node-icon {
          font-size: 20px;
        }
        .arch-connector {
          width: 2px;
          height: 32px;
          background: linear-gradient(to bottom, var(--accent-dim), transparent);
          margin: 0 auto;
        }
        .arch-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 12px;
          font-weight: 600;
        }

        /* === CTA SECTION === */
        .cta-section {
          position: relative;
          z-index: 10;
          padding: 120px 2rem;
          text-align: center;
        }
        .cta-card {
          max-width: 700px;
          margin: 0 auto;
          padding: 64px 48px;
          border-radius: 28px;
          background: linear-gradient(145deg, rgba(139,92,246,0.08), rgba(109,40,217,0.04));
          border: 1px solid rgba(139,92,246,0.12);
          position: relative;
          overflow: hidden;
        }
        .cta-card::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent);
        }
        .cta-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(139,92,246,0.08), transparent 60%);
          pointer-events: none;
        }

        /* === FOOTER === */
        .footer-sentinel {
          position: relative;
          z-index: 10;
          padding: 48px 2rem;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-copy {
          font-size: 13px;
          color: var(--text-muted);
        }
        .footer-links {
          display: flex;
          gap: 24px;
        }
        .footer-link {
          font-size: 13px;
          color: var(--text-secondary);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: var(--accent-light);
        }

        /* === SCROLL REVEAL === */
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
          .nav-sentinel { padding: 0 1rem; height: 64px; }
          .nav-subtitle { display: none; }
          .hero-section { padding: 100px 1rem 60px; }
          .hero-cta-group { flex-direction: column; align-items: center; }
          .btn-hero-large, .btn-outline-hero { width: 100%; max-width: 300px; justify-content: center; }
          .trust-strip { gap: 24px; padding: 32px 1rem; }
          .trust-value { font-size: 28px; }
          .features-section, .arch-section, .cta-section { padding: 80px 1rem; }
          .floating-card { width: 240px; height: 150px; padding: 16px; }
          .card-number { font-size: 12px; }
          .cta-card { padding: 40px 24px; }
          .footer-sentinel { flex-direction: column; text-align: center; }
        }
      </style>

      <!-- BACKGROUND LAYERS -->
      <div class="hero-bg-layer" id="heroBg"></div>
      <div class="hero-vignette"></div>

      <!-- PARTICLES -->
      <div class="particles-container" id="particles"></div>

      <!-- NAVIGATION -->
      <nav class="nav-sentinel" id="navBar">
        <div class="nav-brand" onclick="Router.navigate('/landing')">
          <div class="nav-logo">
            <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.13 9.37-7 10.5-3.87-1.13-7-5.67-7-10.5V6.3l7-3.12zM11 7v2h2V7h-2zm0 4v6h2v-6h-2z"/></svg>
          </div>
          <div>
            <div class="nav-title">FEDERATED SENTINEL</div>
            <div class="nav-subtitle">Privacy-First AI Security</div>
          </div>
        </div>
        <div class="nav-actions">
          <button class="btn-ghost" onclick="Router.navigate('/manager-login')">
            <span class="material-symbols-outlined" style="font-size:18px">admin_panel_settings</span>
            Manager Login
          </button>
          <button class="btn-primary-landing" onclick="Router.navigate('/login')">
            Client Login
          </button>
        </div>
      </nav>

      <!-- HERO -->
      <section class="hero-section" id="heroSection">
        <!-- FLOATING CARDS -->
        <div class="cards-scene" id="cardsScene"></div>

        <div class="hero-badge">
          <span class="dot"></span>
          Privacy-First AI Fraud Detection
        </div>

        <h1 class="hero-headline">
          Collaborative Fraud Defense.<br/>
          <span class="accent-word">Absolute Privacy.</span>
        </h1>

        <p class="hero-sub">
          Edge AI and Federated Learning stop fraud in real-time across institutions — your raw financial data never leaves your bank's walls.
        </p>

        <div class="hero-cta-group">
          <button class="btn-hero-large" onclick="Router.navigate('/login')">
            Access Client Portal
            <span class="material-symbols-outlined" style="font-size:20px">arrow_forward</span>
          </button>
          <button class="btn-outline-hero" onclick="Router.navigate('/manager-login')">
            <span class="material-symbols-outlined" style="font-size:20px">shield</span>
            Manager Portal
          </button>
        </div>
      </section>

      <!-- TRUST NUMBERS -->
      <div class="trust-strip reveal" id="trustStrip">
        <div class="trust-item">
          <div class="trust-value" data-count="84.5">0</div>
          <div class="trust-label">FedAvg Accuracy %</div>
        </div>
        <div class="trust-item">
          <div class="trust-value" data-count="92.7">0</div>
          <div class="trust-label">AUC-ROC Score %</div>
        </div>
        <div class="trust-item">
          <div class="trust-value" data-count="0">Zero</div>
          <div class="trust-label">Raw Data Shared</div>
        </div>
        <div class="trust-item">
          <div class="trust-value" data-count="3">0</div>
          <div class="trust-label">Federated Banks</div>
        </div>
      </div>

      <!-- FEATURES -->
      <section class="features-section reveal" id="featuresSection">
        <div class="section-label">Core Capabilities</div>
        <h2 class="section-title">Built for the Future<br/>of Secure Banking</h2>
        <p class="section-desc">
          Six interconnected modules power a fraud detection system that's accurate, explainable, and completely private.
        </p>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon violet">
              <span class="material-symbols-outlined">model_training</span>
            </div>
            <div class="feature-title">Federated Learning</div>
            <div class="feature-desc">Models train locally on each bank's edge. Only encrypted gradient updates are aggregated centrally — raw data never moves.</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon emerald">
              <span class="material-symbols-outlined">lock</span>
            </div>
            <div class="feature-title">Differential Privacy</div>
            <div class="feature-desc">Opacus DP-SGD adds calibrated noise to gradients, providing mathematically proven privacy guarantees (ε ≤ 8.0).</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon amber">
              <span class="material-symbols-outlined">psychology</span>
            </div>
            <div class="feature-title">SHAP Explainability</div>
            <div class="feature-desc">Every fraud flag comes with plain-English reasoning. SHAP values decompose model decisions into understandable feature contributions.</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon rose">
              <span class="material-symbols-outlined">hub</span>
            </div>
            <div class="feature-title">Graph Neural Networks</div>
            <div class="feature-desc">FraudGNN uses GraphSAGE convolutions over transaction graphs to capture relational fraud patterns invisible to tabular models.</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon cyan">
              <span class="material-symbols-outlined">bolt</span>
            </div>
            <div class="feature-title">Edge Inference</div>
            <div class="feature-desc">Sub-50ms local inference at each bank node. No round-trip to a central server — instant fraud decisions at the point of transaction.</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon indigo">
              <span class="material-symbols-outlined">verified_user</span>
            </div>
            <div class="feature-title">Instant Resolution</div>
            <div class="feature-desc">Clients review protective holds and resolve disputes directly from their dashboard — no phone calls, no branch visits.</div>
          </div>
        </div>
      </section>

      <!-- ARCHITECTURE -->
      <section class="arch-section reveal" id="archSection">
        <div class="section-label">System Architecture</div>
        <h2 class="section-title" style="margin-bottom: 64px;">Decentralized by Design</h2>

        <div class="arch-visual">
          <div class="arch-label">Edge Nodes (Bank Premises)</div>
          <div class="arch-row">
            <div class="arch-node"><span class="node-icon">🏦</span> Nagaland Regional Bank</div>
            <div class="arch-node"><span class="node-icon">🏦</span> Arunachal Cooperative</div>
            <div class="arch-node"><span class="node-icon">🏦</span> Sikkim State Bank</div>
          </div>
          <div class="arch-connector"></div>
          <div class="arch-label">Encrypted Gradient Updates Only ↕</div>
          <div class="arch-connector"></div>
          <div class="arch-row">
            <div class="arch-node" style="border-color: rgba(139,92,246,0.25); background: rgba(139,92,246,0.06);">
              <span class="node-icon">🧠</span> Central Aggregator (FedAvg + DP-SGD)
            </div>
          </div>
          <div class="arch-connector"></div>
          <div class="arch-label">Updated Global Weights ↓</div>
          <div class="arch-connector"></div>
          <div class="arch-row">
            <div class="arch-node"><span class="node-icon">⚡</span> Edge Inference</div>
            <div class="arch-node"><span class="node-icon">💡</span> SHAP Explainability</div>
            <div class="arch-node"><span class="node-icon">🖥️</span> Banking Portal</div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section reveal" id="ctaSection">
        <div class="cta-card">
          <div class="section-label" style="position:relative;z-index:2">Get Started</div>
          <h2 class="section-title" style="position:relative;z-index:2;margin-bottom:16px">
            Experience Privacy-Preserving<br/>Fraud Detection
          </h2>
          <p class="section-desc" style="margin: 0 auto 40px; position:relative;z-index:2">
            Login as a client to view your transactions and fraud alerts, or access the manager portal for system oversight.
          </p>
          <div class="hero-cta-group" style="position:relative;z-index:2">
            <button class="btn-hero-large" onclick="Router.navigate('/login')">
              Client Portal
              <span class="material-symbols-outlined" style="font-size:20px">arrow_forward</span>
            </button>
            <button class="btn-outline-hero" onclick="Router.navigate('/manager-login')">
              <span class="material-symbols-outlined" style="font-size:20px">admin_panel_settings</span>
              Manager Access
            </button>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="footer-sentinel">
        <div class="footer-copy">© 2026 Federated Sentinel — B.Tech Major Project</div>
        <div class="footer-links">
          <span class="footer-link" onclick="Router.navigate('/login')">Client Login</span>
          <span class="footer-link" onclick="Router.navigate('/manager-login')">Manager Login</span>
        </div>
      </footer>
    `;
    return div;
  },

  afterRender: async () => {
    // ========== FLOATING BANK CARDS ==========
    const scene = document.getElementById('cardsScene');
    if (scene) {
      const cardData = [
        { num: '4532 •••• •••• 8721', holder: 'ARJUN SHARMA', network: 'VISA', x: -42, y: 15, z: 0, rotX: -12, rotY: 18, delay: 0 },
        { num: '5412 •••• •••• 3349', holder: 'PRIYA MEHRA', network: 'MC', x: 38, y: 25, z: -80, rotX: 8, rotY: -15, delay: 0.3 },
        { num: '3782 •••• •••• 6205', holder: 'RAJESH KUMAR', network: 'AMEX', x: -25, y: 60, z: -160, rotX: -6, rotY: 10, delay: 0.6 },
        { num: '6011 •••• •••• 4492', holder: 'SNEHA PATEL', network: 'DISC', x: 48, y: 55, z: -120, rotX: 14, rotY: -22, delay: 0.9 },
        { num: '4916 •••• •••• 1158', holder: 'VIKRAM IYER', network: 'VISA', x: -55, y: 42, z: -200, rotX: -18, rotY: 25, delay: 1.2 },
      ];

      cardData.forEach((c, i) => {
        const card = document.createElement('div');
        card.className = 'floating-card';
        card.id = `fcard-${i}`;
        card.style.cssText = `
          left: calc(50% + ${c.x}%);
          top: ${c.y}%;
          opacity: 0;
          transform: translate(-50%, -50%) perspective(1200px) 
                     rotateX(${c.rotX}deg) rotateY(${c.rotY}deg) 
                     translateZ(${c.z}px);
          animation: cardReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${c.delay}s forwards;
        `;
        card.innerHTML = `
          <div class="card-chip"></div>
          <div class="card-number">${c.num}</div>
          <div class="card-bottom">
            <div>
              <div class="card-holder">CARDHOLDER</div>
              <div class="card-holder-name">${c.holder}</div>
            </div>
            <div class="card-network">${c.network}</div>
          </div>
        `;
        scene.appendChild(card);
      });

      // Card reveal animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) perspective(1200px) 
                       rotateX(30deg) rotateY(-40deg) translateZ(-400px) scale(0.6);
          }
          to {
            opacity: 0.6;
            transform: translate(-50%, -50%) perspective(1200px) 
                       rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(var(--tz, 0px));
          }
        }
      `;
      document.head.appendChild(style);

      // Animate cards with gentle float
      let tick = 0;
      const animateCards = () => {
        tick += 0.005;
        cardData.forEach((c, i) => {
          const el = document.getElementById(`fcard-${i}`);
          if (!el) return;
          const floatY = Math.sin(tick + i * 1.2) * 12;
          const floatX = Math.cos(tick * 0.7 + i * 0.8) * 6;
          const tiltX = c.rotX + Math.sin(tick * 0.5 + i) * 3;
          const tiltY = c.rotY + Math.cos(tick * 0.4 + i) * 4;
          el.style.transform = `translate(calc(-50% + ${floatX}px), calc(-50% + ${floatY}px)) 
                                perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) 
                                translateZ(${c.z}px)`;
          el.style.opacity = '0.55';
        });
        window.LandingPage._animFrame = requestAnimationFrame(animateCards);
      };
      setTimeout(() => {
        window.LandingPage._animFrame = requestAnimationFrame(animateCards);
      }, 1500);
    }

    // ========== PARTICLES ==========
    const particlesEl = document.getElementById('particles');
    if (particlesEl) {
      for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 3 + 1;
        p.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${Math.random() * 100}%;
          animation-duration: ${Math.random() * 15 + 10}s;
          animation-delay: ${Math.random() * 10}s;
          filter: blur(${Math.random() > 0.7 ? 1 : 0}px);
        `;
        particlesEl.appendChild(p);
      }
    }

    // ========== SCROLL EFFECTS ==========
    const nav = document.getElementById('navBar');
    const reveals = document.querySelectorAll('.reveal');

    window.LandingPage._scrollHandler = () => {
      const sy = window.scrollY;

      // Navbar glass effect
      if (nav) {
        nav.classList.toggle('scrolled', sy > 60);
      }

      // Parallax background
      const bg = document.getElementById('heroBg');
      if (bg) {
        bg.style.transform = `translateY(${sy * 0.3}px) scale(1.05)`;
      }

      // Reveal on scroll
      reveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          el.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', window.LandingPage._scrollHandler, { passive: true });
    // Trigger once
    window.LandingPage._scrollHandler();

    // ========== COUNT-UP FOR TRUST NUMBERS ==========
    const countUpObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.trust-value[data-count]');
          items.forEach(el => {
            const target = parseFloat(el.dataset.count);
            if (target === 0) return; // "Zero" stays as-is
            const isDecimal = String(target).includes('.');
            const duration = 2000;
            const startTime = performance.now();
            const animate = (now) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = eased * target;
              if (isDecimal) {
                el.textContent = current.toFixed(1) + '%';
              } else {
                el.textContent = Math.round(current);
              }
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          });
          countUpObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    const trustStrip = document.getElementById('trustStrip');
    if (trustStrip) countUpObserver.observe(trustStrip);
  }
};
