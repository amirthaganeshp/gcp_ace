// GCP ACE Interactive Study Guide - Application Control Logic
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
      renderServicesGrid();
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
      
      <div class="topic-view-section">
        <h3><i class="fa-solid fa-circle-info text-blue"></i> Overview & Summary</h3>
        <p class="topic-summary">${topic.summary}</p>
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

  // ==========================================================================
  // SERVICES TAB: FLIP GRID & VISUAL ARCHITECTURE BOX MAPS
  // ==========================================================================
  btnServicesGrid.addEventListener("click", () => {
    state.serviceViewMode = "grid";
    btnServicesGrid.classList.add("active");
    btnServicesMap.classList.remove("active");
    servicesGridEl.classList.remove("hidden");
    servicesFilterBar.classList.remove("hidden");
    architectureMapContainer.classList.add("hidden");
  });

  btnServicesMap.addEventListener("click", () => {
    state.serviceViewMode = "map";
    btnServicesMap.classList.add("active");
    btnServicesGrid.classList.remove("active");
    servicesGridEl.classList.add("hidden");
    servicesFilterBar.classList.add("hidden");
    architectureMapContainer.classList.remove("hidden");
    renderVisualArchitectureMap();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.selectedServiceCategory = btn.getAttribute("data-category");
      renderServicesGrid();
    });
  });

  function renderServicesGrid() {
    servicesGridEl.innerHTML = "";
    const filteredServices = state.selectedServiceCategory === "all"
      ? db.services
      : db.services.filter(s => s.category.toLowerCase() === state.selectedServiceCategory.toLowerCase());
      
    if (filteredServices.length === 0) {
      servicesGridEl.innerHTML = `<div class="no-selection-placeholder" style="grid-column: 1/-1;">No services found for this category.</div>`;
      return;
    }

    filteredServices.forEach(srv => {
      const cardWrapper = document.createElement("div");
      cardWrapper.className = "service-card-wrapper";
      const card = document.createElement("div");
      card.className = "service-card";
      
      let categoryIcon = "fa-cloud";
      if (srv.category === "Compute") categoryIcon = "fa-laptop-code";
      else if (srv.category === "Storage") categoryIcon = "fa-hard-drive";
      else if (srv.category === "Database") categoryIcon = "fa-database";
      else if (srv.category === "Networking") categoryIcon = "fa-route";
      else if (srv.category === "Analytics") categoryIcon = "fa-chart-pie";
      else if (srv.category === "Integration") categoryIcon = "fa-shuffle";
      else if (srv.category === "Management") categoryIcon = "fa-screwdriver-wrench";
      else if (srv.category === "Security") categoryIcon = "fa-shield-halved";
      else if (srv.category === "Operations") categoryIcon = "fa-chart-line";

      card.innerHTML = `
        <div class="card-face card-front">
          <div class="card-top">
            <span class="card-category">${srv.category}</span>
            <i class="fa-solid ${categoryIcon} card-icon"></i>
          </div>
          <div>
            <h3>${srv.name}</h3>
            <p class="card-description">${srv.description}</p>
          </div>
          <span class="card-flip-prompt"><i class="fa-solid fa-arrows-rotate"></i> Flip details</span>
        </div>
        <div class="card-face card-back">
          <div class="card-back-title">
            <h4>${srv.name}</h4>
            <span>${srv.category}</span>
          </div>
          <ul class="card-features-list">
            ${srv.keyFeatures.slice(0, 3).map(feat => `<li>${feat}</li>`).join("")}
          </ul>
          <div class="card-tips-box">
            <strong>Pro-Tip:</strong>
            <p>${srv.examTips[0] || "Remember key configurations for provisioning."}</p>
          </div>
          <span class="card-flip-prompt" style="margin-top: 10px;"><i class="fa-solid fa-arrows-rotate"></i> Flip back</span>
        </div>
      `;

      card.addEventListener("click", () => card.classList.toggle("flipped"));
      cardWrapper.appendChild(card);
      servicesGridEl.appendChild(cardWrapper);
    });
  }

  function renderVisualArchitectureMap() {
    if (!architectureMapContainer) return;
    architectureMapContainer.innerHTML = "";

    // Categories structure of our visual tree box maps
    const MAP_GROUPS = [
      {
        id: "compute",
        title: "Compute & Hosting Models",
        icon: "fa-laptop-code text-blue",
        subs: [
          { title: "Infrastructure (IaaS)", nodes: ["compute-engine"] },
          { title: "Containers & serverless (CaaS)", nodes: ["gke", "cloud-run"] },
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
          { title: "Shared POSIX Files", nodes: ["cloud-filestore"] }
        ]
      },
      {
        id: "database",
        title: "Database Engines & Cache",
        icon: "fa-database text-green",
        subs: [
          { title: "Relational (SQL)", nodes: ["cloud-sql", "cloud-spanner"] },
          { title: "Non-Relational (NoSQL)", nodes: ["firestore", "cloud-bigtable"] },
          { title: "In-Memory Caches", nodes: ["memorystore"] }
        ]
      },
      {
        id: "networking",
        title: "Core VPC & Edge Network",
        icon: "fa-route text-purple",
        subs: [
          { title: "Foundations & Routing", nodes: ["vpc", "vpc-peering", "shared-vpc"] },
          { title: "Hybrid Connectors", nodes: ["cloud-vpn", "cloud-interconnect"] },
          { title: "Edge & Delivery", nodes: ["cloud-load-balancing", "cloud-dns"] }
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
                return `
                  <button class="map-service-node" data-id="${nId}">
                    <i class="fa-solid fa-circle-play"></i>
                    <strong>${srv.name.split(" (")[0]}</strong>
                  </button>
                `;
              }).join("")}
            </div>
          `).join("")}
        </div>
      `;

      // Modal Drawer Popup listener
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
    serviceMapModalBody.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-color); padding-bottom:15px; margin-bottom: 20px;">
        <span class="category-pill">${srv.category} Architecture</span>
        <h2 style="font-size:24px; margin-top:8px;">${srv.name}</h2>
        <p style="font-size:13px; color:var(--text-secondary); margin-top:8px;">${srv.description}</p>
      </div>

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
        ${srv.cliCommands.length > 0 ? srv.cliCommands.map(cmd => `
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

  btnCloseMapModal.addEventListener("click", () => serviceMapModal.classList.add("hidden"));
  serviceMapModal.addEventListener("click", (e) => {
    if (e.target === serviceMapModal) serviceMapModal.classList.add("hidden");
  });

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
      state.selectedServiceCategory = "all";
      switchTab("services");
      setTimeout(() => {
        const cards = document.querySelectorAll(".service-card");
        cards.forEach(c => {
          if (c.querySelector("h3").innerText.toLowerCase() === srv.name.toLowerCase()) {
            c.scrollIntoView({ behavior: "smooth", block: "center" });
            c.classList.add("flipped");
          }
        });
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
  const searchInput = document.getElementById("global-search");
  const searchDropdown = document.getElementById("search-results-dropdown");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
      searchDropdown.classList.add("hidden");
      return;
    }

    const results = [];

    // Search Category 1: Services
    db.services.forEach(srv => {
      if (srv.name.toLowerCase().includes(query) || srv.description.toLowerCase().includes(query)) {
        results.push({
          type: "services",
          title: srv.name,
          category: srv.category,
          snippet: srv.description,
          action: () => {
            state.selectedServiceCategory = "all";
            switchTab("services");
            setTimeout(() => {
              if (state.serviceViewMode === "map") {
                showServiceMapModal(srv);
              } else {
                const cards = document.querySelectorAll(".service-card");
                cards.forEach(c => {
                  if (c.querySelector("h3").innerText.toLowerCase() === srv.name.toLowerCase()) {
                    c.scrollIntoView({ behavior: "smooth", block: "center" });
                    c.classList.add("flipped");
                  }
                });
              }
            }, 100);
          }
        });
      }
    });

    // Search Category 2: Syllabus Topics
    db.syllabus.forEach(dom => {
      dom.topics.forEach(top => {
        if (top.title.toLowerCase().includes(query) || top.summary.toLowerCase().includes(query)) {
          results.push({
            type: "syllabus",
            title: top.title,
            category: "Study Topic",
            snippet: top.summary.substring(0, 80) + "...",
            action: () => {
              state.activeDomainId = dom.id;
              state.activeTopicId = top.id;
              switchTab("syllabus");
              setTimeout(() => {
                renderActiveTopicDetails(top, dom);
              }, 100);
            }
          });
        }
      });
    });

    // Search Category 3: CLI Commands list
    db.commands.forEach(cmd => {
      if (cmd.title.toLowerCase().includes(query) || cmd.command.toLowerCase().includes(query) || cmd.description.toLowerCase().includes(query)) {
        results.push({
          type: "commands",
          title: cmd.title,
          category: "CLI: " + cmd.category,
          snippet: cmd.command,
          action: () => {
            state.activeCommandCategory = cmd.category;
            switchTab("commands");
            setTimeout(() => {
              const cards = document.querySelectorAll(".command-card");
              cards.forEach(c => {
                if (c.querySelector("h4").innerText.toLowerCase() === cmd.title.toLowerCase()) {
                  c.scrollIntoView({ behavior: "smooth", block: "center" });
                  c.style.borderColor = "var(--primary)";
                  setTimeout(() => c.style.borderColor = "var(--border-color)", 2000);
                }
              });
            }, 100);
          }
        });
      }
    });

    renderSearchResults(results.slice(0, 8));
  });

  function renderSearchResults(results) {
    if (results.length === 0) {
      searchDropdown.innerHTML = `<div style="padding: 16px; color: var(--text-muted); font-size:13px; text-align:center;">No match found. Try 'IAM', 'gcloud', or 'VPC'</div>`;
      searchDropdown.classList.remove("hidden");
      return;
    }

    searchDropdown.innerHTML = "";
    results.forEach(res => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.innerHTML = `
        <div class="search-result-title">${res.title}</div>
        <div class="search-result-meta">
          <span class="search-result-category ${res.type}">${res.category}</span>
          <span class="search-result-snippet">${res.snippet}</span>
        </div>
      `;
      
      item.addEventListener("click", () => {
        res.action();
        searchInput.value = "";
        searchDropdown.classList.add("hidden");
      });
      
      searchDropdown.appendChild(item);
    });
    
    searchDropdown.classList.remove("hidden");
  }

  // Close dropdown on click outside
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.classList.add("hidden");
    }
  });

});
