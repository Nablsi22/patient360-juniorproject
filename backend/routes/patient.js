const express = require('express');
const router = express.Router();
const axios = require('axios');

// Import controllers
const patientController = require('../controllers/patientController');
const visitController = require('../controllers/visitController');
const medicationController = require('../controllers/medicationController');

// Import middleware
const { protect, restrictTo, verifyPatientOwnership } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

/**
 * ALL ROUTES REQUIRE:
 * 1. Authentication (protect)
 * 2. Patient role only (restrictTo('patient'))
 * 3. Ownership verification (verifyPatientOwnership)
 * 4. Audit logging
 */

// ==========================================
// PATIENT PROFILE ROUTES
// ==========================================

/**
 * @route   GET /api/patient/profile
 * @desc    Get complete patient profile
 * @access  Private (Patient only)
 */
router.get(
  '/profile',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('PATIENT_PROFILE'),
  patientController.getProfile
);

/**
 * @route   PUT /api/patient/profile
 * @desc    Update patient profile (limited fields)
 * @access  Private (Patient only)
 */
router.put(
  '/profile',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('PATIENT_PROFILE'),
  patientController.updateProfile
);

/**
 * @route   GET /api/patient/medical-history
 * @desc    Get medical history summary
 * @access  Private (Patient only)
 */
router.get(
  '/medical-history',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('MEDICAL_HISTORY'),
  patientController.getMedicalHistory
);

// ==========================================
// VISIT ROUTES
// ==========================================

/**
 * @route   GET /api/patient/visits/stats
 * @desc    Get visit statistics
 * @access  Private (Patient only)
 * @note    This route MUST come before /:visitId to avoid conflicts
 */
router.get(
  '/visits/stats',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('VISIT'),
  visitController.getVisitStats
);

/**
 * @route   GET /api/patient/visits/by-doctor
 * @desc    Get visits grouped by doctor
 * @access  Private (Patient only)
 */
router.get(
  '/visits/by-doctor',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('VISIT'),
  visitController.getVisitsByDoctor
);

/**
 * @route   GET /api/patient/visits
 * @desc    Get all patient visits with filters
 * @access  Private (Patient only)
 * @query   startDate, endDate, doctorId, search, status, page, limit
 */
router.get(
  '/visits',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('VISIT'),
  visitController.getVisits
);

/**
 * @route   GET /api/patient/visits/:visitId
 * @desc    Get single visit details
 * @access  Private (Patient only - ownership verified)
 */
router.get(
  '/visits/:visitId',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('VISIT'),
  visitController.getVisitDetails
);

// ==========================================
// MEDICATION ROUTES
// ==========================================

/**
 * @route   GET /api/patient/medications/schedule
 * @desc    Get weekly medication schedule
 * @access  Private (Patient only)
 * @note    This route MUST come before /medications/:id to avoid conflicts
 */
router.get(
  '/medications/schedule',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('MEDICATION'),
  medicationController.getMedicationSchedule
);

/**
 * @route   GET /api/patient/medications/history
 * @desc    Get medication history with filters
 * @access  Private (Patient only)
 * @query   startDate, endDate, medicationName, page, limit
 */
router.get(
  '/medications/history',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('MEDICATION'),
  medicationController.getMedicationHistory
);

/**
 * @route   GET /api/patient/medications/interactions
 * @desc    Check for medication interactions
 * @access  Private (Patient only)
 */
router.get(
  '/medications/interactions',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('MEDICATION'),
  medicationController.checkInteractions
);

/**
 * @route   GET /api/patient/medications
 * @desc    Get current active medications
 * @access  Private (Patient only)
 */
router.get(
  '/medications',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('MEDICATION'),
  medicationController.getCurrentMedications
);

// ==========================================
// AI SYMPTOM ANALYSIS ROUTE
// ==========================================

/**
 * @route   POST /api/patient/ai-symptom-analysis
 * @desc    Analyze patient symptoms using AI model
 * @access  Private (Patient only)
 */
