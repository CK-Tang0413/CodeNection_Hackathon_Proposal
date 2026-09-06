// ==========================================
// 1. GLOBAL UTILS & AVATAR LOGIC
// ==========================================
let currentAvatarType = 'robot';

function formatAvatarText(text) {
    if (typeof currentAvatarType === 'undefined') return text;
    if (currentAvatarType === 'cat') return text + " 🐾";
    if (currentAvatarType === 'dog') return text + " 🐶";
    if (currentAvatarType === 'bao') return text + " 🥟";
    return text;
}

function selectAvatar() {
    const carousel = document.getElementById('avatarCarousel');
    carousel.style.overflowX = 'hidden';
    
    document.getElementById('pickAvatarBtn').classList.add('hidden');
    const title = document.getElementById('avatarTitle');
    title.innerText = "Great choice!";
    title.style.color = "var(--primary)";
    document.getElementById('startSetupBtn').classList.remove('hidden');

    const slideWidth = carousel.clientWidth;
    const activeIndex = Math.round(carousel.scrollLeft / slideWidth);
    const types = ['robot', 'bao', 'cat', 'dog'];
    currentAvatarType = types[activeIndex];

    const companions = [
        'miniCompanion', 'scheduleCompanion', 'surveyCompanion', 'overviewCompanion', 
        'dashCompanion', 'rebalanceCompanion', 'logCompanion', 'trendCompanion', 
        'fabCompanion', 'expandedCompanion', 'dashChatCompanion'
    ];
    
    companions.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.classList.remove('avatar-bao', 'avatar-cat', 'avatar-dog');
            if (currentAvatarType !== 'robot') {
                el.classList.add(`avatar-${currentAvatarType}`);
            }
        }
    });
}


// ==========================================
// 2. EYE TRACKING & INTERACTION ANIMATIONS
// ==========================================
const pupils = document.querySelectorAll('.pupil');
const welcomeBubble = document.getElementById('welcomeSpeechBubble');
let clickCount = 0;
let isDizzy = false;

// Auto-show welcome bubble on load
setTimeout(() => {
    if(welcomeBubble) {
        welcomeBubble.classList.add('active');
        setTimeout(() => welcomeBubble.classList.remove('active'), 3000);
    }
}, 1000);

document.addEventListener('mousemove', (e) => {
    if(isDizzy) return;
    pupils.forEach(pupil => {
        if (pupil.closest('#fabCompanion') || 
            pupil.closest('.bao-wrapper, .cat-wrapper, .dog-wrapper') || 
            pupil.closest('.avatar-bao, .avatar-cat, .avatar-dog')) return;

        const rect = pupil.parentElement.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const maxDistance = 8;
        pupil.style.transform = `translate(${Math.cos(angle) * maxDistance}px, ${Math.sin(angle) * maxDistance}px)`;
    });
});

// Sleep & Poke Logic (Profile Setup)
let sleepTimer;
const miniMover = document.getElementById('miniCompanionMover');
const miniCompanion = document.getElementById('miniCompanion');

function putRobotToSleep() {
    if (document.getElementById('view-profile-setup').classList.contains('active')) {
        miniMover.classList.add('sleeping');
    }
}

function pokeRobot() {
    if (miniMover && miniMover.classList.contains('sleeping')) {
        miniMover.classList.remove('sleeping');
        clearTimeout(sleepTimer);
        sleepTimer = setTimeout(putRobotToSleep, 4000);
    }
}

if (miniCompanion) {
    miniCompanion.addEventListener('click', pokeRobot);
}


// ==========================================
// 3. CORE NAVIGATION & ROUTING
// ==========================================
let isRetest = false; 

function goTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    if (viewId === 'view-profile-setup') {
        if (miniMover) miniMover.classList.remove('sleeping');
        clearTimeout(sleepTimer);
        sleepTimer = setTimeout(putRobotToSleep, 2000);
    }

    if (viewId === 'main-dashboard') setTimeout(interactDashRobot, 500);

    const chatWidget = document.getElementById('globalChatWidget');
    if (chatWidget) {
        chatWidget.style.display = (viewId.startsWith('main-') && viewId !== 'main-dashboard') ? 'block' : 'none';
    }
}

function navTo(viewId, btnElement) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    btnElement.classList.add('active');

    if (viewId === 'main-dashboard') setTimeout(interactDashRobot, 500);

    const chatWidget = document.getElementById('globalChatWidget');
    if (chatWidget) {
        chatWidget.style.display = (viewId.startsWith('main-') && viewId !== 'main-dashboard') ? 'block' : 'none';
    }
}

