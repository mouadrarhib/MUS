import { useEffect, useState } from "react";
import "./App.css";
import client from "./api/client";

function App() {
  const [status, setStatus] = useState("Checking backend connection...");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { data } = await client.get("/health");
        if (data?.ok) {
          setStatus("Connected to backend API");
        } else {
          setStatus("Backend reachable, but health check failed");
        }
      } catch (error) {
        console.error("Health check failed", error);
        setStatus("Cannot reach backend API");
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="card">
      <h1>MUS Frontend</h1>
      <p>{status}</p>
      <p>
        Backend URL: <code>{import.meta.env.VITE_API_URL}</code>
      </p>
    </div>
  );
}

export default App;
