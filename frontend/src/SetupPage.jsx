// // frontend/src/SetupPage.jsx
// import { useState, useEffect, useRef } from "react";
// import { api } from "./api";

// export default function SetupPage({ toggled }) {
//   const [step, setStep]         = useState("loading");
//   const [pendingJwt, setPending] = useState(null);
//   const [userEmail, setEmail]   = useState("");
//   const [code, setCode]         = useState("");
//   const [submitting, setSub]    = useState(false);
//   const [error, setError]       = useState(null);
//   const [deviceCode, setDev]    = useState(null);
//   const [sessionToken, setSess] = useState(() => localStorage.getItem("session_token"));

//   const bg   = toggled ? "bg-black text-white"         : "bg-white text-gray-900";
//   const card = toggled ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200";
//   const inp  = toggled
//     ? "bg-black border-gray-600 text-white placeholder-gray-600 focus:border-blue-400"
//     : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500";

//   useEffect(() => {
//     // Check if Google redirected back with a pending JWT in URL
//     const params  = new URLSearchParams(window.location.search);
//     const pending = params.get("pending");

//     if (pending) {
//       // Came back from Google login — decode email from JWT payload
//       try {
//         const payload = JSON.parse(atob(pending.split(".")[1]));
//         setEmail(payload.email || "");
//         setPending(pending);
//         setStep("entercode");
//         // Clean URL
//         window.history.replaceState({}, "", "/setup");
//       } catch {
//         setStep("login");
//       }
//       return;
//     }

//     // Check if already set up (session token in localStorage)
//     const saved = localStorage.getItem("session_token");
//     if (saved) {
//       setSess(saved);
//       setStep("done");
//       const dc = localStorage.getItem("device_code");
//       setDev(dc);
//     } else {
//       setStep("login");
//     }
//   }, []);

//   const handleGoogleLogin = async () => {
//     const { url } = await api.getAuthUrl();
//     window.location.href = url;   // Redirect to Google
//   };

//   const handleSetup = async () => {
//     const trimmed = code.trim().toUpperCase();
//     if (!trimmed) { setError("Please enter your device code"); return; }
//     if (!pendingJwt) { setError("Session lost — please sign in again"); return; }

//     setSub(true); setError(null);
//     try {
//       const data = await api.setup(trimmed, pendingJwt);
//       // Save session token in localStorage (avoids cookie issues on localhost)
//       localStorage.setItem("session_token", data.session_token);
//       localStorage.setItem("device_code",   data.device_code);
//       setSess(data.session_token);
//       setDev(data.device_code);
//       setStep("done");
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setSub(false);
//     }
//   };

//   const handleRevoke = async () => {
//     if (!confirm("This will disconnect your glasses. They will stop working until set up again.")) return;
//     await api.revoke(sessionToken);
//     localStorage.removeItem("session_token");
//     localStorage.removeItem("device_code");
//     setSess(null);
//     setStep("login");
//   };

//   // ── Render ────────────────────────────────────────────────────────────────

//   if (step === "loading") return (
//     <div className={`min-h-screen flex items-center justify-center ${bg}`}>
//       <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
//     </div>
//   );

//   return (
//     <div className={`min-h-screen ${bg} flex items-center justify-center px-6`}>
//       <div className="w-full max-w-md">

//         <h1 className="text-4xl font-bold tracking-wider mb-2 text-center">AiSee Setup</h1>
//         <p className={`text-sm text-center mb-10 ${toggled ? "text-gray-400" : "text-gray-500"}`}>
//           Connect your glasses to your Google account
//         </p>

//         {/* Step 1: Login */}
//         {step === "login" && (
//           <div className={`border rounded-2xl p-8 text-center ${card}`}>
//             <div className="text-5xl mb-5">👓</div>
//             <h2 className="text-xl font-bold mb-2">Sign in with Google</h2>
//             <p className={`text-sm mb-7 leading-relaxed ${toggled ? "text-gray-400" : "text-gray-500"}`}>
//               We'll connect your Google Drive to your AiSee glasses.
//               We only access files our app creates — nothing else.
//             </p>
//             <button
//               onClick={handleGoogleLogin}
//               className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
//             >
//               <svg width="18" height="18" viewBox="0 0 24 24">
//                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
//                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
//                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
//                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
//               </svg>
//               Continue with Google
//             </button>
//           </div>
//         )}

