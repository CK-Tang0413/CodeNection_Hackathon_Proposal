// --- ROBOT INTERACTION LOGIC ---
const pupils = document.querySelectorAll('.pupil');
const welcomeBubble = document.getElementById('welcomeSpeechBubble');
let clickCount = 0;
let isDizzy = false;

// Auto-show bubble on page load
setTimeout(() => {
    welcomeBubble.classList.add('active');
    setTimeout(() => welcomeBubble.classList.remove('active'), 3000);
}, 1000);

// Global Eye Tracking (tracks for all robots in carousel)
document.addEventListener('mousemove', (e) => {
    if(isDizzy) return;
    pupils.forEach(pupil => {
        const rect = pupil.parentElement.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const maxDistance = 8;
        pupil.style.transform = `translate(${Math.cos(angle) * maxDistance}px, ${Math.sin(angle) * maxDistance}px)`;
    });
});

// Click detection for all robots
document.querySelectorAll('.robot-wrapper').forEach(robot => {
    robot.addEventListener('click', () => {
        if(isDizzy) return;
        clickCount++;
        
        if(clickCount === 2) {
            welcomeBubble.innerText = "Hey, poking tickles!";
            welcomeBubble.classList.add('active');
            setTimeout(() => welcomeBubble.classList.remove('active'), 2000);
        }
        
        if(clickCount >= 4) {
            isDizzy = true; 
            clickCount = 0; 
            robot.classList.add('dizzy');
            welcomeBubble.innerText = "Ouch, you make me dizzy... 😵‍💫";
            welcomeBubble.classList.add('active');
            
            // Reset pupils during spinning so they stay centered in the orbit
            pupils.forEach(p => p.style.transform = 'translate(0px, 0px)');

            setTimeout(() => {
                robot.classList.remove('dizzy');
                welcomeBubble.innerText = "Phew! Okay, back to work.";
                isDizzy = false;
                setTimeout(() => welcomeBubble.classList.remove('active'), 2500);
            }, 3000);
        }
    });
});

// --- NAVIGATION LOGIC ---
function selectAvatar() {
    const carousel = document.getElementById('avatarCarousel');
    
    // Lock scrolling so they can't swipe away after choosing
    carousel.style.overflowX = 'hidden';
    
    // Hide the 'Pick This' button and show 'Start'
    document.getElementById('pickAvatarBtn').classList.add('hidden');
    document.getElementById('avatarTitle').innerText = "Great choice!";
    document.getElementById('avatarTitle').style.color = "var(--primary)";
    document.getElementById('startSetupBtn').classList.remove('hidden');

    // MAGIC TRICK: Check if they swiped to the yellow robot
    // If they scrolled more than 50px, they are on the second slide
    if (carousel.scrollLeft > 50) {
        document.getElementById('miniCompanion').classList.add('alt-robot');
        document.getElementById('scheduleCompanion').classList.add('alt-robot');
        document.getElementById('surveyCompanion').classList.add('alt-robot');
        document.getElementById('overviewCompanion').classList.add('alt-robot');
        document.getElementById('dashCompanion').classList.add('alt-robot');
        document.getElementById('rebalanceCompanion').classList.add('alt-robot');
        document.getElementById('logCompanion').classList.add('alt-robot');
    } else {
        document.getElementById('miniCompanion').classList.remove('alt-robot');
    }
}

function goTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    // Profile Setup Logic
    if (viewId === 'view-profile-setup') {
        miniMover.classList.remove('sleeping');
        clearTimeout(sleepTimer);
        sleepTimer = setTimeout(putRobotToSleep, 2000);
    }
    
    // NEW: Survey Timer Logic
    if (viewId === 'view-survey') {
        resetSurveyIdleTimer();
    } else {
        // Stop the survey timer if they leave the page
        if (typeof surveyIdleTimer !== 'undefined') {
            clearTimeout(surveyIdleTimer);
        }
    }
}

function launchApp() {
    document.getElementById('appNav').classList.add('active');
    syncProfileData();
    goTo('main-dashboard');
}

function navTo(viewId, btnElement) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    btnElement.classList.add('active');
}

function startRetest() {
    document.getElementById('appNav').classList.remove('active');
    goTo('view-survey');
}

// --- SLEEP & POKE LOGIC ---
let sleepTimer;
const miniMover = document.getElementById('miniCompanionMover');
const miniCompanion = document.getElementById('miniCompanion');

function putRobotToSleep() {
    // Only fall asleep if they are actually on the profile setup page
    if (document.getElementById('view-profile-setup').classList.contains('active')) {
        miniMover.classList.add('sleeping');
    }
}

