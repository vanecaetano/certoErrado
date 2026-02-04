Deployment to Vercel (recommended, free tier)
=============================================

This guide shows the minimal steps to publish the project to Vercel while keeping API keys secure.

1) Create a GitHub repository and push your local project

  # initialize git (if needed)
  git init
  git add .
  git commit -m "Initial commit"
  # create remote repo on GitHub and then:
  git remote add origin git@github.com:<your-username>/<repo>.git
  git branch -M main
  git push -u origin main

2) Create a Vercel account and import the GitHub repository

  - Go to https://vercel.com and sign in with GitHub.
  - Click "New Project" → import the repo you just pushed.
  - For Build settings keep defaults: Build Command `npm run build`, Output Directory `dist`.

3) Add Environment Variables (do NOT commit these)

  In the Vercel project settings → Environment Variables add:
    - `VITE_ADSENSE_CLIENT` = ca-pub-... (your AdSense client id)
    - `VITE_ADSENSE_SLOT` = 1234567890 (your ad unit id)
    - (optional) `VITE_ADSENSE_TEST` = true (force test ads)
    - `VITE_GEMINI_API_KEY` = your Gemini API key (if using AI generation in production)

  Use the Environment (Production/Preview/Development) selectors appropriately.

4) Configure Domain & AdSense

  - Add a custom domain in Vercel if you have one and follow DNS verification steps.
  - Verify the domain in Google AdSense (AdSense requires domain verification to show real ads).

5) Test after deploy

  - Visit the published URL. Accept the consent banner for ads. In preview/development Vercel you can keep `VITE_ADSENSE_TEST=true` to show test ads.

Security notes

  - Never commit `.env` or secrets into Git. `.gitignore` already excludes `.env`.
  - Use Vercel environment variables to store secrets.
  - For CI workflows that need secrets, use GitHub Secrets (Settings → Secrets) and reference them in Actions.

Optional: deploy via Vercel CLI

  npm i -g vercel
  vercel login
  vercel --prod
