# GCP ACE Exam Initiative Study Guide & Interactive Catalog

An interactive, premium, state-of-the-art single-page web application designed to help candidates prepare for the Google Cloud Platform Associate Cloud Engineer (GCP ACE) certification exam.

## Features Included
1. **Dashboard Overview**: Summary stats showing overall readiness, study checklists, and critical scenario cheat codes for GCS, GCE, IAM, GKE, and networking.
2. **Syllabus Explorer**: Dynamic mapping of the 5 official domains of the GCP ACE exam, incorporating detailed real-world "When to Use" vs. "When NOT to Use" scenario analysis and copy-ready CLI snippets.
3. **Major Services Directory**: A comprehensive grid catalog of 25+ essential GCP services. Click card tiles to flip them and view core highlights, use cases, and exam pro-tips instantly.
4. **Decision Matrix Flow Wizard**: An interactive visual tree that assists in choosing compute systems, databases, storage formats, or network connectors based on exam criteria.
5. **Interactive CLI Cheat Sheet**: Structured library of `gcloud`, `gsutil`, `bq`, and `kubectl` commands. Binds custom user inputs (Project ID, Zone, VM Name, Bucket Name) to terminal scripts in real-time.
6. **Scenario Mock Quiz**: Interactive, scenario-based practice questions mimicking the rigor and structure of real ACE exam items, offering immediate solutions and grading reviews.
7. **Premium Styling**: Glassmorphic cards, harmonized HSL palettes, smooth micro-animations, fully responsive views, and real-time Dark/Light theme swapping.

---

## Technical Architecture & File Structure
```
gcp_ace/
├── index.html   # Main semantic HTML5 structure & layout
├── styles.css   # Responsive layout rules, CSS variables, glassmorphism, animations
├── data.js      # Structured database for syllabus topics, scenarios, services, and quiz questions
└── app.js       # Core control logic (Tab routing, search indexing, quiz engine, state tracker)
```

No external bundlers, frameworks, or dependencies are required. All features run natively in the browser via vanilla Javascript and CSS.

---

## How to Host on GitHub Pages (Direct Deployment)

This repository is optimized for instant deployment to **GitHub Pages** without any complex compile/build steps:

1. **Create a GitHub Repository**:
   - Go to your GitHub account and create a new repository (e.g. name it `gcp-ace-study-guide`).
   - Keep it **Public** (required for free GitHub Pages tier).

2. **Commit and Push the Files**:
   - Initialize git in your local project folder:
     ```bash
     git init
     git add .
     git commit -m "Initialize GCP ACE Study Guide Web Application"
     ```
   - Connect and push your code to your remote GitHub repository:
     ```bash
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/gcp-ace-study-guide.git
     git push -u origin main
     ```

3. **Enable GitHub Pages**:
   - Navigate to your repository page on GitHub.
   - Click on the **Settings** tab on the top menu.
   - On the left navigation pane under the "Code and automation" section, click on **Pages**.
   - Under the "Build and deployment" section, find the **Source** setting, and set it to **Deploy from a branch**.
   - In the **Branch** dropdown, select **`main`** and choose **`/ (root)`** as the folder.
   - Click **Save**.

4. **Access your Live Site**:
   - Wait 1-2 minutes for GitHub to build and host your pages.
   - Refresh the Pages setting tab to see the green banner containing your active URL:
     `https://YOUR_USERNAME.github.io/gcp-ace-study-guide/`
   - Share the URL or use it on your phone/tablet to study on the go!

---

## Local Development & Testing

To test or customize the guide locally in your browser:
1. Open the project folder.
2. Launch a local web server (e.g. using VSCode Live Server extension, or python command: `python -m http.server 8000`).
3. Navigate to `http://localhost:8000` in your web browser.

To expand/add custom quiz questions, syllabus domains, or catalog services, simply append structured JSON objects into the database definitions inside `data.js`.
