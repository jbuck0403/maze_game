import "../Auth.css";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MazeComponent from "../../Maze/Maze";
import { createMazeFromBlocks } from "../../../mazeGeneration/mazeGenerator";

const SignUp = ({ setFirebaseUser }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({ code: "", message: "" });

  const signUpUser = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user.email;

        updateProfile(userCredential.user, { displayName: displayName }).catch(
          (err) => setError({ ...error, message: err.message })
        );

        setFirebaseUser(userCredential.user.email);
        navigate("/login");
      })
      .catch((error) => {
        setError({ code: error.code, message: error.message });
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if ((email, displayName, password, confirmPassword)) {
      if (password !== confirmPassword) {
        setError({ ...error, message: "Passwords to not match..." });
        return;
      }

      signUpUser(email, password);
    }
  };

  const maze = createMazeFromBlocks(5);

  return (
    <>
      <div className="home-maze-container">
        <div className="auth-maze">
          <MazeComponent maze={maze} />
        </div>
        <div className="nav-button-container">
          <form onSubmit={handleSubmit}>
            <button
              className="nav-button smaller"
              onClick={() => {
                navigate("/");
              }}
            >
              Home
            </button>
            <div className="auth-form">
              <div className="auth-input-container">
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="email"
                  className="auth-input"
                />
                <input
                  onChange={(e) => setDisplayName(e.target.value)}
                  type="text"
                  placeholder="user name"
                  className="auth-input"
                />
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="password"
                  className="auth-input"
                />
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="confirm password"
                  className="auth-input"
                />
              </div>
              <button type="submit" className="nav-button smaller">
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
      {error.message && <p>{error.message}</p>}
    </>
  );
};
export default SignUp;
