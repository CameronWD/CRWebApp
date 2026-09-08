# Working instructions

## Step 0 — remind me to connect a remote

Before anything else — before grilling, before any code — prompt me about the git remote.
**I connect remotes myself; you don't have the access to.** So your only job here is to ask
me, once:

> Do you want a git remote for this project? If so, set it up on your end now — create or pick
> the GitHub repo, add the `origin`, and push — then tell me to continue. Local-only for now?
> Say so and I'll just commit locally.

Then wait for my answer before continuing.

What you *do* handle:

- **Local git only.** `git init` if `/work` isn't a repo yet, and commit as you work. Creating,
  connecting, and pushing to any remote is on me — don't attempt it.
- **Work on feature branches, never commit straight to `main`/`master`.** Keep everything on a
  branch so I can push it and open a PR. (When I push, a global pre-push hook rejects `main`
  anyway.)
- **Don't touch git identity.** `user.name`/`user.email` are baked into the image as my personal
  GitHub identity (`CameronWD`), so commits already attribute to me. Leave them alone.

Only once you've prompted me and I've answered, continue below.

## Then — the build flow

At the start of every session, use the grill-with-docs skill to interview me and produce the spec. Work through the back-and-forth with me until the plan is agreed and you've played the full spec back to me.

Do NOT write any code until I explicitly say "go for it" (or similar).

Once I say go, do NOT build it in a single pass. Always run this pipeline:

1. Use the **superpowers:writing-plans** skill to turn the agreed spec into a plan of independent, ordered tasks.
2. Use the **superpowers:subagent-driven-development** skill to execute that plan — one fresh subagent per task, with the spec-compliance and code-quality review loops it prescribes.

This is mandatory regardless of how small the build seems. Run it end to end without stopping to ask permission on individual tasks. I care about working output, not polish.
