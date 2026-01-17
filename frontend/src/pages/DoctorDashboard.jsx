// src/pages/DoctorDashboard.jsx
// ✅ REDESIGNED v3.0 - Matching PatientDashboard Design System
// Patient 360° - Government Healthcare Platform
// Features:
// - Professional profile header card with logout button
// - Photo upload in visit logs
// - Redesigned ECG AI output with professional cards
// - Tab-based navigation with patient history
// - Purple accent color (#a23f97) theme
// - Full responsive design

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { logout as logoutService } from '../services/authService';
import '../styles/DoctorDashboard.css';

/**
 * ============================================
 * ECG CONDITION DESCRIPTIONS
 * ============================================
 * Maps ECG conditions to Arabic descriptions and severity levels
 */
const ECG_CONDITIONS = {
  'Normal': {
    nameAr: 'تخطيط طبيعي',
    description: 'تخطيط القلب الكهربائي ضمن الحدود الطبيعية. لا توجد علامات على اضطرابات في النظم أو نقص التروية.',
    severity: 'normal',
    icon: '✅',
    recommendations: [
      'متابعة نمط الحياة الصحي',
      'ممارسة الرياضة بانتظام',
      'فحص دوري كل سنة'
    ]
  },
  'Myocardial Infarction': {
    nameAr: 'احتشاء عضلة القلب',
    description: 'علامات تدل على نوبة قلبية حادة أو سابقة. يتطلب تدخلاً طبياً فورياً.',
    severity: 'critical',
    icon: '🚨',
    recommendations: [
      'تدخل طبي طارئ فوري',
      'قسطرة قلبية تشخيصية',
      'مراقبة في العناية المركزة القلبية'
    ]
  },
  'ST/T change': {
    nameAr: 'تغيرات ST/T',
    description: 'تغيرات في مقطع ST أو موجة T قد تشير إلى نقص تروية أو اضطرابات في القلب.',
    severity: 'warning',
    icon: '⚠️',
    recommendations: [
      'فحوصات إضافية مطلوبة',
      'اختبار الجهد',
      'متابعة دورية'
    ]
  },
  'Conduction Disturbance': {
    nameAr: 'اضطراب التوصيل',
    description: 'اضطراب في نظام التوصيل الكهربائي للقلب مثل إحصار الحزمة أو إحصار أذيني بطيني.',
    severity: 'warning',
    icon: '🔌',
    recommendations: [
      'تقييم شامل للقلب',
      'هولتر مراقبة 24 ساعة',
      'استشارة كهربية القلب'
    ]
  },
  'Hypertrophy': {
    nameAr: 'تضخم القلب',
    description: 'علامات تدل على تضخم في عضلة القلب، قد يكون نتيجة ارتفاع ضغط الدم أو أمراض صمامية.',
    severity: 'warning',
    icon: '💪',
    recommendations: [
      'إيكو القلب',
      'مراقبة ضغط الدم',
      'تقييم أسباب التضخم'
    ]
  }
};

/**
 * ============================================
 * ECG CLASS LABELS - For mapping backend response
 * ============================================
 * The order must match the model's output classes
 */
const ECG_CLASS_LABELS = [
  'Normal',
  'Myocardial Infarction',
  'ST/T change',
  'Conduction Disturbance',
  'Hypertrophy'
];

/**
 * ============================================
 * ECG RESULT CARD COMPONENT
 * ============================================
 * Beautiful card design for ECG analysis results
 */
