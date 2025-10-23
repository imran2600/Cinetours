import React from "react";
import "./Header.css";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Collapse from "bootstrap/js/dist/collapse";
import UserAvatar from "../../pages/ClientPortal/components/UserAvatar.js";

import { useAuth } from "../../auth/AuthContext.jsx";
import { useAdminAuth } from "../../auth/adminAuth/adminAuthContext.js";


const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, signedIn, signOut,} = useAuth();
  const { admin, logout: adminLogout } = useAdminAuth(); 
  const authed = !!(signedIn || user);

  const isAuthRoute =
    location.pathname.startsWith("/signin") ||
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/set-password");
  if (isAuthRoute) return null;

  const isAdminRoute = location.pathname.startsWith("/admin");


  const closeMobileMenu = () => {
    const el = document.getElementById("navbarContent");
    if (!el) return;
    try {
      const inst = Collapse.getInstance(el) || new Collapse(el, { toggle: false });
      inst.hide();
    } catch {
      el.classList.remove("show");
    }
  };

  const go = (path) => {
    closeMobileMenu();
    navigate(path);
  };

  const handleSignIn = () => go("/signin");
  const handleSignUp = () => go("/signup");

  const handleGetStart = () => go("/signup");;

  const handleAvatarClick = () => go("/portal");

  const handleSignOut = async () => {
    try {
      await signOut?.();
    } finally {
      go("/");
    }
  };

  const handleAdminSignOut = async () => {
    try {
      await adminLogout();
    } finally {
      go("/"); 
    }
  };

  const initial =
    (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <header className="site-header container-fluid bg-black shadow-sm">
      <nav className="navbar navbar-expand-md navbar-light container py-2 py-md-3">
        <button
          className="navbar-toggler p-1 border-0 d-md-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" style={{ transform: "scale(0.7)" }}></span>
        </button>

        <NavLink
          to="/"
          onClick={closeMobileMenu}
          className="navbar-brand fs-4 fw-bold gradient-text me-md-4"
        >
          QuantumTours
        </NavLink>

        <div className="d-flex flex-grow-1">
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav gap-md-3 me-auto">
              <li className="nav-item">
                <NavLink
                  to="/"
                  end
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `nav-link fw-medium text-white ${isActive ? "is-active" : ""}`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/portal"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `nav-link fw-medium text-white ${isActive ? "is-active" : ""}`
                  }
                >
                  Client Portal
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/pricing"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `nav-link fw-medium text-white ${isActive ? "is-active" : ""}`
                  }
                >
                  Pricing
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/admin"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `nav-link fw-medium text-white ${isActive ? "is-active" : ""}`
                  }
                >
                  Admin Panel
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="header-actions d-flex align-items-center gap-2 ms-auto">
            {isAdminRoute && admin ? (
              <button className="btn btn-outline-secondary btn-sm" onClick={handleAdminSignOut}>
                Admin Sign out
              </button>
            ) : (
              !authed ? (
                <>
                  <button className="btn btn-outline-secondary btn-sm" onClick={handleSignIn}>
                    Sign in
                  </button>
                  <button className="btn gradient-button btn-sm" onClick={handleGetStart}>
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <UserAvatar size={32} withMenu />
                  <button className="btn btn-outline-secondary btn-sm" onClick={handleSignOut}>
                    Sign out
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
