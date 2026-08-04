// ---------------------------------------------------------------
// See README.md for step-by-step setup.
// ---------------------------------------------------------------
const CONFIG = {
  GOOGLE_CLIENT_ID: "586116883370-hoqnchlk7psfh294vl2bi941ndnlk3ra.apps.googleusercontent.com",

  // Every family member's Google email address that should be allowed to
  // sign in. Must exactly match the Test users list in Google Cloud
  // Console (Google Auth Platform → Audience) — both lists are required.
  ALLOWED_EMAILS: [
    "charlie.l.little@gmail.com",
    "margaretplittle@gmail.com",
    "lucy.little.tomlinson@gmail.com",
    "effie.richert@gmail.com",
    "garyrichert@gmail.com",
    "tom.richert@gmail.com",
    "yeongju.richert@gmail.com",
    "ted.j.tomlinson@gmail.com",
    "jrlittle42@gmail.com",
    "charleslit@gmail.com",
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
