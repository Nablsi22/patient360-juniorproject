import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';  // ✅ UNCOMMENTED

/**
 * Main App Component
 * Handles routing for the Patient 360° application
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home/Login Route */}
          <Route path="/" element={<Login />} />
          
          {/* SignUp Route */}
          <Route path="/signup" element={<SignUp />} />
          
          {/* Patient Dashboard Route */}
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          
          {/* Doctor Dashboard Route */}
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />  {/* ✅ ACTIVE */}
          
          {/* Admin Dashboard Route - Coming Soon */}
          <Route path="/admin-dashboard" element={<ComingSoon role="Admin" />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

/**
 * Coming Soon Component
 * Temporary placeholder for dashboards under development
 */
const ComingSoon = ({ role }) => {
  const handleGoBack = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f8fafb 0%, #e8f5f1 100%)',
      fontFamily: 'Cairo, sans-serif',
      direction: 'rtl',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '60px 40px',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🚧</div>
        <h1 style={{ 
          color: '#10b981', 
          fontSize: '2rem', 
          marginBottom: '15px',
          fontWeight: '700'
        }}>
          لوحة تحكم {role === 'Doctor' ? 'الطبيب' : 'المسؤول'}
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '1.2rem', 
          marginBottom: '30px',
          lineHeight: '1.8'
        }}>
          هذه الصفحة قيد التطوير حالياً
          <br />
          سيتم إطلاقها قريباً
        </p>
        <button
          onClick={handleGoBack}
          style={{
            padding: '14px 40px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'Cairo, sans-serif'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          العودة للصفحة الرئيسية
        </button>
      </div>
    </div>
  );
};

export default App;