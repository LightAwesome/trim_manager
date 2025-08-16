// FILE: src/components/Layout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom'; // <-- 1. IMPORT OUTLET
import Navbar from './Navbar';

function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <Outlet /> {/* <-- 2. ADD THE OUTLET COMPONENT HERE */}
      </main>
    </div>
  );
}

export default Layout;
