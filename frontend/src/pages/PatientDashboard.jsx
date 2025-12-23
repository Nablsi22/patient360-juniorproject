// src/pages/PatientDashboard.jsx
// ✅ AI Medical Consultation "استشيرني" - READY FOR BACKEND

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { authAPI } from '../services/api';
import '../styles/PatientDashboard.css';

/**
 * AI SERVICE CONFIG - BACKEND TEAM: Set isEnabled to true when AI is connected
 */
const AI_SERVICE_CONFIG = {
  isEnabled: false,
  apiEndpoint: '/api/ai/consultation',
  timeout: 30000
};

/**
 * ALL 20 MEDICAL SPECIALIZATIONS
 */
const MEDICAL_SPECIALIZATIONS = [
  { id: 'cardiologist', nameEn: 'Cardiologist', nameAr: 'طبيب قلب', icon: '❤️', color: '#ef4444', description: 'متخصص في تشخيص وعلاج أمراض القلب والأوعية الدموية' },
  { id: 'pulmonologist', nameEn: 'Pulmonologist', nameAr: 'طبيب أمراض الرئة', icon: '🫁', color: '#3b82f6', description: 'متخصص في أمراض الجهاز التنفسي والرئتين' },
  { id: 'general_practitioner', nameEn: 'General Practitioner', nameAr: 'طبيب عام', icon: '🩺', color: '#10b981', description: 'طبيب للفحص الشامل والتشخيص الأولي' },
  { id: 'infectious_disease', nameEn: 'Infectious Disease Specialist', nameAr: 'طبيب أمراض معدية', icon: '🦠', color: '#f59e0b', description: 'متخصص في الأمراض المعدية والعدوى' },
  { id: 'intensive_care', nameEn: 'Intensive Care Specialist', nameAr: 'طبيب عناية مركزة', icon: '🏥', color: '#dc2626', description: 'متخصص في رعاية الحالات الحرجة' },
  { id: 'rheumatologist', nameEn: 'Rheumatologist', nameAr: 'طبيب روماتيزم', icon: '🦴', color: '#8b5cf6', description: 'متخصص في أمراض المفاصل والروماتيزم' },
  { id: 'orthopedic_surgeon', nameEn: 'Orthopedic Surgeon', nameAr: 'جراح عظام', icon: '🦿', color: '#6366f1', description: 'متخصص في جراحة العظام والمفاصل' },
  { id: 'neurologist', nameEn: 'Neurologist', nameAr: 'طبيب أعصاب', icon: '🧠', color: '#ec4899', description: 'متخصص في أمراض الجهاز العصبي' },
  { id: 'endocrinologist', nameEn: 'Endocrinologist', nameAr: 'طبيب غدد صماء', icon: '⚗️', color: '#14b8a6', description: 'متخصص في أمراض الغدد والهرمونات' },
  { id: 'dermatologist', nameEn: 'Dermatologist', nameAr: 'طبيب جلدية', icon: '🧴', color: '#f97316', description: 'متخصص في أمراض الجلد والشعر' },
  { id: 'gastroenterologist', nameEn: 'Gastroenterologist', nameAr: 'طبيب جهاز هضمي', icon: '🫃', color: '#eab308', description: 'متخصص في أمراض الجهاز الهضمي' },
  { id: 'general_surgeon', nameEn: 'General Surgeon', nameAr: 'جراح عام', icon: '🔪', color: '#64748b', description: 'متخصص في العمليات الجراحية العامة' },
  { id: 'hepatologist', nameEn: 'Hepatologist', nameAr: 'طبيب كبد', icon: '🫀', color: '#a855f7', description: 'متخصص في أمراض الكبد والمرارة' },
  { id: 'urologist', nameEn: 'Urologist', nameAr: 'طبيب مسالك بولية', icon: '💧', color: '#0ea5e9', description: 'متخصص في أمراض الكلى والمسالك البولية' },
  { id: 'gynecologist', nameEn: 'Gynecologist', nameAr: 'طبيب نساء وتوليد', icon: '🤰', color: '#db2777', description: 'متخصص في صحة المرأة والحمل والولادة' },
  { id: 'psychiatrist', nameEn: 'Psychiatrist', nameAr: 'طبيب نفسي', icon: '🧘', color: '#7c3aed', description: 'متخصص في الصحة النفسية' },
  { id: 'hematologist', nameEn: 'Hematologist', nameAr: 'طبيب دم', icon: '🩸', color: '#be123c', description: 'متخصص في أمراض الدم' },
  { id: 'hematologist_oncologist', nameEn: 'Hematologist/Oncologist', nameAr: 'طبيب دم/أورام', icon: '🎗️', color: '#9333ea', description: 'متخصص في أمراض الدم والأورام' },
  { id: 'ent_specialist', nameEn: 'ENT Specialist', nameAr: 'طبيب أنف أذن حنجرة', icon: '👂', color: '#059669', description: 'متخصص في أمراض الأذن والأنف والحنجرة' },
  { id: 'ophthalmologist', nameEn: 'Ophthalmologist', nameAr: 'طبيب عيون', icon: '👁️', color: '#0284c7', description: 'متخصص في أمراض العيون' }
];

