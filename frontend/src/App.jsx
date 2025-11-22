import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from 'react-router-dom';

// Import your page components
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Send_money from './components/Send_Money';


function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(null); // replace with real auth later

  // Example login handler you can call from Login component via props
  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => setUser(null);

  return (
    <Router>
      <div className="App">
      <header className="App-header">
      <a href="/Home"><img src={logo} className="App-logo" alt="logo" />
        <div className='logoDiv'>
           
        </div>
        </a>
      <nav className="navItems">
        
        <Link to="/login">Login</Link>
        
        
      </nav>
          
        </header>

        <main style={{ padding: 6 }}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            {/* Example of a protected route */}
            <Route
              path="/protected"
              element={
                <PrivateRoute user={user}>
                  <div>
                    <h2>Protected Page</h2>
                    <p>Only visible when logged in.</p>
                  </div>
                </PrivateRoute>
              }
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
