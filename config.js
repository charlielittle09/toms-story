// ---------------------------------------------------------------
// See README.md for step-by-step setup.
// ---------------------------------------------------------------
const CONFIG = {
  GOOGLE_CLIENT_ID: "586116883370-hoqnchlk7psfh294vl2bi941ndnlk3ra.apps.googleusercontent.com",

  // Each family member's Google email, mapped to a role. Must exactly
  // match the Test users list in Google Cloud Console (Google Auth
  // Platform → Audience) — both lists are required, or that person's
  // sign-in will fail.
  //
  // IMPORTANT: a role here does NOT by itself grant access to the
  // "Tom's Story" Google Drive folder — that's a separate manual share
  // (Drive → right-click the folder → Share). Anyone with a role below
  // but no Drive share will pass sign-in and then hit a
  // "404 File not found" error the moment the app tries to load or save
  // anything.
  //
  // Roles:
  //   "super_admin" — full access: everything, including editing the
  //                    title/subtitle and the wording of core questions.
  //   "admin"        — can answer, record, upload, skip, and add/remove
  //                    their own custom questions, but cannot edit the
  //                    wording of the original core questions or the
  //                    title/subtitle.
  //   "view_only"    — can only see "The Story So Far" page (read-only,
  //                    including playback of recordings).
  ALLOWED_EMAILS: {
    "charlie.l.little@gmail.com": "super_admin",
    "lucy.little.tomlinson@gmail.com": "super_admin",
    "margaretplittle@gmail.com": "super_admin",
    "ted.j.tomlinson@gmail.com": "super_admin",
    "charleslit@gmail.com": "admin",
    "effie.richert@gmail.com": "admin",
    "garyrichert@gmail.com": "admin",
    "tom.richert@gmail.com": "admin",
    "yeongju.richert@gmail.com": "admin",
    "jrlittle42@gmail.com": "view_only",       // Janie / Mom
    "charlielittle09@gmail.com": "view_only",  // Charlie's second account (testing)
  },

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
