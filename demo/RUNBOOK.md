# Demo runbook - Claude Skills talk

Crib sheet for the live demo. Everything copy-pasteable is in a code block.
The primary prompt, used identically with and without the skill:

> Dockerize this app so I can run it in a container.

## Pre-flight (do this before the talk starts)

```powershell
docker info                                  # daemon up?
docker pull node:20.19-alpine                # image the skill picks
docker pull node:20-alpine                   # images the no-skill run tends to pick
docker pull node:22-alpine
git -C claude-skills-demo status             # sample-app clean? nothing staged?
dir "$HOME\.claude\skills\dockerize"         # skill installed?
dir "$HOME\.claude\skills\video-script"
```

- [ ] Rehearse step 4 once the day before and answer "don't ask again" to
      the docker prompts, so the live run has fewer interruptions
- [ ] ~50 other skills are installed in `~/.claude/skills`; the demo skills
      triggered fine alongside them in testing, but parking unrelated ones
      for the day shortens the list the model reads (optional)
- [ ] Terminal font size raised, notifications off, Do Not Disturb on
- [ ] `demo/baseline-outputs/` both files open in editor tabs (fallback)
- [ ] Nothing listening on port 3000

## Where the skill toggle lives

Skills load from `~/.claude/skills/`. Toggling = moving the folder out and
back. Start a NEW session after every toggle - the skill list is read at
session start.

```powershell
# OFF (park it outside the skills dir)
Move-Item "$HOME\.claude\skills\dockerize" "$HOME\.claude\skills-parked\dockerize"

# ON (bring it back)
Move-Item "$HOME\.claude\skills-parked\dockerize" "$HOME\.claude\skills\dockerize"
```

## Demo, in order

1. **Without the skill.** Park the skill (command above), start a fresh
   Claude Code session in `sample-app/`, paste the primary prompt.
   While it works, narrate what a "pretty good but unpinned, unversioned,
   different-every-run" answer looks like. Short on time? Skip the live
   run and show `demo/baseline-outputs/dockerize-without-skill.md` -
   including its variance note: three runs, three different Dockerfiles.
2. **Reset** (one line, below), and bring the skill back.
3. **File tour** of `skills/dockerize/SKILL.md` - point at exactly three
   things:
   - the `description:` line - the ONLY text the model sees when deciding
     whether to load the skill;
   - one standard from the checklist (pinned base tag is the punchiest -
     the no-skill run never pins the minor version);
   - the `references/standards.md` link - loaded only when needed:
     progressive disclosure, context stays small.
4. **With the skill.** Fresh session in `sample-app/`, identical prompt.
   Expected flow on screen: stack-detection report, base-image reasoning,
   Dockerfile + .dockerignore written, `docker build -t sgu-demo-api:demo`,
   run on port 3000, summary bullets, and a finding about the `.env` file.
   Build takes ~20 s with images pre-pulled.

   **Prompts to expect (tested 2026-08-23):** when the skill auto-triggers
   from a natural prompt, Claude Code asks once to run the skill, then
   once each for `docker build` and `docker run` - answer yes (pick
   "don't ask again" on the docker ones). The skill's `allowed-tools`
   pre-approval only kicks in when YOU invoke it by name. So there are two
   ways to run step 4, pick one before the talk:

   - *Natural prompt* (shows description-based triggering, the point of
     the file tour) - expect the three prompts above; narrate them as
     "the agent asks before it touches Docker".
   - *Slash invocation* - type `/dockerize` followed by the same sentence.
     Zero prompts; docker runs straight through. Use this if you want the
     build to just go.

   Both were tested end-to-end; the files produced are identical.
5. **Show it running:**

   ```powershell
   curl.exe http://localhost:3000/health
   docker ps --format "table {{.Names}}\t{{.Status}}"   # shows (healthy)
   ```

6. **Point at the contrast:** pinned `node:20.19-alpine` + digest
   recommendation, two named stages, non-root `USER node`, `:demo` tag,
   no unasked-for compose file, and the credential finding - versus the
   baseline tab.
7. **video-script (the non-code skill).** Fresh session, paste:

   > I built a plant-watering robot with an ESP32 - script a video about it.

   Point out: hook first, parts table with real part numbers, b-roll notes,
   one CTA, then the packaging block (three titles + thumbnail concept).

## The one-line reset

Run between takes or after a failed attempt (from the repo root's parent):

```powershell
git -C claude-skills-demo checkout -- sample-app; git -C claude-skills-demo clean -fd -e .claude sample-app; docker rm -f sgu-demo-api 2>$null; docker rmi -f sgu-demo-api:demo 2>$null
```

(`-e .claude` keeps any "don't ask again" permission answers you saved
during rehearsal - they live in `sample-app/.claude/settings.local.json`.)

## If the build fails live

Do not debug on stage. Say "this is why we keep receipts", open
`demo/baseline-outputs/dockerize-with-skill.md` (already in a tab), and
walk the same three contrast points from step 6. The saved output is a
verbatim capture of a verified run - container built, ran, and reached
`healthy`.

## Known wrinkle to narrate honestly

Current frontier models already write decent Dockerfiles unprompted - the
no-skill baseline usually gets non-root, cache order, and a healthcheck
right. The skill's visible wins are: the version pin + digest policy, the
enforced report/summary/finding structure, the exact `:demo` tag, no
scaffolding you didn't ask for, and - the big one - the SAME Dockerfile
every single run. Frame the demo as "consistency and your standard,
enforced", not "the model can't write Dockerfiles".
