// FileName: /src/App.js
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Components/Header/header.js";
import Hero from "./Components/Herosection/Hero.js";
import ClientLogos from "./Components/ClientLogos/ClientLogos.js";
import HowItWorks from "./Components/HowItWorks/HowItWorks.js";
import VideoComparison from "./Components/VideoComparison/VideoComparison.js";
import Pricing from "./Components/Pricing/Pricing.js";
import CostComparison from "./Components/CostComparison/CostComparison.js";
import Testimonials from "./Components/Testimonials/Testimonials.js";
import Footer from "./Components/Footer/Footer.js";
import ClientPortal from "./pages/ClientPortal/ClientPortal.js";
import AdminPortal from "./pages/AdminPortal/AdminPortal";
import PricingPage from "./pages/Pricing_page/Pricing.js"; // Fixed path (relative from src/)
import SetNewPassword from "./pages/Auth/SetNewPassword.jsx";

import { useEffect } from 'react';

// ✅ Auth
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./auth/ProtectedRouts.jsx"; // keep your filename
import SignIn from "./pages/Auth/SignIn.js";
import SignUp from "./pages/Auth/SignUp.js";

// ✅ Admin Auth
import { AdminAuthProvider } from "./auth/adminAuth/adminAuthContext.js";
import AdminLogin from "./auth/adminAuth/AdminLogin.js";
import AdminRegister from "./auth/adminAuth/AdminRegister.js"; // Ensure this path matches your folder
import AdminPrivateRoute from "./auth/adminAuth/adminPrivateRoute.js";

// Register GSAP plugins ONLY HERE
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Create a separate HomePage component for cleaner routing
const HomePage = () => (
  <>
    <Hero
      title={
        <>
          Turn Listing Photos Into Cinematic Walkthrough Videos— for fraction of
          the Price
        </>
      }
    />
    <ClientLogos />
    <VideoComparison
      title="From Photo to Cinematic Video"
      description="See how we transform static property photos into engaging videos"
      comparisons={[
        {
          photo: require("./assets/images/before1.png"),
          video: require("./assets/videos/before1.mp4"),
        },
        {
          photo: require("./assets/images/before2.png"),
          video: require("./assets/videos/before2.mp4"),
        },
      ]}
      slideInterval={6000}
    />
    <HowItWorks />
    <Pricing />
    <CostComparison />
    <Testimonials />
  </>
);

function App() {
  useEffect(() => {
    // Wait for fonts to load before any text animations
    document.fonts.ready.then(() => {
      console.log("Fonts loaded, safe to use SplitText");
    });
  }, []);

  return (
    <AuthProvider>
      <AdminAuthProvider> {/* Wrap with AdminAuthProvider */}
        <Router>
          <div className="App">
            <Header />

            <Routes>
              {/* Homepage Route */}
              <Route path="/" element={<HomePage />} />

              {/* Pricing Page Route */}
              <Route path="/Pricing" element={<PricingPage />} />

              {/* Admin Login Route */}
              <Route path="/admin-login" element={<AdminLogin />} />
              
              {/* Admin Register Route */}
              <Route path="/admin-register" element={<AdminRegister />} />

              {/* Admin Panel Route with nested routes - PROTECTED */}
              <Route
                path="/admin/*"
                element={
                  <AdminPrivateRoute>
                    <AdminPortal />
                  </AdminPrivateRoute>
                }
              />

              {/* Auth pages (Client) */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/set-password" element={<SetNewPassword />} />

              {/* Protected Routes (Client) */}
              <Route
                path="/portal"
                element={
                  <ProtectedRoute>
                    <ClientPortal />
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Footer />
          </div>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;