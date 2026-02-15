# Common Space Portal - The Sovereign Build

## Background and Motivation
We are crafting a **bespoke ritual vessel**, a PWA designed to transcend the sterile flatness of modern digital communication. This is for the Odyssey Works Experience Design Certificate Program. The portal serves as a "Common Space" where two participants (Tony and Court) meet within a surreal, theatrical environment. Through "Ghost Control," we will orchestrate their experience, blurring the lines between the digital and the ritualistic.

## Key Challenges and Analysis
- **PWA Integrity**: Ensuring the application feels like a physical object/vessel, devoid of browser UI.
- **Visual Alchemy & Entropy**: Using SVG Turbulence filters to create organic, rippling edges for the Orbs, moving away from "clockwork" digital perfect circles.
- **The Ghost's Hand (Real-time DB)**: Implementing a robust real-time trigger system (Supabase/Firebase) to control the environment remotely via a dedicated "Command Vellum."
- **Somatic Presence**: Utilizing the Haptic/Vibration API to provide physical feedback when the threshold (Curtain) is crossed.
- **Aural Geometry**: Implementing Web Audio API to spatialize ambient sounds based on the Orbs' positions.

## High-level Task Breakdown
1. **The Bone House (Base PWA Structure)**
   - Create `manifest.json` with ritual identity.
   - Implement `service-worker.js` for instant presence.
   - Establish `index.html` structure.
   - *Success Criteria*: App is installable as PWA; loads with no browser UI. [COMPLETED]

2. **The Loamy Void (Layer 0 & 4)**
   - Design the "Layer 0" background (Beige to Dark Moss gradient).
   - Create "Layer 4" The Curtain (black overlay with fade control).
   - *Success Criteria*: Screen starts in total darkness; gradient background exists beneath. [COMPLETED]

3. **Piping the Brine (VDO.Ninja Integration)**
   - Embed VDO.Ninja feeds via hidden iframes (Layer 2 & 3).
   - *Success Criteria*: Video feeds are correctly ingested into the PWA. [COMPLETED]

4. **The Alchemist's Lens (Orb Styling & Turbulence)**
   - Apply `mask-image` and SVG `feTurbulence` filters to create organic, rippling orbs.
   - Implement `backdrop-filter` for Court's "Glass" look.
   - Add "Nonsensical Business" floating animations.
   - *Success Criteria*: Video feeds ripple and float with biological irregularity. [COMPLETED]

5. **The Whispering Wire & Command Vellum**
   - Integrate Supabase Realtime for remote commands.
   - Create a hidden `/ghost` route or separate file for the Orchestrator's dashboard.
   - *Success Criteria*: Orchestrator can trigger events from a separate device. [COMPLETED]

6. **Invoking the Ritual (Trigger & Somatics)**
   - `START_AMBIENT`: Handle spatialized audio playback (Web Audio API).
   - `OPEN_CURTAIN`: Fade the curtain AND trigger a haptic pulse (Vibration API).
   - `ACTIVATE_OMEN`: Fade in the Omen text.
   - *Success Criteria*: Full sensory synchronization (Audio, Visual, Haptic) upon command. [COMPLETED]

7. **The Sovereign Connection (Deployment & Subdomain)**
   - Initialize Git repository and link to GitHub.
   - Create `CNAME` file for `quest.sleepyplanet.studio`.
   - Implement path-based routing for personalized links (e.g., `/tony`, `/court`).
   - *Success Criteria*: Site is accessible at `quest.sleepyplanet.studio` and handles subpaths correctly.

## Project Status Board
- [x] 1. The Bone House (Base PWA Structure)
- [x] 2. The Loamy Void (Layer 0 & 4)
- [x] 3. Piping the Brine (VDO.Ninja Integration)
- [x] 4. The Alchemist's Lens (Orb Styling & Turbulence)
- [x] 5. The Whispering Wire & Command Vellum
- [x] 6. Invoking the Ritual (Trigger & Somatics)
- [ ] 7. The Sovereign Connection (Deployment & Subdomain)

## Executor's Feedback or Assistance Requests
I am ready to proceed with the Deployment and Subdomain tasks. I will need the GitHub repository URL to push the code. I will also implement a clean way to handle `/tony` and `/court` by using subdirectories that serve the main application while identifying the participant.

## Lessons
- Include info useful for debugging in the program output.
- Read the file before you try to edit it.
- If there are vulnerabilities that appear in the terminal, run npm audit before proceeding
- Always ask before using the -force git command
- GitHub Pages expects a `CNAME` file at the root for custom subdomains.
- To support subpaths like `/tony` without a build step or complex routing, creating a directory `tony/` with an `index.html` is the most reliable method for static hosting.
