// ============================================================================
// PHARMACIST DASHBOARD — Patient 360°
// ============================================================================
// Design System : Teal Medica | Typography: Cairo (RTL)
// DB Collections: pharmacists, prescriptions, pharmacy_dispensing,
//                 medications, pharmacy_inventory, persons, patients
// Workflow      : Prescription-based dispensing + OTC dispensing
// ============================================================================

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeProvider';
import '../styles/PharmacistDashboard.css';

// ============================================================================
// CONSTANTS — Matching DB Enums
// ============================================================================

const PAYMENT_METHODS = [
  { id: 'cash', label: 'نقدي', icon: '💵' },
  { id: 'card', label: 'بطاقة', icon: '💳' },
  { id: 'insurance', label: 'تأمين', icon: '🏥' },
  { id: 'free', label: 'مجاني', icon: '🎁' }
];

const COMMON_OTC_MEDICATIONS = [
  { name: 'Paracetamol (Panadol)', arabicName: 'باراسيتامول (بنادول)', category: 'analgesic', dosageForm: 'tablet', strength: '500mg' },
  { name: 'Ibuprofen', arabicName: 'ايبوبروفين', category: 'analgesic', dosageForm: 'tablet', strength: '400mg' },
  { name: 'Antacid (Gaviscon)', arabicName: 'مضاد حموضة (غافيسكون)', category: 'gastrointestinal', dosageForm: 'syrup', strength: '200ml' },
  { name: 'Loratadine (Claritine)', arabicName: 'لوراتادين (كلاريتين)', category: 'antihistamine', dosageForm: 'tablet', strength: '10mg' },
  { name: 'Vitamin C', arabicName: 'فيتامين سي', category: 'vitamin', dosageForm: 'tablet', strength: '1000mg' },
  { name: 'Vitamin D3', arabicName: 'فيتامين دي3', category: 'vitamin', dosageForm: 'capsule', strength: '1000IU' },
  { name: 'Oral Rehydration Salts', arabicName: 'أملاح إماهة فموية', category: 'supplement', dosageForm: 'powder', strength: '20.5g' },
  { name: 'Cough Syrup (Dextromethorphan)', arabicName: 'شراب سعال', category: 'respiratory', dosageForm: 'syrup', strength: '100ml' },
  { name: 'Eye Drops (Artificial Tears)', arabicName: 'قطرة عين مرطبة', category: 'dermatological', dosageForm: 'drops', strength: '10ml' },
  { name: 'Antiseptic Cream', arabicName: 'كريم مطهر', category: 'dermatological', dosageForm: 'cream', strength: '30g' },
  { name: 'Loperamide (Imodium)', arabicName: 'لوبيراميد (إيموديوم)', category: 'gastrointestinal', dosageForm: 'capsule', strength: '2mg' },
  { name: 'Multivitamin', arabicName: 'فيتامينات متعددة', category: 'vitamin', dosageForm: 'tablet', strength: '' }
];

