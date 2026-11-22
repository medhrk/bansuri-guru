# Bansuri Guru — Academy release

Public site: https://bansuri-guru.medhrk.workers.dev/

## Learning academy (current release)

- Beginner welcome and onboarding, seven-day challenge, four-week pathway.
- 12 original guided bansuri lessons with steps, goals and basic note references.
- 30 Bollywood/devotional/patriotic song-discovery cards with *external search links* to free notation sites and YouTube tutorials (results are not guaranteed).
- 11 curated free-to-view educational resources, including verified direct beginner YouTube videos.
- Lesson completion progress and song bookmarks in browser storage and optional Firestore cloud backups.
- Existing practice planner, Calendar OAuth, pitch reference, metronome, song notebook, Google Auth and backup/restore retained.

## Recovery / restore points

**Pre-academy checkpoint:** [restore/phase2-google-cloud-working-2026-11-22](https://github.com/medhrk/bansuri-guru/tree/restore/phase2-google-cloud-working-2026-11-22).

To roll back, visit GitHub → branch menu → choose restore branch to inspect, then revert academy commits or create a PR copying the checkpoint into main. **Back up Firestore and export your website's local JSON** before any database migrations; a Git branch preserves source code, not remote data. Never delete a working Firebase project during rollback.

## Setup

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for Firebase Google sign-in and strict Firestore access rules. Google Calendar uses an independent OAuth Client ID in the app. Do not commit secret keys or OAuth client-secret JSON.

## Hosting

This is a static web app. Cloudflare's GitHub integration can automatically deploy updates from the main branch. There is no npm build command; serve the repository root. The live deployment must be verified separately in Cloudflare.

## Educational / licensing notes

The lesson curriculum and practice exercises in this app are original. Links to third-party songs, tutorials and notations open their sites or search pages. Free-to-view content does not automatically grant copying, embedding, republication, or commercial licensing rights. No third-party copyrighted song transcriptions are bundled. For paid lessons, obtain appropriate rights or create/commission original material.

## Limits and next work

Audio tuner is a pitch estimate, not a graded full-performance teacher. Firestore synchronization is simple backup/restore, not conflict-free multi-device collaboration. Future: calibrated note-by-note assessments, fingering illustrations, skill-based personalized paths, performance recording and feedback, public SEO pages and optional premium accounts.