router.post(
  '/ai-symptom-analysis',
  protect,
  restrictTo('patient'),
  verifyPatientOwnership,
  auditLog('PATIENT_PROFILE'),
  async (req, res) => {
    try {
      const { symptoms } = req.body;
      
      // Validation
      if (!symptoms || symptoms.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'يرجى إدخال الأعراض'
        });
      }

      console.log('🔍 Patient symptoms:', symptoms);
      console.log('🤖 Calling AI service...');
      
      // Call AI service (FastAPI running on port 8000)
      const aiResponse = await axios.post('http://localhost:8001/predict', {
        symptoms: symptoms
      }, {
        timeout: 30000 // 30 second timeout
      });
      
      console.log('✅ AI Response:', aiResponse.data);
      
      res.status(200).json({
        success: true,
        data: aiResponse.data
      });
      
    } catch (error) {
      console.error('❌ AI Analysis Error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          message: 'خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى المحاولة لاحقاً'
        });
      }
      
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        return res.status(504).json({
          success: false,
          message: 'انتهت مهلة الاتصال بخدمة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء تحليل الأعراض'
      });
    }
  }
);

// ==========================================
// APPOINTMENTS ROUTES
// ==========================================

/**
 * @route   GET /api/patient/appointments
 * @desc    Get all appointments for the logged-in patient
 * @access  Private (Patient only)
 */
router.get(
  '/appointments',
  protect,
  restrictTo('patient'),
  async (req, res) => {
    try {
      const personId = req.user.personId;
      const db = require('mongoose').connection.db;
      const { ObjectId } = require('mongoose').Types;

      const appointments = await db.collection('appointments')
        .find({ patientId: new ObjectId(personId) })
        .sort({ appointmentDate: -1 })
        .toArray();

      // Populate doctor names
      for (let apt of appointments) {
        if (apt.doctorId) {
          const doctor = await db.collection('doctors').findOne({ _id: new ObjectId(apt.doctorId) });
          if (doctor) {
            const person = await db.collection('persons').findOne({ _id: new ObjectId(doctor.personId) });
            if (person) {
              apt.doctorId = {
                _id: doctor._id,
                firstName: person.firstName,
                lastName: person.lastName,
                specialization: doctor.specialization,
                hospitalAffiliation: doctor.hospitalAffiliation
              };
            }
          }
        }
      }

      res.status(200).json({ success: true, appointments });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب المواعيد' });
    }
  }
);

/**
 * @route   POST /api/patient/appointments
 * @desc    Book a new appointment
 * @access  Private (Patient only)
 */
router.post(
  '/appointments',
  protect,
  restrictTo('patient'),
  async (req, res) => {
    try {
      const personId = req.user.personId;
      const db = require('mongoose').connection.db;
      const { ObjectId } = require('mongoose').Types;
      const { doctorId, slotId, appointmentDate, appointmentTime, reasonForVisit, bookingMethod, priority, appointmentType } = req.body;

      // Create appointment
      const appointment = {
        appointmentType: appointmentType || 'doctor',
        patientId: new ObjectId(personId),
        doctorId: new ObjectId(doctorId),
        slotId: slotId ? new ObjectId(slotId) : undefined,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        reasonForVisit,
        status: 'scheduled',
        bookingMethod: bookingMethod || 'online',
        priority: priority || 'routine',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('appointments').insertOne(appointment);

      // Increment slot bookings if slotId provided
      if (slotId) {
        await db.collection('availability_slots').updateOne(
          { _id: new ObjectId(slotId) },
          { $inc: { currentBookings: 1 }, $set: { updatedAt: new Date() } }
        );
      }

      res.status(201).json({ success: true, appointment: { ...appointment, _id: result.insertedId } });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ success: false, message: 'حدث خطأ أثناء حجز الموعد' });
    }
  }
);

// ==========================================
// LAB RESULTS ROUTES
// ==========================================

/**
 * @route   GET /api/patient/lab-results
 * @desc    Get all lab tests for the logged-in patient
 * @access  Private (Patient only)
 */
