import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { applyAccent, currentAccent } from "./theme";

applyAccent(currentAccent());

createRoot(document.getElementById("root")!).render(<App />);
