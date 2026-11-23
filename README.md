# v25 — Virtual Bansuri Teacher

A **Virtual Bansuri Teacher** now appears at the top of **📊 My Progress**. This is a deterministic, entirely browser-based coaching experience, not a remote AI model.

It uses existing local pitch and practice summaries:
- Identifies weaker swaras only with at least **two measured attempts, ten or more valid samples**, and fewer than **75% near-target readings**. It recommends slow Sa-to-target exercises and a steady two-second hold, without claiming to know exact technique.
- When enough recorded Ma–Pa/Pa–Ma evidence exists and shows poor pitch results, recommends a slow Ma–Pa transition drill. Without reliable transition measurements it gives a general exercise rather than inventing a diagnosis.
- If many measured note attempts lack a saved two-second steady hold, suggests comfortable long-tone practice, explicitly acknowledging microphone-tracking uncertainty.
- If no microphone-verified song phrase is saved, recommends an initial short phrase in Song Learning Studio.
- Without enough samples, gives a starter routine instead of asserting personal weakness.
- Creates a practical **15-minute routine** (3-minute warm-up, 5-minute sur work, 4-minute transitions, 3-minute song phrase), with an action to open personalized Sur Quest and another to copy the routine.

**Privacy:** existing practice statistics are read locally; no audio, camera, AI API calls or new Firebase permissions are used. The advice does not diagnose embouchure, breath control, fingering or musical expression. Live microphone and Cloudflare runtime behavior still require on-device verification.

Pre-v25 source checkpoint: https://github.com/medhrk/bansuri-guru/tree/restore/pre-virtual-teacher-v25-2026-11-23

---

# v24 — My Progress Dashboard

A new **📊 My Progress** navigation tab presents the learner's saved musical practice evidence:
- **Practice time and 7-day activity:** minutes from logged practice sessions, not extrapolated time or passive site use.
- **Overall pitch accuracy:** weighted near-target microphone readings on the currently selected flute Sa, calculated from recent saved note-attempt summaries; excludes skipped/unmeasured notes and notes measured for other flute references.
- **Steady-note holds:** counts saved swara attempts marked as having completed the two-second hold, not a continuous duration total.
- **Song phrase milestones:** distinguishes microphone-verified phrase completion from other unlocked steps, including unverified manual completion.
- **Per-swara performance:** individual measured pitch rates with their underlying sample counts and steady-hold counts.
- **Recent Sur Quest results:** last eight available microphone-scored missions, plus any logged guided Riyaz pitch estimate.
- **Private recording inventory:** counts local IndexedDB audio takes, distinct recorded phrases and approximate duration. Only summary counts are read; no audio is played or uploaded by the dashboard.

The dashboard is built client-side; it does not introduce new public data access, cloud data collections, audio uploads or Firebase rules. When history is empty, it explicitly states that there is insufficient evidence. The interface is responsive for mobile phones and older desktop browsers.

Restore before v24: https://github.com/medhrk/bansuri-guru/tree/restore/pre-progress-dashboard-v24-2026-11-23

Live browser deployment and microphone/IndexedDB integration still need real-device verification.

---

# v23 — Private bansuri phrase audio recording

**New:** Under **Song Notebook → Song Learning Studio → Study → Phrase-by-phrase teacher**, each phrase now has **My flute recording**. Record up to 45 seconds, play back a saved take, separately play the synthesised reference notes, download an audio file, and delete individual takes.

