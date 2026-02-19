# Family Foundation Portal

A premium, Philippine-based web application designed for family foundation governance, transparent decision-making, and financial participation.

## 🌟 Core Features

- **Real-time Dashboard**: Track the foundation's SEC endowment progress and see the 3 most recent active proposals at a glance.
- **Proposal System**: Create, browse, and vote on family initiatives with real-time tallying.
- **Funding Portal**: Participate in financial goals by committing funds to specific projects. Features priority voting to help the family decide what to fund first.
- **The Vault**: A centralized repository for official records, bylaws, and governance documents.
- **Admin Console**: Exclusive control panel for founding members to manage the email whitelist, moderate proposals, and update foundation-wide targets.
- **Secure Access**: Protected by Google Authentication and a dynamic Firestore-backed email whitelist.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (Modern, utility-first CSS)
- **Animations**: Framer Motion (Smooth, premium UI transitions)
- **Icons**: Lucide React
- **Backend**: Firebase
  - **Firestore**: Real-time NoSQL database (using named database: `foundation`)
  - **Authentication**: Google Sign-In
  - **Hosting**: Fast, secure global hosting

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1.  **Clone the repository**:
    ```bash
    # No remote yet, work in local directory
    cd family-foundation-portal
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Firebase**:
    Create a `.env` file or update `src/firebase.js` with your Firebase project credentials.

4.  **Run locally**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## 📂 Firestore Structure

The app expects the following collections in a Firestore database named `foundation`:

- `whitelist`: access control (documents named by email).
- `members`: user profiles and voting status.
- `proposals`: community initiatives and vote counts.
- `fundingItems`: projects requiring financial commitments.
- `commitments`: individual member financial pledges.
- `fundingVotes`: priority votes (+1/-1) for projects.

## 🚢 Deployment

1.  **Build the project**:
    ```bash
    npm run build
    ```

2.  **Deploy to Firebase**:
    ```bash
    firebase deploy --only hosting
    ```

3.  **Authorize Domain**:
    After deployment, add your `.web.app` or custom domain to the **Authorized domains** list in the Firebase Console (Authentication > Settings).

---

Built for the **Bañez Family Foundation**.
Providing a legacy of transparency and unity.
