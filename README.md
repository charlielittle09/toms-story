# Tom's Story — setup guide

This is a private website for recording, uploading, and reading Tom's story
as a family. It saves everything to the "Tom's Story" Google Drive folder,
and only lets in the Google accounts you allow.

You do **not** need to know how to code to finish this setup — just follow
the steps below in order. It takes about 15–20 minutes, once.

---

## Step 1 — Create a free Google Cloud project

1. Go to https://console.cloud.google.com/ and sign in with the same Google
   account that owns the "Tom's Story" Drive folder.
2. Click the project dropdown at the top → **New Project**. Name it
   something like `toms-story` → **Create**.
3. Make sure the new project is selected (check the dropdown at the top).

## Step 2 — Turn on the Google Drive API

1. In the search bar at the top, type **Google Drive API** and open it.
2. Click **Enable**.

## Step 3 — Configure the consent screen

1. In the left sidebar, go to **APIs & Services → OAuth consent screen**
   (Google may call this "Google Auth Platform" now).
2. Choose **External** as the user type → Create.
3. Fill in an app name (e.g. "Tom's Story"), your email as support email,
   and your email again as developer contact. Save and continue through
   the remaining screens (you can leave scopes and defaults as-is).
4. **Leave the app in "Testing" status — do not click "Publish."** This
   keeps it private.
5. On the **Audience** (or "Test users") tab, click **Add users** and add
   the Google email address of every family member who should have access.
   This list is what controls who can sign in — it doubles as your login
   security.

## Step 4 — Create the OAuth Client ID

1. Go to **APIs & Services → Credentials** → **Create Credentials** →
   **OAuth client ID**.
2. Application type: **Web application**. Name it anything.
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:8000` (for testing on your own computer)
   - `https://YOUR-GITHUB-USERNAME.github.io` (once you know your GitHub
     Pages address — you can come back and add this after Step 6)
4. Click **Create**. Copy the **Client ID** it gives you (ends in
   `.apps.googleusercontent.com`).

## Step 5 — Fill in config.js

Open `config.js` in this folder and:
1. Paste your Client ID into `GOOGLE_CLIENT_ID`.
2. Add every family member's Google email into `ALLOWED_EMAILS` — this
   must match the Test users list from Step 3.5, or their sign-in will
   fail. Example:
   ```js
   ALLOWED_EMAILS: [
     "you@gmail.com",
     "sister@gmail.com",
     "cousin@gmail.com",
   ],
   ```

## Step 6 — Put it on GitHub Pages

1. Create a new GitHub repository (public or private — Pages works with
   either on a paid plan; public repos get Pages for free).
2. Upload these four files to the repo: `index.html`, `app.css`,
   `app.js`, `config.js`.
3. In the repo, go to **Settings → Pages**. Under "Source," choose the
   branch (usually `main`) and save.
4. GitHub will give you a URL like
   `https://YOUR-GITHUB-USERNAME.github.io/REPO-NAME/`.
5. Go back to Step 4 in Google Cloud Console and add that exact URL to
   **Authorized JavaScript origins**, then Save.

## Step 7 — Share the Drive folder

Make sure the "Tom's Story" Drive folder is shared with **Editor** access
to every email address in `ALLOWED_EMAILS` — otherwise their sign-in will
work, but saving and uploads will fail.

---

## What everyone will see

- **The first time**, family members will see a message that the app is
  "unverified." This is expected — it just means Google hasn't formally
  reviewed a small private family project (which would take weeks and
  isn't worth it here). They can click **Advanced → Go to Tom's Story
  (unsafe)** to continue. It's safe; this warning shows for any small
  app that hasn't gone through Google's optional review process.
- After that, they'll see **Sign in with Google**, then the story tool
  itself — same one as before, now with real recording, uploads, and
  playback, and everything living safely in your Drive folder.

## A note on devices

Recording directly in the browser works well on most laptops and Android
phones. Support can be inconsistent on some iPhones/iPads depending on
the browser. If the in-page recorder doesn't start, the reliable fallback
is: record with the phone's own Camera or Voice Memos app, then use the
**"📎 Upload photo or video"** button on the same question to add that
file — it uploads the same way and lands in the same place.

## If something breaks

Every save and upload goes to the same "Tom's Story" Drive folder, so
nothing is ever lost even if a step above needs troubleshooting — worst
case, answers just don't show up on the page until it's fixed. Feel free
to come back with whatever error message you're seeing.