- **Privacy:** raw audio is stored **only in this browser** using IndexedDB. It is not uploaded to Firebase/Firestore, included in the existing Google backup, or published with community-supplied notation. Anybody with access to the same browser profile/device may be able to listen to local saved recordings; audio isn't separately encrypted.
- A maximum of 50 locally stored takes is enforced. Each take is limited to 8 MB; the MediaRecorder MIME type depends on browser support (WebM/Opus, MP4/M4A or Ogg when available).
- Playback references are synthesized from the current flute Sa; playback is refused while the mic is actively recording so the reference sound is not accidentally captured in the take.
- If the app loses foreground visibility, the user navigates away, or the phrase changes, an in-progress recording is discarded and microphone tracks are stopped. Previously saved takes remain.
- Recordings are grouped by the selected song identifier, phrase number and note sequence, with a creation timestamp. There is no pitch score attached to recordings; use Sur Quest's microphone assessment for approximate pitch feedback.
- **Device retention:** IndexedDB is origin- and browser-profile-specific. Clearing site data, switching browsers/devices or private browsing may make recordings unavailable. Download important takes explicitly.
- This introduces no new Firebase permissions or backend. It requires microphone permission, HTTPS and an IndexedDB/MediaRecorder capable browser.

Source restore point before v23: https://github.com/medhrk/bansuri-guru/tree/restore/pre-phrase-recording-v23-2026-11-23

---

# v22 — Adaptive Phrase Loop Tempo

**Song Notebook → Song Learning Studio → Study → Phrase Loop Trainer** now includes an optional **🎙 Adaptive tempo** setting in addition to manual repetition and automatic +5 BPM per round.

Adaptive mode uses separate **Listen** and **Your turn** phases for each repetition:
1. The app plays the user's selected phrase as reference tones at the current tempo.
2. The tones stop; after a short silence, the learner plays the phrase on the bansuri for one phrase-length while the microphone checks pitch for each swara.
3. To increase by **5 BPM**, the attempt must have usable pitch readings for **every sounding note** (minimum two per note), at least **75% overall near-target pitch checks**, and no individual note with fewer than **60%** near-target checks.
4. If checks are missing or outside the pitch range, the tempo is **held constant** and another round begins. Rests are not scored.
5. The loop ends after the selected number of repetitions. No automatic unlock or graded phrase certificate is awarded; phrase mastery remains in Sur Quest's two-second stability lessons.

The selected flute's reference Sa is used throughout. Microphone access is requested only upon clicking Start in adaptive mode; the browser microphone stream is stopped on Stop, lesson change, navigation, tab backgrounding or completion. Sound is synthesized from original/user-authorized notation, not commercially licensed recordings.

**Limitations:** This is early browser-based approximate pitch assessment, not validated note timing or musical performance evaluation. Microphone noise, instrument harmonics, browser timing jitter and playback bleed may affect scores. Practice with headphones if possible, and test on the deployed device.

Restore source before v22: https://github.com/medhrk/bansuri-guru/tree/restore/pre-adaptive-tempo-v22-2026-11-23

---

# v21 — Phrase Loop Trainer

The Song Learning Studio phrase coach now offers **Phrase Loop Trainer**: set 35–120 BPM, choose 2, 3, 4, 6 or 8 repetitions, optionally increase tempo by 5 BPM after each repetition, or use a 40 BPM shortcut. The app synthesizes only the sargam reference notes relative to the selected Sa; rests remain silent. Start / Stop controls cancel pending scheduled tones. Loops also stop when switching phrases, opening a guided lesson, leaving Song Notebook, or backgrounding the page. Loop completion does not award pitch scores or unlock phrases; those remain in the separate microphone-guided lesson or explicitly unverified manual action.

This is browser-based reference playback, not analysis of actual played notes. The live Cloudflare deployment and browser audio still require on-device verification.

---

# v21 — Phrase Loop Trainer

In **Song Notebook → Song Learning Studio → Study → Phrase-by-phrase teacher**, learners can now rehearse a single unlocked phrase repeatedly before attempting microphone-verified scoring.

- Adjustable **starting tempo from 35 to 120 BPM** with a quick 40 BPM beginner setting.
- Choose **2, 3, 4, 6, or 8 repetitions**.
- Optional **increase by 5 BPM on each new repetition**, capped at 120 BPM.
- Audible synthesized swaras use the current selected flute Sa. Rests (—) occupy a beat and remain silent.
- **Start/Stop** and live cycle status provide control. Changing lessons, selecting a different phrase, navigating out of Song Notebook, or leaving the page stops playback.
- Looped listening/practice **does not count as mastering a phrase** and **does not unlock** the next one; verified and manual completions remain separate.
- No third-party recordings, licensed film melodies, raw microphone recordings, subscriptions or new Firebase permissions required. Existing saved songs, account and progress remain unchanged.

