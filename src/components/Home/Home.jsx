import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate("/lobby")}>Play</button>;
};
export default Home;
