import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Helmet } from "react-helmet";

createRoot(document.getElementById("root")!).render(
  <>
    <Helmet>
      <title>ProjectSync - Gantt Timeline Management</title>
      <meta name="description" content="ProjectSync - A Gantt-style timeline management tool for business analysts and project managers to visualize and manage multiple projects." />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    </Helmet>
    <App />
  </>
);