**Source restore:** https://github.com/medhrk/bansuri-guru/tree/restore/pre-phrase-loop-v21-2026-11-23

Limitations: this is a synthesized audio practice reference, not a real bansuri or tabla accompaniment. The app does not automatically judge a user's pitch while the loop is playing; use **Practise with teacher** for microphone feedback.

---

# v20 — Phrase-by-phrase Bollywood and Bhakti teaching

**Song Notebook → Song Learning Studio → Study** now offers a stepwise **Phrase-by-phrase teacher**, in addition to the full-song lesson.

- Uses explicit `|` separators in a user's existing sargam notation to divide a song into teachable phrases. A song without separators is one phrase.
- Each phrase has **Listen to phrase**, **Practise with teacher**, and **Mark manually practised** actions.
- The next phrase is locked until the current one is completed. Microphone-verified completion requires every sounding note to have satisfied the existing two-second steady note hold in Sur Quest Learn mode, with **no skipped notes**. Rests are not treated as pitched notes.
- A successful microphone-verified phrase records a rough percent-in-tune reading and adds a check mark. Manual practice is clearly shown separately as unverified and has **no pitch score**, but can unlock progress for users unable to enable the microphone.
- Phrase unlock and verified score data are saved as `songPhraseProgress` in local practice data and the existing private Firestore backup. Saved private songs receive stable local lesson IDs to avoid losing progress if song positions change.
- Shared community songs open the same Song Learning Studio phrase coach; visitors can practise user-contributed notation but the site does not independently verify licensing or musical accuracy.
- Reference tones use the current selected flute Sa; original and user-authorized exercises only. No third-party audio or copyrighted scores are embedded.
- Source recovery checkpoint before the release: https://github.com/medhrk/bansuri-guru/tree/restore/pre-phrase-lessons-v20-2026-11-23

Limitations: phrase scoring depends on microphone detection quality and should not be interpreted as a professional music assessment. A successful phrase does not confirm the rhythm, ornamentation or melody transcription is authentic. Browser runtime on a real microphone is still unverified.

---

# v19 — Guided Bollywood and Bhakti Song Learning Studio

A **Song Learning Studio** now appears at the top of **Song Notebook**. Learners can filter original practice melodies and their personal saved notes by **Bollywood**, **Bhakti**, or **Other**, search them by title or notation, listen to a synthesized note reference, and launch a guided Sur Quest lesson with the same notation.

- **Four new original examples**, not transcriptions of copyrighted songs: Krishna Morning, Ganesha Greeting, Rama Evening, and Cinema Mood.
- Saved songs can be categorized during create/edit, without changing existing song content. Previous entries default to the Bollywood filter unless explicitly classified.
- Supports spaced note symbols S R G M P D N S', chromatic Hindustani forms r g d n / M^, ordinary aliases Sa Re Ga Ma Pa Dha Ni, rests and phrase separators.
- The lesson parser rejects unsupported tokens including lyrics, and caps guided lessons at 96 note/rest events. Long pieces can be split into sections. It does not invent notation.
- **Community Bollywood Notations → Learn step by step** opens contributed notation using the same Sur Quest teacher, subject to validation.
- The Sur Quest learning engine already provides microphone pitch feedback, a green/yellow/red accuracy bar, and continuous two-second note holds before advancing. Your selected flute reference (e.g. A4=440 Hz) is respected.
- Song playback is generated from musical intervals relative to selected Sa; no third-party recordings, arrangements, or copyrighted music are bundled.
- Firebase backup, private/public distinction, Google sign-in and Firestore security rules are unchanged.

Restore source pre-v19: https://github.com/medhrk/bansuri-guru/tree/restore/pre-song-lessons-v19-2026-11-22

---

# v18 — Sign-in button visibility and stale browser cache fix

