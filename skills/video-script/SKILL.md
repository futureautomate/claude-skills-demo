---
name: video-script
description: Turns a rough project idea into a shooting-ready YouTube script for the Future Automation channel - hook, build narrative, parts list, b-roll notes, CTA - plus title options and a thumbnail concept. Use when drafting, outlining, or scripting a video.
---

# Video Script

Write shooting-ready scripts for **Future Automation** - Tejas's YouTube
channel about coding, IoT, robotics, and hardware builds. Tagline: "A Place
Where Imagination Meets Reality."

Produce text only. Run no commands, call no APIs, generate no images, and
touch no files unless the user explicitly asks for the script saved to a
file.

## Channel rules

- The channel is **not** Python-specific and **not** automation-only,
  whatever the name suggests. Scripts cover builds across languages and
  hardware; never frame the channel as an automation channel.
- Retention and packaging outrank length. The hook and the title/thumbnail
  options are the most important part of the output - treat them that way.
- Name concrete hardware: exact boards, sensors, and part numbers where
  relevant ("ESP32-S3 DevKitC", not "a microcontroller board"). If the user
  has not named parts, propose specific real ones and mark them as
  suggestions.

## Script structure

Produce one Markdown script with these sections, in this order:

<!-- ASSUMPTION: confirm section order with Tejas -->
1. **Hook** - the first 20 seconds. Show or promise the finished result and
   the one reason to keep watching. No channel intro before the hook.
   <!-- ASSUMPTION: confirm hook length and job with Tejas -->
2. **What we're building** - two or three sentences framing the project and
   who it is for.
3. **Parts list** - a Markdown table: Part, Spec/Model, Qty, Notes.
   <!-- ASSUMPTION: confirm parts-list format with Tejas -->
4. **Build narrative** - the build in shooting order, numbered steps. Each
   step gives: what Tejas says (spoken lines), what the camera shows, and
   b-roll or on-screen-text notes inline under the step.
   <!-- ASSUMPTION: confirm b-roll notes inline vs separate column -->
5. **The reveal** - the working result demonstrated, calling back to the
   hook's promise.
6. **Outro and CTA** - one CTA only: subscribe plus a pointer to a related
   video for the end card.
   <!-- ASSUMPTION: confirm standard CTA wording and end-card behaviour -->

Mark every spoken line as speech, and every direction as a bracketed note,
so the script reads cleanly off a teleprompter.

## Packaging block

After the script, under a horizontal rule, always add:

- **Three title options** - curiosity- or outcome-driven, under 60
  characters, no clickbait that the video does not pay off.
- **One thumbnail concept** - a text description only: composition, focal
  object, max three words of thumbnail text. Never generate an image.

## When details are missing

If the idea is too thin to script (no clear finished result, no idea what
hardware is involved), ask for the missing piece instead of inventing the
project. Suggest specific parts freely, but never invent what the finished
build does.
