# Eepii by UniSphere 🤖🍃

**Team:** Tang Chee Kin, Timothy Ng Chong Sheng, Sylvester Ng Jun Hong, Wan Hon Kit  
**Problem Statement:** Stress & Workload Manager  
**Video Presentation:** [Watch on YouTube](https://youtu.be/QxtD0KRqEEU)  
**Presentation Slides:** [CodeNection 2026 Pitching.pptx](https://cloudmails-my.sharepoint.com/:p:/g/personal/tp075642_mail_apu_edu_my/IQCdyNTGn2pISLup9xYc7hXnATHeIXdB6DX9ZVqbzOnE8EA?e=lGPjUp)  

---

## 1. Project Overview
<div align="justify">
Modern university students face an escalating mental health crisis driven by invisible workload accumulation. Lectures, heavy assignments, extracurriculars, and basic life errands pile up concurrently. Standard productivity tools and calendars are clinical and intimidating; they track when something is due, but entirely fail to measure the cognitive load and stress required to get there. Ambitious students don't need another app yelling at them about missed deadlines—they need a system that understands their baseline stress and helps them optimize their rest just as much as their work.

Eepii is not a to-do list; it is a cognitive load balancer. The drive to build this came directly from our own experiences navigating rigorous degree programs and striving for top academic performance. We realized that the pressure of maintaining a high CGPA compounds over time, regardless of the discipline. Whether a student is debugging complex code, writing a massive research paper, designing a portfolio, or balancing internships and part-time jobs alongside their studies, cognitive fatigue is universal. Eepii is built to actively intercept burnout triggers across all these intersecting facets of life, adapting dynamically to whoever is using it.
</div>

---

## 2. Ideation & Process
### 2.1 Ideas We Considered

| Idea | Why it was dropped / kept |
| :--- | :--- |
| **Eepii: Emotionally Intelligent Load Balancer (Chosen)** | **Kept:** It directly addresses the root causes of academic burnout—cognitive overload and isolation. By using AI to automatically interleave active recovery blocks based on task weight and providing a responsive companion, it removes scheduling friction and offers real-time emotional validation. |
| **Standard Pomodoro Timer (Discarded)** | **Discarded:** Too rigid. It relies on fixed 25-minute intervals that completely ignore the user's actual mental fatigue. It assumes all tasks require the exact same cognitive energy, which is ineffective for varied university workloads. |
| **Manual Time Blocking App (Discarded)** | **Discarded:** High user friction. Forcing an already overwhelmed student to manually estimate and schedule every minute of their day induces more anxiety. When a user falls behind on one task, rigid blocks cascade into missed deadlines, visually compounding their stress. |

### 2.2 Ideation Boards
**UniSphere – Eepii Mind Map:** [View on Miro](https://miro.com/app/board/uXjVHngjMgE=/?share_link_id=790770956201)

<img width="100%" alt="Eepii_ Student Burnout Prevention (2)" src="https://github.com/user-attachments/assets/1a61a8ab-935c-4b0b-ba0a-325aa67f4ecf" />
*Figure 2.2.1: UniSphere – Eepii Project Mindmap*

<img width="100%" alt="Eepii_ Student Burnout Prevention" src="https://github.com/user-attachments/assets/0707f7eb-122b-44c2-a3d9-5d0be1b528f6" />
*Figure 2.2.2: UniSphere’s Brainstorming Ideas*

<img width="100%" alt="Eepii_ Student Burnout Prevention (1)" src="https://github.com/user-attachments/assets/a4686442-09e9-45d9-987d-59f34be04edf" />
*Figure 2.2.3: Mentorship & Pivots Session*

### 2.3 Mentor Consultation

| Date | Mentor | Feedback Received | What Was Changed |
| :--- | :--- | :--- | :--- |
| **Sept 3, 2026** | **Khor Jia Quan** | **Simplify Onboarding:** The initial setup contained too many manual steps. Advised to keep the design concise and heavily utilize the chatbot. <br><br> **Streamline Navigation & Consolidate Views:** Instructed to merge the standalone "Dashboard" and "Trends" sections. Statistics must be visible in a unified interface to minimize screen switching and friction. <br><br> **LLM Integration:** Recommended implementing an LLM (via OpenRouter/Gemini) to perform sentiment analysis, refine wordy user inputs, and quantify stress levels dynamically rather than relying on manual user toggles. <br><br> **Value Proposition:** Emphasized the need to clearly define the specific impact on students to anchor the final video pitch. | - Redesigned the user flow to feature a conversational, chatbot-centric onboarding survey. <br> - Consolidated the UI to feed daily metrics and 7-day historical trends into a cohesive profile/dashboard flow. <br> - Integrated the AI API into the FastAPI backend to parse natural language task logs into actionable JSON data (Category and Urgency). |
| **Sept 9, 2026** | **Marcus Mah Qing Fung** | **Interface design:** Instead of green and white, try to switch to another color. <br><br> **Burnout risk percentage:** No point of providing the specific numeric as users need a description or explanation to know why we get the value output. <br><br> **Companion double click interaction:** Convert the interaction into something meaningful to user. | - Change the color theme selected for our prototype. <br> - Minor changes on the risk score can be clickable and companion will explain what does the user’s risk score mean. <br> - Added a few click interactions for the companion that is meaningful. |

---

## 3. Design & Prototype

**UI Prototype (Live Demo):** [https://eepii.vercel.app/](https://eepii.vercel.app/)

<div align="center">
  <img src="https://github.com/user-attachments/assets/31d56c27-8377-4b03-9911-1472f52a9e28" alt="Onboarding Experience" width="250" />
  <p><i><b>Onboarding Experience:</b> Users swipe through a carousel to select their emotionally intelligent AI companion, instantly establishing a supportive connection rather than a sterile setup.</i></p>
  
  <br>
  
  <img src="https://github.com/user-attachments/assets/d652c81a-c14e-4def-b40e-5765c83db469" alt="Frictionless Setup" width="250" />
  <p><i><b>Frictionless Setup:</b> Users drop their university .ics timetable directly into the app, allowing Eepii's AI to automatically calculate their baseline academic load without manual data entry.</i></p>
  
  <br>
  
  <img src="https://github.com/user-attachments/assets/74d2664c-34c1-442d-aae1-fd39903cb25a" alt="Live Dashboard" width="250" />
  <p><i><b>Live Dashboard:</b> The app calculates a real-time burnout risk score. The Eepii’s companion reacts visually to this stress level, providing empathetic visual validation.</i></p>
  
  <br>
  
  <img src="https://github.com/user-attachments/assets/8ea61e52-a77f-4295-92ed-c85d6c81abf4" alt="Task Assessment" width="250" />
  <p><i><b>Task Assessment:</b> When logging a new assignment, users input their estimated stress. The backend AI parses the text to categorize the task's cognitive weight and urgency.</i></p>
  
  <br>
  
  <img src="https://github.com/user-attachments/assets/7f1b4544-5f7d-49f0-8027-6471c957443b" alt="Smart Auto-Interleaving" width="250" />
  <p><i><b>Smart Auto-Interleaving:</b> Instead of just listing deadlines, Eepii automatically injects "Active Recovery Blocks" (e.g., a 15-minute screen break) directly after heavy cognitive tasks to prevent burnout.</i></p>
  
  <br>
  
  <img src="https://github.com/user-attachments/assets/1c510f6b-1fe1-44e3-be63-5c19e954f13b" alt="Active Intervention" width="250" />
  <p><i><b>Active Intervention:</b> Clicking a recovery block triggers a guided 4-second inhale/exhale widget, physically calming the user's nervous system before their next deep work session.</i></p>
</div>

---

## 4. What Makes It Different

*   **Empathetic Companion UI:** Replaces cold dashboards with an animated companion (Robot, Bao, Cat, or Dog). The app utilizes a modern, full-screen chat interface for onboarding and daily check-ins, reducing user anxiety.
*   **The "Rebalance" Engine:** Eepii generates a "Smart Schedule" by automatically interleaving deep-work tasks with mandated "Active Recovery" blocks (e.g., screen breaks, walks) to prevent cognitive fatigue.
*   **Frictionless .ics Setup:** Students bypass tedious manual entry. By dropping their existing university portal timetable file into the app, Eepii instantly parses their baseline weekly class load.
*   **Holistic Load Distribution:** Stress is tracked and visualized across five distinct pillars (Mental, Time, Physical, Social, Errands) via a dynamic radar chart, allowing students to see exactly where their schedule is breaking down.

---

## 5. Technical Architecture & Feasibility

### Tech Stack
*   **Frontend:** React Native (Expo) & NativeWind for rapid, cross-platform mobile deployment.
*   **Backend:** FastAPI (Python) acting as the central traffic controller.
*   **AI Engine:** Gemini API / OpenRouter parsing natural language to quantify stress (1-10) and auto-categorize tasks.
*   **Database:** Firebase Firestore for robust user profile and historical trend storage.

### Build Plan & Scope
To ensure a functional, high-quality submission by the end of the hackathon, we are strictly scoping our development to the core "Emotion and Rebalance" loop. We prioritize a seamless, interactive user experience over bloated, half-finished features.

**Phase 1: Frontend & Companion Integration (UI/UX)**
*   **Tech Stack:** React Native (Expo) & NativeWind.
*   **Scope:** Develop the cross-platform mobile interfaces (Dashboard, Rebalance timeline, and Bottom Sheets) using NativeWind for rapid styling. We will embed the Bloub SVG emotion engine (via React Native WebView or animated SVGs) and map the avatar's reactions to the user's current stress state.

**Phase 2: LLM Backend & The Rebalance Algorithm (The "Brain")**
*   **Tech Stack:** FastAPI (Python), Gemini API / OpenRouter.
*   **Scope:** FastAPI will act as our central traffic controller. When a user logs a task, FastAPI will send the natural language input to Gemini to quantify the estimated stress (1-10) and auto-categorize the task. The backend will then run our Rebalance Algorithm to inject "Active Recovery Blocks" into the user's timeline.

**Phase 3: Database & Historical Trends**
*   **Tech Stack:** Firebase Firestore.
*   **Scope:** Implement Firebase Firestore to securely store user profiles, saved schedules, and historical trend data. This will power the "Trends" tab, allowing users to see their burnout risk over a 7-day period.