function pokeRobot() {
    // If the robot is sleeping, wake it up and start the 2-second timer again
    if (miniMover.classList.contains('sleeping')) {
        miniMover.classList.remove('sleeping');
        clearTimeout(sleepTimer);
        sleepTimer = setTimeout(putRobotToSleep, 4000);
    }
}

// Make the mini robot listen for clicks
miniCompanion.addEventListener('click', pokeRobot);


// --- WEEKLY SCHEDULE LOGIC ---
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const scheduleData = {
    Mon: { active: true, class: 3, work: 0, study: 2, expanded: true },
    Tue: { active: true, class: 3, work: 0, study: 2, expanded: false },
    Wed: { active: true, class: 3, work: 0, study: 2, expanded: false },
    Thu: { active: true, class: 3, work: 0, study: 2, expanded: false },
    Fri: { active: true, class: 3, work: 0, study: 2, expanded: false },
    Sat: { active: false, class: 0, work: 0, study: 0, expanded: false },
    Sun: { active: false, class: 0, work: 0, study: 0, expanded: false }
};

function buildScheduleUI() {
    const container = document.getElementById('scheduleAccordion');
    container.innerHTML = ''; // Clear container
    
    daysOfWeek.forEach(day => {
        const data = scheduleData[day];
        const total = data.class + data.work + data.study;
        
        const card = document.createElement('div');
        card.className = `day-card ${data.expanded ? 'expanded' : ''} ${!data.active ? 'inactive' : ''}`;
        card.id = `card-${day}`;
        
        card.innerHTML = `
            <div class="day-header" onclick="toggleDayExpand('${day}')">
                <div class="day-toggle">
                    <input type="checkbox" id="toggle-${day}" ${data.active ? 'checked' : ''} onclick="event.stopPropagation(); toggleDayActive('${day}', this.checked)">
                    <label for="toggle-${day}" class="toggle-label"></label>
                </div>
                <span class="day-name">${day}</span>
                <div class="day-summary">
                    <span class="day-total" id="total-${day}">${data.active ? total + 'h total' : ''}</span>
                    <span class="day-arrow">▼</span>
                </div>
            </div>
            <div class="day-body">
                <div class="hour-row"><span class="dot" style="background: #3b82f6;"></span> Class hours
                    <div class="hour-controls">
                        <button onclick="updateHours('${day}', 'class', -1)">-</button>
                        <span id="${day}-class">${data.class}</span>
                        <button onclick="updateHours('${day}', 'class', 1)">+</button>
                    </div>
                </div>
                <div class="hour-row"><span class="dot" style="background: #a8a29e;"></span> Work / part-time
                    <div class="hour-controls">
                        <button onclick="updateHours('${day}', 'work', -1)">-</button>
                        <span id="${day}-work">${data.work}</span>
                        <button onclick="updateHours('${day}', 'work', 1)">+</button>
                    </div>
                </div>
                <div class="hour-row"><span class="dot" style="background: #84cc16;"></span> Self-study
                    <div class="hour-controls">
                        <button onclick="updateHours('${day}', 'study', -1)">-</button>
                        <span id="${day}-study">${data.study}</span>
                        <button onclick="updateHours('${day}', 'study', 1)">+</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    updateTotalWeeklyHours();
}

function toggleDayExpand(day) {
    if(!scheduleData[day].active) return;
    scheduleData[day].expanded = !scheduleData[day].expanded;
    document.getElementById(`card-${day}`).classList.toggle('expanded');
}

function toggleDayActive(day, isActive) {
    scheduleData[day].active = isActive;
    const card = document.getElementById(`card-${day}`);
    
    if(!isActive) {
        card.classList.add('inactive');
        card.classList.remove('expanded');
        scheduleData[day].expanded = false;
        document.getElementById(`total-${day}`).innerText = '';
    } else {
        card.classList.remove('inactive');
        const total = scheduleData[day].class + scheduleData[day].work + scheduleData[day].study;
        document.getElementById(`total-${day}`).innerText = total + 'h total';
    }
    updateTotalWeeklyHours();
}

function updateHours(day, category, change) {
    let newVal = scheduleData[day][category] + change;
    if(newVal < 0) newVal = 0; // Prevent negative hours
    scheduleData[day][category] = newVal;
    
    document.getElementById(`${day}-${category}`).innerText = newVal;
    
    const total = scheduleData[day].class + scheduleData[day].work + scheduleData[day].study;
    document.getElementById(`total-${day}`).innerText = total + 'h total';
    
    updateTotalWeeklyHours();
}

function updateTotalWeeklyHours() {
    let weeklyTotal = 0;
    let totalClass = 0;
    let totalWork = 0;
    let totalStudy = 0;

    daysOfWeek.forEach(day => {
        if(scheduleData[day].active) {
            totalClass += scheduleData[day].class;
            totalWork += scheduleData[day].work;
            totalStudy += scheduleData[day].study;
        }
    });

    weeklyTotal = totalClass + totalWork + totalStudy;
    document.getElementById('weeklyTotalDisplay').innerText = weeklyTotal;
    
    const robot = document.getElementById('scheduleCompanion');
    const bubble = document.getElementById('scheduleSpeechBubble');
    
    // Short, loving dialogue (all under 10 words)
    if (weeklyTotal >= 45) {
        robot.classList.add('shocked');
        bubble.innerText = "That's a heavier load I ever saw! 🛑"; // 8 words
    } else if (weeklyTotal < 20) {
        robot.classList.remove('shocked');
        bubble.innerText = "Your life seems balanced. Let's improve it! ✨"; // 8 words
    } else {
        robot.classList.remove('shocked');
        
        if (totalClass >= totalWork && totalClass >= totalStudy) {
            bubble.innerText = "Lots of classes! You're expanding your mind. 🧠"; // 8 words
        } else if (totalWork >= totalClass && totalWork >= totalStudy) {
            bubble.innerText = "Balancing work and study. You're doing great! 💼"; // 8 words
        } else {
            bubble.innerText = "Dedicated to self-study! Your hard work shines. 🌱"; // 8 words
        }
    }
}

// Build the UI immediately when the script loads
buildScheduleUI();


// --- BASELINE SURVEY LOGIC ---
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

let surveyIdleTimer;

function promptIdleUser() {
    // Only interrupt if they are actually on the survey view
    if (document.getElementById('view-survey').classList.contains('active')) {
        const bubble = document.getElementById('surveySpeechBubble');
        const robot = document.getElementById('surveyCompanion');
        
        bubble.innerText = "Hey, are you still with me? 👀";
        robot.classList.remove('shocked'); 
        
        // Hide the answer choices and show the "Yes" button
        document.getElementById('surveyAnswerButtons').classList.add('hidden');
        document.getElementById('surveyIdleButton').classList.remove('hidden');
    }
}

function wakeSurveyRobot() {
    const bubble = document.getElementById('surveySpeechBubble');
    
    // Restore the current question text from our array
    bubble.innerText = surveyQuestions[currentQuestionIndex].text;
    
    // Bring back the answer choices and hide the "Yes" button
    document.getElementById('surveyAnswerButtons').classList.remove('hidden');
    document.getElementById('surveyIdleButton').classList.add('hidden');
    
    // Restart the 10-second countdown
    resetSurveyIdleTimer();
}

function resetSurveyIdleTimer() {
    clearTimeout(surveyIdleTimer);
    // Set timer for 10 seconds (10000 milliseconds)
    surveyIdleTimer = setTimeout(promptIdleUser, 10000);
}

function answerSurvey(score) {
    // Stop the idle timer immediately when they click an answer
    clearTimeout(surveyIdleTimer);
    
    surveyTotalScore += score;
    
    const bubble = document.getElementById('surveySpeechBubble');
    const options = document.getElementById('surveyOptions');
    const robot = document.getElementById('surveyCompanion');
    
    // Hide options briefly
    options.style.opacity = '0';
    options.style.pointerEvents = 'none';

    // Robot Reacts to the answer
    if (score === 1 || score === 2) {
        robot.classList.remove('shocked');
        bubble.innerText = "That's a very healthy sign! 🍃";
    } else if (score === 3) {
        robot.classList.remove('shocked');
        bubble.innerText = "Totally normal. We'll keep an eye on it! ⚖️";
    } else {
        robot.classList.add('shocked');
        bubble.innerText = "I hear you. You're not alone in feeling this way. ❤️";
    }

    // Wait 1.8 seconds, then load next question or finish
    setTimeout(() => {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < surveyQuestions.length) {
            // Next Question
            document.getElementById('surveyProgress').innerText = `Question ${currentQuestionIndex + 1} of 10`;
            bubble.innerText = surveyQuestions[currentQuestionIndex].text;
            robot.classList.remove('shocked');
            
            options.style.opacity = '1';
            options.style.pointerEvents = 'auto';
            
            // Start the 10-second countdown for the new question
            resetSurveyIdleTimer();
        } else {
            // Finish Survey - Calculate Risk
            let riskPercentage = Math.round(((surveyTotalScore - 10) / 40) * 100);
            
            // Set dynamic text and colors based on the final score
            let levelText = "Moderate";
            let levelColor = "var(--c-social)"; // Orange color
            let descText = "You are balancing a lot right now. Your Rebalance tab will help you optimize your time and energy.";

            if (riskPercentage >= 70) {
                levelText = "High";
                levelColor = "var(--urgent)";
                descText = "Maintaining a 4.0 CGPA takes immense dedication, but you're carrying a heavy load right now. Your Rebalance tab will be crucial — check it daily.";
            } else if (riskPercentage < 30) {
                levelText = "Low";
                levelColor = "var(--normal)";
                descText = "Your academic life seems well-balanced! Let's use Equilibrium to keep it that way.";
            }

            // Inject the calculated values into the Overview page
            document.getElementById('overviewLevel').innerText = levelText;
            document.getElementById('overviewLevel').style.color = levelColor;
            document.getElementById('overviewScore').innerText = riskPercentage;
            document.getElementById('overviewScore').style.color = levelColor;
            document.getElementById('overviewText').innerText = descText;

            // Fetch the weekly total from the Schedule step
            const weeklyHours = document.getElementById('weeklyTotalDisplay').innerText;
            document.getElementById('overviewHours').innerText = weeklyHours + "h";
            
            // Reset for future tests
            currentQuestionIndex = 0;
            surveyTotalScore = 0;
            options.style.opacity = '1';
            options.style.pointerEvents = 'auto';
            document.getElementById('surveyProgress').innerText = `Question 1 of 10`;
            bubble.innerText = surveyQuestions[0].text;
            
            goTo('view-calendar');
        }
    }, 1800);
}

// --- CALENDAR IMPORT LOGIC ---
function simulateFileUpload() {
    const dropZone = document.getElementById('calendarDropZone');
    
    // Update the drop zone UI to show a successful upload
    dropZone.innerHTML = `
        <span style="font-size: 36px; display: block; margin-bottom: 12px;">📄</span>
        <div style="font-weight: 700; color: var(--primary); margin-bottom: 5px; font-size: 15px;">timetable_2026.ics</div>
        <div style="font-size: 13px; color: var(--normal); font-weight: 600;">File ready to import</div>
    `;
    dropZone.style.borderColor = 'var(--normal)';
    dropZone.style.background = '#f0fdf4'; // Light green background
    
    // Enable the import button
    const btn = document.getElementById('importBtn');
    btn.innerText = 'Import Timetable';
    btn.classList.remove('disabled-btn');
    btn.disabled = false;
    
    // Route to the next page on click
    btn.onclick = () => goTo('view-overview');
}


// --- DASHBOARD LOGIC ---
function launchApp() {
    // Reveal bottom navigation
    document.getElementById('appNav').classList.add('active');
    
    // Transfer the score from the Overview screen to the Dashboard
    const riskScore = document.getElementById('overviewScore').innerText.replace('%', '');
    const dashScore = document.getElementById('dashScore');
    const dashStatus = document.getElementById('dashStatus');
    
    dashScore.innerText = riskScore;
    
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

    goTo('main-dashboard');
}

let dashRobotTimer;
function interactDashRobot() {
    const bubble = document.getElementById('dashSpeechBubble');
    const robot = document.getElementById('dashCompanion');
    
    // Pick a random supportive phrase
    const phrases = [
        "I'm keeping an eye on your load! 📊",
        "Don't forget to take a breather. 🍃",
        "You're doing great today! ✨",
        "Check Rebalance if you feel stuck! ⚡"
    ];
    
    bubble.innerText = phrases[Math.floor(Math.random() * phrases.length)];
    bubble.classList.add('active');
    
    // Wiggle animation for interaction
    robot.classList.add('dizzy');
    
    clearTimeout(dashRobotTimer);
    dashRobotTimer = setTimeout(() => {
        bubble.classList.remove('active');
        robot.classList.remove('dizzy');
    }, 3000);
}


// --- LOG ENTRY & AI LOGIC ---
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

    // 1. Mock AI Category Assignment based on keywords
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

    // 2. Mock AI Urgency Calculation (Combines Deadline proximity + Stress level)
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

    // Store globally for the Confirm step
    pendingTaskData = { 
        name, dateStr, category, catIcon, catColor, catText, urgency, urgColor, urgText 
    };

    // Populate Modal
    document.getElementById('modalTaskName').innerText = name;
    
    const catBadge = document.getElementById('modalCategory');
    catBadge.innerText = `${catIcon} ${category}`;
    catBadge.style.background = catColor; catBadge.style.color = catText;

    const urgBadge = document.getElementById('modalUrgency');
    urgBadge.innerText = urgency;
    urgBadge.style.background = urgColor; urgBadge.style.color = urgText;
    
    document.getElementById('modalDeadline').innerText = dateStr;

    // Show Modal
    document.getElementById('aiConfirmModal').classList.add('active');
}

function closeAiModal() {
    document.getElementById('aiConfirmModal').classList.remove('active');
}

function confirmAndLogTask() {
    const container = document.getElementById('currentLogContainer');
    
    // Create new list item HTML
    const newItem = document.createElement('div');
    newItem.style.cssText = "padding: 12px 0; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;";
    
    newItem.innerHTML = `
        <div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px;">${pendingTaskData.name}</div>
            <span class="tag" style="background: ${pendingTaskData.catColor}; color: ${pendingTaskData.catText}; font-size: 10px;">${pendingTaskData.catIcon} ${pendingTaskData.category}</span>
            <span class="tag" style="background: ${pendingTaskData.urgColor}; color: ${pendingTaskData.urgText}; font-size: 10px;">${pendingTaskData.urgency}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${pendingTaskData.dateStr}</div>
    `;
    
    // Append to list
    container.appendChild(newItem);
    
    // Reset Form & Close Modal
    document.getElementById('taskNameInput').value = '';
    document.getElementById('taskDescInput').value = '';
    document.getElementById('taskStressInput').value = 5;
    document.getElementById('stressDisplay').innerText = '5';
    document.getElementById('taskDateInput').value = '';
    closeAiModal();
}


// --- PROFILE PAGE LOGIC ---

// 1. Build a duplicate accordion AND bar chart specifically for the Profile page
function buildProfileScheduleUI() {
    const accordionContainer = document.getElementById('profileScheduleAccordion');
    const chartContainer = document.getElementById('profileWeeklyChart');
    if (!accordionContainer || !chartContainer) return;
    
    accordionContainer.innerHTML = ''; 
    chartContainer.innerHTML = '';
    
    // Calculate the highest hour day to scale the chart properly (minimum scale of 8 hours)
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
        
        // --- BUILD THE MINI BAR CHART ---
        let heightPct = '3px'; // Default for inactive days
        let bgColor = '#e2e8f0'; // Light grey for inactive
        
        if (data.active && total > 0) {
            heightPct = Math.max((total / maxHours) * 100, 15) + '%';
            bgColor = '#293a34'; // Dark green from your design
        } else if (data.active && total === 0) {
            heightPct = '6px'; // Tiny bump for an active day with 0 hours
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

        // --- BUILD THE ACCORDION ---
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
    
    // Update the total hours number in the profile header
    document.getElementById('profileWeeklyTotal').innerText = weeklyTotal;
}

// Profile Accordion Interactions
function toggleProfileDayExpand(day) {
    if(!scheduleData[day].active) return;
    scheduleData[day].expanded = !scheduleData[day].expanded;
    document.getElementById(`p-card-${day}`).classList.toggle('expanded');
    
    // Sync the original setup accordion so they match perfectly
    document.getElementById(`card-${day}`).className = document.getElementById(`p-card-${day}`).className;
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
    
    buildScheduleUI(); // Sync back to the main setup UI
    buildProfileScheduleUI(); // Re-render this UI to update totals
}

function updateProfileHours(day, category, change) {
    let newVal = scheduleData[day][category] + change;
    if(newVal < 0) newVal = 0;
    scheduleData[day][category] = newVal;
    
    buildScheduleUI(); // Sync back
    buildProfileScheduleUI(); // Re-render
}

// 2. Sync Survey Data to the Profile Page
function syncProfileData() {
    const score = document.getElementById('dashScore').innerText;
    const statusText = document.getElementById('dashStatus').innerText;
    const statusColor = document.getElementById('dashStatus').style.color;
    
    const badge = document.getElementById('profileStressBadge');
    const label = document.getElementById('profileStressLabel');
    const desc = document.getElementById('profileStressDesc');
    
    badge.innerText = score;
    badge.style.color = statusColor;
    label.innerText = statusText;
    label.style.color = statusColor;
    
    if (parseInt(score) >= 70) {
        desc.innerText = "You're already carrying a lot. Your Rebalance tab will be important — check it daily.";
    } else if (parseInt(score) >= 50) {
        desc.innerText = "You have an elevated load. Don't skip your designated rest blocks.";
    } else {
        desc.innerText = "Your baseline is healthy! Let's keep your schedule balanced.";
    }
    
    // Render the accordion when data syncs
    buildProfileScheduleUI();
}