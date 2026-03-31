// ============================================================================
// LOGIN.JSX — Patient 360° | Production Build
// ============================================================================
// Design System : Teal Medica
// Theme Support : Light + Dark Mode (CSS Custom Properties)
// Typography    : Cairo (Arabic RTL)
// Standards     : ISO 18308:2011, HL7 CDA R2
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeProvider';
import '../styles/Login.css';

// ============================================================================
// SVG ICON COMPONENTS — Teal Medica Gradients
// ============================================================================

const HospitalIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon">
    <rect x="12" y="20" width="40" height="36" rx="3" fill="url(#hospitalGrad)" />
    <rect x="8" y="16" width="48" height="8" rx="2" fill="url(#hospitalGrad2)" />
    <rect x="26" y="36" width="12" height="20" fill="#ffffff" />
    <rect x="28" y="26" width="8" height="6" rx="1" fill="#ffffff" />
    <rect x="18" y="28" width="6" height="6" rx="1" fill="#ffffff" opacity="0.8" />
    <rect x="40" y="28" width="6" height="6" rx="1" fill="#ffffff" opacity="0.8" />
    <rect x="18" y="40" width="6" height="6" rx="1" fill="#ffffff" opacity="0.8" />
    <rect x="40" y="40" width="6" height="6" rx="1" fill="#ffffff" opacity="0.8" />
    <path d="M30 8H34V16H30V8Z" fill="url(#hospitalGrad)" />
    <path d="M28 10H36V14H28V10Z" fill="url(#hospitalGrad2)" />
    <defs>
      <linearGradient id="hospitalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-primary, #0D3B3E)" />
        <stop offset="100%" stopColor="var(--tm-action, #00897B)" />
      </linearGradient>
      <linearGradient id="hospitalGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const AnalyticsIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon">
    <rect x="8" y="8" width="48" height="48" rx="6" fill="var(--tm-surface, #E0F2F1)" stroke="url(#analyticsGrad)" strokeWidth="2" />
    <rect x="14" y="36" width="8" height="16" rx="2" fill="url(#analyticsGrad)" />
    <rect x="28" y="24" width="8" height="28" rx="2" fill="url(#analyticsGrad2)" />
    <rect x="42" y="16" width="8" height="36" rx="2" fill="url(#analyticsGrad)" />
    <path d="M14 20L24 14L38 22L50 10" stroke="url(#analyticsGrad2)" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="10" r="3" fill="var(--tm-accent, #4DB6AC)" />
    <defs>
      <linearGradient id="analyticsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-primary, #0D3B3E)" />
        <stop offset="100%" stopColor="var(--tm-action, #00897B)" />
      </linearGradient>
      <linearGradient id="analyticsGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const SecurityIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon">
    <path d="M32 4L8 14V30C8 46 18 54 32 60C46 54 56 46 56 30V14L32 4Z" fill="url(#securityGrad)" />
    <path d="M32 8L12 16V30C12 43 20 50 32 55C44 50 52 43 52 30V16L32 8Z" fill="#ffffff" opacity="0.2" />
    <path d="M26 32L30 36L40 26" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="securityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-primary, #0D3B3E)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const IntegrationIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon">
    <circle cx="32" cy="32" r="8" fill="url(#integrationGrad)" />
    <circle cx="32" cy="12" r="6" fill="url(#integrationGrad2)" />
    <circle cx="52" cy="32" r="6" fill="url(#integrationGrad2)" />
    <circle cx="32" cy="52" r="6" fill="url(#integrationGrad2)" />
    <circle cx="12" cy="32" r="6" fill="url(#integrationGrad2)" />
    <path d="M32 18V24M32 40V46M38 32H44M20 32H26" stroke="url(#integrationGrad)" strokeWidth="3" strokeLinecap="round" />
    <circle cx="47" cy="17" r="5" fill="url(#integrationGrad)" opacity="0.6" />
    <circle cx="17" cy="47" r="5" fill="url(#integrationGrad)" opacity="0.6" />
    <circle cx="47" cy="47" r="5" fill="url(#integrationGrad)" opacity="0.6" />
    <circle cx="17" cy="17" r="5" fill="url(#integrationGrad)" opacity="0.6" />
    <defs>
      <linearGradient id="integrationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-primary, #0D3B3E)" />
        <stop offset="100%" stopColor="var(--tm-action, #00897B)" />
      </linearGradient>
      <linearGradient id="integrationGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const MedicalRecordsIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon">
    <rect x="10" y="6" width="44" height="52" rx="4" fill="var(--tm-surface, #E0F2F1)" stroke="url(#recordsGrad)" strokeWidth="2" />
    <rect x="16" y="12" width="32" height="8" rx="2" fill="url(#recordsGrad)" />
    <rect x="16" y="26" width="24" height="3" rx="1" fill="url(#recordsGrad)" opacity="0.5" />
    <rect x="16" y="34" width="28" height="3" rx="1" fill="url(#recordsGrad)" opacity="0.5" />
    <rect x="16" y="42" width="20" height="3" rx="1" fill="url(#recordsGrad)" opacity="0.5" />
    <circle cx="44" cy="44" r="12" fill="url(#recordsGrad2)" />
    <path d="M44 38V50M38 44H50" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    <defs>
      <linearGradient id="recordsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-primary, #0D3B3E)" />
        <stop offset="100%" stopColor="var(--tm-action, #00897B)" />
      </linearGradient>
      <linearGradient id="recordsGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const PrescriptionIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon">
    <ellipse cx="20" cy="32" rx="12" ry="20" fill="url(#pillGrad1)" />
    <ellipse cx="20" cy="22" rx="12" ry="10" fill="url(#pillGrad2)" />
    <ellipse cx="44" cy="32" rx="12" ry="20" transform="rotate(45 44 32)" fill="url(#pillGrad2)" />
    <ellipse cx="38" cy="26" rx="12" ry="10" transform="rotate(45 38 26)" fill="url(#pillGrad1)" />
    <defs>
      <linearGradient id="pillGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-primary, #0D3B3E)" />
        <stop offset="100%" stopColor="var(--tm-action, #00897B)" />
      </linearGradient>
      <linearGradient id="pillGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const ReportsIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon">
    <rect x="6" y="8" width="36" height="48" rx="4" fill="var(--tm-surface, #E0F2F1)" stroke="url(#reportsGrad)" strokeWidth="2" />
    <rect x="12" y="16" width="24" height="4" rx="1" fill="url(#reportsGrad)" opacity="0.5" />
    <rect x="12" y="24" width="18" height="3" rx="1" fill="url(#reportsGrad)" opacity="0.3" />
    <rect x="12" y="30" width="20" height="3" rx="1" fill="url(#reportsGrad)" opacity="0.3" />
    <rect x="12" y="38" width="16" height="3" rx="1" fill="url(#reportsGrad)" opacity="0.3" />
    <rect x="36" y="24" width="22" height="32" rx="3" fill="url(#reportsGrad2)" />
    <path d="M42 36L46 44L54 32" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M42 48H52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <defs>
      <linearGradient id="reportsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-primary, #0D3B3E)" />
        <stop offset="100%" stopColor="var(--tm-action, #00897B)" />
      </linearGradient>
      <linearGradient id="reportsGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const AIBrainIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon">
    <ellipse cx="32" cy="28" rx="20" ry="18" fill="url(#brainGrad)" />
    <path d="M20 28C20 28 22 20 28 18C34 16 36 22 32 26C28 30 24 28 26 24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <path d="M44 28C44 28 42 20 36 18C30 16 28 22 32 26C36 30 40 28 38 24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <circle cx="32" cy="32" r="3" fill="#ffffff" />
    <path d="M32 46V54" stroke="url(#brainGrad)" strokeWidth="3" strokeLinecap="round" />
    <path d="M26 50H38" stroke="url(#brainGrad)" strokeWidth="3" strokeLinecap="round" />
    <circle cx="18" cy="14" r="4" fill="url(#brainGrad2)" opacity="0.7" />
    <circle cx="46" cy="14" r="4" fill="url(#brainGrad2)" opacity="0.7" />
    <circle cx="12" cy="28" r="3" fill="url(#brainGrad2)" opacity="0.5" />
    <circle cx="52" cy="28" r="3" fill="url(#brainGrad2)" opacity="0.5" />
    <path d="M18 14L24 20" stroke="url(#brainGrad2)" strokeWidth="2" opacity="0.5" />
    <path d="M46 14L40 20" stroke="url(#brainGrad2)" strokeWidth="2" opacity="0.5" />
    <defs>
      <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
      <linearGradient id="brainGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-primary, #0D3B3E)" />
        <stop offset="100%" stopColor="var(--tm-action, #00897B)" />
      </linearGradient>
    </defs>
  </svg>
);

const AIConsultationIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon">
    <circle cx="24" cy="20" r="10" fill="url(#consultGrad)" />
    <path d="M24 34C14 34 8 40 8 48V54H40V48C40 40 34 34 24 34Z" fill="url(#consultGrad)" />
    <rect x="34" y="28" width="24" height="28" rx="4" fill="url(#consultGrad2)" />
    <circle cx="46" cy="38" r="4" fill="#ffffff" />
    <path d="M40 50H52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <path d="M42 46H50" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <circle cx="52" cy="18" r="8" fill="url(#consultGrad2)" opacity="0.3" />
    <path d="M48 18H56M52 14V22" stroke="url(#consultGrad2)" strokeWidth="2" strokeLinecap="round" />
    <defs>
      <linearGradient id="consultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-primary, #0D3B3E)" />
        <stop offset="100%" stopColor="var(--tm-action, #00897B)" />
      </linearGradient>
      <linearGradient id="consultGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const PortalIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon">
    <circle cx="32" cy="32" r="24" fill="none" stroke="url(#portalGrad)" strokeWidth="3" />
    <ellipse cx="32" cy="32" rx="10" ry="24" fill="none" stroke="url(#portalGrad)" strokeWidth="2" />
    <ellipse cx="32" cy="32" rx="24" ry="10" fill="none" stroke="url(#portalGrad2)" strokeWidth="2" />
    <circle cx="32" cy="32" r="6" fill="url(#portalGrad2)" />
    <circle cx="32" cy="8" r="3" fill="url(#portalGrad)" />
    <circle cx="32" cy="56" r="3" fill="url(#portalGrad)" />
    <circle cx="8" cy="32" r="3" fill="url(#portalGrad2)" />
    <circle cx="56" cy="32" r="3" fill="url(#portalGrad2)" />
    <defs>
      <linearGradient id="portalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-primary, #0D3B3E)" />
        <stop offset="100%" stopColor="var(--tm-action, #00897B)" />
      </linearGradient>
      <linearGradient id="portalGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon small-icon">
    <circle cx="32" cy="32" r="24" fill="none" stroke="url(#targetGrad)" strokeWidth="3" />
    <circle cx="32" cy="32" r="16" fill="none" stroke="url(#targetGrad)" strokeWidth="2" opacity="0.7" />
    <circle cx="32" cy="32" r="8" fill="none" stroke="url(#targetGrad)" strokeWidth="2" opacity="0.5" />
    <circle cx="32" cy="32" r="4" fill="url(#targetGrad2)" />
    <defs>
      <linearGradient id="targetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-primary, #0D3B3E)" />
        <stop offset="100%" stopColor="var(--tm-action, #00897B)" />
      </linearGradient>
      <linearGradient id="targetGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon contact-icon">
    <path d="M32 4C20 4 12 14 12 24C12 40 32 60 32 60C32 60 52 40 52 24C52 14 44 4 32 4Z" fill="url(#locationGrad)" />
    <circle cx="32" cy="24" r="8" fill="#ffffff" />
    <defs>
      <linearGradient id="locationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon contact-icon">
    <path d="M14 8C14 8 10 8 10 14C10 20 14 38 26 50C38 62 50 54 50 54C56 50 56 46 56 46L46 36L40 40C40 40 32 36 26 30C20 24 18 18 18 18L24 12L14 8Z" fill="url(#phoneGrad)" />
    <defs>
      <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon contact-icon">
    <rect x="6" y="14" width="52" height="36" rx="4" fill="url(#emailGrad)" />
    <path d="M6 18L32 36L58 18" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="emailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tm-action, #00897B)" />
        <stop offset="100%" stopColor="var(--tm-accent, #4DB6AC)" />
      </linearGradient>
    </defs>
  </svg>
);

