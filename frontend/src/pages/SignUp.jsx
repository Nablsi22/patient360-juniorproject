// src/pages/SignUp.jsx
// 🏥 Patient 360° - Enhanced Sign Up System
// Supports: Patient Registration + Doctor Registration Request with Admin Approval
// Database Schema Compliant | Government Healthcare Platform

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { authAPI } from '../services/api';
import { calculateAge, getTodayDate, validateSyrianPhone, validateNationalId } from '../utils/ageCalculator';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/SignUp.css';

/**
 * ============================================
 * CONSTANTS - Medical Specializations
 * ============================================
 */
const MEDICAL_SPECIALIZATIONS = [
  { id: 'cardiology', nameAr: 'طبيب قلب', icon: '❤️', hasECG: true },
  { id: 'pulmonology', nameAr: 'طبيب أمراض الرئة', icon: '🫁', hasECG: false },
  { id: 'general_practice', nameAr: 'طبيب عام', icon: '🩺', hasECG: false },
  { id: 'rheumatology', nameAr: 'طبيب روماتيزم', icon: '🦴', hasECG: false },
  { id: 'orthopedics', nameAr: 'جراح عظام', icon: '🦿', hasECG: false },
  { id: 'neurology', nameAr: 'طبيب أعصاب', icon: '🧠', hasECG: false },
  { id: 'endocrinology', nameAr: 'طبيب غدد صماء', icon: '⚗️', hasECG: false },
  { id: 'dermatology', nameAr: 'طبيب جلدية', icon: '🧴', hasECG: false },
  { id: 'gastroenterology', nameAr: 'طبيب جهاز هضمي', icon: '🫃', hasECG: false },
  { id: 'surgery', nameAr: 'جراح عام', icon: '🔪', hasECG: false },
  { id: 'urology', nameAr: 'طبيب مسالك بولية', icon: '💧', hasECG: false },
  { id: 'gynecology', nameAr: 'طبيب نساء وتوليد', icon: '🤰', hasECG: false },
  { id: 'psychiatry', nameAr: 'طبيب نفسي', icon: '🧘', hasECG: false },
  { id: 'hematology', nameAr: 'طبيب دم', icon: '🩸', hasECG: false },
  { id: 'oncology', nameAr: 'طبيب أورام', icon: '🎗️', hasECG: false },
  { id: 'otolaryngology', nameAr: 'طبيب أنف أذن حنجرة', icon: '👂', hasECG: false },
  { id: 'ophthalmology', nameAr: 'طبيب عيون', icon: '👁️', hasECG: false },
  { id: 'pediatrics', nameAr: 'طبيب أطفال', icon: '👶', hasECG: false },
  { id: 'nephrology', nameAr: 'طبيب كلى', icon: '🫘', hasECG: false },
  { id: 'internal_medicine', nameAr: 'طبيب باطنية', icon: '🏨', hasECG: false },
  { id: 'emergency_medicine', nameAr: 'طبيب طوارئ', icon: '🚑', hasECG: false },
  { id: 'vascular_surgery', nameAr: 'جراح أوعية دموية', icon: '🫀', hasECG: false },
  { id: 'anesthesiology', nameAr: 'طبيب تخدير', icon: '💉', hasECG: false },
  { id: 'radiology', nameAr: 'طبيب أشعة', icon: '📡', hasECG: false }
];

const SYRIAN_GOVERNORATES = [
  { id: 'damascus', nameAr: 'دمشق', nameEn: 'Damascus' },
  { id: 'rif_dimashq', nameAr: 'ريف دمشق', nameEn: 'Rif Dimashq' },
  { id: 'aleppo', nameAr: 'حلب', nameEn: 'Aleppo' },
  { id: 'homs', nameAr: 'حمص', nameEn: 'Homs' },
  { id: 'hama', nameAr: 'حماة', nameEn: 'Hama' },
  { id: 'latakia', nameAr: 'اللاذقية', nameEn: 'Latakia' },
  { id: 'tartus', nameAr: 'طرطوس', nameEn: 'Tartus' },
  { id: 'idlib', nameAr: 'إدلب', nameEn: 'Idlib' },
  { id: 'deir_ez_zor', nameAr: 'دير الزور', nameEn: 'Deir ez-Zor' },
  { id: 'hasakah', nameAr: 'الحسكة', nameEn: 'Al-Hasakah' },
  { id: 'raqqa', nameAr: 'الرقة', nameEn: 'Raqqa' },
  { id: 'daraa', nameAr: 'درعا', nameEn: 'Daraa' },
  { id: 'as_suwayda', nameAr: 'السويداء', nameEn: 'As-Suwayda' },
  { id: 'quneitra', nameAr: 'القنيطرة', nameEn: 'Quneitra' }
];

const WEEKDAYS = [
  { id: 'Sunday', nameAr: 'الأحد' },
  { id: 'Monday', nameAr: 'الإثنين' },
  { id: 'Tuesday', nameAr: 'الثلاثاء' },
  { id: 'Wednesday', nameAr: 'الأربعاء' },
  { id: 'Thursday', nameAr: 'الخميس' },
  { id: 'Friday', nameAr: 'الجمعة' },
  { id: 'Saturday', nameAr: 'السبت' }
];

/**
 * ============================================
 * MAIN COMPONENT
 * ============================================
 */