function launchApp() {
    document.getElementById('appNav').classList.add('active');
    const chatWidget = document.getElementById('globalChatWidget');
    if (chatWidget) chatWidget.style.display = 'none'; // starts on main-dashboard
    
    // Transfer risk score from Overview to Dashboard
    const riskScore = document.getElementById('overviewScore').innerText.replace('%', '');
    const dashScore = document.getElementById('dashScore');
    const dashStatus = document.getElementById('dashStatus');
    
    if (dashScore) dashScore.innerText = riskScore;
    
    if (dashStatus) {
        if (parseInt(riskScore) >= 70) {
            dashStatus.innerText = "High Risk";
            dashStatus.style.color = "#ef4444";
        } else if (parseInt(riskScore) >= 50) {
            dashStatus.innerText = "Elevated";
            dashStatus.style.color = "#d97706";
        } else {
            dashStatus.innerText = "Healthy";
            dashStatus.style.color = "#10b981";
        }
    }

    syncProfileData();
    goTo('main-dashboard');
}

function startRetest() {
    isRetest = true; 
    document.getElementById('appNav').classList.remove('active');
    
    const chatWidget = document.getElementById('globalChatWidget');
    if (chatWidget) chatWidget.style.display = 'none';
    
    goTo('view-survey');
}


// ==========================================
// 4. WEEKLY SCHEDULE SETUP
// ==========================================
let weeklyData = { class: 15, work: 10, study: 10, hasWork: false };

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const scheduleData = {
    Mon: { active: true, class: 0, work: 0, study: 0, expanded: false },
    Tue: { active: true, class: 0, work: 0, study: 0, expanded: false },
    Wed: { active: true, class: 0, work: 0, study: 0, expanded: false },
    Thu: { active: true, class: 0, work: 0, study: 0, expanded: false },
    Fri: { active: true, class: 0, work: 0, study: 0, expanded: false },
    Sat: { active: false, class: 0, work: 0, study: 0, expanded: false },
    Sun: { active: false, class: 0, work: 0, study: 0, expanded: false }
};

function toggleWorkUI(isWorking) {
    weeklyData.hasWork = isWorking;
    const controls = document.getElementById('workControls');
    if (controls) controls.style.display = isWorking ? 'block' : 'none';
    updateTotalWeeklyHours();
}

function updateWeekly(category, change) {
    let newVal = weeklyData[category] + change;
    if(newVal < 0) newVal = 0; 
    if(newVal > 80) newVal = 80; 
    
    weeklyData[category] = newVal;
    document.getElementById(`week-${category}`).innerText = newVal;
    updateTotalWeeklyHours();
}

function updateTotalWeeklyHours() {
    let total = weeklyData.class + weeklyData.study;
    if (weeklyData.hasWork) total += weeklyData.work;

    const totalDisplay = document.getElementById('weeklyTotalDisplay');
    if (totalDisplay) totalDisplay.innerText = total;
    
    const bubble = document.getElementById('scheduleSpeechBubble');
    if (bubble) {
        if (total >= 45) {
            bubble.innerText = formatAvatarText("That's a heavy load! 🛑");
        } else if (total < 20) {
            bubble.innerText = formatAvatarText("Lots of free time to optimize! ✨");
        } else {
            if (weeklyData.class > weeklyData.study && weeklyData.class > (weeklyData.hasWork ? weeklyData.work : 0)) {
                bubble.innerText = formatAvatarText("Lots of classes! Expanding your mind. 🧠");
            } else if (weeklyData.hasWork && weeklyData.work >= weeklyData.class) {
                bubble.innerText = formatAvatarText("Balancing work and study. Doing great! 💼");
            } else {
                bubble.innerText = formatAvatarText("Dedicated to self-study! Keep it up. 🌱");
            }
        }
    }
    distributeToDays();
}

function distributeToDays() {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const dailyClass = Math.round(weeklyData.class / 5);
    const dailyWork = weeklyData.hasWork ? Math.round(weeklyData.work / 5) : 0;
    const dailyStudy = Math.round(weeklyData.study / 5);

    weekdays.forEach(day => {
        scheduleData[day].class = dailyClass;
        scheduleData[day].work = dailyWork;
        scheduleData[day].study = dailyStudy;
    });

    if (typeof buildProfileScheduleUI === 'function') buildProfileScheduleUI();
}
updateTotalWeeklyHours();


// ==========================================
// 5. STRESS SURVEY (CHATBOT UI)
// ==========================================
const surveyQuestions = [
    { text: "How often do you feel mentally overwhelmed by academic demands?", category: "Mental" },
    { text: "How often do you feel unable to keep up with your study schedule?", category: "Time" },
    { text: "How often do you skip sleep or exercise because of study pressure?", category: "Physical" },
    { text: "How often do you feel socially drained or withdraw from others?", category: "Social" },
    { text: "How often do daily chores and errands pile up due to lack of time?", category: "Errands" },
    { text: "How often do you find it hard to wind down after studying?", category: "Mental" },
    { text: "How often do you feel anxious about upcoming deadlines?", category: "Time" },
    { text: "How often do you feel physically exhausted by the end of the day?", category: "Physical" },
    { text: "How often do you miss out on social gatherings because of stress?", category: "Social" },
    { text: "How often does managing basic life tasks feel overwhelming?", category: "Errands" }
];

