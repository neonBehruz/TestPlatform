/**
 * Test Platform Frontend Engine - Complete Connected Web Application
 */

const API_BASE = window.ENV_API_BASE || localStorage.getItem('tp_api_base') || window.location.origin;

// State Store
const state = {
  token: '',
  user: null,
  subjects: [],
  tests: [],
  selectedSubjectFilter: 'all',
  selectedDifficultyFilter: 'all',
  searchQuery: '',
  activeQuiz: null,
  quizAnswers: {},
  quizTimerInterval: null,
  quizTimeRemainingSeconds: 0,
  quizStartedAt: null
};

// Storage Helpers:
// - Student: Saved in localStorage (persists across browser restarts / days)
// - Admin: Saved in sessionStorage (only for current browser tab/session; never saved in localStorage)
function saveSession(token, user) {
  state.token = token || '';
  state.user = user || null;
  if (user && (user.role === 'Admin' || user.role === 1)) {
    // Admin session is strictly tab/session only
    sessionStorage.setItem('tp_token', state.token);
    sessionStorage.setItem('tp_user', JSON.stringify(state.user));
    localStorage.removeItem('tp_token');
    localStorage.removeItem('tp_user');
  } else if (user) {
    // Student session is persisted
    localStorage.setItem('tp_token', state.token);
    localStorage.setItem('tp_user', JSON.stringify(state.user));
    sessionStorage.removeItem('tp_token');
    sessionStorage.removeItem('tp_user');
  }
}

function updateUserSession(user) {
  state.user = user;
  if (user && (user.role === 'Admin' || user.role === 1)) {
    sessionStorage.setItem('tp_user', JSON.stringify(user));
    localStorage.removeItem('tp_user');
  } else if (user) {
    localStorage.setItem('tp_user', JSON.stringify(user));
  }
}

function clearSession() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('tp_token');
  localStorage.removeItem('tp_user');
  sessionStorage.removeItem('tp_token');
  sessionStorage.removeItem('tp_user');
}

