# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-18 / linux / opencode
- **Branch:** feature/repo-scaffold
- **Done this session:**
  - Verified and filled all eight rows in `docs/PROVIDERS.md` from official pages (Google, Groq, Cerebras, Mistral, NVIDIA, Cloudflare, Hugging Face, OpenRouter).
  - Recorded the Mistral docs conflict (Free mode vs API access) and that NVIDIA publishes no limits outside a 2024 forum post.
- **Tests / checks and results:** `bash scripts/check-words.sh` passed. No code changes.
- **Known problems:** The Rapier swap from the previous session is still uncommitted. Provider limits are point-in-time and change often.
- **Next step:** Commit the Rapier swap, then port the Two/Three zombie-run gameplay into `src/`.
