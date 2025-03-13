import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Theme style values
  const themeValues = {
    background: theme === 'light' 
      ? 'linear-gradient(to bottom right, #f0f5ff, #ffffff, #f0f7ff)' 
      : 'linear-gradient(to bottom right, #141414, #1f1f1f, #141414)',
    headerBackground: theme === 'light' 
      ? 'rgba(255, 255, 255, 0.95)' 
      : 'rgba(22, 22, 22, 0.95)',
    headerShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.2)',
    primaryText: theme === 'light' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
    secondaryText: theme === 'light' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.65)',
    tertiaryText: theme === 'light' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.45)',
    accentColor: theme === 'light' ? '#1890ff' : '#69c0ff',
    dividerColor: theme === 'light' ? '#f0f0f0' : '#303030',
    cardBackground: theme === 'light' ? '#fff' : '#141414',
    cardBorder: theme === 'light' ? '#f0f0f0' : '#303030',
    cardShadow: theme === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
    particleColor: theme === 'light' ? 'rgba(24, 144, 255, 0.12)' : 'rgba(209, 213, 219, 0.08)',
  };

  // Set up particles animation
  useEffect(() => {
    let canvas = document.getElementById('particles-canvas');
    
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'particles-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '1';
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 30; 

    // Set canvas dimensions to match viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.5 + 0.5, 
        color: themeValues.particleColor,
        speedX: Math.random() * 0.25 - 0.125,
        speedY: Math.random() * 0.25 - 0.125
      });
    }

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
    };
    
    const animationId = requestAnimationFrame(animate);
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (canvas) canvas.remove();
    };
  }, [themeValues.particleColor]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeValues }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};