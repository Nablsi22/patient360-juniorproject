// src/pages/PatientDashboard.jsx
// ✅ REFACTORED VERSION - Uses service layer

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import '../styles/PatientDashboard.css';

// ✅ CHANGE #1: Import services instead of using localStorage directly
import { getCurrentUser, logout as logoutService } from '../services/authService';
import { getCurrentPatientData } from '../services/patientService';

/**
 * PatientDashboard Component - REFACTORED VERSION
 * 
 * ✅ NOW USES SERVICE LAYER for all data operations
 * ✅ Reads REAL data from doctor (no mock data)
 * ✅ Easy backend integration later
 */
const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: '',
    onConfirm: null
  });

  // Visit details modal state
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showVisitDetails, setShowVisitDetails] = useState(false);
  
  // Visits data and filters
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    doctorId: '',
    searchTerm: ''
  });
  
  // Active section state
  const [activeSection, setActiveSection] = useState('overview');
  
  // Doctors list for filter dropdown
  const [doctors, setDoctors] = useState([]);

  /**
   * Opens modal dialog
   */
  const openModal = (type, title, message, onConfirm = null) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };

  /**
   * Closes modal dialog
   */
  const closeModal = () => {
    if (modal.onConfirm && modal.type === 'confirm') {
      // User cancelled confirmation
    }
    setModal({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  };

  /**
   * Handles modal confirmation action
   */
  const handleModalConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
    }
    closeModal();
  };

  /**
   * ✅ CHANGE #2: Load patient data using services
   * Authentication and data loading on component mount
   */
  useEffect(() => {
    const loadPatientData = async () => {
      setLoading(true);
      
      // ✅ Use service to get current user
      const currentUser = await getCurrentUser();
      
      // Security Check 1: User must be logged in
      if (!currentUser) {
        openModal('error', 'غير مصرح', 'يجب عليك تسجيل الدخول أولاً', () => navigate('/'));
        return;
      }
      
      // Security Check 2: User must have patient role
      if (currentUser.role !== 'patient') {
        openModal('error', 'غير مصرح', 'هذه الصفحة متاحة للمرضى فقط', () => navigate('/'));
        return;
      }
      
      // ✅ Use service to get latest patient data (including doctor updates)
      const result = await getCurrentPatientData();
      
      if (result.success) {
        const patientData = result.patient;
        setUser(patientData);
        
        // Generate visits from patient data
        const realVisits = generateVisitsFromPatientData(patientData);
        setVisits(realVisits);
        setFilteredVisits(realVisits);
      } else {
        // Fallback to current user if service fails
        setUser(currentUser);
        const realVisits = generateVisitsFromPatientData(currentUser);
        setVisits(realVisits);
        setFilteredVisits(realVisits);
      }
      
      // Load doctors list
      const mockDoctors = generateMockDoctors();
      setDoctors(mockDoctors);
      
      setLoading(false);
    };
    
    loadPatientData();
  }, [navigate]);

  /**
   * Generates visits from REAL patient data entered by doctor
   * Reads ECG, medications, AI results, and vital signs from patient object
   * 
   * @param {Object} patient - Full patient object from service
   * @returns {Array} Array of visit objects with real doctor data
   */
  const generateVisitsFromPatientData = (patient) => {
    if (!patient) return [];

    // Only create visit if doctor has entered data
    if (patient.lastUpdated) {
      const visit = {
        _id: Date.now(),
        patientId: patient.id,
        doctorId: 1001,
        doctorName: patient.lastUpdatedBy || 'د. الطبيب المعالج',
        specialization: 'Cardiologist',
        visitDate: patient.lastUpdated,
        visitTime: new Date(patient.lastUpdated).toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        chiefComplaint: 'زيارة طبية - متابعة',
        
        // Real vital signs from doctor
        vitalSigns: patient.vitalSigns ? {
          bloodPressure: `${patient.vitalSigns.bloodPressureSystolic || '-'}/${patient.vitalSigns.bloodPressureDiastolic || '-'}`,
          heartRate: parseInt(patient.vitalSigns.heartRate) || 0,
          temperature: parseFloat(patient.vitalSigns.temperature) || 0,
          oxygenSaturation: parseInt(patient.vitalSigns.spo2) || 0
        } : null,
        
        diagnosis: patient.doctorOpinion || 'لم يتم التشخيص بعد',
        
        // Real ECG results from doctor
        ecgResults: patient.ecgResults || null,
        
        // Real AI prediction from doctor
        aiPrediction: patient.aiPrediction || null,
        
        // Real medications from doctor
        prescribedMedications: patient.prescribedMedications || [],
        
        labTests: patient.labTests || [],
        doctorNotes: patient.doctorOpinion || null,
        followUpDate: patient.followUpDate || null,
        createdAt: patient.lastUpdated
      };

      return [visit];
    }

    // If no doctor visit yet, return empty array
    return [];
  };

  /**
   * Generates mock doctors data for demonstration
   */
  const generateMockDoctors = () => {
    return [
      {
        _id: 1001,
        personId: 2001,
        firstName: 'أحمد',
        lastName: 'محمود',
        specialization: 'Cardiologist',
        medicalLicenseNumber: 'MD12345678'
      },
      {
        _id: 1002,
        personId: 2002,
        firstName: 'سارة',
        lastName: 'العلي',
        specialization: 'Cardiac Surgeon',
        medicalLicenseNumber: 'MD87654321'
      }
    ];
  };

  /**
   * Applies filters to visits list
   * Filters include: date range, doctor, search term
   */
  useEffect(() => {
    let filtered = [...visits];
    
    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(visit => 
        new Date(visit.visitDate) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(visit => 
        new Date(visit.visitDate) <= new Date(filters.endDate)
      );
    }
    
    // Filter by doctor
    if (filters.doctorId) {
      filtered = filtered.filter(visit => 
        visit.doctorId === parseInt(filters.doctorId)
      );
    }
    
    // Filter by search term (searches in diagnosis and chief complaint)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(visit => 
        (visit.chiefComplaint && visit.chiefComplaint.toLowerCase().includes(searchLower)) ||
        (visit.diagnosis && visit.diagnosis.toLowerCase().includes(searchLower)) ||
        (visit.doctorName && visit.doctorName.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
    
    setFilteredVisits(filtered);
  }, [filters, visits]);

  /**
   * Handles filter changes
   */
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  /**
   * Resets all filters
   */
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      doctorId: '',
      searchTerm: ''
    });
  };

  /**
   * Opens detailed view for a specific visit
   */
  const openVisitDetails = (visit) => {
    setSelectedVisit(visit);
    setShowVisitDetails(true);
  };

  /**
   * Closes detailed view
   */
  const closeVisitDetails = () => {
    setShowVisitDetails(false);
    setSelectedVisit(null);
  };

  /**
   * ✅ CHANGE #3: Use service for logout
   * Handles secure logout
   */
  const handleLogout = () => {
    openModal(
      'confirm',
      'تأكيد تسجيل الخروج',
      'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      async () => {
        // ✅ Use logout service
        await logoutService();
        
        // Close confirm modal first
        setModal({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
        
        // Small delay to ensure modal closes, then redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
    );
  };

  /**
   * Formats date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  /**
   * Calculates health statistics
   */
  const getHealthStats = () => {
    const totalVisits = visits.length;
    const totalMedications = visits.reduce((acc, v) => 
      acc + (v.prescribedMedications ? v.prescribedMedications.length : 0), 0
    );
    
    return { totalVisits, totalMedications };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = getHealthStats();

  return (
    <div className="patient-dashboard">
      <Navbar />
      
      {/* Modal Component */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header ${modal.type}`}>
              {modal.type === 'success' && <div className="modal-icon success-icon">✓</div>}
              {modal.type === 'error' && <div className="modal-icon error-icon">✕</div>}
              {modal.type === 'confirm' && <div className="modal-icon confirm-icon">؟</div>}
              <h2 className="modal-title">{modal.title}</h2>
            </div>
            <div className="modal-body">
              <p className="modal-message">{modal.message}</p>
            </div>
            <div className="modal-footer">
              {modal.type === 'confirm' ? (
                <>
                  <button className="modal-button secondary" onClick={closeModal}>
                    إلغاء
                  </button>
                  <button className="modal-button primary" onClick={handleModalConfirm}>
                    تأكيد
                  </button>
                </>
              ) : (
                <button 
                  className="modal-button primary" 
                  onClick={modal.onConfirm ? handleModalConfirm : closeModal}
                >
                  حسناً
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visit Details Modal */}
      <VisitDetailsModal 
        visit={selectedVisit}
        isOpen={showVisitDetails}
        onClose={closeVisitDetails}
        formatDate={formatDate}
      />

      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="welcome-header">
          <div className="welcome-content">
            <h1>مرحباً {user.firstName} {user.lastName} 👋</h1>
            <p>لوحة تحكم المريض - Patient 360°</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            تسجيل الخروج 🚪
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <span className="tab-icon">📊</span>
            نظرة عامة
          </button>
          <button 
            className={`tab-btn ${activeSection === 'visits' ? 'active' : ''}`}
            onClick={() => setActiveSection('visits')}
          >
            <span className="tab-icon">📋</span>
            سجل الزيارات
          </button>
          <button 
            className={`tab-btn ${activeSection === 'risk' ? 'active' : ''}`}
            onClick={() => setActiveSection('risk')}
          >
            <span className="tab-icon">🤖</span>
            توقع المخاطر الصحية
          </button>
          <button 
            className={`tab-btn ${activeSection === 'medications' ? 'active' : ''}`}
            onClick={() => setActiveSection('medications')}
          >
            <span className="tab-icon">💊</span>
            تقويم الأدوية
          </button>
        </div>

        {/* Overview Section - Beautiful Personal Information */}
        {activeSection === 'overview' && (
          <div className="section-content">
            {/* Profile Header Card */}
            <div className="profile-header-card">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  <span className="avatar-icon">👤</span>
                </div>
                <div className="avatar-badge">
                  <span className="badge-icon">✓</span>
                </div>
              </div>
              <div className="profile-header-info">
                <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
                <p className="profile-role">مريض - Patient 360°</p>
                <div className="profile-status">
                  <span className="status-indicator active"></span>
                  <span className="status-text">حساب نشط</span>
                </div>
              </div>
            </div>

            {/* Personal Information Grid */}
            <div className="personal-info-section">
              <h2 className="section-title">
                <span className="title-icon">📋</span>
                المعلومات الشخصية
              </h2>
              
              <div className="info-cards-grid">
                {/* Contact Information Card */}
                <div className="info-display-card">
                  <div className="card-icon-header">
                    <div className="icon-circle email">
                      <span>✉️</span>
                    </div>
                    <h3>البريد الإلكتروني</h3>
                  </div>
                  <p className="card-value" dir="ltr">{user.email}</p>
                  <span className="card-subtitle">للتواصل والإشعارات</span>
                </div>

                <div className="info-display-card">
                  <div className="card-icon-header">
                    <div className="icon-circle phone">
                      <span>📱</span>
                    </div>
                    <h3>رقم الهاتف</h3>
                  </div>
                  <p className="card-value" dir="ltr">{user.phoneNumber || user.phone || 'غير محدد'}</p>
                  <span className="card-subtitle">للاتصال المباشر</span>
                </div>

                <div className="info-display-card">
                  <div className="card-icon-header">
                    <div className="icon-circle id">
                      <span>🆔</span>
                    </div>
                    <h3>رقم الهوية</h3>
                  </div>
                  <p className="card-value">{user.nationalId || 'غير محدد'}</p>
                  <span className="card-subtitle">الرقم الوطني</span>
                </div>

                <div className="info-display-card">
                  <div className="card-icon-header">
                    <div className="icon-circle birth">
                      <span>🎂</span>
                    </div>
                    <h3>تاريخ الميلاد</h3>
                  </div>
                  <p className="card-value">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد'}</p>
                  <span className="card-subtitle">العمر: {user.dateOfBirth ? Math.floor((new Date() - new Date(user.dateOfBirth)) / 31536000000) + ' سنة' : '-'}</span>
                </div>

                {user.gender && (
                  <div className="info-display-card">
                    <div className="card-icon-header">
                      <div className="icon-circle gender">
                        <span>{user.gender === 'male' ? '👨' : '👩'}</span>
                      </div>
                      <h3>الجنس</h3>
                    </div>
                    <p className="card-value">{user.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                    <span className="card-subtitle">النوع</span>
                  </div>
                )}

                {user.address && (
                  <div className="info-display-card">
                    <div className="card-icon-header">
                      <div className="icon-circle address">
                        <span>📍</span>
                      </div>
                      <h3>العنوان</h3>
                    </div>
                    <p className="card-value">{user.address}</p>
                    <span className="card-subtitle">محل الإقامة</span>
                  </div>
                )}
              </div>
            </div>

            {/* Welcome Message Card */}
            <div className="welcome-message-card">
              <div className="message-icon">💚</div>
              <div className="message-content">
                <h3>مرحباً بك في Patient 360°</h3>
                <p>
                  نحن سعداء بوجودك معنا. يمكنك الآن الاطلاع على سجل زياراتك الطبية،
                  متابعة أدويتك الحالية، والاستفادة من خدماتنا الطبية المتقدمة.
                </p>
                <p>
                  للوصول إلى المعلومات الطبية، استخدم التبويبات في الأعلى.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Visits History Section */}
        {activeSection === 'visits' && (
          <div className="section-content">
            <div className="card">
              <div className="card-header">
                <h2>سجل الزيارات الطبية</h2>
                <p className="card-subtitle">
                  عرض جميع زياراتك الطبية السابقة والمجدولة ({filteredVisits.length} من {visits.length})
                </p>
              </div>

              {/* Filters Section */}
              <div className="filters-container">
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>من تاريخ:</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label>إلى تاريخ:</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label>الطبيب:</label>
                    <select
                      value={filters.doctorId}
                      onChange={(e) => handleFilterChange('doctorId', e.target.value)}
                      className="filter-input"
                    >
                      <option value="">جميع الأطباء</option>
                      {doctors.map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                          د. {doctor.firstName} {doctor.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group full-width">
                    <label>بحث:</label>
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      placeholder="ابحث في التشخيص أو الشكوى..."
                      className="filter-input"
                    />
                  </div>
                </div>
                <button onClick={resetFilters} className="reset-filters-btn">
                  إعادة تعيين الفلاتر
                </button>
              </div>

              {/* Visits Table */}
              <div className="table-container">
                {filteredVisits.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>لا توجد زيارات</h3>
                    <p>لم يتم العثور على زيارات. يرجى مراجعة الطبيب أولاً.</p>
                  </div>
                ) : (
                  <table className="visits-table">
                    <thead>
                      <tr>
                        <th>التاريخ</th>
                        <th>الوقت</th>
                        <th>الطبيب</th>
                        <th>التخصص</th>
                        <th>الشكوى الرئيسية</th>
                        <th>التشخيص</th>
                        <th>التفاصيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVisits.map(visit => (
                        <VisitRow 
                          key={visit._id} 
                          visit={visit}
                          formatDate={formatDate}
                          openVisitDetails={openVisitDetails}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Risk Prediction Section */}
        {activeSection === 'risk' && (
          <div className="section-content">
            <div className="card risk-card">
              <div className="card-header">
                <h2>🤖 توقع المخاطر الصحية بالذكاء الاصطناعي</h2>
                <p className="card-subtitle">
                  تحليل ذكي لبياناتك الصحية لتوقع المخاطر المستقبلية
                </p>
              </div>

              {/* AI Model Status */}
              <div className="ai-status">
                <div className="status-badge pending">
                  <span className="status-dot"></span>
                  قيد التطوير - سيتم التفعيل قريباً
                </div>
              </div>

              {/* Risk Analysis Preview */}
              <div className="risk-analysis-preview">
                <div className="risk-category">
                  <div className="risk-header">
                    <h3>مخاطر القلب والأوعية الدموية</h3>
                    <span className="risk-level low">منخفض</span>
                  </div>
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: '25%', background: '#10b981' }}></div>
                  </div>
                  <p className="risk-description">
                    بناءً على بياناتك الحالية، مستوى المخاطر منخفض. استمر على نمط الحياة الصحي.
                  </p>
                </div>

                <div className="risk-category">
                  <div className="risk-header">
                    <h3>مخاطر السكري</h3>
                    <span className="risk-level medium">متوسط</span>
                  </div>
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: '45%', background: '#f59e0b' }}></div>
                  </div>
                  <p className="risk-description">
                    يُنصح بمراقبة مستوى السكر في الدم بانتظام والحفاظ على وزن صحي.
                  </p>
                </div>

                <div className="risk-category">
                  <div className="risk-header">
                    <h3>مخاطر ضغط الدم</h3>
                    <span className="risk-level low">منخفض</span>
                  </div>
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: '30%', background: '#10b981' }}></div>
                  </div>
                  <p className="risk-description">
                    قراءات ضغط الدم ضمن المعدل الطبيعي. الاستمرار على العلاج الحالي.
                  </p>
                </div>
              </div>

              {/* AI Features */}
              <div className="ai-features">
                <h3>ميزات نموذج الذكاء الاصطناعي:</h3>
                <ul className="features-list">
                  <li>✓ تحليل البيانات الصحية التاريخية</li>
                  <li>✓ توقع احتمالية الإصابة بالأمراض المزمنة</li>
                  <li>✓ توصيات شخصية للوقاية</li>
                  <li>✓ تنبيهات مبكرة للمخاطر الصحية</li>
                  <li>✓ تحديث مستمر بناءً على البيانات الجديدة</li>
                </ul>
              </div>

              {/* Integration Note */}
              <div className="integration-note">
                <div className="note-icon">ℹ️</div>
                <div className="note-content">
                  <h4>ملاحظة للمطورين:</h4>
                  <p>
                    هذا القسم مخصص لعرض نتائج نموذج الذكاء الاصطناعي لتوقع المخاطر الصحية.
                    يمكن ربطه بـ API الخاص بالنموذج عن طريق إرسال بيانات المريض (الزيارات، التحاليل، التاريخ المرضي)
                    واستقبال نتائج التحليل والتوقعات.
                  </p>
                  <code className="api-endpoint">
                    POST /api/ai/predict-risks
                    <br />
                    Body: {`{ patientId, visits, labTests, vitalSigns }`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medication Calendar Section */}
        {activeSection === 'medications' && (
          <div className="section-content">
            <div className="card">
              <div className="card-header">
                <h2>💊 تقويم الأدوية</h2>
                <p className="card-subtitle">
                  جدول الأدوية الموصوفة من قبل الأطباء
                </p>
              </div>

              <MedicationCalendar visits={visits} />

              {/* Integration Note */}
              <div className="integration-note">
                <div className="note-icon">ℹ️</div>
                <div className="note-content">
                  <h4>ملاحظة:</h4>
                  <p>
                    يتم تحديث هذا التقويم تلقائياً عندما يقوم الطبيب بإدخال وصفة طبية جديدة.
                    البيانات تأتي مباشرة من الطبيب المعالج.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Visit Row Component
 * Displays a single visit in the table with details button
 */
const VisitRow = ({ visit, formatDate, openVisitDetails }) => {
  return (
    <tr className="visit-row">
      <td>{formatDate(visit.visitDate)}</td>
      <td>{visit.visitTime}</td>
      <td>{visit.doctorName}</td>
      <td>{visit.specialization}</td>
      <td>{visit.chiefComplaint || '-'}</td>
      <td>{visit.diagnosis || 'لم يتم التشخيص بعد'}</td>
      <td>
        <button 
          className="details-btn"
          onClick={(e) => {
            e.stopPropagation();
            openVisitDetails(visit);
          }}
        >
          <span className="btn-icon">📋</span>
          <span className="btn-text">عرض التفاصيل</span>
        </button>
      </td>
    </tr>
  );
};

/**
 * Medication Calendar Component
 * Displays medications in a calendar format
 */
const MedicationCalendar = ({ visits }) => {
  // Extract all medications from visits
  const allMedications = visits
    .filter(v => v.prescribedMedications && v.prescribedMedications.length > 0)
    .flatMap(v => v.prescribedMedications.map(med => ({
      ...med,
      visitDate: v.visitDate,
      doctorName: v.doctorName
    })));

  // Get current medications (those with ongoing duration)
  const currentMedications = allMedications.filter(med => 
    med.duration.includes('مستمر') || med.duration.includes('يوم')
  );

  if (currentMedications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💊</div>
        <h3>لا توجد أدوية حالية</h3>
        <p>لم يتم وصف أي أدوية بعد من قبل الطبيب</p>
      </div>
    );
  }

  return (
    <div className="medication-calendar">
      <div className="current-medications">
        <h3>الأدوية الحالية:</h3>
        <div className="medications-grid">
          {currentMedications.map((med, index) => (
            <div key={index} className="medication-card">
              <div className="medication-header">
                <h4>{med.medicationName}</h4>
                <span className="medication-badge">نشط</span>
              </div>
              <div className="medication-info">
                <div className="info-row">
                  <span className="info-label">الجرعة:</span>
                  <span className="info-value">{med.dosage}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">التكرار:</span>
                  <span className="info-value">{med.frequency}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">المدة:</span>
                  <span className="info-value">{med.duration}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">الطبيب:</span>
                  <span className="info-value">{med.doctorName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="weekly-schedule">
        <h3>الجدول الأسبوعي:</h3>
        <div className="schedule-grid">
          {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day, index) => (
            <div key={index} className="day-column">
              <div className="day-header">{day}</div>
              <div className="day-medications">
                {currentMedications.map((med, medIndex) => (
                  <div key={medIndex} className="day-med-item">
                    <span className="med-time">صباحاً</span>
                    <span className="med-name-short">{med.medicationName}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Visit Details Modal Component
 * Shows comprehensive details for a selected visit
 */
const VisitDetailsModal = ({ visit, isOpen, onClose, formatDate }) => {
  if (!isOpen || !visit) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'منخفض': return '#10b981';
      case 'متوسط': return '#f59e0b';
      case 'مرتفع': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="visit-details-modal-overlay" onClick={onClose}>
      <div className="visit-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-visit">
          <div className="header-content">
            <h2>📋 تفاصيل الزيارة الطبية</h2>
            <p className="visit-date-header">{formatDate(visit.visitDate)} - {visit.visitTime}</p>
          </div>
          <button className="close-btn-visit" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body-visit">
          {/* Basic Visit Information */}
          <div className="detail-card">
            <div className="card-header-detail">
              <span className="card-icon">👨‍⚕️</span>
              <h3>معلومات الزيارة الأساسية</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">الطبيب:</span>
                <span className="info-value">{visit.doctorName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">التخصص:</span>
                <span className="info-value">{visit.specialization}</span>
              </div>
              <div className="info-item">
                <span className="info-label">الشكوى الرئيسية:</span>
                <span className="info-value">{visit.chiefComplaint || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">التشخيص:</span>
                <span className="info-value">{visit.diagnosis || 'لم يتم التشخيص بعد'}</span>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          {visit.vitalSigns && (
            <div className="detail-card">
              <div className="card-header-detail">
                <span className="card-icon">❤️</span>
                <h3>العلامات الحيوية</h3>
              </div>
              <div className="vital-signs-grid">
                <div className="vital-card">
                  <div className="vital-icon blood-pressure">🩺</div>
                  <div className="vital-info">
                    <span className="vital-title">ضغط الدم</span>
                    <span className="vital-value-large">{visit.vitalSigns.bloodPressure}</span>
                    <span className="vital-unit">mmHg</span>
                  </div>
                </div>
                <div className="vital-card">
                  <div className="vital-icon heart-rate">💓</div>
                  <div className="vital-info">
                    <span className="vital-title">نبضات القلب</span>
                    <span className="vital-value-large">{visit.vitalSigns.heartRate}</span>
                    <span className="vital-unit">نبضة/دقيقة</span>
                  </div>
                </div>
                <div className="vital-card">
                  <div className="vital-icon temperature">🌡️</div>
                  <div className="vital-info">
                    <span className="vital-title">درجة الحرارة</span>
                    <span className="vital-value-large">{visit.vitalSigns.temperature}</span>
                    <span className="vital-unit">°C</span>
                  </div>
                </div>
                <div className="vital-card">
                  <div className="vital-icon oxygen">🫁</div>
                  <div className="vital-info">
                    <span className="vital-title">الأكسجين</span>
                    <span className="vital-value-large">{visit.vitalSigns.oxygenSaturation}</span>
                    <span className="vital-unit">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ECG Results */}
          {visit.ecgResults && (
            <div className="detail-card">
              <div className="card-header-detail">
                <span className="card-icon">📈</span>
                <h3>نتائج تخطيط القلب (ECG)</h3>
              </div>
              <div className="ecg-results">
                <div className="ecg-grid">
                  <div className="ecg-item">
                    <span className="ecg-label">معدل النبض:</span>
                    <span className="ecg-value">{visit.ecgResults.heartRate} نبضة/دقيقة</span>
                  </div>
                  <div className="ecg-item">
                    <span className="ecg-label">الإيقاع:</span>
                    <span className="ecg-value">{visit.ecgResults.rhythm}</span>
                  </div>
                  <div className="ecg-item">
                    <span className="ecg-label">PR Interval:</span>
                    <span className="ecg-value">{visit.ecgResults.prInterval}</span>
                  </div>
                  <div className="ecg-item">
                    <span className="ecg-label">QRS Duration:</span>
                    <span className="ecg-value">{visit.ecgResults.qrsDuration}</span>
                  </div>
                  <div className="ecg-item">
                    <span className="ecg-label">QT Interval:</span>
                    <span className="ecg-value">{visit.ecgResults.qtInterval}</span>
                  </div>
                  <div className="ecg-item">
                    <span className="ecg-label">المحور:</span>
                    <span className="ecg-value">{visit.ecgResults.axis}</span>
                  </div>
                </div>
                <div className="ecg-findings">
                  <h4>النتائج:</h4>
                  <p>{visit.ecgResults.findings}</p>
                </div>
                <div className="ecg-interpretation">
                  <span className="interpretation-label">التفسير:</span>
                  <span className="interpretation-value">{visit.ecgResults.interpretation}</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Prediction Results */}
          {visit.aiPrediction && (
            <div className="detail-card">
              <div className="card-header-detail">
                <span className="card-icon">🤖</span>
                <h3>تحليل الذكاء الاصطناعي</h3>
              </div>
              <div className="ai-results">
                <div className="risk-overview">
                  <div className="risk-level-display" style={{ borderColor: getRiskColor(visit.aiPrediction.riskLevel) }}>
                    <span className="risk-level-label">مستوى المخاطر</span>
                    <span className="risk-level-value" style={{ color: getRiskColor(visit.aiPrediction.riskLevel) }}>
                      {visit.aiPrediction.riskLevel}
                    </span>
                    <div className="risk-score">
                      <div className="score-label">النتيجة الإجمالية:</div>
                      <div className="score-value">{visit.aiPrediction.riskScore}/100</div>
                    </div>
                  </div>
                  <div className="model-confidence">
                    <span className="confidence-label">دقة النموذج:</span>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{ width: `${visit.aiPrediction.modelConfidence}%` }}
                      ></div>
                    </div>
                    <span className="confidence-value">{visit.aiPrediction.modelConfidence}%</span>
                  </div>
                </div>

                <div className="predictions-grid">
                  <h4>احتمالية الإصابة بالأمراض:</h4>
                  <div className="prediction-bars">
                    <div className="prediction-item">
                      <div className="prediction-header">
                        <span>أمراض القلب</span>
                        <span className="prediction-percentage">{visit.aiPrediction.predictions.heartDisease}%</span>
                      </div>
                      <div className="prediction-bar">
                        <div 
                          className="prediction-fill heart-disease"
                          style={{ width: `${visit.aiPrediction.predictions.heartDisease}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="prediction-item">
                      <div className="prediction-header">
                        <span>السكري</span>
                        <span className="prediction-percentage">{visit.aiPrediction.predictions.diabetes}%</span>
                      </div>
                      <div className="prediction-bar">
                        <div 
                          className="prediction-fill diabetes"
                          style={{ width: `${visit.aiPrediction.predictions.diabetes}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="prediction-item">
                      <div className="prediction-header">
                        <span>ارتفاع ضغط الدم</span>
                        <span className="prediction-percentage">{visit.aiPrediction.predictions.hypertension}%</span>
                      </div>
                      <div className="prediction-bar">
                        <div 
                          className="prediction-fill hypertension"
                          style={{ width: `${visit.aiPrediction.predictions.hypertension}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="prediction-item">
                      <div className="prediction-header">
                        <span>السكتة الدماغية</span>
                        <span className="prediction-percentage">{visit.aiPrediction.predictions.stroke}%</span>
                      </div>
                      <div className="prediction-bar">
                        <div 
                          className="prediction-fill stroke"
                          style={{ width: `${visit.aiPrediction.predictions.stroke}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ai-recommendations">
                  <h4>توصيات النموذج:</h4>
                  <ul className="recommendations-list">
                    {visit.aiPrediction.recommendations.map((rec, index) => (
                      <li key={index}>
                        <span className="rec-icon">💡</span>
                        <span className="rec-text">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Prescribed Medications */}
          {visit.prescribedMedications && visit.prescribedMedications.length > 0 && (
            <div className="detail-card">
              <div className="card-header-detail">
                <span className="card-icon">💊</span>
                <h3>الأدوية الموصوفة</h3>
              </div>
              <div className="medications-table">
                {visit.prescribedMedications.map((med, index) => (
                  <div key={index} className="medication-row">
                    <div className="med-number">{index + 1}</div>
                    <div className="med-details">
                      <div className="med-name-detail">{med.medicationName}</div>
                      <div className="med-info-row">
                        <span className="med-badge dosage">الجرعة: {med.dosage}</span>
                        <span className="med-badge frequency">التكرار: {med.frequency}</span>
                        <span className="med-badge duration">المدة: {med.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Tests */}
          {visit.labTests && visit.labTests.length > 0 && (
            <div className="detail-card">
              <div className="card-header-detail">
                <span className="card-icon">🔬</span>
                <h3>التحاليل المطلوبة</h3>
              </div>
              <div className="lab-tests-grid">
                {visit.labTests.map((test, index) => (
                  <div key={index} className="lab-test-item">
                    <span className="test-icon">✓</span>
                    <span className="test-name">{test}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Notes */}
          {visit.doctorNotes && (
            <div className="detail-card">
              <div className="card-header-detail">
                <span className="card-icon">📝</span>
                <h3>ملاحظات الطبيب</h3>
              </div>
              <div className="doctor-notes-content">
                <p>{visit.doctorNotes}</p>
              </div>
            </div>
          )}

          {/* Follow-up Date */}
          {visit.followUpDate && (
            <div className="detail-card">
              <div className="card-header-detail">
                <span className="card-icon">📅</span>
                <h3>موعد المتابعة القادم</h3>
              </div>
              <div className="follow-up-content">
                <span className="follow-up-date-large">{formatDate(visit.followUpDate)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer-visit">
          <button className="close-button-visit" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;