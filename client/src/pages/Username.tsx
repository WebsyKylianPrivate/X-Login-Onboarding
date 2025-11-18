import { useState } from "react";
import "./Username.css";

export const Username = () => {
  const [input, setInput] = useState("");

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
        <button className="next-button">Next</button>
      </div>
    </div>
  );
};
