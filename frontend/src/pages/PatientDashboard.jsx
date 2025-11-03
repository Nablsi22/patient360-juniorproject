// src/pages/PatientDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    // Make sure only patients can access this page
    if (currentUser.role !== 'patient') {
      alert('غير مصرح لك بالوصول إلى هذه الصفحة');
      navigate('/');
      return;
    }
    
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    alert('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  if (!user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Cairo, sans-serif' }}>جاري التحميل...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafb' }}>
      <Navbar />
      
      <div style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Cairo, sans-serif' }}>
        {/* Welcome Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '40px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 10px 40px rgba(16, 185, 129, 0.2)'
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '700' }}>
            مرحباً {user.firstName} {user.lastName} 🙋‍♂️
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.95 }}>
            لوحة تحكم المريض - Patient 360°
          </p>
        </div>

        {/* Health Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <StatCard icon="📅" number="3" label="المواعيد القادمة" color="#10b981" />
          <StatCard icon="💊" number="5" label="الأدوية الحالية" color="#10b981" />
          <StatCard icon="🔬" number="2" label="التحاليل المعلقة" color="#10b981" />
          <StatCard icon="📋" number="12" label="السجلات الطبية" color="#10b981" />
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', fontWeight: '700' }}>
            الإجراءات السريعة
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <ActionButton label="حجز موعد جديد" icon="📅" color="#10b981" />
            <ActionButton label="عرض السجلات الطبية" icon="📋" color="#10b981" />
            <ActionButton label="الوصفات الطبية" icon="💊" color="#10b981" />
            <ActionButton label="نتائج التحاليل" icon="🔬" color="#10b981" />
          </div>
        </div>

        {/* Account Information */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', fontWeight: '700' }}>
            معلومات الحساب
          </h2>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <InfoRow label="الاسم الكامل" value={`${user.firstName} ${user.lastName}`} />
            <InfoRow label="البريد الإلكتروني" value={user.email} ltr={true} />
            <InfoRow label="الدور" value="مريض" />
            <InfoRow label="رقم الهاتف" value={user.phone} ltr={true} />
            {user.nationalId && <InfoRow label="رقم الهوية" value={user.nationalId} />}
            {user.address && <InfoRow label="العنوان" value={user.address} />}
          </div>
          
          <button onClick={handleLogout} style={{ marginTop: '30px', padding: '12px 30px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: 'Cairo, sans-serif' }}
            onMouseOver={(e) => e.target.style.background = '#dc2626'}
            onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            تسجيل الخروج 🚪
          </button>
        </div>

        {/* Patient Features */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', fontWeight: '700' }}>
            الخدمات المتاحة للمرضى 🏥
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
            <li style={{ padding: '8px 0', color: '#6b7280' }}>✓ عرض السجل الطبي الكامل والتاريخ المرضي</li>
            <li style={{ padding: '8px 0', color: '#6b7280' }}>✓ حجز المواعيد مع الأطباء المتخصصين</li>
            <li style={{ padding: '8px 0', color: '#6b7280' }}>✓ متابعة الوصفات الطبية والأدوية</li>
            <li style={{ padding: '8px 0', color: '#6b7280' }}>✓ الحصول على نتائج التحاليل والفحوصات</li>
            <li style={{ padding: '8px 0', color: '#6b7280' }}>✓ التذكيرات الطبية والمواعيد</li>
            <li style={{ padding: '8px 0', color: '#6b7280' }}>✓ التواصل المباشر مع الطبيب المعالج</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, number, label, color }) => (
  <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{icon}</div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color }}>{number}</div>
    <div style={{ color: '#6b7280', marginTop: '5px' }}>{label}</div>
  </div>
);

const ActionButton = ({ label, icon, color }) => (
  <button style={{ padding: '15px', background: `${color}15`, color: color, border: `2px solid ${color}`, borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.2s' }}
    onMouseOver={(e) => { e.target.style.background = color; e.target.style.color = 'white'; }}
    onMouseOut={(e) => { e.target.style.background = `${color}15`; e.target.style.color = color; }}
  >
    {icon} {label}
  </button>
);

const InfoRow = ({ label, value, ltr }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #f3f4f6' }}>
    <strong style={{ color: '#374151' }}>{label}:</strong>
    <span style={{ color: '#6b7280', direction: ltr ? 'ltr' : 'rtl' }}>{value}</span>
  </div>
);

export default PatientDashboard;