//         {/* Step 2: Enter Code */}
//         {step === "entercode" && (
//           <div className={`border rounded-2xl p-8 ${card}`}>
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">✓</div>
//               <div>
//                 <p className="text-sm font-semibold">Signed in with Google</p>
//                 <p className={`text-xs ${toggled ? "text-gray-400" : "text-gray-500"}`}>{userEmail}</p>
//               </div>
//             </div>

//             <h2 className="font-bold text-lg mb-1">Enter Device Code</h2>
//             <p className={`text-sm mb-5 leading-relaxed ${toggled ? "text-gray-400" : "text-gray-500"}`}>
//               Find the code printed on the card inside your AiSee box.
//             </p>

//             <input
//               type="text"
//               placeholder="e.g. AIS-4829"
//               value={code}
//               onChange={e => { setCode(e.target.value.toUpperCase()); setError(null); }}
//               onKeyDown={e => e.key === "Enter" && handleSetup()}
//               className={`w-full px-4 py-3 rounded-xl border text-center text-xl font-bold tracking-widest outline-none transition mb-4 ${inp}`}
//               maxLength={8}
//               autoFocus
//             />

//             {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

//             <button
//               onClick={handleSetup}
//               disabled={submitting || !code.trim()}
//               className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
//             >
//               {submitting ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Linking...
//                 </span>
//               ) : "Link My Glasses"}
//             </button>
//           </div>
//         )}

//         {/* Done */}
//         {step === "done" && (
//           <div className={`border rounded-2xl p-8 text-center ${card}`}>
//             <div className="text-5xl mb-4">✅</div>
//             <h2 className="text-xl font-bold mb-2">You're All Set!</h2>
//             <p className={`text-sm mb-2 ${toggled ? "text-gray-400" : "text-gray-500"}`}>
//               Your AiSee glasses are connected to your Google account.
//             </p>
//             {deviceCode && (
//               <p className={`text-xs font-mono mb-6 ${toggled ? "text-gray-600" : "text-gray-400"}`}>
//                 Device: {deviceCode}
//               </p>
//             )}
//             <button
//               onClick={handleRevoke}
//               className="text-xs text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-400 px-4 py-2 rounded-lg transition-colors"
//             >
//               Disconnect Glasses
//             </button>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }


// frontend/src/SetupPage.jsx
// import { useState, useEffect, useRef } from "react";
// import { api } from "./api";

// export default function SetupPage({ toggled }) {
//   const [step, setStep]         = useState("loading");
//   const [pendingJwt, setPending] = useState(null);
//   const [userEmail, setEmail]   = useState("");
//   const [code, setCode]         = useState("");
//   const [submitting, setSub]    = useState(false);
//   const [error, setError]       = useState(null);
//   const [deviceCode, setDev]    = useState(null);
//   const [sessionToken, setSess] = useState(() => localStorage.getItem("session_token"));

//   const bg   = toggled ? "bg-black text-white"         : "bg-white text-gray-900";
//   const card = toggled ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200";
//   const inp  = toggled
//     ? "bg-black border-gray-600 text-white placeholder-gray-600 focus:border-blue-400"
//     : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500";

//   useEffect(() => {
//     // Check if Google redirected back with a pending JWT in URL
//     const params  = new URLSearchParams(window.location.search);
//     const pending = params.get("pending");

//     if (pending) {
//       // Came back from Google login — decode email from JWT payload
//       try {
//         const payload = JSON.parse(atob(pending.split(".")[1]));
//         setEmail(payload.email || "");
//         setPending(pending);
//         setStep("entercode");
//         // Clean URL
//         window.history.replaceState({}, "", "/setup");
//       } catch {
//         setStep("login");
//       }
//       return;
//     }

