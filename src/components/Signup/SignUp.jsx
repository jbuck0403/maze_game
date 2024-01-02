import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        console.log(user);

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

    if (password !== confirmPassword) {
      setError({ ...error, message: "Passwords to not match..." });
      return;
    }

    signUpUser(email, password);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="email"
        />
        <input
          onChange={(e) => setDisplayName(e.target.value)}
          type="text"
          placeholder="user name"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
        />
        <input
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          placeholder="confirm password"
        />
        <button type="submit">Sign Up</button>
      </form>
      {error.message && <p>{error.message}</p>}
    </>
  );
};
export default SignUp;
