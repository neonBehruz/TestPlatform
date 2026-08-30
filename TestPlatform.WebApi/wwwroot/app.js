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
function saveSession(token, user) {
  state.token = token || '';
  state.user = user || null;
  if (state.user) {
    const isAdmin = state.user.role === 'Admin' || state.user.role === 1 || (state.user.email || '').toLowerCase().includes('admin');
    const isTeacher = state.user.role === 'Teacher' || state.user.role === 3;
    if (isAdmin) {
      state.user.role = 'Admin';
      state.user.isPremium = true;
      state.user.premiumPlan = 'VIP';
    } else if (isTeacher) {
      state.user.role = 'Teacher';
      state.user.isPremium = false;
      state.user.premiumPlan = null;
    } else {
      state.user.role = 'Student';
      if (!state.user.hasPaidSubscription) {
        state.user.isPremium = false;
        state.user.premiumPlan = null;
      }
    }
  }
  if (token && state.user) {
    localStorage.setItem('tp_token', state.token);
    localStorage.setItem('tp_user', JSON.stringify(state.user));
    sessionStorage.setItem('tp_token', state.token);
    sessionStorage.setItem('tp_user', JSON.stringify(state.user));
  }
}

function updateUserSession(user) {
  state.user = user;
  if (state.user) {
    const isAdmin = state.user.role === 'Admin' || state.user.role === 1 || (state.user.email || '').toLowerCase().includes('admin');
    const isTeacher = state.user.role === 'Teacher' || state.user.role === 3;
    if (isAdmin) {
      state.user.role = 'Admin';
      state.user.isPremium = true;
      state.user.premiumPlan = 'VIP';
    } else if (isTeacher) {
      state.user.role = 'Teacher';
    } else {
      state.user.role = 'Student';
      if (!state.user.hasPaidSubscription) {
        state.user.isPremium = false;
        state.user.premiumPlan = null;
      }
    }
    localStorage.setItem('tp_user', JSON.stringify(state.user));
    sessionStorage.setItem('tp_user', JSON.stringify(state.user));
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
    return { icon: 'science', colorHex: '#6366f1', badge: 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30', glowBg: 'bg-indigo-600/20' };
  }
  if (n.includes('biologiya') || n.includes('tabiiy')) {
    return { icon: 'biotech', colorHex: '#10b981', badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30', glowBg: 'bg-emerald-500/20' };
  }
  if (n.includes('tarix') || n.includes('tarbiya')) {
    return { icon: 'account_balance', colorHex: '#8b5cf6', badge: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30', glowBg: 'bg-indigo-500/20' };
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

// Audit Log Recorder Helper
function recordAuditLog(action, entityName, entityId, details, userName) {
  try {
    let logs = JSON.parse(localStorage.getItem('tp_audit_logs') || '[]');
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userName: userName || state.user?.fullName || 'Tizim',
      action: action || 'ACTION',
      entityName: entityName || 'System',
      entityId: entityId ? String(entityId) : '',
      details: details || '',
      createdAt: new Date().toISOString()
    };
    logs.unshift(newLog);
    if (logs.length > 250) logs.length = 250;
    localStorage.setItem('tp_audit_logs', JSON.stringify(logs));
  } catch (e) {}
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

      if (raw && raw.subjects && Array.isArray(raw.subjects)) {
        raw.subjects.forEach((s, sIdx) => {
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
      }

      // Merge custom tests from localStorage
      try {
        const customTests = JSON.parse(localStorage.getItem('tp_custom_tests') || '[]');
        if (Array.isArray(customTests)) {
          customTests.forEach(ct => {
            if (!tests.some(t => t.id === ct.id)) tests.unshift(ct);
          });
        }
        const customSubjs = JSON.parse(localStorage.getItem('tp_custom_subjects') || '[]');
        if (Array.isArray(customSubjs)) {
          customSubjs.forEach(cs => {
            if (!subjects.some(s => s.id === cs.id)) subjects.push(cs);
          });
        }
      } catch (e) {}

      _standaloneData = { subjects, tests };
      return _standaloneData;
    }
  } catch (e) {
    console.warn('data/tests.json yuklanmadi:', e);
  }

  // Built-in emergency subjects & tests if file not fetched
  const fallbackSubjects = [
    { id: 'subj-1', name: 'Dasturlash (IT)', description: 'Python, JS va Web dasturlash', testsCount: 3 },
    { id: 'subj-2', name: 'Matematika', description: 'Matematika va mantiq', testsCount: 3 },
    { id: 'subj-3', name: 'Ingliz tili', description: 'Grammatika va lug\'at', testsCount: 3 }
  ];

  let fallbackTests = [];
  try {
    const customTests = JSON.parse(localStorage.getItem('tp_custom_tests') || '[]');
    if (Array.isArray(customTests)) fallbackTests = customTests;
  } catch (e) {}

  _standaloneData = { subjects: fallbackSubjects, tests: fallbackTests };
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
    const isAdminEmail = email === 'admin@testplatform.uz' || email === 'admin' || email === 'admin@testplatform.com' || email === 'administrator';
    if (isAdminEmail) {
      const customAdminPass = localStorage.getItem('tp_admin_custom_pass');
      const isPassValid = customAdminPass ? (pass === customAdminPass) : (pass === 'admin123' || pass === 'Admin123!' || pass === 'admin' || pass === '123456');
      if (isPassValid) {
        const user = {
          id: '95EBB8D9-F98D-4075-8DEB-F9FED3C2D212',
          fullName: 'Admin Administrator',
          username: 'admin',
          email: 'admin@testplatform.uz',
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
    let user = {
      id: '8E1F4B70-2F94-47B7-BA3F-E8D84064D78E',
      fullName: studentName,
      email: email.includes('@') ? email : `${email}@gmail.com`,
      role: 'Student',
      isActive: true,
      isPremium: false,
      premiumPlan: null
    };

    try {
      const users = JSON.parse(localStorage.getItem('tp_local_users') || '[]');
      const foundLocal = users.find(u => (u.email || '').toLowerCase() === email);
      if (foundLocal) {
        user = { ...user, ...foundLocal };
      }
      const userPass = localStorage.getItem('tp_user_pass_' + email);
      if (userPass && pass !== userPass) {
        return { success: false, statusCode: 401, message: "Parol noto'g'ri", data: null };
      }
    } catch (e) {}

    return { success: true, statusCode: 200, message: "Muvaffaqiyatli kirildi", data: { token: 'mock_jwt_student_token', user } };
  }

  // 2. Auth Register
  if (endpoint === '/api/auth/register' || endpoint.startsWith('/api/auth/register')) {
    const email = (body.email || '').trim().toLowerCase();
    const fullName = formatFullName(body.fullName || 'Talaba');
    const code = (body.verificationCode || '').trim();

    if (!email || !email.includes('@')) {
      return { success: false, statusCode: 400, message: "Iltimos, to'g'ri email manzil kiriting!" };
    }

    if (!code) {
      return { success: false, statusCode: 400, message: "Emailingizga yuborilgan 6 xonali tasdiqlash kodini kiriting! (Avval 'Kod Yuborish' tugmasini bosing)" };
    }

    let storedCode = null;
    try {
      storedCode = sessionStorage.getItem('tp_pending_email_code_' + email);
    } catch (e) {}

    if (!storedCode || code !== storedCode) {
      return { success: false, statusCode: 400, message: "Tasdiqlash kodi noto'g'ri yoki muddati tugagan! Iltimos, 'Kod Yuborish' tugmasini bosing." };
    }

    const user = {
      id: 'user_' + Date.now(),
      fullName: fullName,
      email: email,
      role: 'Student',
      isActive: true,
      isPremium: false,
      premiumPlan: null
    };

    try {
      const users = JSON.parse(localStorage.getItem('tp_local_users') || '[]');
      const existingIdx = users.findIndex(u => (u.email || '').toLowerCase() === email);
      if (existingIdx >= 0) users[existingIdx] = user;
      else users.push(user);
      localStorage.setItem('tp_local_users', JSON.stringify(users));
      if (body.password) {
        localStorage.setItem('tp_user_pass_' + email, body.password);
      }
    } catch (e) {}

    return { success: true, statusCode: 200, message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!", data: { token: 'mock_jwt_token_' + Date.now(), user } };
  }

  // 3. Send Verification Code (Handles both /api/auth/send-code and /api/auth/send-verification-code)
  if (endpoint === '/api/auth/send-code' || endpoint === '/api/auth/send-verification-code' || endpoint.startsWith('/api/auth/send-code') || endpoint.startsWith('/api/auth/send-verification-code')) {
    const targetEmail = (body.email || '').trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      return { success: false, statusCode: 400, message: "Iltimos, to'g'ri email manzil kiriting!" };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      sessionStorage.setItem('tp_pending_email_code_' + targetEmail, code);
    } catch (e) {}

    return {
      success: true,
      statusCode: 200,
      message: `${targetEmail} manziliga 6 xonali tasdiqlash kodi yuborildi!`,
      data: { code }
    };
  }

  // 3.0.1. Forgot Password - Send reset code
  if (endpoint === '/api/auth/forgot-password') {
    const targetEmail = (body.email || '').trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      return { success: false, statusCode: 400, message: "Iltimos, to'g'ri email manzil kiriting!" };
    }

    // Check user exists in localStorage
    let users = [];
    try { users = JSON.parse(localStorage.getItem('tp_local_users') || '[]'); } catch (e) {}
    const isAdmin = targetEmail === 'admin@testplatform.uz' || targetEmail === 'admin';
    const userExists = isAdmin || users.some(u => (u.email || '').toLowerCase() === targetEmail);

    if (!userExists) {
      return { success: false, statusCode: 404, message: "Bu email bilan ro'yxatdan o'tgan foydalanuvchi topilmadi!" };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      sessionStorage.setItem('tp_reset_code_' + targetEmail, code);
      sessionStorage.setItem('tp_reset_email', targetEmail);
    } catch (e) {}

    // (Real email sending happens via backend; in standalone mode the code is returned in data.code)

    return {
      success: true,
      statusCode: 200,
      message: `Parolni tiklash kodi ${targetEmail} manziliga yuborildi!`,
      data: { code, email: targetEmail }
    };
  }

  // 3.0.2. Reset Password - Verify code + set new password
  if (endpoint === '/api/auth/reset-password') {
    const targetEmail = (body.email || '').trim().toLowerCase();
    const code = (body.code || '').trim();
    const newPassword = body.newPassword || '';

    if (!targetEmail || !code || !newPassword) {
      return { success: false, statusCode: 400, message: "Barcha maydonlarni to'ldiring!" };
    }
    if (newPassword.length < 4) {
      return { success: false, statusCode: 400, message: "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }

    // Verify OTP code (check both reset-specific and general email code stores)
    let storedCode = null;
    try {
      storedCode = sessionStorage.getItem('tp_reset_code_' + targetEmail) ||
                   sessionStorage.getItem('tp_pending_email_code_' + targetEmail);
    } catch (e) {}

    if (!storedCode || code !== storedCode) {
      return { success: false, statusCode: 400, message: "Tasdiqlash kodi noto'g'ri yoki muddati tugagan!" };
    }

    // Reset password
    const isAdmin = targetEmail === 'admin@testplatform.uz' || targetEmail === 'admin';
    if (isAdmin) {
      localStorage.setItem('tp_admin_custom_pass', newPassword);
    } else {
      localStorage.setItem('tp_user_pass_' + targetEmail, newPassword);
    }

    // Clear OTP codes
    try {
      sessionStorage.removeItem('tp_reset_code_' + targetEmail);
      sessionStorage.removeItem('tp_pending_email_code_' + targetEmail);
      sessionStorage.removeItem('tp_reset_email');
    } catch (e) {}

    return { success: true, statusCode: 200, message: "Parol muvaffaqiyatli yangilandi! Yangi parol bilan kiring." };
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
      if (!storedCode || code !== storedCode) {
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
    if (!storedCode || code !== storedCode) {
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
    } else {
      const userPass = localStorage.getItem('tp_user_pass_' + userEmail);
      if (userPass && currentPass !== userPass) {
        return { success: false, statusCode: 400, message: "Joriy parol noto'g'ri kiritildi" };
      }
      localStorage.setItem('tp_user_pass_' + userEmail, newPass);
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
  if (endpoint === '/api/subjects' && method === 'GET') {
    return { success: true, statusCode: 200, data: data.subjects };
  }
  if (endpoint === '/api/subjects' && method === 'POST') {
    const newSubj = {
      id: 'subj-' + Date.now(),
      name: body.name || "Yangi Fan",
      description: body.description || "",
      testsCount: 0
    };
    data.subjects.push(newSubj);
    try {
      const customSubjs = JSON.parse(localStorage.getItem('tp_custom_subjects') || '[]');
      customSubjs.push(newSubj);
      localStorage.setItem('tp_custom_subjects', JSON.stringify(customSubjs));
    } catch (e) {}
    return { success: true, statusCode: 200, message: "Fan yaratildi", data: newSubj };
  }

  // 5. Questions Creation (POST /api/tests/{testId}/questions)
  if (endpoint.includes('/questions') && method === 'POST') {
    const parts = endpoint.split('/');
    const testId = parts[3];
    const test = data.tests.find(t => t.id === testId);
    const newQ = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      text: body.text || 'Savol matni',
      points: Number(body.points) || 2,
      difficulty: body.difficulty || 'medium',
      explanation: body.explanation || '',
      options: (body.options || []).map((o, idx) => ({
        id: `opt_${Date.now()}_${idx}`,
        text: typeof o === 'string' ? o : (o.text || ''),
        isCorrect: typeof o === 'string' ? (idx === 0) : !!o.isCorrect
      }))
    };
    if (test) {
      if (!test.questions) test.questions = [];
      test.questions.push(newQ);
      test.questionsCount = test.questions.length;
      try {
        const customTests = JSON.parse(localStorage.getItem('tp_custom_tests') || '[]');
        const cIdx = customTests.findIndex(t => t.id === testId);
        if (cIdx >= 0) {
          customTests[cIdx] = test;
          localStorage.setItem('tp_custom_tests', JSON.stringify(customTests));
        }
      } catch (e) {}
    }
    return { success: true, statusCode: 200, message: "Savol qo'shildi", data: newQ };
  }

  // 6. Test Publish (PATCH /api/tests/{testId}/publish)
  if (endpoint.includes('/publish') && method === 'PATCH') {
    const parts = endpoint.split('/');
    const testId = parts[3];
    const test = data.tests.find(t => t.id === testId);
    if (test) {
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const newPub = urlParams.has('isPublished') ? urlParams.get('isPublished') === 'true' : !test.isPublished;
      test.isPublished = newPub;
      try {
        const customTests = JSON.parse(localStorage.getItem('tp_custom_tests') || '[]');
        const cIdx = customTests.findIndex(t => t.id === testId);
        if (cIdx >= 0) {
          customTests[cIdx].isPublished = newPub;
          localStorage.setItem('tp_custom_tests', JSON.stringify(customTests));
        }
      } catch (e) {}
    }
    return { success: true, statusCode: 200, message: "Holat yangilandi", data: test };
  }

  // 7. Delete Test (DELETE /api/tests/{testId})
  if (endpoint.startsWith('/api/tests/') && method === 'DELETE') {
    const parts = endpoint.split('/');
    const testId = parts[3];
    const idx = data.tests.findIndex(t => t.id === testId);
    if (idx >= 0) data.tests.splice(idx, 1);
    try {
      let customTests = JSON.parse(localStorage.getItem('tp_custom_tests') || '[]');
      customTests = customTests.filter(t => t.id !== testId);
      localStorage.setItem('tp_custom_tests', JSON.stringify(customTests));
    } catch (e) {}
    return { success: true, statusCode: 200, message: "Test o'chirildi" };
  }

  // 8. Test Creation (POST /api/tests)
  if (endpoint === '/api/tests' && method === 'POST') {
    const subj = data.subjects.find(s => s.id === body.subjectId || s.name === body.subjectId) || { name: 'Dasturlash' };
    const newTest = {
      id: 'test_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: body.title || "Yangi Test",
      description: body.description || "",
      subjectId: body.subjectId || 'subj-1',
      subjectName: subj.name || body.subjectName || 'Dasturlash',
      difficulty: body.difficulty === 1 ? 'Easy' : (body.difficulty === 3 ? 'Hard' : 'Medium'),
      timeLimitMinutes: Number(body.timeLimitMinutes) || 15,
      passingPercentage: Number(body.passingPercentage) || 60,
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
      isPremiumOnly: !!body.isPremiumOnly,
      questionsCount: 0,
      questions: []
    };
    data.tests.unshift(newTest);
    try {
      const customTests = JSON.parse(localStorage.getItem('tp_custom_tests') || '[]');
      customTests.unshift(newTest);
      localStorage.setItem('tp_custom_tests', JSON.stringify(customTests));
    } catch (e) {}
    return { success: true, statusCode: 200, message: "Test muvaffaqiyatli yaratildi", data: newTest };
  }

  // 9. Tests Catalog (GET /api/tests)
  if (endpoint.startsWith('/api/tests') && method === 'GET') {
    const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
    const subjId = urlParams.get('subjectId');
    const diff = urlParams.get('difficulty');
    const search = (urlParams.get('search') || '').toLowerCase();

    let filtered = [...data.tests];
    if (subjId && subjId !== 'all') {
      filtered = filtered.filter(t => t.subjectId === subjId || (t.subjectName || '').toLowerCase() === subjId.toLowerCase());
    }
    if (diff && diff !== 'all') {
      filtered = filtered.filter(t => (t.difficulty || '').toLowerCase() === diff.toLowerCase());
    }
    if (search) {
      filtered = filtered.filter(t => (t.title || '').toLowerCase().includes(search) || (t.subjectName || '').toLowerCase().includes(search));
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
    
    // Normalize answers whether array of objects or key-value map
    const answersMap = {};
    if (Array.isArray(body.answers)) {
      body.answers.forEach(a => {
        if (a && a.questionId) answersMap[a.questionId] = a.selectedOptionId;
      });
    } else if (body.answers && typeof body.answers === 'object') {
      Object.assign(answersMap, body.answers);
    }

    let earned = 0;
    let total = 0;

    (found?.questions || []).forEach(q => {
      total += q.points || 1;
      const chosenOptId = answersMap[q.id];
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
        studentName: state.user?.fullName || 'Talaba',
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

    const questionsReview = (found?.questions || []).map((q, idx) => {
      const chosenId = answersMap[q.id];
      const correctOpt = (q.options || []).find(o => o.isCorrect);
      const isCorrect = Boolean(correctOpt && correctOpt.id === chosenId);
      const explanation = q.explanation || (correctOpt ? `To'g'ri javob: "${correctOpt.text}". Ushbu javob belgilangan qoida va rasmiy ta'riflarga to'liq mos keladi.` : "Standart bo'yicha to'g'ri javob.");
      return {
        questionId: q.id,
        questionText: q.text || q.question || `Savol #${idx + 1}`,
        points: q.points || 1,
        earnedPoints: isCorrect ? (q.points || 1) : 0,
        isCorrect: isCorrect,
        selectedOptionId: chosenId || null,
        correctOptionId: correctOpt?.id || null,
        explanation: explanation,
        options: (q.options || []).map(o => ({
          id: o.id,
          text: o.text,
          isCorrect: !!o.isCorrect
        }))
      };
    });

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
      questions: questionsReview
    };

    // Save attempt to localStorage
    try {
      const attempts = JSON.parse(localStorage.getItem('tp_local_attempts') || '[]');
      attempts.unshift(attemptResult);
      localStorage.setItem('tp_local_attempts', JSON.stringify(attempts));
    } catch (e) {}

    recordAuditLog('TEST_SUBMIT', 'Test', found?.title || testId, `${state.user?.fullName || 'Talaba'} «${found?.title || 'Test'}» testini topshirdi: ${percentage}% (${isPassed ? "O'tdi" : "O'tmadi"})`, state.user?.fullName || 'Talaba');

    return { success: true, statusCode: 200, message: "Test natijasi saqlandi", data: attemptResult };
  }

  // 8. Attempt Review (Supports /api/profile/attempts/:id/review, /api/student-tests/:id/review, etc.)
  if (endpoint.includes('/review')) {
    const parts = endpoint.split('/');
    let targetAttemptId = '';
    const reviewIdx = parts.indexOf('review');
    if (reviewIdx > 0 && parts[reviewIdx - 1]) {
      targetAttemptId = parts[reviewIdx - 1];
    } else if (reviewIdx >= 0 && parts[reviewIdx + 1]) {
      targetAttemptId = parts[reviewIdx + 1];
    } else {
      targetAttemptId = parts[parts.length - 1];
    }

    try {
      const attempts = JSON.parse(localStorage.getItem('tp_local_attempts') || '[]');
      const foundAtt = attempts.find(a => a.attemptId === targetAttemptId || a.attemptId === `att_${targetAttemptId}`);
      if (foundAtt) return { success: true, statusCode: 200, data: foundAtt };
      if (attempts.length > 0) return { success: true, statusCode: 200, data: attempts[0] };
    } catch (e) {}

    const firstTest = data.tests[0];
    return {
      success: true,
      statusCode: 200,
      data: {
        attemptId: targetAttemptId || 'att_demo',
        testId: firstTest?.id || 'test-1-easy',
        testTitle: firstTest?.title || "Test Sinovi",
        studentName: state.user?.fullName || "Talaba",
        totalScore: 10,
        earnedScore: 9,
        percentage: 90,
        isPassed: true,
        submittedAt: new Date().toISOString(),
        questions: (firstTest?.questions || []).map((q, idx) => {
          const correctOpt = (q.options || []).find(o => o.isCorrect) || q.options[0];
          return {
            questionId: q.id,
            questionText: q.text || `Savol #${idx + 1}`,
            points: 1,
            earnedPoints: 1,
            isCorrect: true,
            selectedOptionId: correctOpt?.id,
            correctOptionId: correctOpt?.id,
            explanation: q.explanation || `To'g'ri javob: "${correctOpt?.text || ''}". Ushbu javob test qoidalariga to'liq mos keladi.`,
            options: q.options
          };
        })
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
    const isOwnerAdmin = state.user?.role === 'Admin' || state.user?.email === 'admin@testplatform.uz';
    return {
      success: true,
      statusCode: 200,
      data: {
        id: 'cert_demo',
        certificateNumber: num || 'CERT-20260820-A1B2C3',
        verificationCode: 'VERIF888',
        studentName: state.user?.fullName || 'Talaba',
        testTitle: 'Informatika va Dasturlash',
        issuedAt: new Date().toISOString(),
        isPremium: isOwnerAdmin || !!state.user?.isPremium,
        tier: isOwnerAdmin ? 'Diamond' : (state.user?.isPremium ? (state.user?.premiumPlan === 'VIP' ? 'Diamond' : 'Gold') : 'Standard')
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
      const userEntries = attempts.map((a, idx) => {
        const isEntryAdmin = a.studentEmail === 'admin@testplatform.uz' || (state.user?.role === 'Admin');
        return {
          rank: idx + 1,
          studentId: a.studentId || 'std_1',
          studentName: a.studentName || 'Talaba',
          totalScore: a.totalScore,
          earnedScore: a.earnedScore,
          percentage: a.percentage,
          testsPassedCount: 1,
          averageScore: a.percentage,
          isPremium: isEntryAdmin,
          premiumPlan: isEntryAdmin ? 'VIP' : null
        };
      });
      return { success: true, statusCode: 200, data: userEntries };
    } catch (e) {
      return { success: true, statusCode: 200, data: [] };
    }
  }

  // 10.1 Users Management (List, Teachers, Roles, Delete)
  if (endpoint === '/api/users/teachers' || endpoint.startsWith('/api/users/teachers')) {
    let users = [];
    try { users = JSON.parse(localStorage.getItem('tp_local_users') || '[]'); } catch (e) {}
    const teachers = users.filter(u => u.role === 'Teacher').map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: 'Teacher',
      isActive: true,
      createdTestsCount: data.tests?.length || 0,
      totalQuestionsCount: 30,
      createdAt: u.createdAt || new Date().toISOString()
    }));
    return { success: true, statusCode: 200, message: "O'qituvchilar ro'yxati", data: teachers };
  }

  if (endpoint === '/api/users/create-teacher') {
    const fullName = formatFullName(body.fullName || 'O\'qituvchi');
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || 'teacher123';

    let users = [];
    try { users = JSON.parse(localStorage.getItem('tp_local_users') || '[]'); } catch (e) {}

    if (users.some(u => (u.email || '').toLowerCase() === email)) {
      return { success: false, statusCode: 400, message: "Ushbu email bilan foydalanuvchi allaqachon mavjud!" };
    }

    const newTeacher = {
      id: 'teacher_' + Date.now(),
      fullName,
      email,
      role: 'Teacher',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    users.push(newTeacher);
    localStorage.setItem('tp_local_users', JSON.stringify(users));
    localStorage.setItem('tp_user_pass_' + email, password);

    return { success: true, statusCode: 200, message: "Yangi o'qituvchi muvaffaqiyatli yaratildi", data: newTeacher };
  }

  if (endpoint.includes('/set-role')) {
    const parts = endpoint.split('/');
    const targetId = parts[3] || body.id;
    const targetRole = body.role || 'Teacher';

    let users = [];
    try { users = JSON.parse(localStorage.getItem('tp_local_users') || '[]'); } catch (e) {}

    const u = users.find(x => String(x.id) === String(targetId) || (x.email && x.email.toLowerCase() === String(targetId).toLowerCase()));
    if (u) {
      u.role = targetRole;
      localStorage.setItem('tp_local_users', JSON.stringify(users));
      return { success: true, statusCode: 200, message: `Foydalanuvchi roli '${targetRole}' ga o'zgartirildi`, data: u };
    }
    return { success: false, statusCode: 404, message: "Foydalanuvchi topilmadi" };
  }

  if (endpoint === '/api/users/stats') {
    let users = [];
    try { users = JSON.parse(localStorage.getItem('tp_local_users') || '[]'); } catch (e) {}
    const totalTeachers = users.filter(u => u.role === 'Teacher').length;
    const totalStudents = users.filter(u => u.role !== 'Teacher' && u.role !== 'Admin').length;
    return {
      success: true,
      data: {
        totalUsers: users.length + 1,
        totalStudents,
        totalTeachers,
        totalAdmins: 1
      }
    };
  }

  if (endpoint === '/api/users' || endpoint.startsWith('/api/users')) {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('tp_local_users') || '[]');
    } catch (e) {}

    // Handle DELETE user
    if (method === 'DELETE') {
      const parts = endpoint.split('/');
      const targetId = decodeURIComponent(parts[parts.length - 1] || body.id || '').trim();

      const userToDelete = users.find(u => 
        (u.id && String(u.id).toLowerCase() === targetId.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === targetId.toLowerCase())
      );

      users = users.filter(u => 
        String(u.id || '').toLowerCase() !== targetId.toLowerCase() &&
        (u.email || '').toLowerCase() !== targetId.toLowerCase()
      );

      try {
        localStorage.setItem('tp_local_users', JSON.stringify(users));

        // Save to deleted user ids blacklist so it never reappears
        const deletedIds = JSON.parse(localStorage.getItem('tp_deleted_user_ids') || '[]');
        if (targetId && !deletedIds.includes(targetId.toLowerCase())) {
          deletedIds.push(targetId.toLowerCase());
        }
        if (userToDelete?.email && !deletedIds.includes(userToDelete.email.toLowerCase())) {
          deletedIds.push(userToDelete.email.toLowerCase());
        }
        localStorage.setItem('tp_deleted_user_ids', JSON.stringify(deletedIds));

        if (userToDelete && userToDelete.email) {
          localStorage.removeItem('tp_user_pass_' + userToDelete.email.toLowerCase());
          sessionStorage.removeItem('tp_pending_email_code_' + userToDelete.email.toLowerCase());
        }

        // Clean attempts & certs for this user
        let attempts = JSON.parse(localStorage.getItem('tp_local_attempts') || '[]');
        attempts = attempts.filter(a => String(a.studentId) !== targetId && (a.studentEmail || '').toLowerCase() !== (userToDelete?.email || '').toLowerCase());
        localStorage.setItem('tp_local_attempts', JSON.stringify(attempts));

        let certs = JSON.parse(localStorage.getItem('tp_local_certs') || '[]');
        certs = certs.filter(c => String(c.studentId) !== targetId && (c.studentEmail || '').toLowerCase() !== (userToDelete?.email || '').toLowerCase());
        localStorage.setItem('tp_local_certs', JSON.stringify(certs));

        // Audit log
        const auditLogs = JSON.parse(localStorage.getItem('tp_audit_logs') || '[]');
        auditLogs.unshift({
          id: 'log_' + Date.now(),
          userName: state.user?.fullName || 'Admin',
          action: 'DELETE_USER',
          entityName: 'User',
          entityId: targetId,
          details: `Foydalanuvchi tizimdan o'chirildi: ${userToDelete?.fullName || 'Talaba'} (${userToDelete?.email || targetId})`,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('tp_audit_logs', JSON.stringify(auditLogs));
      } catch (e) {}

      return {
        success: true,
        statusCode: 200,
        message: "Foydalanuvchi muvaffaqiyatli o'chirildi!",
        data: { id: targetId }
      };
    }

    const adminUser = {
      id: '95EBB8D9-F98D-4075-8DEB-F9FED3C2D212',
      fullName: 'Admin Administrator',
      username: 'admin',
      email: 'admin@testplatform.uz',
      role: 'Admin',
      isActive: true,
      isPremium: true,
      premiumPlan: 'VIP'
    };

    let deletedIds = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem('tp_deleted_user_ids') || '[]');
    } catch (e) {}

    const studentList = users
      .filter(u => {
        const uEmail = (u.email || '').toLowerCase();
        const uId = String(u.id || '').toLowerCase();
        if (uEmail === 'admin@testplatform.uz') return false;
        if (deletedIds.includes(uId) || deletedIds.includes(uEmail)) return false;
        return true;
      })
      .map(u => ({
        ...u,
        role: u.role || 'Student',
        isPremium: u.isPremium || u.hasPaidSubscription || false,
        premiumPlan: u.premiumPlan || (u.isPremium ? 'PRO' : null)
      }));

    return { success: true, statusCode: 200, data: [adminUser, ...studentList] };
  }

  // 10.2 Admin Grant Subscription
  if (endpoint === '/api/subscription/admin/grant' || endpoint.startsWith('/api/subscription/admin/grant')) {
    const targetUserId = body.targetUserId || '';
    const planName = body.planName || 'PRO';
    const durationDays = parseInt(body.durationDays) || 30;

    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('tp_local_users') || '[]');
    } catch (e) {}

    const uIdx = users.findIndex(u => String(u.id) === String(targetUserId) || (u.email && u.email.toLowerCase() === String(targetUserId).toLowerCase()));
    if (uIdx >= 0) {
      users[uIdx].isPremium = true;
      users[uIdx].hasPaidSubscription = true;
      users[uIdx].premiumPlan = planName;
      users[uIdx].planExpiry = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();
      localStorage.setItem('tp_local_users', JSON.stringify(users));
    }

    if (state.user && (String(state.user.id) === String(targetUserId) || (state.user.email || '').toLowerCase() === String(targetUserId).toLowerCase())) {
      state.user.isPremium = true;
      state.user.premiumPlan = planName;
      saveSession(state.token, state.user);
    }

    try {
      const logs = JSON.parse(localStorage.getItem('tp_audit_logs') || '[]');
      logs.unshift({
        id: 'log_' + Date.now(),
        userName: state.user?.fullName || 'Admin',
        action: 'GRANT_PRO',
        entityName: 'Subscription',
        entityId: targetUserId,
        details: `Talabaga «${planName}» (${durationDays} kun) tarifi biriktirildi`,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('tp_audit_logs', JSON.stringify(logs));
    } catch (e) {}

    return { success: true, statusCode: 200, message: `Foydalanuvchiga ${planName} tarifi muvaffaqiyatli berildi!` };
  }

  // 11. Dashboard Summary
  if (endpoint.startsWith('/api/dashboard')) {
    const attempts = JSON.parse(localStorage.getItem('tp_local_attempts') || '[]');
    const certs = JSON.parse(localStorage.getItem('tp_local_certs') || '[]');
    const localUsers = JSON.parse(localStorage.getItem('tp_local_users') || '[]');
    const totalQuestions = (data.tests || []).reduce((acc, t) => acc + (t.questions ? t.questions.length : (t.questionsCount || 10)), 0);
    const totalUsersCount = Math.max(1, localUsers.length + 1);

    if (endpoint === '/api/dashboard/student' || endpoint.startsWith('/api/dashboard/student')) {
      const passedCount = attempts.filter(a => a.isPassed).length;
      const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0;
      return {
        success: true,
        statusCode: 200,
        data: {
          totalTestsTaken: attempts.length,
          passedCount: passedCount,
          averagePercentage: avg,
          certificatesCount: certs.length,
          leaderboardRank: 1,
          recentAnnouncements: [
            {
              id: 'ann_1',
              title: "Yangi 63 ta fan testlari bazasi yuklandi!",
              content: "Platformamizga 21 ta fan bo'yicha jami 63 ta saralangan va standartlarga mos interaktiv testlar joylashtirildi. Bilimingizni sinab ko'ring!",
              category: "Yangilik",
              icon: "campaign",
              authorName: "Admin",
              isPinned: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'ann_2',
              title: "Adminga Murojaat Markazi ishga tushirildi",
              content: "Testlarda qiyinchilik yoki savollar bo'lsa, 'Murojaat' bo'limi orqali to'g'ridan-to'g'ri adminga xabar yuborishingiz mumkin.",
              category: "Yangilanish",
              icon: "support_agent",
              authorName: "Admin",
              isPinned: false,
              createdAt: new Date(Date.now() - 86400000).toISOString()
            }
          ],
          recentAttempts: attempts.slice(0, 5),
          recommendedTests: (data.tests || []).slice(0, 4)
        }
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: {
        totalTests: (data.tests || []).length,
        totalQuestions: totalQuestions,
        totalAttempts: attempts.length,
        totalUsers: totalUsersCount,
        totalStudents: Math.max(0, totalUsersCount - 1),
        totalSubjects: (data.subjects || []).length,
        totalPublishedTests: (data.tests || []).filter(t => t.isPublished !== false).length,
        averagePercentage: attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0,
        passedAttempts: attempts.filter(a => a.isPassed).length,
        failedAttempts: attempts.filter(a => !a.isPassed).length,
        recentAttempts: attempts.slice(0, 8).map(a => ({
          id: a.attemptId || a.id,
          studentName: a.studentName || 'Talaba',
          testTitle: a.testTitle || 'Test',
          percentage: a.percentage || 0,
          isPassed: !!a.isPassed,
          submittedAt: a.submittedAt || new Date().toISOString()
        }))
      }
    };
  }

  // 12. Announcements
  if (endpoint.startsWith('/api/announcements')) {
    let announcements = [];
    try {
      announcements = JSON.parse(localStorage.getItem('tp_local_announcements') || '[]');
    } catch (e) {}

    if (!announcements.length) {
      announcements = [
        {
          id: 'ann_1',
          title: "Platformaga 63 ta fan testlari bazasi yuklandi!",
          content: "21 ta asosiy fan bo'yicha jami 63 ta professional testlar bazasi (Boshlang'ich, Standart, Murakkab) muvaffaqiyatli joylashtirildi.",
          category: "Yangilik",
          icon: "campaign",
          authorName: "Admin",
          isPinned: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'ann_2',
          title: "Adminga Murojaat Markazi ishga tushirildi",
          content: "Talabalar savol yoki qiyinchiliklarga duch kelganda to'g'ridan-to'g'ri administratorga murojaat yuborishlari mumkin.",
          category: "Yangilanish",
          icon: "support_agent",
          authorName: "Admin",
          isPinned: false,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      localStorage.setItem('tp_local_announcements', JSON.stringify(announcements));
    }

    if (method === 'POST') {
      const newAnn = {
        id: 'ann_' + Date.now(),
        title: body.title || "Yangi E'lon",
        content: body.content || "",
        category: body.category || "Yangilik",
        icon: body.icon || "campaign",
        authorName: state.user?.fullName || "Admin",
        isPinned: !!body.isPinned,
        createdAt: new Date().toISOString()
      };
      announcements.unshift(newAnn);
      localStorage.setItem('tp_local_announcements', JSON.stringify(announcements));
      return { success: true, statusCode: 200, message: "E'lon muvaffaqiyatli saqlandi", data: newAnn };
    }

    if (method === 'DELETE') {
      const annId = endpoint.split('/')[3];
      announcements = announcements.filter(a => a.id !== annId);
      localStorage.setItem('tp_local_announcements', JSON.stringify(announcements));
      return { success: true, statusCode: 200, message: "E'lon o'chirildi" };
    }

    return { success: true, statusCode: 200, data: announcements };
  }

  // 13. Premium & Pricing & Subscriptions
  if (endpoint === '/api/subscription/plans' || endpoint === '/api/premium/plans') {
    return {
      success: true,
      statusCode: 200,
      data: [
        {
          id: 'free',
          name: "Standart (Bepul)",
          description: "Boshlang'ich bilim darajasini tekshirish uchun bepul reja",
          price: 0,
          formattedPrice: "0 so'm",
          billingPeriod: "oy",
          isPopular: false,
          features: [
            "Standart ochiq testlar katalogi",
            "Oddiy elektron sertifikat",
            "Umumiy reytingda qatnashish",
            "Cheklangan test topshirish"
          ]
        },
        {
          id: 'pro',
          name: "PRO Oylik",
          description: "Barcha eksklyuziv testlar, Oltin sertifikatlar va savollar tahlili",
          price: 49000,
          formattedPrice: "49 000 so'm",
          billingPeriod: "oy",
          isPopular: true,
          badgeText: "Ommabop 🔥",
          features: [
            "🔒 Barcha Eksklyuziv PRO testlarga kirish",
            "📜 Oltin (Gold Accredited) rasmiy sertifikatlar",
            "🚀 Cheksiz qayta topshirish imkoniyati",
            "💡 Xatolar tahlili va to'g'ri javoblar izohi",
            "👑 Reyting va profilda oltin 'PRO' nishoni"
          ]
        },
        {
          id: 'vip',
          name: "VIP Oylik",
          description: "Eng yuqori darajadagi imtiyozlar, Brilliant sertifikat va AI yordami",
          price: 79000,
          formattedPrice: "79 000 so'm",
          billingPeriod: "oy",
          isPopular: false,
          badgeText: "VIP Imtiyoz 💎",
          features: [
            "🌟 Barcha PRO imkoniyatlari",
            "💎 Brilyant (Diamond VIP) maxsus sertifikatlar",
            "🤖 Cheksiz AI repetitor va masalalar tushuntirishi",
            "💎 Reyting va profilda yaltirab turuvchi 'VIP' nishoni",
            "📞 Ustuvor 24/7 shaxsiy qo'llab-quvvatlash"
          ]
        }
      ]
    };
  }

  if (endpoint === '/api/subscription/my-status') {
    return {
      success: true,
      statusCode: 200,
      data: {
        isPremium: !!state.user?.isPremium,
        planName: state.user?.premiumPlan || (state.user?.isPremium ? 'PRO' : 'Standart'),
        expiresAt: null
      }
    };
  }

  if (endpoint.startsWith('/api/subscription/validate-promo') || endpoint === '/api/premium/redeem-promo') {
    const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
    const code = (urlParams.get('code') || body.code || '').trim().toUpperCase();

    let adminPromos = [];
    try {
      adminPromos = JSON.parse(localStorage.getItem('tp_admin_promos') || '[]');
    } catch (e) {}

    const foundPromo = adminPromos.find(p => p.code.toUpperCase() === code);
    if (!foundPromo) {
      return {
        success: false,
        statusCode: 400,
        message: "Kiritilgan promo-kod mavjud emas!",
        data: { isValid: false }
      };
    }

    if (!foundPromo.isActive) {
      return {
        success: false,
        statusCode: 400,
        message: "Ushbu promo-kod hozirda nofaol holatda!",
        data: { isValid: false }
      };
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    if (foundPromo.startDate && todayStr < foundPromo.startDate) {
      return {
        success: false,
        statusCode: 400,
        message: `Ushbu promo-kod hali kuchga kirmagan (Boshlanish sanasi: ${foundPromo.startDate})`,
        data: { isValid: false }
      };
    }

    if (foundPromo.endDate && todayStr > foundPromo.endDate) {
      return {
        success: false,
        statusCode: 400,
        message: `Ushbu promo-kodning amal qilish muddati tugagan (${foundPromo.endDate})`,
        data: { isValid: false }
      };
    }

    const discountPercent = Math.min(100, Math.max(1, Number(foundPromo.discountPercent) || 20));
    const discountedPro = Math.round(49000 * (1 - discountPercent / 100));
    const discountedVip = Math.round(79000 * (1 - discountPercent / 100));

    return {
      success: true,
      statusCode: 200,
      message: `🎉 Promo-kod tasdiqlandi! To'lov uchun ${discountPercent}% chegirma taqdim etildi.`,
      data: {
        code: foundPromo.code,
        discountPercent: discountPercent,
        discountedProPrice: discountedPro,
        discountedVipPrice: discountedVip,
        isValid: true
      }
    };
  }

  if (endpoint === '/api/subscription/upgrade' || endpoint === '/api/premium/checkout') {
    const planId = (body.planId || body.plan || 'pro').toLowerCase();
    const planName = planId === 'vip' ? 'VIP' : 'PRO';
    if (state.user) {
      state.user.isPremium = true;
      state.user.premiumPlan = planName;
      updateUserSession(state.user);
    }
    return {
      success: true,
      statusCode: 200,
      message: `${planName} obunangiz muvaffaqiyatli faollashtirildi!`,
      data: { planName, isPremium: true }
    };
  }

  if (endpoint === '/api/subscription/admin/grant') {
    const targetUserId = body.targetUserId || body.userId;
    const planName = body.planName || 'PRO';
    try {
      const users = JSON.parse(localStorage.getItem('tp_local_users') || '[]');
      const targetUser = users.find(u => u.id === targetUserId);
      if (targetUser) {
        targetUser.isPremium = true;
        targetUser.premiumPlan = planName;
        localStorage.setItem('tp_local_users', JSON.stringify(users));
      }
    } catch (e) {}
    return { success: true, statusCode: 200, message: "PRO obuna muvaffaqiyatli taqdim etildi" };
  }

  if (endpoint === '/api/admin/promos' || endpoint.startsWith('/api/admin/promos')) {
    let promos = [];
    try {
      promos = JSON.parse(localStorage.getItem('tp_admin_promos') || '[]');
    } catch (e) {}

    if (method === 'POST') {
      const newCode = (body.code || '').trim().toUpperCase();
      if (!newCode) return { success: false, statusCode: 400, message: "Promo-kod nomini kiriting!" };
      if (promos.some(p => p.code.toUpperCase() === newCode)) {
        return { success: false, statusCode: 400, message: "Ushbu nomdagi promo-kod allaqachon mavjud!" };
      }
      const disc = Math.min(100, Math.max(1, Number(body.discountPercent) || 20));
      const newPromo = {
        code: newCode,
        discountPercent: disc,
        description: body.description || "Admin chegirma kodi",
        startDate: body.startDate || new Date().toISOString().slice(0, 10),
        endDate: body.endDate || '',
        isActive: body.isActive !== false,
        createdAt: new Date().toISOString()
      };
      promos.unshift(newPromo);
      localStorage.setItem('tp_admin_promos', JSON.stringify(promos));
      return { success: true, statusCode: 200, message: "Yangi promo-kod yaratildi!", data: newPromo };
    }

    if (method === 'PUT' && endpoint.includes('/toggle')) {
      const codeToToggle = endpoint.split('/')[4] || body.code;
      const found = promos.find(p => p.code.toUpperCase() === decodeURIComponent(codeToToggle || '').toUpperCase());
      if (found) {
        found.isActive = !found.isActive;
        localStorage.setItem('tp_admin_promos', JSON.stringify(promos));
        return { success: true, statusCode: 200, message: `Promo-kod holati o'zgartirildi (${found.isActive ? 'Faol' : 'Nofaol'})`, data: found };
      }
      return { success: false, statusCode: 404, message: "Promo-kod topilmadi" };
    }

    if (method === 'PUT') {
      const codeToEdit = endpoint.split('/')[4] || body.originalCode || body.code;
      const foundIndex = promos.findIndex(p => p.code.toUpperCase() === decodeURIComponent(codeToEdit || '').toUpperCase());
      if (foundIndex >= 0) {
        const newCode = (body.code || promos[foundIndex].code).trim().toUpperCase();
        if (newCode !== promos[foundIndex].code && promos.some(p => p.code.toUpperCase() === newCode)) {
          return { success: false, statusCode: 400, message: "Bu nomdagi boshqa promo-kod allaqachon mavjud!" };
        }
        const disc = Math.min(100, Math.max(1, Number(body.discountPercent) || promos[foundIndex].discountPercent || 20));
        promos[foundIndex] = {
          ...promos[foundIndex],
          code: newCode,
          discountPercent: disc,
          description: body.description !== undefined ? body.description : promos[foundIndex].description,
          startDate: body.startDate !== undefined ? body.startDate : promos[foundIndex].startDate,
          endDate: body.endDate !== undefined ? body.endDate : promos[foundIndex].endDate,
          isActive: body.isActive !== undefined ? body.isActive : promos[foundIndex].isActive,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('tp_admin_promos', JSON.stringify(promos));
        return { success: true, statusCode: 200, message: "Promo-kod muvaffaqiyatli yangilandi!", data: promos[foundIndex] };
      }
      return { success: false, statusCode: 404, message: "Promo-kod topilmadi" };
    }

    if (method === 'DELETE') {
      const codeToDelete = endpoint.split('/')[4] || body.code;
      promos = promos.filter(p => p.code.toUpperCase() !== decodeURIComponent(codeToDelete || '').toUpperCase());
      localStorage.setItem('tp_admin_promos', JSON.stringify(promos));
      return { success: true, statusCode: 200, message: "Promo-kod o'chirildi" };
    }

    return { success: true, statusCode: 200, data: promos };
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

  // 15. Audit Logs
  if (endpoint.startsWith('/api/audit-logs')) {
    let logs = [];
    try {
      logs = JSON.parse(localStorage.getItem('tp_audit_logs') || '[]');
    } catch (e) {}

    if (!logs.length) {
      logs = [
        {
          id: 'log_1',
          userName: "Admin Administrator",
          action: "ADMIN_LOGIN",
          entityName: "Auth",
          entityId: "Admin",
          details: "Bosh administrator tizimga muvaffaqiyatli kirdi (admin@testplatform.uz)",
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: 'log_2',
          userName: "Tizim",
          action: "SECURITY_CONFIG",
          entityName: "Security",
          entityId: "EmailOTP",
          details: "Email orqali 6 xonali OTP tasdiqlash va xavfsiz autentifikatsiya protokoli faollashtirildi",
          createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
        },
        {
          id: 'log_3',
          userName: "Tizim",
          action: "SUPPORT_CENTER",
          entityName: "Support",
          entityId: "HelpDesk",
          details: "Talabalar murojaat markazi va Telegram integratsiyasi (@TestPlatform_Support) ishga tushirildi",
          createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString()
        },
        {
          id: 'log_4',
          userName: "Tizim",
          action: "TEST_DATABASE_INIT",
          entityName: "Database",
          entityId: "63_Tests",
          details: "21 ta fan bo'yicha jami 63 ta test va 630 ta professional savollar bazasi yuklandi",
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
        },
        {
          id: 'log_5',
          userName: "Tizim",
          action: "CERTIFICATE_ENGINE",
          entityName: "Certificate",
          entityId: "Engine",
          details: "Raqamli QR-kodli Oltin va Standart sertifikatlar generatsiya moduli sozlandi",
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
        },
        {
          id: 'log_6',
          userName: "Tizim",
          action: "PAYMENT_GATEWAY",
          entityName: "Subscription",
          entityId: "Payme/Click",
          details: "Payme, Click va VIP promo-kodlar (VIP2025, PRO2025) moduli faollashtirildi",
          createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
        }
      ];
      localStorage.setItem('tp_audit_logs', JSON.stringify(logs));
    }

    if (method === 'POST') {
      const newLog = {
        id: 'log_' + Date.now(),
        userName: body.userName || state.user?.fullName || 'Tizim',
        action: body.action || 'ACTION',
        entityName: body.entityName || 'System',
        entityId: body.entityId || '',
        details: body.details || '',
        createdAt: new Date().toISOString()
      };
      logs.unshift(newLog);
      localStorage.setItem('tp_audit_logs', JSON.stringify(logs));
      return { success: true, statusCode: 200, data: newLog };
    }

    if (endpoint === '/api/audit-logs/clear' || (endpoint.startsWith('/api/audit-logs') && method === 'DELETE')) {
      localStorage.setItem('tp_audit_logs', JSON.stringify([]));
      return { success: true, statusCode: 200, message: "Audit jurnali tozalandi" };
    }

    return { success: true, statusCode: 200, data: logs };
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
    let errorMsg = data?.message;
    if (!errorMsg) {
      if (res.status === 404) errorMsg = "So'ralgan manzil yoki ma'lumot topilmadi";
      else if (res.status === 400) errorMsg = "Kiritilgan ma'lumotlar to'liq yoki to'g'ri emas";
      else if (res.status === 401) {
        if (endpoint.includes('/auth/login') || endpoint.includes('/auth/register')) {
          errorMsg = "Email yoki parol noto'g'ri";
        } else {
          errorMsg = "Sessiya muddati tugagan yoki tizimga qayta kirish talab etiladi";
        }
      }
      else if (res.status === 403) errorMsg = "Ushbu amalni bajarish uchun sizda yetarli ruxsat yo'q";
      else if (res.status >= 500) errorMsg = "Serverda vaqtinchalik xatolik yuz berdi";
      else errorMsg = `Xatolik yuz berdi (${res.status})`;
    }

    // If 401 on protected endpoint, warn user
    if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      console.warn("401 Unauthorized for endpoint:", endpoint);
    }

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

    // Restore session reliably
    let restoredToken = localStorage.getItem('tp_token') || sessionStorage.getItem('tp_token');
    let restoredUser = localStorage.getItem('tp_user') || sessionStorage.getItem('tp_user');

    if (restoredToken && restoredUser) {
      try {
        state.token = restoredToken;
        state.user = JSON.parse(restoredUser);
        const isAdmin = state.user.role === 'Admin' || state.user.role === 1 || (state.user.email || '').toLowerCase().includes('admin') || state.user.email === 'behruzsagdullayev0707@gmail.com';
        if (!isAdmin) {
          // Reset any cached/mock student PRO/VIP status unless actively paid
          if (!state.user.hasPaidSubscription) {
            state.user.isPremium = false;
            state.user.premiumPlan = null;
            updateUserSession(state.user);
          }
        } else {
          state.user.role = 'Admin';
          state.user.fullName = 'Admin Administrator';
          state.user.username = 'admin';
          state.user.email = 'admin@testplatform.uz';
          state.user.isPremium = true;
          state.user.premiumPlan = 'VIP';
          updateUserSession(state.user);
        }
      } catch (e) {
        clearSession();
      }
    } else {
      clearSession();
    }

    // Clean up local student records & obsolete dummy users/promos
    try {
      const localUsers = JSON.parse(localStorage.getItem('tp_local_users') || '[]');
      const filteredUsers = localUsers.filter(u => (u.email || '').toLowerCase() !== 'admin@testplatform.com');
      let modified = filteredUsers.length !== localUsers.length;
      filteredUsers.forEach(u => {
        if (u.role !== 'Admin') {
          if (!u.hasPaidSubscription && (u.isPremium || u.premiumPlan)) {
            u.isPremium = false;
            u.premiumPlan = null;
            modified = true;
          }
        }
      });
      if (modified) {
        localStorage.setItem('tp_local_users', JSON.stringify(filteredUsers));
      }

      // Clean legacy auto-seeded BEHRUZ2026 promo
      const promos = JSON.parse(localStorage.getItem('tp_admin_promos') || '[]');
      const cleanedPromos = promos.filter(p => p.code !== 'BEHRUZ2026' || p.description !== 'Admin rasmiy promo-kodi');
      if (cleanedPromos.length !== promos.length) {
        localStorage.setItem('tp_admin_promos', JSON.stringify(cleanedPromos));
      }
    } catch (e) {}

    // If user is not authenticated:
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
        window.location.hash = (state.user && state.user.role === 'Teacher') ? '#/teacher' : (state.user ? '#/dashboard' : '#/login');
        return;
      }
    }

    // Role-based protection for Teacher routes
    if (hash.startsWith('#/teacher')) {
      if (!state.user) {
        showToast('O\'qituvchi paneliga kirish uchun avval tizimga kiring', 'info');
        window.location.hash = '#/login';
        return;
      }
      if (state.user.role !== 'Teacher' && state.user.role !== 'Admin') {
        showToast('Ushbu bo\'lim faqat o\'qituvchilar va administratorlar uchun!', 'error');
        window.location.hash = '#/dashboard';
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
      } else if (state.user.role === 'Teacher') {
        this.renderTeacherDashboard();
      } else {
        this.renderTestsCatalog();
      }
    } else if (hash === '#/login') {
      this.renderLogin();
    } else if (hash === '#/register') {
      this.renderRegister();
    } else if (hash === '#/forgot-password') {
      this.renderForgotPassword();
    } else if (hash.startsWith('#/reset-password')) {
      this.renderResetPassword(hash);
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
      } else if (state.user.role === 'Teacher') {
        this.renderTeacherDashboard();
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
    } else if (hash === '#/admin/teachers') {
      this.renderAdminTeachers();
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
    } else if (hash === '#/admin/promos') {
      this.renderAdminPromos();
    } else if (hash === '#/admin/subjects') {
      this.renderAdminSubjects();
    } else if (hash === '#/admin/audit-logs') {
      this.renderAdminAuditLogs();
    } else if (hash === '#/teacher' || hash === '#/teacher/dashboard') {
      this.renderTeacherDashboard();
    } else if (hash === '#/teacher/tests') {
      this.renderTeacherTests();
    } else if (hash === '#/teacher/add-test') {
      this.renderTeacherAddTest();
    } else if (hash.startsWith('#/teacher/edit-test/')) {
      const testId = hash.split('/')[3];
      this.renderTeacherEditTest(testId);
    } else if (hash.startsWith('#/teacher/add-question/')) {
      const testId = hash.split('/')[3];
      this.renderTeacherAddQuestion(testId);
    } else if (hash.startsWith('#/teacher/bulk-import')) {
      const parts = hash.split('/');
      const testId = parts.length > 3 ? parts[3] : '';
      this.renderTeacherBulkImport(testId);
    } else if (hash === '#/teacher/subjects') {
      this.renderTeacherSubjects();
    } else if (hash === '#/teacher/results') {
      this.renderTeacherResults();
    } else {
      this.renderHome();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ----------------------------------------------------
  // ----------------------------------------------------
  // RESPONSIVE LEFT SIDEBAR & NAVIGATION SYSTEM
  // ----------------------------------------------------
  toggleSidebarMobile(forceState) {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!sidebar || !backdrop) return;

    const isCurrentlyOpen = !sidebar.classList.contains('-translate-x-full');
    const shouldOpen = forceState !== undefined ? forceState : !isCurrentlyOpen;

    if (shouldOpen) {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('hidden');
      document.body.classList.add('overflow-hidden', 'lg:overflow-auto');
    } else {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
      document.body.classList.remove('overflow-hidden', 'lg:overflow-auto');
    }
  },

  renderSidebar(currentHash = window.location.hash || '#/') {
    const sidebar = document.getElementById('app-sidebar');
    const sidebarNav = document.getElementById('sidebar-nav-container');
    const sidebarUser = document.getElementById('sidebar-user-container');
    const topbarPageName = document.getElementById('topbar-page-name');
    const mainWrapper = document.getElementById('app-main-wrapper');
    if (!sidebar || !sidebarNav) return;

    // If user is not logged in or on auth pages, hide sidebar completely
    const isAuthPage = currentHash === '#/login' || currentHash === '#/register' || currentHash === '#/forgot-password' || currentHash.startsWith('#/reset-password');
    if (!state.user || isAuthPage) {
      sidebar.classList.add('hidden', 'lg:hidden');
      if (mainWrapper) mainWrapper.classList.remove('lg:pl-64');
      return;
    } else {
      sidebar.classList.remove('hidden', 'lg:hidden');
      if (mainWrapper) mainWrapper.classList.add('lg:pl-64');
    }

    const isAdmin = state.user.role === 'Admin' || state.user.role === 1 || state.user.email === 'admin@testplatform.uz';
    const isTeacher = state.user.role === 'Teacher' || state.user.role === 3;
    const isPro = !isAdmin && !isTeacher && (state.user.isPremium || state.user.premiumPlan === 'Pro' || state.user.premiumPlan === 'VIP');
    const isVip = !isAdmin && !isTeacher && (state.user.premiumPlan === 'VIP');

    // Define Navigation Sections
    let sections = [];

    if (isAdmin) {
      sections = [
        {
          group: "ASOSIY BOSHQARUV",
          items: [
            { id: 'admin-dash', label: 'Admin Dashboard', icon: 'dashboard', href: '#/admin', match: (h) => h === '#/admin' || h === '#/admin/dashboard' || h === '#/' || h === '' },
            { id: 'admin-tests', label: 'Testlar Boshqaruvi', icon: 'quiz', href: '#/admin/tests', match: (h) => h.startsWith('#/admin/tests') || h.startsWith('#/admin/add-test') || h.startsWith('#/admin/edit-test') || h.startsWith('#/admin/add-question') },
            { id: 'admin-subjects', label: 'Fanlar va Mavzular', icon: 'menu_book', href: '#/admin/subjects', match: (h) => h.startsWith('#/admin/subjects') },
            { id: 'admin-teachers', label: 'O\'qituvchilar', icon: 'school', href: '#/admin/teachers', match: (h) => h.startsWith('#/admin/teachers') },
            { id: 'admin-users', label: 'Foydalanuvchilar', icon: 'group', href: '#/admin/users', match: (h) => h.startsWith('#/admin/users') },
            { id: 'admin-promos', label: 'Promo-kodlar', icon: 'confirmation_number', href: '#/admin/promos', match: (h) => h.startsWith('#/admin/promos') },
            { id: 'admin-support', label: 'Murojaatlar (Inbox)', icon: 'support_agent', href: '#/admin/support', match: (h) => h.startsWith('#/admin/support') },
            { id: 'admin-audit', label: 'Xavfsizlik Jurnali', icon: 'history', href: '#/admin/audit-logs', match: (h) => h.startsWith('#/admin/audit-logs') }
          ]
        },
        {
          group: "TALABA REJIMI",
          items: [
            { id: 'stud-tests', label: 'Testlar Katalogi', icon: 'explore', href: '#/tests', match: (h) => h === '#/tests' || h.startsWith('#/test-solve') },
            { id: 'stud-rank', label: 'Umumiy Reyting', icon: 'leaderboard', href: '#/leaderboard', match: (h) => h.startsWith('#/leaderboard') },
            { id: 'stud-cert', label: 'Sertifikat Tekshirish', icon: 'verified', href: '#/verify-cert', match: (h) => h.startsWith('#/verify-cert') }
          ]
        }
      ];
    } else if (isTeacher) {
      sections = [
        {
          group: "O'QITUVCHI MARKAZI",
          items: [
            { id: 'teach-dash', label: 'O\'qituvchi Paneli', icon: 'dashboard', href: '#/teacher', match: (h) => h === '#/teacher' || h === '#/' || h === '' },
            { id: 'teach-tests', label: 'Mening Testlarim', icon: 'quiz', href: '#/teacher/tests', match: (h) => h.startsWith('#/teacher/tests') },
            { id: 'teach-add', label: 'Yangi Test Yaratish', icon: 'add_circle', href: '#/teacher/add-test', match: (h) => h.startsWith('#/teacher/add-test') },
            { id: 'teach-subs', label: 'Fanlar Katalogi', icon: 'menu_book', href: '#/teacher/subjects', match: (h) => h.startsWith('#/teacher/subjects') },
            { id: 'teach-results', label: 'O\'quvchilar Natijalari', icon: 'analytics', href: '#/teacher/results', match: (h) => h.startsWith('#/teacher/results') }
          ]
        },
        {
          group: "PLATFORMA",
          items: [
            { id: 'stud-tests', label: 'Testlar Katalogi', icon: 'explore', href: '#/tests', match: (h) => h === '#/tests' || h.startsWith('#/test-solve') },
            { id: 'stud-rank', label: 'Umumiy Reyting', icon: 'leaderboard', href: '#/leaderboard', match: (h) => h.startsWith('#/leaderboard') },
            { id: 'stud-cert', label: 'Sertifikat Tekshirish', icon: 'verified', href: '#/verify-cert', match: (h) => h.startsWith('#/verify-cert') }
          ]
        }
      ];
    } else {
      sections = [
        {
          group: "ASOSIY MENYU",
          items: [
            { id: 'user-dash', label: 'Mening Dashboardim', icon: 'dashboard', href: '#/dashboard', match: (h) => h === '#/dashboard' || h === '#/student-dashboard' || h === '#/' || h === '' },
            { id: 'user-tests', label: 'Testlar Katalogi', icon: 'quiz', href: '#/tests', match: (h) => h.startsWith('#/tests') || h.startsWith('#/test-solve') },
            { id: 'user-pricing', label: 'Tariflar (PRO)', icon: 'workspace_premium', href: '#/pricing', match: (h) => h.startsWith('#/pricing') },
            { id: 'user-rank', label: 'Yetakchilar Reytingi', icon: 'leaderboard', href: '#/leaderboard', match: (h) => h.startsWith('#/leaderboard') },
            { id: 'user-cert', label: 'Sertifikat Tekshirish', icon: 'verified', href: '#/verify-cert', match: (h) => h.startsWith('#/verify-cert') },
            { id: 'user-support', label: 'Adminga Murojaat', icon: 'support_agent', href: '#/support', match: (h) => h.startsWith('#/support') }
          ]
        }
      ];
    }

    let activePageTitle = 'Boshqaruv Markazi';

    // Render Sidebar Nav Links
    sidebarNav.innerHTML = sections.map(sec => `
      <div class="pt-3 pb-1 first:pt-0">
        <div class="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">${sec.group}</div>
        <div class="space-y-1">
          ${sec.items.map(item => {
            const isActive = item.match(currentHash);
            if (isActive) activePageTitle = item.label;
            return `
              <a href="${item.href}" onclick="app.toggleSidebarMobile(false)" class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-bold shadow-md shadow-blue-500/20 ring-1 ring-white/20 scale-[1.01]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 font-medium'
              }">
                <div class="flex items-center gap-2.5 truncate">
                  <span class="material-symbols-outlined text-[19px] ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-400 transition-colors'}">${item.icon}</span>
                  <span class="truncate ${isActive ? 'font-black tracking-wide' : ''}">${item.label}</span>
                </div>
                ${isActive ? '<span class="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-sm shadow-cyan-300 shrink-0"></span>' : ''}
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    // Update Topbar page title
    if (topbarPageName) {
      topbarPageName.innerText = activePageTitle;
    }

    // Render Sidebar User Profile Footer
    if (sidebarUser) {
      const proBadgeHtml = isAdmin
        ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">🛡️ ADMIN</span>'
        : (isTeacher
          ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">👨‍🏫 TEACHER</span>'
          : (isVip ? '<span class="badge-vip text-[9px]">💎 VIP</span>' : (isPro ? '<span class="badge-pro text-[9px]">👑 PRO</span>' : '')));

      sidebarUser.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <a href="#/profile" onclick="app.toggleSidebarMobile(false)" class="flex items-center gap-2.5 min-w-0 group flex-1 p-1.5 rounded-xl hover:bg-white/5 transition" title="Profil sozlamalari">
            <div class="w-8 h-8 rounded-xl ${isAdmin ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white' : (isTeacher ? 'bg-indigo-600 text-white' : (isPro ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white' : 'bg-blue-600 text-white'))} flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              ${(state.user.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div class="min-w-0 text-left">
              <div class="text-xs font-bold text-gray-200 group-hover:text-white truncate flex items-center gap-1">
                <span>${formatFullName(state.user.fullName)}</span>
              </div>
              <div class="text-[10px] ${isAdmin ? 'text-blue-400 font-bold' : (isTeacher ? 'text-indigo-300 font-bold' : 'text-gray-400')} truncate">
                ${proBadgeHtml || (state.user.role || 'Talaba')}
              </div>
            </div>
          </a>
          <button onclick="app.logout()" class="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition shrink-0 flex items-center justify-center" title="Chiqish">
            <span class="material-symbols-outlined text-[17px]">logout</span>
          </button>
        </div>
      `;
    }
  },

  setActiveNav(hash) {
    this.renderSidebar(hash);
  },

  updateNavAuth() {
    const container = document.getElementById('nav-auth-container');
    if (!container) return;

    if (state.user) {
      container.innerHTML = '';
    } else {
      container.innerHTML = `
        <a href="#/login" class="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-medium transition inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px]">login</span> Kirish
        </a>
        <a href="#/register" class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs glow-button-primary transition inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px]">person_add</span> Ro'yxatdan o'tish
        </a>
      `;
    }

    this.renderSidebar(window.location.hash || '#/');
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
  quickFillLogin(role) {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    if (!emailInput || !passInput) return;

    if (role === 'admin') {
      emailInput.value = 'admin@testplatform.uz';
      passInput.value = 'admin123';
    } else if (role === 'teacher') {
      emailInput.value = 'teacher@testplatform.uz';
      passInput.value = 'Teacher123!';
    } else if (role === 'student') {
      emailInput.value = 'talaba@gmail.com';
      passInput.value = 'talaba123';
    }

    // Highlight button active state
    document.querySelectorAll('.role-tab-btn').forEach(btn => {
      btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-400', 'shadow-md', 'shadow-blue-500/30');
      btn.classList.add('bg-white/5', 'text-gray-400', 'border-white/10');
    });
    const activeBtn = document.getElementById(`tab-role-${role}`);
    if (activeBtn) {
      activeBtn.classList.remove('bg-white/5', 'text-gray-400', 'border-white/10');
      activeBtn.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-indigo-600', 'text-white', 'border-blue-400/50', 'shadow-md', 'shadow-blue-500/30');
    }
  },

  renderLogin() {
    const root = document.getElementById('app-root');
    if (!root) return;

    root.innerHTML = `
      <div class="max-w-lg mx-auto my-6 sm:my-10 relative animate-entrance">
        
        <!-- Ambient Iridescent Glow Orbs behind card -->
        <div class="absolute -top-12 -left-12 w-80 h-80 bg-blue-500/25 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div class="absolute -bottom-12 -right-12 w-80 h-80 bg-indigo-500/25 rounded-full blur-[100px] pointer-events-none" style="animation-delay: 2s;"></div>

        <!-- Luxury Glassmorphic Login Card -->
        <div class="relative z-10 p-7 sm:p-9 rounded-3xl bg-[#0b0e1b]/85 backdrop-blur-2xl border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 space-y-6">
          
          <!-- Top Brand & Icon Header -->
          <div class="text-center space-y-3">
            <div class="inline-flex relative group">
              <div class="w-18 h-18 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-2xl shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                <div class="w-full h-full bg-[#0d101d] rounded-2xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-tr from-blue-400 via-cyan-300 to-indigo-300 text-3xl">psychology</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 class="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight flex items-center justify-center gap-1.5">
                Test<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Platform</span>
              </h2>
              <p class="text-xs text-gray-400 mt-1">Bilim va testlar boshqaruvining xavfsiz markazi</p>
            </div>
          </div>

          <!-- Tezkor Demo Kirish (Admin va O'quvchi) -->
          <div class="space-y-1.5 pt-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Tezkor Demo Kirish:</div>
            <div class="grid grid-cols-2 gap-2.5">
              <button type="button" onclick="app.quickFillLogin('admin')" class="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]">
                <span>🛡️</span> Admin Demo
              </button>
              <button type="button" onclick="app.quickFillLogin('student')" class="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]">
                <span>🎓</span> O'quvchi Demo
              </button>
            </div>
          </div>

          <!-- Login Form -->
          <form id="login-form" onsubmit="app.handleLoginSubmit(event)" class="space-y-4 pt-1">
            <div>
              <label class="block text-xs font-semibold text-gray-200 mb-1.5 flex items-center justify-between">
                <span>Email yoki Login</span>
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">account_circle</span>
                <input type="text" id="login-email" required placeholder="Email yoki profilingiz logini (masalan: ali_valiyev)" class="auth-input w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-gray-200">Maxfiy Parol</label>
                <a href="#/forgot-password" class="text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">lock_reset</span>
                  Parolni unutdingizmi?
                </a>
              </div>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">lock</span>
                <input type="password" id="login-password" required placeholder="••••••••" class="auth-input w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
                <button type="button" onclick="app.togglePassword('login-password', 'login-eye-icon')" class="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition" title="Parolni ko'rsatish/yashirish">
                  <span id="login-eye-icon" class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <button type="submit" id="btn-login-submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs glow-button-primary transition shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]">
              <span class="material-symbols-outlined text-[18px]">login</span>
              <span>Tizimga Kirish</span>
            </button>
          </form>

          <!-- Footer Links & Security Badge -->
          <div class="pt-4 border-t border-white/10 text-center space-y-3">
            <p class="text-xs text-gray-400">
              Hisobingiz mavjud emasmi? 
              <a href="#/register" class="text-blue-400 font-bold hover:text-cyan-300 transition">Ro'yxatdan o'tish</a>
            </p>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 text-[10px] text-gray-400">
              <span class="material-symbols-outlined text-emerald-400 text-[13px]">verified_user</span>
              <span>256-bit SSL xavfsiz shifrlangan tizim</span>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  quickFillLogin(role) {
    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-password');
    if (!emailEl || !passEl) return;
    if (role === 'admin') {
      emailEl.value = 'admin@testplatform.uz';
      passEl.value = 'admin123';
      showToast('🛡️ Administrator demo ma\'lumotlari kiritildi!', 'info');
    } else {
      emailEl.value = 'talaba@gmail.com';
      passEl.value = '123456';
      showToast('🎓 O\'quvchi demo ma\'lumotlari kiritildi!', 'info');
    }
  },

  renderRegister() {
    if (state.token && state.user) {
      window.location.hash = state.user.role === 'Admin' ? '#/admin' : '#/tests';
      return;
    }
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="max-w-lg mx-auto my-6 sm:my-10 relative animate-entrance">
        <!-- Ambient Glow Orbs -->
        <div class="absolute -top-12 -right-12 w-80 h-80 bg-indigo-500/25 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div class="absolute -bottom-12 -left-12 w-80 h-80 bg-blue-500/25 rounded-full blur-[100px] pointer-events-none" style="animation-delay: 2s;"></div>

        <!-- Luxury Glassmorphic Card -->
        <div class="relative z-10 p-7 sm:p-9 rounded-3xl bg-[#0b0e1b]/85 backdrop-blur-2xl border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 space-y-6">
          
          <!-- STEP 1: Registration Form -->
          <div id="reg-step-1" class="space-y-6">
            <!-- Top Header -->
            <div class="text-center space-y-3">
              <div class="inline-flex relative group">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-500 p-0.5 shadow-2xl shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                  <div class="w-full h-full bg-[#0d101d] rounded-2xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-tr from-indigo-300 via-blue-300 to-cyan-300 text-3xl">person_add</span>
                  </div>
                </div>
              </div>
              <div>
                <h2 class="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">Yangi Hisob Ochish</h2>
                <p class="text-xs text-gray-400 mt-1">Platformadan to'liq foydalanish uchun ma'lumotlarni to'ldiring</p>
              </div>
            </div>

            <!-- Register Form (Step 1) -->
            <form onsubmit="app.handleRegisterStep1(event)" class="space-y-3.5">
              <!-- Ism & Familiya -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-200 mb-1">Ismingiz</label>
                  <input type="text" id="reg-firstname" required placeholder="Ali" class="auth-input w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-200 mb-1">Familiyangiz</label>
                  <input type="text" id="reg-lastname" required placeholder="Valiyev" class="auth-input w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
                </div>
              </div>

              <!-- Login (Username) -->
              <div>
                <label class="block text-xs font-semibold text-gray-200 mb-1 flex items-center justify-between">
                  <span>Foydalanuvchi Logini</span>
                  <span class="text-[10px] text-gray-400 font-normal">Kirish uchun login</span>
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">alternate_email</span>
                  <input type="text" id="reg-username" required placeholder="ali_valiyev" class="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
                </div>
                <p class="text-[10px] text-gray-400 mt-1">Saytga kirishda ushbu logindan yoki emailingizdan foydalanishingiz mumkin.</p>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-xs font-semibold text-gray-200 mb-1">Email / Gmail Manzil</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">mail</span>
                  <input type="email" id="reg-email" required placeholder="ali.valiyev@gmail.com" class="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
                </div>
              </div>

              <!-- Telefon Raqam (Phone Number) -->
              <div>
                <label class="block text-xs font-semibold text-gray-200 mb-1">Telefon Raqamingiz</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">phone_iphone</span>
                  <input type="tel" id="reg-phone" required placeholder="+998 (90) 123-45-67" class="auth-input w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
                </div>
              </div>

              <!-- Parol -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-200 mb-1">Parol</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">lock</span>
                    <input type="password" id="reg-password" required minlength="4" placeholder="••••••••" class="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
                    <button type="button" onclick="app.togglePassword('reg-password', 'reg-eye-icon1')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition">
                      <span id="reg-eye-icon1" class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-200 mb-1">Tasdiqlash</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">lock_open</span>
                    <input type="password" id="reg-confirm-password" required minlength="4" placeholder="••••••••" class="auth-input w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
                    <button type="button" onclick="app.togglePassword('reg-confirm-password', 'reg-eye-icon2')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition">
                      <span id="reg-eye-icon2" class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Next Button -->
              <button type="submit" id="btn-reg-next" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs glow-button-primary transition shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]">
                <span class="material-symbols-outlined text-[18px]">send</span>
                <span>Davom Etish (Tasdiqlash Kodini Olish)</span>
              </button>
            </form>

            <div class="pt-3 border-t border-white/10 text-center">
              <p class="text-xs text-gray-400">
                Allaqachon hisobingiz bormi? 
                <a href="#/login" class="text-blue-400 font-bold hover:text-cyan-300 transition">Tizimga kiring</a>
              </p>
            </div>
          </div>

          <!-- STEP 2: Verification Code Form (2-rasmdagi ko'rinish) -->
          <div id="reg-step-2" class="space-y-6 hidden">
            <!-- Top Header -->
            <div class="text-center space-y-3">
              <div class="inline-flex relative group">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-2xl shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
                  <div class="w-full h-full bg-[#0d101d] rounded-2xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-tr from-emerald-300 via-teal-300 to-cyan-300 text-3xl">mark_email_read</span>
                  </div>
                </div>
              </div>
              <div>
                <h2 class="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">Emailni Tasdiqlash</h2>
                <p class="text-xs text-gray-400 mt-1">Gmail manzilingizga yuborilgan 6 xonali tasdiqlash kodini kiriting</p>
              </div>
            </div>

            <!-- Email Display Alert -->
            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs space-y-2 backdrop-blur-md">
              <div class="flex items-center gap-2 font-bold text-emerald-400">
                <span class="material-symbols-outlined text-[18px] shrink-0 text-emerald-400">mark_email_read</span>
                <span>Tasdiqlash kodi emailingizga yuborildi!</span>
              </div>
              <div class="text-[11px] text-gray-300 flex items-center gap-2 flex-wrap pt-0.5">
                <span class="text-gray-400">Yuborilgan manzil:</span>
                <span id="reg-email-display" class="font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30 break-all">email@gmail.com</span>
              </div>
            </div>

            <!-- Form Step 2 (Exactly as in 2-rasm) -->
            <form onsubmit="app.handleRegisterSubmit(event)" class="space-y-4">
              <!-- Verification Code Card (2-rasmdagi ko'rinish) -->
              <div class="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-3">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[17px] text-blue-400">verified</span>
                    <span>Tasdiqlash Kodi</span>
                  </label>
                  <span id="reg-timer-badge" class="px-2.5 py-1 rounded-full bg-blue-600 text-white font-bold text-[11px] shrink-0 shadow-md">
                    60s
                  </span>
                </div>
                
                <!-- Quick Code Helper Alert (for Demo/Vercel) -->
                <div id="reg-code-hint-box" class="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-between gap-2 text-xs text-cyan-200">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-cyan-400 text-[18px]">key</span>
                    <span>Kodingiz: <strong id="reg-code-hint" class="font-mono text-white text-sm tracking-widest font-black">---</strong></span>
                  </div>
                  <button type="button" onclick="const h=document.getElementById('reg-code-hint')?.textContent.trim(); if(h && h !== '---'){ document.getElementById('reg-code').value=h; app.showToast('Kod avtomatik kiritildi!', 'success'); }" class="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-[11px] font-bold transition shadow-sm">
                    Avto-kiritish
                  </button>
                </div>

                <input type="text" id="reg-code" required maxlength="6" inputmode="numeric" placeholder="6 xonali kod"
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-blue-500/40 text-white placeholder-gray-400 font-mono text-center tracking-widest text-lg font-bold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25 transition" />

                <p class="text-[11px] text-gray-400 text-center">
                  Gmail manzilingizni tekshiring yoki yuqoridagi kodni kiriting.
                </p>
              </div>

              <!-- Submit Button -->
              <button type="submit" id="btn-reg-submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs glow-button-primary transition shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]">
                <span class="material-symbols-outlined text-[18px]">how_to_reg</span>
                <span>Ro'yxatdan O'tish</span>
              </button>

              <!-- Resend Code Button -->
              <button type="button" id="btn-resend-reg-code" onclick="app.handleResendRegCode()" disabled
                class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-gray-200 text-xs font-semibold transition flex items-center justify-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">refresh</span>
                <span>Yangi Kod Yuborish</span>
              </button>
            </form>

            <div class="pt-3 border-t border-white/10 text-center">
              <button type="button" onclick="app.backToRegisterStep1()" class="text-xs text-blue-400 hover:text-cyan-300 font-semibold transition inline-flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">arrow_back</span>
                <span>Ma'lumotlarni o'zgartirish (Orqaga)</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  // ----------------------------------------------------
  // FORGOT PASSWORD — Step 1: Enter email, get code
  // ----------------------------------------------------
  renderForgotPassword() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="max-w-lg mx-auto my-6 sm:my-10 relative animate-entrance">
        <!-- Ambient Glow Orbs -->
        <div class="absolute -top-12 -right-12 w-80 h-80 bg-blue-500/25 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div class="absolute -bottom-12 -left-12 w-80 h-80 bg-purple-500/25 rounded-full blur-[100px] pointer-events-none" style="animation-delay: 2s;"></div>

        <!-- Luxury Glassmorphic Card -->
        <div class="relative z-10 p-7 sm:p-9 rounded-3xl bg-[#0b0e1b]/85 backdrop-blur-2xl border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 space-y-6">
          
          <!-- Header -->
          <div class="text-center space-y-3">
            <div class="inline-flex relative group">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-2xl shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                <div class="w-full h-full bg-[#0d101d] rounded-2xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-tr from-blue-300 via-cyan-300 to-indigo-300 text-3xl">lock_reset</span>
                </div>
              </div>
            </div>
            <div>
              <h2 class="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">Parolni Tiklash</h2>
              <p class="text-xs text-gray-400 mt-1">Gmail manzilingizni kiriting — 6 xonali tasdiqlash kodi yuboramiz</p>
            </div>
          </div>

          <!-- Step 1: Email input -->
          <div id="forgot-step-email" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-200 mb-1.5">Gmail Manzil</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3.5 text-gray-400 text-[18px]">mail</span>
                <input type="email" id="forgot-email-input" required placeholder="ali.valiyev@gmail.com"
                  class="auth-input w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
              </div>
            </div>

            <button id="btn-forgot-send" onclick="app.handleForgotSend()"
              class="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs glow-button-primary transition shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]">
              <span class="material-symbols-outlined text-[18px]">send</span>
              <span>Tasdiqlash Kodini Yuborish</span>
            </button>
          </div>

          <!-- Step 2: OTP + New password (initially hidden) -->
          <div id="forgot-step-reset" class="space-y-4 hidden">
            
            <!-- Sleek, Perfectly Aligned Email Display Card -->
            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs space-y-2 backdrop-blur-md">
              <div class="flex items-center gap-2 font-bold text-emerald-400">
                <span class="material-symbols-outlined text-[18px] shrink-0 text-emerald-400">mark_email_read</span>
                <span>Tasdiqlash kodi muvaffaqiyatli yuborildi!</span>
              </div>
              <div class="text-[11px] text-gray-300 flex items-center gap-2 flex-wrap pt-0.5">
                <span class="text-gray-400">Yuborilgan manzil:</span>
                <span id="forgot-email-display" class="font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30 break-all">email@gmail.com</span>
              </div>
            </div>

            <!-- OTP -->
            <div>
              <label class="block text-xs font-semibold text-gray-200 mb-1.5">Tasdiqlash Kodi (6 xonali)</label>
              <input type="text" id="forgot-otp-input" maxlength="6" inputmode="numeric"
                placeholder="• • • • • •"
                class="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-blue-500/40 text-white font-mono tracking-widest text-center text-lg font-bold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder-gray-600 transition" />
            </div>

            <!-- New password -->
            <div>
              <label class="block text-xs font-semibold text-gray-200 mb-1.5">Yangi Parol</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">lock</span>
                <input type="password" id="forgot-new-pass" minlength="4" placeholder="Kamida 4 ta belgi"
                  class="auth-input w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
                <button type="button" onclick="app.togglePassword('forgot-new-pass','fp-eye1')" class="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition">
                  <span id="fp-eye1" class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <!-- Confirm password -->
            <div>
              <label class="block text-xs font-semibold text-gray-200 mb-1.5">Parolni Qayta Tasdiqlang</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">lock_open</span>
                <input type="password" id="forgot-confirm-pass" minlength="4" placeholder="Parolni qayta tering"
                  class="auth-input w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
                <button type="button" onclick="app.togglePassword('forgot-confirm-pass','fp-eye2')" class="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition">
                  <span id="fp-eye2" class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <button id="btn-forgot-reset" onclick="app.handleForgotReset()"
              class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]">
              <span class="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Parolni Yangilash</span>
            </button>

            <button onclick="app.handleForgotResend()" id="btn-forgot-resend"
              class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 text-xs font-semibold transition flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[14px]">refresh</span>
              <span>Yangi Kod Yuborish</span>
            </button>
          </div>

          <div class="pt-4 border-t border-white/10 text-center">
            <a href="#/login" class="text-xs text-blue-400 hover:text-cyan-300 font-semibold transition inline-flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Kirish sahifasiga qaytish</span>
            </a>
          </div>
        </div>
      </div>
    `;
  },

  async handleForgotSend() {
    const email = (document.getElementById('forgot-email-input')?.value || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      showToast('Iltimos, to\'g\'ri Gmail manzil kiriting!', 'error');
      return;
    }

    const btn = document.getElementById('btn-forgot-send');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">refresh</span> Yuborilmoqda...';
    }

    const res = await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">send</span> Kod Yuborish';
    }

    if (res && res.success) {
      // Store email for next step
      try { sessionStorage.setItem('tp_reset_email', email); } catch (e) {}

      // Switch to step 2
      const stepEmail = document.getElementById('forgot-step-email');
      const stepReset = document.getElementById('forgot-step-reset');
      const emailDisplay = document.getElementById('forgot-email-display');
      if (stepEmail) stepEmail.classList.add('hidden');
      if (stepReset) stepReset.classList.remove('hidden');
      if (emailDisplay) emailDisplay.textContent = email;

      showToast(`✉️ Kod ${email} manziliga yuborildi! Emailingizni tekshiring.`, 'success');
      document.getElementById('forgot-otp-input')?.focus();
    } else {
      showToast(res?.message || 'Xatolik yuz berdi, qayta urinib ko\'ring', 'error');
    }
  },


  async handleForgotReset() {
    const email = (sessionStorage.getItem('tp_reset_email') || document.getElementById('forgot-email-input')?.value || '').trim().toLowerCase();
    const code = (document.getElementById('forgot-otp-input')?.value || '').trim();
    const newPass = document.getElementById('forgot-new-pass')?.value || '';
    const confirmPass = document.getElementById('forgot-confirm-pass')?.value || '';

    if (!email) { showToast('Email manzil topilmadi. Sahifani yangilang.', 'error'); return; }
    if (!code || code.length < 6) { showToast('6 xonali tasdiqlash kodini kiriting!', 'error'); return; }
    if (!newPass || newPass.length < 4) { showToast('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak!', 'error'); return; }
    if (newPass !== confirmPass) { showToast('Parollar bir-biriga mos kelmadi!', 'error'); return; }

    const btn = document.getElementById('btn-forgot-reset');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined text-[15px] animate-spin">refresh</span> Saqlanmoqda...';
    }

    const res = await api('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword: newPass })
    });

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span> Parolni Yangilash';
    }

    if (res && res.success) {
      showToast('🎉 Parol muvaffaqiyatli yangilandi! Yangi parol bilan kirish mumkin.', 'success');
      setTimeout(() => { window.location.hash = '#/login'; }, 1800);
    } else {
      showToast(res?.message || 'Xatolik yuz berdi, qayta urinib ko\'ring', 'error');
    }
  },

  async handleForgotResend() {
    const email = (sessionStorage.getItem('tp_reset_email') || '').trim().toLowerCase();
    if (!email) { showToast('Email topilmadi. Sahifani yangilang.', 'error'); return; }

    const btn = document.getElementById('btn-forgot-resend');
    if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Yuborilmoqda...'; }

    const res = await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined text-[14px]">refresh</span> Yangi Kod Yuborish';
    }

    if (res && res.success) {
      showToast('Yangi tasdiqlash kodi emailingizga yuborildi!', 'success');
    } else {
      showToast(res?.message || 'Xatolik yuz berdi', 'error');
    }
  },

  // renderResetPassword just routes back to the unified forgot-password page
  renderResetPassword(hash) {
    this.renderForgotPassword();
  },

  async handleRegisterStep1(e) {
    e?.preventDefault?.();
    const firstName = (document.getElementById('reg-firstname')?.value || '').trim();
    const lastName = (document.getElementById('reg-lastname')?.value || '').trim();
    const username = (document.getElementById('reg-username')?.value || '').trim().toLowerCase();
    const email = (document.getElementById('reg-email')?.value || '').trim().toLowerCase();
    const phone = (document.getElementById('reg-phone')?.value || '').trim();
    const password = document.getElementById('reg-password')?.value || '';
    const confirmPassword = document.getElementById('reg-confirm-password')?.value || '';

    if (!firstName) {
      showToast('Iltimos, ismingizni kiriting!', 'error');
      document.getElementById('reg-firstname')?.focus();
      return;
    }
    if (!lastName) {
      showToast('Iltimos, familiyangizni kiriting!', 'error');
      document.getElementById('reg-lastname')?.focus();
      return;
    }
    if (!username) {
      showToast('Iltimos, profilingiz uchun login kiriting!', 'error');
      document.getElementById('reg-username')?.focus();
      return;
    }
    if (!email || !email.includes('@')) {
      showToast('Iltimos, to\'g\'ri email / Gmail manzil kiriting!', 'error');
      document.getElementById('reg-email')?.focus();
      return;
    }
    if (!phone) {
      showToast('Iltimos, telefon raqamingizni kiriting!', 'error');
      document.getElementById('reg-phone')?.focus();
      return;
    }
    if (!password || password.length < 4) {
      showToast('Parol kamida 4 ta belgidan iborat bo\'lishi kerak!', 'error');
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

    const btnNext = document.getElementById('btn-reg-next');
    if (btnNext) {
      btnNext.disabled = true;
      btnNext.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">refresh</span> Kod yuborilmoqda...';
    }

    const res = await api('/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (btnNext) {
      btnNext.disabled = false;
      btnNext.innerHTML = '<span class="material-symbols-outlined text-[18px]">send</span> <span>Davom Etish (Tasdiqlash Kodini Olish)</span>';
    }

    if (res && res.success) {
      // Transition to Step 2
      const step1 = document.getElementById('reg-step-1');
      const step2 = document.getElementById('reg-step-2');
      const emailDisplay = document.getElementById('reg-email-display');
      if (step1) step1.classList.add('hidden');
      if (step2) step2.classList.remove('hidden');
      if (emailDisplay) emailDisplay.textContent = email;

      const codeVal = typeof res.data === 'string' ? res.data : (res.data?.code || sessionStorage.getItem('tp_pending_email_code_' + email) || '');
      const codeHint = document.getElementById('reg-code-hint');
      const codeInput = document.getElementById('reg-code');

      if (codeVal && codeVal.length === 6) {
        if (codeHint) codeHint.textContent = codeVal;
        if (codeInput) codeInput.value = codeVal;
        showToast(`✉️ Tasdiqlash kodi: ${codeVal}`, 'success');
      } else {
        showToast(`✉️ Kod ${email} manziliga yuborildi!`, 'success');
      }

      if (codeInput) {
        setTimeout(() => codeInput.focus(), 150);
      }

      this.startRegTimer();
    } else {
      showToast(res?.message || 'Kod yuborishda xatolik yuz berdi', 'error');
    }
  },

  async handleRegisterSubmit(e) {
    e?.preventDefault?.();
    const code = (document.getElementById('reg-code')?.value || '').trim();
    const firstName = (document.getElementById('reg-firstname')?.value || '').trim();
    const lastName = (document.getElementById('reg-lastname')?.value || '').trim();
    const username = (document.getElementById('reg-username')?.value || '').trim().toLowerCase();
    const email = (document.getElementById('reg-email')?.value || '').trim().toLowerCase();
    const phone = (document.getElementById('reg-phone')?.value || '').trim();
    const password = document.getElementById('reg-password')?.value || '';

    if (!code || code.length < 6) {
      showToast('Iltimos, 6 xonali tasdiqlash kodini kiriting!', 'error');
      document.getElementById('reg-code')?.focus();
      return;
    }

    const btn = document.getElementById('btn-reg-submit');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">refresh</span> Tekshirilmoqda...';
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        username,
        email,
        phoneNumber: phone,
        password,
        verificationCode: code
      })
    });

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">how_to_reg</span> <span>Ro\'yxatdan O\'tish</span>';
    }

    if (res && res.success && res.data) {
      saveSession(res.data.token, res.data.user);
      this.updateNavAuth();
      showToast(`🎉 Xush kelibsiz, ${res.data.user.fullName || username}! Muvaffaqiyatli ro'yxatdan o'tdingiz.`, 'success');
      setTimeout(() => {
        window.location.hash = '#/dashboard';
      }, 300);
    } else {
      showToast(res?.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi!', 'error');
      // If login/username error, bring user back to Step 1 so they can change the username
      if (res?.message && res.message.toLowerCase().includes('login')) {
        this.backToRegisterStep1();
        const uInp = document.getElementById('reg-username');
        if (uInp) {
          uInp.focus();
          uInp.select();
        }
      }
    }
  },

  startRegTimer() {
    let count = 60;
    const timerBadge = document.getElementById('reg-timer-badge');
    const resendBtn = document.getElementById('btn-resend-reg-code');
    if (resendBtn) resendBtn.disabled = true;

    if (this._regInterval) clearInterval(this._regInterval);
    this._regInterval = setInterval(() => {
      count--;
      if (timerBadge) timerBadge.innerText = `${count}s`;
      if (count <= 0) {
        clearInterval(this._regInterval);
        if (timerBadge) timerBadge.innerText = '0s';
        if (resendBtn) {
          resendBtn.disabled = false;
          resendBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">refresh</span> <span>Qayta Kod Yuborish</span>';
        }
      }
    }, 1000);
  },

  async handleResendRegCode() {
    const email = (document.getElementById('reg-email')?.value || '').trim().toLowerCase();
    if (!email) {
      showToast('Email topilmadi. Sahifani qayta yuklang.', 'error');
      return;
    }

    const resendBtn = document.getElementById('btn-resend-reg-code');
    if (resendBtn) {
      resendBtn.disabled = true;
      resendBtn.innerHTML = '<span class="material-symbols-outlined text-[14px] animate-spin">refresh</span> Yuborilmoqda...';
    }

    const res = await api('/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (res && res.success) {
      const codeVal = typeof res.data === 'string' ? res.data : (res.data?.code || sessionStorage.getItem('tp_pending_email_code_' + email) || '');
      const codeHint = document.getElementById('reg-code-hint');
      const codeInput = document.getElementById('reg-code');

      if (codeVal && codeVal.length === 6) {
        if (codeHint) codeHint.textContent = codeVal;
        if (codeInput) codeInput.value = codeVal;
        showToast(`✉️ Yangi tasdiqlash kodi: ${codeVal}`, 'success');
      } else {
        showToast('Yangi tasdiqlash kodi emailingizga yuborildi!', 'success');
      }

      this.startRegTimer();
    } else {
      showToast(res?.message || 'Kod yuborishda xatolik yuz berdi', 'error');
      if (resendBtn) resendBtn.disabled = false;
    }
  },

  backToRegisterStep1() {
    if (this._regInterval) clearInterval(this._regInterval);
    const step1 = document.getElementById('reg-step-1');
    const step2 = document.getElementById('reg-step-2');
    if (step2) step2.classList.add('hidden');
    if (step1) step1.classList.remove('hidden');
  },

  async sendVerificationCode() {
    await this.handleRegisterStep1();
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

      if (state.user.role === 'Admin') {
        recordAuditLog('ADMIN_LOGIN', 'Auth', state.user.email, `Bosh administrator tizimga kirdi (${state.user.fullName})`, state.user.fullName);
      } else {
        recordAuditLog('USER_LOGIN', 'Auth', state.user.email, `Talaba tizimga kirdi (${state.user.fullName})`, state.user.fullName);
      }

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
    const rawFirst = document.getElementById('reg-firstname')?.value.trim() || '';
    const rawLast = document.getElementById('reg-lastname')?.value.trim() || '';
    const firstName = rawFirst ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase() : '';
    const lastName = rawLast ? rawLast.charAt(0).toUpperCase() + rawLast.slice(1).toLowerCase() : '';
    const email = (document.getElementById('reg-email')?.value || '').trim();
    const phone = (document.getElementById('reg-phone')?.value || '').trim();
    const verificationCode = (document.getElementById('reg-code')?.value || '').trim();
    const password = document.getElementById('reg-password')?.value || '';
    const confirmPassword = document.getElementById('reg-confirm-password')?.value || '';
    const btn = document.getElementById('btn-reg-submit');

    if (!verificationCode || verificationCode.length < 6) {
      showToast('Iltimos, emailga yuborilgan 6 xonali tasdiqlash kodini kiriting!', 'error');
      document.getElementById('reg-code')?.focus();
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
      phoneNumber: phone,
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
      recordAuditLog('USER_REGISTER', 'User', email, `Yangi talaba ro'yxatdan o'tdi: ${payload.fullName} (${email}, Tel: ${phone})`, payload.fullName);
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

  logout(force = false) {
    if (!force) {
      this.openModal(`
        <div class="space-y-5 text-center p-2">
          <div class="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-rose-500/10">
            <span class="material-symbols-outlined text-3xl">logout</span>
          </div>
          <div>
            <h3 class="text-xl font-bold font-heading text-white">Tizimdan Chiqish</h3>
            <p class="text-xs text-gray-300 mt-1.5 leading-relaxed">Siz haqiqatdan ham saytni tark etmoqchimisiz?</p>
          </div>
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button type="button" onclick="app.closeModal()" class="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold transition hover:scale-[1.01] active:scale-[0.99]">
              Bekor qilish
            </button>
            <button type="button" onclick="app.closeModal(); app.logout(true);" class="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition hover:scale-[1.01] active:scale-[0.99]">
              Ha, chiqish
            </button>
          </div>
        </div>
      `, 'max-w-sm');
      return;
    }

    clearSession();
    this.updateNavAuth();
    showToast('Tizimdan muvaffaqiyatli chiqildi', 'info');
    window.location.hash = '#/login';
    this.renderLogin();
  },

  openModal(contentHtml, maxWidthClass = 'max-w-lg') {
    const modal = document.getElementById('modal-container');
    if (!modal) return;
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn" style="overscroll-behavior: contain; touch-action: none;" onclick="if(event.target === this) app.closeModal()">
        <div class="glass-panel p-5 sm:p-7 rounded-3xl w-full ${maxWidthClass} border border-white/10 shadow-2xl relative animate-scaleUp max-h-[88vh] flex flex-col overflow-hidden" style="overscroll-behavior: contain;" onclick="event.stopPropagation()">
          <button onclick="app.closeModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition z-20" title="Yopish">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
          <div class="overflow-y-auto max-h-[calc(88vh-2.5rem)] pr-1.5 py-1 space-y-4 custom-modal-scroll" style="overscroll-behavior: contain; -webkit-overflow-scrolling: touch;">
            ${contentHtml}
          </div>
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

  // IN-APP CUSTOM CONFIRMATION MODAL (Replaces browser confirm() dialogs)
  confirmModal({
    title = 'Tasdiqlash',
    message = 'Haqiqatdan ham ushbu amalni bajarmoqchimisiz?',
    confirmText = 'Tasdiqlash',
    cancelText = 'Bekor qilish',
    icon = 'warning',
    type = 'danger', // 'danger' | 'warning' | 'info' | 'primary'
    onConfirm = async () => {},
    onCancel = () => {}
  } = {}) {
    const isDanger = type === 'danger';
    const isWarning = type === 'warning';

    let iconWrapClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    let btnClass = 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30';

    if (isWarning) {
      iconWrapClass = 'bg-indigo-600/15 text-indigo-400 border-indigo-500/30';
      btnClass = 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30';
    } else if (type === 'primary' || type === 'info') {
      iconWrapClass = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      btnClass = 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30';
    }

    this.openModal(`
      <div class="text-center space-y-5">
        <div class="w-16 h-16 rounded-2xl ${iconWrapClass} border flex items-center justify-center mx-auto text-3xl shadow-xl">
          <span class="material-symbols-outlined text-[34px]">${icon}</span>
        </div>
        
        <div class="space-y-2">
          <h3 class="text-xl font-bold font-heading text-white">${this.escapeHtml(title)}</h3>
          <p class="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">${this.escapeHtml(message)}</p>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="button" id="btn-custom-modal-cancel" class="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-bold text-xs transition">
            ${this.escapeHtml(cancelText)}
          </button>
          <button type="button" id="btn-custom-modal-confirm" class="flex-1 py-3 rounded-xl ${btnClass} font-bold text-xs transition flex items-center justify-center gap-1.5">
            <span>${this.escapeHtml(confirmText)}</span>
          </button>
        </div>
      </div>
    `, 'max-w-md');

    setTimeout(() => {
      const cancelBtn = document.getElementById('btn-custom-modal-cancel');
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          app.closeModal();
          if (typeof onCancel === 'function') onCancel();
        };
      }

      const confirmBtn = document.getElementById('btn-custom-modal-confirm');
      if (confirmBtn) {
        confirmBtn.onclick = async () => {
          confirmBtn.disabled = true;
          confirmBtn.innerHTML = '<span class="material-symbols-outlined text-[15px] animate-spin">refresh</span> Bajarilmoqda...';
          try {
            if (typeof onConfirm === 'function') {
              await onConfirm();
            }
          } catch (err) {
            console.error(err);
          } finally {
            app.closeModal();
          }
        };
      }
    }, 20);
  },

  // IN-APP PRO / VIP GRANT MODAL (Replaces browser prompt() dialog)
  openGrantProModal(userId, fullName) {
    this.openModal(`
      <div class="space-y-5">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-indigo-500/10">
            👑
          </div>
          <h3 class="text-xl font-bold font-heading text-white">Tarif Biriktirish</h3>
          <p class="text-xs text-gray-400">Talaba: <span class="text-indigo-300 font-semibold">${this.escapeHtml(fullName)}</span></p>
        </div>

        <form onsubmit="app.handleGrantProSubmit(event, '${userId}', '${this.escapeJs(fullName)}')" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Tarif Turi</label>
            <select id="grant-plan-name" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-400">
              <option value="PRO" class="bg-[#14161f]" selected>👑 PRO (Barcha testlar va tahlillar)</option>
              <option value="VIP" class="bg-[#14161f]">💎 VIP (Nova AI Cheksiz + Barcha Sertifikatlar)</option>
              <option value="Lifetime" class="bg-[#14161f]">♾️ Lifetime (Umrbod to'liq ruxsat)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Muddat</label>
            <select id="grant-plan-days" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-400">
              <option value="30" class="bg-[#14161f]" selected>1 Oy (30 kun)</option>
              <option value="90" class="bg-[#14161f]">3 Oy (90 kun)</option>
              <option value="180" class="bg-[#14161f]">6 Oy (180 kun)</option>
              <option value="365" class="bg-[#14161f]">1 Yil (365 kun)</option>
              <option value="3650" class="bg-[#14161f]">Umrbod (10 yil)</option>
            </select>
          </div>

          <div class="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px] shrink-0">info</span>
            <span>Ushbu talabaga tanlangan tarif darhol faollashtiriladi.</span>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button type="button" onclick="app.closeModal()" class="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-xs transition">
              Bekor Qilish
            </button>
            <button type="submit" id="btn-grant-pro-submit" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">verified</span>
              <span>Biriktirish</span>
            </button>
          </div>
        </form>
      </div>
    `, 'max-w-md');
  },

  async handleGrantProSubmit(e, userId, fullName) {
    e.preventDefault();
    const planName = document.getElementById('grant-plan-name')?.value || 'PRO';
    const durationDays = parseInt(document.getElementById('grant-plan-days')?.value) || 30;
    const btn = document.getElementById('btn-grant-pro-submit');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined text-[15px] animate-spin">refresh</span> Saqlanmoqda...';
    }

    const res = await api('/api/subscription/admin/grant', {
      method: 'POST',
      body: JSON.stringify({ targetUserId: userId, planName, durationDays })
    });

    this.closeModal();
    if (res && res.success) {
      showToast(`${fullName} ga ${planName} tarifi muvaffaqiyatli berildi! 👑`, 'success');
      this.renderAdminUsers();
    } else {
      showToast(res?.message || 'Tarif berishda xatolik yuz berdi', 'error');
    }
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

    let diffBadgeClass = 'bg-indigo-600/10 text-indigo-300 border-indigo-500/25';
    let diffDotClass = 'bg-indigo-400';
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
      <div class="catalog-test-card p-5 sm:p-6 rounded-3xl glow-card hover-card-float flex flex-col justify-between relative group transition-all duration-300 ${isProTest ? 'test-card-locked border-indigo-500/30' : ''}" style="--card-accent: ${theme.colorHex};">
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
            ${isProTest ? '<span class="text-indigo-400 text-sm mt-0.5 shrink-0">🔒</span>' : ''}
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
              <a href="#/admin/edit-test/${test.id}" class="flex-1 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs text-center border border-indigo-500/30 transition flex items-center justify-center gap-1.5 glow-button-indigo btn-shimmer shadow-sm" title="Testni tahrirlash">
                <span class="material-symbols-outlined text-[16px]">edit</span> Tahrirlash
              </a>
              <a href="#/admin/add-question/${test.id}" class="flex-1 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold text-xs text-center border border-blue-500/30 transition flex items-center justify-center gap-1.5 glow-button-primary btn-shimmer shadow-sm" title="Savol qo'shish">
                <span class="material-symbols-outlined text-[16px]">add_circle</span> + Savol
              </a>
            </div>
          ` : isLockedForUser ? `
            <button onclick="app.openProTestGateModal('${this.escapeJs(test.title)}')" class="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-violet-500/20 hover:from-violet-500/30 hover:to-indigo-500/30 text-indigo-300 font-bold text-xs text-center border border-indigo-500/40 shadow-lg shadow-indigo-500/10 transition flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">lock</span>
              <span>PRO Obuna bilan ochish</span>
            </button>
          ` : `
            <a href="#/test-solve/${test.id}" class="w-full py-3 rounded-2xl ${isProTest ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black shadow-lg shadow-indigo-500/25' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold glow-button-primary shadow-lg shadow-blue-500/20'} text-xs text-center btn-shimmer transition flex items-center justify-center gap-2 group-hover:scale-[1.02]">
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
              <a href="#/admin/tests" class="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition flex items-center gap-1.5">
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
                <span class="material-symbols-outlined text-[15px] text-indigo-400">tune</span> Qiyinchilik:
              </span>
              <div class="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 gap-1 text-xs" id="difficulty-pill-group">
                <button onclick="app.setDifficultyFilter('all')" class="px-3 py-1.5 rounded-lg font-bold transition ${state.selectedDifficultyFilter === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-gray-400 hover:text-white'}">
                  Barchasi
                </button>
                <button onclick="app.setDifficultyFilter('Easy')" class="px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${state.selectedDifficultyFilter === 'Easy' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25' : 'text-gray-400 hover:text-white'}">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Oson
                </button>
                <button onclick="app.setDifficultyFilter('Medium')" class="px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${state.selectedDifficultyFilter === 'Medium' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25' : 'text-gray-400 hover:text-white'}">
                  <span class="w-2 h-2 rounded-full bg-indigo-400"></span> O'rta
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
                  <span class="material-symbols-outlined text-[20px] ${meta.badge.includes('blue') ? 'text-blue-400' : meta.badge.includes('purple') ? 'text-purple-400' : meta.badge.includes('emerald') ? 'text-emerald-400' : meta.badge.includes('cyan') ? 'text-cyan-400'  : meta.badge.includes('rose') ? 'text-rose-400' : 'text-blue-400'}">${meta.icon}</span>
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
              <span class="material-symbols-outlined text-[15px] ${isActive ? 'text-white' : meta.badge.includes('blue') ? 'text-blue-400' : meta.badge.includes('purple') ? 'text-purple-400' : meta.badge.includes('emerald') ? 'text-emerald-400' : meta.badge.includes('cyan') ? 'text-cyan-400'  : meta.badge.includes('rose') ? 'text-rose-400' : 'text-blue-400'}">${meta.icon}</span>
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
      if (diff === 'Medium' && btns[2]) btns[2].className = 'px-3 py-1.5 rounded-lg font-bold transition bg-indigo-600 text-white shadow-md shadow-indigo-500/25 flex items-center gap-1.5';
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
        <div class="max-w-lg mx-auto glass-panel p-8 rounded-3xl text-center mt-12 space-y-4 border border-indigo-500/30 animate-fadeIn">
          <div class="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
            <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h2 class="text-2xl font-black text-white font-heading">Admin Test Topshira Olmaydi</h2>
          <p class="text-xs text-gray-300 leading-relaxed">
            Siz <strong>Administrator</strong> hisobidasiz. Platforma qoidalariga ko'ra testlarni faqat <strong>Talabalar</strong> topshirishi mumkin.
          </p>
          <div class="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#/admin/edit-test/${testId}" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5">
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
    state.quizAdsShown = {};
    state.quizTimerPaused = false;
    state.quizStartedAt = new Date().toISOString();
    state.quizTimeRemainingSeconds = (test.timeLimitMinutes || 10) * 60;

    this.renderQuizStudioContent();
    this.startQuizTimer();
  },

  startQuizTimer() {
    if (state.quizTimerInterval) clearInterval(state.quizTimerInterval);

    state.quizTimerInterval = setInterval(() => {
      if (state.quizTimerPaused) return; // Paused during 10-second advertisement
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
              <span class="material-symbols-outlined text-[18px] text-indigo-400">timer</span>
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
      const targetIndex = state.currentQuestionIndex + 1;
      const totalQ = state.activeQuiz.questions.length;
      
      const isProUser = state.user?.isPremium || state.user?.premiumPlan === 'Pro' || state.user?.premiumPlan === 'VIP' || state.user?.premiumPlan === 'Lifetime' || state.user?.role === 'Admin';

      // 1-2 ads during quiz for free tier (milestone 1 at ~35% and milestone 2 at ~75%)
      state.quizAdsShown = state.quizAdsShown || {};
      const milestone1 = Math.max(1, Math.floor(totalQ * 0.35));
      const milestone2 = Math.max(milestone1 + 1, Math.floor(totalQ * 0.75));

      const shouldShowAd = !isProUser && 
        ((targetIndex === milestone1 && !state.quizAdsShown[milestone1]) || 
         (targetIndex === milestone2 && !state.quizAdsShown[milestone2]));

      if (shouldShowAd) {
        state.quizAdsShown[targetIndex] = true;
        this.showQuizAdModal(() => {
          state.currentQuestionIndex = targetIndex;
          this.renderQuizStudioContent();
        });
        return;
      }

      state.currentQuestionIndex = targetIndex;
      this.renderQuizStudioContent();
    }
  },

  showQuizAdModal(onContinue) {
    // Pause quiz countdown timer so student loses 0 seconds
    state.quizTimerPaused = true;

    const modal = document.getElementById('modal-container');
    if (!modal) {
      if (onContinue) onContinue();
      return;
    }

    let secondsLeft = 10;
    const adId = 'quiz-ad-' + Date.now();

    const adContent = `
      <div id="${adId}" class="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div class="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 border border-indigo-500/40 bg-gradient-to-b from-[#1c1a24] via-[#14161f] to-[#0f1015] shadow-2xl relative text-center">
          
          <!-- Top Ad Badge & Live Timer -->
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 text-[10px] font-bold tracking-wider uppercase border border-indigo-500/30 flex items-center gap-1">
                <span class="material-symbols-outlined text-[13px]">campaign</span> Homiylik Reklamasi
              </span>
            </div>
            <div class="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
              <span class="material-symbols-outlined text-indigo-400 text-[16px]">timer</span>
              <span id="ad-timer-count" class="text-xs font-mono font-bold text-indigo-300">${secondsLeft}s</span>
            </div>
          </div>

          <!-- Main Ad Content / PRO Pitch -->
          <div class="space-y-4 py-2">
            <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-500/30 to-indigo-400/20 text-indigo-400 border border-indigo-500/40 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20 animate-bounce">
              👑
            </div>

            <div class="space-y-2">
              <h3 class="text-lg font-bold font-heading text-white">
                Reklamasiz, Tezkor va Qulay Test Yechish!
              </h3>
              <p class="text-xs text-gray-300 leading-relaxed max-w-md mx-auto">
                Ushbu reklamalarni butunlay o'chirish uchun <strong class="text-indigo-300 font-bold">PRO tarif obunasi</strong>ni olishingiz shart yoki 10 sekund kuting va reklamalar bilan bepul davom etaversangiz bo'ladi.
              </p>
            </div>

            <div class="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div class="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                <span class="material-symbols-outlined text-[15px]">verified</span> 100% Reklamasiz test yechish
              </div>
              <div class="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                <span class="material-symbols-outlined text-[15px]">verified</span> Barcha fan va PRO testlar ochiq
              </div>
              <div class="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                <span class="material-symbols-outlined text-[15px]">verified</span> Cheksiz urinishlar & Oltin Sertifikat
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-2 pt-2 border-t border-white/10">
            <div class="flex flex-col sm:flex-row items-center gap-2">
              <a href="#/pricing" target="_blank" onclick="state.quizTimerPaused = false; app.closeModal();" class="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">workspace_premium</span>
                <span>PRO Obunaga O'tish</span>
              </a>
              <button id="btn-ad-skip" disabled class="w-full sm:flex-1 py-3 rounded-xl bg-white/10 text-gray-400 text-xs font-bold transition flex items-center justify-center gap-1 cursor-not-allowed">
                <span>Kuting: <span id="ad-skip-counter">10</span>s</span>
              </button>
            </div>
            <p class="text-[10px] text-gray-500">Reklama davomida testingiz vaqti to'xtatib turiladi (vaqt ketmaydi)</p>
          </div>

        </div>
      </div>
    `;

    modal.innerHTML = adContent;

    const timerInterval = setInterval(() => {
      secondsLeft--;
      const countEl = document.getElementById('ad-timer-count');
      const skipCounterEl = document.getElementById('ad-skip-counter');
      const skipBtn = document.getElementById('btn-ad-skip');

      if (countEl) countEl.textContent = `${secondsLeft}s`;
      if (skipCounterEl) skipCounterEl.textContent = secondsLeft;

      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        if (skipBtn) {
          skipBtn.disabled = false;
          skipBtn.className = "w-full sm:flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 glow-button-primary shadow-lg shadow-blue-500/30 cursor-pointer animate-scaleUp";
          skipBtn.innerHTML = `<span>Davom etish</span> <span class="material-symbols-outlined text-[16px]">arrow_forward</span>`;
          skipBtn.onclick = () => {
            state.quizTimerPaused = false;
            app.closeModal();
            if (onContinue) onContinue();
          };
        }
      }
    }, 1000);
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
  // VIEW 4: TEST RESULT & DETAILED REVIEW (TAHLIL)
  // ----------------------------------------------------
  async renderResult(attemptId) {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="max-w-4xl mx-auto p-12 text-center text-gray-400">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm">Test natijalari va savollar tahlili yuklanmoqda...</p>
      </div>
    `;

    const res = await api(`/api/profile/attempts/${attemptId}/review`);
    if (!res.success || !res.data) {
      root.innerHTML = `
        <div class="max-w-lg mx-auto glass-panel p-8 rounded-2xl text-center mt-12 space-y-4">
          <span class="material-symbols-outlined text-4xl text-rose-400">error</span>
          <p class="text-rose-400 font-bold">Natijani yuklab bo'lmadi</p>
          <p class="text-xs text-gray-400">Ushbu test topshirish natijasi topilmadi yoki hali saqlanmagan.</p>
          <a href="#/tests" class="inline-block px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition">Testlar katalogiga qaytish</a>
        </div>
      `;
      return;
    }

    const review = res.data;
    const isPassed = review.isPassed;
    const questions = review.questions || [];
    const totalQuestions = questions.length;
    const correctCount = questions.filter(q => q.isCorrect).length;
    const wrongCount = questions.filter(q => !q.isCorrect && q.selectedOptionId).length;
    const unansweredCount = questions.filter(q => !q.selectedOptionId).length;

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
    const testId = review.testId || state.activeQuiz?.id || 'tests';

    root.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
        
        <!-- Top Back Navigation -->
        <div class="flex items-center justify-between">
          <a href="${backDest}" class="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 inline-flex items-center gap-1.5 transition shadow-sm" title="Dashboardga qaytish">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>⬅️ Orqaga</span>
          </a>
          <a href="#/test-solve/${testId}" class="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 inline-flex items-center gap-1.5 transition shadow-sm" title="Testni qaytadan yechish">
            <span class="material-symbols-outlined text-[18px]">replay</span>
            <span>Testni Qaytadan Yechish</span>
          </a>
        </div>

        <!-- Score Summary Card -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl text-center relative overflow-hidden border ${isPassed ? 'border-emerald-500/30' : 'border-rose-500/30'}">
          <div class="w-20 h-20 rounded-3xl ${isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'} flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span class="material-symbols-outlined text-4xl">${isPassed ? 'workspace_premium' : 'cancel'}</span>
          </div>

          <span class="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
            ${isPassed ? '🎉 Testdan Muvaffaqiyatli O\'tdingiz!' : '❌ Afsuski, O\'ta Olmadingiz'}
          </span>

          <h1 class="text-2xl sm:text-3xl font-black font-heading text-white mt-3 mb-1">${this.escapeHtml(review.testTitle)}</h1>
          <p class="text-xs text-gray-400">Talaba: <strong class="text-gray-200">${this.escapeHtml(review.studentName || state.user?.fullName || 'Talaba')}</strong></p>

          <!-- Metrics Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6 text-center">
            <div class="bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <span class="text-[11px] text-gray-400 block mb-1">To'plangan Ball</span>
              <span class="text-xl sm:text-2xl font-black text-white font-heading">${review.earnedScore} / ${review.totalScore}</span>
            </div>

            <div class="bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <span class="text-[11px] text-gray-400 block mb-1">Natija Foizi</span>
              <span class="text-xl sm:text-2xl font-black ${isPassed ? 'text-emerald-400' : 'text-rose-400'} font-heading">${review.percentage}%</span>
            </div>

            <div class="bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <span class="text-[11px] text-gray-400 block mb-1">To'g'ri Javoblar</span>
              <span class="text-xl sm:text-2xl font-black text-emerald-400 font-heading">${correctCount} / ${totalQuestions}</span>
            </div>

            <div class="bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <span class="text-[11px] text-gray-400 block mb-1">Xatolar Soni</span>
              <span class="text-xl sm:text-2xl font-black text-rose-400 font-heading">${wrongCount + unansweredCount} ta</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center justify-center gap-3 mt-8">
            ${certificate ? `
              <a href="#/certificate/${certificate.certificateNumber}" class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs glow-button-primary transition flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                <span class="material-symbols-outlined text-[18px]">workspace_premium</span> Sertifikatni Ko'rish
              </a>
            ` : ''}

            <a href="#/test-solve/${testId}" class="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs glow-button-primary transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
              <span class="material-symbols-outlined text-[18px]">replay</span> Xatolar ustida ishlash (Qaytadan yechish)
            </a>

            <a href="#/tests" class="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-semibold transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">grid_view</span> Boshqa testlar
            </a>

            <a href="#/leaderboard" class="px-5 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">military_tech</span> Reyting
            </a>
          </div>
        </div>

        <!-- Detailed Question-by-Question Review Header & Filter Controls -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 class="text-xl font-black font-heading text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-400 text-2xl">analytics</span>
                <span>Savollar va Xatolar Tahlili</span>
              </h3>
              <p class="text-xs text-gray-400 mt-1">Har bir savolning to'g'ri javobi va xatolik sababi bilan batafsil tanishing</p>
            </div>

            <!-- Filter Buttons: All, Correct, Mistakes -->
            <div class="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
              <button onclick="app.filterReviewQuestions('all')" id="review-filter-all" class="review-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-blue-600 text-white shadow-md">
                Barchasi (${totalQuestions})
              </button>
              <button onclick="app.filterReviewQuestions('correct')" id="review-filter-correct" class="review-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-white/5 text-emerald-400 hover:text-white flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span> To'g'ri (${correctCount})
              </button>
              <button onclick="app.filterReviewQuestions('wrong')" id="review-filter-wrong" class="review-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-white/5 text-rose-400 hover:text-white flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-rose-400"></span> Xatolar (${wrongCount + unansweredCount})
              </button>
            </div>
          </div>

          <!-- Questions List -->
          <div class="space-y-6" id="review-questions-container">
            ${questions.map((q, idx) => {
              const isCorrect = !!q.isCorrect;
              const hasAnswered = !!q.selectedOptionId;
              const statusType = isCorrect ? 'correct' : 'wrong';
              const correctOpt = (q.options || []).find(o => o.id === q.correctOptionId || o.isCorrect);

              let badgeHtml = '';
              let cardBorder = '';
              let cardBg = '';

              if (isCorrect) {
                cardBorder = 'border-emerald-500/30';
                cardBg = 'bg-emerald-500/5';
                badgeHtml = `
                  <span class="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[15px]">check_circle</span>
                    <span>To'g'ri javob berildi (+${q.points || 1} ball)</span>
                  </span>
                `;
              } else if (hasAnswered) {
                cardBorder = 'border-rose-500/40';
                cardBg = 'bg-rose-500/5';
                badgeHtml = `
                  <span class="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[15px]">cancel</span>
                    <span>Xato javob berildi (0 ball)</span>
                  </span>
                `;
              } else {
                cardBorder = 'border-indigo-500/40';
                cardBg = 'bg-indigo-600/5';
                badgeHtml = `
                  <span class="px-3 py-1 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[15px]">hourglass_empty</span>
                    <span>Javob belgilanmagan (0 ball)</span>
                  </span>
                `;
              }

              const explanation = q.explanation || (correctOpt ? `Ushbu savolning to'g'ri javobi: "${correctOpt.text}". Bu javob fanning rasmiy qoidalari va standart darslik dasturiga to'liq mos keladi.` : "Standart talablariga ko'ra belgilangan to'g'ri javob.");

              return `
                <div class="review-question-card p-5 sm:p-6 rounded-3xl border ${cardBorder} ${cardBg} space-y-4 transition" data-status="${statusType}">
                  <!-- Card Header -->
                  <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div class="flex items-center gap-2">
                      <span class="w-8 h-8 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center justify-center font-mono">
                        ${idx + 1}
                      </span>
                      <span class="text-xs font-bold text-gray-300">Savol #${idx + 1}</span>
                    </div>
                    ${badgeHtml}
                  </div>

                  <!-- Question Text -->
                  <div class="text-base sm:text-lg font-bold text-white leading-relaxed">
                    ${this.escapeHtml(q.questionText || q.text || `Savol #${idx + 1}`)}
                  </div>

                  <!-- Options List -->
                  <div class="space-y-2.5 pt-1">
                    ${(q.options || []).map((opt, oIdx) => {
                      const letter = ['A', 'B', 'C', 'D', 'E'][oIdx] || '';
                      const isUserSelected = opt.id === q.selectedOptionId;
                      const isCorrectOption = opt.id === q.correctOptionId || opt.isCorrect;

                      let optContainerClass = 'border-white/10 bg-white/5 text-gray-300';
                      let badgeRight = '';

                      if (isCorrectOption) {
                        optContainerClass = 'border-2 border-emerald-500/80 bg-emerald-500/20 text-emerald-200 font-bold shadow-lg shadow-emerald-500/10';
                        badgeRight = `
                          <span class="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-black text-[11px] flex items-center gap-1 shrink-0">
                            <span class="material-symbols-outlined text-[14px]">check</span> To'g'ri javob
                          </span>
                        `;
                      } else if (isUserSelected && !isCorrect) {
                        optContainerClass = 'border-2 border-rose-500/80 bg-rose-500/20 text-rose-200 font-bold shadow-lg shadow-rose-500/10';
                        badgeRight = `
                          <span class="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1 shrink-0">
                            <span class="material-symbols-outlined text-[14px]">close</span> Sizning javobingiz
                          </span>
                        `;
                      }

                      return `
                        <div class="p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 transition ${optContainerClass}">
                          <div class="flex items-center gap-3 min-w-0">
                            <span class="w-7 h-7 rounded-xl ${isCorrectOption ? 'bg-emerald-500 text-black font-black' : isUserSelected ? 'bg-rose-500 text-white font-bold' : 'bg-white/10 text-gray-400'} flex items-center justify-center text-xs font-bold shrink-0">
                              ${letter}
                            </span>
                            <span class="leading-snug">${this.escapeHtml(opt.text)}</span>
                          </div>
                          ${badgeRight}
                        </div>
                      `;
                    }).join('')}
                  </div>

                  <!-- Mistake Explanation & Reason Box -->
                  <div class="p-4 rounded-2xl ${isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-indigo-600/10 border border-indigo-500/20'} space-y-2 mt-3">
                    <div class="flex items-center gap-2 ${isCorrect ? 'text-emerald-400' : 'text-indigo-400'} font-bold text-xs">
                      <span class="material-symbols-outlined text-[18px]">lightbulb</span>
                      <span>${isCorrect ? "To'g'ri javob izohi:" : "💡 Xatoning sababi va to'g'ri javob tushuntirishi:"}</span>
                    </div>
                    <p class="text-xs text-gray-200 leading-relaxed font-sans">
                      ${this.escapeHtml(explanation)}
                    </p>
                  </div>

                  <!-- Question Issue Report Link -->
                  <div class="pt-2 flex items-center justify-between text-[11px] text-gray-400">
                    <span class="text-gray-500">Ball: ${q.points || 1} ball</span>
                    <button type="button" onclick="app.openSupportModal('Savoldagi xatolik', '«${this.escapeJs(review.testTitle)}» - Savol #${idx + 1}', 'Savol: ${this.escapeJs(q.questionText || q.text || '')}\\n\\nXatolik haqida:')" class="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition">
                      <span class="material-symbols-outlined text-[14px]">flag</span> Savolda xatolik bormi? Adminga xabar bering
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  },

  filterReviewQuestions(filterType) {
    document.querySelectorAll('.review-filter-btn').forEach(btn => {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
      btn.classList.add('bg-white/5', 'text-gray-400', 'hover:text-white');
    });

    const activeBtn = document.getElementById(`review-filter-${filterType}`);
    if (activeBtn) {
      activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
      activeBtn.classList.remove('bg-white/5', 'text-gray-400');
    }

    const items = document.querySelectorAll('.review-question-card');
    items.forEach(item => {
      const status = item.getAttribute('data-status');
      if (filterType === 'all' || status === filterType) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
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
          <div class="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
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
        <div class="glass-panel p-8 rounded-3xl text-center border-t-4 border-t-indigo-500 glow-card w-full bg-gradient-to-b from-indigo-500/10 to-transparent">
          <div class="w-16 h-16 rounded-full bg-indigo-400/20 text-indigo-300 font-black text-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-400/40 shadow-lg shadow-indigo-500/20 animate-pulse-glow">
            👑
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 text-[10px] font-bold uppercase">1-O'rin G'olib</span>
          <h4 class="font-bold text-white text-lg mt-1 flex items-center justify-center">${this.escapeHtml(top1.studentName)} ${getBadge(top1)}</h4>
          <p class="text-xs text-gray-400 mb-4">${this.escapeHtml(top1.testTitle)}</p>
          <div class="bg-indigo-600/20 border border-indigo-500/30 p-3 rounded-2xl text-indigo-300 font-black text-lg">${top1.percentage}% (${getScoreText(top1)})</div>
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
        <div class="glass-panel p-8 rounded-3xl text-center border-t-4 border-t-indigo-500 glow-card flex-1 order-1 md:order-2 bg-gradient-to-b from-indigo-500/10 to-transparent">
          <div class="w-16 h-16 rounded-full bg-indigo-400/20 text-indigo-300 font-black text-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-400/40 shadow-lg shadow-indigo-500/20 animate-pulse-glow">
            👑
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 text-[10px] font-bold uppercase">1-O'rin G'olib</span>
          <h4 class="font-bold text-white text-lg mt-1 flex items-center justify-center">${this.escapeHtml(top1.studentName)} ${getBadge(top1)}</h4>
          <p class="text-xs text-gray-400 mb-4">${this.escapeHtml(top1.testTitle)}</p>
          <div class="bg-indigo-600/20 border border-indigo-500/30 p-3 rounded-2xl text-indigo-300 font-black text-lg">${top1.percentage}% (${getScoreText(top1)})</div>
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
        <div class="glass-panel p-8 rounded-3xl text-center border-t-4 border-t-indigo-500 glow-card order-1 md:order-2 bg-gradient-to-b from-indigo-500/10 to-transparent">
          <div class="w-16 h-16 rounded-full bg-indigo-400/20 text-indigo-300 font-black text-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-400/40 shadow-lg shadow-indigo-500/20 animate-pulse-glow">
            👑
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 text-[10px] font-bold uppercase">1-O'rin G'olib</span>
          <h4 class="font-bold text-white text-lg mt-1 flex items-center justify-center">${this.escapeHtml(top1.studentName)} ${getBadge(top1)}</h4>
          <p class="text-xs text-gray-400 mb-4">${this.escapeHtml(top1.testTitle)}</p>
          <div class="bg-indigo-600/20 border border-indigo-500/30 p-3 rounded-2xl text-indigo-300 font-black text-lg">${top1.percentage}% (${getScoreText(top1)})</div>
        </div>

        <!-- 3rd Place -->
        <div class="glass-panel p-6 rounded-3xl text-center border-t-4 border-t-orange-600 glow-card order-3">
          <div class="w-12 h-12 rounded-full bg-orange-700/20 text-orange-400 font-black text-lg flex items-center justify-center mx-auto mb-2 border border-orange-700/30">
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
                <span class="material-symbols-outlined text-indigo-400">verified</span>
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
                  <button onclick="window.location.hash = '#/certificate/${encodeURIComponent(c.certificateNumber)}'" class="px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm">
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
              <span class="material-symbols-outlined text-5xl text-indigo-400">verified</span>
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
    const tagColorClass = isDiamond ? 'text-cyan-300' : (isGold ? 'text-indigo-400' : 'text-blue-400');
    const issueDate = new Date(c.issuedAt || Date.now()).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });

    target.innerHTML = `
      <div class="space-y-6">
        
        <!-- Action Bar -->
        <div class="flex items-center justify-end gap-3">
          <button onclick="app.printCertificate()" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold flex items-center gap-2 transition shadow-sm">
            <span class="material-symbols-outlined text-[18px] text-indigo-400">print</span> Chop etish / PDF
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
          <div class="cert-subject-box inline-block px-7 py-3 rounded-2xl ${isDiamond ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200' : isGold ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200' : 'bg-blue-950/40 border-blue-500/40 text-blue-200'} border text-base sm:text-xl font-bold font-heading mb-8 shadow-sm">
            ${this.escapeHtml(c.testTitle)}
          </div>

          <!-- Bottom Meta & Security Validation -->
          <div class="cert-meta-row pt-7 border-t ${isDiamond ? 'border-cyan-500/30' : isGold ? 'border-indigo-500/30' : 'border-blue-500/30'} grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-xs text-gray-400">
            <div class="text-left">
              <span class="cert-meta-label block text-[10px] text-gray-500 uppercase font-semibold">Berilgan sana</span>
              <strong class="cert-meta-value text-gray-200">${issueDate}</strong>
            </div>

            <div class="text-center">
              <span class="cert-meta-label block text-[10px] ${isDiamond ? 'text-cyan-400' : isGold ? 'text-indigo-400' : 'text-blue-400'} uppercase font-bold">Sertifikat Raqami</span>
              <strong class="cert-meta-value font-mono font-bold ${isDiamond ? 'text-cyan-300 highlight-diamond' : isGold ? 'text-indigo-400 highlight-gold' : 'text-blue-300'}">${this.escapeHtml(c.certificateNumber)}</strong>
            </div>

            <div class="text-right">
              <span class="cert-meta-label block text-[10px] text-gray-500 uppercase font-semibold">Tasdiq Holati</span>
              <strong class="cert-meta-value highlight-green text-emerald-400 font-mono font-bold flex items-center justify-end gap-1">
                <span class="material-symbols-outlined text-[14px]">verified</span> ${this.escapeHtml(c.verificationCode || 'VERIFIED-OK')}
              </strong>
            </div>
          </div>

          <!-- Registry Verification Note -->
          <div class="mt-6 pt-4 border-t ${isDiamond ? 'border-cyan-500/10' : isGold ? 'border-indigo-500/10' : 'border-blue-500/10'} flex flex-wrap items-center justify-between text-[10px] text-gray-500">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[13px] ${isDiamond ? 'text-cyan-400' : isGold ? 'text-indigo-400' : 'text-blue-400'}">verified_user</span>
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
            <!-- Avatar with Upload Button -->
            <div class="relative group cursor-pointer" onclick="document.getElementById('prof-avatar-file').click()" title="Profil rasmini o'zgartirish">
              <div class="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl ${isAdmin ? 'bg-indigo-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'} text-white font-black text-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 overflow-hidden border-2 border-white/20">
                ${state.user.avatarUrl ? `<img src="${state.user.avatarUrl}" alt="Avatar" class="w-full h-full object-cover" />` : (state.user.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div class="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-0.5">
                <span class="material-symbols-outlined text-[20px]">photo_camera</span>
                <span>O'zgartirish</span>
              </div>
              <input type="file" id="prof-avatar-file" accept="image/png, image/jpeg, image/webp, image/gif" class="hidden" onchange="app.handleAvatarUpload(event)" />
            </div>

            <div>
              <h2 class="text-2xl font-black font-heading text-white flex items-center gap-2">
                <span>${state.user.fullName || 'Foydalanuvchi'}</span>
                ${state.user.isPremium ? (state.user.premiumPlan === 'VIP' ? '<span class="badge-vip">💎 VIP</span>' : '<span class="badge-pro">👑 PRO</span>') : ''}
              </h2>
              <p class="text-xs text-gray-400">${state.user.email}</p>
              <div class="flex items-center gap-2.5 mt-2 flex-wrap">
                <span class="px-2.5 py-0.5 rounded-full ${isAdmin ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'} text-[10px] font-bold uppercase">
                  ${isAdmin ? '👑 Tizim Administratori' : '🎓 Talaba'}
                </span>
                <button type="button" onclick="document.getElementById('prof-avatar-file').click()" class="px-2.5 py-0.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-[11px] text-blue-300 hover:text-white font-semibold transition flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">add_a_photo</span>
                  <span>Rasm yuklash</span>
                </button>
              </div>
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
        <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/25 via-[#14161f] to-[#14161f] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div class="flex items-center gap-4 text-left">
            <div class="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">
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
            <a href="#/pricing" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition">
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

          <!-- Column 2: Parolni O'zgartirish (2-Bosqichli) -->
          <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 class="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <span class="material-symbols-outlined text-indigo-400 text-lg">lock_reset</span> Parolni O'zgartirish
            </h3>

            <!-- STEP 1: Parollarni kiritish -->
            <div id="pass-step-1" class="space-y-4">
              <form onsubmit="app.handlePasswordChangeStep1(event)" class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-300 mb-1">Joriy (Eski) Parol</label>
                  <div class="relative">
                    <input type="password" id="pass-current" required placeholder="Hozirgi parolingiz" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500" />
                    <button type="button" onclick="app.togglePassword('pass-current', 'pass-eye-cur')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200">
                      <span id="pass-eye-cur" class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-300 mb-1">Yangi Parol</label>
                  <div class="relative">
                    <input type="password" id="pass-new" required minlength="4" placeholder="Kamida 4 ta belgi" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500" />
                    <button type="button" onclick="app.togglePassword('pass-new', 'pass-eye-new')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200">
                      <span id="pass-eye-new" class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-300 mb-1">Yangi Parolni Tasdiqlang</label>
                  <div class="relative">
                    <input type="password" id="pass-confirm" required minlength="4" placeholder="Yangi parolni qayta tering" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500" />
                    <button type="button" onclick="app.togglePassword('pass-confirm', 'pass-eye-conf')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200">
                      <span id="pass-eye-conf" class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </div>
                </div>

                <button type="submit" id="btn-pass-step1" class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs glow-button-primary transition flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">send</span>
                  <span>Davom Etish (Tasdiqlash Kodini Olish)</span>
                </button>
              </form>
            </div>

            <!-- STEP 2: Email Tasdiqlash Kodi (2-rasmdagi ko'rinish) -->
            <div id="pass-step-2" class="space-y-4 hidden">
              <!-- Email Display Alert -->
              <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs space-y-1.5 backdrop-blur-md">
                <div class="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span class="material-symbols-outlined text-[17px] shrink-0">mark_email_read</span>
                  <span>Tasdiqlash kodi emailingizga yuborildi!</span>
                </div>
                <div class="text-[11px] text-gray-300 flex items-center gap-1.5 flex-wrap">
                  <span class="text-gray-400">Yuborilgan manzil:</span>
                  <span class="font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30 break-all">${state.user.email}</span>
                </div>
              </div>

              <form onsubmit="app.handleChangePasswordSubmit(event)" class="space-y-3.5">
                <!-- 2-rasmdagi Tasdiqlash Kodi Bloki -->
                <div class="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-2.5">
                  <div class="flex items-center justify-between">
                    <label class="block text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px]">verified</span>
                      <span>Tasdiqlash Kodi</span>
                    </label>
                    <span id="pass-timer-badge" class="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-bold text-[11px] shrink-0 shadow-md">
                      60s
                    </span>
                  </div>
                  <input type="text" id="pass-verify-code" required maxlength="6" inputmode="numeric" placeholder="6 xonali kod"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-indigo-500/40 text-white placeholder-gray-400 font-mono text-center tracking-widest text-base font-bold focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25 transition" />
                  <p class="text-[10px] text-gray-400 text-center">Emailingizga yuborilgan 6 xonali tasdiqlash kodini kiriting.</p>
                </div>

                <button type="submit" id="btn-pass-submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs glow-button-primary transition flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Yangi Parolni Saqlash</span>
                </button>

                <button type="button" id="btn-resend-pass-code" onclick="app.sendPasswordChangeEmailCode()" disabled
                  class="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-gray-200 text-xs font-semibold transition flex items-center justify-center gap-1.5">
                  <span class="material-symbols-outlined text-[14px]">refresh</span>
                  <span>Yangi Kod Yuborish</span>
                </button>
              </form>

              <div class="pt-2 border-t border-white/10 text-center">
                <button type="button" onclick="app.backToPasswordStep1()" class="text-xs text-indigo-400 hover:text-cyan-300 font-semibold transition inline-flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">arrow_back</span>
                  <span>Parollarni o'zgartirish (Orqaga)</span>
                </button>
              </div>
            </div>
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

  async handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Iltimos, faqat rasm fayli (PNG, JPG, WEBP, GIF) tanlang!', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Rasm hajmi 5MB dan oshmasligi kerak!', 'error');
      return;
    }

    showToast('Rasm yuklanmoqda...', 'info');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const dataUrl = event.target.result;
        state.user.avatarUrl = dataUrl;
        updateUserSession(state.user);

        const userId = state.user.id || '95EBB8D9-F98D-4075-8DEB-F9FED3C2D212';
        const res = await api(`/api/auth/profile/${userId}`, {
          method: 'PUT',
          body: JSON.stringify({
            fullName: state.user.fullName,
            avatarUrl: dataUrl
          })
        });

        if (res.success && res.data) {
          updateUserSession(res.data);
        }

        this.renderProfile();
        showToast('🎉 Profil rasmingiz muvaffaqiyatli saqlandi!', 'success');
      } catch (err) {
        console.error(err);
        this.renderProfile();
        showToast('Profil rasmi saqlandi!', 'success');
      }
    };
    reader.readAsDataURL(file);
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

  async handlePasswordChangeStep1(e) {
    e?.preventDefault?.();
    const currentPassword = document.getElementById('pass-current')?.value || '';
    const newPassword = document.getElementById('pass-new')?.value || '';
    const confirmPassword = document.getElementById('pass-confirm')?.value || '';

    if (!currentPassword) {
      showToast('Iltimos, joriy (eski) parolingizni kiriting!', 'error');
      document.getElementById('pass-current')?.focus();
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      showToast('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak!', 'error');
      document.getElementById('pass-new')?.focus();
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Yangi parollar bir-biriga mos kelmadi!', 'error');
      document.getElementById('pass-confirm')?.focus();
      return;
    }

    const btn = document.getElementById('btn-pass-step1');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">sync</span> Kod yuborilmoqda...`;
    }

    await this.sendPasswordChangeEmailCode();

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">send</span> <span>Davom Etish (Tasdiqlash Kodini Olish)</span>`;
    }

    // Switch to step 2
    const step1 = document.getElementById('pass-step-1');
    const step2 = document.getElementById('pass-step-2');
    if (step1) step1.classList.add('hidden');
    if (step2) step2.classList.remove('hidden');
    const codeInp = document.getElementById('pass-verify-code');
    if (codeInp) setTimeout(() => codeInp.focus(), 150);
  },

  backToPasswordStep1() {
    const step1 = document.getElementById('pass-step-1');
    const step2 = document.getElementById('pass-step-2');
    if (step2) step2.classList.add('hidden');
    if (step1) step1.classList.remove('hidden');
  },

  async sendPasswordChangeEmailCode() {
    if (!state.user || !state.user.email) {
      showToast('Foydalanuvchi emaili topilmadi', 'error');
      return;
    }
    const email = state.user.email.trim().toLowerCase();
    const resendBtn = document.getElementById('btn-resend-pass-code');
    const timerBadge = document.getElementById('pass-timer-badge');
    if (resendBtn) resendBtn.disabled = true;

    const res = await api('/api/auth/send-verification-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (res.success) {
      showToast(res.message || `${email} manziliga 6 xonali tasdiqlash kodi yuborildi!`, 'success');
      
      let seconds = 60;
      if (this._passTimer) clearInterval(this._passTimer);
      this._passTimer = setInterval(() => {
        seconds--;
        if (timerBadge) timerBadge.innerText = `${seconds}s`;
        if (seconds <= 0) {
          clearInterval(this._passTimer);
          if (timerBadge) timerBadge.innerText = '0s';
          if (resendBtn) resendBtn.disabled = false;
        }
      }, 1000);
    } else {
      if (resendBtn) resendBtn.disabled = false;
      showToast(res.message || 'Kodni yuborishda xatolik', 'error');
    }
  },

  async handleChangePasswordSubmit(e) {
    e.preventDefault();
    const verificationCode = (document.getElementById('pass-verify-code')?.value || '').trim();
    const currentPassword = document.getElementById('pass-current')?.value || '';
    const newPassword = document.getElementById('pass-new')?.value || '';
    const confirmPassword = document.getElementById('pass-confirm')?.value || '';

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

    const btn = document.getElementById('btn-pass-submit');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">sync</span> Saqlanmoqda...`;
    }

    const userId = state.user.id || '95EBB8D9-F98D-4075-8DEB-F9FED3C2D212';
    const res = await api(`/api/auth/change-password/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, verificationCode })
    });

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">check_circle</span> <span>Yangi Parolni Saqlash</span>`;
    }

    if (res.success) {
      showToast('🎉 Parolingiz muvaffaqiyatli o\'zgartirildi!', 'success');
      this.renderProfile();
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

              <div class="flex items-center gap-2 flex-wrap">
                <a href="#/result/${item.attemptId}" class="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm" title="Test savollari va xatolar tahlilini ko'rish">
                  <span class="material-symbols-outlined text-[15px]">analytics</span> Savollar Tahlili
                </a>
                <a href="#/test-solve/${item.testId || 'tests'}" class="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-semibold transition flex items-center gap-1" title="Qaytadan topshirish">
                  <span class="material-symbols-outlined text-[15px]">replay</span> Qayta topshirish
                </a>
                ${item.certificateNumber ? `
                  <a href="#/certificate/${item.certificateNumber}" class="px-3 py-2 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-bold transition flex items-center gap-1 shadow-sm">
                    <span class="material-symbols-outlined text-[15px]">workspace_premium</span> Sertifikat
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
  // UNIVERSAL ADMIN & TEACHER PAGE HEADERS
  // ----------------------------------------------------
  getAdminHeaderHtml(activeTab, title, subtitle, backUrl = '#/admin') {
    const isDashboardTab = activeTab === 'dashboard';

    return `
      <div class="space-y-4 border-b border-white/10 pb-6 mb-6">
        ${!isDashboardTab ? `
          <!-- Top Back button -->
          <div class="flex items-center justify-start">
            <a href="${backUrl || '#/admin'}" class="px-4 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 font-bold text-xs border border-blue-500/30 inline-flex items-center gap-1.5 transition duration-200 shadow-sm hover:scale-[1.02]" title="Orqaga qaytish">
              <span class="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Orqaga</span>
            </a>
          </div>
        ` : ''}

        <!-- Title & Subtitle -->
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span class="text-[11px] font-bold uppercase tracking-wider text-blue-400">Admin Boshqaruv Markazi</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black font-heading text-white">${title}</h1>
          ${subtitle ? `<p class="text-xs sm:text-sm text-gray-400 mt-1">${subtitle}</p>` : ''}
        </div>
      </div>
    `;
  },

  getTeacherHeaderHtml(activeTab, title, subtitle, backUrl = '#/teacher') {
    const isDashboardTab = activeTab === 'dashboard';

    return `
      <div class="space-y-4 border-b border-white/10 pb-6 mb-6">
        ${!isDashboardTab ? `
          <!-- Top Back button -->
          <div class="flex items-center justify-start">
            <a href="${backUrl || '#/teacher'}" class="px-4 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 font-bold text-xs border border-indigo-500/30 inline-flex items-center gap-1.5 transition duration-200 shadow-sm hover:scale-[1.02]" title="Orqaga qaytish">
              <span class="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Orqaga</span>
            </a>
          </div>
        ` : ''}

        <!-- Title & Subtitle -->
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-400">O'qituvchi Boshqaruv Markazi</span>
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
          <a href="#/results" class="glass-panel p-5 sm:p-6 rounded-2xl glow-card relative overflow-hidden group hover:border-blue-500/60 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400 group-hover:text-blue-300 transition">Topshirilgan Testlar</span>
              <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[18px]">assignment_turned_in</span>
              </div>
            </div>
            <div id="stu-stat-tests" class="text-2xl sm:text-3xl font-black text-white font-heading">...</div>
            <div id="stu-stat-passed" class="text-[11px] text-emerald-400 mt-1 font-medium">...</div>
          </a>

          <!-- Stat 2: Average Score -->
          <a href="#/results" class="glass-panel p-5 sm:p-6 rounded-2xl glow-card relative overflow-hidden group hover:border-indigo-500/60 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400 group-hover:text-indigo-300 transition">O'rtacha Natija</span>
              <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[18px]">percent</span>
              </div>
            </div>
            <div id="stu-stat-avg" class="text-2xl sm:text-3xl font-black text-indigo-300 font-heading">...</div>
            <div class="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div id="stu-stat-bar" class="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000" style="width: 0%"></div>
            </div>
          </a>

          <!-- Stat 3: Certificates Earned -->
          <a href="#/profile" class="glass-panel p-5 sm:p-6 rounded-2xl glow-card relative overflow-hidden group hover:border-indigo-500/60 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400 group-hover:text-indigo-300 transition">Sertifikatlar</span>
              <div class="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[18px]">military_tech</span>
              </div>
            </div>
            <div id="stu-stat-certs" class="text-2xl sm:text-3xl font-black text-indigo-300 font-heading">...</div>
            <div class="text-[11px] text-indigo-400/80 hover:text-indigo-300 mt-1 font-medium block">Sertifikatlarni ko'rish &rarr;</div>
          </a>

          <!-- Stat 4: Global Rank -->
          <a href="#/leaderboard" class="glass-panel p-5 sm:p-6 rounded-2xl glow-card relative overflow-hidden group hover:border-emerald-500/60 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400 group-hover:text-emerald-300 transition">Reyting O'rni</span>
              <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[18px]">leaderboard</span>
              </div>
            </div>
            <div id="stu-stat-rank" class="text-2xl sm:text-3xl font-black text-emerald-300 font-heading">...</div>
            <div id="stu-stat-points" class="text-[11px] text-gray-400 mt-1">Reyting jadvali &rarr;</div>
          </a>
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
                  <a href="https://t.me/TestPlatform_Support" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-bold text-xs transition flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px]">send</span> Telegram (@TestPlatform_Support)
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
                  <span class="material-symbols-outlined text-indigo-400 text-[18px]">stars</span> Tavsiya Etiladigan Testlar
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
                <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-indigo-400">military_tech</span> Reyting</span>
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
                               a.category === 'E\'lon' ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' :
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
                      <span class="px-2 py-0.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold flex items-center gap-1">
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
                    <a href="#/certificate/${encodeURIComponent(att.certificateNumber)}" class="p-1 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition" title="Sertifikat: ${att.certificateNumber}">
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
          <!-- Card 1: Jami Testlar -->
          <a href="#/admin/tests" class="glass-panel p-5 sm:p-6 rounded-3xl glow-card relative overflow-hidden group hover:border-blue-500/60 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block">
            <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400 group-hover:text-blue-300 transition">Jami Testlar</span>
              <div class="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/25 group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[18px]">quiz</span>
              </div>
            </div>
            <div id="admin-stat-tests" class="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">...</div>
          </a>

          <!-- Card 2: Jami Savollar -->
          <a href="#/admin/tests" class="glass-panel p-5 sm:p-6 rounded-3xl glow-card relative overflow-hidden group hover:border-indigo-500/60 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block">
            <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400 group-hover:text-indigo-300 transition">Jami Savollar</span>
              <div class="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/25 group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[18px]">help_center</span>
              </div>
            </div>
            <div id="admin-stat-questions" class="text-2xl sm:text-3xl font-black text-indigo-300 font-heading tracking-tight">...</div>
          </a>

          <!-- Card 3: Topshirishlar -->
          <a href="#/admin/audit-logs" class="glass-panel p-5 sm:p-6 rounded-3xl glow-card relative overflow-hidden group hover:border-emerald-500/60 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block">
            <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400 group-hover:text-emerald-300 transition">Topshirishlar</span>
              <div class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25 group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[18px]">fact_check</span>
              </div>
            </div>
            <div id="admin-stat-attempts" class="text-2xl sm:text-3xl font-black text-emerald-400 font-heading tracking-tight">...</div>
          </a>

          <!-- Card 4: Foydalanuvchilar -->
          <a href="#/admin/users" class="glass-panel p-5 sm:p-6 rounded-3xl glow-card relative overflow-hidden group hover:border-indigo-500/60 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block">
            <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-600/10 rounded-full blur-xl group-hover:bg-indigo-600/20 transition-all"></div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400 group-hover:text-indigo-300 transition">Foydalanuvchilar</span>
              <div class="w-8 h-8 rounded-xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center border border-indigo-500/25 group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[18px]">group</span>
              </div>
            </div>
            <div id="admin-stat-users" class="text-2xl sm:text-3xl font-black text-indigo-400 font-heading tracking-tight">...</div>
          </a>
        </div>

        <!-- 2-Column Grid: Left Announcements / Right Live Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- LEFT COLUMN (2 Cols): News & Announcements Manager -->
          <div class="lg:col-span-2 space-y-6">
            <div class="glass-panel rounded-3xl p-6 space-y-4">
              <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <span class="material-symbols-outlined text-[18px]">campaign</span>
                  </div>
                  <div>
                    <h3 class="text-base font-bold font-heading text-white">Platforma Yangiliklari & E'lonlar Boshqaruvi</h3>
                    <p class="text-[11px] text-gray-400">Talabalar va o'qituvchilar ko'radigan e'lonlarni boshqarish</p>
                  </div>
                </div>
                <button onclick="app.openCreateAnnouncementModal()" class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
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
                  <a href="#/admin/tests" class="text-xs text-blue-400 font-semibold hover:underline">Barcha testlar &rarr;</a>
                </div>
              </div>
              <div id="admin-recent-tests-list" class="space-y-2 text-xs text-gray-400">Yuklanmoqda...</div>
              <div id="admin-dashboard-tests-pagination" class="hidden pt-3 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap"></div>
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
              <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Tezkor Admin Harakatlari</span>
              <a href="#/admin/add-test" class="w-full p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center gap-2 transition">
                <span class="material-symbols-outlined text-[16px]">add_circle</span> Yangi Test Yaratish
              </a>
              <button onclick="app.openCreateSubjectModal()" class="w-full p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-2 transition">
                <span class="material-symbols-outlined text-[16px]">menu_book</span> Yangi Fan Qo'shish
              </button>
              <a href="#/admin/teachers" class="w-full p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center gap-2 transition">
                <span class="material-symbols-outlined text-[16px]">school</span> O'qituvchilar Boshqaruvi
              </a>
              <a href="#/admin/users" class="w-full p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center gap-2 transition">
                <span class="material-symbols-outlined text-[16px]">group</span> Foydalanuvchilar Boshqaruvi
              </a>
              <a href="#/admin/promos" class="w-full p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-2 transition">
                <span class="material-symbols-outlined text-[16px]">confirmation_number</span> Promo-kodlar Boshqaruvi
              </a>
              <a href="#/admin/support" class="w-full p-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-2 transition">
                <span class="material-symbols-outlined text-[16px]">support_agent</span> Talabalar Murojaatlari
              </a>
              <a href="#/admin/audit-logs" class="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-xs flex items-center gap-2 transition">
                <span class="material-symbols-outlined text-[16px]">history</span> Tizim Xavfsizlik Jurnali
              </a>
            </div>

            <!-- ADVERTISEMENT & PRO SUBSCRIPTION BANNER CARD -->
            <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-[#14161f] to-[#14161f] space-y-3.5 relative overflow-hidden shadow-xl">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 text-[10px] font-bold tracking-wider uppercase border border-indigo-500/30 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">campaign</span> Reklama & Homiylik
                </span>
                <span class="text-[10px] text-gray-500 font-medium">Platforma</span>
              </div>
              <div class="space-y-1.5">
                <h4 class="text-sm font-bold text-white font-heading flex items-center gap-1.5">
                  <span>Reklamasiz Qulay Foydalanish</span>
                  <span class="text-indigo-400">👑</span>
                </h4>
                <p class="text-xs text-gray-300 leading-relaxed">
                  Saytdagi barcha reklamalarni o'chirish uchun <strong class="text-indigo-300">PRO obunasi</strong>ni olishingiz shart yoki reklamalar bilan bepul davom etaversangiz bo'ladi.
                </p>
              </div>
              <div class="pt-1 space-y-2">
                <a href="#/pricing" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">workspace_premium</span>
                  <span>PRO Obunasini Olish</span>
                </a>
                <button onclick="showToast('Reklama bilan davom etmoqdasiz. Test topshirishda 10 soniyalik reklamalar chiqadi.', 'info')" class="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold transition text-center block">
                  Reklama bilan davom etish
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    `;

    // 1. Fetch Dashboard Summary
    const res = await api('/api/dashboard/summary');
    let totalTests = 0;
    let totalQuestions = 0;
    let totalAttempts = 0;
    let totalUsers = 0;
    let recentAttempts = [];

    if (res.success && res.data) {
      const d = res.data;
      totalTests = Number(d.totalTests) || 0;
      totalQuestions = Number(d.totalQuestions) || 0;
      totalAttempts = Number(d.totalAttempts) || 0;
      totalUsers = Number(d.totalUsers) || 0;
      recentAttempts = d.recentAttempts || [];
    }

    // 2. Fetch Recent Tests with Pagination (10 per page)
    const testsRes = await api('/api/tests?page=1&pageSize=1000');
    const testsContainer = document.getElementById('admin-recent-tests-list');
    const testsPaginationEl = document.getElementById('admin-dashboard-tests-pagination');
    const allDashboardTests = Array.isArray(testsRes.data) ? testsRes.data : (testsRes.data?.items || []);

    // Sync stats with actual tests array if summary was 0 or mismatch
    if (allDashboardTests.length > 0) {
      if (totalTests === 0) totalTests = allDashboardTests.length;
      if (totalQuestions === 0) {
        totalQuestions = allDashboardTests.reduce((sum, t) => sum + (t.questionsCount || 0), 0);
      }
    } else {
      totalTests = 0;
      totalQuestions = 0;
    }

    const testEl = document.getElementById('admin-stat-tests');
    const qEl = document.getElementById('admin-stat-questions');
    const attEl = document.getElementById('admin-stat-attempts');
    const uEl = document.getElementById('admin-stat-users');

    if (testEl) testEl.innerText = totalTests;
    if (qEl) qEl.innerText = totalQuestions;
    if (attEl) attEl.innerText = totalAttempts;
    if (uEl) uEl.innerText = totalUsers;

    // Render live attempts
    const liveContainer = document.getElementById('admin-live-attempts-list');
    if (liveContainer) {
      if (recentAttempts.length > 0) {
        liveContainer.innerHTML = recentAttempts.map(a => {
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

    // 3. Fetch Announcements for Admin
    this.loadAdminAnnouncements();

    if (testsRes.success && allDashboardTests.length > 0) {
      const PAGE_SIZE = 10;
      const totalPages = Math.ceil(allDashboardTests.length / PAGE_SIZE);
      let currentPage = 1;

      const renderDashboardTestsPage = (pg) => {
        currentPage = Math.max(1, Math.min(pg, totalPages));
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageTests = allDashboardTests.slice(start, start + PAGE_SIZE);

        testsContainer.innerHTML = pageTests.map(t => `
          <div class="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white text-sm truncate">${t.title}</span>
                <span class="text-gray-500 text-xs shrink-0">(${t.questionsCount || 0} ta savol • ${t.timeLimitMinutes} daq)</span>
              </div>
              <div class="text-[11px] text-gray-400 mt-0.5 truncate">${t.subjectName || ''}</div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0 flex-wrap">
              <button onclick="app.togglePublishTest('${t.id}', ${!t.isPublished}, true)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1.5 ${t.isPublished ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-400' : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-emerald-500/20 hover:text-emerald-400'}">
                <span class="material-symbols-outlined text-[13px]">${t.isPublished ? 'visibility' : 'visibility_off'}</span>
                <span>${t.isPublished ? 'Nashr qilingan' : 'Qoralama'}</span>
              </button>
              <a href="#/admin/add-question/${t.id}" class="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 font-semibold hover:bg-blue-600/30 border border-blue-500/20 text-[11px] flex items-center gap-1 transition">
                <span class="material-symbols-outlined text-[13px]">help</span> + Savol
              </a>
              <a href="#/admin/edit-test/${t.id}" class="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 transition flex items-center justify-center" title="Testni tahrirlash">
                <span class="material-symbols-outlined text-[15px]">edit</span>
              </a>
              <button onclick="app.deleteTest('${t.id}', true)" class="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition flex items-center justify-center" title="Testni o'chirish">
                <span class="material-symbols-outlined text-[15px]">delete</span>
              </button>
            </div>
          </div>
        `).join('');

        if (totalPages > 1 && testsPaginationEl) {
          testsPaginationEl.classList.remove('hidden');

          const startNum = start + 1;
          const endNum = Math.min(start + PAGE_SIZE, allDashboardTests.length);
          let pageButtons = '';
          for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage;
            pageButtons += `
              <button onclick="app._dashboardTestsGoPage(${i})"
                class="w-7 h-7 rounded-lg text-xs font-bold transition ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }">
                ${i}
              </button>`;
          }

          testsPaginationEl.innerHTML = `
            <div class="text-xs text-gray-400">
              <span class="text-white font-semibold">${startNum}–${endNum}</span> / ${allDashboardTests.length} ta test &nbsp;·&nbsp;
              <span class="text-blue-400 font-semibold">${currentPage}-qism</span>
            </div>
            <div class="flex items-center gap-1">
              <button onclick="app._dashboardTestsGoPage(${currentPage - 1})"
                ${currentPage === 1 ? 'disabled' : ''}
                class="w-7 h-7 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
                <span class="material-symbols-outlined text-[14px]">chevron_left</span>
              </button>
              ${pageButtons}
              <button onclick="app._dashboardTestsGoPage(${currentPage + 1})"
                ${currentPage === totalPages ? 'disabled' : ''}
                class="w-7 h-7 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
                <span class="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          `;
        }
      };

      this._dashboardTestsGoPage = (pg) => renderDashboardTestsPage(pg);
      renderDashboardTestsPage(currentPage);
    } else {
      testsContainer.innerHTML = `
        <div class="p-8 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/20">
            <span class="material-symbols-outlined text-2xl">quiz</span>
          </div>
          <div class="text-sm font-bold text-white">Hozircha testlar yaratilmagan</div>
          <p class="text-xs text-gray-400 max-w-sm mx-auto">Excel faylingizni yuklab testlarni avtomatik ochishingiz yoki yangi test yaratishingiz mumkin.</p>
          <div class="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
            <a href="#/admin/add-test" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs glow-button-primary transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
              <span class="material-symbols-outlined text-base">table_chart</span> Excel orqali Yuklash / Test Yaratish
            </a>
          </div>
        </div>
      `;
      if (testsPaginationEl) testsPaginationEl.classList.add('hidden');
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
                <span class="px-2 py-0.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
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
              <div class="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
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
              <input type="text" id="ann-title" required placeholder="Masalan: 🎉 Yangi Matematika olimpiadasi boshlandi!" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-indigo-500 transition" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">Kategoriya</label>
                <select id="ann-category" class="w-full px-4 py-3 rounded-xl bg-[#14161f] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition">
                  <option value="Yangilik">🎉 Yangilik</option>
                  <option value="E'lon">📢 E'lon</option>
                  <option value="Yangilanish">🚀 Yangilanish</option>
                  <option value="Olimpiada">🏆 Olimpiada</option>
                  <option value="Tanlov">🎯 Tanlov</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">Ikonka (Material Icon)</label>
                <input type="text" id="ann-icon" value="campaign" placeholder="campaign, stars, celebration..." class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">E'lon matni / Tafsilotlar *</label>
              <textarea id="ann-content" rows="5" required placeholder="Talabalar uchun to'liq ma'lumot va yo'riqnomalarni yozing..." class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-indigo-500 transition leading-relaxed"></textarea>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <input type="checkbox" id="ann-pinned" class="w-4 h-4 rounded text-indigo-400 focus:ring-0 focus:outline-none bg-black/40 border-white/20" />
              <label for="ann-pinned" class="text-xs text-gray-300 font-medium cursor-pointer">
                <strong>📌 Asosiy qilib belgilash</strong> (Lenta yuqorisida ko'rinadi)
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button type="button" onclick="document.getElementById('modal-container').innerHTML = ''" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition">
                Bekor qilish
              </button>
              <button type="submit" id="btn-create-ann" class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-500/20">
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

  deleteAnnouncement(id) {
    this.confirmModal({
      title: "E'lonni O'chirish",
      message: "Ushbu e'lonni o'chirishni tasdiqlaysizmi?",
      confirmText: "O'chirish",
      type: "danger",
      icon: "delete",
      onConfirm: async () => {
        const res = await api(`/api/announcements/${id}`, {
          method: 'DELETE'
        });

        if (res && res.success) {
          showToast('E\'lon muvaffaqiyatli o\'chirildi', 'success');
          app.loadAdminAnnouncements();
        } else {
          showToast(res?.message || 'Xatolik yuz berdi', 'error');
        }
      }
    });
  },

  // ----------------------------------------------------
  // ADMIN: TESTS LIST & PUBLISH TOGGLE & DELETE & EDIT
  // ----------------------------------------------------
  async renderAdminTests(page = 1) {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn">
        ${this.getAdminHeaderHtml('tests', 'Testlar Boshqaruvi', 'Testlarni yaratish, tahrirlash, chop etish va savollarini boshqarish', '#/admin')}

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-gray-400">Platformadagi barcha testlar ro'yxati</div>
          <div class="flex flex-wrap items-center gap-2">
            <a href="#/admin/add-test" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold glow-button-primary transition flex items-center gap-1.5 shadow-md shadow-emerald-600/25">
              <span class="material-symbols-outlined text-[18px]">table_chart</span>
              <span>Excel orqali Test Yaratish</span>
            </a>
            <a href="#/admin/add-test" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold glow-button-primary transition flex items-center gap-1.5 shadow-md shadow-blue-600/25">
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Yangi Test Qo'shish</span>
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
          <!-- Pagination -->
          <div id="admin-tests-pagination" class="hidden px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap"></div>
        </div>
      </div>
    `;

    const res = await api('/api/tests?page=1&pageSize=1000');
    const tbody = document.getElementById('admin-tests-table-body');
    const paginationEl = document.getElementById('admin-tests-pagination');
    const allTests = Array.isArray(res.data) ? res.data : (res.data?.items || []);

    if (res.success && allTests.length > 0) {
      const PAGE_SIZE = 10;
      const totalPages = Math.ceil(allTests.length / PAGE_SIZE);
      // Clamp page
      let currentPage = Math.max(1, Math.min(page, totalPages));
      // Store globally so pagination buttons can call back
      state._adminTestsAllTests = allTests;
      state._adminTestsPageSize = PAGE_SIZE;

      const renderPage = (pg) => {
        currentPage = Math.max(1, Math.min(pg, totalPages));
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageTests = allTests.slice(start, start + PAGE_SIZE);

        tbody.innerHTML = pageTests.map(test => `
          <tr class="hover:bg-white/5 transition">
            <td class="px-6 py-4">
              <div class="font-bold text-white text-sm flex items-center gap-2">
                <span>${test.title}</span>
                ${test.isPublished ? '<span class="w-2 h-2 rounded-full bg-emerald-400"></span>' : '<span class="w-2 h-2 rounded-full bg-indigo-600"></span>'}
              </div>
              <div class="text-gray-500 text-[11px] line-clamp-1">${test.description || ''}</div>
            </td>
            <td class="px-6 py-4 text-blue-400 font-medium">${test.subjectName || 'Dasturlash'}</td>
            <td class="px-6 py-4 text-center font-bold text-white">${test.questionsCount || 0} ta</td>
            <td class="px-6 py-4 text-center">${test.timeLimitMinutes || 10} daq</td>
            <td class="px-6 py-4 text-center">
              <button onclick="app.togglePublishTest('${test.id}', ${!test.isPublished})" class="px-3 py-1.5 rounded-full text-[11px] font-bold border transition flex items-center gap-1.5 mx-auto ${test.isPublished ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30' : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'}" title="Bosib holatni o'zgartiring">
                <span class="material-symbols-outlined text-[14px]">${test.isPublished ? 'visibility' : 'visibility_off'}</span>
                ${test.isPublished ? '🟢 Chop etilgan' : '⚪ Qoralama'}
              </button>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <a href="#/admin/edit-test/${test.id}" class="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition" title="Testni tahrirlash">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                </a>
                <a href="#/admin/add-question/${test.id}" class="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition" title="Savollar qo'shish / ko'rish">
                  <span class="material-symbols-outlined text-[16px]">help</span>
                </a>
                <a href="#/test-solve/${test.id}" class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition" title="Testni sinab ko'rish">
                  <span class="material-symbols-outlined text-[16px]">play_arrow</span>
                </a>
                <button onclick="app.deleteTest('${test.id}')" class="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition" title="O'chirish">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </td>
          </tr>
        `).join('');

        // Build pagination bar
        if (totalPages > 1) {
          paginationEl.classList.remove('hidden');

          // Left: info
          const startNum = start + 1;
          const endNum = Math.min(start + PAGE_SIZE, allTests.length);
          let pageButtons = '';
          for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage;
            pageButtons += `
              <button onclick="app._adminTestsGoPage(${i})"
                class="w-8 h-8 rounded-lg text-xs font-bold transition ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }">
                ${i}
              </button>`;
          }

          paginationEl.innerHTML = `
            <div class="text-xs text-gray-400">
              <span class="text-white font-semibold">${startNum}–${endNum}</span> / ${allTests.length} ta test &nbsp;·&nbsp;
              <span class="text-blue-400 font-semibold">${currentPage}-qism</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="app._adminTestsGoPage(${currentPage - 1})"
                ${currentPage === 1 ? 'disabled' : ''}
                class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              ${pageButtons}
              <button onclick="app._adminTestsGoPage(${currentPage + 1})"
                ${currentPage === totalPages ? 'disabled' : ''}
                class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          `;
        }

        // Expose current page for go-page handler
        state._adminTestsCurrentPage = currentPage;
        state._adminTestsTotalPages = totalPages;
      };

      // Expose go-page handler
      this._adminTestsGoPage = (pg) => renderPage(pg);

      renderPage(currentPage);

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

  deleteTest(testId, isDashboard = false) {
    this.confirmModal({
      title: "Testni O'chirish",
      message: "Haqiqatdan ham ushbu testni o'chirmoqchimisiz? Testga tegishli barcha savollar va natijalar ham o'chiriladi.",
      confirmText: "Ha, O'chirish",
      type: "danger",
      icon: "delete_forever",
      onConfirm: async () => {
        const res = await api(`/api/tests/${testId}`, { method: 'DELETE' });
        if (res && res.success) {
          showToast('Test muvaffaqiyatli o\'chirildi!', 'success');
          if (isDashboard || window.location.hash === '#/admin' || window.location.hash === '') {
            app.renderAdminDashboard();
          } else {
            app.renderAdminTests();
          }
        } else {
          showToast(res?.message || 'O\'chirishda xatolik yuz berdi', 'error');
        }
      }
    });
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
      <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-16">
        ${this.getAdminHeaderHtml('add-test', 'Yangi Test Yaratish', 'Excel orqali bir zumda test va savollarni yarating yoki quyidagi forma orqali qo\'lda to\'ldiring', '#/admin/tests')}

        <!-- ========================================== -->
        <!-- METHOD 1: EXCEL ORQALI 1-KLIKDA TEST YARATISH -->
        <!-- ========================================== -->
        <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/40 bg-emerald-950/15 shadow-2xl space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-emerald-500/20">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <span class="material-symbols-outlined text-xl">table_chart</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  1-Usul: Excel orqali Test Yaratish
                  <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">Tezkor Usul</span>
                </h3>
                <p class="text-[11px] text-gray-300">Shablonni to'ldirib yuklang, tizim avtomatik yangi test ochib savollarni joylaydi.</p>
              </div>
            </div>

            <!-- Download Template Button -->
            <button onclick="app.downloadExcelTemplate()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs glow-button-primary transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 shrink-0">
              <span class="material-symbols-outlined text-[16px]">download</span>
              <span>Excel Shablonini Olish</span>
            </button>
          </div>

          <!-- Excel File Dropzone -->
          <div id="add-test-excel-dropzone" onclick="document.getElementById('add-test-excel-picker').click()" class="p-6 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/30 transition-all text-center cursor-pointer group">
            <input type="file" id="add-test-excel-picker" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" class="hidden" onchange="app.handleAddTestExcelSelect(event)" />
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-2xl">upload_file</span>
            </div>
            <div class="text-xs font-bold text-white mb-0.5">
              📊 To'ldirilgan Excel (.xlsx) faylni tanlang yoki shu yerga tashlang
            </div>
            <p class="text-[11px] text-gray-400">Fan, test nomi va barcha savollar avtomatik o'qiladi</p>
          </div>

          <!-- Excel Parsing Status & Auto Test Creator Form -->
          <div id="add-test-excel-status" class="hidden space-y-4 pt-2">
            <div class="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
              <div class="flex items-center gap-2 text-xs text-emerald-300 font-bold" id="add-test-excel-status-msg">
                <span class="material-symbols-outlined text-base text-emerald-400">check_circle</span>
                <span>Savollar muvaffaqiyatli aniqlandi!</span>
              </div>
              <span id="add-test-excel-count" class="px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 text-[11px] font-bold font-mono">0 ta savol</span>
            </div>

            <!-- Multi-Subject Bundle Preview (shown when multiple subjects exist) -->
            <div id="excel-bundle-preview-container" class="hidden"></div>

            <!-- Single Test Auto-populated Fields (shown when only 1 subject/test exists) -->
            <div id="excel-single-fields-container" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-gray-300 mb-1">Fan / Yo'nalish:</label>
                <input type="text" id="excel-test-subject" value="Matematika" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-xs focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-gray-300 mb-1">Test Sarlavhasi:</label>
                <input type="text" id="excel-test-title" value="Matematika Testi" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-xs focus:outline-none focus:border-emerald-400" />
              </div>
            </div>

            <!-- Submit Button for Excel -->
            <button id="excel-create-test-btn" onclick="app.handleCreateTestFromExcel()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-xs glow-button-primary transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30">
              <span class="material-symbols-outlined text-lg">auto_awesome</span>
              <span id="excel-create-test-btn-text">🚀 Ushbu Excel orqali Test Yaratish</span>
            </button>
          </div>
        </div>

        <!-- DIVIDER -->
        <div class="flex items-center gap-4 py-1">
          <div class="flex-1 h-px bg-white/10"></div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-gray-500">Yoki 2-Usul: Qo'lda forma to'ldirish</span>
          <div class="flex-1 h-px bg-white/10"></div>
        </div>

        <!-- ========================================== -->
        <!-- METHOD 2: MANUAL TEST CREATION FORM -->
        <!-- ========================================== -->
        <form onsubmit="app.handleCreateTestSubmit(event)" class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-blue-400 text-lg">edit_note</span>
            <h4 class="text-xs font-bold uppercase tracking-wider text-white">Standart Test Parametrlari:</h4>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Fan / Yo'nalish <span class="text-rose-400">*</span></label>
            <select id="new-test-subject" required class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400 transition">
              <option value="">Fanni tanlang...</option>
              ${subjects.map(s => `<option value="${s.id}" class="bg-[#14161f]">${this.escapeHtml(s.name)}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Test Sarlavhasi <span class="text-rose-400">*</span></label>
            <input type="text" id="new-test-title" required placeholder="Masalan: 1-Chorak Yakuniy Testi" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400 transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Tavsif</label>
            <textarea id="new-test-desc" rows="2" placeholder="Test haqida qisqacha ma'lumot..." class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400 transition"></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-gray-300 mb-1">Vaqt (daqiqa)</label>
              <input type="number" id="new-test-timelimit" value="15" min="1" max="180" class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-gray-300 mb-1">O'tish Bali (%)</label>
              <input type="number" id="new-test-passing" value="60" min="1" max="100" class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-gray-300 mb-1">Maks. Urinishlar</label>
              <input type="number" id="new-test-attempts" value="5" min="1" max="50" class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-gray-300 mb-1">Qiyinlik Darajasi</label>
              <select id="new-test-difficulty" class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400">
                <option value="1" class="bg-[#14161f]">Oson (Easy)</option>
                <option value="2" class="bg-[#14161f]" selected>O'rta (Medium)</option>
                <option value="3" class="bg-[#14161f]">Qiyin (Hard)</option>
              </select>
            </div>
          </div>

          <!-- Options -->
          <div class="flex flex-wrap gap-4 pt-2">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
              <input type="checkbox" id="new-test-publish" checked class="w-4 h-4 rounded text-blue-600 focus:ring-0" />
              <span>Darhol chop etish (Talabalar ko'rishi mumkin)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
              <input type="checkbox" id="new-test-is-premium" class="w-4 h-4 rounded text-purple-600 focus:ring-0" />
              <span class="flex items-center gap-1"><span class="text-purple-400">👑</span> Faqat PRO / VIP a'zolar uchun</span>
            </label>
          </div>

          <button type="submit" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs glow-button-primary transition flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20">
            <span class="material-symbols-outlined text-lg">add_circle</span>
            <span>Testni Yaratish va Savollar Qo'shish</span>
          </button>
        </form>
      </div>
    `;
  },

  setupAddTestExcelDropzone() {
    const dropzone = document.getElementById('add-test-excel-dropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('border-emerald-400', 'bg-emerald-950/40');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('border-emerald-400', 'bg-emerald-950/40');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        app.readExcelForAddTest(files[0]);
      }
    }, false);
  },

  handleAddTestExcelSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      this.readExcelForAddTest(file);
    }
  },

  readExcelForAddTest(file) {
    if (typeof XLSX === 'undefined') {
      showToast('Excel kutubxonasi yuklanmoqda...', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rows || rows.length === 0) {
          showToast('Excel fayl ichida ma\'lumot topilmadi!', 'error');
          return;
        }

        const normalized = app.normalizeExcelRows(rows);
        if (!normalized || normalized.length === 0) {
          showToast('Excel fayldan savollar aniqlanmadi. Ustunlar nomini tekshiring!', 'error');
          return;
        }

        app.currentExcelAddQuestions = normalized;

        const statusContainer = document.getElementById('add-test-excel-status');
        const statusMsg = document.getElementById('add-test-excel-status-msg');
        const countBadge = document.getElementById('add-test-excel-count');
        const singleFieldsContainer = document.getElementById('excel-single-fields-container');
        const bundlePreviewContainer = document.getElementById('excel-bundle-preview-container');
        const subInput = document.getElementById('excel-test-subject');
        const titleInput = document.getElementById('excel-test-title');
        const btnText = document.getElementById('excel-create-test-btn-text');

        if (statusContainer) statusContainer.classList.remove('hidden');

        if (normalized.isMultiSubjectBundle && normalized.subjectsBundle?.length > 1) {
          const bundleCount = normalized.subjectsBundle.length;
          if (statusMsg) statusMsg.innerHTML = `<span class="material-symbols-outlined text-base text-emerald-400">check_circle</span> <span>'${file.name}' faylidan <b>${bundleCount} ta turli Fan/Test</b> va jami <b>${normalized.length} ta savol</b> o'qildi!</span>`;
          if (countBadge) countBadge.innerText = `${bundleCount} ta Fan · ${normalized.length} ta savol`;

          if (singleFieldsContainer) singleFieldsContainer.classList.add('hidden');
          if (bundlePreviewContainer) {
            bundlePreviewContainer.classList.remove('hidden');
            bundlePreviewContainer.innerHTML = `
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs text-gray-300 font-semibold">
                  <span>Aniqlangan Fanlar va Testlar to'plami (${bundleCount} ta):</span>
                  <span class="text-emerald-400 text-[11px]">Har bir fan uchun alohida test yaratiladi</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar p-3 rounded-2xl bg-white/5 border border-white/10">
                  ${normalized.subjectsBundle.map((b, i) => `
                    <div class="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition">
                      <div class="min-w-0 pr-2">
                        <div class="text-xs font-bold text-white truncate">${this.escapeHtml(b.title)}</div>
                        <div class="text-[10px] text-emerald-400 font-semibold truncate">📚 ${this.escapeHtml(b.subject)}</div>
                      </div>
                      <span class="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold shrink-0 font-mono">${b.questions.length} ta savol</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }
          if (btnText) btnText.innerText = `🚀 Barcha ${bundleCount} ta Testni (jami ${normalized.length} ta savoli bilan) Yaratish`;
        } else {
          if (singleFieldsContainer) singleFieldsContainer.classList.remove('hidden');
          if (bundlePreviewContainer) bundlePreviewContainer.classList.add('hidden');
          if (statusMsg) statusMsg.innerHTML = `<span class="material-symbols-outlined text-base text-emerald-400">check_circle</span> <span>'${file.name}' faylidan <b>${normalized.length} ta savol</b> o'qildi!</span>`;
          if (countBadge) countBadge.innerText = `${normalized.length} ta savol`;
          if (subInput && normalized.detectedSubject) subInput.value = normalized.detectedSubject;
          if (titleInput && normalized.detectedTitle) titleInput.value = normalized.detectedTitle;
          if (btnText) btnText.innerText = `🚀 "${titleInput?.value || 'Test'}" Testini (${normalized.length} ta savoli bilan) Yaratish`;
        }

        showToast(`'${file.name}' dan ${normalized.length} ta savol muvaffaqiyatli o'qildi!`, 'success');
      } catch (err) {
        console.error(err);
        showToast(`Excel faylni o'qishda xatolik: ${err.message}`, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  },

  async handleCreateTestFromExcel() {
    const questions = this.currentExcelAddQuestions;
    if (!questions || questions.length === 0) {
      showToast('Iltimos, avval to\'ldirilgan Excel faylni yuklang!', 'error');
      return;
    }

    const btn = document.getElementById('excel-create-test-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-base">sync</span> Testlar yaratilmoqda...';
    }

    try {
      let bundles = [];
      if (questions.subjectsBundle && questions.subjectsBundle.length > 0) {
        bundles = questions.subjectsBundle;
      } else {
        const subVal = (document.getElementById('excel-test-subject')?.value || questions.detectedSubject || 'Umumiy Fan').trim();
        const titleVal = (document.getElementById('excel-test-title')?.value || questions.detectedTitle || `${subVal} Testi`).trim();
        bundles = [{
          subject: subVal,
          title: titleVal,
          questions: questions
        }];
      }

      let allSubjectsRes = await api('/api/subjects');
      let existingSubjects = Array.isArray(allSubjectsRes.data) ? allSubjectsRes.data : (allSubjectsRes.data?.items || []);

      let createdTestsCount = 0;
      let totalQuestionsAdded = 0;

      for (let idx = 0; idx < bundles.length; idx++) {
        const bundle = bundles[idx];
        const sName = (bundle.subject || 'Umumiy Fan').trim();
        const tTitle = (bundle.title || `${sName} Testi`).trim();
        const bQuestions = Array.isArray(bundle.questions) ? bundle.questions : [];

        if (bQuestions.length === 0) continue;

        if (btn) {
          btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-base">sync</span> ${idx + 1}/${bundles.length}: "${tTitle}" yaratilmoqda...`;
        }

        // 1. Find or create Subject
        let targetSubject = existingSubjects.find(s => s && s.name && s.name.trim().toLowerCase() === sName.toLowerCase());
        if (!targetSubject) {
          const createSub = await api('/api/subjects', {
            method: 'POST',
            body: JSON.stringify({ name: sName, description: `${sName} fani bo'yicha testlar` })
          });
          if (createSub.success && createSub.data) {
            targetSubject = createSub.data?.id ? createSub.data : createSub.data;
            existingSubjects.push(targetSubject);
          }
        }

        if (!targetSubject || !targetSubject.id) {
          console.error("Subject topilmadi yoki yaratilmadi:", sName);
          continue;
        }

        // 2. Create Test
        const createTestRes = await api('/api/tests', {
          method: 'POST',
          body: JSON.stringify({
            subjectId: targetSubject.id,
            title: tTitle,
            description: `${sName} fani bo'yicha Excel orqali yaratilgan test (${bQuestions.length} ta savol)`,
            passingPercentage: 60,
            timeLimitMinutes: Math.max(10, Math.min(180, Math.ceil(bQuestions.length * 1.5))),
            maxAttemptsPerStudent: 5,
            difficulty: 2,
            isPublished: true,
            isPremiumOnly: false,
            showReviewAfterSubmit: true,
            showCorrectAnswers: true
          })
        });

        if (createTestRes.success && createTestRes.data) {
          const testId = createTestRes.data.id || createTestRes.data;
          createdTestsCount++;

          // 3. Add questions to this specific test
          for (const q of bQuestions) {
            const qRes = await api(`/api/tests/${testId}/questions`, {
              method: 'POST',
              body: JSON.stringify({
                text: q.text,
                points: q.points || 2,
                difficulty: q.difficulty || 'medium',
                options: q.options && q.options.length >= 2 ? q.options : [
                  { text: "A variant", isCorrect: true },
                  { text: "B variant", isCorrect: false }
                ]
              })
            });
            if (qRes.success) totalQuestionsAdded++;
          }

          // 4. Publish Test
          await api(`/api/tests/${testId}/publish`, { method: 'PATCH' });
        } else {
          console.error("Test yaratishda xatolik:", createTestRes);
        }
      }

      if (createdTestsCount > 0) {
        showToast(`Muvaffaqiyatli! ${createdTestsCount} ta fan/test va jami ${totalQuestionsAdded} ta savol yaratildi! 🎉`, 'success');
      } else {
        showToast(`Test yaratilmadi. Iltimos, ma'lumotlarni tekshiring!`, 'error');
      }
      
      const role = state.user?.role;
      if (role === 'Teacher') {
        window.location.hash = '#/teacher/tests';
      } else {
        window.location.hash = '#/admin/tests';
      }
    } catch (err) {
      console.error(err);
      showToast('Xatolik yuz berdi: ' + err.message, 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '🚀 Ushbu Excel orqali Test Yaratish';
      }
    }
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
            <label class="flex items-center gap-2 cursor-pointer text-xs text-indigo-300 font-bold bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/30">
              <input type="checkbox" id="edit-test-is-premium" ${test.isPremiumOnly ? 'checked' : ''} class="w-4 h-4 rounded text-indigo-400 bg-black/40 border-indigo-500/40 focus:ring-indigo-500" />
              <span>👑 🔒 Faqat PRO / VIP a'zolar uchun test (Eksklyuziv obuna talab qilinadi)</span>
            </label>
          </div>

          <div class="pt-4 flex items-center gap-3">
            <button type="submit" class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs glow-button-primary transition">
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
                  <button onclick="app.openEditQuestionModal('${testId}', '${q.id}')" class="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 transition" title="Savol va javoblarni tahrirlash">
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onclick="app.deleteQuestion('${testId}', '${q.id}')" class="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition" title="Savolni o'chirish">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            `).join('') : '<p class="text-center py-6 text-gray-500 text-xs">Ushbu testda hali savollar yo\'q. "+ Yangi Savol" tugmasini bosing.</p>'}
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
            <a href="#/admin/edit-test/${testId}" class="px-3 py-1.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold hover:bg-indigo-600/20 flex items-center gap-1">
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
                  <button onclick="app.openEditQuestionModal('${testId}', '${q.id}')" class="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 transition" title="Savol va javoblarni tahrirlash">
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

  deleteQuestion(testId, questionId) {
    this.confirmModal({
      title: "Savolni O'chirish",
      message: "Ushbu savolni o'chirib tashlashni tasdiqlaysizmi?",
      confirmText: "O'chirish",
      type: "danger",
      icon: "delete",
      onConfirm: async () => {
        const res = await api(`/api/tests/${testId}/questions/${questionId}`, { method: 'DELETE' });
        if (res && res.success) {
          showToast('Savol muvaffaqiyatli o\'chirildi', 'success');
          if (window.location.hash.startsWith('#/admin/add-question')) {
            app.renderAdminAddQuestion(testId);
          } else if (window.location.hash.startsWith('#/admin/edit-test')) {
            app.renderAdminEditTest(testId);
          }
        } else {
          showToast(res?.message || 'Savolni o\'chirishda xatolik', 'error');
        }
      }
    });
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
        ${this.getAdminHeaderHtml('bulk-import', 'Excel orqali Savollar va Test Yuklash', 'Excel (.xlsx, .xls, .csv) yoki JSON faylni yuklang, tizim avtomatik savollarni o\'qib yangi test ochadi yoki mavjud testga qo\'shadi', selectedTestId ? `#/admin/add-question/${selectedTestId}` : `#/admin/tests`)}

        <!-- Quick Excel Template Download Banner -->
        <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/15 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3.5 text-left">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <span class="material-symbols-outlined text-2xl">table_chart</span>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                Excel Shablon Fayli (.xlsx)
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Tavsiya etiladi</span>
              </h4>
              <p class="text-xs text-gray-300 mt-0.5">Savollaringizni to'g'ri formatda kiritish uchun namunaviy Excel faylni yuklab oling va to'ldiring.</p>
            </div>
          </div>
          <button onclick="app.downloadExcelTemplate()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs glow-button-primary transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 shrink-0">
            <span class="material-symbols-outlined text-lg">download</span>
            <span>Excel Shablonini Yuklab Olish</span>
          </button>
        </div>

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
                <p class="text-[11px] text-gray-400">Exceldagi fan nomi bo'yicha yangi test ochib, savollarni darhol joylaydi.</p>
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
                <input type="text" id="bulk-new-title" value="Matematika Asoslari Testi" placeholder="Masalan: Matematika 1-kurs nazorati" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs focus:outline-none focus:border-purple-400" />
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
        <div id="excel-dropzone" onclick="document.getElementById('bulk-file-picker').click()" class="glass-panel p-8 rounded-3xl border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/10 hover:bg-emerald-950/20 transition-all text-center cursor-pointer group shadow-lg">
          <input type="file" id="bulk-file-picker" accept=".xlsx,.xls,.csv,.json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/json" class="hidden" onchange="app.handleBulkFileSelect(event)" />
          <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-emerald-500/30">
            <span class="material-symbols-outlined text-3xl">upload_file</span>
          </div>
          <div class="text-base font-bold text-white mb-1">
            📊 Excel (.xlsx, .xls, .csv) yoki JSON faylni tanlang
          </div>
          <p class="text-xs text-gray-400">Faylni kompyuteringizdan tanlang yoki to'g'ridan-to'g'ri shu yerga tashlang</p>
          <div class="mt-3 flex items-center justify-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">.xlsx (Excel)</span>
            <span class="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 text-[11px] font-bold">.xls</span>
            <span class="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-[11px] font-bold">.csv</span>
            <span class="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-[11px] font-bold">.json</span>
          </div>
        </div>

        <!-- Live Validation Status Indicator Bar -->
        <div id="bulk-json-status-indicator" class="p-4 rounded-2xl bg-gray-500/10 border border-gray-500/20 text-xs text-gray-300 flex items-center justify-between transition shadow-md">
          <div class="flex items-center gap-2" id="bulk-status-message">
            <span class="material-symbols-outlined text-base text-emerald-400">info</span>
            <span class="font-medium">Excel yoki JSON fayl yuklangach savollar ro'yxati bu yerda ko'rinadi</span>
          </div>
          <span id="bulk-status-count-badge" class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-bold font-mono">0 ta savol</span>
        </div>

        <!-- Action Submit Button -->
        <button id="bulk-submit-btn" onclick="app.handleBulkImport()" class="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-sm glow-button-primary transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30">
          <span class="material-symbols-outlined text-xl">cloud_upload</span>
          <span id="bulk-submit-btn-text">🚀 Savollarni Testga Yuklash</span>
        </button>

        <!-- Live Visual Preview Container -->
        <div id="bulk-preview-section" class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-400 text-xl">visibility</span>
              Aniqlangan Savollar Ko'rinishi (Jonli Preview)
            </h3>
            <span id="bulk-preview-counter" class="text-xs text-emerald-400 font-bold font-mono">0 ta savol</span>
          </div>

          <div id="bulk-preview-list" class="space-y-3">
            <p class="text-center py-8 text-gray-500 text-xs">Excel yoki JSON fayl yuklangach savollar shu yerda jonli ko'rsatiladi.</p>
          </div>
        </div>
      </div>
    `;

    this.currentBulkQuestions = [];
    this.setupBulkDropzone();
    // Default sample load if needed
    this.loadSampleExcelMemory();
  },

  loadSampleExcelMemory() {
    const sampleRows = [
      { Fan: "Matematika", Test: "Matematika Asoslari Testi", Savol: "25 + 37 nechaga teng?", A: "52", B: "62", C: "72", D: "57", TogriJavob: "B", Ball: 2, Qiyinlik: "Oson", Tushuntirish: "25 ga 37 qo'shilsa 62 bo'ladi." },
      { Fan: "Matematika", Test: "Matematika Asoslari Testi", Savol: "8 × 7 nechaga teng?", A: "54", B: "56", C: "64", D: "48", TogriJavob: "B", Ball: 2, Qiyinlik: "Oson", Tushuntirish: "8 ko'paytirilgan 7 teng 56." },
      { Fan: "Matematika", Test: "Matematika Asoslari Testi", Savol: "100 dan 36 ni ayirsak nechchi qoladi?", A: "54", B: "64", C: "74", D: "66", TogriJavob: "B", Ball: 2, Qiyinlik: "Oson", Tushuntirish: "100 - 36 = 64." },
      { Fan: "Matematika", Test: "Matematika Asoslari Testi", Savol: "81 ning kvadrat ildizi nechaga teng?", A: "7", B: "8", C: "9", D: "10", TogriJavob: "C", Ball: 2, Qiyinlik: "Oson", Tushuntirish: "9 * 9 = 81." },
      { Fan: "Matematika", Test: "Matematika Asoslari Testi", Savol: "3x + 7 = 22 tenglamada x nechaga teng?", A: "3", B: "4", C: "5", D: "6", TogriJavob: "C", Ball: 3, Qiyinlik: "O'rta", Tushuntirish: "3x = 15, x = 5." }
    ];
    this.processParsedQuestions(this.normalizeExcelRows(sampleRows), 'Matematika namunasi (5 ta savol)');
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
    if (this.currentBulkQuestions) {
      this.updateBulkUIFromQuestions(this.currentBulkQuestions);
    }
  },

  setupBulkDropzone() {
    const dropzone = document.getElementById('excel-dropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('border-emerald-400', 'bg-emerald-950/30');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('border-emerald-400', 'bg-emerald-950/30');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        app.readBulkFile(files[0]);
      }
    }, false);
  },

  handleBulkFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      this.readBulkFile(file);
    }
  },

  readBulkFile(file) {
    const fileName = file.name.toLowerCase();
    
    // Check if Excel or CSV
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      if (typeof XLSX === 'undefined') {
        showToast('Excel o\'quvchi kutubxona yuklanmoqda, iltimos 2 soniya kuting...', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (!rows || rows.length === 0) {
            showToast('Excel fayl ichida ma\'lumot topilmadi!', 'error');
            return;
          }

          const normalized = app.normalizeExcelRows(rows);
          app.processParsedQuestions(normalized, `'${file.name}' fayli`);
          showToast(`'${file.name}' faylidan ${normalized.length} ta savol o'qildi!`, 'success');
        } catch (err) {
          console.error(err);
          showToast(`Excel faylni o'qishda xatolik: ${err.message}`, 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    } 
    // Check if JSON
    else if (fileName.endsWith('.json') || file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          const normalized = app.normalizeJsonQuestions(content);
          app.processParsedQuestions(normalized, `'${file.name}' fayli`);
          showToast(`'${file.name}' JSON faylidan ${normalized.length} ta savol o'qildi!`, 'success');
        } catch (err) {
          showToast(`JSON faylni o'qishda xatolik: ${err.message}`, 'error');
        }
      };
      reader.readAsText(file);
    } else {
      showToast('Iltimos, faqat Excel (.xlsx, .xls, .csv) yoki .json fayl yuklang!', 'error');
    }
  },

  downloadExcelTemplate() {
    if (typeof XLSX === 'undefined') {
      showToast('Excel kutubxonasi yuklanmoqda, kuting...', 'warning');
      return;
    }

    const templateData = [
      {
        "Fan": "Matematika",
        "Test": "Matematika Asoslari Testi",
        "Savol": "25 + 37 nechaga teng?",
        "A": "52",
        "B": "62",
        "C": "72",
        "D": "57",
        "TogriJavob": "B",
        "Ball": 2,
        "Qiyinlik": "Oson",
        "Tushuntirish": "25 ga 37 ni qo'shganda 62 hosil bo'ladi."
      },
      {
        "Fan": "Matematika",
        "Test": "Matematika Asoslari Testi",
        "Savol": "8 × 7 nechaga teng?",
        "A": "54",
        "B": "56",
        "C": "64",
        "D": "48",
        "TogriJavob": "B",
        "Ball": 2,
        "Qiyinlik": "Oson",
        "Tushuntirish": "8 ko'paytirilgan 7 teng 56 ga."
      },
      {
        "Fan": "Matematika",
        "Test": "Matematika Asoslari Testi",
        "Savol": "100 dan 36 ni ayirsak nechchi qoladi?",
        "A": "54",
        "B": "64",
        "C": "74",
        "D": "66",
        "TogriJavob": "B",
        "Ball": 2,
        "Qiyinlik": "Oson",
        "Tushuntirish": "100 - 36 = 64."
      },
      {
        "Fan": "Matematika",
        "Test": "Matematika Asoslari Testi",
        "Savol": "81 ning kvadrat ildizi nechaga teng?",
        "A": "7",
        "B": "8",
        "C": "9",
        "D": "10",
        "TogriJavob": "C",
        "Ball": 2,
        "Qiyinlik": "Oson",
        "Tushuntirish": "9 ning kvadrati 81 ga teng."
      },
      {
        "Fan": "Matematika",
        "Test": "Matematika Asoslari Testi",
        "Savol": "3x + 7 = 22 tenglamada x nechaga teng?",
        "A": "3",
        "B": "4",
        "C": "5",
        "D": "6",
        "TogriJavob": "C",
        "Ball": 3,
        "Qiyinlik": "O'rta",
        "Tushuntirish": "3x = 22 - 7 => 3x = 15 => x = 5."
      },
      {
        "Fan": "Matematika",
        "Test": "Matematika Asoslari Testi",
        "Savol": "x² - 5x + 6 = 0 tenglamaning ildizlari qaysi?",
        "A": "1 va 6",
        "B": "2 va 3",
        "C": "3 va 4",
        "D": "1 va 5",
        "TogriJavob": "B",
        "Ball": 3,
        "Qiyinlik": "Qiyin",
        "Tushuntirish": "(x-2)(x-3) = 0 bo'lgani uchun ildizlar 2 va 3."
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Auto-fit column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Fan
      { wch: 25 }, // Test
      { wch: 45 }, // Savol
      { wch: 18 }, // A
      { wch: 18 }, // B
      { wch: 18 }, // C
      { wch: 18 }, // D
      { wch: 14 }, // TogriJavob
      { wch: 8 },  // Ball
      { wch: 12 }, // Qiyinlik
      { wch: 35 }  // Tushuntirish
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Savollar");

    XLSX.writeFile(workbook, "test_savollar_shabloni.xlsx");
    showToast('"test_savollar_shabloni.xlsx" shabloni muvaffaqiyatli yuklab olindi!', 'success');
  },

  normalizeExcelRows(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    let detectedSubject = '';
    let detectedTitle = '';
    const normalized = [];

    // Helper: Normalize key name by stripping spaces, punctuation, dashes, underscores and lowercasing
    const cleanKey = (k) => {
      if (!k) return '';
      return String(k)
        .toLowerCase()
        .replace(/['`’‘"_\s\-:.,\/\\#№]/g, '')
        .trim();
    };

    rows.forEach((row, idx) => {
      if (!row || typeof row !== 'object') return;

      // Build a map of cleanedKey -> rawValue
      const map = {};
      const rawValues = [];
      for (const rawKey of Object.keys(row)) {
        const ck = cleanKey(rawKey);
        const val = row[rawKey] !== null && row[rawKey] !== undefined ? String(row[rawKey]).trim() : '';
        map[ck] = val;
        if (val) rawValues.push(val);
      }

      // 1. Question text detection
      let text = (
        map['savol'] || map['savolmatni'] || map['savollar'] || map['savoln'] || map['question'] || 
        map['questions'] || map['questiontext'] || map['matn'] || map['text'] || map['prompt'] || 
        map['савол'] || map['вопрос'] || map['savoli'] || ''
      ).trim();

      // 2. Options A, B, C, D, E
      let optA = (map['a'] || map['varianta'] || map['optiona'] || map['variant1'] || map['option1'] || map['javoba'] || map['javob1'] || map['1'] || map['а'] || '').trim();
      let optB = (map['b'] || map['variantb'] || map['optionb'] || map['variant2'] || map['option2'] || map['javobb'] || map['javob2'] || map['2'] || map['б'] || '').trim();
      let optC = (map['c'] || map['variantc'] || map['optionc'] || map['variant3'] || map['option3'] || map['javobc'] || map['javob3'] || map['3'] || map['в'] || '').trim();
      let optD = (map['d'] || map['variantd'] || map['optiond'] || map['variant4'] || map['option4'] || map['javobd'] || map['javob4'] || map['4'] || map['г'] || '').trim();
      let optE = (map['e'] || map['variante'] || map['optione'] || map['variant5'] || map['option5'] || map['javobe'] || map['javob5'] || map['5'] || map['д'] || '').trim();

      // 3. Correct answer detection
      let correctRaw = (
        map['togrijavob'] || map['togrijavobi'] || map['togri'] || map['to‘g‘rijavob'] || map['to`g`rijavob'] || 
        map['tugrijavob'] || map['javob'] || map['javobi'] || map['kalit'] || map['kalitjavob'] || 
        map['correct'] || map['correctanswer'] || map['answer'] || map['key'] || map['тўғрижавоб'] || 
        map['тугрижавоб'] || map['жавоб'] || map['ответ'] || map['to‘g‘ri'] || map['togrisi'] || ''
      ).trim().toUpperCase();

      // Positional fallback if text is missing
      if (!text && rawValues.length >= 3) {
        const sortedByLen = [...rawValues].sort((a, b) => b.length - a.length);
        if (sortedByLen[0].length >= 3) {
          text = sortedByLen[0];
          const remValues = rawValues.filter(v => v !== text);
          if (!optA && remValues[0]) optA = remValues[0];
          if (!optB && remValues[1]) optB = remValues[1];
          if (!optC && remValues[2]) optC = remValues[2];
          if (!optD && remValues[3]) optD = remValues[3];
          if (!correctRaw && remValues[4]) correctRaw = remValues[4].toUpperCase();
        }
      }

      if (!text) return;

      // Extract Subject & Test Title if present
      const subject = (map['fan'] || map['fannomi'] || map['subject'] || map['category'] || map['mavzu'] || map['фан'] || map['предмет'] || '').trim();
      const title = (map['test'] || map['testnomi'] || map['testsarlavhasi'] || map['title'] || map['name'] || map['тест'] || '').trim();
      if (subject && !detectedSubject) detectedSubject = subject;
      if (title && !detectedTitle) detectedTitle = title;

      // Normalize correctRaw (e.g. "A)", "1", "VARIANT A", "A.", etc.)
      correctRaw = correctRaw.replace(/[^A-E0-9А-Д]/gi, '').trim();
      if (correctRaw === '1' || correctRaw === 'А') correctRaw = 'A';
      else if (correctRaw === '2' || correctRaw === 'Б') correctRaw = 'B';
      else if (correctRaw === '3' || correctRaw === 'В') correctRaw = 'C';
      else if (correctRaw === '4' || correctRaw === 'Г') correctRaw = 'D';
      else if (correctRaw === '5' || correctRaw === 'Д') correctRaw = 'E';

      const rawOptsList = [
        { key: 'A', text: optA },
        { key: 'B', text: optB },
        { key: 'C', text: optC },
        { key: 'D', text: optD },
        { key: 'E', text: optE }
      ].filter(o => o.text.length > 0);

      // Default to A if no option matched
      if (!correctRaw && rawOptsList.length > 0) {
        correctRaw = 'A';
      }

      let hasCorrect = false;
      const options = rawOptsList.map(o => {
        let isCorrect = false;
        if (correctRaw === o.key || correctRaw === o.text.toUpperCase()) {
          isCorrect = true;
          hasCorrect = true;
        }
        return {
          text: o.text,
          isCorrect
        };
      });

      if (!hasCorrect && options.length > 0) {
        options[0].isCorrect = true;
      }

      if (options.length < 2) {
        options.push({ text: 'A variant', isCorrect: true });
        options.push({ text: 'B variant', isCorrect: false });
      }

      // Difficulty & Points
      let diffRaw = (map['qiyinlik'] || map['daraja'] || map['difficulty'] || map['level'] || 'medium').toLowerCase();
      let difficulty = 'medium';
      if (diffRaw.includes('oson') || diffRaw.includes('easy') || diffRaw.includes('1')) difficulty = 'easy';
      else if (diffRaw.includes('qiyin') || diffRaw.includes('hard') || diffRaw.includes('3')) difficulty = 'hard';

      const points = parseInt(map['ball'] || map['balli'] || map['points'] || map['score'] || (difficulty === 'hard' ? 3 : 2)) || 2;
      const explanation = (map['tushuntirish'] || map['izoh'] || map['sharh'] || map['explanation'] || '').trim();

      const rowSubject = subject || detectedSubject || 'Umumiy Fan';
      const rowTitle = title || (subject ? `${subject} Testi` : 'Test');

      normalized.push({
        text,
        points,
        options,
        difficulty,
        subject: rowSubject,
        title: rowTitle,
        explanation
      });
    });

    // Group questions by bundle (subject + ":::" + title)
    const bundlesMap = {};
    normalized.forEach(q => {
      const subName = q.subject || 'Umumiy Fan';
      const tTitle = q.title || `${subName} Testi`;
      const key = `${subName.toLowerCase()}:::${tTitle.toLowerCase()}`;
      if (!bundlesMap[key]) {
        bundlesMap[key] = {
          subject: subName,
          title: tTitle,
          questions: []
        };
      }
      bundlesMap[key].questions.push(q);
    });

    const bundles = Object.values(bundlesMap);
    normalized.isMultiSubjectBundle = bundles.length > 1;
    normalized.subjectsBundle = bundles;
    normalized.detectedSubject = bundles[0]?.subject || detectedSubject || 'Umumiy Fan';
    normalized.detectedTitle = bundles[0]?.title || detectedTitle || `${normalized.detectedSubject} Testi`;
    return normalized;
  },

  processParsedQuestions(normalized, sourceName = 'fayl') {
    this.currentBulkQuestions = normalized;
    this.updateBulkUIFromQuestions(normalized, sourceName);
  },

  updateBulkUIFromQuestions(normalized, sourceName = '') {
    const indicator = document.getElementById('bulk-json-status-indicator');
    const msg = document.getElementById('bulk-status-message');
    const badge = document.getElementById('bulk-status-count-badge');
    const previewList = document.getElementById('bulk-preview-list');
    const previewCounter = document.getElementById('bulk-preview-counter');
    const submitBtnText = document.getElementById('bulk-submit-btn-text');

    if (!indicator || !msg) return;

    if (!normalized || normalized.length === 0) {
      indicator.className = 'p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between transition shadow-md';
      msg.innerHTML = '<span class="material-symbols-outlined text-base">warning</span> <span class="font-medium">Fayldan savollar topilmadi. Ustunlar nomini tekshiring (Savol, A, B, C, D, TogriJavob).</span>';
      if (badge) badge.innerText = '0 ta savol';
      if (previewList) previewList.innerHTML = '<p class="text-center py-8 text-indigo-400 text-xs">Savollar aniqlanmadi.</p>';
      if (previewCounter) previewCounter.innerText = '0 ta';
      return;
    }

    // Auto-update Subject & Title fields
    if (normalized.detectedSubject) {
      const subInput = document.getElementById('bulk-new-subject');
      if (subInput) subInput.value = normalized.detectedSubject;
    }
    if (normalized.detectedTitle) {
      const titleInput = document.getElementById('bulk-new-title');
      if (titleInput) titleInput.value = normalized.detectedTitle;
    }

    // Count issues
    let missingCorrectCount = 0;
    let invalidCount = 0;
    normalized.forEach(q => {
      if (!q.options || q.options.length < 2) invalidCount++;
      if (!q.options || !q.options.some(o => o.isCorrect)) missingCorrectCount++;
    });

    if (missingCorrectCount > 0 || invalidCount > 0) {
      indicator.className = 'p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between transition shadow-md';
      msg.innerHTML = `<span class="material-symbols-outlined text-base">warning</span> <span class="font-medium">${normalized.length} ta savoldan ${missingCorrectCount > 0 ? `${missingCorrectCount} tasida to'g'ri javob belgilanmagan` : `${invalidCount} tasida variantlar kam`}.</span>`;
    } else {
      indicator.className = 'p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between transition shadow-md';
      msg.innerHTML = `<span class="material-symbols-outlined text-base">check_circle</span> <span class="font-medium font-bold">${sourceName ? `${sourceName}dan ` : ''}${normalized.length} ta savol muvaffaqiyatli aniqlandi!</span>`;
    }

    if (badge) badge.innerText = `${normalized.length} ta savol`;
    if (previewCounter) previewCounter.innerText = `${normalized.length} ta savol`;

    const titleVal = document.getElementById('bulk-new-title')?.value || (normalized.detectedTitle || 'Test');
    const isNewMode = document.querySelector('input[name="bulk-import-mode"]:checked')?.value === 'new';

    if (submitBtnText) {
      submitBtnText.innerText = isNewMode 
        ? `🚀 ${normalized.length} ta Savolni "${titleVal}" Testi sifatida yaratish`
        : `🚀 ${normalized.length} ta Savolni Testga Yuklash`;
    }

    // Render preview cards
    if (previewList) {
      previewList.innerHTML = normalized.slice(0, 100).map((q, idx) => {
        const hasCorrect = q.options.some(o => o.isCorrect);
        return `
          <div class="p-4 rounded-2xl bg-white/5 border ${hasCorrect ? 'border-white/10' : 'border-indigo-500/40 bg-indigo-600/5'} space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">#${idx + 1}</span>
                ${q.subject ? `<span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">${q.subject}</span>` : ''}
                <span class="text-xs font-bold text-white">${q.text}</span>
              </div>
              <span class="text-[11px] text-gray-400 font-medium shrink-0">${q.points} ball • ${q.difficulty}</span>
            </div>

            <div class="flex flex-wrap gap-2 pt-1">
              ${q.options.map((opt, oIdx) => `
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-medium ${opt.isCorrect ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/30' : 'bg-white/5 text-gray-400 border border-white/5'}">
                  ${opt.isCorrect ? '✓ ' : ['A', 'B', 'C', 'D', 'E'][oIdx] ? `${['A', 'B', 'C', 'D', 'E'][oIdx]}) ` : ''}${opt.text}
                </span>
              `).join('')}
            </div>

            ${q.explanation ? `
              <div class="text-[11px] text-gray-400 italic pt-1 border-t border-white/5">
                💡 <b>Izoh:</b> ${q.explanation}
              </div>
            ` : ''}

            ${!hasCorrect ? `
              <div class="text-[10px] text-indigo-400 font-semibold pt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">error</span> Ushbu savolda to'g'ri javob belgilanmagan! (TogriJavob ustunida A, B, C yoki D ko'rsating)
              </div>
            ` : ''}
          </div>
        `;
      }).join('') + (normalized.length > 100 ? `<p class="text-center py-3 text-xs text-gray-400 font-medium">... va yana ${normalized.length - 100} ta savol</p>` : '');
    }
  },

  async handleBulkImport(forcedTestId) {
    const isNewMode = document.querySelector('input[name="bulk-import-mode"]:checked')?.value === 'new';
    const normalizedQuestions = this.currentBulkQuestions;

    if (!normalizedQuestions || normalizedQuestions.length === 0) {
      showToast('Iltimos, avval Excel (.xlsx) yoki JSON fayl yuklang!', 'error');
      return;
    }

    // Validate that questions have correct answers
    const invalidQuestions = normalizedQuestions.filter(q => !q.options || q.options.length < 2 || !q.options.some(o => o.isCorrect));
    if (invalidQuestions.length > 0) {
      this.confirmModal({
        title: "Savollarda Kamchilik Bor",
        message: `Diqqat: ${invalidQuestions.length} ta savolda variantlar kam yoki to'g'ri javob belgilanmagan. Baribir yuklashni davom ettirasizmi?`,
        confirmText: "Ha, Davom Etish",
        cancelText: "Bekor Qilish",
        icon: "warning",
        type: "warning",
        onConfirm: async () => {
          await app._executeBulkImport(normalizedQuestions, isNewMode, forcedTestId);
        }
      });
      return;
    }

    await this._executeBulkImport(normalizedQuestions, isNewMode, forcedTestId);
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
      indicator.className = 'p-3.5 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-xs text-indigo-400 flex items-center justify-between transition';
      msg.innerHTML = '<span class="material-symbols-outlined text-base">warning</span> <span class="font-medium">Savollar aniqlanmadi. Formatni tekshiring.</span>';
      if (badge) badge.innerText = '0 ta savol';
      if (previewList) previewList.innerHTML = '<p class="text-center py-6 text-indigo-400 text-xs">Savollar formati to\'g\'ri kelmadi.</p>';
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
      indicator.className = 'p-3.5 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between transition';
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
          <div class="p-4 rounded-2xl bg-white/5 border ${hasCorrect ? 'border-white/10' : 'border-indigo-500/40 bg-indigo-600/5'} space-y-2">
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
              <div class="text-[10px] text-indigo-400 font-semibold pt-1 flex items-center gap-1">
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
      this.confirmModal({
        title: "Savollarda Kamchilik Bor",
        message: `Diqqat: ${invalidQuestions.length} ta savolda variantlar kam yoki to'g'ri javob belgilanmagan. Baribir yuklashni davom ettirasizmi?`,
        confirmText: "Ha, Davom Etish",
        cancelText: "Bekor Qilish",
        icon: "warning",
        type: "warning",
        onConfirm: async () => {
          await app._executeBulkImport(normalizedQuestions, isNewMode, forcedTestId);
        }
      });
      return;
    }

    await this._executeBulkImport(normalizedQuestions, isNewMode, forcedTestId);
  },

  async _executeBulkImport(normalizedQuestions, isNewMode, forcedTestId) {
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
          const sQuestions = (Array.isArray(s.questions) && s.questions.length > 0 && s.questions[0].options)
            ? s.questions
            : this.normalizeJsonQuestions({ questions: Array.isArray(s.questions) ? s.questions : (Array.isArray(s.savollar) ? s.savollar : []), subject: sName });
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
  async renderAdminUsers(page = 1) {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getAdminHeaderHtml('users', 'Foydalanuvchilar Ro\'yxati', 'Tizimga ro\'yxatdan o\'tgan barcha talabalar va adminlar', '#/admin')}

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-gray-400">Platformadagi barcha ro'yxatdan o'tgan foydalanuvchilarni boshqarish</div>
          <div class="flex items-center gap-2">
            <button onclick="app.renderAdminUsers()" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">refresh</span> Yangilash
            </button>
          </div>
        </div>

        <div class="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-300">
              <thead class="bg-white/5 text-gray-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th class="px-6 py-4">Ism-Familiya</th>
                  <th class="px-6 py-4">Email</th>
                  <th class="px-6 py-4 text-center">Roli</th>
                  <th class="px-6 py-4 text-center">Tarif</th>
                  <th class="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody id="admin-users-table-body" class="divide-y divide-white/5">
                <tr><td colspan="5" class="p-8 text-center text-gray-500">Foydalanuvchilar yuklanmoqda...</td></tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div id="admin-users-pagination" class="hidden px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap"></div>
        </div>
      </div>
    `;

    const res = await api('/api/users');
    const tbody = document.getElementById('admin-users-table-body');
    const paginationEl = document.getElementById('admin-users-pagination');
    if (!tbody) return;

    let allUsers = [];
    if (res && res.success && res.data) {
      if (Array.isArray(res.data)) allUsers = res.data;
      else if (res.data.$values && Array.isArray(res.data.$values)) allUsers = res.data.$values;
    }
    if (allUsers.length === 0) {
      const fallback = await handleStandaloneFallback('/api/users');
      if (fallback && fallback.data && Array.isArray(fallback.data)) {
        allUsers = fallback.data;
      }
    }

    this._cachedUsers = allUsers;

    if (allUsers.length > 0) {
      const PAGE_SIZE = 10;
      const totalPages = Math.ceil(allUsers.length / PAGE_SIZE);
      let currentPage = Math.max(1, Math.min(page, totalPages));

      const renderPage = (pg) => {
        currentPage = Math.max(1, Math.min(pg, totalPages));
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageUsers = allUsers.slice(start, start + PAGE_SIZE);

        tbody.innerHTML = pageUsers.map(u => {
          const isPro = u.isPremium || u.premiumPlan === 'Pro' || u.premiumPlan === 'PRO' || u.premiumPlan === 'VIP' || u.premiumPlan === 'Lifetime';
          const isVip = u.premiumPlan === 'VIP' || u.premiumPlan === 'Lifetime';
          const planBadge = u.role === 'Admin' 
            ? '<span class="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">Tizim</span>'
            : (u.role === 'Teacher' 
              ? '<span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">O\'qituvchi</span>'
              : (isVip ? '<span class="badge-vip">💎 VIP</span>' : (isPro ? '<span class="badge-pro">👑 PRO</span>' : '<span class="px-2.5 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10 text-[10px]">Standart</span>')));

          const roleBadge = u.role === 'Admin'
            ? '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-600/20 text-blue-300 border border-blue-500/40">🛡️ Admin</span>'
            : (u.role === 'Teacher'
              ? '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">👨‍🏫 O\'qituvchi</span>'
              : '<span class="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 text-gray-300 border border-white/15">🎓 Talaba</span>');

          const isCurrentAdmin = (state.user && state.user.email && state.user.email.toLowerCase() === (u.email || '').toLowerCase()) || (u.email && u.email.toLowerCase() === 'admin@testplatform.uz');

          return `
            <tr class="hover:bg-white/5 transition">
              <td class="px-6 py-4 font-bold text-white flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl ${u.role === 'Admin' ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white' : (u.role === 'Teacher' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300')} flex items-center justify-center text-xs font-black shrink-0 border border-white/10 shadow-sm">
                  ${(u.fullName || 'F').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class="font-bold text-white text-xs">${this.escapeHtml(u.fullName || 'Foydalanuvchi')}</div>
                  <div class="text-[10px] text-gray-500 font-mono">${u.id ? String(u.id).substring(0, 8) + '...' : ''}</div>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-300 font-mono text-xs">${this.escapeHtml(u.email || '-')}</td>
              <td class="px-6 py-4 text-center">
                ${roleBadge}
              </td>
              <td class="px-6 py-4 text-center">
                ${planBadge}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1.5 flex-wrap">
                  <button onclick="app.openEditUserModal('${u.id}')" class="px-2.5 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition flex items-center gap-1 shadow-sm" title="Ism, email va parolni tahrirlash">
                    <span class="material-symbols-outlined text-[15px]">edit</span>
                    <span>Tahrirlash</span>
                  </button>

                  <button onclick="app.openGrantProModal('${u.id}', '${this.escapeJs(u.fullName)}')" class="px-2.5 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition flex items-center gap-1 shadow-sm" title="PRO/VIP tarif biriktirish">
                    <span class="material-symbols-outlined text-[15px]">workspace_premium</span>
                    <span>PRO / VIP</span>
                  </button>

                  ${!isCurrentAdmin ? (
                    u.role === 'Admin' ? `
                      <button onclick="app.setUserRole('${u.id}', 'Student', '${this.escapeJs(u.fullName)}')" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[11px] font-bold transition flex items-center gap-1" title="Talaba roliga tushirish">
                        <span class="material-symbols-outlined text-[15px]">person</span>
                        <span>Talaba qilish</span>
                      </button>
                    ` : `
                      <button onclick="app.setUserRole('${u.id}', 'Admin', '${this.escapeJs(u.fullName)}')" class="px-2.5 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition flex items-center gap-1" title="Admin roliga ko'tarish">
                        <span class="material-symbols-outlined text-[15px]">shield_person</span>
                        <span>Admin qilish</span>
                      </button>
                    `
                  ) : ''}

                  ${!isCurrentAdmin ? `
                    <button onclick="app.deleteUser('${u.id}', '${this.escapeJs(u.fullName)}')" class="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition" title="Foydalanuvchini o'chirish">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  ` : '<span class="text-blue-400 text-[11px] px-2 font-mono font-bold">👑 Bosh Admin</span>'}
                </div>
              </td>
            </tr>
          `;
        }).join('');

        if (totalPages > 1 && paginationEl) {
          paginationEl.classList.remove('hidden');

          const startNum = start + 1;
          const endNum = Math.min(start + PAGE_SIZE, allUsers.length);
          let pageButtons = '';
          for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage;
            pageButtons += `
              <button onclick="app._adminUsersGoPage(${i})"
                class="w-8 h-8 rounded-lg text-xs font-bold transition ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }">
                ${i}
              </button>`;
          }

          paginationEl.innerHTML = `
            <div class="text-xs text-gray-400">
              <span class="text-white font-semibold">${startNum}–${endNum}</span> / ${allUsers.length} ta foydalanuvchi &nbsp;·&nbsp;
              <span class="text-blue-400 font-semibold">${currentPage}-qism</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="app._adminUsersGoPage(${currentPage - 1})"
                ${currentPage === 1 ? 'disabled' : ''}
                class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              ${pageButtons}
              <button onclick="app._adminUsersGoPage(${currentPage + 1})"
                ${currentPage === totalPages ? 'disabled' : ''}
                class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          `;
        }
      };

      this._adminUsersGoPage = (pg) => renderPage(pg);
      renderPage(currentPage);
    } else {
      tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">Foydalanuvchilar topilmadi.</td></tr>`;
    }
  },

  openEditUserModal(userId) {
    const user = (this._cachedUsers || []).find(u => String(u.id).toLowerCase() === String(userId).toLowerCase()) || {};
    const isCurrentAdmin = (state.user && state.user.email && state.user.email.toLowerCase() === (user.email || '').toLowerCase()) || (user.email && user.email.toLowerCase() === 'admin@testplatform.uz');

    this.openModal(`
      <div class="space-y-5">
        <div class="text-center space-y-1">
          <div class="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto text-xl shadow-lg">
            <span class="material-symbols-outlined text-[24px]">manage_accounts</span>
          </div>
          <h3 class="text-xl font-bold font-heading text-white">Foydalanuvchini Tahrirlash</h3>
          <p class="text-xs text-gray-400">Ism, email, yangi parol va rolini o'zgartirish</p>
        </div>

        <form onsubmit="app.handleAdminEditUserSubmit(event, '${userId}')" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">To'liq Ism (F.I.SH)</label>
            <input type="text" id="edit-user-fullname" required value="${this.escapeHtml(user.fullName || '')}" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Email Manzili</label>
            <input type="email" id="edit-user-email" required value="${this.escapeHtml(user.email || '')}" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
              <span>Yangi Parol O'rnatish</span>
              <span class="text-[10px] text-gray-500 font-normal">(ixtiyoriy, parolni yangilash uchun)</span>
            </label>
            <div class="relative">
              <input type="password" id="edit-user-password" placeholder="Yangi parol (kamida 4 belgi)" class="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400 font-mono" />
              <button type="button" onclick="const inp=document.getElementById('edit-user-password'); inp.type = inp.type==='password'?'text':'password';" class="absolute right-2.5 top-2.5 text-gray-400 hover:text-white transition">
                <span class="material-symbols-outlined text-[16px]">visibility</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Tizimdagi Roli</label>
            <select id="edit-user-role" ${isCurrentAdmin ? 'disabled' : ''} class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400">
              <option value="Student" class="bg-[#14161f]" ${user.role === 'Student' ? 'selected' : ''}>🎓 Talaba (Student)</option>
              <option value="Admin" class="bg-[#14161f]" ${user.role === 'Admin' ? 'selected' : ''}>🛡️ Administrator (Admin)</option>
            </select>
            ${isCurrentAdmin ? '<p class="text-[10px] text-blue-400 mt-1">Bosh admin rolini o\'zgartirib bo\'lmaydi</p>' : ''}
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button type="button" onclick="app.closeModal()" class="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-xs transition">
              Bekor Qilish
            </button>
            <button type="submit" id="btn-admin-edit-user-submit" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">save</span>
              <span>Saqlash</span>
            </button>
          </div>
        </form>
      </div>
    `, 'max-w-md');
  },

  async handleAdminEditUserSubmit(e, userId) {
    e.preventDefault();
    const fullName = document.getElementById('edit-user-fullname')?.value || '';
    const email = document.getElementById('edit-user-email')?.value || '';
    const newPassword = document.getElementById('edit-user-password')?.value || '';
    const role = document.getElementById('edit-user-role')?.value || 'Student';

    const btn = document.getElementById('btn-admin-edit-user-submit');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined text-[15px] animate-spin">refresh</span> Saqlanmoqda...';
    }

    const res = await api(`/api/users/${userId}/admin-edit`, {
      method: 'PUT',
      body: JSON.stringify({ fullName, email, newPassword: newPassword.trim() ? newPassword.trim() : null, role })
    });

    this.closeModal();
    if (res && res.success) {
      showToast("Foydalanuvchi ma'lumotlari muvaffaqiyatli saqlandi! ✅", 'success');
      this.renderAdminUsers();
    } else {
      showToast(res?.message || 'Saqlashda xatolik yuz berdi', 'error');
    }
  },

  async setUserRole(userId, newRole, fullName = 'Foydalanuvchi') {
    const roleName = newRole === 'Teacher' ? '👨‍🏫 O\'qituvchi' : (newRole === 'Admin' ? '👑 Admin' : '🎓 Talaba');
    this.confirmModal({
      title: "Rolni O'zgartirish",
      message: `«${fullName}» nomli foydalanuvchiga ${roleName} rolini biriktirmoqchimisiz?`,
      confirmText: "Ha, Biriktirish",
      cancelText: "Bekor Qilish",
      icon: "manage_accounts",
      type: "primary",
      onConfirm: async () => {
        const res = await api(`/api/users/${userId}/set-role`, {
          method: 'PUT',
          body: JSON.stringify({ role: newRole })
        });
        if (res && res.success) {
          showToast(`Foydalanuvchi muvaffaqiyatli ${roleName} etib tayinlandi! 🎉`, 'success');
          if (window.location.hash.startsWith('#/admin/teachers')) {
            app.renderAdminTeachers();
          } else {
            app.renderAdminUsers();
          }
        } else {
          showToast(res?.message || 'Rolni o\'zgartirishda xatolik', 'error');
        }
      }
    });
  },

  deleteUser(userId, fullName = 'Foydalanuvchi') {
    this.confirmModal({
      title: "Foydalanuvchini O'chirish",
      message: `Haqiqatdan ham «${fullName}» nomli foydalanuvchini tizimdan butunlay o'chirmoqchimisiz? Uning barcha ma'lumotlari tozalab tashlanadi.`,
      confirmText: "Ha, O'chirish",
      cancelText: "Bekor Qilish",
      icon: "person_remove",
      type: "danger",
      onConfirm: async () => {
        const res = await api(`/api/users/${userId}`, { method: 'DELETE' });
        if (res && res.success) {
          showToast('Foydalanuvchi tizimdan muvaffaqiyatli o\'chirildi! 🗑️', 'success');
          if (window.location.hash.startsWith('#/admin/teachers')) {
            app.renderAdminTeachers();
          } else {
            app.renderAdminUsers();
          }
        } else {
          showToast(res?.message || 'O\'chirishda xatolik yuz berdi', 'error');
        }
      }
    });
  },

  // ----------------------------------------------------
  // ADMIN: TEACHER MANAGEMENT & ROLE ASSIGNMENT
  // ----------------------------------------------------
  async renderAdminTeachers(page = 1) {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getAdminHeaderHtml('teachers', 'O\'qituvchilar Boshqaruvi', 'Platformadagi o\'qituvchilarni boshqarish, yangi o\'qituvchi yaratish va talabalarga Teacher rolini berish', '#/admin')}

        <!-- Top Stats & Actions Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="glass-card p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between">
            <div>
              <div class="text-xs text-indigo-300 font-medium">Jami O'qituvchilar</div>
              <div id="admin-teachers-total-count" class="text-2xl font-black text-white mt-1">...</div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <span class="material-symbols-outlined text-2xl">school</span>
            </div>
          </div>

          <div class="glass-card p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
            <div>
              <div class="text-xs text-blue-300 font-medium">Faol O'qituvchilar</div>
              <div id="admin-teachers-active-count" class="text-2xl font-black text-white mt-1">...</div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <span class="material-symbols-outlined text-2xl">verified_user</span>
            </div>
          </div>

          <div class="glass-card p-5 rounded-2xl border border-indigo-500/20 bg-indigo-600/5 flex items-center justify-between">
            <div>
              <div class="text-xs text-indigo-300 font-medium">Tezkor Harakat</div>
              <button onclick="app.openCreateTeacherModal()" class="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">person_add</span> Yangi O'qituvchi Qo'shish
              </button>
            </div>
            <div class="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <span class="material-symbols-outlined text-2xl">add_moderator</span>
            </div>
          </div>
        </div>

        <!-- Quick Promote Student Card -->
        <div class="glass-card p-5 rounded-2xl border border-white/10 bg-white/5">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-indigo-400 text-lg">manage_accounts</span>
            <h3 class="text-sm font-bold text-white">Mavjud Talabaga O'qituvchi (Teacher) Rolini Berish</h3>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-3">
            <select id="promote-student-select" class="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-surface-card border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none">
              <option value="">Talabani tanlang...</option>
            </select>
            <button onclick="app.handlePromoteSelectedStudent()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30">
              <span class="material-symbols-outlined text-[16px]">upgrade</span> O'qituvchi Qilish
            </button>
          </div>
        </div>

        <!-- Teachers Table -->
        <div class="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div class="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-400">groups</span>
              <span class="text-sm font-bold text-white">O'qituvchilar Ro'yxati</span>
            </div>
            <span class="text-xs text-gray-400" id="teachers-table-info">Yuklanmoqda...</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-300">
              <thead class="bg-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th class="px-6 py-3.5">O'qituvchi</th>
                  <th class="px-6 py-3.5">Email</th>
                  <th class="px-6 py-3.5 text-center">Testlar Soni</th>
                  <th class="px-6 py-3.5 text-center">Holati</th>
                  <th class="px-6 py-3.5 text-center">Tayinlangan Sana</th>
                  <th class="px-6 py-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody id="admin-teachers-table-body" class="divide-y divide-white/5">
                <tr><td colspan="6" class="p-8 text-center text-gray-500">Yuklanmoqda...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Fetch Teachers and all users
    const [teachersRes, usersRes] = await Promise.all([
      api('/api/users/teachers'),
      api('/api/users')
    ]);

    const tbody = document.getElementById('admin-teachers-table-body');
    const totalCountEl = document.getElementById('admin-teachers-total-count');
    const activeCountEl = document.getElementById('admin-teachers-active-count');
    const tableInfoEl = document.getElementById('teachers-table-info');
    const studentSelect = document.getElementById('promote-student-select');

    const teachers = (teachersRes.success && Array.isArray(teachersRes.data)) ? teachersRes.data : [];
    const allUsers = (usersRes.success && Array.isArray(usersRes.data)) ? usersRes.data : [];
    const students = allUsers.filter(u => u.role === 'Student');

    if (totalCountEl) totalCountEl.textContent = teachers.length;
    if (activeCountEl) activeCountEl.textContent = teachers.filter(t => t.isActive !== false).length;
    if (tableInfoEl) tableInfoEl.textContent = `Jami: ${teachers.length} ta o'qituvchi`;

    // Populate student select
    if (studentSelect) {
      studentSelect.innerHTML = `<option value="">Talabani tanlang (${students.length} ta mavjud)...</option>` + 
        students.map(s => `<option value="${s.id}">${this.escapeHtml(s.fullName)} (${this.escapeHtml(s.email)})</option>`).join('');
    }

    if (teachers.length > 0) {
      tbody.innerHTML = teachers.map(t => {
        const createdDate = t.createdAt ? new Date(t.createdAt).toLocaleDateString('uz-UZ') : '-';
        return `
          <tr class="hover:bg-white/5 transition">
            <td class="px-6 py-4 font-bold text-white flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/30 shrink-0">
                ${(t.fullName || 'T').charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="text-white font-bold">${this.escapeHtml(t.fullName)}</div>
                <div class="text-[10px] text-indigo-300">👨‍🏫 O'qituvchi / Murabbiy</div>
              </div>
            </td>
            <td class="px-6 py-4 text-gray-300 font-mono">${this.escapeHtml(t.email)}</td>
            <td class="px-6 py-4 text-center font-bold text-white">
              <span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                ${t.createdTestsCount || 0} ta test
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1 w-fit mx-auto">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Faol
              </span>
            </td>
            <td class="px-6 py-4 text-center text-gray-400">${createdDate}</td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="app.setUserRole('${t.id}', 'Student', '${this.escapeJs(t.fullName)}')" class="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition flex items-center gap-1" title="Talabaga tushirish">
                  <span class="material-symbols-outlined text-[14px]">person</span> Talabaga qaytarish
                </button>
                <button onclick="app.deleteUser('${t.id}', '${this.escapeJs(t.fullName)}')" class="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition" title="O'chirish">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="p-12 text-center text-gray-500">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <span class="material-symbols-outlined text-2xl">school</span>
            </div>
            <p class="font-bold text-gray-300">Hozircha o'qituvchilar yo'q.</p>
            <p class="text-xs text-gray-500 mt-1">Yangi o'qituvchi qo'shing yoki mavjud talabalardan birini O'qituvchi etib tayinlang.</p>
          </td>
        </tr>
      `;
    }
  },

  handlePromoteSelectedStudent() {
    const sel = document.getElementById('promote-student-select');
    const studentId = sel ? sel.value : '';
    if (!studentId) {
      showToast('Iltimos, o\'qituvchi qilmoqchi bo\'lgan talabani tanlang!', 'info');
      return;
    }
    const studentName = sel.options[sel.selectedIndex]?.text || 'Talaba';
    this.setUserRole(studentId, 'Teacher', studentName.split('(')[0].trim());
  },

  openCreateTeacherModal() {
    this.openModal(`
      <div class="space-y-5">
        <div class="flex items-center gap-3 border-b border-white/10 pb-4">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <span class="material-symbols-outlined text-xl">person_add</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">Yangi O'qituvchi Yaratish</h3>
            <p class="text-xs text-gray-400">O'qituvchi uchun login va parol ma'lumotlarini kiriting</p>
          </div>
        </div>

        <form onsubmit="app.handleCreateTeacherSubmit(event)" class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Ism va Familiya</label>
            <input type="text" id="new-teacher-name" required placeholder="Masalan: Nodir Aliyev" class="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none placeholder-gray-500" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Email Manzil</label>
            <input type="email" id="new-teacher-email" required placeholder="oqituvchi@maktab.uz" class="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none placeholder-gray-500" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Parol</label>
            <input type="password" id="new-teacher-password" required minlength="6" placeholder="Kamida 6 ta belgi" class="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none placeholder-gray-500" />
          </div>

          <div class="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-200">
            ℹ️ O'qituvchi o'z login va paroli bilan kirib, mustaqil testlar yaratishi, savollar import qilishi va o'quvchilar natijalarini ko'rishi mumkin.
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button type="button" onclick="app.closeModal()" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition">
              Bekor qilish
            </button>
            <button type="submit" id="create-teacher-btn" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30">
              <span class="material-symbols-outlined text-[16px]">save</span> Saqlash va Yaratish
            </button>
          </div>
        </form>
      </div>
    `);
  },

  async handleCreateTeacherSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('create-teacher-btn');
    const fullName = document.getElementById('new-teacher-name')?.value.trim();
    const email = document.getElementById('new-teacher-email')?.value.trim();
    const password = document.getElementById('new-teacher-password')?.value;

    if (!fullName || !email || !password) {
      showToast('Barcha maydonlarni to\'ldiring!', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">sync</span> Yaratilmoqda...';
    }

    try {
      const res = await api('/api/users/create-teacher', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password })
      });

      if (res && res.success) {
        showToast(`🎉 Yangi o'qituvchi «${fullName}» muvaffaqiyatli yaratildi!`, 'success');
        this.closeModal();
        this.renderAdminTeachers();
      } else {
        showToast(res?.message || 'O\'qituvchi yaratishda xatolik', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server bilan bog\'lanishda xatolik', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">save</span> Saqlash va Yaratish';
      }
    }
  },

  // ----------------------------------------------------
  // TEACHER PORTAL & DASHBOARD
  // ----------------------------------------------------
  async renderTeacherDashboard() {
    const root = document.getElementById('app-root');
    const teacherName = state.user ? formatFullName(state.user.fullName) : 'O\'qituvchi';

    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getTeacherHeaderHtml('dashboard', `Xush kelibsiz, ${teacherName}! 👨‍🏫`, 'Testlaringiz, savollar to\'plami va o\'quvchilar natijalarini boshqarish markazi', '')}

        <!-- Welcome Banner -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-blue-900/40 to-cyan-900/30 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
          <div class="relative z-10 max-w-2xl space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              O'qituvchi Kabineti
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-white">Bilimlarni baholash va yangi testlar yaratish</h2>
            <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">
              O'z faningiz bo'yicha darajali testlar tuzing, savollarni JSON orqali ommaviy yuklang va talabalarning natijalarini real vaqtda kuzatib boring.
            </p>
            <div class="flex items-center gap-3 pt-2 flex-wrap">
              <a href="#/teacher/add-test" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30">
                <span class="material-symbols-outlined text-[18px]">add_circle</span> Yangi Test Yaratish
              </a>
              <a href="#/teacher/bulk-import" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 border border-white/15 font-semibold text-xs transition flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[18px]">table_view</span> Excel Import
              </a>
              <a href="#/teacher/results" class="px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-xs transition flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[18px]">analytics</span> Natijalar
              </a>
            </div>
          </div>
        </div>

        <!-- 4 Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="#/teacher/tests" class="glass-card p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block group">
            <div class="flex items-center justify-between text-indigo-400 mb-2">
              <span class="text-xs font-semibold group-hover:text-indigo-300 transition">Mening Testlarim</span>
              <span class="material-symbols-outlined group-hover:scale-110 transition-transform">quiz</span>
            </div>
            <div id="teacher-tests-count" class="text-2xl sm:text-3xl font-black text-white">...</div>
            <div class="text-[10px] text-gray-400 mt-1">Platformadagi barcha testlar &rarr;</div>
          </a>

          <a href="#/teacher/tests" class="glass-card p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block group">
            <div class="flex items-center justify-between text-cyan-400 mb-2">
              <span class="text-xs font-semibold group-hover:text-cyan-300 transition">Savollar Bazasi</span>
              <span class="material-symbols-outlined group-hover:scale-110 transition-transform">help</span>
            </div>
            <div id="teacher-questions-count" class="text-2xl sm:text-3xl font-black text-white">...</div>
            <div class="text-[10px] text-gray-400 mt-1">Jami kiritilgan savollar &rarr;</div>
          </a>

          <a href="#/teacher/results" class="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block group">
            <div class="flex items-center justify-between text-emerald-400 mb-2">
              <span class="text-xs font-semibold group-hover:text-emerald-300 transition">Talabalar Urinishlari</span>
              <span class="material-symbols-outlined group-hover:scale-110 transition-transform">how_to_reg</span>
            </div>
            <div id="teacher-attempts-count" class="text-2xl sm:text-3xl font-black text-white">...</div>
            <div class="text-[10px] text-gray-400 mt-1">Topshirilgan testlar soni &rarr;</div>
          </a>

          <a href="#/teacher/results" class="glass-card p-5 rounded-2xl border border-indigo-500/20 bg-indigo-600/5 hover:border-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all block group">
            <div class="flex items-center justify-between text-indigo-400 mb-2">
              <span class="text-xs font-semibold group-hover:text-indigo-300 transition">O'rtacha Ball</span>
              <span class="material-symbols-outlined group-hover:scale-110 transition-transform">stars</span>
            </div>
            <div id="teacher-avg-score" class="text-2xl sm:text-3xl font-black text-white">...</div>
            <div class="text-[10px] text-gray-400 mt-1">Natijalar tahlili &rarr;</div>
          </a>
        </div>

        <!-- Recent Tests & Quick Actions Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Recent Tests (2 cols) -->
          <div class="lg:col-span-2 glass-panel rounded-3xl border border-white/10 p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-400">format_list_bulleted</span>
                <h3 class="text-base font-bold text-white">Testlar Ro'yxati</h3>
              </div>
              <a href="#/teacher/tests" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                Barchasini ko'rish &rarr;
              </a>
            </div>

            <div id="teacher-recent-tests" class="space-y-3">
              <div class="p-6 text-center text-gray-500 text-xs">Testlar yuklanmoqda...</div>
            </div>
          </div>

          <!-- Quick Navigation Card (1 col) -->
          <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-400">bolt</span>
              <h3 class="text-base font-bold text-white">Tezkor Amallar</h3>
            </div>

            <div class="space-y-2.5">
              <a href="#/teacher/add-test" class="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <span class="material-symbols-outlined text-xl">add_box</span>
                </div>
                <div>
                  <div class="text-xs font-bold text-white group-hover:text-indigo-300 transition">Yangi Test Tuzish</div>
                  <div class="text-[10px] text-gray-400">Fan va daraja parametrlarini tanlash</div>
                </div>
              </a>

              <a href="#/teacher/subjects" class="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <span class="material-symbols-outlined text-xl">menu_book</span>
                </div>
                <div>
                  <div class="text-xs font-bold text-white group-hover:text-indigo-300 transition">Fanlar va Mavzular</div>
                  <div class="text-[10px] text-gray-400">Fanlar katalogini ko'rish</div>
                </div>
              </a>

              <a href="#/teacher/results" class="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <span class="material-symbols-outlined text-xl">analytics</span>
                </div>
                <div>
                  <div class="text-xs font-bold text-white group-hover:text-emerald-300 transition">O'quvchilar Baholari</div>
                  <div class="text-[10px] text-gray-400">Test topshirgan talabalar ro'yxati</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    // Fetch dashboard and test data
    const [dashRes, testsRes] = await Promise.all([
      api('/api/dashboard/summary'),
      api('/api/tests?pageSize=5')
    ]);

    const testsCountEl = document.getElementById('teacher-tests-count');
    const questionsCountEl = document.getElementById('teacher-questions-count');
    const attemptsCountEl = document.getElementById('teacher-attempts-count');
    const avgScoreEl = document.getElementById('teacher-avg-score');
    const recentTestsContainer = document.getElementById('teacher-recent-tests');

    if (dashRes.success && dashRes.data) {
      const d = dashRes.data;
      if (testsCountEl) testsCountEl.textContent = d.totalTests || 0;
      if (questionsCountEl) questionsCountEl.textContent = d.totalQuestions || 0;
      if (attemptsCountEl) attemptsCountEl.textContent = d.totalAttempts || 0;
      if (avgScoreEl) avgScoreEl.textContent = (d.averageScore || 0) + '%';
    }

    const testList = (testsRes.success && testsRes.data?.items) ? testsRes.data.items : [];
    if (recentTestsContainer) {
      if (testList.length > 0) {
        recentTestsContainer.innerHTML = testList.map(t => {
          const meta = getSubjectMeta(t.subjectName);
          const diffBadge = t.difficulty === 'Easy' ? '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Oson</span>'
            : (t.difficulty === 'Hard' ? '<span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">Qiyin</span>'
            : '<span class="px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 text-[10px] font-bold">O\'rta</span>');

          return `
            <div class="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-xl ${meta.glowBg} border border-white/10 flex items-center justify-center shrink-0" style="color: ${meta.colorHex}">
                  <span class="material-symbols-outlined text-lg">${meta.icon}</span>
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white truncate">${this.escapeHtml(t.title)}</div>
                  <div class="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                    <span>${this.escapeHtml(t.subjectName || 'Fan')}</span>
                    <span>•</span>
                    <span>${t.questionsCount || 0} ta savol</span>
                    <span>•</span>
                    <span>${t.timeLimitMinutes || 20} daqiqa</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                ${diffBadge}
                <a href="#/teacher/add-question/${t.id}" class="p-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition text-[11px] font-bold flex items-center gap-1" title="Savollarni ko'rish / qo'shish">
                  <span class="material-symbols-outlined text-[14px]">edit_note</span> Savollar
                </a>
              </div>
            </div>
          `;
        }).join('');
      } else {
        recentTestsContainer.innerHTML = `
          <div class="text-center py-6 text-gray-500 text-xs">
            Hozircha testlar mavjud emas.
            <a href="#/teacher/add-test" class="block mt-1 text-indigo-400 font-bold hover:underline">+ Birinchi testni yarating &rarr;</a>
          </div>
        `;
      }
    }
  },

  async renderTeacherTests(page = 1) {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getTeacherHeaderHtml('tests', 'Mening Testlarim', 'Testlarni yaratish, savollarini tahrirlash va chop etish', '#/teacher')}

        <!-- Actions Bar -->
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <a href="#/teacher/add-test" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30">
              <span class="material-symbols-outlined text-[16px]">add_circle</span> Yangi Test
            </a>
          </div>
          <div class="text-xs text-gray-400" id="teacher-tests-counter">Yuklanmoqda...</div>
        </div>

        <!-- Tests List Table -->
        <div class="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-300">
              <thead class="bg-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th class="px-6 py-3.5">Test Nomi</th>
                  <th class="px-6 py-3.5">Fani</th>
                  <th class="px-6 py-3.5 text-center">Savollar</th>
                  <th class="px-6 py-3.5 text-center">Vaqt</th>
                  <th class="px-6 py-3.5 text-center">Holati</th>
                  <th class="px-6 py-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody id="teacher-tests-table-body" class="divide-y divide-white/5">
                <tr><td colspan="6" class="p-8 text-center text-gray-500">Yuklanmoqda...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const res = await api('/api/tests?pageSize=50');
    const tbody = document.getElementById('teacher-tests-table-body');
    const counter = document.getElementById('teacher-tests-counter');
    const tests = (res.success && res.data?.items) ? res.data.items : [];

    if (counter) counter.textContent = `Jami: ${tests.length} ta test`;

    if (tests.length > 0) {
      tbody.innerHTML = tests.map(t => {
        const meta = getSubjectMeta(t.subjectName);
        return `
          <tr class="hover:bg-white/5 transition">
            <td class="px-6 py-4 font-bold text-white">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg ${meta.glowBg} flex items-center justify-center shrink-0" style="color: ${meta.colorHex}">
                  <span class="material-symbols-outlined text-[16px]">${meta.icon}</span>
                </div>
                <span>${this.escapeHtml(t.title)}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-gray-300 font-medium">${this.escapeHtml(t.subjectName || '-')}</td>
            <td class="px-6 py-4 text-center font-bold text-white">
              <span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">${t.questionsCount || 0} ta</span>
            </td>
            <td class="px-6 py-4 text-center text-gray-400">${t.timeLimitMinutes || 20} daqiqa</td>
            <td class="px-6 py-4 text-center">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${t.isPublished ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'}">
                ${t.isPublished ? 'Chop etilgan' : 'Qoralama'}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <a href="#/teacher/add-question/${t.id}" class="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">edit_note</span> Savollar (${t.questionsCount || 0})
                </a>
                <a href="#/teacher/edit-test/${t.id}" class="p-1.5 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition" title="Tahrirlash">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                </a>
                <button onclick="app.deleteTeacherTest('${t.id}', '${this.escapeJs(t.title)}')" class="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition" title="O'chirish">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Testlar topilmadi. <a href="#/teacher/add-test" class="text-indigo-400 font-bold hover:underline">+ Yangi test qo'shing</a></td></tr>`;
    }
  },

  deleteTeacherTest(testId, title) {
    this.confirmModal({
      title: "Testni O'chirish",
      message: `«${title}» nomli testni va uning barcha savollarini o'chirmoqchimisiz?`,
      confirmText: "Ha, O'chirish",
      cancelText: "Bekor Qilish",
      icon: "delete",
      type: "danger",
      onConfirm: async () => {
        const res = await api(`/api/tests/${testId}`, { method: 'DELETE' });
        if (res && res.success) {
          showToast('Test muvaffaqiyatli o\'chirildi! 🗑️', 'success');
          app.renderTeacherTests();
        } else {
          showToast(res?.message || 'O\'chirishda xatolik', 'error');
        }
      }
    });
  },

  async renderTeacherAddTest() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getTeacherHeaderHtml('add-test', 'Yangi Test Yaratish', 'Test fani, sarlavhasi va vaqt mezonlarini kiriting', '#/teacher/tests')}

        <div class="max-w-2xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
          <form onsubmit="app.handleTeacherCreateTestSubmit(event)" class="space-y-4 text-left">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">Fanni tanlang *</label>
              <select id="teacher-test-subject" required class="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none">
                <option value="">Fan yuklanmoqda...</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">Test Sarlavhasi *</label>
              <input type="text" id="teacher-test-title" required placeholder="Masalan: 9-sinf Fizika 1-chorak nazorati" class="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">Qisqa Tavsif</label>
              <textarea id="teacher-test-desc" rows="2" placeholder="Ushbu test nimalarni qamrab olgan..." class="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none"></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">Vaqt (Daqiqa)</label>
                <input type="number" id="teacher-test-time" value="20" min="5" max="180" class="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">O'tish Bali (%)</label>
                <input type="number" id="teacher-test-pass" value="60" min="1" max="100" class="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">Murakkablik</label>
                <select id="teacher-test-diff" class="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none">
                  <option value="Easy">Boshlang'ich (Easy)</option>
                  <option value="Medium" selected>O'rta (Medium)</option>
                  <option value="Hard">Murakkab (Hard)</option>
                </select>
              </div>
            </div>

            <div class="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
              <a href="#/teacher/tests" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition">
                Bekor qilish
              </a>
              <button type="submit" id="teacher-create-test-btn" class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30">
                <span class="material-symbols-outlined text-[16px]">save</span> Testni Yaratish &rarr;
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Populate subjects
    const subjectsRes = await api('/api/subjects');
    const subjSelect = document.getElementById('teacher-test-subject');
    if (subjSelect && subjectsRes.success && Array.isArray(subjectsRes.data)) {
      subjSelect.innerHTML = '<option value="">Fanni tanlang...</option>' + 
        subjectsRes.data.map(s => `<option value="${s.id}">${this.escapeHtml(s.name)}</option>`).join('');
    }
  },

  async handleTeacherCreateTestSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('teacher-create-test-btn');
    const subjectId = document.getElementById('teacher-test-subject')?.value;
    const title = document.getElementById('teacher-test-title')?.value.trim();
    const description = document.getElementById('teacher-test-desc')?.value.trim() || '';
    const timeLimitMinutes = parseInt(document.getElementById('teacher-test-time')?.value) || 20;
    const passingPercentage = parseInt(document.getElementById('teacher-test-pass')?.value) || 60;
    const rawDiff = document.getElementById('teacher-test-diff')?.value || 'Medium';
    const diffMap = { 'Easy': 1, 'Medium': 2, 'Hard': 3, '1': 1, '2': 2, '3': 3 };
    const difficulty = diffMap[rawDiff] || 2;

    if (!subjectId || !title) {
      showToast('Fan va test sarlavhasini kiriting!', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">sync</span> Yaratilmoqda...';
    }

    try {
      const res = await api('/api/tests', {
        method: 'POST',
        body: JSON.stringify({
          subjectId,
          title,
          description,
          timeLimitMinutes,
          passingPercentage,
          difficulty,
          isPublished: true,
          isPremiumOnly: false,
          maxAttemptsPerStudent: 3,
          showCorrectAnswers: true,
          showReviewAfterSubmit: true
        })
      });

      if (res && res.success) {
        showToast('🎉 Yangi test muvaffaqiyatli yaratildi! Endi unga savollar qo\'shishingiz mumkin.', 'success');
        const testId = res.data?.id;
        window.location.hash = testId ? `#/teacher/add-question/${testId}` : '#/teacher/tests';
      } else {
        showToast(res?.message || 'Test yaratishda xatolik', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server bilan bog\'lanishda xatolik', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">save</span> Testni Yaratish &rarr;';
      }
    }
  },

  async renderTeacherEditTest(testId) {
    this.renderAdminEditTest(testId);
  },

  async renderTeacherAddQuestion(testId) {
    // Teacher add question redirects to unified quiz creator with teacher header
    this.renderAdminAddQuestion(testId);
  },

  async renderTeacherBulkImport(testId = '') {
    this.renderAdminBulkImport(testId);
  },

  async renderTeacherSubjects() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getTeacherHeaderHtml('subjects', 'Fanlar va Yo\'nalishlar', 'Platformadagi barcha fanlar va mavzular katalogi', '#/teacher')}

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="teacher-subjects-grid">
          <div class="p-8 text-center text-gray-500 col-span-full">Fanlar yuklanmoqda...</div>
        </div>
      </div>
    `;

    const res = await api('/api/subjects');
    const container = document.getElementById('teacher-subjects-grid');
    const subjects = (res.success && Array.isArray(res.data)) ? res.data : [];

    if (container) {
      if (subjects.length > 0) {
        container.innerHTML = subjects.map(s => {
          const meta = getSubjectMeta(s.name);
          return `
            <div class="glass-card p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition group flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-xl ${meta.glowBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition" style="color: ${meta.colorHex}">
                    <span class="material-symbols-outlined text-xl">${meta.icon}</span>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-white group-hover:text-indigo-300 transition">${this.escapeHtml(s.name)}</h4>
                    <span class="text-[10px] text-gray-400">${s.testsCount || 0} ta test tuzilgan</span>
                  </div>
                </div>
                <p class="text-xs text-gray-400 leading-relaxed mb-4">${this.escapeHtml(s.description || 'Ushbu fan bo\'yicha barcha nazorat va sinov testlari')}</p>
              </div>

              <div class="pt-3 border-t border-white/10 flex items-center justify-between">
                <a href="#/teacher/add-test" class="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                  + Ushbu fanga test tuzish &rarr;
                </a>
              </div>
            </div>
          `;
        }).join('');
      } else {
        container.innerHTML = `<div class="p-8 text-center text-gray-500 col-span-full">Fanlar topilmadi.</div>`;
      }
    }
  },

  async renderTeacherResults() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getTeacherHeaderHtml('results', 'O\'quvchilar Test Natijalari', 'Talabalarning topshirgan testlari, to\'plagan ballari va muvaffaqiyat ko\'rsatkichlari', '#/teacher')}

        <div class="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div class="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-400">task_alt</span>
              <span class="text-sm font-bold text-white">So'nggi Topshirilgan Urinishlar</span>
            </div>
            <span class="text-xs text-gray-400" id="teacher-results-info">Yuklanmoqda...</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-300">
              <thead class="bg-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th class="px-6 py-3.5">Talaba</th>
                  <th class="px-6 py-3.5">Test Nomi</th>
                  <th class="px-6 py-3.5 text-center">Natija (%)</th>
                  <th class="px-6 py-3.5 text-center">Holat</th>
                  <th class="px-6 py-3.5 text-center">Topshirilgan Vaqt</th>
                  <th class="px-6 py-3.5 text-right">Tahlil</th>
                </tr>
              </thead>
              <tbody id="teacher-results-table-body" class="divide-y divide-white/5">
                <tr><td colspan="6" class="p-8 text-center text-gray-500">Yuklanmoqda...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Fetch dashboard summary for recent attempts
    const res = await api('/api/dashboard/summary');
    const tbody = document.getElementById('teacher-results-table-body');
    const infoEl = document.getElementById('teacher-results-info');
    const attempts = (res.success && res.data?.recentAttempts) ? res.data.recentAttempts : [];

    if (infoEl) infoEl.textContent = `Jami: ${attempts.length} ta so'nggi topshirish`;

    if (attempts.length > 0) {
      tbody.innerHTML = attempts.map(a => {
        const submittedDate = a.submittedAt ? new Date(a.submittedAt).toLocaleString('uz-UZ') : '-';
        const isPassed = a.isPassed || (a.percentage >= 60);
        return `
          <tr class="hover:bg-white/5 transition">
            <td class="px-6 py-4 font-bold text-white flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                ${(a.studentName || 'T').charAt(0).toUpperCase()}
              </div>
              <span>${this.escapeHtml(a.studentName || 'Talaba')}</span>
            </td>
            <td class="px-6 py-4 text-gray-300 font-medium">${this.escapeHtml(a.testTitle || 'Test')}</td>
            <td class="px-6 py-4 text-center font-black text-white">
              <span class="px-2.5 py-1 rounded-lg ${isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}">
                ${Math.round(a.percentage || 0)}%
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
                ${isPassed ? '✅ O\'tdi' : '❌ Yiqildi'}
              </span>
            </td>
            <td class="px-6 py-4 text-center text-gray-400 text-[11px]">${submittedDate}</td>
            <td class="px-6 py-4 text-right">
              <a href="#/result/${a.id}" class="px-3 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-bold text-[11px] transition inline-flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">visibility</span> Ko'rish
              </a>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Hozircha test topshirgan talabalar mavjud emas.</td></tr>`;
    }
  },

  // ----------------------------------------------------
  // ADMIN: AUDIT LOGS
  // ----------------------------------------------------
  async renderAdminAuditLogs(page = 1) {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getAdminHeaderHtml('audit-logs', 'Tizim Audit Jurnali', 'Bajarilgan harakatlar va amallar qaydlari', '#/admin')}

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-gray-400">Tizimda bajarilgan barcha xavfsizlik, test topshirish va boshqaruv amallari</div>
          <div class="flex items-center gap-2">
            <button onclick="app.renderAdminAuditLogs()" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">refresh</span> Yangilash
            </button>
            <button onclick="app.clearAuditLogs()" class="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">delete_sweep</span> Jurnalni Tozalash
            </button>
          </div>
        </div>

        <div class="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-300">
              <thead class="bg-white/5 text-gray-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th class="px-6 py-4">Vaqt</th>
                  <th class="px-6 py-4">Foydalanuvchi</th>
                  <th class="px-6 py-4">Harakat</th>
                  <th class="px-6 py-4">Tafsilot</th>
                </tr>
              </thead>
              <tbody id="admin-audit-table-body" class="divide-y divide-white/5">
                <tr><td colspan="4" class="p-8 text-center text-gray-500">Qaydlar yuklanmoqda...</td></tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div id="admin-audit-pagination" class="hidden px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap"></div>
        </div>
      </div>
    `;

    const res = await api('/api/audit-logs?top=500');
    const tbody = document.getElementById('admin-audit-table-body');
    const paginationEl = document.getElementById('admin-audit-pagination');
    if (!tbody) return;

    const allLogs = (res.success && res.data && Array.isArray(res.data)) ? res.data : [];

    if (allLogs.length > 0) {
      const PAGE_SIZE = 10;
      const totalPages = Math.ceil(allLogs.length / PAGE_SIZE);
      let currentPage = Math.max(1, Math.min(page, totalPages));

      const renderPage = (pg) => {
        currentPage = Math.max(1, Math.min(pg, totalPages));
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageLogs = allLogs.slice(start, start + PAGE_SIZE);

        tbody.innerHTML = pageLogs.map(log => {
          const actionUpper = (log.action || '').toUpperCase();
          let badgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
          if (actionUpper.includes('CREATE') || actionUpper.includes('ADD') || actionUpper.includes('START') || actionUpper.includes('INIT') || actionUpper.includes('REGISTER')) {
            badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
          } else if (actionUpper.includes('UPDATE') || actionUpper.includes('EDIT') || actionUpper.includes('CONFIG') || actionUpper.includes('SET') || actionUpper.includes('CHANGE')) {
            badgeClass = 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30';
          } else if (actionUpper.includes('DELETE') || actionUpper.includes('REMOVE') || actionUpper.includes('FAIL')) {
            badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
          } else if (actionUpper.includes('PAYMENT') || actionUpper.includes('UPGRADE') || actionUpper.includes('PREMIUM') || actionUpper.includes('PROMO') || actionUpper.includes('VIP')) {
            badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
          } else if (actionUpper.includes('CERTIFICATE') || actionUpper.includes('EXAM') || actionUpper.includes('SUPPORT')) {
            badgeClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
          }

          const dateObj = new Date(log.createdAt);
          const dateStr = !isNaN(dateObj) ? dateObj.toLocaleString('uz-UZ', { 
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
          }) : log.createdAt;

          return `
            <tr class="hover:bg-white/5 transition text-xs">
              <td class="px-6 py-3.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">${dateStr}</td>
              <td class="px-6 py-3.5 text-white font-semibold">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-gray-300 font-bold shrink-0">${(log.userName || 'T')[0].toUpperCase()}</span>
                  <span class="truncate max-w-[140px]">${this.escapeHtml(log.userName || 'Tizim')}</span>
                </div>
              </td>
              <td class="px-6 py-3.5 whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${badgeClass}">
                  ${this.escapeHtml(log.action)}
                </span>
              </td>
              <td class="px-6 py-3.5 text-gray-300 leading-relaxed max-w-md">
                <div>${this.escapeHtml(log.details || '')}</div>
                ${log.entityName ? `<span class="block text-[10px] text-gray-500 mt-0.5 font-mono">Obyekt: ${this.escapeHtml(log.entityName)} ${log.entityId ? `[${this.escapeHtml(log.entityId)}]` : ''}</span>` : ''}
              </td>
            </tr>
          `;
        }).join('');

        if (totalPages > 1 && paginationEl) {
          paginationEl.classList.remove('hidden');

          const startNum = start + 1;
          const endNum = Math.min(start + PAGE_SIZE, allLogs.length);
          let pageButtons = '';
          for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage;
            pageButtons += `
              <button onclick="app._adminAuditGoPage(${i})"
                class="w-8 h-8 rounded-lg text-xs font-bold transition ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }">
                ${i}
              </button>`;
          }

          paginationEl.innerHTML = `
            <div class="text-xs text-gray-400">
              <span class="text-white font-semibold">${startNum}–${endNum}</span> / ${allLogs.length} ta qayd &nbsp;·&nbsp;
              <span class="text-blue-400 font-semibold">${currentPage}-qism</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="app._adminAuditGoPage(${currentPage - 1})"
                ${currentPage === 1 ? 'disabled' : ''}
                class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              ${pageButtons}
              <button onclick="app._adminAuditGoPage(${currentPage + 1})"
                ${currentPage === totalPages ? 'disabled' : ''}
                class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          `;
        }
      };

      this._adminAuditGoPage = (pg) => renderPage(pg);
      renderPage(currentPage);
    } else {
      tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-500">Hozircha audit qaydlari mavjud emas.</td></tr>`;
    }
  },

  clearAuditLogs() {
    this.confirmModal({
      title: "Audit Jurnalini Tozalash",
      message: "Barcha tizim audit qaydlarini butunlay tozalashni tasdiqlaysizmi?",
      confirmText: "Tozalash",
      type: "danger",
      icon: "delete_sweep",
      onConfirm: async () => {
        localStorage.setItem('tp_audit_logs', JSON.stringify([]));
        await api('/api/audit-logs/clear', { method: 'POST' });
        showToast("Audit jurnali muvaffaqiyatli tozalandi", "info");
        app.renderAdminAuditLogs();
      }
    });
  },

  // ----------------------------------------------------
  // ----------------------------------------------------
  // ADMIN: SUBJECTS MANAGEMENT (CREATE, EDIT, DELETE)
  // ----------------------------------------------------
  async renderAdminSubjects(page = 1) {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div class="space-y-6 animate-fadeIn pb-12">
        ${this.getAdminHeaderHtml('subjects', 'Fanlar Boshqaruvi', 'Tizimdagi fanlarni yaratish, tahrirlash va boshqarish', '#/admin')}

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-gray-400">Tizimdagi barcha fanlar va yo'nalishlar ro'yxati</div>
          <div>
            <button onclick="app.openCreateSubjectModal()" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold glow-button-primary transition flex items-center gap-1.5 shadow-md">
              <span class="material-symbols-outlined text-[16px]">add_circle</span> Yangi Fan Qo'shish
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
          <!-- Pagination -->
          <div id="admin-subjects-pagination" class="hidden px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap"></div>
        </div>
      </div>
    `;

    const res = await api('/api/subjects');
    const tbody = document.getElementById('admin-subjects-table-body');
    const paginationEl = document.getElementById('admin-subjects-pagination');
    const allSubjects = (res.success && res.data && Array.isArray(res.data)) ? res.data : [];

    if (allSubjects.length > 0) {
      const PAGE_SIZE = 10;
      const totalPages = Math.ceil(allSubjects.length / PAGE_SIZE);
      let currentPage = Math.max(1, Math.min(page, totalPages));

      const renderPage = (pg) => {
        currentPage = Math.max(1, Math.min(pg, totalPages));
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageSubjects = allSubjects.slice(start, start + PAGE_SIZE);

        tbody.innerHTML = pageSubjects.map(s => `
          <tr class="hover:bg-white/5 transition">
            <td class="px-6 py-4 font-bold text-white">${s.name}</td>
            <td class="px-6 py-4 text-gray-400">${s.description || '—'}</td>
            <td class="px-6 py-4 text-center font-semibold text-blue-400">${s.testsCount || 0} ta</td>
            <td class="px-6 py-4 text-center text-gray-400">${s.topicsCount || 0} ta</td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="app.openEditSubjectModal('${s.id}', '${s.name.replace(/'/g, "\\'")}', '${(s.description || '').replace(/'/g, "\\'")}')" class="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition" title="Tahrirlash">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button onclick="app.deleteSubject('${s.id}')" class="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition" title="O'chirish">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </td>
          </tr>
        `).join('');

        if (totalPages > 1 && paginationEl) {
          paginationEl.classList.remove('hidden');

          const startNum = start + 1;
          const endNum = Math.min(start + PAGE_SIZE, allSubjects.length);
          let pageButtons = '';
          for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage;
            pageButtons += `
              <button onclick="app._adminSubjectsGoPage(${i})"
                class="w-8 h-8 rounded-lg text-xs font-bold transition ${isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }">
                ${i}
              </button>`;
          }

          paginationEl.innerHTML = `
            <div class="text-xs text-gray-400">
              <span class="text-white font-semibold">${startNum}–${endNum}</span> / ${allSubjects.length} ta fan &nbsp;·&nbsp;
              <span class="text-emerald-400 font-semibold">${currentPage}-qism</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="app._adminSubjectsGoPage(${currentPage - 1})"
                ${currentPage === 1 ? 'disabled' : ''}
                class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              ${pageButtons}
              <button onclick="app._adminSubjectsGoPage(${currentPage + 1})"
                ${currentPage === totalPages ? 'disabled' : ''}
                class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          `;
        }
      };

      this._adminSubjectsGoPage = (pg) => renderPage(pg);
      renderPage(currentPage);
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
        <div class="modal-card max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 space-y-4 animate-scaleUp">
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-400">edit</span> Fanni Tahrirlash
            </h3>
            <button onclick="app.closeModal()" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <form onsubmit="app.handleEditSubjectSubmit(event, '${id}')" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Fan Nomi</label>
              <input type="text" id="edit-subj-name" value="${name}" required class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Tavsifi</label>
              <textarea id="edit-subj-desc" rows="3" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400">${desc}</textarea>
            </div>
            <div class="pt-2 flex items-center justify-end gap-2">
              <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold">Bekor qilish</button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">Saqlash</button>
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

  deleteSubject(id) {
    this.confirmModal({
      title: "Fanni O'chirish",
      message: "Haqiqatdan ham bu fanni o'chirmoqchimisiz? Unga tegishli barcha testlar va ma'lumotlar ham o'chirilishi mumkin.",
      confirmText: "Ha, O'chirish",
      type: "danger",
      icon: "delete",
      onConfirm: async () => {
        const res = await api(`/api/subjects/${id}`, { method: 'DELETE' });
        if (res && res.success) {
          showToast('Fan muvaffaqiyatli o\'chirildi!', 'success');
          app.loadSubjects();
          if (window.location.hash === '#/admin/subjects') {
            app.renderAdminSubjects();
          }
        } else {
          showToast(res?.message || 'Fanni o\'chirishda xatolik', 'error');
        }
      }
    });
  },

  // ----------------------------------------------------
  // VIEW: ADMIN PROMO CODES MANAGEMENT
  // ----------------------------------------------------
  async renderAdminPromos() {
    const root = document.getElementById('app-root');
    const headerHtml = this.getAdminHeaderHtml('promos', 'Promo-kodlar Boshqaruvi', 'Talabalar uchun chegirma promo-kodlarini yaratish, sozlash va boshqarish');

    root.innerHTML = `
      <div class="space-y-8 animate-fadeIn pb-16">
        ${headerHtml}

        <!-- Top Actions & Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div class="glass-panel p-5 rounded-3xl border border-purple-500/30 space-y-1">
            <span class="text-[11px] text-gray-400 font-bold uppercase">Jami Promo-kodlar</span>
            <div id="stat-total-promos" class="text-3xl font-black text-white font-heading">0</div>
          </div>
          <div class="glass-panel p-5 rounded-3xl border border-emerald-500/30 space-y-1">
            <span class="text-[11px] text-emerald-300 font-bold uppercase">Faol Kodlar</span>
            <div id="stat-active-promos" class="text-3xl font-black text-emerald-400 font-heading">0</div>
          </div>
          <div class="glass-panel p-5 rounded-3xl border border-indigo-500/30 flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-[11px] text-indigo-300 font-bold uppercase">Yangi Kod Berish</span>
              <p class="text-xs text-gray-400">Admin orqali promo berish</p>
            </div>
            <button onclick="app.openCreatePromoModal()" class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">add</span> Yangi Promo-kod
            </button>
          </div>
        </div>

        <!-- Promos Table Panel -->
        <div class="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div class="p-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 class="text-base font-bold text-white font-heading flex items-center gap-2">
                <span class="material-symbols-outlined text-purple-400">confirmation_number</span>
                <span>Barcha Promo-kodlar Ro'yxati</span>
              </h3>
              <p class="text-xs text-gray-400">Talabalar to'lov paytida faqat shu yerdagi faol kodlardan foydalana oladi</p>
            </div>
            <button onclick="app.renderAdminPromos()" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">refresh</span> Yangilash
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-300">
              <thead class="bg-white/5 text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/10">
                <tr>
                  <th class="py-3 px-4 font-bold">Promo-kod</th>
                  <th class="py-3 px-4 font-bold">Chegirma</th>
                  <th class="py-3 px-4 font-bold">Izoh</th>
                  <th class="py-3 px-4 font-bold">Amal Qilish Muddati</th>
                  <th class="py-3 px-4 font-bold">Holati</th>
                  <th class="py-3 px-4 font-bold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody id="admin-promos-table-body" class="divide-y divide-white/5">
                <tr>
                  <td colspan="6" class="text-center py-12 text-gray-500">Promo-kodlar yuklanmoqda...</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div id="admin-promos-pagination" class="hidden px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap"></div>
        </div>

      </div>
    `;

    this.loadAdminPromos();
  },

  async loadAdminPromos(page = 1) {
    const tbody = document.getElementById('admin-promos-table-body');
    const totalEl = document.getElementById('stat-total-promos');
    const activeEl = document.getElementById('stat-active-promos');
    const paginationEl = document.getElementById('admin-promos-pagination');
    if (!tbody) return;

    const res = await api('/api/admin/promos');
    const promos = res.success && res.data && Array.isArray(res.data) ? res.data : [];

    if (totalEl) totalEl.innerText = promos.length;
    if (activeEl) activeEl.innerText = promos.filter(p => p.isActive).length;

    if (!promos.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-12 text-gray-500">
            Hozircha hech qanday promo-kod mavjud emas. Yuqoridagi tugma orqali yangi promo-kod yarating.
          </td>
        </tr>
      `;
      if (paginationEl) paginationEl.classList.add('hidden');
      return;
    }

    const PAGE_SIZE = 10;
    const totalPages = Math.ceil(promos.length / PAGE_SIZE);
    let currentPage = Math.max(1, Math.min(page, totalPages));

    const renderPage = (pg) => {
      currentPage = Math.max(1, Math.min(pg, totalPages));
      const start = (currentPage - 1) * PAGE_SIZE;
      const pagePromos = promos.slice(start, start + PAGE_SIZE);
      const todayStr = new Date().toISOString().slice(0, 10);

      tbody.innerHTML = pagePromos.map(p => {
        const isActive = p.isActive !== false;
        const isExpired = p.endDate && todayStr > p.endDate;
        const isPending = p.startDate && todayStr < p.startDate;

        let dateDisplay = '';
        if (p.startDate && p.endDate) {
          dateDisplay = `<span class="font-mono">${p.startDate}</span> → <span class="font-mono">${p.endDate}</span>`;
        } else if (p.startDate) {
          dateDisplay = `<span class="font-mono">${p.startDate}</span> dan boshlab`;
        } else if (p.endDate) {
          dateDisplay = `<span class="font-mono">${p.endDate}</span> gacha`;
        } else {
          dateDisplay = `<span class="text-gray-500">Cheksiz muddat</span>`;
        }

        let statusBadge = '';
        if (!isActive) {
          statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">⚪ Nofaol</span>';
        } else if (isExpired) {
          statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">⏳ Muddati o\'tgan</span>';
        } else if (isPending) {
          statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">🕒 Kutilmoqda</span>';
        } else {
          statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🟢 Faol</span>';
        }

        // Prepare safe JSON for edit
        const safePromoObj = JSON.stringify(p).replace(/"/g, '&quot;');

        return `
          <tr class="hover:bg-white/[0.02] transition">
            <td class="py-3.5 px-4">
              <div class="font-mono font-black text-indigo-300 text-sm tracking-wider flex items-center gap-1.5">
                <span>${this.escapeHtml(p.code)}</span>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
                -${p.discountPercent || 20}%
              </span>
            </td>
            <td class="py-3.5 px-4 text-gray-300 max-w-xs truncate">
              ${this.escapeHtml(p.description || 'Admin chegirma kodi')}
            </td>
            <td class="py-3.5 px-4 text-gray-300 text-[11px]">
              ${dateDisplay}
            </td>
            <td class="py-3.5 px-4">
              ${statusBadge}
            </td>
            <td class="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
              <button onclick="app.openEditPromoModal(${safePromoObj})" class="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 transition inline-flex items-center justify-center" title="Tahrirlash">
                <span class="material-symbols-outlined text-[15px]">edit</span>
              </button>
              <button onclick="app.togglePromoActive('${this.escapeJs(p.code)}')" class="px-2.5 py-1.5 rounded-lg ${isActive ? 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'} font-semibold text-[11px] transition inline-flex items-center gap-1" title="Holatni o'zgartirish">
                <span class="material-symbols-outlined text-[13px]">${isActive ? 'power_settings_new' : 'check_circle'}</span>
                <span>${isActive ? 'Nofaol qilish' : 'Faollashtirish'}</span>
              </button>
              <button onclick="app.deleteAdminPromo('${this.escapeJs(p.code)}')" class="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition inline-flex items-center justify-center" title="O'chirish">
                <span class="material-symbols-outlined text-[15px]">delete</span>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      if (totalPages > 1 && paginationEl) {
        paginationEl.classList.remove('hidden');

        const startNum = start + 1;
        const endNum = Math.min(start + PAGE_SIZE, promos.length);
        let pageButtons = '';
        for (let i = 1; i <= totalPages; i++) {
          const isActive = i === currentPage;
          pageButtons += `
            <button onclick="app._adminPromosGoPage(${i})"
              class="w-8 h-8 rounded-lg text-xs font-bold transition ${isActive
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }">
              ${i}
            </button>`;
        }

        paginationEl.innerHTML = `
          <div class="text-xs text-gray-400">
            <span class="text-white font-semibold">${startNum}–${endNum}</span> / ${promos.length} ta promo-kod &nbsp;·&nbsp;
            <span class="text-purple-400 font-semibold">${currentPage}-qism</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="app._adminPromosGoPage(${currentPage - 1})"
              ${currentPage === 1 ? 'disabled' : ''}
              class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
              <span class="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            ${pageButtons}
            <button onclick="app._adminPromosGoPage(${currentPage + 1})"
              ${currentPage === totalPages ? 'disabled' : ''}
              class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
              <span class="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        `;
      } else if (paginationEl) {
        paginationEl.classList.add('hidden');
      }
    };

    this._adminPromosGoPage = (pg) => renderPage(pg);
    renderPage(currentPage);
  },

  openCreatePromoModal() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    this.openModal(`
      <div class="space-y-5">
        <div class="flex items-center gap-3 pb-3 border-b border-white/10">
          <div class="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
            🏷️
          </div>
          <div>
            <h3 class="text-base font-bold text-white font-heading">Yangi Promo-kod Yaratish</h3>
            <p class="text-xs text-gray-400">Talabalar to'lov paytida chegirmaga ega bo'lishi uchun kod sozlang</p>
          </div>
        </div>

        <form onsubmit="app.handleCreatePromoSubmit(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Promo-kod Nomi *</label>
            <input type="text" id="new-promo-code" required placeholder="PROMO" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono uppercase font-bold text-xs focus:outline-none focus:border-indigo-400 placeholder:normal-case placeholder:font-sans placeholder:font-normal" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Chegirma Foizi (%) *</label>
            <div class="flex items-center gap-2">
              <input type="number" id="new-promo-discount" min="1" max="100" value="20" required class="w-28 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-xs focus:outline-none focus:border-indigo-400" />
              <div class="flex items-center gap-1 flex-wrap">
                <button type="button" onclick="document.getElementById('new-promo-discount').value = 10" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold">10%</button>
                <button type="button" onclick="document.getElementById('new-promo-discount').value = 20" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold">20%</button>
                <button type="button" onclick="document.getElementById('new-promo-discount').value = 30" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold">30%</button>
                <button type="button" onclick="document.getElementById('new-promo-discount').value = 50" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold">50%</button>
                <button type="button" onclick="document.getElementById('new-promo-discount').value = 70" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold">70%</button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Boshlanish Sanasi</label>
              <input type="date" id="new-promo-start-date" value="${todayStr}" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Tugash Sanasi</label>
              <input type="date" id="new-promo-end-date" value="${nextMonth}" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-400" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Tavsif / Izoh</label>
            <input type="text" id="new-promo-desc" placeholder="Masalan: Bahorgi chegirma aksiyasi" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-400" />
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input type="checkbox" id="new-promo-active" checked class="w-4 h-4 rounded text-indigo-400 bg-white/10 border-white/20 focus:ring-0 cursor-pointer" />
            <label for="new-promo-active" class="text-xs text-gray-300 font-semibold cursor-pointer">Yaratilgach darhol faollashtirilsin</label>
          </div>

          <button type="submit" id="btn-save-promo" class="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">check</span>
            <span>Promo-kodni Yaratish</span>
          </button>
        </form>
      </div>
    `);
  },

  openEditPromoModal(promo) {
    if (!promo || !promo.code) return;
    const originalCode = promo.code;
    const discount = promo.discountPercent || 20;
    const desc = promo.description || '';
    const startDate = promo.startDate || '';
    const endDate = promo.endDate || '';
    const isActive = promo.isActive !== false;

    this.openModal(`
      <div class="space-y-5">
        <div class="flex items-center gap-3 pb-3 border-b border-white/10">
          <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xl shrink-0">
            ✏️
          </div>
          <div>
            <h3 class="text-base font-bold text-white font-heading">Promo-kodni Tahrirlash</h3>
            <p class="text-xs text-gray-400">«${this.escapeHtml(originalCode)}» promo-kodi ma'lumotlarini o'zgartirish</p>
          </div>
        </div>

        <form onsubmit="app.handleEditPromoSubmit(event, '${this.escapeJs(originalCode)}')" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Promo-kod Nomi *</label>
            <input type="text" id="edit-promo-code" value="${this.escapeHtml(originalCode)}" required class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono uppercase font-bold text-xs focus:outline-none focus:border-blue-400" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Chegirma Foizi (%) *</label>
            <div class="flex items-center gap-2">
              <input type="number" id="edit-promo-discount" min="1" max="100" value="${discount}" required class="w-28 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-xs focus:outline-none focus:border-blue-400" />
              <div class="flex items-center gap-1 flex-wrap">
                <button type="button" onclick="document.getElementById('edit-promo-discount').value = 10" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold">10%</button>
                <button type="button" onclick="document.getElementById('edit-promo-discount').value = 20" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold">20%</button>
                <button type="button" onclick="document.getElementById('edit-promo-discount').value = 30" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold">30%</button>
                <button type="button" onclick="document.getElementById('edit-promo-discount').value = 50" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold">50%</button>
                <button type="button" onclick="document.getElementById('edit-promo-discount').value = 70" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold">70%</button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Boshlanish Sanasi</label>
              <input type="date" id="edit-promo-start-date" value="${startDate}" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Tugash Sanasi</label>
              <input type="date" id="edit-promo-end-date" value="${endDate}" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Tavsif / Izoh</label>
            <input type="text" id="edit-promo-desc" value="${this.escapeHtml(desc)}" placeholder="Masalan: Maxsus chegirma" class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400" />
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input type="checkbox" id="edit-promo-active" ${isActive ? 'checked' : ''} class="w-4 h-4 rounded text-blue-500 bg-white/10 border-white/20 focus:ring-0 cursor-pointer" />
            <label for="edit-promo-active" class="text-xs text-gray-300 font-semibold cursor-pointer">Promo-kod faol holatda bo'lsin</label>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button type="button" onclick="app.closeModal()" class="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10 transition">
              Bekor qilish
            </button>
            <button type="submit" id="btn-edit-save-promo" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">save</span>
              <span>O'zgarishlarni Saqlash</span>
            </button>
          </div>
        </form>
      </div>
    `);
  },

  async handleCreatePromoSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('new-promo-code')?.value.trim().toUpperCase();
    const discountPercent = Number(document.getElementById('new-promo-discount')?.value) || 20;
    const startDate = document.getElementById('new-promo-start-date')?.value || '';
    const endDate = document.getElementById('new-promo-end-date')?.value || '';
    const description = document.getElementById('new-promo-desc')?.value.trim() || 'Admin chegirma kodi';
    const isActive = document.getElementById('new-promo-active')?.checked ?? true;

    if (!code) {
      showToast('Promo-kod nomini kiriting!', 'error');
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      showToast('Boshlanish sanasi tugash sanasidan keyin bo\'lishi mumkin emas!', 'error');
      return;
    }

    const btn = document.getElementById('btn-save-promo');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Saqlanmoqda...';
    }

    const res = await api('/api/admin/promos', {
      method: 'POST',
      body: JSON.stringify({ code, discountPercent, description, startDate, endDate, isActive })
    });

    if (res.success) {
      showToast('Yangi promo-kod muvaffaqiyatli yaratildi!', 'success');
      this.closeModal();
      this.loadAdminPromos();
    } else {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span> <span>Promo-kodni Yaratish</span>';
      }
      showToast(res.message || 'Promo-kod yaratishda xatolik', 'error');
    }
  },

  async handleEditPromoSubmit(e, originalCode) {
    e.preventDefault();
    const code = document.getElementById('edit-promo-code')?.value.trim().toUpperCase();
    const discountPercent = Number(document.getElementById('edit-promo-discount')?.value) || 20;
    const startDate = document.getElementById('edit-promo-start-date')?.value || '';
    const endDate = document.getElementById('edit-promo-end-date')?.value || '';
    const description = document.getElementById('edit-promo-desc')?.value.trim() || '';
    const isActive = document.getElementById('edit-promo-active')?.checked ?? true;

    if (!code) {
      showToast('Promo-kod nomini kiriting!', 'error');
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      showToast('Boshlanish sanasi tugash sanasidan keyin bo\'lishi mumkin emas!', 'error');
      return;
    }

    const btn = document.getElementById('btn-edit-save-promo');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Saqlanmoqda...';
    }

    const res = await api(`/api/admin/promos/${encodeURIComponent(originalCode)}`, {
      method: 'PUT',
      body: JSON.stringify({ code, discountPercent, description, startDate, endDate, isActive })
    });

    if (res.success) {
      showToast('Promo-kod muvaffaqiyatli yangilandi!', 'success');
      this.closeModal();
      this.loadAdminPromos();
    } else {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">save</span> <span>O\'zgarishlarni Saqlash</span>';
      }
      showToast(res.message || 'Promo-kodni yangilashda xatolik', 'error');
    }
  },

  async togglePromoActive(code) {
    const res = await api(`/api/admin/promos/${encodeURIComponent(code)}/toggle`, { method: 'PUT' });
    if (res.success) {
      showToast(res.message || 'Holat yangilandi', 'success');
      this.loadAdminPromos();
    } else {
      showToast(res.message || 'Xatolik', 'error');
    }
  },

  deleteAdminPromo(code) {
    this.confirmModal({
      title: "Promo-kodni O'chirish",
      message: `Haqiqatdan ham «${code}» promo-kodini butunlay o'chirmoqchimisiz?`,
      confirmText: "Ha, O'chirish",
      cancelText: "Bekor Qilish",
      type: "danger",
      icon: "confirmation_number",
      onConfirm: async () => {
        const res = await api(`/api/admin/promos/${encodeURIComponent(code)}`, { method: 'DELETE' });
        if (res && res.success) {
          showToast('Promo-kod muvaffaqiyatli o\'chirildi! 🗑️', 'success');
          app.loadAdminPromos();
        } else {
          showToast(res?.message || 'O\'chirishda xatolik', 'error');
        }
      }
    });
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
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/40 text-indigo-300 font-mono text-[11px]">$1</code>')
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
          <div class="p-5 rounded-3xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-xl shrink-0">
                🛡️
              </div>
              <div>
                <strong class="text-sm text-white font-bold block">Tizim Administratori Boshqaruv Rejimi</strong>
                <span>Admin hisobiga to'lov talab qilinmaydi. Talabalarga PRO obunalarni berish va testlarni sozlash to'g'ridan-to'g'ri Admin Panel orqali amalga oshiriladi.</span>
              </div>
            </div>
            <a href="#/admin/users" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 transition whitespace-nowrap">
              Talabalarga PRO Berish &rarr;
            </a>
          </div>
        ` : ''}

        <!-- Hero Header -->
        <div class="text-center space-y-4 max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <span>👑 TestPlatform Premium Ta'lim</span>
          </div>
          <h1 class="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight">
            Bilimingizni <span class="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300">Maksimal Darajaga</span> Ko'taring
          </h1>
          <p class="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Eksklyuziv murakkab testlar, rasmiy Oltin va Brilliant sertifikatlar hamda sun'iy intellekt repetitoridan cheksiz foydalaning.
          </p>
        </div>

        <!-- Pricing Cards Grid Target -->
        <div id="pricing-plans-grid" class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          <div class="col-span-full py-12 text-center text-gray-500">Tariflar yuklanmoqda...</div>
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
              <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
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
    const currentPlanId = status ? (status.planName || 'free').toLowerCase() : (state.user?.isPremium ? (state.user?.premiumPlan?.toLowerCase() || 'pro') : 'free');
    const isAdmin = state.user?.role === 'Admin';

    const displayPlans = plans.filter(p => p.id !== 'lifetime');

    grid.innerHTML = displayPlans.map(p => {
      const isCurrent = currentPlanId === p.id.toLowerCase() && (p.id === 'free' || state.user?.isPremium);
      const isPro = p.id === 'pro';
      const isVip = p.id === 'vip';
      const isFree = p.id === 'free';
      const priceText = p.formattedPrice || (p.price ? p.price.toLocaleString('uz-UZ') + ' so\'m' : '0 so\'m');
      const periodText = p.billingPeriod || 'oy';

      let cardBorder = 'border-white/10';
      let cardGlow = '';
      if (isPro) {
        cardBorder = 'border-indigo-500/40 pricing-card-pro';
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
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isPro ? 'bg-indigo-600/20 text-indigo-300' : isVip ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-gray-400'} uppercase">
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
                  <span class="material-symbols-outlined text-[16px] ${isPro ? 'text-indigo-400' : isVip ? 'text-cyan-400' : 'text-blue-400'} shrink-0 mt-0.5">check_circle</span>
                  <span>${f}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="pt-2">
            ${isAdmin ? `
              <a href="#/admin/users" class="w-full py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs text-center block transition">
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
              <button onclick="app.openCheckoutModal('${p.id}', '${this.escapeJs(p.name)}', '${this.escapeJs(priceText)}')" class="w-full py-3 rounded-xl ${isVip ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'} font-extrabold text-xs shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2">
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
  // PROMO-CODE MODAL & HANDLERS (ADMIN PROMO DISCOUNT SYSTEM)
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
          <p class="text-xs text-gray-400">Admin tomonidan berilgan rasmiy promo-kod orqali to'lovga chegirma oling.</p>
        </div>

        <form onsubmit="app.submitPromoCode(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1.5">Promo-kod</label>
            <input type="text" id="input-promo-code" required placeholder="PROMO" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white uppercase tracking-wider font-mono font-bold text-center text-sm focus:outline-none focus:border-purple-400 placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:tracking-normal" />
          </div>

          <div class="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2.5">
            <span class="material-symbols-outlined text-lg text-purple-400 shrink-0">percent</span>
            <span>Promo-kod to'lov summasidan chegirma beradi va to'lov sahifasida qo'llaniladi.</span>
          </div>

          <button type="submit" id="btn-submit-promo" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs glow-button-primary transition flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[16px]">check</span>
            <span>Chegirma Bilan To'lovga O'tish</span>
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
      this.pendingPromoDiscount = res.data.discountPercent || 20;
      this.closeModal();
      showToast(`🎉 Promo-kod tasdiqlandi! ${this.pendingPromoDiscount}% chegirma taqdim etildi.`, 'success');
      this.openCheckoutModal('pro', 'PRO Oylik', '49,000 so\'m');
    } else {
      showToast(res.message || 'Noto\'g\'ri yoki muddati o\'tgan promo-kod', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span> <span>Chegirma Bilan To\'lovga O\'tish</span>';
      }
    }
  },

  // ----------------------------------------------------
  // CHECKOUT MODAL & PAYME / CLICK INTEGRATION
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

    const baseAmount = planId === 'vip' ? 79000 : 49000;
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
          <div class="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-indigo-500/10">
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
            <div id="checkout-display-price" class="text-base font-black text-indigo-400 font-heading">${priceFormatted}</div>
          </div>
        </div>

        <!-- Promo Code Discount Field -->
        <div class="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[15px] text-indigo-400">confirmation_number</span> Promo-kod:
            </label>
            <span id="checkout-promo-badge" class="text-[10px] text-gray-400">${this.pendingPromoCode ? '<span class="text-emerald-400 font-bold">Faol</span>' : 'Ixtiyoriy'}</span>
          </div>
          <div class="flex gap-2">
            <input type="text" id="checkout-promo-input" value="${this.pendingPromoCode || ''}" placeholder="PROMO" class="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono uppercase text-xs focus:outline-none focus:border-purple-400 placeholder:normal-case placeholder:font-sans placeholder:font-normal" />
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
                <input type="text" id="pay-card-number" required placeholder="8600 0000 0000 0000" maxlength="19" oninput="app.handleCardNumberInput(this)" class="w-full pl-4 pr-16 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono font-bold text-sm tracking-wider focus:outline-none focus:border-indigo-400" />
                <span id="card-brand-badge" class="absolute right-3 top-2.5 px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-gray-400 uppercase">Karta</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Amal qilish muddati</label>
                <input type="text" id="pay-card-expiry" required placeholder="MM/YY" maxlength="5" oninput="app.handleCardExpiryInput(this)" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-center font-bold text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Telefon raqam (SMS)</label>
                <input type="tel" id="pay-card-phone" required placeholder="+998 (90) 000-00-00" oninput="app.handlePhoneInput(this)" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400" />
              </div>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-center gap-2">
            <span class="material-symbols-outlined text-base shrink-0">lock</span>
            <span>256-bit SSL shifrlangan xavfsiz to'lov shlyuzi.</span>
          </div>

          <button type="submit" id="btn-process-pay" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/20 transition flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[16px]">lock_open</span>
            <span id="btn-pay-text">To'lash: ${priceFormatted}</span>
          </button>
        </form>
      </div>
    `);

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
        baseAmount: planId === 'vip' ? 79000 : 49000
      };

      const baseAmount = stateObj.baseAmount;
      const discountPercent = res.data.discountPercent || 20;
      const discount = Math.round(baseAmount * (discountPercent / 100));
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
        btnPayText.textContent = `To'lash: ${newFormatted} (-${discountPercent}% chegirma)`;
      }

      if (badge) {
        badge.innerHTML = `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">-${discountPercent}% Chegirma</span>`;
      }

      if (msg) {
        msg.className = 'text-[11px] text-emerald-400 block';
        msg.innerHTML = `🎉 <strong>${code.toUpperCase()}</strong> kodi qo'llanildi! Siz <strong>${discount.toLocaleString('uz-UZ')} so'm</strong> (${discountPercent}%) tejab qoldingiz.`;
      }

      showToast(`${discountPercent}% chegirma qo'llanildi: -${discount.toLocaleString('uz-UZ')} so'm`, 'success');
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
        badge.className = 'absolute right-3 top-2.5 px-2 py-0.5 rounded bg-indigo-600/20 text-[10px] font-bold text-indigo-300 uppercase';
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
    const finalAmount = this.currentCheckoutState?.currentAmount || (planId === 'vip' ? 79000 : 49000);
    const finalPriceFormatted = finalAmount.toLocaleString('uz-UZ') + ' so\'m';
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();

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
        <div class="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg">
          📱
        </div>

        <div class="space-y-1">
          <h3 class="text-lg font-bold font-heading text-white">SMS Tasdiqlash Kodi</h3>
          <p class="text-xs text-gray-400">${phone || '+998 (**) ***-**-**'} raqamiga yuborilgan 6 xonali kodni kiriting</p>
        </div>

        <form onsubmit="app.finalizePayment(event, '${planId}', '${method}', '${cardNum}', '${cardExp}', '${phone}', '${this.escapeJs(planName)}', '${this.escapeJs(finalPriceFormatted)}', '${this.escapeJs(promoCode || '')}')" class="space-y-4">
          <div>
            <input type="text" id="pay-sms-otp" required value="${randomOtp}" maxlength="6" class="w-full max-w-[200px] mx-auto px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white font-mono text-center font-bold text-lg tracking-[0.3em] focus:outline-none focus:border-indigo-400" />
            <div class="text-[11px] text-gray-500 mt-2">Tasdiqlash kodi: <strong class="text-indigo-400">${randomOtp}</strong></div>
          </div>

          <button type="submit" id="btn-confirm-pay" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/20 transition flex items-center justify-center gap-2">
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
              Tabriklaymiz! Sizning <strong class="text-indigo-400 font-bold">${this.escapeHtml(planName)}</strong> obunangiz faollashtirildi.
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

          <button onclick="app.closeModal(); window.location.hash='#/tests';" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/20 transition flex items-center justify-center gap-2">
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
        <div class="w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-indigo-500/20 animate-pulse-glow">
          🔒
        </div>

        <div class="space-y-2">
          <span class="px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-300 font-bold text-[10px] uppercase tracking-wider">Faqat PRO A'zolar Uchun</span>
          <h3 class="text-xl font-bold font-heading text-white leading-snug">«${this.escapeHtml(testTitle)}»</h3>
          <p class="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            Ushbu test eksklyuziv PRO bazaga tegishli. Undan foydalanish va Oltin sertifikat olish uchun tarifingizni yangilang.
          </p>
        </div>

        <div class="space-y-2.5 pt-2">
          <a href="#/pricing" onclick="app.closeModal()" class="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition">
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
          <a href="https://t.me/TestPlatform_Support" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold transition whitespace-nowrap shadow-sm">
            @TestPlatform_Support
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
            <a href="#/admin/support" class="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition flex items-center gap-1.5">
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

              <a href="https://t.me/TestPlatform_Support" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20">
                <span class="material-symbols-outlined text-[16px]">send</span>
                <span>Telegram: @TestPlatform_Support</span>
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
        if (t.status === 'Ko\'rib chiqilmoqda') statusBadge = 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30';
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
              <span class="material-symbols-outlined text-indigo-400">mark_email_unread</span>
            </div>
            <div id="admin-sup-new" class="text-2xl font-black text-indigo-400 font-heading">...</div>
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
            <button onclick="app.filterAdminSupport('all')" id="btn-sup-f-all" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-black">Barchasi</button>
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

        <!-- Pagination -->
        <div id="admin-support-pagination" class="hidden px-6 py-4 rounded-2xl glass-panel border border-white/10 flex items-center justify-between gap-3 flex-wrap"></div>
      </div>
    `;

    this._adminSupFilter = 'all';
    await this.loadAdminSupportTickets();
  },

  async loadAdminSupportTickets(page = 1) {
    const container = document.getElementById('admin-support-list');
    const paginationEl = document.getElementById('admin-support-pagination');
    if (!container) return;

    const res = await api('/api/support/all');
    const tickets = (res.success && res.data && Array.isArray(res.data)) ? res.data : [];

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
      if (paginationEl) paginationEl.classList.add('hidden');
      return;
    }

    const PAGE_SIZE = 10;
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    let currentPage = Math.max(1, Math.min(page, totalPages));

    const renderPage = (pg) => {
      currentPage = Math.max(1, Math.min(pg, totalPages));
      const start = (currentPage - 1) * PAGE_SIZE;
      const pageTickets = filtered.slice(start, start + PAGE_SIZE);

      container.innerHTML = pageTickets.map(t => {
        const isResolved = t.status === 'Hal qilindi';
        let statusBadge = isResolved 
          ? '<span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">✅ Hal qilindi</span>'
          : '<span class="px-2.5 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">🔔 Yangi</span>';

        return `
          <div class="glass-panel p-5 sm:p-6 rounded-3xl space-y-4 border ${isResolved ? 'border-white/5 opacity-80' : 'border-indigo-500/30 bg-gradient-to-r from-indigo-950/10 via-[#14161f] to-[#14161f]'}">
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

      if (totalPages > 1 && paginationEl) {
        paginationEl.classList.remove('hidden');

        const startNum = start + 1;
        const endNum = Math.min(start + PAGE_SIZE, filtered.length);
        let pageButtons = '';
        for (let i = 1; i <= totalPages; i++) {
          const isActive = i === currentPage;
          pageButtons += `
            <button onclick="app._adminSupportGoPage(${i})"
              class="w-8 h-8 rounded-lg text-xs font-bold transition ${isActive
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }">
              ${i}
            </button>`;
        }

        paginationEl.innerHTML = `
          <div class="text-xs text-gray-400">
            <span class="text-white font-semibold">${startNum}–${endNum}</span> / ${filtered.length} ta murojaat &nbsp;·&nbsp;
            <span class="text-cyan-400 font-semibold">${currentPage}-qism</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="app._adminSupportGoPage(${currentPage - 1})"
              ${currentPage === 1 ? 'disabled' : ''}
              class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
              <span class="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            ${pageButtons}
            <button onclick="app._adminSupportGoPage(${currentPage + 1})"
              ${currentPage === totalPages ? 'disabled' : ''}
              class="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
              <span class="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        `;
      } else if (paginationEl) {
        paginationEl.classList.add('hidden');
      }
    };

    this._adminSupportGoPage = (pg) => renderPage(pg);
    renderPage(currentPage);
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
          btns[k].className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-black';
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

  deleteSupportTicket(ticketId) {
    this.confirmModal({
      title: "Murojaatni O'chirish",
      message: "Ushbu murojaatni rostdan ham o'chirib tashlamoqchimisiz?",
      confirmText: "O'chirish",
      type: "danger",
      icon: "delete",
      onConfirm: async () => {
        const res = await api(`/api/support/${ticketId}`, { method: 'DELETE' });
        if (res && res.success) {
          showToast('Murojaat muvaffaqiyatli o\'chirildi', 'info');
          app.loadAdminSupportTickets();
        }
      }
    });
  }
};

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => app.init());

