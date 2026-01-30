import { useEffect } from "react";
import { Box } from "@mui/material";
import "./App.css";
import AppRouter from "./app/router"
import { useAuth } from '@/features/auth/context/AuthContext';

function App() {
  const { loading } = useAuth();

  useEffect(() => {
    // Initialisation de l'app
    document.title = 'Moroccan University Students Platform';
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        {/* Loader ou Splash Screen */}
      </Box>
    );
  }

  // const [ setStatus] = useState("Checking backend connection...");
  // const [ setConnected] = useState(false);

  // useEffect(() => {
  //   const checkHealth = async () => {
  //     try {
  //       const { data } = await apiClient.get("/health");
  //       if (data?.ok) {
  //         setConnected(true);
  //         setStatus("Frontend is connected to the backend API");
  //       } else {
  //         setStatus("Backend reachable, but health check failed");
  //       }
  //     } catch (error) {
  //       console.error("Health check failed", error);
  //       setStatus("Cannot reach backend API");
  //     }
  //   };

  //   checkHealth();
  // });

  return (
      <AppRouter />
  );
}

export default App;
