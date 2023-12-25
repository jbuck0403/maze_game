//imports
import "./Home.css";
import { NavigationContext } from "../../App";

//react imports
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { setHasVisitedHome, resetNavigation } = useContext(NavigationContext);

  useEffect(() => {
    resetNavigation();
    setHasVisitedHome(true);
  }, [setHasVisitedHome, resetNavigation]);

  const navigate = useNavigate();

  return <button onClick={() => navigate("/lobby")}>Play</button>;
};
export default Home;
