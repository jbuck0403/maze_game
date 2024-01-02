//firebase imports
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Login = ({ user }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({ code: "", message: "" });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // const user = userCredential.user;
        console.log(userCredential.user?.displayName);
        navigate("/");
      })
      .catch((e) => setError({ ...error, message: e.message }));
  };

  console.log(user);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="email"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
        />
        <button type="submit">Login</button>
      </form>
    </>
  );
};
export default Login;
