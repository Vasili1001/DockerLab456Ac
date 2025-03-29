import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function Layout() {
  return (
    <div className="main-container">
      <header className="header">
        <h2>📝 ToDo App</h2>
        <Link to="/" className="btn-home">
          Home
        </Link>
      </header>
      <Outlet />
    </div>
  );
}

export default Layout;
