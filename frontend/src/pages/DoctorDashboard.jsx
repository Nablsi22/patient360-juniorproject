// src/pages/DoctorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [ecgFile, setEcgFile] = useState(null);
  const [aiDiagnosis, setAiDiagnosis] = useState('');
  
  const [newPatient, setNewPatient] = useState({
    nationalId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: ''
  });
  
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    spo2: '',
    bloodGlucose: '',
    temperature: '',
    weight: ''
  });
  
  const [doctorOpinion, setDoctorOpinion] = useState('');

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    if (currentUser.role !== 'doctor') {
      alert('غير مصرح لك بالوصول إلى هذه الصفحة');
      navigate('/');
      return;
    }
    
    setUser(currentUser);
    const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    setPatients(storedPatients);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    alert('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  const handleSearchPatient = () => {
    if (!searchId.trim()) {
      alert('الرجاء إدخال الرقم الوطني للمريض');
      return;
    }
    
    const patient = patients.find(p => p.nationalId === searchId);
    
    if (patient) {
      setSelectedPatient(patient);
      setVitalSigns(patient.vitalSigns || {
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        spo2: '',
        bloodGlucose: '',
        temperature: '',
        weight: ''
      });
      setDoctorOpinion(patient.doctorOpinion || '');
      setView('patientDetail');
      setShowSearchModal(false);
      setSearchId('');
    } else {
      alert('لم يتم العثور على مريض بهذا الرقم الوطني');
    }
  };

  const handleRegisterPatient = () => {
    if (!newPatient.nationalId || !newPatient.firstName || !newPatient.lastName) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (patients.find(p => p.nationalId === newPatient.nationalId)) {
      alert('مريض بهذا الرقم الوطني موجود بالفعل');
      return;
    }
    
    const patientData = {
      ...newPatient,
      id: Date.now().toString(),
      registeredBy: `${user.firstName} ${user.lastName}`,
      registrationDate: new Date().toISOString(),
      vitalSigns: {},
      medicalHistory: []
    };
    
    const updatedPatients = [...patients, patientData];
    setPatients(updatedPatients);
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    
    setSelectedPatient(patientData);
    setView('patientDetail');
    setShowRegisterModal(false);
    setNewPatient({
      nationalId: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      address: ''
    });
    
    alert('تم تسجيل المريض بنجاح');
  };

  const handleSavePatientData = () => {
    if (!selectedPatient) return;
    
    const updatedPatient = {
      ...selectedPatient,
      vitalSigns,
      doctorOpinion,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: `${user.firstName} ${user.lastName}`
    };
    
    const updatedPatients = patients.map(p => 
      p.nationalId === selectedPatient.nationalId ? updatedPatient : p
    );
    
    setPatients(updatedPatients);
    setSelectedPatient(updatedPatient);
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    
    alert('تم حفظ البيانات بنجاح');
  };

  const handleEcgUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setEcgFile(file);
    } else {
      alert('الرجاء اختيار ملف PDF فقط');
      e.target.value = '';
    }
  };

  const handleAiDiagnosis = () => {
    if (!ecgFile) {
      alert('الرجاء رفع ملف ECG أولاً');
      return;
    }
    
    setAiDiagnosis('جاري التحليل بواسطة الذكاء الاصطناعي...');
    setTimeout(() => {
      setAiDiagnosis('نتيجة التحليل الأولية: إيقاع طبيعي - ينصح بالمتابعة الدورية\n(ملاحظة: هذه نتيجة تجريبية - سيتم ربطها بنموذج الذكاء الاصطناعي لاحقاً)');
    }, 2000);
  };

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontFamily: 'Cairo, sans-serif',
        background: 'linear-gradient(135deg, #005080 0%, #003d5c 100%)',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        جاري التحميل...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0f4f8, #e8f0f7)', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <Navbar />
      
      <div style={{ paddingTop: '100px', paddingBottom: '40px', paddingLeft: '40px', paddingRight: '40px' }}>
        {/* Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, #005080 0%, #003d5c 100%)',
          color: 'white',
          padding: '40px',
          borderRadius: '20px',
          marginBottom: '40px',
          boxShadow: '0 20px 60px rgba(0, 80, 128, 0.3)',
          maxWidth: '1400px',
          margin: '0 auto 40px auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '700', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                د. {user.firstName} {user.lastName} 👨‍⚕️
              </h1>
              <p style={{ fontSize: '1.3rem', opacity: 0.95, marginBottom: '5px' }}>
                {user.institution || 'المؤسسة الصحية'}
              </p>
              {user.specialization && (
                <p style={{ fontSize: '1rem', opacity: 0.85, backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block', marginTop: '10px' }}>
                  التخصص: {user.specialization}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                padding: '15px 35px',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
                fontFamily: 'Cairo, sans-serif'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 30px rgba(239, 68, 68, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.3)';
              }}
            >
              تسجيل الخروج 🚪
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {view === 'dashboard' ? (
            <>
              {/* Quick Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                <ActionButton
                  icon="🔍"
                  title="البحث عن مريض"
                  description="ابحث عن مريض مسجل باستخدام الرقم الوطني"
                  onClick={() => setShowSearchModal(true)}
                  gradient="linear-gradient(135deg, #005080 0%, #003d5c 100%)"
                />
                <ActionButton
                  icon="➕"
                  title="تسجيل مريض جديد"
                  description="إضافة مريض جديد إلى النظام"
                  onClick={() => setShowRegisterModal(true)}
                  gradient="linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                />
              </div>

              {/* Statistics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                <StatCard icon="👥" number={patients.length} label="إجمالي المرضى" gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" />
                <StatCard icon="📅" number="8" label="المواعيد اليوم" gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" />
                <StatCard icon="💊" number="12" label="الوصفات الطبية" gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" />
                <StatCard icon="📊" number="45" label="التقارير الطبية" gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" />
              </div>

              {/* Patients Table */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '35px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,80,128,0.1)'
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  color: '#005080',
                  marginBottom: '30px',
                  borderBottom: '3px solid #005080',
                  paddingBottom: '15px',
                  fontWeight: '700'
                }}>
                  📋 المرضى المسجلين
                </h2>
                
                {patients.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    color: '#6b7280'
                  }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>📋</div>
                    <p style={{ fontSize: '1.5rem', marginBottom: '10px', fontWeight: '600' }}>لا توجد سجلات مرضى حالياً</p>
                    <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>ابدأ بتسجيل مريض جديد من الأزرار أعلاه</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                      <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #005080 0%, #003d5c 100%)', color: 'white' }}>
                          <th style={{ padding: '18px', textAlign: 'right', fontSize: '1rem', fontWeight: '600', borderRadius: '10px 0 0 10px' }}>الرقم الوطني</th>
                          <th style={{ padding: '18px', textAlign: 'right', fontSize: '1rem', fontWeight: '600' }}>الاسم الكامل</th>
                          <th style={{ padding: '18px', textAlign: 'right', fontSize: '1rem', fontWeight: '600' }}>تاريخ التسجيل</th>
                          <th style={{ padding: '18px', textAlign: 'center', fontSize: '1rem', fontWeight: '600', borderRadius: '0 10px 10px 0' }}>إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.map((patient, index) => (
                          <tr key={patient.id} style={{
                            background: index % 2 === 0 ? '#f8fafc' : 'white',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#e0f2fe';
                            e.currentTarget.style.transform = 'scale(1.01)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,80,128,0.15)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = index % 2 === 0 ? '#f8fafc' : 'white';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}>
                            <td style={{ padding: '20px', borderRadius: '10px 0 0 10px', fontWeight: '600', color: '#1e293b' }}>{patient.nationalId}</td>
                            <td style={{ padding: '20px', color: '#475569' }}>{patient.firstName} {patient.lastName}</td>
                            <td style={{ padding: '20px', color: '#64748b' }}>
                              {new Date(patient.registrationDate).toLocaleDateString('ar-EG')}
                            </td>
                            <td style={{ padding: '20px', textAlign: 'center', borderRadius: '0 10px 10px 0' }}>
                              <button
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setVitalSigns(patient.vitalSigns || {
                                    bloodPressureSystolic: '',
                                    bloodPressureDiastolic: '',
                                    heartRate: '',
                                    spo2: '',
                                    bloodGlucose: '',
                                    temperature: '',
                                    weight: ''
                                  });
                                  setDoctorOpinion(patient.doctorOpinion || '');
                                  setView('patientDetail');
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #005080 0%, #003d5c 100%)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '12px 25px',
                                  borderRadius: '10px',
                                  fontSize: '0.95rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  fontFamily: 'Cairo, sans-serif',
                                  boxShadow: '0 4px 10px rgba(0,80,128,0.3)'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.transform = 'translateY(-2px)';
                                  e.target.style.boxShadow = '0 6px 15px rgba(0,80,128,0.4)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 4px 10px rgba(0,80,128,0.3)';
                                }}
                              >
                                عرض التفاصيل
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Patient Detail View */
            <div>
              <button
                onClick={() => setView('dashboard')}
                style={{
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '30px',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Cairo, sans-serif',
                  boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateX(-5px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(107, 114, 128, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateX(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(107, 114, 128, 0.3)';
                }}
              >
                ← العودة إلى لوحة التحكم
              </button>

              {/* Patient Info Card */}
              <PatientInfoCard patient={selectedPatient} />

              {/* ECG Upload Section */}
              <ECGUploadSection
                ecgFile={ecgFile}
                handleEcgUpload={handleEcgUpload}
                handleAiDiagnosis={handleAiDiagnosis}
                aiDiagnosis={aiDiagnosis}
              />

              {/* Vital Signs */}
              <VitalSignsSection vitalSigns={vitalSigns} setVitalSigns={setVitalSigns} />

              {/* Doctor's Opinion */}
              <DoctorOpinionSection doctorOpinion={doctorOpinion} setDoctorOpinion={setDoctorOpinion} />

              {/* Save Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button
                  onClick={handleSavePatientData}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '20px 50px',
                    borderRadius: '15px',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Cairo, sans-serif',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                  }}
                >
                  💾 حفظ جميع البيانات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSearchModal && (
        <SearchModal
          searchId={searchId}
          setSearchId={setSearchId}
          handleSearchPatient={handleSearchPatient}
          onClose={() => setShowSearchModal(false)}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          newPatient={newPatient}
          setNewPatient={setNewPatient}
          handleRegisterPatient={handleRegisterPatient}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
};

// Component: Action Button
const ActionButton = ({ icon, title, description, onClick, gradient }) => (
  <button
    onClick={onClick}
    style={{
      background: gradient,
      color: 'white',
      border: 'none',
      padding: '40px',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'all 0.4s ease',
      textAlign: 'center',
      fontFamily: 'Cairo, sans-serif',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
      e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.25)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    }}
  >
    <div style={{ fontSize: '4rem', marginBottom: '15px' }}>{icon}</div>
    <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '10px' }}>{title}</h3>
    <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: '1.6' }}>{description}</p>
  </button>
);

// Component: Stat Card
const StatCard = ({ icon, number, label, gradient }) => (
  <div
    style={{
      background: gradient,
      color: 'white',
      padding: '35px',
      borderRadius: '20px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px) rotate(2deg)';
      e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.25)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    }}
  >
    <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{icon}</div>
    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>{number}</div>
    <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>{label}</div>
  </div>
);

// Component: Patient Info Card
const PatientInfoCard = ({ patient }) => (
  <div style={{
    background: 'white',
    borderRadius: '20px',
    padding: '35px',
    marginBottom: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,80,128,0.1)'
  }}>
    <h2 style={{
      fontSize: '2rem',
      color: '#005080',
      marginBottom: '30px',
      borderBottom: '3px solid #005080',
      paddingBottom: '15px',
      fontWeight: '700'
    }}>
      👤 معلومات المريض
    </h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
      <InfoField label="الرقم الوطني" value={patient?.nationalId} icon="🆔" />
      <InfoField label="الاسم الكامل" value={`${patient?.firstName} ${patient?.lastName}`} icon="👨‍⚕️" />
      <InfoField label="تاريخ الميلاد" value={patient?.dateOfBirth} icon="📅" />
      <InfoField label="الجنس" value={patient?.gender} icon="⚧️" />
      <InfoField label="رقم الهاتف" value={patient?.phone} icon="📱" />
      <InfoField label="العنوان" value={patient?.address} icon="🏠" />
    </div>
  </div>
);

// Component: Info Field
const InfoField = ({ label, value, icon }) => (
  <div style={{
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid rgba(0,80,128,0.1)',
    transition: 'all 0.3s ease'
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.borderColor = '#005080';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.borderColor = 'rgba(0,80,128,0.1)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}>
    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span>{icon}</span> {label}
    </p>
    <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>{value || '-'}</p>
  </div>
);

// Component: ECG Upload Section
const ECGUploadSection = ({ ecgFile, handleEcgUpload, handleAiDiagnosis, aiDiagnosis }) => (
  <div style={{
    background: 'white',
    borderRadius: '20px',
    padding: '35px',
    marginBottom: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,80,128,0.1)'
  }}>
    <h2 style={{
      fontSize: '2rem',
      color: '#005080',
      marginBottom: '30px',
      borderBottom: '3px solid #005080',
      paddingBottom: '15px',
      fontWeight: '700'
    }}>
      📈 تخطيط القلب (ECG)
    </h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', alignItems: 'stretch' }}>
      <label style={{ cursor: 'pointer' }}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleEcgUpload}
          style={{ display: 'none' }}
        />
        <div style={{
          border: '3px dashed #cbd5e1',
          borderRadius: '15px',
          padding: '50px 30px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#005080';
          e.currentTarget.style.background = 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '15px' }}>📄</div>
          <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '10px', fontWeight: '600' }}>
            اضغط لاختيار ملف ECG
          </p>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>PDF فقط</p>
          {ecgFile && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '10px',
              fontWeight: '600'
            }}>
              ✓ {ecgFile.name}
            </div>
          )}
        </div>
      </label>

      <button
        onClick={handleAiDiagnosis}
        disabled={!ecgFile}
        style={{
          background: ecgFile ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : '#e5e7eb',
          color: ecgFile ? 'white' : '#9ca3af',
          border: 'none',
          padding: '50px 30px',
          borderRadius: '15px',
          fontSize: '1.3rem',
          fontWeight: '700',
          cursor: ecgFile ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          fontFamily: 'Cairo, sans-serif',
          boxShadow: ecgFile ? '0 10px 30px rgba(139, 92, 246, 0.3)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px'
        }}
        onMouseOver={(e) => {
          if (ecgFile) {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.4)';
          }
        }}
        onMouseOut={(e) => {
          if (ecgFile) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
          }
        }}
      >
        <div style={{ fontSize: '3rem' }}>🤖</div>
        <div>تشخيص بالذكاء الاصطناعي</div>
      </button>
    </div>
    
    {aiDiagnosis && (
      <div style={{
        marginTop: '25px',
        padding: '25px',
        background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        border: '2px solid #c084fc',
        borderRadius: '15px',
        boxShadow: '0 8px 20px rgba(192, 132, 252, 0.2)'
      }}>
        <p style={{
          color: '#6b21a8',
          fontSize: '1.1rem',
          lineHeight: '1.8',
          whiteSpace: 'pre-line',
          fontWeight: '500'
        }}>
          {aiDiagnosis}
        </p>
      </div>
    )}
  </div>
);

// Component: Vital Signs Section
const VitalSignsSection = ({ vitalSigns, setVitalSigns }) => (
  <div style={{
    background: 'white',
    borderRadius: '20px',
    padding: '35px',
    marginBottom: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,80,128,0.1)'
  }}>
    <h2 style={{
      fontSize: '2rem',
      color: '#005080',
      marginBottom: '30px',
      borderBottom: '3px solid #005080',
      paddingBottom: '15px',
      fontWeight: '700'
    }}>
      💓 العلامات الحيوية
    </h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
      <VitalInput
        icon="💉"
        label="ضغط الدم (انقباضي)"
        value={vitalSigns.bloodPressureSystolic}
        onChange={(e) => setVitalSigns({...vitalSigns, bloodPressureSystolic: e.target.value})}
        unit="mmHg"
        placeholder="120"
      />
      <VitalInput
        icon="💉"
        label="ضغط الدم (انبساطي)"
        value={vitalSigns.bloodPressureDiastolic}
        onChange={(e) => setVitalSigns({...vitalSigns, bloodPressureDiastolic: e.target.value})}
        unit="mmHg"
        placeholder="80"
      />
      <VitalInput
        icon="💓"
        label="معدل ضربات القلب"
        value={vitalSigns.heartRate}
        onChange={(e) => setVitalSigns({...vitalSigns, heartRate: e.target.value})}
        unit="BPM"
        placeholder="72"
      />
      <VitalInput
        icon="🫁"
        label="نسبة الأكسجين"
        value={vitalSigns.spo2}
        onChange={(e) => setVitalSigns({...vitalSigns, spo2: e.target.value})}
        unit="%"
        placeholder="98"
      />
      <VitalInput
        icon="🩸"
        label="مستوى السكر"
        value={vitalSigns.bloodGlucose}
        onChange={(e) => setVitalSigns({...vitalSigns, bloodGlucose: e.target.value})}
        unit="mg/dL"
        placeholder="100"
      />
      <VitalInput
        icon="🌡️"
        label="درجة الحرارة"
        value={vitalSigns.temperature}
        onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
        unit="°C"
        placeholder="37"
      />
      <VitalInput
        icon="⚖️"
        label="الوزن"
        value={vitalSigns.weight}
        onChange={(e) => setVitalSigns({...vitalSigns, weight: e.target.value})}
        unit="kg"
        placeholder="70"
      />
    </div>
  </div>
);

// Component: Vital Input
const VitalInput = ({ icon, label, value, onChange, unit, placeholder }) => (
  <div style={{
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    padding: '25px',
    borderRadius: '15px',
    border: '2px solid rgba(0,80,128,0.1)',
    transition: 'all 0.3s ease'
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.borderColor = '#005080';
    e.currentTarget.style.transform = 'translateY(-3px)';
    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,80,128,0.15)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.borderColor = 'rgba(0,80,128,0.1)';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <span style={{ fontSize: '1.8rem' }}>{icon}</span>
      <label style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>{label}</label>
    </div>
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: '12px',
          border: '2px solid #cbd5e1',
          borderRadius: '10px',
          fontSize: '1.1rem',
          fontFamily: 'Cairo, sans-serif',
          transition: 'all 0.3s ease',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#005080';
          e.target.style.boxShadow = '0 0 0 3px rgba(0,80,128,0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#cbd5e1';
          e.target.style.boxShadow = 'none';
        }}
      />
      <span style={{
        fontSize: '1rem',
        fontWeight: '600',
        color: '#64748b',
        minWidth: '70px',
        textAlign: 'center',
        background: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '2px solid #e2e8f0'
      }}>
        {unit}
      </span>
    </div>
  </div>
);

// Component: Doctor Opinion Section
const DoctorOpinionSection = ({ doctorOpinion, setDoctorOpinion }) => (
  <div style={{
    background: 'white',
    borderRadius: '20px',
    padding: '35px',
    marginBottom: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,80,128,0.1)'
  }}>
    <h2 style={{
      fontSize: '2rem',
      color: '#005080',
      marginBottom: '30px',
      borderBottom: '3px solid #005080',
      paddingBottom: '15px',
      fontWeight: '700'
    }}>
      📝 رأي الطبيب والتشخيص
    </h2>
    <textarea
      value={doctorOpinion}
      onChange={(e) => setDoctorOpinion(e.target.value)}
      placeholder="اكتب رأيك الطبي التفصيلي والتشخيص الكامل للحالة..."
      style={{
        width: '100%',
        minHeight: '250px',
        padding: '25px',
        border: '2px solid #cbd5e1',
        borderRadius: '15px',
        fontSize: '1.1rem',
        fontFamily: 'Cairo, sans-serif',
        resize: 'vertical',
        transition: 'all 0.3s ease',
        outline: 'none',
        lineHeight: '1.8',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#005080';
        e.target.style.boxShadow = '0 0 0 4px rgba(0,80,128,0.1)';
        e.target.style.background = 'white';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#cbd5e1';
        e.target.style.boxShadow = 'none';
        e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
      }}
    />
  </div>
);

// Component: Search Modal
const SearchModal = ({ searchId, setSearchId, handleSearchPatient, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(5px)'
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: 'white',
        borderRadius: '25px',
        padding: '50px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl',
        position: 'relative'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          left: '30px',
          top: '30px',
          background: 'none',
          border: 'none',
          fontSize: '2rem',
          color: '#94a3b8',
          cursor: 'pointer',
          fontWeight: 'bold',
          lineHeight: '1',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.color = '#ef4444';
          e.target.style.transform = 'rotate(90deg)';
        }}
        onMouseOut={(e) => {
          e.target.style.color = '#94a3b8';
          e.target.style.transform = 'rotate(0deg)';
        }}
      >
        ×
      </button>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🔍</div>
        <h3 style={{ fontSize: '2rem', color: '#005080', fontWeight: '700', marginBottom: '10px' }}>
          البحث عن مريض
        </h3>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>أدخل الرقم الوطني للمريض</p>
      </div>

      <input
        type="text"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        placeholder="الرقم الوطني"
        style={{
          width: '100%',
          padding: '18px 20px',
          border: '2px solid #cbd5e1',
          borderRadius: '12px',
          fontSize: '1.2rem',
          marginBottom: '25px',
          fontFamily: 'Cairo, sans-serif',
          transition: 'all 0.3s ease',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#005080';
          e.target.style.boxShadow = '0 0 0 4px rgba(0,80,128,0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#cbd5e1';
          e.target.style.boxShadow = 'none';
        }}
        onKeyPress={(e) => e.key === 'Enter' && handleSearchPatient()}
      />
      
      <button
        onClick={handleSearchPatient}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #005080 0%, #003d5c 100%)',
          color: 'white',
          border: 'none',
          padding: '18px',
          borderRadius: '12px',
          fontSize: '1.3rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: 'Cairo, sans-serif',
          boxShadow: '0 8px 25px rgba(0,80,128,0.3)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-3px)';
          e.target.style.boxShadow = '0 12px 35px rgba(0,80,128,0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 8px 25px rgba(0,80,128,0.3)';
        }}
      >
        🔍 بحث
      </button>
    </div>
  </div>
);

// Component: Register Modal
const RegisterModal = ({ newPatient, setNewPatient, handleRegisterPatient, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(5px)',
      overflowY: 'auto'
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: 'white',
        borderRadius: '25px',
        padding: '50px',
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl',
        position: 'relative',
        margin: '20px auto'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          left: '30px',
          top: '30px',
          background: 'none',
          border: 'none',
          fontSize: '2rem',
          color: '#94a3b8',
          cursor: 'pointer',
          fontWeight: 'bold',
          lineHeight: '1',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.color = '#ef4444';
          e.target.style.transform = 'rotate(90deg)';
        }}
        onMouseOut={(e) => {
          e.target.style.color = '#94a3b8';
          e.target.style.transform = 'rotate(0deg)';
        }}
      >
        ×
      </button>
      
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>➕</div>
        <h3 style={{ fontSize: '2rem', color: '#005080', fontWeight: '700', marginBottom: '10px' }}>
          تسجيل مريض جديد
        </h3>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>أدخل معلومات المريض الكاملة</p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        <input
          type="text"
          placeholder="الرقم الوطني *"
          value={newPatient.nationalId}
          onChange={(e) => setNewPatient({...newPatient, nationalId: e.target.value})}
          style={inputStyle}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <input
            type="text"
            placeholder="الاسم الأول *"
            value={newPatient.firstName}
            onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="اسم العائلة *"
            value={newPatient.lastName}
            onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
            style={inputStyle}
          />
        </div>

        <input
          type="date"
          placeholder="تاريخ الميلاد"
          value={newPatient.dateOfBirth}
          onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
          style={inputStyle}
        />

        <select
          value={newPatient.gender}
          onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
          style={{...inputStyle, cursor: 'pointer'}}
        >
          <option value="">اختر الجنس</option>
          <option value="ذكر">ذكر</option>
          <option value="أنثى">أنثى</option>
        </select>

        <input
          type="tel"
          placeholder="رقم الهاتف"
          value={newPatient.phone}
          onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
          style={inputStyle}
        />

        <textarea
          placeholder="العنوان"
          value={newPatient.address}
          onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
          style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
        />
      </div>

      <button
        onClick={handleRegisterPatient}
        style={{
          width: '100%',
          marginTop: '30px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          padding: '18px',
          borderRadius: '12px',
          fontSize: '1.3rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: 'Cairo, sans-serif',
          boxShadow: '0 8px 25px rgba(16,185,129,0.3)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-3px)';
          e.target.style.boxShadow = '0 12px 35px rgba(16,185,129,0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 8px 25px rgba(16,185,129,0.3)';
        }}
      >
        ✓ تسجيل المريض
      </button>
    </div>
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '15px 18px',
  border: '2px solid #cbd5e1',
  borderRadius: '12px',
  fontSize: '1.1rem',
  fontFamily: 'Cairo, sans-serif',
  transition: 'all 0.3s ease',
  outline: 'none'
};

export default DoctorDashboard;