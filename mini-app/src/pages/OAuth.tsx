// src/pages/OAuth.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignal, initData } from "@tma.js/sdk-react";
import axios from "axios";
import "./OAuth.css";

type AuthStatus = "pending" | "success" | "error";

export const OAuth = () => {
  const navigate = useNavigate();
  const initDataRaw = useSignal(initData.raw); // string signé envoyé par Telegram
  const [authStatus, setAuthStatus] = useState<AuthStatus>("pending");
  const [userId, setUserId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    console.log("🔥 REAL initDataRaw:", initDataRaw);
  }, [initDataRaw]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        console.log("Tab active → resync login step");
      } else {
        console.log("Tab inactive");
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!initDataRaw) {
      setAuthStatus("pending");
      return;
    }

    setAuthStatus("pending");

    axios
      .post(
        "https://juiceless-hyo-pretechnical.ngrok-free.dev/api/auth/telegram-init",
        { initData: initDataRaw },
        {
          headers: { "Content-Type": "application/json" },
        }
      )
      .then((response) => {
        const data = response.data;
        console.log("Auth init response:", data);
        if (data.ok) {
          setAuthStatus("success");
          setUserId(data.userId);
        } else {
          setAuthStatus("error");
          setErrorMessage(data.error || "Authentication failed");
        }
      })
      .catch((err) => {
        console.error("Auth init error:", err);
        setAuthStatus("error");
        setErrorMessage(
          err.response?.data?.error || err.message || "Network error"
        );
      });
  }, [initDataRaw]);

  const handleAuthorize = () => {
    navigate("/username");
  };

  return (
    <div className="oauth-page">
      <div className="oauth-container">
        {authStatus === "success" && userId && (
          <div className="auth-message auth-success">
            ✅ Validé avec l'ID: {userId}
          </div>
        )}
        {authStatus === "error" && (
          <div className="auth-message auth-error">
            ❌ Auth error: {errorMessage}
          </div>
        )}
        {authStatus === "pending" && (
          <div className="auth-message auth-pending">
            ⏳ Vérification en cours...
          </div>
        )}
        <button className="authorize-button" onClick={handleAuthorize}>
          Authorize app
        </button>
      </div>
    </div>
  );
};
