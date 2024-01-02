import "./Logo.css";

import React from "react";

export const Logo = () => {
  const logoText = `
     █████╗ ██████╗ ████████╗██╗███████╗ █████╗ ██╗  ██╗
    ██╔══██╗██╔══██╗╚══██╔══╝██║██╔════╝██╔══██╗╚██╗██╔╝
    ███████║██████╔╝   ██║   ██║█████╗  ███████║ ╚███╔╝
    ██╔══██║██╔══██╗   ██║   ██║██╔══╝  ██╔══██║ ██╔██╗
    ██║  ██║██║  ██║   ██║   ██║██║     ██║  ██║██╔╝ ██╗
    ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝
    `;

  return (
    <div className="logo-background">
      <pre className="logo" style={{ whiteSpace: "pre" }}>
        {logoText}
      </pre>
    </div>
  );
};

export default Logo;