let currentQuestionIndex = 0;
let surveyTotalScore = 0;

function processSurveyAnswer(score) {
    surveyTotalScore += score;
    const bubble = document.getElementById('surveyActiveChatBubble');
    const replies = document.getElementById('surveyQuickReplies');
    const input = document.getElementById('surveyChatInput');

    if (replies) {
        replies.style.opacity = '0.3';
        replies.style.pointerEvents = 'none';
    }
    if (input) {
        input.disabled = true;
        input.value = '';
    }
    if (bubble) bubble.innerText = "...";

    setTimeout(() => {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < surveyQuestions.length) {
            document.getElementById('surveyProgressHeader').innerText = `Question ${currentQuestionIndex + 1} of 10`;
            bubble.innerText = formatAvatarText(surveyQuestions[currentQuestionIndex].text);
            
            if (replies) {
                replies.style.opacity = '1';
                replies.style.pointerEvents = 'auto';
            }
            if (input) input.disabled = false;
        } else {
            finishSurvey(surveyTotalScore);
        }
    }, 600);
}

function handleSurveyEnter(e) {
    if (e.key === 'Enter') submitSurveyInput();
}

function submitSurveyInput() {
    const inputEl = document.getElementById('surveyChatInput');
    if (!inputEl) return;
    
    const inputStr = inputEl.value.toLowerCase().trim();
    if (!inputStr) return;

    let score = 3; 
    if (inputStr.includes('never') || inputStr === '1') score = 1;
    else if (inputStr.includes('rarely') || inputStr === '2') score = 2;
    else if (inputStr.includes('sometimes') || inputStr === '3') score = 3;
    else if (inputStr.includes('often') || inputStr === '4') score = 4;
    else if (inputStr.includes('always') || inputStr === '5') score = 5;

    processSurveyAnswer(score);
}

function finishSurvey(finalScore) {
    let riskPercentage = Math.round(((finalScore - 10) / 40) * 100);
    if (riskPercentage > 100) riskPercentage = 100;
    
    let levelText = "Moderate";
    let levelColor = "var(--c-social)"; 
    let descText = "You are balancing a lot right now. Your Rebalance tab will help you optimize your time and energy.";

    if (riskPercentage >= 70) {
        levelText = "High Risk";
        levelColor = "var(--urgent)";
        descText = "Maintaining your workload takes immense dedication, but you're carrying a heavy load right now. Your Rebalance tab will be crucial — check it daily.";
    } else if (riskPercentage < 30) {
        levelText = "Healthy";
        levelColor = "var(--normal)";
        descText = "Your life seems well-balanced! Let's use Eepii to keep it that way.";
    }

    const overviewLevel = document.getElementById('overviewLevel');
    if (overviewLevel) { overviewLevel.innerText = levelText; overviewLevel.style.color = levelColor; }
    
    const overviewScore = document.getElementById('overviewScore');
    if (overviewScore) { overviewScore.innerText = riskPercentage + "%"; overviewScore.style.color = levelColor; }
    
    const overviewText = document.getElementById('overviewText');
    if (overviewText) overviewText.innerText = descText;

    if (isRetest) {
        isRetest = false;
        goTo('view-overview');
    } else {
        goTo('view-calendar');
    }
}

function skipSurvey() {
    currentQuestionIndex = 10; 
    finishSurvey(46); 
}


// ==========================================
// 6. CALENDAR IMPORT (.ICS)
// ==========================================
let isProfileImport = false;

function startProfileImport() {
    isProfileImport = true;
    document.getElementById('appNav').classList.remove('active');
    goTo('view-calendar');
}

function finishCalendarSetup(hasImported = false) {
    if (isProfileImport) {
        isProfileImport = false;
        document.getElementById('appNav').classList.add('active');
        goTo('main-profile');
    } else {
        const syncBanner = document.getElementById('scheduleSyncBanner');
        const bubble = document.getElementById('scheduleSpeechBubble');

        if (hasImported) {
            weeklyData.class = 15;
            const weekClassEl = document.getElementById('week-class');
            if (weekClassEl) weekClassEl.innerText = '15';
            
            if (syncBanner) {
                syncBanner.className = 'schedule-sync-pill synced';
                syncBanner.innerHTML = '📅 Synced from timetable_2026.ics (15h Class Hours)';
            }
            if (bubble) {
                bubble.innerText = formatAvatarText("Detected 15h of classes from your timetable! Confirm or adjust below. 🧠");
            }
        } else {
            if (syncBanner) {
                syncBanner.className = 'schedule-sync-pill manual';
                syncBanner.innerHTML = '✏️ Manual Entry Mode (No Timetable)';
            }
            if (bubble) {
                bubble.innerText = formatAvatarText("No timetable? No problem! Key in your average weekly hours. ✨");
            }
        }

        updateTotalWeeklyHours();
        goTo('view-schedule-setup');
    }
    
    setTimeout(() => {
        const dropZone = document.getElementById('calendarDropZone');
        if (dropZone) {
            dropZone.innerHTML = `
                <span style="font-size: 36px; display: block; margin-bottom: 12px;">📅</span>
                <div style="font-weight: 700; color: var(--text-dark); margin-bottom: 5px; font-size: 15px;">Drop your .ics file here</div>
                <div style="font-size: 13px; color: var(--text-muted);">or tap to browse files</div>
            `;
            dropZone.style.borderColor = '#cbd5e1';
            dropZone.style.background = 'transparent';
        }
        
        const btn = document.getElementById('importBtn');
        if (btn) {
            btn.innerText = 'Choose a file first';
            btn.classList.add('disabled-btn');
            btn.disabled = true;
            btn.onclick = null;
        }
    }, 500);
}

