# claude-skills-demo

Two demo Agent Skills built for a live talk on Claude Skills
(Docker Bangalore + Collabnix x SGU). They are stage props for teaching,
not production tooling - read them, fork them, break them.

## What's here

| Path | What it is |
|---|---|
| `skills/dockerize/` | Containerizes a project to a defined standard, then builds and runs it |
| `skills/video-script/` | Turns a project idea into a shooting-ready YouTube script |
| `sample-app/` | Tiny Express API the dockerize demo runs against |
| `demo/` | The on-stage runbook and saved with/without-skill outputs |

## Install

Copy a skill folder into your personal skills directory and restart your
session:

```bash
cp -r skills/dockerize ~/.claude/skills/dockerize
```

On Windows (PowerShell):

```powershell
Copy-Item -Recurse skills\dockerize "$HOME\.claude\skills\dockerize"
```

The same folders work anywhere the open Agent Skills spec is supported -
they use only spec frontmatter fields.

## One warning

Skills are instructions an AI agent will follow, and agents can run code.
Read a skill before installing it - this one, and every other one you
find on the internet.
