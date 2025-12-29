import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThreeScene from './ThreeScene';
import TrustedBy from './TrustedBy';
import InteractiveLogo from './InteractiveLogo';
import Services from './Services';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show header if scrolled more than 50px
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      minHeight: '200vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      
      {/* --- GLASS NAVIGATION HEADER --- */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        boxSizing: 'border-box',
        padding: '20px 5%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        
        // GLASSMORPHISM STYLES
        background: 'rgba(255, 255, 255, 0.03)', // Highly transparent
        backdropFilter: 'blur(12px)',             // Frosted effect
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // Subtle edge
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Soft shadow for depth

        // ANIMATION
        transition: 'transform 0.3s ease-in-out', 
        transform: isScrolled ? 'translateY(0)' : 'translateY(-100%)',
      }}>
        
        {/* Logo */}
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', letterSpacing: '1px' }}>
          DeWhitt <span style={{ color: '#FFD700' }}>Designs</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/login">
            <button style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: '600',
            }}>
              Log In
            </button>
          </Link>

          <Link to="/register">
            <button style={{
              background: '#FFD700',
              border: 'none',
              color: 'black',
              padding: '10px 24px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)'
            }}>
              Start Project
            </button>
          </Link>
        </div>
      </nav>

      <ThreeScene />
      
      {/* DEBUG MARKER v2 */}
      <div style={{ position: 'fixed', bottom: 5, right: 5, zIndex: 9999, color: 'cyan', fontSize: '10px', opacity: 0.8 }}>
        v2: ADJUSTED
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        
        <section style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          paddingBottom: '10vh' 
        }}>
           {/* Hero Content */}
        </section>

        <div style={{ padding: '80px 5vw', textAlign: 'center' }}>
          <h2 className="text-gradient" style={{ fontSize: 'min(3.5rem, 8vw)', fontWeight: '800', lineHeight: '1.1' }}>
            STOP with the BORING WEBSITES!.<br />
            <span className="text-gold">Built from scratch, built to last.</span>
          </h2>
          <p style={{ marginTop: '20px', fontSize: '1.2rem', color: '#ccc', maxWidth: '600px', marginInline: 'auto' }}>
             You deserve a dish made from scratch, let your competitors enjoy the frozen meals my competitors are serving up. Let us cook!
          </p>
        </div>

        <InteractiveLogo />
        <TrustedBy /> 
        <Services />

        <section style={{ 
          height: '60vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 20px'
        }}>
          <h2 style={{ fontSize: 'min(3rem, 6vw)', marginBottom: '30px' }}>Ready to Upgrade?</h2>
          
          <Link to="/register">
            <button style={{ 
              padding: '20px 60px', 
              fontSize: '1.2rem', 
              borderRadius: '50px', 
              background: '#FFD700', 
              color: 'black', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Start Your Project
            </button>
          </Link>
        </section>

      </div>
    </div>
  );
};

export default LandingPage;