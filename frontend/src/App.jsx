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
        <div className='logoDiv'>
           <img src={logo} className="App-logo" alt="logo" />
        </div>
        
      <nav className="navItems">
        <Link to="/">Home</Link>
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/signup">Sign Up</Link>}
        {user && <button onClick={handleLogout}>Logout</button>}
      </nav>
          
        </header>

        <main style={{ padding: 3 }}>
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
