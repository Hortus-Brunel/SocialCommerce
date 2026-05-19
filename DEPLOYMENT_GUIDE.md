# SOCIALVERSE: FULLSTACK DEPLOYMENT GUIDE
*(Vercel + Render + Supabase)*

This guide provides step-by-step instructions on how to deploy the SocialVerse platform, linking a static HTML/CSS/JS frontend on **Vercel**, a Node.js Express backend on **Render**, and a PostgreSQL database on **Supabase**.

---

## Deployment Architecture Overview
```
                     +---------------------------------------+
                     |         Frontend (Vercel)             |
                     |  HTML, CSS, JS (api.js, script.js...) |
                     +---------------------------------------+
                                         |
                                         | REST APIs & WebSockets
                                         v
                     +---------------------------------------+
                     |         Backend API (Render)          |
                     |      Express Server & Socket.io       |
                     +---------------------------------------+
                                         |
                                         | TCP connection (SSL)
                                         v
                     +---------------------------------------+
                     |          Database (Supabase)          |
                     |          PostgreSQL Database          |
                     +---------------------------------------+
```

---

## Step 1: Database Deployment (Supabase)

Supabase provides a fully managed PostgreSQL database that is perfect for Node.js backends.

1. **Sign Up & Create Project:**
   * Go to [Supabase](https://supabase.com) and log in or register.
   * Click **New Project** and select your organization.
   * Enter a project name (e.g., `SocialVerse Database`).
   * Generate/set a strong **Database Password** (keep this safe!).
   * Select a region close to your target audience (e.g., Europe or US).
   * Click **Create new project** and wait a few minutes for it to provision.

2. **Run Schema Script:**
   * In your Supabase dashboard, go to the **SQL Editor** tab from the left sidebar.
   * Click **New Query** (blank query).
   * Open the file `backend/src/config/schema.sql` in VS Code, copy its entire contents, and paste it into the Supabase SQL editor.
   * Click **Run** at the bottom right. Verify that the tables and indexes are created successfully without errors.

3. **Get your Database Connection URL:**
   * Go to **Project Settings** (gear icon) -> **Database**.
   * Under the **Connection String** section, select **URI**.
   * Copy the connection string. It looks like this:
     ```text
     postgresql://postgres:142008/Ab..@db.hwwaqorxyaceprkzcaai.supabase.co:5432/postgres
     ```
   * Replace `[YOUR-PASSWORD]` with the database password you created in step 1. Save this connection string for the Render environment setup.

---

## Step 2: Backend Deployment (Render)

Render hosts backend services (Node.js/Express) and automatically manages SSL certificates and deployments directly from GitHub.

1. **Prepare Backend Code:**
   * Render works best when connected to a GitHub repository. Initialize a Git repository in your workspace and push it to GitHub (public or private):
     ```bash
     git init
     git add .
     git commit -m "Initialize SocialVerse project"
     # Create a repository on GitHub and link it
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
     git branch -M main
     git push -u origin main
     ```

2. **Create Web Service on Render:**
   * Log into [Render](https://render.com).
   * Click **New** -> **Web Service**.
   * Connect your GitHub account and select your repository containing the SocialVerse project.

3. **Configure Build Settings:**
   * **Name:** `socialverse-backend` (or similar)
   * **Language/Runtime:** `Node`
   * **Root Directory:** `backend` *(This tells Render to execute inside the backend folder rather than the project root)*
   * **Branch:** `main`
   * **Build Command:** `npm install`
   * **Start Command:** `node src/server.js` (or `npm start`)
   * **Instance Type:** `Free`

4. **Configure Environment Variables:**
   * Click on the **Advanced** button and add the following environment variables:
     * `DATABASE_URL` = *Paste the full Supabase connection URI from Step 1.*
     * `JWT_SECRET` = *Enter a secure random string (e.g. `SuperSecretKeyForSocialVerse2026`).*
     * `PORT` = `10000` (Render will override this, but standardizing it is recommended).
     * `NODE_ENV` = `production`
     * `STRIPE_SECRET_KEY` = *Your Stripe key (or dummy key for testing).*
   * Click **Create Web Service**.

5. **Get Live Backend URL:**
   * Wait for Render to build and launch your server.
   * Once status changes to **Live**, copy the public URL located at the top-left of the service page (e.g., `https://socialverse-backend.onrender.com`).

---

## Step 3: Link Frontend to live Backend

Before deploying the frontend, you must redirect it to talk to the live Render URL instead of `localhost`.

1. **Modify Frontend Config Files:**
   Open the following files in VS Code and change the `API_BASE_URL` to point to your live Render backend URL:

   * **File 1:** [api.js](file:///c:/Users/Admin/Desktop/Social%20Commerce/frontend/js/api.js#L6)
     ```javascript
     // Change this:
     const API_BASE_URL = 'http://localhost:5000/api';
     // To this:
     const API_BASE_URL = 'https://socialverse-backend.onrender.com/api';
     ```

   * **File 2:** [paymentHandler.js](file:///c:/Users/Admin/Desktop/Social%20Commerce/frontend/js/paymentHandler.js#L7)
     ```javascript
     // Change this:
     const API_BASE_URL = 'http://localhost:5000/api';
     // To this:
     const API_BASE_URL = 'https://socialverse-backend.onrender.com/api';
     ```

   * **File 3:** [ecommerceFeatures.js](file:///c:/Users/Admin/Desktop/Social%20Commerce/frontend/js/ecommerceFeatures.js#L7)
     ```javascript
     // Change this:
     const API_BASE_URL = 'http://localhost:5000/api';
     // To this:
     const API_BASE_URL = 'https://socialverse-backend.onrender.com/api';
     ```

2. **Commit and Push Changes:**
   * Save all modified files.
   * Commit and push the changes to GitHub so Vercel can pull the updated API endpoints:
     ```bash
     git add .
     git commit -m "Update API endpoints to production URL"
     git push origin main
     ```

---

## Step 4: Frontend Deployment (Vercel)

Vercel is the industry standard for hosting static assets and frontends securely with instant worldwide CDN delivery.

1. **Deploy to Vercel:**
   * Go to [Vercel](https://vercel.com) and log in using GitHub.
   * Click **Add New** -> **Project**.
   * Click **Import** next to your GitHub repository.

2. **Configure Project Settings:**
   * **Project Name:** `socialverse-frontend` (or similar)
   * **Framework Preset:** `Other` (since this is a Vanilla HTML/CSS/JS frontend)
   * **Root Directory:** Edit this and select the `frontend` folder.
   * **Build and Output Settings:** Leave default (no build command required).
   * Click **Deploy**.

3. **Configure URL Rewrite Rules (Optional but Recommended):**
   * If you want clean routing or face redirection issues with your HTML pages, create a `vercel.json` file inside the `frontend/` folder:
     ```json
     {
       "cleanUrls": true,
       "trailingSlash": false
     }
     ```
   * Push the `vercel.json` changes to GitHub to trigger an automatic Vercel rebuild.

---

## Step 5: Post-Deployment Verification & Handshake

Once everything is deployed, perform the following verification steps:

1. **CORS Validation:**
   * Ensure your Render backend permits requests from your Vercel URL.
   * The backend's [server.js](file:///c:/Users/Admin/Desktop/Social%20Commerce/backend/src/server.js#L47-L51) currently has CORS enabled for all origins (`origin: "*"`), which is suitable for testing. In production, you can restrict it to your specific Vercel URL:
     ```javascript
     app.use(cors({
       origin: "https://socialverse-frontend.vercel.app",
       credentials: true
     }));
     ```

2. **Testing Auth and DB Transactions:**
   * Open your live Vercel frontend URL.
   * Go to the Registration page and register a new user.
   * Log into the Supabase database dashboard -> **Table Editor** -> `users` table to confirm the record was inserted.

3. **Socket.io Check:**
   * The real-time chat component connects via Socket.io. Ensure clients initialize connections pointing to the Render URL (without the `/api` prefix):
     * e.g., `const socket = io('https://socialverse-backend.onrender.com');`
     * Verify that messages send and receive instantly across two browser sessions.
