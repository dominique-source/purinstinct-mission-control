# Visual rebuild — approved reference

The stable baseline was commit `3207f01`. `new app.png` is the primary reference, inspected before changing the interface and compared against the running dashboard. The rebuild changes presentation only: the data schema, seed, persistence key, engine and mutation rules are unchanged.

## Design translation

- Horizontal broadcast HUD replaces the sidebar. All routes remain accessible in the keyboard-operable menu; iPhone receives a four-destination bottom navigation.
- Photographic sports scene, continuous illuminated gold mission frame, compact cyan Final Boss frame, five full-bleed campaign tiles, tactical Today/Tomorrow, linked Next Milestones and derived World progression.
- Desktop comparison at 1536 × 1024; responsive composition at 390 × 844 and tablet. Mobile priority is Current Mission/Next Action, XP, Today, Final Boss, Worlds, then remaining tactical intelligence.
- Real progress is preserved. The initial app correctly shows 0 XP and 0% rather than copying the reference's illustrative numbers.
- `app/campaign.css` is the scoped presentation layer. `components/campaign-art.tsx` maps World IDs to artwork and visible reward labels. Custom Worlds use the Vanier artwork as a fallback until dedicated art is supplied.
- XP count-up is presentation-only, using `components/animated-number.tsx`. Progress, tile activation, stat response and image zoom honor reduced motion.

## Assets

Generated with the built-in ImageGen tool, using `new app.png` as a style/composition reference. The photographs are conceptual illustrations, not documentary photographs of Vanier or identifiable real students. Generated images were exported as optimized local WebP assets, approximately 630 KB total. Next Image supplies responsive image delivery. The source reference remains unchanged.

- `public/images/campaign-backdrop.webp`: panoramic school/community scene with naturally diverse athletes in foreground roles.
- `public/images/vanier.webp`: school and students.
- `public/images/instinct.webp`: camera operator and television stage.
- `public/images/cliniques.webp`: clinic administration and invoicing.
- `public/images/technologie.webp`: RFID bracelet and scoring tablet.
- `public/images/financement.webp`: partnership and city.

The five World images are exported from a single generated five-panel photographic texture atlas. No screenshots of UI are used as interface controls; titles, progress, tasks, rewards, status and links are real HTML driven by application state.

### Final prompt — environment

Create a single cinematic photographic BACKGROUND ASSET for the existing web application in the reference. Reference image is visual direction only. Output panoramic 3:1 composition, 2400x800 or equivalent. Reproduce the atmospheric upper sports scene: contemporary Quebec secondary school at blue hour, glass architecture warm illuminated windows and a lively school sports community, electric cyan stadium lights. Foreground far LEFT: Black teen basketball athlete and mixed-race female teen athlete in black athletic clothing, dynamic focused game movements with basketball. Far RIGHT: Asian teen male athlete and Black female teen athlete in central foreground roles. White teens naturally in school community. Keep middle 50 percent mostly atmospheric school facade and distant crowd, no large foreground bodies, for overlaying an interactive mission panel. Realistic premium AAA sports campaign promotional photography, dramatic blue-gold color grading, directional light, cinematic depth, sharp textures. NO interface, NO UI cards, NO graphic borders, NO labels, NO text, NO watermarks, NO logos. This is a photographic environment backdrop, not a screenshot.

### Final prompt — campaign tile atlas

Create ONE five-panel cinematic photography texture atlas asset for a sports videogame web application based on supplied reference. Very wide landscape 3:1 2400x800, composed of FIVE EXACTLY EQUAL VERTICAL PANELS side by side, each 20 percent of width, no gaps and no borders. Every panel is its own distinct photo scene and composition, in the cinematic premium sports campaign visual language of the reference. Panel1 far left: Quebec modern secondary school glass facade at golden hour, students of varied ethnicities entering school sports event, building centered. Panel2: television production with dark silhouette camera operator, large professional camera and blue-lit TV stage. Panel3: school sports training administration table, laptop showing abstract blue invoicing interface WITHOUT TEXT, clipboard, gym behind. Panel4: close-up Black person's wrist wearing blue RFID sport bracelet, Android tablet with abstract sports scoring graphics, dark gym behind. Panel5 far right: partnership handshake between Black and white business professionals, premium dusk Montreal city skyline, warm purple and gold city lights. Every panel fills entire height with contextual photo imagery. High photographic realism, navy shadows, blue-cyan highlights, warm gold rim lighting, visually bold and rich. NO words, NO text, NO logos, NO icons, NO UI labels, NO borders, NO screenshots, NO progress bars. These are only background photographic textures for interactive cards.

## Validation

- `npm run lint`, `npm run typecheck`, seven existing regression tests and the final production build pass.
- Engine, seed, types and persistence modules have no changes in this rebuild.
- Browser: V1 all tasks → 500 XP → refresh retains completion → V2 available; setting V2 as current updates the hero; unchecking V1 removes all earned XP and restores locked dependencies. The test changes were reversed afterward.
- World campaign map, mission detail, Today/Tomorrow, milestones, World intelligence, Final Boss checklist, settings and reset confirmation/cancel inspected.
- Keyboard Enter opens the desktop navigation. Responsive widths 390, 700, 768, 1024 and 1366 have no horizontal page overflow. Desktop comparison uses the reference's 1536 × 1024 viewport.
- Compiled production dashboard and Final Boss render successfully with no captured browser warnings or errors. Development hot-reload messages are not production errors.
