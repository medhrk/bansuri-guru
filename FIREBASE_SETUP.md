# Google Login & Private Cloud Progress — Phase 2

Live site: https://bansuri-guru.medhrk.workers.dev/

This release adds **optional** Google sign-in and Firestore per-user practice backups to the existing local-only app. Calendar OAuth stays separate and continues to work.

## Public Bollywood notation sharing (v16)

Users can save a song privately, then explicitly choose **Make public** in **Song Notebook**. Only **title, film/artist, and the user's sargam notation** are published to the separate `publicSongs` Firestore collection; practice logs, account details and unpublished notes stay within the private `users/{uid}/practice/current` document.

**Administrator action required before sharing works:** Open your existing Firebase project → **Firestore Database → Rules**, replace the existing rules with the **complete updated `firestore.rules` file** in this repository, then click **Publish**. Publishing this GitHub file does **not** automatically deploy Firestore security rules. The site's Cloudflare hosting is separate from Firebase rules deployment.

How users share:
1. Connect Firebase and sign in with Google in **Google & Backup**.
2. In **Song Notebook**, save a title, artist/film, and your own sargam. Choose **🌍 Make public** on that saved entry.
3. Confirm the publication warning; only original/authorized notation should be shared, not copyrighted lyrics or unauthorized transcriptions.
4. Public entries appear under **Community Bollywood Notations**, even for visitors who do not sign in (but Firebase must be configured).
5. Use **🔒 Unpublish** to delete the public record while retaining the private note. Editing a published private note requires choosing **Update public copy**; the public edition does not change silently.

The app cannot provide moderation at scale or determine copyright ownership. User reports, rate limiting, moderation and takedowns should be implemented before inviting large-scale public contributions. The current browser displays up to 80 publicly visible notations from Firestore, sorted client-side by update date; it does not claim full catalog coverage.

## One-time Firebase configuration

1. Visit https://console.firebase.google.com/ and create or link a Firebase project.
2. In **Authentication → Sign-in method**, enable **Google**. In **Authentication → Settings → Authorized domains**, add `bansuri-guru.medhrk.workers.dev` (without https://).
3. In **Firestore Database**, create a database and choose a suitable region. Open **Rules** and paste the entire contents of `firestore.rules` from this repo, then **Publish**. Do not leave test-mode permissive rules in production.
4. In **Project settings → General → Your apps**, register a **Web app** and copy ONLY the public `firebaseConfig` fields: `apiKey`, `authDomain`, `projectId`, `appId`. These are not the OAuth secret JSON you downloaded for Calendar.
5. On the live Bansuri Guru website, open **Google & Backup**, paste a valid Firebase config JSON in its field, click **Connect Firebase**, then **Sign in with Google**.
6. Choose **Save this device to cloud** (overwrites any existing cloud copy) or **Restore cloud to this device** (overwrites local logs and songs with confirmation). Only enable **automatic cloud saving** after the initial upload or restore.

## Security and privacy

Firestore rules restrict practice records to the authenticated user. Never commit or paste Google OAuth client secrets, service account credentials, private keys, or access tokens. Firebase web config can be public; Firestore rules and authorized domains provide protection. The cloud code uploads only practice settings, sessions, notes, and songs; not the Google Calendar OAuth client ID.

## Current limitations

The Firebase project must be configured by its owner. Nothing will sync until configured and explicitly authorized. Account state lasts across refreshes through Firebase Auth; the *auto cloud save* toggle is deliberately off after refresh until you enable it again. This release offers a simple single-document cloud backup, not conflict-free multi-device real-time sync. Cloud backups replace rather than merge; export your local backup before restoring. Paid memberships and scored pitch lessons are upcoming.

## Files

- `index.html`: existing practice app + login/backup UI.
- `cloud.js`: Firebase web SDK, Google Auth, Firestore backup logic.
- `firestore.rules`: private user-specific access rules.
- `README.md`: initial setup instructions.
- `FIREBASE_SETUP.md`: this guide.
