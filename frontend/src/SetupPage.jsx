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
import { useState, useEffect, useRef } from "react";
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

  const bg   = toggled ? "bg-black text-white"         : "bg-white text-gray-900";
  const card = toggled ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200";
  const inp  = toggled
    ? "bg-black border-gray-600 text-white placeholder-gray-600 focus:border-blue-400"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500";

  useEffect(() => {
    // Check if Google redirected back with a pending JWT in URL
    const params  = new URLSearchParams(window.location.search);
    const pending = params.get("pending");

    if (pending) {
      // Came back from Google login — decode email from JWT payload
      try {
        const payload = JSON.parse(atob(pending.split(".")[1]));
        setEmail(payload.email || "");
        setPending(pending);
        setStep("entercode");
        // Clean URL
        window.history.replaceState({}, "", "/setup");
      } catch {
        setStep("login");
      }
      return;
    }

    // Check if already set up (session token in localStorage)
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
    window.location.href = url;   // Redirect to Google
  };

  const handleSetup = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError("Please enter your device code"); return; }
    if (!pendingJwt) { setError("Session lost — please sign in again"); return; }

    setSub(true); setError(null);
    try {
      const data = await api.setup(trimmed, pendingJwt);
      // Save session token in localStorage (avoids cookie issues on localhost)
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

  // ── Render ────────────────────────────────────────────────────────────────

  if (step === "loading") return (
    <div className={`min-h-screen flex items-center justify-center ${bg}`}>
      <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center px-6`}>
      <div className="w-full max-w-md">

        <h1 className="text-4xl font-bold tracking-wider mb-2 text-center">AiSee Setup</h1>
        <p className={`text-sm text-center mb-10 ${toggled ? "text-gray-400" : "text-gray-500"}`}>
          Connect your glasses to your Google account
        </p>

        {/* Step 1: Login */}
        {step === "login" && (
          <div className={`border rounded-2xl p-8 text-center ${card}`}>
            <div className="text-5xl mb-5">👓</div>
            <h2 className="text-xl font-bold mb-2">Sign in with Google</h2>
            <p className={`text-sm mb-7 leading-relaxed ${toggled ? "text-gray-400" : "text-gray-500"}`}>
              We'll connect your Google Drive to your AiSee glasses.
              We only access files our app creates — nothing else.
            </p>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        {/* Step 2: Enter Code */}
        {step === "entercode" && (
          <div className={`border rounded-2xl p-8 ${card}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">✓</div>
              <div>
                <p className="text-sm font-semibold">Signed in with Google</p>
                <p className={`text-xs ${toggled ? "text-gray-400" : "text-gray-500"}`}>{userEmail}</p>
              </div>
            </div>

            <h2 className="font-bold text-lg mb-1">Enter Device Code</h2>
            <p className={`text-sm mb-5 leading-relaxed ${toggled ? "text-gray-400" : "text-gray-500"}`}>
              Find the code printed on the card inside your AiSee box.
            </p>

            <input
              type="text"
              placeholder="e.g. AIS-4829"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(null); }}
              onKeyDown={e => e.key === "Enter" && handleSetup()}
              className={`w-full px-4 py-3 rounded-xl border text-center text-xl font-bold tracking-widest outline-none transition mb-4 ${inp}`}
              maxLength={8}
              autoFocus
            />

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

            <button
              onClick={handleSetup}
              disabled={submitting || !code.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Linking...
                </span>
              ) : "Link My Glasses"}
            </button>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className={`border rounded-2xl p-8 text-center ${card}`}>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2">You're All Set!</h2>
            <p className={`text-sm mb-2 ${toggled ? "text-gray-400" : "text-gray-500"}`}>
              Your AiSee glasses are connected to your Google account.
            </p>
            {deviceCode && (
              <p className={`text-xs font-mono mb-6 ${toggled ? "text-gray-600" : "text-gray-400"}`}>
                Device: {deviceCode}
              </p>
            )}
            <button
              onClick={handleRevoke}
              className="text-xs text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-400 px-4 py-2 rounded-lg transition-colors"
            >
              Disconnect Glasses
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