// ============================================================================
// PASSWORD VISIBILITY TOGGLE ICON
// ============================================================================
const EyeIcon = ({ visible }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--tm-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {visible ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

// ============================================================================
// MAIN LOGIN COMPONENT
// ============================================================================
const Login = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // ------ Auth State ------
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ------ Modal State ------
  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: '',
    onClose: null
  });

  // ------ Forgot Password State ------
  const [forgotPasswordModal, setForgotPasswordModal] = useState({
    isOpen: false,
    step: 1,
    email: '',
    otp: ['', '', '', '', '', ''],
    newPassword: '',
    confirmPassword: '',
    isLoading: false,
    error: '',
    resendTimer: 0,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const otpInputsRef = useRef([]);

  // ------ Animated Stats Counter ------
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  // ============================================================================
  // FEATURES CAROUSEL DATA
  // ============================================================================
  const features = [
    {
      title: "إدارة متكاملة للمرضى",
      description: "نظام شامل لإدارة السجلات الطبية والوصفات الطبية",
      icon: <HospitalIcon />,
      highlight: "رعاية صحية متقدمة"
    },
    {
      title: "تحليلات ذكية",
      description: "رؤى عميقة وتقارير مفصلة لتحسين جودة الرعاية الصحية",
      icon: <AnalyticsIcon />,
      highlight: "قرارات مبنية على البيانات"
    },
    {
      title: "أمان على مستوى طبي",
      description: "حماية البيانات بأعلى معايير الأمان الطبي العالمية",
      icon: <SecurityIcon />,
      highlight: "خصوصية مضمونة"
    },
    {
      title: "تكامل سلس",
      description: "ربط جميع الأقسام الطبية في منصة واحدة متكاملة",
      icon: <IntegrationIcon />,
      highlight: "كفاءة تشغيلية عالية"
    }
  ];

  // ============================================================================
  // SERVICES DATA
  // ============================================================================
  const services = [
    {
      icon: <MedicalRecordsIcon />,
      title: "السجلات الطبية الإلكترونية",
      description: "إدارة شاملة للسجلات الطبية مع إمكانية الوصول الفوري والآمن"
    },
    {
      icon: <AIBrainIcon />,
      title: "التشخيص بالذكاء الاصطناعي",
      description: "نماذج ذكاء اصطناعي متقدمة تساعد الأطباء في التشخيص وتحليل البيانات الطبية"
    },
    {
      icon: <PrescriptionIcon />,
      title: "إدارة الوصفات الطبية",
      description: "نظام متكامل للوصفات الإلكترونية مع تتبع الأدوية والتفاعلات"
    },
    {
      icon: <ReportsIcon />,
      title: "التقارير والتحليلات",
      description: "لوحات تحكم تفاعلية وتقارير مفصلة لاتخاذ قرارات مستنيرة"
    },
    {
      icon: <AIConsultationIcon />,
      title: "الاستشارة الذكية للمرضى",
      description: "نظام ذكي يساعد المرضى في فهم حالاتهم الصحية والإرشادات الطبية"
    },
    {
      icon: <PortalIcon />,
      title: "البوابة الإلكترونية",
      description: "بوابة تفاعلية للمرضى للوصول إلى سجلاتهم ونتائج الفحوصات"
    }
  ];

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Feature carousel auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Redirect if already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        // accounts.roles is always an array — use [0] as primary role
        const dashboardRoutes = {
          'patient':        '/patient-dashboard',
          'doctor':         '/doctor-dashboard',
          'admin':          '/admin-dashboard',
          'pharmacist':     '/pharmacist-dashboard',
          'lab_technician': '/lab-dashboard',
          'dentist':        '/dentist-dashboard'
        };
        const primaryRole = Array.isArray(user.roles) ? user.roles[0] : null;
        if (primaryRole && dashboardRoutes[primaryRole]) {
          navigate(dashboardRoutes[primaryRole]);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, [navigate]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('p360-remember-email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // OTP resend timer
  useEffect(() => {
    let interval;
    if (forgotPasswordModal.resendTimer > 0) {
      interval = setInterval(() => {
        setForgotPasswordModal(prev => ({
          ...prev,
          resendTimer: prev.resendTimer - 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [forgotPasswordModal.resendTimer]);

  // Stats section intersection observer for animated counters
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // ============================================================================
  // MODAL FUNCTIONS
  // ============================================================================

  const openModal = (type, title, message, onClose = null) => {
    setModal({ isOpen: true, type, title, message, onClose });
  };

  const closeModal = () => {
    if (modal.onClose) modal.onClose();
    setModal({ isOpen: false, type: '', title: '', message: '', onClose: null });
  };

  // ============================================================================
  // FORGOT PASSWORD FUNCTIONS
  // ============================================================================

  const openForgotPasswordModal = (e) => {
    e.preventDefault();
    setForgotPasswordModal({
      isOpen: true,
      step: 1,
      email: '',
      otp: ['', '', '', '', '', ''],
      newPassword: '',
      confirmPassword: '',
      isLoading: false,
      error: '',
      resendTimer: 0,
      showNewPassword: false,
      showConfirmPassword: false
    });
  };

  const closeForgotPasswordModal = () => {
    setForgotPasswordModal(prev => ({ ...prev, isOpen: false }));
  };

  const isValidEmail = (emailStr) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);

  const validatePassword = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return {
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial,
      minLength, hasUppercase, hasLowercase, hasNumber, hasSpecial
    };
  };

  const handleSendOTP = async () => {
    const emailToSend = forgotPasswordModal.email.trim().toLowerCase();
    if (!emailToSend) {
      setForgotPasswordModal(prev => ({ ...prev, error: 'الرجاء إدخال البريد الإلكتروني' }));
      return;
    }
    if (!isValidEmail(emailToSend)) {
      setForgotPasswordModal(prev => ({ ...prev, error: 'الرجاء إدخال بريد إلكتروني صحيح' }));
      return;
    }
    setForgotPasswordModal(prev => ({ ...prev, isLoading: true, error: '' }));
    try {
      await authAPI.forgotPassword({ email: emailToSend });
      setForgotPasswordModal(prev => ({ ...prev, isLoading: false, step: 2, resendTimer: 60, error: '' }));
    } catch (error) {
      console.error('Error sending OTP:', error);
      // Advance to step 2 regardless — prevents email enumeration attacks.
      // If the email doesn't exist, the user simply won't receive an OTP,
      // but we don't reveal whether the account exists or not.
      setForgotPasswordModal(prev => ({
        ...prev,
        isLoading: false,
        step: 2,
        resendTimer: 60,
        error: ''
      }));
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...forgotPasswordModal.otp];
    newOtp[index] = value;
    setForgotPasswordModal(prev => ({ ...prev, otp: newOtp, error: '' }));
    if (value && index < 5) otpInputsRef.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !forgotPasswordModal.otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...forgotPasswordModal.otp];
    pastedData.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
    setForgotPasswordModal(prev => ({ ...prev, otp: newOtp, error: '' }));
    const nextEmpty = newOtp.findIndex(val => !val);
    otpInputsRef.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otpCode = forgotPasswordModal.otp.join('');
    if (otpCode.length !== 6) {
      setForgotPasswordModal(prev => ({ ...prev, error: 'الرجاء إدخال رمز التحقق كاملاً' }));
      return;
    }
    setForgotPasswordModal(prev => ({ ...prev, isLoading: true, error: '' }));
    try {
      await authAPI.verifyOTP({ email: forgotPasswordModal.email, otp: otpCode });
      setForgotPasswordModal(prev => ({ ...prev, isLoading: false, step: 3, error: '' }));
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setForgotPasswordModal(prev => ({
        ...prev, isLoading: false,
        error: error.message || 'رمز التحقق غير صحيح'
      }));
    }
  };

  const handleResetPassword = async () => {
    const { newPassword: np, confirmPassword: cp } = forgotPasswordModal;
    if (!np) {
      setForgotPasswordModal(prev => ({ ...prev, error: 'الرجاء إدخال كلمة المرور الجديدة' }));
      return;
    }
    const pv = validatePassword(np);
    if (!pv.isValid) {
      setForgotPasswordModal(prev => ({
        ...prev, error: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص'
      }));
      return;
    }
    if (np !== cp) {
      setForgotPasswordModal(prev => ({ ...prev, error: 'كلمتا المرور غير متطابقتين' }));
      return;
    }
    setForgotPasswordModal(prev => ({ ...prev, isLoading: true, error: '' }));
    try {
      await authAPI.resetPassword({
        email: forgotPasswordModal.email,
        otp: forgotPasswordModal.otp.join(''),
        newPassword: np
      });
      setForgotPasswordModal(prev => ({ ...prev, isLoading: false, step: 4, error: '' }));
    } catch (error) {
      console.error('Error resetting password:', error);
      setForgotPasswordModal(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور. حاول مرة أخرى.'
      }));
    }
  };

  const handleResendOTP = async () => {
    if (forgotPasswordModal.resendTimer > 0) return;
    setForgotPasswordModal(prev => ({ ...prev, isLoading: true, error: '' }));
    try {
      await authAPI.forgotPassword({ email: forgotPasswordModal.email });
      setForgotPasswordModal(prev => ({
        ...prev, isLoading: false, resendTimer: 60,
        otp: ['', '', '', '', '', ''], error: ''
      }));
      otpInputsRef.current[0]?.focus();
    } catch (error) {
      console.error('Error resending OTP:', error);
      setForgotPasswordModal(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'حدث خطأ أثناء إعادة إرسال الرمز. حاول مرة أخرى.'
      }));
    }
  };

  // ============================================================================
  // LOGIN HANDLER
  // ============================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      openModal('error', 'خطأ', 'الرجاء إدخال البريد الإلكتروني', null);
      return;
    }
    if (!password.trim()) {
      openModal('error', 'خطأ', 'الرجاء إدخال كلمة المرور', null);
      return;
    }

    // Handle "Remember Me"
    if (rememberMe) {
      localStorage.setItem('p360-remember-email', email.trim().toLowerCase());
    } else {
      localStorage.removeItem('p360-remember-email');
    }

    setIsLoading(true);
    try {
      const response = await authAPI.login({
        email: email.trim().toLowerCase(),
        password: password
      });

      setIsLoading(false);
      const user = response.user;
      const roleLabels = {
        patient:        'مريض',
        doctor:         'طبيب',
        admin:          'مسؤول النظام',
        pharmacist:     'صيدلي',
        lab_technician: 'فني مختبر',
        dentist:        'طبيب أسنان',
        nurse:          'ممرض/ة',
        receptionist:   'موظف استقبال'
      };
      const primaryRole = Array.isArray(user.roles) ? user.roles[0] : null;

      openModal(
        'success',
        'تم تسجيل الدخول بنجاح! ✅',
        `مرحباً ${user.firstName} ${user.lastName}\n\nتم تسجيل دخولك كـ ${roleLabels[primaryRole] || primaryRole}`,
        () => {
          const dashboardRoutes = {
            'patient':        '/patient-dashboard',
            'doctor':         '/doctor-dashboard',
            'admin':          '/admin-dashboard',
            'pharmacist':     '/pharmacist-dashboard',
            'lab_technician': '/lab-dashboard',
            'dentist':        '/dentist-dashboard'
          };
          navigate(dashboardRoutes[primaryRole] || '/');
        }
      );
    } catch (error) {
      setIsLoading(false);
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      if (error.message) errorMessage = error.message;
      else if (error.error) errorMessage = error.error;
      openModal('error', 'خطأ في تسجيل الدخول', errorMessage, null);
    }
  };

  // ============================================================================
  // FORGOT PASSWORD MODAL CONTENT RENDERER
  // ============================================================================
  const renderForgotPasswordContent = () => {
    const {
      step, email: fpEmail, otp, newPassword, confirmPassword,
      isLoading: fpLoading, error, resendTimer, showNewPassword, showConfirmPassword
    } = forgotPasswordModal;

    switch (step) {
      // ---- Step 1: Email Input ----
      case 1:
        return (
          <>
            <div className="fp-modal-header">
              <div className="fp-icon-container">
                <div className="fp-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="fp-icon-pulse"></div>
              </div>
              <h2 className="fp-title">استعادة كلمة المرور</h2>
              <p className="fp-subtitle">أدخل بريدك الإلكتروني لإرسال رمز التحقق</p>
            </div>

            <div className="fp-modal-body">
              {error && (
                <div className="fp-error-alert" role="alert">
                  <span className="fp-error-icon">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="fp-form-group">
                <label className="fp-label" htmlFor="fp-email">البريد الإلكتروني</label>
                <div className="fp-input-wrapper">
                  <span className="fp-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tm-action)" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    id="fp-email"
                    type="email"
                    className="fp-input"
                    placeholder="example@domain.com"
                    value={fpEmail}
                    onChange={(e) => setForgotPasswordModal(prev => ({ ...prev, email: e.target.value, error: '' }))}
                    disabled={fpLoading}
                    dir="ltr"
                    autoFocus
                    aria-label="البريد الإلكتروني لاستعادة كلمة المرور"
                  />
                </div>
              </div>

              <button className="fp-button primary" onClick={handleSendOTP} disabled={fpLoading} aria-busy={fpLoading}>
                {fpLoading ? (
                  <span className="fp-loading"><span className="fp-spinner"></span>جارٍ الإرسال...</span>
                ) : (
                  <><span>إرسال رمز التحقق</span><span className="fp-button-icon">←</span></>
                )}
              </button>
            </div>

            <div className="fp-modal-footer">
              <button className="fp-link-button" onClick={closeForgotPasswordModal}>العودة لتسجيل الدخول</button>
            </div>
          </>
        );

      // ---- Step 2: OTP Verification ----
      case 2:
        return (
          <>
            <div className="fp-modal-header">
              <div className="fp-icon-container">
                <div className="fp-icon otp">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="fp-icon-pulse"></div>
              </div>
              <h2 className="fp-title">التحقق من الهوية</h2>
              <p className="fp-subtitle">
                أدخل رمز التحقق المرسل إلى
                <br />
                <span className="fp-email-highlight">{fpEmail}</span>
              </p>
            </div>

            <div className="fp-modal-body">
              {error && (
                <div className="fp-error-alert" role="alert">
                  <span className="fp-error-icon">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="fp-otp-container">
                <label className="fp-label centered">رمز التحقق</label>
                <div className="fp-otp-inputs" dir="ltr">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => otpInputsRef.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`fp-otp-input ${digit ? 'filled' : ''}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      disabled={fpLoading}
                      autoFocus={index === 0}
                      aria-label={`رقم التحقق ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button
                className="fp-button primary"
                onClick={handleVerifyOTP}
                disabled={fpLoading || otp.join('').length !== 6}
                aria-busy={fpLoading}
              >
                {fpLoading ? (
                  <span className="fp-loading"><span className="fp-spinner"></span>جارٍ التحقق...</span>
                ) : (
                  <><span>تحقق من الرمز</span><span className="fp-button-icon">←</span></>
                )}
              </button>

              <div className="fp-resend-container">
                {resendTimer > 0 ? (
                  <p className="fp-resend-timer">
                    إعادة الإرسال بعد <span className="timer">{resendTimer}</span> ثانية
                  </p>
                ) : (
                  <button className="fp-resend-button" onClick={handleResendOTP} disabled={fpLoading}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '6px'}}>
                      <path d="M23 4v6h-6M1 20v-6h6"/>
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                    </svg>
                    إعادة إرسال الرمز
                  </button>
                )}
              </div>
            </div>

            <div className="fp-modal-footer">
              <button className="fp-link-button" onClick={() => setForgotPasswordModal(prev => ({ ...prev, step: 1, error: '' }))}>
                → تغيير البريد الإلكتروني
              </button>
            </div>
          </>
        );

      // ---- Step 3: New Password ----
      case 3:
        const passwordValidation = validatePassword(newPassword);
        return (
          <>
            <div className="fp-modal-header">
              <div className="fp-icon-container">
                <div className="fp-icon success-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 14L12 22M12 22L9 19M12 22L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="fp-icon-pulse success"></div>
              </div>
              <h2 className="fp-title">كلمة مرور جديدة</h2>
              <p className="fp-subtitle">أنشئ كلمة مرور قوية وآمنة</p>
            </div>

            <div className="fp-modal-body">
              {error && (
                <div className="fp-error-alert" role="alert">
                  <span className="fp-error-icon">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="fp-form-group">
                <label className="fp-label" htmlFor="fp-new-password">كلمة المرور الجديدة</label>
                <div className="fp-input-wrapper password">
                  <span className="fp-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tm-action)" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="fp-new-password"
                    type={showNewPassword ? "text" : "password"}
                    className="fp-input"
                    placeholder="أدخل كلمة المرور الجديدة"
                    value={newPassword}
                    onChange={(e) => setForgotPasswordModal(prev => ({ ...prev, newPassword: e.target.value, error: '' }))}
                    disabled={fpLoading}
                    dir="ltr"
                    autoFocus
                    aria-label="كلمة المرور الجديدة"
                  />
                  <button
                    type="button"
                    className="fp-toggle-password"
                    onClick={() => setForgotPasswordModal(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                    aria-label={showNewPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    <EyeIcon visible={showNewPassword} />
                  </button>
                </div>
              </div>

              {newPassword && (
                <div className="fp-password-strength">
                  <div className="fp-strength-bars">
                    <div className={`fp-strength-bar ${passwordValidation.minLength ? 'active' : ''}`}></div>
                    <div className={`fp-strength-bar ${passwordValidation.hasLowercase ? 'active' : ''}`}></div>
                    <div className={`fp-strength-bar ${passwordValidation.hasUppercase ? 'active' : ''}`}></div>
                    <div className={`fp-strength-bar ${passwordValidation.hasNumber ? 'active' : ''}`}></div>
                    <div className={`fp-strength-bar ${passwordValidation.hasSpecial ? 'active' : ''}`}></div>
                  </div>
                  <div className="fp-strength-checklist">
                    <span className={passwordValidation.minLength ? 'valid' : ''}>{passwordValidation.minLength ? '✓' : '○'} 8 أحرف على الأقل</span>
                    <span className={passwordValidation.hasLowercase ? 'valid' : ''}>{passwordValidation.hasLowercase ? '✓' : '○'} حرف صغير</span>
                    <span className={passwordValidation.hasUppercase ? 'valid' : ''}>{passwordValidation.hasUppercase ? '✓' : '○'} حرف كبير</span>
                    <span className={passwordValidation.hasNumber ? 'valid' : ''}>{passwordValidation.hasNumber ? '✓' : '○'} رقم واحد</span>
                    <span className={passwordValidation.hasSpecial ? 'valid' : ''}>{passwordValidation.hasSpecial ? '✓' : '○'} رمز خاص (!@#$...)</span>
                  </div>
                </div>
              )}

              <div className="fp-form-group">
                <label className="fp-label" htmlFor="fp-confirm-password">تأكيد كلمة المرور</label>
                <div className="fp-input-wrapper password">
                  <span className="fp-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tm-action)" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="fp-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="fp-input"
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setForgotPasswordModal(prev => ({ ...prev, confirmPassword: e.target.value, error: '' }))}
                    disabled={fpLoading}
                    dir="ltr"
                    aria-label="تأكيد كلمة المرور"
                  />
                  <button
                    type="button"
                    className="fp-toggle-password"
                    onClick={() => setForgotPasswordModal(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                    aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="fp-match-error">كلمتا المرور غير متطابقتين</span>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <span className="fp-match-success">✓ كلمتا المرور متطابقتان</span>
                )}
              </div>

              <button
                className="fp-button primary"
                onClick={handleResetPassword}
                disabled={fpLoading || !passwordValidation.isValid || newPassword !== confirmPassword}
                aria-busy={fpLoading}
              >
                {fpLoading ? (
                  <span className="fp-loading"><span className="fp-spinner"></span>جارٍ الحفظ...</span>
                ) : (
                  <><span>حفظ كلمة المرور</span><span className="fp-button-icon">✓</span></>
                )}
              </button>
            </div>

            <div className="fp-modal-footer">
              <button className="fp-link-button" onClick={() => setForgotPasswordModal(prev => ({ ...prev, step: 2, error: '' }))}>
                → العودة للخطوة السابقة
              </button>
            </div>
          </>
        );

      // ---- Step 4: Success ----
      case 4:
        return (
          <>
            <div className="fp-modal-header success-header">
              <div className="fp-success-animation">
                <div className="fp-success-circle">
                  <svg className="fp-checkmark" viewBox="0 0 52 52">
                    <circle className="fp-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="fp-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
              </div>
              <h2 className="fp-title success">تم بنجاح!</h2>
              <p className="fp-subtitle">تم إعادة تعيين كلمة المرور بنجاح</p>
            </div>

            <div className="fp-modal-body success-body">
              <div className="fp-success-message">
                <p>يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة</p>
                <div className="fp-success-details">
                  <span className="fp-detail-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tm-success)" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <span className="fp-detail-text">{fpEmail}</span>
                </div>
              </div>

              <button className="fp-button primary success-button" onClick={closeForgotPasswordModal}>
                <span>العودة لتسجيل الدخول</span>
                <span className="fp-button-icon">→</span>
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // STEP PROGRESS INDICATOR
  // ============================================================================
  const renderStepProgress = () => {
    const { step } = forgotPasswordModal;
    if (step === 4) return null;
    const steps = [
      { num: 1, label: 'البريد' },
      { num: 2, label: 'التحقق' },
      { num: 3, label: 'كلمة المرور' }
    ];
    return (
      <div className="fp-step-progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
        {steps.map((s, index) => (
          <React.Fragment key={s.num}>
            <div className={`fp-step ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
              <div className="fp-step-number">{step > s.num ? '✓' : s.num}</div>
              <span className="fp-step-label">{s.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`fp-step-connector ${step > s.num ? 'completed' : ''}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // ============================================================================
  // ANIMATED COUNTER COMPONENT — Eased, Formatted, Fixed-Width
  // ============================================================================
  const AnimatedCounter = ({ target, suffix = '', prefix = '', duration = 2500 }) => {
    const [displayText, setDisplayText] = useState(`${prefix}0${suffix}`);
    const frameRef = useRef(null);

    useEffect(() => {
      if (!statsVisible) return;

      const numTarget = parseFloat(target.replace(/[^0-9.]/g, ''));
      const hasDecimal = target.includes('.');
      const startTime = performance.now();

      // Ease-out cubic for smooth deceleration
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      // Format number with locale separators
      const formatNumber = (num) => {
        if (hasDecimal) return num.toFixed(1);
        return Math.floor(num).toLocaleString('en-US');
      };

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentValue = easedProgress * numTarget;

        setDisplayText(`${prefix}${formatNumber(currentValue)}${suffix}`);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }, [statsVisible, target, suffix, prefix, duration]);

    return <span>{displayText}</span>;
  };

  // ============================================================================
  // JSX RENDER
  // ============================================================================
  return (
      <div className="home-page" dir="rtl">

        {/* Navbar — theme toggle is built into the navbar */}
        <Navbar />

        {/* ================================================================ */}
        {/* ALERT MODAL                                                      */}
        {/* ================================================================ */}
        {modal.isOpen && (
          <div
            className="modal-overlay"
            onClick={(e) => { if (e.target.className === 'modal-overlay') closeModal(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className={`modal-header ${modal.type}`}>
                {modal.type === 'success' && <div className="modal-icon success-icon">✓</div>}
                {modal.type === 'error' && <div className="modal-icon error-icon">✕</div>}
                <h2 id="modal-title" className="modal-title">{modal.title}</h2>
              </div>
              <div className="modal-body">
                <p className="modal-message">{modal.message}</p>
              </div>
              <div className="modal-footer">
                <button className="modal-button primary" onClick={closeModal} autoFocus>حسناً</button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* FORGOT PASSWORD MODAL                                            */}
        {/* ================================================================ */}
        {forgotPasswordModal.isOpen && (
          <div
            className="fp-modal-overlay"
            onClick={(e) => { if (e.target.className === 'fp-modal-overlay') closeForgotPasswordModal(); }}
            role="dialog"
            aria-modal="true"
            aria-label="استعادة كلمة المرور"
          >
            <div className="fp-modal-container" onClick={(e) => e.stopPropagation()}>
              <button
                className="fp-close-button"
                onClick={closeForgotPasswordModal}
                aria-label="إغلاق"
              >
                ✕
              </button>
              {renderStepProgress()}
              {renderForgotPasswordContent()}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* HERO SECTION — Login + Feature Carousel                          */}
        {/* ================================================================ */}
        <section id="hero" className="hero-section">
          <div className="hero-container">

            {/* ---- Login Form ---- */}
            <div className="left-section">
              <div className="login-form-container">
                <div className="login-header">
                  <h1 className="login-title">تسجيل الدخول</h1>
                  <p className="login-subtitle">مرحباً بك في منصة Patient 360°</p>
                </div>

                <form className="login-form" onSubmit={handleLogin} noValidate>
                  {/* Email Field */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="login-email">البريد الإلكتروني</label>
                    <div className="form-input-wrapper">
                      <span className="form-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tm-action)" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </span>
                      <input
                        id="login-email"
                        type="email"
                        className="form-input"
                        placeholder="example@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        dir="ltr"
                        autoComplete="email"
                        aria-label="البريد الإلكتروني"
                      />
                    </div>
                  </div>

                  {/* Password Field with Toggle */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="login-password">كلمة المرور</label>
                    <div className="form-input-wrapper">
                      <span className="form-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tm-action)" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                      </span>
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        className="form-input"
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        dir="ltr"
                        autoComplete="current-password"
                        aria-label="كلمة المرور"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(prev => !prev)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        <EyeIcon visible={showPassword} />
                      </button>
                    </div>
                  </div>

                  {/* Remember Me + Forgot Password Row */}
                  <div className="form-options-row">
                    <label className="remember-me-label" htmlFor="remember-me">
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="remember-me-checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                      />
                      <span className="remember-me-checkmark"></span>
                      <span className="remember-me-text">تذكرني</span>
                    </label>
                    <a href="#" className="forgot-link" onClick={openForgotPasswordModal}>
                      هل نسيت كلمة المرور؟
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <span className="login-loading">
                        <span className="login-spinner"></span>
                        جارٍ تسجيل الدخول...
                      </span>
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="divider">
                  <div className="divider-line"></div>
                  <span className="divider-text">أو</span>
                  <div className="divider-line"></div>
                </div>

                {/* Signup Link */}
                <div className="signup-link">
                  ليس لديك حساب؟ <Link to="/signup">سجل الآن</Link>
                </div>
              </div>
            </div>

            {/* ---- Feature Carousel ---- */}
            <div className="right-section">
              <div className="feature-carousel" role="region" aria-label="مميزات المنصة" aria-live="polite">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`feature-slide ${currentSlide === index ? 'active' : ''}`}
                    aria-hidden={currentSlide !== index}
                  >
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-highlight">{feature.highlight}</div>
                    <h2 className="feature-title">{feature.title}</h2>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                ))}
              </div>
              <div className="slide-indicators" role="tablist" aria-label="التنقل بين الشرائح">
                {features.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${currentSlide === index ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                    role="tab"
                    aria-selected={currentSlide === index}
                    aria-label={`شريحة ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* ABOUT SECTION                                                    */}
        {/* ================================================================ */}
        <section id="about" className="about-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">عن Patient 360°</h2>
              <p className="section-subtitle">منصة رائدة في التحول الرقمي للرعاية الصحية</p>
            </div>

            <div className="about-content">
              <div className="about-text">
                <h3>نحن نعيد تعريف الرعاية الصحية</h3>
                <p>
                  Patient 360° هي منصة متكاملة تجمع بين أحدث التقنيات والخبرة الطبية لتوفير نظام شامل
                  لإدارة المعلومات الصحية. نسعى لتحسين جودة الرعاية الصحية من خلال توفير أدوات ذكية
                  وفعالة للأطباء والمرضى على حد سواء.
                </p>
                <p>
                  نأمل تطبيق هذا المشروع على كامل النطاق الطبي في أراضي في الجمهورية العربية السورية تحت رعاية وزارة الصحة.
                </p>

                <div className="stats-grid" ref={statsRef}>
                  <div className="stat-card">
                    <div className="stat-number" data-final="+500">
                      {statsVisible ? <AnimatedCounter target="500" prefix="+" duration={2000} /> : '+0'}
                    </div>
                    <div className="stat-label">مؤسسة صحية مشتركة</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" data-final="+1,000,000">
                      {statsVisible ? <AnimatedCounter target="1000000" prefix="+" duration={3000} /> : '+0'}
                    </div>
                    <div className="stat-label">مريض مخدوم بعد الإطلاق</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" data-final="99.9%">
                      {statsVisible ? <AnimatedCounter target="99.9" suffix="%" duration={2200} /> : '0%'}
                    </div>
                    <div className="stat-label">وقت التشغيل</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" data-final="24/7">24/7</div>
                    <div className="stat-label">دعم فني</div>
                  </div>
                </div>
              </div>

              <div className="about-image">
                <div className="image-placeholder">
                  <span className="placeholder-icon"><HospitalIcon /></span>
                  <div className="floating-card card-1">
                    <span><AnalyticsIcon /></span>
                    <span>تحليلات متقدمة</span>
                  </div>
                  <div className="floating-card card-2">
                    <span><SecurityIcon /></span>
                    <span>أمان عالي</span>
                  </div>
                  <div className="floating-card card-3">
                    <span><AIBrainIcon /></span>
                    <span>ذكاء اصطناعي</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SERVICES SECTION                                                 */}
        {/* ================================================================ */}
        <section id="services" className="services-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">خدماتنا</h2>
              <p className="section-subtitle">حلول متكاملة لجميع احتياجاتك الصحية</p>
            </div>

            <div className="services-grid">
              {services.map((service, index) => (
                <div key={index} className="service-card" tabIndex={0}>
                  <div className="service-icon">{service.icon}</div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* VISION SECTION                                                   */}
        {/* ================================================================ */}
        <section id="vision" className="vision-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">رؤيتنا</h2>
              <p className="section-subtitle">نحو مستقبل صحي أفضل</p>
            </div>

            <div className="vision-content">
              <div className="vision-text">
                <h3>رسالتنا</h3>
                <p>
                  نسعى لأن نكون الشريك التقني الأول للمؤسسات الصحية في المنطقة، من خلال توفير حلول
                  مبتكرة تسهم في تحسين جودة الرعاية الصحية وتمكين الأطباء والمرضى.
                </p>

                <h3>أهدافنا</h3>
                <div className="vision-goals">
                  <div className="goal-item">
                    <span className="goal-icon"><TargetIcon /></span>
                    <span>تحسين تجربة المريض</span>
                  </div>
                  <div className="goal-item">
                    <span className="goal-icon"><TargetIcon /></span>
                    <span>رفع كفاءة العمليات الطبية</span>
                  </div>
                  <div className="goal-item">
                    <span className="goal-icon"><TargetIcon /></span>
                    <span>ضمان أمان البيانات الصحية</span>
                  </div>
                  <div className="goal-item">
                    <span className="goal-icon"><TargetIcon /></span>
                    <span>التوسع إقليمياً وعالمياً</span>
                  </div>
                </div>
              </div>

              <div className="vision-features">
                <div className="feature-item">
                  <div className="feature-number">01</div>
                  <div className="feature-content">
                    <h3>الابتكار المستمر</h3>
                    <p>نستثمر في البحث والتطوير لتقديم أحدث الحلول التقنية</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-number">02</div>
                  <div className="feature-content">
                    <h3>التميز في الخدمة</h3>
                    <p>نلتزم بأعلى معايير الجودة في جميع خدماتنا</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-number">03</div>
                  <div className="feature-content">
                    <h3>الشراكة الاستراتيجية</h3>
                    <p>نبني علاقات طويلة الأمد مع عملائنا</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CONTACT SECTION                                                  */}
        {/* ================================================================ */}
        <section id="contact" className="contact-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">تواصل معنا</h2>
              <p className="section-subtitle">نحن هنا لمساعدتك</p>
            </div>

            <div className="contact-content-simplified">
              <div className="contact-cards-row">
                <div className="info-card">
                  <div className="info-icon"><LocationIcon /></div>
                  <h3>العنوان</h3>
                  <p>دمشق، سوريا</p>
                  <p>شارع المزة، بناء الصحة</p>
                </div>

                <div className="info-card">
                  <div className="info-icon"><PhoneIcon /></div>
                  <h3>الهاتف</h3>
                  <p dir="ltr">+963 11 123 4567</p>
                  <p dir="ltr">+963 11 765 4321</p>
                </div>

                <div className="info-card">
                  <div className="info-icon"><EmailIcon /></div>
                  <h3>البريد الإلكتروني</h3>
                  <p dir="ltr">info@patient360.sy</p>
                  <p dir="ltr">support@patient360.sy</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FOOTER                                                           */}
        {/* ================================================================ */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-title">Patient 360°</h3>
              <p className="footer-description">
                منصة متكاملة لإدارة الرعاية الصحية، نوفر حلولاً ذكية للمؤسسات الطبية.
              </p>
              <div className="social-links">
                <a href="#" className="social-icon" aria-label="Facebook">f</a>
                <a href="#" className="social-icon" aria-label="Twitter">t</a>
                <a href="#" className="social-icon" aria-label="LinkedIn">in</a>
                <a href="#" className="social-icon" aria-label="Email">@</a>
              </div>
            </div>

            <div className="footer-section">
              <h3 className="footer-title">روابط سريعة</h3>
              <div className="footer-links">
                <a href="#about" className="footer-link">من نحن</a>
                <a href="#services" className="footer-link">الخدمات</a>
                <a href="#vision" className="footer-link">رؤيتنا</a>
                <a href="#contact" className="footer-link">تواصل معنا</a>
              </div>
            </div>

            <div className="footer-section">
            </div>
          </div>

          {/* Animated Heart Pulse Logo */}
          <div className="footer-animated-logo">
            <div className="footer-heart-pulse-container">
              <svg className="footer-heart-pulse-svg" viewBox="0 0 50 25" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="footerPulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--tm-action, #00897B)" stopOpacity="0.6"/>
                    <stop offset="50%" stopColor="var(--tm-accent, #4DB6AC)" stopOpacity="1"/>
                    <stop offset="100%" stopColor="var(--tm-action, #00897B)" stopOpacity="0.6"/>
                  </linearGradient>
                </defs>
                <path
                  className="footer-pulse-line"
                  d="M2,12.5 Q6,12.5 8,8 T12,12.5 T16,8 T20,12.5 T24,8 T28,12.5 T32,8 T36,12.5 T40,8 T44,12.5 L48,12.5"
                  fill="none"
                  stroke="url(#footerPulseGradient)"
                  strokeWidth="2"
                />
                <circle className="footer-pulse-dot" cx="2" cy="12.5" r="2" fill="var(--tm-accent, #4DB6AC)"/>
              </svg>
            </div>
            <span className="footer-brand-text">
              PATIENT 360<span className="footer-degree-symbol">°</span>
            </span>
          </div>

          <div className="footer-bottom">
            تم التطوير بكل فخر      جميع الحقوق     محفوظة ©    2026    Patient 360°.
          </div>
        </footer>

        {/* ================================================================ */}
        {/* INLINE THEME STYLES (CSS Variables + Theme Toggle)               */}
        {/* ================================================================ */}
        <style jsx>{`
          /* ---- Password Toggle (Login Form) ---- */
          .form-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .form-input-wrapper .form-input-icon {
            position: absolute;
            right: 14px;
            display: flex;
            align-items: center;
            pointer-events: none;
            z-index: 1;
          }

          .form-input-wrapper .form-input {
            padding-right: 44px;
            padding-left: 44px;
          }

          .password-toggle-btn {
            position: absolute;
            left: 12px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            opacity: 0.6;
            transition: opacity 0.2s ease;
            z-index: 1;
          }

          .password-toggle-btn:hover {
            opacity: 1;
          }

          /* ---- Remember Me Checkbox ---- */
          .form-options-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.25rem;
          }

          .remember-me-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-family: 'Cairo', sans-serif;
            font-size: 0.875rem;
            color: var(--tm-text-secondary);
            user-select: none;
          }

          .remember-me-checkbox {
            display: none;
          }

          .remember-me-checkmark {
            width: 18px;
            height: 18px;
            border: 2px solid var(--tm-input-border);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
            position: relative;
          }

          .remember-me-checkbox:checked + .remember-me-checkmark {
            background: var(--tm-action);
            border-color: var(--tm-action);
          }

          .remember-me-checkbox:checked + .remember-me-checkmark::after {
            content: '✓';
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            position: absolute;
          }

          .remember-me-text {
            line-height: 1;
          }

          /* ---- Login Button Spinner ---- */
          .login-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }

          .login-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* ---- Footer (Inline Styles for Animated Logo) ---- */
          .footer {
            position: relative;
          }

          .footer-content {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 2rem;
            align-items: center;
          }

          .footer-animated-logo {
            position: absolute;
            left: 13rem;
            top: 44%;
            transform: translateY(-50%);
            z-index: 10;
            display: flex;
            align-items: center;
          }

          .footer-heart-pulse-container {
            width: 80px;
            height: 40px;
            margin-right: 20px;
            display: flex;
            align-items: center;
            overflow: visible;
          }

          .footer-heart-pulse-svg {
            width: 100%;
            height: 100%;
            overflow: visible;
          }

          .footer-pulse-line {
            stroke-dasharray: 120;
            stroke-dashoffset: 120;
            animation: footerDrawPulse 2.5s ease-in-out infinite;
          }

          .footer-pulse-dot {
            animation: footerMoveDot 2.5s ease-in-out infinite;
            filter: drop-shadow(0 0 3px var(--tm-glow));
          }

          @keyframes footerDrawPulse {
            0% { stroke-dashoffset: 120; opacity: 0.3; }
            40% { stroke-dashoffset: 0; opacity: 1; }
            100% { stroke-dashoffset: -120; opacity: 0.3; }
          }

          @keyframes footerMoveDot {
            0% { cx: 2; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { cx: 48; opacity: 0; }
          }

          .footer-brand-text {
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 2.2rem;
            font-weight: 800;
            letter-spacing: -0.5px;
            text-transform: uppercase;
            display: inline-flex;
            align-items: baseline;
            cursor: pointer;
          }

          .footer-degree-symbol {
            font-size: 0.7em;
            vertical-align: super;
            margin-left: 2px;
            animation: footerFlash 1.5s ease-in-out infinite;
          }

          @keyframes footerFlash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }

          /* ---- Responsive Footer ---- */
          @media (max-width: 768px) {
            .footer-animated-logo {
              position: relative;
              left: auto;
              top: auto;
              transform: none;
              text-align: center;
              margin-bottom: 20px;
              order: -1;
              justify-content: center;
            }

            .footer-content {
              grid-template-columns: 1fr;
              text-align: center;
            }

            .footer-heart-pulse-container {
              width: 60px;
              height: 30px;
              margin-right: 15px;
            }

            .footer-brand-text {
              font-size: 1.8rem;
            }

            .form-options-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
            }
          }

          @media (max-width: 1024px) {
            .footer-animated-logo {
              left: 1rem;
            }

            .footer-heart-pulse-container {
              width: 70px;
              height: 35px;
              margin-right: 18px;
            }

            .footer-brand-text {
              font-size: 2rem;
            }
          }
        `}</style>
      </div>
  );
};

export default Login;
