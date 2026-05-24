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
    
    // Service Catalog Category
    selectedServiceCategory: "all",
    
    // Syllabus selection
    activeDomainId: "domain-1",
    activeTopicId: null,
    
    // CLI Command category
    activeCommandCategory: "IAM & SDK Setup",
    
    // Wizard State
    wizard: {
      type: null, // 'compute', 'storage', 'networking'
      history: [],
      currentStep: 1, // 1: Select Type, 2: Questions, 3: Result
      answers: {}
    },
    
    // Quiz State
    quiz: {
      pool: [],
      questions: [],
      currentIndex: 0,
      selectedOptionIndex: null,
      score: 0,
      isAnswered: false,
      history: [] // record user selections
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
  const servicesGridEl = document.getElementById("services-grid-container");
  const filterBtns = document.querySelectorAll(".filter-btn");

  const wizardStep1 = document.getElementById("wizard-step-1");
  const wizardStepQuestions = document.getElementById("wizard-step-questions");
  const wizardStepResult = document.getElementById("wizard-step-result");
  const wizardQuestionText = document.getElementById("wizard-question-text");
  const wizardQuestionSubtext = document.getElementById("wizard-question-subtext");
  const wizardOptionsContainer = document.getElementById("wizard-options-container");
  const wizardProgressFill = document.getElementById("wizard-progress-fill");
  const wizardBackBtn = document.getElementById("wizard-back-btn");

  const commandCatContainer = document.getElementById("command-cat-menu-container");
  const commandListContainer = document.getElementById("command-list-container");

  // Set Theme on Startup
  document.documentElement.setAttribute("data-theme", state.theme);
  updateThemeToggleButtonIcon();

  // Initialize Statistics & Progress circles
  updateGlobalProgress();
  populateStatsCounters();

  // ==========================================================================
  // 2. MAIN NAVIGATION / ROUTING SYSTEM
  // ==========================================================================

  function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Update navigation sidebar visual states
    navItems.forEach(btn => {
      if (btn.getAttribute("data-tab") === tabId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Toggle main display panels
    tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add("active");
      } else {
        pane.classList.remove("active");
      }
    });

    // Trigger tab-specific initialization logic
    if (tabId === "syllabus") {
      renderSyllabusSidebar();
    } else if (tabId === "services") {
      renderServicesGrid();
    } else if (tabId === "commands") {
      renderCommandCategories();
      renderCommandsList();
    } else if (tabId === "wizard") {
      resetWizard();
    } else if (tabId === "dashboard") {
      updateGlobalProgress();
    }
    
    // Scroll content area back to top
    document.querySelector(".content-body").scrollTop = 0;
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      switchTab(item.getAttribute("data-tab"));
    });
  });

  // Link quick actions from Dashboard promo banners
  document.querySelector(".start-quick-quiz").addEventListener("click", () => {
    switchTab("quiz");
  });

  // ==========================================================================
  // 3. DARK / LIGHT THEME TOGGLING
  // ==========================================================================
  // Already declared globally at startup
  themeToggleBtn.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("gcp_theme", state.theme);
    updateThemeToggleButtonIcon();
  });

  function updateThemeToggleButtonIcon() {
    const icon = themeToggleBtn.querySelector("i");
    if (state.theme === "dark") {
      icon.className = "fa-solid fa-sun";
    } else {
      icon.className = "fa-solid fa-moon";
    }
  }

  // ==========================================================================
  // 4. STATS COUNTERS AND READINESS SCORE CALCULATION
  // ==========================================================================
  function populateStatsCounters() {
    document.getElementById("stat-services-count").innerText = db.services.length;
    document.getElementById("stat-commands-count").innerText = db.commands.length;
    document.getElementById("stat-quiz-count").innerText = db.quiz.length;
  }

  function updateGlobalProgress() {
    const totalSyllabusTopicsCount = db.syllabus.reduce((acc, domain) => acc + domain.topics.length, 0);
    const completedCount = state.completedTopics.length;
    
    // Percentage Calculation
    const syllabusPct = totalSyllabusTopicsCount > 0 ? Math.round((completedCount / totalSyllabusTopicsCount) * 100) : 0;
    
    // Update progress numbers in DOM
    document.getElementById("readiness-pct").innerText = `${syllabusPct}%`;
    document.getElementById("dashboard-progress-text").innerText = `${syllabusPct}%`;
    document.getElementById("dashboard-completed-topics").innerText = `${completedCount}/${totalSyllabusTopicsCount}`;

    // Update Radial SVG Circle Offset
    const circle = document.getElementById("dashboard-progress-circle");
    if (circle) {
      const radius = 40;
      const circumference = 2 * Math.PI * radius; // ~251.2
      const offset = circumference - (syllabusPct / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }

    // Retrieve and update Quiz Success stats
    const savedSuccessRate = localStorage.getItem("gcp_quiz_best_success") || "0%";
    document.getElementById("dashboard-quiz-score").innerText = savedSuccessRate;
  }

  // ==========================================================================
  // 5. TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  const toastEl = document.getElementById("global-toast");
  const toastMessageEl = document.getElementById("toast-message");
  let toastTimeout;

  function showToast(message, isSuccess = true) {
    clearTimeout(toastTimeout);
    toastMessageEl.innerText = message;
    
    const icon = toastEl.querySelector("i");
    if (isSuccess) {
      icon.className = "fa-solid fa-circle-check";
      icon.style.color = "#34a853";
    } else {
      icon.className = "fa-solid fa-triangle-exclamation";
      icon.style.color = "#ea4335";
    }
    
    toastEl.classList.remove("hidden");
    
    toastTimeout = setTimeout(() => {
      toastEl.classList.add("hidden");
    }, 2500);
  }

  // Clipboard Copier utility
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Copied to clipboard!");
    }).catch(err => {
      showToast("Failed to copy command.", false);
    });
  }

  // ==========================================================================
  // 6. SYLLABUS EXPLORER DOM LOGIC
  // ==========================================================================
  // Already declared globally at startup

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
        // Toggle active domain panel
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
          e.stopPropagation(); // prevent closing domain card accordion
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
                // Check if command is a template or static command
                const displayCmd = substituteCommandParams(cmd);
                return `
                  <div class="code-clipboard-block">
                    <div class="code-header">
                      <span>gcloud cli</span>
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

    // Event listener for mark as complete button
    activeTopicContainer.querySelector(".mark-complete-btn").addEventListener("click", () => {
      if (state.completedTopics.includes(topic.id)) {
        // Toggle off
        state.completedTopics = state.completedTopics.filter(id => id !== topic.id);
        showToast("Topic marked as incomplete.");
      } else {
        // Toggle on
        state.completedTopics.push(topic.id);
        showToast("Topic marked as completed!");
      }
      localStorage.setItem("gcp_completed_topics", JSON.stringify(state.completedTopics));
      
      // Re-render interfaces
      renderSyllabusSidebar();
      renderActiveTopicDetails(topic, domain);
      updateGlobalProgress();
    });

    // Event listeners for CLI copy buttons
    activeTopicContainer.querySelectorAll(".copy-cmd-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const rawCommand = btn.getAttribute("data-raw");
        const substituted = substituteCommandParams(rawCommand);
        copyToClipboard(substituted);
      });
    });
  }

  // Binds variables to dynamic CLI commands
  function substituteCommandParams(cmd) {
    const proj = document.getElementById("param-project").value || "my-ace-project-123";
    const vm = document.getElementById("param-vm").value || "web-server-prod";
    const zone = document.getElementById("param-zone").value || "us-central1-a";
    const bucket = document.getElementById("param-bucket").value || "company-audit-logs-unique";

    return cmd
      .replace(/\[PROJECT_ID\]/g, proj)
      .replace(/\[PROJECT\]/g, proj)
      .replace(/\[VM_NAME\]/g, vm)
      .replace(/\[ZONE\]/g, zone)
      .replace(/\[BUCKET_NAME\]/g, bucket)
      .replace(/\[DISK_NAME\]/g, `${vm}-disk`)
      .replace(/\[LOCATION\]/g, zone.substring(0, zone.lastIndexOf("-")))
      .replace(/\[CLASS\]/g, "standard")
      .replace(/\[CLUSTER_NAME\]/g, "production-k8s")
      .replace(/\[REGION\]/g, zone.substring(0, zone.lastIndexOf("-")))
      .replace(/\[DEPLOYMENT_NAME\]/g, "web-deployment")
      .replace(/\[IMAGE\]/g, "gcr.io/" + proj + "/nginx:alpine")
      .replace(/\[DATASET_NAME\]/g, "analytic_dataset")
      .replace(/\[DURATION\]/g, "10m")
      .replace(/\[KEY_FILE\]/g, "sa-key.json")
      .replace(/\[FILE_NAME\]/g, "audit_2026.csv")
      .replace(/\[SQL_QUERY\]/g, "SELECT * FROM `dataset.table` LIMIT 10")
      .replace(/\[LOCAL_PATH\]/g, "report.csv")
      .replace(/\[REMOTE_PATH\]/g, "exports/")
      .replace(/\[SIZE\]/g, "100GB")
      .replace(/\[TYPE\]/g, "e2-medium")
      .replace(/\[SUBNET\]/g, "default-subnet");
  }

  // Reset Progress action
  document.querySelector(".reset-study-progress").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your study checklist progress?")) {
      state.completedTopics = [];
      localStorage.removeItem("gcp_completed_topics");
      localStorage.removeItem("gcp_quiz_best_success");
      
      showToast("Progress records reset successfully.");
      
      if (state.activeTab === "syllabus") {
        renderSyllabusSidebar();
        // Clear active view pane
        activeTopicContainer.innerHTML = `
          <div class="no-selection-placeholder">
            <i class="fa-solid fa-book-bookmark"></i>
            <h3>Select a topic from the left sidebar to start studying</h3>
            <p>Each topic contains exam summaries, interactive "when-to-use" checklists, and exact CLI commands needed for the Associate Cloud Engineer exam.</p>
          </div>
        `;
      }
      updateGlobalProgress();
    }
  });

  // ==========================================================================
  // 7. SERVICE CATALOG GRID RENDERING
  // ==========================================================================
  // Already declared globally at startup

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
    
    // Apply filtering
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
      
      // Determine card icon
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
        <!-- FRONT FACE -->
        <div class="card-face card-front">
          <div class="card-top">
            <span class="card-category">${srv.category}</span>
            <i class="fa-solid ${categoryIcon} card-icon"></i>
          </div>
          <div>
            <h3>${srv.name}</h3>
            <p class="card-description">${srv.description}</p>
          </div>
          <span class="card-flip-prompt"><i class="fa-solid fa-arrows-rotate"></i> Click to flip & view exam details</span>
        </div>
        
        <!-- BACK FACE -->
        <div class="card-face card-back">
          <div class="card-back-title">
            <h4>${srv.name} Highlights</h4>
            <span>${srv.category}</span>
          </div>
          
          <ul class="card-features-list">
            ${srv.keyFeatures.slice(0, 3).map(feat => `<li>${feat}</li>`).join("")}
          </ul>
          
          <div class="card-tips-box">
            <strong>ACE Pro-Tip:</strong>
            <p>${srv.examTips[0] || "Remember key configurations and gcloud commands for resource provisioning."}</p>
          </div>
          
          <span class="card-flip-prompt" style="margin-top: 10px;"><i class="fa-solid fa-arrows-rotate"></i> Click to flip back</span>
        </div>
      `;

      // Card flipping actions on tap/click
      card.addEventListener("click", () => {
        card.classList.toggle("flipped");
      });

      cardWrapper.appendChild(card);
      servicesGridEl.appendChild(cardWrapper);
    });
  }

  // ==========================================================================
  // 8. INTERACTIVE DECISION MATRIX WIZARD
  // ==========================================================================
  // Already declared globally at startup

  const WIZARD_DECISIONS = {
    compute: {
      steps: [
        {
          id: "os-control",
          question: "Do you require custom operating system configurations or direct kernel/OS control?",
          subtext: "Are you running legacy non-containerized code needing local VM administrator access?",
          options: [
            { text: "Yes, absolute OS control is required.", next: "RESULT:compute-engine" },
            { text: "No, containerized or sandboxed runtimes are fine.", next: "is-container" }
          ]
        },
        {
          id: "is-container",
          question: "Is your application already built and wrapped inside a Docker container image?",
          subtext: "Container deployment simplifies hosting scalability on GCP.",
          options: [
            { text: "Yes, it is containerized.", next: "needs-k8s" },
            { text: "No, it's just raw code in standard programming languages.", next: "raw-code-env" }
          ]
        },
        {
          id: "needs-k8s",
          question: "Does your application need advanced multi-container scaling, Kubernetes API, or service mesh?",
          subtext: "Choose orchestration level based on operational complexity.",
          options: [
            { text: "Yes, it represents a complex microservice architecture.", next: "RESULT:gke" },
            { text: "No, a single exposed API port or web service is sufficient.", next: "RESULT:cloud-run" }
          ]
        },
        {
          id: "raw-code-env",
          question: "What type of application framework or logic are you running?",
          subtext: "Determine if it represents event-driven triggers or standard server logic.",
          options: [
            { text: "Infrequent event-driven triggers or simple background actions.", next: "RESULT:cloud-functions" },
            { text: "A standard web server portal or API service running 24/7.", next: "RESULT:app-engine" }
          ]
        }
      ]
    },
    storage: {
      steps: [
        {
          id: "data-type",
          question: "What best represents the fundamental structure of your data?",
          subtext: "Match data models to suitable storage engines.",
          options: [
            { text: "Structured Relational SQL tables (ACID transactions required).", next: "sql-scale" },
            { text: "Semi-structured JSON documents (collaboration profiles, carts).", next: "RESULT:firestore" },
            { text: "Massive write throughput time-series or IoT telemetry streams (>1TB).", next: "RESULT:cloud-bigtable" },
            { text: "Unstructured binary assets (images, raw backups, static media files).", next: "RESULT:cloud-storage" }
          ]
        },
        {
          id: "sql-scale",
          question: "What level of scalability does your relational database demand?",
          subtext: "Relational engines differ significantly in horizontal scaling capabilities.",
          options: [
            { text: "Regional scale (<64TB databases, single-write region holds transactions).", next: "RESULT:cloud-sql" },
            { text: "Global scale (massive globally-distributed ACID writes & strong consistency).", next: "RESULT:cloud-spanner" }
          ]
        }
      ]
    },
    networking: {
      steps: [
        {
          id: "net-challenge",
          question: "What core networking architecture challenge are you resolving?",
          subtext: "GCP provides advanced tools for access control, traffic routing, and private networks.",
          options: [
            { text: "Distributing incoming global user HTTP traffic to closest VM groups.", next: "RESULT:load-balancing" },
            { text: "Creating private subnets, managing CIDR allocations, and securing VMs.", next: "RESULT:vpc" },
            { text: "Sharing subnet control lines securely between multiple isolated departments.", next: "RESULT:vpc" } // Shared VPC
          ]
        }
      ]
    }
  };

  // Bind click categories to initiate Wizard
  document.querySelectorAll(".wizard-choice-card").forEach(card => {
    card.addEventListener("click", () => {
      const type = card.getAttribute("data-wizard-type");
      startWizard(type);
    });
  });

  function startWizard(type) {
    state.wizard.type = type;
    state.wizard.currentStep = 1;
    state.wizard.history = [];
    state.wizard.answers = {};
    
    wizardStep1.classList.add("hidden");
    wizardStepQuestions.classList.remove("hidden");
    wizardStepResult.classList.add("hidden");
    
    renderWizardQuestion();
  }

  function renderWizardQuestion() {
    const categoryFlow = WIZARD_DECISIONS[state.wizard.type];
    if (!categoryFlow) return;

    const currentStepIndex = state.wizard.history.length;
    const currentStepData = categoryFlow.steps[currentStepIndex];

    if (!currentStepData) {
      showToast("Error processing decision tree path.", false);
      resetWizard();
      return;
    }

    // Update Progress Bar
    const progressPct = ((currentStepIndex) / categoryFlow.steps.length) * 100;
    wizardProgressFill.style.width = `${progressPct}%`;

    wizardQuestionText.innerText = currentStepData.question;
    wizardQuestionSubtext.innerText = currentStepData.subtext;
    
    wizardOptionsContainer.innerHTML = "";
    
    currentStepData.options.forEach(opt => {
      const optBtn = document.createElement("button");
      optBtn.className = "wizard-option-btn";
      optBtn.innerHTML = `<span>${opt.text}</span> <i class="fa-solid fa-chevron-right"></i>`;
      
      optBtn.addEventListener("click", () => {
        state.wizard.history.push({
          stepId: currentStepData.id,
          question: currentStepData.question,
          answerSelected: opt.text
        });
        
        if (opt.next.startsWith("RESULT:")) {
          const serviceId = opt.next.replace("RESULT:", "");
          showWizardResult(serviceId);
        } else {
          renderWizardQuestion();
        }
      });
      
      wizardOptionsContainer.appendChild(optBtn);
    });

    // Handle Back Button
    if (state.wizard.history.length > 0) {
      wizardBackBtn.classList.remove("hidden");
    } else {
      wizardBackBtn.classList.add("hidden");
    }
  }

  // Handle Wizard Back Action
  wizardBackBtn.addEventListener("click", () => {
    if (state.wizard.history.length > 0) {
      state.wizard.history.pop();
      renderWizardQuestion();
    }
  });

  function showWizardResult(serviceId) {
    wizardStepQuestions.classList.add("hidden");
    wizardStepResult.classList.remove("hidden");
    
    // Find service in database
    const matchedService = db.services.find(s => s.id === serviceId);
    const recommendationContainer = document.getElementById("wizard-recommendation-showcase");
    const reasoningContainer = document.getElementById("wizard-reasoning-list");
    
    if (!matchedService) {
      recommendationContainer.innerHTML = `<h3>Recommendation: ${serviceId}</h3>`;
      reasoningContainer.innerHTML = "<li>Verify service parameters in the main catalog.</li>";
      return;
    }

    // Render Showcase Card
    recommendationContainer.innerHTML = `
      <div class="glass-card" style="background: var(--bg-card-hover); border-color: var(--primary); text-align: left; box-shadow: var(--card-glow-blue);">
        <div class="card-top" style="margin-bottom: 8px;">
          <span class="card-category" style="color: var(--primary); font-weight:700;">GCP CHOSEN SERVICE</span>
          <i class="fa-solid fa-cloud-bolt" style="font-size: 24px; color: var(--primary);"></i>
        </div>
        <h2 style="font-size: 24px; margin-bottom: 8px;">${matchedService.name}</h2>
        <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 14px;">${matchedService.description}</p>
        <button class="btn btn-outline" id="wizard-goto-catalog" style="font-size:12px; padding: 6px 12px;">
          <i class="fa-solid fa-circle-info"></i> View in Catalog
        </button>
      </div>
    `;

    // Render Decision Pathway reasoning
    reasoningContainer.innerHTML = "";
    state.wizard.history.forEach(hist => {
      const bullet = document.createElement("li");
      bullet.innerHTML = `Because you answered <strong>"${hist.answerSelected}"</strong> to: <em>"${hist.question}"</em>`;
      reasoningContainer.appendChild(bullet);
    });
    
    // Add additional exam key highlights
    const tipBullet = document.createElement("li");
    tipBullet.innerHTML = `<strong>Exam Pro-Tip:</strong> ${matchedService.examTips[0]}`;
    reasoningContainer.appendChild(tipBullet);

    // Bind link to catalog card
    document.getElementById("wizard-goto-catalog").addEventListener("click", () => {
      state.selectedServiceCategory = "all";
      switchTab("services");
      // Find card element in catalog and visual expand
      setTimeout(() => {
        const cards = document.querySelectorAll(".service-card");
        cards.forEach(c => {
          if (c.querySelector("h3").innerText.toLowerCase() === matchedService.name.toLowerCase()) {
            c.scrollIntoView({ behavior: "smooth", block: "center" });
            c.classList.add("flipped");
          }
        });
      }, 100);
    });
  }

  function resetWizard() {
    state.wizard.type = null;
    state.wizard.history = [];
    state.wizard.answers = {};
    
    wizardStep1.classList.remove("hidden");
    wizardStepQuestions.classList.add("hidden");
    wizardStepResult.classList.add("hidden");
  }

  document.getElementById("wizard-restart-btn").addEventListener("click", resetWizard);

  // ==========================================================================
  // 9. CLI COMMAND REFERENCE CHEAT SHEET
  // ==========================================================================
  // Already declared globally at startup

  // Input variables parameter listeners to trigger dynamic terminal text replacement
  const paramInputs = ["param-project", "param-vm", "param-zone", "param-bucket"];
  paramInputs.forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
      // Re-render commands with new input variables
      if (state.activeTab === "commands") {
        renderCommandsList();
      } else if (state.activeTab === "syllabus" && state.activeTopicId) {
        // Redraw active topic command block
        const dom = db.syllabus.find(d => d.topics.some(t => t.id === state.activeTopicId));
        if (dom) {
          const top = dom.topics.find(t => t.id === state.activeTopicId);
          renderActiveTopicDetails(top, dom);
        }
      }
    });
  });

  function renderCommandCategories() {
    commandCatContainer.innerHTML = "";
    
    // Extract unique categories
    const categories = [...new Set(db.commands.map(cmd => cmd.category))];
    
    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = `command-cat-btn ${state.activeCommandCategory === cat ? "active" : ""}`;
      btn.innerText = cat;
      
      btn.addEventListener("click", () => {
        document.querySelectorAll(".command-cat-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeCommandCategory = cat;
        renderCommandsList();
      });
      
      commandCatContainer.appendChild(btn);
    });
  }

  function renderCommandsList() {
    commandListContainer.innerHTML = "";
    
    const filteredCommands = db.commands.filter(cmd => cmd.category === state.activeCommandCategory);
    
    filteredCommands.forEach(cmd => {
      const displayCmd = substituteCommandParams(cmd.command);
      
      const card = document.createElement("div");
      card.className = "command-card";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 8px;">
          <h4>${cmd.title}</h4>
          <span style="font-size:10px; background:var(--bg-active); color:var(--primary); padding:2px 8px; border-radius:4px; font-weight:700;">gcloud SDK</span>
        </div>
        <p>${cmd.description}</p>
        
        <div class="code-clipboard-block">
          <div class="code-header">
            <span>Shell Script</span>
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
        const raw = card.querySelector(".copy-cheat-btn").getAttribute("data-raw");
        copyToClipboard(substituteCommandParams(raw));
      });

      commandListContainer.appendChild(card);
    });
  }

  // ==========================================================================
  // 10. SCENARIO PRACTICE QUIZ ENGINE
  // ==========================================================================
  const quizLanding = document.getElementById("quiz-landing");
  const quizRunning = document.getElementById("quiz-running");
  const quizResults = document.getElementById("quiz-results");
  
  const startQuizBtn = document.getElementById("start-quiz-btn");
  const retryQuizBtn = document.getElementById("quiz-retry-btn");
  const gotoSyllabusBtn = document.getElementById("quiz-goto-syllabus-btn");
  const quizSubmitBtn = document.getElementById("quiz-submit-btn");
  const quizExplanationBtn = document.getElementById("quiz-show-explanation-btn");
  
  const quizQuestionDisplay = document.getElementById("quiz-question-display");
  const quizOptionsDisplay = document.getElementById("quiz-options-display");
  const currentQIndexDisplay = document.getElementById("current-q-index");
  const totalQCountDisplay = document.getElementById("total-q-count");
  const liveCorrectCountDisplay = document.getElementById("live-correct-count");
  const liveProgressFill = document.getElementById("quiz-live-progress-fill");
  const quizExplanationDisplay = document.getElementById("quiz-explanation-display-box");
  const quizExplanationText = document.getElementById("quiz-explanation-text");

  let quizSizeConfig = "5"; // '5', '10', 'all'

  // Quiz size selections
  document.querySelectorAll(".quiz-size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".quiz-size-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      quizSizeConfig = btn.getAttribute("data-size");
    });
  });

  startQuizBtn.addEventListener("click", startPracticeQuiz);
  retryQuizBtn.addEventListener("click", () => {
    quizResults.classList.add("hidden");
    quizLanding.classList.remove("hidden");
  });
  gotoSyllabusBtn.addEventListener("click", () => {
    switchTab("syllabus");
  });

  function startPracticeQuiz() {
    // Determine size of assessment
    let size = 5;
    if (quizSizeConfig === "10") size = 10;
    else if (quizSizeConfig === "all") size = db.quiz.length;
    
    // Shuffle and pick subset of questions
    const shuffledPool = [...db.quiz].sort(() => 0.5 - Math.random());
    state.quiz.questions = shuffledPool.slice(0, Math.min(size, shuffledPool.length));
    
    state.quiz.currentIndex = 0;
    state.quiz.score = 0;
    state.quiz.selectedOptionIndex = null;
    state.quiz.isAnswered = false;
    state.quiz.history = [];

    // Swap Views
    quizLanding.classList.add("hidden");
    quizRunning.classList.remove("hidden");
    quizResults.classList.add("hidden");

    loadQuizQuestion();
  }

  function loadQuizQuestion() {
    state.quiz.isAnswered = false;
    state.quiz.selectedOptionIndex = null;
    
    quizSubmitBtn.innerText = "Submit Answer";
    quizSubmitBtn.disabled = true;
    quizExplanationBtn.classList.add("hidden");
    quizExplanationDisplay.classList.add("hidden");

    const currentQuestion = state.quiz.questions[state.quiz.currentIndex];
    
    // Update labels
    currentQIndexDisplay.innerText = state.quiz.currentIndex + 1;
    totalQCountDisplay.innerText = state.quiz.questions.length;
    liveCorrectCountDisplay.innerText = state.quiz.score;
    
    // Update progress bar
    const progressPct = (state.quiz.currentIndex / state.quiz.questions.length) * 100;
    liveProgressFill.style.width = `${progressPct}%`;

    quizQuestionDisplay.innerText = currentQuestion.question;
    
    // Render options
    quizOptionsDisplay.innerHTML = "";
    
    currentQuestion.options.forEach((opt, idx) => {
      const optEl = document.createElement("button");
      optEl.className = "quiz-option";
      
      const charMarker = String.fromCharCode(65 + idx); // A, B, C, D
      optEl.innerHTML = `
        <div class="option-marker">${charMarker}</div>
        <div class="option-text">${opt}</div>
      `;
      
      optEl.addEventListener("click", () => {
        if (state.quiz.isAnswered) return; // block change once locked in
        
        // Toggle active design styles
        document.querySelectorAll(".quiz-option").forEach(el => el.classList.remove("selected"));
        optEl.classList.add("selected");
        
        state.quiz.selectedOptionIndex = idx;
        quizSubmitBtn.disabled = false;
      });
      
      quizOptionsDisplay.appendChild(optEl);
    });
  }

  // Answer submission
  quizSubmitBtn.addEventListener("click", () => {
    const currentQuestion = state.quiz.questions[state.quiz.currentIndex];

    if (!state.quiz.isAnswered) {
      // 1. GRADE SUBMISSION
      state.quiz.isAnswered = true;
      const userAns = state.quiz.selectedOptionIndex;
      const correctAns = currentQuestion.correctIndex;
      
      const optionsElements = quizOptionsDisplay.querySelectorAll(".quiz-option");
      
      // Update visual cues (green for correct option, red for incorrect chosen)
      optionsElements.forEach((el, idx) => {
        el.classList.remove("selected");
        if (idx === correctAns) {
          el.classList.add("correct");
        }
        if (idx === userAns && userAns !== correctAns) {
          el.classList.add("incorrect");
        }
      });
      
      // Check score
      if (userAns === correctAns) {
        state.quiz.score++;
        showToast("Correct Answer!");
      } else {
        showToast("Incorrect selection.", false);
      }
      
      liveCorrectCountDisplay.innerText = state.quiz.score;
      
      // Show explanations panel
      quizExplanationText.innerText = currentQuestion.explanation;
      quizExplanationDisplay.classList.remove("hidden");
      quizExplanationBtn.classList.remove("hidden");
      
      // Update submit button text to "Next Question" or "Finish"
      if (state.quiz.currentIndex < state.quiz.questions.length - 1) {
        quizSubmitBtn.innerText = "Next Question";
      } else {
        quizSubmitBtn.innerText = "View Final Results";
      }
    } else {
      // 2. NAVIGATE FORWARD
      if (state.quiz.currentIndex < state.quiz.questions.length - 1) {
        state.quiz.currentIndex++;
        loadQuizQuestion();
      } else {
        showQuizResults();
      }
    }
  });

  // Toggle explanation panel action
  quizExplanationBtn.addEventListener("click", () => {
    quizExplanationDisplay.classList.toggle("hidden");
  });

  function showQuizResults() {
    quizRunning.classList.add("hidden");
    quizResults.classList.remove("hidden");

    const total = state.quiz.questions.length;
    const correct = state.quiz.score;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    document.getElementById("results-score-pct").innerText = `${pct}%`;
    document.getElementById("results-total-q").innerText = total;
    document.getElementById("results-correct-q").innerText = correct;
    document.getElementById("results-incorrect-q").innerText = total - correct;

    // Persist best quiz performance rate
    const savedBest = parseInt(localStorage.getItem("gcp_quiz_best_success") || "0");
    if (pct > savedBest) {
      localStorage.setItem("gcp_quiz_best_success", `${pct}%`);
    }

    // Display customized review message
    const iconContainer = document.getElementById("results-icon-container");
    const commentEl = document.getElementById("results-comment");

    if (pct >= 85) {
      iconContainer.innerHTML = `<i class="fa-solid fa-medal" style="color: var(--accent-orange);"></i>`;
      commentEl.innerText = "Superb! Your understanding of GCP ACE scenarios is cloud-architect grade. You are highly ready for certification.";
    } else if (pct >= 70) {
      iconContainer.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-green);"></i>`;
      commentEl.innerText = "Solid passing performance! Keep reviewing CLI commands and billing structures to cement your exam victory.";
    } else {
      iconContainer.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #ea4335;"></i>`;
      commentEl.innerText = "Keep studying! Try expanding the syllabus explorer and studying scenario 'When NOT to Use' blocks to increase score.";
    }
    
    updateGlobalProgress();
  }

  // ==========================================================================
  // 11. GLOBAL DYNAMIC SEARCH & INDEXING SYSTEM
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

    // Search Category 1: Services Catalog
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
              const cards = document.querySelectorAll(".service-card");
              cards.forEach(c => {
                if (c.querySelector("h3").innerText.toLowerCase() === srv.name.toLowerCase()) {
                  c.scrollIntoView({ behavior: "smooth", block: "center" });
                  c.classList.add("flipped");
                }
              });
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
            snippet: top.summary,
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

  // Close search dropdown on click outside
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.classList.add("hidden");
    }
  });

});
