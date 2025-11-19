import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import '../styles/SignUp.css';

/**
 * SignUp Component - Patient Registration System
 * 
 * This component handles the complete patient registration process for the Patient 360° platform.
 * Only patients can register through this page. Admin and doctor accounts are created separately
 * by system administrators for security purposes.
 * 
 * Database Integration (Production):
 * - Frontend validation (current) + Backend validation (required)
 * - Creates Person document in Persons collection via POST /api/persons
 * - Creates Account document in Accounts collection via POST /api/accounts
 * - Creates Patient document in Patients collection via POST /api/patients
 * - Password must be bcrypt hashed on backend (NEVER on frontend)
 * 
 * Current State: Uses localStorage for development simulation
 * Production: Will use REST API calls to backend server connected to MongoDB
 * 
 * @component
 * @returns {JSX.Element} Multi-step patient registration form
 * 
 * @see {@link https://www.mongodb.com/docs/manual/core/data-modeling-introduction/ MongoDB Data Modeling}
 * @see {@link https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html OWASP Authentication}
 */
const SignUp = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Modal state for success/error messages
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'success' or 'error'
    title: '',
    message: '',
    onClose: null
  });
  
  /**
   * Form state containing all fields from Persons, Accounts, and Patients collections
   * Organized according to MongoDB schema requirements
   */
  const [formData, setFormData] = useState({
    // ========== Persons Collection Fields ==========
    nationalId: '',           // Required: 11 digits
    firstName: '',            // Required: 2-50 chars, Arabic or English
    lastName: '',             // Required: 2-50 chars, Arabic or English
    dateOfBirth: '',          // Required: date (must be in the past)
    gender: '',               // Required: 'male' or 'female'
    phoneNumber: '',          // Required: Syrian format +963 or 09
    address: '',              // Optional: 5-200 chars
    
    // ========== Accounts Collection Fields ==========
    email: '',                // Required: valid email format
    password: '',             // Required: will be bcrypt hashed (60 chars)
    confirmPassword: '',      // For validation only
    
    // ========== Patients Collection Fields ==========
    // Basic Medical Info
    bloodType: '',            // Optional: A+, A-, B+, B-, AB+, AB-, O+, O-
    height: '',               // Optional: 50-250 cm
    weight: '',               // Optional: 2-300 kg
    smokingStatus: '',        // Optional: non-smoker, former smoker, current smoker
    
    // Health History (Arrays)
    allergies: '',            // Optional: Will be converted to array
    chronicDiseases: '',      // Optional: Will be converted to array
    familyHistory: '',        // Optional: Will be converted to array
    
    // Emergency Contact (Object)
    emergencyContactName: '',         // Required in emergencyContact object
    emergencyContactRelationship: '', // Required in emergencyContact object
    emergencyContactPhone: ''         // Required in emergencyContact object
  });

  const [errors, setErrors] = useState({});

  /**
   * Blood type options as per Patients collection schema
   */
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  /**
   * Smoking status options as per Patients collection schema
   */
  const smokingStatuses = [
    { value: 'non-smoker', label: 'غير مدخن' },
    { value: 'former smoker', label: 'مدخن سابق' },
    { value: 'current smoker', label: 'مدخن حالي' }
  ];

  /**
   * Opens the modal with specified configuration
   * 
   * @param {string} type - 'success' or 'error'
   * @param {string} title - Modal title
   * @param {string} message - Modal message
   * @param {function} onClose - Optional callback when modal closes
   */
  const openModal = (type, title, message, onClose = null) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onClose
    });
  };

  /**
   * Closes the modal and executes callback if provided
   */
  const closeModal = () => {
    if (modal.onClose) {
      modal.onClose();
    }
    setModal({
      isOpen: false,
      type: '',
      title: '',
      message: '',
      onClose: null
    });
  };

  /**
   * Validates Syrian phone number format
   * Accepts: +963XXXXXXXXX or 09XXXXXXXX
   * 
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid Syrian phone number
   * 
   * @see {@link https://en.wikipedia.org/wiki/Telephone_numbers_in_Syria Syrian Phone Format}
   */
  const isValidSyrianPhone = (phone) => {
    const cleanPhone = phone.replace(/\s/g, '');
    // Syrian format: +963 followed by 9 digits OR 09 followed by 8 digits
    const syrianPattern = /^(\+963[0-9]{9}|09[0-9]{8})$/;
    return syrianPattern.test(cleanPhone);
  };

  /**
   * Validates that the date is not in the future
   * Used for date of birth validation
   * 
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @returns {boolean} True if date is in the past
   */
  const isDateInPast = (dateString) => {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
    return selectedDate < today;
  };

  /**
   * Calculates age from date of birth
   * 
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @returns {number} Age in years
   */
  const calculateAge = (dateString) => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Validates Arabic or English names according to Persons collection schema
   * Pattern: ^[a-zA-Z\u0600-\u06FF\\s]+$
   * 
   * @param {string} name - Name to validate
   * @returns {boolean} True if valid name format
   */
  const isValidName = (name) => {
    const namePattern = /^[a-zA-Z\u0600-\u06FF\s]+$/;
    return namePattern.test(name);
  };

  /**
   * Comprehensive validation function for each step
   * Implements all validation rules from MongoDB schema
   * 
   * NOTE: This is CLIENT-SIDE validation only. In production, you MUST
   * validate again on the backend before saving to database.
   * 
   * @returns {boolean} True if current step passes all validations
   */
  const validateStep = () => {
    const newErrors = {};

    // ========================================
    // STEP 1: Personal Information (Persons Collection)
    // ========================================
    if (currentStep === 1) {
      // First Name Validation (required, 2-50 chars, Arabic/English only)
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'الاسم الأول مطلوب';
      } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = 'الاسم الأول يجب أن يكون حرفين على الأقل';
      } else if (formData.firstName.trim().length > 50) {
        newErrors.firstName = 'الاسم الأول يجب ألا يتجاوز 50 حرفاً';
      } else if (!isValidName(formData.firstName)) {
        newErrors.firstName = 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط';
      }
      
      // Last Name Validation (required, 2-50 chars, Arabic/English only)
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'اسم العائلة مطلوب';
      } else if (formData.lastName.trim().length < 2) {
        newErrors.lastName = 'اسم العائلة يجب أن يكون حرفين على الأقل';
      } else if (formData.lastName.trim().length > 50) {
        newErrors.lastName = 'اسم العائلة يجب ألا يتجاوز 50 حرفاً';
      } else if (!isValidName(formData.lastName)) {
        newErrors.lastName = 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط';
      }
      
      // Email Validation (required, valid email format)
      if (!formData.email.trim()) {
        newErrors.email = 'البريد الإلكتروني مطلوب';
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        newErrors.email = 'البريد الإلكتروني غير صحيح';
      }
      
      // Phone Number Validation (required, Syrian format)
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'رقم الهاتف مطلوب';
      } else if (!isValidSyrianPhone(formData.phoneNumber)) {
        newErrors.phoneNumber = 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ +963 أو 09)';
      }
      
      // National ID Validation (required, exactly 11 digits)
      if (!formData.nationalId.trim()) {
        newErrors.nationalId = 'رقم الهوية الوطنية مطلوب';
      } else if (!/^[0-9]{11}$/.test(formData.nationalId)) {
        newErrors.nationalId = 'رقم الهوية يجب أن يكون 11 رقم بالضبط';
      }
      
      // Date of Birth Validation (required, must be in the past)
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'تاريخ الميلاد مطلوب';
      } else if (!isDateInPast(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'تاريخ الميلاد يجب أن يكون في الماضي';
      } else {
        const age = calculateAge(formData.dateOfBirth);
        if (age < 1) {
          newErrors.dateOfBirth = 'العمر يجب أن يكون سنة واحدة على الأقل';
        } else if (age > 120) {
          newErrors.dateOfBirth = 'تاريخ الميلاد غير صحيح';
        }
      }
      
      // Gender Validation (required)
      if (!formData.gender) {
        newErrors.gender = 'يرجى اختيار الجنس';
      }
      
      // Address Validation (optional, but if provided must be 5-200 chars)
      if (formData.address.trim() && formData.address.trim().length < 5) {
        newErrors.address = 'العنوان يجب أن يكون 5 أحرف على الأقل';
      } else if (formData.address.trim().length > 200) {
        newErrors.address = 'العنوان يجب ألا يتجاوز 200 حرف';
      }
    }

    // ========================================
    // STEP 2: Medical Information (Patients Collection)
    // ========================================
    if (currentStep === 2) {
      // Height Validation (optional, but if provided must be 50-250 cm)
      if (formData.height && (formData.height < 50 || formData.height > 250)) {
        newErrors.height = 'الطول يجب أن يكون بين 50 و 250 سم';
      }
      
      // Weight Validation (optional, but if provided must be 2-300 kg)
      if (formData.weight && (formData.weight < 2 || formData.weight > 300)) {
        newErrors.weight = 'الوزن يجب أن يكون بين 2 و 300 كجم';
      }
    }

    // ========================================
    // STEP 3: Health History & Emergency Contact (Patients Collection)
    // ========================================
    if (currentStep === 3) {
      // Emergency Contact Name Validation (required, 2-100 chars, Arabic/English)
      if (!formData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = 'اسم جهة الاتصال للطوارئ مطلوب';
      } else if (formData.emergencyContactName.trim().length < 2) {
        newErrors.emergencyContactName = 'الاسم يجب أن يكون حرفين على الأقل';
      } else if (formData.emergencyContactName.trim().length > 100) {
        newErrors.emergencyContactName = 'الاسم يجب ألا يتجاوز 100 حرف';
      } else if (!isValidName(formData.emergencyContactName)) {
        newErrors.emergencyContactName = 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط';
      }
      
      // Emergency Contact Relationship Validation (required, 2-50 chars)
      if (!formData.emergencyContactRelationship.trim()) {
        newErrors.emergencyContactRelationship = 'صلة القرابة مطلوبة';
      } else if (formData.emergencyContactRelationship.trim().length < 2) {
        newErrors.emergencyContactRelationship = 'صلة القرابة يجب أن تكون حرفين على الأقل';
      } else if (formData.emergencyContactRelationship.trim().length > 50) {
        newErrors.emergencyContactRelationship = 'صلة القرابة يجب ألا تتجاوز 50 حرفاً';
      }
      
      // Emergency Contact Phone Validation (required, Syrian format)
      if (!formData.emergencyContactPhone.trim()) {
        newErrors.emergencyContactPhone = 'رقم هاتف الطوارئ مطلوب';
      } else if (!isValidSyrianPhone(formData.emergencyContactPhone)) {
        newErrors.emergencyContactPhone = 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ +963 أو 09)';
      }
      
      // Allergies Validation (optional, each item 2-100 chars if provided)
      if (formData.allergies.trim()) {
        const allergiesArray = formData.allergies.split(',').map(item => item.trim());
        for (let allergy of allergiesArray) {
          if (allergy && (allergy.length < 2 || allergy.length > 100)) {
            newErrors.allergies = 'كل حساسية يجب أن تكون بين 2 و 100 حرف';
            break;
          }
        }
      }
      
      // Chronic Diseases Validation (optional, each item 2-100 chars if provided)
      if (formData.chronicDiseases.trim()) {
        const diseasesArray = formData.chronicDiseases.split(',').map(item => item.trim());
        for (let disease of diseasesArray) {
          if (disease && (disease.length < 2 || disease.length > 100)) {
            newErrors.chronicDiseases = 'كل مرض يجب أن يكون بين 2 و 100 حرف';
            break;
          }
        }
      }
      
      // Family History Validation (optional, each item 5-200 chars if provided)
      if (formData.familyHistory.trim()) {
        const historyArray = formData.familyHistory.split(',').map(item => item.trim());
        for (let history of historyArray) {
          if (history && (history.length < 5 || history.length > 200)) {
            newErrors.familyHistory = 'كل سجل عائلي يجب أن يكون بين 5 و 200 حرف';
            break;
          }
        }
      }
    }

    // ========================================
    // STEP 4: Password & Account Security (Accounts Collection)
    // ========================================
    if (currentStep === 4) {
      // Password Validation (required, min 8 chars, must have uppercase, number, special char)
      if (!formData.password) {
        newErrors.password = 'كلمة المرور مطلوبة';
      } else if (formData.password.length < 8) {
        newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
      } else if (!/[!@#$%^&*]/.test(formData.password)) {
        newErrors.password = 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%^&*)';
      }
      
      // Confirm Password Validation (required, must match password)
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Advances to the next registration step
   */
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  /**
   * Returns to the previous registration step
   */
  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  /**
   * Handles form submission and creates patient account
   * 
   * Process Flow (Development - localStorage):
   * 1. Validates all form data
   * 2. Checks for existing email/nationalId
   * 3. Creates Person document structure
   * 4. Creates Account document structure
   * 5. Creates Patient document structure
   * 6. Saves to localStorage
   * 
   * Process Flow (Production - Backend API):
   * 1. Validates all form data (frontend)
   * 2. POST to /api/auth/register with form data
   * 3. Backend validates data again
   * 4. Backend hashes password with bcrypt
   * 5. Backend creates documents in MongoDB collections
   * 6. Backend returns JWT token
   * 7. Frontend stores token and redirects to dashboard
   * 
   * @param {Event} e - Form submit event
   * 
   * @see {@link https://www.mongodb.com/docs/manual/reference/method/db.collection.insertOne/ MongoDB insertOne}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate checking for existing users
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      const emailExists = existingUsers.some(user => user.email === formData.email);
      if (emailExists) {
        setErrors({ submit: 'البريد الإلكتروني مستخدم بالفعل' });
        setLoading(false);
        openModal(
          'error',
          'خطأ في التسجيل',
          'البريد الإلكتروني مستخدم بالفعل. الرجاء استخدام بريد إلكتروني آخر أو تسجيل الدخول.'
        );
        return;
      }

      const nationalIdExists = existingUsers.some(user => user.nationalId === formData.nationalId);
      if (nationalIdExists) {
        setErrors({ submit: 'رقم الهوية الوطنية مستخدم بالفعل' });
        setLoading(false);
        openModal(
          'error',
          'خطأ في التسجيل',
          'رقم الهوية الوطنية مستخدم بالفعل. الرجاء التحقق من البيانات المدخلة.'
        );
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const currentDate = new Date().toISOString();
      
      /**
       * Person Document (Persons Collection)
       * Contains demographic information shared across all user types
       */
      const personData = {
        _id: Date.now(), // In production, this would be MongoDB ObjectId
        nationalId: formData.nationalId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        gender: formData.gender,
        phoneNumber: formData.phoneNumber.replace(/\s/g, ''),
        address: formData.address.trim() || undefined, // Optional field
        createdAt: currentDate,
        updatedAt: currentDate
      };

      /**
       * Account Document (Accounts Collection)
       * Contains authentication credentials and role information
       * 
       * SECURITY NOTE: In production, password MUST be hashed on backend with bcrypt
       * NEVER hash passwords on frontend or send plain passwords in logs/alerts
       */
      const accountData = {
        _id: Date.now() + 1,
        email: formData.email.trim().toLowerCase(),
        password: formData.password, // Will be bcrypt hashed on backend in production
        roles: ['patient'], // Patient role only
        personId: personData._id,
        isActive: true,
        lastLogin: null,
        createdAt: currentDate,
        updatedAt: currentDate
      };

      /**
       * Patient Document (Patients Collection)
       * Contains medical profile and health information
       */
      const patientData = {
        _id: Date.now() + 2,
        personId: personData._id,
        
        // Basic Medical Information
        bloodType: formData.bloodType || undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        smokingStatus: formData.smokingStatus || undefined,
        
        // Health History Arrays
        allergies: formData.allergies.trim() 
          ? formData.allergies.split(',').map(item => item.trim()).filter(item => item)
          : [],
        chronicDiseases: formData.chronicDiseases.trim()
          ? formData.chronicDiseases.split(',').map(item => item.trim()).filter(item => item)
          : [],
        familyHistory: formData.familyHistory.trim()
          ? formData.familyHistory.split(',').map(item => item.trim()).filter(item => item)
          : [],
        
        // Emergency Contact Object (Required fields)
        emergencyContact: {
          name: formData.emergencyContactName.trim(),
          relationship: formData.emergencyContactRelationship.trim(),
          phoneNumber: formData.emergencyContactPhone.replace(/\s/g, '')
        },
        
        createdAt: currentDate,
        updatedAt: currentDate
      };

      /**
       * Combined user object for localStorage
       * In production, these would be three separate API calls to create documents
       */
      const newUser = {
        person: personData,
        account: accountData,
        patient: patientData,
        
        // Flattened data for easy access (used for login)
        id: accountData._id,
        email: accountData.email,
        password: accountData.password,
        role: 'patient',
        nationalId: personData.nationalId,
        firstName: personData.firstName,
        lastName: personData.lastName,
        phoneNumber: personData.phoneNumber
      };

      // Save to localStorage (simulating database)
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      setLoading(false);

      // Show success modal with secure message (NO PASSWORD SHOWN)
      openModal(
        'success',
        'تم إنشاء الحساب بنجاح! ✅',
        `مرحباً ${formData.firstName} ${formData.lastName}\n\nتم تسجيلك كمريض في منصة Patient 360° بنجاح.\n\nيمكنك الآن تسجيل الدخول باستخدام البريد الإلكتروني:\n${formData.email}`,
        () => navigate('/')
      );
      
    } catch (error) {
      setLoading(false);
      setErrors({ submit: 'حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى.' });
      openModal(
        'error',
        'خطأ في النظام',
        'حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى لاحقاً.'
      );
    }
  };

  /**
   * Handles input field changes and clears associated errors
   * 
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="signup-page">
      <Navbar />
      
      {/* Custom Modal Component */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header ${modal.type}`}>
              {modal.type === 'success' ? (
                <div className="modal-icon success-icon">✓</div>
              ) : (
                <div className="modal-icon error-icon">✕</div>
              )}
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
          {/* Progress Bar */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
            <div className="progress-steps">
              {[1, 2, 3, 4].map(step => (
                <div 
                  key={step} 
                  className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
              ))}
            </div>
          </div>

          {/* Form Header */}
          <div className="form-header">
            <h1 className="form-title">إنشاء حساب مريض جديد</h1>
            <p className="form-subtitle">
              {currentStep === 1 && 'المعلومات الشخصية'}
              {currentStep === 2 && 'المعلومات الطبية'}
              {currentStep === 3 && 'السجل الصحي وجهة الاتصال للطوارئ'}
              {currentStep === 4 && 'حماية الحساب'}
            </p>
          </div>

          {/* Error Alert */}
          {errors.submit && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="signup-form">
            
            {/* ============================================ */}
            {/* STEP 1: Personal Information (Persons Collection) */}
            {/* ============================================ */}
            {currentStep === 1 && (
              <div className="form-step">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الاسم الأول *</label>
                    <input
                      type="text"
                      name="firstName"
                      className={`form-input ${errors.firstName ? 'error' : ''}`}
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="أدخل اسمك الأول (عربي أو إنجليزي)"
                      maxLength="50"
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">اسم العائلة *</label>
                    <input
                      type="text"
                      name="lastName"
                      className={`form-input ${errors.lastName ? 'error' : ''}`}
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="أدخل اسم العائلة (عربي أو إنجليزي)"
                      maxLength="50"
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@domain.com"
                    dir="ltr"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">رقم الهاتف *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+963 9X XXX XXXX أو 09X XXX XXXX"
                      dir="ltr"
                    />
                    {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                    <small className="form-hint">الرقم السوري فقط (+963 أو 09)</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">رقم الهوية الوطنية *</label>
                    <input
                      type="text"
                      name="nationalId"
                      className={`form-input ${errors.nationalId ? 'error' : ''}`}
                      value={formData.nationalId}
                      onChange={handleChange}
                      placeholder="رقم 11"
                      dir="ltr"
                      maxLength="11"
                    />
                    {errors.nationalId && <span className="error-message">{errors.nationalId}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">تاريخ الميلاد *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    />
                    {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                    {formData.dateOfBirth && isDateInPast(formData.dateOfBirth) && (
                      <small className="form-hint">العمر: {calculateAge(formData.dateOfBirth)} سنة</small>
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
                          checked={formData.gender === 'male'}
                          onChange={handleChange}
                        />
                        <span className="radio-custom"></span>
                        <span>ذكر</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={handleChange}
                        />
                        <span className="radio-custom"></span>
                        <span>أنثى</span>
                      </label>
                    </div>
                    {errors.gender && <span className="error-message">{errors.gender}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">العنوان</label>
                  <textarea
                    name="address"
                    className={`form-input ${errors.address ? 'error' : ''}`}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="أدخل عنوانك الكامل (اختياري)"
                    rows="3"
                    maxLength="200"
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                  <small className="form-hint">اختياري - يمكنك تركه فارغاً</small>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* STEP 2: Medical Information (Patients Collection) */}
            {/* ============================================ */}
            {currentStep === 2 && (
              <div className="form-step">
                <div className="form-group">
                  <label className="form-label">فصيلة الدم</label>
                  <select
                    name="bloodType"
                    className={`form-input ${errors.bloodType ? 'error' : ''}`}
                    value={formData.bloodType}
                    onChange={handleChange}
                  >
                    <option value="">اختر فصيلة الدم (اختياري)</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.bloodType && <span className="error-message">{errors.bloodType}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الطول (سم)</label>
                    <input
                      type="number"
                      name="height"
                      className={`form-input ${errors.height ? 'error' : ''}`}
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="الطول بالسنتيمتر"
                      min="50"
                      max="250"
                      step="0.1"
                    />
                    {errors.height && <span className="error-message">{errors.height}</span>}
                    <small className="form-hint">من 50 إلى 250 سم (اختياري)</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">الوزن (كجم)</label>
                    <input
                      type="number"
                      name="weight"
                      className={`form-input ${errors.weight ? 'error' : ''}`}
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="الوزن بالكيلوجرام"
                      min="2"
                      max="300"
                      step="0.1"
                    />
                    {errors.weight && <span className="error-message">{errors.weight}</span>}
                    <small className="form-hint">من 2 إلى 300 كجم (اختياري)</small>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">حالة التدخين</label>
                  <select
                    name="smokingStatus"
                    className={`form-input ${errors.smokingStatus ? 'error' : ''}`}
                    value={formData.smokingStatus}
                    onChange={handleChange}
                  >
                    <option value="">اختر حالة التدخين (اختياري)</option>
                    {smokingStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {errors.smokingStatus && <span className="error-message">{errors.smokingStatus}</span>}
                </div>

                <div className="info-message">
                  <span className="info-icon">ℹ️</span>
                  <span>جميع المعلومات في هذه الخطوة اختيارية، ولكن تقديمها يساعد في تحسين جودة الرعاية الطبية</span>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* STEP 3: Health History & Emergency Contact (Patients Collection) */}
            {/* ============================================ */}
            {currentStep === 3 && (
              <div className="form-step">
                <h3 style={{ marginBottom: '20px', color: '#125c7a' }}>السجل الصحي</h3>
                
                <div className="form-group">
                  <label className="form-label">الحساسية</label>
                  <textarea
                    name="allergies"
                    className={`form-input ${errors.allergies ? 'error' : ''}`}
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="أدخل أي حساسية لديك، مفصولة بفواصل (مثال: بنسلين، فول سوداني، حليب)"
                    rows="2"
                  />
                  {errors.allergies && <span className="error-message">{errors.allergies}</span>}
                  <small className="form-hint">اختياري - افصل بين الحساسيات بفاصلة (،)</small>
                </div>

                <div className="form-group">
                  <label className="form-label">الأمراض المزمنة</label>
                  <textarea
                    name="chronicDiseases"
                    className={`form-input ${errors.chronicDiseases ? 'error' : ''}`}
                    value={formData.chronicDiseases}
                    onChange={handleChange}
                    placeholder="أدخل أي أمراض مزمنة، مفصولة بفواصل (مثال: سكري، ضغط دم، ربو)"
                    rows="2"
                  />
                  {errors.chronicDiseases && <span className="error-message">{errors.chronicDiseases}</span>}
                  <small className="form-hint">اختياري - افصل بين الأمراض بفاصلة (،)</small>
                </div>

                <div className="form-group">
                  <label className="form-label">التاريخ العائلي المرضي</label>
                  <textarea
                    name="familyHistory"
                    className={`form-input ${errors.familyHistory ? 'error' : ''}`}
                    value={formData.familyHistory}
                    onChange={handleChange}
                    placeholder="أدخل أي أمراض وراثية أو عائلية، مفصولة بفواصل (مثال: أمراض قلب عند الوالد، سكري عند الوالدة)"
                    rows="2"
                  />
                  {errors.familyHistory && <span className="error-message">{errors.familyHistory}</span>}
                  <small className="form-hint">اختياري - افصل بين الأمراض بفاصلة (،)</small>
                </div>

                <div style={{ margin: '30px 0', borderTop: '2px solid #e5e7eb', paddingTop: '30px' }}>
                  <h3 style={{ marginBottom: '20px', color: '#125c7a' }}>جهة الاتصال للطوارئ *</h3>
                  
                  <div className="form-group">
                    <label className="form-label">اسم جهة الاتصال *</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      className={`form-input ${errors.emergencyContactName ? 'error' : ''}`}
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      placeholder="الاسم الكامل"
                      maxLength="100"
                    />
                    {errors.emergencyContactName && <span className="error-message">{errors.emergencyContactName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">صلة القرابة *</label>
                    <input
                      type="text"
                      name="emergencyContactRelationship"
                      className={`form-input ${errors.emergencyContactRelationship ? 'error' : ''}`}
                      value={formData.emergencyContactRelationship}
                      onChange={handleChange}
                      placeholder="مثال: أب، أم، أخ، زوج/زوجة"
                      maxLength="50"
                    />
                    {errors.emergencyContactRelationship && <span className="error-message">{errors.emergencyContactRelationship}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">رقم هاتف الطوارئ *</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      className={`form-input ${errors.emergencyContactPhone ? 'error' : ''}`}
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      placeholder="+963 9X XXX XXXX أو 09X XXX XXXX"
                      dir="ltr"
                    />
                    {errors.emergencyContactPhone && <span className="error-message">{errors.emergencyContactPhone}</span>}
                    <small className="form-hint">الرقم السوري فقط (+963 أو 09)</small>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* STEP 4: Password & Account Security (Accounts Collection) */}
            {/* ============================================ */}
            {currentStep === 4 && (
              <div className="form-step">
                <div className="form-group">
                  <label className="form-label">كلمة المرور *</label>
                  <input
                    type="password"
                    name="password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    value={formData.password}
                    onChange={handleChange}
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
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="أعد إدخال كلمة المرور"
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                <div className="password-requirements">
                  <p>متطلبات كلمة المرور:</p>
                  <ul>
                    <li className={formData.password.length >= 8 ? 'met' : ''}>
                      ✓ 8 أحرف على الأقل
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
                      ✓ حرف كبير واحد على الأقل (A-Z)
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'met' : ''}>
                      ✓ رقم واحد على الأقل (0-9)
                    </li>
                    <li className={/[!@#$%^&*]/.test(formData.password) ? 'met' : ''}>
                      ✓ رمز خاص واحد على الأقل (!@#$%^&*)
                    </li>
                  </ul>
                </div>

                <div className="info-message" style={{ marginTop: '20px' }}>
                  <span className="info-icon">🔒</span>
                  <span>سيتم تشفير كلمة المرور الخاصة بك باستخدام خوارزمية bcrypt لضمان أقصى درجات الأمان</span>
                </div>

                <div className="terms-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      required
                    />
                    <span className="checkbox-custom"></span>
                    <span>أوافق على <a href="#" onClick={(e) => e.preventDefault()}>الشروط والأحكام</a> و <a href="#" onClick={(e) => e.preventDefault()}>سياسة الخصوصية</a></span>
                  </label>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePrev}
                  disabled={loading}
                >
                  السابق
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                  disabled={loading}
                >
                  التالي
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                </button>
              )}
            </div>

            <div className="login-link">
              لديك حساب بالفعل؟ <Link to="/">تسجيل الدخول</Link>
            </div>

          </form>
        </div>

        {/* Side Illustration */}
        <div className="signup-illustration">
          <div className="illustration-content">
            <h2>مرحباً بك في Patient 360°</h2>
            <p>انضم إلى منصة الرعاية الصحية الرائدة</p>
            
            <div className="features-list">
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>إدارة متكاملة للسجلات الطبية</span>
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
};

export default SignUp;