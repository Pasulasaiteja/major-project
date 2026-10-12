# UI/UX Design & Architecture Specification

## 🎨 Color Palette & Branding
This platform employs a modern, trustworthy, and accessible color scale designed for long-term usability by analysts and clean readability for clients.

* **Primary Action / Branding:** Deep Purple `#6D5BEF` (Used for primary buttons, active states, key data visualization)
* **Accent / Background Highlights:** Lavender `#C4B8FF` (Used for hover states, informational badges, secondary accents)
* **Surface / Base Background:** White `#FFFFFF` (Used for main backgrounds, card backgrounds, modal windows)
* **Primary Text / Heading:** Near Black `#2D2A3A` (Used for all primary typography, emphasizing readability)
* **Secondary Text / Borders:** Medium Gray `#9795A5` (Used for disabled states, borders, secondary textual information, timestamps)

## 👥 User Roles & Personas

Based on the federated fraud detection architecture (incorporating localized data partitions and Edge API serving), the system accommodates four distinct user roles, ensuring data privacy and relevant context for each user.

### 1. The Bank Client (Customer)
* **Goal:** Monitor personal accounts, verify flagged transactions, and feel secure about their financial data.
* **View:** Simplified, consumer-friendly. They do not see any back-end ML or bank-wide statistics.

### 2. The Bank Employee (Branch/Customer Support)
* **Goal:** Assist clients with everyday operations and address low-level fraud flags.
* **View:** Customer-centric. They can pull up client profiles (within their bank's partition) and verify client identity, but they abstract away from the raw ML pipeline.

### 3. The Fraud Analyst (Risk Management)
* **Goal:** Uncover complex fraud rings, analyze edge API predictions, and monitor the results of the Differentially Private Federated ML models.
* **View:** Highly technical, data-dense. Access to global risk indicators and anomaly queues without violating differential privacy constraints. 

### 4. System Administrator (IT / ML Ops) *(Additional User)*
* **Goal:** Ensure all federated nodes (banks) are syncing their weights correctly through the federated averaging pipeline, manage edge API uptime, and monitor data ingestion pipelines.
* **View:** Infrastructure-centric. Logs, system health, and API latency dashboards.

---

## 🖥️ Screen-by-Screen Specifications

### 1. Landing Page (Public Gateway)
The entry point explaining the value of the secure federated platform.

* **Background:** White `#FFFFFF` with subtle Lavender `#C4B8FF` abstract gradients near the top to create depth.
* **Navigation Bar:** 
  * Logo text in Near Black `#2D2A3A`
  * Nav links: "Solutions", "How it Works", "About Us" in Medium Gray `#9795A5`
  * "Login" Button: Deep Purple `#6D5BEF` pill shape, White text.
* **Hero Section:**
  * **Headline:** "Collaborative Fraud Defense, Absolute Privacy." (Near Black)
  * **Sub-headline:** "Harnessing Edge AI and Federated Learning to stop fraud before it happens—without exposing sensitive customer data." (Medium Gray)
  * **Call to Action (CTA):** "Access Node Dashboard" (Deep Purple block button with a Lavender hover state).
* **Value Props Section:** 3 Column layout outlining "Differential Privacy", "Edge Computation", and "Real-time API Integration". Icons in Deep Purple, descriptions in Medium Gray.

### 2. Login Page
A clean, distraction-free authentication gateway with Role-Based Access Control (RBAC) routing.

* **Layout:** Split screen. 
  * Left 50% (Desktop): Solid Deep Purple `#6D5BEF` featuring a subtle structural illustration of secure nodes (representing federated learning).
  * Right 50% (Desktop): White `#FFFFFF` background containing the form.
* **Form UI:**
  * Title: "Welcome Back" (Near Black)
  * Input Fields (Email/ID, Password): Floating labels in Medium Gray `#9795A5`, bottom border becomes Deep Purple `#6D5BEF` on focus.
  * Checkbox: "Remember my device"
  * Subtext: "Forgot Password?" (Lavender `#C4B8FF` text link)
  * Submit Button: "Sign In" (Deep Purple `#6D5BEF` with White text, transitions to a Lavender outline on hover).

### 3. Dashboards by User Type

#### A. Bank Client Dashboard
* **Header:** "Good Morning, [Name]"
* **Layout:** 
  * **Quick Stats:** Account Balance, Recent Incoming/Outgoing. Cards use a White `#FFFFFF` background with a subtle Medium Gray `#9795A5` stroke/border.
  * **Security Center Alerts:** A card with a Lavender `#C4B8FF` background if a recent transaction (e.g., from an unusual location) was flagged by the Edge API. Includes prominent "Was this you? [Yes] [No]" interaction buttons.
  * **Transaction History:** Clean list view. Date in Medium Gray, amounts in Near Black.

#### B. Bank Employee Dashboard
* **Header:** Search bar prominent at the top (Search by Client ID or Name).
* **Layout:**
  * **Queue:** A list of clients requiring verification due to fraud stops.
  * **Client Profile View:** Shows client history, recent interactions, and a simplified "Risk Score" out of 100 generated by the underlying model (e.g., "Transaction Risk: 12/100"). High risk scores styled in Deep Purple `#6D5BEF`.
  * **Action Panel:** "Override Fraud Block", "Issue New Card", "Contact Client".

#### C. Fraud Analyst Dashboard (Core Application)
* **Navigation:** Sidebar layout (Deep Purple background with White `#FFFFFF` icons and text).
* **Layout:**
  * **Top Metrics:** "Transactions Scored (24h)", "True Positive Rate estimation", "Global Anomaly Spikes". Numbers in Deep Purple.
  * **Federated Learning Hub:** 
    * Visualizer showing weight updates from regional partitions (e.g., matching structures like `bank_3_Uttar Pradesh.csv`).
    * "Differentially Private Noise Level" indicator (epsilon constraints).
  * **Edge API Monitor:** Real-time log/chart of incoming payloads to the `bank_edge_api` and their associated prediction latencies (Line charts using Deep Purple/Lavender).
  * **Investigation Queue:** A detailed data table of flagged transactions with highly granular model explainability (Feature Importance graphs utilizing Lavender and Deep Purple bar charts).

#### D. System Administrator Dashboard
* **Layout:** Technical overlay with high data density.
* **Widgets:**
  * **Node Health Matrix:** Shows connection status of all bank partitions. Status dots in Deep Purple `#6D5BEF` (Active) or Medium Gray `#9795A5` (Offline).
  * **Pipeline Status:** Logs from `dp_federated_avg.py` (Epochs completed, server model synchronization status).
  * **API Metrics:** Error Logs, filterable list of API timeouts, and edge latency monitors.
