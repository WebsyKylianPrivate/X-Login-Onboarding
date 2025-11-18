// src/pages/OAuth.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSignal, initData } from "@tma.js/sdk-react";
import "./OAuth.css";

export const OAuth = () => {
  const navigate = useNavigate();
  const initDataRaw = useSignal(initData.raw); // string signé envoyé par Telegram

  // src/pages/OAuth.tsx
  useEffect(() => {
    if (!initDataRaw) return;

    fetch(
      "https://juiceless-hyo-pretechnical.ngrok-free.dev/api/auth/telegram-init",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: initDataRaw }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Auth init response:", data);
      })
      .catch((err) => {
        console.error("Auth init error:", err);
      });
  }, [initDataRaw]);

  const handleAuthorize = () => {
    navigate("/username");
  };

  return (
    <div className="oauth-page">
      <div className="oauth-container">
        <button className="authorize-button" onClick={handleAuthorize}>
          Authorize app
        </button>
      </div>
    </div>
  );
};
