import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "Cough Conference Audio Evaluation";

createRoot(document.getElementById("root")!).render(<App />);
