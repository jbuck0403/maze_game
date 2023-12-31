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

  return (
    <>
      <div className="nav-button-container">
        <button className="nav-button" onClick={() => navigate("/lobby")}>
          Play
        </button>
        <button className="nav-button" onClick={() => navigate("/HowToPlay")}>
          How to Play
        </button>
      </div>
    </>
  );
};
export default Home;
