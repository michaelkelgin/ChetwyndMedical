# Chetwynd Medical

Public website for the Chetwynd Medical Staff Association (`chetwyndmedical.ca`).

It is a static multi-page site with the same kind of sections as a facility medical staff association: home, about, news, awards, partners, calendar, contribute, contact, and a member sign-in placeholder. Copy is original. Facts that are not confirmed are marked `[placeholder]`. The header and footer use the association's own crest. Other photographs are generic Unsplash images, not local staff photos. The public contact email is Admin@chetwyndmedical.ca.

## Develop

```bash
npm run build
```

The build writes the site to `dist/` with no npm dependencies. Netlify runs the same command and publishes `dist/` (see `netlify.toml`).

Preview the build locally:

```bash
npm run build
python3 -m http.server 4173 --directory dist
```

## Pages

- `/` Home, with recent news and a sample calendar
- `/about/` and purpose, team, roles, job postings
- `/news/` plus one page per note
- `/awards/`
- `/partners/`
- `/calendar/` plus one page per sample meeting
- `/contribute/` interest form (no card payment)
- `/contact/` Netlify Form
- `/login/` sign-in not active
- `/search/`
- `/credits/`

## Members sign-in and website updates

Allow-listed members sign in with a one-time email link at `/login/`. The members area (`/members/`, documents, and Website updates) is rendered by a Netlify Function after the session cookie is checked. An edge function also redirects unsigned visitors away from `/members`.

Records (tokens, rate limits, change history) are stored in Netlify Database. Uploaded files are stored in Netlify Blobs. `npm run dev` uses a local `.data/` folder instead, prints magic links in the terminal, and shows the link on the sign-in result page. It does not send email or call a model unless you opt in.

Approval rules are enforced on the server from the file paths in a proposal, not from anything the model claims:

- Approvers (`chief_of_staff`, `executive`, `coordinator`) publish members-area and public-site changes as soon as they submit.
- A regular member's members-area change also goes live on submit.
- A public-site change from a regular member waits for one other approver.
- A change to `src/config/members.mjs` waits for two approvers who are not the author.
- A code or config change never merges on submit. Submit opens a GitHub pull request. Approve merges it.
- Nobody can approve their own change.
- Live changes can be reversed. Code reversals open another pull request instead of merging.
- Every step is stored in the change history. Admin@chetwyndmedical.ca is emailed, and approvers are emailed when a decision is needed.

Members-area pages and documents are applied in the database and Blobs, so they show up without a rebuild. Public pages committed under `content/public/*.md` are picked up on the next Netlify build at `/pages/<name>/`.

The assistant must return a JSON list of file writes. If no model is configured, a local stub drafts a placeholder page so the flow can be tried. Uploads and drafts that look like patient information (health numbers, dates of birth, diagnoses) are refused and are not stored.

### Environment variables

Set these in the Netlify UI (Site configuration, Environment variables) for production. Do not commit the values.

| Name | Required | Purpose |
| --- | --- | --- |
| `SESSION_SECRET` | Yes | Long random string (16+ characters) used to sign the httpOnly session cookie and one-time links. Example: `openssl rand -base64 32` |
| `SITE_URL` | Yes in production | `https://chetwyndmedical.ca` so emailed links use the public site. |
| `RESEND_API_KEY` | For real email | API key from [Resend](https://resend.com). Create an account, add and verify the domain chetwyndmedical.ca, then create an API key. |
| `EMAIL_FROM` | With Resend | Verified sender, for example `Chetwynd Medical Staff <admin@chetwyndmedical.ca>`. Until the domain is verified, Resend's onboarding sender works for tests. |
| `GITHUB_TOKEN` | To publish | Fine-grained personal access token for `michaelkelgin/ChetwyndMedical` with **Contents: Read and write** and **Pull requests: Read and write**. Contents write commits public pages to `main`. Pull requests permission opens and merges code-change PRs. |
| `GITHUB_REPO` | No | Defaults to `michaelkelgin/ChetwyndMedical`. |
| `GITHUB_BRANCH` | No | Defaults to `main`. |
| `ALLOW_DEV_MAGIC_LINK` | No | Set to `true` only on a private preview if you need the sign-in link returned in the page. Never set this on production. |
| `CMSA_AI_PROVIDER` | No | `openai` (default) or `anthropic`. |
| `CMSA_AI_MODEL` | No | Defaults to `gpt-4o-mini`, or `claude-haiku-4-5` when the provider is Anthropic. |

AI on Netlify: enable AI features for the site and deploy once. The AI Gateway then injects `OPENAI_BASE_URL` and `OPENAI_API_KEY`. Do not set your own provider key if you want calls to stay on the gateway. For local runs against a provider instead of the stub, set `CMSA_AI=live` and either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.

`npm run dev` sets `CMSA_AI=stub`, so it works with no keys.

### Test plan

```bash
npm test
npm run dev
```

1. Open `/login/`, enter an allow-listed address, and open the on-screen link. An unknown address shows the same confirmation and no link.
2. As a member, draft "Add a members page for the December on-call roster", submit, and confirm it is live under Members.
3. As a member, draft a public homepage note and confirm it stays awaiting approval. Approve it from a different approver account. The author cannot approve it.
4. Draft a member-list change and confirm it stays waiting until two other approvers approve.
5. Draft a code change and confirm submit records a pull request (dry-run locally) instead of merging.
6. Reverse a live members page and confirm the published copy is removed.
7. Try a note that contains a personal health number and confirm it is refused.
8. Request six links for one address and confirm the sixth is rate limited.

Automated coverage for those rules is `npm test`.

## Placeholders still open

Association phone and mailing address; officer names; constitution; dues; peer support; onboarding steps; cultural-safety dates; local Division of Family Practice; which partnerships are active; the real meeting calendar; and the association's own land acknowledgement.