const consultationAPI = {
  analyzeSymptoms: async (symptoms) => {
    if (!AI_SERVICE_CONFIG.isEnabled) throw new Error('AI_SERVICE_NOT_ENABLED');
    const token = localStorage.getItem('token');
    const response = await fetch(AI_SERVICE_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ symptoms }),
      signal: AbortSignal.timeout(AI_SERVICE_CONFIG.timeout)
    });
    if (!response.ok) throw new Error(`API_ERROR_${response.status}`);
    return await response.json();
  },
  getSpecializationByName: (name) => MEDICAL_SPECIALIZATIONS.find(s => s.nameEn.toLowerCase() === name.toLowerCase()) || null
};

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const [visits, setVisits] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consultationResult, setConsultationResult] = useState(null);
  const [consultationError, setConsultationError] = useState(null);
  const resultRef = useRef(null);

  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim()) { setConsultationError('Please enter your symptoms'); return; }
    if (!AI_SERVICE_CONFIG.isEnabled) { setConsultationError('SERVICE_NOT_AVAILABLE'); return; }
    setIsAnalyzing(true); setConsultationError(null); setConsultationResult(null);
    try {
      const response = await consultationAPI.analyzeSymptoms(symptoms);
      if (response.success && response.data) {
        const spec = consultationAPI.getSpecializationByName(response.data.recommendedSpecialization);
        if (spec) {
          setConsultationResult({ specialization: spec, confidence: response.data.confidence, inputSymptoms: symptoms });
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        } else setConsultationError('SPECIALIZATION_NOT_FOUND');
      } else setConsultationError('INVALID_RESPONSE');
    } catch { setConsultationError('API_ERROR'); }
    finally { setIsAnalyzing(false); }
  };

  const resetConsultation = () => { setSymptoms(''); setConsultationResult(null); setConsultationError(null); };
  const openModal = (type, title, message, onConfirm = null) => setModal({ isOpen: true, type, title, message, onConfirm });
  const closeModal = () => setModal({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const handleModalConfirm = () => { if (modal.onConfirm) modal.onConfirm(); closeModal(); };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const currentUser = authAPI.getCurrentUser();
      if (!currentUser) { openModal('error', 'غير مصرح', 'يجب عليك تسجيل الدخول أولاً', () => navigate('/')); return; }
      if (currentUser.roles?.[0] !== 'patient') { openModal('error', 'غير مصرح', 'هذه الصفحة متاحة للمرضى فقط', () => navigate('/')); return; }
      setUser(currentUser); setVisits([]); setLoading(false);
    };
    loadData();
  }, [navigate]);

  const handleLogout = () => openModal('confirm', 'تأكيد تسجيل الخروج', 'هل أنت متأكد من رغبتك في تسجيل الخروج؟', () => authAPI.logout());
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
  const calculateAge = (d) => { if (!d) return null; const t = new Date(), b = new Date(d); let a = t.getFullYear() - b.getFullYear(); if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--; return a; };
  const calculateBMI = (h, w) => (h && w) ? (w / ((h/100) ** 2)).toFixed(1) : null;
  const getBMICategory = (b) => !b ? null : b < 18.5 ? 'نقص الوزن' : b < 25 ? 'وزن طبيعي' : b < 30 ? 'وزن زائد' : 'سمنة';
  const getBMICategoryClass = (b) => !b ? '' : b < 18.5 ? 'underweight' : b < 25 ? 'normal' : b < 30 ? 'overweight' : 'obese';

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>جاري التحميل...</p></div>;
  if (!user) return null;

  const age = calculateAge(user.dateOfBirth);
  const patientData = user.roleData?.patient || {};
  const bmi = calculateBMI(patientData.height, patientData.weight);
  const bmiCategory = getBMICategory(bmi);
  const bmiCategoryClass = getBMICategoryClass(parseFloat(bmi));

  return (
    <div className="patient-dashboard">
      <Navbar />
      
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className={`modal-header ${modal.type}`}>
              <div className="modal-icon">{modal.type === 'success' ? '✓' : modal.type === 'error' ? '✕' : '؟'}</div>
              <h2>{modal.title}</h2>
            </div>
            <div className="modal-body"><p>{modal.message}</p></div>
            <div className="modal-footer">
              {modal.type === 'confirm' ? (
                <><button className="modal-button secondary" onClick={closeModal}>إلغاء</button><button className="modal-button primary" onClick={handleModalConfirm}>تأكيد</button></>
              ) : <button className="modal-button primary" onClick={modal.onConfirm ? handleModalConfirm : closeModal}>حسناً</button>}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-container">
        <div className="welcome-header">
          <div className="welcome-content">
            <h1>مرحباً {user.firstName} {user.lastName} 👋</h1>
            <p>لوحة تحكم المريض - Patient 360°</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>تسجيل الخروج 🚪</button>
        </div>

        <div className="dashboard-tabs">
          {['overview', 'visits', 'consultation', 'medications'].map(section => (
            <button key={section} className={`tab-btn ${activeSection === section ? 'active' : ''}`} onClick={() => setActiveSection(section)}>
              <span className="tab-icon">{section === 'overview' ? '📊' : section === 'visits' ? '📋' : section === 'consultation' ? '🤖' : '💊'}</span>
              {section === 'overview' ? 'نظرة عامة' : section === 'visits' ? 'سجل الزيارات' : section === 'consultation' ? 'استشيرني' : 'تقويم الأدوية'}
            </button>
          ))}
        </div>

        {activeSection === 'overview' && (
          <div className="section-content">
            <div className="profile-header-card">
              <div className="profile-avatar">
                <div className="avatar-circle"><span>{user.gender === 'male' ? '👨' : '👩'}</span></div>
                <div className="avatar-badge"><span>✓</span></div>
              </div>
              <div className="profile-header-info">
                <h1>{user.firstName} {user.lastName}</h1>
                <p className="profile-role">مريض - Patient 360°</p>
                <div className="profile-meta-info">
                  {age && <div className="meta-item"><span>🎂</span><span>{age} سنة</span></div>}
                  {user.gender && <div className="meta-item"><span>{user.gender === 'male' ? '♂️' : '♀️'}</span><span>{user.gender === 'male' ? 'ذكر' : 'أنثى'}</span></div>}
                  {patientData.bloodType && <div className="meta-item"><span>🩸</span><span>{patientData.bloodType}</span></div>}
                </div>
              </div>
            </div>

            <div className="quick-stats-grid">
              <div className="quick-stat-card visits"><div className="stat-icon-wrapper"><span>📋</span></div><div className="stat-content"><h3>{visits.length}</h3><p>زيارة طبية</p></div></div>
              {bmi && <div className={`quick-stat-card bmi ${bmiCategoryClass}`}><div className="stat-icon-wrapper"><span>⚖️</span></div><div className="stat-content"><h3>{bmi}</h3><p>مؤشر كتلة الجسم</p><span className={`stat-badge ${bmiCategoryClass}`}>{bmiCategory}</span></div></div>}
            </div>

            <div className="data-section">
              <div className="section-header"><div className="section-title-wrapper"><span className="section-icon">👤</span><h2>المعلومات الشخصية</h2></div></div>
              <div className="info-cards-grid">
                <div className="info-display-card"><div className="card-icon-header"><div className="icon-circle email"><span>✉️</span></div><h3>البريد الإلكتروني</h3></div><p className="card-value" dir="ltr">{user.email}</p></div>
                <div className="info-display-card"><div className="card-icon-header"><div className="icon-circle phone"><span>📱</span></div><h3>رقم الهاتف</h3></div><p className="card-value" dir="ltr">{user.phoneNumber || 'غير محدد'}</p></div>
                <div className="info-display-card"><div className="card-icon-header"><div className="icon-circle id"><span>🆔</span></div><h3>رقم الهوية</h3></div><p className="card-value">{user.nationalId || 'غير محدد'}</p></div>
                <div className="info-display-card"><div className="card-icon-header"><div className="icon-circle birth"><span>🎂</span></div><h3>تاريخ الميلاد</h3></div><p className="card-value">{formatDate(user.dateOfBirth)}</p></div>
                {user.address && <div className="info-display-card full-width"><div className="card-icon-header"><div className="icon-circle address"><span>📍</span></div><h3>العنوان</h3></div><p className="card-value">{user.address}</p></div>}
              </div>
            </div>

            {(patientData.bloodType || patientData.height || patientData.weight) && (
              <div className="data-section">
                <div className="section-header"><div className="section-title-wrapper"><span className="section-icon">🏥</span><h2>المعلومات الطبية</h2></div></div>
                <div className="medical-info-grid">
                  {patientData.bloodType && <div className="medical-card"><div className="medical-card-header"><div className="medical-icon">🩸</div><h3>فصيلة الدم</h3></div><div className="medical-value-large">{patientData.bloodType}</div></div>}
                  {patientData.height && <div className="medical-card"><div className="medical-card-header"><div className="medical-icon">📏</div><h3>الطول</h3></div><div className="medical-value-large">{patientData.height}</div><div className="medical-unit">سم</div></div>}
                  {patientData.weight && <div className="medical-card"><div className="medical-card-header"><div className="medical-icon">⚖️</div><h3>الوزن</h3></div><div className="medical-value-large">{patientData.weight}</div><div className="medical-unit">كجم</div></div>}
                </div>
              </div>
            )}

            <div className="data-section">
              <div className="section-header"><div className="section-title-wrapper"><span className="section-icon">📜</span><h2>السجل الصحي</h2></div></div>
              <div className="health-history-grid">
                <div className="history-card allergies-card">
                  <div className="history-header"><div className="history-icon">⚠️</div><h3>الحساسية</h3><span className="count-badge">{patientData.allergies?.length || 0}</span></div>
                  {patientData.allergies?.length > 0 ? <ul className="history-list">{patientData.allergies.map((a, i) => <li key={i} className="history-item"><span>•</span><span>{a}</span></li>)}</ul> : <div className="no-data-message"><span>✓</span><p>لا توجد حساسية مسجلة</p></div>}
                </div>
                <div className="history-card diseases-card">
                  <div className="history-header"><div className="history-icon">🏥</div><h3>الأمراض المزمنة</h3><span className="count-badge">{patientData.chronicDiseases?.length || 0}</span></div>
                  {patientData.chronicDiseases?.length > 0 ? <ul className="history-list">{patientData.chronicDiseases.map((d, i) => <li key={i} className="history-item"><span>•</span><span>{d}</span></li>)}</ul> : <div className="no-data-message"><span>✓</span><p>لا توجد أمراض مزمنة</p></div>}
                </div>
                <div className="history-card family-card">
                  <div className="history-header"><div className="history-icon">👨‍👩‍👧‍👦</div><h3>التاريخ العائلي</h3><span className="count-badge">{patientData.familyHistory?.length || 0}</span></div>
                  {patientData.familyHistory?.length > 0 ? <ul className="history-list">{patientData.familyHistory.map((h, i) => <li key={i} className="history-item"><span>•</span><span>{h}</span></li>)}</ul> : <div className="no-data-message"><span>✓</span><p>لا يوجد تاريخ عائلي مسجل</p></div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'visits' && (
          <div className="section-content">
            <div className="card">
              <div className="card-header"><h2>سجل الزيارات الطبية</h2></div>
              <div className="empty-state"><div className="empty-icon">📋</div><h3>لا توجد زيارات</h3><p>سيتم عرض زياراتك الطبية هنا بعد مراجعة الطبيب</p></div>
            </div>
          </div>
        )}

        {activeSection === 'consultation' && (
          <div className="section-content">
            <div className="consultation-main-container">
              <div className="consultation-page-header">
                <div className="consultation-header-content">
                  <div className="consultation-icon-box"><span className="ai-icon">🤖</span><div className="ai-pulse-ring"></div></div>
                  <div className="consultation-header-text"><h1>استشيرني</h1><p>AI Medical Consultation Assistant</p></div>
                </div>
                <div className="consultation-header-badge"><span>🏥</span><span>{MEDICAL_SPECIALIZATIONS.length} تخصص طبي</span></div>
              </div>

              {!AI_SERVICE_CONFIG.isEnabled && (
                <div className="service-development-section">
                  <div className="development-banner">
                    <div className="dev-animation-container">
                      <div className="dev-icon">🚧</div>
                      <div className="dev-circles"><span></span><span></span><span></span></div>
                    </div>
                    <div className="dev-content">
                      <h2>الخدمة قيد التطوير</h2>
                      <p className="dev-subtitle">Service Under Development</p>
                      <p className="dev-description">نعمل حالياً على ربط نموذج الذكاء الاصطناعي بهذه الخدمة. سيتم تفعيلها قريباً لمساعدتك في تحديد التخصص الطبي المناسب.</p>
                      <div className="dev-features">
                        <div className="dev-feature"><span>✨</span><span>تحليل الأعراض بالذكاء الاصطناعي</span></div>
                        <div className="dev-feature"><span>🎯</span><span>توصيات دقيقة للتخصص الطبي</span></div>
                        <div className="dev-feature"><span>⚡</span><span>نتائج فورية وموثوقة</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="input-preview-disabled">
                    <div className="preview-header"><span>💬</span><h3>Describe Your Symptoms</h3><span className="coming-soon-tag">قريباً</span></div>
                    <div className="preview-input-area">
                      <textarea disabled placeholder="Enter your symptoms in English... (Coming Soon)"></textarea>
                      <button disabled><span>🔍</span><span>Analyze</span></button>
                    </div>
                  </div>
                </div>
              )}

              {AI_SERVICE_CONFIG.isEnabled && (
                <>
                  <div className="consultation-disclaimer-banner">
                    <span>⚠️</span>
                    <p><strong>Important:</strong> This service provides guidance only and does not replace professional medical consultation.</p>
                  </div>
                  <div className="symptoms-input-card">
                    <div className="input-card-header"><span>💬</span><div><h3>Describe Your Symptoms</h3><p>صف أعراضك باللغة الإنجليزية</p></div></div>
                    <div className="input-card-body">
                      <textarea className="symptoms-textarea-main" placeholder="Enter your symptoms in English..." value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={4} disabled={isAnalyzing} dir="ltr" />
                      <div className="input-actions">
                        {consultationResult && <button className="reset-btn" onClick={resetConsultation}><span>🔄</span><span>استشارة جديدة</span></button>}
                        <button className="analyze-main-btn" onClick={handleAnalyzeSymptoms} disabled={!symptoms.trim() || isAnalyzing}>
                          {isAnalyzing ? <><span className="spinner"></span><span>Analyzing...</span></> : <><span>🔍</span><span>Analyze Symptoms</span></>}
                        </button>
                      </div>
                    </div>
                    {consultationError && <div className="consultation-error-message"><span>❌</span><p>{consultationError === 'SERVICE_NOT_AVAILABLE' ? 'Service unavailable.' : 'An error occurred.'}</p></div>}
                  </div>
                  {consultationResult && (
                    <div className="consultation-result-card" ref={resultRef}>
                      <div className="result-card-header"><div className="result-success-icon">✅</div><div><h3>Recommended Specialist</h3><p>التخصص الطبي الموصى به</p></div></div>
                      <div className="result-card-body">
                        <div className="result-specialization-card" style={{ borderColor: consultationResult.specialization.color }}>
                          <div className="result-spec-icon" style={{ background: `${consultationResult.specialization.color}20` }}><span>{consultationResult.specialization.icon}</span></div>
                          <div className="result-spec-info">
                            <h4>{consultationResult.specialization.nameAr}</h4>
                            <p className="result-spec-en">{consultationResult.specialization.nameEn}</p>
                            <p className="result-spec-desc">{consultationResult.specialization.description}</p>
                          </div>
                        </div>
                        {consultationResult.confidence && (
                          <div className="confidence-display">
                            <span>Confidence:</span>
                            <div className="conf-bar-container"><div className="conf-bar-fill" style={{ width: `${consultationResult.confidence * 100}%`, background: consultationResult.specialization.color }}></div></div>
                            <span>{Math.round(consultationResult.confidence * 100)}%</span>
                          </div>
                        )}
                        <div className="result-symptoms-ref"><span>💡</span><div><strong>Based on:</strong><p>"{consultationResult.inputSymptoms}"</p></div></div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="all-specializations-section">
                <div className="specializations-section-header">
                  <div className="spec-section-title"><span>🏥</span><div><h2>التخصصات الطبية المتاحة</h2><p>All Available Medical Specializations</p></div></div>
                  <div className="spec-count-badge"><span className="count-num">{MEDICAL_SPECIALIZATIONS.length}</span><span>تخصص</span></div>
                </div>
                <div className="specializations-elegant-grid">
                  {MEDICAL_SPECIALIZATIONS.map((spec, i) => (
                    <div key={spec.id} className="spec-elegant-card" style={{ '--spec-color': spec.color, '--delay': `${i * 0.03}s` }}>
                      <div className="spec-card-top-accent" style={{ background: spec.color }}></div>
                      <div className="spec-card-content">
                        <div className="spec-icon-wrapper" style={{ background: `${spec.color}15` }}><span>{spec.icon}</span></div>
                        <div className="spec-text-content"><h4>{spec.nameAr}</h4><p>{spec.nameEn}</p></div>
                      </div>
                      <div className="spec-hover-description"><p>{spec.description}</p></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="how-service-works">
                <div className="how-works-header"><span>📖</span><div><h3>كيف تعمل الخدمة؟</h3><p>How does it work?</p></div></div>
                <div className="how-steps-container">
                  <div className="how-step-item"><div className="step-num-circle"><span>1</span></div><div className="step-info"><h4>Describe Symptoms</h4><p>وصف الأعراض</p></div></div>
                  <div className="step-arrow">→</div>
                  <div className="how-step-item"><div className="step-num-circle"><span>2</span></div><div className="step-info"><h4>AI Analysis</h4><p>تحليل الذكاء الاصطناعي</p></div></div>
                  <div className="step-arrow">→</div>
                  <div className="how-step-item"><div className="step-num-circle"><span>3</span></div><div className="step-info"><h4>Get Recommendation</h4><p>الحصول على التوصية</p></div></div>
                </div>
              </div>

              <div className="important-notice-box">
                <div className="notice-icon-wrap">⚠️</div>
                <div className="notice-content">
                  <h4>تنبيه هام / Important Notice</h4>
                  <p>هذه الخدمة استرشادية فقط ولا تغني عن الاستشارة الطبية المباشرة. في حالة الطوارئ، توجه لأقرب مستشفى فوراً.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'medications' && (
          <div className="section-content">
            <div className="card">
              <div className="card-header"><h2>💊 تقويم الأدوية</h2></div>
              <div className="empty-state"><div className="empty-icon">💊</div><h3>لا توجد أدوية</h3><p>سيتم عرض الأدوية الموصوفة هنا بعد زيارة الطبيب</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
