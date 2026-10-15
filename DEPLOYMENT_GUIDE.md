# Quiz Hub: From Project Setup to GitHub Pages

Follow the parts in order. Every grey block is a command you can copy and paste into the terminal, then press **Enter**.

---

## PART 1: Install the tools (one time)

1. Install **Node.js (LTS)**: https://nodejs.org → download the LTS version → run the installer → keep clicking Next → Finish.
2. Install **Git**: https://git-scm.com/downloads → download for your system → run the installer → keep the default options.
3. Close and re-open your terminal (Windows: search for **Command Prompt** or **PowerShell**; Mac: **Terminal**).
4. Check both are installed. Each command should print a version number:

```bash
node -v
```
```bash
git --version
```

---

## PART 2: Set up the project

1. Unzip `quiz-website-complete.zip` (right-click → Extract All). You get a folder named `quiz-website`.
2. Open a terminal INSIDE that folder:
   - Windows: open the folder in File Explorer → click the address bar → type `cmd` → press Enter.
   - Mac: right-click the folder → **New Terminal at Folder**.
3. Install the packages (takes a minute or two):

```bash
npm install
```

---

## PART 3: Create the Firebase project

1. Go to https://console.firebase.google.com and sign in with Google.
2. Click **Create a project** → type a name → **Continue** → turn Google Analytics **off** → **Create project** → **Continue**.
3. On the project home page click the **`</>`** (Web) icon → type an app nickname → click **Register app**. Do NOT tick "Firebase Hosting".
4. Keep this page open. You will see `firebaseConfig` with six values. You need them in Part 4.
5. Left menu → **Build** → **Authentication** → **Get started** → **Email/Password** → switch **Enable** on → **Save**.
6. Left menu → **Build** → **Firestore Database** → **Create database** → choose a location near you → **Start in production mode** → **Create**.
7. Click the **Rules** tab → click inside the editor → select all (Ctrl+A) → delete → open the file `firestore.rules` from the project in any text editor → copy ALL of it → paste into Firebase → click **Publish**.

---

## PART 4: Add your Firebase values (.env)

1. In the terminal, make your own `.env` file.

   Windows:
```bash
copy .env.example .env
```
   Mac / Linux:
```bash
cp .env.example .env
```
2. Open `.env` in a text editor and paste each value after the `=` sign (no quotes, no spaces):

| .env name | firebaseConfig value |
|---|---|
| VITE_FIREBASE_API_KEY | apiKey |
| VITE_FIREBASE_AUTH_DOMAIN | authDomain |
| VITE_FIREBASE_PROJECT_ID | projectId |
| VITE_FIREBASE_STORAGE_BUCKET | storageBucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID | messagingSenderId |
| VITE_FIREBASE_APP_ID | appId |

3. Save the file. (`.env` is private and is never uploaded to GitHub.)

---

## PART 5: Run it on your computer

```bash
npm run dev
```

1. Open the address it prints (usually http://localhost:5173).
2. To test on your phone (same Wi-Fi), stop it with **Ctrl+C**, then run:

```bash
npm run dev -- --host
```
   Open the **Network** address it prints on your phone.
3. Click **Login** → **Create an account** → sign up → try Practice Mode.

---

## PART 6: Make yourself the admin

1. Sign up in the app first (Part 5, step 3).
2. Firebase console → click the **gear icon** next to *Project Overview* → **Project settings** → **Service accounts** tab → **Generate new private key** → **Generate key**.
3. Rename the downloaded file to exactly `serviceAccountKey.json` and move it into the project's `scripts` folder.
4. Run (use the email you signed up with):

```bash
npm run set-admin -- your-email@example.com
```
5. In the app click **Logout**, then **Login** again. An **Admin** button appears in the header.

NEVER share `serviceAccountKey.json` or upload it anywhere. It is already blocked from Git by `.gitignore`.

---

## PART 7: Put the project on GitHub

1. Go to https://github.com → click **+** (top right) → **New repository**.
2. Repository name: for example `quiz-hub`. Choose **Public** (GitHub Pages is free only for public repos). Do NOT tick "Add a README". Click **Create repository**.
3. In your project terminal, run these one at a time:

```bash
git init
```
```bash
git add .
```
```bash
git commit -m "First version of Quiz Hub"
```
```bash
git branch -M main
```
4. Copy the repository address from the GitHub page (looks like `https://github.com/YOUR-USERNAME/quiz-hub.git`) and run it with your own address:

```bash
git remote add origin https://github.com/YOUR-USERNAME/quiz-hub.git
```
```bash
git push -u origin main
```
   If it asks you to sign in, follow the browser window that opens.
5. Refresh the GitHub page. You should see your files. Check that `.env` and `serviceAccountKey.json` are NOT there.

---

## PART 8: Give GitHub your Firebase values (Secrets)

1. In your GitHub repo click **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Create six secrets. For each: type the **Name** exactly as shown, paste the **Secret** value from your `.env` file, click **Add secret**.

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

---

## PART 9: Turn on GitHub Pages

1. In the repo click **Settings** → **Pages** (left menu).
2. Under **Build and deployment** → **Source**, choose **GitHub Actions**.
3. Click the **Actions** tab. A workflow named **Deploy to GitHub Pages** runs automatically (the push in Part 7 triggered it, and it may have failed before the secrets existed). If it shows a red cross: click it → **Re-run all jobs**.
4. Wait for green ticks (1 to 3 minutes). Your site address is:

```
https://YOUR-USERNAME.github.io/quiz-hub/
```

---

## PART 10: Allow your site in Firebase

Without this, login will fail on the live site.

1. Firebase console → **Build** → **Authentication** → **Settings** tab → **Authorized domains** → **Add domain**.
2. Type `YOUR-USERNAME.github.io` (no `https://`, no repo name) → **Add**.
3. Open your live site on your phone and test: sign up, take a quiz, submit, see the result.

---

## PART 11: Updating the site later

Every time you change something (for example adding the college images to `public/images/`), run:

```bash
git add .
```
```bash
git commit -m "Describe your change here"
```
```bash
git push
```
GitHub rebuilds and republishes by itself in a couple of minutes.

---

## Adding the college images

Put these six files in `public/images/`, then do Part 11:

```
college-sky.png
college-clouds.png
college-building.png
college-campus.png
college-foreground.png
college-students.png
```
Tips: use wide landscape images, keep the building near the horizontal centre, and compress the PNGs (target under 500 KB each) so the site loads fast on phones.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm` or `node` not recognised | Close and reopen the terminal. If it still fails, reinstall Node.js. |
| Blank page or Firebase "invalid-api-key" error locally | Check `.env` has all six values, no quotes, then stop and restart `npm run dev`. |
| Blank page or Firebase error on the live site | The six GitHub Secrets are missing or misspelled (Part 8). Fix, then Actions → Re-run all jobs. |
| Login says unauthorized domain | Do Part 10. |
| Admin page keeps sending you home | Run the `set-admin` command again, then Logout and Login. |
| "Missing or insufficient permissions" | The rules were not published. Redo Part 3, step 7. |
| `git push` rejected | Run `git pull origin main --rebase`, then `git push`. |
| Workflow fails at "npm ci" | Make sure `package-lock.json` was committed. |
