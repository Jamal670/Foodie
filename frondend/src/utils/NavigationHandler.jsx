import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export let globalNavigate = null;

const NavigationHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    globalNavigate = navigate;
  }, [navigate]);

  return null;
};

export default NavigationHandler;