const SignUp = () => {
  const navigate = useNavigate();
  
  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  // User Type Selection
  const [userType, setUserType] = useState(null); // 'patient' | 'doctor'
  
  // Form Steps
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Age Detection (for patients)
  const [age, setAge] = useState(0);
  const [isMinor, setIsMinor] = useState(false);
  
  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: '',
    onClose: null
  });
  
  // Doctor Request Status (after submission)
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestId, setRequestId] = useState(null);
  
  // Check existing request status
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  
  // Status Check Modal State
  const [statusCheckModal, setStatusCheckModal] = useState({
    isOpen: false,
    nationalId: '',
    isLoading: false,
    error: ''
  });
  
  // ═══════════════════════════════════════════════════════════════
  // PATIENT FORM DATA
  // ═══════════════════════════════════════════════════════════════
  
  const [patientFormData, setPatientFormData] = useState({
    nationalId: '',
    parentNationalId: '',
    firstName: '',
    fatherName: '',
    lastName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    governorate: '',
    city: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodType: '',
    height: '',
    weight: '',
    smokingStatus: '',
    allergies: '',
    chronicDiseases: '',
    familyHistory: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: ''
  });
  
  // ═══════════════════════════════════════════════════════════════
  // DOCTOR FORM DATA
  // ═══════════════════════════════════════════════════════════════
  
  const [doctorFormData, setDoctorFormData] = useState({
    // Personal Info
    firstName: '',
    fatherName: '',
    lastName: '',
    motherName: '',
    nationalId: '',
    dateOfBirth: '',
    gender: 'male',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    governorate: '',
    city: '',
    
    // Professional Info
    medicalLicenseNumber: '',
    specialization: '',
    subSpecialization: '',
    yearsOfExperience: '',
    hospitalAffiliation: '',
    availableDays: [],
    consultationFee: '',
    
    // Documents
    licenseDocument: null,
    medicalCertificate: null,
    profilePhoto: null,
    
    // Additional Notes
    additionalNotes: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // ═══════════════════════════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════════════════════════
  
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const smokingStatuses = [
    { value: 'non-smoker', label: 'غير مدخن' },
    { value: 'former_smoker', label: 'مدخن سابق' },
    { value: 'current_smoker', label: 'مدخن حالي' }
  ];
  
  // Total steps for each user type
  const patientTotalSteps = 4;
  const doctorTotalSteps = 4;
  
  // ═══════════════════════════════════════════════════════════════
  // MODAL FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  
  const openModal = (type, title, message, onClose = null) => {
    setModal({ isOpen: true, type, title, message, onClose });
  };
  
  const closeModal = () => {
    if (modal.onClose) modal.onClose();
    setModal({ isOpen: false, type: '', title: '', message: '', onClose: null });
  };
  
  // ═══════════════════════════════════════════════════════════════
  // VALIDATION HELPERS
  // ═══════════════════════════════════════════════════════════════
  
  const isDateInPast = (dateString) => {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  };
  
  const isValidName = (name) => {
    const namePattern = /^[a-zA-Z\u0600-\u06FF\s]+$/;
    return namePattern.test(name);
  };
  
  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };
  
  // ═══════════════════════════════════════════════════════════════
  // PATIENT HANDLERS
  // ═══════════════════════════════════════════════════════════════
  
  const handlePatientDateOfBirthChange = (e) => {
    const dob = e.target.value;
    setPatientFormData({ ...patientFormData, dateOfBirth: dob });
    
    const calculatedAge = calculateAge(dob);
    setAge(calculatedAge);
    const minor = calculatedAge < 18;
    setIsMinor(minor);
    
    if (minor) {
      setPatientFormData(prev => ({ ...prev, nationalId: '' }));
      if (errors.nationalId) setErrors(prev => ({ ...prev, nationalId: '' }));
    } else {
      setPatientFormData(prev => ({ ...prev, parentNationalId: '' }));
      if (errors.parentNationalId) setErrors(prev => ({ ...prev, parentNationalId: '' }));
    }
  };
  
  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatientFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  // ═══════════════════════════════════════════════════════════════
  // DOCTOR HANDLERS
  // ═══════════════════════════════════════════════════════════════
  
  const handleDoctorChange = (e) => {
    const { name, value } = e.target;
    setDoctorFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const handleDayToggle = (day) => {
    setDoctorFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };
  
  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        openModal('error', 'خطأ', 'حجم الملف يجب أن لا يتجاوز 5 ميجابايت');
        return;
      }
      setDoctorFormData(prev => ({ ...prev, [fieldName]: file }));
    }
  };
  
  // ═══════════════════════════════════════════════════════════════
  // PATIENT VALIDATION
  // ═══════════════════════════════════════════════════════════════
  
  const validatePatientStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!patientFormData.firstName.trim()) {
        newErrors.firstName = 'الاسم الأول مطلوب';
      } else if (patientFormData.firstName.trim().length < 2) {
        newErrors.firstName = 'الاسم الأول يجب أن يكون حرفين على الأقل';
      } else if (!isValidName(patientFormData.firstName)) {
        newErrors.firstName = 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط';
      }
      
      if (!patientFormData.fatherName.trim()) {
        newErrors.fatherName = 'اسم الأب مطلوب';
      } else if (patientFormData.fatherName.trim().length < 2) {
        newErrors.fatherName = 'اسم الأب يجب أن يكون حرفين على الأقل';
      } else if (!isValidName(patientFormData.fatherName)) {
        newErrors.fatherName = 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط';
      }
      
      if (!patientFormData.lastName.trim()) {
        newErrors.lastName = 'اسم العائلة مطلوب';
      } else if (patientFormData.lastName.trim().length < 2) {
        newErrors.lastName = 'اسم العائلة يجب أن يكون حرفين على الأقل';
      } else if (!isValidName(patientFormData.lastName)) {
        newErrors.lastName = 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط';
      }
      
      if (!patientFormData.motherName.trim()) {
        newErrors.motherName = 'اسم الأم مطلوب';
      } else if (patientFormData.motherName.trim().length < 2) {
        newErrors.motherName = 'اسم الأم يجب أن يكون حرفين على الأقل';
      }
      
      if (!patientFormData.email.trim()) {
        newErrors.email = 'البريد الإلكتروني مطلوب';
      } else if (!isValidEmail(patientFormData.email)) {
        newErrors.email = 'البريد الإلكتروني غير صحيح';
      }
      
      if (!patientFormData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'رقم الهاتف مطلوب';
      } else if (!validateSyrianPhone(patientFormData.phoneNumber)) {
        newErrors.phoneNumber = 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ +963 أو 09)';
      }
      
      if (isMinor) {
        if (!patientFormData.parentNationalId.trim()) {
          newErrors.parentNationalId = 'رقم الهوية الوطنية للوالد/الوالدة مطلوب';
        } else if (!validateNationalId(patientFormData.parentNationalId)) {
          newErrors.parentNationalId = 'رقم الهوية يجب أن يكون 11 رقم بالضبط';
        }
      } else {
        if (!patientFormData.nationalId.trim()) {
          newErrors.nationalId = 'رقم الهوية الوطنية مطلوب';
        } else if (!validateNationalId(patientFormData.nationalId)) {
          newErrors.nationalId = 'رقم الهوية يجب أن يكون 11 رقم بالضبط';
        }
      }
      
      if (!patientFormData.dateOfBirth) {
        newErrors.dateOfBirth = 'تاريخ الميلاد مطلوب';
      } else if (!isDateInPast(patientFormData.dateOfBirth)) {
        newErrors.dateOfBirth = 'تاريخ الميلاد يجب أن يكون في الماضي';
      }
      
      if (!patientFormData.gender) {
        newErrors.gender = 'يرجى اختيار الجنس';
      }
      
      if (!patientFormData.governorate) {
        newErrors.governorate = 'المحافظة مطلوبة';
      }
      
      if (!patientFormData.city.trim()) {
        newErrors.city = 'المدينة مطلوبة';
      }
    }
    
    if (currentStep === 2) {
      if (patientFormData.height && (patientFormData.height < 50 || patientFormData.height > 300)) {
        newErrors.height = 'الطول يجب أن يكون بين 50 و 300 سم';
      }
      if (patientFormData.weight && (patientFormData.weight < 2 || patientFormData.weight > 300)) {
        newErrors.weight = 'الوزن يجب أن يكون بين 2 و 300 كجم';
      }
    }
    
    if (currentStep === 3) {
      if (!patientFormData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = 'اسم جهة الاتصال للطوارئ مطلوب';
      }
      if (!patientFormData.emergencyContactRelationship.trim()) {
        newErrors.emergencyContactRelationship = 'صلة القرابة مطلوبة';
      }
      if (!patientFormData.emergencyContactPhone.trim()) {
        newErrors.emergencyContactPhone = 'رقم هاتف الطوارئ مطلوب';
      } else if (!validateSyrianPhone(patientFormData.emergencyContactPhone)) {
        newErrors.emergencyContactPhone = 'رقم الهاتف غير صحيح';
      }
    }
    
    if (currentStep === 4) {
      if (!patientFormData.password) {
        newErrors.password = 'كلمة المرور مطلوبة';
      } else if (patientFormData.password.length < 8) {
        newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      } else if (!/[A-Z]/.test(patientFormData.password)) {
        newErrors.password = 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل';
      } else if (!/[0-9]/.test(patientFormData.password)) {
        newErrors.password = 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
      } else if (!/[!@#$%^&*]/.test(patientFormData.password)) {
        newErrors.password = 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل';
      }
      
      if (!patientFormData.confirmPassword) {
        newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
      } else if (patientFormData.password !== patientFormData.confirmPassword) {
        newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // ═══════════════════════════════════════════════════════════════
  // DOCTOR VALIDATION
  // ═══════════════════════════════════════════════════════════════
  
const validateDoctorStep = () => {
  const newErrors = {};
  
  if (currentStep === 1) {
    // Personal Information
    if (!doctorFormData.firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب';
    } else if (!isValidName(doctorFormData.firstName)) {
      newErrors.firstName = 'الاسم يجب أن يحتوي على أحرف فقط';
    }
    
    if (!doctorFormData.fatherName.trim()) {
      newErrors.fatherName = 'اسم الأب مطلوب';
    } else if (!isValidName(doctorFormData.fatherName)) {
      newErrors.fatherName = 'الاسم يجب أن يحتوي على أحرف فقط';
    }
    
    if (!doctorFormData.lastName.trim()) {
      newErrors.lastName = 'الكنية مطلوبة';
    } else if (!isValidName(doctorFormData.lastName)) {
      newErrors.lastName = 'الاسم يجب أن يحتوي على أحرف فقط';
    }
    
    if (!doctorFormData.motherName.trim()) {
      newErrors.motherName = 'اسم الأم مطلوب';
    }
    
    if (!doctorFormData.nationalId.trim()) {
      newErrors.nationalId = 'الرقم الوطني مطلوب';
    } else if (!validateNationalId(doctorFormData.nationalId)) {
      newErrors.nationalId = 'الرقم الوطني يجب أن يكون 11 رقم';
    }
    
    if (!doctorFormData.dateOfBirth) {
      newErrors.dateOfBirth = 'تاريخ الميلاد مطلوب';
    }
    
    if (!doctorFormData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'رقم الهاتف مطلوب';
    } else if (!validateSyrianPhone(doctorFormData.phoneNumber)) {
      newErrors.phoneNumber = 'رقم الهاتف غير صحيح';
    }
    
    if (!doctorFormData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!isValidEmail(doctorFormData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!doctorFormData.governorate) {
      newErrors.governorate = 'المحافظة مطلوبة';
    }
    
    if (!doctorFormData.city.trim()) {
      newErrors.city = 'المدينة مطلوبة';
    }
    
    if (!doctorFormData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }
    
    // ✅ Password strength validation (same as Patient)
    if (!doctorFormData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (doctorFormData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    } else if (!/[A-Z]/.test(doctorFormData.password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل';
    } else if (!/[0-9]/.test(doctorFormData.password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
    } else if (!/[!@#$%^&*]/.test(doctorFormData.password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل';
    }
    
    if (!doctorFormData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (doctorFormData.password !== doctorFormData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }
  }
  
  if (currentStep === 2) {
    // Professional Information
    if (!doctorFormData.medicalLicenseNumber.trim()) {
      newErrors.medicalLicenseNumber = 'رقم الترخيص الطبي مطلوب';
    } else if (!/^[A-Z0-9]{8,20}$/i.test(doctorFormData.medicalLicenseNumber.trim())) {
      newErrors.medicalLicenseNumber = 'رقم الترخيص يجب أن يكون 8-20 حرف/رقم';
    }
    
    if (!doctorFormData.specialization) {
      newErrors.specialization = 'التخصص مطلوب';
    }
    
    if (!doctorFormData.hospitalAffiliation.trim()) {
      newErrors.hospitalAffiliation = 'مكان العمل مطلوب';
    }
    
    if (doctorFormData.availableDays.length === 0) {
      newErrors.availableDays = 'يجب اختيار يوم عمل واحد على الأقل';
    }
    
    const years = parseInt(doctorFormData.yearsOfExperience);
    if (isNaN(years) || years < 0 || years > 60) {
      newErrors.yearsOfExperience = 'سنوات الخبرة يجب أن تكون بين 0-60';
    }
    
    if (!doctorFormData.consultationFee || parseFloat(doctorFormData.consultationFee) < 0) {
      newErrors.consultationFee = 'رسوم الاستشارة مطلوبة';
    }
  }
  
  if (currentStep === 3) {
    // Documents
    if (!doctorFormData.licenseDocument) {
      newErrors.licenseDocument = 'صورة الترخيص الطبي مطلوبة';
    }
    if (!doctorFormData.medicalCertificate) {
      newErrors.medicalCertificate = 'صورة شهادة الطب مطلوبة';
    }
  }
  
  if (currentStep === 4) {
    // Review - No validation needed
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  
  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════
  
  const handleNext = () => {
    const isValid = userType === 'patient' ? validatePatientStep() : validateDoctorStep();
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };
  
  const handleBackToSelection = () => {
    setUserType(null);
    setCurrentStep(1);
    setErrors({});
  };
  
  // ═══════════════════════════════════════════════════════════════
  // PATIENT SUBMISSION
  // ═══════════════════════════════════════════════════════════════
  
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePatientStep()) return;
    
    setLoading(true);
    
    try {
      const registrationData = {
        firstName: patientFormData.firstName.trim(),
        fatherName: patientFormData.fatherName.trim(),
        lastName: patientFormData.lastName.trim(),
        motherName: patientFormData.motherName.trim(),
        dateOfBirth: patientFormData.dateOfBirth,
        nationalId: isMinor ? null : patientFormData.nationalId.trim(),
        parentNationalId: isMinor ? patientFormData.parentNationalId.trim() : null,
        isMinor: isMinor,
        gender: patientFormData.gender,
        phoneNumber: patientFormData.phoneNumber.trim(),
        governorate: patientFormData.governorate,
        city: patientFormData.city.trim(),
        address: patientFormData.address.trim() || null,
        email: patientFormData.email.trim().toLowerCase(),
        password: patientFormData.password,
        bloodType: patientFormData.bloodType || null,
        height: patientFormData.height ? parseFloat(patientFormData.height) : null,
        weight: patientFormData.weight ? parseFloat(patientFormData.weight) : null,
        smokingStatus: patientFormData.smokingStatus || null,
        allergies: patientFormData.allergies.trim()
          ? patientFormData.allergies.split(',').map(item => item.trim()).filter(item => item)
          : [],
        chronicDiseases: patientFormData.chronicDiseases.trim()
          ? patientFormData.chronicDiseases.split(',').map(item => item.trim()).filter(item => item)
          : [],
        familyHistory: patientFormData.familyHistory.trim()
          ? patientFormData.familyHistory.split(',').map(item => item.trim()).filter(item => item)
          : [],
        emergencyContact: {
          name: patientFormData.emergencyContactName.trim(),
          relationship: patientFormData.emergencyContactRelationship.trim(),
          phoneNumber: patientFormData.emergencyContactPhone.trim()
        }
      };
      
      const response = await authAPI.register(registrationData);
      
      setLoading(false);
      
      openModal(
        'success',
        'تم إنشاء الحساب بنجاح! ✅',
        isMinor
          ? `مرحباً ${patientFormData.firstName} ${patientFormData.lastName}\n\nتم تسجيلك كمريض في منصة Patient 360° بنجاح.\n\nمعرف الطفل الخاص بك: ${response.childId}\n\nيمكنك الآن تسجيل الدخول.`
          : `مرحباً ${patientFormData.firstName} ${patientFormData.lastName}\n\nتم تسجيلك كمريض في منصة Patient 360° بنجاح.\n\nيمكنك الآن تسجيل الدخول.`,
        () => navigate('/')
      );
      
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      openModal('error', 'خطأ في التسجيل', error.message || 'حدث خطأ أثناء إنشاء الحساب');
    }
  };
  
  // ═══════════════════════════════════════════════════════════════
  // DOCTOR SUBMISSION (Creates pending request)
  // ═══════════════════════════════════════════════════════════════
  
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (doctorFormData.password !== doctorFormData.confirmPassword) {
      openModal('error', 'خطأ', 'كلمات المرور غير متطابقة');
      return;
    }
    
    // Validate password length
    if (doctorFormData.password.length < 8) {
      openModal('error', 'خطأ', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Personal Info
      formData.append('firstName', doctorFormData.firstName.trim());
      formData.append('fatherName', doctorFormData.fatherName.trim());
      formData.append('lastName', doctorFormData.lastName.trim());
      formData.append('motherName', doctorFormData.motherName.trim());
      formData.append('nationalId', doctorFormData.nationalId.trim());
      formData.append('dateOfBirth', doctorFormData.dateOfBirth);
      formData.append('gender', doctorFormData.gender);
      formData.append('phoneNumber', doctorFormData.phoneNumber.trim());
      formData.append('email', doctorFormData.email.trim().toLowerCase());
      formData.append('password', doctorFormData.password);
      formData.append('address', doctorFormData.address.trim());
      formData.append('governorate', doctorFormData.governorate);
      formData.append('city', doctorFormData.city.trim());
      
      // Professional Info
      formData.append('medicalLicenseNumber', doctorFormData.medicalLicenseNumber.toUpperCase().trim());
      formData.append('specialization', doctorFormData.specialization);
      formData.append('subSpecialization', doctorFormData.subSpecialization.trim());
      formData.append('yearsOfExperience', doctorFormData.yearsOfExperience);
      formData.append('hospitalAffiliation', doctorFormData.hospitalAffiliation.trim());
      formData.append('availableDays', JSON.stringify(doctorFormData.availableDays));
      formData.append('consultationFee', doctorFormData.consultationFee || '0');
      
      // Files
      if (doctorFormData.medicalCertificate) {
        formData.append('medicalCertificate', doctorFormData.medicalCertificate);
        console.log('📎 Medical certificate attached');
      }
      if (doctorFormData.licenseDocument) {
        formData.append('licenseDocument', doctorFormData.licenseDocument);
        console.log('📎 License document attached');
      }
      if (doctorFormData.profilePhoto) {
        formData.append('profilePhoto', doctorFormData.profilePhoto);
        console.log('📎 Profile photo attached');
      }
      
      console.log('📤 Submitting doctor registration...');
      
      // Submit to API
      const response = await fetch('http://localhost:5000/api/auth/register-doctor', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      setLoading(false);
      
      if (data.success) {
        setRequestStatus('pending');
        setRequestId(data.requestId);
        
        const filesInfo = data.data.uploadedFiles || {};
        const filesText = [];
        if (filesInfo.medicalCertificate) filesText.push('✅ شهادة الطب');
        if (filesInfo.licenseDocument) filesText.push('✅ الترخيص الطبي');
        if (filesInfo.profilePhoto) filesText.push('✅ الصورة الشخصية');
        
        openModal(
          'success',
          'تم تقديم الطلب بنجاح! 📋',
          `مرحباً د. ${doctorFormData.firstName} ${doctorFormData.lastName}\n\nتم استلام طلب التسجيل الخاص بك وسيتم مراجعته من قبل وزارة الصحة.\n\nرقم الطلب: ${data.requestId}\n\n${filesText.length > 0 ? 'الملفات المرفقة:\n' + filesText.join('\n') + '\n\n' : ''}حالة الطلب: قيد المراجعة ⏳`
        );
      } else {
        openModal('error', 'خطأ', data.message || 'حدث خطأ أثناء تقديم الطلب');
      }
      
    } catch (error) {
      console.error('Doctor request error:', error);
      setLoading(false);
      openModal('error', 'خطأ في الاتصال', 'حدث خطأ في الاتصال بالخادم. الرجاء المحاولة مرة أخرى.');
    }
  };
  
  // ═══════════════════════════════════════════════════════════════
  // STATUS CHECK MODAL FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  
  const openStatusCheckModal = () => {
    setStatusCheckModal({
      isOpen: true,
      nationalId: '',
      isLoading: false,
      error: ''
    });
  };
  
  const closeStatusCheckModal = () => {
    setStatusCheckModal({
      isOpen: false,
      nationalId: '',
      isLoading: false,
      error: ''
    });
  };
  
  const handleStatusCheckSubmit = async () => {
    const { nationalId } = statusCheckModal;
    
    // Validate input - using nationalId field as email
    if (!nationalId.trim()) {
      setStatusCheckModal(prev => ({ ...prev, error: 'الرجاء إدخال البريد الإلكتروني' }));
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nationalId)) {
      setStatusCheckModal(prev => ({ ...prev, error: 'البريد الإلكتروني غير صحيح' }));
      return;
    }
    
    setStatusCheckModal(prev => ({ ...prev, isLoading: true, error: '' }));
    
    try {
      // ✅ UPDATED: Use new endpoint with email
      const response = await fetch('http://localhost:5000/api/auth/check-doctor-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: statusCheckModal.nationalId  // Using nationalId field as email input
        })
      });
      const data = await response.json();
      
      if (data.success) {
        closeStatusCheckModal();
        setExistingRequest({
          status: data.status,
          email: data.credentials?.email,
          password: data.credentials?.password,
          name: data.credentials?.name,
          submittedAt: data.submittedAt,
          reviewedAt: data.reviewedAt,
          rejectionReason: data.rejectionReason,
          message: data.message
        });
      } else {
        setStatusCheckModal(prev => ({ 
          ...prev, 
          isLoading: false,
          error: data.message || 'لم يتم العثور على طلب بهذا البريد الإلكتروني'
        }));
      }
    } catch (error) {
      console.error('Status check error:', error);
      setStatusCheckModal(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'حدث خطأ في الاتصال بالخادم'
      }));
    }
  };
  
  // Legacy check status (keeping for backward compatibility)
  const handleCheckStatus = async () => {
    const nationalId = doctorFormData.nationalId.trim();
    
    if (!nationalId || !validateNationalId(nationalId)) {
      openModal('error', 'خطأ', 'الرجاء إدخال رقم وطني صحيح (11 رقم)');
      return;
    }
    
    setCheckingStatus(true);
    
    try {
      // ✅ UPDATED: Use new endpoint with email
      const response = await fetch('http://localhost:5000/api/auth/check-doctor-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: doctorFormData.email.trim()
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setExistingRequest({
          status: data.status,
          email: data.credentials?.email,
          password: data.credentials?.password,
          name: data.credentials?.name,
          submittedAt: data.submittedAt,
          reviewedAt: data.reviewedAt,
          rejectionReason: data.rejectionReason,
          message: data.message
        });
      } else {
        openModal('info', 'لا يوجد طلب', data.message || 'لم يتم العثور على طلب تسجيل بهذا البريد الإلكتروني');
      }
    } catch (error) {
      console.error('Status check error:', error);
      openModal('error', 'خطأ', 'حدث خطأ في التحقق من حالة الطلب');
    } finally {
      setCheckingStatus(false);
    }
  };
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER - LOADING STATE
  // ═══════════════════════════════════════════════════════════════
  
  if (loading) {
    return <LoadingSpinner message={userType === 'doctor' ? 'جاري تقديم الطلب...' : 'جاري إنشاء حسابك...'} />;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER - REQUEST STATUS PAGE (After Doctor Submission)
  // ═══════════════════════════════════════════════════════════════
  
  if (requestStatus) {
    return (
      <div className="signup-page">
        <Navbar />
        <div className="signup-container">
          <div className="request-status-container">
            <div className="status-card">
              <div className="status-icon pending">
                <span className="status-icon-inner">⏳</span>
                <div className="status-pulse"></div>
              </div>
              <h1>تم تقديم طلبك بنجاح</h1>
              <p className="status-subtitle">طلب تسجيل طبيب جديد في منصة Patient 360°</p>
              
              <div className="status-details">
                <div className="status-detail-row">
                  <span className="detail-label">رقم الطلب:</span>
                  <span className="detail-value">{requestId}</span>
                </div>
                <div className="status-detail-row">
                  <span className="detail-label">حالة الطلب:</span>
                  <span className="detail-value status-pending">قيد المراجعة</span>
                </div>
                <div className="status-detail-row">
                  <span className="detail-label">تاريخ التقديم:</span>
                  <span className="detail-value">{new Date().toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
              
              <div className="status-info-box">
                <span className="info-icon">ℹ️</span>
                <div className="info-text">
                  <p>سيتم مراجعة طلبك من قبل وزارة الصحة السورية.</p>
                  <p>عند قبول الطلب، سيتم إرسال بيانات الدخول إلى بريدك الإلكتروني:</p>
                  <p className="email-highlight">{doctorFormData.email}</p>
                </div>
              </div>
              
              <div className="status-timeline">
                <div className="timeline-item completed">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="timeline-title">تقديم الطلب</span>
                    <span className="timeline-date">تم</span>
                  </div>
                </div>
                <div className="timeline-item active">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="timeline-title">مراجعة الوثائق</span>
                    <span className="timeline-date">جاري...</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="timeline-title">قرار القبول</span>
                    <span className="timeline-date">قريباً</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="timeline-title">تفعيل الحساب</span>
                    <span className="timeline-date">بانتظار القبول</span>
                  </div>
                </div>
              </div>
              
              <button className="btn-primary" onClick={() => navigate('/')}>
                العودة للصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER - EXISTING REQUEST STATUS PAGE
  // ═══════════════════════════════════════════════════════════════
  
  if (existingRequest) {
    const statusConfig = {
      pending: { icon: '⏳', label: 'قيد المراجعة', className: 'status-pending', color: 'var(--tm-warning)' },
      approved: { icon: '✅', label: 'تم القبول', className: 'status-accepted', color: 'var(--tm-success)' },
      rejected: { icon: '❌', label: 'مرفوض', className: 'status-rejected', color: 'var(--tm-error)' }
    };
    
    const status = statusConfig[existingRequest.status] || statusConfig.pending;
    
    return (
      <div className="signup-page">
        <Navbar />
        <div className="signup-container">
          <div className="request-status-container">
            <div className="status-card enhanced">
              <div className={`status-icon ${existingRequest.status}`}>
                <span className="status-icon-inner">{status.icon}</span>
                {existingRequest.status === 'pending' && <div className="status-pulse"></div>}
              </div>
              <h1>حالة طلب التسجيل</h1>
              
              <div className="status-details">
                <div className="status-detail-row">
                  <span className="detail-label">الاسم:</span>
                  <span className="detail-value">{existingRequest.name || `${existingRequest.firstName} ${existingRequest.lastName}`}</span>
                </div>
                <div className="status-detail-row">
                  <span className="detail-label">البريد الإلكتروني:</span>
                  <span className="detail-value" dir="ltr">{existingRequest.email}</span>
                </div>
                <div className="status-detail-row highlight">
                  <span className="detail-label">حالة الطلب:</span>
                  <span className={`detail-value ${status.className}`}>
                    <span className="status-badge">{status.icon} {status.label}</span>
                  </span>
                </div>
                <div className="status-detail-row">
                  <span className="detail-label">تاريخ التقديم:</span>
                  <span className="detail-value">
                    {existingRequest.submittedAt ? new Date(existingRequest.submittedAt).toLocaleDateString('ar-EG') : '-'}
                  </span>
                </div>
                {existingRequest.reviewedAt && (
                  <div className="status-detail-row">
                    <span className="detail-label">تاريخ المراجعة:</span>
                    <span className="detail-value">
                      {new Date(existingRequest.reviewedAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                )}
              </div>
              
              {existingRequest.status === 'pending' && (
                <div className="status-info-box pending-info">
                  <span className="info-icon">⏳</span>
                  <div className="info-text">
                    <p><strong>طلبك قيد المراجعة</strong></p>
                    <p>سيتم مراجعة طلبك من قبل فريق وزارة الصحة السورية. ستتلقى إشعاراً عند اتخاذ القرار.</p>
                  </div>
                </div>
              )}
              
              {existingRequest.status === 'rejected' && existingRequest.rejectionReason && (
                <div className="rejection-reason-box">
                  <span className="info-icon">⚠️</span>
                  <div className="info-text">
                    <p className="reason-title">سبب الرفض:</p>
                    <p>{existingRequest.rejectionReason}</p>
                  </div>
                </div>
              )}
              
              {existingRequest.status === 'approved' && existingRequest.password && (
                <div className="success-info-box">
                  <span className="info-icon">🎉</span>
                  <div className="info-text">
                    <p><strong>تهانينا! تم قبول طلبك.</strong></p>
                    <p>يمكنك الآن تسجيل الدخول باستخدام البيانات التالية:</p>
                    <div className="credentials-box">
                      <div className="credential-item">
                        <span className="credential-label">البريد الإلكتروني:</span>
                        <span className="credential-value" dir="ltr">{existingRequest.email}</span>
                      </div>
                      <div className="credential-item">
                        <span className="credential-label">كلمة المرور:</span>
                        <span className="credential-value" dir="ltr">{existingRequest.password}</span>
                      </div>
                    </div>
                    <p className="important-note">⚠️ احفظ هذه البيانات في مكان آمن</p>
                  </div>
                </div>
              )}
              
              <div className="status-actions">
                <button className="btn-secondary" onClick={() => setExistingRequest(null)}>
                  رجوع
                </button>
                <button className="btn-primary" onClick={() => navigate('/')}>
                  {existingRequest.status === 'approved' ? 'تسجيل الدخول' : 'الصفحة الرئيسية'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER - USER TYPE SELECTION
  // ═══════════════════════════════════════════════════════════════
  
  if (!userType) {
    return (
      <div className="signup-page">
        <Navbar />
        
        {/* Modal */}
        {modal.isOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className={`modal-header ${modal.type}`}>
                <div className={`modal-icon ${modal.type}-icon`}>
                  {modal.type === 'success' ? '✓' : modal.type === 'error' ? '✕' : 'ℹ'}
                </div>
                <h2 className="modal-title">{modal.title}</h2>
              </div>
              <div className="modal-body">
                <p className="modal-message">{modal.message}</p>
              </div>
              <div className="modal-footer">
                <button className="modal-button" onClick={closeModal}>حسناً</button>
              </div>
            </div>
          </div>
        )}
        
        <div className="signup-container">
          <div className="user-type-selection">
            <div className="selection-header">
              <div className="selection-icon-main">🏥</div>
              <h1>مرحباً بك في Patient 360°</h1>
              <p>منصة الرعاية الصحية الموحدة - وزارة الصحة السورية</p>
            </div>
            
            <div className="selection-subtitle">
              <h2>اختر نوع الحساب</h2>
              <p>حدد نوع المستخدم للمتابعة في عملية التسجيل</p>
            </div>
            
            <div className="user-type-cards">
              {/* Patient Card */}
              <div className="user-type-card" onClick={() => setUserType('patient')}>
                <div className="type-card-icon patient">
                  <span>👤</span>
                </div>
                <h3>تسجيل كمريض</h3>
                <p>إنشاء حساب   للوصول إلى خدمات الرعاية الصحية</p>
                <ul className="type-features">
                  <li>✓ سجل طبي إلكتروني شامل</li>
                  <li>✓ حجز المواعيد</li>
                  <li>✓ متابعة الوصفات الطبية</li>
                  <li>✓ التواصل مع الأطباء</li>
                </ul>
                <div className="type-card-action">
                  <span>ابدأ التسجيل</span>
                  <span className="arrow">←</span>
                </div>
              </div>
              
              {/* Doctor Card */}
              <div className="user-type-card doctor" onClick={() => setUserType('doctor')}>
                <div className="type-card-icon doctor">
                  <span>👨‍⚕️</span>
                </div>
                <h3>تسجيل كطبيب</h3>
                <p>تقديم طلب انضمام للمنصة كطبيب معتمد</p>
                <ul className="type-features">
                  <li>✓ إدارة المرضى والمواعيد</li>
                  <li>✓ الوصول لنظام ECG AI (أطباء القلب)</li>
                  <li>✓ إصدار الوصفات الطبية</li>
                  <li>✓ التعاون مع المؤسسات الصحية</li>
                </ul>
                <div className="type-card-action">
                  <span>تقديم طلب</span>
                  <span className="arrow">←</span>
                </div>
                <div className="approval-badge">
                  <span>يتطلب موافقة الوزارة</span>
                </div>
              </div>
            </div>
            
            {/* Check Status Section */}
            <div className="check-status-section">
              <div className="check-status-divider">
                <span>أو</span>
              </div>
              <div className="check-status-card">
                <h4>لديك طلب تسجيل سابق؟</h4>
                <p>تحقق من حالة طلبك باستخدام بيانات التسجيل</p>
                <button
                  className="check-status-btn"
                  onClick={openStatusCheckModal}
                >
                  <span className="btn-icon">🔍</span>
                  تحقق من الحالة
                </button>
              </div>
            </div>
            
            {/* Status Check Modal */}
            {statusCheckModal.isOpen && (
              <div className="modal-overlay" onClick={closeStatusCheckModal}>
                <div className="status-check-modal" onClick={e => e.stopPropagation()}>
                  <div className="scm-header">
                    <div className="scm-icon-wrapper">
                      <div className="scm-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="scm-icon-pulse"></div>
                    </div>
                    <h2>التحقق من حالة الطلب</h2>
                    <p>أدخل البريد الإلكتروني المستخدم عند التسجيل للتحقق من حالة طلبك</p>
                  </div>
                  
                  <div className="scm-body">
                    {statusCheckModal.error && (
                      <div className="scm-error">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>{statusCheckModal.error}</span>
                      </div>
                    )}
                    
                    <div className="scm-form-group">
                      <label>البريد الإلكتروني</label>
                      <div className="scm-input-wrapper">
                        <span className="scm-input-icon">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </span>
                        <input
                          type="email"
                          placeholder="أدخل البريد الإلكتروني"
                          value={statusCheckModal.nationalId}
                          onChange={(e) => setStatusCheckModal(prev => ({ 
                            ...prev, 
                            nationalId: e.target.value.trim(),
                            error: '' 
                          }))}
                          disabled={statusCheckModal.isLoading}
                          dir="ltr"
                          className="email-input"
                        />
                      </div>
                      <div className="scm-input-hint">
                        <span className="hint-icon">ℹ️</span>
                        <span>البريد الإلكتروني المستخدم عند التسجيل</span>
                      </div>
                    </div>
                    
                    <button
                      className="scm-submit-btn"
                      onClick={handleStatusCheckSubmit}
                      disabled={statusCheckModal.isLoading || !statusCheckModal.nationalId}
                    >
                      {statusCheckModal.isLoading ? (
                        <span className="scm-loading">
                          <span className="scm-spinner"></span>
                          جارٍ البحث...
                        </span>
                      ) : (
                        <>
                          <span>التحقق من الحالة</span>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="scm-footer">
                    <button className="scm-close-btn" onClick={closeStatusCheckModal}>
                      إلغاء
                    </button>
                  </div>
                  
                  <div className="scm-security-note">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>بياناتك محمية ومشفرة</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="login-link">
              لديك حساب بالفعل؟ <Link to="/">تسجيل الدخول</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER - PATIENT REGISTRATION FORM
  // ═══════════════════════════════════════════════════════════════
  
  if (userType === 'patient') {
    return (
      <div className="signup-page">
        <Navbar />
        
        {/* Modal */}
        {modal.isOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className={`modal-header ${modal.type}`}>
                <div className={`modal-icon ${modal.type}-icon`}>
                  {modal.type === 'success' ? '✓' : '✕'}
                </div>
                <h2 className="modal-title">{modal.title}</h2>
              </div>
              <div className="modal-body">
                <p className="modal-message">{modal.message}</p>
              </div>
              <div className="modal-footer">
                <button className="modal-button" onClick={closeModal}>
                  {modal.type === 'success' ? 'تسجيل الدخول' : 'حسناً'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="signup-container">
          <div className="signup-wrapper">
            {/* Back Button */}
            <button className="back-to-selection" onClick={handleBackToSelection}>
              <span>→</span> العودة لاختيار نوع الحساب
            </button>
            
            {/* Progress Bar */}
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentStep - 1) / (patientTotalSteps - 1)) * 100}%` }}
              />
              <div className="progress-steps">
                {[1, 2, 3, 4].map(step => (
                  <div
                    key={step}
                    className={`progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Form Header */}
            <div className="form-header">
              <h1 className="form-title">تسجيل مريض جديد</h1>
              <p className="form-subtitle">
                {currentStep === 1 && 'المعلومات الشخصية'}
                {currentStep === 2 && 'المعلومات الطبية'}
                {currentStep === 3 && 'التاريخ الصحي وجهة الاتصال'}
                {currentStep === 4 && 'كلمة المرور'}
              </p>
            </div>
            
            {/* Form */}
            <form className="signup-form" onSubmit={handlePatientSubmit}>
              {/* STEP 1: Personal Information */}
              {currentStep === 1 && (
                <div className="form-step">
                  {/* Age Indicator */}
                  {patientFormData.dateOfBirth && (
                    <div className={`age-indicator ${isMinor ? 'minor' : 'adult'}`}>
                      <span className="age-icon">{isMinor ? '👶' : '👤'}</span>
                      <span>العمر: {age} سنة - {isMinor ? 'قاصر (أقل من 18)' : 'بالغ'}</span>
                    </div>
                  )}
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">الاسم الأول *</label>
                      <input
                        type="text"
                        name="firstName"
                        className={`form-input ${errors.firstName ? 'error' : ''}`}
                        value={patientFormData.firstName}
                        onChange={handlePatientChange}
                        placeholder="أدخل الاسم الأول"
                        maxLength={50}
                      />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">اسم الأب *</label>
                      <input
                        type="text"
                        name="fatherName"
                        className={`form-input ${errors.fatherName ? 'error' : ''}`}
                        value={patientFormData.fatherName}
                        onChange={handlePatientChange}
                        placeholder="أدخل اسم الأب"
                        maxLength={50}
                      />
                      {errors.fatherName && <span className="error-message">{errors.fatherName}</span>}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">اسم العائلة *</label>
                      <input
                        type="text"
                        name="lastName"
                        className={`form-input ${errors.lastName ? 'error' : ''}`}
                        value={patientFormData.lastName}
                        onChange={handlePatientChange}
                        placeholder="أدخل اسم العائلة"
                        maxLength={50}
                      />
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">اسم الأم الكامل *</label>
                      <input
                        type="text"
                        name="motherName"
                        className={`form-input ${errors.motherName ? 'error' : ''}`}
                        value={patientFormData.motherName}
                        onChange={handlePatientChange}
                        placeholder="أدخل اسم الأم الكامل"
                        maxLength={100}
                      />
                      {errors.motherName && <span className="error-message">{errors.motherName}</span>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      value={patientFormData.email}
                      onChange={handlePatientChange}
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">تاريخ الميلاد *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                      value={patientFormData.dateOfBirth}
                      onChange={handlePatientDateOfBirthChange}
                      max={getTodayDate()}
                    />
                    {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                  </div>
                  
                  {/* Conditional ID Field */}
                  <div className="form-group">
                    {isMinor ? (
                      <>
                        <label className="form-label">
                          الرقم الوطني للوالد/الوالدة *
                          <span className="label-hint">(الطفل أقل من 18 سنة)</span>
                        </label>
                        <input
                          type="text"
                          name="parentNationalId"
                          className={`form-input ${errors.parentNationalId ? 'error' : ''}`}
                          value={patientFormData.parentNationalId}
                          onChange={(e) => setPatientFormData({...patientFormData, parentNationalId: e.target.value.replace(/\D/g, '').slice(0, 11)})}
                          placeholder="أدخل الرقم الوطني للوالد/الوالدة (11 رقم)"
                          maxLength={11}
                          dir="ltr"
                        />
                        {errors.parentNationalId && <span className="error-message">{errors.parentNationalId}</span>}
                      </>
                    ) : (
                      <>
                        <label className="form-label">الرقم الوطني *</label>
                        <input
                          type="text"
                          name="nationalId"
                          className={`form-input ${errors.nationalId ? 'error' : ''}`}
                          value={patientFormData.nationalId}
                          onChange={(e) => setPatientFormData({...patientFormData, nationalId: e.target.value.replace(/\D/g, '').slice(0, 11)})}
                          placeholder="أدخل الرقم الوطني (11 رقم)"
                          maxLength={11}
                          dir="ltr"
                        />
                        {errors.nationalId && <span className="error-message">{errors.nationalId}</span>}
                      </>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">الجنس *</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={patientFormData.gender === 'male'}
                          onChange={handlePatientChange}
                        />
                        <span className="radio-custom"></span>
                        <span>ذكر</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={patientFormData.gender === 'female'}
                          onChange={handlePatientChange}
                        />
                        <span className="radio-custom"></span>
                        <span>أنثى</span>
                      </label>
                    </div>
                    {errors.gender && <span className="error-message">{errors.gender}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">رقم الهاتف *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                      value={patientFormData.phoneNumber}
                      onChange={handlePatientChange}
                      placeholder="+963 9X XXX XXXX"
                      dir="ltr"
                    />
                    {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">المحافظة *</label>
                      <select
                        name="governorate"
                        className={`form-input ${errors.governorate ? 'error' : ''}`}
                        value={patientFormData.governorate}
                        onChange={handlePatientChange}
                      >
                        <option value="">اختر المحافظة</option>
                        {SYRIAN_GOVERNORATES.map(gov => (
                          <option key={gov.id} value={gov.id}>{gov.nameAr}</option>
                        ))}
                      </select>
                      {errors.governorate && <span className="error-message">{errors.governorate}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">المدينة *</label>
                      <input
                        type="text"
                        name="city"
                        className={`form-input ${errors.city ? 'error' : ''}`}
                        value={patientFormData.city}
                        onChange={handlePatientChange}
                        placeholder="أدخل المدينة"
                      />
                      {errors.city && <span className="error-message">{errors.city}</span>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">العنوان</label>
                    <input
                      type="text"
                      name="address"
                      className={`form-input ${errors.address ? 'error' : ''}`}
                      value={patientFormData.address}
                      onChange={handlePatientChange}
                      placeholder="الحي، الشارع، البناء"
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                  </div>
                </div>
              )}
              
              {/* STEP 2: Medical Information */}
              {currentStep === 2 && (
                <div className="form-step">
                  <div className="form-group">
                    <label className="form-label">فصيلة الدم</label>
                    <select
                      name="bloodType"
                      className="form-input"
                      value={patientFormData.bloodType}
                      onChange={handlePatientChange}
                    >
                      <option value="">اختر فصيلة الدم</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">الطول (سم)</label>
                      <input
                        type="number"
                        name="height"
                        className={`form-input ${errors.height ? 'error' : ''}`}
                        value={patientFormData.height}
                        onChange={handlePatientChange}
                        placeholder="مثال: 175"
                        min="50"
                        max="300"
                      />
                      {errors.height && <span className="error-message">{errors.height}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">الوزن (كجم)</label>
                      <input
                        type="number"
                        name="weight"
                        className={`form-input ${errors.weight ? 'error' : ''}`}
                        value={patientFormData.weight}
                        onChange={handlePatientChange}
                        placeholder="مثال: 70"
                        min="2"
                        max="300"
                      />
                      {errors.weight && <span className="error-message">{errors.weight}</span>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">حالة التدخين</label>
                    <select
                      name="smokingStatus"
                      className="form-input"
                      value={patientFormData.smokingStatus}
                      onChange={handlePatientChange}
                    >
                      <option value="">اختر حالة التدخين</option>
                      {smokingStatuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              {/* STEP 3: Health History & Emergency Contact */}
              {currentStep === 3 && (
                <div className="form-step">
                  <div className="form-group">
                    <label className="form-label">الحساسية</label>
                    <textarea
                      name="allergies"
                      className="form-input"
                      value={patientFormData.allergies}
                      onChange={handlePatientChange}
                      placeholder="أدخل أي حساسية، مفصولة بفواصل"
                      rows="2"
                    />
                    <small className="form-hint">اختياري - افصل بين الحساسيات بفاصلة</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">الأمراض المزمنة</label>
                    <textarea
                      name="chronicDiseases"
                      className="form-input"
                      value={patientFormData.chronicDiseases}
                      onChange={handlePatientChange}
                      placeholder="أدخل أي أمراض مزمنة"
                      rows="2"
                    />
                    <small className="form-hint">اختياري</small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">التاريخ العائلي المرضي</label>
                    <textarea
                      name="familyHistory"
                      className="form-input"
                      value={patientFormData.familyHistory}
                      onChange={handlePatientChange}
                      placeholder="أدخل أي أمراض وراثية أو عائلية"
                      rows="2"
                    />
                    <small className="form-hint">اختياري</small>
                  </div>
                  
                  <div className="emergency-section">
                    <h3>جهة الاتصال للطوارئ *</h3>
                    
                    <div className="form-group">
                      <label className="form-label">اسم جهة الاتصال *</label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        className={`form-input ${errors.emergencyContactName ? 'error' : ''}`}
                        value={patientFormData.emergencyContactName}
                        onChange={handlePatientChange}
                        placeholder="الاسم الكامل"
                      />
                      {errors.emergencyContactName && <span className="error-message">{errors.emergencyContactName}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">صلة القرابة *</label>
                      <input
                        type="text"
                        name="emergencyContactRelationship"
                        className={`form-input ${errors.emergencyContactRelationship ? 'error' : ''}`}
                        value={patientFormData.emergencyContactRelationship}
                        onChange={handlePatientChange}
                        placeholder="مثال: أب، أم، أخ"
                      />
                      {errors.emergencyContactRelationship && <span className="error-message">{errors.emergencyContactRelationship}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">رقم هاتف الطوارئ *</label>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        className={`form-input ${errors.emergencyContactPhone ? 'error' : ''}`}
                        value={patientFormData.emergencyContactPhone}
                        onChange={handlePatientChange}
                        placeholder="+963 9X XXX XXXX"
                        dir="ltr"
                      />
                      {errors.emergencyContactPhone && <span className="error-message">{errors.emergencyContactPhone}</span>}
                    </div>
                  </div>
                </div>
              )}
              
              {/* STEP 4: Password */}
              {currentStep === 4 && (
                <div className="form-step">
                  <div className="form-group">
                    <label className="form-label">كلمة المرور *</label>
                    <input
                      type="password"
                      name="password"
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      value={patientFormData.password}
                      onChange={handlePatientChange}
                      placeholder="أدخل كلمة مرور قوية"
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">تأكيد كلمة المرور *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      value={patientFormData.confirmPassword}
                      onChange={handlePatientChange}
                      placeholder="أعد إدخال كلمة المرور"
                    />
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>
                  
                  <div className="password-requirements">
                    <p>متطلبات كلمة المرور:</p>
                    <ul>
                      <li className={patientFormData.password.length >= 8 ? 'met' : ''}>
                        ✓ 8 أحرف على الأقل
                      </li>
                      <li className={/[A-Z]/.test(patientFormData.password) ? 'met' : ''}>
                        ✓ حرف كبير واحد على الأقل (A-Z)
                      </li>
                      <li className={/[0-9]/.test(patientFormData.password) ? 'met' : ''}>
                        ✓ رقم واحد على الأقل (0-9)
                      </li>
                      <li className={/[!@#$%^&*]/.test(patientFormData.password) ? 'met' : ''}>
                        ✓ رمز خاص واحد على الأقل (!@#$%^&*)
                      </li>
                    </ul>
                  </div>
                  
                  <div className="terms-checkbox">
                    <label className="checkbox-label">
                      <input type="checkbox" required />
                      <span className="checkbox-custom"></span>
                      <span>أوافق على الشروط والأحكام وسياسة الخصوصية</span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Form Actions */}
              <div className="form-actions">
                {currentStep > 1 && (
                  <button type="button" className="btn-secondary" onClick={handlePrev}>
                    السابق
                  </button>
                )}
                
                {currentStep < patientTotalSteps ? (
                  <button type="button" className="btn-primary" onClick={handleNext}>
                    التالي
                  </button>
                ) : (
                  <button type="submit" className="btn-primary">
                    إنشاء الحساب
                  </button>
                )}
              </div>
              
              <div className="login-link">
                لديك حساب بالفعل؟ <Link to="/">تسجيل الدخول</Link>
              </div>
            </form>
          </div>
          
          {/* Side Illustration */}
          <div className="signup-illustration patient">
            <div className="illustration-content">
              <h2>تسجيل مريض جديد</h2>
              <p>انضم إلى منصة Patient 360°</p>
              
              <div className="features-list">
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>سجل طبي إلكتروني شامل</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>تواصل مباشر مع الأطباء</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>حجز المواعيد بسهولة</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>تتبع الوصفات الطبية</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>سجل صحي آمن ومشفر</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER - DOCTOR REGISTRATION REQUEST FORM
  // ═══════════════════════════════════════════════════════════════
  
  return (
    <div className="signup-page">
      <Navbar />
      
      {/* Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className={`modal-header ${modal.type}`}>
              <div className={`modal-icon ${modal.type}-icon`}>
                {modal.type === 'success' ? '✓' : '✕'}
              </div>
              <h2 className="modal-title">{modal.title}</h2>
            </div>
            <div className="modal-body">
              <p className="modal-message">{modal.message}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={closeModal}>حسناً</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="signup-container">
        <div className="signup-wrapper doctor-form">
          {/* Back Button */}
          <button className="back-to-selection" onClick={handleBackToSelection}>
            <span>→</span> العودة لاختيار نوع الحساب
          </button>
          
          {/* Progress Bar */}
          <div className="progress-bar">
            <div
              className="progress-fill doctor"
              style={{ width: `${((currentStep - 1) / (doctorTotalSteps - 1)) * 100}%` }}
            />
            <div className="progress-steps">
              {[1, 2, 3, 4].map(step => (
                <div
                  key={step}
                  className={`progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
              ))}
            </div>
          </div>
          
          {/* Form Header */}
          <div className="form-header doctor">
            <div className="doctor-header-badge">
              <span>👨‍⚕️</span>
              <span className="ministry-badge">وزارة الصحة</span>
            </div>
            <h1 className="form-title">طلب تسجيل طبيب</h1>
            <p className="form-subtitle">
              {currentStep === 1 && 'المعلومات الشخصية'}
              {currentStep === 2 && 'المعلومات المهنية'}
              {currentStep === 3 && 'الوثائق المطلوبة'}
              {currentStep === 4 && 'مراجعة وتقديم الطلب'}
            </p>
          </div>
          
          {/* Notice */}
          <div className="doctor-notice">
            <span className="notice-icon">ℹ️</span>
            <div className="notice-content">
              <strong>ملاحظة هامة:</strong>
              <p>سيتم مراجعة طلبك من قبل وزارة الصحة. عند القبول، ستتلقى بيانات الدخول عبر البريد الإلكتروني.</p>
            </div>
          </div>
          
          {/* Form */}
          <form className="signup-form doctor" onSubmit={handleDoctorSubmit}>
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div className="form-step">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الاسم الأول *</label>
                    <input
                      type="text"
                      name="firstName"
                      className={`form-input ${errors.firstName ? 'error' : ''}`}
                      value={doctorFormData.firstName}
                      onChange={handleDoctorChange}
                      placeholder="أدخل الاسم الأول"
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">اسم الأب *</label>
                    <input
                      type="text"
                      name="fatherName"
                      className={`form-input ${errors.fatherName ? 'error' : ''}`}
                      value={doctorFormData.fatherName}
                      onChange={handleDoctorChange}
                      placeholder="أدخل اسم الأب"
                    />
                    {errors.fatherName && <span className="error-message">{errors.fatherName}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الكنية *</label>
                    <input
                      type="text"
                      name="lastName"
                      className={`form-input ${errors.lastName ? 'error' : ''}`}
                      value={doctorFormData.lastName}
                      onChange={handleDoctorChange}
                      placeholder="أدخل الكنية"
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">اسم الأم الكامل *</label>
                    <input
                      type="text"
                      name="motherName"
                      className={`form-input ${errors.motherName ? 'error' : ''}`}
                      value={doctorFormData.motherName}
                      onChange={handleDoctorChange}
                      placeholder="أدخل اسم الأم الكامل"
                    />
                    {errors.motherName && <span className="error-message">{errors.motherName}</span>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">الرقم الوطني *</label>
                  <input
                    type="text"
                    name="nationalId"
                    className={`form-input ${errors.nationalId ? 'error' : ''}`}
                    value={doctorFormData.nationalId}
                    onChange={(e) => setDoctorFormData({...doctorFormData, nationalId: e.target.value.replace(/\D/g, '').slice(0, 11)})}
                    placeholder="أدخل الرقم الوطني (11 رقم)"
                    maxLength={11}
                    dir="ltr"
                  />
                  {errors.nationalId && <span className="error-message">{errors.nationalId}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">تاريخ الميلاد *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                      value={doctorFormData.dateOfBirth}
                      onChange={handleDoctorChange}
                    />
                    {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">الجنس *</label>
                    <select
                      name="gender"
                      className="form-input"
                      value={doctorFormData.gender}
                      onChange={handleDoctorChange}
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    value={doctorFormData.email}
                    onChange={handleDoctorChange}
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                  <small className="form-hint">سيتم إرسال بيانات الدخول إلى هذا البريد عند القبول</small>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">كلمة المرور *</label>
                    <input
                      type="password"
                      name="password"
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      value={doctorFormData.password}
                      onChange={handleDoctorChange}
                      required
                      minLength={8}
                      placeholder="8 أحرف على الأقل"
                      dir="ltr"
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                    <small className="form-hint">اختر كلمة مرور قوية</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">تأكيد كلمة المرور *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      value={doctorFormData.confirmPassword}
                      onChange={handleDoctorChange}
                      required
                      minLength={8}
                      placeholder="أعد إدخال كلمة المرور"
                      dir="ltr"
                    />
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">رقم الهاتف *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                    value={doctorFormData.phoneNumber}
                    onChange={handleDoctorChange}
                    placeholder="+963 9X XXX XXXX"
                    dir="ltr"
                  />
                  {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">المحافظة *</label>
                    <select
                      name="governorate"
                      className={`form-input ${errors.governorate ? 'error' : ''}`}
                      value={doctorFormData.governorate}
                      onChange={handleDoctorChange}
                    >
                      <option value="">اختر المحافظة</option>
                      {SYRIAN_GOVERNORATES.map(gov => (
                        <option key={gov.id} value={gov.id}>{gov.nameAr}</option>
                      ))}
                    </select>
                    {errors.governorate && <span className="error-message">{errors.governorate}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">المدينة *</label>
                    <input
                      type="text"
                      name="city"
                      className={`form-input ${errors.city ? 'error' : ''}`}
                      value={doctorFormData.city}
                      onChange={handleDoctorChange}
                      placeholder="أدخل المدينة"
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">عنوان العيادة *</label>
                  <input
                    type="text"
                    name="address"
                    className={`form-input ${errors.address ? 'error' : ''}`}
                    value={doctorFormData.address}
                    onChange={handleDoctorChange}
                    placeholder="العنوان التفصيلي للعيادة"
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>
              </div>
            )}
            
            {/* STEP 2: Professional Information */}
            {currentStep === 2 && (
              <div className="form-step">
                <div className="form-group">
                  <label className="form-label">رقم الترخيص الطبي *</label>
                  <input
                    type="text"
                    name="medicalLicenseNumber"
                    className={`form-input ${errors.medicalLicenseNumber ? 'error' : ''}`}
                    value={doctorFormData.medicalLicenseNumber}
                    onChange={handleDoctorChange}
                    placeholder="مثال: SY12345678"
                    dir="ltr"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.medicalLicenseNumber && <span className="error-message">{errors.medicalLicenseNumber}</span>}
                  <small className="form-hint">8-20 حرف/رقم (أحرف إنجليزية كبيرة وأرقام)</small>
                </div>
                
                <div className="form-group">
                  <label className="form-label">التخصص الطبي *</label>
                  <select
                    name="specialization"
                    className={`form-input ${errors.specialization ? 'error' : ''}`}
                    value={doctorFormData.specialization}
                    onChange={handleDoctorChange}
                  >
                    <option value="">اختر التخصص</option>
                    {MEDICAL_SPECIALIZATIONS.map(spec => (
                      <option key={spec.id} value={spec.id}>
                        {spec.icon} {spec.nameAr} {spec.hasECG ? '(ECG AI)' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.specialization && <span className="error-message">{errors.specialization}</span>}
                  
                  {/* ECG AI Notice for Cardiologists */}
                  {doctorFormData.specialization === 'cardiology' && (
                    <div className="ecg-notice">
                      <span className="ecg-icon">🤖❤️</span>
                      <span>كطبيب قلب، ستتمكن من استخدام نظام AI لتحليل تخطيط القلب (ECG)</span>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">التخصص الفرعي</label>
                  <input
                    type="text"
                    name="subSpecialization"
                    className="form-input"
                    value={doctorFormData.subSpecialization}
                    onChange={handleDoctorChange}
                    placeholder="مثال: جراحة القلب المفتوح"
                  />
                  <small className="form-hint">اختياري - إن وجد</small>
                </div>
                
                <div className="form-group">
                  <label className="form-label">مكان العمل / المستشفى *</label>
                  <input
                    type="text"
                    name="hospitalAffiliation"
                    className={`form-input ${errors.hospitalAffiliation ? 'error' : ''}`}
                    value={doctorFormData.hospitalAffiliation}
                    onChange={handleDoctorChange}
                    placeholder="اسم المستشفى أو المركز الصحي"
                  />
                  {errors.hospitalAffiliation && <span className="error-message">{errors.hospitalAffiliation}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">سنوات الخبرة *</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      className={`form-input ${errors.yearsOfExperience ? 'error' : ''}`}
                      value={doctorFormData.yearsOfExperience}
                      onChange={handleDoctorChange}
                      placeholder="0-60"
                      min="0"
                      max="60"
                    />
                    {errors.yearsOfExperience && <span className="error-message">{errors.yearsOfExperience}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">رسوم الكشف (ل.س)</label>
                    <input
                      type="number"
                      name="consultationFee"
                      className="form-input"
                      value={doctorFormData.consultationFee}
                      onChange={handleDoctorChange}
                      placeholder="اختياري"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">أيام العمل *</label>
                  <div className="weekdays-grid">
                    {WEEKDAYS.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        className={`weekday-btn ${doctorFormData.availableDays.includes(day.id) ? 'selected' : ''}`}
                        onClick={() => handleDayToggle(day.id)}
                      >
                        {day.nameAr}
                      </button>
                    ))}
                  </div>
                  {errors.availableDays && <span className="error-message">{errors.availableDays}</span>}
                </div>
              </div>
            )}
            
            {/* STEP 3: Documents */}
            {currentStep === 3 && (
              <div className="form-step">
                <div className="documents-intro">
                  <span className="docs-icon">📎</span>
                  <div>
                    <h3>الوثائق المطلوبة</h3>
                    <p>يرجى رفع الوثائق التالية للتحقق من هويتك المهنية</p>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">صورة الترخيص الطبي *</label>
                  <div className="file-upload-box">
                    <input
                      type="file"
                      id="licenseDocument"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'licenseDocument')}
                      className="file-input"
                    />
                    <label htmlFor="licenseDocument" className={`file-upload-label ${errors.licenseDocument ? 'error' : ''}`}>
                      <span className="upload-icon">📄</span>
                      <span className="upload-text">
                        {doctorFormData.licenseDocument
                          ? `✓ ${doctorFormData.licenseDocument.name}`
                          : 'اضغط لرفع الملف (PDF, JPG, PNG)'}
                      </span>
                    </label>
                  </div>
                  {errors.licenseDocument && <span className="error-message">{errors.licenseDocument}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">صورة شهادة الطب *</label>
                  <div className="file-upload-box">
                    <input
                      type="file"
                      id="medicalCertificate"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'medicalCertificate')}
                      className="file-input"
                    />
                    <label htmlFor="medicalCertificate" className={`file-upload-label ${errors.medicalCertificate ? 'error' : ''}`}>
                      <span className="upload-icon">🎓</span>
                      <span className="upload-text">
                        {doctorFormData.medicalCertificate
                          ? `✓ ${doctorFormData.medicalCertificate.name}`
                          : 'اضغط لرفع الملف (PDF, JPG, PNG)'}
                      </span>
                    </label>
                  </div>
                  {errors.medicalCertificate && <span className="error-message">{errors.medicalCertificate}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">صورة شخصية</label>
                  <div className="file-upload-box">
                    <input
                      type="file"
                      id="profilePhoto"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'profilePhoto')}
                      className="file-input"
                    />
                    <label htmlFor="profilePhoto" className="file-upload-label">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">
                        {doctorFormData.profilePhoto
                          ? `✓ ${doctorFormData.profilePhoto.name}`
                          : 'اختياري - صورة شخصية واضحة'}
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">ملاحظات إضافية</label>
                  <textarea
                    name="additionalNotes"
                    className="form-input"
                    value={doctorFormData.additionalNotes}
                    onChange={handleDoctorChange}
                    placeholder="أي معلومات إضافية تريد إضافتها للطلب"
                    rows="3"
                  />
                </div>
              </div>
            )}
            
            {/* STEP 4: Review */}
            {currentStep === 4 && (
              <div className="form-step review-step">
                <div className="review-header">
                  <span className="review-icon">📋</span>
                  <h3>مراجعة البيانات</h3>
                  <p>تأكد من صحة جميع البيانات قبل تقديم الطلب</p>
                </div>
                
                <div className="review-sections">
                  {/* Personal Info Review */}
                  <div className="review-section">
                    <h4>المعلومات الشخصية</h4>
                    <div className="review-grid">
                      <div className="review-item">
                        <span className="review-label">الاسم:</span>
                        <span className="review-value">{doctorFormData.firstName} {doctorFormData.fatherName} {doctorFormData.lastName}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">اسم الأم:</span>
                        <span className="review-value">{doctorFormData.motherName}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">الرقم الوطني:</span>
                        <span className="review-value">{doctorFormData.nationalId}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">البريد الإلكتروني:</span>
                        <span className="review-value">{doctorFormData.email}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">الهاتف:</span>
                        <span className="review-value">{doctorFormData.phoneNumber}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">المحافظة:</span>
                        <span className="review-value">
                          {SYRIAN_GOVERNORATES.find(g => g.id === doctorFormData.governorate)?.nameAr}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Professional Info Review */}
                  <div className="review-section">
                    <h4>المعلومات المهنية</h4>
                    <div className="review-grid">
                      <div className="review-item">
                        <span className="review-label">رقم الترخيص:</span>
                        <span className="review-value">{doctorFormData.medicalLicenseNumber.toUpperCase()}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">التخصص:</span>
                        <span className="review-value">
                          {MEDICAL_SPECIALIZATIONS.find(s => s.id === doctorFormData.specialization)?.nameAr}
                          {doctorFormData.specialization === 'cardiology' && ' 🤖❤️'}
                        </span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">مكان العمل:</span>
                        <span className="review-value">{doctorFormData.hospitalAffiliation}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">سنوات الخبرة:</span>
                        <span className="review-value">{doctorFormData.yearsOfExperience} سنة</span>
                      </div>
                      <div className="review-item full-width">
                        <span className="review-label">أيام العمل:</span>
                        <span className="review-value">
                          {doctorFormData.availableDays.map(d => WEEKDAYS.find(w => w.id === d)?.nameAr).join(' - ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Documents Review */}
                  <div className="review-section">
                    <h4>الوثائق المرفقة</h4>
                    <div className="review-docs">
                      <div className="review-doc">
                        <span className="doc-icon">📄</span>
                        <span>الترخيص الطبي: {doctorFormData.licenseDocument?.name || 'غير مرفق'}</span>
                      </div>
                      <div className="review-doc">
                        <span className="doc-icon">🎓</span>
                        <span>شهادة الطب: {doctorFormData.medicalCertificate?.name || 'غير مرفق'}</span>
                      </div>
                      <div className="review-doc">
                        <span className="doc-icon">📷</span>
                        <span>الصورة الشخصية: {doctorFormData.profilePhoto?.name || 'غير مرفقة'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="review-agreement">
                  <label className="checkbox-label">
                    <input type="checkbox" required />
                    <span className="checkbox-custom"></span>
                    <span>أقر بأن جميع المعلومات المقدمة صحيحة وأوافق على الشروط والأحكام</span>
                  </label>
                </div>
              </div>
            )}
            
            {/* Form Actions */}
            <div className="form-actions">
              {currentStep > 1 && (
                <button type="button" className="btn-secondary" onClick={handlePrev}>
                  السابق
                </button>
              )}
              
              {currentStep < doctorTotalSteps ? (
                <button type="button" className="btn-primary" onClick={handleNext}>
                  التالي
                </button>
              ) : (
                <button type="submit" className="btn-primary submit-request">
                  <span>📋</span> تقديم الطلب
                </button>
              )}
            </div>
            
            <div className="login-link">
              لديك حساب بالفعل؟ <Link to="/">تسجيل الدخول</Link>
            </div>
          </form>
        </div>
        
        {/* Side Illustration for Doctor */}
        <div className="signup-illustration doctor">
          <div className="illustration-content">
            <div className="ministry-emblem">
              <span className="emblem-icon">🏛️</span>
              <span className="emblem-text">وزارة الصحة السورية</span>
            </div>
            <h2>تسجيل طبيب جديد</h2>
            <p>انضم إلى منصة Patient 360°</p>
            
            <div className="features-list">
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>إدارة متكاملة للمرضى</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>نظام ECG AI لأطباء القلب</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>إصدار الوصفات الإلكترونية</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>سجلات طبية مؤمنة</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>تعاون مع المؤسسات الصحية</span>
              </div>
            </div>
            
            <div className="approval-info">
              <span className="approval-icon">⏳</span>
              <p>يخضع الطلب لمراجعة وزارة الصحة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