After a signed-in user reported seeing both **Sign in with Google** and **Sign out** simultaneously, the account page now uses a redundant, explicit `hidden` attribute and inline `display:none`, synchronized from Firebase's real `onAuthStateChanged` state. The account page shows **Google connected** plus the account email and **Sign out** instead of a redundant sign-in prompt. Configuration options are in an optional "Firebase configuration (advanced)" disclosure and no longer occupy the main account card by default.

The service worker cache was bumped to v18 and deletes older Bansuri Guru caches on activation to reduce stale asset collisions. If an older installed PWA remains controlled by a stale worker, close and reopen the page or refresh once after the new worker takes control.

Existing Firebase authentication, Firestore security rules, cloud backups, community songs, and saved lesson data remain unchanged.

Pre-fix rollback: https://github.com/medhrk/bansuri-guru/tree/restore/pre-auth-visible-fix-v18-2026-11-22

---

# v17 — Google sign-in button follows live authentication state

- Under **Google & Backup**, **Sign in with Google** is hidden when Firebase confirms the user is already authenticated, including on a reloaded page after session restoration.
- The **Sign out** button is displayed only when a Google account is signed in; after sign-out, the sign-in option returns.
- On page load, the app automatically configures Firebase using the locally saved **public** Firebase web config. It waits for Firebase to confirm the restored session rather than showing an incorrect sign-in prompt during that check.
- Auth state comes exclusively from Firebase's `onAuthStateChanged`; it is not inferred from a manually set localStorage flag. No new Google tokens, credentials, or secrets are persisted.
- Existing backup, practice and public Bollywood notation sharing workflows are unchanged.

Source restore point: https://github.com/medhrk/bansuri-guru/tree/restore/pre-auth-button-state-2026-11-22

---

# v16 — Community Bollywood Sargam Sharing

Users may now optionally publish their own authorized song notations from **Song Notebook**.

- Songs remain **private by default**. Each saved song has a **Make public** button; authors must sign in via the existing Google/Firebase connection and confirm that the notation may be shared.
- The separate Firestore `publicSongs` collection stores only the song title, film/artist label, authored notation, publication timestamps, and a Firebase account ownership ID. Other user's notes and private logs are **never** read from this collection.
- Published contributions appear in a searchable **Community Bollywood Notations** section with sargam playback and copy controls. These are unverified community submissions, not official musical scores.
- The author can **Unpublish**, leaving their private entry intact. Private edits to a published notation **do not** silently change the shared copy: choose **Update public copy** after saving changes.
- If the user deletes a locally saved published song, the app attempts remote unpublication first and aborts deletion on failure.
- Guest users can view published notes once the shared Firebase app is configured; only a signed-in owner may publish, edit or unpublish their own entry.
- **Deployment requirement:** manually publish the repository's updated `firestore.rules` from Firebase Console → Firestore Database → Rules. GitHub/Cloudflare deployment does not deploy Firebase rules. Existing personal backup rules remain private.
- The community feed loads up to 80 public notes; moderation/reporting, pagination and reliable copyright review need backend development before large-scale community growth.
- Do not share full copyrighted lyrics, transcriptions you lack permission to distribute, or personal identifying information in public notations.

Rollback source: https://github.com/medhrk/bansuri-guru/tree/restore/pre-community-songs-v14-2026-11-22

---

# v15 — Preserve Song Notebook + expand Sargam & Raag

The existing **My Bollywood song notebook** is preserved rather than replaced. It still stores the user's title, film/artist, custom sargam notation and original playback/delete actions. Existing `s.songs` records remain backward compatible. Enhancements:
- **Add any song**: completely freeform title, film/artist and user-written notation, including devotional, folk, Bollywood or original music. No fixed catalog or subscription required.
- **Edit** a previously saved song and its notes without losing the entry; cancel editing safely.
- **Search** by title, artist or notation.
- **Save in my notebook** from the existing Bollywood discovery recommendations; existing Bhakti discovery also prefills the notebook. New discovery actions exit any prior edit to avoid overwriting older notes.
- Remove the previous silent 200-song truncation on Firestore backup. Local storage remains available; very large backups can still trigger the existing 750 KB Firestore payload limit. Users should export their JSON data periodically.

