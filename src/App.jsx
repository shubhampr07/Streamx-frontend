import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./components/LandingPage";
import StreamingPage from "./components/StreamingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/stream" element={<StreamingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
