This is a premium, highly responsive web application designed for the governance, transparent decision-making, and financial participation of the **Bañez Family Foundation** (based in the Philippines).

---

### 🏛️ Project Architecture & Technical Stack

The portal leverages a modern, lightweight, yet highly reactive serverless architecture:

*   **Frontend Framework:** **React 19** bootstrapped with **Vite** (utilizing ES modules).
*   **Styling & Design System:** **Tailwind CSS v4** (leveraging the new `@tailwindcss/vite` plugin and modern CSS-first theme configuration inside `src/index.css`). It features standard brand colors like Navy (`#001F3F`) and Gold (`#D4AF37`) along with clean typography (`Inter`).
*   **Animations:** **Framer Motion** for premium, hardware-accelerated UI transitions, slide-in sidebar navigation, and glassmorphic micro-interactions.
*   **Icons:** **Lucide React** for consistent vector iconography.
*   **Backend Services (Firebase):**
    *   **Firestore:** Real-time NoSQL database using a custom named database instance: **`foundation`** (rather than the standard `(default)` instance).
    *   **Authentication:** Google Sign-In tied to an access-control whitelist.
    *   **Hosting:** Fast and secure Firebase Hosting.

---

### 📂 Firestore Collection Schema

The system relies on a well-structured NoSQL model in the `foundation` database, coordinating several collections:

| Collection Name | Document Key format | Purpose |
| :--- | :--- | :--- |
| **`whitelist`** | `email` (normalized lowercase) | Stores authorized family members, registration dates, and authorization roles (`admin` vs `member`). |
| **`members`** | `user.uid` | Synchronizes user profile information from Google Sign-In (`displayName`, `photoURL`, `lastLogin`, `role`). |
| **`proposals`** | `auto-generated ID` | Active or archived initiatives including voting tallies and title/description metadata. |
| **`votes`** | `${user.uid}_${proposalId}` | Tracking records to prevent double-voting on individual proposals. |
| **`fundingItems`** | `auto-generated ID` (or `endowment-seed`) | Capital projects or endowment targets requiring priority voting and financial commitments. |
| **`commitments`** | `${user.uid}_${itemId}` | Member pledges towards funding items (individual contribution tracking). |
| **`fundingVotes`** | `${user.uid}_${itemId}` | Priority tracking (+1 / -1) to sort funding items dynamically. |
| **`vaultItems`** | `auto-generated ID` | Secure metadata for uploaded governance files, SEC records, and historical bylaws. |

---

### 🌟 Key Functional Modules

#### 1. Security & Gatekeeping (`AuthContext.jsx`)
*   **Normalizations:** Emails are converted to lowercase during login to ensure case-insensitive matching against the whitelist.
*   **Auto-Seed Mechanism:** To prevent admin lockout on a fresh deployment, if the `whitelist` collection is empty, the first user who logs in is automatically seeded as an `admin`.
*   **Profile Synchronization:** Syncs basic user details on every login to ensure avatar images and names remain fresh.

#### 2. The Interactive Dashboard (`Dashboard.jsx`)
*   **Endowment Tracker:** Displays real-time progress toward the foundation's primary financial goal (seeded automatically as `endowment-seed` with a target like ₱1,000,000).
*   **Bento Grid Elements:** Showcases the foundation's core values, purpose statements, and strategic giving pillars (Education, Health, and Environment).
*   **Featured Proposals:** Highlights "Top Priority" initiatives first, then displays recent active proposals.

#### 3. Proposals & Voting System (`Votes.jsx` & detail sub-components)
*   **Dynamic Layout:** Organized by categories ("Top Priority", "Education", "Health", etc.) with collapsible sections.
*   **Real-Time Tallies:** Highlights the user's selected choice and renders percentages/total vote counts instantly.
*   **Status Management:** Seamlessly filters between "Active" and "Archived" proposals.
*   **Hash-Based Routing:** Simple custom routing (e.g. `#proposals/id`) is implemented to allow deep-linking directly into specific proposal detail views.

#### 4. The Funding Portal (`Funding.jsx`)
*   **Priority Voting:** Members use Up/Down votes to calculate a `priorityScore`. The cards re-order in real time based on priority so the family knows which project to fund first.
*   **Financial Pledges:** Allows users to dynamically commit funds. Confirming a pledge increments the group's aggregate commitment in Firestore via a secure transactions/atomic incremental write (`increment(...)`).

#### 5. The Transparency Vault (`Vault.jsx`)
*   **Document Categorization:** Segregates items into Governance, Financial, SEC, Historical, and Bylaws.
*   **Searching & Filtering:** Multi-layer filters allow quick searching of official PDF/image files.
*   **External Access:** Secure buttons to preview documents in-browser or download them directly.

#### 6. Admin Control Console (`Admin.jsx`)
*   An administrative control center allowing founding members or admins to whitelist email accounts, moderate initiatives, manage categories, and audit foundation settings.

---

### 🎨 Premium Visual Details
*   **Glassmorphism styling:** Utilizes customized `.glass` classes (`backdrop-blur-md` and `bg-white/80`) that give the layout a premium modern look.
*   **Consistent Themes:** Tailored hover states (`hover:border-gold/30`), gold underlines, and beautiful animated loading spinners.
*   **Responsiveness:** Mobile navigation is treated with standard layout drawers featuring spring physics via Framer Motion.

Let me know what you would like to work on, improve, or explore next!