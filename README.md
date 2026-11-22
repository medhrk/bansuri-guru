# Bansuri Guru — Guided Riyaz v4

## New guided session (2026-11-22)

The **Daily Practice → Start guided session** control now runs a real 5-stage lesson:
1. Breath and long Sa.
2. Sargam and finger warm-up.
3. Raag Bhupali.
4. Original film-style melody.
5. Dadra cool-down and reflection.

Select **15, 30, 45 or 60 minutes** and save; the app allocates every minute across all five stages with an accurate whole-session countdown. At each stage it displays swaras, approximate target frequencies from your configured Sa, a moving note highlight, the active beat in the taal cycle, tempo, time remaining in the stage, and teacher instructions. The routine advances automatically. Users may pause, resume, skip or go back.

Metronome ticks are enabled by default. Reference-note playback is **opt-in** to avoid covering live flute sound. Microphone permission is optional; pitch feedback estimates cents deviation, and the app only displays an approximate in-tune sampling percentage when microphone evidence exists. This is **not** transcription-quality or a graded Padhanisa equivalent yet. Practice history persists locally and in cloud backups if cloud sync has been enabled.

**Do not press Log Session until the session starts.** Logging records actual elapsed practice minutes (not the selected goal), whether it finished, optional sampled pitch accuracy and your reflection.

## Recovery

- Previous academy checkpoint: https://github.com/medhrk/bansuri-guru/tree/restore/pre-guided-practice-2026-11-22
- Working Google-login checkpoint: https://github.com/medhrk/bansuri-guru/tree/restore/phase2-google-cloud-working-2026-11-22
- Export local practice data under Google & Backup before a database migration. Git branches do not back up Firestore records.

---

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
