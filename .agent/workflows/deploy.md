---
description: how to deploy the family foundation portal to firebase hosting
---

Follow these steps to deploy the application to the web.

1. **Build the production bundle**
   Run the build script to generate the optimized `dist` folder.
   ```powershell
   npm run build
   ```

2. **Login to Firebase**
   Ensure you are logged into the correct Google account.
   ```powershell
   firebase login
   ```

3. **Deploy to Hosting**
   Upload the production build to your Firebase project.
   ```powershell
   firebase deploy --only hosting
   ```

4. **Add Domain to Authorized Domains (IMPORTANT)**
   - Go to your [Firebase Console](https://console.firebase.google.com/).
   - Navigate to **Authentication** > **Settings** > **Authorized domains**.
   - Add your newly deployed domain (e.g., `your-project.web.app`) to the list, otherwise Google Sign-In will fail.
