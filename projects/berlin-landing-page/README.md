# Berlin Landing Page (Production Ready)

This folder is a deployable static landing page package.

## Files
- `index.html`: Turkish landing page
- `impressum.html`: German legal imprint page
- `privacy.html`: GDPR privacy page
- `vercel.json`: Vercel static config
- `netlify.toml`: Netlify static config

## Deploy (Vercel)
1. Import this folder as a separate project or set root directory to `projects/berlin-landing-page`.
2. Deploy with framework preset **Other**.

## Deploy (Netlify)
1. Set base directory to `projects/berlin-landing-page`.
2. Publish directory is `.`.

## Post-deploy checklist
- Replace `STRIPE_PAYMENT_LINK_HERE` with your live Stripe link.
- Replace placeholder legal contact details in `impressum.html` / `privacy.html`.
