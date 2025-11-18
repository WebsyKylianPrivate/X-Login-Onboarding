import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Home.css";

export const Home = () => {
  const location = useLocation();
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Récupérer l'username depuis l'état de navigation
    const state = location.state as { username?: string };
    if (state?.username) {
      setUsername(state.username);
    }
  }, [location]);

  return (
    <div className="home-page">
      <div className="home-container">
        <h1 className="welcome-text">Welcome</h1>
        <div className="username-text">{username || "Username"}</div>
      </div>
    </div>
  );
};
