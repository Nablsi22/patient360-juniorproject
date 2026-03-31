// ============================================================================
// LAB DASHBOARD — Patient 360°
// ============================================================================
// Design System : Teal Medica | Typography: Cairo (RTL)
// DB Collections: lab_technicians, lab_tests, laboratories, persons, patients
// Workflow      : ordered → sample_collected → in_progress → completed
// ============================================================================

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeProvider';
import '../styles/LabDashboard.css';

// ============================================================================
// CONSTANTS — Matching DB Enums
// ============================================================================

const TEST_CATEGORIES = [
  { id: 'blood', label: 'دم', icon: '🩸' },
  { id: 'urine', label: 'بول', icon: '🧪' },
  { id: 'stool', label: 'براز', icon: '🔬' },
  { id: 'imaging', label: 'تصوير', icon: '📷' },
  { id: 'microbiology', label: 'أحياء دقيقة', icon: '🦠' },
  { id: 'molecular', label: 'جزيئي', icon: '🧬' },
  { id: 'biopsy', label: 'خزعة', icon: '🔬' },
  { id: 'other', label: 'أخرى', icon: '📋' }
];

const SAMPLE_TYPES = [
  { id: 'blood', label: 'دم' }, { id: 'urine', label: 'بول' },
  { id: 'stool', label: 'براز' }, { id: 'tissue', label: 'نسيج' },
  { id: 'swab', label: 'مسحة' }, { id: 'saliva', label: 'لعاب' },
  { id: 'other', label: 'أخرى' }
];

const PRIORITY_CONFIG = {
  routine: { label: 'روتيني', icon: '🟢', color: 'var(--tm-success)' },
  urgent: { label: 'عاجل', icon: '🟡', color: 'var(--tm-warning)' },
  stat: { label: 'طارئ', icon: '🔴', color: 'var(--tm-error)' }
};

const STATUS_CONFIG = {
  ordered: { label: 'مطلوب', icon: '📝', class: 'ordered' },
  scheduled: { label: 'محجوز', icon: '📅', class: 'scheduled' },
  sample_collected: { label: 'تم أخذ العينة', icon: '🧪', class: 'collected' },
  in_progress: { label: 'قيد التحليل', icon: '⏳', class: 'progress' },
  completed: { label: 'مكتمل', icon: '✅', class: 'completed' },
  cancelled: { label: 'ملغي', icon: '❌', class: 'cancelled' },
  rejected: { label: 'مرفوض', icon: '🚫', class: 'rejected' }
};

// ============================================================================
// HELPERS
// ============================================================================

const formatDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LabDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const pdfInputRef = useRef(null);

  // ── Core ────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });

  // ── Pending Orders (search by patient) ──────────────────────────
  const [searchNationalId, setSearchNationalId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [patient, setPatient] = useState(null);
  const [pendingTests, setPendingTests] = useState([]);

  // ── All Lab Orders (for this lab) ───────────────────────────────
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState('all');

  // ── Active Test (processing) ────────────────────────────────────
  const [activeTest, setActiveTest] = useState(null);
  const [sampleId, setSampleId] = useState('');
  const [sampleType, setSampleType] = useState('blood');
  const [testResults, setTestResults] = useState([]);
  const [newResult, setNewResult] = useState({ testName: '', testCode: '', value: '', numericValue: '', unit: '', referenceRange: '', isAbnormal: false, isCritical: false });
  const [resultPdf, setResultPdf] = useState(null);
  const [labNotes, setLabNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isCriticalOverall, setIsCriticalOverall] = useState(false);

  // ── Stats ───────────────────────────────────────────────────────
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completedToday: 0, total: 0 });

  // ── Modal ───────────────────────────────────────────────────────
  const openModal = (type, title, message, onConfirm = null) => setModal({ isOpen: true, type, title, message, onConfirm });
  const closeModal = () => { if (modal.onConfirm) modal.onConfirm(); setModal({ isOpen: false, type: '', title: '', message: '', onConfirm: null }); };

  // ============================================================================
  // INIT
  // ============================================================================

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const currentUser = authAPI.getCurrentUser();
      if (!currentUser) { openModal('error', 'غير مصرح', 'يجب عليك تسجيل الدخول أولاً', () => navigate('/')); return; }
      if (!currentUser.roles?.includes('lab_technician')) { openModal('error', 'غير مصرح', 'هذه الصفحة متاحة لفنيي المختبر فقط', () => navigate('/')); return; }
      setUser(currentUser);
      setLoading(false);
    };
    init();
  }, [navigate]);

  // Load stats on mount
  useEffect(() => {
    if (!user) return;
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/lab/stats', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.success) setStats(data.stats || stats);
      } catch (e) { console.error('Stats error:', e); }
    };
    loadStats();
  }, [user]);

  // ============================================================================
  // SEARCH PATIENT — Step 2-3 of lab workflow
  // ============================================================================

  const handleSearchPatient = async () => {
    if (!searchNationalId.trim() || searchNationalId.length !== 11) {
      setSearchError('الرجاء إدخال رقم وطني صحيح (11 رقم)');
      return;
    }
    setSearchLoading(true); setSearchError(''); setPatient(null); setPendingTests([]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/lab/patient/${searchNationalId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPatient(data.patient);
        setPendingTests(data.labTests || []);
      } else {
        setSearchError(data.message || 'لم يتم العثور على المريض أو لا توجد طلبات تحاليل');
      }
    } catch (e) {
      console.error('Search error:', e);
      setSearchError('حدث خطأ في الاتصال بالخادم');
    } finally { setSearchLoading(false); }
  };

  // ============================================================================
  // SAMPLE COLLECTION — Step 4
  // ============================================================================

  const handleCollectSample = async (test) => {
    if (!sampleId.trim()) { openModal('error', 'خطأ', 'الرجاء إدخال رقم تعريف العينة (Barcode)'); return; }
    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/lab/test/${test._id}/collect-sample`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sampleId, sampleType })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        openModal('success', 'تم تسجيل العينة ✅', `تم تسجيل العينة رقم: ${sampleId}`);
        setSampleId('');
        handleSearchPatient(); // Refresh
      } else {
        openModal('error', 'خطأ', data.message || 'حدث خطأ');
      }
    } catch (e) { openModal('error', 'خطأ', 'حدث خطأ في الاتصال'); }
    finally { setProcessing(false); }
  };

  // ============================================================================
  // START PROCESSING — Status → in_progress
  // ============================================================================

  const handleStartProcessing = async (test) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/lab/test/${test._id}/start`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveTest({ ...test, status: 'in_progress' });
        setTestResults((test.testsOrdered || []).map(t => ({
          testName: t.testName, testCode: t.testCode || '',
          value: '', numericValue: '', unit: '', referenceRange: '',
          isAbnormal: false, isCritical: false
        })));
        setActiveTab('process');
      }
    } catch (e) { openModal('error', 'خطأ', 'حدث خطأ'); }
  };

  // ============================================================================
  // SUBMIT RESULTS + PDF — Step 5 (final)
  // ============================================================================

  const handleSubmitResults = async () => {
    const filledResults = testResults.filter(r => r.value.trim());
    if (filledResults.length === 0 && !resultPdf) {
      openModal('error', 'خطأ', 'الرجاء إدخال نتيجة واحدة على الأقل أو رفع ملف PDF');
      return;
    }
    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('testResults', JSON.stringify(filledResults));
      formData.append('labNotes', labNotes);
      formData.append('isCritical', isCriticalOverall || filledResults.some(r => r.isCritical));

      if (resultPdf) {
        formData.append('resultPdf', resultPdf);
      }

      const res = await fetch(`http://localhost:5000/api/lab/test/${activeTest._id}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.success) {
        openModal('success', 'تم إرسال النتائج ✅',
          `تم إكمال التحليل ${activeTest.testNumber}\n\nالنتائج متاحة الآن للطبيب والمريض.`
        );
        setActiveTest(null); setTestResults([]); setResultPdf(null);
        setLabNotes(''); setIsCriticalOverall(false);
        setActiveTab('pending');
        handleSearchPatient();
      } else {
        openModal('error', 'خطأ', data.message || 'حدث خطأ أثناء حفظ النتائج');
      }
    } catch (e) { openModal('error', 'خطأ', 'حدث خطأ في الاتصال'); }
    finally { setProcessing(false); }
  };

  // ============================================================================
  // LOAD ALL ORDERS (History tab)
  // ============================================================================

  useEffect(() => {
    if (activeTab === 'history' && user) {
      const loadOrders = async () => {
        setOrdersLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:5000/api/lab/orders', { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (res.ok && data.success) setAllOrders(data.orders || []);
        } catch (e) { console.error('Orders error:', e); }
        finally { setOrdersLoading(false); }
      };
      loadOrders();
    }
  }, [activeTab, user]);

  const handleLogout = () => openModal('confirm', 'تأكيد تسجيل الخروج', 'هل أنت متأكد من رغبتك في تسجيل الخروج؟', () => authAPI.logout());

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { openModal('error', 'خطأ', 'حجم الملف يجب أن يكون أقل من 10MB'); return; }
    if (!file.type.includes('pdf')) { openModal('error', 'خطأ', 'يجب أن يكون الملف بصيغة PDF'); return; }
    setResultPdf(file);
  };

  const updateResult = (index, field, value) => {
    const updated = [...testResults];
    updated[index][field] = value;
    setTestResults(updated);
  };

  const addManualResult = () => {
    if (!newResult.testName.trim()) return;
    setTestResults([...testResults, { ...newResult }]);
    setNewResult({ testName: '', testCode: '', value: '', numericValue: '', unit: '', referenceRange: '', isAbnormal: false, isCritical: false });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) return (<div className="lab-loading"><div className="lab-spinner"></div><p>جاري التحميل...</p></div>);
  if (!user) return null;

  const filteredOrders = ordersFilter === 'all' ? allOrders : allOrders.filter(o => o.status === ordersFilter);

  return (
    <div className="lab-dashboard" dir="rtl">
      <Navbar />

      {/* Modal */}
      {modal.isOpen && (
        <div className="lab-modal-overlay" onClick={closeModal}>
          <div className="lab-modal" onClick={e => e.stopPropagation()}>
            <div className={`lab-modal-header ${modal.type}`}>
              <span>{modal.type === 'success' ? '✅' : modal.type === 'error' ? '❌' : '❓'}</span>
              <h3>{modal.title}</h3>
            </div>
            <div className="lab-modal-body"><p>{modal.message}</p></div>
            <div className="lab-modal-footer">
              {modal.type === 'confirm' ? (
                <><button className="lab-btn secondary" onClick={() => setModal({ ...modal, isOpen: false })}>إلغاء</button>
                <button className="lab-btn primary" onClick={closeModal}>تأكيد</button></>
              ) : (
                <button className="lab-btn primary" onClick={() => setModal({ ...modal, isOpen: false, onConfirm: null })}>حسناً</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="lab-container">
        {/* ── Profile ──────────────────────────────────────────────── */}
        <div className="lab-profile-card">
          <button className="lab-logout-btn" onClick={handleLogout}><span>🚪</span> تسجيل الخروج</button>
          <div className="lab-profile-content">
            <div className="lab-avatar"><span>🔬</span></div>
            <div className="lab-profile-info">
              <p className="lab-greeting">مرحباً 👋</p>
              <h1>{user.firstName} {user.fatherName && `${user.fatherName} `}{user.lastName}</h1>
              <p className="lab-role">فني مختبر — Patient 360°</p>
              <div className="lab-meta">
                {user.roleData?.lab_technician?.licenseNumber && <span className="meta-chip">📋 {user.roleData.lab_technician.licenseNumber}</span>}
                {user.roleData?.lab_technician?.specialization && <span className="meta-chip">🔬 {user.roleData.lab_technician.specialization}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Stats ──────────────────────────────────────────── */}
        <div className="lab-stats-grid">
          <div className="lab-stat-card pending" onClick={() => setActiveTab('pending')}><span className="stat-icon">📝</span><h3>{stats.pending}</h3><p>طلب قيد الانتظار</p></div>
          <div className="lab-stat-card progress"><span className="stat-icon">⏳</span><h3>{stats.inProgress}</h3><p>قيد التحليل</p></div>
          <div className="lab-stat-card done"><span className="stat-icon">✅</span><h3>{stats.completedToday}</h3><p>مكتمل اليوم</p></div>
          <div className="lab-stat-card total"><span className="stat-icon">📊</span><h3>{stats.total}</h3><p>إجمالي التحاليل</p></div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <div className="lab-tabs">
          {[
            { id: 'pending', icon: '📝', label: 'الطلبات الواردة' },
            { id: 'process', icon: '🧪', label: 'إدخال النتائج', disabled: !activeTest },
            { id: 'history', icon: '📋', label: 'سجل التحاليل' }
          ].map(tab => (
            <button key={tab.id} disabled={tab.disabled}
              className={`lab-tab ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}>
              <span>{tab.icon}</span><span>{tab.label}</span>
              {tab.id === 'process' && activeTest && <span className="tab-dot"></span>}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: PENDING ORDERS — Search patient + view orders
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'pending' && (
          <div className="lab-section">
            {/* Search */}
            <div className="lab-card">
              <div className="card-header"><span>🔍</span><h2>البحث عن طلبات تحاليل بالرقم الوطني</h2></div>
              <div className="search-row">
                <input type="text" dir="ltr" placeholder="أدخل الرقم الوطني (11 رقم)..." maxLength={11}
                  value={searchNationalId} onChange={e => setSearchNationalId(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleSearchPatient()} className="lab-input" />
                <button className="lab-btn primary" onClick={handleSearchPatient} disabled={searchLoading}>
                  {searchLoading ? <><span className="btn-spinner"></span> جاري البحث...</> : <><span>🔎</span> بحث</>}
                </button>
              </div>
              {searchError && <div className="lab-alert error"><span>⚠️</span><p>{searchError}</p></div>}
            </div>

            {/* Patient Info */}
            {patient && (
              <div className="lab-card patient-card">
                <div className="patient-header">
                  <div className="patient-avatar"><span>{patient.gender === 'male' ? '👨' : '👩'}</span></div>
                  <div className="patient-info">
                    <h3>{patient.firstName} {patient.fatherName && `${patient.fatherName} `}{patient.lastName}</h3>
                    <div className="patient-meta">
                      <span>🆔 {patient.nationalId}</span>
                      {patient.dateOfBirth && <span>🎂 {formatDate(patient.dateOfBirth)}</span>}
                      {patient.bloodType && <span>🩸 {patient.bloodType}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Tests */}
            {patient && pendingTests.length > 0 && (
              <div className="lab-card">
                <div className="card-header"><span>📋</span><h2>طلبات التحاليل ({pendingTests.length})</h2></div>
                <div className="tests-list">
                  {pendingTests.map((test, i) => {
                    const statusInfo = STATUS_CONFIG[test.status] || STATUS_CONFIG.ordered;
                    const priorityInfo = PRIORITY_CONFIG[test.priority] || PRIORITY_CONFIG.routine;
                    const canCollect = test.status === 'ordered' || test.status === 'scheduled';
                    const canProcess = test.status === 'sample_collected';

                    return (
                      <div key={test._id || i} className={`test-order-card ${statusInfo.class} ${test.priority === 'stat' ? 'stat-priority' : ''}`}>
                        <div className="test-card-header">
                          <div className="test-header-info">
                            <span className="test-number">{test.testNumber}</span>
                            <span className="test-date">📅 {formatDate(test.orderDate)}</span>
                            {test.orderedBy?.firstName && <span className="test-doctor">👨‍⚕️ د. {test.orderedBy.firstName} {test.orderedBy.lastName}</span>}
                          </div>
                          <div className="test-badges">
                            <span className={`status-badge ${statusInfo.class}`}>{statusInfo.icon} {statusInfo.label}</span>
                            <span className="priority-badge" style={{ color: priorityInfo.color }}>{priorityInfo.icon} {priorityInfo.label}</span>
                          </div>
                        </div>

                        {/* Tests Ordered */}
                        <div className="ordered-tests-list">
                          <span className="tests-label">التحاليل المطلوبة:</span>
                          {(test.testsOrdered || []).map((t, j) => (
                            <div key={j} className="ordered-test-chip">
                              <span className="test-code">{t.testCode}</span>
                              <span className="test-name">{t.testName}</span>
                              {t.notes && <span className="test-note" title={t.notes}>📝</span>}
                            </div>
                          ))}
                        </div>

                        {test.testCategory && (
                          <div className="test-category">
                            <span>{TEST_CATEGORIES.find(c => c.id === test.testCategory)?.icon || '📋'}</span>
                            <span>{TEST_CATEGORIES.find(c => c.id === test.testCategory)?.label || test.testCategory}</span>
                          </div>
                        )}

                        {/* Sample Collection */}
                        {canCollect && (
                          <div className="sample-collection-section">
                            <h4>📥 تسجيل العينة</h4>
                            <div className="sample-row">
                              <input type="text" placeholder="رقم تعريف العينة (Barcode)" dir="ltr"
                                value={sampleId} onChange={e => setSampleId(e.target.value)} className="lab-input" />
                              <select value={sampleType} onChange={e => setSampleType(e.target.value)} className="lab-select">
                                {SAMPLE_TYPES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
                              </select>
                              <button className="lab-btn primary" onClick={() => handleCollectSample(test)} disabled={processing}>
                                {processing ? <span className="btn-spinner"></span> : <><span>🧪</span> تسجيل العينة</>}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Start Processing */}
                        {canProcess && (
                          <button className="lab-btn primary start-btn" onClick={() => handleStartProcessing(test)}>
                            <span>⚗️</span> بدء التحليل وإدخال النتائج
                          </button>
                        )}

                        {test.sampleId && (
                          <div className="sample-info"><span>🏷️</span> رقم العينة: <strong dir="ltr">{test.sampleId}</strong></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {patient && pendingTests.length === 0 && (
              <div className="lab-empty"><span>📋</span><h3>لا توجد طلبات تحاليل لهذا المريض</h3></div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: RESULT ENTRY — Enter values + upload PDF
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'process' && activeTest && (
          <div className="lab-section">
            <div className="lab-card process-card">
              <div className="card-header process-header">
                <span>🧪</span>
                <div>
                  <h2>إدخال نتائج التحليل</h2>
                  <p className="process-subtitle">{activeTest.testNumber} — {activeTest.testsOrdered?.map(t => t.testName).join(', ')}</p>
                </div>
              </div>

              {/* Results Table */}
              <div className="results-entry-section">
                <h3>📊 نتائج التحاليل</h3>
                <div className="results-table-entry">
                  <div className="results-header-row">
                    <span>التحليل</span><span>الرمز</span><span>النتيجة</span>
                    <span>القيمة الرقمية</span><span>الوحدة</span><span>المرجع</span>
                    <span>الحالة</span>
                  </div>
                  {testResults.map((result, i) => (
                    <div key={i} className={`result-entry-row ${result.isAbnormal ? 'abnormal' : ''} ${result.isCritical ? 'critical' : ''}`}>
                      <input type="text" value={result.testName} onChange={e => updateResult(i, 'testName', e.target.value)} className="lab-input-sm" placeholder="الاسم" />
                      <input type="text" value={result.testCode} onChange={e => updateResult(i, 'testCode', e.target.value)} className="lab-input-sm" dir="ltr" placeholder="Code" />
                      <input type="text" value={result.value} onChange={e => updateResult(i, 'value', e.target.value)} className="lab-input-sm" dir="ltr" placeholder="القيمة" />
                      <input type="number" value={result.numericValue} onChange={e => updateResult(i, 'numericValue', e.target.value)} className="lab-input-sm" dir="ltr" placeholder="رقمي" />
                      <input type="text" value={result.unit} onChange={e => updateResult(i, 'unit', e.target.value)} className="lab-input-sm" dir="ltr" placeholder="mg/dL" />
                      <input type="text" value={result.referenceRange} onChange={e => updateResult(i, 'referenceRange', e.target.value)} className="lab-input-sm" dir="ltr" placeholder="70-100" />
                      <div className="result-flags">
                        <label className="flag-check" title="غير طبيعي">
                          <input type="checkbox" checked={result.isAbnormal} onChange={e => updateResult(i, 'isAbnormal', e.target.checked)} />
                          <span>🟡</span>
                        </label>
                        <label className="flag-check" title="حرج">
                          <input type="checkbox" checked={result.isCritical} onChange={e => updateResult(i, 'isCritical', e.target.checked)} />
                          <span>🔴</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add manual result row */}
                <div className="add-result-row">
                  <input type="text" placeholder="اسم التحليل" value={newResult.testName} onChange={e => setNewResult({ ...newResult, testName: e.target.value })} className="lab-input-sm" />
                  <input type="text" placeholder="Code" dir="ltr" value={newResult.testCode} onChange={e => setNewResult({ ...newResult, testCode: e.target.value })} className="lab-input-sm" />
                  <button className="lab-btn outline add-btn" onClick={addManualResult}>➕ إضافة</button>
                </div>
              </div>

              {/* PDF Upload */}
              <div className="pdf-upload-section">
                <h3>📄 رفع تقرير النتائج (PDF)</h3>
                {!resultPdf ? (
                  <label className="pdf-upload-area">
                    <input type="file" accept=".pdf" ref={pdfInputRef} onChange={handlePdfUpload} className="hidden-input" />
                    <div className="upload-content">
                      <span className="upload-icon">📤</span>
                      <h4>اضغط لرفع ملف PDF</h4>
                      <p>تقرير نتائج التحاليل — حتى 10MB</p>
                    </div>
                  </label>
                ) : (
                  <div className="pdf-preview">
                    <span>📄</span>
                    <div className="pdf-info">
                      <span className="pdf-name">{resultPdf.name}</span>
                      <span className="pdf-size">({(resultPdf.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button className="remove-pdf-btn" onClick={() => { setResultPdf(null); if (pdfInputRef.current) pdfInputRef.current.value = ''; }}>✕ إزالة</button>
                  </div>
                )}
              </div>

              {/* Lab Notes + Critical Flag */}
              <div className="notes-section">
                <textarea placeholder="ملاحظات فني المختبر (اختياري)..." value={labNotes}
                  onChange={e => setLabNotes(e.target.value)} className="lab-textarea" rows={3} />
                <label className="critical-flag-check">
                  <input type="checkbox" checked={isCriticalOverall} onChange={e => setIsCriticalOverall(e.target.checked)} />
                  <span className="critical-flag-label">🔴 تصنيف كنتيجة حرجة (يتطلب إجراء فوري من الطبيب)</span>
                </label>
              </div>

              {/* Submit */}
              <button className="lab-btn primary submit-btn" onClick={handleSubmitResults} disabled={processing}>
                {processing ? <><span className="btn-spinner"></span> جاري الحفظ...</> :
                  <><span>✅</span> إرسال النتائج وإكمال التحليل</>}
              </button>

              <div className="submit-info">
                <span>ℹ️</span>
                <p>بعد الإرسال، ستكون النتائج متاحة للطبيب المعالج والمريض تلقائياً عبر المنصة.</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: HISTORY — All completed tests
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="lab-section">
            <div className="lab-card">
              <div className="card-header"><span>📋</span><h2>سجل التحاليل</h2><span className="count-badge">{allOrders.length}</span></div>

              <div className="history-filters">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'completed', label: '✅ مكتمل' },
                  { id: 'in_progress', label: '⏳ قيد التحليل' },
                  { id: 'sample_collected', label: '🧪 عينات' },
                  { id: 'ordered', label: '📝 مطلوب' }
                ].map(f => (
                  <button key={f.id} className={`filter-btn ${ordersFilter === f.id ? 'active' : ''}`} onClick={() => setOrdersFilter(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>

              {ordersLoading && <div className="lab-loading-inline"><span className="btn-spinner"></span> جاري التحميل...</div>}

              {!ordersLoading && filteredOrders.length === 0 && (
                <div className="lab-empty"><span>📋</span><h3>لا توجد تحاليل</h3></div>
              )}

              {!ordersLoading && filteredOrders.length > 0 && (
                <div className="history-list">
                  {filteredOrders.map((order, i) => {
                    const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.ordered;
                    return (
                      <div key={order._id || i} className={`history-card ${statusInfo.class} ${order.isCritical ? 'critical-border' : ''}`}>
                        <div className="history-card-header">
                          <div className="history-info">
                            <span className="history-number">{order.testNumber}</span>
                            <span className="history-date">{formatDateTime(order.orderDate)}</span>
                          </div>
                          <span className={`status-badge ${statusInfo.class}`}>{statusInfo.icon} {statusInfo.label}</span>
                        </div>
                        <div className="history-card-body">
                          <div className="history-tests">
                            {(order.testsOrdered || []).map((t, j) => (
                              <span key={j} className="history-test-chip">{t.testCode || '🔬'} {t.testName}</span>
                            ))}
                          </div>
                          {order.patientName && <span className="history-patient">👤 {order.patientName}</span>}
                          {order.completedAt && <span className="history-completed">✅ اكتمل: {formatDateTime(order.completedAt)}</span>}
                          {order.resultPdfUrl && (
                            <a href={order.resultPdfUrl} target="_blank" rel="noopener noreferrer" className="pdf-link">📄 عرض التقرير PDF</a>
                          )}
                          <div className="history-meta">
                            {order.sampleId && <span>🏷️ العينة: {order.sampleId}</span>}
                            {order.isCritical && <span className="critical-badge">🔴 حرج</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabDashboard;