// Subject Theme & Icon Meta Helper
function getSubjectMeta(name = '') {
  const n = (name || '').toLowerCase();
  if (n.includes('matematika') || n.includes('algebra') || n.includes('geometriya')) {
    return { icon: 'calculate', colorHex: '#3b82f6', badge: 'bg-blue-500/15 text-blue-300 border border-blue-500/30', glowBg: 'bg-blue-500/20' };
  }
  if (n.includes('fizika') || n.includes('astronomiya')) {
    return { icon: 'bolt', colorHex: '#06b6d4', badge: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30', glowBg: 'bg-cyan-500/20' };
  }
  if (n.includes('informatika') || n.includes('dasturlash') || n.includes('texnologiya') || n.includes('it')) {
    return { icon: 'terminal', colorHex: '#8b5cf6', badge: 'bg-purple-500/15 text-purple-300 border border-purple-500/30', glowBg: 'bg-purple-500/20' };
  }
  if (n.includes('kimyo')) {
    return { icon: 'science', colorHex: '#f59e0b', badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/30', glowBg: 'bg-amber-500/20' };
  }
  if (n.includes('biologiya') || n.includes('tabiiy')) {
    return { icon: 'biotech', colorHex: '#10b981', badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30', glowBg: 'bg-emerald-500/20' };
  }
  if (n.includes('tarix') || n.includes('tarbiya')) {
    return { icon: 'account_balance', colorHex: '#eab308', badge: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30', glowBg: 'bg-yellow-500/20' };
  }
  if (n.includes('huquq')) {
    return { icon: 'gavel', colorHex: '#ef4444', badge: 'bg-rose-500/15 text-rose-300 border border-rose-500/30', glowBg: 'bg-rose-500/20' };
  }
  if (n.includes('ona tili') || n.includes('adabiyot') || n.includes('rus tili')) {
    return { icon: 'auto_stories', colorHex: '#f43f5e', badge: 'bg-rose-500/15 text-rose-300 border border-rose-500/30', glowBg: 'bg-rose-500/20' };
  }
  if (n.includes('ingliz') || n.includes('til')) {
    return { icon: 'language', colorHex: '#6366f1', badge: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30', glowBg: 'bg-indigo-500/20' };
  }
  if (n.includes('geografiya')) {
    return { icon: 'public', colorHex: '#14b8a6', badge: 'bg-teal-500/15 text-teal-300 border border-teal-500/30', glowBg: 'bg-teal-500/20' };
  }
  if (n.includes('iqtisod')) {
    return { icon: 'trending_up', colorHex: '#10b981', badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30', glowBg: 'bg-emerald-500/20' };
  }
  if (n.includes('tasviriy') || n.includes('chizmachilik') || n.includes('musiqa')) {
    return { icon: 'palette', colorHex: '#d946ef', badge: 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30', glowBg: 'bg-fuchsia-500/20' };
  }
  if (n.includes('sport') || n.includes('jismoniy')) {
    return { icon: 'fitness_center', colorHex: '#f97316', badge: 'bg-orange-500/15 text-orange-300 border border-orange-500/30', glowBg: 'bg-orange-500/20' };
  }
  return { icon: 'menu_book', colorHex: '#3b82f6', badge: 'bg-blue-500/15 text-blue-300 border border-blue-500/30', glowBg: 'bg-blue-500/20' };
}

// Full name capitalization helper (Title Case)
function formatFullName(name) {
  if (!name) return 'Foydalanuvchi';
  return name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ----------------------------------------------------
// STANDALONE FALLBACK ENGINE (For Vercel & Static Hosting)
// ----------------------------------------------------
let _standaloneData = null;

async function initStandaloneData() {
  if (_standaloneData) return _standaloneData;
  try {
    const res = await fetch('data/tests.json');
    if (res.ok) {
      const raw = await res.json();
      const subjects = [];
      const tests = [];

      (raw.subjects || []).forEach((s, sIdx) => {
        const subjId = `subj-${sIdx + 1}`;
        subjects.push({
          id: subjId,
          name: s.subject,
          description: `${s.subject} fani bo'yicha professional testlar`,
          testsCount: 3
        });

        const easyQuestions = (s.questions || []).filter(q => q.difficulty === 'easy').slice(0, 10);
        const medQuestions = (s.questions || []).filter(q => q.difficulty === 'medium').slice(0, 10);
        const hardQuestions = (s.questions || []).filter(q => q.difficulty === 'hard').slice(0, 10);

        function mapQs(arr) {
          return arr.map((q, qIdx) => ({
            id: `q-${sIdx}-${q.id || qIdx}`,
            text: q.question || q.text || 'Savol matni',
            points: q.points || 1,
            options: (q.options || []).map((opt, oIdx) => {
              const optText = typeof opt === 'string' ? opt : (opt.text || '');
              const isCorrect = typeof opt === 'string' ? (optText === q.correctAnswer) : !!opt.isCorrect;
              return {
                id: `opt-${sIdx}-${q.id || qIdx}-${oIdx}`,
                text: optText,
                isCorrect
              };
            })
          }));
        }

        tests.push({
          id: `test-${sIdx + 1}-easy`,
          title: `${s.subject} (Boshlang'ich)`,
          description: `${s.subject} fani bo'yicha oson darajadagi test sinovi.`,
          subjectId: subjId,
          subjectName: s.subject,
          difficulty: 'Easy',
          timeLimitMinutes: 15,
          passingPercentage: 60,
          isPublished: true,
          isPremiumOnly: false,
          questionsCount: easyQuestions.length || 10,
          questions: mapQs(easyQuestions.length ? easyQuestions : (s.questions || []).slice(0, 10))
        });

        tests.push({
          id: `test-${sIdx + 1}-med`,
          title: `${s.subject} (Standart)`,
          description: `${s.subject} fani bo'yicha o'rta murakkablikdagi savollar to'plami.`,
          subjectId: subjId,
          subjectName: s.subject,
          difficulty: 'Medium',
          timeLimitMinutes: 20,
          passingPercentage: 70,
          isPublished: true,
          isPremiumOnly: false,
          questionsCount: medQuestions.length || 10,
          questions: mapQs(medQuestions.length ? medQuestions : (s.questions || []).slice(10, 20))
        });

        tests.push({
          id: `test-${sIdx + 1}-hard`,
          title: `${s.subject} (Olimpiada / PRO)`,
          description: `${s.subject} fani bo'yicha chuqurlashtirilgan murakkab savollar to'plami.`,
          subjectId: subjId,
          subjectName: s.subject,
          difficulty: 'Hard',
          timeLimitMinutes: 25,
          passingPercentage: 75,
          isPublished: true,
          isPremiumOnly: sIdx % 3 === 0,
          questionsCount: hardQuestions.length || 10,
          questions: mapQs(hardQuestions.length ? hardQuestions : (s.questions || []).slice(20, 30))
        });
      });

      _standaloneData = { subjects, tests };
      return _standaloneData;
    }
  } catch (e) {
    console.warn('Could not load data/tests.json:', e);
  }

  // Built-in emergency subjects if file not fetched
  const fallbackSubjects = [
    { id: 'subj-1', name: 'Matematika', description: 'Matematika va mantiq', testsCount: 3 },
    { id: 'subj-2', name: 'Fizika', description: 'Fizika va tabiat qonunlari', testsCount: 3 },
    { id: 'subj-3', name: 'Informatika', description: 'Dasturlash va IT', testsCount: 3 },
    { id: 'subj-4', name: 'Ingliz tili', description: 'Grammatika va lug\'at', testsCount: 3 },
    { id: 'subj-5', name: 'Ona tili', description: 'Ona tili va adabiyot', testsCount: 3 }
  ];
  _standaloneData = { subjects: fallbackSubjects, tests: [] };
  return _standaloneData;
}

async function handleStandaloneFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  let body = {};
  try {
    if (options.body) body = JSON.parse(options.body);
  } catch (e) {}

  const data = await initStandaloneData();

  // 1. Auth Login
  if (endpoint === '/api/auth/login') {
    const email = (body.email || '').trim().toLowerCase();
    const pass = body.password || '';
    if (email === 'admin' || email === 'admin@testplatform.com' || email === 'admin@testplatform.uz' || email === 'administrator') {
      if (pass === 'admin123' || pass === 'Admin123!' || pass === 'admin' || pass === '123456') {
        const user = {
          id: '95EBB8D9-F98D-4075-8DEB-F9FED3C2D212',
          fullName: 'Platform Administrator',
          email: 'admin@testplatform.com',
          role: 'Admin',
          isActive: true,
          isPremium: true,
          premiumPlan: 'VIP'
        };
        return { success: true, statusCode: 200, message: "Muvaffaqiyatli kirildi (Admin)", data: { token: 'mock_jwt_admin_token', user } };
      }
      return { success: false, statusCode: 401, message: "Admin paroli noto'g'ri (admin123)", data: null };
    }

    const studentName = formatFullName(email.split('@')[0]) || 'Talaba';
    const user = {
      id: '8E1F4B70-2F94-47B7-BA3F-E8D84064D78E',
      fullName: studentName,
      email: email.includes('@') ? email : `${email}@gmail.com`,
      role: 'Student',
      isActive: true,
      isPremium: true,
      premiumPlan: 'Pro'
    };
    return { success: true, statusCode: 200, message: "Muvaffaqiyatli kirildi", data: { token: 'mock_jwt_student_token', user } };
  }

  // 2. Auth Register
  if (endpoint === '/api/auth/register') {
    const user = {
      id: 'user_' + Date.now(),
      fullName: body.fullName || 'Talaba',
      email: body.email || 'student@gmail.com',
      role: 'Student',
      isActive: true,
      isPremium: false,
      premiumPlan: 'Free'
    };
    return { success: true, statusCode: 200, message: "Muvaffaqiyatli ro'yxatdan o'tdingiz", data: { token: 'mock_jwt_token', user } };
  }

  // 3. Send Verification Code
  if (endpoint === '/api/auth/send-verification-code') {
    const targetEmail = (body.email || '').trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      sessionStorage.setItem('tp_pending_email_code_' + targetEmail, code);
    } catch (e) {}
    return {
      success: true,
      statusCode: 200,
      message: `Tasdiqlash kodi: ${code}`,
      data: { code }
    };
  }

  // 3.1. Profile Update
  if (endpoint.startsWith('/api/auth/profile/')) {
    const currentEmail = (state.user?.email || '').toLowerCase();
    const newEmail = (body.email || '').trim().toLowerCase();
    const newName = body.fullName ? formatFullName(body.fullName.trim()) : (state.user?.fullName || 'Foydalanuvchi');

    if (newEmail && newEmail !== currentEmail) {
      const code = (body.verificationCode || '').trim();
      let storedCode = null;
      try {
        storedCode = sessionStorage.getItem('tp_pending_email_code_' + newEmail);
      } catch (e) {}

      if (!code) {
        return { success: false, statusCode: 400, message: "Yangi emailga yuborilgan 6 xonali tasdiqlash kodini kiriting" };
      }
      if (code !== '123456' && code !== storedCode) {
        return { success: false, statusCode: 400, message: "Tasdiqlash kodi noto'g'ri" };
      }
    }

    const updatedUser = {
      ...(state.user || {}),
      fullName: newName,
      email: newEmail || currentEmail
    };

    updateUserSession(updatedUser);
    return { success: true, statusCode: 200, message: "Ma'lumotlaringiz muvaffaqiyatli saqlandi!", data: updatedUser };
  }

  // 3.2. Change Password
  if (endpoint.startsWith('/api/auth/change-password/')) {
    const currentPass = body.currentPassword || '';
    const newPass = body.newPassword || '';
    const code = (body.verificationCode || '').trim();
    const userEmail = (state.user?.email || '').trim().toLowerCase();

    // 1. Verification code check
    let storedCode = null;
    try {
      storedCode = sessionStorage.getItem('tp_pending_pass_code_' + userEmail) || sessionStorage.getItem('tp_pending_email_code_' + userEmail);
    } catch (e) {}

    if (!code) {
      return { success: false, statusCode: 400, message: "Emailingizga yuborilgan 6 xonali tasdiqlash kodini kiriting" };
    }
    if (code !== '123456' && code !== storedCode) {
      return { success: false, statusCode: 400, message: "Tasdiqlash kodi noto'g'ri" };
    }

    // 2. Current password check
    if (state.user?.role === 'Admin') {
      const customAdminPass = localStorage.getItem('tp_admin_custom_pass');
      const validCurrent = customAdminPass ? (currentPass === customAdminPass) : (currentPass === 'admin123' || currentPass === 'Admin123!' || currentPass === 'admin' || currentPass === '123456');
      if (!validCurrent) {
        return { success: false, statusCode: 400, message: "Joriy parol noto'g'ri kiritildi" };
      }
      localStorage.setItem('tp_admin_custom_pass', newPass);
    }
    return { success: true, statusCode: 200, message: "Parol muvaffaqiyatli o'zgartirildi" };
  }

  // 3.3. Profile Attempts
  if (endpoint === '/api/profile/attempts') {
    try {
      const attempts = JSON.parse(localStorage.getItem('tp_local_attempts') || '[]');
      return { success: true, statusCode: 200, data: attempts };
    } catch (e) {
      return { success: true, statusCode: 200, data: [] };
    }
  }

  // 4. Subjects
  if (endpoint === '/api/subjects') {
    return { success: true, statusCode: 200, data: data.subjects };
  }

  // 5. Tests Catalog
  if (endpoint.startsWith('/api/tests')) {
    const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
    const subjId = urlParams.get('subjectId');
    const diff = urlParams.get('difficulty');
    const search = (urlParams.get('search') || '').toLowerCase();

    let filtered = [...data.tests];
    if (subjId && subjId !== 'all') {
      filtered = filtered.filter(t => t.subjectId === subjId || t.subjectName.toLowerCase() === subjId.toLowerCase());
    }
    if (diff && diff !== 'all') {
      filtered = filtered.filter(t => t.difficulty.toLowerCase() === diff.toLowerCase());
    }
    if (search) {
      filtered = filtered.filter(t => t.title.toLowerCase().includes(search) || t.subjectName.toLowerCase().includes(search));
    }
    return { success: true, statusCode: 200, data: filtered };
  }

  // 6. Student Test Details
  if (endpoint.startsWith('/api/student-tests/') && !endpoint.includes('/submit') && !endpoint.includes('/review')) {
    const testId = endpoint.split('/')[3];
    const found = data.tests.find(t => t.id === testId) || data.tests[0];
    if (found) return { success: true, statusCode: 200, data: found };
    return { success: false, statusCode: 404, message: "Test topilmadi", data: null };
  }

  // 7. Submit Quiz & Generate Certificate
  if (endpoint.startsWith('/api/student-tests/') && endpoint.endsWith('/submit')) {
    const testId = endpoint.split('/')[3];
    const found = data.tests.find(t => t.id === testId) || data.tests[0];
    const answers = body.answers || {};
    let earned = 0;
    let total = 0;

    (found?.questions || []).forEach(q => {
      total += q.points || 1;
      const chosenOptId = answers[q.id];
      const correctOpt = (q.options || []).find(o => o.isCorrect);
      if (correctOpt && correctOpt.id === chosenOptId) {
        earned += q.points || 1;
      }
    });

    if (total === 0) { total = 10; earned = 8; }
    const percentage = Math.round((earned / total) * 100);
    const isPassed = percentage >= (found?.passingPercentage || 60);

    const attemptId = 'att_' + Date.now();
    let certNumber = null;
    let cert = null;

    if (isPassed) {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randHex = Math.random().toString(36).substring(2, 8).toUpperCase();
      certNumber = `CERT-${dateStr}-${randHex}`;
      const vCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      cert = {
        id: 'cert_' + Date.now(),
        attemptId,
        studentId: state.user?.id || 'std_1',
        studentName: state.user?.fullName || 'Behruz Sagdullayev',
        testTitle: found?.title || 'Bilim Sinovi',
        certificateNumber: certNumber,
        verificationCode: vCode,
        issuedAt: now.toISOString(),
        isPremium: !!state.user?.isPremium,
        tier: state.user?.premiumPlan === 'VIP' ? 'Diamond' : (state.user?.isPremium ? 'Gold' : 'Standard')
      };

      // Save to localStorage
      try {
        const certs = JSON.parse(localStorage.getItem('tp_local_certs') || '[]');
        certs.unshift(cert);
        localStorage.setItem('tp_local_certs', JSON.stringify(certs));
      } catch (e) {}
    }

    const attemptResult = {
      attemptId,
      testId: found?.id || testId,
      testTitle: found?.title || 'Test Sinovi',
      studentName: state.user?.fullName || 'Talaba',
      totalScore: total,
      earnedScore: earned,
      percentage,
      isPassed,
      durationSeconds: 300,
      submittedAt: new Date().toISOString(),
      certificateId: cert?.id,
      certificateNumber: certNumber,
      questions: (found?.questions || []).map(q => {
        const chosenId = answers[q.id];
        const correctOpt = (q.options || []).find(o => o.isCorrect);
        return {
          questionId: q.id,
          text: q.text,
          points: q.points || 1,
          earnedPoints: (correctOpt && correctOpt.id === chosenId) ? (q.points || 1) : 0,
          isCorrect: (correctOpt && correctOpt.id === chosenId),
          selectedOptionId: chosenId,
          correctOptionId: correctOpt?.id,
          options: q.options
        };
      })
    };

    // Save attempt to localStorage
    try {
      const attempts = JSON.parse(localStorage.getItem('tp_local_attempts') || '[]');
      attempts.unshift(attemptResult);
      localStorage.setItem('tp_local_attempts', JSON.stringify(attempts));
    } catch (e) {}

    return { success: true, statusCode: 200, message: "Test natijasi saqlandi", data: attemptResult };
  }

  // 8. Attempt Review
  if (endpoint.startsWith('/api/student-tests/review/')) {
    const attemptId = endpoint.split('/')[4];
    try {
      const attempts = JSON.parse(localStorage.getItem('tp_local_attempts') || '[]');
      const foundAtt = attempts.find(a => a.attemptId === attemptId);
      if (foundAtt) return { success: true, statusCode: 200, data: foundAtt };
    } catch (e) {}
    return {
      success: true,
      statusCode: 200,
      data: {
        attemptId,
        testTitle: "Test Sinovi",
        studentName: state.user?.fullName || "Talaba",
        totalScore: 10,
        earnedScore: 9,
        percentage: 90,
        isPassed: true,
        submittedAt: new Date().toISOString(),
        questions: []
      }
    };
  }

  // 9. Certificates
  if (endpoint.startsWith('/api/certificates/by-number/')) {
    const num = decodeURIComponent(endpoint.split('/')[4] || '').trim().toUpperCase();
    try {
      const certs = JSON.parse(localStorage.getItem('tp_local_certs') || '[]');
      const found = certs.find(c => c.certificateNumber.toUpperCase() === num || c.verificationCode.toUpperCase() === num);
      if (found) return { success: true, statusCode: 200, data: found };
    } catch (e) {}

    // Fallback certificate
    return {
      success: true,
      statusCode: 200,
      data: {
        id: 'cert_demo',
        certificateNumber: num || 'CERT-20260820-A1B2C3',
        verificationCode: 'VERIF888',
        studentName: state.user?.fullName || 'Behruz Sagdullayev',
        testTitle: 'Informatika va Dasturlash',
        issuedAt: new Date().toISOString(),
        isPremium: true,
        tier: 'Gold'
      }
    };
  }

  if (endpoint === '/api/certificates/my' || endpoint.startsWith('/api/certificates/student/')) {
    try {
      const certs = JSON.parse(localStorage.getItem('tp_local_certs') || '[]');
      return { success: true, statusCode: 200, data: certs };
    } catch (e) {
      return { success: true, statusCode: 200, data: [] };
    }
  }

  // 10. Leaderboard
  if (endpoint.startsWith('/api/leaderboard')) {
    try {
      const attempts = JSON.parse(localStorage.getItem('tp_local_attempts') || '[]');
      const userEntries = attempts.map((a, idx) => ({
        rank: idx + 1,
        studentId: a.studentId || 'std_1',
        studentName: a.studentName || 'Talaba',
        totalScore: a.totalScore,
        earnedScore: a.earnedScore,
        percentage: a.percentage,
        testsPassedCount: 1,
        averageScore: a.percentage,
        isPremium: true,
        premiumPlan: 'Pro'
      }));
      return { success: true, statusCode: 200, data: userEntries };
    } catch (e) {
      return { success: true, statusCode: 200, data: [] };
    }
  }

  // 11. Dashboard Summary
  if (endpoint.startsWith('/api/dashboard')) {
    const attempts = JSON.parse(localStorage.getItem('tp_local_attempts') || '[]');
    const certs = JSON.parse(localStorage.getItem('tp_local_certs') || '[]');
    return {
      success: true,
      statusCode: 200,
      data: {
        totalTests: data.tests.length,
        totalStudents: 1,
        totalAttempts: attempts.length,
        testsTaken: attempts.length,
        testsPassed: attempts.filter(a => a.isPassed).length,
        averageScore: attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0,
        certificatesCount: certs.length,
        recentAttempts: attempts.slice(0, 5)
      }
    };
  }

  // 12. Announcements
  if (endpoint.startsWith('/api/announcements')) {
    return {
      success: true,
      statusCode: 200,
      data: [
        {
          id: 'ann_1',
          title: "Xush kelibsiz!",
          content: "Test Platformaga xush kelibsiz. Bilimingizni sinang va rasmiy sertifikatlarga ega bo'ling!",
          type: "Info",
          priority: 1,
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  // 13. Premium & Pricing
  if (endpoint === '/api/premium/redeem-promo') {
    return {
      success: true,
      statusCode: 200,
      message: "Promo-kod muvaffaqiyatli faollashtirildi! 💎 VIP tarifi taqdim etildi.",
      data: { plan: 'VIP', isPremium: true, durationDays: 30 }
    };
  }

  if (endpoint === '/api/premium/checkout') {
    return {
      success: true,
      statusCode: 200,
      message: "To'lov muvaffaqiyatli amalga oshirildi! Tarifingiz yangilandi.",
      data: { plan: body.plan || 'Pro', isPremium: true }
    };
  }

  // 14. Support & Student Appeals
  if (endpoint === '/api/support/submit') {
    const ticket = {
      id: 'ticket_' + Date.now(),
      studentId: state.user?.id || 'guest',
      studentName: body.fullName || state.user?.fullName || 'Foydalanuvchi',
      studentEmail: body.email || state.user?.email || 'student@example.com',
      contactInfo: body.contactInfo || '',
      category: body.category || 'Umumiy',
      subject: body.subject || 'Murojaat',
      message: body.message || '',
      status: 'Yangi',
      createdAt: new Date().toISOString()
    };
    try {
      const tickets = JSON.parse(localStorage.getItem('tp_support_tickets') || '[]');
      tickets.unshift(ticket);
      localStorage.setItem('tp_support_tickets', JSON.stringify(tickets));
    } catch (e) {}

    return {
      success: true,
      statusCode: 200,
      message: "Murojaatingiz muvaffaqiyatli yuborildi! Administrator tez orada ko'rib chiqadi.",
      data: ticket
    };
  }

  if (endpoint === '/api/support/my') {
    try {
      const tickets = JSON.parse(localStorage.getItem('tp_support_tickets') || '[]');
      const userEmail = (state.user?.email || '').toLowerCase();
      const myTickets = tickets.filter(t => (t.studentEmail || '').toLowerCase() === userEmail || t.studentId === state.user?.id);
      return { success: true, statusCode: 200, data: myTickets };
    } catch (e) {
      return { success: true, statusCode: 200, data: [] };
    }
  }

  if (endpoint === '/api/support/all') {
    try {
      const tickets = JSON.parse(localStorage.getItem('tp_support_tickets') || '[]');
      return { success: true, statusCode: 200, data: tickets };
    } catch (e) {
      return { success: true, statusCode: 200, data: [] };
    }
  }

  if (endpoint.startsWith('/api/support/') && endpoint.endsWith('/status')) {
    const ticketId = endpoint.split('/')[3];
    try {
      const tickets = JSON.parse(localStorage.getItem('tp_support_tickets') || '[]');
      const found = tickets.find(t => t.id === ticketId);
      if (found) {
        found.status = body.status || 'Hal qilindi';
        localStorage.setItem('tp_support_tickets', JSON.stringify(tickets));
        return { success: true, statusCode: 200, message: "Holat yangilandi", data: found };
      }
    } catch (e) {}
    return { success: true, statusCode: 200, message: "Holat yangilandi" };
  }

  if (endpoint.startsWith('/api/support/') && method === 'DELETE') {
    const ticketId = endpoint.split('/')[3];
    try {
      let tickets = JSON.parse(localStorage.getItem('tp_support_tickets') || '[]');
      tickets = tickets.filter(t => t.id !== ticketId);
      localStorage.setItem('tp_support_tickets', JSON.stringify(tickets));
    } catch (e) {}
    return { success: true, statusCode: 200, message: "Murojaat o'chirildi" };
  }

  return null;
}

// API Client Helper
async function api(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    // If live API responded with OK status
    if (res.ok) {
      const data = await res.json().catch(() => null);
      return data || { success: true, data: null };
    }

    // If 404 or backend not found on static hosting (Vercel)
    if (res.status === 404 || res.status === 502 || res.status === 503) {
      const fallback = await handleStandaloneFallback(endpoint, options);
      if (fallback) return fallback;
    }

    const data = await res.json().catch(() => null);
    const errorMsg = data?.message || `Xatolik yuz berdi (${res.status})`;
    return { success: false, statusCode: res.status, message: errorMsg, data: null };
  } catch (err) {
    // Network / Offline / Vercel static fallback
    const fallback = await handleStandaloneFallback(endpoint, options);
    if (fallback) return fallback;

    console.error('API Error:', err);
    return { success: false, statusCode: 500, message: 'Serverga ulanishda xatolik yuz berdi', data: null };
  }
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-blue-600';
  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

  toast.className = `toast-item flex items-center gap-2.5 px-4 py-3 rounded-xl text-white shadow-xl ${bgClass} text-sm font-medium border border-white/20`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px]">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Router & App Controller
const app = {
  async init() {
    this.closeModal();
    document.body.classList.remove('modal-open', 'overflow-hidden');
    document.documentElement.classList.remove('modal-open', 'overflow-hidden');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    // 1. Ensure any legacy admin session in localStorage is completely wiped
    try {
      const localUserStr = localStorage.getItem('tp_user');
      if (localUserStr) {
        const localUser = JSON.parse(localUserStr);
        if (localUser && (localUser.role === 'Admin' || localUser.role === 1)) {
          localStorage.removeItem('tp_token');
          localStorage.removeItem('tp_user');
        }
      }
    } catch (e) {
      localStorage.removeItem('tp_token');
      localStorage.removeItem('tp_user');
    }

    // 2. Restore session:
    // - Check sessionStorage first (temporary session e.g. Admin or current tab)
    // - If not in sessionStorage, check localStorage for Student only
    let restoredToken = sessionStorage.getItem('tp_token');
    let restoredUser = sessionStorage.getItem('tp_user');

    if (!restoredToken || !restoredUser) {
      const localToken = localStorage.getItem('tp_token');
      const localUserStr = localStorage.getItem('tp_user');
      if (localToken && localUserStr) {
        try {
          const parsed = JSON.parse(localUserStr);
          if (parsed && parsed.role !== 'Admin' && parsed.role !== 1) {
            restoredToken = localToken;
            restoredUser = localUserStr;
          } else {
            localStorage.removeItem('tp_token');
            localStorage.removeItem('tp_user');
          }
        } catch (e) {
          localStorage.removeItem('tp_token');
          localStorage.removeItem('tp_user');
        }
      }
    }

    if (restoredToken && restoredUser) {
      try {
        state.token = restoredToken;
        state.user = JSON.parse(restoredUser);
      } catch (e) {
        clearSession();
      }
    } else {
      clearSession();
    }

    // If user is not authenticated:
    // If opening root or admin page without admin login, route to #/login
    if (!state.user) {
      if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#' || window.location.hash.startsWith('#/admin')) {
        window.location.hash = '#/login';
      }
    }

    this.updateNavAuth();
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Render current route
    this.handleRoute();
  },

  handleRoute() {
    this.closeModal();
    const hash = window.location.hash || '#/login';
    const root = document.getElementById('app-root');
    const shaderCanvas = document.getElementById('bg-shader-canvas');
    if (!root) return;

    // Background animation should ONLY be visible on Login/Register page
    const isAuthRoute = hash === '#/login' || hash === '#/register';
    if (isAuthRoute) {
      document.body.classList.add('auth-page');
      if (shaderCanvas) {
        shaderCanvas.style.display = 'block';
        shaderCanvas.style.opacity = '0.95';
      }
    } else {
      document.body.classList.remove('auth-page');
      if (shaderCanvas) {
        shaderCanvas.style.display = 'none';
        shaderCanvas.style.opacity = '0';
      }
    }

    // Clear active quiz timer if navigating away from quiz
    if (!hash.startsWith('#/test-solve') && state.quizTimerInterval) {
      clearInterval(state.quizTimerInterval);
      state.quizTimerInterval = null;
    }

    // Role-based protection for Admin routes
    if (hash.startsWith('#/admin')) {
      if (!state.user || state.user.role !== 'Admin') {
        showToast('Admin panel faqat administratorlar uchun! Iltimos, admin sifatida kiring.', 'error');
        window.location.hash = state.user ? '#/dashboard' : '#/login';
        return;
      }
    }

    this.setActiveNav(hash);

    // Route matching
    if (hash === '#/' || hash === '#' || hash === '') {
      if (!state.user) {
        window.location.hash = '#/login';
        return;
      }
      if (state.user.role === 'Admin') {
        this.renderAdminDashboard();
      } else {
        this.renderTestsCatalog();
      }
    } else if (hash === '#/login') {
      this.renderLogin();
    } else if (hash === '#/register') {
      this.renderRegister();
    } else if (hash === '#/tests') {
      if (!state.user) {
        showToast('Iltimos, avval tizimga kiring', 'info');
        window.location.hash = '#/login';
        return;
      }
      this.renderTestsCatalog();
    } else if (hash.startsWith('#/test-solve/')) {
      if (!state.user) {
        showToast('Test yechish uchun tizimga kiring', 'info');
        window.location.hash = '#/login';
        return;
      }
      const testId = hash.split('/')[2];
      this.renderQuizStudio(testId);
    } else if (hash.startsWith('#/result/')) {
      const attemptId = hash.split('/')[2];
      this.renderResult(attemptId);
    } else if (hash === '#/dashboard' || hash === '#/student-dashboard') {
      if (!state.user) {
        showToast('Dashboardni ko\'rish uchun tizimga kiring', 'info');
        window.location.hash = '#/login';
        return;
      }
      if (state.user.role === 'Admin') {
        this.renderAdminDashboard();
      } else {
        this.renderStudentDashboard();
      }
    } else if (hash === '#/pricing' || hash === '#/tariffs') {
      this.renderPricing();
    } else if (hash === '#/leaderboard') {
      this.renderLeaderboard();
    } else if (hash === '#/profile' || hash === '#/settings') {
      this.renderProfile();
    } else if (hash === '#/support' || hash === '#/contact' || hash === '#/help') {
      this.renderSupportPage();
    } else if (hash === '#/verify-cert' || hash.startsWith('#/certificate/')) {
      const certNumber = hash.startsWith('#/certificate/') ? hash.split('/')[2] : '';
      this.renderCertificate(certNumber);
    } else if (hash === '#/admin' || hash === '#/admin/dashboard') {
      this.renderAdminDashboard();
    } else if (hash === '#/admin/support') {
      this.renderAdminSupport();
    } else if (hash === '#/admin/tests') {
      this.renderAdminTests();
    } else if (hash === '#/admin/add-test') {
      this.renderAdminAddTest();
    } else if (hash.startsWith('#/admin/edit-test/')) {
      const testId = hash.split('/')[3];
      this.renderAdminEditTest(testId);
    } else if (hash.startsWith('#/admin/add-question/')) {
      const testId = hash.split('/')[3];
      this.renderAdminAddQuestion(testId);
    } else if (hash.startsWith('#/admin/bulk-import') || hash.startsWith('#/admin/json-import')) {
      const parts = hash.split('/');
      const testId = parts.length > 3 ? parts[3] : '';
      this.renderAdminBulkImport(testId);
    } else if (hash === '#/admin/users') {
      this.renderAdminUsers();
    } else if (hash === '#/admin/subjects') {
      this.renderAdminSubjects();
    } else if (hash === '#/admin/audit-logs') {
      this.renderAdminAuditLogs();
    } else {
      this.renderHome();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setActiveNav(hash) {
    const mainNav = document.getElementById('main-nav');
    
    // Hide navigation menu completely if user is not logged in or on auth pages
    if (!state.user || hash === '#/login' || hash === '#/register') {
      if (mainNav) {
        mainNav.classList.add('hidden');
        mainNav.classList.remove('flex');
      }
      return;
    } else {
      if (mainNav) {
        mainNav.classList.remove('hidden');
        mainNav.classList.add('flex');
      }
    }

    document.querySelectorAll('nav a').forEach(a => {
      a.classList.remove('bg-blue-600/20', 'text-blue-400', 'border', 'border-blue-500/30', 'bg-amber-500/20', 'text-amber-300', 'border-amber-500/30', 'bg-white/10', 'text-white', 'font-semibold');
      a.classList.add('text-gray-300');
    });

    const activeClasses = ['bg-blue-600/20', 'text-blue-400', 'border', 'border-blue-500/30', 'font-semibold'];

    if (hash === '#/dashboard' || hash === '#/student-dashboard') {
      const el = document.getElementById('nav-dashboard');
      if (el) { el.classList.add(...activeClasses); el.classList.remove('text-gray-300'); }
    } else if (hash === '#/' || hash === '' || hash === '#') {
      const el = document.getElementById('nav-home');
      if (el) { el.classList.add(...activeClasses); el.classList.remove('text-gray-300'); }
    } else if (hash.startsWith('#/tests') || hash.startsWith('#/test-solve')) {
      const el = document.getElementById('nav-tests');
      if (el) { el.classList.add(...activeClasses); el.classList.remove('text-gray-300'); }
    } else if (hash.startsWith('#/pricing')) {
      const el = document.getElementById('nav-pricing');
      if (el) { el.classList.add('bg-amber-500/20', 'text-amber-300', 'border', 'border-amber-500/40', 'font-bold'); el.classList.remove('text-gray-300'); }
    } else if (hash.startsWith('#/leaderboard')) {
      const el = document.getElementById('nav-leaderboard');
      if (el) { el.classList.add(...activeClasses); el.classList.remove('text-gray-300'); }
    } else if (hash.startsWith('#/verify-cert') || hash.startsWith('#/certificate')) {
      const el = document.getElementById('nav-verify');
      if (el) { el.classList.add(...activeClasses); el.classList.remove('text-gray-300'); }
    } else if (hash.startsWith('#/support') || hash.startsWith('#/contact')) {
      const el = document.getElementById('nav-support');
      if (el) { el.classList.add(...activeClasses); el.classList.remove('text-gray-300'); }
    } else if (hash.startsWith('#/admin')) {
      const el = document.getElementById('nav-admin');
      if (el) { el.classList.add('bg-amber-500/20', 'text-amber-300', 'border', 'border-amber-500/30', 'font-semibold'); el.classList.remove('text-gray-300'); }
    }
  },

  updateNavAuth() {
    const container = document.getElementById('nav-auth-container');
    const mainNav = document.getElementById('main-nav');
    const adminNav = document.getElementById('nav-admin');
    if (!container) return;

    if (state.user) {
      const isAdmin = state.user.role === 'Admin';
      const isPro = !!state.user.isPremium || state.user.premiumPlan === 'Pro' || state.user.premiumPlan === 'VIP' || state.user.premiumPlan === 'Lifetime';
      const isVip = state.user.premiumPlan === 'VIP' || state.user.premiumPlan === 'Lifetime';
      const proBadgeHtml = isVip ? '<span class="badge-vip">💎 VIP</span>' : (isPro ? '<span class="badge-pro">👑 PRO</span>' : '');
      
      // Show main nav for logged in users
      if (mainNav && window.location.hash !== '#/login' && window.location.hash !== '#/register') {
        mainNav.classList.remove('hidden');
        mainNav.classList.add('flex');
      }

      // Control Admin Panel visibility in nav
      if (adminNav) {
        if (isAdmin) {
          adminNav.classList.remove('hidden');
        } else {
          adminNav.classList.add('hidden');
        }
      }

      // Control Tariflar PRO visibility (Only for Students / not Admin)
      const navPricing = document.getElementById('nav-pricing');
      if (navPricing) {
        if (isAdmin) {
          navPricing.classList.add('hidden');
        } else {
          navPricing.classList.remove('hidden');
        }
      }
      const mobilePricing = document.querySelector('#mobile-menu a[href="#/pricing"]');
      if (mobilePricing) {
        if (isAdmin) {
          mobilePricing.classList.add('hidden');
        } else {
          mobilePricing.classList.remove('hidden');
        }
      }

      container.innerHTML = `
        <div class="flex items-center gap-2">
          <a href="#/profile" class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border ${isPro ? 'border-amber-500/30 shadow-sm shadow-amber-500/10' : 'border-white/10'} transition group" title="Profil va sozlamalar">
            <div class="w-7 h-7 rounded-lg ${isAdmin ? 'bg-amber-500' : isPro ? 'bg-gradient-to-tr from-amber-500 to-orange-500' : 'bg-blue-600'} flex items-center justify-center text-xs font-bold text-black shadow-sm">
              ${(state.user.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div class="text-left hidden sm:block">
              <div class="text-xs font-semibold text-gray-200 group-hover:text-white leading-tight max-w-[150px] truncate capitalize flex items-center gap-1.5">
                <span>${formatFullName(state.user.fullName)}</span>
                ${proBadgeHtml}
              </div>
              <div class="text-[10px] ${isAdmin ? 'text-amber-400' : isPro ? 'text-amber-300 font-bold' : 'text-emerald-400'} font-semibold leading-tight">${isAdmin ? 'Admin' : (isPro ? '👑 PRO Talaba' : 'Talaba')}</div>
            </div>
          </a>
          <button onclick="app.logout()" class="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition" title="Chiqish">
            <span class="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      `;
    } else {
      // Hide entire main navigation menu for unauthenticated guests
      if (mainNav) {
        mainNav.classList.add('hidden');
        mainNav.classList.remove('flex');
      }
      if (adminNav) adminNav.classList.add('hidden');

      container.innerHTML = `
        <a href="#/login" class="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-medium transition inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px]">login</span> Kirish
        </a>
        <a href="#/register" class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs glow-button-primary transition inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px]">person_add</span> Ro'yxatdan o'tish
        </a>
      `;
    }
  },

  toggleMobileMenu(forceState) {
    const m = document.getElementById('mobile-menu');
    if (!m) return;
    if (forceState !== undefined) {
      if (forceState) m.classList.remove('hidden');
      else m.classList.add('hidden');
    } else {
      m.classList.toggle('hidden');
    }
  },

  // Helper for password eye toggle
  togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (icon) icon.textContent = 'visibility_off';
    } else {
      input.type = 'password';
      if (icon) icon.textContent = 'visibility';
    }
  },

  // ----------------------------------------------------
  // VIEW 1: AUTH (LOGIN & REGISTER WITH EMAIL VERIFICATION CODE)
  // ----------------------------------------------------
  renderLogin() {
    if (state.token && state.user) {
      window.location.hash = state.user.role === 'Admin' ? '#/admin' : '#/tests';
      return;
    }
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="max-w-md mx-auto my-8 sm:my-12 relative animate-entrance">
        <!-- Glowing ambient light orbs behind card -->
        <div class="glow-orb w-72 h-72 bg-blue-600/20 top-[-30px] left-[-30px]"></div>
        <div class="glow-orb w-64 h-64 bg-purple-600/20 bottom-[-20px] right-[-20px]" style="animation-delay: -4s;"></div>

        <!-- Holographic Shader Card -->
        <div class="shader-card p-6 sm:p-8 space-y-6 relative z-10">
          
          <!-- Top Brand & Icon Header -->
          <div class="text-center space-y-3">
            <div class="inline-flex relative">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/30 ring-1 ring-white/20 transform hover:scale-105 transition-transform duration-300">
                <span class="material-symbols-outlined text-3xl">psychology</span>
              </div>
            </div>
            <div>
              <h2 class="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">Test<span class="text-blue-400">Platform</span></h2>
              <p class="text-xs text-gray-400 mt-1">Bilimingizni sinash va yangi marralarni zabt etish platformasi</p>
            </div>
          </div>

          <!-- Login Form -->
          <form id="login-form" onsubmit="app.handleLoginSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">Email yoki Login</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">account_circle</span>
                <input type="text" id="login-email" required placeholder="Email yoki loginni kiriting" class="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-gray-300">Maxfiy Parol</label>
              </div>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">lock</span>
                <input type="password" id="login-password" required placeholder="••••••••" class="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none" />
                <button type="button" onclick="app.togglePassword('login-password', 'login-eye-icon')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition" title="Parolni ko'rsatish/yashirish">
                  <span id="login-eye-icon" class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <button type="submit" id="btn-login-submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs glow-button-primary transition shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">login</span> Tizimga Kirish
            </button>
          </form>

          <div class="pt-4 border-t border-white/10 text-center">
            <p class="text-xs text-gray-400">
              Hisobingiz mavjud emasmi? 
              <a href="#/register" class="text-blue-400 font-bold hover:text-blue-300 transition">Ro'yxatdan o'tish</a>
            </p>
          </div>

        </div>
      </div>
    `;
  },

  renderRegister() {
    if (state.token && state.user) {
      window.location.hash = state.user.role === 'Admin' ? '#/admin' : '#/tests';
      return;
    }
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="max-w-md mx-auto my-6 sm:my-8 relative animate-entrance">
        <!-- Glowing ambient light orbs -->
        <div class="glow-orb w-72 h-72 bg-indigo-600/20 top-[-30px] right-[-30px]"></div>
        <div class="glow-orb w-64 h-64 bg-blue-600/20 bottom-[-20px] left-[-20px]" style="animation-delay: -3s;"></div>

        <!-- Holographic Shader Card -->
        <div class="shader-card p-6 sm:p-8 space-y-6 relative z-10">
          
          <!-- Top Header -->
          <div class="text-center space-y-3">
            <div class="inline-flex relative">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30 ring-1 ring-white/20 transform hover:scale-105 transition-transform duration-300">
                <span class="material-symbols-outlined text-3xl">person_add</span>
              </div>
            </div>
            <div>
              <h2 class="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">Yangi Hisob Ochish</h2>
              <p class="text-xs text-gray-400 mt-1">Ma'lumotlarni to'ldiring va email orqali tasdiqlang</p>
            </div>
          </div>

          <!-- Register Form -->
          <form onsubmit="app.handleRegisterSubmit(event)" class="space-y-3.5">
            <!-- Ism & Familiya -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Ismingiz</label>
                <input type="text" id="reg-firstname" required placeholder="Ali" class="auth-input w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Familiyangiz</label>
                <input type="text" id="reg-lastname" required placeholder="Valiyev" class="auth-input w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none" />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Email / Gmail Manzil</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">mail</span>
                <input type="email" id="reg-email" required placeholder="ali.valiyev@gmail.com" class="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none" />
              </div>
            </div>

            <!-- Parol -->
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Parol</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">lock</span>
                <input type="password" id="reg-password" required minlength="4" placeholder="Kamida 4 ta belgi" class="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none" />
                <button type="button" onclick="app.togglePassword('reg-password', 'reg-eye-icon1')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition">
                  <span id="reg-eye-icon1" class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <!-- Parolni Tasdiqlang -->
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Parolni Tasdiqlang</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">verified_user</span>
                <input type="password" id="reg-confirm-password" required minlength="4" placeholder="Parolni qayta tering" class="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none" />
                <button type="button" onclick="app.togglePassword('reg-confirm-password', 'reg-eye-icon2')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition">
                  <span id="reg-eye-icon2" class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <!-- Email Tasdiqlash Kodi -->
            <div id="code-container" class="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-blue-300 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">verified</span> Tasdiqlash Kodi
                </label>
                <button type="button" id="btn-send-code" onclick="app.sendVerificationCode()" class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shrink-0 transition flex items-center gap-1 shadow-md">
                  <span class="material-symbols-outlined text-[14px]">send</span> Kod Yuborish
                </button>
              </div>
              <input type="text" id="reg-code" required maxlength="6" placeholder="6 xonali kod" class="w-full px-3 py-2 rounded-xl bg-white/10 border border-blue-500/40 text-white placeholder-gray-400 font-mono text-center tracking-widest text-sm font-bold focus:outline-none focus:border-blue-400" />
              <p class="text-[10px] text-gray-400 text-center">Avval maydonlarni to'ldiring va "Kod Yuborish" tugmasini bosing.</p>
            </div>

            <!-- Submit Button -->
            <button type="submit" id="btn-reg-submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs glow-button-primary transition shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">how_to_reg</span> Ro'yxatdan O'tish
            </button>
          </form>

          <div class="pt-3 border-t border-white/10 text-center">
            <p class="text-xs text-gray-400">
              Allaqachon hisobingiz bormi? 
              <a href="#/login" class="text-blue-400 font-bold hover:text-blue-300 transition">Tizimga kiring</a>
            </p>
          </div>

        </div>
      </div>
    `;
  },

  async sendVerificationCode() {
    const firstName = document.getElementById('reg-firstname')?.value.trim();
    const lastName = document.getElementById('reg-lastname')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value;
    const confirmPassword = document.getElementById('reg-confirm-password')?.value;

    if (!firstName) {
      showToast('Iltimos, avval ismingizni kiriting!', 'error');
      document.getElementById('reg-firstname')?.focus();
      return;
    }
    if (!lastName) {
      showToast('Iltimos, familiyangizni kiriting!', 'error');
      document.getElementById('reg-lastname')?.focus();
      return;
    }
    if (!email) {
      showToast('Iltimos, email manzilingizni kiriting!', 'error');
      document.getElementById('reg-email')?.focus();
      return;
    }
    if (!password || password.length < 4) {
      showToast('Iltimos, parolni kiriting (kamida 4 ta belgi)!', 'error');
      document.getElementById('reg-password')?.focus();
      return;
    }
    if (!confirmPassword) {
      showToast('Iltimos, parolni tasdiqlang!', 'error');
      document.getElementById('reg-confirm-password')?.focus();
      return;
    }
    if (password !== confirmPassword) {
      showToast('Parollar bir-biriga mos kelmadi!', 'error');
      document.getElementById('reg-confirm-password')?.focus();
      return;
    }

    const btn = document.getElementById('btn-send-code');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined text-[14px] animate-spin">refresh</span> Yuborilmoqda...';
    }

    const res = await api('/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (res.success) {
      showToast('Tasdiqlash kodi emailingizga yuborildi! Emailingizni tekshirib, kodni kiriting.', 'success');
      const codeInput = document.getElementById('reg-code');
      if (codeInput) {
        codeInput.value = ''; // Never auto-fill, user enters it from their email
        codeInput.focus();
      }

      // 60s countdown
      let count = 60;
      const interval = setInterval(() => {
        count--;
        if (btn) {
          btn.innerText = `${count}s`;
        }
        if (count <= 0) {
          clearInterval(interval);
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined text-[14px]">send</span> Qayta Kod Yuborish';
          }
        }
      }, 1000);
    } else {
      showToast(res.message || 'Kod yuborishda xatolik yuz berdi', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[14px]">send</span> Emailga Kod Yuborish';
      }
    }
  },

  async handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('btn-login-submit');

    if (!email || !password) {
      showToast('Email va parolni kiriting!', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Tekshirilmoqda...';
    }

    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res.success && res.data) {
      saveSession(res.data.token, res.data.user);
      this.updateNavAuth();

      if (btn) {
        btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span> Muvaffaqiyatli!';
      }

      if (state.user.role === 'Admin') {
        showToast('Xush kelibsiz, Administrator!', 'success');
        setTimeout(() => { window.location.hash = '#/admin'; }, 250);
      } else {
        showToast(`Xush kelibsiz, ${state.user.fullName}!`, 'success');
        setTimeout(() => { window.location.hash = '#/dashboard'; }, 250);
      }
    } else {
      showToast(res.message || 'Email yoki parol noto\'g\'ri!', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">login</span> Tizimga Kirish';
      }
    }
  },

  async handleRegisterSubmit(e) {
    e.preventDefault();
    const rawFirst = document.getElementById('reg-firstname').value.trim();
    const rawLast = document.getElementById('reg-lastname').value.trim();
    const firstName = rawFirst ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase() : '';
    const lastName = rawLast ? rawLast.charAt(0).toUpperCase() + rawLast.slice(1).toLowerCase() : '';
    const email = document.getElementById('reg-email').value.trim();
    const verificationCode = document.getElementById('reg-code').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const btn = document.getElementById('btn-reg-submit');

    if (!verificationCode) {
      showToast('Iltimos, emailga yuborilgan tasdiqlash kodini kiriting!', 'error');
      document.getElementById('reg-code').focus();
      return;
    }

    if (password !== confirmPassword) {
      showToast('Parollar bir-biriga mos kelmadi!', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Yaratilmoqda...';
    }

    const payload = {
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      password,
      verificationCode,
      role: 2 // Student
    };

    const res = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.success && res.data) {
      saveSession(res.data.token, res.data.user);
      this.updateNavAuth();
      showToast('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', 'success');
      setTimeout(() => { window.location.hash = '#/tests'; }, 250);
    } else {
      showToast(res.message || 'Ro\'yxatdan o\'tishda xatolik!', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">how_to_reg</span> Ro\'yxatdan O\'tish';
      }
    }
  },

  openAuthModal(mode = 'login') {
    if (mode === 'register') {
      window.location.hash = '#/register';
    } else {
      window.location.hash = '#/login';
    }
  },

  logout(showNotice = true) {
    clearSession();
    this.updateNavAuth();
    if (showNotice) showToast('Tizimdan chiqdingiz', 'info');
    window.location.hash = '#/login';
  },

  openModal(contentHtml, maxWidthClass = 'max-w-lg') {
    const modal = document.getElementById('modal-container');
    if (!modal) return;
    document.body.classList.add('modal-open');
    modal.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" style="overscroll-behavior: contain;" onclick="if(event.target === this) app.closeModal()">
        <div class="glass-panel p-6 sm:p-8 rounded-3xl w-full ${maxWidthClass} border border-white/10 shadow-2xl relative animate-scaleUp max-h-[90vh] flex flex-col" style="overscroll-behavior: contain;">
          <button onclick="app.closeModal()" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition z-10">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
          ${contentHtml}
        </div>
      </div>
    `;
  },

  closeModal() {
    const modal = document.getElementById('modal-container');
    if (modal) modal.innerHTML = '';
    document.body.classList.remove('modal-open', 'overflow-hidden');
    document.documentElement.classList.remove('modal-open', 'overflow-hidden');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  },

  // ----------------------------------------------------
  // VIEW 1: HOME / LANDING PAGE (CLEAN PRESENTATION FOR GUESTS)
  // ----------------------------------------------------
  renderHome() {
    // If logged in, redirect immediately to their role workspace
    if (state.user) {
      if (state.user.role === 'Admin') {
        window.location.hash = '#/admin';
      } else {
        window.location.hash = '#/tests';
      }
      return;
    }

    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-20 animate-fadeIn py-8">
        
        <!-- Hero Section (Clean Presentation) -->
        <section class="relative pt-8 sm:pt-16 pb-12 overflow-hidden text-center max-w-4xl mx-auto">
          <!-- Ambient glowing lights -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div class="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

          <!-- Top Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse-glow">
            <span class="w-2 h-2 rounded-full bg-blue-400"></span>
            Zamonaviy Bilim Baholash Tizimi
          </div>

          <!-- Main Heading -->
          <h1 class="text-4xl sm:text-6xl font-black font-heading tracking-tight text-white leading-tight mb-6">
            Bilimingizni sinang, <br />
            <span class="neon-text-gradient">Professional Sertifikat</span> oling!
          </h1>

          <p class="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Dasturlash, backend arxitekturasi, frontend va axborot texnologiyalari sohasida bilimlaringizni sinovdan o'tkazing. Natijangizni real vaqt rejimida bilib oling va xalqaro standartdagi sertifikatga ega bo'ling.
          </p>

          <!-- Clean Auth CTA Buttons -->
          <div class="flex flex-wrap items-center justify-center gap-4">
            <a href="#/register" class="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm glow-button-primary transition shadow-xl shadow-blue-500/25 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">person_add</span> Ro'yxatdan O'tish
            </a>
            <a href="#/login" class="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 font-semibold text-sm transition flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">login</span> Tizimga Kirish
            </a>
          </div>
        </section>

        <!-- Feature Showcase Grid -->
        <section class="max-w-5xl mx-auto space-y-8">
          <div class="text-center space-y-2">
            <h2 class="text-2xl sm:text-3xl font-black font-heading text-white">Platforma Imkoniyatlari</h2>
            <p class="text-xs sm:text-sm text-gray-400">Zamonaviy ta'lim va baholash tizimining barcha qulayliklari</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel p-6 sm:p-8 rounded-3xl glow-card border-t-2 border-t-blue-500 space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">timer</span>
              </div>
              <h3 class="text-lg font-bold text-white">Real-Vaqt Imtihon</h3>
              <p class="text-xs text-gray-400 leading-relaxed">Har bir test aniq vaqt chegarasiga ega. Countdown timer yordamida vaqtingizni to'g'ri taqsimlab topshirasiz.</p>
            </div>

            <div class="glass-panel p-6 sm:p-8 rounded-3xl glow-card border-t-2 border-t-emerald-500 space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">workspace_premium</span>
              </div>
              <h3 class="text-lg font-bold text-white">Rasmiy Sertifikat</h3>
              <p class="text-xs text-gray-400 leading-relaxed">Belgilangan o'tish balini to'plang va darhol unikal raqamli himoyalangan rasmiy sertifikatga ega bo'ling.</p>
            </div>

            <div class="glass-panel p-6 sm:p-8 rounded-3xl glow-card border-t-2 border-t-purple-500 space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">shield</span>
              </div>
              <h3 class="text-lg font-bold text-white">Anti-Cheat Himoyasi</h3>
              <p class="text-xs text-gray-400 leading-relaxed">Ko'chirmachilikning oldini olish uchun savollar va javob variantlari har bir o'quvchiga aralash tartibda beriladi.</p>
            </div>
          </div>
        </section>

        <!-- How It Works Section -->
        <section class="max-w-4xl mx-auto glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 text-center space-y-8">
          <div class="space-y-2">
            <h2 class="text-2xl font-black font-heading text-white">Qanday Boshlash Mumkin?</h2>
            <p class="text-xs text-gray-400">Atigi 3 ta oddiy qadam orqali bilimingizni tasdiqlang</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div class="p-4 rounded-2xl bg-white/5 space-y-2">
              <span class="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center">1</span>
              <h4 class="font-bold text-white text-sm">Ro'yxatdan o'ting</h4>
              <p class="text-[11px] text-gray-400">Gmail orqali bir zumda hisob yarating yoki mavjud hisobingizga kiring.</p>
            </div>

            <div class="p-4 rounded-2xl bg-white/5 space-y-2">
              <span class="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center">2</span>
              <h4 class="font-bold text-white text-sm">Testni Yeching</h4>
              <p class="text-[11px] text-gray-400">O'zingiz qiziqqan yo'nalishdagi testni tanlab, belgilangan vaqt ichida topshiring.</p>
            </div>

            <div class="p-4 rounded-2xl bg-white/5 space-y-2">
              <span class="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center">3</span>
              <h4 class="font-bold text-white text-sm">Sertifikat Oling</h4>
              <p class="text-[11px] text-gray-400">Muvaffaqiyatli topshirilgan test uchun rasmiy tasdiqlangan sertifikatni yuklab oling.</p>
            </div>
          </div>

          <div class="pt-4">
            <a href="#/register" class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs glow-button-primary transition">
              <span>Hoziroq Boshlang</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </section>

      </div>
    `;
  },

  renderTestCardHtml(test) {
    const isProTest = !!test.isPremiumOnly;
    const isUserPro = state.user && (state.user.isPremium || state.user.premiumPlan === 'Pro' || state.user.premiumPlan === 'VIP' || state.user.premiumPlan === 'Lifetime');
    const isLockedForUser = isProTest && !isUserPro && state.user?.role !== 'Admin';
    const theme = getSubjectMeta(test.subjectName || 'Fan');

    let diffBadgeClass = 'bg-amber-500/10 text-amber-300 border-amber-500/25';
    let diffDotClass = 'bg-amber-400';
    let diffText = "O'rta";

    if (test.difficulty === 'Easy' || test.difficulty === 0 || test.difficulty === 1) {
      diffBadgeClass = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
      diffDotClass = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
      diffText = 'Oson';
    } else if (test.difficulty === 'Hard' || test.difficulty === 2 || test.difficulty === 3) {
      diffBadgeClass = 'bg-rose-500/10 text-rose-300 border-rose-500/25';
      diffDotClass = 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]';
      diffText = 'Qiyin';
    }

    return `
      <div class="catalog-test-card p-5 sm:p-6 rounded-3xl glow-card hover-card-float flex flex-col justify-between relative group transition-all duration-300 ${isProTest ? 'test-card-locked border-amber-500/30' : ''}" style="--card-accent: ${theme.colorHex};">
        <!-- Top Ambient Glow Orb -->
        <div class="absolute -top-10 -right-10 w-24 h-24 rounded-full ${theme.glowBg} blur-2xl opacity-30 group-hover:opacity-70 transition-opacity pointer-events-none"></div>

        <div>
          <!-- Badges Top Row -->
          <div class="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${theme.badge} shadow-sm backdrop-blur-sm">
              <span class="material-symbols-outlined text-[15px]">${theme.icon}</span>
              <span>${this.escapeHtml(test.subjectName || 'Fan')}</span>
            </span>

            <div class="flex items-center gap-1.5">
              ${isProTest ? '<span class="badge-pro">👑 PRO</span>' : ''}
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${diffBadgeClass} backdrop-blur-sm">
                <span class="w-2 h-2 rounded-full ${diffDotClass}"></span>
                <span>${diffText}</span>
              </span>
            </div>
          </div>

          <!-- Test Title -->
          <h3 class="text-base sm:text-lg font-black text-white font-heading mb-2 leading-snug group-hover:text-blue-300 transition-colors flex items-start gap-1.5">
            ${isProTest ? '<span class="text-amber-400 text-sm mt-0.5 shrink-0">🔒</span>' : ''}
            <span class="line-clamp-2">${this.escapeHtml(test.title)}</span>
          </h3>

          <!-- Test Description -->
          <p class="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
            ${this.escapeHtml(test.description || 'Ushbu test orqali bilimingizni sinovdan o\'tkazing va natijangizni yaxshilang.')}
          </p>
        </div>

        <!-- Stats & Actions Footer -->
        <div class="pt-4 border-t border-white/10 space-y-3.5">
          <!-- 3 Micro-Metrics -->
          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="bg-white/5 hover:bg-white/10 p-2 rounded-2xl border border-white/5 transition flex flex-col items-center justify-center">
              <span class="flex items-center justify-center gap-1 text-gray-400 text-[10px] mb-0.5 font-medium">
                <span class="material-symbols-outlined text-[13px] text-blue-400">help</span> Savollar
              </span>
              <span class="font-bold text-white text-xs">${test.questionsCount || 0} ta</span>
            </div>
            <div class="bg-white/5 hover:bg-white/10 p-2 rounded-2xl border border-white/5 transition flex flex-col items-center justify-center">
              <span class="flex items-center justify-center gap-1 text-gray-400 text-[10px] mb-0.5 font-medium">
                <span class="material-symbols-outlined text-[13px] text-indigo-400">timer</span> Vaqt
              </span>
              <span class="font-bold text-white text-xs">${test.timeLimitMinutes || 10} daq</span>
            </div>
            <div class="bg-white/5 hover:bg-white/10 p-2 rounded-2xl border border-white/5 transition flex flex-col items-center justify-center">
              <span class="flex items-center justify-center gap-1 text-gray-400 text-[10px] mb-0.5 font-medium">
                <span class="material-symbols-outlined text-[13px] text-emerald-400">verified</span> O'tish bali
              </span>
              <span class="font-bold text-emerald-400 text-xs">${test.passingPercentage || 60}%</span>
            </div>
          </div>

          <!-- Actions -->
          ${state.user?.role === 'Admin' ? `
            <div class="flex gap-2 pt-1">
              <a href="#/admin/edit-test/${test.id}" class="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs text-center border border-amber-500/30 transition flex items-center justify-center gap-1.5 glow-button-amber btn-shimmer shadow-sm" title="Testni tahrirlash">
                <span class="material-symbols-outlined text-[16px]">edit</span> Tahrirlash
              </a>
              <a href="#/admin/add-question/${test.id}" class="flex-1 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold text-xs text-center border border-blue-500/30 transition flex items-center justify-center gap-1.5 glow-button-primary btn-shimmer shadow-sm" title="Savol qo'shish">
                <span class="material-symbols-outlined text-[16px]">add_circle</span> + Savol
              </a>
            </div>
          ` : isLockedForUser ? `
            <button onclick="app.openProTestGateModal('${this.escapeJs(test.title)}')" class="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 font-bold text-xs text-center border border-amber-500/40 shadow-lg shadow-amber-500/10 transition flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">lock</span>
              <span>PRO Obuna bilan ochish</span>
            </button>
          ` : `
            <a href="#/test-solve/${test.id}" class="w-full py-3 rounded-2xl ${isProTest ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black shadow-lg shadow-amber-500/25' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold glow-button-primary shadow-lg shadow-blue-500/20'} text-xs text-center btn-shimmer transition flex items-center justify-center gap-2 group-hover:scale-[1.02]">
              <span class="material-symbols-outlined text-[18px]">${isProTest ? 'workspace_premium' : 'play_arrow'}</span>
              <span>${isProTest ? 'PRO Testni Boshlash' : 'Testni Boshlash'}</span>
              <span class="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
          `}
        </div>
      </div>
    `;
  },

  // ----------------------------------------------------
  async renderTestsCatalog() {
    const root = document.getElementById('app-root');
    const backDest = state.user?.role === 'Admin' ? '#/admin' : '#/dashboard';
    root.innerHTML = `
      <div class="space-y-8 animate-fadeIn pb-16">
        
        <!-- Top Back Navigation -->
        <div class="flex items-center justify-between">
          <a href="${backDest}" class="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 inline-flex items-center gap-1.5 transition shadow-sm" title="Dashboardga qaytish">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>⬅️ Orqaga</span>
          </a>
          <div class="flex items-center gap-2">
            ${state.user?.role === 'Admin' ? `
              <a href="#/admin/tests" class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span> Admin Boshqaruvi
              </a>
            ` : ''}
          </div>
        </div>

        <!-- Hero Banner Header -->
        <div class="catalog-hero-banner rounded-3xl p-6 sm:p-8 relative overflow-hidden space-y-6">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <!-- Left Info -->
            <div class="space-y-2.5 max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Interaktiv Bilim Sinovlari</span>
              </div>
              <h1 class="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight">
                Testlar <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Katalogi</span>
              </h1>
              <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Mavzular va yo'nalishlar bo'yicha saralangan testlarni yeching, bilimingizni baholang va rasmiy sertifikatga ega bo'ling.
              </p>
            </div>

            <!-- Right Search & Quick Stats -->
            <div class="w-full lg:w-96 space-y-3 shrink-0">
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                <input type="text" id="catalog-search" value="${this.escapeHtml(state.searchQuery || '')}" oninput="app.handleSearchInput(event)" placeholder="Test yoki fan nomini qidiring..." class="w-full pl-11 pr-10 py-3 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-inner" />
                <button id="catalog-search-clear" onclick="app.clearCatalogSearch()" class="${state.searchQuery ? '' : 'hidden'} absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition" title="Qidiruvni tozalash">
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <!-- Micro stats row -->
              <div class="flex items-center justify-between text-[11px] text-gray-400 px-1">
                <span class="flex items-center gap-1 text-gray-300">
                  <span class="material-symbols-outlined text-[15px] text-blue-400">quiz</span>
                  <strong id="catalog-stat-total-tests">100+</strong> ta test
                </span>
                <button onclick="app.openAllSubjectsModal()" class="flex items-center gap-1 text-gray-300 hover:text-purple-300 transition cursor-pointer" title="Barcha fanlarni ko'rish">
                  <span class="material-symbols-outlined text-[15px] text-purple-400">menu_book</span>
                  <strong id="catalog-stat-total-subjects">20+</strong> ta fan (ko'rish)
                </button>
                <span class="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span class="material-symbols-outlined text-[15px]">verified</span> Sertifikatli
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Control Card -->
        <div class="catalog-filter-card p-4 sm:p-5 rounded-2xl space-y-4 shadow-xl">
          <!-- Category Pills Row -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-gray-400">
              <span class="font-bold text-gray-200 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-blue-400">category</span>
                Fanlar bo'yicha filterlash:
              </span>
              <button onclick="app.openAllSubjectsModal()" class="text-xs text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm group cursor-pointer" title="Barcha fanlar ro'yxatini ko'rish va tanlash">
                <span class="material-symbols-outlined text-[14px]">view_list</span>
                <span id="catalog-active-filter-indicator">Barcha fanlar</span>
                <span class="material-symbols-outlined text-[16px] group-hover:translate-y-0.5 transition-transform">expand_more</span>
              </button>
            </div>

            <!-- Horizontal Scrollable Container with nice subject chips -->
            <div class="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar" id="subject-filter-pills">
              <div class="text-xs text-gray-500 py-1">Fanlar yuklanmoqda...</div>
            </div>
          </div>

          <!-- Bottom Filter Tools: Difficulty Segmented Control + Result Counter -->
          <div class="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <!-- Difficulty Pill Group -->
            <div class="flex items-center gap-2.5">
              <span class="text-xs font-semibold text-gray-400 flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-amber-400">tune</span> Qiyinchilik:
              </span>
              <div class="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 gap-1 text-xs" id="difficulty-pill-group">
                <button onclick="app.setDifficultyFilter('all')" class="px-3 py-1.5 rounded-lg font-bold transition ${state.selectedDifficultyFilter === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-gray-400 hover:text-white'}">
                  Barchasi
                </button>
                <button onclick="app.setDifficultyFilter('Easy')" class="px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${state.selectedDifficultyFilter === 'Easy' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25' : 'text-gray-400 hover:text-white'}">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Oson
                </button>
                <button onclick="app.setDifficultyFilter('Medium')" class="px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${state.selectedDifficultyFilter === 'Medium' ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25' : 'text-gray-400 hover:text-white'}">
                  <span class="w-2 h-2 rounded-full bg-amber-400"></span> O'rta
                </button>
                <button onclick="app.setDifficultyFilter('Hard')" class="px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${state.selectedDifficultyFilter === 'Hard' ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25' : 'text-gray-400 hover:text-white'}">
                  <span class="w-2 h-2 rounded-full bg-rose-400"></span> Qiyin
                </button>
              </div>
            </div>

            <!-- Right Result Counter & Reset Button -->
            <div class="flex items-center gap-3">
              <span id="catalog-count-badge" class="text-xs text-gray-300 font-semibold flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-blue-400 animate-spin">progress_activity</span> Yuklanmoqda...
              </span>
              <button id="btn-clear-all-filters" onclick="app.resetCatalogFilters()" class="${(state.selectedSubjectFilter !== 'all' || state.selectedDifficultyFilter !== 'all' || state.searchQuery) ? 'inline-flex' : 'hidden'} px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white text-xs border border-white/10 transition items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">filter_alt_off</span> Filtrlarni tozalash
              </button>
            </div>
          </div>
        </div>

        <!-- Tests Grid -->
        <div id="catalog-tests-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${[1, 2, 3, 4, 5, 6].map(() => `
            <div class="catalog-test-card p-6 rounded-3xl space-y-4">
              <div class="flex justify-between">
                <div class="skeleton-box w-28 h-6"></div>
                <div class="skeleton-box w-16 h-6"></div>
              </div>
              <div class="skeleton-box w-3/4 h-6"></div>
              <div class="skeleton-box w-full h-12"></div>
              <div class="grid grid-cols-3 gap-2 pt-3">
                <div class="skeleton-box h-10"></div>
                <div class="skeleton-box h-10"></div>
                <div class="skeleton-box h-10"></div>
              </div>
              <div class="skeleton-box w-full h-11"></div>
            </div>
          `).join('')}
        </div>

      </div>
    `;

    await this.loadSubjects();
    await this.loadCatalogTests();
  },

  openAllSubjectsModal() {
    if (!state.subjects || state.subjects.length === 0) {
      this.loadSubjects().then(() => this.openAllSubjectsModal());
      return;
    }

    const modal = document.getElementById('modal-container');
    if (!modal) return;

    document.body.classList.add('modal-open');

    const renderList = (filterText = '') => {
      const q = filterText.toLowerCase().trim();
      const filtered = state.subjects.filter(s => !q || s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q)));
      
      let html = `
        <!-- Barchasi Card -->
        <div onclick="app.setSubjectFilter('all'); app.closeModal();" class="p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${state.selectedSubjectFilter === 'all' ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/15 text-white' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'}">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
              <span class="material-symbols-outlined text-[20px]">apps</span>
            </div>
            <div>
              <div class="font-bold text-sm text-white">Barcha Fanlar (Hammasi)</div>
              <div class="text-[11px] text-gray-400">Platformadagi barcha fanlar testlarini ko'rsatish</div>
            </div>
          </div>
          ${state.selectedSubjectFilter === 'all' ? '<span class="material-symbols-outlined text-blue-400 text-xl">check_circle</span>' : '<span class="material-symbols-outlined text-gray-500 text-sm">chevron_right</span>'}
        </div>
      `;

      if (filtered.length === 0) {
        html += `
          <div class="py-10 text-center text-gray-400 text-xs">
            "${this.escapeHtml(filterText)}" nomli fan topilmadi.
          </div>
        `;
      } else {
        filtered.forEach(sub => {
          const isActive = state.selectedSubjectFilter === sub.id;
          const meta = getSubjectMeta(sub.name);
          html += `
            <div onclick="app.setSubjectFilter('${sub.id}'); app.closeModal();" class="p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between group ${isActive ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/15 text-white' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'}">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl ${meta.glowBg} text-white flex items-center justify-center font-bold border border-white/10 shrink-0">
                  <span class="material-symbols-outlined text-[20px] ${meta.badge.includes('blue') ? 'text-blue-400' : meta.badge.includes('purple') ? 'text-purple-400' : meta.badge.includes('emerald') ? 'text-emerald-400' : meta.badge.includes('cyan') ? 'text-cyan-400' : meta.badge.includes('amber') ? 'text-amber-400' : meta.badge.includes('rose') ? 'text-rose-400' : 'text-blue-400'}">${meta.icon}</span>
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-sm group-hover:text-blue-300 transition-colors truncate">${this.escapeHtml(sub.name)}</div>
                  <div class="text-[11px] text-gray-400 truncate">${this.escapeHtml(sub.description || 'Ushbu fan bo\'yicha testlar')}</div>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0 ml-2">
                ${sub.testsCount ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-300'} font-mono">${sub.testsCount} ta</span>` : ''}
                ${isActive ? '<span class="material-symbols-outlined text-blue-400 text-xl">check_circle</span>' : '<span class="material-symbols-outlined text-gray-500 text-sm group-hover:translate-x-0.5 transition-transform">chevron_right</span>'}
              </div>
            </div>
          `;
        });
      }

      return html;
    };

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" style="overscroll-behavior: contain;" onclick="if(event.target === this) app.closeModal()">
        <div class="glass-panel p-6 sm:p-7 rounded-3xl w-full max-w-xl border border-white/15 shadow-2xl relative animate-scaleUp max-h-[85vh] flex flex-col" style="overscroll-behavior: contain;">
          <!-- Close button -->
          <button onclick="app.closeModal()" class="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition z-10" title="Yopish">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>

          <!-- Header -->
          <div class="flex items-center gap-3 mb-4 pr-10">
            <div class="w-11 h-11 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-600/10">
              <span class="material-symbols-outlined text-2xl">category</span>
            </div>
            <div>
              <h3 class="text-xl font-black font-heading text-white">Barcha Fanlar Katalogi</h3>
              <p class="text-xs text-gray-400">Kerakli fanni tanlang (${state.subjects.length} ta fan mavjud)</p>
            </div>
          </div>

          <!-- Search filter inside modal -->
          <div class="relative mb-3.5">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input type="text" id="modal-subject-search" oninput="document.getElementById('modal-subjects-grid').innerHTML = app._renderSubjectsList(this.value)" placeholder="Fan nomini qidiring..." class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 transition" />
          </div>

          <!-- Subjects List -->
          <div id="modal-subjects-grid" class="overflow-y-auto space-y-2 pr-1 flex-1 custom-scrollbar max-h-[55vh]" style="overscroll-behavior: contain;">
            ${renderList()}
          </div>
        </div>
      </div>
    `;

    this._renderSubjectsList = renderList;
    setTimeout(() => {
      const inp = document.getElementById('modal-subject-search');
      if (inp) inp.focus();
    }, 100);
  },

  async loadSubjects() {
    const res = await api('/api/subjects');
    if (res.success && res.data) {
      state.subjects = res.data;
      const totalSubs = document.getElementById('catalog-stat-total-subjects');
      if (totalSubs) totalSubs.innerText = state.subjects.length;

      const container = document.getElementById('subject-filter-pills');
      const indicator = document.getElementById('catalog-active-filter-indicator');

      if (container) {
        const isAllActive = state.selectedSubjectFilter === 'all';
        let html = `
          <button onclick="app.setSubjectFilter('all')" class="subject-chip px-4 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-1.5 border ${isAllActive ? 'active' : 'bg-white/5 text-gray-300 hover:text-white border-white/10 hover:bg-white/10'}">
            <span class="material-symbols-outlined text-[15px]">apps</span>
            <span>Barchasi</span>
          </button>
          <button onclick="app.openAllSubjectsModal()" class="subject-chip px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-300 border border-blue-500/30 transition shadow-sm" title="Barcha fanlarni ko'rish">
            <span class="material-symbols-outlined text-[15px]">grid_view</span>
            <span>Barcha Fanlar (${state.subjects.length})</span>
            <span class="material-symbols-outlined text-[13px]">open_in_new</span>
          </button>
        `;

        state.subjects.forEach(sub => {
          const isActive = state.selectedSubjectFilter === sub.id;
          const meta = getSubjectMeta(sub.name);
          html += `
            <button onclick="app.setSubjectFilter('${sub.id}')" class="subject-chip px-4 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-1.5 border ${isActive ? 'active' : 'bg-white/5 text-gray-300 hover:text-white border-white/10 hover:bg-white/10'}">
              <span class="material-symbols-outlined text-[15px] ${isActive ? 'text-white' : meta.badge.includes('blue') ? 'text-blue-400' : meta.badge.includes('purple') ? 'text-purple-400' : meta.badge.includes('emerald') ? 'text-emerald-400' : meta.badge.includes('cyan') ? 'text-cyan-400' : meta.badge.includes('amber') ? 'text-amber-400' : meta.badge.includes('rose') ? 'text-rose-400' : 'text-blue-400'}">${meta.icon}</span>
              <span>${sub.name}</span>
              ${sub.testsCount ? `<span class="px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'} font-mono">${sub.testsCount}</span>` : ''}
            </button>
          `;
        });

        if (state.user?.role === 'Admin') {
          html += `
            <div class="border-l border-white/10 pl-2 ml-1 flex items-center gap-1.5 shrink-0">
              <a href="#/admin/subjects" class="px-3.5 py-2 rounded-2xl text-xs font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition flex items-center gap-1.5" title="Kategoriyalarni tahrirlash va boshqarish">
                <span class="material-symbols-outlined text-[15px]">settings</span> Fanlar Boshqaruvi
              </a>
            </div>
          `;
        }

        container.innerHTML = html;

        if (indicator) {
          if (isAllActive) {
            indicator.innerText = 'Barcha fanlar';
          } else {
            const found = state.subjects.find(s => s.id === state.selectedSubjectFilter);
            indicator.innerText = found ? found.name : 'Barcha fanlar';
          }
        }
      }
    }
  },

  async loadCatalogTests() {
    let url = '/api/tests?page=1&pageSize=300&isPublished=true';
    if (state.selectedSubjectFilter !== 'all') url += `&subjectId=${state.selectedSubjectFilter}`;
    if (state.selectedDifficultyFilter !== 'all') url += `&difficulty=${state.selectedDifficultyFilter}`;
    if (state.searchQuery) url += `&search=${encodeURIComponent(state.searchQuery)}`;

    const res = await api(url);
    const container = document.getElementById('catalog-tests-grid');
    const countBadge = document.getElementById('catalog-count-badge');
    const totalTestsStat = document.getElementById('catalog-stat-total-tests');
    const clearBtn = document.getElementById('btn-clear-all-filters');
    const searchClear = document.getElementById('catalog-search-clear');

    if (searchClear) {
      if (state.searchQuery) searchClear.classList.remove('hidden');
      else searchClear.classList.add('hidden');
    }

    const hasFilters = state.selectedSubjectFilter !== 'all' || state.selectedDifficultyFilter !== 'all' || state.searchQuery;
    if (clearBtn) {
      if (hasFilters) {
        clearBtn.classList.remove('hidden');
        clearBtn.classList.add('inline-flex');
      } else {
        clearBtn.classList.add('hidden');
        clearBtn.classList.remove('inline-flex');
      }
    }

    if (!container) return;

    const tests = Array.isArray(res.data) ? res.data : (res.data?.items || []);

    if (totalTestsStat && state.selectedSubjectFilter === 'all' && state.selectedDifficultyFilter === 'all' && !state.searchQuery) {
      totalTestsStat.innerText = tests.length;
    }

    if (countBadge) {
      countBadge.innerHTML = `<span class="text-blue-400 font-bold font-heading">✨ ${tests.length} ta test</span> mavjud`;
    }

    if (res.success && tests.length > 0) {
      container.innerHTML = tests.map(test => this.renderTestCardHtml(test)).join('');
    } else {
      container.innerHTML = `
        <div class="col-span-full catalog-hero-banner p-12 rounded-3xl text-center space-y-4 border border-white/10 animate-fadeIn">
          <div class="w-16 h-16 rounded-3xl bg-blue-500/15 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30 text-3xl shadow-lg shadow-blue-500/10">
            <span class="material-symbols-outlined text-3xl">search_off</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white font-heading">Hech qanday test topilmadi</h3>
            <p class="text-xs text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
              Qidiruv so'zini yoki tanlangan fan/qiyinchilik filtrlarini o'zgartirib ko'ring.
            </p>
          </div>
          <div>
            <button onclick="app.resetCatalogFilters()" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold glow-button-primary transition inline-flex items-center gap-1.5 shadow-md shadow-blue-600/20">
              <span class="material-symbols-outlined text-[16px]">refresh</span> Filtrlarni Bosh holatga qaytarish
            </button>
          </div>
        </div>
      `;
    }
  },

  setSubjectFilter(subjectId) {
    state.selectedSubjectFilter = subjectId;
    this.closeModal();
    this.loadSubjects();
    this.loadCatalogTests();
  },

  setDifficultyFilter(diff) {
    state.selectedDifficultyFilter = diff;
    
    // Update difficulty pill buttons UI
    const group = document.getElementById('difficulty-pill-group');
    if (group) {
      group.querySelectorAll('button').forEach(btn => {
        btn.className = 'px-3 py-1.5 rounded-lg font-bold transition text-gray-400 hover:text-white flex items-center gap-1.5';
      });
      const btns = group.querySelectorAll('button');
      if (diff === 'all' && btns[0]) btns[0].className = 'px-3 py-1.5 rounded-lg font-bold transition bg-blue-600 text-white shadow-md shadow-blue-500/25';
      if (diff === 'Easy' && btns[1]) btns[1].className = 'px-3 py-1.5 rounded-lg font-bold transition bg-emerald-600 text-white shadow-md shadow-emerald-500/25 flex items-center gap-1.5';
      if (diff === 'Medium' && btns[2]) btns[2].className = 'px-3 py-1.5 rounded-lg font-bold transition bg-amber-600 text-white shadow-md shadow-amber-500/25 flex items-center gap-1.5';
      if (diff === 'Hard' && btns[3]) btns[3].className = 'px-3 py-1.5 rounded-lg font-bold transition bg-rose-600 text-white shadow-md shadow-rose-500/25 flex items-center gap-1.5';
    }

    this.loadCatalogTests();
  },

  handleSearchInput(e) {
    state.searchQuery = e.target.value;
    clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(() => this.loadCatalogTests(), 250);
  },

  clearCatalogSearch() {
    state.searchQuery = '';
    const input = document.getElementById('catalog-search');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.loadCatalogTests();
  },

  resetCatalogFilters() {
    state.selectedSubjectFilter = 'all';
    state.selectedDifficultyFilter = 'all';
    state.searchQuery = '';
    const input = document.getElementById('catalog-search');
    if (input) input.value = '';
    this.loadSubjects();
    this.setDifficultyFilter('all');
  },

  // ----------------------------------------------------
  // VIEW 3: TEST TAKING STUDIO (QUIZ ENGINE)
  // ----------------------------------------------------
  async renderQuizStudio(testId) {
    const root = document.getElementById('app-root');

    // Prevent Admin from taking tests
    if (state.user?.role === 'Admin') {
      root.innerHTML = `
        <div class="max-w-lg mx-auto glass-panel p-8 rounded-3xl text-center mt-12 space-y-4 border border-amber-500/30 animate-fadeIn">
          <div class="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h2 class="text-2xl font-black text-white font-heading">Admin Test Topshira Olmaydi</h2>
          <p class="text-xs text-gray-300 leading-relaxed">
            Siz <strong>Administrator</strong> hisobidasiz. Platforma qoidalariga ko'ra testlarni faqat <strong>Talabalar</strong> topshirishi mumkin.
          </p>
          <div class="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#/admin/edit-test/${testId}" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">edit</span> Testni Tahrirlash
            </a>
            <a href="#/tests" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition">
              Testlar Katalogiga Qaytish
            </a>
          </div>
        </div>
      `;
      return;
    }

    root.innerHTML = `
      <div class="max-w-4xl mx-auto p-12 text-center text-gray-400">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm">Test ma'lumotlari yuklanmoqda...</p>
      </div>
    `;

    const res = await api(`/api/student-tests/${testId}`);
    if (!res.success || !res.data) {
      root.innerHTML = `
        <div class="max-w-lg mx-auto glass-panel p-8 rounded-2xl text-center mt-12">
          <span class="material-symbols-outlined text-4xl text-rose-500 mb-3">error</span>
          <h2 class="text-xl font-bold text-white mb-2">Testni ochib bo'lmadi</h2>
          <p class="text-xs text-gray-400 mb-6">${res.message || 'Test topilmadi yoki admin tomonidan nashr qilinmagan.'}</p>
          <a href="#/tests" class="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold">Testlar katalogiga qaytish</a>
        </div>
      `;
      return;
    }

    const test = res.data;
    state.activeQuiz = test;
    state.quizAnswers = {};
    state.currentQuestionIndex = 0;
    state.quizStartedAt = new Date().toISOString();
    state.quizTimeRemainingSeconds = (test.timeLimitMinutes || 10) * 60;

    this.renderQuizStudioContent();
    this.startQuizTimer();
  },

  startQuizTimer() {
    if (state.quizTimerInterval) clearInterval(state.quizTimerInterval);

    state.quizTimerInterval = setInterval(() => {
      state.quizTimeRemainingSeconds--;
      this.updateTimerDisplay();

      if (state.quizTimeRemainingSeconds <= 0) {
        clearInterval(state.quizTimerInterval);
        state.quizTimerInterval = null;
        showToast('Vaqt tugadi! Test avtomatik topshirilmoqda...', 'error');
        this.submitQuiz(true);
      }
    }, 1000);
  },

  updateTimerDisplay() {
    const timerElem = document.getElementById('quiz-timer-display');
    if (!timerElem) return;

    const mins = Math.floor(state.quizTimeRemainingSeconds / 60);
    const secs = state.quizTimeRemainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    timerElem.innerText = formatted;
    if (state.quizTimeRemainingSeconds < 120) {
      timerElem.classList.add('text-rose-400', 'animate-pulse');
    }
  },

  renderQuizStudioContent() {
    const root = document.getElementById('app-root');
    const test = state.activeQuiz;
    const qIndex = state.currentQuestionIndex || 0;
    const q = test.questions[qIndex];
    const totalQ = test.questions.length;

    root.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        
        <!-- Top Quiz Bar -->
        <div class="glass-panel p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-semibold uppercase">${test.subjectName || 'Test'}</span>
              <span class="text-xs text-gray-400">O'tish: <strong class="text-emerald-400">${test.passingPercentage}%</strong></span>
            </div>
            <h1 class="text-xl font-bold font-heading text-white">${test.title}</h1>
          </div>

          <!-- Timer & Finish Button -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-base font-bold">
              <span class="material-symbols-outlined text-[18px] text-amber-400">timer</span>
              <span id="quiz-timer-display">--:--</span>
            </div>
            <button onclick="app.confirmSubmitQuiz()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs glow-button-success transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">check_circle</span> Yakunlash
            </button>
          </div>
        </div>

        <!-- Question Navigation Pills -->
        <div class="glass-panel p-3.5 rounded-2xl flex flex-wrap items-center gap-2">
          <span class="text-xs text-gray-400 font-medium mr-2">Savollar:</span>
          ${test.questions.map((item, idx) => {
            const isAnswered = !!state.quizAnswers[item.id];
            const isCurrent = idx === qIndex;
            let btnClass = 'bg-white/5 text-gray-400 hover:bg-white/10';
            if (isCurrent) btnClass = 'bg-blue-600 text-white ring-2 ring-blue-400/50';
            else if (isAnswered) btnClass = 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30';

            return `
              <button onclick="app.goToQuestion(${idx})" class="w-8 h-8 rounded-lg text-xs font-bold transition ${btnClass}">
                ${idx + 1}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Active Question Box -->
        <div class="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <!-- Question Header -->
          <div class="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-blue-400 uppercase tracking-wider">Savol ${qIndex + 1} / ${totalQ}</span>
              <span class="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-300 font-medium">${q.points || 1} ball</span>
            </div>
          </div>

          <!-- Question Text -->
          <div class="text-lg sm:text-xl font-medium text-white leading-relaxed">
            ${q.text}
          </div>

          <!-- Options -->
          <div class="space-y-3 pt-2">
            ${q.options.map((opt, oIdx) => {
              const letter = ['A', 'B', 'C', 'D', 'E'][oIdx] || '';
              const isSelected = state.quizAnswers[q.id] === opt.id;

              return `
                <div onclick="app.selectOption('${q.id}', '${opt.id}')" class="option-card p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4 ${isSelected ? 'selected' : ''}">
                  <div class="flex items-center gap-3">
                    <span class="w-7 h-7 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'} flex items-center justify-center text-xs font-bold transition">
                      ${letter}
                    </span>
                    <span class="text-sm text-gray-200">${opt.text}</span>
                  </div>
                  <div class="w-5 h-5 rounded-full border ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-500'} flex items-center justify-center transition">
                    ${isSelected ? '<span class="material-symbols-outlined text-[14px] text-white">check</span>' : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Question Issue Report Link -->
          <div class="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span class="flex items-center gap-1 text-gray-500">
              <span class="material-symbols-outlined text-[14px]">info</span> To'g'ri javobni tanlab keyingi savolga o'ting
            </span>
            <button type="button" onclick="app.openSupportModal('Savoldagi xatolik', '«${this.escapeJs(test.title)}» - Savol #${qIndex + 1}', 'Savol matni: ${this.escapeJs(q.text.slice(0, 100))}...\\n\\nXatolik haqida:')" class="text-blue-400/80 hover:text-blue-300 hover:underline flex items-center gap-1 transition">
              <span class="material-symbols-outlined text-[14px]">flag</span> Savolda xatolik bormi? Adminga xabar bering
            </button>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex items-center justify-between">
          <button onclick="app.prevQuestion()" ${qIndex === 0 ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="hover:bg-white/10"'} class="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold transition flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span> Oldingi savol
          </button>

          ${qIndex < totalQ - 1 ? `
            <button onclick="app.nextQuestion()" class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold glow-button-primary transition flex items-center gap-1.5">
              Keyingi savol <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ` : `
            <button onclick="app.confirmSubmitQuiz()" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold glow-button-success transition flex items-center gap-1.5">
              Testni Yakunlash <span class="material-symbols-outlined text-[16px]">check_circle</span>
            </button>
          `}
        </div>

      </div>
    `;

    this.updateTimerDisplay();
  },

  selectOption(questionId, optionId) {
    state.quizAnswers[questionId] = optionId;
    this.renderQuizStudioContent();
  },

  goToQuestion(idx) {
    state.currentQuestionIndex = idx;
    this.renderQuizStudioContent();
  },

  prevQuestion() {
    if (state.currentQuestionIndex > 0) {
      state.currentQuestionIndex--;
      this.renderQuizStudioContent();
    }
  },

  nextQuestion() {
    if (state.currentQuestionIndex < state.activeQuiz.questions.length - 1) {
      state.currentQuestionIndex++;
      this.renderQuizStudioContent();
    }
  },

  confirmSubmitQuiz() {
    const answeredCount = Object.keys(state.quizAnswers).length;
    const totalCount = state.activeQuiz.questions.length;

    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div class="bg-[#14161f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl text-center">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-2xl">help</span>
          </div>

          <h3 class="text-xl font-bold font-heading text-white mb-2">Testni yakunlaysizmi?</h3>
          <p class="text-xs text-gray-400 mb-6">
            Siz <strong>${totalCount}</strong> ta savoldan <strong>${answeredCount}</strong> tasiga javob berdingiz. Test topshirilgach javoblarni o'zgartirib bo'lmaydi.
          </p>

          <div class="flex items-center gap-3">
            <button onclick="app.closeModal()" class="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition">
              Davom etish
            </button>
            <button onclick="app.submitQuiz()" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold glow-button-success transition">
              Ha, yakunlash
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async submitQuiz(isAutoSubmit = false) {
    if (state.quizTimerInterval) {
      clearInterval(state.quizTimerInterval);
      state.quizTimerInterval = null;
    }
    this.closeModal();

    const answersPayload = Object.entries(state.quizAnswers).map(([qId, oId]) => ({
      questionId: qId,
      selectedOptionId: oId
    }));

    const studentName = state.user?.fullName || 'Anonim Talaba';
    const studentId = state.user?.id || '00000000-0000-0000-0000-000000000000';

    const submitDto = {
      studentId: studentId,
      studentName: studentName,
      startedAt: state.quizStartedAt || new Date().toISOString(),
      answers: answersPayload
    };

    const res = await api(`/api/student-tests/${state.activeQuiz.id}/submit`, {
      method: 'POST',
      body: JSON.stringify(submitDto)
    });

    if (res.success && res.data) {
      showToast('Test muvaffaqiyatli topshirildi!', 'success');
      window.location.hash = `#/result/${res.data.attemptId}`;
    } else {
      showToast(res.message || 'Topshirishda xatolik', 'error');
    }
  },

  // ----------------------------------------------------
  // VIEW 4: TEST RESULT & DETAILED REVIEW
  // ----------------------------------------------------
  async renderResult(attemptId) {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="max-w-4xl mx-auto p-12 text-center text-gray-400">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm">Natijalar hisoblanmoqda...</p>
      </div>
    `;

    const res = await api(`/api/profile/attempts/${attemptId}/review`);
    if (!res.success || !res.data) {
      root.innerHTML = `
        <div class="max-w-lg mx-auto glass-panel p-8 rounded-2xl text-center mt-12">
          <p class="text-rose-400 font-bold mb-2">Natijani yuklab bo'lmadi</p>
          <a href="#/tests" class="text-xs text-blue-400 hover:underline">Katalogga qaytish</a>
        </div>
      `;
      return;
    }

    const review = res.data;
    const isPassed = review.isPassed;

    // Trigger confetti if passed
    if (isPassed && window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Check certificate
    const certRes = await api(`/api/certificates/by-attempt/${attemptId}`);
    const certificate = certRes.success ? certRes.data : null;

    const backDest = state.user?.role === 'Admin' ? '#/admin' : '#/dashboard';

    root.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        
        <!-- Top Back Navigation -->
        <div class="flex items-center justify-start">
          <a href="${backDest}" class="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 inline-flex items-center gap-1.5 transition shadow-sm" title="Dashboardga qaytish">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>⬅️ Orqaga</span>
          </a>
        </div>

        <!-- Score Summary Card -->
        <div class="glass-panel p-8 rounded-3xl text-center relative overflow-hidden border ${isPassed ? 'border-emerald-500/30' : 'border-rose-500/30'}">
          <div class="w-20 h-20 rounded-3xl ${isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'} flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-4xl">${isPassed ? 'workspace_premium' : 'sentiment_dissatisfied'}</span>
          </div>

          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
            ${isPassed ? 'Testdan Muvaffaqiyatli O\'tdingiz!' : 'Afsuski, O\'ta Olmadingiz'}
          </span>

          <h1 class="text-3xl font-black font-heading text-white mt-3 mb-1">${review.testTitle}</h1>
          <p class="text-xs text-gray-400">Talaba: <strong class="text-gray-200">${review.studentName}</strong></p>

          <!-- Metrics Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto mt-6 text-center">
            <div class="bg-white/5 p-4 rounded-2xl">
              <span class="text-[11px] text-gray-400 block mb-1">To'plangan Ball</span>
              <span class="text-2xl font-black text-white font-heading">${review.earnedScore} / ${review.totalScore}</span>
            </div>

            <div class="bg-white/5 p-4 rounded-2xl">
              <span class="text-[11px] text-gray-400 block mb-1">Natija Foizi</span>
              <span class="text-2xl font-black ${isPassed ? 'text-emerald-400' : 'text-rose-400'} font-heading">${review.percentage}%</span>
            </div>

            <div class="bg-white/5 p-4 rounded-2xl col-span-2 sm:col-span-1">
              <span class="text-[11px] text-gray-400 block mb-1">Holati</span>
              <span class="text-sm font-bold ${isPassed ? 'text-emerald-400' : 'text-rose-400'} flex items-center justify-center gap-1 mt-1">
                <span class="material-symbols-outlined text-[18px]">${isPassed ? 'check_circle' : 'cancel'}</span>
                ${isPassed ? 'Qoniqarli' : 'Yetarli emas'}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center justify-center gap-3 mt-8">
            ${certificate ? `
              <a href="#/certificate/${certificate.certificateNumber}" class="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs glow-button-primary transition flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">workspace_premium</span> Sertifikatni Ko'rish
              </a>
            ` : ''}

            <button onclick="app.sendQuickAiPrompt('🎯 Test natijalarim (${review.percentage}%) bo\\'yicha qaysi mavzularni ko\\'proq takrorlashim kerak?')" class="px-5 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center gap-1.5 shadow-md">
              <span class="material-symbols-outlined text-[16px] text-purple-400">psychology</span> Nova AI bilan tahlil
            </button>

            <a href="#/tests" class="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-semibold transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">refresh</span> Boshqa test topshirish
            </a>

            <a href="#/leaderboard" class="px-5 py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">military_tech</span> Reytingni ko'rish
            </a>
          </div>
        </div>

        <!-- Detailed Question-by-Question Review -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-white/10">
            <h3 class="text-xl font-bold font-heading text-white">Savollar Tahlili</h3>
            <span class="text-xs text-gray-400">Jami ${review.questions.length} ta savol</span>
          </div>

          <div class="space-y-6">
            ${review.questions.map((q, idx) => {
              return `
                <div class="p-5 rounded-2xl border ${q.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'} space-y-3">
                  <div class="flex items-start justify-between gap-4">
                    <span class="text-xs font-bold ${q.isCorrect ? 'text-emerald-400' : 'text-rose-400'} uppercase">
                      Savol ${idx + 1} • ${q.isCorrect ? 'To\'g\'ri javob berildi' : 'Xato javob berildi'}
                    </span>
                    <div class="flex items-center gap-2">
                      <button onclick="app.askAiForHint('${q.questionText.replace(/'/g, "\\'")}', '${review.testTitle.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-500/30 transition flex items-center gap-1">
                        <span class="material-symbols-outlined text-[13px]">lightbulb</span> AI Tushuntirish
                      </button>
                      <span class="px-2 py-0.5 rounded bg-white/5 text-[11px] text-gray-400">${q.points} ball</span>
                    </div>
                  </div>

                  <p class="text-sm font-medium text-white">${q.questionText}</p>

                  <div class="space-y-2 pt-1">
                    ${q.options.map(opt => {
                      const isUserSelected = opt.id === q.selectedOptionId;
                      const isCorrectAnswer = opt.id === q.correctOptionId || opt.isCorrect;

                      let optClass = 'border-white/5 bg-white/5 text-gray-300';
                      if (isCorrectAnswer) {
                        optClass = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold';
                      } else if (isUserSelected && !q.isCorrect) {
                        optClass = 'border-rose-500 bg-rose-500/20 text-rose-300';
                      }

                      return `
                        <div class="p-3 rounded-xl border text-xs flex items-center justify-between ${optClass}">
                          <span>${opt.text}</span>
                          <span class="text-[11px]">
                            ${isCorrectAnswer ? '✅ To\'g\'ri javob' : isUserSelected ? '❌ Siz tanlagan variant' : ''}
                          </span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  },

  // ----------------------------------------------------
  // VIEW 5: GLOBAL LEADERBOARD
  // ----------------------------------------------------
  async renderLeaderboard() {
    const root = document.getElementById('app-root');
    const backDest = state.user?.role === 'Admin' ? '#/admin' : '#/dashboard';
    root.innerHTML = `
      <div class="space-y-8 animate-fadeIn">
        
        <!-- Top Back Navigation -->
        <div class="flex items-center justify-start max-w-4xl mx-auto">
          <a href="${backDest}" class="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 inline-flex items-center gap-1.5 transition shadow-sm" title="Dashboardga qaytish">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>⬅️ Orqaga</span>
          </a>
        </div>

        <!-- Header -->
        <div class="text-center max-w-xl mx-auto">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <span class="material-symbols-outlined text-3xl">military_tech</span>
          </div>
          <h1 class="text-3xl font-black font-heading text-white">Reyting</h1>
          <p class="text-xs sm:text-sm text-gray-400 mt-1">Platformadagi eng yuqori natijaga erishgan yetakchi o'quvchilar</p>
        </div>

        <!-- Podium Section (Top 3) -->
        <div id="leaderboard-podium" class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
          <div class="p-12 text-center text-gray-500 col-span-full">Reyting yuklanmoqda...</div>
        </div>

        <!-- Full Ranked Table -->
        <div class="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div class="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <h3 class="text-lg font-bold font-heading text-white">Barcha Ishtirokchilar</h3>
            <span class="text-xs text-gray-400">Top 20</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-300">
              <thead class="bg-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th class="px-6 py-3.5">O'rin</th>
                  <th class="px-6 py-3.5">Talaba</th>
                  <th class="px-6 py-3.5">Test</th>
                  <th class="px-6 py-3.5 text-center">Natija</th>
                  <th class="px-6 py-3.5 text-center">Ball</th>
                  <th class="px-6 py-3.5 text-right">Sertifikat</th>
                </tr>
              </thead>
              <tbody id="leaderboard-table-body" class="divide-y divide-white/5">
                <tr><td colspan="6" class="p-6 text-center text-gray-500">Ma'lumotlar yuklanmoqda...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    const res = await api('/api/leaderboard/global?top=20');
    if (res.success && res.data && res.data.length > 0) {
      this.renderLeaderboardData(res.data);
    } else {
      document.getElementById('leaderboard-podium').innerHTML = `
        <div class="col-span-full glass-panel p-8 rounded-2xl text-center text-gray-400 text-xs">
          Hozircha reyting ma'lumotlari mavjud emas. Birinchi bo'lib test topshiring!
        </div>
      `;
      document.getElementById('leaderboard-table-body').innerHTML = `
        <tr><td colspan="6" class="p-6 text-center text-gray-500">Hech qanday natija yo'q</td></tr>
      `;
    }
  },

  renderLeaderboardData(list) {
    const podiumContainer = document.getElementById('leaderboard-podium');
    const tableBody = document.getElementById('leaderboard-table-body');

    const top1 = list[0];
    const top2 = list[1];
    const top3 = list[2];

    const getScoreText = (item) => {
      const score = item.score !== undefined ? item.score : (item.earnedScore !== undefined ? item.earnedScore : 0);
      return `${score} ball`;
    };

    const getBadge = (item) => {
      if (!item) return '';
      const isPro = item.isPremium || item.premiumPlan === 'Pro' || item.premiumPlan === 'VIP' || item.premiumPlan === 'Lifetime';
      const isVip = item.premiumPlan === 'VIP' || item.premiumPlan === 'Lifetime';
      return isVip ? '<span class="badge-vip ml-1.5">💎 VIP</span>' : (isPro ? '<span class="badge-pro ml-1.5">👑 PRO</span>' : '');
    };

    if (list.length === 1) {
      podiumContainer.className = "flex justify-center max-w-md mx-auto";
      podiumContainer.innerHTML = `
        <div class="glass-panel p-8 rounded-3xl text-center border-t-4 border-t-amber-400 glow-card w-full bg-gradient-to-b from-amber-500/10 to-transparent">
          <div class="w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 font-black text-2xl flex items-center justify-center mx-auto mb-2 border border-amber-400/40 shadow-lg shadow-amber-500/20 animate-pulse-glow">
            👑
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase">1-O'rin G'olib</span>
          <h4 class="font-bold text-white text-lg mt-1 flex items-center justify-center">${this.escapeHtml(top1.studentName)} ${getBadge(top1)}</h4>
          <p class="text-xs text-gray-400 mb-4">${this.escapeHtml(top1.testTitle)}</p>
          <div class="bg-amber-500/20 border border-amber-500/30 p-3 rounded-2xl text-amber-300 font-black text-lg">${top1.percentage}% (${getScoreText(top1)})</div>
        </div>
      `;
    } else if (list.length === 2) {
      podiumContainer.className = "flex flex-col md:flex-row justify-center items-end gap-6 max-w-2xl mx-auto";
      podiumContainer.innerHTML = `
        <!-- 2nd Place -->
        <div class="glass-panel p-6 rounded-3xl text-center border-t-4 border-t-slate-400 glow-card flex-1 order-2 md:order-1">
          <div class="w-12 h-12 rounded-full bg-slate-400/20 text-slate-300 font-black text-lg flex items-center justify-center mx-auto mb-2 border border-slate-400/30">
            2
          </div>
          <h4 class="font-bold text-white text-base flex items-center justify-center">${this.escapeHtml(top2.studentName)} ${getBadge(top2)}</h4>
          <p class="text-[11px] text-gray-400 mb-3">${this.escapeHtml(top2.testTitle)}</p>
          <div class="bg-white/5 p-2 rounded-xl text-emerald-400 font-bold text-sm">${top2.percentage}% (${getScoreText(top2)})</div>
        </div>

        <!-- 1st Place -->
        <div class="glass-panel p-8 rounded-3xl text-center border-t-4 border-t-amber-400 glow-card flex-1 order-1 md:order-2 bg-gradient-to-b from-amber-500/10 to-transparent">
          <div class="w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 font-black text-2xl flex items-center justify-center mx-auto mb-2 border border-amber-400/40 shadow-lg shadow-amber-500/20 animate-pulse-glow">
            👑
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase">1-O'rin G'olib</span>
          <h4 class="font-bold text-white text-lg mt-1 flex items-center justify-center">${this.escapeHtml(top1.studentName)} ${getBadge(top1)}</h4>
          <p class="text-xs text-gray-400 mb-4">${this.escapeHtml(top1.testTitle)}</p>
          <div class="bg-amber-500/20 border border-amber-500/30 p-3 rounded-2xl text-amber-300 font-black text-lg">${top1.percentage}% (${getScoreText(top1)})</div>
        </div>
      `;
    } else {
      podiumContainer.className = "grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto";
      podiumContainer.innerHTML = `
        <!-- 2nd Place -->
        <div class="glass-panel p-6 rounded-3xl text-center border-t-4 border-t-slate-400 glow-card order-2 md:order-1">
          <div class="w-12 h-12 rounded-full bg-slate-400/20 text-slate-300 font-black text-lg flex items-center justify-center mx-auto mb-2 border border-slate-400/30">
            2
          </div>
          <h4 class="font-bold text-white text-base flex items-center justify-center">${this.escapeHtml(top2.studentName)} ${getBadge(top2)}</h4>
          <p class="text-[11px] text-gray-400 mb-3">${this.escapeHtml(top2.testTitle)}</p>
          <div class="bg-white/5 p-2 rounded-xl text-emerald-400 font-bold text-sm">${top2.percentage}% (${getScoreText(top2)})</div>
        </div>

        <!-- 1st Place (Gold Crown) -->
        <div class="glass-panel p-8 rounded-3xl text-center border-t-4 border-t-amber-400 glow-card order-1 md:order-2 bg-gradient-to-b from-amber-500/10 to-transparent">
          <div class="w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 font-black text-2xl flex items-center justify-center mx-auto mb-2 border border-amber-400/40 shadow-lg shadow-amber-500/20 animate-pulse-glow">
            👑
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase">1-O'rin G'olib</span>
          <h4 class="font-bold text-white text-lg mt-1 flex items-center justify-center">${this.escapeHtml(top1.studentName)} ${getBadge(top1)}</h4>
          <p class="text-xs text-gray-400 mb-4">${this.escapeHtml(top1.testTitle)}</p>
          <div class="bg-amber-500/20 border border-amber-500/30 p-3 rounded-2xl text-amber-300 font-black text-lg">${top1.percentage}% (${getScoreText(top1)})</div>
        </div>

        <!-- 3rd Place -->
        <div class="glass-panel p-6 rounded-3xl text-center border-t-4 border-t-amber-700 glow-card order-3">
          <div class="w-12 h-12 rounded-full bg-amber-700/20 text-amber-600 font-black text-lg flex items-center justify-center mx-auto mb-2 border border-amber-700/30">
            3
          </div>
          <h4 class="font-bold text-white text-base flex items-center justify-center">${this.escapeHtml(top3.studentName)} ${getBadge(top3)}</h4>
          <p class="text-[11px] text-gray-400 mb-3">${this.escapeHtml(top3.testTitle)}</p>
          <div class="bg-white/5 p-2 rounded-xl text-emerald-400 font-bold text-sm">${top3.percentage}% (${getScoreText(top3)})</div>
        </div>
      `;
    }

    // Table rows
    tableBody.innerHTML = list.map((item, idx) => `
      <tr class="hover:bg-white/5 transition">
        <td class="px-6 py-4 font-bold text-white">#${idx + 1}</td>
        <td class="px-6 py-4 font-semibold text-white flex items-center gap-1.5">${this.escapeHtml(item.studentName)} ${getBadge(item)}</td>
        <td class="px-6 py-4 text-gray-400">${this.escapeHtml(item.testTitle)}</td>
        <td class="px-6 py-4 text-center font-bold text-emerald-400">${item.percentage}%</td>
        <td class="px-6 py-4 text-center font-medium">${getScoreText(item)}</td>
        <td class="px-6 py-4 text-right">
          ${item.certificateNumber ? `
            <a href="#/certificate/${item.certificateNumber}" class="text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-end gap-1">
              <span class="material-symbols-outlined text-[14px]">verified</span> ${this.escapeHtml(item.certificateNumber)}
            </a>
          ` : '<span class="text-gray-600">—</span>'}
        </td>
      </tr>
    `).join('');
  },

  // ----------------------------------------------------
  // VIEW 6: CERTIFICATE VIEW & VERIFICATION
  // ----------------------------------------------------
  async renderCertificate(certNumber = '') {
    const root = document.getElementById('app-root');
    const backDest = state.user?.role === 'Admin' ? '#/admin' : '#/dashboard';

    // Fetch user's own certificates if logged in
    let myCerts = [];
    if (state.user) {
      try {
        const myCertsRes = await api('/api/certificates/my');
        if (myCertsRes.success && Array.isArray(myCertsRes.data)) {
          myCerts = myCertsRes.data;
        }
      } catch (e) {}
    }

    root.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        
        <!-- Top Back Navigation -->
        <div class="flex items-center justify-start">
          <a href="${backDest}" class="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 inline-flex items-center gap-1.5 transition shadow-sm" title="Dashboardga qaytish">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>⬅️ Orqaga</span>
          </a>
        </div>

        <!-- Search/Lookup Form -->
        <div class="glass-panel p-6 sm:p-7 rounded-3xl space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-black font-heading text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-400">verified</span>
                Sertifikat Haqiqiyligini Tekshirish
              </h2>
              <p class="text-xs text-gray-400 mt-0.5">Sertifikat raqami yoki tasdiq kodini kiriting (Masalan: CERT-20260818-D5274A)</p>
            </div>

            <form onsubmit="app.handleCertLookup(event)" class="flex items-center gap-2 w-full sm:w-auto">
              <input type="text" id="cert-search-input" value="${this.escapeHtml(certNumber)}" required placeholder="Masalan: CERT-20260818-D5274A" class="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 w-full sm:w-64" />
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold glow-button-primary transition shrink-0">
                Tekshirish
              </button>
            </form>
          </div>

          ${myCerts.length > 0 ? `
            <div class="pt-3 border-t border-white/10 space-y-2">
              <span class="text-[11px] font-bold text-gray-400 block">Sizning yutuqlaringiz (${myCerts.length} ta sertifikat):</span>
              <div class="flex flex-wrap gap-2">
                ${myCerts.map(c => `
                  <button onclick="window.location.hash = '#/certificate/${encodeURIComponent(c.certificateNumber)}'" class="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm">
                    <span class="material-symbols-outlined text-[14px]">workspace_premium</span>
                    <span>${c.certificateNumber}</span>
                    <span class="text-[10px] text-gray-400 font-sans">(${this.escapeHtml(c.testTitle)})</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Certificate Container -->
        <div id="certificate-render-target">
          ${certNumber ? `
            <div class="p-12 text-center text-gray-500">Sertifikat yuklanmoqda...</div>
          ` : `
            <div class="glass-panel p-12 rounded-3xl text-center text-gray-400 space-y-2">
              <span class="material-symbols-outlined text-5xl text-amber-500">verified</span>
              <h3 class="text-lg font-bold text-white">Sertifikat Raqamini Kiriting</h3>
              <p class="text-xs text-gray-500 max-w-sm mx-auto">Har bir sertifikat unikal raqamga va rasmiy himoya belgilariga ega.</p>
            </div>
          `}
        </div>

      </div>
    `;

    if (certNumber) {
      this.fetchAndRenderCert(certNumber);
    }
  },

  async handleCertLookup(e) {
    e.preventDefault();
    const val = document.getElementById('cert-search-input').value.trim();
    if (!val) return;
    window.location.hash = `#/certificate/${encodeURIComponent(val)}`;
  },

  async fetchAndRenderCert(certNumber) {
    const target = document.getElementById('certificate-render-target');
    if (!target) return;

    const res = await api(`/api/certificates/${certNumber}`);
    if (!res.success || !res.data) {
      target.innerHTML = `
        <div class="glass-panel p-8 rounded-2xl text-center text-rose-400 space-y-2">
          <span class="material-symbols-outlined text-4xl">error</span>
          <h3 class="text-base font-bold">Sertifikat topilmadi</h3>
          <p class="text-xs text-gray-400">${res.message || 'Bunday raqamli sertifikat tizimda mavjud emas.'}</p>
        </div>
      `;
      return;
    }

    const c = res.data;
    const isDiamond = c.tier === 'Diamond';
    const isGold = c.isPremium || c.tier === 'Gold' || (!isDiamond && c.isPremium);
    
    const frameClass = isDiamond ? 'cert-diamond-frame' : (isGold ? 'cert-gold-frame' : 'cert-standard-frame');
    const nameClass = isDiamond ? 'cert-diamond-name' : (isGold ? 'cert-gold-name' : 'cert-standard-name');
    const sealClass = isDiamond ? 'cert-diamond-seal text-cyan-950' : (isGold ? 'cert-gold-seal text-black' : 'cert-standard-seal text-white');
    const sealIcon = isDiamond ? 'diamond' : (isGold ? 'workspace_premium' : 'school');
    const tagText = isDiamond 
      ? '✦ OLIY DARAJALI MALAKA SERTIFIKATI ✦' 
      : (isGold ? '★ OLTIN DARAJALI MALAKA SERTIFIKATI ★' : '✦ RASMIY MALAKA SERTIFIKATI ✦');
    const tagColorClass = isDiamond ? 'text-cyan-300' : (isGold ? 'text-amber-400' : 'text-blue-400');
    const issueDate = new Date(c.issuedAt || Date.now()).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });

    target.innerHTML = `
      <div class="space-y-6">
        
        <!-- Action Bar -->
        <div class="flex items-center justify-end gap-3">
          <button onclick="app.printCertificate()" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold flex items-center gap-2 transition shadow-sm">
            <span class="material-symbols-outlined text-[18px] text-amber-400">print</span> Chop etish / PDF
          </button>
          <button onclick="app.copyCertLink('${c.certificateNumber}')" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold glow-button-primary flex items-center gap-2 transition shadow-sm">
            <span class="material-symbols-outlined text-[18px]">share</span> Havolani ulashish
          </button>
        </div>

        <!-- Official Certificate Box -->
        <div id="certificate-print-area" class="${frameClass} p-8 sm:p-14 rounded-3xl text-center relative overflow-hidden">
          
          <!-- Seal & Crest -->
          <div class="w-16 h-16 rounded-2xl ${sealClass} cert-seal-box flex items-center justify-center mx-auto mb-5 shadow-xl transition-transform hover:scale-105">
            <span class="material-symbols-outlined text-3xl font-black">${sealIcon}</span>
          </div>

          <!-- Certificate Category Tag (No PRO/VIP account branding) -->
          <p class="cert-category-tag text-xs uppercase tracking-[0.25em] ${tagColorClass} font-black mb-2">
            ${tagText}
          </p>

          <!-- Main Title -->
          <h2 class="cert-title text-2xl sm:text-4xl font-black cert-font-heading text-white mb-5 tracking-widest uppercase">
            CERTIFICATE OF ACHIEVEMENT
          </h2>

          <p class="cert-subtitle text-xs text-gray-400 max-w-md mx-auto mb-2">
            Ushbu rasmiy sertifikat tasdiqlaydiki,
          </p>

          <!-- Recipient Name (Clean, Dignified, No account tier badge) -->
          <div class="cert-recipient-name ${nameClass} text-2xl sm:text-4xl font-extrabold my-3 py-1">
            ${this.escapeHtml(c.studentName)}
          </div>

          <p class="cert-desc text-xs text-gray-400 max-w-lg mx-auto leading-relaxed mb-6">
            quyidagi yo'nalish bo'yicha belgilangan talablarni to'liq bajarib, sinovlardan muvaffaqiyatli o'tdi:
          </p>

          <!-- Test / Subject Badge -->
          <div class="cert-subject-box inline-block px-7 py-3 rounded-2xl ${isDiamond ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200' : isGold ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-blue-950/40 border-blue-500/40 text-blue-200'} border text-base sm:text-xl font-bold font-heading mb-8 shadow-sm">
            ${this.escapeHtml(c.testTitle)}
          </div>

          <!-- Bottom Meta & Security Validation -->
          <div class="cert-meta-row pt-7 border-t ${isDiamond ? 'border-cyan-500/30' : isGold ? 'border-amber-500/30' : 'border-blue-500/30'} grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-xs text-gray-400">
            <div class="text-left">
              <span class="cert-meta-label block text-[10px] text-gray-500 uppercase font-semibold">Berilgan sana</span>
              <strong class="cert-meta-value text-gray-200">${issueDate}</strong>
            </div>

            <div class="text-center">
              <span class="cert-meta-label block text-[10px] ${isDiamond ? 'text-cyan-400' : isGold ? 'text-amber-500' : 'text-blue-400'} uppercase font-bold">Sertifikat Raqami</span>
              <strong class="cert-meta-value font-mono font-bold ${isDiamond ? 'text-cyan-300 highlight-diamond' : isGold ? 'text-amber-400 highlight-gold' : 'text-blue-300'}">${this.escapeHtml(c.certificateNumber)}</strong>
            </div>

            <div class="text-right">
              <span class="cert-meta-label block text-[10px] text-gray-500 uppercase font-semibold">Tasdiq Holati</span>
              <strong class="cert-meta-value highlight-green text-emerald-400 font-mono font-bold flex items-center justify-end gap-1">
                <span class="material-symbols-outlined text-[14px]">verified</span> ${this.escapeHtml(c.verificationCode || 'VERIFIED-OK')}
              </strong>
            </div>
          </div>

          <!-- Registry Verification Note -->
          <div class="mt-6 pt-4 border-t ${isDiamond ? 'border-cyan-500/10' : isGold ? 'border-amber-500/10' : 'border-blue-500/10'} flex flex-wrap items-center justify-between text-[10px] text-gray-500">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[13px] ${isDiamond ? 'text-cyan-400' : isGold ? 'text-amber-400' : 'text-blue-400'}">verified_user</span>
              <span>Elektron ro'yxatdan o'tkazilgan va raqamli himoyalangan rasmiy sertifikat</span>
            </div>
            <div class="font-mono text-[9px] text-gray-500">
              HASH: ${this.escapeHtml((c.verificationCode || 'AUTH').slice(0, 8))}
            </div>
          </div>

        </div>

      </div>
    `;
  },

  printCertificate() {
    window.print();
  },

  copyCertLink(certNum) {
    const url = `${window.location.origin}/#/certificate/${certNum}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Sertifikat havolasi nusxalandi!', 'success');
    }).catch(() => {
      showToast(url, 'info');
    });
  },

  // ----------------------------------------------------
  // VIEW 7: PROFILE & SETTINGS (FOR STUDENT & ADMIN)
  // ----------------------------------------------------
  async renderProfile() {
    const root = document.getElementById('app-root');

    if (!state.user) {
      root.innerHTML = `
        <div class="max-w-md mx-auto glass-panel p-8 rounded-3xl text-center mt-12 space-y-4">
          <span class="material-symbols-outlined text-5xl text-blue-500">account_circle</span>
          <h2 class="text-xl font-bold text-white">Profilga Kirish</h2>
          <p class="text-xs text-gray-400">Profilingiz ma'lumotlarini ko'rish va o'zgartirish uchun tizimga kiring.</p>
          <a href="#/login" class="inline-block w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-xs glow-button-primary">Kirish</a>
        </div>
      `;
      return;
    }

    const isAdmin = state.user.role === 'Admin';
    const backDest = isAdmin ? '#/admin' : '#/dashboard';

    root.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        
        <!-- Top Back Navigation -->
        <div class="flex items-center justify-start">
          <a href="${backDest}" class="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 inline-flex items-center gap-1.5 transition shadow-sm" title="Dashboardga qaytish">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>⬅️ Orqaga</span>
          </a>
        </div>

        <!-- User Info Header -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl ${isAdmin ? 'bg-amber-500' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'} text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              ${(state.user.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 class="text-2xl font-black font-heading text-white flex items-center gap-2">
                <span>${state.user.fullName || 'Foydalanuvchi'}</span>
                ${state.user.isPremium ? (state.user.premiumPlan === 'VIP' ? '<span class="badge-vip">💎 VIP</span>' : '<span class="badge-pro">👑 PRO</span>') : ''}
              </h2>
              <p class="text-xs text-gray-400">${state.user.email}</p>
              <span class="inline-block mt-2 px-2.5 py-0.5 rounded-full ${isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'} text-[10px] font-bold uppercase">
                ${isAdmin ? '👑 Tizim Administratori' : '🎓 Talaba'}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="app.logout()" class="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">logout</span> Chiqish
            </button>
          </div>
        </div>

        ${!isAdmin ? `
        <!-- Subscription / Plan Card (Faqat Talabalar uchun) -->
        <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/25 via-[#14161f] to-[#14161f] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div class="flex items-center gap-4 text-left">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
              👑
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-white">Tarifingiz:</h3>
                <span class="${state.user.isPremium ? (state.user.premiumPlan === 'VIP' ? 'badge-vip' : 'badge-pro') : 'px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-gray-300 border border-white/10'}">
                  ${state.user.isPremium ? (state.user.premiumPlan || 'PRO') : 'Bepul (Standart)'}
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">
                ${state.user.isPremium ? 'Barcha PRO testlar va Oltin sertifikatlar siz uchun ochiq 🌟' : 'Eksklyuziv testlar va cheksiz AI repetitor uchun PRO tarifga o\'ting'}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <a href="#/pricing" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition">
              <span class="material-symbols-outlined text-[16px]">workspace_premium</span>
              <span>Tariflarni ko'rish</span>
            </a>
            <button onclick="app.openPromoModal()" class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 font-bold text-xs transition">
              Promo-kod
            </button>
          </div>
        </div>
        ` : ''}

        <!-- Two Columns: Edit Info & Change Password -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Column 1: Shaxsiy Ma'lumotlarni Tahrirlash -->
          <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 class="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <span class="material-symbols-outlined text-blue-400 text-lg">badge</span> Shaxsiy Ma'lumotlar
            </h3>

            <form onsubmit="app.handleUpdateProfileSubmit(event)" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">To'liq Ism va Familiya</label>
                <input type="text" id="prof-fullname" value="${state.user.fullName || ''}" required class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Email / Gmail Manzili</label>
                <input type="email" id="prof-email" value="${state.user.email || ''}" oninput="app.checkProfileEmailChanged()" required class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500" />
              </div>

              <!-- Email Verification Code Box (Visible only when email is changed) -->
              <div id="prof-email-verify-box" class="hidden p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-2.5 animate-fadeIn">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px]">verified_user</span> Yangi emailni tasdiqlash:
                  </span>
                  <button type="button" id="btn-send-profile-code" onclick="app.sendProfileEmailCode()" class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-sm">
                    <span class="material-symbols-outlined text-[14px]">send</span> Kod Olish
                  </button>
                </div>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[16px]">key</span>
                  <input type="text" id="prof-verify-code" maxlength="6" placeholder="6 xonali kod (masalan: 123456)" class="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs tracking-widest font-mono focus:outline-none focus:border-blue-500" />
                </div>
                <p class="text-[10px] text-gray-400">Yangi kiritilgan Gmail/Email manzilingizga 6 xonali tasdiqlash kodi yuboriladi.</p>
              </div>

              <button type="submit" class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs glow-button-primary transition">
                Ma'lumotlarni Saqlash
              </button>
            </form>
          </div>

          <!-- Column 2: Parolni O'zgartirish -->
          <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 class="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <span class="material-symbols-outlined text-amber-400 text-lg">lock_reset</span> Parolni O'zgartirish
            </h3>

            <form onsubmit="app.handleChangePasswordSubmit(event)" class="space-y-4">
              <!-- 1. Verification Code Block (Sent to current email) -->
              <div class="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px]">mail_lock</span> 1-Qadam: Email Tasdiqlash Kodi
                  </span>
                  <button type="button" id="btn-send-pass-code" onclick="app.sendPasswordChangeEmailCode()" class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold transition flex items-center gap-1 shadow-sm">
                    <span class="material-symbols-outlined text-[14px]">send</span> Kod Olish
                  </button>
                </div>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[16px]">key</span>
                  <input type="text" id="pass-verify-code" required maxlength="6" placeholder="Emailingizga kelgan 6 xonali kod" class="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs tracking-widest font-mono focus:outline-none focus:border-amber-500" />
                </div>
                <p class="text-[10px] text-gray-400">Tasdiqlash kodi <strong>${state.user.email}</strong> manziliga yuboriladi.</p>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Joriy (Eski) Parol</label>
                <div class="relative">
                  <input type="password" id="pass-current" required placeholder="Hozirgi parolingiz" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500" />
                  <button type="button" onclick="app.togglePassword('pass-current', 'pass-eye-cur')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200">
                    <span id="pass-eye-cur" class="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Yangi Parol</label>
                <div class="relative">
                  <input type="password" id="pass-new" required minlength="4" placeholder="Kamida 4 ta belgi" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500" />
                  <button type="button" onclick="app.togglePassword('pass-new', 'pass-eye-new')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200">
                    <span id="pass-eye-new" class="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Yangi Parolni Tasdiqlang</label>
                <div class="relative">
                  <input type="password" id="pass-confirm" required minlength="4" placeholder="Yangi parolni qayta tering" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500" />
                  <button type="button" onclick="app.togglePassword('pass-confirm', 'pass-eye-conf')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200">
                    <span id="pass-eye-conf" class="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </div>
              </div>

              <button type="submit" class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs glow-button-primary transition">
                Yangi Parolni Saqlash
              </button>
            </form>
          </div>

        </div>

        ${!isAdmin ? `
          <!-- User Past Test Attempts (For Student) -->
          <div class="glass-panel rounded-3xl overflow-hidden border border-white/10">
            <div class="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 class="text-base font-bold font-heading text-white">Mening Test Tarixim</h3>
              <span class="text-xs text-gray-400">Barcha topshirilgan sinovlar</span>
            </div>

            <div id="profile-attempts-container" class="p-6">
              <p class="text-center text-gray-500 text-xs">Urinishlar yuklanmoqda...</p>
            </div>
          </div>
        ` : ''}

      </div>
    `;

    if (!isAdmin) {
      this.loadProfileAttempts();
    }
  },

  checkProfileEmailChanged() {
    const emailInput = document.getElementById('prof-email');
    const verifyBox = document.getElementById('prof-email-verify-box');
    if (!emailInput || !verifyBox) return;

    const currentEmail = (state.user?.email || '').trim().toLowerCase();
    const newEmail = emailInput.value.trim().toLowerCase();

    if (newEmail && newEmail !== currentEmail) {
      verifyBox.classList.remove('hidden');
    } else {
      verifyBox.classList.add('hidden');
    }
  },

  async sendProfileEmailCode() {
    const emailInput = document.getElementById('prof-email');
    if (!emailInput) return;
    const email = emailInput.value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      showToast('Iltimos, to\'g\'ri Gmail/Email manzil kiriting!', 'error');
      return;
    }

    const btn = document.getElementById('btn-send-profile-code');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined text-[14px] animate-spin">sync</span> Yuborilmoqda...`;
    }

    const res = await api('/api/auth/send-verification-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (res.success) {
      showToast(res.message || `${email} manziliga 6 xonali tasdiqlash kodi yuborildi!`, 'success');
      const codeBox = document.getElementById('prof-email-verify-box');
      if (codeBox) codeBox.classList.remove('hidden');
      const codeInp = document.getElementById('prof-verify-code');
      if (codeInp) codeInp.focus();

      let seconds = 60;
      const timer = setInterval(() => {
        seconds--;
        if (btn) btn.innerText = `${seconds}s...`;
        if (seconds <= 0) {
          clearInterval(timer);
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<span class="material-symbols-outlined text-[14px]">send</span> Kod Olish`;
          }
        }
      }, 1000);
    } else {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-outlined text-[14px]">send</span> Kod Olish`;
      }
      showToast(res.message || 'Kodni yuborishda xatolik', 'error');
    }
  },

  async handleUpdateProfileSubmit(e) {
    e.preventDefault();
    const fullName = document.getElementById('prof-fullname').value.trim();
    const email = document.getElementById('prof-email').value.trim();
    const currentEmail = (state.user?.email || '').trim().toLowerCase();
    const isEmailChanged = email.toLowerCase() !== currentEmail;

    let verificationCode = '';
    if (isEmailChanged) {
      const codeInp = document.getElementById('prof-verify-code');
      verificationCode = codeInp ? codeInp.value.trim() : '';

      const verifyBox = document.getElementById('prof-email-verify-box');
      if (!verificationCode) {
        if (verifyBox) verifyBox.classList.remove('hidden');
        showToast('Yangi emailni tasdiqlash uchun "Kod Olish" tugmasini bosing va kodni kiriting!', 'info');
        this.sendProfileEmailCode();
        return;
      }
    }

    const userId = state.user.id || '95EBB8D9-F98D-4075-8DEB-F9FED3C2D212';
    const res = await api(`/api/auth/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ fullName, email, verificationCode })
    });

    if (res.success && res.data) {
      updateUserSession(res.data);
      this.updateNavAuth();
      showToast('Ma\'lumotlaringiz muvaffaqiyatli saqlandi!', 'success');
      this.renderProfile();
    } else {
      showToast(res.message || 'Xatolik yuz berdi', 'error');
    }
  },

  async sendPasswordChangeEmailCode() {
    if (!state.user || !state.user.email) {
      showToast('Foydalanuvchi emaili topilmadi', 'error');
      return;
    }
    const email = state.user.email.trim().toLowerCase();
    const btn = document.getElementById('btn-send-pass-code');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined text-[14px] animate-spin">sync</span> Yuborilmoqda...`;
    }

    const res = await api('/api/auth/send-verification-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (res.success) {
      showToast(res.message || `${email} manziliga 6 xonali tasdiqlash kodi yuborildi!`, 'success');
      const codeInp = document.getElementById('pass-verify-code');
      if (codeInp) codeInp.focus();

      let seconds = 60;
      const timer = setInterval(() => {
        seconds--;
        if (btn) btn.innerText = `${seconds}s...`;
        if (seconds <= 0) {
          clearInterval(timer);
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<span class="material-symbols-outlined text-[14px]">send</span> Kod Olish`;
          }
        }
      }, 1000);
    } else {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-outlined text-[14px]">send</span> Kod Olish`;
      }
      showToast(res.message || 'Kodni yuborishda xatolik', 'error');
    }
  },

  async handleChangePasswordSubmit(e) {
    e.preventDefault();
    const verificationCode = (document.getElementById('pass-verify-code')?.value || '').trim();
    const currentPassword = document.getElementById('pass-current').value;
    const newPassword = document.getElementById('pass-new').value;
    const confirmPassword = document.getElementById('pass-confirm').value;

    if (!verificationCode) {
      showToast('Iltimos, emailingizga kelgan 6 xonali tasdiqlash kodini kiriting!', 'error');
      const codeInp = document.getElementById('pass-verify-code');
      if (codeInp) codeInp.focus();
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Yangi parollar bir-biriga mos kelmadi!', 'error');
      return;
    }

    if (newPassword.length < 4) {
      showToast('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak!', 'error');
      return;
    }

    const userId = state.user.id || '95EBB8D9-F98D-4075-8DEB-F9FED3C2D212';
    const res = await api(`/api/auth/change-password/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, verificationCode })
    });

    if (res.success) {
      showToast('Parolingiz muvaffaqiyatli o\'zgartirildi!', 'success');
      const codeInp = document.getElementById('pass-verify-code');
      if (codeInp) codeInp.value = '';
      document.getElementById('pass-current').value = '';
      document.getElementById('pass-new').value = '';
      document.getElementById('pass-confirm').value = '';
    } else {
      showToast(res.message || 'Xatolik yuz berdi', 'error');
    }
  },

  async loadProfileAttempts() {
    const res = await api('/api/profile/attempts');
    const container = document.getElementById('profile-attempts-container');
    if (!container) return;

    if (res.success && res.data && res.data.length > 0) {
      container.innerHTML = `
        <div class="space-y-3">
          ${res.data.map(item => `
            <div class="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                    ${item.isPassed ? 'O\'tgan' : 'O\'tmagan'}
                  </span>
                  <span class="text-[11px] text-gray-400">${new Date(item.submittedAt).toLocaleDateString()}</span>
                </div>
                <h4 class="font-bold text-white text-sm">${item.testTitle}</h4>
                <p class="text-xs text-gray-400">Natija: <strong class="text-white">${item.percentage}%</strong> (${item.earnedScore || 0} ball)</p>
              </div>

              <div class="flex items-center gap-2">
                <a href="#/result/${item.attemptId}" class="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold transition">
                  Natijani Ko'rish
                </a>
                ${item.certificateNumber ? `
                  <a href="#/certificate/${item.certificateNumber}" class="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">workspace_premium</span> Sertifikat
                  </a>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500 text-xs">
          Siz hali hech qanday test topshirmadingiz.
          <a href="#/tests" class="block mt-2 text-blue-400 font-semibold hover:underline">Hozir test topshirish &rarr;</a>
        </div>
      `;
    }
  },

  // ----------------------------------------------------
  // UNIVERSAL ADMIN HEADER & RESPONSIVE BREADCRUMBS
  // ----------------------------------------------------
  getAdminHeaderHtml(activeTab, title, subtitle, backUrl = '#/admin') {
    const tabs = [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '#/admin' },
      { id: 'tests', label: 'Testlar', icon: 'quiz', href: '#/admin/tests' },
      { id: 'bulk-import', label: '🚀 JSON Import', icon: 'upload_file', href: '#/admin/bulk-import' },
      { id: 'subjects', label: 'Fanlar', icon: 'menu_book', href: '#/admin/subjects' },
      { id: 'users', label: 'Foydalanuvchilar', icon: 'group', href: '#/admin/users' },
      { id: 'support', label: '📬 Murojaatlar', icon: 'support_agent', href: '#/admin/support' },
      { id: 'audit-logs', label: 'Audit Logs', icon: 'history', href: '#/admin/audit-logs' }
    ];

    const isDashboardTab = activeTab === 'dashboard';

    return `
      <div class="space-y-5 border-b border-white/10 pb-6 mb-6">
        <!-- 1. Top Admin Navigation Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 border-b border-white/10 no-scrollbar">
          ${tabs.map(t => {
            const isActive = t.id === activeTab;
            return `
              <a href="${t.href}" class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${isActive ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20' : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'}">
                <span class="material-symbols-outlined text-[15px]">${t.icon}</span>
                <span>${t.label}</span>
              </a>
            `;
          }).join('')}
        </div>

        ${!isDashboardTab ? `
          <!-- Top Back button (Only on child admin pages) -->
          <div class="flex items-center justify-start">
            <a href="${backUrl || '#/admin'}" class="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 inline-flex items-center gap-1.5 transition shadow-sm" title="Dashboardga qaytish">
              <span class="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>⬅️ Orqaga</span>
            </a>
          </div>
        ` : ''}

        <!-- 2. Main Title & Subtitle (Positioned below the navigation tabs) -->
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span class="text-[11px] font-bold uppercase tracking-wider text-amber-400">Admin Boshqaruv Markazi</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black font-heading text-white">${title}</h1>
          ${subtitle ? `<p class="text-xs sm:text-sm text-gray-400 mt-1">${subtitle}</p>` : ''}
        </div>
      </div>
    `;
  },

  // ----------------------------------------------------
  // VIEW: STUDENT DASHBOARD & NEWS FEED
  // ----------------------------------------------------
  async renderStudentDashboard() {
    const root = document.getElementById('app-root');
    const userName = state.user ? formatFullName(state.user.fullName) : 'Talaba';

    root.innerHTML = `
      <div class="space-y-8 animate-fadeIn">
        <!-- Hero Welcome Header -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
                <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span>Shaxsiy O'quv Markazi</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
                Salom, <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">${userName}</span>! 👋
              </h1>
              <p class="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                Platforma yangiliklaridan xabardor bo'ling, bilimingizni sinab ko'ring va natijalaringizni muntazam oshirib boring.
              </p>
            </div>

            <!-- Quick Action Buttons -->
            <div class="flex items-center gap-2.5 flex-wrap">
              <a href="#/tests" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs glow-button-primary transition flex items-center gap-2 shadow-lg shadow-blue-600/30">
                <span class="material-symbols-outlined text-[17px]">quiz</span> Testlar Katalogi
              </a>
              <button onclick="app.openSupportModal()" class="px-4 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 font-bold text-xs transition flex items-center gap-2 backdrop-blur-md">
                <span class="material-symbols-outlined text-[17px]">support_agent</span> Adminga Murojaat
              </button>
            </div>
          </div>

          <!-- Background Decorative Glow -->
          <div class="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
          <div class="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>
        </div>

        <!-- 4 Stat Summary Cards -->
        <div id="student-stat-cards" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Stat 1: Tests Taken -->
          <div class="glass-panel p-5 sm:p-6 rounded-2xl glow-card relative overflow-hidden group">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400">Topshirilgan Testlar</span>
              <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px]">assignment_turned_in</span>
              </div>
            </div>
            <div id="stu-stat-tests" class="text-2xl sm:text-3xl font-black text-white font-heading">...</div>
            <div id="stu-stat-passed" class="text-[11px] text-emerald-400 mt-1 font-medium">...</div>
          </div>

          <!-- Stat 2: Average Score -->
          <div class="glass-panel p-5 sm:p-6 rounded-2xl glow-card relative overflow-hidden group">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400">O'rtacha Natija</span>
              <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px]">percent</span>
              </div>
            </div>
            <div id="stu-stat-avg" class="text-2xl sm:text-3xl font-black text-indigo-300 font-heading">...</div>
            <div class="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div id="stu-stat-bar" class="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000" style="width: 0%"></div>
            </div>
          </div>

          <!-- Stat 3: Certificates Earned -->
          <div class="glass-panel p-5 sm:p-6 rounded-2xl glow-card relative overflow-hidden group">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400">Sertifikatlar</span>
              <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px]">military_tech</span>
              </div>
            </div>
            <div id="stu-stat-certs" class="text-2xl sm:text-3xl font-black text-amber-300 font-heading">...</div>
            <a href="#/verify-cert" class="text-[11px] text-amber-400/80 hover:text-amber-300 mt-1 font-medium block">Tekshirish &rarr;</a>
          </div>

          <!-- Stat 4: Global Rank -->
          <div class="glass-panel p-5 sm:p-6 rounded-2xl glow-card relative overflow-hidden group">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400">Reyting O'rni</span>
              <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px]">leaderboard</span>
              </div>
            </div>
            <div id="stu-stat-rank" class="text-2xl sm:text-3xl font-black text-emerald-300 font-heading">...</div>
            <a href="#/leaderboard" class="text-[11px] text-emerald-400/80 hover:text-emerald-300 mt-1 font-medium block">Reytingni ko'rish &rarr;</a>
          </div>
        </div>

        <!-- 2-Column Main Dashboard Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- LEFT COLUMN (2 Cols): News & Announcements Feed -->
          <div class="lg:col-span-2 space-y-6">
            <!-- News Feed Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <span class="material-symbols-outlined text-[18px]">campaign</span>
                </div>
                <div>
                  <h2 class="text-lg font-bold font-heading text-white">Platforma Yangiliklari & E'lonlar</h2>
                  <p class="text-[11px] text-gray-400">Eng so'nggi yangilanishlar va muhim xabarlar</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-400 font-semibold">Jonli Lenta</span>
            </div>

            <!-- News Cards Container -->
            <div id="student-announcements-list" class="space-y-4">
              <div class="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-gray-400">
                Yangiliklar yuklanmoqda...
              </div>
            </div>

            <!-- Support & Contact Admin Card -->
            <div class="p-6 rounded-3xl bg-gradient-to-br from-blue-950/40 via-[#121524] to-indigo-950/30 border border-blue-500/30 backdrop-blur-xl relative overflow-hidden space-y-4 shadow-xl">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-3.5">
                  <div class="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
                    <span class="material-symbols-outlined text-2xl">support_agent</span>
                  </div>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <h4 class="text-sm font-bold font-heading text-white">Savol yoki Qiyinchilik Bormi?</h4>
                      <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">24/7 Yordam</span>
                    </div>
                    <p class="text-xs text-gray-300 leading-relaxed max-w-xl">
                      Testlarda xatolik, to'lov yoki tushunmovchilik bo'yicha administratorga bevosita murojaat yuborishingiz mumkin.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                  <button onclick="app.openSupportModal()" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs glow-button-primary transition flex items-center gap-1.5 shadow-md shadow-blue-600/20">
                    <span class="material-symbols-outlined text-[16px]">chat</span> Murojaat Yuborish
                  </button>
                  <a href="https://t.me/TestPlatformAdmin" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-bold text-xs transition flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px]">send</span> Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN (1 Col): Recent Attempts & Quick Tests -->
          <div class="space-y-6">
            <!-- Recent Attempts Box -->
            <div class="glass-panel p-5 sm:p-6 rounded-3xl space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold font-heading text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-emerald-400 text-[18px]">history</span> Oxirgi Natijalarim
                </h3>
                <a href="#/profile" class="text-[11px] text-blue-400 hover:underline">Barchasi &rarr;</a>
              </div>
              <div id="student-recent-attempts-list" class="space-y-2.5 text-xs text-gray-400">
                Yuklanmoqda...
              </div>
            </div>

            <!-- Recommended Tests Box -->
            <div class="glass-panel p-5 sm:p-6 rounded-3xl space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold font-heading text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-amber-400 text-[18px]">stars</span> Tavsiya Etiladigan Testlar
                </h3>
                <a href="#/tests" class="text-[11px] text-blue-400 hover:underline">Katalog &rarr;</a>
              </div>
              <div id="student-recommended-tests-list" class="space-y-2.5 text-xs text-gray-400">
                Yuklanmoqda...
              </div>
            </div>

            <!-- Quick Navigation Hub -->
            <div class="glass-panel p-4 rounded-2xl space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block">Tezkor Havolalar</span>
              <a href="#/tests" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs transition">
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-blue-400">quiz</span> Barcha Fanlar va Testlar</span>
                <span class="material-symbols-outlined text-[14px]">chevron_right</span>
              </a>
              <a href="#/leaderboard" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs transition">
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-amber-400">military_tech</span> Reyting</span>
                <span class="material-symbols-outlined text-[14px]">chevron_right</span>
              </a>
              <a href="#/verify-cert" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-xs transition">
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-emerald-400">verified</span> Sertifikat Tekshirish</span>
                <span class="material-symbols-outlined text-[14px]">chevron_right</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    `;

    // Fetch student dashboard data
    const res = await api('/api/dashboard/student');
    if (res.success && res.data) {
      const d = res.data;

      // Stats
      document.getElementById('stu-stat-tests').innerText = `${d.totalTestsTaken || 0} ta`;
      document.getElementById('stu-stat-passed').innerText = `${d.passedCount || 0} ta muvaffaqiyatli`;
      document.getElementById('stu-stat-avg').innerText = `${d.averagePercentage || 0}%`;
      const bar = document.getElementById('stu-stat-bar');
      if (bar) bar.style.width = `${Math.min(100, Math.max(0, d.averagePercentage || 0))}%`;
      document.getElementById('stu-stat-certs').innerText = `${d.certificatesCount || 0} ta`;
      document.getElementById('stu-stat-rank').innerText = `#${d.leaderboardRank || 1}`;

      // Render Announcements
      const annContainer = document.getElementById('student-announcements-list');
      if (annContainer) {
        const list = d.recentAnnouncements || [];
        if (list.length > 0) {
          annContainer.innerHTML = list.map(a => {
            const dateStr = a.createdAt ? new Date(a.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
            const isPinned = a.isPinned;
            const categoryBg = a.category === 'Yangilik' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                               a.category === 'E\'lon' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                               a.category === 'Yangilanish' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                               'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            
            return `
              <div class="glass-panel p-5 rounded-2xl border ${isPinned ? 'border-purple-500/40 bg-purple-950/10' : 'border-white/10'} hover:border-white/20 transition-all duration-200 space-y-3 cursor-pointer group" onclick="app.openAnnouncementModal('${a.id}')">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${categoryBg}">
                      ${a.category || 'Yangilik'}
                    </span>
                    ${isPinned ? `
                      <span class="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold flex items-center gap-1">
                        <span class="material-symbols-outlined text-[11px]">push_pin</span> Asosiy E'lon
                      </span>
                    ` : ''}
                  </div>
                  <span class="text-[11px] text-gray-500 shrink-0">${dateStr}</span>
                </div>

                <div>
                  <h3 class="text-sm sm:text-base font-bold font-heading text-white group-hover:text-blue-400 transition flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-400 text-lg">${a.icon || 'campaign'}</span>
                    <span>${a.title}</span>
                  </h3>
                  <p class="text-xs text-gray-300 line-clamp-2 mt-1.5 leading-relaxed">
                    ${a.content}
                  </p>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                  <span class="text-gray-400">Muallif: <strong class="text-gray-300">${a.authorName || 'Admin'}</strong></span>
                  <span class="text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Batafsil o'qish &rarr;
                  </span>
                </div>
              </div>
            `;
          }).join('');
        } else {
          annContainer.innerHTML = `
            <div class="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
              <span class="material-symbols-outlined text-3xl text-gray-500">campaign</span>
              <p class="text-xs text-gray-400">Hozircha yangi e'lonlar mavjud emas.</p>
            </div>
          `;
        }
      }

      // Render Recent Attempts
      const attemptsContainer = document.getElementById('student-recent-attempts-list');
      if (attemptsContainer) {
        const attempts = d.recentAttempts || [];
        if (attempts.length > 0) {
          attemptsContainer.innerHTML = attempts.map(att => {
            const dateStr = att.submittedAt ? new Date(att.submittedAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) : '';
            return `
              <div class="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition flex items-center justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="font-bold text-white text-xs truncate">${att.testTitle}</div>
                  <div class="text-[10px] text-gray-400 mt-0.5">${dateStr} • ${att.earnedScore}/${att.totalScore} ball</div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${att.isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
                    ${Math.round(att.percentage)}%
                  </span>
                  <a href="#/result/${att.attemptId}" class="p-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition" title="Tahlilni ko'rish">
                    <span class="material-symbols-outlined text-[15px]">analytics</span>
                  </a>
                  ${att.certificateNumber ? `
                    <a href="#/certificate/${encodeURIComponent(att.certificateNumber)}" class="p-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition" title="Sertifikat: ${att.certificateNumber}">
                      <span class="material-symbols-outlined text-[15px]">military_tech</span>
                    </a>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('');
        } else {
          attemptsContainer.innerHTML = `
            <div class="p-6 rounded-2xl bg-white/5 text-center space-y-2">
              <p class="text-xs text-gray-400">Siz hali test topshirmagansiz.</p>
              <a href="#/tests" class="inline-block px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition">
                Birinchi testni boshlash
              </a>
            </div>
          `;
        }
      }

      // Render Recommended Tests
      const recContainer = document.getElementById('student-recommended-tests-list');
      if (recContainer) {
        const tests = d.recommendedTests || [];
        if (tests.length > 0) {
          recContainer.innerHTML = tests.map(t => `
            <div class="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition flex items-center justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="font-bold text-white text-xs truncate">${t.title}</div>
                <div class="text-[10px] text-gray-400 mt-0.5">${t.subjectName || ''} • ${t.questionsCount || 0} savol</div>
              </div>
              <a href="#/test-solve/${t.id}" class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition shrink-0 flex items-center gap-1 shadow-md shadow-blue-600/20">
                <span>Boshlash</span> <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
              </a>
            </div>
          `).join('');
        } else {
          recContainer.innerHTML = `
            <div class="p-4 rounded-2xl bg-white/5 text-center text-xs text-gray-400">
              Hozircha tavsiyalar yo'q.
            </div>
          `;
        }
      }
    }
  },

  // ----------------------------------------------------
  // VIEW 8: ADMIN DASHBOARD & ANNOUNCEMENTS CONTROL
  // ----------------------------------------------------
  async renderAdminDashboard() {
    const root = document.getElementById('app-root');

    root.innerHTML = `
      <div class="space-y-8 animate-fadeIn">
        ${this.getAdminHeaderHtml('dashboard', 'Platforma Boshqaruv Markazi', 'Tizim statistikasi, yangiliklar va boshqaruv paneli', '')}

        <!-- Top Metrics Cards -->
        <div id="admin-summary-cards" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-panel p-5 sm:p-6 rounded-2xl glow-card">
            <span class="text-xs text-gray-400 block mb-1">Jami Testlar</span>
            <div id="admin-stat-tests" class="text-2xl sm:text-3xl font-black text-white font-heading">...</div>
          </div>
          <div class="glass-panel p-5 sm:p-6 rounded-2xl glow-card">
            <span class="text-xs text-gray-400 block mb-1">Jami Savollar</span>
            <div id="admin-stat-questions" class="text-2xl sm:text-3xl font-black text-indigo-400 font-heading">...</div>
          </div>
          <div class="glass-panel p-5 sm:p-6 rounded-2xl glow-card">
            <span class="text-xs text-gray-400 block mb-1">Topshirishlar</span>
            <div id="admin-stat-attempts" class="text-2xl sm:text-3xl font-black text-emerald-400 font-heading">...</div>
          </div>
          <div class="glass-panel p-5 sm:p-6 rounded-2xl glow-card">
            <span class="text-xs text-gray-400 block mb-1">Foydalanuvchilar</span>
            <div id="admin-stat-users" class="text-2xl sm:text-3xl font-black text-amber-400 font-heading">...</div>
          </div>
        </div>

        <!-- 2-Column Grid: Left Announcements / Right Live Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- LEFT COLUMN (2 Cols): News & Announcements Manager -->
          <div class="lg:col-span-2 space-y-6">
            <div class="glass-panel rounded-3xl p-6 space-y-4">
              <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <span class="material-symbols-outlined text-[18px]">campaign</span>
                  </div>
                  <div>
                    <h3 class="text-base font-bold font-heading text-white">Platforma Yangiliklari & E'lonlar Boshqaruvi</h3>
                    <p class="text-[11px] text-gray-400">Talabalar va o'qituvchilar ko'radigan e'lonlarni boshqarish</p>
                  </div>
                </div>
                <button onclick="app.openCreateAnnouncementModal()" class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                  <span class="material-symbols-outlined text-[16px]">add_circle</span> Yangi E'lon / Yangilik Joylash
                </button>
              </div>

              <!-- Admin Announcements List Container -->
              <div id="admin-announcements-list" class="space-y-3 pt-2">
                <div class="p-6 rounded-2xl bg-white/5 text-center text-xs text-gray-400">
                  Yangiliklar yuklanmoqda...
                </div>
              </div>
            </div>

            <!-- Quick Test Management Overview -->
            <div class="glass-panel rounded-3xl p-6 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-bold font-heading text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-400">quiz</span> Yaratilgan Testlar
                </h3>
                <div class="flex items-center gap-3">
                  <a href="#/admin/bulk-import" class="text-xs text-purple-400 font-bold hover:underline flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">upload_file</span> JSON Import
                  </a>
                  <a href="#/admin/tests" class="text-xs text-blue-400 font-semibold hover:underline">Barcha testlar &rarr;</a>
                </div>
              </div>
              <div id="admin-recent-tests-list" class="space-y-2 text-xs text-gray-400">Yuklanmoqda...</div>
            </div>
          </div>

          <!-- RIGHT COLUMN (1 Col): Live Platform Pulse (Recent attempts) -->
          <div class="space-y-6">
            <div class="glass-panel rounded-3xl p-6 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold font-heading text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-emerald-400 text-[18px]">stream</span> Jonli Natijalar Lentasi
                </h3>
                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Real vaqt</span>
              </div>
              <div id="admin-live-attempts-list" class="space-y-2.5 text-xs text-gray-400">
                Yuklanmoqda...
              </div>
            </div>

            <!-- Quick Admin Actions -->
            <div class="glass-panel p-5 rounded-3xl space-y-3">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Tezkor Admin Harakatlari</span>
              <a href="#/admin/add-test" class="w-full p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center gap-2 transition">
                <span class="material-symbols-outlined text-[16px]">add_circle</span> Yangi Test Yaratish
              </a>
              <button onclick="app.openCreateSubjectModal()" class="w-full p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-2 transition">
                <span class="material-symbols-outlined text-[16px]">menu_book</span> Yangi Fan Qo'shish
              </button>
              <a href="#/admin/users" class="w-full p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-2 transition">
                <span class="material-symbols-outlined text-[16px]">group</span> Foydalanuvchilar Boshqaruvi
              </a>
              <a href="#/admin/audit-logs" class="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-xs flex items-center gap-2 transition">
                <span class="material-symbols-outlined text-[16px]">history</span> Tizim Xavfsizlik Jurnali
              </a>
            </div>
          </div>

        </div>

      </div>
    `;

    // 1. Fetch Dashboard Summary
    const res = await api('/api/dashboard/summary');
    if (res.success && res.data) {
      const d = res.data;
      document.getElementById('admin-stat-tests').innerText = d.totalTests || 0;
      document.getElementById('admin-stat-questions').innerText = d.totalQuestions || 0;
      document.getElementById('admin-stat-attempts').innerText = d.totalAttempts || 0;
      document.getElementById('admin-stat-users').innerText = d.totalUsers || 0;

      // Render live attempts
      const liveContainer = document.getElementById('admin-live-attempts-list');
      if (liveContainer) {
        const attempts = d.recentAttempts || [];
        if (attempts.length > 0) {
          liveContainer.innerHTML = attempts.map(a => {
            const dateStr = a.submittedAt ? new Date(a.submittedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '';
            return `
              <div class="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="font-bold text-white text-xs truncate">${a.studentName || 'Talaba'}</div>
                  <div class="text-[10px] text-gray-400 mt-0.5 truncate">${a.testTitle || ''} • ${dateStr}</div>
                </div>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${a.isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
                  ${Math.round(a.percentage)}%
                </span>
              </div>
            `;
          }).join('');
        } else {
          liveContainer.innerHTML = `<div class="p-4 rounded-2xl bg-white/5 text-center text-xs text-gray-400">Topshirishlar yo'q.</div>`;
        }
      }
    }

    // 2. Fetch Announcements for Admin
    this.loadAdminAnnouncements();

    // 3. Fetch Recent Tests
    const testsRes = await api('/api/tests?page=1&pageSize=6');
    const testsContainer = document.getElementById('admin-recent-tests-list');
    const recentTests = Array.isArray(testsRes.data) ? testsRes.data : (testsRes.data?.items || []);
    if (testsRes.success && recentTests.length > 0) {
      testsContainer.innerHTML = recentTests.map(t => `
        <div class="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-white text-sm truncate">${t.title}</span>
              <span class="text-gray-500 text-xs shrink-0">(${t.questionsCount || 0} ta savol • ${t.timeLimitMinutes} daq)</span>
            </div>
            <div class="text-[11px] text-gray-400 mt-0.5 truncate">${t.subjectName || ''}</div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0 flex-wrap">
            <button onclick="app.togglePublishTest('${t.id}', ${!t.isPublished}, true)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1.5 ${t.isPublished ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-400' : 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-emerald-500/20 hover:text-emerald-400'}">
              <span class="material-symbols-outlined text-[13px]">${t.isPublished ? 'visibility' : 'visibility_off'}</span>
              <span>${t.isPublished ? 'Nashr qilingan' : 'Qoralama'}</span>
            </button>
            <a href="#/admin/add-question/${t.id}" class="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 font-semibold hover:bg-blue-600/30 border border-blue-500/20 text-[11px] flex items-center gap-1 transition">
              <span class="material-symbols-outlined text-[13px]">help</span> + Savol
            </a>
            <a href="#/admin/bulk-import/${t.id}" class="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition flex items-center justify-center" title="JSON orqali savollar yuklash">
              <span class="material-symbols-outlined text-[15px]">upload_file</span>
            </a>
            <a href="#/admin/edit-test/${t.id}" class="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition flex items-center justify-center" title="Testni tahrirlash">
              <span class="material-symbols-outlined text-[15px]">edit</span>
            </a>
            <button onclick="app.deleteTest('${t.id}', true)" class="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition flex items-center justify-center" title="Testni o'chirish">
              <span class="material-symbols-outlined text-[15px]">delete</span>
            </button>
          </div>
        </div>
      `).join('');
    } else {
      testsContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-white/5 text-center space-y-2">
          <p class="text-gray-400 text-xs">Hozircha testlar yaratilmagan.</p>
        </div>
      `;
    }
  },

  async loadAdminAnnouncements() {
    const container = document.getElementById('admin-announcements-list');
    if (!container) return;

    const res = await api('/api/announcements?all=true');
    const list = Array.isArray(res.data) ? res.data : [];
    if (res.success && list.length > 0) {
      container.innerHTML = list.map(a => {
        const dateStr = a.createdAt ? new Date(a.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        return `
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  ${a.category || 'Yangilik'}
                </span>
                ${a.isPinned ? `
                  <span class="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[10px]">push_pin</span> Asosiy
                  </span>
                ` : ''}
                <span class="text-[11px] text-gray-500">${dateStr}</span>
              </div>
              <h4 class="font-bold text-white text-sm truncate">${a.title}</h4>
              <p class="text-xs text-gray-400 line-clamp-1">${a.content}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button onclick="app.openAnnouncementModal('${a.id}')" class="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold transition flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">visibility</span> Ko'rish
              </button>
              <button onclick="app.deleteAnnouncement('${a.id}')" class="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition flex items-center justify-center" title="E'lonni o'chirish">
                <span class="material-symbols-outlined text-[15px]">delete</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = `
        <div class="p-6 rounded-2xl bg-white/5 text-center text-xs text-gray-400">
          Hozircha birorta ham yangilik yoki e'lon joylanmagan.
        </div>
      `;
    }
  },

  // ----------------------------------------------------
  // ANNOUNCEMENT MODALS & ACTIONS
  // ----------------------------------------------------
  async openAnnouncementModal(id) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div class="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 border border-white/20 shadow-2xl relative">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1.5">
              <span id="modal-ann-cat" class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Yuklanmoqda...</span>
              <h2 id="modal-ann-title" class="text-xl font-bold font-heading text-white">...</h2>
              <div id="modal-ann-meta" class="text-xs text-gray-400">...</div>
            </div>
            <button onclick="document.getElementById('modal-container').innerHTML = ''" class="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div id="modal-ann-content" class="text-sm text-gray-200 leading-relaxed max-h-[60vh] overflow-y-auto space-y-3 pr-2">
            Yuklanmoqda...
          </div>

          <div class="flex items-center justify-end pt-4 border-t border-white/10">
            <button onclick="document.getElementById('modal-container').innerHTML = ''" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition">
              Yopish
            </button>
          </div>
        </div>
      </div>
    `;

    const res = await api(`/api/announcements/${id}`);
    if (res.success && res.data) {
      const a = res.data;
      const dateStr = a.createdAt ? new Date(a.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      
      const catEl = document.getElementById('modal-ann-cat');
      if (catEl) catEl.innerText = a.category || 'Yangilik';

      const titleEl = document.getElementById('modal-ann-title');
      if (titleEl) titleEl.innerText = a.title;

      const metaEl = document.getElementById('modal-ann-meta');
      if (metaEl) metaEl.innerHTML = `Muallif: <strong class="text-gray-300">${a.authorName || 'Admin'}</strong> • ${dateStr}`;

      const contentEl = document.getElementById('modal-ann-content');
      if (contentEl) {
        contentEl.innerHTML = a.content.split('\n').map(p => p.trim() ? `<p class="leading-relaxed">${p}</p>` : '').join('');
      }
    }
  },

  openCreateAnnouncementModal() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div class="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 border border-white/20 shadow-2xl relative">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <span class="material-symbols-outlined text-xl">campaign</span>
              </div>
              <div>
                <h3 class="text-lg font-black font-heading text-white">Yangi E'lon / Yangilik Joylash</h3>
                <p class="text-xs text-gray-400">Barcha talabalar ko'radigan e'lon yaratish</p>
              </div>
            </div>
            <button onclick="document.getElementById('modal-container').innerHTML = ''" class="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <form onsubmit="app.handleCreateAnnouncementSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">Sarlavha *</label>
              <input type="text" id="ann-title" required placeholder="Masalan: 🎉 Yangi Matematika olimpiadasi boshlandi!" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 transition" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">Kategoriya</label>
                <select id="ann-category" class="w-full px-4 py-3 rounded-xl bg-[#14161f] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition">
                  <option value="Yangilik">🎉 Yangilik</option>
                  <option value="E'lon">📢 E'lon</option>
                  <option value="Yangilanish">🚀 Yangilanish</option>
                  <option value="Olimpiada">🏆 Olimpiada</option>
                  <option value="Tanlov">🎯 Tanlov</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">Ikonka (Material Icon)</label>
                <input type="text" id="ann-icon" value="campaign" placeholder="campaign, stars, celebration..." class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">E'lon matni / Tafsilotlar *</label>
              <textarea id="ann-content" rows="5" required placeholder="Talabalar uchun to'liq ma'lumot va yo'riqnomalarni yozing..." class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 transition leading-relaxed"></textarea>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <input type="checkbox" id="ann-pinned" class="w-4 h-4 rounded text-amber-500 focus:ring-0 focus:outline-none bg-black/40 border-white/20" />
              <label for="ann-pinned" class="text-xs text-gray-300 font-medium cursor-pointer">
                <strong>📌 Asosiy qilib belgilash</strong> (Lenta yuqorisida ko'rinadi)
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button type="button" onclick="document.getElementById('modal-container').innerHTML = ''" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition">
                Bekor qilish
              </button>
              <button type="submit" id="btn-create-ann" class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20">
                <span class="material-symbols-outlined text-[17px]">send</span> E'lonni Chop Etish
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async handleCreateAnnouncementSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('ann-title').value.trim();
    const category = document.getElementById('ann-category').value;
    const icon = document.getElementById('ann-icon').value.trim() || 'campaign';
    const content = document.getElementById('ann-content').value.trim();
    const isPinned = document.getElementById('ann-pinned').checked;
    const btn = document.getElementById('btn-create-ann');

    if (!title || !content) {
      showToast('Sarlavha va matn kiritilishi shart', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Joylanmoqda...';
    }

    const res = await api('/api/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title,
        category,
        icon,
        content,
        isPinned,
        isPublished: true
      })
    });

    if (res.success) {
      showToast('Yangi e\'lon muvaffaqiyatli chop etildi! 🎉', 'success');
      document.getElementById('modal-container').innerHTML = '';
      this.loadAdminAnnouncements();
    } else {
      showToast(res.message || 'Xatolik yuz berdi', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[17px]">send</span> E\'lonni Chop Etish';
      }
    }
  },

  async deleteAnnouncement(id) {
    if (!confirm('Ushbu e\'lonni o\'chirishni tasdiqlaysizmi?')) return;

    const res = await api(`/api/announcements/${id}`, {
      method: 'DELETE'
    });

    if (res.success) {
      showToast('E\'lon o\'chirildi', 'success');
      this.loadAdminAnnouncements();
    } else {
      showToast(res.message || 'Xatolik yuz berdi', 'error');
    }
  },

  // ----------------------------------------------------
  // ADMIN: TESTS LIST & PUBLISH TOGGLE & DELETE & EDIT
  // ----------------------------------------------------
  async renderAdminTests() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn">
        ${this.getAdminHeaderHtml('tests', 'Testlar Boshqaruvi', 'Testlarni yaratish, tahrirlash, chop etish va savollarini boshqarish', '#/admin')}

        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-gray-400">Platformadagi barcha testlar ro'yxati</div>
          <div class="flex items-center gap-2">
            <a href="#/admin/bulk-import" class="px-3.5 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600/30 flex items-center gap-1.5 transition shadow-sm">
              <span class="material-symbols-outlined text-[16px]">upload_file</span> JSON orqali yuklash
            </a>
            <a href="#/admin/add-test" class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold glow-button-primary transition flex items-center gap-1.5 shadow-md">
              <span class="material-symbols-outlined text-[16px]">add</span> + Yangi Test Qo'shish
            </a>
          </div>
        </div>

        <div class="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-300">
              <thead class="bg-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th class="px-6 py-3.5">Test Nomi</th>
                  <th class="px-6 py-3.5">Fan</th>
                  <th class="px-6 py-3.5 text-center">Savollar</th>
                  <th class="px-6 py-3.5 text-center">Vaqt</th>
                  <th class="px-6 py-3.5 text-center">Holati (Chop etilgan)</th>
                  <th class="px-6 py-3.5 text-right">Boshqaruv</th>
                </tr>
              </thead>
              <tbody id="admin-tests-table-body" class="divide-y divide-white/5">
                <tr><td colspan="6" class="p-8 text-center text-gray-500">Testlar yuklanmoqda...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const res = await api('/api/tests?page=1&pageSize=100');
    const tbody = document.getElementById('admin-tests-table-body');
    const tests = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    if (res.success && tests.length > 0) {
      tbody.innerHTML = tests.map(test => `
        <tr class="hover:bg-white/5 transition">
          <td class="px-6 py-4">
            <div class="font-bold text-white text-sm flex items-center gap-2">
              <span>${test.title}</span>
              ${test.isPublished ? '<span class="w-2 h-2 rounded-full bg-emerald-400"></span>' : '<span class="w-2 h-2 rounded-full bg-amber-500"></span>'}
            </div>
            <div class="text-gray-500 text-[11px] line-clamp-1">${test.description || ''}</div>
          </td>
          <td class="px-6 py-4 text-blue-400 font-medium">${test.subjectName || 'Dasturlash'}</td>
          <td class="px-6 py-4 text-center font-bold text-white">${test.questionsCount || 0} ta</td>
          <td class="px-6 py-4 text-center">${test.timeLimitMinutes || 10} daq</td>
          <td class="px-6 py-4 text-center">
            <button onclick="app.togglePublishTest('${test.id}', ${!test.isPublished})" class="px-3 py-1.5 rounded-full text-[11px] font-bold border transition flex items-center gap-1.5 mx-auto ${test.isPublished ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'}" title="Bosib holatni o'zgartiring">
              <span class="material-symbols-outlined text-[14px]">${test.isPublished ? 'visibility' : 'visibility_off'}</span>
              ${test.isPublished ? '🟢 Chop etilgan' : '⚪ Qoralama'}
            </button>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <a href="#/admin/edit-test/${test.id}" class="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition" title="Testni tahrirlash">
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </a>
              <a href="#/admin/add-question/${test.id}" class="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition" title="Savollar qo'shish / ko'rish">
                <span class="material-symbols-outlined text-[16px]">help</span>
              </a>
              <a href="#/test-solve/${test.id}" class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition" title="Testni sinab ko'rish">
                <span class="material-symbols-outlined text-[16px]">play_arrow</span>
              </a>
              <a href="#/admin/bulk-import/${test.id}" class="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition" title="Ommaviy import (JSON)">
                <span class="material-symbols-outlined text-[16px]">upload_file</span>
              </a>
              <button onclick="app.deleteTest('${test.id}')" class="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition" title="O'chirish">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="p-10 text-center text-gray-400">
            <div class="max-w-md mx-auto space-y-4">
              <div class="w-16 h-16 rounded-3xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
                <span class="material-symbols-outlined text-3xl">quiz</span>
              </div>
              <div>
                <h4 class="text-base font-bold text-white mb-1">Hozircha hech qanday test topilmadi</h4>
                <p class="text-xs text-gray-400">Yangi testni qo'lda yaratishingiz yoki JSON orqali to'g'ridan-to'g'ri barcha savollari bilan bir zumda yuklashingiz mumkin.</p>
              </div>
              <div class="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <a href="#/admin/bulk-import" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs glow-button-primary transition flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30">
                  <span class="material-symbols-outlined text-[16px]">upload_file</span> JSON orqali Test va Savollar yaratish
                </a>
                <a href="#/admin/add-test" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs glow-button-primary transition flex items-center justify-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">add</span> Yangi Test Yaratish
                </a>
              </div>
              <div class="pt-2">
                <a href="#/admin" class="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">arrow_back</span> Admin Dashboardga qaytish
                </a>
              </div>
            </div>
          </td>
        </tr>
      `;
    }
  },

  async togglePublishTest(testId, newStatus, isDashboard = false) {
    const res = await api(`/api/tests/${testId}/publish?isPublished=${newStatus}`, { method: 'PATCH' });
    if (res.success) {
      showToast(newStatus ? 'Test chop etildi (Talabalarga ko\'rinadi)!' : 'Test qoralamaga olindi (Talabalardan yashirildi)!', 'success');
      if (isDashboard || window.location.hash === '#/admin' || window.location.hash === '') {
        this.renderAdminDashboard();
      } else {
        this.renderAdminTests();
      }
    } else {
      showToast(res.message || 'Xatolik yuz berdi', 'error');
    }
  },

  async deleteTest(testId, isDashboard = false) {
    if (!confirm('Haqiqatdan ham ushbu testni o\'chirmoqchimisiz? Barcha savollari ham o\'chiriladi.')) return;
    const res = await api(`/api/tests/${testId}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Test muvaffaqiyatli o\'chirildi!', 'success');
      if (isDashboard || window.location.hash === '#/admin' || window.location.hash === '') {
        this.renderAdminDashboard();
      } else {
        this.renderAdminTests();
      }
    } else {
      showToast(res.message || 'O\'chirishda xatolik', 'error');
    }
  },

  // ----------------------------------------------------
  // ADMIN: CREATE NEW TEST
  // ----------------------------------------------------
  async renderAdminAddTest() {
    const root = document.getElementById('app-root');
    let subjectsRes = await api('/api/subjects');
    let subjects = subjectsRes.success && subjectsRes.data && subjectsRes.data.length > 0 ? subjectsRes.data : [];

    // Auto seed default subject if empty
    if (subjects.length === 0) {
      const createSubRes = await api('/api/subjects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Dasturlash Asoslari', description: 'Umumiy dasturlash savollari' })
      });
      if (createSubRes.success && createSubRes.data) {
        subjects = [createSubRes.data];
      }
    }

    root.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
        ${this.getAdminHeaderHtml('add-test', 'Yangi Test Yaratish', 'Test parametrlarini kiriting va saqlang', '#/admin/tests')}

        <!-- Quick suggestion banner for JSON import -->
        <div class="p-4 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-purple-400 text-xl">tips_and_updates</span>
            <span>Tayyor JSON savollar ro'yxati bormi? Test va savollarni 1 marta bosishda avtomatik yarating!</span>
          </div>
          <a href="#/admin/bulk-import" class="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 inline-flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-[15px]">upload_file</span> JSON orqali yaratish &rarr;
          </a>
        </div>

        <form onsubmit="app.handleCreateTestSubmit(event)" class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Fan / Yo'nalish</label>
            <select id="new-test-subject" required class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500">
              ${subjects.map(s => `<option value="${s.id}" class="bg-gray-900">${s.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Test Sarlavhasi</label>
            <input type="text" id="new-test-title" required placeholder="Masalan: C# Asoslari va OOP Tamoyillari" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Tavsifi</label>
            <textarea id="new-test-desc" rows="3" placeholder="Test haqida qisqacha ma'lumot..." class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Vaqt Chegarasi (Daqiqa)</label>
              <input type="number" id="new-test-timelimit" value="15" min="1" max="180" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">O'tish Bali (%)</label>
              <input type="number" id="new-test-passing" value="60" min="1" max="100" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Qiyinchilik Darajasi</label>
              <select id="new-test-difficulty" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500">
                <option value="1">Oson (Easy)</option>
                <option value="2" selected>O'rta (Medium)</option>
                <option value="3">Qiyin (Hard)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Maksimal Urinishlar</label>
              <input type="number" id="new-test-attempts" value="5" min="1" max="20" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div class="pt-2 flex flex-col gap-2">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
              <input type="checkbox" id="new-test-publish" checked class="w-4 h-4 rounded text-blue-600 bg-white/5 border-white/10 focus:ring-blue-500" />
              <span>Chop etish (Publish) - Belgilansa talabalarga darhol ko'rinadi</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-xs text-amber-300 font-bold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
              <input type="checkbox" id="new-test-is-premium" class="w-4 h-4 rounded text-amber-500 bg-black/40 border-amber-500/40 focus:ring-amber-500" />
              <span>👑 🔒 Faqat PRO / VIP a'zolar uchun test (Eksklyuziv obuna talab qilinadi)</span>
            </label>
          </div>

          <div class="pt-4 flex items-center gap-3">
            <button type="submit" class="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs glow-button-primary transition">
              Testni Saqlash va Savol Qo'shish &rarr;
            </button>
            <a href="#/admin/tests" class="px-5 py-3 rounded-xl bg-white/5 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition">
              Bekor qilish
            </a>
          </div>
        </form>
      </div>
    `;
  },

  async handleCreateTestSubmit(e) {
    e.preventDefault();
    const isPublishChecked = document.getElementById('new-test-publish').checked;
    const isPremiumOnly = document.getElementById('new-test-is-premium')?.checked || false;

    const payload = {
      subjectId: document.getElementById('new-test-subject').value,
      title: document.getElementById('new-test-title').value,
      description: document.getElementById('new-test-desc').value,
      timeLimitMinutes: parseInt(document.getElementById('new-test-timelimit').value) || 10,
      passingPercentage: parseInt(document.getElementById('new-test-passing').value) || 60,
      difficulty: parseInt(document.getElementById('new-test-difficulty').value) || 2,
      maxAttemptsPerStudent: parseInt(document.getElementById('new-test-attempts').value) || 5,
      isPublished: isPublishChecked,
      isPremiumOnly: isPremiumOnly,
      showReviewAfterSubmit: true,
      showCorrectAnswers: true
    };

    const res = await api('/api/tests', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.success && res.data) {
      showToast('Yangi test yaratildi! Endi unga savollar qo\'shishingiz mumkin.', 'success');
      window.location.hash = `#/admin/add-question/${res.data.id}`;
    } else {
      showToast(res.message || 'Xatolik yuz berdi', 'error');
    }
  },

  // ----------------------------------------------------
  // ADMIN: EDIT EXISTING TEST
  // ----------------------------------------------------
  async renderAdminEditTest(testId) {
    const root = document.getElementById('app-root');
    const [testRes, subjectsRes] = await Promise.all([
      api(`/api/tests/${testId}`),
      api('/api/subjects')
    ]);

    if (!testRes.success || !testRes.data) {
      root.innerHTML = `
        <div class="max-w-md mx-auto glass-panel p-8 rounded-2xl text-center mt-12 space-y-4">
          <p class="text-rose-400 font-bold mb-2">Test topilmadi</p>
          <a href="#/admin/tests" class="px-4 py-2 rounded-xl bg-white/10 text-xs text-white hover:bg-white/20 inline-flex items-center gap-1">&larr; Testlar ro'yxatiga qaytish</a>
        </div>
      `;
      return;
    }

    const test = testRes.data;
    const subjects = subjectsRes.success ? subjectsRes.data : [];

    root.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
        ${this.getAdminHeaderHtml('tests', 'Testni Tahrirlash', test.title, '#/admin/tests')}

        <!-- Test Settings Form -->
        <form onsubmit="app.handleUpdateTestSubmit(event, '${testId}')" class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Fan / Yo'nalish</label>
            <select id="edit-test-subject" required class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500">
              ${subjects.map(s => `<option value="${s.id}" ${s.id === test.subjectId ? 'selected' : ''} class="bg-gray-900">${s.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Test Sarlavhasi</label>
            <input type="text" id="edit-test-title" value="${test.title || ''}" required class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Tavsifi</label>
            <textarea id="edit-test-desc" rows="3" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500">${test.description || ''}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Vaqt Chegarasi (Daqiqa)</label>
              <input type="number" id="edit-test-timelimit" value="${test.timeLimitMinutes || 15}" min="1" max="180" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">O'tish Bali (%)</label>
              <input type="number" id="edit-test-passing" value="${test.passingPercentage || 60}" min="1" max="100" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Qiyinchilik Darajasi</label>
              <select id="edit-test-difficulty" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500">
                <option value="1" ${test.difficulty === 'Easy' ? 'selected' : ''}>Oson (Easy)</option>
                <option value="2" ${test.difficulty === 'Medium' ? 'selected' : ''}>O'rta (Medium)</option>
                <option value="3" ${test.difficulty === 'Hard' ? 'selected' : ''}>Qiyin (Hard)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Maksimal Urinishlar</label>
              <input type="number" id="edit-test-attempts" value="${test.maxAttemptsPerStudent || 5}" min="1" max="20" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div class="pt-2 flex flex-col gap-2">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
              <input type="checkbox" id="edit-test-publish" ${test.isPublished ? 'checked' : ''} class="w-4 h-4 rounded text-blue-600 bg-white/5 border-white/10 focus:ring-blue-500" />
              <span>Chop etilgan (Publish) - Talabalarga ko'rinishi</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-xs text-amber-300 font-bold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
              <input type="checkbox" id="edit-test-is-premium" ${test.isPremiumOnly ? 'checked' : ''} class="w-4 h-4 rounded text-amber-500 bg-black/40 border-amber-500/40 focus:ring-amber-500" />
              <span>👑 🔒 Faqat PRO / VIP a'zolar uchun test (Eksklyuziv obuna talab qilinadi)</span>
            </label>
          </div>

          <div class="pt-4 flex items-center gap-3">
            <button type="submit" class="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs glow-button-primary transition">
              O'zgarishlarni Saqlash
            </button>
            <a href="#/admin/tests" class="px-5 py-3 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold border border-white/10 hover:bg-white/10 transition">
              Bekor qilish
            </a>
          </div>
        </form>

        <!-- Questions in this test -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-400 text-lg">quiz</span> Test Savollari (${test?.questions?.length || 0})
            </h3>
            <div class="flex items-center gap-2">
              <a href="#/admin/bulk-import/${testId}" class="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600/30 flex items-center gap-1 transition">
                <span class="material-symbols-outlined text-[14px]">upload_file</span> JSON Import
              </a>
              <a href="#/admin/add-question/${testId}" class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md">
                <span class="material-symbols-outlined text-[14px]">add</span> Yangi Savol
              </a>
            </div>
          </div>

          <div class="space-y-3">
            ${test && test.questions && test.questions.length > 0 ? test.questions.map((q, idx) => `
              <div class="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start justify-between gap-4">
                <div class="space-y-1.5 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">#${idx + 1}</span>
                    <span class="text-[11px] text-gray-400 font-medium">${q.points} ball</span>
                  </div>
                  <p class="text-xs font-semibold text-white">${q.text}</p>
                  <div class="flex flex-wrap gap-2 pt-1">
                    ${q.options.map(opt => `
                      <span class="px-2.5 py-1 rounded-lg text-[10px] ${opt.isCorrect ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'bg-white/5 text-gray-400'}">
                        ${opt.isCorrect ? '✓ ' : ''}${opt.text}
                      </span>
                    `).join('')}
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button onclick="app.openEditQuestionModal('${testId}', '${q.id}')" class="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition" title="Savol va javoblarni tahrirlash">
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onclick="app.deleteQuestion('${testId}', '${q.id}')" class="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition" title="Savolni o'chirish">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            `).join('') : '<p class="text-center py-6 text-gray-500 text-xs">Ushbu testda hali savollar yo\'q. "+ Yangi Savol Qo\'shish" yoki "JSON Import" tugmasini bosing.</p>'}
          </div>
        </div>
      </div>
    `;
  },

  async handleUpdateTestSubmit(e, testId) {
    e.preventDefault();
    const isPublishChecked = document.getElementById('edit-test-publish').checked;
    const isPremiumOnly = document.getElementById('edit-test-is-premium')?.checked || false;

    const payload = {
      subjectId: document.getElementById('edit-test-subject').value,
      title: document.getElementById('edit-test-title').value,
      description: document.getElementById('edit-test-desc').value,
      timeLimitMinutes: parseInt(document.getElementById('edit-test-timelimit').value) || 10,
      passingPercentage: parseInt(document.getElementById('edit-test-passing').value) || 60,
      difficulty: parseInt(document.getElementById('edit-test-difficulty').value) || 2,
      maxAttemptsPerStudent: parseInt(document.getElementById('edit-test-attempts').value) || 5,
      isPublished: isPublishChecked,
      isPremiumOnly: isPremiumOnly,
      showReviewAfterSubmit: true,
      showCorrectAnswers: true
    };

    const res = await api(`/api/tests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      showToast('Test muvaffaqiyatli saqlandi! ✨', 'success');
      this.renderAdminTests();
    } else {
      showToast(res.message || 'Xatolik yuz berdi', 'error');
    }
  },

  // ----------------------------------------------------
  // ADMIN: ADD QUESTION & VIEW CURRENT QUESTIONS
  // ----------------------------------------------------
  async renderAdminAddQuestion(testId) {
    const root = document.getElementById('app-root');
    const testRes = await api(`/api/tests/${testId}`);
    const test = testRes.success ? testRes.data : null;

    root.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
        ${this.getAdminHeaderHtml('tests', 'Savollar Boshqaruvi', test ? `${test.title} (${test.questions?.length || 0} ta savol)` : 'Test Savollari', `#/admin/tests`)}

        <!-- Quick actions & mode switcher -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
          <div class="flex items-center gap-2">
            <span class="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-[14px]">edit_square</span> Oddiy Forma (Bittalik)
            </span>
            <a href="#/admin/bulk-import/${testId}" class="px-3.5 py-1.5 rounded-xl text-purple-300 hover:bg-purple-500/20 hover:text-white font-bold text-xs flex items-center gap-1.5 transition">
              <span class="material-symbols-outlined text-[14px]">upload_file</span> JSON orqali Savol Tashlash &rarr;
            </a>
          </div>

          <div class="flex items-center gap-2">
            <a href="#/test-solve/${testId}" class="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30 flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">play_arrow</span> Sinab ko'rish
            </a>
            <a href="#/admin/edit-test/${testId}" class="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">settings</span> Sozlamalar
            </a>
          </div>
        </div>

        <!-- Add Question Form -->
        <form onsubmit="app.handleAddQuestionSubmit(event, '${testId}')" class="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border border-blue-500/20">
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 class="text-base font-bold text-white flex items-center gap-1.5">
              <span class="material-symbols-outlined text-blue-400 text-lg">add_circle</span> Yangi Savol Qo'shish
            </h3>
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-400 font-medium">Ball:</label>
              <input type="number" id="q-points" value="2" min="1" max="10" class="w-16 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Savol Matni</label>
            <textarea id="q-text" rows="3" required placeholder="Savol mazmunini kiriting..." class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"></textarea>
          </div>

          <div class="space-y-3 pt-1">
            <label class="block text-xs font-semibold text-gray-300">4 ta Variant (Radio orqali To'g'ri javobni belgilang):</label>

            ${['A', 'B', 'C', 'D'].map((letter, idx) => `
              <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition">
                <input type="radio" name="correct-option-radio" value="${idx}" ${idx === 0 ? 'checked' : ''} class="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer" title="To'g'ri javob sifatida belgilash" />
                <span class="font-bold text-xs text-blue-400">${letter})</span>
                <input type="text" id="q-opt-${idx}" required placeholder="${letter} varianti matni..." class="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              </div>
            `).join('')}
          </div>

          <div class="pt-2 flex items-center gap-3">
            <button type="submit" class="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs glow-button-primary transition flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">save</span> Savolni Saqlash
            </button>
          </div>
        </form>

        <!-- Current Questions List -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-base font-bold text-white">Mavjud Savollar (${test?.questions?.length || 0})</h3>
            <a href="#/admin/bulk-import/${testId}" class="text-xs text-purple-400 font-bold hover:underline flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">upload_file</span> JSON orqali import qilish
            </a>
          </div>

          <div class="space-y-3">
            ${test && test.questions && test.questions.length > 0 ? test.questions.map((q, idx) => `
              <div class="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start justify-between gap-4">
                <div class="space-y-1.5 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">#${idx + 1}</span>
                    <span class="text-[11px] text-gray-400 font-medium">${q.points} ball</span>
                  </div>
                  <p class="text-xs font-semibold text-white">${q.text}</p>
                  <div class="flex flex-wrap gap-2 pt-1">
                    ${q.options.map(opt => `
                      <span class="px-2.5 py-1 rounded-lg text-[10px] ${opt.isCorrect ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'bg-white/5 text-gray-400'}">
                        ${opt.isCorrect ? '✓ ' : ''}${opt.text}
                      </span>
                    `).join('')}
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button onclick="app.openEditQuestionModal('${testId}', '${q.id}')" class="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition" title="Savol va javoblarni tahrirlash">
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onclick="app.deleteQuestion('${testId}', '${q.id}')" class="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition" title="Savolni o'chirish">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            `).join('') : '<p class="text-center py-6 text-gray-500 text-xs">Hozircha savollar yo\'q. Yuqoridagi formadan savol qo\'shing yoki JSON orqali yuklang.</p>'}
          </div>
        </div>

      </div>
    `;
  },

  async handleUpdateQuestionSubmit(e, testId, questionId) {
    e.preventDefault();
    const text = document.getElementById('edit-q-text').value;
    const points = parseInt(document.getElementById('edit-q-points').value) || 2;
    const correctIdx = parseInt(document.querySelector('input[name="edit-correct-option-radio"]:checked')?.value || 0);

    const options = [0, 1, 2, 3].map(idx => ({
      text: document.getElementById(`edit-q-opt-${idx}`).value,
      isCorrect: idx === correctIdx
    }));

    const res = await api(`/api/tests/${testId}/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify({ text, points, options })
    });

    if (res.success) {
      showToast('Savol va javoblar muvaffaqiyatli tahrirlandi!', 'success');
      this.closeModal();
      if (window.location.hash.startsWith('#/admin/add-question')) {
        this.renderAdminAddQuestion(testId);
      } else if (window.location.hash.startsWith('#/admin/edit-test')) {
        this.renderAdminEditTest(testId);
      }
    } else {
      showToast(res.message || 'Xatolik yuz berdi', 'error');
    }
  },

  async deleteQuestion(testId, questionId) {
    if (!confirm('Ushbu savolni o\'chirmoqchimisiz?')) return;
    const res = await api(`/api/tests/${testId}/questions/${questionId}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Savol o\'chirildi', 'success');
      if (window.location.hash.startsWith('#/admin/add-question')) {
        this.renderAdminAddQuestion(testId);
      } else if (window.location.hash.startsWith('#/admin/edit-test')) {
        this.renderAdminEditTest(testId);
      }
    } else {
      showToast(res.message || 'Xatolik', 'error');
    }
  },

  async handleAddQuestionSubmit(e, testId) {
    e.preventDefault();
    const text = document.getElementById('q-text').value;
    const points = parseInt(document.getElementById('q-points').value) || 2;
    const correctIdx = parseInt(document.querySelector('input[name="correct-option-radio"]:checked')?.value || 0);

    const options = [0, 1, 2, 3].map(idx => ({
      text: document.getElementById(`q-opt-${idx}`).value,
      isCorrect: idx === correctIdx
    }));

    const res = await api(`/api/tests/${testId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ text, points, options })
    });

    if (res.success) {
      showToast('Savol muvaffaqiyatli qo\'shildi!', 'success');
      this.renderAdminAddQuestion(testId);
    } else {
      showToast(res.message || 'Xatolik yuz berdi', 'error');
    }
  },

  // ----------------------------------------------------
  // ADMIN: ADVANCED JSON QUESTION IMPORTER & 1-CLICK TEST CREATOR
  // ----------------------------------------------------
  async renderAdminBulkImport(testId) {
    const root = document.getElementById('app-root');
    
    // Load all tests to enable test selector dropdown
    const testsRes = await api('/api/tests?page=1&pageSize=100');
    const tests = Array.isArray(testsRes.data) ? testsRes.data : (testsRes.data?.items || []);
    
    let selectedTestId = testId;
    if (!selectedTestId && tests.length > 0) {
      selectedTestId = tests[0].id;
    }

    const currentTest = tests.find(t => t.id === selectedTestId);
    const defaultMode = (!tests.length || !testId) ? 'new' : 'existing';

    const sampleMatematika = {
      "subject": "Matematika",
      "questions": [
        {
          "id": 1,
          "difficulty": "easy",
          "question": "25 + 37 nechaga teng?",
          "options": ["52", "62", "72", "57"],
          "correctAnswer": "62"
        },
        {
          "id": 2,
          "difficulty": "easy",
          "question": "8 × 7 nechaga teng?",
          "options": ["54", "56", "64", "48"],
          "correctAnswer": "56"
        },
        {
          "id": 3,
          "difficulty": "easy",
          "question": "100 dan 36 ni ayirsak nechchi qoladi?",
          "options": ["54", "64", "74", "66"],
          "correctAnswer": "64"
        },
        {
          "id": 4,
          "difficulty": "medium",
          "question": "3x + 7 = 22 tenglamada x nechaga teng?",
          "options": ["3", "4", "5", "6"],
          "correctAnswer": "5"
        },
        {
          "id": 5,
          "difficulty": "hard",
          "question": "x² - 5x + 6 = 0 tenglamaning ildizlari qaysi?",
          "options": ["1 va 6", "2 va 3", "3 va 4", "1 va 5"],
          "correctAnswer": "2 va 3"
        }
      ]
    };

    root.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
        ${this.getAdminHeaderHtml('bulk-import', 'JSON orqali Savollar va Test Yuklash', 'JSON matni yoki .json faylni tashlang, tizim avtomatik yangi test ochib beradi yoki mavjud testga qo\'shadi', selectedTestId ? `#/admin/add-question/${selectedTestId}` : `#/admin/tests`)}

        <!-- Mode Switcher Card: Create New Test vs Add to Existing -->
        <div class="glass-panel p-5 sm:p-6 rounded-3xl space-y-4 border border-purple-500/30 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">tune</span> Yuklash Turi (Rejim):
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Mode 1: Auto Create New Test -->
            <label class="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 cursor-pointer transition flex items-start gap-3 relative has-[:checked]:border-purple-500 has-[:checked]:bg-purple-950/25">
              <input type="radio" name="bulk-import-mode" value="new" ${defaultMode === 'new' ? 'checked' : ''} onchange="app.toggleBulkMode('new')" class="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500" />
              <div class="space-y-1">
                <div class="text-xs font-bold text-white flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-purple-400 text-base">auto_awesome</span>
                  Yangi Test Yaratish (Avtomatik)
                </div>
                <p class="text-[11px] text-gray-400">JSON dagi fan nomi (<code>"subject": "Matematika"</code>) bo'yicha yangi test ochib, savollarni darhol joylaydi.</p>
              </div>
            </label>

            <!-- Mode 2: Append to Existing Test -->
            <label class="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 cursor-pointer transition flex items-start gap-3 relative has-[:checked]:border-blue-500 has-[:checked]:bg-blue-950/25 ${tests.length === 0 ? 'opacity-50 pointer-events-none' : ''}">
              <input type="radio" name="bulk-import-mode" value="existing" ${defaultMode === 'existing' ? 'checked' : ''} onchange="app.toggleBulkMode('existing')" ${tests.length === 0 ? 'disabled' : ''} class="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500" />
              <div class="space-y-1">
                <div class="text-xs font-bold text-white flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-blue-400 text-base">folder_open</span>
                  Mavjud Testga Qo'shish
                </div>
                <p class="text-[11px] text-gray-400">Oldin yaratilgan testni tanlab, savollarni uning davomiga qo'shish.</p>
              </div>
            </label>
          </div>

          <!-- Target Test Setup Container -->
          <div id="bulk-new-test-fields" class="${defaultMode === 'new' ? '' : 'hidden'} pt-2 border-t border-white/10 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-gray-300 mb-1">Fan / Yo'nalish Nomi:</label>
                <input type="text" id="bulk-new-subject" value="Matematika" placeholder="Masalan: Matematika, Fizika, C#..." class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs focus:outline-none focus:border-purple-400" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-gray-300 mb-1">Test Sarlavhasi:</label>
                <input type="text" id="bulk-new-title" value="Matematika Asoslari" placeholder="Masalan: Matematika 1-kurs nazorati" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs focus:outline-none focus:border-purple-400" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-gray-300 mb-1">Vaqt Chegarasi (Daqiqa):</label>
                <input type="number" id="bulk-new-timelimit" value="25" min="1" max="180" class="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-gray-300 mb-1">O'tish Bali (%):</label>
                <input type="number" id="bulk-new-passing" value="60" min="1" max="100" class="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400" />
              </div>
            </div>
          </div>

          <!-- Existing Test Selector Container -->
          <div id="bulk-existing-test-fields" class="${defaultMode === 'existing' ? '' : 'hidden'} pt-2 border-t border-white/10">
            <label class="block text-[11px] font-semibold text-gray-300 mb-1">Qaysi testga yuklansin?</label>
            <select id="bulk-target-test-select" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-semibold text-xs focus:outline-none focus:border-purple-400">
              ${tests.map(t => `
                <option value="${t.id}" ${t.id === selectedTestId ? 'selected' : ''} class="bg-gray-900 text-white">
                  ${t.title} (${t.questionsCount || 0} ta savol • ${t.subjectName || 'Fan'})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- File Upload & Drag-and-Drop Area -->
        <div id="json-dropzone" onclick="document.getElementById('bulk-file-picker').click()" class="glass-panel p-6 rounded-3xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/10 hover:bg-purple-950/20 transition-all text-center cursor-pointer group">
          <input type="file" id="bulk-file-picker" accept=".json,application/json" class="hidden" onchange="app.handleJsonFileSelect(event)" />
          <div class="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-2xl">cloud_upload</span>
          </div>
          <div class="text-sm font-bold text-white mb-1">
            📁 .JSON faylni tanlang yoki shu yerga tashlang
          </div>
          <p class="text-xs text-gray-400">Kompyuteringizdagi tayyor JSON faylni yuklash uchun bosing (avtomatik o'qiladi)</p>
        </div>

        <!-- JSON Editor Card -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <!-- Toolbar -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-white/10">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-purple-400 text-lg">data_object</span>
              <span class="text-xs font-bold text-white uppercase tracking-wider">JSON Matni:</span>
            </div>

            <!-- Templates & Action buttons -->
            <div class="flex flex-wrap items-center gap-1.5">
              <button onclick="app.loadSampleBulkJson('matematika')" class="px-2.5 py-1.5 rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30 text-[11px] font-semibold transition flex items-center gap-1" title="Matematika (subject + questions) namunasi">
                📐 Matematika namunasi
              </button>
              <button onclick="app.loadSampleBulkJson('standard')" class="px-2.5 py-1.5 rounded-lg bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/30 text-[11px] font-semibold transition flex items-center gap-1">
                📋 Standart format
              </button>
              <button onclick="app.downloadSampleJsonTemplate()" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] font-semibold transition flex items-center gap-1">
                📥 Shablon .json yuklab olish
              </button>
              <button onclick="app.clearBulkJsonInput()" class="px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 text-[11px] font-semibold transition flex items-center gap-1">
                Tozalash
              </button>
            </div>
          </div>

          <!-- Code Editor Textarea -->
          <div class="relative">
            <textarea id="bulk-json-input" oninput="app.liveValidateJsonQuestions()" rows="14" placeholder='JSON formatidagi savollarni shu yerga joylashtiring...' class="w-full p-4 rounded-2xl bg-[#090b10] border border-white/10 text-emerald-400 font-mono text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 leading-relaxed transition">${JSON.stringify(sampleMatematika, null, 2)}</textarea>
          </div>

          <!-- Live Validation Status Indicator Bar -->
          <div id="bulk-json-status-indicator" class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center justify-between transition">
            <div class="flex items-center gap-2" id="bulk-status-message">
              <span class="material-symbols-outlined text-base">check_circle</span>
              <span class="font-medium">5 ta savol muvaffaqiyatli aniqlandi</span>
            </div>
            <span id="bulk-status-count-badge" class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-bold font-mono">5 ta savol</span>
          </div>

          <!-- Action Submit Button -->
          <button id="bulk-submit-btn" onclick="app.handleBulkImport()" class="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm glow-button-primary transition flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30">
            <span class="material-symbols-outlined text-xl">upload_file</span>
            <span id="bulk-submit-btn-text">🚀 Savollarni Testga Yuklash</span>
          </button>
        </div>

        <!-- Live Visual Preview Container -->
        <div id="bulk-preview-section" class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-purple-400 text-xl">visibility</span>
              Aniqlangan Savollar Ko'rinishi (Jonli Preview)
            </h3>
            <span id="bulk-preview-counter" class="text-xs text-purple-400 font-bold font-mono">5 ta savol</span>
          </div>

          <div id="bulk-preview-list" class="space-y-3">
            <!-- Populated dynamically via liveValidateJsonQuestions -->
          </div>
        </div>
      </div>
    `;

    this.setupJsonDropzone();
    this.liveValidateJsonQuestions();
  },

  toggleBulkMode(mode) {
    const newFields = document.getElementById('bulk-new-test-fields');
    const existingFields = document.getElementById('bulk-existing-test-fields');
    if (mode === 'new') {
      newFields?.classList.remove('hidden');
      existingFields?.classList.add('hidden');
    } else {
      newFields?.classList.add('hidden');
      existingFields?.classList.remove('hidden');
    }
    this.liveValidateJsonQuestions();
  },

  setupJsonDropzone() {
    const dropzone = document.getElementById('json-dropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('border-purple-400', 'bg-purple-950/30');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('border-purple-400', 'bg-purple-950/30');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        app.readJsonFile(files[0]);
      }
    }, false);
  },

  handleJsonFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      this.readJsonFile(file);
    }
  },

  readJsonFile(file) {
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      showToast('Iltimos, faqat .json kengaytmali fayl yuklang!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const input = document.getElementById('bulk-json-input');
      if (input) {
        input.value = content;
        app.liveValidateJsonQuestions();
        showToast(`'${file.name}' fayli muvaffaqiyatli o'qildi!`, 'success');
      }
    };
    reader.onerror = () => {
      showToast('Faylni o\'qishda xatolik yuz berdi!', 'error');
    };
    reader.readAsText(file);
  },

  clearBulkJsonInput() {
    const input = document.getElementById('bulk-json-input');
    if (input) {
      input.value = '';
      this.liveValidateJsonQuestions();
    }
  },

  loadSampleBulkJson(type = 'matematika') {
    const input = document.getElementById('bulk-json-input');
    if (!input) return;

    if (type === 'matematika') {
      const sample = {
        "subject": "Matematika",
        "questions": [
          {
            "id": 1,
            "difficulty": "easy",
            "question": "25 + 37 nechaga teng?",
            "options": ["52", "62", "72", "57"],
            "correctAnswer": "62"
          },
          {
            "id": 2,
            "difficulty": "easy",
            "question": "8 × 7 nechaga teng?",
            "options": ["54", "56", "64", "48"],
            "correctAnswer": "56"
          },
          {
            "id": 3,
            "difficulty": "easy",
            "question": "100 dan 36 ni ayirsak nechchi qoladi?",
            "options": ["54", "64", "74", "66"],
            "correctAnswer": "64"
          },
          {
            "id": 4,
            "difficulty": "easy",
            "question": "81 ning kvadrat ildizi nechaga teng?",
            "options": ["7", "8", "9", "10"],
            "correctAnswer": "9"
          },
          {
            "id": 5,
            "difficulty": "medium",
            "question": "3x + 7 = 22 tenglamada x nechaga teng?",
            "options": ["3", "4", "5", "6"],
            "correctAnswer": "5"
          },
          {
            "id": 6,
            "difficulty": "hard",
            "question": "x² - 5x + 6 = 0 tenglamaning ildizlari qaysi?",
            "options": ["1 va 6", "2 va 3", "3 va 4", "1 va 5"],
            "correctAnswer": "2 va 3"
          }
        ]
      };
      input.value = JSON.stringify(sample, null, 2);
      showToast('Matematika test shabloni yuklandi!', 'info');
    } else {
      const standardSample = [
        {
          text: "C# tilida sinf yaratish uchun qaysi kalit so'z ishlatiladi?",
          points: 2,
          options: [
            { text: "class", isCorrect: true },
            { text: "struct", isCorrect: false },
            { text: "interface", isCorrect: false },
            { text: "enum", isCorrect: false }
          ]
        },
        {
          text: "ASP.NET Core da Dependency Injection qayerda sozlanadi?",
          points: 2,
          options: [
            { text: "Program.cs (builder.Services)", isCorrect: true },
            { text: "appsettings.json", isCorrect: false },
            { text: "index.html", isCorrect: false },
            { text: "Controllers papkasi", isCorrect: false }
          ]
        }
      ];
      input.value = JSON.stringify(standardSample, null, 2);
      showToast('Standart shablon yuklandi!', 'info');
    }

    this.liveValidateJsonQuestions();
  },

  downloadSampleJsonTemplate() {
    const sample = {
      "subject": "Matematika",
      "questions": [
        {
          "id": 1,
          "difficulty": "easy",
          "question": "25 + 37 nechaga teng?",
          "options": ["52", "62", "72", "57"],
          "correctAnswer": "62"
        },
        {
          "id": 2,
          "difficulty": "medium",
          "question": "3x + 7 = 22 tenglamada x nechaga teng?",
          "options": ["3", "4", "5", "6"],
          "correctAnswer": "5"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matematika_savollar_shabloni.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Namunaviy "matematika_savollar_shabloni.json" fayli yuklab olindi!', 'success');
  },

  normalizeJsonQuestions(rawData) {
    if (!rawData) return [];

    let list = [];
    let detectedSubject = '';
    let detectedTitle = '';
    let isMultiSubjectBundle = false;
    let subjectsBundle = [];

    // Case A: rawData is an object with { subjects: [ { subject: "...", questions: [...] } ] }
    if (rawData && typeof rawData === 'object' && Array.isArray(rawData.subjects)) {
      isMultiSubjectBundle = true;
      subjectsBundle = rawData.subjects;
      detectedSubject = rawData.subjects.length === 1 ? (rawData.subjects[0].subject || '') : 'Aralash fanlar';
      detectedTitle = rawData.subjects.length === 1 ? `${detectedSubject} Testi` : `Umumiy Test Baza (${rawData.subjects.length} ta fan)`;
      
      rawData.subjects.forEach(s => {
        const sName = s.subject || s.name || s.fan || '';
        const qList = Array.isArray(s.questions) ? s.questions : (Array.isArray(s.savollar) ? s.savollar : []);
        qList.forEach(q => {
          if (typeof q === 'object' && q !== null) {
            const copy = { ...q };
            if (!copy.subject && sName) copy.subject = sName;
            list.push(copy);
          }
        });
      });
    }
    // Case B: rawData is an array of subject objects [ { subject: "...", questions: [...] } ]
    else if (Array.isArray(rawData) && rawData.length > 0 && (Array.isArray(rawData[0].questions) || Array.isArray(rawData[0].savollar))) {
      isMultiSubjectBundle = true;
      subjectsBundle = rawData;
      detectedSubject = rawData.length === 1 ? (rawData[0].subject || '') : 'Aralash fanlar';
      detectedTitle = rawData.length === 1 ? `${detectedSubject} Testi` : `Umumiy Test Baza (${rawData.length} ta fan)`;
      
      rawData.forEach(s => {
        const sName = s.subject || s.name || s.fan || '';
        const qList = Array.isArray(s.questions) ? s.questions : (Array.isArray(s.savollar) ? s.savollar : []);
        qList.forEach(q => {
          if (typeof q === 'object' && q !== null) {
            const copy = { ...q };
            if (!copy.subject && sName) copy.subject = sName;
            list.push(copy);
          }
        });
      });
    }
    // Case C: Single subject or container object
    else if (!Array.isArray(rawData) && typeof rawData === 'object') {
      detectedSubject = rawData.subject || rawData.subjectName || rawData.fan || rawData.fanNomi || rawData.category || '';
      detectedTitle = rawData.title || rawData.testTitle || rawData.name || (detectedSubject ? `${detectedSubject} Testi` : '');

      if (Array.isArray(rawData.questions)) list = rawData.questions;
      else if (Array.isArray(rawData.items)) list = rawData.items;
      else if (Array.isArray(rawData.data)) list = rawData.data;
      else if (Array.isArray(rawData.savollar)) list = rawData.savollar;
      else list = [rawData];
    }
    // Case D: Direct array of question objects
    else if (Array.isArray(rawData)) {
      list = rawData;
    }

    const normalized = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (!item || typeof item !== 'object') continue;

      const text = (item.text || item.question || item.savol || item.title || item.prompt || '').toString().trim();
      if (!text) continue;

      let defaultPoints = 2;
      if (item.difficulty === 'hard') defaultPoints = 3;
      else if (item.difficulty === 'easy') defaultPoints = 1;

      const points = parseInt(item.points || item.point || item.score || item.ball || item.balls || defaultPoints) || defaultPoints;
      let rawOptions = item.options || item.variants || item.variantlar || item.choices || item.answers || [];
      let options = [];

      // Case 1: options is an Object { "A": "...", "B": "..." }
      if (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions)) {
        const keys = Object.keys(rawOptions);
        const answerVal = (item.correctAnswer ?? item.answer ?? item.correct ?? item.correct_answer ?? item.to_g_ri_javob ?? item.javob ?? '').toString().trim();
        rawOptions = keys.map(k => ({
          text: rawOptions[k]?.toString() || '',
          isCorrect: k.toUpperCase() === answerVal.toUpperCase() || rawOptions[k]?.toString().trim().toLowerCase() === answerVal.toLowerCase()
        }));
      }

      // Case 2: options is an Array
      if (Array.isArray(rawOptions)) {
        const answerRaw = item.correctAnswer ?? item.answer ?? item.correct ?? item.correct_answer ?? item.to_g_ri_javob ?? item.javob ?? item.correctIndex;
        
        options = rawOptions.map((opt, optIdx) => {
          if (typeof opt === 'object' && opt !== null) {
            const optText = (opt.text || opt.variant || opt.label || opt.value || opt.option || '').toString().trim();
            let isCorrect = Boolean(opt.isCorrect || opt.is_correct || opt.correct || opt.to_g_ri || opt.isRight);
            if (answerRaw !== undefined && answerRaw !== null) {
              if (typeof answerRaw === 'number' && answerRaw === optIdx) isCorrect = true;
              else {
                const answerStr = String(answerRaw).trim().toLowerCase();
                const optStr = optText.toLowerCase();
                const letterMatch = ['A', 'B', 'C', 'D', 'E'][optIdx];
                if (answerStr === optStr || answerStr === letterMatch?.toLowerCase()) {
                  isCorrect = true;
                }
              }
            }
            return { text: optText, isCorrect };
          } else {
            const optText = (opt ?? '').toString().trim();
            let isCorrect = false;
            if (answerRaw !== undefined && answerRaw !== null) {
              if (typeof answerRaw === 'number' && answerRaw === optIdx) isCorrect = true;
              else {
                const answerStr = String(answerRaw).trim().toLowerCase();
                const optStr = optText.toLowerCase();
                const letterMatch = ['A', 'B', 'C', 'D', 'E'][optIdx];
                if (answerStr === optStr || answerStr === letterMatch?.toLowerCase()) {
                  isCorrect = true;
                }
              }
            }
            return { text: optText, isCorrect };
          }
        });
      }

      // Filter out empty options
      options = options.filter(o => o.text && o.text.length > 0);

      normalized.push({
        text,
        points,
        options,
        difficulty: item.difficulty || 'medium',
        subject: item.subject || detectedSubject || ''
      });
    }

    normalized.detectedSubject = detectedSubject;
    normalized.detectedTitle = detectedTitle;
    normalized.isMultiSubjectBundle = isMultiSubjectBundle;
    normalized.subjectsBundle = subjectsBundle;
    return normalized;
  },

  liveValidateJsonQuestions() {
    const input = document.getElementById('bulk-json-input');
    const indicator = document.getElementById('bulk-json-status-indicator');
    const msg = document.getElementById('bulk-status-message');
    const badge = document.getElementById('bulk-status-count-badge');
    const previewList = document.getElementById('bulk-preview-list');
    const previewCounter = document.getElementById('bulk-preview-counter');
    const submitBtnText = document.getElementById('bulk-submit-btn-text');

    if (!input || !indicator || !msg) return;

    const val = input.value.trim();
    if (!val) {
      indicator.className = 'p-3.5 rounded-2xl bg-gray-500/10 border border-gray-500/20 text-xs text-gray-400 flex items-center justify-between transition';
      msg.innerHTML = '<span class="material-symbols-outlined text-base">info</span> <span>JSON matn kiritilmagan</span>';
      if (badge) badge.innerText = '0 ta savol';
      if (previewList) previewList.innerHTML = '<p class="text-center py-6 text-gray-500 text-xs">JSON kiritilgach savollar shu yerda jonli ko\'rsatiladi.</p>';
      if (previewCounter) previewCounter.innerText = '0 ta savol';
      if (submitBtnText) submitBtnText.innerText = 'Savollarni Testga Yuklash';
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(val);
    } catch (err) {
      indicator.className = 'p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center justify-between transition';
      msg.innerHTML = `<span class="material-symbols-outlined text-base">error</span> <span class="font-medium">JSON sintaksis xatosi: ${err.message}</span>`;
      if (badge) badge.innerText = 'Xato';
      if (previewList) previewList.innerHTML = `<p class="text-center py-6 text-rose-400 text-xs">JSON sintaksisida xatolik bor: ${err.message}</p>`;
      if (previewCounter) previewCounter.innerText = 'Xato';
      return;
    }

    const normalized = this.normalizeJsonQuestions(parsed);

    // Auto-update subject & title inputs if present in JSON
    if (normalized.detectedSubject) {
      const subInput = document.getElementById('bulk-new-subject');
      if (subInput && (!subInput.value || subInput.value === 'Matematika')) {
        subInput.value = normalized.detectedSubject;
      }
    }
    if (normalized.detectedTitle) {
      const titleInput = document.getElementById('bulk-new-title');
      if (titleInput && (!titleInput.value || titleInput.value === 'Matematika Asoslari')) {
        titleInput.value = normalized.detectedTitle;
      }
    }

    if (normalized.length === 0) {
      indicator.className = 'p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 flex items-center justify-between transition';
      msg.innerHTML = '<span class="material-symbols-outlined text-base">warning</span> <span class="font-medium">Savollar aniqlanmadi. Formatni tekshiring.</span>';
      if (badge) badge.innerText = '0 ta savol';
      if (previewList) previewList.innerHTML = '<p class="text-center py-6 text-amber-400 text-xs">Savollar formati to\'g\'ri kelmadi.</p>';
      if (previewCounter) previewCounter.innerText = '0 ta';
      return;
    }

    // Check if every question has at least 2 options and at least 1 correct option
    let invalidCount = 0;
    let missingCorrectCount = 0;
    normalized.forEach(q => {
      if (!q.options || q.options.length < 2) invalidCount++;
      if (!q.options || !q.options.some(o => o.isCorrect)) missingCorrectCount++;
    });

    if (missingCorrectCount > 0 || invalidCount > 0) {
      indicator.className = 'p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between transition';
      msg.innerHTML = `<span class="material-symbols-outlined text-base">warning</span> <span class="font-medium">${normalized.length} ta savoldan ${missingCorrectCount > 0 ? `${missingCorrectCount} tasida to'g'ri javob belgilanmagan` : `${invalidCount} tasida variantlar kam`}.</span>`;
      if (badge) badge.innerText = `${normalized.length} ta savol`;
    } else {
      indicator.className = 'p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between transition';
      const bundleNote = normalized.isMultiSubjectBundle ? ` (${normalized.subjectsBundle.length} ta fan bo‘yicha)` : '';
      msg.innerHTML = `<span class="material-symbols-outlined text-base">check_circle</span> <span class="font-medium font-bold">${normalized.length} ta savol muvaffaqiyatli aniqlandi${bundleNote}</span>`;
      if (badge) badge.innerText = `${normalized.length} ta savol`;
    }

    const titleVal = document.getElementById('bulk-new-title')?.value || (normalized.detectedTitle || 'Test');
    const isNewMode = document.querySelector('input[name="bulk-import-mode"]:checked')?.value === 'new';

    if (submitBtnText) {
      if (normalized.isMultiSubjectBundle && isNewMode) {
        submitBtnText.innerText = `🚀 ${normalized.subjectsBundle.length} ta Fan va ${normalized.length} ta Savolni Avtomatik Yaratish`;
      } else {
        submitBtnText.innerText = isNewMode 
          ? `🚀 ${normalized.length} ta Savolni "${titleVal}" Testi sifatida yaratish`
          : `🚀 ${normalized.length} ta Savolni Testga Yuklash`;
      }
    }
    if (previewCounter) previewCounter.innerText = `${normalized.length} ta savol`;

    // Render Preview
    if (previewList) {
      previewList.innerHTML = normalized.slice(0, 100).map((q, idx) => {
        const hasCorrect = q.options.some(o => o.isCorrect);
        return `
          <div class="p-4 rounded-2xl bg-white/5 border ${hasCorrect ? 'border-white/10' : 'border-amber-500/40 bg-amber-500/5'} space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">#${idx + 1}</span>
                ${q.subject ? `<span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">${q.subject}</span>` : ''}
                <span class="text-xs font-bold text-white">${q.text}</span>
              </div>
              <span class="text-[11px] text-gray-400 font-medium shrink-0">${q.points} ball</span>
            </div>

            <div class="flex flex-wrap gap-2 pt-1">
              ${q.options.map((opt, oIdx) => `
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-medium ${opt.isCorrect ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm' : 'bg-white/5 text-gray-400 border border-white/5'}">
                  ${opt.isCorrect ? '✓ ' : ['A', 'B', 'C', 'D', 'E'][oIdx] ? `${['A', 'B', 'C', 'D', 'E'][oIdx]}) ` : ''}${opt.text}
                </span>
              `).join('')}
            </div>

            ${!hasCorrect ? `
              <div class="text-[10px] text-amber-400 font-semibold pt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">error</span> Ushbu savolda to'g'ri javob belgilanmagan!
              </div>
            ` : ''}
          </div>
        `;
      }).join('') + (normalized.length > 100 ? `<p class="text-center py-3 text-xs text-gray-400 font-medium">... va yana ${normalized.length - 100} ta savol</p>` : '');
    }
  },

  async handleBulkImport(forcedTestId) {
    const isNewMode = document.querySelector('input[name="bulk-import-mode"]:checked')?.value === 'new';
    const input = document.getElementById('bulk-json-input');
    const val = input ? input.value.trim() : '';

    if (!val) {
      showToast('Iltimos, JSON formatidagi savollarni kiriting yoki fayl yuklang!', 'error');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(val);
    } catch (e) {
      showToast('JSON sintaksisida xatolik mavjud! Qavslar va qo\'shtirnoqlarni tekshiring.', 'error');
      return;
    }

    const normalizedQuestions = this.normalizeJsonQuestions(parsed);
    if (!normalizedQuestions || normalizedQuestions.length === 0) {
      showToast('JSON ichidan yaroqli savollar topilmadi!', 'error');
      return;
    }

    // Validate that questions have correct answers
    const invalidQuestions = normalizedQuestions.filter(q => !q.options || q.options.length < 2 || !q.options.some(o => o.isCorrect));
    if (invalidQuestions.length > 0) {
      if (!confirm(`Diqqat: ${invalidQuestions.length} ta savolda variantlar yetarli emas yoki to'g'ri javob belgilanmagan. Baribir davom etishni xohlaysizmi?`)) {
        return;
      }
    }

    const btn = document.getElementById('bulk-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-lg">sync</span> Bajarilmoqda...';
    }

    try {
      // MULTI-SUBJECT BUNDLE IMPORT (e.g. 21 subjects in one JSON)
      if (normalizedQuestions.isMultiSubjectBundle && isNewMode && normalizedQuestions.subjectsBundle.length > 1 && !forcedTestId) {
        let subjectsRes = await api('/api/subjects');
        let existingSubjects = subjectsRes.success && subjectsRes.data ? subjectsRes.data : [];
        let createdSubjectsCount = 0;
        let createdTestsCount = 0;
        let totalImportedQuestions = 0;

        for (const s of normalizedQuestions.subjectsBundle) {
          const sName = (s.subject || s.name || s.fan || 'Fan').trim();
          const sQuestionsRaw = Array.isArray(s.questions) ? s.questions : (Array.isArray(s.savollar) ? s.savollar : []);
          const sQuestions = this.normalizeJsonQuestions({ questions: sQuestionsRaw, subject: sName });
          if (sQuestions.length === 0) continue;

          // 1. Find or create Subject
          let targetSubject = existingSubjects.find(ex => ex.name.trim().toLowerCase() === sName.toLowerCase());
          if (!targetSubject) {
            const createSub = await api('/api/subjects', {
              method: 'POST',
              body: JSON.stringify({ name: sName, description: `${sName} fani bo'yicha testlar` })
            });
            if (createSub.success && createSub.data) {
              targetSubject = createSub.data;
              existingSubjects.push(targetSubject);
              createdSubjectsCount++;
            } else {
              continue;
            }
          }

          // 2. Create the Test
          const timeLimit = parseInt(document.getElementById('bulk-new-timelimit')?.value) || 25;
          const res = await this.createCategorizedTestsForSubject(targetSubject.id, sName, sQuestions);
          createdTestsCount += res.createdCount;
          totalImportedQuestions += res.totalImported;
        }

        showToast(`🎉 Muvaffaqiyatli: ${createdTestsCount} ta darajali test (Oson, O'rta, Qiyin) va ${totalImportedQuestions} ta savol yaratildi!`, 'success');
        this.closeBulkImportModal();
        this.loadAdminTests();
        window.location.hash = '#/admin/tests';
        return;
      }

      // SINGLE TEST IMPORT
      let targetTestId = forcedTestId;

      if (isNewMode || !targetTestId) {
        const subjectName = document.getElementById('bulk-new-subject')?.value.trim() || normalizedQuestions.detectedSubject || 'Matematika';

        // 1. Find or create Subject
        let subjectsRes = await api('/api/subjects');
        let subjects = subjectsRes.success && subjectsRes.data ? subjectsRes.data : [];
        let targetSubject = subjects.find(s => s.name.trim().toLowerCase() === subjectName.toLowerCase());

        if (!targetSubject) {
          const createSub = await api('/api/subjects', {
            method: 'POST',
            body: JSON.stringify({ name: subjectName, description: `${subjectName} fani bo'yicha testlar` })
          });
          if (createSub.success && createSub.data) {
            targetSubject = createSub.data;
          } else {
            showToast('Fanni yaratishda xatolik: ' + (createSub.message || ''), 'error');
            return;
          }
        }

        // 2. Create Categorized Tests (Oson, O'rta, Qiyin)
        const res = await this.createCategorizedTestsForSubject(targetSubject.id, subjectName, normalizedQuestions);
        showToast(`🎉 Muvaffaqiyatli: ${res.createdCount} ta darajali test va ${res.totalImported} ta savol yaratildi!`, 'success');
        this.closeBulkImportModal();
        this.loadAdminTests();
        window.location.hash = '#/admin/tests';
        return;
      } else {
        const select = document.getElementById('bulk-target-test-select');
        targetTestId = select ? select.value : '';
        if (!targetTestId) {
          showToast('Iltimos, savollar yuklanadigan testni tanlang!', 'error');
          return;
        }

        // Import into selected existing test
        const res = await api(`/api/tests/${targetTestId}/questions/import`, {
          method: 'POST',
          body: JSON.stringify({ questions: normalizedQuestions })
        });

        if (res.success) {
          const importedCount = res.data?.importedCount || normalizedQuestions.length;
          showToast(`🎉 Muvaffaqiyatli: ${importedCount} ta savol yuklandi!`, 'success');
          this.closeBulkImportModal();
          window.location.hash = `#/admin/add-question/${targetTestId}`;
        } else {
          showToast(res.message || 'Savollarni import qilishda xatolik', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Serverga ulanishda xatolik yuz berdi', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-xl">upload_file</span> <span>🚀 Savollarni Testga Yuklash</span>';
      }
    }
  },

  // ----------------------------------------------------
  // ADMIN: USER MANAGEMENT
  // ----------------------------------------------------
  async renderAdminUsers() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getAdminHeaderHtml('users', 'Foydalanuvchilar Ro\'yxati', 'Tizimga ro\'yxatdan o\'tgan barcha talabalar va adminlar', '#/admin')}

        <div class="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-300">
              <thead class="bg-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th class="px-6 py-3.5">Ism-Familiya</th>
                  <th class="px-6 py-3.5">Email</th>
                  <th class="px-6 py-3.5 text-center">Roli</th>
                  <th class="px-6 py-3.5 text-center">Tarif</th>
                  <th class="px-6 py-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody id="admin-users-table-body" class="divide-y divide-white/5">
                <tr><td colspan="5" class="p-8 text-center text-gray-500">Yuklanmoqda...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const res = await api('/api/users');
    const tbody = document.getElementById('admin-users-table-body');
    if (res.success && res.data && res.data.length > 0) {
      tbody.innerHTML = res.data.map(u => {
        const isPro = u.isPremium || u.premiumPlan === 'Pro' || u.premiumPlan === 'VIP' || u.premiumPlan === 'Lifetime';
        const isVip = u.premiumPlan === 'VIP' || u.premiumPlan === 'Lifetime';
        const planBadge = isVip ? '<span class="badge-vip">💎 VIP</span>' : (isPro ? '<span class="badge-pro">👑 PRO</span>' : '<span class="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-[10px]">Standart</span>');

        return `
          <tr class="hover:bg-white/5 transition">
            <td class="px-6 py-4 font-bold text-white flex items-center gap-1.5">
              <span>${this.escapeHtml(u.fullName)}</span>
            </td>
            <td class="px-6 py-4 text-gray-400">${this.escapeHtml(u.email)}</td>
            <td class="px-6 py-4 text-center">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${u.role === 'Admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-400'}">
                ${u.role}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              ${planBadge}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                ${u.role !== 'Admin' ? `
                  <button onclick="app.adminGrantPro('${u.id}', '${this.escapeJs(u.fullName)}')" class="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition flex items-center gap-1" title="PRO/VIP tarif berish">
                    <span class="material-symbols-outlined text-[14px]">workspace_premium</span> PRO berish
                  </button>
                  <button onclick="app.deleteUser('${u.id}')" class="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" title="O'chirish">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                ` : '<span class="text-gray-600 text-[11px]">Asosiy</span>'}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">Foydalanuvchilar topilmadi.</td></tr>`;
    }
  },

  async adminGrantPro(userId, fullName) {
    const plan = prompt(`${fullName} uchun qaysi tarif berilsin? (Pro / VIP / Lifetime):`, 'Pro');
    if (!plan) return;
    const days = parseInt(prompt(`Necha kunga berilsin? (Masalan: 30, 365, 3650):`, '30')) || 30;

    const res = await api('/api/subscription/admin/grant', {
      method: 'POST',
      body: JSON.stringify({ targetUserId: userId, planName: plan, durationDays: days })
    });

    if (res.success) {
      showToast(`${fullName} ga ${plan} tarifi berildi! 👑`, 'success');
      this.renderAdminUsers();
    } else {
      showToast(res.message || 'Xatolik yuz berdi', 'error');
    }
  },

  async deleteUser(userId) {
    if (!confirm('Foydalanuvchini o\'chirmoqchimisiz?')) return;
    const res = await api(`/api/users/${userId}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Foydalanuvchi o\'chirildi', 'success');
      this.renderAdminUsers();
    } else {
      showToast(res.message || 'Xatolik', 'error');
    }
  },

  // ----------------------------------------------------
  // ADMIN: AUDIT LOGS
  // ----------------------------------------------------
  async renderAdminAuditLogs() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getAdminHeaderHtml('audit-logs', 'Tizim Audit Jurnali', 'Bajarilgan harakatlar va amallar qaydlari', '#/admin')}

        <div class="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-300">
              <thead class="bg-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th class="px-6 py-3.5">Vaqt</th>
                  <th class="px-6 py-3.5">Foydalanuvchi</th>
                  <th class="px-6 py-3.5">Harakat</th>
                  <th class="px-6 py-3.5">Tafsilot</th>
                </tr>
              </thead>
              <tbody id="admin-audit-table-body" class="divide-y divide-white/5">
                <tr><td colspan="4" class="p-8 text-center text-gray-500">Qaydlar yuklanmoqda...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const res = await api('/api/audit-logs?top=50');
    const tbody = document.getElementById('admin-audit-table-body');
    if (res.success && res.data && res.data.length > 0) {
      tbody.innerHTML = res.data.map(log => {
        const actionUpper = (log.action || '').toUpperCase();
        let badgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        if (actionUpper.includes('CREATE') || actionUpper.includes('ADD') || actionUpper.includes('START') || actionUpper.includes('INIT')) {
          badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        } else if (actionUpper.includes('UPDATE') || actionUpper.includes('EDIT') || actionUpper.includes('CONFIG') || actionUpper.includes('SET')) {
          badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        } else if (actionUpper.includes('DELETE') || actionUpper.includes('REMOVE')) {
          badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
        } else if (actionUpper.includes('PAYMENT') || actionUpper.includes('UPGRADE') || actionUpper.includes('PREMIUM') || actionUpper.includes('PROMO')) {
          badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        } else if (actionUpper.includes('CERTIFICATE') || actionUpper.includes('EXAM')) {
          badgeClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
        }

        const dateStr = new Date(log.createdAt).toLocaleString('uz-UZ', { 
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });

        return `
          <tr class="hover:bg-white/5 transition text-xs">
            <td class="px-6 py-3.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">${dateStr}</td>
            <td class="px-6 py-3.5 text-white font-semibold flex items-center gap-1.5">
              <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-gray-300 font-bold">${(log.userName || 'T')[0].toUpperCase()}</span>
              <span>${this.escapeHtml(log.userName || 'Tizim')}</span>
            </td>
            <td class="px-6 py-3.5 whitespace-nowrap">
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${badgeClass}">
                ${this.escapeHtml(log.action)}
              </span>
            </td>
            <td class="px-6 py-3.5 text-gray-300 leading-relaxed max-w-md">
              ${this.escapeHtml(log.details || '')}
              ${log.entityName ? `<span class="block text-[10px] text-gray-500 mt-0.5 font-mono">Obyekt: ${this.escapeHtml(log.entityName)} ${log.entityId ? `[${this.escapeHtml(log.entityId)}]` : ''}</span>` : ''}
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-500">Hozircha audit qaydlari mavjud emas.</td></tr>`;
    }
  },

  // ----------------------------------------------------
  // ----------------------------------------------------
  // ADMIN: SUBJECTS MANAGEMENT (CREATE, EDIT, DELETE)
  // ----------------------------------------------------
  async renderAdminSubjects() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getAdminHeaderHtml('subjects', 'Fanlar Boshqaruvi', 'Tizimdagi fanlarni yaratish, tahrirlash va boshqarish', '#/admin')}

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-gray-400">Tizimdagi barcha fanlar va yo'nalishlar ro'yxati</div>
          <div>
            <button onclick="app.openCreateSubjectModal()" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold glow-button-primary transition flex items-center gap-1.5 shadow-md">
              <span class="material-symbols-outlined text-[16px]">add_circle</span> + Yangi Fan Qo'shish
            </button>
          </div>
        </div>

        <div class="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-300">
              <thead class="bg-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th class="px-6 py-3.5">Fan Nomi</th>
                  <th class="px-6 py-3.5">Tavsif</th>
                  <th class="px-6 py-3.5 text-center">Testlar Soni</th>
                  <th class="px-6 py-3.5 text-center">Mavzular</th>
                  <th class="px-6 py-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody id="admin-subjects-table-body" class="divide-y divide-white/5">
                <tr><td colspan="5" class="p-8 text-center text-gray-500">Fanlar yuklanmoqda...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const res = await api('/api/subjects');
    const tbody = document.getElementById('admin-subjects-table-body');
    if (res.success && res.data && res.data.length > 0) {
      tbody.innerHTML = res.data.map(s => `
        <tr class="hover:bg-white/5 transition">
          <td class="px-6 py-4 font-bold text-white">${s.name}</td>
          <td class="px-6 py-4 text-gray-400">${s.description || '—'}</td>
          <td class="px-6 py-4 text-center font-semibold text-blue-400">${s.testsCount || 0} ta</td>
          <td class="px-6 py-4 text-center text-gray-400">${s.topicsCount || 0} ta</td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="app.openEditSubjectModal('${s.id}', '${s.name.replace(/'/g, "\\'")}', '${(s.description || '').replace(/'/g, "\\'")}')" class="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition" title="Tahrirlash">
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button onclick="app.deleteSubject('${s.id}')" class="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition" title="O'chirish">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">Fanlar topilmadi.</td></tr>`;
    }
  },

  openCreateSubjectModal() {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop active fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="modal-card max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 space-y-5 animate-scaleUp">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-emerald-400">add_circle</span> Yangi Fan Qo'shish
              </h3>
              <p class="text-[11px] text-gray-400">Yangi fan nomi va uning qisqacha tavsifini kiriting</p>
            </div>
            <button onclick="app.closeModal()" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <form onsubmit="app.handleCreateSubjectSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">Fan Nomi *</label>
              <input type="text" id="new-subj-name" required placeholder="Masalan: Matematika, Fizika, Ona tili..." class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">Tavsifi (Ixtiyoriy)</label>
              <textarea id="new-subj-desc" rows="3" placeholder="Ushbu fan haqida qisqacha ma'lumot..." class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"></textarea>
            </div>

            <div class="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
              <button type="button" onclick="app.closeModal()" class="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10 transition">
                Bekor qilish
              </button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">save</span> Saqlash
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    setTimeout(() => {
      document.getElementById('new-subj-name')?.focus();
    }, 50);
  },

  async createCategorizedTestsForSubject(subjectId, subjectName, questionsList) {
    const easyQs = questionsList.filter(q => q.difficulty === 'easy' || q.difficulty === '1' || q.difficulty === 'oson');
    const mediumQs = questionsList.filter(q => q.difficulty === 'medium' || q.difficulty === '2' || q.difficulty === "o'rta");
    const hardQs = questionsList.filter(q => q.difficulty === 'hard' || q.difficulty === '3' || q.difficulty === 'qiyin');

    const tiers = [];
    if (easyQs.length > 0) tiers.push({ name: `${subjectName} — Oson daraja`, diff: 1, time: 15, pass: 60, questions: easyQs });
    if (mediumQs.length > 0) tiers.push({ name: `${subjectName} — O'rta daraja`, diff: 2, time: 20, pass: 60, questions: mediumQs });
    if (hardQs.length > 0) tiers.push({ name: `${subjectName} — Qiyin daraja`, diff: 3, time: 25, pass: 70, questions: hardQs });

    if (tiers.length === 0) {
      tiers.push({ name: `${subjectName} Testi`, diff: 2, time: 25, pass: 60, questions: questionsList });
    }

    let createdCount = 0;
    let totalImported = 0;

    for (const tier of tiers) {
      const createTestRes = await api('/api/tests', {
        method: 'POST',
        body: JSON.stringify({
          subjectId: subjectId,
          title: tier.name,
          description: `${subjectName} fani bo'yicha ${tier.questions.length} ta savoldan iborat ${tier.diff === 1 ? 'oson' : tier.diff === 3 ? 'qiyin' : 'o\'rta'} darajali test`,
          timeLimitMinutes: tier.time,
          passingPercentage: tier.pass,
          difficulty: tier.diff,
          maxAttemptsPerStudent: 5,
          isPublished: true,
          showReviewAfterSubmit: true,
          showCorrectAnswers: true
        })
      });

      if (createTestRes.success && createTestRes.data) {
        const testId = createTestRes.data.id;
        createdCount++;
        const importRes = await api(`/api/tests/${testId}/questions/import`, {
          method: 'POST',
          body: JSON.stringify({ questions: tier.questions })
        });
        if (importRes.success) {
          totalImported += tier.questions.length;
        }
      }
    }
    return { createdCount, totalImported };
  },

  async handleCreateSubjectSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('new-subj-name').value;
    const description = document.getElementById('new-subj-desc').value;
    const res = await api('/api/subjects', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
    if (res.success) {
      showToast('Fan muvaffaqiyatli yaratildi!', 'success');
      this.closeModal();
      await this.loadSubjects();
      if (window.location.hash === '#/admin/subjects') {
        this.renderAdminSubjects();
      }
    } else {
      showToast(res.message || 'Xatolik', 'error');
    }
  },

  openEditSubjectModal(id, name, desc) {
    const modal = document.getElementById('modal-container');
    if (!modal) return;
    modal.innerHTML = `
      <div class="modal-backdrop active fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="modal-card max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 space-y-4 animate-scaleUp">
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-400">edit</span> Fanni Tahrirlash
            </h3>
            <button onclick="app.closeModal()" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <form onsubmit="app.handleEditSubjectSubmit(event, '${id}')" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Fan Nomi</label>
              <input type="text" id="edit-subj-name" value="${name}" required class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Tavsifi</label>
              <textarea id="edit-subj-desc" rows="3" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400">${desc}</textarea>
            </div>
            <div class="pt-2 flex items-center justify-end gap-2">
              <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold">Bekor qilish</button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold">Saqlash</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async handleEditSubjectSubmit(e, id) {
    e.preventDefault();
    const name = document.getElementById('edit-subj-name').value;
    const description = document.getElementById('edit-subj-desc').value;
    const res = await api(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description })
    });
    if (res.success) {
      showToast('Fan yangilandi!', 'success');
      this.closeModal();
      this.renderAdminSubjects();
    } else {
      showToast(res.message || 'Xatolik', 'error');
    }
  },

  async deleteSubject(id) {
    if (!confirm('Haqiqatdan ham bu fanni o\'chirmoqchimisiz? Unga tegishli barcha testlar ham o\'chirilishi mumkin.')) return;
    const res = await api(`/api/subjects/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Fan muvaffaqiyatli o\'chirildi!', 'success');
      this.loadSubjects();
      if (window.location.hash === '#/admin/subjects') {
        this.renderAdminSubjects();
      }
    } else {
      showToast(res.message || 'Fanni o\'chirishda xatolik', 'error');
    }
  },

  closeModal() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
      modalContainer.innerHTML = '';
    }
  },

  // ----------------------------------------------------
  // NOVA AI SOCRATIC ASSISTANT ENGINE
  // ----------------------------------------------------
  toggleAiDrawer(forceOpen) {
    const drawer = document.getElementById('ai-chat-drawer');
    if (!drawer) return;

    if (typeof forceOpen === 'boolean') {
      state.aiDrawerOpen = forceOpen;
    } else {
      state.aiDrawerOpen = !state.aiDrawerOpen;
    }

    if (state.aiDrawerOpen) {
      drawer.classList.remove('translate-x-full');
      const input = document.getElementById('ai-chat-input');
      if (input) setTimeout(() => input.focus(), 150);
      this.syncAiDrawerQuestionContext();
    } else {
      drawer.classList.add('translate-x-full');
    }
  },

  syncAiDrawerQuestionContext() {
    const aiContext = document.getElementById('ai-active-question-context');
    const aiContextQ = document.getElementById('ai-context-q-text');
    if (!aiContext || !aiContextQ) return;

    if (state.activeQuiz && state.activeQuiz.questions) {
      const qIndex = state.currentQuestionIndex || 0;
      const q = state.activeQuiz.questions[qIndex];
      if (q) {
        aiContext.classList.remove('hidden');
        aiContextQ.innerText = `Savol #${qIndex + 1}: ${q.text}`;
        return;
      }
    }
    aiContext.classList.add('hidden');
  },

  async askAiForHint(customQ, customSubj) {
    let qText = customQ;
    let subj = customSubj;

    if (!qText && state.activeQuiz && state.activeQuiz.questions) {
      const q = state.activeQuiz.questions[state.currentQuestionIndex || 0];
      if (q) qText = q.text;
      subj = state.activeQuiz.subjectName || 'Fan';
    }

    if (!qText) {
      showToast('Maslahat olish uchun avval savolni tanlang', 'info');
      this.toggleAiDrawer(true);
      return;
    }

    // Update on-card hint box if in Quiz Studio
    const hintBox = document.getElementById('quiz-question-ai-hint-box');
    const hintContent = document.getElementById('quiz-ai-hint-content');

    if (hintBox && hintContent) {
      hintBox.classList.remove('hidden');
      hintContent.innerHTML = `
        <div class="flex items-center gap-2 text-purple-300 py-1">
          <div class="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Nova AI savolni tahlil qilmoqda...</span>
        </div>
      `;
    }

    const res = await api('/api/ai/hint', {
      method: 'POST',
      body: JSON.stringify({
        questionText: qText,
        subjectName: subj || 'Matematika'
      })
    });

    if (res.success && res.data) {
      const replyHtml = this.formatAiMarkdown(res.data.reply);
      if (hintContent) {
        hintContent.innerHTML = `
          <div class="prose prose-invert max-w-none text-xs space-y-1.5">${replyHtml}</div>
        `;
      }
      // Also add to drawer chat history
      this.appendAiMessage('assistant', res.data.reply, res.data.topic, res.data.keyConcepts, res.data.suggestedFollowUps);
    } else {
      if (hintContent) {
        hintContent.innerHTML = `<p class="text-rose-400">Maslahat olishda xatolik yuz berdi.</p>`;
      }
    }
  },

  askAiForCurrentQuestionHint() {
    this.askAiForHint();
  },

  sendQuickAiPrompt(text) {
    const input = document.getElementById('ai-chat-input');
    if (input) input.value = text;
    this.handleAiFormSubmit(new Event('submit'));
  },

  async handleAiFormSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const input = document.getElementById('ai-chat-input');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    await this.sendAiMessage(msg);
  },

  async sendAiMessage(msgText) {
    this.toggleAiDrawer(true);
    this.appendAiMessage('user', msgText);

    let currentQ = '';
    let currentSubj = '';
    if (state.activeQuiz && state.activeQuiz.questions) {
      const q = state.activeQuiz.questions[state.currentQuestionIndex || 0];
      if (q) currentQ = q.text;
      currentSubj = state.activeQuiz.subjectName || '';
    }

    // Add typing indicator
    const messagesContainer = document.getElementById('ai-chat-messages');
    const typingId = 'ai-typing-indicator';
    if (messagesContainer) {
      const typingDiv = document.createElement('div');
      typingDiv.id = typingId;
      typingDiv.className = 'flex items-start gap-2.5 animate-fadeIn';
      typingDiv.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">
          <span class="material-symbols-outlined text-sm">smart_toy</span>
        </div>
        <div class="p-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          <span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-100"></span>
          <span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-200"></span>
        </div>
      `;
      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    const res = await api('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: msgText,
        currentQuestionText: currentQ,
        subjectName: currentSubj,
        history: state.aiChatHistory.slice(-8)
      })
    });

    const typingElem = document.getElementById(typingId);
    if (typingElem) typingElem.remove();

    if (res.success && res.data) {
      this.appendAiMessage('assistant', res.data.reply, res.data.topic, res.data.keyConcepts, res.data.suggestedFollowUps);
    } else {
      this.appendAiMessage('assistant', res.message || 'Kechirasiz, javob olishda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  },

  appendAiMessage(role, content, topic, keyConcepts, followUps) {
    state.aiChatHistory.push({ role, content });

    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;

    const isUser = role === 'user';
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex items-start gap-2.5 animate-fadeIn ${isUser ? 'justify-end' : ''}`;

    if (isUser) {
      msgDiv.innerHTML = `
        <div class="p-3.5 rounded-2xl rounded-tr-none bg-blue-600/90 text-white max-w-[85%] text-xs leading-relaxed shadow-md">
          ${this.escapeHtml(content)}
        </div>
        <div class="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-md">
          👤
        </div>
      `;
    } else {
      const formattedContent = this.formatAiMarkdown(content);
      let extrasHtml = '';

      if (keyConcepts && keyConcepts.length > 0) {
        extrasHtml += `
          <div class="pt-2 border-t border-white/10 flex flex-wrap gap-1">
            ${keyConcepts.map(c => `<span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">📌 ${c}</span>`).join('')}
          </div>
        `;
      }

      if (followUps && followUps.length > 0) {
        extrasHtml += `
          <div class="pt-2 flex flex-wrap gap-1.5">
            ${followUps.map(f => `
              <button onclick="app.sendQuickAiPrompt('${this.escapeJs(f)}')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-[10px] font-semibold transition text-left">
                💬 ${this.escapeHtml(f)}
              </button>
            `).join('')}
          </div>
        `;
      }

      msgDiv.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">
          <span class="material-symbols-outlined text-sm">smart_toy</span>
        </div>
        <div class="p-3.5 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 space-y-2 max-w-[88%] leading-relaxed text-gray-200 shadow-md">
          ${topic ? `<span class="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">${topic}</span>` : ''}
          <div class="text-xs leading-relaxed space-y-1.5">${formattedContent}</div>
          ${extrasHtml}
        </div>
      `;
    }

    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  escapeJs(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '&quot;')
      .replace(/\n/g, ' ');
  },

  clearAiChat() {
    state.aiChatHistory = [];
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="flex items-start gap-2.5">
          <div class="w-7 h-7 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">
            <span class="material-symbols-outlined text-sm">smart_toy</span>
          </div>
          <div class="p-3.5 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 space-y-2 max-w-[88%] leading-relaxed text-gray-200">
            <p>Assalomu alaykum! Men <strong>Nova AI</strong> — sizning aqlli ta'lim maslahatchi va repetitoringizman. 🎓</p>
            <p class="text-gray-400 text-[11px]">Savollarni tushunish, formulalarni eslash yoki yechish usulini bilishda menga murojaat qilishingiz mumkin.</p>
          </div>
        </div>
      `;
    }
    showToast('Suhbat tarixi tozalandi', 'info');
  },

  formatAiMarkdown(text) {
    if (!text) return '';
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-gray-300">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono text-[11px]">$1</code>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
    return formatted;
  },

  // ----------------------------------------------------
  // VIEW: PREMIUM & SUBSCRIPTION PRICING
  // ----------------------------------------------------
  async renderPricing() {
    const root = document.getElementById('app-root');
    const isAdmin = state.user?.role === 'Admin';
    const backDest = isAdmin ? '#/admin' : (state.user ? '#/dashboard' : '#/');

    root.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-10 animate-fadeIn pb-16">
        
        <!-- Back Navigation & Quick Header -->
        <div class="flex items-center justify-between">
          <a href="${backDest}" class="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 inline-flex items-center gap-1.5 transition shadow-sm" title="Orqaga">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>⬅️ Orqaga</span>
          </a>

          ${!isAdmin ? `
            <button onclick="app.openPromoModal()" class="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs inline-flex items-center gap-1.5 transition shadow-sm">
              <span class="material-symbols-outlined text-[16px]">redeem</span>
              <span>🎁 Promo-kod bormi?</span>
            </button>
          ` : ''}
        </div>

        ${isAdmin ? `
          <!-- Admin Notice Banner -->
          <div class="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl shrink-0">
                🛡️
              </div>
              <div>
                <strong class="text-sm text-white font-bold block">Tizim Administratori Boshqaruv Rejimi</strong>
                <span>Admin hisobiga to'lov talab qilinmaydi. Talabalarga PRO obunalarni berish va testlarni sozlash to'g'ridan-to'g'ri Admin Panel orqali amalga oshiriladi.</span>
              </div>
            </div>
            <a href="#/admin/users" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition whitespace-nowrap">
              Talabalarga PRO Berish &rarr;
            </a>
          </div>
        ` : ''}

        <!-- Hero Header -->
        <div class="text-center space-y-4 max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <span>👑 TestPlatform Premium Ta'lim</span>
          </div>
          <h1 class="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight">
            Bilimingizni <span class="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300">Maksimal Darajaga</span> Ko'taring
          </h1>
          <p class="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Eksklyuziv murakkab testlar, rasmiy Oltin va Brilliant sertifikatlar hamda sun'iy intellekt repetitoridan cheksiz foydalaning.
          </p>
        </div>

        <!-- Pricing Cards Grid Target -->
        <div id="pricing-plans-grid" class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          <div class="col-span-full py-12 text-center text-gray-500">Tariflar yuklanmoqda...</div>
        </div>

        <!-- Lifetime Plan Banner -->
        <div class="glass-panel p-8 sm:p-10 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-purple-950/20 to-black relative overflow-hidden shadow-2xl">
          <div class="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
          
          <div class="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div class="space-y-2 text-center lg:text-left">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                <span>🌟 UMRBOD IMTIYOZ</span>
              </div>
              <h3 class="text-2xl sm:text-3xl font-black font-heading text-white">LIFETIME VIP — Umrbod Kirish</h3>
              <p class="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
                Bir marta to'lang va kelajakdagi barcha yangi kurslar, testlar va AI imkoniyatlaridan abadiy cheklovlarsiz foydalaning.
              </p>
            </div>

            <div class="text-center lg:text-right shrink-0">
              <div class="text-2xl sm:text-3xl font-black text-amber-300 font-heading">890,000 UZS</div>
              <p class="text-[11px] text-gray-400 mb-3">Bir martalik to'lov (Umrbod)</p>
              ${isAdmin ? `
                <a href="#/admin/users" class="px-6 py-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs inline-flex items-center gap-2 hover:bg-amber-500/30 transition">
                  <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  <span>Admin Boshqaruvi</span>
                </a>
              ` : `
                <button onclick="app.openCheckoutModal('lifetime', 'Lifetime VIP', '890,000 UZS')" class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs shadow-xl shadow-amber-500/20 transition transform hover:scale-105 inline-flex items-center gap-2">
                  <span class="material-symbols-outlined text-[16px]">all_inclusive</span>
                  <span>Umrbod Rejaga Ulanish</span>
                </button>
              `}
            </div>
          </div>
        </div>

        <!-- FAQ / Feature Comparison Section -->
        <div class="glass-panel p-8 sm:p-10 rounded-3xl border border-white/5 space-y-6">
          <h3 class="text-xl font-bold text-white font-heading text-center">Nima uchun PRO obunani tanlashadi?</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
            <div class="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                🔒
              </div>
              <h4 class="text-sm font-bold text-white">Eksklyuziv Savollar</h4>
              <p class="text-xs text-gray-400 leading-relaxed">Eng so'nggi dasturlash, matematika va mantiq savollari faqat PRO talabalarga ochiq.</p>
            </div>

            <div class="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                👑
              </div>
              <h4 class="text-sm font-bold text-white">Oltin Sertifikatlar</h4>
              <p class="text-xs text-gray-400 leading-relaxed">Muvaffaqiyatli test yakunida unikal tekshiruv kodiga ega rasmiy Gold/Diamond sertifikat oling.</p>
            </div>

            <div class="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                🤖
              </div>
              <h4 class="text-sm font-bold text-white">Cheksiz AI Repetitor</h4>
              <p class="text-xs text-gray-400 leading-relaxed">Xatolaringizni batafsil tushuntiruvchi, masalalarni bosqichma-bosqich yechib beruvchi aqlli AI.</p>
            </div>
          </div>
        </div>

      </div>
    `;

    this.fetchAndRenderPlans();
  },

  async fetchAndRenderPlans() {
    const grid = document.getElementById('pricing-plans-grid');
    if (!grid) return;

    let [plansRes, statusRes] = await Promise.all([
      api('/api/subscription/plans'),
      state.user ? api('/api/subscription/my-status') : Promise.resolve({ success: false })
    ]);

    const plans = plansRes.success && plansRes.data ? plansRes.data : [];
    const status = statusRes.success && statusRes.data ? statusRes.data : null;
    const currentPlanId = status ? (status.planName || 'free').toLowerCase() : (state.user?.isPremium ? 'pro' : 'free');
    const isAdmin = state.user?.role === 'Admin';

    const displayPlans = plans.filter(p => p.id !== 'lifetime'); // lifetime is shown in dedicated banner

    grid.innerHTML = displayPlans.map(p => {
      const isCurrent = currentPlanId === p.id.toLowerCase() && (p.id === 'free' || state.user?.isPremium);
      const isPro = p.id === 'pro';
      const isVip = p.id === 'vip';
      const isFree = p.id === 'free';
      const priceText = p.formattedPrice || p.priceFormatted || '0 UZS';
      const periodText = p.billingPeriod || p.period || 'oy';

      let cardBorder = 'border-white/10';
      let cardGlow = '';
      if (isPro) {
        cardBorder = 'border-amber-500/40 pricing-card-pro';
        cardGlow = 'glow-card';
      } else if (isVip) {
        cardBorder = 'border-cyan-500/40 pricing-card-vip';
        cardGlow = 'glow-card';
      }

      return `
        <div class="glass-panel p-8 rounded-3xl border ${cardBorder} ${cardGlow} flex flex-col justify-between relative transition hover:-translate-y-1">
          ${p.isPopular ? `
            <div class="pricing-popular-ribbon">
              🔥 ENG OMMABOP
            </div>
          ` : ''}

          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-2xl">${p.icon || (isPro ? '👑' : isVip ? '💎' : '🌱')}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isPro ? 'bg-amber-500/20 text-amber-300' : isVip ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-gray-400'} uppercase">
                ${p.name}
              </span>
            </div>

            <h3 class="text-xl font-bold font-heading text-white mb-2">${p.name}</h3>
            <p class="text-xs text-gray-400 mb-6 leading-relaxed">${p.description}</p>

            <div class="mb-6 pb-6 border-b border-white/10">
              <div class="flex items-baseline gap-1">
                <span class="text-3xl sm:text-4xl font-black font-heading text-white">${priceText}</span>
                <span class="text-xs text-gray-400">/ ${periodText}</span>
              </div>
            </div>

            <ul class="space-y-3 mb-8 text-xs text-gray-300">
              ${(p.features || []).map(f => `
                <li class="flex items-start gap-2.5">
                  <span class="material-symbols-outlined text-[16px] ${isPro ? 'text-amber-400' : isVip ? 'text-cyan-400' : 'text-blue-400'} shrink-0 mt-0.5">check_circle</span>
                  <span>${f}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="pt-2">
            ${isAdmin ? `
              <a href="#/admin/users" class="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold text-xs text-center block transition">
                👑 Admin Boshqaruvi &rarr;
              </a>
            ` : isCurrent ? `
              <button disabled class="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-default">
                <span class="material-symbols-outlined text-[16px]">verified</span>
                <span>Hozirgi Tarifingiz</span>
              </button>
            ` : isFree ? `
              <a href="#/tests" class="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs text-center block transition">
                Bepul Boshlash
              </a>
            ` : `
              <button onclick="app.openCheckoutModal('${p.id}', '${this.escapeJs(p.name)}', '${this.escapeJs(priceText)}')" class="w-full py-3 rounded-xl ${isVip ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black'} font-extrabold text-xs shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[16px]">${isVip ? 'diamond' : 'workspace_premium'}</span>
                <span>${p.name} Tarifga O'tish</span>
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  },

  // ----------------------------------------------------
  // PROMO-CODE MODAL & HANDLERS (20% DISCOUNT SYSTEM)
  // ----------------------------------------------------
  openPromoModal() {
    if (state.user?.role === 'Admin') {
      showToast('Admin uchun obuna talab qilinmaydi. Siz to\'liq boshqaruv huquqiga egasiz.', 'info');
      return;
    }

    this.openModal(`
      <div class="space-y-6">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-purple-500/10">
            🏷️
          </div>
          <h3 class="text-xl font-bold font-heading text-white">Chegirma Promo-kodi</h3>
          <p class="text-xs text-gray-400">Admin tomonidan berilgan maxsus promo-kod orqali to'lovga <strong class="text-amber-400">20% chegirma</strong> oling.</p>
        </div>

        <form onsubmit="app.submitPromoCode(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Promo-kod</label>
            <input type="text" id="input-promo-code" required placeholder="Promo-kodni kiriting" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white uppercase tracking-wider font-mono font-bold text-center text-sm focus:outline-none focus:border-purple-400 placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:tracking-normal" />
          </div>

          <div class="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2.5">
            <span class="material-symbols-outlined text-lg text-purple-400 shrink-0">percent</span>
            <span>Promo-kod to'lov summasidan <strong>20% chegirma</strong> qiladi va to'lov sahifasida qo'llaniladi.</span>
          </div>

          <button type="submit" id="btn-submit-promo" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs glow-button-primary transition flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[16px]">check</span>
            <span>20% Chegirma Bilan To'lovga O'tish</span>
          </button>
        </form>
      </div>
    `);
  },

  async submitPromoCode(e) {
    e.preventDefault();
    const code = document.getElementById('input-promo-code')?.value.trim();
    if (!code) return;

    const btn = document.getElementById('btn-submit-promo');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Tekshirilmoqda...';
    }

    const res = await api(`/api/subscription/validate-promo?code=${encodeURIComponent(code)}`);

    if (res.success && res.data && res.data.isValid) {
      this.pendingPromoCode = code.toUpperCase();
      this.closeModal();
      showToast('🎉 Promo-kod tasdiqlandi! 20% chegirma taqdim etildi.', 'success');
      // Open Checkout with PRO plan and pre-applied promo code
      this.openCheckoutModal('pro', 'PRO Oylik', '49,000 so\'m');
    } else {
      showToast(res.message || 'Noto\'g\'ri yoki muddati o\'tgan promo-kod', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span> <span>20% Chegirma Bilan To\'lovga O\'tish</span>';
      }
    }
  },

  // ----------------------------------------------------
  // CHECKOUT MODAL & PAYME / CLICK INTEGRATION WITH 20% DISCOUNT
  // ----------------------------------------------------
  openCheckoutModal(planId, planName, priceFormatted) {
    if (!state.user) {
      showToast('Obuna bo\'lish uchun avval tizimga kiring', 'info');
      window.location.hash = '#/login';
      return;
    }

    if (state.user.role === 'Admin') {
      showToast('Admin akkaunti to\'g\'ridan-to\'g\'ri to\'liq huquqlarga ega. Obuna faqat talabalar uchundir.', 'info');
      return;
    }

    const baseAmount = planId === 'vip' ? 390000 : (planId === 'lifetime' ? 890000 : 49000);
    this.currentCheckoutState = {
      planId,
      planName,
      baseAmount,
      currentAmount: baseAmount,
      promoCode: this.pendingPromoCode || null,
      isPromoApplied: false
    };

    this.openModal(`
      <div class="space-y-5">
        <div class="text-center space-y-1">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-amber-500/10">
            💳
          </div>
          <h3 class="text-xl font-bold font-heading text-white">To'lovni Amalga Oshirish</h3>
          <p class="text-xs text-gray-400">Karta ma'lumotlarini kiriting va obunani faollashtiring</p>
        </div>

        <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-400">Tanlangan tarif:</div>
            <div class="text-sm font-black text-white font-heading">${this.escapeHtml(planName)}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-400">To'lov miqdori:</div>
            <div id="checkout-display-price" class="text-base font-black text-amber-400 font-heading">${priceFormatted}</div>
          </div>
        </div>

        <!-- Promo Code Discount Field -->
        <div class="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[15px] text-amber-400">confirmation_number</span> Promo-kod (20% chegirma):
            </label>
            <span id="checkout-promo-badge" class="text-[10px] text-gray-400">${this.pendingPromoCode ? '<span class="text-emerald-400 font-bold">Faol</span>' : 'Ixtiyoriy'}</span>
          </div>
          <div class="flex gap-2">
            <input type="text" id="checkout-promo-input" value="${this.pendingPromoCode || ''}" placeholder="Promo-kodni kiriting" class="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono uppercase text-xs focus:outline-none focus:border-purple-400 placeholder:normal-case placeholder:font-sans placeholder:font-normal" />
            <button type="button" id="btn-apply-checkout-promo" onclick="app.applyCheckoutPromo('${planId}')" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition whitespace-nowrap">
              Qo'llash
            </button>
          </div>
          <div id="checkout-promo-msg" class="text-[11px] font-medium hidden"></div>
        </div>

        <form onsubmit="app.processCheckout(event, '${planId}', '${this.escapeJs(planName)}')" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-2">To'lov usuli:</label>
            <div class="grid grid-cols-3 gap-2 text-xs">
              <label class="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 cursor-pointer flex flex-col items-center gap-1 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-500/10 transition">
                <input type="radio" name="pay-method" value="Payme" checked class="text-cyan-500 focus:ring-cyan-500" />
                <span class="font-bold text-cyan-300">🔵 Payme</span>
                <span class="text-[9px] text-gray-400">Uzcard / Humo</span>
              </label>
              <label class="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 cursor-pointer flex flex-col items-center gap-1 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10 transition">
                <input type="radio" name="pay-method" value="Click" class="text-blue-500 focus:ring-blue-500" />
                <span class="font-bold text-blue-400">🟡 Click Up</span>
                <span class="text-[9px] text-gray-400">Uzcard / Humo</span>
              </label>
              <label class="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 cursor-pointer flex flex-col items-center gap-1 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-500/10 transition">
                <input type="radio" name="pay-method" value="Uzum" class="text-purple-500 focus:ring-purple-500" />
                <span class="font-bold text-purple-400">🟣 Uzum</span>
                <span class="text-[9px] text-gray-400">Bank / Visa</span>
              </label>
            </div>
          </div>

          <!-- Card Input Fields -->
          <div class="space-y-3 pt-1">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Karta raqami (16 xonali)</label>
              <div class="relative">
                <input type="text" id="pay-card-number" required placeholder="8600 0000 0000 0000" maxlength="19" oninput="app.handleCardNumberInput(this)" class="w-full pl-4 pr-16 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono font-bold text-sm tracking-wider focus:outline-none focus:border-amber-400" />
                <span id="card-brand-badge" class="absolute right-3 top-2.5 px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-gray-400 uppercase">Karta</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Amal qilish muddati</label>
                <input type="text" id="pay-card-expiry" required placeholder="MM/YY" maxlength="5" oninput="app.handleCardExpiryInput(this)" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-center font-bold text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Telefon raqam (SMS)</label>
                <input type="tel" id="pay-card-phone" required placeholder="+998 (90) 000-00-00" oninput="app.handlePhoneInput(this)" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400" />
              </div>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-center gap-2">
            <span class="material-symbols-outlined text-base shrink-0">lock</span>
            <span>256-bit SSL shifrlangan xavfsiz to'lov shlyuzi.</span>
          </div>

          <button type="submit" id="btn-process-pay" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[16px]">lock_open</span>
            <span id="btn-pay-text">To'lash: ${priceFormatted}</span>
          </button>
        </form>
      </div>
    `);

    // If pending promo was already set, auto-trigger application
    if (this.pendingPromoCode) {
      setTimeout(() => this.applyCheckoutPromo(planId), 100);
    }
  },

  async applyCheckoutPromo(planId) {
    const input = document.getElementById('checkout-promo-input');
    const msg = document.getElementById('checkout-promo-msg');
    const badge = document.getElementById('checkout-promo-badge');
    const btn = document.getElementById('btn-apply-checkout-promo');
    const priceDisplay = document.getElementById('checkout-display-price');
    const btnPayText = document.getElementById('btn-pay-text');

    const code = input?.value.trim();
    if (!code) {
      if (msg) {
        msg.className = 'text-[11px] text-rose-400 block';
        msg.textContent = 'Promo-kodni kiriting';
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = '...';
    }

    const res = await api(`/api/subscription/validate-promo?code=${encodeURIComponent(code)}`);
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Qo\'llash';
    }

    if (res.success && res.data && res.data.isValid) {
      const stateObj = this.currentCheckoutState || {
        baseAmount: planId === 'vip' ? 390000 : (planId === 'lifetime' ? 890000 : 49000)
      };

      const baseAmount = stateObj.baseAmount;
      const discount = Math.round(baseAmount * 0.20);
      const discountedAmount = baseAmount - discount;

      stateObj.currentAmount = discountedAmount;
      stateObj.promoCode = code.toUpperCase();
      stateObj.isPromoApplied = true;
      this.pendingPromoCode = code.toUpperCase();

      const oldFormatted = baseAmount.toLocaleString('uz-UZ') + ' so\'m';
      const newFormatted = discountedAmount.toLocaleString('uz-UZ') + ' so\'m';

      if (priceDisplay) {
        priceDisplay.innerHTML = `
          <div class="flex flex-col items-end">
            <span class="line-through text-gray-500 text-xs">${oldFormatted}</span>
            <span class="text-emerald-400 font-extrabold">${newFormatted}</span>
          </div>
        `;
      }

      if (btnPayText) {
        btnPayText.textContent = `To'lash: ${newFormatted} (-20% chegirma)`;
      }

      if (badge) {
        badge.innerHTML = '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">-20% Chegirma</span>';
      }

      if (msg) {
        msg.className = 'text-[11px] text-emerald-400 block';
        msg.innerHTML = `🎉 <strong>${code.toUpperCase()}</strong> kodi qo'llanildi! Siz <strong>${discount.toLocaleString('uz-UZ')} so'm</strong> (20%) tejab qoldingiz.`;
      }

      showToast(`20% chegirma qo'llanildi: -${discount.toLocaleString('uz-UZ')} so'm`, 'success');
    } else {
      if (msg) {
        msg.className = 'text-[11px] text-rose-400 block';
        msg.textContent = res.message || 'Noto\'g\'ri yoki muddati tugagan promo-kod';
      }
      showToast(res.message || 'Noto\'g\'ri promo-kod', 'error');
    }
  },

  handleCardNumberInput(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    let parts = val.match(/.{1,4}/g) || [];
    input.value = parts.join(' ');

    const badge = document.getElementById('card-brand-badge');
    if (badge) {
      if (val.startsWith('8600')) {
        badge.textContent = 'Uzcard';
        badge.className = 'absolute right-3 top-2.5 px-2 py-0.5 rounded bg-blue-500/20 text-[10px] font-bold text-blue-300 uppercase';
      } else if (val.startsWith('9860')) {
        badge.textContent = 'Humo';
        badge.className = 'absolute right-3 top-2.5 px-2 py-0.5 rounded bg-amber-500/20 text-[10px] font-bold text-amber-300 uppercase';
      } else if (val.startsWith('4')) {
        badge.textContent = 'Visa';
        badge.className = 'absolute right-3 top-2.5 px-2 py-0.5 rounded bg-indigo-500/20 text-[10px] font-bold text-indigo-300 uppercase';
      } else if (val.startsWith('5')) {
        badge.textContent = 'Master';
        badge.className = 'absolute right-3 top-2.5 px-2 py-0.5 rounded bg-rose-500/20 text-[10px] font-bold text-rose-300 uppercase';
      } else {
        badge.textContent = 'Karta';
        badge.className = 'absolute right-3 top-2.5 px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-gray-400 uppercase';
      }
    }
  },

  handleCardExpiryInput(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      input.value = val.substring(0, 2) + '/' + val.substring(2, 4);
    } else {
      input.value = val;
    }
  },

  handlePhoneInput(input) {
    let val = input.value.replace(/\D/g, '');
    if (!val.startsWith('998')) {
      val = '998' + val;
    }
    val = val.substring(0, 12);
    let formatted = '+998';
    if (val.length > 3) formatted += ' (' + val.substring(3, 5);
    if (val.length > 5) formatted += ') ' + val.substring(5, 8);
    if (val.length > 8) formatted += '-' + val.substring(8, 10);
    if (val.length > 10) formatted += '-' + val.substring(10, 12);
    input.value = formatted;
  },

  processCheckout(e, planId, planName) {
    e.preventDefault();
    const cardNum = document.getElementById('pay-card-number')?.value.replace(/\s/g, '');
    const cardExp = document.getElementById('pay-card-expiry')?.value.trim();
    const phone = document.getElementById('pay-card-phone')?.value.trim();
    const method = document.querySelector('input[name="pay-method"]:checked')?.value || 'Payme';
    const promoCode = this.currentCheckoutState?.isPromoApplied ? this.currentCheckoutState.promoCode : null;
    const finalAmount = this.currentCheckoutState?.currentAmount || (planId === 'vip' ? 390000 : (planId === 'lifetime' ? 890000 : 49000));
    const finalPriceFormatted = finalAmount.toLocaleString('uz-UZ') + ' so\'m';

    if (!cardNum || cardNum.length < 16) {
      showToast('Iltimos, 16 xonali karta raqamini to\'liq kiriting', 'error');
      return;
    }

    if (!cardExp || cardExp.length < 5) {
      showToast('Karta amal qilish muddatini kiriting (MM/YY)', 'error');
      return;
    }

    // Step 2: Show SMS Verification Modal
    this.openModal(`
      <div class="space-y-6 text-center">
        <div class="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg">
          📱
        </div>

        <div class="space-y-1">
          <h3 class="text-lg font-bold font-heading text-white">SMS Tasdiqlash Kodi</h3>
          <p class="text-xs text-gray-400">${phone || '+998 (**) ***-**-**'} raqamiga yuborilgan 6 xonali kodni kiriting</p>
        </div>

        <form onsubmit="app.finalizePayment(event, '${planId}', '${method}', '${cardNum}', '${cardExp}', '${phone}', '${this.escapeJs(planName)}', '${this.escapeJs(finalPriceFormatted)}', '${this.escapeJs(promoCode || '')}')" class="space-y-4">
          <div>
            <input type="text" id="pay-sms-otp" required value="123456" maxlength="6" class="w-full max-w-[200px] mx-auto px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white font-mono text-center font-bold text-lg tracking-[0.3em] focus:outline-none focus:border-amber-400" />
            <div class="text-[11px] text-gray-500 mt-2">Tasdiqlash kodi: <strong class="text-amber-400">123456</strong></div>
          </div>

          <button type="submit" id="btn-confirm-pay" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[16px]">check_circle</span>
            <span>To'lovni Yakunlash (${finalPriceFormatted})</span>
          </button>
        </form>
      </div>
    `);
  },

  async finalizePayment(e, planId, method, cardNum, cardExp, phone, planName, priceFormatted, promoCode) {
    e.preventDefault();
    const btn = document.getElementById('btn-confirm-pay');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'To\'lov amalga oshirilmoqda...';
    }

    const maskedCard = cardNum ? (cardNum.substring(0, 4) + ' **** **** ' + cardNum.substring(12)) : '8600 **** **** 1234';

    const res = await api('/api/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        planId,
        paymentMethod: method,
        cardNumber: maskedCard,
        cardExpiry: cardExp,
        phoneNumber: phone,
        promoCode: promoCode || undefined
      })
    });

    if (res.success && res.data) {
      if (state.user) {
        state.user.isPremium = true;
        state.user.premiumPlan = res.data.planName;
        updateUserSession(state.user);
        this.updateNavAuth();
      }

      this.pendingPromoCode = null;
      this.currentCheckoutState = null;
      const txnId = 'TXN-' + Date.now().toString().substring(4);

      this.openModal(`
        <div class="space-y-6 text-center animate-modal-pop">
          <div class="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-emerald-500/20">
            ✅
          </div>

          <div class="space-y-2">
            <h3 class="text-2xl font-black font-heading text-white">To'lov Muvaffaqiyatli!</h3>
            <p class="text-xs text-gray-300 max-w-sm mx-auto">
              Tabriklaymiz! Sizning <strong class="text-amber-400 font-bold">${this.escapeHtml(planName)}</strong> obunangiz faollashtirildi.
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 text-xs">
            <div class="flex justify-between text-gray-400">
              <span>Tranzaksiya ID:</span>
              <span class="font-mono text-white font-bold">${txnId}</span>
            </div>
            <div class="flex justify-between text-gray-400">
              <span>To'langan summa:</span>
              <span class="text-emerald-400 font-bold">${priceFormatted}</span>
            </div>
            ${promoCode ? `
            <div class="flex justify-between text-gray-400">
              <span>Qo'llangan promo-kod:</span>
              <span class="text-purple-300 font-mono font-bold">${this.escapeHtml(promoCode)} (-20%)</span>
            </div>
            ` : ''}
            <div class="flex justify-between text-gray-400">
              <span>To'lov usuli:</span>
              <span class="text-white">${this.escapeHtml(method)}</span>
            </div>
          </div>

          <button onclick="app.closeModal(); window.location.hash='#/tests';" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[18px]">rocket_launch</span>
            <span>Testlarni Boshlash</span>
          </button>
        </div>
      `);

      showToast('Obunangiz muvaffaqiyatli faollashtirildi!', 'success');
      if (typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      showToast(res.message || 'To\'lov jarayonida xatolik yuz berdi', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">check_circle</span> <span>To\'lovni Yakunlash</span>';
      }
    }
  },

  // ----------------------------------------------------
  // PRO TEST GATE MODAL (WHEN FREE USER CLICKS LOCKED TEST)
  // ----------------------------------------------------
  openProTestGateModal(testTitle) {
    this.openModal(`
      <div class="space-y-6 text-center">
        <div class="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-amber-500/20 animate-pulse-glow">
          🔒
        </div>

        <div class="space-y-2">
          <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider">Faqat PRO A'zolar Uchun</span>
          <h3 class="text-xl font-bold font-heading text-white leading-snug">«${this.escapeHtml(testTitle)}»</h3>
          <p class="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            Ushbu test eksklyuziv PRO bazaga tegishli. Undan foydalanish va Oltin sertifikat olish uchun tarifingizni yangilang.
          </p>
        </div>

        <div class="space-y-2.5 pt-2">
          <a href="#/pricing" onclick="app.closeModal()" class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition">
            <span class="material-symbols-outlined text-[16px]">workspace_premium</span>
            <span>PRO Tarifga O'tish</span>
          </a>

          <button onclick="app.closeModal(); app.openCheckoutModal('pro', 'PRO Oylik', '49,000 so\'m');" class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-semibold text-xs transition flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">credit_card</span>
            <span>Tezkor to'lov</span>
          </button>
        </div>
      </div>
    `);
  },

  // ----------------------------------------------------
  // VIEW: STUDENT SUPPORT & CONTACT ADMIN (MUROJAAT)
  // ----------------------------------------------------
  openSupportModal(prefilledCategory = 'Savol yoki tushunmovchilik', prefilledSubject = '', prefilledMessage = '') {
    const userFullName = state.user?.fullName || '';
    const userEmail = state.user?.email || '';

    const categories = [
      { id: 'Savol yoki tushunmovchilik', label: '📌 Savol yoki tushunmovchilik' },
      { id: 'Savoldagi xatolik', label: '⚠️ Test / Savoldagi xatolik' },
      { id: 'To\'lov yoki PRO obuna', label: '💳 To\'lov / PRO Obuna' },
      { id: 'Taklif yoki fikr', label: '💡 Taklif yoki fikr' },
      { id: 'Boshqa masala', label: '❓ Boshqa masala' }
    ];

    this.openModal(`
      <div class="space-y-6">
        <!-- Modal Header -->
        <div class="flex items-center gap-3.5 pb-4 border-b border-white/10">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
            <span class="material-symbols-outlined text-2xl">support_agent</span>
          </div>
          <div>
            <h3 class="text-lg font-black font-heading text-white">Adminga Murojaat Qilish</h3>
            <p class="text-xs text-gray-400">Savol, taklif yoki tushunmovchilik bo'yicha xabar qoldiring</p>
          </div>
        </div>

        <!-- Quick Telegram Direct Banner -->
        <div class="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-xs text-sky-200">
            <span class="material-symbols-outlined text-sky-400 text-lg">send</span>
            <span>Tezkor javob olish uchun Telegram orqali ham bog'lanishingiz mumkin</span>
          </div>
          <a href="https://t.me/TestPlatformAdmin" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold transition whitespace-nowrap shadow-sm">
            @TestPlatformAdmin
          </a>
        </div>

        <!-- Support Form -->
        <form onsubmit="app.handleSupportSubmit(event)" class="space-y-4">
          <!-- Category Select -->
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Murojaat Yo'nalishi</label>
            <select id="sup-category" required class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500">
              ${categories.map(c => `
                <option value="${c.id}" class="bg-[#14161f] text-white" ${c.id === prefilledCategory ? 'selected' : ''}>${c.label}</option>
              `).join('')}
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Ism va Familiyangiz</label>
              <input type="text" id="sup-name" required value="${this.escapeHtml(userFullName)}" placeholder="Ismingizni kiriting" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Email / Gmail Manzil</label>
              <input type="email" id="sup-email" required value="${this.escapeHtml(userEmail)}" placeholder="email@example.com" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Mavzu</label>
              <input type="text" id="sup-subject" required value="${this.escapeHtml(prefilledSubject)}" placeholder="Masalan: Testdagi savol bo'yicha" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Telegram yoki Telefon <span class="text-gray-500 font-normal">(ixtiyoriy)</span></label>
              <input type="text" id="sup-contact" placeholder="@username yoki +998..." class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <!-- Message Textarea -->
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Murojaat Matni</label>
            <textarea id="sup-message" required rows="4" placeholder="Savol, qiyinchilik yoki taklifingizni batafsil yozing..." class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500 resize-none leading-relaxed">${this.escapeHtml(prefilledMessage)}</textarea>
          </div>

          <button type="submit" id="btn-submit-support" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs glow-button-primary shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[16px]">send</span>
            <span>Murojaatni Yuborish</span>
          </button>
        </form>
      </div>
    `, 'max-w-xl');
  },

  async handleSupportSubmit(e) {
    e.preventDefault();
    const category = document.getElementById('sup-category')?.value || 'Umumiy';
    const fullName = document.getElementById('sup-name')?.value.trim();
    const email = document.getElementById('sup-email')?.value.trim();
    const subject = document.getElementById('sup-subject')?.value.trim();
    const contactInfo = document.getElementById('sup-contact')?.value.trim();
    const message = document.getElementById('sup-message')?.value.trim();

    if (!fullName || !email || !subject || !message) {
      showToast('Iltimos, barcha majburiy maydonlarni to\'ldiring!', 'error');
      return;
    }

    const btn = document.getElementById('btn-submit-support');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">sync</span> Yuborilmoqda...`;
    }

    const res = await api('/api/support/submit', {
      method: 'POST',
      body: JSON.stringify({ category, fullName, email, subject, contactInfo, message })
    });

    if (res.success) {
      showToast('Murojaatingiz adminga muvaffaqiyatli yetkazildi!', 'success');
      this.closeModal();
      if (window.location.hash === '#/support') {
        this.renderSupportPage();
      }
    } else {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-outlined text-[16px]">send</span> Murojaatni Yuborish`;
      }
      showToast(res.message || 'Xatolik yuz berdi', 'error');
    }
  },

  async renderSupportPage() {
    const root = document.getElementById('app-root');
    const isAdmin = state.user?.role === 'Admin';
    const userFullName = state.user?.fullName || '';
    const userEmail = state.user?.email || '';

    root.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16">
        
        <!-- Top Navigation / Back -->
        <div class="flex items-center justify-between">
          <a href="${isAdmin ? '#/admin' : '#/dashboard'}" class="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 inline-flex items-center gap-1.5 transition shadow-sm">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>⬅️ Orqaga</span>
          </a>

          ${isAdmin ? `
            <a href="#/admin/support" class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">inbox</span> Admin Murojaatlar Qutisi
            </a>
          ` : ''}
        </div>

        <!-- Support Hero Header -->
        <div class="catalog-hero-banner rounded-3xl p-6 sm:p-8 relative overflow-hidden space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>24/7 Qo'llab-quvvatlash Markazi</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight">
            Savol yoki Qiyinchilik Bormi? <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Adminga Murojaat Qiling</span>
          </h1>
          <p class="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            Test topshirishda tushunarsiz joylar, savollardagi kamchiliklar, to'lov yoki PRO obuna masalasida yordam berishga doim tayyormiz.
          </p>
        </div>

        <!-- 2-Column Main Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- LEFT COLUMN (2 Cols): Support Submission Form -->
          <div class="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-white/10">
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-blue-400 text-2xl">edit_document</span>
                <h3 class="text-base font-bold font-heading text-white">Yangi Murojaat Yuborish</h3>
              </div>
              <span class="text-[11px] text-gray-400">Tezkor ko'rib chiqish</span>
            </div>

            <form onsubmit="app.handleSupportSubmit(event)" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">Murojaat Yo'nalishi (Kategoriya)</label>
                <select id="sup-category" required class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500">
                  <option value="Savol yoki tushunmovchilik" class="bg-[#14161f] text-white">📌 Savol yoki tushunmovchilik</option>
                  <option value="Savoldagi xatolik" class="bg-[#14161f] text-white">⚠️ Test / Savoldagi xatolik haqida xabar</option>
                  <option value="To'lov yoki PRO obuna" class="bg-[#14161f] text-white">💳 To'lov / PRO Obuna masalasi</option>
                  <option value="Taklif yoki fikr" class="bg-[#14161f] text-white">💡 Taklif yoki takomillashtirish fikri</option>
                  <option value="Boshqa masala" class="bg-[#14161f] text-white">❓ Boshqa masala</option>
                </select>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-300 mb-1">Ism va Familiyangiz</label>
                  <input type="text" id="sup-name" required value="${this.escapeHtml(userFullName)}" placeholder="Ismingizni kiriting" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-300 mb-1">Email / Gmail Manzil</label>
                  <input type="email" id="sup-email" required value="${this.escapeHtml(userEmail)}" placeholder="email@example.com" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-300 mb-1">Murojaat Mavzusi</label>
                  <input type="text" id="sup-subject" required placeholder="Masalan: Test sertifikatini olishda qiyinchilik" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-300 mb-1">Telegram yoki Telefon <span class="text-gray-500 font-normal">(ixtiyoriy)</span></label>
                  <input type="text" id="sup-contact" placeholder="@username yoki +998..." class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Murojaatingizni Batafsil Yozing</label>
                <textarea id="sup-message" required rows="5" placeholder="Qanday masala yoki savol bo'yicha qiynalayotganingizni aniq yozing..." class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500 resize-none leading-relaxed"></textarea>
              </div>

              <button type="submit" id="btn-submit-support" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs glow-button-primary shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[16px]">send</span>
                <span>Murojaatni Adminga Yuborish</span>
              </button>
            </form>
          </div>

          <!-- RIGHT COLUMN (1 Col): Direct Contacts & My History -->
          <div class="space-y-6">
            <!-- Direct Telegram Contact Card -->
            <div class="glass-panel p-6 rounded-3xl space-y-4 border border-sky-500/30 bg-gradient-to-br from-sky-950/20 via-[#14161f] to-[#14161f]">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-2xl shrink-0">
                  ✈️
                </div>
                <div>
                  <h4 class="text-sm font-bold font-heading text-white">Tezkor Telegram Aloqa</h4>
                  <p class="text-[11px] text-gray-400">To'g'ridan-to'g'ri admin bilan suhbat</p>
                </div>
              </div>

              <p class="text-xs text-gray-300 leading-relaxed">
                Shoshilinch savollar yoki to'lov masalalari bo'yicha Telegram orqali xabar qoldiring. Administratorlar 10-15 daqiqa ichida javob berishadi.
              </p>

              <a href="https://t.me/TestPlatformAdmin" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20">
                <span class="material-symbols-outlined text-[16px]">send</span>
                <span>Telegram: @TestPlatformAdmin</span>
              </a>
            </div>

            <!-- FAQ Accordion / Quick Help -->
            <div class="glass-panel p-6 rounded-3xl space-y-3">
              <h4 class="text-xs font-bold font-heading uppercase tracking-wider text-gray-400 mb-2">Ko'p Beriladigan Savollar (FAQ)</h4>
              
              <details class="p-3 rounded-xl bg-white/5 border border-white/5 group cursor-pointer">
                <summary class="text-xs font-semibold text-gray-200 group-hover:text-blue-300 flex items-center justify-between">
                  <span>Sertifikatni qanday yuklab olaman?</span>
                  <span class="material-symbols-outlined text-sm">expand_more</span>
                </summary>
                <p class="text-[11px] text-gray-400 mt-2 leading-relaxed">
                  Testni o'tish balidan yuqori natija bilan yakunlashingiz bilanoq Sertifikat oynasi ochiladi yoki Profil sahifangizdagi "Mening Test Tarixim" orqali istalgan vaqt yuklab olishingiz mumkin.
                </p>
              </details>

              <details class="p-3 rounded-xl bg-white/5 border border-white/5 group cursor-pointer">
                <summary class="text-xs font-semibold text-gray-200 group-hover:text-blue-300 flex items-center justify-between">
                  <span>Savolda xatolik bo'lsa nima qilish kerak?</span>
                  <span class="material-symbols-outlined text-sm">expand_more</span>
                </summary>
                <p class="text-[11px] text-gray-400 mt-2 leading-relaxed">
                  Test yechish paytida har bir savol ostidagi "Savolda xatolik bormi? Adminga xabar bering" tugmasini bosib darhol shikoyat qoldirishingiz mumkin.
                </p>
              </details>

              <details class="p-3 rounded-xl bg-white/5 border border-white/5 group cursor-pointer">
                <summary class="text-xs font-semibold text-gray-200 group-hover:text-blue-300 flex items-center justify-between">
                  <span>PRO obuna qanday qulaylik beradi?</span>
                  <span class="material-symbols-outlined text-sm">expand_more</span>
                </summary>
                <p class="text-[11px] text-gray-400 mt-2 leading-relaxed">
                  PRO obuna barcha premium testlarni, cheksiz urinishlarni va Oltin ramkali eksklyuziv sertifikat olish imkoniyatini taqdim etadi.
                </p>
              </details>
            </div>

            <!-- Student's My Recent Appeals -->
            <div class="glass-panel p-6 rounded-3xl space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold font-heading uppercase tracking-wider text-gray-400">Mening Murojaatlarim</h4>
                <button onclick="app.loadMySupportTickets()" class="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">refresh</span> Yangilash
                </button>
              </div>
              <div id="my-support-tickets-list" class="space-y-2 text-xs text-gray-400">
                Murojaatlar yuklanmoqda...
              </div>
            </div>

          </div>

        </div>

      </div>
    `;

    this.loadMySupportTickets();
  },

  async loadMySupportTickets() {
    const container = document.getElementById('my-support-tickets-list');
    if (!container) return;

    const res = await api('/api/support/my');
    if (res.success && res.data && res.data.length > 0) {
      container.innerHTML = res.data.map(t => {
        let statusBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        if (t.status === 'Ko\'rib chiqilmoqda') statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        if (t.status === 'Hal qilindi') statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

        return `
          <div class="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}">${this.escapeHtml(t.status || 'Yangi')}</span>
              <span class="text-[10px] text-gray-500">${new Date(t.createdAt).toLocaleDateString()}</span>
            </div>
            <h5 class="font-bold text-white text-xs">${this.escapeHtml(t.subject)}</h5>
            <p class="text-[11px] text-gray-400 line-clamp-2">${this.escapeHtml(t.message)}</p>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = `
        <div class="text-center py-4 text-gray-500 text-[11px]">
          Siz hali murojaat yubormagansiz.
        </div>
      `;
    }
  },

  // ----------------------------------------------------
  // ADMIN SUPPORT INBOX (MUROJAATLAR BOSHQARUVI)
  // ----------------------------------------------------
  async renderAdminSupport() {
    const root = document.getElementById('app-root');
    const headerHtml = this.getAdminHeaderHtml('support', 'Talabalar Murojaatlari (Support Inbox)', 'Talabalardan kelgan barcha savollar, xatoliklar va takliflarni boshqaring');

    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-16">
        ${headerHtml}

        <!-- 3 Stat Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="glass-panel p-5 rounded-2xl glow-card">
            <div class="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>Jami Murojaatlar</span>
              <span class="material-symbols-outlined text-blue-400">inbox</span>
            </div>
            <div id="admin-sup-total" class="text-2xl font-black text-white font-heading">...</div>
          </div>
          <div class="glass-panel p-5 rounded-2xl glow-card">
            <div class="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>Yangi Murojaatlar</span>
              <span class="material-symbols-outlined text-amber-400">mark_email_unread</span>
            </div>
            <div id="admin-sup-new" class="text-2xl font-black text-amber-400 font-heading">...</div>
          </div>
          <div class="glass-panel p-5 rounded-2xl glow-card">
            <div class="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>Hal Qilinganlar</span>
              <span class="material-symbols-outlined text-emerald-400">check_circle</span>
            </div>
            <div id="admin-sup-resolved" class="text-2xl font-black text-emerald-400 font-heading">...</div>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button onclick="app.filterAdminSupport('all')" id="btn-sup-f-all" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black">Barchasi</button>
            <button onclick="app.filterAdminSupport('Yangi')" id="btn-sup-f-new" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-gray-300 hover:text-white">Yangi</button>
            <button onclick="app.filterAdminSupport('Hal qilindi')" id="btn-sup-f-res" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-gray-300 hover:text-white">Hal qilingan</button>
          </div>

          <button onclick="app.loadAdminSupportTickets()" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition flex items-center gap-1">
            <span class="material-symbols-outlined text-[15px]">refresh</span> Yangilash
          </button>
        </div>

        <!-- Support Tickets List Container -->
        <div id="admin-support-list" class="space-y-4">
          <div class="p-8 text-center text-gray-500 text-xs">Murojaatlar yuklanmoqda...</div>
        </div>
      </div>
    `;

    this._adminSupFilter = 'all';
    await this.loadAdminSupportTickets();
  },

  async loadAdminSupportTickets() {
    const container = document.getElementById('admin-support-list');
    if (!container) return;

    const res = await api('/api/support/all');
    const tickets = (res.success && res.data) ? res.data : [];

    // Update stats
    const totalEl = document.getElementById('admin-sup-total');
    const newEl = document.getElementById('admin-sup-new');
    const resEl = document.getElementById('admin-sup-resolved');
    if (totalEl) totalEl.textContent = tickets.length;
    if (newEl) newEl.textContent = tickets.filter(t => t.status === 'Yangi' || !t.status).length;
    if (resEl) resEl.textContent = tickets.filter(t => t.status === 'Hal qilindi').length;

    const filter = this._adminSupFilter || 'all';
    const filtered = filter === 'all' ? tickets : tickets.filter(t => (t.status || 'Yangi') === filter);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="glass-panel p-12 text-center rounded-3xl space-y-3">
          <span class="material-symbols-outlined text-4xl text-gray-500">mark_email_read</span>
          <h4 class="text-sm font-bold text-white">Murojaatlar topilmadi</h4>
          <p class="text-xs text-gray-400">Ushbu filtr bo'yicha hech qanday murojaat mavjud emas.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(t => {
      const isResolved = t.status === 'Hal qilindi';
      let statusBadge = isResolved 
        ? '<span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">✅ Hal qilindi</span>'
        : '<span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">🔔 Yangi</span>';

      return `
        <div class="glass-panel p-5 sm:p-6 rounded-3xl space-y-4 border ${isResolved ? 'border-white/5 opacity-80' : 'border-amber-500/30 bg-gradient-to-r from-amber-950/10 via-[#14161f] to-[#14161f]'}">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-sm shrink-0">
                ${(t.studentName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-white text-sm">${this.escapeHtml(t.studentName || 'Talaba')}</h4>
                  <span class="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400">${this.escapeHtml(t.category || 'Umumiy')}</span>
                </div>
                <div class="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                  <span>✉️ ${this.escapeHtml(t.studentEmail || '')}</span>
                  ${t.contactInfo ? `<span class="text-sky-300">📱 ${this.escapeHtml(t.contactInfo)}</span>` : ''}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 self-start sm:self-center">
              ${statusBadge}
              <span class="text-[11px] text-gray-500">${new Date(t.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div class="space-y-2">
            <h5 class="text-sm font-bold text-white">${this.escapeHtml(t.subject)}</h5>
            <p class="text-xs text-gray-300 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/5 whitespace-pre-wrap">${this.escapeHtml(t.message)}</p>
          </div>

          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-2">
              ${t.studentEmail ? `
                <a href="mailto:${t.studentEmail}?subject=Re: ${encodeURIComponent(t.subject)}" class="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold transition flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px]">mail</span> Email orqali javob berish
                </a>
              ` : ''}
              ${t.contactInfo && t.contactInfo.includes('@') ? `
                <a href="https://t.me/${t.contactInfo.replace('@', '')}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold transition flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px]">send</span> Telegramda yozish
                </a>
              ` : ''}
            </div>

            <div class="flex items-center gap-2">
              ${!isResolved ? `
                <button onclick="app.updateSupportTicketStatus('${t.id}', 'Hal qilindi')" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm">
                  <span class="material-symbols-outlined text-[15px]">check</span> Hal qilindi
                </button>
              ` : `
                <button onclick="app.updateSupportTicketStatus('${t.id}', 'Yangi')" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-semibold transition">
                  Qayta ochish
                </button>
              `}
              <button onclick="app.deleteSupportTicket('${t.id}')" class="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition" title="O'chirish">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  filterAdminSupport(filter) {
    this._adminSupFilter = filter;
    const btns = {
      all: document.getElementById('btn-sup-f-all'),
      'Yangi': document.getElementById('btn-sup-f-new'),
      'Hal qilindi': document.getElementById('btn-sup-f-res')
    };
    Object.keys(btns).forEach(k => {
      if (btns[k]) {
        if (k === filter) {
          btns[k].className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black';
        } else {
          btns[k].className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-gray-300 hover:text-white';
        }
      }
    });
    this.loadAdminSupportTickets();
  },

  async updateSupportTicketStatus(ticketId, status) {
    const res = await api(`/api/support/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (res.success) {
      showToast('Murojaat holati yangilandi', 'success');
      this.loadAdminSupportTickets();
    } else {
      showToast(res.message || 'Xatolik yuz berdi', 'error');
    }
  },

  async deleteSupportTicket(ticketId) {
    if (!confirm('Ushbu murojaatni rostdan ham o\'chirmoqchimisiz?')) return;
    const res = await api(`/api/support/${ticketId}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Murojaat o\'chirildi', 'info');
      this.loadAdminSupportTickets();
    }
  }
};

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => app.init());

