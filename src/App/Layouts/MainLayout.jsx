import React, { useState } from "react";
import Navbar from "../../Widgets/Navbar";
import Sidebar from "../../Widgets/Sidebar";
import css from "./style.module.css"

const MainLayout = ({ children }) => {
  const [ isSidebar, setIsSidebar ] = useState(true)
  
  return (
    <div className={css.container}>
      <Navbar isSidebar={isSidebar} setIsSidebar={setIsSidebar} />
      <Sidebar isSidebar={isSidebar} setIsSidebar={setIsSidebar} />
        <main className={`${css.mainContent} ${isSidebar ? css.active : ""}`}>
          <div className={css.navbarSpacer}></div>

          <div className={css.content}>
            {children}
          </div>
            
        </main>
    </div>
  );
};

export default MainLayout;
