import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Homepage from './pages/Homepage/Homepage';
import Homepage2 from './pages/Homepage/Homepage2';
import Homepage3 from './pages/Homepage/Homepage3';
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
        <Route path="/homepage2" element={<Homepage2 />} />
        <Route path="/homepage3" element={<Homepage3 />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