function simulateFileUpload() {
    const dropZone = document.getElementById('calendarDropZone');
    if(!dropZone) return;
    
    dropZone.innerHTML = `
        <span style="font-size: 36px; display: block; margin-bottom: 12px;">📄</span>
        <div style="font-weight: 700; color: var(--primary); margin-bottom: 5px; font-size: 15px;">timetable_2026.ics</div>
        <div style="font-size: 13px; color: var(--normal); font-weight: 600;">File ready to import (15h classes)</div>
    `;
    dropZone.style.borderColor = 'var(--normal)';
    dropZone.style.background = '#f0fdf4';
    
    const btn = document.getElementById('importBtn');
    if(btn) {
        btn.innerText = 'Next: Confirm Schedule';
        btn.classList.remove('disabled-btn');
        btn.disabled = false;
        btn.onclick = () => finishCalendarSetup(true);
    }
}


// ==========================================
// 7. DASHBOARD & REBALANCE 
// ==========================================
function interactDashRobot() {
    const bubble = document.getElementById('dashSpeechBubble');
    if(!bubble) return;
    
    const phrases = [
        "I'm keeping an eye on your load! 📊",
        "Don't forget to take a breather. 🍃",
        "You're doing great today! ✨",
        "Check Rebalance if you feel stuck! ⚡"
    ];
    bubble.innerText = formatAvatarText(phrases[Math.floor(Math.random() * phrases.length)]);
}

function toggleLoadBreakdown() {
    const breakdown = document.getElementById('loadDistributionBreakdown');
    const chevron = document.getElementById('heroExpandChevron');
    const text = document.getElementById('heroExpandText');
    if (!breakdown) return;

    const isExpanded = breakdown.classList.contains('expanded');
    if (isExpanded) {
        breakdown.classList.remove('expanded');
        if (chevron) chevron.innerHTML = '&#9662;';
        if (text) text.innerText = 'View Load Breakdown';
    } else {
        breakdown.classList.add('expanded');
        if (chevron) chevron.innerHTML = '&#9652;';
        if (text) text.innerText = 'Hide Load Breakdown';
    }
}
window.toggleLoadBreakdown = toggleLoadBreakdown;

function handleDashChatEnter(e) {
    if (e.key === 'Enter') sendDashChatMessage();
}

function handleQuickChip(action) {
    if (action === '5-min breather') {
        respondDashChat("Taking 5 minutes away from screens reduces cognitive fatigue by 28%. Try taking 4 deep breaths or looking 20 feet away! 🍃");
    } else if (action === 'feeling overwhelmed') {
        respondDashChat("I hear you. Let's tackle just ONE small micro-step first, or visit Rebalance for an interleaved recovery block. You've got this! 💙");
    } else if (action === 'prioritize tasks') {
        respondDashChat("Your NLP project is marked Urgent. Focus on a 25-min sprint, then let's shift to Tour Slides after a quick rest! 🎯");
    } else if (action === 'explain score') {
        const score = document.getElementById('dashScore')?.innerText || '61';
        respondDashChat(`Your burnout risk is currently ${score}% (Elevated). Your Mental load is highest at 90%. Tap the top card to view your full 5-axis distribution! 📊`);
    }
}

function sendDashChatMessage() {
    const input = document.getElementById('dashChatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    const bubble = document.getElementById('dashChatSpeechBubble');
    if (bubble) bubble.innerText = "...";

    setTimeout(() => {
        const lower = text.toLowerCase();
        let reply = "";
        if (lower.includes('break') || lower.includes('rest') || lower.includes('tired') || lower.includes('sleep')) {
            reply = "You've been pushing hard! A 15-minute screen-free walk or hydration break will restore your mental sharpness.";
        } else if (lower.includes('stress') || lower.includes('overwhelm') || lower.includes('anxious') || lower.includes('panic')) {
            reply = "Take a slow, deep breath. Focus solely on your next immediate 10-minute task. I'm right here with you.";
        } else if (lower.includes('task') || lower.includes('study') || lower.includes('exam') || lower.includes('work') || lower.includes('schedule')) {
            reply = "I've structured your flow with active recovery blocks. Clearing urgent tasks before 3 PM gives you a peaceful evening.";
        } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
            reply = "Hey there! Ready to keep your schedule and stress in harmony today?";
        } else {
            const defaults = [
                "Noted! Keeping your energy balanced is our top priority today.",
                "Great insight. Remember to check your Rebalance timeline for recovery intervals!",
                "I've updated your daily recommendations. One steady step at a time!",
                "That sounds manageable! Let's pace ourselves steadily throughout the day."
            ];
            reply = defaults[Math.floor(Math.random() * defaults.length)];
        }
        if (bubble) bubble.innerText = formatAvatarText(reply);
    }, 500);
}

