import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Username } from "@pages/Username";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/username" replace />} />
        <Route path="/username" element={<Username />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
