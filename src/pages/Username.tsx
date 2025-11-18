import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Username.css";

export const Username = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/password", { state: { username: input } });
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