function respondDashChat(reply) {
    const bubble = document.getElementById('dashChatSpeechBubble');
    if (bubble) {
        bubble.innerText = "...";
        setTimeout(() => {
            bubble.innerText = formatAvatarText(reply);
        }, 300);
    }
}

function interactDashChatCompanion() {
    const phrases = [
        "I'm keeping your day balanced! ✨",
        "Deep breath in... and slow breath out. 🍃",
        "Don't forget to hydrate! 💧",
        "Tap the top card if you want to inspect your 5-axis load breakdown! 📊"
    ];
    respondDashChat(phrases[Math.floor(Math.random() * phrases.length)]);
}

function toggleTask(cardElement) {
    cardElement.classList.toggle('completed');
    
    if (cardElement.classList.contains('completed')) {
        const isUrgent = cardElement.innerHTML.includes('#fee2e2'); 
        if (isUrgent) {
            const bubble = document.getElementById('rebalanceSpeechBubble');
            if (bubble) bubble.innerText = formatAvatarText("Huge win! Great job clearing that deadline.");
        }
    }
}


// ==========================================
// 8. LOG LOAD & AI MODAL
// ==========================================
let pendingTaskData = {};

function analyzeAndShowModal() {
    const name = document.getElementById('taskNameInput').value;
    const desc = document.getElementById('taskDescInput').value;
    const stress = parseInt(document.getElementById('taskStressInput').value);
    const dateStr = document.getElementById('taskDateInput').value;

    if (!name || !dateStr) {
        alert("Please enter a task name and deadline.");
        return;
    }

    let category = "Time"; 
    let catColor = "#e2e8f0"; let catText = "#475569"; let catIcon = "⏱️";
    const textToAnalyze = (name + " " + desc).toLowerCase();

    if (textToAnalyze.includes('study') || textToAnalyze.includes('exam') || textToAnalyze.includes('code')) {
        category = "Mental"; catColor = "#dbeafe"; catText = "#1e40af"; catIcon = "🧠";
    } else if (textToAnalyze.includes('walk') || textToAnalyze.includes('gym') || textToAnalyze.includes('sport')) {
        category = "Physical"; catColor = "#dcfce7"; catText = "#15803d"; catIcon = "💪";
    } else if (textToAnalyze.includes('friend') || textToAnalyze.includes('party') || textToAnalyze.includes('club')) {
        category = "Social"; catColor = "#ffedd5"; catText = "#c2410c"; catIcon = "👥";
    } else if (textToAnalyze.includes('laundry') || textToAnalyze.includes('groceries') || textToAnalyze.includes('clean')) {
        category = "Errands"; catColor = "#f3f4f6"; catText = "#374151"; catIcon = "🛒";
    }

    let urgency = "Normal";
    let urgColor = "#fef3c7"; let urgText = "#b45309";
    
    const today = new Date();
    const deadline = new Date(dateStr);
    const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 2 || stress >= 8) {
        urgency = "Urgent"; urgColor = "#fee2e2"; urgText = "#b91c1c";
    } else if (daysUntil > 7 && stress < 5) {
        urgency = "Low"; urgColor = "#e2e8f0"; urgText = "#475569";
    }

    pendingTaskData = { name, dateStr, stress, category, catIcon, catColor, catText, urgency, urgColor, urgText };

    document.getElementById('modalTaskName').innerText = name;
    
    const catBadge = document.getElementById('modalCategory');
    catBadge.innerText = `${catIcon} ${category}`;
    catBadge.style.background = catColor; catBadge.style.color = catText;

    const urgBadge = document.getElementById('modalUrgency');
    urgBadge.innerText = urgency;
    urgBadge.style.background = urgColor; urgBadge.style.color = urgText;
    
    document.getElementById('modalDeadline').innerText = dateStr;
    document.getElementById('aiConfirmModal').classList.add('active');
}

function closeAiModal() {
    document.getElementById('aiConfirmModal').classList.remove('active');
}

function openLogBottomSheet() {
    const overlay = document.getElementById('logBottomSheetOverlay');
    if (overlay) overlay.classList.add('active');
}

