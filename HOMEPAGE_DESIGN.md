# Homepage design

The supplied reference guided the composition: a small character icon, a centred title, concise grey supporting text, quiet actions and generous white space. The NP logo remains in the header. Gemini setup appears only after the visitor chooses Get started or Connect my coach. Interactive scenes remain available without a key.

## Avatar

Final asset: `public/grammar-coach-avatar.png`. Created with the built-in image generation tool and copied into the project; it is served locally.

Generation prompt: Create an original minimal app avatar icon for an AI grammar coach, square 1024x1024 image. White background, one small friendly cobalt-blue rounded book character with an ivory face panel, two simple black expressive eyes, one eye winking, tiny warm smile, no limbs needed. Flat clean vector-like illustration, precise smooth simple silhouette, friendly yet sophisticated student study app. Character centered and occupies 70 percent of canvas, generous white margin. Palette only medium cornflower blue #478ff5, black, white, tiny golden bookmark accent. Absolutely no text or letters, no speech bubbles, no logo, no 3D rendering, no plush texture, no scenery, no complicated accessories, no decorative sparkles. This will appear as a small clean avatar above a centered heading on a minimal white homepage.

## Display verification

The new classes have local compiled CSS, the avatar exists at its referenced URL, and the header wraps without overflowing. Browser tests check loaded image dimensions, viewport overflow at 390/768/1024/1440 pixels, primary action visibility, setup opening and dismissal, and restoration of focus. Existing Gemini and learning flows are also covered with mocked Google responses.

Screenshots: `output/playwright/homepage-1440.png`, `output/playwright/homepage-390.png`, `output/playwright/homepage-setup-mobile.png`.
