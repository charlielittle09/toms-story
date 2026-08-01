// ---------------------------------------------------------------
// Fill in the two things marked TODO below. Everything else is
// already wired up to the Google Drive folders that were created
// for this project. See README.md for step-by-step setup.
// ---------------------------------------------------------------
const CONFIG = {
  // TODO: paste the OAuth Client ID you create in Google Cloud Console
  GOOGLE_CLIENT_ID: "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com",

  // TODO: add every family member's Google email address that should
  // be allowed to sign in. Only these emails will be let in.
  ALLOWED_EMAILS: [
    // "you@gmail.com",
    // "sister@gmail.com",
    // "cousin@gmail.com",
  ],

  // These map to the "Tom's Story" folder tree already created in Drive.
  ROOT_FOLDER_ID: "1jZgW6YIdvKgw-5HuZx6kL_SOkOyy98D1",
  CHAPTER_FOLDERS: {
    c1: "1GZWAPzHmDCFwUo1TDV0gdNK6ujnTsgDW", // 01 Who Am I
    c2: "1G2YtwvevqFynzUa-3VrvIklfwOf6sUiF", // 02 Army Stories
    c3: "120TftFr-x9JyDdbU0YU2PCYFXej5LjAY", // 03 Falling In Love
    c4: "1qELn5g57i1Vty6zi6QbfcSl77lV5suxl", // 04 Becoming Dad
    c5: "11OHBv5pqA1xAZZytnVD7HTaZBKefZRHn", // 05 The Little Things
    c6: "12oww0UorvFEg5eYf3ZnY4eEQ-IlsRXfG", // 06 Wisdom
    c7: "1XIIqrIir7KyeSujwyqRcvDz8-w-lJHEi", // 07 What I Believe
    c8: "1LhCCoPdTXCOCvfPT_VYdqk0kscu5rKuC", // 08 The Fun Stuff
  },
  MONTHLY_FOLDER_ID: "1GjKcdsKKNQ8n5pglR8C4iMCgeF7Fb016",

  DRIVE_SCOPES: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email",
};
