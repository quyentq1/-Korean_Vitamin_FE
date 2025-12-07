import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Homepage from './pages/HomePage/Homepage.jsx';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import './App.css';

function App() {

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={
            <div className="page-container error-page">
              <h1>⛔ Unauthorized</h1>
              <p>You don't have permission to access this page.</p>
            </div>
          }
        />
        {/* Homepage - Public */}
        <Route path="/" element={<Homepage />} />
        <Route path="/landing" element={<LandingPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
