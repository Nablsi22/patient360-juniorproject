import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const features = [
    {
      title: "إدارة متكاملة للمرضى",
      description: "نظام شامل لإدارة السجلات الطبية والمواعيد والوصفات الطبية",
      icon: "🏥",
      highlight: "رعاية صحية متقدمة"
    },
    {
      title: "تحليلات ذكية",
      description: "رؤى عميقة وتقارير مفصلة لتحسين جودة الرعاية الصحية",
      icon: "📊",
      highlight: "قرارات مبنية على البيانات"
    },
    {
      title: "أمان على مستوى طبي",
      description: "حماية البيانات بأعلى معايير الأمان الطبي العالمية",
      icon: "🔒",
      highlight: "خصوصية مضمونة"
    },
    {
      title: "تكامل سلس",
      description: "ربط جميع الأقسام الطبية في منصة واحدة متكاملة",
      icon: "🔗",
      highlight: "كفاءة تشغيلية عالية"
    }
  ];

  const teamMembers = [
    {
      name: "معاذ جبري",
      role: "المدير التنفيذي",
      image: "👨‍⚕️",
      bio: "خبرة 15 عاماً في التحول الرقمي الصحي"
    },
    {
      name: "أنس النابلسي",
      role: "مدير التطوير",
      image: "👩‍⚕️",
      bio: "متخصص في أنظمة المعلومات الطبية"
    },
    {
      name: "علي راعي",
      role: "مدير التقنية",
      image: "👨‍💻",
      bio: "خبير في الأمن السيبراني والبنية التحتية"
    },
    {
      name: "كنان المجذوب",
      role: "مدير العمليات",
      image: "👩‍💼",
      bio: "رائدة في تحسين العمليات الصحية"
    }
  ];

  const services = [
    {
      icon: "📋",
      title: "السجلات الطبية الإلكترونية",
      description: "إدارة شاملة للسجلات الطبية مع إمكانية الوصول الفوري والآمن"
    },
    {
      icon: "📅",
      title: "نظام المواعيد الذكي",
      description: "جدولة مواعيد ذكية مع تذكيرات تلقائية وإدارة قوائم الانتظار"
    },
    {
      icon: "💊",
      title: "إدارة الوصفات الطبية",
      description: "نظام متكامل للوصفات الإلكترونية مع تتبع الأدوية والتفاعلات"
    },
    {
      icon: "📈",
      title: "التقارير والتحليلات",
      description: "لوحات تحكم تفاعلية وتقارير مفصلة لاتخاذ قرارات مستنيرة"
    },
    {
      icon: "🔔",
      title: "نظام التنبيهات",
      description: "تنبيهات ذكية للمواعيد والأدوية والمتابعات الطبية"
    },
    {
      icon: "🌐",
      title: "البوابة الإلكترونية",
      description: "بوابة تفاعلية للمرضى للوصول إلى سجلاتهم ونتائج الفحوصات"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      // User is already logged in, redirect to their role-specific dashboard
      const dashboardRoutes = {
        'doctor': '/doctor/dashboard',
        'patient': '/patient/dashboard',
        'pharmacist': '/pharmacist/dashboard',
        'laboratory': '/laboratory/dashboard'
      };
      navigate(dashboardRoutes[user.role] || '/');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Login successful
      
      // Store current user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      console.log('Logged in user:', user);
      
      // Navigate to role-specific dashboard
      const dashboardRoutes = {
        'doctor': '/doctor/dashboard',
        'patient': '/patient/dashboard',
        'pharmacist': '/pharmacist/dashboard',
        'laboratory': '/laboratory/dashboard'
      };
      
      navigate(dashboardRoutes[user.role] || '/dashboard');
    } else {
      // Login failed
      alert('❌ البريد الإلكتروني أو كلمة المرور غير صحيحة\n\nتأكد من:\n- كتابة البريد الإلكتروني بشكل صحيح\n- كتابة كلمة المرور بشكل صحيح\n- إنشاء حساب أولاً من صفحة التسجيل');
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form:', formData);
    alert('تم إرسال رسالتك بنجاح!');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="home-page">
      <Navbar />
      
      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-container">
          <div className="left-section">
            <div className="login-form-container">
              <h1 className="login-title">تسجيل الدخول</h1>
              <p className="login-subtitle">مرحباً بك في منصة Patient 360°</p>
              
              <form className="login-form" onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">كلمة المرور</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>

                <div className="forgot-password">
                  <a href="#" className="forgot-link">هل نسيت كلمة المرور؟</a>
                </div>

                <button type="submit" className="login-button">
                  تسجيل الدخول
                </button>
              </form>

              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">أو</span>
                <div className="divider-line"></div>
              </div>

              <div className="signup-link">
                ليس لديك حساب؟ <Link to="/signup">سجل الآن</Link>
              </div>
            </div>
          </div>

          <div className="right-section">
            <div className="feature-carousel">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`feature-slide ${currentSlide === index ? 'active' : ''}`}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-highlight">{feature.highlight}</div>
                  <h2 className="feature-title">{feature.title}</h2>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
            <div className="slide-indicators">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`indicator ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
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
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">مؤسسة صحية مشتركة</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">1M+</div>
                  <div className="stat-label">مريض مخدوم بعد الإطلاق</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">99.9%</div>
                  <div className="stat-label">وقت التشغيل</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">دعم فني</div>
                </div>
              </div>
            </div>
            
            <div className="about-image">
              <div className="image-placeholder">
                <span className="placeholder-icon">🏥</span>
                <div className="floating-card card-1">
                  <span>📊</span>
                  <span>تحليلات متقدمة</span>
                </div>
                <div className="floating-card card-2">
                  <span>🔒</span>
                  <span>أمان عالي</span>
                </div>
                <div className="floating-card card-3">
                  <span>⚡</span>
                  <span>أداء فائق</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section id="vision" className="vision-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">رؤيتنا ورسالتنا</h2>
            <p className="section-subtitle">نسعى لبناء مستقبل صحي أفضل</p>
          </div>
          
          <div className="vision-content">
            <div className="vision-card">
              <div className="card-icon">👁️</div>
              <h3>رؤيتنا</h3>
              <p>
                أن نكون الشريك التقني الأول للمؤسسات الصحية في المنطقة، 
                وأن نساهم في بناء منظومة صحية رقمية متكاملة تضع المريض في المقام الأول
              </p>
            </div>
            
            <div className="mission-card">
              <div className="card-icon">🎯</div>
              <h3>رسالتنا</h3>
              <p>
                توفير حلول تقنية مبتكرة وآمنة تمكن مقدمي الرعاية الصحية من 
                تقديم خدمات طبية عالية الجودة وتحسين تجربة المرضى
              </p>
            </div>
            
            <div className="values-card">
              <div className="card-icon">💎</div>
              <h3>قيمنا</h3>
              <ul>
                <li>الابتكار المستمر</li>
                <li>الأمان والخصوصية</li>
                <li>التميز في الخدمة</li>
                <li>الشراكة طويلة الأمد</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">خدماتنا</h2>
            <p className="section-subtitle">حلول متكاملة لإدارة المنظومة الصحية</p>
          </div>
          
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">لماذا Patient 360°</h2>
            <p className="section-subtitle">مميزات تجعلنا الخيار الأفضل</p>
          </div>
          
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-number">01</div>
              <div className="feature-content">
                <h3>سهولة الاستخدام</h3>
                <p>واجهة بديهية وسهلة الاستخدام لا تحتاج إلى تدريب معقد</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-number">02</div>
              <div className="feature-content">
                <h3>توافق كامل</h3>
                <p>يعمل على جميع الأجهزة والمنصات بكفاءة عالية</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-number">03</div>
              <div className="feature-content">
                <h3>تكامل سلس</h3>
                <p>يتكامل مع الأنظمة الموجودة دون الحاجة لتغييرات جذرية</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-number">04</div>
              <div className="feature-content">
                <h3>دعم محلي</h3>
                <p>فريق دعم محلي متخصص متوفر على مدار الساعة</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">فريق العمل</h2>
            <p className="section-subtitle">خبراء متخصصون في خدمتكم</p>
          </div>
          
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="member-image">{member.image}</div>
                <h3>{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-bio">{member.bio}</p>
                <div className="social-links">
                  <a href="#" className="social-link">in</a>
                  <a href="#" className="social-link">@</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">اتصل بنا</h2>
            <p className="section-subtitle">نحن هنا لخدمتكم</p>
          </div>
          
          <div className="contact-content">
            <div className="contact-info">
              <div className="info-card">
                <div className="info-icon">📍</div>
                <h3>العنوان</h3>
                <p>مشروع دمر , دمشق , سوريا</p>
              </div>
              
              <div className="info-card">
                <div className="info-icon">📞</div>
                <h3>الهاتف</h3>
                <p dir="ltr">+963933527091</p>
              </div>
              
              <div className="info-card">
                <div className="info-icon">✉️</div>
                <h3>البريد الإلكتروني</h3>
                <p dir="ltr">info@patient360.sa</p>
                <p dir="ltr">support@patient360.sa</p>
              </div>
            </div>
            
            <div className="contact-form-container">
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>الاسم الكامل</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>البريد الإلكتروني</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      dir="ltr"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    dir="ltr"
                  />
                </div>
                
                <div className="form-group">
                  <label>الرسالة</label>
                  <textarea
                    className="form-input"
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-button">
                  إرسال الرسالة
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Patient 360°</h3>
            <p className="footer-description">
              منصة متكاملة لإدارة الرعاية الصحية، نوفر حلولاً ذكية للمؤسسات الطبية.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon">f</a>
              <a href="#" className="social-icon">t</a>
              <a href="#" className="social-icon">in</a>
              <a href="#" className="social-icon">@</a>
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

        {/* Animated Heart Pulse Logo - TRUE LEFT SIDE - EXACT NAVBAR COPY */}
        <div className="footer-animated-logo">
          <div className="footer-heart-pulse-container">
            <svg className="footer-heart-pulse-svg" viewBox="0 0 50 25" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="footerPulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a23f97" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="#ff4444" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#a23f97ff" stopOpacity="0.6"/>
                </linearGradient>
              </defs>
              <path 
                className="footer-pulse-line" 
                d="M2,12.5 Q6,12.5 8,8 T12,12.5 T16,8 T20,12.5 T24,8 T28,12.5 T32,8 T36,12.5 T40,8 T44,12.5 L48,12.5" 
                fill="none" 
                stroke="url(#footerPulseGradient)" 
                strokeWidth="2"
              />
              <circle className="footer-pulse-dot" cx="2" cy="12.5" r="2" fill="#ff4444"/>
            </svg>
          </div>
          <span className="footer-brand-text">
            PATIENT 360<span className="footer-degree-symbol">°</span>
          </span>
        </div>

        <div className="footer-bottom">
          جميع الحقوق محفوظة © 2024 Patient 360°. تم التطوير بكل فخر
        </div>
      </footer>

      <style jsx>{`
        /* Import the exact navbar fonts */
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');

        /* Footer positioning */
        .footer {
          position: relative;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2rem;
          align-items: center;
        }

        /* Animated Heart Pulse Logo - EXACT NAVBAR COPY */
        .footer-animated-logo {
          position: absolute;
          left: 13rem;
          top: 44%;
          transform: translateY(-50%);
          z-index: 10;
          display: flex;
          align-items: center;
        }

        /* EXACT navbar container styling - BIGGER SIZE */
        .footer-heart-pulse-container {
          width: 80px;
          height: 40px;
          margin-right: 20px;
          display: flex;
          align-items: center;
          overflow: visible;
        }

        /* EXACT navbar SVG styling - BIGGER SIZE */
        .footer-heart-pulse-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        /* EXACT navbar pulse line animation */
        .footer-pulse-line {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: footerDrawPulse 2.5s ease-in-out infinite;
        }

        /* EXACT navbar pulse dot animation */
        .footer-pulse-dot {
          animation: footerMoveDot 2.5s ease-in-out infinite;
          filter: drop-shadow(0 0 3px rgba(162, 63, 151, 0.5));
        }

        /* EXACT navbar keyframe animations */
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

        /* EXACT navbar brand text styling - BIGGER SIZE */
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

        /* EXACT navbar degree symbol styling - BIGGER SIZE */
        .footer-degree-symbol {
          font-size: 0.7em;
          vertical-align: super;
          margin-left: 2px;
          animation: footerFlash 1.5s ease-in-out infinite;
        }

        /* EXACT navbar flash animation */
        @keyframes footerFlash {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        /* Responsive adjustments */
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