router.get(
  '/lab-results',
  protect,
  restrictTo('patient'),
  async (req, res) => {
    try {
      const personId = req.user.personId;
      const db = require('mongoose').connection.db;
      const { ObjectId } = require('mongoose').Types;

      const labResults = await db.collection('lab_tests')
        .find({ patientId: new ObjectId(personId) })
        .sort({ orderDate: -1 })
        .toArray();

      res.status(200).json({ success: true, labTests: labResults });
    } catch (error) {
      console.error('Error fetching lab results:', error);
      res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب نتائج التحاليل' });
    }
  }
);

// ==========================================
// PRESCRIPTIONS ROUTES
// ==========================================

/**
 * @route   GET /api/patient/prescriptions
 * @desc    Get all prescriptions for the logged-in patient
 * @access  Private (Patient only)
 */
router.get(
  '/prescriptions',
  protect,
  restrictTo('patient'),
  async (req, res) => {
    try {
      const personId = req.user.personId;
      const db = require('mongoose').connection.db;
      const { ObjectId } = require('mongoose').Types;

      const prescriptions = await db.collection('prescriptions')
        .find({ patientId: new ObjectId(personId) })
        .sort({ prescriptionDate: -1 })
        .toArray();

      // Populate doctor names
      for (let rx of prescriptions) {
        if (rx.doctorId) {
          const doctor = await db.collection('doctors').findOne({ _id: new ObjectId(rx.doctorId) });
          if (doctor) {
            const person = await db.collection('persons').findOne({ _id: new ObjectId(doctor.personId) });
            if (person) {
              rx.doctorName = `د. ${person.firstName} ${person.lastName}`;
            }
          }
        }
      }

      res.status(200).json({ success: true, prescriptions });
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب الوصفات' });
    }
  }
);

// ==========================================
// DOCTOR LISTING + SLOTS (for booking wizard)
// ==========================================

/**
 * @route   GET /api/patient/doctors?specialization=cardiology
 * @desc    Get available doctors filtered by specialization
 * @access  Private (Patient only)
 */
router.get(
  '/doctors',
  protect,
  restrictTo('patient'),
  async (req, res) => {
    try {
      const { specialization } = req.query;
      const db = require('mongoose').connection.db;
      const { ObjectId } = require('mongoose').Types;

      const query = { isAvailable: true, isAcceptingNewPatients: true, verificationStatus: 'verified' };
      if (specialization) query.specialization = specialization;

      const doctors = await db.collection('doctors').find(query).sort({ averageRating: -1 }).toArray();

      // Populate person data (name, address)
      const populated = [];
      for (let doc of doctors) {
        const person = await db.collection('persons').findOne({ _id: new ObjectId(doc.personId) });
        if (person) {
          populated.push({
            _id: doc._id,
            firstName: person.firstName,
            fatherName: person.fatherName,
            lastName: person.lastName,
            governorate: person.governorate,
            city: person.city,
            specialization: doc.specialization,
            hospitalAffiliation: doc.hospitalAffiliation,
            yearsOfExperience: doc.yearsOfExperience,
            consultationFee: doc.consultationFee,
            currency: doc.currency,
            averageRating: doc.averageRating,
            totalReviews: doc.totalReviews,
            isECGSpecialist: doc.isECGSpecialist
          });
        }
      }

      res.status(200).json({ success: true, doctors: populated });
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب قائمة الأطباء' });
    }
  }
);

/**
 * @route   GET /api/patient/doctors/:id/slots
 * @desc    Get available time slots for a specific doctor
 * @access  Private (Patient only)
 */
router.get(
  '/doctors/:id/slots',
  protect,
  restrictTo('patient'),
  async (req, res) => {
    try {
      const doctorId = req.params.id;
      const db = require('mongoose').connection.db;
      const { ObjectId } = require('mongoose').Types;

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const slots = await db.collection('availability_slots')
        .find({
          doctorId: new ObjectId(doctorId),
          date: { $gte: now },
          status: 'available',
          isAvailable: true
        })
        .sort({ date: 1, startTime: 1 })
        .toArray();

      res.status(200).json({ success: true, slots });
    } catch (error) {
      console.error('Error fetching slots:', error);
      res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب المواعيد المتاحة' });
    }
  }
);

module.exports = router;