import "../Auth.css";

//firebase imports
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MazeComponent from "../../Maze/Maze";
import { createMazeFromBlocks } from "../../../mazeGeneration/mazeGenerator";

const Login = ({ user, setUserID }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({ code: "", message: "" });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // const user = userCredential.user;
        setUserID(userCredential.user?.displayName);
        console.log(userCredential.user?.displayName);
        navigate("/");
      })
      .catch((e) => setError({ ...error, message: e.message }));
  };

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, []);

  const maze = createMazeFromBlocks(5);

  return (
    <>
      <div className="home-maze-container">
        <div className="auth-maze">
          <MazeComponent maze={maze} />
        </div>
        <div className="nav-button-container">
          <button
            className="nav-button smaller auth-button"
            onClick={() => {
              navigate("/");
            }}
          >
            Home
          </button>
          <form onSubmit={handleSubmit}>
            <div className="auth-form">
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="email"
                className="auth-input"
              />
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="password"
                className="auth-input"
              />
              <button type="submit" className="nav-button smaller">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default Login;
