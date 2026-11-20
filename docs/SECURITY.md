# Security

## Secrets
- Never commit API keys, passwords, tokens, private keys, or `.env` files.
- Keep secret files in `.gitignore`.
- Keep only variable names in `config/examples/env.example`.
- Store keys in environment variables via a shell profile (`chmod 600`) or a password manager. Don't sync plaintext `.env` files through cloud storage.
- Never paste secrets into Markdown context files or prompts.
- Run `bash scripts/check-repo.sh` before committing; it flags tracked `.env` files.

## Device access
- Use a separate SSH key or GitHub fine-grained token for the Chromebook and the phone so each can be revoked alone.
- Scope tokens to the needed repos with minimal permissions.

## Gateways
- Require authentication on any LiteLLM or similar gateway.
- Never expose an unauthenticated gateway to the public internet.

## Spending and terms
- No paid usage without explicit approval.
- Follow provider terms and rate limits. Don't create extra accounts or keys to get around quotas.
