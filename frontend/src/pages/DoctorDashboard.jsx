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
  const [ecgFile, setEcgFile] = useState(null);
  const [aiDiagnosis, setAiDiagnosis] = useState('');
  
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
        background: 'linear-gradient(135deg, #125c7a 0%, #a23f97 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        جاري التحميل...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
      fontFamily: 'Cairo, sans-serif', 
      direction: 'rtl' 
    }}>
      <Navbar />
      
      <div style={{ paddingTop: '80px', paddingBottom: '40px', paddingLeft: '30px', paddingRight: '30px' }}>
        {/* Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, #125c7a 0%, #a23f97 100%)',
          color: 'white',
          padding: '30px 40px',
          borderRadius: '16px',
          marginBottom: '40px',
          boxShadow: '0 10px 30px rgba(162, 63, 151, 0.2)',
          maxWidth: '1200px',
          margin: '0 auto 40px auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ 
                fontSize: '2rem', 
                marginBottom: '8px', 
                fontWeight: '700',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                مرحباً د. {user.firstName} {user.lastName}
              </h1>
              <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '5px' }}>
                {user.institution || 'المؤسسة الصحية'}
              </p>
              {user.specialization && (
                <span style={{ 
                  fontSize: '0.9rem', 
                  opacity: 0.85, 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  padding: '4px 14px', 
                  borderRadius: '20px', 
                  display: 'inline-block', 
                  marginTop: '8px' 
                }}>
                  {user.specialization}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                padding: '12px 30px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Cairo, sans-serif',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.25)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {view === 'dashboard' ? (
            <>
              {/* Quick Stats - Elegant Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '25px', 
                marginBottom: '40px' 
              }}>
                <StatCard 
                  icon="👥" 
                  number={patients.length} 
                  label="إجمالي المرضى المسجلين" 
                  gradient="linear-gradient(135deg, #a23f97 0%, #c55db3 100%)"
                />
                <ActionCard
                  icon="🔍"
                  title="البحث عن مريض"
                  description="البحث باستخدام الرقم الوطني"
                  onClick={() => setShowSearchModal(true)}
                  color="#125c7a"
                />
              </div>

              {/* Patients Table - Elegant Design */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '35px',
                boxShadow: '0 5px 20px rgba(18, 92, 122, 0.08)',
                border: '1px solid rgba(18, 92, 122, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '30px',
                  paddingBottom: '20px',
                  borderBottom: '2px solid rgba(18, 92, 122, 0.1)'
                }}>
                  <h2 style={{
                    fontSize: '1.8rem',
                    color: '#125c7a',
                    fontWeight: '700',
                    margin: 0
                  }}>
                    سجلات المرضى
                  </h2>
                  <span style={{
                    background: 'linear-gradient(135deg, #a23f97 0%, #c55db3 100%)',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {patients.length} مريض
                  </span>
                </div>
                
                {patients.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '80px 20px'
                  }}>
                    <div style={{ 
                      fontSize: '5rem', 
                      marginBottom: '20px',
                      background: 'linear-gradient(135deg, #125c7a 0%, #a23f97 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      📋
                    </div>
                    <p style={{ 
                      fontSize: '1.3rem', 
                      marginBottom: '10px', 
                      fontWeight: '600', 
                      color: '#125c7a' 
                    }}>
                      لا توجد سجلات مرضى حالياً
                    </p>
                    <p style={{ fontSize: '1rem', color: '#5a7a8a' }}>
                      استخدم البحث للعثور على المرضى المسجلين في النظام
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                      <thead>
                        <tr>
                          <th style={{ 
                            padding: '15px 20px', 
                            textAlign: 'right', 
                            fontSize: '0.95rem', 
                            fontWeight: '600',
                            color: '#5a7a8a',
                            borderBottom: '2px solid #f1f3f5',
                            background: '#f8fafb'
                          }}>
                            الرقم الوطني
                          </th>
                          <th style={{ 
                            padding: '15px 20px', 
                            textAlign: 'right', 
                            fontSize: '0.95rem', 
                            fontWeight: '600',
                            color: '#5a7a8a',
                            borderBottom: '2px solid #f1f3f5',
                            background: '#f8fafb'
                          }}>
                            اسم المريض
                          </th>
                          <th style={{ 
                            padding: '15px 20px', 
                            textAlign: 'right', 
                            fontSize: '0.95rem', 
                            fontWeight: '600',
                            color: '#5a7a8a',
                            borderBottom: '2px solid #f1f3f5',
                            background: '#f8fafb'
                          }}>
                            تاريخ التسجيل
                          </th>
                          <th style={{ 
                            padding: '15px 20px', 
                            textAlign: 'right', 
                            fontSize: '0.95rem', 
                            fontWeight: '600',
                            color: '#5a7a8a',
                            borderBottom: '2px solid #f1f3f5',
                            background: '#f8fafb'
                          }}>
                            آخر تحديث
                          </th>
                          <th style={{ 
                            padding: '15px 20px', 
                            textAlign: 'center', 
                            fontSize: '0.95rem', 
                            fontWeight: '600',
                            color: '#5a7a8a',
                            borderBottom: '2px solid #f1f3f5',
                            background: '#f8fafb'
                          }}>
                            إجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.map((patient, index) => (
                          <tr key={patient.id} 
                              style={{
                                transition: 'all 0.3s ease',
                                borderBottom: '1px solid #f1f3f5'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(90deg, rgba(162,63,151,0.05) 0%, rgba(18,92,122,0.05) 100%)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                          >
                            <td style={{ 
                              padding: '20px', 
                              fontSize: '1rem',
                              fontWeight: '600', 
                              color: '#125c7a'
                            }}>
                              {patient.nationalId}
                            </td>
                            <td style={{ 
                              padding: '20px',
                              fontSize: '1rem', 
                              color: '#2c3e50',
                              fontWeight: '500'
                            }}>
                              {patient.firstName} {patient.lastName}
                            </td>
                            <td style={{ 
                              padding: '20px',
                              fontSize: '0.95rem', 
                              color: '#5a7a8a' 
                            }}>
                              {new Date(patient.registrationDate).toLocaleDateString('ar-EG')}
                            </td>
                            <td style={{ 
                              padding: '20px',
                              fontSize: '0.95rem', 
                              color: '#5a7a8a' 
                            }}>
                              {patient.lastUpdated ? 
                                new Date(patient.lastUpdated).toLocaleDateString('ar-EG') : 
                                '-'
                              }
                            </td>
                            <td style={{ padding: '20px', textAlign: 'center' }}>
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
                                  background: 'linear-gradient(135deg, #a23f97 0%, #8a3582 100%)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '10px 24px',
                                  borderRadius: '8px',
                                  fontSize: '0.95rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  fontFamily: 'Cairo, sans-serif'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.transform = 'translateY(-2px)';
                                  e.target.style.boxShadow = '0 8px 20px rgba(162,63,151,0.3)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = 'none';
                                }}
                              >
                                عرض الملف
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
                  background: 'white',
                  color: '#125c7a',
                  border: '2px solid rgba(18,92,122,0.2)',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '30px',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Cairo, sans-serif',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)';
                  e.target.style.transform = 'translateX(-3px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                ← رجوع للقائمة
              </button>

              {/* Patient Info Card */}
              <PatientInfoCard patient={selectedPatient} />

              {/* Main Content Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: '30px',
                marginBottom: '30px'
              }}>
                {/* ECG Upload Section */}
                <ECGUploadSection
                  ecgFile={ecgFile}
                  handleEcgUpload={handleEcgUpload}
                  handleAiDiagnosis={handleAiDiagnosis}
                  aiDiagnosis={aiDiagnosis}
                />

                {/* Doctor's Opinion */}
                <DoctorOpinionSection 
                  doctorOpinion={doctorOpinion} 
                  setDoctorOpinion={setDoctorOpinion} 
                />
              </div>

              {/* Vital Signs */}
              <VitalSignsSection vitalSigns={vitalSigns} setVitalSigns={setVitalSigns} />

              {/* Save Button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                <button
                  onClick={handleSavePatientData}
                  style={{
                    background: 'linear-gradient(135deg, #a23f97 0%, #8a3582 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 50px',
                    borderRadius: '12px',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Cairo, sans-serif',
                    boxShadow: '0 10px 30px rgba(162, 63, 151, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 15px 40px rgba(162, 63, 151, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 30px rgba(162, 63, 151, 0.3)';
                  }}
                >
                  حفظ جميع البيانات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          searchId={searchId}
          setSearchId={setSearchId}
          handleSearchPatient={handleSearchPatient}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </div>
  );
};

// Component: Stat Card
const StatCard = ({ icon, number, label, gradient }) => (
  <div
    style={{
      background: gradient,
      color: 'white',
      padding: '30px',
      borderRadius: '12px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'default',
      boxShadow: '0 10px 30px rgba(162,63,151,0.2)'
    }}
  >
    <div style={{ 
      fontSize: '3rem', 
      marginBottom: '10px',
      filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))'
    }}>
      {icon}
    </div>
    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>{number}</div>
    <div style={{ fontSize: '1rem', opacity: 0.95 }}>{label}</div>
  </div>
);

// Component: Action Card
const ActionCard = ({ icon, title, description, onClick, color }) => (
  <button
    onClick={onClick}
    style={{
      background: 'white',
      border: `2px solid ${color}20`,
      padding: '30px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      fontFamily: 'Cairo, sans-serif',
      boxShadow: '0 5px 20px rgba(18, 92, 122, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      width: '100%'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 15px 40px rgba(18, 92, 122, 0.15)';
      e.currentTarget.style.background = 'linear-gradient(135deg, #125c7a 0%, #a23f97 100%)';
      e.currentTarget.style.color = 'white';
      e.currentTarget.style.borderColor = 'transparent';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 5px 20px rgba(18, 92, 122, 0.08)';
      e.currentTarget.style.background = 'white';
      e.currentTarget.style.color = 'inherit';
      e.currentTarget.style.borderColor = `${color}20`;
    }}
  >
    <div style={{ fontSize: '3rem' }}>{icon}</div>
    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0, color: color }}>{title}</h3>
    <p style={{ fontSize: '0.95rem', color: '#5a7a8a', margin: 0, lineHeight: '1.5' }}>{description}</p>
  </button>
);

// Component: Patient Info Card
const PatientInfoCard = ({ patient }) => (
  <div style={{
    background: 'white',
    borderRadius: '16px',
    padding: '35px',
    marginBottom: '30px',
    boxShadow: '0 5px 20px rgba(18, 92, 122, 0.08)',
    border: '1px solid rgba(18, 92, 122, 0.1)'
  }}>
    <h2 style={{
      fontSize: '1.8rem',
      color: '#125c7a',
      marginBottom: '25px',
      fontWeight: '700',
      paddingBottom: '15px',
      borderBottom: '2px solid rgba(18, 92, 122, 0.1)'
    }}>
      بيانات المريض
    </h2>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '20px' 
    }}>
      <InfoField label="الرقم الوطني" value={patient?.nationalId} icon="🆔" />
      <InfoField label="الاسم الكامل" value={`${patient?.firstName} ${patient?.lastName}`} icon="👤" />
      <InfoField label="تاريخ الميلاد" value={patient?.dateOfBirth} icon="📅" />
      <InfoField label="الجنس" value={patient?.gender} icon="⚧" />
      <InfoField label="رقم الهاتف" value={patient?.phone} icon="📱" />
      <InfoField label="العنوان" value={patient?.address} icon="📍" />
    </div>
  </div>
);

// Component: Info Field
const InfoField = ({ label, value, icon }) => (
  <div style={{
    background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)',
    padding: '16px 20px',
    borderRadius: '10px',
    border: '1px solid rgba(18, 92, 122, 0.1)',
    transition: 'all 0.3s ease'
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.borderColor = '#a23f97';
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 5px 15px rgba(162, 63, 151, 0.1)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.borderColor = 'rgba(18, 92, 122, 0.1)';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}>
    <p style={{ 
      fontSize: '0.85rem', 
      color: '#5a7a8a', 
      marginBottom: '6px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '6px' 
    }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span> {label}
    </p>
    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#125c7a', margin: 0 }}>
      {value || '-'}
    </p>
  </div>
);

// Component: ECG Upload Section
const ECGUploadSection = ({ ecgFile, handleEcgUpload, handleAiDiagnosis, aiDiagnosis }) => (
  <div style={{
    background: 'white',
    borderRadius: '16px',
    padding: '35px',
    boxShadow: '0 5px 20px rgba(18, 92, 122, 0.08)',
    border: '1px solid rgba(18, 92, 122, 0.1)',
    height: 'fit-content'
  }}>
    <h2 style={{
      fontSize: '1.5rem',
      color: '#125c7a',
      marginBottom: '25px',
      fontWeight: '700'
    }}>
      📈 تخطيط القلب (ECG)
    </h2>
    
    <label style={{ cursor: 'pointer', display: 'block', marginBottom: '20px' }}>
      <input
        type="file"
        accept=".pdf"
        onChange={handleEcgUpload}
        style={{ display: 'none' }}
      />
      <div style={{
        border: '2px dashed rgba(162, 63, 151, 0.3)',
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = '#a23f97';
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(162,63,151,0.05) 0%, rgba(18,92,122,0.05) 100%)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'rgba(162, 63, 151, 0.3)';
        e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)';
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📄</div>
        <p style={{ fontSize: '1.1rem', color: '#125c7a', marginBottom: '5px', fontWeight: '600' }}>
          اضغط لرفع ملف ECG
        </p>
        <p style={{ fontSize: '0.9rem', color: '#5a7a8a' }}>PDF فقط</p>
        {ecgFile && (
          <div style={{
            marginTop: '15px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #a23f97 0%, #c55db3 100%)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            display: 'inline-block'
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
        width: '100%',
        background: ecgFile ? 
          'linear-gradient(135deg, #125c7a 0%, #a23f97 100%)' : 
          'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)',
        color: ecgFile ? 'white' : '#9ca3af',
        border: 'none',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: ecgFile ? 'pointer' : 'not-allowed',
        transition: 'all 0.3s ease',
        fontFamily: 'Cairo, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}
      onMouseOver={(e) => {
        if (ecgFile) {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 10px 25px rgba(162, 63, 151, 0.3)';
        }
      }}
      onMouseOut={(e) => {
        if (ecgFile) {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }
      }}
    >
      <span style={{ fontSize: '1.5rem' }}>🤖</span>
      تحليل بالذكاء الاصطناعي
    </button>
    
    {aiDiagnosis && (
      <div style={{
        marginTop: '20px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(162,63,151,0.1) 0%, rgba(18,92,122,0.1) 100%)',
        border: '2px solid #a23f97',
        borderRadius: '10px'
      }}>
        <p style={{
          color: '#125c7a',
          fontSize: '1rem',
          lineHeight: '1.8',
          whiteSpace: 'pre-line',
          margin: 0,
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
    borderRadius: '16px',
    padding: '35px',
    marginBottom: '30px',
    boxShadow: '0 5px 20px rgba(18, 92, 122, 0.08)',
    border: '1px solid rgba(18, 92, 122, 0.1)'
  }}>
    <h2 style={{
      fontSize: '1.8rem',
      color: '#125c7a',
      marginBottom: '25px',
      fontWeight: '700',
      paddingBottom: '15px',
      borderBottom: '2px solid rgba(18, 92, 122, 0.1)'
    }}>
      العلامات الحيوية
    </h2>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '20px' 
    }}>
      <VitalInput
        label="ضغط الدم (انقباضي)"
        value={vitalSigns.bloodPressureSystolic}
        onChange={(e) => setVitalSigns({...vitalSigns, bloodPressureSystolic: e.target.value})}
        unit="mmHg"
        placeholder="120"
        icon="🩺"
      />
      <VitalInput
        label="ضغط الدم (انبساطي)"
        value={vitalSigns.bloodPressureDiastolic}
        onChange={(e) => setVitalSigns({...vitalSigns, bloodPressureDiastolic: e.target.value})}
        unit="mmHg"
        placeholder="80"
        icon="🩺"
      />
      <VitalInput
        label="معدل ضربات القلب"
        value={vitalSigns.heartRate}
        onChange={(e) => setVitalSigns({...vitalSigns, heartRate: e.target.value})}
        unit="BPM"
        placeholder="72"
        icon="💓"
      />
      <VitalInput
        label="نسبة الأكسجين"
        value={vitalSigns.spo2}
        onChange={(e) => setVitalSigns({...vitalSigns, spo2: e.target.value})}
        unit="%"
        placeholder="98"
        icon="🫁"
      />
      <VitalInput
        label="مستوى السكر"
        value={vitalSigns.bloodGlucose}
        onChange={(e) => setVitalSigns({...vitalSigns, bloodGlucose: e.target.value})}
        unit="mg/dL"
        placeholder="100"
        icon="🩸"
      />
      <VitalInput
        label="درجة الحرارة"
        value={vitalSigns.temperature}
        onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
        unit="°C"
        placeholder="37"
        icon="🌡️"
      />
      <VitalInput
        label="الوزن"
        value={vitalSigns.weight}
        onChange={(e) => setVitalSigns({...vitalSigns, weight: e.target.value})}
        unit="kg"
        placeholder="70"
        icon="⚖️"
      />
    </div>
  </div>
);

// Component: Vital Input
const VitalInput = ({ label, value, onChange, unit, placeholder, icon }) => (
  <div>
    <label style={{ 
      fontSize: '0.9rem', 
      fontWeight: '600', 
      color: '#5a7a8a',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      {label}
    </label>
    <div style={{ display: 'flex', gap: '10px' }}>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: '12px 16px',
          border: '2px solid rgba(18, 92, 122, 0.15)',
          borderRadius: '8px',
          fontSize: '1rem',
          fontFamily: 'Cairo, sans-serif',
          transition: 'all 0.3s ease',
          outline: 'none',
          background: 'rgba(18, 92, 122, 0.03)'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#a23f97';
          e.target.style.background = 'rgba(162, 63, 151, 0.05)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(18, 92, 122, 0.15)';
          e.target.style.background = 'rgba(18, 92, 122, 0.03)';
        }}
      />
      <span style={{
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#a23f97',
        minWidth: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(162,63,151,0.1) 0%, rgba(18,92,122,0.1) 100%)',
        padding: '0 12px',
        borderRadius: '8px',
        border: '2px solid rgba(162, 63, 151, 0.2)'
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
    borderRadius: '16px',
    padding: '35px',
    boxShadow: '0 5px 20px rgba(18, 92, 122, 0.08)',
    border: '1px solid rgba(18, 92, 122, 0.1)',
    height: 'fit-content'
  }}>
    <h2 style={{
      fontSize: '1.5rem',
      color: '#125c7a',
      marginBottom: '25px',
      fontWeight: '700'
    }}>
      📝 رأي الطبيب والتشخيص
    </h2>
    <textarea
      value={doctorOpinion}
      onChange={(e) => setDoctorOpinion(e.target.value)}
      placeholder="اكتب رأيك الطبي والتشخيص الكامل للحالة..."
      style={{
        width: '100%',
        minHeight: '200px',
        padding: '18px',
        border: '2px solid rgba(18, 92, 122, 0.15)',
        borderRadius: '12px',
        fontSize: '1rem',
        fontFamily: 'Cairo, sans-serif',
        resize: 'vertical',
        transition: 'all 0.3s ease',
        outline: 'none',
        lineHeight: '1.8',
        background: 'rgba(18, 92, 122, 0.03)'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#a23f97';
        e.target.style.background = 'rgba(162, 63, 151, 0.05)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'rgba(18, 92, 122, 0.15)';
        e.target.style.background = 'rgba(18, 92, 122, 0.03)';
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
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl',
        position: 'relative'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          left: '20px',
          top: '20px',
          background: 'none',
          border: 'none',
          fontSize: '1.8rem',
          color: '#5a7a8a',
          cursor: 'pointer',
          fontWeight: 'bold',
          lineHeight: '1',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.color = '#a23f97';
          e.target.style.transform = 'rotate(90deg)';
        }}
        onMouseOut={(e) => {
          e.target.style.color = '#5a7a8a';
          e.target.style.transform = 'rotate(0deg)';
        }}
      >
        ×
      </button>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ 
          fontSize: '4rem', 
          marginBottom: '15px',
          background: 'linear-gradient(135deg, #125c7a 0%, #a23f97 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🔍
        </div>
        <h3 style={{ fontSize: '1.8rem', color: '#125c7a', fontWeight: '700', marginBottom: '10px' }}>
          البحث عن مريض
        </h3>
        <p style={{ color: '#5a7a8a', fontSize: '1rem' }}>أدخل الرقم الوطني للمريض</p>
      </div>

      <input
        type="text"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        placeholder="الرقم الوطني"
        style={{
          width: '100%',
          padding: '14px 18px',
          border: '2px solid rgba(18, 92, 122, 0.15)',
          borderRadius: '10px',
          fontSize: '1.1rem',
          marginBottom: '25px',
          fontFamily: 'Cairo, sans-serif',
          transition: 'all 0.3s ease',
          outline: 'none',
          background: 'rgba(18, 92, 122, 0.05)'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#a23f97';
          e.target.style.background = 'rgba(162, 63, 151, 0.08)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(18, 92, 122, 0.15)';
          e.target.style.background = 'rgba(18, 92, 122, 0.05)';
        }}
        onKeyPress={(e) => e.key === 'Enter' && handleSearchPatient()}
      />
      
      <button
        onClick={handleSearchPatient}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #125c7a 0%, #a23f97 100%)',
          color: 'white',
          border: 'none',
          padding: '14px',
          borderRadius: '10px',
          fontSize: '1.1rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: 'Cairo, sans-serif'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 10px 30px rgba(162, 63, 151, 0.3)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        بحث
      </button>
    </div>
  </div>
);

export default DoctorDashboard;