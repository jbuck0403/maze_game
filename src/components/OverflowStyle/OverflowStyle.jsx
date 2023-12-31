import { useLocation } from "react-router-dom";

const OverflowStyleComponent = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const overflowStyle = isHomePage ? "hidden" : "auto";

  // Debugging
  console.log("Current Path:", location.pathname);
  console.log("Is Home Page:", isHomePage);
  console.log("Overflow Style:", overflowStyle);

  return <div style={{ overflow: overflowStyle }}>{children}</div>;
};

export default OverflowStyleComponent;
