
import { useState, useRef } from "react"
import Header from "@/components/landing/Header"
import HeroSection from "@/components/landing/HeroSection"
import FeatureCards from "@/components/landing/FeatureCards"
import AboutSection from "@/components/landing/AboutSection"
import AuthForm from "@/components/landing/AuthForm"
import Footer from "@/components/landing/Footer"

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true)
  const authFormRef = useRef<HTMLDivElement>(null)

  const handleSwitchToSignup = () => {
    setIsLogin(false)
    scrollToAuthForm()
  }

  const scrollToAuthForm = () => {
    if (authFormRef.current) {
      authFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLogin={isLogin} 
        setIsLogin={setIsLogin} 
        handleSwitchToSignup={handleSwitchToSignup}
        scrollToAuthForm={scrollToAuthForm} 
      />

      <main className="container px-4 md:px-6 pt-24 pb-16">
        <HeroSection handleSwitchToSignup={handleSwitchToSignup} />
        <FeatureCards />
        
        <div id="auth-section" className="grid md:grid-cols-2 gap-12 items-start my-16" ref={authFormRef}>
          <div className="md:col-start-2">
            <AuthForm isLogin={isLogin} setIsLogin={setIsLogin} />
          </div>
        </div>
        
        <AboutSection />
      </main>

      <Footer />
    </div>
  )
}
