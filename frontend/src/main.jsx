import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import AiSee from "./AiSee";
import SetupPage from "./SetupPage";
import "./index.css";

function App() {
  const [toggled, setToggled] = useState(false);
  const path = window.location.pathname;

  if (path === "/setup") return <SetupPage toggled={toggled} />;
  return <AiSee />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);