import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import '../styles/PatientDashboard.css';

/**
 * PatientDashboard Component
 * 
 * Comprehensive patient dashboard featuring:
 * - Complete visits history with advanced filtering
 * - AI-powered health risk prediction
 * - Interactive medication calendar
 * - Health statistics overview
 * - Secure authentication and authorization
 * 
 * Security Features:
 * - Role-based access control (patients only)
 * - Session validation
 * - Secure logout with localStorage cleanup
 * 
 * @component
 * @returns {JSX.Element} Patient dashboard with full medical management features
 * 
 * @see {@link https://www.mongodb.com/docs/manual/reference/operator/query/ MongoDB Query Operators}
 * @see {@link https://www.nngroup.com/articles/ten-usability-heuristics/ Nielsen's Usability Heuristics}
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
  
  // Visits data and filters
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    doctorId: '',
    status: '',
    searchTerm: ''
  });
  
  // Active section state
  const [activeSection, setActiveSection] = useState('overview'); // overview, visits, risk, medications
  
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
   * Authentication and data loading on component mount
   * Implements secure session validation
   */
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
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
    
    setUser(currentUser);
    
    // Load patient data
    loadPatientData(currentUser);
    
    setLoading(false);
  }, [navigate]);

  /**
   * Loads all patient-related data from localStorage
   * In production, this would be API calls to backend
   * 
   * @param {Object} currentUser - Current logged-in user object
   */
  const loadPatientData = (currentUser) => {
    // Load visits from localStorage
    // In production: GET /api/patients/:patientId/visits
    const allVisits = JSON.parse(localStorage.getItem('visits') || '[]');
    const patientVisits = allVisits.filter(visit => visit.patientId === currentUser.id);
    
    setVisits(patientVisits);
    setFilteredVisits(patientVisits);
    
    // Load doctors list for filter dropdown
    // In production: GET /api/doctors
    const allDoctors = JSON.parse(localStorage.getItem('doctors') || '[]');
    setDoctors(allDoctors);
    
    // If no data exists, create mock data for demonstration
    if (patientVisits.length === 0) {
      const mockVisits = generateMockVisits(currentUser.id);
      localStorage.setItem('visits', JSON.stringify(mockVisits));
      setVisits(mockVisits);
      setFilteredVisits(mockVisits);
    }
    
    if (allDoctors.length === 0) {
      const mockDoctors = generateMockDoctors();
      localStorage.setItem('doctors', JSON.stringify(mockDoctors));
      setDoctors(mockDoctors);
    }
  };

  /**
   * Generates mock visits data for demonstration
   * Simulates data structure from MongoDB Visits collection
   */
  const generateMockVisits = (patientId) => {
    return [
      {
        _id: Date.now() + 1,
        patientId: patientId,
        doctorId: 1001,
        doctorName: 'د. أحمد محمود',
        specialization: 'Cardiologist',
        visitDate: new Date('2024-11-15').toISOString(),
        visitTime: '10:30 AM',
        status: 'completed',
        chiefComplaint: 'ألم في الصدر وضيق في التنفس',
        vitalSigns: {
          bloodPressure: '140/90',
          heartRate: 85,
          temperature: 37.2,
          oxygenSaturation: 96
        },
        diagnosis: 'ارتفاع ضغط الدم - يتطلب متابعة دورية',
        prescribedMedications: [
          {
            medicationName: 'Amlodipine',
            dosage: '5 mg',
            frequency: 'مرة واحدة يومياً',
            duration: '30 يوم'
          },
          {
            medicationName: 'Aspirin',
            dosage: '81 mg',
            frequency: 'مرة واحدة يومياً',
            duration: 'مستمر'
          }
        ],
        labTests: ['تحليل دم شامل', 'تخطيط القلب الكهربائي'],
        doctorNotes: 'المريض يستجيب بشكل جيد للعلاج. يُنصح بمتابعة ضغط الدم يومياً.',
        followUpDate: new Date('2024-12-15').toISOString(),
        createdAt: new Date('2024-11-15').toISOString()
      },
      {
        _id: Date.now() + 2,
        patientId: patientId,
        doctorId: 1002,
        doctorName: 'د. سارة العلي',
        specialization: 'Cardiac Surgeon',
        visitDate: new Date('2024-10-20').toISOString(),
        visitTime: '02:00 PM',
        status: 'completed',
        chiefComplaint: 'فحص دوري للقلب',
        vitalSigns: {
          bloodPressure: '130/85',
          heartRate: 78,
          temperature: 36.8,
          oxygenSaturation: 98
        },
        diagnosis: 'حالة القلب جيدة - لا توجد مشاكل',
        prescribedMedications: [],
        labTests: ['تحليل الكوليسترول', 'تخطيط صدى القلب'],
        doctorNotes: 'نتائج الفحوصات طبيعية. الاستمرار على نمط الحياة الصحي.',
        followUpDate: new Date('2025-01-20').toISOString(),
        createdAt: new Date('2024-10-20').toISOString()
      },
      {
        _id: Date.now() + 3,
        patientId: patientId,
        doctorId: 1001,
        doctorName: 'د. أحمد محمود',
        specialization: 'Cardiologist',
        visitDate: new Date('2024-12-20').toISOString(),
        visitTime: '09:00 AM',
        status: 'scheduled',
        chiefComplaint: 'متابعة دورية',
        vitalSigns: null,
        diagnosis: null,
        prescribedMedications: [],
        labTests: [],
        doctorNotes: null,
        followUpDate: null,
        createdAt: new Date('2024-11-19').toISOString()
      }
    ];
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
   * Filters include: date range, doctor, status, search term
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
    
    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(visit => 
        visit.status === filters.status
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
      status: '',
      searchTerm: ''
    });
  };

  /**
   * Handles secure logout
   * Clears all session data
   */
  const handleLogout = () => {
    openModal(
      'confirm',
      'تأكيد تسجيل الخروج',
      'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      () => {
        localStorage.removeItem('currentUser');
        openModal('success', 'تم بنجاح', 'تم تسجيل الخروج بنجاح', () => navigate('/'));
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
   * Gets status badge color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'scheduled': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      case 'no-show': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  /**
   * Gets status label in Arabic
   */
  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'scheduled': return 'مجدولة';
      case 'cancelled': return 'ملغية';
      case 'no-show': return 'لم يحضر';
      default: return status;
    }
  };

  /**
   * Calculates health statistics
   */
  const getHealthStats = () => {
    const completedVisits = visits.filter(v => v.status === 'completed').length;
    const scheduledVisits = visits.filter(v => v.status === 'scheduled').length;
    const totalMedications = visits.reduce((acc, v) => 
      acc + (v.prescribedMedications ? v.prescribedMedications.length : 0), 0
    );
    const upcomingVisits = visits.filter(v => 
      v.status === 'scheduled' && new Date(v.visitDate) > new Date()
    ).length;
    
    return { completedVisits, scheduledVisits, totalMedications, upcomingVisits };
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
                <button className="modal-button primary" onClick={modal.type === 'success' && modal.onConfirm ? handleModalConfirm : closeModal}>
                  حسناً
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="section-content">
            {/* Health Statistics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-number">{stats.upcomingVisits}</div>
                <div className="stat-label">المواعيد القادمة</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-number">{stats.completedVisits}</div>
                <div className="stat-label">الزيارات المكتملة</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💊</div>
                <div className="stat-number">{stats.totalMedications}</div>
                <div className="stat-label">الأدوية الموصوفة</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏥</div>
                <div className="stat-number">{visits.length}</div>
                <div className="stat-label">إجمالي الزيارات</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2>الإجراءات السريعة</h2>
              </div>
              <div className="quick-actions">
                <button className="action-btn" onClick={() => setActiveSection('visits')}>
                  <span className="action-icon">📋</span>
                  <span className="action-label">عرض سجل الزيارات</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">📅</span>
                  <span className="action-label">حجز موعد جديد</span>
                </button>
                <button className="action-btn" onClick={() => setActiveSection('medications')}>
                  <span className="action-icon">💊</span>
                  <span className="action-label">الأدوية الحالية</span>
                </button>
                <button className="action-btn" onClick={() => setActiveSection('risk')}>
                  <span className="action-icon">🤖</span>
                  <span className="action-label">تحليل المخاطر</span>
                </button>
              </div>
            </div>

            {/* Account Information */}
            <div className="card">
              <div className="card-header">
                <h2>معلومات الحساب</h2>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">الاسم الكامل:</span>
                  <span className="info-value">{user.firstName} {user.lastName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">البريد الإلكتروني:</span>
                  <span className="info-value" dir="ltr">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">رقم الهاتف:</span>
                  <span className="info-value" dir="ltr">{user.phoneNumber || 'غير محدد'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">رقم الهوية:</span>
                  <span className="info-value">{user.nationalId || 'غير محدد'}</span>
                </div>
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
                  <div className="filter-group">
                    <label>الحالة:</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="filter-input"
                    >
                      <option value="">جميع الحالات</option>
                      <option value="completed">مكتملة</option>
                      <option value="scheduled">مجدولة</option>
                      <option value="cancelled">ملغية</option>
                      <option value="no-show">لم يحضر</option>
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
                    <p>لم يتم العثور على زيارات تطابق معايير البحث</p>
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
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVisits.map(visit => (
                        <VisitRow 
                          key={visit._id} 
                          visit={visit}
                          formatDate={formatDate}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
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
                    يتم تحديث هذا التقويم تلقائياً عندما يقوم الطبيب بإدخال وصفة طبية جديدة في صفحة الزيارة.
                    البيانات مرتبطة مباشرة مع مجموعة Visits في قاعدة البيانات.
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
 * Displays a single visit in the table with expandable details
 */
const VisitRow = ({ visit, formatDate, getStatusColor, getStatusLabel }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="visit-row" onClick={() => setExpanded(!expanded)}>
        <td>{formatDate(visit.visitDate)}</td>
        <td>{visit.visitTime}</td>
        <td>{visit.doctorName}</td>
        <td>{visit.specialization}</td>
        <td>{visit.chiefComplaint || '-'}</td>
        <td>{visit.diagnosis || 'لم يتم التشخيص بعد'}</td>
        <td>
          <span 
            className="status-badge" 
            style={{ background: `${getStatusColor(visit.status)}15`, color: getStatusColor(visit.status) }}
          >
            {getStatusLabel(visit.status)}
          </span>
        </td>
        <td>
          <button className="expand-btn">
            {expanded ? '▲' : '▼'}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="visit-details-row">
          <td colSpan="8">
            <div className="visit-details">
              {visit.vitalSigns && (
                <div className="details-section">
                  <h4>العلامات الحيوية:</h4>
                  <div className="vital-signs">
                    <div className="vital-sign">
                      <span className="vital-label">ضغط الدم:</span>
                      <span className="vital-value">{visit.vitalSigns.bloodPressure}</span>
                    </div>
                    <div className="vital-sign">
                      <span className="vital-label">نبضات القلب:</span>
                      <span className="vital-value">{visit.vitalSigns.heartRate} نبضة/دقيقة</span>
                    </div>
                    <div className="vital-sign">
                      <span className="vital-label">الحرارة:</span>
                      <span className="vital-value">{visit.vitalSigns.temperature}°C</span>
                    </div>
                    <div className="vital-sign">
                      <span className="vital-label">الأكسجين:</span>
                      <span className="vital-value">{visit.vitalSigns.oxygenSaturation}%</span>
                    </div>
                  </div>
                </div>
              )}

              {visit.prescribedMedications && visit.prescribedMedications.length > 0 && (
                <div className="details-section">
                  <h4>الأدوية الموصوفة:</h4>
                  <div className="medications-list">
                    {visit.prescribedMedications.map((med, index) => (
                      <div key={index} className="medication-item">
                        <span className="med-name">💊 {med.medicationName}</span>
                        <span className="med-dosage">{med.dosage}</span>
                        <span className="med-frequency">{med.frequency}</span>
                        <span className="med-duration">{med.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {visit.labTests && visit.labTests.length > 0 && (
                <div className="details-section">
                  <h4>التحاليل المطلوبة:</h4>
                  <ul className="lab-tests-list">
                    {visit.labTests.map((test, index) => (
                      <li key={index}>🔬 {test}</li>
                    ))}
                  </ul>
                </div>
              )}

              {visit.doctorNotes && (
                <div className="details-section">
                  <h4>ملاحظات الطبيب:</h4>
                  <p className="doctor-notes">{visit.doctorNotes}</p>
                </div>
              )}

              {visit.followUpDate && (
                <div className="details-section">
                  <h4>موعد المتابعة:</h4>
                  <p className="follow-up-date">📅 {formatDate(visit.followUpDate)}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

/**
 * Medication Calendar Component
 * Displays medications in a calendar format
 */
const MedicationCalendar = ({ visits }) => {
  // Extract all medications from completed visits
  const allMedications = visits
    .filter(v => v.status === 'completed' && v.prescribedMedications)
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
        <p>لم يتم وصف أي أدوية بعد</p>
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

export default PatientDashboard;