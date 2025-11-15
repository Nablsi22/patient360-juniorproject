import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import '../styles/SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    licenseNumber: '',
    institution: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    nationalId: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  const roles = [
    { value: 'doctor', label: 'طبيب', icon: '👨‍⚕️', color: '#125c7a' },
    { value: 'patient', label: 'مريض', icon: '👤', color: '#10b981' },
    { value: 'pharmacist', label: 'صيدلاني', icon: '💊', color: '#a23f97' },
    { value: 'laboratory', label: 'أخصائي مختبر', icon: '🔬', color: '#f59e0b' }
  ];

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب';
      if (!formData.lastName.trim()) newErrors.lastName = 'اسم العائلة مطلوب';
      if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'البريد الإلكتروني غير صحيح';
      if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
    }

    if (currentStep === 2) {
      if (!formData.role) newErrors.role = 'يرجى اختيار الدور';
    }

    if (currentStep === 3) {
      if ((formData.role === 'doctor' || formData.role === 'pharmacist' || formData.role === 'laboratory') && !formData.licenseNumber) {
        newErrors.licenseNumber = 'رقم الترخيص مطلوب';
      }
    }

    if (currentStep === 4) {
      if (!formData.password) newErrors.password = 'كلمة المرور مطلوبة';
      else if (formData.password.length < 8) newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
      else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }

    setLoading(true);

    // Check if email already exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const emailExists = existingUsers.some(user => user.email === formData.email);

    if (emailExists) {
      setErrors({ submit: 'البريد الإلكتروني مستخدم بالفعل' });
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // Create user object
      const newUser = {
        id: Date.now(),
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        licenseNumber: formData.licenseNumber,
        institution: formData.institution,
        nationalId: formData.nationalId,
        address: formData.address,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      console.log('Account created:', newUser);
      alert(`تم إنشاء الحساب بنجاح!\n\nيمكنك الآن تسجيل الدخول باستخدام:\nالبريد الإلكتروني: ${formData.email}\nكلمة المرور: ${formData.password}`);
      
      setLoading(false);
      navigate('/');
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role: role
    }));
    setErrors(prev => ({
      ...prev,
      role: ''
    }));
  };

  return (
    <div className="signup-page">
      <Navbar />
      
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
            <h1 className="form-title">إنشاء حساب جديد</h1>
            <p className="form-subtitle">
              {currentStep === 1 && 'المعلومات الشخصية'}
              {currentStep === 2 && 'اختر دورك في المنصة'}
              {currentStep === 3 && 'المعلومات المهنية'}
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
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="form-step">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الاسم الأول</label>
                    <input
                      type="text"
                      name="firstName"
                      className={`form-input ${errors.firstName ? 'error' : ''}`}
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="أدخل اسمك الأول"
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">اسم العائلة</label>
                    <input
                      type="text"
                      name="lastName"
                      className={`form-input ${errors.lastName ? 'error' : ''}`}
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="أدخل اسم العائلة"
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني</label>
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
                    <label className="form-label">رقم الهاتف</label>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+966 5x xxx xxxx"
                      dir="ltr"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">تاريخ الميلاد</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="form-input"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">الجنس</label>
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
                </div>
              </div>
            )}

            {/* Step 2: Role Selection */}
            {currentStep === 2 && (
              <div className="form-step">
                <div className="role-selection">
                  {roles.map(role => (
                    <div
                      key={role.value}
                      className={`role-card ${formData.role === role.value ? 'selected' : ''}`}
                      onClick={() => handleRoleSelect(role.value)}
                      style={{ borderColor: formData.role === role.value ? role.color : '' }}
                    >
                      <div className="role-icon" style={{ background: `${role.color}15` }}>
                        {role.icon}
                      </div>
                      <h3>{role.label}</h3>
                      {formData.role === role.value && (
                        <div className="selected-badge" style={{ background: role.color }}>
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {errors.role && <span className="error-message center">{errors.role}</span>}
              </div>
            )}

            {/* Step 3: Professional Information */}
            {currentStep === 3 && (
              <div className="form-step">
                {(formData.role === 'doctor' || formData.role === 'pharmacist' || formData.role === 'laboratory') && (
                  <>
                    <div className="form-group">
                      <label className="form-label">رقم الترخيص المهني</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        className={`form-input ${errors.licenseNumber ? 'error' : ''}`}
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="أدخل رقم الترخيص"
                      />
                      {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">المؤسسة الصحية</label>
                      <input
                        type="text"
                        name="institution"
                        className="form-input"
                        value={formData.institution}
                        onChange={handleChange}
                        placeholder="اسم المستشفى أو العيادة"
                      />
                    </div>
                  </>
                )}

                {formData.role === 'patient' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">رقم الهوية الوطنية</label>
                      <input
                        type="text"
                        name="nationalId"
                        className="form-input"
                        value={formData.nationalId}
                        onChange={handleChange}
                        placeholder="أدخل رقم الهوية"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">العنوان</label>
                      <textarea
                        name="address"
                        className="form-input"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="أدخل عنوانك"
                        rows="3"
                      />
                    </div>
                  </>
                )}

                {!formData.role && (
                  <div className="info-message">
                    <span className="info-icon">ℹ️</span>
                    <span>الرجاء العودة إلى الخطوة السابقة واختيار دورك في المنصة</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Password */}
            {currentStep === 4 && (
              <div className="form-step">
                <div className="form-group">
                  <label className="form-label">كلمة المرور</label>
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
                  <label className="form-label">تأكيد كلمة المرور</label>
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
                      8 أحرف على الأقل
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
                      حرف كبير واحد على الأقل
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'met' : ''}>
                      رقم واحد على الأقل
                    </li>
                    <li className={/[!@#$%^&*]/.test(formData.password) ? 'met' : ''}>
                      رمز خاص واحد على الأقل
                    </li>
                  </ul>
                </div>

                <div className="terms-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      required
                    />
                    <span className="checkbox-custom"></span>
                    <span>أوافق على <a href="#">الشروط والأحكام</a> و <a href="#">سياسة الخصوصية</a></span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;