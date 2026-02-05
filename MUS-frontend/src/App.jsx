import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import "./App.css";
import AppRouter from "./app/router";

function App() {
  useEffect(() => {
    // Initialisation de l'app
    document.title = 'Moroccan University Students Platform';
  }, []);

  return (
      <AppRouter />
  );
}

export default App;
