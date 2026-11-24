# Bansuri Guru — Phase 1 release gate (v31)

**Status: code prepared, production verification pending.** This checklist is not evidence that console settings, deployed rules, CI or live Google sign-in have already passed.

## What changed in source
- Public Firebase web-app config is consolidated in `firebase-config.js` and loaded before `cloud.js`. The previous inline copy was removed. No new users should have to paste config. Only nonsecret Firebase web identifiers belong in this file.
- The browser picks the deployed public config first and avoids using stale per-user local Firebase project settings. Google sign-in errors explain blocked popups, unauthorized domains, disabled Google provider and network problems.
- Firestore rules live in `firestore.rules`; the test harness is `firebase.json`, `tests/firestore.rules.test.mjs`, `package.json`, and `.github/workflows/security-tests.yml`.
- Sur Quest user/community lesson titles now render via `textContent` rather than HTML insertion.

## Tests to run before allowing public registration

1. On a development checkout with Node 22 and Java 21, run:
   ```sh
   npm install
   npm run test:syntax
   npm run test:rules
   ```
   Tests run with a local Firestore emulator and a fake `demo-bansuri-rules` project; they do not read or alter production user data.
2. Check the **GitHub Actions / Firebase security tests** workflow on the intended commit. Resolve every failure before deploying or opening access.
3. Firebase Console → Authentication → Sign-in method: confirm **Google** is enabled.
4. Firebase Console → Authentication → Settings → Authorized domains: add `bansuri-guru.medhrk.workers.dev` (and any actual custom production host). Confirm the exact deployed HTTPS origin and popup redirects. Do not assume authorized domains are inherited from Firebase Hosting.
5. Firebase Console → Firestore Database → Rules: compare the live rules against `firestore.rules` and publish the intended rules. Committing this file to GitHub or deploying Cloudflare assets **does not deploy Firestore security rules**. If your Firebase CLI is connected to the correct project, the controlled alternative is `firebase deploy --only firestore:rules --project bansuri-guru` after review.
6. In an incognito browser with no prior Bansuri Guru storage, open the live HTTPS site. Google login should appear and work **without entering a Firebase config**; the signed-in email should display. Repeat with a second unrelated Google account.
7. Account A: save a sample lesson and back it up. Account B: sign in on another browser profile; B must not see A's backup or overwrite it. A's data must reappear when restoring as A. Do not attempt cross-account document reads on real users; use emulator cases for authorization testing.
8. Attempt optional community song publishing as A, viewing while signed out and editing as B. B must not be able to edit/delete A's post.
9. Test Chrome/Brave on Android and Chrome desktop: microphone denial, permitted pitch capture, sustained note, Sur Quest, navigation away, saved take replay, and PWA refresh.
10. Verify signed-out controls, cloud first-upload/restore warnings, and re-login after a reload. Local browser audio should never enter cloud backups.
11. Keep community writing limited to trusted beta users until abuse reporting, moderation, quotas, copyright guidance and privacy policy are finalized.

## Rollout
- **Current stage:** internal/controlled beta; do not market as GA.
- **Pass for private beta:** all security emulator tests green, two-account sign-in/backup isolation confirmed, and basic real-device microphone acceptance tests pass.
- **Pass for unrestricted public production:** all beta gates plus privacy/terms, community content moderation, error monitoring, account/data deletion guidance, backups, and rollback rehearsed.
- **Rollback branch:** `restore/pre-phase1-auth-security-v31-2026-11-24`.

## Firebase setup and privacy notes

The `apiKey`, `authDomain`, `projectId`, and `appId` fields in a Firebase web app are public client configuration, **not authorization secrets**. Never commit private service-account JSON, admin SDK keys, OAuth client secrets or end-user tokens. Protect data using production Firestore rules, App Check where appropriate, least-privilege access, and tested authorization. Don't copy locally recorded audio into public shares or automatic backups without explicit user consent.

Cloudflare Workers static-site deployment and Firebase Firestore rules deployment are **separate operations**. Neither has been remotely verified in this phase.