const ROUTE_LABELS = {
  oral: '💊 فموي', topical: '🧴 موضعي', injection: '💉 حقن',
  inhalation: '🫁 استنشاق', sublingual: '👅 تحت اللسان',
  rectal: 'شرجي', other: 'أخرى'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const isExpired = (date) => date ? new Date(date) < new Date() : false;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const verificationRef = useRef(null);

  // ── Core State ──────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });

  // ── Prescription Tab State ──────────────────────────────────────
  const [searchNationalId, setSearchNationalId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [patient, setPatient] = useState(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [dispensing, setDispensing] = useState(false);
  const [dispenseMeds, setDispenseMeds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [pharmacistNotes, setPharmacistNotes] = useState('');

  // ── OTC Tab State ───────────────────────────────────────────────
  const [otcPatientId, setOtcPatientId] = useState('');
  const [otcPatient, setOtcPatient] = useState(null);
  const [otcMedications, setOtcMedications] = useState([]);
  const [otcNewMed, setOtcNewMed] = useState({ medicationName: '', quantity: 1, unitPrice: 0 });
  const [otcReason, setOtcReason] = useState('');
  const [otcNotes, setOtcNotes] = useState('');
  const [otcPayment, setOtcPayment] = useState('cash');
  const [otcDispensing, setOtcDispensing] = useState(false);
  const [showOtcList, setShowOtcList] = useState(false);

  // ── History Tab State ───────────────────────────────────────────
  const [dispensingHistory, setDispensingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  // ── Modal ───────────────────────────────────────────────────────
  const openModal = (type, title, message, onConfirm = null) => setModal({ isOpen: true, type, title, message, onConfirm });
  const closeModal = () => { if (modal.onConfirm) modal.onConfirm(); setModal({ isOpen: false, type: '', title: '', message: '', onConfirm: null }); };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const currentUser = authAPI.getCurrentUser();
      if (!currentUser) { openModal('error', 'غير مصرح', 'يجب عليك تسجيل الدخول أولاً', () => navigate('/')); return; }
      if (!currentUser.roles?.includes('pharmacist')) { openModal('error', 'غير مصرح', 'هذه الصفحة متاحة للصيادلة فقط', () => navigate('/')); return; }
      setUser(currentUser);
      setLoading(false);
    };
    init();
  }, [navigate]);

  // ============================================================================
  // PRESCRIPTION WORKFLOW — Steps 3-6 from DB workflow
  // ============================================================================

  /** Step 3: Patient shows national ID → pharmacist searches */
  const handleSearchPatient = async () => {
    if (!searchNationalId.trim() || searchNationalId.length !== 11) {
      setSearchError('الرجاء إدخال رقم وطني صحيح (11 رقم)');
      return;
    }
    setSearchLoading(true);
    setSearchError('');
    setPatient(null);
    setPatientPrescriptions([]);
    setSelectedPrescription(null);
    setIsVerified(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pharmacist/patient/${searchNationalId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setPatient(data.patient);
        setPatientPrescriptions(data.prescriptions || []);
      } else {
        setSearchError(data.message || 'لم يتم العثور على المريض');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSearchLoading(false);
    }
  };

  /** Step 4: Pharmacist selects prescription and enters verification code */
  const handleSelectPrescription = (rx) => {
    setSelectedPrescription(rx);
    setVerificationCode('');
    setIsVerified(false);
    setVerificationError('');
    setDispenseMeds(
      (rx.medications || []).map(med => ({
        ...med,
        selected: !med.isDispensed,
        quantityToDispense: med.quantity || 1,
        isGenericSubstitute: false,
        pharmacistNotes: ''
      }))
    );
    setTimeout(() => verificationRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  /** Step 4b: Verify prescription code */
  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
      setVerificationError('الرجاء إدخال رمز التحقق');
      return;
    }
    if (verificationCode !== selectedPrescription.verificationCode) {
      setVerificationError('رمز التحقق غير صحيح');
      return;
    }
    setIsVerified(true);
    setVerificationError('');
  };

  /** Step 5: Dispense medications → creates pharmacy_dispensing record */
  const handleDispensePrescription = async () => {
    const selectedMeds = dispenseMeds.filter(m => m.selected && !m.isDispensed);
    if (selectedMeds.length === 0) {
      openModal('error', 'خطأ', 'الرجاء اختيار دواء واحد على الأقل للصرف');
      return;
    }
    setDispensing(true);

    try {
      const token = localStorage.getItem('token');
      const body = {
        prescriptionId: selectedPrescription._id,
        prescriptionNumber: selectedPrescription.prescriptionNumber,
        patientPersonId: patient.personId || patient._id,
        dispensingType: 'prescription_based',
        paymentMethod,
        notes: pharmacistNotes,
        medicationsDispensed: selectedMeds.map(med => ({
          medicationName: med.medicationName,
          quantityDispensed: med.quantityToDispense,
          isGenericSubstitute: med.isGenericSubstitute,
          pharmacistNotes: med.pharmacistNotes || ''
        }))
      };

      const response = await fetch('http://localhost:5000/api/pharmacist/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        openModal('success', 'تم الصرف بنجاح ✅', `تم صرف ${selectedMeds.length} دواء — رقم الصرف: ${data.dispensingNumber || ''}`);
        // Refresh prescriptions
        handleSearchPatient();
        setSelectedPrescription(null);
        setIsVerified(false);
        setPharmacistNotes('');
      } else {
        openModal('error', 'خطأ', data.message || 'حدث خطأ أثناء عملية الصرف');
      }
    } catch (error) {
      console.error('Dispense error:', error);
      openModal('error', 'خطأ', 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setDispensing(false);
    }
  };

  // ============================================================================
  // OTC WORKFLOW — Step 7 from DB workflow
  // ============================================================================

  const handleAddOtcMed = (med = null) => {
    const newMed = med ? {
      medicationName: med.name,
      arabicName: med.arabicName,
      quantity: 1,
      unitPrice: 0,
      id: Date.now()
    } : {
      medicationName: otcNewMed.medicationName,
      arabicName: '',
      quantity: otcNewMed.quantity,
      unitPrice: otcNewMed.unitPrice,
      id: Date.now()
    };

    if (!newMed.medicationName.trim()) {
      openModal('error', 'خطأ', 'الرجاء إدخال اسم الدواء');
      return;
    }

    setOtcMedications([...otcMedications, newMed]);
    setOtcNewMed({ medicationName: '', quantity: 1, unitPrice: 0 });
    setShowOtcList(false);
  };

  const handleRemoveOtcMed = (id) => {
    setOtcMedications(otcMedications.filter(m => m.id !== id));
  };

  /** OTC Dispense → creates pharmacy_dispensing with dispensingType='otc' */
  const handleOtcDispense = async () => {
    if (otcMedications.length === 0) {
      openModal('error', 'خطأ', 'الرجاء إضافة دواء واحد على الأقل');
      return;
    }
    if (!otcReason.trim()) {
      openModal('error', 'خطأ', 'سبب الصرف بدون وصفة مطلوب (حقل إلزامي)');
      return;
    }

    setOtcDispensing(true);

    try {
      const token = localStorage.getItem('token');
      const totalCost = otcMedications.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);

      const body = {
        dispensingType: 'otc',
        patientPersonId: otcPatient?.personId || null,
        paymentMethod: otcPayment,
        otcReason: otcReason.trim(),
        otcNotes: otcNotes.trim(),
        totalCost,
        currency: 'SYP',
        medicationsDispensed: otcMedications.map(med => ({
          medicationName: med.medicationName,
          quantityDispensed: med.quantity,
          unitPrice: med.unitPrice
        }))
      };

      const response = await fetch('http://localhost:5000/api/pharmacist/dispense-otc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        openModal('success', 'تم الصرف بنجاح ✅', `تم صرف ${otcMedications.length} دواء بدون وصفة — رقم العملية: ${data.dispensingNumber || ''}`);
        setOtcMedications([]);
        setOtcReason('');
        setOtcNotes('');
        setOtcPatient(null);
        setOtcPatientId('');
      } else {
        openModal('error', 'خطأ', data.message || 'حدث خطأ أثناء عملية الصرف');
      }
    } catch (error) {
      console.error('OTC dispense error:', error);
      openModal('error', 'خطأ', 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setOtcDispensing(false);
    }
  };

  // ============================================================================
  // HISTORY
  // ============================================================================

  useEffect(() => {
    if (activeTab === 'history' && user) {
      const loadHistory = async () => {
        setHistoryLoading(true);
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/pharmacist/dispensing-history', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok && data.success) {
            setDispensingHistory(data.history || []);
          }
        } catch (error) {
          console.error('History error:', error);
        } finally {
          setHistoryLoading(false);
        }
      };
      loadHistory();
    }
  }, [activeTab, user]);

  const handleLogout = () => openModal('confirm', 'تأكيد تسجيل الخروج', 'هل أنت متأكد من رغبتك في تسجيل الخروج؟', () => authAPI.logout());

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) return (
    <div className="pharm-loading"><div className="pharm-spinner"></div><p>جاري التحميل...</p></div>
  );
  if (!user) return null;

  const filteredHistory = historyFilter === 'all' ? dispensingHistory :
    dispensingHistory.filter(h => h.dispensingType === historyFilter);

  return (
    <div className="pharmacist-dashboard" dir="rtl">
      <Navbar />

      {/* Modal */}
      {modal.isOpen && (
        <div className="pharm-modal-overlay" onClick={closeModal}>
          <div className="pharm-modal" onClick={e => e.stopPropagation()}>
            <div className={`pharm-modal-header ${modal.type}`}>
              <span>{modal.type === 'success' ? '✅' : modal.type === 'error' ? '❌' : '❓'}</span>
              <h3>{modal.title}</h3>
            </div>
            <div className="pharm-modal-body"><p>{modal.message}</p></div>
            <div className="pharm-modal-footer">
              {modal.type === 'confirm' ? (
                <>
                  <button className="pharm-btn secondary" onClick={() => setModal({ ...modal, isOpen: false })}>إلغاء</button>
                  <button className="pharm-btn primary" onClick={closeModal}>تأكيد</button>
                </>
              ) : (
                <button className="pharm-btn primary" onClick={() => setModal({ ...modal, isOpen: false, onConfirm: null })}>حسناً</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="pharm-container">
        {/* ── Profile Header ──────────────────────────────────────── */}
        <div className="pharm-profile-card">
          <button className="pharm-logout-btn" onClick={handleLogout}><span>🚪</span> تسجيل الخروج</button>
          <div className="pharm-profile-content">
            <div className="pharm-avatar"><span>💊</span></div>
            <div className="pharm-profile-info">
              <p className="pharm-greeting">مرحباً 👋</p>
              <h1>{user.firstName} {user.fatherName && `${user.fatherName} `}{user.lastName}</h1>
              <p className="pharm-role">صيدلي — Patient 360°</p>
              <div className="pharm-meta">
                {user.roleData?.pharmacist?.pharmacyLicenseNumber && (
                  <span className="meta-chip">📋 {user.roleData.pharmacist.pharmacyLicenseNumber}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ─────────────────────────────────────── */}
        <div className="pharm-tabs">
          {[
            { id: 'prescriptions', icon: '📜', label: 'صرف الوصفات' },
            { id: 'otc', icon: '💊', label: 'بيع بدون وصفة' },
            { id: 'history', icon: '📋', label: 'سجل الصرف' }
          ].map(tab => (
            <button key={tab.id} className={`pharm-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <span className="tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: PRESCRIPTION DISPENSING
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'prescriptions' && (
          <div className="pharm-section">
            {/* Search */}
            <div className="pharm-card search-card">
              <div className="card-header"><span>🔍</span><h2>البحث عن مريض بالرقم الوطني</h2></div>
              <div className="search-row">
                <input
                  type="text" placeholder="أدخل الرقم الوطني (11 رقم)..." dir="ltr"
                  value={searchNationalId} maxLength={11}
                  onChange={e => setSearchNationalId(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleSearchPatient()}
                  className="pharm-input"
                />
                <button className="pharm-btn primary" onClick={handleSearchPatient} disabled={searchLoading}>
                  {searchLoading ? <><span className="btn-spinner"></span> جاري البحث...</> : <><span>🔎</span> بحث</>}
                </button>
              </div>
              {searchError && <div className="pharm-alert error"><span>⚠️</span><p>{searchError}</p></div>}
            </div>

            {/* Patient Info + Allergy Warning */}
            {patient && (
              <div className="pharm-card patient-card">
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

                {/* ⚠️ ALLERGY WARNING — Critical for pharmacist safety */}
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="allergy-warning">
                    <div className="warning-header"><span>🚨</span><h4>تحذير: حساسية مسجلة</h4></div>
                    <div className="allergy-chips">
                      {patient.allergies.map((allergy, i) => (
                        <span key={i} className="allergy-chip">⚠️ {allergy}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chronic diseases — important context */}
                {patient.chronicDiseases && patient.chronicDiseases.length > 0 && (
                  <div className="chronic-info">
                    <span className="chronic-label">🏥 أمراض مزمنة:</span>
                    {patient.chronicDiseases.map((d, i) => (
                      <span key={i} className="chronic-chip">{d}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active Prescriptions List */}
            {patient && patientPrescriptions.length > 0 && (
              <div className="pharm-card">
                <div className="card-header">
                  <span>📜</span>
                  <h2>الوصفات الطبية ({patientPrescriptions.length})</h2>
                </div>

                <div className="prescriptions-list">
                  {patientPrescriptions.map((rx, i) => {
                    const expired = isExpired(rx.expiryDate);
                    const isActive = rx.status === 'active' || rx.status === 'partially_dispensed';
                    const isSelected = selectedPrescription?._id === rx._id;

                    return (
                      <div key={rx._id || i} className={`rx-card ${isSelected ? 'selected' : ''} ${expired ? 'expired' : ''} ${!isActive ? 'inactive' : ''}`}>
                        <div className="rx-card-top">
                          <div className="rx-info">
                            <span className="rx-number">{rx.prescriptionNumber}</span>
                            <span className="rx-date">📅 {formatDate(rx.prescriptionDate)}</span>
                            {rx.doctorId?.firstName && <span className="rx-doctor">👨‍⚕️ د. {rx.doctorId.firstName} {rx.doctorId.lastName}</span>}
                          </div>
                          <div className="rx-badges">
                            <span className={`rx-status ${rx.status}`}>
                              {rx.status === 'active' ? '🟢 نشطة' :
                               rx.status === 'dispensed' ? '✅ تم الصرف' :
                               rx.status === 'partially_dispensed' ? '🟡 صرف جزئي' :
                               rx.status === 'expired' ? '⏰ منتهية' : '❌ ملغاة'}
                            </span>
                            {expired && <span className="expired-badge">⏰ منتهية الصلاحية</span>}
                          </div>
                        </div>

                        {/* Medications preview */}
                        <div className="rx-meds-preview">
                          {(rx.medications || []).map((med, j) => (
                            <div key={j} className={`rx-med-preview ${med.isDispensed ? 'dispensed' : ''}`}>
                              <span>{med.isDispensed ? '✅' : '💊'}</span>
                              <span className="med-name">{med.medicationName} {med.arabicName && `(${med.arabicName})`}</span>
                              <span className="med-dosage">{med.dosage}</span>
                              {med.route && <span className="med-route">{ROUTE_LABELS[med.route] || med.route}</span>}
                            </div>
                          ))}
                        </div>

                        {/* Select button — only for active, non-expired prescriptions */}
                        {isActive && !expired && (
                          <button className="rx-select-btn" onClick={() => handleSelectPrescription(rx)}>
                            {isSelected ? '✓ محددة' : '📋 اختيار للصرف'}
                          </button>
                        )}

                        {expired && <div className="rx-expired-msg">🚫 لا يمكن صرف وصفة منتهية الصلاحية</div>}
                        {rx.status === 'dispensed' && <div className="rx-dispensed-msg">✅ تم صرف جميع الأدوية</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {patient && patientPrescriptions.length === 0 && (
              <div className="pharm-empty"><span>📜</span><h3>لا توجد وصفات طبية نشطة لهذا المريض</h3></div>
            )}

            {/* ── Verification + Dispensing (after selecting prescription) ── */}
            {selectedPrescription && (
              <div className="pharm-card verification-card" ref={verificationRef}>
                {!isVerified ? (
                  <>
                    <div className="card-header verification-header">
                      <span>🔐</span>
                      <h2>التحقق من الوصفة</h2>
                    </div>
                    <p className="verification-desc">أدخل رمز التحقق المكون من 6 أرقام الموجود على الوصفة الطبية</p>
                    <div className="verification-input-row">
                      <input
                        type="text" dir="ltr" maxLength={6} placeholder="● ● ● ● ● ●"
                        value={verificationCode}
                        onChange={e => { setVerificationCode(e.target.value); setVerificationError(''); }}
                        className="verification-input"
                      />
                      <button className="pharm-btn primary" onClick={handleVerifyCode} disabled={verificationCode.length < 6}>
                        <span>🔓</span> تحقق
                      </button>
                    </div>
                    {verificationError && <div className="pharm-alert error"><span>❌</span><p>{verificationError}</p></div>}
                    <div className="verification-security-note"><span>🔒</span><p>هذا الرمز يضمن صحة الوصفة ويمنع التلاعب</p></div>
                  </>
                ) : (
                  <>
                    <div className="card-header success-header">
                      <span>✅</span>
                      <h2>تم التحقق — جاهز للصرف</h2>
                    </div>

                    {/* Dispensable medications list */}
                    <div className="dispense-meds-list">
                      {dispenseMeds.map((med, i) => (
                        <div key={i} className={`dispense-med-item ${med.isDispensed ? 'already-dispensed' : ''}`}>
                          <div className="dispense-med-header">
                            {!med.isDispensed && (
                              <label className="dispense-checkbox">
                                <input type="checkbox" checked={med.selected}
                                  onChange={e => {
                                    const updated = [...dispenseMeds];
                                    updated[i].selected = e.target.checked;
                                    setDispenseMeds(updated);
                                  }}
                                />
                                <span className="checkmark"></span>
                              </label>
                            )}
                            <div className="dispense-med-info">
                              <h4>{med.isDispensed ? '✅' : '💊'} {med.medicationName}</h4>
                              <div className="med-details-row">
                                <span>💉 {med.dosage}</span>
                                <span>🔄 {med.frequency}</span>
                                <span>⏱️ {med.duration}</span>
                                {med.route && <span>{ROUTE_LABELS[med.route] || med.route}</span>}
                              </div>
                              {med.instructions && <p className="med-instructions">📝 {med.instructions}</p>}
                            </div>
                            {med.isDispensed && <span className="already-badge">تم الصرف مسبقاً</span>}
                          </div>

                          {/* Generic substitution + quantity */}
                          {!med.isDispensed && med.selected && (
                            <div className="dispense-options">
                              <label className="generic-check">
                                <input type="checkbox" checked={med.isGenericSubstitute}
                                  onChange={e => {
                                    const updated = [...dispenseMeds];
                                    updated[i].isGenericSubstitute = e.target.checked;
                                    setDispenseMeds(updated);
                                  }}
                                />
                                <span>🔄 بديل جنيس (Generic)</span>
                              </label>
                              <div className="qty-input">
                                <label>الكمية:</label>
                                <input type="number" min={1} value={med.quantityToDispense}
                                  onChange={e => {
                                    const updated = [...dispenseMeds];
                                    updated[i].quantityToDispense = parseInt(e.target.value) || 1;
                                    setDispenseMeds(updated);
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Payment + Notes */}
                    <div className="dispense-footer">
                      <div className="payment-row">
                        <label>طريقة الدفع:</label>
                        <div className="payment-options">
                          {PAYMENT_METHODS.map(pm => (
                            <button key={pm.id} className={`payment-btn ${paymentMethod === pm.id ? 'active' : ''}`} onClick={() => setPaymentMethod(pm.id)}>
                              <span>{pm.icon}</span><span>{pm.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea placeholder="ملاحظات الصيدلي (اختياري)..." value={pharmacistNotes}
                        onChange={e => setPharmacistNotes(e.target.value)} className="pharm-textarea" rows={2}
                      />
                      <button className="pharm-btn primary dispense-btn" onClick={handleDispensePrescription}
                        disabled={dispensing || dispenseMeds.filter(m => m.selected && !m.isDispensed).length === 0}>
                        {dispensing ? <><span className="btn-spinner"></span> جاري الصرف...</> :
                          <><span>💊</span> صرف الأدوية ({dispenseMeds.filter(m => m.selected && !m.isDispensed).length})</>}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: OTC DISPENSING (Without Prescription)
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'otc' && (
          <div className="pharm-section">
            <div className="pharm-card">
              <div className="card-header"><span>💊</span><h2>صرف أدوية بدون وصفة طبية (OTC)</h2></div>

              {/* OTC Notice */}
              <div className="pharm-alert info">
                <span>ℹ️</span>
                <p>الأدوية التي لا تتطلب وصفة طبية فقط. <strong>سبب الصرف مطلوب</strong> للتوثيق في السجلات.</p>
              </div>

              {/* Patient ID — Optional for OTC */}
              <div className="otc-patient-section">
                <label>رقم المريض الوطني (اختياري):</label>
                <input type="text" dir="ltr" placeholder="11 رقم (اختياري للأدوية البسيطة)" maxLength={11}
                  value={otcPatientId} onChange={e => setOtcPatientId(e.target.value.replace(/\D/g, ''))}
                  className="pharm-input small"
                />
              </div>

              {/* Quick OTC List */}
              <div className="otc-quick-section">
                <div className="otc-quick-header">
                  <h3>🏷️ أدوية شائعة بدون وصفة</h3>
                  <button className="pharm-btn outline" onClick={() => setShowOtcList(!showOtcList)}>
                    {showOtcList ? 'إخفاء القائمة' : 'عرض القائمة'}
                  </button>
                </div>

                {showOtcList && (
                  <div className="otc-quick-grid">
                    {COMMON_OTC_MEDICATIONS.map((med, i) => (
                      <button key={i} className="otc-quick-item" onClick={() => handleAddOtcMed(med)}>
                        <span className="otc-item-name">{med.arabicName}</span>
                        <span className="otc-item-strength">{med.strength}</span>
                        <span className="otc-item-add">+ إضافة</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual Entry */}
              <div className="otc-manual-entry">
                <h3>➕ إضافة دواء يدوياً</h3>
                <div className="otc-entry-row">
                  <input type="text" placeholder="اسم الدواء" value={otcNewMed.medicationName}
                    onChange={e => setOtcNewMed({ ...otcNewMed, medicationName: e.target.value })} className="pharm-input"
                  />
                  <input type="number" placeholder="الكمية" min={1} value={otcNewMed.quantity}
                    onChange={e => setOtcNewMed({ ...otcNewMed, quantity: parseInt(e.target.value) || 1 })} className="pharm-input small"
                  />
                  <input type="number" placeholder="السعر (ل.س)" min={0} value={otcNewMed.unitPrice}
                    onChange={e => setOtcNewMed({ ...otcNewMed, unitPrice: parseFloat(e.target.value) || 0 })} className="pharm-input small"
                  />
                  <button className="pharm-btn primary" onClick={() => handleAddOtcMed()}>➕ إضافة</button>
                </div>
              </div>

              {/* Added OTC Meds */}
              {otcMedications.length > 0 && (
                <div className="otc-added-list">
                  <h3>🛒 الأدوية المحددة ({otcMedications.length})</h3>
                  {otcMedications.map(med => (
                    <div key={med.id} className="otc-added-item">
                      <div className="otc-added-info">
                        <span className="otc-med-name">💊 {med.medicationName}</span>
                        <span className="otc-med-qty">× {med.quantity}</span>
                        {med.unitPrice > 0 && <span className="otc-med-price">{med.unitPrice * med.quantity} ل.س</span>}
                      </div>
                      <button className="remove-btn" onClick={() => handleRemoveOtcMed(med.id)}>✕</button>
                    </div>
                  ))}
                  <div className="otc-total">
                    <span>المجموع:</span>
                    <span className="total-amount">{otcMedications.reduce((s, m) => s + (m.quantity * m.unitPrice), 0).toLocaleString()} ل.س</span>
                  </div>
                </div>
              )}

              {/* Reason — REQUIRED by DB (otcReason field) */}
              <div className="otc-reason-section">
                <label className="required-label">📝 سبب الصرف بدون وصفة <span className="required">*</span></label>
                <textarea placeholder="مثال: صداع خفيف، ألم بسيط، فيتامينات..." rows={2}
                  value={otcReason} onChange={e => setOtcReason(e.target.value)} className="pharm-textarea"
                />
                <textarea placeholder="ملاحظات إضافية (اختياري)" rows={2}
                  value={otcNotes} onChange={e => setOtcNotes(e.target.value)} className="pharm-textarea"
                />
              </div>

              {/* Payment */}
              <div className="payment-row">
                <label>طريقة الدفع:</label>
                <div className="payment-options">
                  {PAYMENT_METHODS.map(pm => (
                    <button key={pm.id} className={`payment-btn ${otcPayment === pm.id ? 'active' : ''}`} onClick={() => setOtcPayment(pm.id)}>
                      <span>{pm.icon}</span><span>{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dispense Button */}
              <button className="pharm-btn primary dispense-btn"
                onClick={handleOtcDispense} disabled={otcDispensing || otcMedications.length === 0 || !otcReason.trim()}>
                {otcDispensing ? <><span className="btn-spinner"></span> جاري الصرف...</> :
                  <><span>💊</span> صرف الأدوية ({otcMedications.length})</>}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: DISPENSING HISTORY
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="pharm-section">
            <div className="pharm-card">
              <div className="card-header"><span>📋</span><h2>سجل الصرف</h2>
                <span className="count-badge">{dispensingHistory.length}</span>
              </div>

              {/* Filters */}
              <div className="history-filters">
                {[
                  { id: 'all', label: 'الكل', icon: '📋' },
                  { id: 'prescription_based', label: 'وصفات', icon: '📜' },
                  { id: 'otc', label: 'بدون وصفة', icon: '💊' }
                ].map(f => (
                  <button key={f.id} className={`filter-btn ${historyFilter === f.id ? 'active' : ''}`} onClick={() => setHistoryFilter(f.id)}>
                    <span>{f.icon}</span><span>{f.label}</span>
                  </button>
                ))}
              </div>

              {historyLoading && <div className="pharm-loading-inline"><span className="btn-spinner"></span> جاري التحميل...</div>}

              {!historyLoading && filteredHistory.length === 0 && (
                <div className="pharm-empty"><span>📋</span><h3>لا توجد عمليات صرف</h3></div>
              )}

              {!historyLoading && filteredHistory.length > 0 && (
                <div className="history-list">
                  {filteredHistory.map((record, i) => (
                    <div key={record._id || i} className={`history-card ${record.dispensingType}`}>
                      <div className="history-card-header">
                        <div className="history-info">
                          <span className="history-number">{record.dispensingNumber}</span>
                          <span className="history-date">{formatDateTime(record.dispensingDate)}</span>
                        </div>
                        <span className={`history-type-badge ${record.dispensingType}`}>
                          {record.dispensingType === 'prescription_based' ? '📜 وصفة طبية' : '💊 بدون وصفة'}
                        </span>
                      </div>
                      <div className="history-card-body">
                        <div className="history-meds">
                          {(record.medicationsDispensed || []).map((med, j) => (
                            <span key={j} className="history-med-chip">💊 {med.medicationName} ×{med.quantityDispensed}</span>
                          ))}
                        </div>
                        {record.prescriptionNumber && <span className="history-rx">📜 {record.prescriptionNumber}</span>}
                        {record.otcReason && <span className="history-reason">📝 {record.otcReason}</span>}
                        <div className="history-meta">
                          {record.totalCost > 0 && <span>💰 {record.totalCost?.toLocaleString()} {record.currency || 'ل.س'}</span>}
                          {record.paymentMethod && <span>💳 {PAYMENT_METHODS.find(p => p.id === record.paymentMethod)?.label || record.paymentMethod}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacistDashboard;