The **original eight Sargam & Raag exercises** are unchanged and visible. An additional searchable and filtered library now provides:
- **24 new original sargam/alankara drills** across beginner/intermediate/expert.
- **20 raag introductory frameworks**, each with separate aroha, avaroha and phrase exercises (60 lessons).
- Thus **84 additional exercises**, making **92 in total** on the Sargam & Raag page.
- A reference tone preview uses the selected bansuri Sa, including **komal r/g/d/n and tivra M^**. The Sur Quest interactive practice accepts these pitch tokens. The generic fingering diagram explicitly warns that alternate/altered-note fingerings are not exact.
- User can search titles or note sequences, filter by level and lesson type, and launch exercises into Sur Quest for live pitch practice.

Raag teaching phrases are simplified educational examples, **not complete raga grammar**; gharana-specific pakad, ornamentation, chalan, and ascending/descending details need independent study with a qualified teacher. No copyrighted lyrics or full song transcriptions are included.

**Preserved recovery source:** https://github.com/medhrk/bansuri-guru/tree/restore/pre-notebook-raag-expansion-v15-2026-11-22

This upgrade was source-reviewed and syntax-tested with generated lesson token validation. Real microphone grading and Cloudflare live deployment have not yet been verified.

---

# v14 — Levelled Alankara and Ma–Pa Transition Academy

## Curriculum changes
Bansuri Guru now teaches **48 original exercises** across three independently selectable levels:
- **Beginner:** 12 beginner alankaras/paltas and 4 slow Ma–Pa transition studies, generally 42–50 BPM.
- **Intermediate:** 12 intermediate patterns (skips, reversal, groups of 4, triplet movement) and 4 Ma–Pa combination studies, ~55–65 BPM.
- **Expert:** 12 advanced patterns (wide leaps, cascades, reversals, accented groupings) and 4 rapid Ma–Pa transition studies, ~76–86 BPM.

All 48 patterns are original teaching material. Every exercise is playable through **Daily Practice → Alankara & Palta Academy → Practise**, opening Sur Quest with its currently selected Sa, pitch bar, fingering cues and two-second note stability requirement in Learn mode.

The **Beginner / Intermediate / Expert** selector is shared with Sur Quest. Selecting a level immediately changes its core five missions. The choice is stored on the user's device and included in existing optional Firestore backup data as `learnerLevel`. Previously saved records without this property default to beginner.

## Ma–Pa emphasis
The timed five-stage guided riyaz has been reweighted: roughly **11/30 of the session for alankaras** and **9/30 for Ma–Pa transition practice**, with breath/long Sa, application and cool-down taking the remaining 10/30. The specific alankara and Ma–Pa drill rotate by calendar day and chosen difficulty. The original Bhupali and melody libraries remain available in their separate sections.

Shuddha Ma often involves partial (half-hole) opening of the first finger hole. Pa may be obtained with all six holes closed using appropriate air support or with a technique-dependent alternative fingering. Both need teacher/instrument verification; the app shows a half-hole symbol for Ma and a six-hole Pa example rather than treating either as universal.

## Adaptive teacher
The personalized exercise always includes a Ma–Pa clinic and a level-appropriate alankara. It also retains weakness detection from measured pitch samples; consecutive Ma–Pa and Pa–Ma transitions are tracked separately when enough valid microphone evidence exists. These are note-pitch observations, **not rigorous timing, articulation or fingering scores**.

## Testing, persistence and recovery
JavaScript is syntax checked and exercise generation tested; real microphone and Cloudflare deployment must still be verified. No audio files are uploaded or stored. No new paid services or Firebase rules.
- **Pre-v14 rollback:** https://github.com/medhrk/bansuri-guru/tree/restore/pre-alankara-levels-v14-2026-11-22
- GitHub restores source code only. Back up user practice data separately with the app's Export feature before data migrations.