//     // Check if already set up (session token in localStorage)
//     const saved = localStorage.getItem("session_token");
//     if (saved) {
//       setSess(saved);
//       setStep("done");
//       const dc = localStorage.getItem("device_code");
//       setDev(dc);
//     } else {
//       setStep("login");
//     }
//   }, []);

//   const handleGoogleLogin = async () => {
//     const { url } = await api.getAuthUrl();
//     window.location.href = url;   // Redirect to Google
//   };

//   const handleSetup = async () => {
//     const trimmed = code.trim().toUpperCase();
//     if (!trimmed) { setError("Please enter your device code"); return; }
//     if (!pendingJwt) { setError("Session lost — please sign in again"); return; }

//     setSub(true); setError(null);
//     try {
//       const data = await api.setup(trimmed, pendingJwt);
//       // Save session token in localStorage (avoids cookie issues on localhost)
//       localStorage.setItem("session_token", data.session_token);
//       localStorage.setItem("device_code",   data.device_code);
//       setSess(data.session_token);
//       setDev(data.device_code);
//       setStep("done");
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setSub(false);
//     }
//   };

//   const handleRevoke = async () => {
//     if (!confirm("This will disconnect your glasses. They will stop working until set up again.")) return;
//     await api.revoke(sessionToken);
//     localStorage.removeItem("session_token");
//     localStorage.removeItem("device_code");
//     setSess(null);
//     setStep("login");
//   };

//   // ── Render ────────────────────────────────────────────────────────────────

//   if (step === "loading") return (
//     <div className={`min-h-screen flex items-center justify-center ${bg}`}>
//       <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
//     </div>
//   );

//   return (
//     <div className={`min-h-screen ${bg} flex items-center justify-center px-6`}>
//       <div className="w-full max-w-md">

//         <h1 className="text-4xl font-bold tracking-wider mb-2 text-center">AiSee Setup</h1>
//         <p className={`text-sm text-center mb-10 ${toggled ? "text-gray-400" : "text-gray-500"}`}>
//           Connect your glasses to your Google account
//         </p>

//         {/* Step 1: Login */}
//         {step === "login" && (
//           <div className={`border rounded-2xl p-8 text-center ${card}`}>
//             <div className="text-5xl mb-5">👓</div>
//             <h2 className="text-xl font-bold mb-2">Sign in with Google</h2>
//             <p className={`text-sm mb-7 leading-relaxed ${toggled ? "text-gray-400" : "text-gray-500"}`}>
//               We'll connect your Google Drive to your AiSee glasses.
//               We only access files our app creates — nothing else.
//             </p>
//             <button
//               onClick={handleGoogleLogin}
//               className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
//             >
//               <svg width="18" height="18" viewBox="0 0 24 24">
//                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
//                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
//                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
//                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
//               </svg>
//               Continue with Google
//             </button>
//           </div>
//         )}

//         {/* Step 2: Enter Code */}
//         {step === "entercode" && (
//           <div className={`border rounded-2xl p-8 ${card}`}>
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">✓</div>
//               <div>
//                 <p className="text-sm font-semibold">Signed in with Google</p>
//                 <p className={`text-xs ${toggled ? "text-gray-400" : "text-gray-500"}`}>{userEmail}</p>
//               </div>
//             </div>

//             <h2 className="font-bold text-lg mb-1">Enter Device Code</h2>
//             <p className={`text-sm mb-5 leading-relaxed ${toggled ? "text-gray-400" : "text-gray-500"}`}>
//               Find the code printed on the card inside your AiSee box.
//             </p>

//             <input
//               type="text"
//               placeholder="e.g. AIS-4829"
//               value={code}
//               onChange={e => { setCode(e.target.value.toUpperCase()); setError(null); }}
//               onKeyDown={e => e.key === "Enter" && handleSetup()}
//               className={`w-full px-4 py-3 rounded-xl border text-center text-xl font-bold tracking-widest outline-none transition mb-4 ${inp}`}
//               maxLength={8}
//               autoFocus
//             />

//             {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

//             <button
//               onClick={handleSetup}
//               disabled={submitting || !code.trim()}
//               className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
//             >
//               {submitting ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Linking...
//                 </span>
//               ) : "Link My Glasses"}
//             </button>
//           </div>
//         )}

