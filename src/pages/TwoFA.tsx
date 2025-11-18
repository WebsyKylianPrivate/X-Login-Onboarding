import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TwoFA.css";

export const TwoFA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    // Récupérer l'username depuis l'état de navigation
    const state = location.state as { username?: string };
    if (state?.username) {
      setUsername(state.username);
    }
  }, [location]);

  const handleNext = () => {
    navigate("/home", { state: { username } });
  };

  return (
    <div className="twofa-page">
      <div className="twofa-container">
        <div className="username-display">{username || "Username"}</div>
        <input
          type="text"
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="twofa-input"
        />
        <button className="next-button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};
