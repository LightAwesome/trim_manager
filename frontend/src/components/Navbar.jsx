// FILE: src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/unprocessed', label: 'Unprocessed' },
  { path: '/processed', label: 'Processed' },
  { path: '/trims', label: 'Trims' },
  { path: '/aliases', label: 'Aliases' },
];

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-header">
        TrimTool
      </div>
      <ul className="navbar-nav">
        {navItems.map(item => (
          <li key={item.path} className="nav-item">
            <NavLink to={item.path} className="nav-link" end>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
