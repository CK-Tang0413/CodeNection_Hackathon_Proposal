const categories = [
    { id: 'mental', name: 'Mental', icon: '🧠', color: '#a29bfe' },
    { id: 'time', name: 'Time', icon: '⏱️', color: '#74b9ff' },
    { id: 'physical', name: 'Physical', icon: '💪', color: '#ff7675' },
    { id: 'social', name: 'Social', icon: '👥', color: '#fdcb6e' },
    { id: 'errands', name: 'Errands', icon: '🛍️', color: '#55efc4' }
];

let currentStep = 0;
let isProcessing = false;

const root = document.documentElement;
const slider = document.getElementById('loadSlider');
const sliderFill = document.getElementById('sliderFill');
const scoreDisplay = document.getElementById('scoreDisplay');
const speechBubble = document.getElementById('speechBubble');
const globalRobot = document.getElementById('global-robot');
const pupils = document.querySelectorAll('.pupil');

updateQuestionUI();

slider.addEventListener('input', (e) => {
    const val = e.target.value;
    scoreDisplay.innerText = `${val}/10`;
    sliderFill.style.width = `${((val - 1) / 9) * 100}%`;
});

function updateQuestionUI() {
    const cat = categories[currentStep];
    document.getElementById('stepIndicator').innerText = `Step ${currentStep + 1} of 5`;
    document.getElementById('catIcon').innerText = cat.icon;
    document.getElementById('catName').innerText = cat.name;
    speechBubble.innerText = `How is your ${cat.name} load today?`;
    
    root.style.setProperty('--current-cat-color', cat.color);
    slider.value = 5;
    scoreDisplay.innerText = '5/10';
    sliderFill.style.width = '44.4%'; 
    speechBubble.classList.add('active');
}

function submitScore() {
    if(isProcessing) return;
    isProcessing = true;
    const score = parseInt(slider.value);
    
    if (score >= 8) {
        globalRobot.classList.add('shocked');
        speechBubble.innerText = `Whoa, ${score}/10?! That is super heavy. I'll note that.`;
    } else if (score <= 4) {
        globalRobot.classList.add('happy');
        speechBubble.innerText = `Awesome! ${score}/10 means you are doing great!`;
    } else {
        speechBubble.innerText = `Got it. ${score}/10 is manageable.`;
    }

    setTimeout(() => {
        globalRobot.classList.remove('shocked', 'happy');
        currentStep++;
        
        if (currentStep < categories.length) {
            updateQuestionUI();
            isProcessing = false;
        } else {
            triggerDiveTransition();
        }
    }, 2500); 
}

function triggerDiveTransition() {
    speechBubble.innerText = "Hold on tight! Jumping to your dashboard! 🌪️";
    
    setTimeout(() => {
        // 1. Sucked into the swirl (UI + Robot)
        globalRobot.className = "robot-wrapper loc-swirl-in";
        document.getElementById('view-checkin').classList.add('view-suck-in');
        
        setTimeout(() => {
            // 2. Switch Views behind the scenes
            switchView('view-dashboard', document.querySelectorAll('.nav-item')[1]);
            document.getElementById('view-checkin').classList.remove('view-suck-in'); // Reset for later
            
            // 3. Thrown out to the Dashboard (UI + Robot)
            const dashboard = document.getElementById('view-dashboard');
            dashboard.classList.add('view-throw-out');
            globalRobot.className = "robot-wrapper loc-swirl-out";
            
            // 4. Cleanup animation classes so manual navigation isn't broken
            setTimeout(() => {
                dashboard.classList.remove('view-throw-out');
                globalRobot.className = "robot-wrapper loc-dashboard";
                
                // Reset checkin for next time
                currentStep = 0; 
                updateQuestionUI();
                isProcessing = false;
            }, 1000); // Matches the 1s throw-out animation

        }, 1000); // Matches the 1s suck-in animation
    }, 2000);
}

// --- Navigation Logic ---
function switchView(viewId, navElement) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    navElement.classList.add('active');

    if (viewId === 'view-checkin') {
        globalRobot.className = 'robot-wrapper loc-checkin';
        globalRobot.style.setProperty('--s', '1'); 
    } else {
        globalRobot.className = 'robot-wrapper loc-dashboard';
        globalRobot.style.setProperty('--s', '0.35'); 
    }
}

function goToRebalance() {
    switchView('view-rebalance', document.querySelectorAll('.nav-item')[2]);
}

// --- Eye Tracking & Interaction ---
let clickCount = 0;
let isDizzy = false;

document.addEventListener('mousemove', (e) => {
    if(isDizzy || globalRobot.classList.contains('shocked')) return; 
    
    pupils.forEach(pupil => {
        const rect = pupil.parentElement.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const maxDistance = 8; 
        pupil.style.transform = `translate(${Math.cos(angle) * maxDistance}px, ${Math.sin(angle) * maxDistance}px)`;
    });
});

globalRobot.addEventListener('click', () => {
    if(isDizzy) return; 
    clickCount++;
    
    if(clickCount >= 4) {
        isDizzy = true; clickCount = 0; 
        globalRobot.classList.add('dizzy');
        
        if(document.getElementById('view-checkin').classList.contains('active')) {
            speechBubble.innerText = "Ouch, you make me dizzy... 😵‍💫";
            speechBubble.classList.add('active');
        }
        pupils.forEach(p => p.style.transform = 'translate(0px, 0px)');

        setTimeout(() => {
            globalRobot.classList.remove('dizzy');
            isDizzy = false;
            if(document.getElementById('view-checkin').classList.contains('active')) {
                speechBubble.innerText = `Okay, back to your ${categories[currentStep].name} score!`;
            }
        }, 3000);
    }
});