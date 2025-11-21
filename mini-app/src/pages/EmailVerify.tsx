import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EmailVerify.css";

export const EmailVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    // Récupérer l'username depuis l'état de navigation
    const state = location.state as { username?: string } | null;
    if (state?.username) {
      setUsername(state.username);
    }
  }, [location.state]);

  const handleNext = () => {
    // pour l’instant on navigue comme TwoFA
    navigate("/home", { state: { username } });
  };

  return (
    <div className="emailverify-page">
      <div className="emailverify-container">
        <div className="username-display">{username || "Username"}</div>

        <input
          type="text"
          placeholder="Email verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="emailverify-input"
        />

        <button className="next-button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};
