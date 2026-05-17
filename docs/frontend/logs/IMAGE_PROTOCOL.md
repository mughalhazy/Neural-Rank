# IMAGE PROTOCOL

## Purpose

Define the exact end-to-end process for creating clean inspiration image review pages with zero drift.

This protocol exists to prevent:
- noisy page screenshots
- broken live embeds
- cropped page chrome presented as inspiration
- reused fragments treated as new images
- oversized or distorted HTML presentation

This protocol is the only approved method for inspiration image review work unless explicitly replaced.

## Scope

Use this protocol for:
- Dribbble inspiration images
- Mobbin inspiration images
- static local HTML review pages
- one-by-one or small-batch image review

Do not use this protocol for:
- live embeds
- remote iframe previews
- screenshot-provider page captures
- automated page screenshots of source websites

## Core Rule

Only present an HTML review page after the underlying source image is already clean.

If the raw image is bad, discard it.
Do not crop, enlarge, patch, or salvage it into review.

## Required Outcome

Each approved review page must be:
- one local image file
- one plain HTML page
- sharp
- fully viewable
- undistorted
- sourced from an actual design asset, not a webpage screenshot

## Approved Workflow

### Step 1: Source Candidate

Find a candidate from Dribbble or Mobbin.

Allowed source type:
- direct downloadable design image asset
- direct CDN image asset

Disallowed source type:
- screenshot of a Dribbble page
- screenshot of a Mobbin page
- search-result screenshot
- page with nav, footer, popup, or browser chrome

### Step 2: Save Locally First

Save the candidate image inside the workspace before any HTML is created.

Approved pattern:
- local image file first
- HTML second

Disallowed pattern:
- linking HTML directly to remote source
- embedding live source page
- building library logic before image quality is confirmed

## Step 3: Verify Raw Image

Inspect the raw saved image before using it.

Verification checklist:
- image is sharp
- image is a real UI screen
- image is not blurred
- image is not distorted
- image does not contain page chrome
- image is not a fragment falsely presented as a full new screen
- image is visually different from already-approved images

If any check fails:
- reject the image
- do not create HTML for it

## Step 4: Create Plain HTML Review Page

Only after raw image verification passes:
- create one simple HTML file
- reference the local image
- use a plain centered container
- preserve aspect ratio
- do not crop the displayed image
- do not enlarge beyond sensible display

HTML page rules:
- no live feed
- no renderer logic
- no bucket logic
- no script dependency unless absolutely required
- no visual trickery to hide source defects

## Step 5: Final Review Before Presentation

Before reporting back:
- open the HTML
- confirm image is fully viewable
- confirm image is sharp
- confirm no distortion was introduced by the HTML page
- confirm it is genuinely new if requested as a new image

If not correct:
- fix or discard before presenting

## Naming Rules

Use simple, sequential naming.

Examples:
- `single-image-review-06.html`
- `manual-direct-dribbble-02.jpg`

Rules:
- one HTML file per image review page
- one local asset per review page unless explicitly requested otherwise
- do not split one image into multiple “new” review files

## Batch Rules

Default mode:
- one image at a time

If the user asks for more:
- small batch only after each image is individually verified

Never batch first and inspect later.

## Rejection Rules

Reject immediately if the image is:
- a page screenshot instead of a design asset
- blurry
- noisy
- overlapping with browser/site chrome
- an enlarged crop of bad input
- a duplicate or near-duplicate of an already-used image
- a sliced fragment from an existing design falsely treated as a new candidate

## Presentation Rules

When reporting back:
- provide the HTML file path
- provide the local image file path
- state that it is local and static

Do not claim success if:
- the source image is still questionable
- the HTML presentation is distorted
- the image is not genuinely new

## Anti-Patterns

Do not:
- automate page screenshots and treat them as inspiration assets
- present search result pages as design screens
- crop bad screenshots and call them fixed
- enlarge noisy source material
- reuse one image and split it into multiple fake new review files
- build library systems before source-image quality is proven
- add extra doc/code/file structure around a broken image process

## Recovery Rule

If the current source set is contaminated:
- stop using it
- discard it from active review
- reacquire clean direct image assets
- restart from raw image verification

Do not attempt salvage as the default recovery path.

## Session Anchor Rule

Any new session continuing inspiration image work must follow this order:

1. Read this file first.
2. Use only direct clean image assets.
3. Verify raw image before HTML.
4. Create plain local HTML review page.
5. Present only after final visual check.

If a future session deviates from this, this file overrides that drift unless the user explicitly changes the protocol.
