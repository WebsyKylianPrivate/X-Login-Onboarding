// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import "./EmailVerify.css";

// export const EmailVerify = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [username, setUsername] = useState("");
//   const [code, setCode] = useState("");

//   useEffect(() => {
//     // Récupérer l'username depuis l'état de navigation
//     const state = location.state as { username?: string } | null;
//     if (state?.username) {
//       setUsername(state.username);
//     }
//   }, [location.state]);

//   const handleNext = () => {
//     // pour l’instant on navigue comme TwoFA
//     navigate("/home", { state: { username } });
//   };

//   return (
//     <div className="emailverify-page">
//       <div className="emailverify-container">
//         <div className="username-display">{username || "Username"}</div>

//         <input
//           type="text"
//           placeholder="Email verification code"
//           value={code}
//           onChange={(e) => setCode(e.target.value)}
//           className="emailverify-input"
//         />

//         <button className="next-button" onClick={handleNext}>
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

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
  const [code, setCode] = useState("");

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
        navigate("/home", { state: { username } });
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

  return (
    <div className="emailverify-page">
      <FullScreenLoader visible={loading} text="Verifying email..." />
      <Toast message={toast} onClose={() => setToast("")} />

      <div className="emailverify-container">
        <div className="username-display">{username || "Username"}</div>

        <input
          type="text"
          placeholder="Email verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="emailverify-input"
          disabled={loading}
        />

        <button className="next-button" onClick={handleNext} disabled={loading}>
          Next
        </button>
      </div>
    </div>
  );
};
