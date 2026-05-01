import { useState, useEffect } from "react";
import logo from './assets/logo.png';

const NAV_LINKS = [
  { label: "Home",       href: "/"         },
  { label: "About",      href: "/#about"   },
  { label: "Features",   href: "/#features"},
  { label: "Working",    href: "/#working" },
  { label: "Demo",       href: "/demo"     },
  { label: "Contact Us", href: "/#contact" },
  { label: "Set Up",     href: "/setup"    },
];

const DEMO_SECTIONS = [
  {
    id: "product-demo",
    tag: "01 — OVERVIEW",
    heading: "Product Demo",
    subheading: "AiSee in Action",
    description: (
      <>
        <p>
          Watch AiSee come to life. This demo walks through the full pipeline — from the camera
          mounted on the glasses capturing the environment, to the Raspberry Pi running dual YOLO
          models, all the way to real-time spoken audio feedback through the user's earbuds.
        </p>
        <p>
          In <strong>Object Detection mode</strong>, the system continuously scans the scene and
          announces objects by direction — <em>left</em>, <em>center</em>, or <em>right</em> —
          along with estimated distances. A smart de-duplication layer ensures the same object
          is never announced repeatedly when the camera is stationary, keeping the audio stream
          clean and useful rather than overwhelming.
        </p>
        <p>
          In <strong>OCR mode</strong> (available when internet is present), a button press
          captures a still image, which is uploaded to Google Drive for OCR processing. The
          extracted text is cleaned and read aloud — ideal for reading signs, labels, or documents.
        </p>
      </>
    ),
    videoId: "1P_NZAQdVFA",
    accent: "#3B82F6",
  },
  {
    id: "blind-testing",
    tag: "02 — REAL-WORLD TEST",
    heading: "Testing with Huzaifa",
    subheading: "A Blind Student Tries AiSee",
    description: (
      <>
        <p>
          This is the moment that matters most. We handed AiSee to Huzaifa, a visually impaired
          student, and let him navigate freely with no guidance from our team.
        </p>
        <p>
          The glasses detected obstacles in his path, announced their direction in real time, and
          helped him move with confidence. When he encountered a printed notice board, he switched
          to OCR mode, captured the text with a single button press, and listened as the content
          was read back to him clearly.
        </p>
        <p>
          Watching a user who has never seen the device navigate independently using only audio
          cues is exactly the outcome we built AiSee for. Independence. Dignity. Technology that
          truly serves.
        </p>
      </>
    ),
    videoId: "6BozyT-_n6o",
    accent: "#10B981",
  },
  {
    id: "feedback",
    tag: "03 — USER FEEDBACK",
    heading: "Feedback Session",
    subheading: "What Users Said",
    description: (
      <>
        <p>
          After the live testing session at <strong>Ida Rieu School for the Blind and Deaf</strong>,
          we sat down with Huzaifa and the faculty to record their honest reactions to AiSee.
        </p>
        <p>
          The feedback highlighted what worked well — particularly the directional audio cues and
          the low latency of the object detection pipeline — and surfaced areas for improvement,
          including expanding the custom-trained YOLO model to recognize more contextually relevant
          objects specific to daily environments.
        </p>
        <p>
          This session directly shaped the next iteration of AiSee, proving that building in
          collaboration with the community it serves is not optional — it's essential.
        </p>
      </>
    ),
    videoId: "ZsxzDR2QUL0",
    accent: "#F59E0B",
  },
];

function YouTubeEmbed({ videoId, accent }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        aspectRatio: "16/9",
        boxShadow: hovered
          ? `0 0 0 2px ${accent}, 0 20px 60px rgba(0,0,0,0.7)`
          : `0 0 0 1px rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.5)`,
        transition: "box-shadow 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "#0a0a0a" }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: accent + "22", border: `1.5px solid ${accent}44` }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={accent}>
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-xs tracking-[0.2em] text-gray-500 uppercase">Loading video…</span>
          </div>
        </div>
      )}
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="AiSee demo video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease" }}
      />
    </div>
  );
}

