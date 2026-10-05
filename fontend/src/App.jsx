import { Routes, Route } from "react-router-dom"
import Header from "./components/layout/Header/Header"
import HeroSection from "./components/layout/sections/Hero/HeroSection"
import FeaturesSection from "./components/layout/sections/Features/FeaturesSection"
import FinalCtaSection from "./components/layout/sections/FinalCta/FinalCtaSection"
import Footer from "./components/layout/Footer/Footer"
import SignupPage from "./components/ConnexionPages/Signup/SignupPage"
import LoginPage from "./components/ConnexionPages/Login/LoginPage"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile.jsx";
import About from "./pages/About.jsx"
// Protège une page en vérifiant la session avec le backend.
import ProtectedRoute from "./components/ProtectedRoute"

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-dark antialiased flex flex-col">
      <Header />
      <main className="flex-1 bg-light-bg">
        <HeroSection />
        <FeaturesSection />
        <FinalCtaSection />
        <Footer />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
    </Routes>
  )
}