---
# v13 — Adaptive Riyaz Teacher

**New:** "Today's focus" at the top of **Daily Practice** and **Sur Quest**. Tap "Start my personal practice" to open a generated **My Personal Riyaz** mission with swaras chosen based on your pitch history.

## How it works
- Every completed Sur Quest session with microphone observations records a capped, per-note summary: note, observed frames, in-tune frames, average absolute pitch deviation, skipped flag, and date.
- Notes with fewer than three observations per occurrence are treated as **insufficient evidence**. Skipped / unmeasured notes are excluded from weakness rankings. Notes need at least two observed occurrences and ten total valid observations before being flagged as reliably difficult.
- Notes below 75% observed in-tune readings are selected as focus notes. The adaptive lesson begins with Sa warmup, then repeats the chosen notes and transitions, finishing with a cool-down.
- With insufficient history or no detectable weak areas, the app uses a balanced **Sa–Re–Ga** starter session without claiming personalized insights.
- **Every day**, opening the app regenerates its recommended focus from the most recent capped evidence. The mission can be repeated and is never locked behind a subscription. All sound and progress computations are browser-side.
- The personalized mission uses the existing Sur Quest **Learn mode**, where each note needs two seconds of steady pitch within ±35 cents to advance.
- The recommendation isn't professional-grade assessment; octave ambiguity and microphone errors may affect it. It measures pitch consistency, not tone beauty, breath control or classical raag mastery.

## Storage, backup, safety
- Local practice data now includes `quest.noteAttempts`, capped at 400 entries, and the optional existing private Firestore practice backup includes it.
- No new Firebase rules, paid AI API, or microphone upload is needed. Only summarized pitch observations are saved, not raw audio.
- Google sign-in, existing timed guided practice, raag/bhakti library, lesson history and user Sa settings remain available.
- Source rollback: https://github.com/medhrk/bansuri-guru/tree/restore/pre-adaptive-teacher-v13-2026-11-22
- Code restores do not roll back existing Firestore records; export practice JSON before migrating.

---

# v12 — Continuous note stability training

**Added:** a visible **Steady note challenge** under the frequency bar in Daily Practice → Guided Riyaz and Sur Quest.

- Hold the displayed swara for **two consecutive seconds** within ±35 cents of the currently selected bansuri Sa.
- The progress bar accumulates elapsed *time* between consecutive valid microphone readings, not just the count of successful reads.
- If your note drifts outside tolerance, the microphone loses the clear tone, or the gap between readings exceeds 350 ms, the hold resets.
- In **Sur Quest Learn mode**, a note now advances after the full continuous two-second hold, instead of three quickly matching samples.
- Practice and Perform modes continue advancing on rhythm; the hold meter provides feedback without stopping their timed flow.
- **Guided Riyaz** retains its planned timed stages. Stability is feedback only (not a requirement to advance to the next timed exercise).
- No microphone means neutral/unscored status. The meter reports pitch stability relative to a note, **not** airflow, musical quality, or performance certification.
- The existing Firestore data schema is unchanged; no migration needed.

Restore before v12: https://github.com/medhrk/bansuri-guru/tree/restore/pre-stability-trainer-2026-11-22

---

# v11 — Live pitch accuracy bar

A visual frequency deviation meter is now available in **Daily Practice → Guided Riyaz** and **Sur Quest**. It uses the current note's expected pitch, calculated from the selected bansuri Sa.

- **Green (±35 cents)**: close to target, encouraging accuracy.
- **Yellow (36–70 cents)**: moderately sharp or flat; gently adjust.
- **Red (more than 70 cents)**: noticeably off target, or an octave mismatch.
- **Neutral (no score)**: microphone off, silence, no reliable pitch, or a beat marked as rest.

The black needle moves left if flat and right if sharp. Numerical cents are supplied as text alongside the colour indication for accessibility. It does not confuse microphone silence with poor playing. Sur Quest Learn mode still needs three consecutive accurate readings before advancing. This meter is visual feedback and **not** a validated measure of performance quality; environmental noise and harmonics can distort frequency estimates.