const ECGResultCard = ({ result }) => {
  const condition = ECG_CONDITIONS[result.prediction] || {
    nameAr: result.prediction,
    description: 'تم تحليل تخطيط القلب بواسطة الذكاء الاصطناعي.',
    severity: 'info',
    icon: '🔬',
    recommendations: ['مراجعة الطبيب للتقييم النهائي']
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'warning': return 'severity-warning';
      case 'normal': return 'severity-normal';
      default: return 'severity-info';
    }
  };

  return (
    <div className="ecg-result-modern">
      {/* Header with Main Diagnosis */}
      <div className={`ecg-result-header ${getSeverityClass(condition.severity)}`}>
        <div className="result-header-icon">
          <span>{condition.icon}</span>
        </div>
        <div className="result-header-content">
          <div className="result-header-label">التشخيص الرئيسي</div>
          <h2 className="result-diagnosis-title">{condition.nameAr}</h2>
          <p className="result-diagnosis-en">{result.prediction}</p>
        </div>
        <div className="result-confidence-badge">
          <div className="confidence-circle">
            <svg viewBox="0 0 36 36">
              <path
                className="confidence-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="confidence-progress"
                strokeDasharray={`${parseFloat(result.confidence_percentage) || 0}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="confidence-text">{result.confidence_percentage}</span>
          </div>
          <span className="confidence-label">نسبة الثقة</span>
        </div>
      </div>

      {/* Description Card */}
      <div className="ecg-description-card">
        <div className="description-icon">📋</div>
        <div className="description-content">
          <h4>شرح التشخيص</h4>
          <p>{condition.description}</p>
        </div>
      </div>

      {/* Top Predictions Grid */}
      <div className="ecg-predictions-section">
        <div className="predictions-header">
          <span className="predictions-icon">📊</span>
          <h3>أعلى الاحتمالات</h3>
        </div>
        <div className="predictions-grid">
          {result.top_predictions && result.top_predictions.map((pred, index) => (
            <div key={index} className={`prediction-card ${index === 0 ? 'primary' : ''}`}>
              <div className="prediction-rank">
                <span>{index + 1}</span>
              </div>
              <div className="prediction-content">
                <h4>{pred.label}</h4>
                <div className="prediction-bar-container">
                  <div 
                    className="prediction-bar" 
                    style={{ width: pred.percentage }}
                  ></div>
                </div>
                <span className="prediction-percentage">{pred.percentage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="ecg-recommendations-section">
        <div className="recommendations-header">
          <span className="recommendations-icon">💡</span>
          <h3>التوصيات الطبية</h3>
        </div>
        <div className="recommendations-list">
          {condition.recommendations.map((rec, index) => (
            <div key={index} className="recommendation-item">
              <span className="rec-number">{index + 1}</span>
              <span className="rec-text">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Banner if Critical */}
      {result.warning && (
        <div className="ecg-warning-banner">
          <span className="warning-icon">⚠️</span>
          <div className="warning-content">
            <h4>تحذير مهم</h4>
            <p>{result.warning}</p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="ecg-disclaimer">
        <span className="disclaimer-icon">ℹ️</span>
        <p>
          <strong>ملاحظة:</strong> هذه النتائج استرشادية من الذكاء الاصطناعي ولا تغني عن التقييم السريري الشامل والخبرة الطبية المباشرة.
        </p>
      </div>
    </div>
  );
};

/**
 * ============================================
 * PHOTO PREVIEW COMPONENT
 * ============================================
 * Displays uploaded photo with remove option
 */
const PhotoPreview = ({ photo, onRemove }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (photo && photo instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(photo);
    }
    return () => setPreviewUrl(null);
  }, [photo]);

  if (!previewUrl) return null;

  return (
    <div className="photo-preview-container">
      <img src={previewUrl} alt="معاينة الصورة" className="photo-preview-image" />
      <button className="remove-photo-btn" onClick={onRemove} title="إزالة الصورة">
        <span>✕</span>
      </button>
    </div>
  );
};

/**
 * ============================================
 * MAIN DOCTOR DASHBOARD COMPONENT
 * ============================================
 */
const DoctorDashboard = () => {
  const navigate = useNavigate();

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  // User State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Search State
  const [searchType, setSearchType] = useState('adult');
  const [nationalId, setNationalId] = useState('');
  const [childId, setChildId] = useState('');
  const [searching, setSearching] = useState(false);
  
  // Patient State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Active Section
  const [activeSection, setActiveSection] = useState('info');
  
  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  
  // ECG State (Cardiologists Only)
  const [ecgFile, setEcgFile] = useState(null);
  const [ecgPreview, setEcgPreview] = useState(null);
  const [ecgAnalyzing, setEcgAnalyzing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const ecgFileInputRef = useRef(null);
  const resultRef = useRef(null);
  
  // Visit Form State
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: ''
  });
  const [medications, setMedications] = useState([]);
  const [newMedication, setNewMedication] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  const [saving, setSaving] = useState(false);
  
  // Photo State
  const [visitPhoto, setVisitPhoto] = useState(null);
  const photoInputRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  const openModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const isCardiologist = useCallback(() => {
    if (!user) return false;
    const spec = user.specialization?.toLowerCase() || '';
    return spec.includes('cardio') || spec.includes('قلب') || spec.includes('cardiolog');
  }, [user]);

  const resetFormFields = () => {
    setChiefComplaint('');
    setDiagnosis('');
    setDoctorNotes('');
    setVitalSigns({
      bloodPressure: { systolic: '', diastolic: '' },
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: ''
    });
    setMedications([]);
    setNewMedication({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
    setVisitPhoto(null);
    setEcgFile(null);
    setEcgPreview(null);
    setAiDiagnosis(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (ecgFileInputRef.current) ecgFileInputRef.current.value = '';
  };

  // ═══════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'doctor') {
        navigate('/login');
        return;
      }
      setUser(parsedUser);
    } catch (err) {
      console.error('Error parsing user:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ═══════════════════════════════════════════════════════════════
  // PATIENT SEARCH
  // ═══════════════════════════════════════════════════════════════

  const handleSearch = async () => {
    const idToSearch = searchType === 'adult' ? nationalId : childId;
    
    if (!idToSearch.trim()) {
      openModal('error', 'خطأ', 'الرجاء إدخال رقم الهوية');
      return;
    }
    
    setSearching(true);
    setSelectedPatient(null);
    setPatientHistory([]);
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = searchType === 'adult'
        ? `http://localhost:5000/api/doctor/patient/${idToSearch}`
        : `http://localhost:5000/api/doctor/child/${idToSearch}`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSelectedPatient(data.patient);
        openModal('success', 'تم العثور', `تم العثور على بيانات المريض: ${data.patient.fullName}`);
        fetchPatientHistory(idToSearch);
      } else {
        openModal('error', 'خطأ', data.message || 'لم يتم العثور على المريض');
      }
    } catch (error) {
      console.error('Search error:', error);
      openModal('error', 'خطأ', 'حدث خطأ في البحث');
    } finally {
      setSearching(false);
    }
  };

  const fetchPatientHistory = async (patientId) => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/doctor/patient/${patientId}/visits`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPatientHistory(data.visits || []);
      }
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setPatientHistory([]);
    setNationalId('');
    setChildId('');
    resetFormFields();
    setActiveSection('info');
  };

  // ═══════════════════════════════════════════════════════════════
  // PHOTO HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        openModal('error', 'خطأ', 'حجم الصورة يجب أن لا يتجاوز 10MB');
        return;
      }
      setVisitPhoto(file);
    }
  };

  const handleRemovePhoto = () => {
    setVisitPhoto(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════════════════════════

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ECG HANDLERS (Cardiologists Only)
  // ═══════════════════════════════════════════════════════════════

  const handleEcgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEcgFile(file);
      setAiDiagnosis(null);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEcgPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setEcgPreview(null);
      }
    }
  };

  const handleRemoveEcg = () => {
    setEcgFile(null);
    setEcgPreview(null);
    setAiDiagnosis(null);
    if (ecgFileInputRef.current) {
      ecgFileInputRef.current.value = '';
    }
  };

  const handleAiDiagnosis = async () => {
    if (!ecgFile) return;
    
    setEcgAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('ecg_image', ecgFile);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ecg/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // ═══════════════════════════════════════════════════════════════
        // FIX: Process top_predictions to include proper disease labels
        // ═══════════════════════════════════════════════════════════════
        let processedData = { ...data };
        
        if (data.top_predictions && Array.isArray(data.top_predictions)) {
          processedData.top_predictions = data.top_predictions.map((pred, index) => {
            // Case 1: Backend returns array of numbers (probabilities)
            if (typeof pred === 'number') {
              const percentage = (pred * 100).toFixed(2) + '%';
              return {
                label: ECG_CLASS_LABELS[index] || `Class ${index + 1}`,
                percentage: percentage
              };
            }
            // Case 2: Backend returns array of strings (percentages without labels)
            else if (typeof pred === 'string') {
              return {
                label: ECG_CLASS_LABELS[index] || `Class ${index + 1}`,
                percentage: pred.includes('%') ? pred : pred + '%'
              };
            }
            // Case 3: Backend returns objects with percentage but no label
            else if (typeof pred === 'object' && pred !== null) {
              // If label is missing or empty, add it from ECG_CLASS_LABELS
              if (!pred.label || pred.label.trim() === '') {
                return {
                  ...pred,
                  label: ECG_CLASS_LABELS[index] || `Class ${index + 1}`,
                  percentage: pred.percentage || pred.prob || pred.confidence || '0%'
                };
              }
              // If label exists, ensure percentage is properly formatted
              return {
                label: pred.label,
                percentage: pred.percentage || pred.prob || pred.confidence || '0%'
              };
            }
            // Fallback
            return {
              label: ECG_CLASS_LABELS[index] || `Class ${index + 1}`,
              percentage: '0%'
            };
          });
          
          // Sort by percentage (descending) to show highest probability first
          processedData.top_predictions.sort((a, b) => {
            const percentA = parseFloat(a.percentage) || 0;
            const percentB = parseFloat(b.percentage) || 0;
            return percentB - percentA;
          });
        }
        // ═══════════════════════════════════════════════════════════════
        // END FIX
        // ═══════════════════════════════════════════════════════════════
        
        setAiDiagnosis(processedData);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        openModal('error', 'خطأ', data.message || 'حدث خطأ في تحليل تخطيط القلب');
      }
    } catch (error) {
      console.error('ECG analysis error:', error);
      openModal('error', 'خطأ', 'حدث خطأ في الاتصال بخدمة التحليل');
    } finally {
      setEcgAnalyzing(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // MEDICATION HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleAddMedication = () => {
    if (!newMedication.medicationName.trim()) {
      openModal('error', 'خطأ', 'الرجاء إدخال اسم الدواء');
      return;
    }
    
    setMedications([...medications, { ...newMedication, id: Date.now() }]);
    setNewMedication({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
  };

  const handleRemoveMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  // ═══════════════════════════════════════════════════════════════
  // SAVE VISIT
  // ═══════════════════════════════════════════════════════════════

  const handleSaveVisit = async () => {
    if (!chiefComplaint.trim()) {
      openModal('error', 'خطأ', 'الرجاء إدخال الشكوى الرئيسية');
      return;
    }
    
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const nationalId = selectedPatient.nationalId || selectedPatient.childId;
      
      const formData = new FormData();
      formData.append('chiefComplaint', chiefComplaint);
      formData.append('diagnosis', diagnosis);
      formData.append('doctorNotes', doctorNotes);
      formData.append('vitalSigns', JSON.stringify(vitalSigns));
      formData.append('prescribedMedications', JSON.stringify(medications));
      
      if (visitPhoto) {
        formData.append('visitPhoto', visitPhoto);
      }
      
      if (aiDiagnosis && isCardiologist()) {
        formData.append('ecgAnalysis', JSON.stringify(aiDiagnosis));
      }
      
      console.log('📤 Sending visit data with photo...');
      console.log('🆔 Patient national ID:', nationalId);
      
      const response = await fetch(`http://localhost:5000/api/doctor/patient/${nationalId}/visit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', data);
      
      if (response.ok && data.success) {
        openModal('success', 'تم الحفظ', 'تم حفظ بيانات الزيارة بنجاح ✅');
        
        try {
          const historyResponse = await fetch(`http://localhost:5000/api/doctor/patient/${nationalId}/visits`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            if (historyData.success) {
              setPatientHistory(historyData.visits || []);
            }
          }
        } catch (err) {
          console.error('Error refreshing history:', err);
        }
        
        resetFormFields();
        setActiveSection('history');
        
      } else {
        openModal('error', 'خطأ', data.message || 'حدث خطأ في حفظ البيانات');
      }
      
    } catch (error) {
      console.error('❌ Error saving visit:', error);
      openModal('error', 'خطأ', 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!user) return null;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="doctor-dashboard">
      <Navbar />
      
      {/* Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className={`modal-header ${modal.type}`}>
              <div className="modal-icon">
                {modal.type === 'success' ? '✓' : modal.type === 'error' ? '✕' : '؟'}
              </div>
              <h2>{modal.title}</h2>
            </div>
            <div className="modal-body">
              <p>{modal.message}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-close-btn" onClick={closeModal}>حسناً</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="dashboard-container">
        
        {/* ═══════════════════════════════════════════════════════════════
            PROFILE HEADER CARD
            ═══════════════════════════════════════════════════════════════ */}
        <div className="profile-header-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <span>👨‍⚕️</span>
            </div>
            <div className="profile-info">
              <h1>{user.fullName}</h1>
              <span className="profile-role">
                {user.specialization || 'طبيب'} 
                {isCardiologist() && <span className="cardio-badge">❤️ أخصائي قلب</span>}
              </span>
            </div>
          </div>
          <div className="profile-meta">
            <div className="meta-item">
              <span className="meta-icon">🆔</span>
              <span className="meta-label">رقم الترخيص</span>
              <span className="meta-value">{user.licenseNumber || '-'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">🏥</span>
              <span className="meta-label">المستشفى</span>
              <span className="meta-value">{user.hospital || '-'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SEARCH SECTION
            ═══════════════════════════════════════════════════════════════ */}
        <div className="search-section-card">
          <div className="search-header">
            <h2>🔍 البحث عن مريض</h2>
          </div>
          
          <div className="search-type-toggle">
            <button 
              className={`toggle-btn ${searchType === 'adult' ? 'active' : ''}`}
              onClick={() => setSearchType('adult')}
            >
              <span>👤</span> بالغ
            </button>
            <button 
              className={`toggle-btn ${searchType === 'child' ? 'active' : ''}`}
              onClick={() => setSearchType('child')}
            >
              <span>👶</span> طفل
            </button>
          </div>

          <div className="search-input-group">
            {searchType === 'adult' ? (
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="أدخل الرقم الوطني (11 رقم)"
                maxLength={11}
                className="search-input"
              />
            ) : (
              <input
                type="text"
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                placeholder="أدخل رقم هوية الطفل"
                className="search-input"
              />
            )}
            <button 
              className={`search-btn ${searching ? 'searching' : ''}`}
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <><span className="spinner"></span><span>جاري البحث...</span></>
              ) : (
                <><span>🔍</span><span>بحث</span></>
              )}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            PATIENT DATA SECTION
            ═══════════════════════════════════════════════════════════════ */}
        {selectedPatient && (
          <>
            {/* Patient Header */}
            <div className="patient-header-card">
              <div className="patient-avatar">
                <span>{selectedPatient.gender === 'أنثى' ? '👩' : '👨'}</span>
              </div>
              <div className="patient-main-info">
                <h2>{selectedPatient.fullName}</h2>
                <div className="patient-badges">
                  <span className="badge">{selectedPatient.nationalId || selectedPatient.childId}</span>
                  <span className="badge">{selectedPatient.gender}</span>
                  <span className="badge">{selectedPatient.bloodType || 'غير محدد'}</span>
                </div>
              </div>
              <button className="clear-patient-btn" onClick={handleClearPatient}>
                <span>✕</span>
                <span>إنهاء المعاينة</span>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="tabs-container">
              <div className="tabs-navigation">
                <button 
                  className={`tab-btn ${activeSection === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveSection('info')}
                >
                  <span>📋</span>
                  <span>المعلومات</span>
                </button>
                <button 
                  className={`tab-btn ${activeSection === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveSection('history')}
                >
                  <span>📜</span>
                  <span>السجل الطبي</span>
                  {patientHistory.length > 0 && (
                    <span className="tab-badge">{patientHistory.length}</span>
                  )}
                </button>
                <button 
                  className={`tab-btn ${activeSection === 'visit' ? 'active' : ''}`}
                  onClick={() => setActiveSection('visit')}
                >
                  <span>✏️</span>
                  <span>زيارة جديدة</span>
                </button>
                {isCardiologist() && (
                  <button 
                    className={`tab-btn ecg-tab ${activeSection === 'ecg' ? 'active' : ''}`}
                    onClick={() => setActiveSection('ecg')}
                  >
                    <span>❤️</span>
                    <span>تحليل ECG</span>
                  </button>
                )}
              </div>

              {/* ═══════════════════════════════════════════════════════════════
                  INFO TAB
                  ═══════════════════════════════════════════════════════════════ */}
              {activeSection === 'info' && (
                <div className="tab-content-container">
                  {/* Personal Info */}
                  <div className="info-section">
                    <div className="section-header">
                      <span>👤</span>
                      <h3>المعلومات الشخصية</h3>
                    </div>
                    <div className="info-grid">
                      <InfoCard icon="📛" title="الاسم الكامل" value={selectedPatient.fullName} />
                      <InfoCard icon="🆔" title="رقم الهوية" value={selectedPatient.nationalId || selectedPatient.childId} dir="ltr" />
                      <InfoCard icon="📅" title="تاريخ الميلاد" value={selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString('ar-SY') : '-'} />
                      <InfoCard icon="⚧️" title="الجنس" value={selectedPatient.gender} />
                      <InfoCard icon="🩸" title="فصيلة الدم" value={selectedPatient.bloodType || 'غير محدد'} />
                      <InfoCard icon="📱" title="رقم الهاتف" value={selectedPatient.phoneNumber} dir="ltr" />
                      <InfoCard icon="📍" title="العنوان" value={selectedPatient.address} fullWidth />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  {selectedPatient.emergencyContact && (
                    <div className="info-section">
                      <div className="section-header emergency">
                        <span>🚨</span>
                        <h3>جهة الاتصال الطارئة</h3>
                      </div>
                      <div className="info-grid">
                        <InfoCard icon="👤" title="الاسم" value={selectedPatient.emergencyContact.name} />
                        <InfoCard icon="👨‍👩‍👧" title="صلة القرابة" value={selectedPatient.emergencyContact.relationship} />
                        <InfoCard icon="📱" title="رقم الهاتف" value={selectedPatient.emergencyContact.phone} dir="ltr" />
                      </div>
                    </div>
                  )}

                  {/* Alerts Section */}
                  <div className="alerts-section">
                    <AlertCard 
                      type="danger"
                      icon="⚠️"
                      title="الحساسية"
                      items={selectedPatient.allergies}
                      emptyMessage="لا توجد حساسية مسجلة"
                    />
                    <AlertCard 
                      type="warning"
                      icon="💊"
                      title="الأمراض المزمنة"
                      items={selectedPatient.chronicDiseases}
                      emptyMessage="لا توجد أمراض مزمنة"
                    />
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════
                  HISTORY TAB
                  ═══════════════════════════════════════════════════════════════ */}
              {activeSection === 'history' && (
                <div className="tab-content-container">
                  <div className="history-section">
                    <div className="section-header">
                      <span>📜</span>
                      <h3>سجل الزيارات السابقة</h3>
                      <span className="visits-count">{patientHistory.length} زيارة</span>
                    </div>
                    
                    {loadingHistory ? (
                      <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>جاري تحميل السجل...</p>
                      </div>
                    ) : patientHistory.length === 0 ? (
                      <div className="empty-state">
                        <span className="empty-icon">📋</span>
                        <h4>لا توجد زيارات سابقة</h4>
                        <p>سيتم عرض سجل الزيارات هنا</p>
                      </div>
                    ) : (
                      <div className="visits-timeline">
                        {patientHistory.map((visit, index) => (
                          <div key={visit._id || index} className="visit-card">
                            <div className="visit-header">
                              <div className="visit-date">
                                <span className="date-icon">📅</span>
                                <span>{new Date(visit.visitDate).toLocaleDateString('ar-SY')}</span>
                              </div>
                              <div className="visit-doctor">
                                <span>👨‍⚕️</span>
                                <span>{visit.doctorName || 'غير محدد'}</span>
                              </div>
                            </div>
                            
                            <div className="visit-content">
                              {visit.chiefComplaint && (
                                <div className="visit-field">
                                  <span className="field-label">الشكوى:</span>
                                  <span className="field-value">{visit.chiefComplaint}</span>
                                </div>
                              )}
                              {visit.diagnosis && (
                                <div className="visit-field">
                                  <span className="field-label">التشخيص:</span>
                                  <span className="field-value">{visit.diagnosis}</span>
                                </div>
                              )}
                              {visit.doctorNotes && (
                                <div className="visit-field">
                                  <span className="field-label">الملاحظات:</span>
                                  <span className="field-value">{visit.doctorNotes}</span>
                                </div>
                              )}
                              
                              {/* Visit Photo Display */}
                              {visit.visitPhoto && (
                                <div className="visit-photo-display">
                                  <span className="field-label">📷 صورة مرفقة:</span>
                                  <div className="visit-photo-container">
                                    <img 
                                      src={`http://localhost:5000${visit.visitPhoto}`} 
                                      alt="صورة الزيارة" 
                                      className="visit-photo-img"
                                      onClick={() => window.open(`http://localhost:5000${visit.visitPhoto}`, '_blank')}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {/* ECG Analysis Display in History */}
                              {visit.ecgAnalysis && (
                                <div className="visit-ecg-summary">
                                  <span className="field-label">❤️ تحليل ECG:</span>
                                  <div className="ecg-summary-content">
                                    <span className="ecg-prediction">{visit.ecgAnalysis.prediction}</span>
                                    <span className="ecg-confidence">{visit.ecgAnalysis.confidence_percentage}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Medications */}
                            {visit.prescribedMedications && visit.prescribedMedications.length > 0 && (
                              <div className="visit-medications">
                                <span className="meds-label">💊 الأدوية الموصوفة:</span>
                                <div className="meds-list">
                                  {visit.prescribedMedications.map((med, medIndex) => (
                                    <span key={medIndex} className="med-tag">
                                      {med.medicationName} - {med.dosage}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════
                  VISIT TAB
                  ═══════════════════════════════════════════════════════════════ */}
              {activeSection === 'visit' && (
                <div className="tab-content-container visit-form-container">
                  {/* Chief Complaint */}
                  <div className="form-section">
                    <div className="form-section-header">
                      <span>🩺</span>
                      <h3>الشكوى الرئيسية *</h3>
                    </div>
                    <textarea
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="اكتب الشكوى الرئيسية للمريض..."
                      className="form-textarea"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Vital Signs */}
                  <div className="form-section">
                    <div className="form-section-header">
                      <span>💓</span>
                      <h3>العلامات الحيوية</h3>
                    </div>
                    <div className="vitals-grid">
                      <div className="vital-group blood-pressure">
                        <label>
                          <span>🩸</span>
                          ضغط الدم
                        </label>
                        <div className="bp-inputs">
                          <input
                            type="number"
                            value={vitalSigns.bloodPressure.systolic}
                            onChange={(e) => setVitalSigns({
                              ...vitalSigns,
                              bloodPressure: { ...vitalSigns.bloodPressure, systolic: e.target.value }
                            })}
                            placeholder="انقباضي"
                          />
                          <span>/</span>
                          <input
                            type="number"
                            value={vitalSigns.bloodPressure.diastolic}
                            onChange={(e) => setVitalSigns({
                              ...vitalSigns,
                              bloodPressure: { ...vitalSigns.bloodPressure, diastolic: e.target.value }
                            })}
                            placeholder="انبساطي"
                          />
                          <span className="unit">mmHg</span>
                        </div>
                      </div>
                      
                      <VitalInput
                        icon="💓"
                        label="نبضات القلب"
                        value={vitalSigns.heartRate}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                        unit="bpm"
                        placeholder="72"
                      />
                      <VitalInput
                        icon="🌡️"
                        label="درجة الحرارة"
                        value={vitalSigns.temperature}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                        unit="°C"
                        placeholder="37"
                      />
                      <VitalInput
                        icon="🫁"
                        label="معدل التنفس"
                        value={vitalSigns.respiratoryRate}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, respiratoryRate: e.target.value })}
                        unit="/min"
                        placeholder="16"
                      />
                      <VitalInput
                        icon="💨"
                        label="تشبع الأكسجين"
                        value={vitalSigns.oxygenSaturation}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                        unit="%"
                        placeholder="98"
                      />
                      <VitalInput
                        icon="⚖️"
                        label="الوزن"
                        value={vitalSigns.weight}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                        unit="kg"
                        placeholder="70"
                      />
                      <VitalInput
                        icon="📏"
                        label="الطول"
                        value={vitalSigns.height}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                        unit="cm"
                        placeholder="170"
                      />
                    </div>
                  </div>

                  {/* Photo Upload Section */}
                  <div className="form-section">
                    <div className="form-section-header">
                      <span>📷</span>
                      <h3>صورة طبية (اختياري)</h3>
                    </div>
                    <div className="photo-upload-area">
                      {!visitPhoto ? (
                        <label className="photo-upload-label">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            ref={photoInputRef}
                            className="hidden-input"
                          />
                          <div className="upload-content">
                            <span className="upload-icon">📤</span>
                            <p>اضغط لرفع صورة طبية</p>
                            <span className="upload-hint">JPG, PNG - حتى 10MB</span>
                          </div>
                        </label>
                      ) : (
                        <PhotoPreview photo={visitPhoto} onRemove={handleRemovePhoto} />
                      )}
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="form-section">
                    <div className="form-section-header">
                      <span>🔬</span>
                      <h3>التشخيص</h3>
                    </div>
                    <textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="اكتب التشخيص..."
                      className="form-textarea"
                      rows={3}
                    />
                  </div>

                  {/* Medications */}
                  <div className="form-section">
                    <div className="form-section-header">
                      <span>💊</span>
                      <h3>الوصفة الطبية</h3>
                    </div>
                    
                    <div className="medication-form">
                      <div className="med-inputs-grid">
                        <input
                          type="text"
                          value={newMedication.medicationName}
                          onChange={(e) => setNewMedication({ ...newMedication, medicationName: e.target.value })}
                          placeholder="اسم الدواء"
                          className="med-input"
                        />
                        <input
                          type="text"
                          value={newMedication.dosage}
                          onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                          placeholder="الجرعة"
                          className="med-input"
                        />
                        <input
                          type="text"
                          value={newMedication.frequency}
                          onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                          placeholder="التكرار"
                          className="med-input"
                        />
                        <input
                          type="text"
                          value={newMedication.duration}
                          onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                          placeholder="المدة"
                          className="med-input"
                        />
                      </div>
                      <input
                        type="text"
                        value={newMedication.instructions}
                        onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                        placeholder="تعليمات خاصة"
                        className="med-input full-width"
                      />
                      <button className="add-med-btn" onClick={handleAddMedication}>
                        <span>➕</span>
                        <span>إضافة دواء</span>
                      </button>
                    </div>

                    {/* Medications List */}
                    {medications.length > 0 && (
                      <div className="medications-list">
                        {medications.map((med) => (
                          <div key={med.id} className="medication-item">
                            <div className="med-info">
                              <span className="med-name">{med.medicationName}</span>
                              <span className="med-details">
                                {med.dosage} - {med.frequency} - {med.duration}
                              </span>
                              {med.instructions && (
                                <span className="med-instructions">{med.instructions}</span>
                              )}
                            </div>
                            <button 
                              className="remove-med-btn"
                              onClick={() => handleRemoveMedication(med.id)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Doctor Notes */}
                  <div className="form-section">
                    <div className="form-section-header">
                      <span>📋</span>
                      <h3>ملاحظات وتوصيات</h3>
                    </div>
                    <textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="اكتب ملاحظاتك وتوصياتك للمريض..."
                      className="form-textarea"
                      rows={4}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="save-section">
                    <button
                      className={`save-visit-btn ${saving ? 'saving' : ''}`}
                      onClick={handleSaveVisit}
                      disabled={saving || !chiefComplaint.trim()}
                    >
                      {saving ? (
                        <><span className="spinner"></span><span>جاري الحفظ...</span></>
                      ) : (
                        <><span>💾</span><span>حفظ الزيارة</span></>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════
                  ECG TAB (Cardiologists Only) - REDESIGNED
                  ═══════════════════════════════════════════════════════════════ */}
              {activeSection === 'ecg' && isCardiologist() && (
                <div className="tab-content-container ecg-section">
                  {/* ECG Header */}
                  <div className="ecg-page-header">
                    <div className="ecg-header-icon-wrapper">
                      <span className="ecg-heart-icon">❤️</span>
                      <div className="ecg-pulse-ring"></div>
                      <div className="ecg-pulse-ring delay-1"></div>
                    </div>
                    <div className="ecg-header-content">
                      <h1>تحليل تخطيط القلب (ECG)</h1>
                      <p>AI-Powered ECG Analysis System</p>
                    </div>
                    <div className="ecg-ai-badge">
                      <span>🤖</span>
                      <span>Powered by AI</span>
                    </div>
                  </div>

                  {/* Upload Section */}
                  <div className="ecg-upload-card">
                    <div className="ecg-upload-header">
                      <span>📤</span>
                      <h3>رفع ملف تخطيط القلب</h3>
                    </div>

                    {!ecgFile ? (
                      <label className="ecg-upload-dropzone">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleEcgUpload}
                          ref={ecgFileInputRef}
                          className="hidden-input"
                        />
                        <div className="dropzone-content">
                          <div className="dropzone-icon">
                            <span>📤</span>
                          </div>
                          <h4>اضغط لاختيار ملف أو اسحب الملف هنا</h4>
                          <p>PDF, PNG, JPG - تخطيط القلب الكهربائي</p>
                          <div className="dropzone-formats">
                            <span className="format-tag">📄 PDF</span>
                            <span className="format-tag">🖼️ PNG</span>
                            <span className="format-tag">🖼️ JPG</span>
                          </div>
                        </div>
                      </label>
                    ) : (
                      <div className="ecg-file-preview-card">
                        {ecgPreview ? (
                          <div className="ecg-image-preview">
                            <img src={ecgPreview} alt="ECG Preview" />
                          </div>
                        ) : (
                          <div className="ecg-pdf-preview">
                            <span className="pdf-icon">📄</span>
                            <span className="pdf-name">{ecgFile.name}</span>
                          </div>
                        )}
                        <div className="ecg-file-info">
                          <span className="file-name">📎 {ecgFile.name}</span>
                          <span className="file-size">({(ecgFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                          <button className="remove-ecg-btn" onClick={handleRemoveEcg}>
                            <span>✕</span> إزالة
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Analyze Button */}
                    <button
                      className={`ecg-analyze-btn ${ecgAnalyzing ? 'analyzing' : ''} ${!ecgFile ? 'disabled' : ''}`}
                      onClick={handleAiDiagnosis}
                      disabled={!ecgFile || ecgAnalyzing}
                    >
                      {ecgAnalyzing ? (
                        <>
                          <div className="analyze-spinner"></div>
                          <span>جاري التحليل بالذكاء الاصطناعي...</span>
                        </>
                      ) : (
                        <>
                          <span className="analyze-icon">🤖</span>
                          <span>تحليل بالذكاء الاصطناعي</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Results - New Design */}
                  {aiDiagnosis && (
                    <div ref={resultRef}>
                      <ECGResultCard result={aiDiagnosis} />
                    </div>
                  )}

                  {/* Info Notice */}
                  <div className="ecg-info-notice">
                    <div className="notice-icon">💡</div>
                    <div className="notice-content">
                      <h4>كيفية الاستخدام</h4>
                      <ol>
                        <li>ارفع صورة أو ملف PDF لتخطيط القلب</li>
                        <li>اضغط على زر "تحليل بالذكاء الاصطناعي"</li>
                        <li>راجع النتائج والتوصيات</li>
                        <li>اتخذ القرار الطبي المناسب بناءً على خبرتك السريرية</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

/**
 * Info Card Component
 */
const InfoCard = ({ icon, title, value, fullWidth = false, dir = 'rtl' }) => (
  <div className={`info-display-card ${fullWidth ? 'full-width' : ''}`}>
    <div className="card-icon-header">
      <div className="icon-circle">
        <span>{icon}</span>
      </div>
      <h3>{title}</h3>
    </div>
    <p className="card-value" dir={dir}>{value || '-'}</p>
  </div>
);

/**
 * Alert Card Component
 */
const AlertCard = ({ type, icon, title, items, emptyMessage }) => {
  const itemsList = Array.isArray(items) ? items : (items ? [items] : []);
  
  return (
    <div className={`alert-card ${type}`}>
      <div className="alert-header">
        <span className="alert-icon">{icon}</span>
        <h3>{title}</h3>
        <span className="count-badge">{itemsList.length}</span>
      </div>
      {itemsList.length > 0 ? (
        <ul className="alert-list">
          {itemsList.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <div className="no-data">
          <span>✓</span>
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Vital Input Component
 */
const VitalInput = ({ icon, label, value, onChange, unit, placeholder }) => (
  <div className="vital-input-group">
    <label>
      <span>{icon}</span>
      {label}
    </label>
    <div className="input-with-unit">
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <span className="unit">{unit}</span>
    </div>
  </div>
);

export default DoctorDashboard;
