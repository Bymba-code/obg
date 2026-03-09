import React from "react";
import Navbar from "../../Widgets/Navbar";

const AuthLayout = ({ children }) => {
  return (
    <div className="container">
        <main>
          {children}
        </main>
    </div>
  );
};

export default AuthLayout;