export default function Demo() {
  const [toggled, setToggled] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('darkMode', toggled);
  }, [toggled]);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    if (menuOpen) window.addEventListener('scroll', close, { once: true });
    return () => window.removeEventListener('scroll', close);
  }, [menuOpen]);

  const dark = toggled;

  return (
    <div
      className={`font-poppins min-h-screen ${dark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >

      {/* ── HERO ── */}
      <section
        className="relative flex flex-col"
        style={{
          background: "linear-gradient(to bottom, #020505 0%, #0d0d0d 60%, #161616 100%)",
          minHeight: "44vh",
        }}
      >
        {/* Starfield */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(300)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() > 0.8 ? "2px" : "1px",
                height: Math.random() > 0.8 ? "2px" : "1px",
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
            />
          ))}
        </div>

        {/* NAV */}
        <nav className="relative z-10 flex items-center justify-between px-5 md:px-14 py-5">
          <div className="flex items-center">
            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] focus:outline-none"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-6 h-[2px] bg-white origin-center rounded-full"
                  style={{
                    transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease, transform 0.35s ease',
                    ...(i === 0 && menuOpen ? { transform: 'translateY(7px) rotate(45deg)' } : {}),
                    ...(i === 1 ? { opacity: menuOpen ? 0 : 1 } : {}),
                    ...(i === 2 && menuOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}),
                  }}
                />
              ))}
            </button>

            {/* Desktop links */}
            <ul className="hidden md:flex gap-6 lg:gap-10 text-white text-sm font-medium">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className={`cursor-pointer tracking-wide transition-colors ${
                      l.href === '/demo'
                        ? 'text-blue-400 border-b border-blue-400 pb-0.5'
                        : 'hover:text-gray-300'
                    }`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Dark/Light toggle */}
          <button
            onClick={() => setToggled((d) => !d)}
            className="relative cursor-pointer flex items-center w-14 h-7 rounded-full bg-white border border-gray-300 focus:outline-none transition-all"
            aria-label="Toggle theme"
          >
            <span className={`absolute left-1 flex items-center justify-center w-5 h-5 z-30 pointer-events-none transition-colors duration-300 ${!dark ? "text-white" : "text-gray-800"}`}>
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                <circle cx="12" cy="12" r="5" fill="currentColor" />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className={`absolute right-1 flex items-center justify-center w-5 h-5 z-30 pointer-events-none transition-colors duration-300 ${dark ? "text-white" : "text-gray-800"}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </span>
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-black shadow-md transition-all duration-300 z-20 ${dark ? "left-7" : "left-0.5"}`} />
          </button>
        </nav>

        {/* Mobile menu */}
        <div
          className="md:hidden absolute left-0 right-0 z-50 overflow-hidden"
          style={{
            top: '64px',
            maxHeight: menuOpen ? '400px' : '0px',
            opacity: menuOpen ? 1 : 0,
            transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
          }}
        >
          <div className="bg-black/95 backdrop-blur-sm border-t border-gray-800 px-6 py-5 flex flex-col gap-1">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`text-base tracking-wide py-2.5 border-b border-gray-800/60 last:border-0 transition-colors ${
                  l.href === '/demo' ? 'text-blue-400' : 'text-white hover:text-gray-300'
                }`}
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
                  transition: `opacity 0.3s ease ${i * 45}ms, transform 0.3s ease ${i * 45}ms`,
                }}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-20">
          <p className="text-xs tracking-[0.35em] text-gray-500 uppercase mb-4">AiSee Project</p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-wider text-white mb-5">
            See It in Action
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
            Three videos. One mission — restoring independence to the visually impaired through intelligent wearable technology.
          </p>

          {/* Scroll indicator */}
          <div className="mt-12 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs tracking-[0.25em] text-gray-600 uppercase">Scroll</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── VIDEO SECTIONS ── */}
      <div className={dark ? 'bg-black' : 'bg-white'}>
        {DEMO_SECTIONS.map((section, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <section
              key={section.id}
              id={section.id}
              className="py-16 md:py-24 px-5"
              style={{
                borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              }}
            >
              <div className="max-w-6xl mx-auto">

                {/* Tag */}
                <p
                  className="text-xs tracking-[0.3em] uppercase font-medium mb-3"
                  style={{ color: section.accent }}
                >
                  {section.tag}
                </p>

                {/* Heading */}
                <div className="mb-10 md:mb-14">
                  <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-wider mb-2">
                    {section.heading}
                  </h2>
                  <p className={`text-base md:text-xl ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {section.subheading}
                  </p>
                </div>

                {/* Content: alternating layout on desktop */}
                <div
                  className={`flex flex-col ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } gap-10 lg:gap-16 items-start`}
                >
                  {/* Video */}
                  <div className="w-full lg:w-3/5 shrink-0">
                    <YouTubeEmbed videoId={section.videoId} accent={section.accent} />
                  </div>

                  {/* Text */}
                  <div
                    className={`w-full lg:w-2/5 flex flex-col gap-4 text-sm md:text-base leading-relaxed ${
                      dark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                    style={{ paddingTop: '4px' }}
                  >
                    {section.description}

                    {/* Decorative accent bar */}
                    <div
                      className="mt-6 h-px w-16 rounded-full"
                      style={{ background: section.accent }}
                    />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* ── HOW IT WORKS RECAP ── */}
      <section
        className="py-16 md:py-20 px-5"
        style={{
          background: dark
            ? 'linear-gradient(to bottom, #0a0a0a, #050505)'
            : 'linear-gradient(to bottom, #f9f9f9, #ffffff)',
          borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-4">System Overview</p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-wider mb-12">
            How the Pipeline Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {[
              {
                title: "Object Detection Mode",
                color: "#3B82F6",
                points: [
                  "Starts automatically on device boot",
                  "Dual YOLO models — pretrained + custom-trained",
                  "Announces object + direction (left / center / right) + distance",
                  "Smart deduplication: no repeated announcements for stationary objects",
                  "Manual scan available via hardware button",
                ],
              },
              {
                title: "OCR Mode",
                color: "#10B981",
                points: [
                  "Requires active internet connection to activate",
                  "Mode switch blocked with audio alert if offline",
                  "Button press captures a still image",
                  "Image uploaded to Google Drive for server-side OCR",
                  "Text cleaned and read aloud through earbuds",
                ],
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl p-6 md:p-8"
                style={{
                  background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: card.color, boxShadow: `0 0 8px ${card.color}` }}
                  />
                  <h3 className="font-bold text-base md:text-lg tracking-wide">{card.title}</h3>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {card.points.map((pt) => (
                    <li
                      key={pt}
                      className={`flex items-start gap-2.5 text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      <svg
                        className="shrink-0 mt-0.5"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={card.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="bg-black text-white pb-10 pt-16 px-5">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3 w-full text-center">
            <p className="text-xs tracking-[0.3em] text-gray-400 uppercase">Contact Us</p>
            <a
              href="mailto:ai-see@gmail.com"
              className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold underline decoration-blue-500 underline-offset-8 hover:text-blue-400 transition-colors tracking-wider break-all"
            >
              ai-see@gmail.com
            </a>
          </div>
          <div className="w-full border-t border-gray-700 mt-4" />
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <a href="#" className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-600 text-xs tracking-widest uppercase hover:border-white transition-colors hover:bg-white hover:text-black">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              Instagram
            </a>
            <a href="#" className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-600 text-xs tracking-widest uppercase hover:border-white transition-colors hover:bg-white hover:text-black">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            <a href="#" className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-600 text-xs tracking-widest uppercase hover:border-white transition-colors hover:bg-white hover:text-black">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
          <p className="text-gray-600 text-xs tracking-wide mt-2 text-center">
            © {new Date().getFullYear()} AiSee — The vision of the future
          </p>
        </div>
      </footer>
    </div>
  );
}