//         {/* Done */}
//         {step === "done" && (
//           <div className={`border rounded-2xl p-8 text-center ${card}`}>
//             <div className="text-5xl mb-4">✅</div>
//             <h2 className="text-xl font-bold mb-2">You're All Set!</h2>
//             <p className={`text-sm mb-2 ${toggled ? "text-gray-400" : "text-gray-500"}`}>
//               Your AiSee glasses are connected to your Google account.
//             </p>
//             {deviceCode && (
//               <p className={`text-xs font-mono mb-6 ${toggled ? "text-gray-600" : "text-gray-400"}`}>
//                 Device: {deviceCode}
//               </p>
//             )}
//             <button
//               onClick={handleRevoke}
//               className="text-xs text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-400 px-4 py-2 rounded-lg transition-colors"
//             >
//               Disconnect Glasses
//             </button>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }



// frontend/src/SetupPage.jsx
import { useState, useEffect } from "react";
import { api } from "./api";

export default function SetupPage({ toggled }) {
  const [step, setStep]         = useState("loading");
  const [pendingJwt, setPending] = useState(null);
  const [userEmail, setEmail]   = useState("");
  const [code, setCode]         = useState("");
  const [submitting, setSub]    = useState(false);
  const [error, setError]       = useState(null);
  const [deviceCode, setDev]    = useState(null);
  const [sessionToken, setSess] = useState(() => localStorage.getItem("session_token"));

  useEffect(() => {
    const params  = new URLSearchParams(window.location.search);
    const pending = params.get("pending");

    if (pending) {
      try {
        const payload = JSON.parse(atob(pending.split(".")[1]));
        setEmail(payload.email || "");
        setPending(pending);
        setStep("entercode");
        window.history.replaceState({}, "", "/setup");
      } catch {
        setStep("login");
      }
      return;
    }

    const saved = localStorage.getItem("session_token");
    if (saved) {
      setSess(saved);
      setStep("done");
      const dc = localStorage.getItem("device_code");
      setDev(dc);
    } else {
      setStep("login");
    }
  }, []);

  const handleGoogleLogin = async () => {
    const { url } = await api.getAuthUrl();
    window.location.href = url;
  };

  const handleSetup = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError("Please enter your device code"); return; }
    if (!pendingJwt) { setError("Session lost — please sign in again"); return; }

    setSub(true); setError(null);
    try {
      const data = await api.setup(trimmed, pendingJwt);
      localStorage.setItem("session_token", data.session_token);
      localStorage.setItem("device_code",   data.device_code);
      setSess(data.session_token);
      setDev(data.device_code);
      setStep("done");
    } catch (e) {
      setError(e.message);
    } finally {
      setSub(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm("This will disconnect your glasses. They will stop working until set up again.")) return;
    await api.revoke(sessionToken);
    localStorage.removeItem("session_token");
    localStorage.removeItem("device_code");
    setSess(null);
    setStep("login");
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (step === "loading") return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(to bottom, #020505 0%, #0d0d0d 50%, #161616 100%)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-white border-t-transparent animate-spin" />
        <p className="text-gray-500 text-xs tracking-widest uppercase">Initializing</p>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(to bottom, #020505 0%, #0d0d0d 50%, #161616 100%)" }}
    >
      {/* Starfield */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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

      {/* Back nav */}
      <nav className="relative z-10 px-6 md:px-14 py-5">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm tracking-widest uppercase transition-colors group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </a>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">

        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-3 tracking-wider"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            AiSee
          </h1>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-12 bg-gray-700" />
            <p className="text-gray-400 text-xs tracking-[0.4em] uppercase">Setup</p>
            <div className="h-px w-12 bg-gray-700" />
          </div>
          <p className="text-gray-600 text-sm tracking-wide">Connect your glasses to your account</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-10">
          {["login", "entercode", "done"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                step === s
                  ? "bg-white scale-125"
                  : (["login","entercode","done"].indexOf(step) > i)
                    ? "bg-gray-500"
                    : "bg-gray-800"
              }`} />
              {i < 2 && <div className={`w-8 h-px transition-all duration-500 ${
                ["login","entercode","done"].indexOf(step) > i ? "bg-gray-500" : "bg-gray-800"
              }`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="w-full max-w-md">

          {/* ── Step 1: Login ── */}
          {step === "login" && (
            <div
              className="rounded-2xl p-8 border border-gray-800"
              style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
            >
              {/* Glasses icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  <svg width="40" height="22" viewBox="0 0 57 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="8" width="20" height="14" rx="7" stroke="white" strokeWidth="2" fill="none"/>
                    <rect x="36" y="8" width="20" height="14" rx="7" stroke="white" strokeWidth="2" fill="none"/>
                    <path d="M21 15 L36 15" stroke="white" strokeWidth="2"/>
                    <path d="M1 15 L0 8" stroke="white" strokeWidth="2"/>
                    <path d="M56 15 L57 8" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white text-center mb-2 tracking-wide">Sign In</h2>
              <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed">
                We'll connect your Google Drive to your AiSee glasses. We only access files our app creates — nothing else.
              </p>

              <button
                onClick={handleGoogleLogin}
                className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-wider transition-all duration-200 flex items-center justify-center gap-3 group"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <p className="text-gray-700 text-xs text-center mt-5 tracking-wide">
                Your privacy is protected. No data is sold or shared.
              </p>
            </div>
          )}

          {/* ── Step 2: Enter Code ── */}
          {step === "entercode" && (
            <div
              className="rounded-2xl p-8 border border-gray-800"
              style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
            >
              {/* Verified badge */}
              <div className="flex items-center gap-3 mb-8 p-3 rounded-xl border border-gray-800"
                style={{ background: "rgba(34,197,94,0.05)" }}>
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Google account verified</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1 tracking-wide">Device Code</h2>
              <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                Find the code printed on the card inside your AiSee box.
              </p>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="AIS-0000"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setError(null); }}
                  onKeyDown={e => e.key === "Enter" && handleSetup()}
                  className="w-full px-4 py-4 rounded-xl text-center text-2xl font-bold tracking-[0.5em] outline-none transition-all duration-200 placeholder-gray-700"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: error ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    fontFamily: "'Courier New', monospace",
                  }}
                  maxLength={8}
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg border border-red-500/20"
                  style={{ background: "rgba(239,68,68,0.05)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <button
                onClick={handleSetup}
                disabled={submitting || !code.trim()}
                className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-widest uppercase transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: (!submitting && code.trim()) ? "white" : "rgba(255,255,255,0.1)",
                  color: (!submitting && code.trim()) ? "black" : "white",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Linking Glasses...
                  </span>
                ) : "Link My Glasses"}
              </button>
            </div>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <div
              className="rounded-2xl p-8 border border-gray-800 text-center"
              style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
            >
              {/* Animated checkmark ring */}
              <div className="flex justify-center mb-8">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border border-green-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="w-24 h-24 rounded-full border border-green-500/40 flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.06)" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">You're All Set</h2>
              <p className="text-gray-500 text-sm mb-3 leading-relaxed">
                Your AiSee glasses are connected and ready to use.
              </p>

              {deviceCode && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-800 mb-8"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-gray-500 text-xs font-mono tracking-widest">Device: {deviceCode}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <a
                  href="/"
                  className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-widest uppercase text-center transition-all duration-200"
                  style={{
                    background: "white",
                    color: "black",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#e5e5e5"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  Go Home
                </a>

                <button
                  onClick={handleRevoke}
                  className="w-full py-3 rounded-xl text-xs tracking-widest uppercase transition-all duration-200 text-red-500/60 hover:text-red-400 border border-red-500/10 hover:border-red-500/30"
                  style={{ background: "transparent" }}
                >
                  Disconnect Glasses
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer note */}
        <p className="text-gray-800 text-xs tracking-widest mt-10 uppercase">
          © {new Date().getFullYear()} AiSee — The vision of the future
        </p>
      </div>
    </div>
  );
}