**Restore source:** https://github.com/medhrk/bansuri-guru/tree/restore/pre-live-pitch-meter-2026-11-22

---
# v10 — A4 standard preset and octave-aware guidance

Changes on 22 November 2026:
- Removed special 436 Hz A-flute preset from the global practice selector, Daily Practice, and Sur Quest.
- A-scale Sa defaults to 440 Hz (A4) for new users; prior saved 436 Hz presets are normalized to 440 when loaded locally or restored/uploaded through Firestore. Other custom Sa values remain unchanged.
- Guided Riyaz, Sur Quest, and Raag/Taal practice now distinguish a note one octave high or low from a merely sharp/flat note. Octave mismatches **do not count as correct**: a harmonic or genuinely incorrect octave is not graded as accurate.
- Pitch detection remains experimental. Misidentified harmonics may still occur. Test in a quiet room, with a stable note and no loud reference speaker.

Restore before v10: https://github.com/medhrk/bansuri-guru/tree/restore/pre-octave-detection-v10-2026-11-22

---
# Live bansuri selector — v9

The practice screens now include a persistent **My bansuri** selector above the lesson content, visible in Daily Practice, Sur Quest, Raag/Taal/Bhakti, Sargam and Sur/Taal. It defaults to the currently saved Sa. It offers **A scale / measured Sa 436 Hz**, **A4 / 440 Hz**, A3, C4/C5, D5, G4 and E4, plus any custom measured Sa. Changing preset updates saved `s.sa` immediately and refreshes reference pitches and active note targets in Guided Riyaz and Sur Quest. The independent Daily Practice and Sur Quest selectors continue to work and synchronize. The existing Firestore backup schema already stores `sa`, so no migration or extra Firebase permissions are necessary.

To set the user's observed A bansuri: select **A scale — My measured Sa (436 Hz)** from the on-screen selector during practice. The reading was reported with the three upper holes covered, bottom three open. Do not assume that 436 Hz is automatically the correct Sa for every A scale flute. Use a stable played reference and independent tuner for confirmation.

Recovery: https://github.com/medhrk/bansuri-guru/tree/restore/pre-practice-flute-selector-2026-11-22 . Export local data before migrations: Git branches protect source code, not Firestore data.

---

# C Natural Medium flute frequency correction

**Reported issue:** C flute not recognized when Sa was set to the old site default 261.63 Hz. Many C Natural Medium (C5 Sa) six-hole bansuris play Sa around **523.25 Hz**, with the top three holes covered; models labeled by a different convention or register can differ. Do not automatically overwrite existing people's saved values.

## What changed
- In **Daily Practice**, choose **C Natural Medium — Sa C5 (523.25 Hz)** and click **Save settings**. Alternatively choose C4 lower octave or enter your measured Sa manually.
- In **Sur Quest → Calibrate your reference Sa**, select the C5 preset or measure a clear note by microphone. Saving changes the common Sa used by the practice reference tones and pitch guidance.
- Updated browser pitch autocorrelation to normalize correlations by signal energy to reduce short-lag/harmonic bias. It is still experimental and subject to octave confusion, room noise, breath turbulence and device frequency limits.
- Old user settings, Firebase records and other tools are retained. **Pre-fix restore:** https://github.com/medhrk/bansuri-guru/tree/restore/pre-c-flute-fix-2026-11-22

## Troubleshooting
1. Confirm whether the manufacturer's key label refers to three-hole Sa or six-hole base note.
2. Cover the three upper holes nearest the mouth; play a steady Sa. Set C5 only if that note is approximately C5.
3. Enable the microphone in Sur Quest and inspect the detected Hz. A reading around 261.6 while playing 523.3, or vice versa, indicates octave confusion in the detector or embouchure; compare with an independent tuner before adjusting the flute.
4. Avoid playing reference audio through speakers during microphone detection; headphones help avoid accidental feedback.
5. After deploying, refresh with Cmd+Shift+R and check Cloudflare Workers deployment if changes are not visible.

