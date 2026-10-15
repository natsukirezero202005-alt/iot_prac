# Quiz Hub

React + Vite + Firebase exam-practice site. Questions are in `src/data/questions.js` (copied from the NPTEL PDF).

## 1. Run it on your computer
1. Install Node.js (LTS) from https://nodejs.org if you do not have it.
2. Open a terminal INSIDE the `quiz-website` folder.
3. Type `npm install` and press Enter. Wait until it finishes.
4. Copy `.env.example` to a new file named `.env` (steps for the values are in section 2).
5. Type `npm run dev` and press Enter. Open the address it prints (usually http://localhost:5173).
6. To test on your phone: run `npm run dev -- --host`, then open the "Network" address on your phone (same Wi-Fi).

## 2. Firebase setup
1. Go to https://console.firebase.google.com and sign in.
2. Click **Create a project** (or **Add project**) → type a name → Continue → turn Google Analytics off → **Create project** → Continue.
3. On the project home page click the **</>** (Web) icon → type an app nickname → click **Register app**. Do NOT tick Hosting.
4. You will see a block called `firebaseConfig`. Copy each value into your `.env` file:
   - apiKey → VITE_FIREBASE_API_KEY
   - authDomain → VITE_FIREBASE_AUTH_DOMAIN
   - projectId → VITE_FIREBASE_PROJECT_ID
   - storageBucket → VITE_FIREBASE_STORAGE_BUCKET
   - messagingSenderId → VITE_FIREBASE_MESSAGING_SENDER_ID
   - appId → VITE_FIREBASE_APP_ID
   Click **Continue to console**.
5. Left menu → **Build** → **Authentication** → **Get started** → under **Sign-in method** click **Email/Password** → switch **Enable** on → **Save**.
6. Left menu → **Build** → **Firestore Database** → **Create database** → pick a location near you → choose **Start in production mode** → **Create**.
7. In Firestore click the **Rules** tab → select everything in the editor and delete it → open `firestore.rules` from this project, copy ALL of it, paste it in → click **Publish**.
8. Stop `npm run dev` (Ctrl+C) and start it again so it reads `.env`.

## 3. Make yourself the admin
1. Open the site and create your own account on /signup first.
2. Firebase console → click the gear icon next to **Project Overview** → **Project settings** → **Service accounts** tab → **Generate new private key** → **Generate key**.
3. Rename the downloaded file to `serviceAccountKey.json` and put it in the `scripts` folder. Never share it or upload it to GitHub (it is already in `.gitignore`).
4. In the terminal run: `npm run set-admin -- your-email@example.com` (use the email you signed up with).
5. In the app click Logout, then Login again. An **Admin** button now appears in the header, and /admin opens.

## 4. Deploying later
Add your site's domain in Firebase → Authentication → Settings → **Authorized domains**. Put the same `.env` values in your host's environment-variable settings.

## 5. Adding the college images
Put these files in `public/images/` (landscape, building near the horizontal centre):
college-sky.png, college-clouds.png, college-building.png, college-campus.png, college-foreground.png, college-students.png
Missing files are fine: a drawn placeholder shows instead.

## Notes
- Hard Mode shows fill-in questions only if `questions.js` contains items with `type: "fill"` and `acceptedAnswers: [...]`.
- Week 4 Q8 has `answer: null` because the PDF does not show its answer. Set it to the correct option index (0 = A) when you know it.

## Deploying
See DEPLOYMENT_GUIDE.md for the full step-by-step guide (Firebase, GitHub, GitHub Pages).
