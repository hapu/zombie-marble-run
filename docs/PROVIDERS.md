# Providers

Limits and terms change. Verify each row from the official source and update the date. Leave a cell as "unverified" until you have checked it. Never copy a row from another project without re-checking it.

## Verification protocol
- Use the provider's official pricing, rate-limit, or terms page.
- Record the exact limits and the date checked.
- Note conflicts and unstated limits instead of guessing.
- Re-verify every 90 days or before relying on a limit.
- Keep historical corrections in the verification log; do not silently overwrite a removed limit.

## Providers

| Provider | Access type (free / trial / credits) | Limits and models | Last verified | Link |
| :--- | :--- | :--- | :--- | :--- |
| Google AI Studio / Gemini | Free tier | Selected models; per-model RPM/TPM/RPD are not published in the docs and are shown only in AI Studio; limits are not guaranteed. | 2026-11-18 | https://ai.google.dev/gemini-api/docs/rate-limits |
| Groq | Free plan (no card) | Free plan per model: 30 RPM, 1K RPD, 8K TPM, 200K TPD for `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, and `qwen/qwen3.8-27b`; safeguard 3 RPM / 2K TPM; Whisper 20 RPM / 2K RPD. | 2026-11-18 | https://console.groq.com/docs/rate-limits |
| Cerebras | Trial ($5 credit, card required, 30 days) | No permanent free tier. `gpt-oss-120b`: 5 RPM, 30K uncached TPM, 90K total TPM, 1M TPH/TPD; `qwen-3.8-27b`: 300 RPM, 150K uncached TPM, 750K total TPM, no hourly/daily cap. | 2026-11-18 | https://inference-docs.cerebras.ai/support/rate-limits |
| Mistral | Free mode for Studio/Vibe; API requires billing | Docs conflict: usage docs say Free mode has no API access, while the Help Center still lists free-mode API limits (RPS, TPM, monthly tokens) with exact values only in the Admin panel. | 2026-11-18 | https://docs.mistral.ai/admin/billing-usage/usage-limits |
| NVIDIA NIM | Trial credits | Official signup pages publish no credit amount or rate limit. A 2024 NVIDIA forum post states 1,000 credits on signup and a 5,000-credit cap; recheck the account. | 2026-11-18 | https://build.nvidia.com/ |
| Cloudflare Workers AI | Free plan (no card) | 10,000 Neurons/day, reset 00:00 UTC; free text generation 300 RPM; some frontier models require Workers Paid or AI Gateway credits. | 2026-11-18 | https://developers.cloudflare.com/workers-ai/platform/pricing/ |
| Hugging Face | Paid (PRO / purchased credits) | Free accounts get no monthly Inference Providers credits; PRO includes $2/month and Team/Enterprise $2 per seat; otherwise pay-as-you-go. | 2026-11-18 | https://huggingface.co/docs/inference-providers/pricing |
| OpenRouter | Free models (no card) | `:free` models: 20 RPM and 50 RPD; 1,000 RPD after $10 of lifetime credit purchases. Failed requests count toward the daily cap. | 2026-11-18 | https://openrouter.ai/docs/api-reference/limits |

## Verification log

| Date | Provider | What changed / source |
| :--- | :--- | :--- |
| 2026-11-18 | All listed providers | Initial verification from official rate-limit and pricing pages. |

## Record for each provider
- Free, trial, or credit-based
- Models and capabilities
- Requests/tokens per minute, daily/monthly caps
- Context limits and model restrictions
- Region and account eligibility
- Expiry rules and term changes
- Official docs and pricing links