function closeLogBottomSheet() {
    const overlay = document.getElementById('logBottomSheetOverlay');
    if (overlay) overlay.classList.remove('active');
}

function handleBottomSheetBackdrop(e) {
    if (e.target.id === 'logBottomSheetOverlay') {
        closeLogBottomSheet();
    }
}

function triggerLogFromNav(btnElement) {
    const rebalanceBtn = document.getElementById('nav-rebalance');
    navTo('main-rebalance', rebalanceBtn || btnElement);
    setTimeout(openLogBottomSheet, 150);
}

function confirmAndLogTask() {
    const timeline = document.getElementById('smartTimeline');
    
    if (timeline) {
        const isUrgent = pendingTaskData.urgency === 'Urgent';
        const markerClass = isUrgent ? 'task-urgent' : 'task-normal';
        const tagBg = isUrgent ? '#fee2e2' : '#e2e8f0';
        const tagColor = isUrgent ? '#b91c1c' : '#475569';

        // 1. Insert the main task event
        const taskEvent = document.createElement('div');
        taskEvent.className = 'timeline-event';
        taskEvent.innerHTML = `
            <div class="event-time">Just Added</div>
            <div class="event-marker ${markerClass}"></div>
            <div class="event-card task-card" onclick="toggleTask(this)">
                <div class="event-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="tag" style="background: ${tagBg}; color: ${tagColor};">${pendingTaskData.catIcon} ${pendingTaskData.category}</span>
                    <div class="custom-checkbox"></div>
                </div>
                <div class="event-title">${pendingTaskData.name}</div>
                <div class="event-desc">Due ${pendingTaskData.dateStr} • AI-Assessed (${pendingTaskData.urgency})</div>
            </div>
        `;
        timeline.appendChild(taskEvent);

        // 2. If task is urgent or high stress, automatically interleave active recovery
        if (isUrgent || pendingTaskData.stress >= 7) {
            const recoveryEvent = document.createElement('div');
            recoveryEvent.className = 'timeline-event';
            recoveryEvent.innerHTML = `
                <div class="event-time">+45 Mins</div>
                <div class="event-marker activity-recovery"></div>
                <div class="event-card recovery-card" onclick="toggleTask(this)">
                    <div class="event-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="tag" style="background: #dcfce7; color: #15803d;">🍃 AI Rebalance</span>
                        <div class="custom-checkbox"></div>
                    </div>
                    <div class="event-title">Active Screen Break & Hydration</div>
                    <div class="event-desc">15 Mins • Offsetting high cognitive load</div>
                </div>
            `;
            timeline.appendChild(recoveryEvent);
        }

        // Scroll newly added task into view smoothly
        taskEvent.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Companion reaction on Rebalance screen
    const bubble = document.getElementById('rebalanceSpeechBubble');
    if (bubble) {
        bubble.innerText = formatAvatarText("I've scheduled this into your flow with a recovery break! ✨");
    }

    // Reset input fields
    document.getElementById('taskNameInput').value = '';
    document.getElementById('taskDescInput').value = '';
    document.getElementById('taskStressInput').value = 5;
    document.getElementById('stressDisplay').innerText = '5';
    document.getElementById('taskDateInput').value = '';

    // Close modal and bottom sheet
    closeAiModal();
    closeLogBottomSheet();
}


// ==========================================
// 9. PROFILE PAGE & DATA SYNC
// ==========================================
function buildProfileScheduleUI() {
    const accordionContainer = document.getElementById('profileScheduleAccordion');
    const chartContainer = document.getElementById('profileWeeklyChart');
    if (!accordionContainer || !chartContainer) return;
    
    accordionContainer.innerHTML = ''; 
    chartContainer.innerHTML = '';
    
    let maxHours = 8;
    daysOfWeek.forEach(day => {
        if(scheduleData[day].active) {
            const total = scheduleData[day].class + scheduleData[day].work + scheduleData[day].study;
            if (total > maxHours) maxHours = total;
        }
    });

    let weeklyTotal = 0;

    daysOfWeek.forEach(day => {
        const data = scheduleData[day];
        const total = data.active ? (data.class + data.work + data.study) : 0;
        if (data.active) weeklyTotal += total;
        
        let heightPct = '3px'; 
        let bgColor = '#e2e8f0'; 
        
        if (data.active && total > 0) {
            heightPct = Math.max((total / maxHours) * 100, 15) + '%';
            bgColor = '#293a34'; 
        } else if (data.active && total === 0) {
            heightPct = '6px'; 
            bgColor = '#293a34';
        }

        const barColumn = document.createElement('div');
        barColumn.style.cssText = "display: flex; flex-direction: column; align-items: center; flex: 1;";
        barColumn.innerHTML = `
            <div style="width: 100%; height: 25px; display: flex; align-items: flex-end; margin-bottom: 8px;">
                <div style="width: 100%; background: ${bgColor}; height: ${heightPct}; border-radius: 4px; transition: height 0.3s ease;"></div>
            </div>
            <div style="font-size: 9px; font-weight: 700; color: ${data.active ? 'var(--text-dark)' : 'var(--text-muted)'};">${day}</div>
        `;
        chartContainer.appendChild(barColumn);

        const card = document.createElement('div');
        card.className = `day-card ${data.expanded ? 'expanded' : ''} ${!data.active ? 'inactive' : ''}`;
        card.id = `p-card-${day}`; 
        
        card.innerHTML = `
            <div class="day-header" onclick="toggleProfileDayExpand('${day}')">
                <div class="day-toggle">
                    <input type="checkbox" id="p-toggle-${day}" ${data.active ? 'checked' : ''} onclick="event.stopPropagation(); toggleProfileDayActive('${day}', this.checked)">
                    <label for="p-toggle-${day}" class="toggle-label"></label>
                </div>
                <span class="day-name">${day}</span>
                <div class="day-summary">
                    <span class="day-total" id="p-total-${day}">${data.active ? total + 'h total' : ''}</span>
                    <span class="day-arrow">▼</span>
                </div>
            </div>
            <div class="day-body">
                <div class="hour-row"><span class="dot" style="background: #3b82f6;"></span> Class hours
                    <div class="hour-controls">
                        <button onclick="updateProfileHours('${day}', 'class', -1)">-</button>
                        <span id="p-${day}-class">${data.class}</span>
                        <button onclick="updateProfileHours('${day}', 'class', 1)">+</button>
                    </div>
                </div>
                <div class="hour-row"><span class="dot" style="background: #a8a29e;"></span> Work / part-time
                    <div class="hour-controls">
                        <button onclick="updateProfileHours('${day}', 'work', -1)">-</button>
                        <span id="p-${day}-work">${data.work}</span>
                        <button onclick="updateProfileHours('${day}', 'work', 1)">+</button>
                    </div>
                </div>
                <div class="hour-row"><span class="dot" style="background: #84cc16;"></span> Self-study
                    <div class="hour-controls">
                        <button onclick="updateProfileHours('${day}', 'study', -1)">-</button>
                        <span id="p-${day}-study">${data.study}</span>
                        <button onclick="updateProfileHours('${day}', 'study', 1)">+</button>
                    </div>
                </div>
            </div>
        `;
        accordionContainer.appendChild(card);
    });
    
    document.getElementById('profileWeeklyTotal').innerText = weeklyTotal;
}

function toggleProfileDayExpand(day) {
    if(!scheduleData[day].active) return;
    scheduleData[day].expanded = !scheduleData[day].expanded;
    document.getElementById(`p-card-${day}`).classList.toggle('expanded');
}

function toggleProfileDayActive(day, isActive) {
    scheduleData[day].active = isActive;
    const card = document.getElementById(`p-card-${day}`);
    
    if(!isActive) {
        card.classList.add('inactive');
        card.classList.remove('expanded');
        scheduleData[day].expanded = false;
        document.getElementById(`p-total-${day}`).innerText = '';
    } else {
        card.classList.remove('inactive');
        const total = scheduleData[day].class + scheduleData[day].work + scheduleData[day].study;
        document.getElementById(`p-total-${day}`).innerText = total + 'h total';
    }
    
    buildProfileScheduleUI(); 
}

function updateProfileHours(day, category, change) {
    let newVal = scheduleData[day][category] + change;
    if(newVal < 0) newVal = 0;
    scheduleData[day][category] = newVal;
    buildProfileScheduleUI();
}

function syncProfileData() {
    const dashScoreEl = document.getElementById('dashScore');
    const dashStatusEl = document.getElementById('dashStatus');
    if(!dashScoreEl || !dashStatusEl) return;

    const score = dashScoreEl.innerText;
    const statusText = dashStatusEl.innerText;
    const statusColor = dashStatusEl.style.color;
    
    const badge = document.getElementById('profileStressBadge');
    const label = document.getElementById('profileStressLabel');
    const desc = document.getElementById('profileStressDesc');
    
    if(badge) { badge.innerText = score; badge.style.color = statusColor; }
    if(label) { label.innerText = statusText; label.style.color = statusColor; }
    
    if(desc) {
        if (parseInt(score) >= 70) {
            desc.innerText = "You're already carrying a lot. Your Rebalance tab will be important — check it daily.";
        } else if (parseInt(score) >= 50) {
            desc.innerText = "You have an elevated load. Don't skip your designated rest blocks.";
        } else {
            desc.innerText = "Your baseline is healthy! Let's keep your schedule balanced.";
        }
    }
    buildProfileScheduleUI();
}


// ==========================================
// 10. TRENDS & CHARTS
// ==========================================
let isThisWeek = true;

function switchWeek(direction) {
    const title = document.getElementById('trendWeekTitle');
    const dateStr = document.getElementById('trendWeekDate');
    const avg = document.getElementById('trendAvg');
    const peak = document.getElementById('trendPeak');
    const top = document.getElementById('trendTop');

    if (direction === 'prev' && isThisWeek) {
        isThisWeek = false;
        title.innerText = "Last week";
        dateStr.innerText = "Aug 23 – Aug 29";
        avg.innerText = "45%"; peak.innerText = "Tue"; top.innerText = "Mental";
        document.querySelector('.dot.active').nextElementSibling.classList.add('active');
        document.querySelector('.dot').classList.remove('active');
    } else if (direction === 'next' && !isThisWeek) {
        isThisWeek = true;
        title.innerText = "This week";
        dateStr.innerText = "Aug 30 – Sep 5";
        avg.innerText = "60%"; peak.innerText = "Thu"; top.innerText = "Social";
        document.querySelector('.dot').classList.add('active');
        document.querySelectorAll('.dot')[1].classList.remove('active');
    }
}

function toggleTrendView(viewType) {
    const btnSingle = document.getElementById('btnSingleCat');
    const btnAll = document.getElementById('btnAllCat');
    const filters = document.getElementById('trendFilters');
    const allLabel = document.getElementById('trendAllLabel');
    const chartSingle = document.getElementById('chartSingle');
    const chartAll = document.getElementById('chartAll');
    const legend = document.getElementById('trendLegend');

    if (viewType === 'single') {
        btnSingle.classList.add('active'); btnAll.classList.remove('active');
        filters.style.display = 'flex'; allLabel.style.display = 'none';
        chartSingle.style.display = 'block'; chartAll.style.display = 'none'; legend.style.display = 'none';
    } else {
        btnAll.classList.add('active'); btnSingle.classList.remove('active');
        filters.style.display = 'none'; allLabel.style.display = 'block';
        chartSingle.style.display = 'none'; chartAll.style.display = 'block'; legend.style.display = 'flex';
    }
}

const trendDataMap = {
    'Overall': { color: '#293a34', bg: 'rgba(41, 58, 52, 0.1)', pts: [85, 55, 30, 35, 15, 22, 45] },
    'Mental':  { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', pts: [105, 55, 60, 65, 55, 25, 55] },
    'Time':    { color: '#0f766e', bg: 'rgba(15, 118, 110, 0.1)', pts: [85, 75, 80, 75, 15, 52, 85] },
    'Physical':{ color: '#84cc16', bg: 'rgba(132, 204, 22, 0.1)', pts: [110, 95, 60, 45, 45, 82, 105] },
    'Social':  { color: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)', pts: [95, 85, 30, 30, 30, 35, 40] },
    'Errands': { color: '#a16207', bg: 'rgba(161, 98, 7, 0.1)',  pts: [115, 75, 20, 65, 45, 22, 35] }
};

function setTrendCategory(catName, btnElement) {
    document.querySelectorAll('.trend-filter').forEach(btn => {
        btn.style.background = '#f1f5f9';
        btn.style.color = '#64748b';
        btn.classList.remove('active');
    });
    
    const data = trendDataMap[catName];
    btnElement.style.background = data.color;
    btnElement.style.color = 'white';
    btnElement.classList.add('active');

    const xCoords = [20, 70, 120, 170, 220, 270, 300]; 
    const pts = data.pts;
    
    let polylineStr = "";
    let polygonStr = `20,115 `; 
    
    const circles = document.querySelectorAll('.singleChartPoint');
    
    for(let i=0; i<xCoords.length; i++) {
        polylineStr += `${xCoords[i]},${pts[i]} `;
        polygonStr += `${xCoords[i]},${pts[i]} `;
        
        if(i < circles.length) {
            circles[i].setAttribute('cy', pts[i]);
            circles[i].setAttribute('stroke', data.color);
        }
    }
    polygonStr += `300,115`; 

    const line = document.getElementById('singleChartLine');
    line.setAttribute('points', polylineStr.trim());
    line.setAttribute('stroke', data.color);
    
    const area = document.getElementById('singleChartArea');
    area.setAttribute('points', polygonStr.trim());
    area.setAttribute('fill', data.bg);
}


// ==========================================
// 11. GLOBAL AI CHAT WIDGET
// ==========================================
function toggleGlobalChat() {
    const overlay = document.getElementById('chatOverlay');
    if(overlay) overlay.classList.toggle('active');
}

function handleChatEnter(e) {
    if (e.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('globalChatInput');
    const bubble = document.getElementById('activeChatBubble');
    if(!input || !bubble) return;

    const text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    bubble.innerText = "...";
    
    setTimeout(() => {
        const replies = [
            "I logged that for you! Check your schedule.",
            "That sounds like a heavy cognitive load. Remember to take a break after.",
            "I'm updating your trends now. You're doing great!",
            "Got it! Let's keep your day balanced."
        ];
        bubble.innerText = formatAvatarText(replies[Math.floor(Math.random() * replies.length)]);
    }, 800);
}