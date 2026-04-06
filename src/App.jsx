import { useState, useCallback } from 'react';
import Sticker from './components/Sticker';
import { useTheme } from './themes/ThemeContext.jsx';
import ThemeSwitcher from './components/ThemeSwitcher';
import coffeeMugImg from './themes/cozykawaii/stickers/cozycoffeemug.png';
import plantSucculentImg from './themes/cozykawaii/stickers/cozyplantsucculent.png';
import penHolderImg from './themes/cozykawaii/stickers/cozypenholder.png';
import './App.css';

const getToggleStyle = (themeName, sidebarVisible) => {
  const base = {
    position: 'absolute',
    top: '50%',
    left: sidebarVisible ? '200px' : '0px',
    transform: 'translateY(-50%)',
    border: 'none',
    borderRadius: '12px',
    padding: '6px 4px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease-in-out',
    zIndex: 100,
    fontSize: '14px',
    lineHeight: 1,
  };

  switch (themeName) {
    case 'cozykawaii':
      return { ...base, backgroundColor: '#f5d0e5', color: '#fff' };
    case 'lofi':
      return { ...base, backgroundColor: '#a3c4dc', color: '#1a1a1a' };
    case 'steampunk':
      return { ...base, backgroundColor: '#b87333', color: '#3b2f2f', boxShadow: 'inset 0 0 4px #2a1f1f', borderRadius: '4px' };
    default:
      return { ...base, backgroundColor: '#ddd', color: '#000' };
  }
};

function App() {
  const { theme, themeName } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((v) => !v);
  }, []);



  return (
    <div
      style={{
        background: theme.background.includes('url') ? theme.background : theme.background,
        backgroundSize: theme.background.includes('url') ? 'cover' : undefined,
        backgroundRepeat: theme.background.includes('url') ? 'no-repeat' : undefined,
        color: theme.text,
        fontFamily: theme.fontFamily,
        minHeight: '100vh',
        transition: 'background 0.3s, color 0.3s',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Layout */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar toggle handle */}
        <button
          onClick={toggleSidebar}
          title={sidebarVisible ? 'Hide sidebar (Shift+S)' : 'Show sidebar (Shift+S)'}
          style={getToggleStyle(themeName, sidebarVisible)}
        >
          {sidebarVisible ? '◀' : '▶'}
        </button>

        {/* Sidebar */}
        <aside
          style={{
            width: '200px',
            background: theme.accent,
            color: theme.text,
            padding: '2rem 1rem',
            boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            fontFamily: theme.fontFamily,
            opacity: sidebarVisible ? 1 : 0,
            transform: sidebarVisible ? 'translateX(0)' : 'translateX(-200px)',
            transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
            pointerEvents: sidebarVisible ? 'auto' : 'none',
            position: sidebarVisible ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            height: sidebarVisible ? 'auto' : '100%',
          }}
        >
          <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><a href="#" style={{ color: theme.text, textDecoration: 'none', fontWeight: 'bold', fontFamily: theme.fontFamily }}>Tasks</a></li>
              <li><a href="#" style={{ color: theme.text, textDecoration: 'none', fontWeight: 'bold', fontFamily: theme.fontFamily }}>Notes</a></li>
              <li><a href="#" style={{ color: theme.text, textDecoration: 'none', fontWeight: 'bold', fontFamily: theme.fontFamily }}>Settings</a></li>
            </ul>
          </nav>
        </aside>

        {/* Main Panel */}
        <main
          style={{
            flex: 1,
            padding: '3rem',
            background: theme.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: theme.fontFamily,
          }}
        >
          <div
            style={{
              background: theme.accent,
              color: theme.text,
              borderRadius: '16px',
              padding: '2rem 3rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              textAlign: 'center',
              fontFamily: theme.fontFamily,
              position: 'relative',
              minHeight: '300px',
            }}
          >
            <h2>Welcome to CozyDesk!</h2>
            <p>This is your productivity hub. Select a theme and explore Tasks, Notes, and Settings.</p>
            <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
              <Sticker src={coffeeMugImg} alt="Coffee Mug" initialPosition={{ x: 40, y: 40 }} />
              <Sticker src={plantSucculentImg} alt="Plant Succulent" initialPosition={{ x: 180, y: 100 }} />
              <Sticker src={penHolderImg} alt="Pen Holder" initialPosition={{ x: 320, y: 60 }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App
