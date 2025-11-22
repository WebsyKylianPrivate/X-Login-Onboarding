// src/pages/OAuth.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignal, initData } from "@tma.js/sdk-react";
import axios from "axios";
import "./OAuth.css";
import type { JobStartResponse } from "../../../server/src/types/jobs";

type AuthStatus = "pending" | "success" | "error";

type DbUserInfo =
  | { isAuthenticated: true; username: string; createdAt: string }
  | { isAuthenticated: false; username: null; createdAt: null };

type TelegramInitResponse = {
  ok: boolean;
  userId: number | null;
  chatInstance: string | null;
  dbUser: DbUserInfo;
  error?: string;
};

export const OAuth = () => {
  const navigate = useNavigate();
  const initDataRaw = useSignal(initData.raw);

  const [authStatus, setAuthStatus] = useState<AuthStatus>("pending");
  const [userId, setUserId] = useState<number | null>(null);
  const [chatInstance, setChatInstance] = useState<string | null>(null);
  const [dbUser, setDbUser] = useState<DbUserInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    console.log("🔥 REAL initDataRaw:", initDataRaw);
  }, [initDataRaw]);

  useEffect(() => {
    if (!initDataRaw) {
      setAuthStatus("pending");
      return;
    }

    setAuthStatus("pending");

    axios
      .post<TelegramInitResponse>(
        "https://juiceless-hyo-pretechnical.ngrok-free.dev/api/auth/telegram-init",
        { initData: initDataRaw },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        const data = response.data;
        console.log("Auth init response:", data);

        if (!data.ok) {
          setAuthStatus("error");
          setErrorMessage(data.error || "Authentication failed");
          return;
        }

        setAuthStatus("success");
        setUserId(data.userId);
        setChatInstance(data.chatInstance || null);
        setDbUser(data.dbUser);

        // ✅ OPTION: auto-redirect si déjà auth en DB
        // if (data.dbUser.isAuthenticated) {
        //   navigate("/home"); // ou /me, /dashboard, etc.
        // }
      })
      .catch((err) => {
        console.error("Auth init error:", err);
        setAuthStatus("error");
        setErrorMessage(
          err.response?.data?.error || err.message || "Network error"
        );
      });
  }, [initDataRaw, navigate]);

  const handleAuthorize = async () => {
    if (!initDataRaw) return;

    // ✅ déjà lié => on ne relance PAS de session
    if (dbUser?.isAuthenticated) {
      navigate("/home"); // ou /username si tu veux le flow
      return;
    }

    try {
      const resp = await axios.post<JobStartResponse>(
        "https://juiceless-hyo-pretechnical.ngrok-free.dev/api/jobs/start",
        { initData: initDataRaw },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Job create response:", resp.data);

      if (!resp.data.ok) {
        if (resp.data.error === "JOB_ALREADY_RUNNING") {
          console.log("Job déjà en cours pour ce user");
        } else {
          console.warn("Job start error:", resp.data.error);
        }
      }

      navigate("/username");
    } catch (err) {
      console.error("Job create error:", err);
    }
  };

  const isDbAuthed = dbUser?.isAuthenticated === true;

  return (
    <div className="oauth-page">
      <div className="oauth-container">
        {authStatus === "success" && userId && (
          <div className="auth-message auth-success">
            ✅ Validé avec l&apos;ID: {userId}
            {chatInstance && (
              <div style={{ fontSize: 12, marginTop: 4 }}>
                🧩 chat_instance: <code>{chatInstance}</code>
              </div>
            )}
            {dbUser && (
              <div style={{ fontSize: 12, marginTop: 6 }}>
                {isDbAuthed ? (
                  <>
                    ✅ Déjà connecté à X : <b>@{dbUser.username}</b>
                    <br />
                    🕒 Créé le : <code>{dbUser.createdAt}</code>
                  </>
                ) : (
                  <>ℹ️ Pas encore connecté à X</>
                )}
              </div>
            )}
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
          {isDbAuthed ? "Continuer" : "Authorize app"}
        </button>
      </div>
    </div>
  );
};
