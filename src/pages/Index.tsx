
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to Dashboard page
  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  return null;
};

export default Index;