---
# Interactive Sur Quest — Concept v2 / Release v6

Bansuri Guru now includes **Sur Quest** (navigation tab). This is the second-generation interactive teaching experience, layered on top of earlier Academy v5.

## How to use
1. Open **Sur Quest**, choose one of five original lessons: First Clear Sa, Sa Re Ga, Bhupali Journey, Keharwa Quest, or Devotional Melody.
2. Select a mode: **Learn** (next note only when pitch is near target for three samples, or when manually skipping), **Practice** (notes progress one per beat), or **Perform** (continuous timing with a simple summary).
3. Set your flute's Sa. Check the simplified six-hole fingering diagram and use **Hear note** as needed.
4. Optionally authorize microphone access over HTTPS. The tuner is approximate and can be confused by noise or upper partials; use headphones for reference tones if possible.
5. Repeat lessons until pitch stability improves. A "mastered" marker needs at least 70% of all expected sounding notes with a near-target mic reading. Never claim a grade when no microphone evidence exists.

## Cloud data and recovery
- Firebase Google authentication, Calendar and existing practice logs remain intact.
- The optional Firestore backup document now includes a `quest` object with up to 100 attempts and best percentages. Existing documents missing this field continue to load with defaults.
- **Pre-upgrade recovery:** [restore/pre-sur-quest-2026-11-22](https://github.com/medhrk/bansuri-guru/tree/restore/pre-sur-quest-2026-11-22).
- Git restores *code*, not Firestore data. **Export backup** in Google & Backup before a significant migration, then verify your saved document under Firestore.
- Cloud sync still uses explicit upload/restore, with optional auto-save following the first upload. It does not merge simultaneous edits across devices.

## Known limitations
- Pitch estimates are not performance-grade or instrument-specific clinical assessments. The browser uses microphone-based autocorrelation with a ±35 cent tolerance. Breath noise, low notes and octave confusion may affect results.
- Fingering diagrams are simplified examples for shuddha swaras and may differ across bansuri schools, instruments and octave technique.
- Learn mode has no time pressure. Practice/Perform advance by BPM, and the metronome is a synthesized click rather than tabla audio.
- Scores reflect swaras that were near-target during observation; comprehensive rhythm attack precision and sustained-note quality grading remain future work.

## Installation
This is a no-build static website. GitHub main is deployed through Cloudflare; the live Cloudflare deployment requires separate verification. Refresh (Cmd+Shift+R on Mac) if an older service-worker cache appears.

---

# Bansuri Guru v5 — More raags, taals, bhakti and note checking

**Added:** an integrated Raag • Taal • Bhakti teaching area with 10 introductory raags, 7 counted taals, 30 devotional-song discovery cards and 16 film-song learning associations. These are curated teaching suggestions rather than complete licensed scores or definitive film-to-raag classifications.

**Interactive Listen–Play–Check:** select a raag/taal exercise, listen to a generated note reference, enable the microphone, and play each note. Three consecutive approximate frequency estimates within ±35 cents advance to the next note. You can skip or repeat. This tool is an experimental pitch guide and is sensitive to octave differences, noise and microphone quality. It is not a formal sur assessment. The separate five-stage guided timed riyaz remains available.

**Notation convention:** lowercase r/g/d/n are komal, `M^` is tivra Ma, `S'` upper Sa. The original five-stage guided practice remains shuddha-swara only; for accurate komal and tivra pitch use the new Raag • Taal • Bhakti practice screen.

**Resources:** externally hosted notation and YouTube tutorial search links are not copied into the app. Direct original learning references are provided where found. Respect third-party licensing and use your own notation for commercial lessons.

**Restore points:** [before v5](https://github.com/medhrk/bansuri-guru/tree/restore/pre-raag-bhakti-teacher-v5-2026-11-22) and [working Google cloud](https://github.com/medhrk/bansuri-guru/tree/restore/phase2-google-cloud-working-2026-11-22). Git restores code only: separately export local practice JSON / back up Firestore before any database changes.

---
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
