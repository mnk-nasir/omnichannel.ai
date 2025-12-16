# Meta OAuth & "One-Click Connect" Setup Guide

Currently, your SaaS platform (OmniCenter) operates on a "Bring Your Own Token" (BYOT) model. This is standard for developer tools. However, for a true B2B SaaS where business owners can simply click **"Connect Instagram"** and be done, you need to set up **Meta Embedded Sign-Up**.

Because Meta controls the data of billions of users, they do not let software platforms automate messaging on behalf of random users without strict verification.

Here is the step-by-step process you (the SaaS owner) must complete to enable true SaaS "One-Click Connect" for your future users.

## Step 1: Business Verification
Before you can ask for the necessary API permissions to message people automatically, Meta requires you to prove you are a real company.

1. Go to the [Meta Business Settings](https://business.facebook.com/settings).
2. Go to **Security Center** and click **Start Verification**.
3. You will need to upload:
    * A Certificate of Incorporation / LLC documents.
    * A utility bill matching the legal business name and address.
    * A functioning website with a matching domain.

## Step 2: Create the Central SaaS App
Once your business is verified, you create the main "App" that all your clients will log into.

1. Go to the [Meta Developer Portal](https://developers.facebook.com/apps).
2. Click **Create App** > **Other** > **Business**.
3. Give it your SaaS name (e.g., *OmniCenter AI*).
4. Link it to your verified Business Portfolio from Step 1.

## Step 3: Request Advanced Permissions
To read and reply to messages for your clients, your App needs special permissions. Meta requires a manual App Review process to grant these.

1. In your App Dashboard, go to **App Review > Permissions and Features**.
2. Request Advanced Access for the following permissions:
    * `instagram_manage_messages` (To reply to IG DMs)
    * `instagram_basic` (To read IG profile info)
    * `pages_messaging` (To reply to FB Messenger)
    * `whatsapp_business_messaging` (To send WA messages)
    * `whatsapp_business_management` (To automate WA numbers)
3. **The Review Process:** For *each* permission, Meta will ask you to:
    * Write a paragraph explaining exactly why the AI needs it.
    * Upload a **Screencast Video** showing a user logging into your dashboard, clicking "Connect", and the AI responding. *(You can use the current Gateway webhook setup to fake this video for the reviewers!)*

## Step 4: Add Facebook Login for Business
Once the permissions are secured, you can enable the "One-Click" popup.

1. Add the **Facebook Login for Business** product to your App.
2. Configure your specific redirect URIs (e.g., `https://your-domain.com/api/auth/meta/callback`).
3. We will then update the Next.js `client-dashboard` to add an OAuth flow. When the user clicks "Connect":
   * It pops up a Facebook Login window.
   * The user logs in and selects which Instagram/WhatsApp number they want the AI to manage.
   * Meta redirects back to the Next.js backend with an `access_token`.
   * Next.js saves this `access_token` to the Supabase database.
4. **Result:** The Node.js Gateway no longer needs environment variables! It will just look up the specific user's `access_token` from the database and hit the Meta API automatically.

---

### In the Meantime (Phase 1 Launch)
The current solution (using a single central webhook and manually linking the Meta App) works perfectly for testing, internal tools, and onboarding your first few beta clients manually (Concierge Onboarding). 

When you are ready to pursue Step 1 and 2, let me know, and I can write the OAuth Next.js code for Step 4!
