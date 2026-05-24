// GCP ACE Study Accelerator - Application Control Logic
document.addEventListener("DOMContentLoaded", () => {
  // Ensure database is available
  const db = window.GCP_DATABASE;
  if (!db) {
    console.error("GCP Database not loaded. Ensure data.js is included before app.js.");
    return;
  }

  // ==========================================================================
  // 1. APPLICATION STATE
  // ==========================================================================
  const state = {
    activeTab: "dashboard",
    completedTopics: JSON.parse(localStorage.getItem("gcp_completed_topics")) || [],
    theme: localStorage.getItem("gcp_theme") || "dark",
    
    // Service Catalog Category & View Toggle
    selectedServiceCategory: "all",
    serviceViewMode: "grid", // 'grid' or 'map'
    
    // Syllabus selection
    activeDomainId: "domain-1",
    activeTopicId: null,
    
    // CLI Command category
    activeCommandCategory: "Compute Engine",
    
    // Wizard State (Expanded to 6 categories)
    wizard: {
      type: null, // 'compute', 'database', 'storage', 'networking', 'security', 'analytics'
      history: [],
      currentStep: 1, // 1: Category, 2: Questions, 3: Result
      answers: {}
    },
    
    // Quiz State (Dual Modes: Practice vs Exam)
    quiz: {
      mode: "practice", // 'practice' or 'exam'
      questions: [],
      currentIndex: 0,
      selectedOptionIndex: null,
      score: 0,
      isAnswered: false,
      flagged: {}, // tracks marked for review by question index
      answersHistory: [], // record user selections
      timerInterval: null,
      timeRemaining: 7200, // 2 Hours in seconds
      topicsSelected: ["domain-1", "domain-2", "domain-3", "domain-4", "domain-5"],
      sizeConfig: "5"
    },

    // Flashcard deck state
    flashcards: {
      pool: [
        { cat: "STORAGE", title: "Global Relational ACID SQL?", front: "Which GCP database offers global relational scale, standard SQL queries, synchronous multi-region writes, and strong consistency?", back: "Cloud Spanner. It combines NoSQL scaling with ACID SQL transactions.", icon: "fa-database" },
        { cat: "COMPUTE", title: "GKE Autopilot Node Management?", front: "What is the key difference between GKE Autopilot and GKE Standard regarding worker node infrastructure?", back: "In Autopilot, Google manages the nodes and OS patches, charging per pod. Standard gives you VM node pool control, charging per VM.", icon: "fa-cubes" },
        { cat: "NETWORKING", title: "PGA for Private VMs?", front: "How do GCE VM instances with only private internal IPs securely fetch objects from GCS buckets without public transit?", back: "By enabling 'Private Google Access' on the regional VPC subnet hosting the VMs.", icon: "fa-route" },
        { cat: "SECURITY", title: "VM Key Management Rule?", front: "To adhere to GCP security guidelines, how should a VM authorize access to internal APIs (GCS, BigQuery)?", back: "Attach a Service Account directly to the VM Metadata and use Application Default Credentials. Never download private JSON keys.", icon: "fa-shield-halved" },
        { cat: "CLI", title: "Bucket vs Dataset Creation?", front: "What are the exact CLI tool prefixes used to create a GCS bucket vs a BigQuery dataset?", back: "'gcloud storage buckets create gs://...' (or 'gsutil mb') for GCS buckets; 'bq mk' for BigQuery datasets.", icon: "fa-terminal" },
        { cat: "OPERATIONS", title: "Memory and Disk Space Alerts?", front: "What is required inside a Compute Engine VM to configure alert policies for Memory Usage and Disk Capacity?", back: "You must install the Google Cloud Ops Agent inside the VM OS. Standard metrics only track CPU, disk write/read, and network flows.", icon: "fa-chart-line" }
      ],
      currentIndex: 0,
      mastered: JSON.parse(localStorage.getItem("gcp_mastered_flashcards")) || []
    }
  };

  // ==========================================================================
  // DOM ELEMENT DECLARATIONS
  // ==========================================================================
  const themeToggleBtn = document.getElementById("theme-toggle");
  const navItems = document.querySelectorAll(".nav-item");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const domainMenuContainer = document.getElementById("domain-menu-list");
  const activeTopicContainer = document.getElementById("active-topic-container");
  
  // Services
  const servicesGridEl = document.getElementById("services-grid-container");
  const architectureMapContainer = document.getElementById("architecture-map-container");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const servicesFilterBar = document.getElementById("services-filter-bar");
  const btnServicesGrid = document.getElementById("btn-services-grid");
  const btnServicesMap = document.getElementById("btn-services-map");
  const serviceMapModal = document.getElementById("service-map-modal");
  const btnCloseMapModal = document.getElementById("btn-close-map-modal");
  const serviceMapModalBody = document.getElementById("service-map-modal-body");

  // Wizard
  const wizardStep1 = document.getElementById("wizard-step-1");
  const wizardStepQuestions = document.getElementById("wizard-step-questions");
  const wizardStepResult = document.getElementById("wizard-step-result");
  const wizardQuestionText = document.getElementById("wizard-question-text");
  const wizardQuestionSubtext = document.getElementById("wizard-question-subtext");
  const wizardOptionsContainer = document.getElementById("wizard-options-container");
  const wizardProgressFill = document.getElementById("wizard-progress-fill");
  const wizardBackBtn = document.getElementById("wizard-back-btn");
  const wizardPathVisual = document.getElementById("wizard-pathway-visual");
  const wizardRestartBtn = document.getElementById("wizard-restart-btn");

  // CLI
  const commandCatContainer = document.getElementById("command-cat-menu-container");
  const commandListContainer = document.getElementById("command-list-container");

  // Quiz components
  const quizLanding = document.getElementById("quiz-landing");
  const quizRunning = document.getElementById("quiz-running");
  const quizResults = document.getElementById("quiz-results");
  const btnStartPractice = document.getElementById("btn-start-practice");
  const btnStartExam = document.getElementById("btn-start-exam");
  const quizTimerContainer = document.getElementById("quiz-timer-container");
  const quizTimerDisplay = document.getElementById("quiz-timer-display");
  const quizLiveScoreWrapper = document.getElementById("quiz-live-score-wrapper");
  const currentQIndexDisplay = document.getElementById("current-q-index");
  const totalQCountDisplay = document.getElementById("total-q-count");
  const liveCorrectCountDisplay = document.getElementById("live-correct-count");
  const liveProgressFill = document.getElementById("quiz-live-progress-fill");
  const quizNavigatorGrid = document.getElementById("quiz-navigator-grid");
  const quizQuestionDomain = document.getElementById("quiz-question-domain");
  const quizMarkReviewBtn = document.getElementById("quiz-mark-review-btn");
  const quizQuestionDisplay = document.getElementById("quiz-question-display");
  const quizOptionsDisplay = document.getElementById("quiz-options-display");
  const quizShowExplanationBtn = document.getElementById("quiz-show-explanation-btn");
  const quizSubmitBtn = document.getElementById("quiz-submit-btn");
  const quizExplanationDisplay = document.getElementById("quiz-explanation-display-box");
  const quizExplanationText = document.getElementById("quiz-explanation-text");
  const postExamReviewContainer = document.getElementById("post-exam-review-container");
  const postExamReviewList = document.getElementById("post-exam-review-list");
  const retryQuizBtn = document.getElementById("quiz-retry-btn");
  const gotoSyllabusBtn = document.getElementById("quiz-goto-syllabus-btn");

  // ==========================================================================
  // INITIALIZATION RUN
  // ==========================================================================
  document.documentElement.setAttribute("data-theme", state.theme);
  updateThemeToggleButtonIcon();
  updateGlobalProgress();
  populateStatsCounters();
  initializeDashboardFlashcards();
  renderDashboardDomainAccordion();

  // ==========================================================================
  // ACTIVITY TIMELINE LOG ENGINE
  // ==========================================================================
  function logActivity(title, description, type = "default") {
    const container = document.getElementById("activity-timeline-container");
    if (!container) return;

    const li = document.createElement("li");
    li.className = `activity-item completed ${type}`;
    li.innerHTML = `
      <div class="activity-dot"></div>
      <div class="activity-info">
        <strong>${title}</strong>
        <span>${description}</span>
        <small>Just now</small>
      </div>
    `;

    container.insertBefore(li, container.firstChild);

    // Caps recent timeline activities to 5 max items
    const listItems = container.querySelectorAll(".activity-item");
    if (listItems.length > 5) {
      container.removeChild(listItems[listItems.length - 1]);
    }
  }

  // ==========================================================================
  // MAIN ROUTING
  // ==========================================================================
  function switchTab(tabId) {
    state.activeTab = tabId;
    
    navItems.forEach(btn => {
      if (btn.getAttribute("data-tab") === tabId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add("active");
      } else {
        pane.classList.remove("active");
      }
    });

    // Sub-tab renders
    if (tabId === "syllabus") {
      renderSyllabusSidebar();
    } else if (tabId === "services") {
      renderVisualArchitectureMap();
    } else if (tabId === "commands") {
      renderCommandCategories();
      renderCommandsList();
    } else if (tabId === "wizard") {
      resetWizard();
    } else if (tabId === "dashboard") {
      updateGlobalProgress();
      renderDashboardDomainAccordion();
      initializeDashboardFlashcards();
    }
    
    document.querySelector(".content-body").scrollTop = 0;
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      switchTab(item.getAttribute("data-tab"));
    });
  });

  // ==========================================================================
  // THEME CONTROL
  // ==========================================================================
  themeToggleBtn.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("gcp_theme", state.theme);
    updateThemeToggleButtonIcon();
  });

  function updateThemeToggleButtonIcon() {
    const icon = themeToggleBtn.querySelector("i");
    icon.className = state.theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }

  // ==========================================================================
  // STATS & PROGRESS ENGINE
  // ==========================================================================
  function populateStatsCounters() {
    document.getElementById("stat-services-count").innerText = db.services.length;
    document.getElementById("stat-commands-count").innerText = db.commands.length;
    document.getElementById("stat-quiz-count").innerText = db.quiz.length;
  }

  function updateGlobalProgress() {
    const totalSyllabusTopicsCount = db.syllabus.reduce((acc, domain) => acc + domain.topics.length, 0);
    const completedCount = state.completedTopics.length;
    const syllabusPct = totalSyllabusTopicsCount > 0 ? Math.round((completedCount / totalSyllabusTopicsCount) * 100) : 0;
    
    document.getElementById("readiness-pct").innerText = `${syllabusPct}%`;
    document.getElementById("dashboard-progress-text").innerText = `${syllabusPct}%`;
    document.getElementById("dashboard-completed-topics").innerText = `${completedCount}/${totalSyllabusTopicsCount}`;

    // SVG Circle dynamic stroke calculation
    const circle = document.getElementById("dashboard-progress-circle");
    if (circle) {
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      circle.style.strokeDashoffset = circumference - (syllabusPct / 100) * circumference;
    }

    // Readiness grades rating
    const readinessGradeEl = document.getElementById("dashboard-readiness-grade");
    if (readinessGradeEl) {
      if (syllabusPct >= 90) readinessGradeEl.innerText = "Exam Ready!";
      else if (syllabusPct >= 70) readinessGradeEl.innerText = "Solid Base";
      else if (syllabusPct >= 40) readinessGradeEl.innerText = "Moderate";
      else readinessGradeEl.innerText = "Needs Review";
    }

    const savedSuccessRate = localStorage.getItem("gcp_quiz_best_success") || "0%";
    document.getElementById("dashboard-quiz-score").innerText = savedSuccessRate;
  }

  // ==========================================================================
  // TOAST NOTIFICATIONS & COPIER
  // ==========================================================================
  const toastEl = document.getElementById("global-toast");
  const toastMessageEl = document.getElementById("toast-message");
  let toastTimeout;

  function showToast(message, isSuccess = true) {
    clearTimeout(toastTimeout);
    toastMessageEl.innerText = message;
    const icon = toastEl.querySelector("i");
    icon.className = isSuccess ? "fa-solid fa-circle-check" : "fa-solid fa-triangle-exclamation";
    icon.style.color = isSuccess ? "#34a853" : "#ea4335";
    toastEl.classList.remove("hidden");
    toastTimeout = setTimeout(() => toastEl.classList.add("hidden"), 2500);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Copied to clipboard!");
    }).catch(() => {
      showToast("Failed to copy command.", false);
    });
  }

  // ==========================================================================
  // DASHBOARD WIDGETS - ACCORDIONS & FLASHCARDS
  // ==========================================================================
  function renderDashboardDomainAccordion() {
    const container = document.getElementById("dashboard-domain-progress-accordion");
    if (!container) return;

    container.innerHTML = "";

    db.syllabus.forEach((dom, index) => {
      const totalTopics = dom.topics.length;
      const completedTopicsInDomain = dom.topics.filter(t => state.completedTopics.includes(t.id)).length;
      const pct = totalTopics > 0 ? Math.round((completedTopicsInDomain / totalTopics) * 100) : 0;

      const item = document.createElement("div");
      item.className = `dash-acc-item ${index === 0 ? "active" : ""}`;
      item.innerHTML = `
        <div class="dash-acc-header">
          <div class="dash-acc-header-left">
            <i class="fa-solid fa-book-bookmark"></i>
            <strong>Domain ${index + 1}: ${dom.title.split(":")[1] || dom.title}</strong>
          </div>
          <div class="dash-acc-header-right">
            <span class="dash-acc-pct">${pct}% Done</span>
            <i class="fa-solid fa-chevron-right chevron"></i>
          </div>
        </div>
        <div class="dash-acc-content">
          <div class="dash-progress-track">
            <div class="dash-progress-bar" style="width: ${pct}%"></div>
          </div>
          <ul class="dash-topic-bullet-list">
            ${dom.topics.map(t => {
              const isDone = state.completedTopics.includes(t.id);
              return `
                <li style="cursor:pointer;" data-topic="${t.id}" data-domain="${dom.id}">
                  <span>${t.title}</span>
                  <i class="fa-solid ${isDone ? "fa-circle-check completed" : "fa-circle-dot incomplete"}"></i>
                </li>
              `;
            }).join("")}
          </ul>
        </div>
      `;

      // Accordion header expanding action
      item.querySelector(".dash-acc-header").addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        container.querySelectorAll(".dash-acc-item").forEach(el => el.classList.remove("active"));
        if (!isActive) {
          item.classList.add("active");
        }
      });

      // Clicking a topic jumps straight to the Syllabus Tab and expands it!
      item.querySelectorAll(".dash-topic-bullet-list li").forEach(li => {
        li.addEventListener("click", () => {
          state.activeDomainId = li.getAttribute("data-domain");
          state.activeTopicId = li.getAttribute("data-topic");
          switchTab("syllabus");
          setTimeout(() => {
            const matchedDomain = db.syllabus.find(d => d.id === state.activeDomainId);
            const matchedTopic = matchedDomain.topics.find(t => t.id === state.activeTopicId);
            renderActiveTopicDetails(matchedTopic, matchedDomain);
          }, 100);
        });
      });

      container.appendChild(item);
    });
  }

  function initializeDashboardFlashcards() {
    const container = document.getElementById("flashcard-deck-container");
    if (!container) return;

    // Filters out mastered cards
    const remainingCards = state.flashcards.pool.filter(c => !state.flashcards.mastered.includes(c.title));

    if (remainingCards.length === 0) {
      container.innerHTML = `
        <div class="flashcard-face flashcard-front" style="border-color: var(--accent-green);">
          <i class="fa-solid fa-medal text-green" style="color: var(--accent-green);"></i>
          <h4>All Concept Drills Mastered!</h4>
          <p style="font-size:12px; color: var(--text-secondary);">Excellent job. You have completed all key flashcard micro-assessments.</p>
          <button class="btn btn-secondary btn-small" id="btn-reset-flashcards" style="margin-top:10px;"><i class="fa-solid fa-rotate-left"></i> Reset Deck</button>
        </div>
      `;
      
      container.querySelector("#btn-reset-flashcards").addEventListener("click", () => {
        state.flashcards.mastered = [];
        localStorage.removeItem("gcp_mastered_flashcards");
        showToast("Flashcard deck reset!");
        initializeDashboardFlashcards();
      });
      return;
    }

    // Loads current card
    const cardData = remainingCards[0];
    container.innerHTML = `
      <div class="flashcard" id="active-flashcard">
        <!-- FRONT -->
        <div class="flashcard-face flashcard-front">
          <small>${cardData.cat} Concept</small>
          <i class="fa-solid ${cardData.icon}"></i>
          <h4>${cardData.title}</h4>
          <p style="font-size:11px; color:var(--text-secondary); margin-top:5px;">${cardData.front}</p>
          <small style="color: var(--primary);"><i class="fa-solid fa-arrows-rotate"></i> Click Card to Flip</small>
        </div>
        <!-- BACK -->
        <div class="flashcard-face flashcard-back">
          <div class="flashcard-back-title">
            <h5>GCP Architecture Guideline</h5>
            <span>${cardData.cat}</span>
          </div>
          <p>${cardData.back}</p>
          <small style="text-align:center; color: var(--text-muted); font-size:9px;"><i class="fa-solid fa-arrows-rotate"></i> Click to flip front</small>
        </div>
      </div>
    `;

    const cardEl = container.querySelector("#active-flashcard");
    cardEl.addEventListener("click", () => {
      cardEl.classList.toggle("flipped");
    });

    // Button controls
    const masterBtn = document.getElementById("btn-flash-master");
    const reviewBtn = document.getElementById("btn-flash-review");

    // Mastered: logs progress and transitions to next card
    masterBtn.onclick = () => {
      state.flashcards.mastered.push(cardData.title);
      localStorage.setItem("gcp_mastered_flashcards", JSON.stringify(state.flashcards.mastered));
      logActivity("Concept Mastered", `Successfully learned concept: "${cardData.title}"`, "completed");
      showToast("Card marked as mastered!");
      initializeDashboardFlashcards();
    };

    // Review later: cycles card to the back of the deck
    reviewBtn.onclick = () => {
      const idx = state.flashcards.pool.findIndex(c => c.title === cardData.title);
      if (idx !== -1) {
        // Rotates the card to the back of the array
        const [card] = state.flashcards.pool.splice(idx, 1);
        state.flashcards.pool.push(card);
      }
      showToast("Cycling card to the back of the deck.");
      initializeDashboardFlashcards();
    };
  }

  // ==========================================================================
  // SYLLABUS RENDERING AND COMPLETIONS
  // ==========================================================================
  function renderSyllabusSidebar() {
    domainMenuContainer.innerHTML = "";
    db.syllabus.forEach(domain => {
      const domainCard = document.createElement("div");
      domainCard.className = `domain-card ${state.activeDomainId === domain.id ? "active" : ""}`;
      
      const header = document.createElement("div");
      header.className = "domain-header";
      header.innerHTML = `
        <div class="domain-header-title">
          <strong>${domain.title}</strong>
          <span>${domain.topics.length} core focus items</span>
        </div>
        <i class="fa-solid fa-chevron-right"></i>
      `;
      
      header.addEventListener("click", () => {
        document.querySelectorAll(".domain-card").forEach(c => c.classList.remove("active"));
        if (state.activeDomainId === domain.id) {
          state.activeDomainId = null;
        } else {
          state.activeDomainId = domain.id;
          domainCard.classList.add("active");
        }
        renderSyllabusSidebar();
      });

      const topicsList = document.createElement("div");
      topicsList.className = "domain-topics";
      
      domain.topics.forEach(topic => {
        const isCompleted = state.completedTopics.includes(topic.id);
        const isActive = state.activeTopicId === topic.id;
        
        const topicBtn = document.createElement("button");
        topicBtn.className = `topic-link ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`;
        topicBtn.innerHTML = `
          <span>${topic.title}</span>
          <span class="checkbox-marker">
            <i class="fa-regular ${isCompleted ? "fa-circle-check" : "fa-circle"}"></i>
          </span>
        `;
        
        topicBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          state.activeTopicId = topic.id;
          renderSyllabusSidebar();
          renderActiveTopicDetails(topic, domain);
        });
        
        topicsList.appendChild(topicBtn);
      });
      
      domainCard.appendChild(header);
      domainCard.appendChild(topicsList);
      domainMenuContainer.appendChild(domainCard);
    });
  }

  function renderActiveTopicDetails(topic, domain) {
    const isCompleted = state.completedTopics.includes(topic.id);
    activeTopicContainer.innerHTML = `
      <div class="topic-view-header">
        <div class="topic-title-group">
          <span class="category-pill">${domain.title.split(":")[0]}</span>
          <h2>${topic.title}</h2>
        </div>
        <div class="topic-actions">
          <button class="btn ${isCompleted ? "btn-secondary" : "btn-primary"} mark-complete-btn">
            <i class="fa-solid ${isCompleted ? "fa-circle-check" : "fa-check"}"></i>
            <span>${isCompleted ? "Completed" : "Mark as Completed"}</span>
          </button>
        </div>
      </div>
      
      <div class="topic-view-section syl-visual-section">
        <h3><i class="fa-solid fa-diagram-project text-orange"></i> Architecture Map & Visual Breakdown</h3>
        <div class="syl-visual-block-wrapper">
          ${renderSyllabusVisual(topic.id)}
        </div>
      </div>

      <div class="topic-view-section">
        <h3><i class="fa-solid fa-circle-info text-blue"></i> Overview & Summary</h3>
        <div class="topic-summary">${formatTopicSummary(topic.summary)}</div>
      </div>

      <div class="topic-view-section">
        <h3><i class="fa-solid fa-code-fork text-purple"></i> Scenario Checklist</h3>
        <div class="scenarios-split">
          <div class="scenario-column use">
            <h4>When to Use</h4>
            <ul class="scenario-bullets">
              ${topic.whenToUse.map(bullet => `<li>${bullet}</li>`).join("")}
            </ul>
          </div>
          <div class="scenario-column avoid">
            <h4>When NOT to Use</h4>
            <ul class="scenario-bullets">
              ${topic.whenNotToUse.map(bullet => `<li>${bullet}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>

      <div class="topic-view-section">
        <h3><i class="fa-solid fa-terminal text-green"></i> Key CLI Commands</h3>
        <div class="topic-commands-list">
          ${topic.commands && topic.commands.length > 0 
            ? topic.commands.map(cmd => {
                const displayCmd = substituteCommandParams(cmd);
                return `
                  <div class="code-clipboard-block">
                    <div class="code-header">
                      <span>gcloud CLI Script</span>
                      <button class="copy-cmd-btn" data-raw="${cmd}">
                        <i class="fa-regular fa-copy"></i> Copy
                      </button>
                    </div>
                    <div class="code-body">
                      <pre><code>${displayCmd}</code></pre>
                    </div>
                  </div>
                `;
              }).join("")
            : `<p class="text-secondary" style="font-size: 13px;">No explicit CLI commands requested for this conceptual topic.</p>`
          }
        </div>
      </div>

      ${topic.id === "hybrid-lb" ? `
        <div class="topic-view-section" style="margin-top: 20px;">
          <h3><i class="fa-solid fa-circle-nodes text-purple"></i> Cross-Section Quick Navigation</h3>
          <div class="syllabus-catalog-cta-box" style="background: rgba(161, 66, 244, 0.05); border: 1px solid rgba(161, 66, 244, 0.2); padding: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
            <div>
              <strong style="color: var(--accent-purple); font-size: 13px; display: block; margin-bottom: 2px;">Interactive Service Integration</strong>
              <span style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">Open the Cloud Load Balancing (CLB) Service Catalog detailed Layer 7 (HTTP/S) vs Layer 4 (Network Proxy/Passthrough) decision flowchart directly.</span>
            </div>
            <button class="btn btn-primary btn-small" id="btn-jump-to-clb-catalog" style="font-size: 11px; padding: 8px 16px; white-space: nowrap;"><i class="fa-solid fa-network-wired"></i> View CLB Map</button>
          </div>
        </div>
      ` : ""}
    `;

    // Completion toggle
    activeTopicContainer.querySelector(".mark-complete-btn").addEventListener("click", () => {
      if (state.completedTopics.includes(topic.id)) {
        state.completedTopics = state.completedTopics.filter(id => id !== topic.id);
        showToast("Topic marked as incomplete.");
        logActivity("Syllabus Checklist", `Marked topic "${topic.title}" as review-required.`);
      } else {
        state.completedTopics.push(topic.id);
        showToast("Topic marked as completed!");
        logActivity("Syllabus Checklist", `Successfully completed studying: "${topic.title}"`, "completed");
      }
      localStorage.setItem("gcp_completed_topics", JSON.stringify(state.completedTopics));
      renderSyllabusSidebar();
      renderActiveTopicDetails(topic, domain);
      updateGlobalProgress();
    });

    activeTopicContainer.querySelectorAll(".copy-cmd-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        copyToClipboard(substituteCommandParams(btn.getAttribute("data-raw")));
      });
    });

    const jumpBtn = activeTopicContainer.querySelector("#btn-jump-to-clb-catalog");
    if (jumpBtn) {
      jumpBtn.addEventListener("click", () => {
        switchTab("services");
        const clbService = db.services.find(s => s.id === "cloud-load-balancing");
        if (clbService) {
          state.serviceViewMode = "map";
          const btnMap = document.getElementById("btn-services-map");
          const btnGrid = document.getElementById("btn-services-grid");
          if (btnMap && btnGrid) {
            btnGrid.classList.remove("active");
            btnMap.classList.add("active");
            servicesGridEl.classList.add("hidden");
            architectureMapContainer.classList.remove("hidden");
            servicesFilterBar.classList.add("hidden");
          }
          showServiceMapModal(clbService);
        }
      });
    }
  }

  function formatTopicSummary(summaryText) {
    if (!summaryText) return "";
    
    // Split by bullet point markers: e.g. "• <strong>" or "• "
    const parts = summaryText.split(/•\s*(?=<strong>)/);
    
    if (parts.length <= 1) {
      return `<p class="topic-summary-paragraph" style="font-size:13px; line-height:1.6; color:var(--text-secondary);">${summaryText}</p>`;
    }
    
    let formattedHtml = `<p class="topic-summary-paragraph" style="margin-bottom: 20px; font-size:13px; line-height:1.6; color:var(--text-secondary);">${parts[0].trim()}</p>`;
    
    for (let i = 1; i < parts.length; i++) {
      const section = parts[i].trim();
      
      // Match category header, e.g. "<strong>Machine Families</strong>:" or similar
      const headerMatch = section.match(/^<strong>(.*?)<\/strong>:\s*([\s\S]*)/);
      
      if (headerMatch) {
        const title = headerMatch[1];
        let content = headerMatch[2];
        
        // Replace inner list indicators " - <i>" or "-"
        const listItems = content.split(/\r?\n\s*-\s*/);
        let listHtml = "";
        
        if (listItems.length > 1) {
          listHtml = `<ul class="summary-bullet-list">`;
          if (listItems[0].trim()) {
            listHtml += `<li class="summary-bullet-item">${listItems[0].trim()}</li>`;
          }
          for (let j = 1; j < listItems.length; j++) {
            listHtml += `<li class="summary-bullet-item">${listItems[j].trim()}</li>`;
          }
          listHtml += `</ul>`;
        } else {
          listHtml = `<p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">${content}</p>`;
        }
        
        // Choose an icon based on title keywords
        let icon = "fa-cubes";
        const tLower = title.toLowerCase();
        if (tLower.includes("machine") || tLower.includes("compute") || tLower.includes("gke") || tLower.includes("flex") || tLower.includes("run")) icon = "fa-laptop-code text-blue";
        else if (tLower.includes("storage") || tLower.includes("local") || tLower.includes("volume") || tLower.includes("disk")) icon = "fa-hard-drive text-yellow";
        else if (tLower.includes("database") || tLower.includes("cache") || tLower.includes("spanner") || tLower.includes("sql")) icon = "fa-database text-green";
        else if (tLower.includes("vpc") || tLower.includes("network") || tLower.includes("route") || tLower.includes("ip") || tLower.includes("hybrid")) icon = "fa-route text-purple";
        else if (tLower.includes("security") || tLower.includes("iam") || tLower.includes("role") || tLower.includes("account") || tLower.includes("auth")) icon = "fa-shield-halved text-red";
        else if (tLower.includes("ops") || tLower.includes("operation") || tLower.includes("monitor") || tLower.includes("log") || tLower.includes("trace")) icon = "fa-chart-line text-purple";
        
        formattedHtml += `
          <div class="summary-subsection-card">
            <h4><i class="fa-solid ${icon}"></i> ${title}</h4>
            ${listHtml}
          </div>
        `;
      } else {
        formattedHtml += `
          <div class="summary-subsection-card">
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">${section}</p>
          </div>
        `;
      }
    }
    
    return formattedHtml;
  }

  // ==========================================================================
  // SYLLABUS DYNAMIC VISUAL BLUEPRINTS - 11 TOPICS
  // ==========================================================================
  function renderSyllabusVisual(topicId) {
    if (topicId === "gce-topics") {
      return `
        <div class="syl-visual-gce">
          <div class="visual-header-sub"><i class="fa-solid fa-server text-blue"></i> Compute Engine VM Provisioning & Storage Lifecycle</div>
          <div class="gce-provision-flow">
            <div class="flow-step">
              <span class="step-num">1</span>
              <h4>Blueprint Template</h4>
              <p>Deploy identical VMs via <strong>Instance Templates</strong> and <strong>Custom Images</strong> using custom <strong>Startup Scripts</strong> to automate server package installation on boot.</p>
            </div>
            <div class="flow-arrow"><i class="fa-solid fa-right-long"></i></div>
            <div class="flow-step">
              <span class="step-num">2</span>
              <h4>Security & Shield</h4>
              <p>Configure <strong>Shielded VMs</strong> (Secure Boot, measured boot, vTPM verification) and <strong>Confidential VMs</strong> (AMD SEV cryptographically encrypts active RAM data in-use).</p>
            </div>
            <div class="flow-arrow"><i class="fa-solid fa-right-long"></i></div>
            <div class="flow-step">
              <span class="step-num">3</span>
              <h4>Billing Strategy</h4>
              <p>Leverage <strong>Spot VMs</strong> (up to 91% discount, terminated with 30s warnings, max 24h runtime) or standard VMs with automatic <strong>Live Migration</strong> during maintenance.</p>
            </div>
            <div class="flow-arrow"><i class="fa-solid fa-right-long"></i></div>
            <div class="flow-step">
              <span class="step-num">4</span>
              <h4>Attached Storage</h4>
              <p>Mount <strong>Persistent Disks</strong> (standard/SSD block, expanded online), ultra-low latency ephemeral <strong>Local SSDs</strong>, or multi-writer POSIX-compliant <strong>Filestore</strong> NFS shared mounts.</p>
            </div>
          </div>
        </div>
      `;
    }
    
    if (topicId === "gke-topics") {
      return `
        <div class="syl-visual-gke">
          <div class="visual-header-sub"><i class="fa-solid fa-cubes text-blue"></i> GKE Cluster Architecture: Control Plane vs. Worker Nodes</div>
          <div class="gke-grid">
            <!-- Left: Control Plane (Google Managed) -->
            <div class="gke-col gke-control-plane-box">
              <div class="gke-box-header"><i class="fa-solid fa-dharmachakra"></i> Control Plane (Google Managed)</div>
              <div class="gke-component">
                <strong>kube-apiserver</strong>
                <span>Central communication hub. Exposes the Kubernetes API endpoint for kubectl and internal node routing.</span>
              </div>
              <div class="gke-component">
                <strong>kube-scheduler</strong>
                <span>Assigns newly created pods to healthy worker nodes based on resource capacities and constraints.</span>
              </div>
              <div class="gke-component">
                <strong>kube-controller-manager</strong>
                <span>Runs controller daemons (Node Controller, Job Controller, Endpoint Controller) to maintain target states.</span>
              </div>
              <div class="gke-component">
                <strong>etcd Database</strong>
                <span>Consistent, highly-available distributed key-value database representing the source-of-truth cluster state.</span>
              </div>
            </div>
            
            <!-- Right: Worker Node VM -->
            <div class="gke-col gke-node-box">
              <div class="gke-box-header"><i class="fa-solid fa-server"></i> Worker Node VM (Standard or Autopilot managed)</div>
              <div class="gke-node-layers">
                <!-- Node OS -->
                <div class="gke-layer os-layer">
                  Node OS: Container-Optimized OS (COS) / Ubuntu Linux
                </div>
                
                <!-- Daemons -->
                <div class="gke-daemons-grid">
                  <div class="gke-layer daemon-layer">
                    <strong>Kubelet Agent</strong>
                    <span>Node daemon ensuring containers run successfully inside target Pod specs.</span>
                  </div>
                  <div class="gke-layer daemon-layer">
                    <strong>Kube-Proxy</strong>
                    <span>Maintains network routing tables to expose services across the cluster.</span>
                  </div>
                </div>
                
                <!-- Container Runtime -->
                <div class="gke-layer runtime-layer">
                  Container Runtime: containerd Engine Layer
                </div>
                
                <!-- Pods -->
                <div class="gke-pods-area">
                  <div class="pods-header"><i class="fa-solid fa-cubes"></i> Containerized Pods (Kubernetes Workloads)</div>
                  <div class="pods-flex">
                    <div class="gke-pod-bubble">
                      <div class="pod-title">Pod 1</div>
                      <div class="pod-container text-blue">web-frontend</div>
                    </div>
                    <div class="gke-pod-bubble">
                      <div class="pod-title">Pod 2</div>
                      <div class="pod-container text-green">python-api</div>
                    </div>
                    <div class="gke-pod-bubble">
                      <div class="pod-title">Pod 3</div>
                      <div class="pod-container text-purple">auth-service</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Hardware Base -->
          <div class="gke-hardware-layer">
            <div class="gke-hardware-box">
              <i class="fa-solid fa-microchip"></i>
              <span><strong>Physical Host Server Infrastructure:</strong> Managed GCE Compute Nodes, Google Hypervisor, CPUs, RAM, and Global SD-Network Mesh (Autopilot hides GCE VMs from Console).</span>
            </div>
          </div>
        </div>
      `;
    }

    if (topicId === "serverless-topics") {
      return `
        <div class="syl-visual-serverless">
          <div class="visual-header-sub"><i class="fa-solid fa-bolt text-purple"></i> Serverless Deployment Selection Matrix</div>
          <div class="serverless-matrix-grid">
            <div class="sless-card">
              <div class="sless-badge badge-blue">FaaS</div>
              <h3>Cloud Functions</h3>
              <div class="sless-use"><strong>Ideal for:</strong> Lightweight event-driven processing code snippets.</div>
              <ul class="sless-details">
                <li>Triggered by GCS file uploads, Pub/Sub events, or direct HTTP API requests.</li>
                <li>Scales down to 0; billed strictly to the nearest millisecond of execution.</li>
                <li>Completely stateless; local storage restricted to in-memory /tmp mount.</li>
              </ul>
            </div>
            
            <div class="sless-card">
              <div class="sless-badge badge-purple">CaaS</div>
              <h3>Cloud Run</h3>
              <div class="sless-use"><strong>Ideal for:</strong> Containerized REST APIs, microservices, and static portals.</div>
              <ul class="sless-details">
                <li>Runs any language runtime, framework, or utility packaged inside a Docker image.</li>
                <li>Scales down to 0 on idle; supports up to 250 concurrent requests per container.</li>
                <li>Billed strictly during active request processing (down to 100ms blocks).</li>
              </ul>
            </div>
            
            <div class="sless-card">
              <div class="sless-badge badge-green">PaaS</div>
              <h3>App Engine (GAE)</h3>
              <div class="sless-use"><strong>Ideal for:</strong> Traditional code-first monolithic web applications.</div>
              <ul class="sless-details">
                <li><strong>Standard:</strong> Sandbox runtimes, scale-to-zero model, restricts direct system writing.</li>
                <li><strong>Flexible:</strong> Container-based, custom runtimes, minimum of 1 active VM (no scale-to-zero).</li>
                <li>Includes built-in split-testing traffic division engines.</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (topicId === "file-block-storage") {
      return `
        <div class="syl-visual-block-storage">
          <div class="visual-header-sub"><i class="fa-solid fa-hard-drive text-yellow"></i> Block Storage vs. Shared Network Filesystems</div>
          <div class="serverless-matrix-grid">
            <div class="sless-card" style="border-top: 4px solid var(--primary);">
              <div class="sless-badge badge-blue">Network Block</div>
              <h3>Persistent Disks</h3>
              <div class="sless-use"><strong>Scope:</strong> Durable block devices attached network-wise to VMs.</div>
              <ul class="sless-details">
                <li>Allocated as boot/data disks. Standard, Balanced, or SSD IOPS options.</li>
                <li><strong>Online Resize:</strong> Expand disk capacity on-the-fly (requires OS-level partition extension).</li>
                <li><strong>Multi-Writer:</strong> Attach single PD to multiple VMs concurrently (Read-Only or clustered RW).</li>
              </ul>
            </div>
            
            <div class="sless-card" style="border-top: 4px solid var(--accent-orange);">
              <div class="sless-badge badge-orange" style="background: rgba(251, 188, 5, 0.15); color: var(--accent-orange);">Host Block</div>
              <h3>Local SSDs</h3>
              <div class="sless-use"><strong>Scope:</strong> Ephemeral high-performance raw physical block drives.</div>
              <ul class="sless-details">
                <li>Physically slotted into the host GCE hardware server directly.</li>
                <li>Delivers extreme IOPS and sub-millisecond latencies for caching or scratch.</li>
                <li><strong>Warning:</strong> Data is permanently wiped when GCE instance is STOPPED or DELETED.</li>
              </ul>
            </div>
            
            <div class="sless-card" style="border-top: 4px solid var(--accent-green);">
              <div class="sless-badge badge-green">Network Shared</div>
              <h3>Cloud Filestore</h3>
              <div class="sless-use"><strong>Scope:</strong> Managed NAS shared network directories supporting NFSv3.</div>
              <ul class="sless-details">
                <li>POSIX-compliant file locking; mounts concurrently to hundreds of VMs/pods.</li>
                <li>Ideal for WordPress media sync, legacy app migrations, or shared data folders.</li>
                <li>Billed directly based on allocated capacity tiers (Basic, High Perf, Enterprise).</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (topicId === "gcs-exhaustive") {
      return `
        <div class="syl-visual-gcs">
          <div class="visual-header-sub"><i class="fa-solid fa-database text-yellow"></i> GCS Storage Classes Lifecycle & Configuration Blueprints</div>
          <div class="gcs-lifecycle-timeline">
            <div class="gcs-class-box gcs-hot">
              <div class="gcs-class-header">Standard</div>
              <div class="gcs-class-desc">Hot active data, website assets, staging environments</div>
              <div class="gcs-class-spec">Min Retention: None<br>Retrieval Cost: Free</div>
            </div>
            <div class="gcs-lifecycle-arrow"><i class="fa-solid fa-arrow-right-long"></i><span>30 Days</span></div>
            <div class="gcs-class-box gcs-warm">
              <div class="gcs-class-header">Nearline</div>
              <div class="gcs-class-desc">Accessed &lt; once a month, backup schedules</div>
              <div class="gcs-class-spec">Min Retention: 30 Days<br>Retrieval Cost: Low</div>
            </div>
            <div class="gcs-lifecycle-arrow"><i class="fa-solid fa-arrow-right-long"></i><span>90 Days</span></div>
            <div class="gcs-class-box gcs-cold">
              <div class="gcs-class-header">Coldline</div>
              <div class="gcs-class-desc">Accessed &lt; once a quarter, disaster recovery</div>
              <div class="gcs-class-spec">Min Retention: 90 Days<br>Retrieval Cost: Med</div>
            </div>
            <div class="gcs-lifecycle-arrow"><i class="fa-solid fa-arrow-right-long"></i><span>365 Days</span></div>
            <div class="gcs-class-box gcs-archive">
              <div class="gcs-class-header">Archive</div>
              <div class="gcs-class-desc">Regulatory logs, permanent cold archives</div>
              <div class="gcs-class-spec">Min Retention: 365 Days<br>Retrieval Cost: High</div>
            </div>
          </div>
          
          <div class="gcs-features-grid">
            <div class="gcs-feat-card">
              <i class="fa-solid fa-arrows-spin text-blue"></i>
              <h4>Lifecycle Actions</h4>
              <p>Declarative rules auto-downgrading objects or cleaning up old generations after age milestones.</p>
            </div>
            <div class="gcs-feat-card">
              <i class="fa-solid fa-signature text-yellow"></i>
              <h4>Signed URLs</h4>
              <p>Cryptographic temporary URL granting secure read/write keys to clients without Google credentials.</p>
            </div>
            <div class="gcs-feat-card">
              <i class="fa-solid fa-clock-rotate-left text-green"></i>
              <h4>Object Versioning</h4>
              <p>Keeps history of replaced/deleted files, preserving custom generation IDs to safeguard against deletes.</p>
            </div>
            <div class="gcs-feat-card">
              <i class="fa-solid fa-shield-halved text-red"></i>
              <h4>Retention Policy</h4>
              <p>Implements WORM rules (Write Once, Read Many) to freeze buckets for strict compliance timelines.</p>
            </div>
          </div>
        </div>
      `;
    }

    if (topicId === "db-comparisons") {
      return `
        <div class="syl-visual-db">
          <div class="visual-header-sub"><i class="fa-solid fa-database text-green"></i> GCP Managed Database Selection Architecture</div>
          <div class="db-decision-grid">
            <div class="db-card">
              <div class="db-type-header relational"><i class="fa-solid fa-table"></i> Relational SQL Databases</div>
              <div class="db-sub-grid">
                <div class="db-item-card">
                  <h4>Cloud SQL</h4>
                  <p>Regional fully-managed PostgreSQL, MySQL, and SQL Server databases up to 64TB.</p>
                  <div class="db-tag-spec">High Availability: Failover standby VM inside another zone</div>
                </div>
                <div class="db-item-card">
                  <h4>Cloud Spanner</h4>
                  <p>Enterprise global relational SQL scaling horizontally with synchronous replication.</p>
                  <div class="db-tag-spec">Availability SLA: 99.999% (highly resilient)</div>
                </div>
              </div>
            </div>
            
            <div class="db-card">
              <div class="db-type-header nosql"><i class="fa-solid fa-network-wired"></i> NoSQL Schema-less Databases</div>
              <div class="db-sub-grid">
                <div class="db-item-card">
                  <h4>Firestore</h4>
                  <p>Stateless serverless JSON document database with real-time sync for client applications.</p>
                  <div class="db-tag-spec">Ideal for: Mobile profiles and transactional state trees</div>
                </div>
                <div class="db-item-card">
                  <h4>Cloud Bigtable</h4>
                  <p>Wide-column analytical database processing petabytes of low-latency telemetry clickstreams.</p>
                  <div class="db-tag-spec">Hotspotting warning: Always design non-sequential row keys</div>
                </div>
                <div class="db-item-card">
                  <h4>Cloud Memorystore</h4>
                  <p>In-memory Redis/Memcached cache layer for rapid sub-millisecond application responses.</p>
                  <div class="db-tag-spec">Ideal for: Database cache shields</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (topicId === "vpc-routing") {
      return `
        <div class="syl-visual-vpc">
          <div class="visual-header-sub"><i class="fa-solid fa-route text-purple"></i> VPC Networking Topologies: Sharing, Peering, & Gateways</div>
          <div class="vpc-grid-container">
            <div class="vpc-box">
              <h3><i class="fa-solid fa-share-nodes text-purple"></i> Shared VPC Scope</h3>
              <p>A designated <strong>Host Project</strong> provisions the global VPC, subnets, routers, and firewall rules.</p>
              <p>Granular IAM ties <strong>Service Projects</strong> to subnets, allowing developers to deploy GCE VMs directly while network admins lock down network topology.</p>
            </div>
            
            <div class="vpc-box">
              <h3><i class="fa-solid fa-arrows-left-right text-blue"></i> VPC Peering Link</h3>
              <p>Connects two distinct, isolated VPC networks (even across different organizations) using internal private IP routing.</p>
              <p><strong>Rules:</strong> Non-transitive. Subnet CIDR ranges must NOT overlap, otherwise the peering binding fails.</p>
            </div>
            
            <div class="vpc-box">
              <h3><i class="fa-solid fa-shield-halved text-green"></i> Private Google Access</h3>
              <p>A subnet-level toggle enabling GCE VMs hosting <i>only private internal IPs</i> to query Google APIs (GCS, BigQuery) securely.</p>
              <p><strong>Benefits:</strong> VM network requests are routed internally inside Google's fiber lines, completely avoiding the public internet.</p>
            </div>
          </div>
        </div>
      `;
    }

    if (topicId === "hybrid-lb") {
      return `
        <div class="syl-visual-hybrid">
          <div class="visual-header-sub"><i class="fa-solid fa-route text-blue"></i> Hybrid Connections & Load Balancing Branches</div>
          <div class="hybrid-grid">
            <div class="hybrid-section">
              <h3><i class="fa-solid fa-network-wired text-blue"></i> Hybrid WAN Connections</h3>
              <div class="hybrid-card">
                <strong>Cloud HA VPN (IPSec)</strong>
                <p>Secure encrypted tunnels routed over public internet using BGP via Cloud Router. Single gateway must host 2 active tunnels across independent public interfaces to hit the <strong>99.99% SLA</strong>.</p>
              </div>
              <div class="hybrid-card">
                <strong>Dedicated Interconnect</strong>
                <p>Direct physical fiber cable running between client data center and Google edge co-location cages. Available in 10Gbps or 100Gbps lanes, supporting high traffic pipelines.</p>
              </div>
            </div>
            
            <div class="hybrid-section">
              <h3><i class="fa-solid fa-shuffle text-purple"></i> Cloud Load Balancing (CLB)</h3>
              <div class="hybrid-card">
                <strong>Application LB (Layer 7 HTTP/HTTPS)</strong>
                <p>Manages HTTP traffic. Exposes a single global IP address, providing content path/host-based routing, edge caching via Cloud CDN, and SSL handshakes.</p>
              </div>
              <div class="hybrid-card">
                <strong>Network LB (Layer 4 TCP/UDP)</strong>
                <p><strong>Proxy:</strong> Terminates non-HTTP TCP/SSL requests at the nearest edge.<br><strong>Passthrough:</strong> Preserves client header IPs, routing raw high-throughput packets regionally.</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (topicId === "bigdata-pipelines") {
      return `
        <div class="syl-visual-bigdata">
          <div class="visual-header-sub"><i class="fa-solid fa-chart-line text-blue"></i> GCP Big Data Processing: End-to-End Pipeline</div>
          <div class="bigdata-flow">
            <div class="bigdata-step">
              <div class="bigdata-icon"><i class="fa-solid fa-envelope-open-text text-yellow"></i></div>
              <h4>Ingest</h4>
              <strong>Cloud Pub/Sub</strong>
              <p>Serverless event broker ingesting and decoupling real-time stream logs globally.</p>
            </div>
            <div class="bigdata-arrow"><i class="fa-solid fa-right-long"></i></div>
            
            <div class="bigdata-step">
              <div class="bigdata-icon"><i class="fa-solid fa-code text-blue"></i></div>
              <h4>Process & ETL</h4>
              <strong>Dataflow vs Dataproc</strong>
              <p><strong>Dataflow:</strong> Serverless stream/batch Apache Beam ETL.<br><strong>Dataproc:</strong> Managed Spark/Hadoop clusters migrating legacy code using Spot VMs.</p>
            </div>
            <div class="bigdata-arrow"><i class="fa-solid fa-right-long"></i></div>
            
            <div class="bigdata-step">
              <div class="bigdata-icon"><i class="fa-solid fa-table text-green"></i></div>
              <h4>Warehousing</h4>
              <strong>BigQuery SQL</strong>
              <p>Serverless petabyte-scale analytics. Minimize query costs using table Partitioning and Clustering.</p>
            </div>
            <div class="bigdata-arrow"><i class="fa-solid fa-right-long"></i></div>
            
            <div class="bigdata-step">
              <div class="bigdata-icon"><i class="fa-solid fa-chart-pie text-purple"></i></div>
              <h4>Insights</h4>
              <strong>Looker Studio</strong>
              <p>Create visual interactive reports and business intelligence dashboards.</p>
            </div>
          </div>
        </div>
      `;
    }

    if (topicId === "integration-ops") {
      return `
        <div class="syl-visual-integration">
          <div class="visual-header-sub"><i class="fa-solid fa-sliders text-blue"></i> Pub/Sub Event Broker & Declarative IaC Flow</div>
          <div class="integration-grid">
            <div class="integration-box">
              <h3><i class="fa-solid fa-envelope-open-text text-yellow"></i> Pub/Sub Decoupled Flow</h3>
              <div class="pubsub-flow-diag">
                <div class="pub-node pub">Publisher VM (Event Ingest)</div>
                <div class="pub-arrow"><i class="fa-solid fa-arrow-down"></i></div>
                <div class="pub-node topic">Topic Message Broker</div>
                <div class="pub-arrow"><i class="fa-solid fa-arrow-down"></i></div>
                <div class="pub-node sub">Subscription: Push (Webhook) vs Pull (Poll)</div>
                <div class="pub-arrow"><i class="fa-solid fa-arrow-down"></i></div>
                <div class="pub-node subber">Subscriber VM / Cloud Run Workers</div>
              </div>
              <p class="diag-note">Messages are retained for up to 7 days. Ordering keys enforce FIFO sequences.</p>
            </div>
            
            <div class="integration-box">
              <h3><i class="fa-solid fa-cubes text-blue"></i> Infrastructure-as-Code (IaC)</h3>
              <div class="iac-split">
                <div class="iac-item">
                  <strong>Deployment Manager</strong>
                  <p>Google's native declarative deployment engine. Blueprints are defined in YAML manifests, incorporating Python or Jinja2 template blueprints.</p>
                </div>
                <div class="iac-item">
                  <strong>Config Connector</strong>
                  <p>Kubernetes operator addon enabling engineers to declare and provision Google Cloud services directly through standard Kubernetes YAML manifests.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (topicId === "iam-security-deep") {
      return `
        <div class="syl-visual-iam">
          <div class="visual-header-sub"><i class="fa-solid fa-shield-halved text-red"></i> GCP Resource Hierarchy & IAM Policy Bindings</div>
          <div class="iam-layout">
            <!-- Resource Hierarchy -->
            <div class="iam-column hierarchy">
              <h3>Resource Hierarchy (Policy Inheritance)</h3>
              <div class="hierarchy-tree">
                <div class="tree-node org"><i class="fa-solid fa-sitemap text-red"></i> Organization Level</div>
                <div class="tree-line">|</div>
                <div class="tree-node folder"><i class="fa-solid fa-folder-open text-yellow"></i> Folders (Departments / Environments)</div>
                <div class="tree-line">|</div>
                <div class="tree-node project"><i class="fa-solid fa-square-poll-vertical text-blue"></i> Projects (Resource isolation boundary)</div>
                <div class="tree-line">|</div>
                <div class="tree-node resource"><i class="fa-solid fa-cube text-green"></i> Individual Resources (VMs, Buckets, DBs)</div>
              </div>
              <p class="diag-note">Permissions inherit downwards. A child resource cannot override an inherited ALLOW policy.</p>
            </div>
            
            <!-- Policy Binding -->
            <div class="iam-column binding">
              <h3>IAM Policy Binding Formula</h3>
              <div class="binding-box">
                <div class="bind-part text-blue">
                  <strong>WHO (Member Identity)</strong>
                  <span>User email, Workspace Group, Service Account, or Domain</span>
                </div>
                <div class="bind-plus">+</div>
                <div class="bind-part text-purple">
                  <strong>WHAT (Access Role)</strong>
                  <span>Primitive (Owner/Editor), Predefined (Least privilege), or Custom Roles</span>
                </div>
                <div class="bind-equals">=</div>
                <div class="bind-part text-green">
                  <strong>IAM Policy Binding</strong>
                  <span>Applies securely to resource metadata to authorize API requests</span>
                </div>
              </div>
              <div class="vm-sa-security">
                <strong>VM Machine Access Best Practice:</strong>
                <p>Attach Service Accounts directly to GCE VMs/Pods and use Application Default Credentials (ADC) to generate tokens. <strong>Never download private JSON keys</strong> to VMs due to leak risks.</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (topicId === "ops-billing") {
      return `
        <div class="syl-visual-ops">
          <div class="visual-header-sub"><i class="fa-solid fa-chart-pie text-green"></i> Ops Suite Log Router Sinks & Billing Export Cycles</div>
          <div class="ops-billing-grid">
            <!-- Logging Sinks -->
            <div class="ops-billing-card">
              <h3><i class="fa-solid fa-chart-line text-purple"></i> Logging & Agent Routing Sinks</h3>
              <div class="ops-flow-diagram">
                <div class="ops-node origin">Compute Engine VM (install Ops Agent for RAM/Disk)</div>
                <div class="ops-arrow"><i class="fa-solid fa-arrow-down"></i></div>
                <div class="ops-node router">Cloud Log Router Filter Sinks</div>
                <div class="ops-sinks-grid">
                  <div class="sink-box"><i class="fa-solid fa-box-archive text-yellow"></i><br><strong>Cloud Storage</strong><br>Cheap 7y archive</div>
                  <div class="sink-box"><i class="fa-solid fa-database text-blue"></i><br><strong>BigQuery</strong><br>SQL log analytics</div>
                  <div class="sink-box"><i class="fa-solid fa-envelope text-purple"></i><br><strong>Pub/Sub</strong><br>Alert triggers</div>
                </div>
              </div>
            </div>
            
            <!-- Billing Export -->
            <div class="ops-billing-card">
              <h3><i class="fa-solid fa-credit-card text-green"></i> Billing Cost Control Lifecycle</h3>
              <div class="billing-flow-diagram">
                <div class="bill-step">
                  <strong>Central Billing Account</strong>
                  <span>Assigned to multiple projects to pay for resource usage.</span>
                </div>
                <div class="bill-arrow"><i class="fa-solid fa-arrow-down"></i></div>
                <div class="bill-step">
                  <strong>Budget Alerts</strong>
                  <span>Budgets send emails at 50%, 90%, 100%. *Does not stop resources unless bound via Pub/Sub to Cloud Functions.*</span>
                </div>
                <div class="bill-arrow"><i class="fa-solid fa-arrow-down"></i></div>
                <div class="bill-step">
                  <strong>BigQuery Cost Export</strong>
                  <span>Dumps daily cost usage logs directly to BigQuery for SQL dashboards.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (topicId === "kms-encryption") {
      return `
        <div class="syl-visual-kms">
          <div class="visual-header-sub"><i class="fa-solid fa-key text-red"></i> GCP Cryptographic Key Management & Secret Paradigms</div>
          <div class="serverless-matrix-grid">
            <div class="sless-card" style="border-top: 4px solid var(--primary);">
              <div class="sless-badge badge-blue">GMEK</div>
              <h3>Google-Managed Keys</h3>
              <div class="sless-use"><strong>Google Custody:</strong> Default transparent encryption. Zero administrative work.</div>
              <ul class="sless-details">
                <li>Google automatically handles key generation, encryption, and quarterly rotation parameters.</li>
                <li>Keys are stored inside Google's secure operational accounts (not visible to users).</li>
                <li>Billed at zero key-management overhead.</li>
              </ul>
            </div>
            
            <div class="sless-card" style="border-top: 4px solid var(--accent-purple);">
              <div class="sless-badge badge-purple">CMEK</div>
              <h3>Customer-Managed Keys</h3>
              <div class="sless-use"><strong>Shared Custody:</strong> Keys reside inside customer-owned KMS Project Key Rings.</div>
              <ul class="sless-details">
                <li><strong>Full Control:</strong> Customer manages IAM decrypter roles, manual rotations, and key usage logs.</li>
                <li>Integrates natively with major services (GCS Buckets, GCE disks, BigQuery).</li>
                <li>Enables key disablement to freeze database resources instantly.</li>
              </ul>
            </div>
            
            <div class="sless-card" style="border-top: 4px solid var(--accent-red);">
              <div class="sless-badge badge-red" style="background: rgba(234, 67, 53, 0.15); color: var(--accent-red);">CSEK</div>
              <h3>Customer-Supplied Keys</h3>
              <div class="sless-use"><strong>Customer Custody:</strong> Keys generated and held in on-premises vaults.</div>
              <ul class="sless-details">
                <li>Raw key strings are sent directly inside header VM boot parameters or gsutil files.</li>
                <li>Google uses keys strictly in GCE RAM and **wipes them immediately after operation**.</li>
                <li><strong>Caution:</strong> If keys are lost, Google cannot decrypt any data assets.</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    return `<p class="text-secondary" style="font-size: 13px;">Diagram context is being prepared for this domain topic.</p>`;
  }

  // ==========================================================================
  // PARAMS REPLACEMENT ENGINE
  // ==========================================================================
  function substituteCommandParams(cmd) {
    const proj = document.getElementById("param-project").value || "my-ace-project-123";
    const vm = document.getElementById("param-vm").value || "web-server-prod";
    const zone = document.getElementById("param-zone").value || "us-central1-a";
    const bucket = document.getElementById("param-bucket").value || "company-audit-logs-unique";
    const cluster = document.getElementById("param-cluster").value || "production-k8s";
    const sa = document.getElementById("param-sa").value || "compute-reader-sa";
    const template = document.getElementById("param-template").value || "standard-e2-template";
    const size = document.getElementById("param-size").value || "200GB";
    const member = document.getElementById("param-member").value || "user:dev@company.com";
    const role = document.getElementById("param-role").value || "roles/storage.objectViewer";

    const region = zone.substring(0, zone.lastIndexOf("-")) || "us-central1";

    return cmd
      .replace(/\[PROJECT_ID\]/g, proj)
      .replace(/\[PROJECT\]/g, proj)
      .replace(/\[VM_NAME\]/g, vm)
      .replace(/\[ZONE\]/g, zone)
      .replace(/\[BUCKET_NAME\]/g, bucket)
      .replace(/\[GKE_CLUSTER\]/g, cluster)
      .replace(/\[CLUSTER_NAME\]/g, cluster)
      .replace(/\[SERVICE_ACCOUNT\]/g, sa)
      .replace(/\[VM_TEMPLATE\]/g, template)
      .replace(/\[DISK_SIZE\]/g, size)
      .replace(/\[DISK_NAME\]/g, `${vm}-disk`)
      .replace(/\[MEMBER\]/g, member)
      .replace(/\[ROLE\]/g, role)
      .replace(/\[LOCATION\]/g, region)
      .replace(/\[REGION\]/g, region)
      .replace(/\[CLASS\]/g, "standard")
      .replace(/\[IMAGE\]/g, `gcr.io/${proj}/nginx:alpine`)
      .replace(/\[DATASET_NAME\]/g, "analytic_dataset")
      .replace(/\[LOCAL_PATH\]/g, "report.csv")
      .replace(/\[REMOTE_PATH\]/g, "exports/");
  }

  // CLI Parameters Input listener updates
  const allParamIds = ["param-project", "param-vm", "param-zone", "param-bucket", "param-cluster", "param-sa", "param-template", "param-size", "param-member", "param-role"];
  allParamIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        if (state.activeTab === "commands") renderCommandsList();
      });
    }
  });

  // Reset Progress trigger
  document.querySelector(".reset-study-progress").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your study checklist progress?")) {
      state.completedTopics = [];
      localStorage.removeItem("gcp_completed_topics");
      localStorage.removeItem("gcp_quiz_best_success");
      state.flashcards.mastered = [];
      localStorage.removeItem("gcp_mastered_flashcards");
      showToast("Progress records reset successfully.");
      switchTab("dashboard");
    }
  });

  // Clickable Stats tab-switching navigation
  document.querySelectorAll(".stat-card.clickable-stat").forEach(card => {
    card.addEventListener("click", () => {
      const target = card.getAttribute("data-target");
      if (target) {
        switchTab(target);
      }
    });
  });

  // ==========================================================================
  // SERVICES TAB: FLIP GRID & VISUAL ARCHITECTURE BOX MAPS
  // ==========================================================================
  // ==========================================================================
  // SERVICES TAB: ARCHITECTURE MAP (4-Column Layout with Pop-Up Details Modal)
  // ==========================================================================
  function renderVisualArchitectureMap() {
    if (!architectureMapContainer) return;
    architectureMapContainer.innerHTML = "";

    // Categories structure of our visual tree box maps (5 columns matching the approved plan)
    const MAP_GROUPS = [
      {
        id: "compute",
        title: "Compute & Hosting Models",
        icon: "fa-laptop-code text-blue",
        subs: [
          { title: "Infrastructure (IaaS)", nodes: ["compute-engine"] },
          { title: "Containers & CaaS", nodes: ["gke", "cloud-run"] },
          { title: "PaaS Hosting", nodes: ["app-engine"] },
          { title: "Event FaaS Runtimes", nodes: ["cloud-functions"] }
        ]
      },
      {
        id: "storage",
        title: "Storage & Shared Files",
        icon: "fa-hard-drive text-yellow",
        subs: [
          { title: "Durable Object Store", nodes: ["cloud-storage"] },
          { title: "Block Volumes", nodes: ["persistent-disks", "local-ssds"] },
          { title: "Shared POSIX Files", nodes: ["cloud-filestore"] },
          { title: "Integration Services", nodes: ["pubsub"] }
        ]
      },
      {
        id: "database",
        title: "Databases & Big Data",
        icon: "fa-database text-green",
        subs: [
          { title: "Relational (SQL)", nodes: ["cloud-sql", "cloud-spanner"] },
          { title: "Non-Relational (NoSQL)", nodes: ["firestore", "cloud-bigtable", "memorystore"] },
          { title: "Big Data Analytics", nodes: ["cloud-dataflow", "cloud-dataproc", "bigquery"] }
        ]
      },
      {
        id: "networking",
        title: "VPC Core & Edge Network",
        icon: "fa-route text-purple",
        subs: [
          { title: "Foundations & Routing", nodes: ["vpc", "vpc-peering", "shared-vpc"] },
          { title: "Hybrid Connectors", nodes: ["cloud-vpn", "cloud-interconnect"] },
          { title: "Edge & Delivery", nodes: ["cloud-load-balancing", "cloud-dns"] }
        ]
      },
      {
        id: "governance",
        title: "Access, Security & Encryption, Operations & Gov",
        icon: "fa-shield-halved text-red",
        subs: [
          { title: "Access & Identity (IAM)", nodes: ["iam", "service-accounts"] },
          { title: "Security & Encryption", nodes: ["cloud-kms"] },
          { title: "Operations Management", nodes: ["cloud-operations", "pricing-calculator"] },
          { title: "Infrastructure Governance", nodes: ["deployment-manager", "cloud-foundation-toolkit", "cloud-marketplace"] }
        ]
      }
    ];

    MAP_GROUPS.forEach(grp => {
      const box = document.createElement("div");
      box.className = `map-category-box ${grp.id}`;
      box.innerHTML = `
        <div class="map-category-header">
          <i class="fa-solid ${grp.icon}"></i>
          <h3>${grp.title}</h3>
        </div>
        <div class="map-nested-layout">
          ${grp.subs.map(sub => `
            <div class="map-sub-group">
              <span class="map-sub-group-title">${sub.title}</span>
              ${sub.nodes.map(nId => {
                const srv = db.services.find(s => s.id === nId);
                if (!srv) return "";
                
                let categoryIcon = "fa-circle-play";
                if (srv.category === "Compute") categoryIcon = "fa-laptop-code";
                else if (srv.category === "Storage") categoryIcon = "fa-hard-drive";
                else if (srv.category === "Database") categoryIcon = "fa-database";
                else if (srv.category === "Networking") categoryIcon = "fa-route";
                else if (srv.category === "Analytics") categoryIcon = "fa-chart-pie";
                else if (srv.category === "Integration") categoryIcon = "fa-shuffle";
                else if (srv.category === "Management") categoryIcon = "fa-screwdriver-wrench";
                else if (srv.category === "Security") categoryIcon = "fa-shield-halved";
                else if (srv.category === "Operations") categoryIcon = "fa-chart-line";

                return `
                  <button class="map-service-node" data-id="${nId}">
                    <i class="fa-solid ${categoryIcon}"></i>
                    <strong>${srv.name.split(" (")[0]}</strong>
                  </button>
                `;
              }).join("")}
            </div>
          `).join("")}
        </div>
      `;

      // Modal Details Drawer listener
      box.querySelectorAll(".map-service-node").forEach(btn => {
        btn.addEventListener("click", () => {
          const srvId = btn.getAttribute("data-id");
          const srv = db.services.find(s => s.id === srvId);
          if (srv) showServiceMapModal(srv);
        });
      });

      architectureMapContainer.appendChild(box);
    });
  }

  function showServiceMapModal(srv) {
    if (!serviceMapModal || !serviceMapModalBody) return;

    let lbFlowchartHtml = "";
    if (srv.id === "cloud-load-balancing") {
      lbFlowchartHtml = `
        <div style="margin-bottom:25px;">
          <h4 style="font-size:14px; font-weight:700; margin-bottom:8px; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-sitemap text-purple" style="color:var(--accent-purple);"></i> Decision Flowchart Map</h4>
          <p style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">Trace your exam scenario path through Layer 7 (HTTP/S) vs Layer 4 (TCP/UDP) protocols: </p>
          <div class="lb-flowchart-container">
            <div class="lb-branches">
              
              <!-- BRANCH 1: APPLICATION L7 LOAD BALANCER -->
              <div class="lb-branch">
                <div class="lb-branch-title l7">Application LB (Layer 7 HTTP/S)</div>
                
                <!-- Row 1: External vs Internal -->
                <div class="lb-row" style="margin-top:10px;">
                  <div class="lb-node orange"><strong>External</strong><span>Public Client Traffic</span></div>
                  <div class="lb-node orange"><strong>Internal</strong><span>Private VPC Traffic</span></div>
                </div>
                
                <div class="lb-connector">⬇</div>
                
                <!-- Row 2: Global/Regional vs Regional/Cross-Region -->
                <div class="lb-row">
                  <div class="lb-node green"><strong>Global</strong><span>Global Routing</span></div>
                  <div class="lb-node green"><strong>Regional</strong><span>Single Region</span></div>
                  <div class="lb-node green"><strong>Regional</strong><span>Single Region</span></div>
                  <div class="lb-node green"><strong>Cross-region</strong><span>Multi-region Private</span></div>
                </div>
                
                <div class="lb-connector">⬇</div>
                
                <!-- Row 3: Final Load Balancer Products -->
                <div class="lb-row">
                  <div class="lb-final-node" title="Terminates HTTP/S at Edge globally">Global external Application LB</div>
                  <div class="lb-final-node" title="Terminates HTTP/S in single region">Regional external Application LB</div>
                  <div class="lb-final-node" title="Internal proxy in single region">Regional internal Application LB</div>
                  <div class="lb-final-node" title="Internal proxy across regions">Cross-region internal Application LB</div>
                </div>
              </div>
              
              <!-- BRANCH 2: NETWORK L4 LOAD BALANCER -->
              <div class="lb-branch">
                <div class="lb-branch-title l4">Network LB (Layer 4 TCP/UDP)</div>
                
                <!-- Row 1: Proxy vs Passthrough -->
                <div class="lb-row" style="margin-top:10px;">
                  <div class="lb-node purple"><strong>Proxy</strong><span>Terminates Client SSL/TCP</span></div>
                  <div class="lb-node purple"><strong>Passthrough</strong><span>Preserves Client IP Packets</span></div>
                </div>
                
                <div class="lb-connector">⬇</div>
                
                <!-- Row 2: Proxy Ext/Int vs Passthrough Ext/Int -->
                <div class="lb-row">
                  <div class="lb-node orange"><strong>External</strong><span>Public Proxy</span></div>
                  <div class="lb-node orange"><strong>Internal</strong><span>Private Proxy</span></div>
                  <div class="lb-node orange"><strong>External</strong><span>Public Direct</span></div>
                  <div class="lb-node orange"><strong>Internal</strong><span>Private Direct</span></div>
                </div>
                
                <div class="lb-connector">⬇</div>
                
                <!-- Row 3: Global/Regional Decisions -->
                <div class="lb-row">
                  <div class="lb-node green"><strong>Global / Regional</strong><span>TCP/TLS Proxy</span></div>
                  <div class="lb-node green"><strong>Regional / Cross-Reg</strong><span>Internal TCP Proxy</span></div>
                  <div class="lb-node green"><strong>Regional</strong><span>L4 External Passthrough</span></div>
                  <div class="lb-node green"><strong>Regional</strong><span>L4 Internal Passthrough</span></div>
                </div>
                
                <div class="lb-connector">⬇</div>
                
                <!-- Row 4: Final Products -->
                <div class="lb-row">
                  <div class="lb-final-node" title="Proxy external TCP/TLS globally/regionally">Global/Regional external proxy Network LB</div>
                  <div class="lb-final-node" title="Proxy internal TCP/TLS regionally/cross-region">Regional/Cross-region internal proxy Network LB</div>
                  <div class="lb-final-node" title="Direct external TCP/UDP regionally">Regional external passthrough Network LB</div>
                  <div class="lb-final-node" title="Direct internal TCP/UDP regionally">Regional internal passthrough Network LB</div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      `;
    }

    serviceMapModalBody.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-color); padding-bottom:15px; margin-bottom: 20px;">
        <span class="category-pill">${srv.category} Architecture</span>
        <h2 style="font-size:24px; margin-top:8px;">${srv.name}</h2>
        <p style="font-size:13px; color:var(--text-secondary); margin-top:8px; margin-bottom:12px;">${srv.description}</p>
        ${srv.docLink ? `
          <a href="${srv.docLink}" target="_blank" class="btn btn-secondary btn-small" style="font-size:11px; padding: 6px 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px;"></i> Know More (Official Documentation)
          </a>
        ` : ""}
      </div>

      ${lbFlowchartHtml}

      <div style="margin-bottom:20px;">
        <h4 style="font-size:14px; font-weight:700; margin-bottom:8px;"><i class="fa-solid fa-list-check text-blue"></i> Technical Specifications</h4>
        <ul style="padding-left: 20px; font-size:12px; color:var(--text-secondary); display:flex; flex-direction:column; gap:6px;">
          ${srv.keyFeatures.map(f => `<li>${f}</li>`).join("")}
        </ul>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
        <div style="background: rgba(52, 168, 83, 0.05); padding:15px; border-radius:8px; border:1px solid rgba(52,168,83,0.15);">
          <h4 style="font-size:13px; color:var(--accent-green); font-weight:700; margin-bottom:8px;"><i class="fa-solid fa-thumbs-up"></i> When to Use</h4>
          <ul style="padding-left:15px; font-size:11px; color:var(--text-secondary); display:flex; flex-direction:column; gap:4px;">
            ${srv.whenToUse.map(w => `<li>${w}</li>`).join("")}
          </ul>
        </div>
        <div style="background: rgba(234, 67, 53, 0.05); padding:15px; border-radius:8px; border:1px solid rgba(234,67,53,0.15);">
          <h4 style="font-size:13px; color:#ea4335; font-weight:700; margin-bottom:8px;"><i class="fa-solid fa-thumbs-down"></i> When NOT to Use</h4>
          <ul style="padding-left:15px; font-size:11px; color:var(--text-secondary); display:flex; flex-direction:column; gap:4px;">
            ${srv.whenNotToUse.map(w => `<li>${w}</li>`).join("")}
          </ul>
        </div>
      </div>

      <div style="background:var(--bg-active); border:1px solid var(--border-color); padding:15px; border-radius:8px; margin-bottom:20px;">
        <h4 style="font-size:13px; color:var(--primary); font-weight:700; margin-bottom:6px;"><i class="fa-solid fa-award"></i> GCP ACE Exam Pro-Tip</h4>
        <p style="font-size:12px; line-height:1.5; color:var(--text-primary);">${srv.examTips[0] || "Remember operational properties of this resource."}</p>
      </div>

      <div>
        <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;"><i class="fa-solid fa-terminal text-green"></i> Provisioning Commands</h4>
        ${srv.cliCommands && srv.cliCommands.length > 0 ? srv.cliCommands.map(cmd => `
          <div class="code-clipboard-block" style="margin-top:6px;">
            <div class="code-header" style="padding:6px 12px; font-size:10px;">
              <span>${cmd.desc}</span>
              <button class="copy-cmd-btn" data-raw="${cmd.command}" style="font-size:9px; padding:2px 8px;">
                <i class="fa-regular fa-copy"></i> Copy
              </button>
            </div>
            <div class="code-body" style="padding:10px 14px;">
              <pre><code style="font-size:11px;">${substituteCommandParams(cmd.command)}</code></pre>
            </div>
          </div>
        `).join("") : `<span style="font-size:11px; color:var(--text-muted);">No deployment commands associated with this component.</span>`}
      </div>
    `;

    serviceMapModalBody.querySelectorAll(".copy-cmd-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        copyToClipboard(substituteCommandParams(btn.getAttribute("data-raw")));
      });
    });

    serviceMapModal.classList.remove("hidden");
  }

  // Close modal bindings
  if (btnCloseMapModal) {
    btnCloseMapModal.addEventListener("click", () => serviceMapModal.classList.add("hidden"));
  }
  if (serviceMapModal) {
    serviceMapModal.addEventListener("click", (e) => {
      if (e.target === serviceMapModal) serviceMapModal.classList.add("hidden");
    });
  }


  // ==========================================================================
  // DECISION MATRIX WIZARD - 6 ADVANCED TOPICS
  // ==========================================================================
  const WIZARD_DECISIONS = {
    compute: {
      title: "Compute Hosting Model",
      steps: [
        {
          id: "c-1",
          question: "Do you require direct administrator/OS access or kernel-level customized drivers?",
          subtext: "Determine if raw VM Infrastructure is required.",
          options: [
            { text: "Yes, full OS management is mandatory", next: "RESULT:compute-engine" },
            { text: "No, container or platform sandboxes are acceptable", next: "c-2" }
          ]
        },
        {
          id: "c-2",
          question: "Is your application already packaged as a Docker container image?",
          subtext: "GCP handles container orchestration smoothly.",
          options: [
            { text: "Yes, it is fully containerized", next: "c-3" },
            { text: "No, it is just raw code (Node, Python, Java, Go)", next: "c-4" }
          ]
        },
        {
          id: "c-3",
          question: "Does your architecture demand Kubernetes APIs or complex microservice orchestration?",
          subtext: "Assess standard container scaling against simpler serverless platforms.",
          options: [
            { text: "Yes, Kubernetes API clusters are needed", next: "RESULT:gke" },
            { text: "No, simple serverless web containers are fine", next: "RESULT:cloud-run" }
          ]
        },
        {
          id: "c-4",
          question: "What represents your application invocation trigger model?",
          subtext: "Distinguish between long-lived web services and ephemeral tasks.",
          options: [
            { text: "Standard web API running continuously", next: "RESULT:app-engine" },
            { text: "Occasionally triggered event functions (e.g. storage uploads)", next: "RESULT:cloud-functions" }
          ]
        }
      ]
    },
    database: {
      title: "Managed Database Selection",
      steps: [
        {
          id: "d-1",
          question: "Do you require absolute SQL schema alignment and ACID transactions?",
          subtext: "Differentiate Relational database criteria from NoSQL.",
          options: [
            { text: "Yes, relational SQL schema properties are mandatory", next: "d-2" },
            { text: "No, semi-structured NoSQL schemas are optimal", next: "d-3" }
          ]
        },
        {
          id: "d-2",
          question: "What represents the geographic write scalability demands of your SQL database?",
          subtext: "Compare regional SQL against global horizontal multi-region write scalability.",
          options: [
            { text: "Regional scope (<64TB databases)", next: "RESULT:cloud-sql" },
            { text: "Global multi-region synchronous SQL writes", next: "RESULT:cloud-spanner" }
          ]
        },
        {
          id: "d-3",
          question: "What represents the data model structure or write velocity?",
          subtext: "Match JSON profiles to low-latency time-series streams.",
          options: [
            { text: "Hierarchical JSON documents (profiles, shopping carts)", next: "RESULT:firestore" },
            { text: "Extreme IoT time-series telemetry streams (>1TB)", next: "RESULT:cloud-bigtable" },
            { text: "Sub-millisecond in-memory session caches", next: "RESULT:memorystore" }
          ]
        }
      ]
    },
    storage: {
      title: "Storage Class & System Selection",
      steps: [
        {
          id: "s-1",
          question: "What represents the fundamental filesystem or bucket requirement?",
          subtext: "Choose between objects, block volumes, and NFS shared filesystems.",
          options: [
            { text: "Unstructured file storage (standard backups, media assets)", next: "RESULT:cloud-storage" },
            { text: "Durable block storage attached to GCE VM operating systems", next: "s-2" },
            { text: "Concurrent POSIX-compliant shared file directories", next: "RESULT:cloud-filestore" }
          ]
        },
        {
          id: "s-2",
          question: "Is raw I/O performance prioritized over durable persistent records?",
          subtext: "Compare network-attached drives against direct physical hardware.",
          options: [
            { text: "Durable persistent network drives (resizable online)", next: "RESULT:persistent-disks" },
            { text: "Ephemeral, ultra low-latency flash database scratchpads", next: "RESULT:local-ssds" }
          ]
        }
      ]
    },
    networking: {
      title: "Network Connectors & Routing",
      steps: [
        {
          id: "n-1",
          question: "What core network routing challenge are you planning?",
          subtext: "Differentiate hybrid corridors, VPC structures, and load balancing.",
          options: [
            { text: "Linking on-premises offices to secure internal cloud subnets", next: "n-2" },
            { text: "Distributing global web client traffic across multi-zone backends", next: "RESULT:cloud-load-balancing" },
            { text: "Sharing isolated subnet networks centrally across projects", next: "RESULT:shared-vpc" }
          ]
        },
        {
          id: "n-2",
          question: "What represents your network bandwidth and latency requirement?",
          subtext: "Compare public VPN tunnels against direct physical lines.",
          options: [
            { text: "Quick encrypted IPSec tunnels over public routes (99.99% SLA)", next: "RESULT:cloud-vpn" },
            { text: "Consistent multi-gigabit physical fiber connection", next: "RESULT:cloud-interconnect" }
          ]
        }
      ]
    },
    security: {
      title: "IAM Identity & Access Policy",
      steps: [
        {
          id: "sec-1",
          question: "Are you authorizing human developers or programmatic service processes?",
          subtext: "Select authorization contexts.",
          options: [
            { text: "Human developers or security managers", next: "sec-2" },
            { text: "Virtual Machines or GKE container microservices", next: "RESULT:service-accounts" }
          ]
        },
        {
          id: "sec-2",
          question: "What is your target policy granularity level?",
          subtext: "Determine standard role types.",
          options: [
            { text: "Preconfigured, Google-managed target jobs (e.g. storage admin)", next: "RESULT:iam" },
            { text: "Linux SSH login authorization based on human IAM profiles", next: "RESULT:iam" } // OS Login
          ]
        }
      ]
    },
    analytics: {
      title: "Big Data & Pipeline Workloads",
      steps: [
        {
          id: "a-1",
          question: "What represents the analytical model of your pipeline?",
          subtext: "Compare data warehousing, ETL streams, and open-source systems.",
          options: [
            { text: "Serverless SQL warehousing on petabytes of active datasets", next: "RESULT:bigquery" },
            { text: "Real-time streaming Apache Beam transform pipelines", next: "RESULT:cloud-dataflow" },
            { text: "Hadoop / Apache Spark cluster migrations (lift-and-shift)", next: "RESULT:cloud-dataproc" }
          ]
        }
      ]
    }
  };

  document.querySelectorAll(".wizard-choice-card").forEach(card => {
    card.addEventListener("click", () => {
      startWizard(card.getAttribute("data-wizard-type"));
    });
  });

  function startWizard(type) {
    state.wizard.type = type;
    state.wizard.currentStep = 2;
    state.wizard.history = [];
    state.wizard.answers = {};
    
    wizardStep1.classList.add("hidden");
    wizardStepQuestions.classList.remove("hidden");
    wizardStepResult.classList.add("hidden");
    
    renderWizardQuestion();
  }

  function renderWizardQuestion() {
    const flow = WIZARD_DECISIONS[state.wizard.type];
    if (!flow) return;

    const stepIdx = state.wizard.history.length;
    const step = flow.steps[stepIdx];

    if (!step) {
      showToast("Error traversing decision pathway.", false);
      resetWizard();
      return;
    }

    // Progress percentage
    const pct = (stepIdx / flow.steps.length) * 100;
    wizardProgressFill.style.width = `${pct}%`;

    wizardQuestionText.innerText = step.question;
    wizardQuestionSubtext.innerText = step.subtext;

    // Renders the visual pathway tree
    renderWizardPathVisualizer(flow, stepIdx, step);

    wizardOptionsContainer.innerHTML = "";
    step.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "wizard-option-btn";
      btn.innerHTML = `<span>${opt.text}</span> <i class="fa-solid fa-chevron-right"></i>`;
      
      btn.addEventListener("click", () => {
        state.wizard.history.push({
          stepId: step.id,
          question: step.question,
          answerSelected: opt.text
        });

        if (opt.next.startsWith("RESULT:")) {
          showWizardResult(opt.next.replace("RESULT:", ""));
        } else {
          renderWizardQuestion();
        }
      });
      
      wizardOptionsContainer.appendChild(btn);
    });

    wizardBackBtn.classList.toggle("hidden", state.wizard.history.length === 0);
  }

  function renderWizardPathVisualizer(flow, stepIdx, step) {
    wizardPathVisual.innerHTML = "";
    
    // Add Start Node
    const startNode = document.createElement("div");
    startNode.className = "path-node active";
    startNode.innerText = flow.title;
    wizardPathVisual.appendChild(startNode);

    // Render historical path taken in green
    state.wizard.history.forEach(hist => {
      const sep = document.createElement("i");
      sep.className = "fa-solid fa-chevron-right path-separator";
      wizardPathVisual.appendChild(sep);

      const node = document.createElement("div");
      node.className = "path-node active";
      node.innerText = hist.answerSelected.substring(0, 20) + "...";
      wizardPathVisual.appendChild(node);
    });

    // Render active question node
    if (step) {
      const sep = document.createElement("i");
      sep.className = "fa-solid fa-chevron-right path-separator";
      wizardPathVisual.appendChild(sep);

      const node = document.createElement("div");
      node.className = "path-node";
      node.style.borderColor = "var(--primary)";
      node.style.color = "var(--primary)";
      node.innerText = "Current Scenario Step";
      wizardPathVisual.appendChild(node);
    }
  }

  wizardBackBtn.addEventListener("click", () => {
    if (state.wizard.history.length > 0) {
      state.wizard.history.pop();
      renderWizardQuestion();
    }
  });

  function showWizardResult(srvId) {
    wizardStepQuestions.classList.add("hidden");
    wizardStepResult.classList.remove("hidden");

    const srv = db.services.find(s => s.id === srvId);
    const showcase = document.getElementById("wizard-recommendation-showcase");
    const reasoning = document.getElementById("wizard-reasoning-list");

    if (!srv) {
      showcase.innerHTML = `<h3>Recommendation: ${srvId}</h3>`;
      reasoning.innerHTML = "<li>Verify service parameters in the main catalog.</li>";
      return;
    }

    showcase.innerHTML = `
      <div class="glass-card" style="background: var(--bg-card-hover); border-color: var(--primary); text-align: left; box-shadow: var(--card-glow-blue);">
        <div class="card-top" style="margin-bottom: 8px;">
          <span class="card-category" style="color: var(--primary); font-weight:700;">CHOSEN ARCHITECTURE</span>
          <i class="fa-solid fa-cloud-bolt" style="font-size: 24px; color: var(--primary);"></i>
        </div>
        <h2 style="font-size: 22px; margin-bottom: 8px;">${srv.name}</h2>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">${srv.description}</p>
        <button class="btn btn-outline" id="wizard-goto-catalog" style="font-size:11px; padding: 6px 12px;">
          <i class="fa-solid fa-circle-info"></i> Expand Catalog Card
        </button>
      </div>
    `;

    reasoning.innerHTML = "";
    state.wizard.history.forEach(hist => {
      const li = document.createElement("li");
      li.innerHTML = `Because you chose <strong>"${hist.answerSelected}"</strong> to: <em>"${hist.question}"</em>`;
      reasoning.appendChild(li);
    });

    const tip = document.createElement("li");
    tip.innerHTML = `<strong>Exam Pro-Tip:</strong> ${srv.examTips[0]}`;
    reasoning.appendChild(tip);

    // Bind link to catalog card
    document.getElementById("wizard-goto-catalog").onclick = () => {
      switchTab("services");
      setTimeout(() => {
        showServiceMapModal(srv);
      }, 100);
    };

    logActivity("Decision Wizard", `Resolved recommendation: "${srv.name}"`, "completed");
  }

  function resetWizard() {
    state.wizard.type = null;
    state.wizard.history = [];
    state.wizard.answers = {};
    
    wizardStep1.classList.remove("hidden");
    wizardStepQuestions.classList.add("hidden");
    wizardStepResult.classList.add("hidden");
  }

  wizardRestartBtn.addEventListener("click", resetWizard);

  // ==========================================================================
  // CLI CHEAT SHEET LIBRARY
  // ==========================================================================
  function renderCommandCategories() {
    commandCatContainer.innerHTML = "";
    const categories = [...new Set(db.commands.map(cmd => cmd.category))];
    
    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = `command-cat-btn ${state.activeCommandCategory === cat ? "active" : ""}`;
      btn.innerText = cat;
      btn.onclick = () => {
        document.querySelectorAll(".command-cat-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeCommandCategory = cat;
        renderCommandsList();
      };
      commandCatContainer.appendChild(btn);
    });
  }

  function renderCommandsList() {
    commandListContainer.innerHTML = "";
    const list = db.commands.filter(c => c.category === state.activeCommandCategory);

    list.forEach(cmd => {
      const displayCmd = substituteCommandParams(cmd.command);
      const card = document.createElement("div");
      card.className = "command-card";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 8px;">
          <h4>${cmd.title}</h4>
          <span style="font-size:10px; background:var(--bg-active); color:var(--primary); padding:2px 8px; border-radius:4px; font-weight:700;">GCP SDK Command</span>
        </div>
        <p>${cmd.description}</p>
        <div class="code-clipboard-block">
          <div class="code-header">
            <span>Terminal Script</span>
            <button class="copy-cheat-btn" data-raw="${cmd.command}">
              <i class="fa-regular fa-copy"></i> Copy
            </button>
          </div>
          <div class="code-body">
            <pre><code>${displayCmd}</code></pre>
          </div>
        </div>
      `;

      card.querySelector(".copy-cheat-btn").addEventListener("click", () => {
        copyToClipboard(substituteCommandParams(cmd.command));
      });

      commandListContainer.appendChild(card);
    });
  }

  // ==========================================================================
  // EXAM & PRACTICE QUIZ ENGINE
  // ==========================================================================
  
  // Topic checkboxes listener
  const topicCheckboxes = document.querySelectorAll('input[name="quiz-topic"]');
  topicCheckboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      state.quiz.topicsSelected = Array.from(topicCheckboxes)
        .filter(c => c.checked)
        .map(c => c.value);
    });
  });

  // Size buttons configurations
  const sizeBtns = document.querySelectorAll(".quiz-size-btn");
  sizeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      sizeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.quiz.sizeConfig = btn.getAttribute("data-size");
    });
  });

  btnStartPractice.onclick = () => startQuiz("practice");
  btnStartExam.onclick = () => startQuiz("exam");
  retryQuizBtn.onclick = () => {
    quizResults.classList.add("hidden");
    quizLanding.classList.remove("hidden");
    clearInterval(state.quiz.timerInterval);
  };
  gotoSyllabusBtn.onclick = () => switchTab("syllabus");

  function startQuiz(mode) {
    state.quiz.mode = mode;
    state.quiz.currentIndex = 0;
    state.quiz.score = 0;
    state.quiz.selectedOptionIndex = null;
    state.quiz.isAnswered = false;
    state.quiz.flagged = {};
    state.quiz.answersHistory = [];
    clearInterval(state.quiz.timerInterval);

    let pool = [];

    if (mode === "practice") {
      // Filter by selected domains
      pool = db.quiz.filter(q => state.quiz.topicsSelected.includes(q.domain));
      if (pool.length === 0) {
        showToast("Please select at least one study domain category.", false);
        return;
      }
      
      // Shuffle & Slice by chosen size
      let size = 5;
      if (state.quiz.sizeConfig === "10") size = 10;
      else if (state.quiz.sizeConfig === "20") size = 20;
      else if (state.quiz.sizeConfig === "all") size = pool.length;

      pool.sort(() => 0.5 - Math.random());
      state.quiz.questions = pool.slice(0, Math.min(size, pool.length));
      
      // UI setups
      quizTimerContainer.classList.add("hidden");
      quizLiveScoreWrapper.classList.remove("hidden");
      logActivity("Practice Mode Launched", `Loaded ${state.quiz.questions.length} practice questions.`);
    } else {
      // Exam Mode: Exactly 50 random questions from the entire database pool
      pool = [...db.quiz].sort(() => 0.5 - Math.random());
      state.quiz.questions = pool.slice(0, Math.min(50, pool.length));
      
      // Setup 2 hours countdown
      state.quiz.timeRemaining = 7200; 
      quizTimerContainer.classList.remove("hidden");
      quizLiveScoreWrapper.classList.add("hidden");
      startExamTimer();
      logActivity("Exam Mode Initiated", "Simulated 2-hour official exam context activated.", "quiz");
    }

    quizLanding.classList.add("hidden");
    quizRunning.classList.remove("hidden");
    quizResults.classList.add("hidden");

    renderNavigatorGrid();
    loadQuestion();
  }

  function startExamTimer() {
    updateTimerDisplay();
    state.quiz.timerInterval = setInterval(() => {
      state.quiz.timeRemaining--;
      updateThemeTimerPulse();
      updateTimerDisplay();

      if (state.quiz.timeRemaining <= 0) {
        clearInterval(state.quiz.timerInterval);
        showToast("Time's up! Submitting exam automatically.", false);
        finishExam();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const hrs = Math.floor(state.quiz.timeRemaining / 3600);
    const mins = Math.floor((state.quiz.timeRemaining % 3600) / 60);
    const secs = state.quiz.timeRemaining % 60;
    
    quizTimerDisplay.innerText = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateThemeTimerPulse() {
    // Red pulse warning animation when under 10 minutes remaining
    if (state.quiz.timeRemaining <= 600) {
      quizTimerContainer.classList.add("pulse-red");
    } else {
      quizTimerContainer.classList.remove("pulse-red");
    }
  }

  function renderNavigatorGrid() {
    quizNavigatorGrid.innerHTML = "";
    state.quiz.questions.forEach((_, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-nav-btn";
      btn.innerText = idx + 1;
      
      // Jump directly to targeted question
      btn.onclick = () => {
        if (state.quiz.mode === "exam") {
          saveAnswerHistoryState();
          state.quiz.currentIndex = idx;
          loadQuestion();
        } else {
          showToast("Navigator grid navigation is exclusive to Exam Mode.", false);
        }
      };

      quizNavigatorGrid.appendChild(btn);
    });
  }

  function updateNavigatorVisuals() {
    const buttons = quizNavigatorGrid.querySelectorAll(".quiz-nav-btn");
    buttons.forEach((btn, idx) => {
      btn.className = "quiz-nav-btn";
      
      if (idx === state.quiz.currentIndex) btn.classList.add("active");
      
      const isAnswered = state.quiz.answersHistory[idx] !== undefined;
      if (isAnswered) btn.classList.add("answered");
      
      if (state.quiz.flagged[idx]) btn.classList.add("flagged");
    });
  }

  function saveAnswerHistoryState() {
    if (state.quiz.selectedOptionIndex !== null) {
      state.quiz.answersHistory[state.quiz.currentIndex] = state.quiz.selectedOptionIndex;
    }
  }

  function loadQuestion() {
    state.quiz.isAnswered = false;
    state.quiz.selectedOptionIndex = null;
    
    // Check if previously answered in history (Exam Mode traversal)
    if (state.quiz.mode === "exam" && state.quiz.answersHistory[state.quiz.currentIndex] !== undefined) {
      state.quiz.selectedOptionIndex = state.quiz.answersHistory[state.quiz.currentIndex];
      state.quiz.isAnswered = false; // let them edit selections
    }

    quizSubmitBtn.innerText = state.quiz.mode === "practice" ? "Submit Answer" : "Save & Continue";
    quizSubmitBtn.disabled = state.quiz.selectedOptionIndex === null;
    quizShowExplanationBtn.classList.add("hidden");
    quizExplanationDisplay.classList.add("hidden");

    const currentQ = state.quiz.questions[state.quiz.currentIndex];
    
    // Domain labels
    let domainLabel = "GCP ACE OBJECTIVES";
    if (currentQ.domain === "domain-1") domainLabel = "Domain 1: Compute";
    else if (currentQ.domain === "domain-2") domainLabel = "Domain 2: Storage & DB";
    else if (currentQ.domain === "domain-3") domainLabel = "Domain 3: Network";
    else if (currentQ.domain === "domain-4") domainLabel = "Domain 4: Analytics";
    else if (currentQ.domain === "domain-5") domainLabel = "Domain 5: Security";
    
    quizQuestionDomain.innerText = domainLabel;

    // Mark review button state
    const isFlagged = state.quiz.flagged[state.quiz.currentIndex];
    quizMarkReviewBtn.className = isFlagged ? "btn btn-outline btn-small flagged" : "btn btn-outline btn-small";
    document.getElementById("mark-review-text").innerText = isFlagged ? "Flagged for Review" : "Mark for Review";

    currentQIndexDisplay.innerText = state.quiz.currentIndex + 1;
    totalQCountDisplay.innerText = state.quiz.questions.length;
    liveCorrectCountDisplay.innerText = state.quiz.score;

    const progressPct = (state.quiz.currentIndex / state.quiz.questions.length) * 100;
    liveProgressFill.style.width = `${progressPct}%`;

    quizQuestionDisplay.innerHTML = currentQ.question;
    quizOptionsDisplay.innerHTML = "";

    currentQ.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = `quiz-option ${state.quiz.selectedOptionIndex === idx ? "selected" : ""}`;
      btn.innerHTML = `
        <div class="option-marker">${String.fromCharCode(65 + idx)}</div>
        <div class="option-text">${opt}</div>
      `;

      btn.addEventListener("click", () => {
        if (state.quiz.isAnswered && state.quiz.mode === "practice") return; // block edits after submission in practice
        
        quizOptionsDisplay.querySelectorAll(".quiz-option").forEach(el => el.classList.remove("selected"));
        btn.classList.add("selected");
        state.quiz.selectedOptionIndex = idx;
        quizSubmitBtn.disabled = false;
      });

      quizOptionsDisplay.appendChild(btn);
    });

    updateNavigatorVisuals();
  }

  // Mark for Review toggle
  quizMarkReviewBtn.onclick = () => {
    const idx = state.quiz.currentIndex;
    state.quiz.flagged[idx] = !state.quiz.flagged[idx];
    
    const isFlagged = state.quiz.flagged[idx];
    quizMarkReviewBtn.className = isFlagged ? "btn btn-outline btn-small flagged" : "btn btn-outline btn-small";
    document.getElementById("mark-review-text").innerText = isFlagged ? "Flagged for Review" : "Mark for Review";
    
    updateNavigatorVisuals();
  };

  // Submission handler
  quizSubmitBtn.addEventListener("click", () => {
    const currentQ = state.quiz.questions[state.quiz.currentIndex];

    if (state.quiz.mode === "practice") {
      // PRACTICE MODE SUBMIT
      if (!state.quiz.isAnswered) {
        state.quiz.isAnswered = true;
        const userSelection = state.quiz.selectedOptionIndex;
        const correct = currentQ.correctIndex;

        const options = quizOptionsDisplay.querySelectorAll(".quiz-option");
        options.forEach((el, idx) => {
          el.classList.remove("selected");
          if (idx === correct) el.classList.add("correct");
          if (idx === userSelection && userSelection !== correct) el.classList.add("incorrect");
        });

        if (userSelection === correct) {
          state.quiz.score++;
          showToast("Correct Answer!");
        } else {
          showToast("Incorrect selection.", false);
        }

        liveCorrectCountDisplay.innerText = state.quiz.score;
        quizExplanationText.innerHTML = currentQ.explanation;
        quizExplanationDisplay.classList.remove("hidden");
        quizShowExplanationBtn.classList.remove("hidden");

        quizSubmitBtn.innerText = state.quiz.currentIndex < state.quiz.questions.length - 1 ? "Next Question" : "Finish Practice";
      } else {
        // Advanced forward
        if (state.quiz.currentIndex < state.quiz.questions.length - 1) {
          state.quiz.currentIndex++;
          loadQuestion();
        } else {
          finishPractice();
        }
      }
    } else {
      // EXAM MODE CONTINUE (Save selection silently, advance automatically)
      saveAnswerHistoryState();
      if (state.quiz.currentIndex < state.quiz.questions.length - 1) {
        state.quiz.currentIndex++;
        loadQuestion();
      } else {
        // On 50th question, finish exam
        if (confirm("You have reached the end of the exam. Do you want to submit your responses for grading?")) {
          finishExam();
        }
      }
    }
  });

  quizShowExplanationBtn.addEventListener("click", () => {
    quizExplanationDisplay.classList.toggle("hidden");
  });

  function finishPractice() {
    quizRunning.classList.add("hidden");
    quizResults.classList.remove("hidden");
    postExamReviewContainer.classList.add("hidden"); // Practice has immediate reviews

    const total = state.quiz.questions.length;
    const score = state.quiz.score;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    document.getElementById("results-score-pct").innerText = `${pct}%`;
    document.getElementById("results-total-q").innerText = total;
    document.getElementById("results-correct-q").innerText = score;
    document.getElementById("results-incorrect-q").innerText = total - score;

    // High score save
    const saved = parseInt(localStorage.getItem("gcp_quiz_best_success") || "0");
    if (pct > saved) localStorage.setItem("gcp_quiz_best_success", `${pct}%`);

    const iconBox = document.getElementById("results-icon-container");
    const tag = document.getElementById("results-pass-fail-tag");
    const comments = document.getElementById("results-comment");

    document.getElementById("results-title").innerText = "Practice Assessment Results";

    if (pct >= 70) {
      iconBox.innerHTML = `<i class="fa-solid fa-trophy text-orange" style="color: var(--accent-orange);"></i>`;
      tag.className = "results-passing-tag pass";
      tag.innerText = "PASSED PRACTICE";
      comments.innerText = "Fantastic study progress! Keep mastering the remaining CLI variables.";
    } else {
      iconBox.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color: #ea4335;"></i>`;
      tag.className = "results-passing-tag fail";
      tag.innerText = "NEEDS RE-STUDY";
      comments.innerText = "A bit more review is recommended. Expand the scenario boxes in study topics to increase retention.";
    }

    updateGlobalProgress();
  }

  function finishExam() {
    clearInterval(state.quiz.timerInterval);
    saveAnswerHistoryState();

    quizRunning.classList.add("hidden");
    quizResults.classList.remove("hidden");

    const total = state.quiz.questions.length;
    let correct = 0;

    // Evaluation loop
    state.quiz.questions.forEach((q, idx) => {
      if (state.quiz.answersHistory[idx] === q.correctIndex) {
        correct++;
      }
    });

    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    document.getElementById("results-score-pct").innerText = `${pct}%`;
    document.getElementById("results-total-q").innerText = total;
    document.getElementById("results-correct-q").innerText = correct;
    document.getElementById("results-incorrect-q").innerText = total - correct;

    // High score save
    const saved = parseInt(localStorage.getItem("gcp_quiz_best_success") || "0");
    if (pct > saved) localStorage.setItem("gcp_quiz_best_success", `${pct}%`);

    const iconBox = document.getElementById("results-icon-container");
    const tag = document.getElementById("results-pass-fail-tag");
    const comments = document.getElementById("results-comment");

    document.getElementById("results-title").innerText = "Simulated Exam Results";

    if (pct >= 70) {
      iconBox.innerHTML = `<i class="fa-solid fa-award text-orange" style="color: var(--accent-orange); font-size: 55px;"></i>`;
      tag.className = "results-passing-tag pass";
      tag.innerText = "PASSED OFFICIAL BENCHMARK";
      comments.innerText = "Superb! You passed the 70% threshold. You are highly ready for the actual GCP Associate Cloud Engineer exam!";
    } else {
      iconBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:#ea4335; font-size: 55px;"></i>`;
      tag.className = "results-passing-tag fail";
      tag.innerText = "FAILED EXAM";
      comments.innerText = "Passing standard is 70%. Carefully review the detailed questions report below to master the incorrect items.";
    }

    // Dynamic question-by-question review block rendering
    renderPostExamQuestionReview();
    updateGlobalProgress();
  }

  function renderPostExamQuestionReview() {
    postExamReviewList.innerHTML = "";
    
    state.quiz.questions.forEach((q, idx) => {
      const userChoiceIdx = state.quiz.answersHistory[idx];
      const isCorrect = userChoiceIdx === q.correctIndex;
      
      const card = document.createElement("div");
      card.className = `post-exam-review-card ${isCorrect ? "correct" : "incorrect"}`;
      
      const userAnsText = userChoiceIdx !== undefined ? q.options[userChoiceIdx] : "Unanswered (No Option Selected)";
      const correctAnsText = q.options[q.correctIndex];

      card.innerHTML = `
        <div class="review-q-num">Question ${idx + 1} (${isCorrect ? "Correct" : "Incorrect"})</div>
        <div class="review-q-text">${q.question}</div>
        <div class="review-selections">
          <div>Your Selection: <span class="${isCorrect ? "correct" : "incorrect"}">${userAnsText}</span></div>
          ${!isCorrect ? `<div>Correct Answer: <span class="correct">${correctAnsText}</span></div>` : ""}
        </div>
        <div class="review-exp">
          <strong>Solution Guidelines:</strong> ${q.explanation}
        </div>
      `;

      postExamReviewList.appendChild(card);
    });

    postExamReviewContainer.classList.remove("hidden");
  }

  // ==========================================================================
  // GLOBAL SEARCH & INDEXING SYSTEM
  // ==========================================================================
  // Global search excised by request.

});
