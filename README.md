# Reznik

> *The desktop companion that quietly lives beside you.*

Reznik is an AI-powered desktop companion that turns an old iPhone into something alive — expressive eyes on a black screen, listening, thinking, and responding.

## What is Reznik?

An old iPhone sits on your desk. Its screen is black, save for two white, rounded eyes. They blink slowly. They drift. They follow you. When you speak, Reznik listens — and answers, warmly, in a voice that feels familiar.

Reznik is not an app. It is a presence.

## Features

- **Voice** — Natural, warm speech with a recognizable personality
- **Memory** — Remembers your preferences, routines, and what matters
- **Emotions** — Expressive eyes that convey curiosity, calm, and delight
- **Local AI** — Runs entirely on your hardware. No cloud. No subscription.
- **Privacy** — Your data never leaves your desk
- **Desktop Companion** — Always there. Never intrusive. Just quietly present.

## How It Works

```
Old iPhone → WiFi → Python Backend → Local AI → Reznik Speaks
```

## Website

The landing page is a single-page HTML/CSS/JS site with:
- Animated phone mockup with blinking, cursor-following eyes
- Interactive "Wake Reznik" demo
- Scroll-reveal animations
- Warm paper-grain aesthetic

### Run locally

```bash
# Just open index.html in your browser, or use any static server:
npx serve .
# or
python -m http.server 8000
```

## Tech Stack

| Layer | Technology |
|---|---|
| Companion Display | iPhone (any model) |
| Communication | WiFi / WebSocket |
| Backend | Python |
| AI Model | Local LLM (Ollama / llama.cpp) |
| Website | HTML + CSS + Vanilla JS |

## Philosophy

Every design choice asks: *does this feel like meeting a small, calm, handcrafted companion — or like using software?*

If it feels like software, slow it down and warm it up.

---

*Built with curiosity.*
