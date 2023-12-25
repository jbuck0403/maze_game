import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationContext } from "../../App";

const Home = () => {
  const { setHasVisitedHome, resetNavigation, hasVisitedHome } =
    useContext(NavigationContext);

  useEffect(() => {
    resetNavigation();
    setHasVisitedHome(true);
  }, [setHasVisitedHome, resetNavigation]);

  const navigate = useNavigate();

  return <button onClick={() => navigate("/lobby")}>Play</button>;
};
export default Home;
