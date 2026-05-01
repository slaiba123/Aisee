import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import AiSee from "./AiSee";
import SetupPage from "./SetupPage";
import Demo from "./Demo";
import "./index.css";

function App() {
  const [toggled, setToggled] = useState(false);
  const path = window.location.pathname;

  if (path === "/setup") return <SetupPage toggled={toggled} />;
  else if (path === "/demo") return <Demo />;
  return <AiSee />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);