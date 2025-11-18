import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Username } from "@pages/Username";
import { Password } from "@pages/Password";
import { TwoFA } from "@pages/TwoFA";
import { Home } from "@pages/Home";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/username" replace />} />
        <Route path="/username" element={<Username />} />
        <Route path="/password" element={<Password />} />
        <Route path="/twofa" element={<TwoFA />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
