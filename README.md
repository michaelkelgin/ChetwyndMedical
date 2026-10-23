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

## Placeholders still open

Association phone and mailing address; officer names; constitution; dues; peer support; onboarding steps; cultural-safety dates; local Division of Family Practice; which partnerships are active; the real meeting calendar; and the association's own land acknowledgement.
