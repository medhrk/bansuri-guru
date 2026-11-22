# Bansuri Guru — Phase 1 MVP

An original, lightweight daily bansuri practice web app. Works without a server backend. Includes local practice planner, timer, logs, sargam audio reference, microphone pitch estimation, taal metronome, song notebook, curated resource links, offline .ics calendar export and OAuth-based Google Calendar event creation (once configured).

## Free hosting
Publish this repository using **Cloudflare Pages**: Workers & Pages → Create → Pages → Connect to Git → select this repository. No build step; use the repository root as output directory. The repository can stay on GitHub while the website is served from Cloudflare.

## Google Calendar
Create a Google Cloud OAuth Web Application client ID, configure OAuth consent, add your hosted HTTPS origin to Authorized JavaScript origins, enable Google Calendar API, then enter the **public** Client ID under Google & Backup. Never insert client secrets into browser code. Calendar event creation requests the Calendar events scope explicitly. Repeated syncs create duplicate events.

## Current limits
This is an MVP. No Google account login or cloud storage yet. History is saved in localStorage. Microphone requires a secure browser origin and user permission. Reference audio is synthetic. Bollywood scores are **not** bundled, to respect copyright. No payments or paid services are active.

## Roadmap
- Phase 2: Firebase Google sign-in, secure multi-user database rules, cloud practice sync and note accuracy feedback.
- Phase 3: rights-cleared content, teacher portal, SEO lesson pages, user testing and Android packaging.
- Phase 4: premium subscriptions and instructor marketplace after privacy, billing, consumer support and content licenses are ready.

## License
No license granted to third parties yet. External resource links belong to their owners. Original educational exercises are part of this project.
