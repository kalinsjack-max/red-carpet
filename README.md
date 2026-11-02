# Red Carpet — Website + Online Ordering + Kitchen + Admin

Static website (plain HTML/CSS/JS) + **Firebase** (free database & login) → hosted on **GitHub + Vercel**.
No server code, nothing to install on your computer.

| Page | Link after hosting | Who |
|---|---|---|
| Website | `https://YOUR-SITE.vercel.app/` | everyone (Bangla by default, English button) |
| Order tracking | `/track.html` | customers (no login) |
| Kitchen dashboard | `/kitchen/` | kitchen staff (login) |
| Admin panel | `/admin/` | owner (login) |

---

## 0. Try it first (no setup, 1 minute)
Open the folder with any simple web server, e.g. in this folder run `python3 -m http.server 8000` and open http://localhost:8000
The site starts in **DEMO MODE** (yellow bar): everything works but data is saved only in that browser.
Demo logins: `admin@redcarpet.com / admin123` and `kitchen@redcarpet.com / kitchen123`.
(Opening index.html by double-click will NOT work — browsers block modules from files. Use a server, or just deploy.)

---

## 1. Create the Firebase project (free)
1. Go to https://console.firebase.google.com → **Add project** → name it `red-carpet` → (Google Analytics: off) → Create.
2. **Build → Firestore Database → Create database** → *Production mode* → location: choose `asia-south1 (Mumbai)` or `asia-southeast1` (nearest to Bangladesh) → Enable.
3. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
4. **Authentication → Users → Add user** — create two users:
   - Owner/admin: e.g. `owner@yourmail.com` + a strong password
   - Kitchen: e.g. `kitchen@yourmail.com` + a password (share only this one with the kitchen)
5. **Project settings (gear icon) → General → Your apps → `</>` Web** → register app (no hosting) → copy the `firebaseConfig` values.

## 2. Put your keys & emails in the code (2 files)
**a) `js/config.js`**
- Paste the `firebaseConfig` values into `FIREBASE_CONFIG`.
- Replace the emails in `STAFF` with the two emails you created in step 1.4.

**b) `firestore.rules`**
- Replace `admin@redcarpet.com` and `kitchen@redcarpet.com` with the **same two emails**.
- Firebase Console → **Firestore Database → Rules** → delete everything → paste the whole file → **Publish**.

> The rules are what really protect your data: only the admin email can change the site or read bookings; only admin/kitchen emails can see all orders or change an order's status. Customers can only *create* orders/bookings and view their own order by its long secret link.

## 3. Upload to GitHub
1. https://github.com → **New repository** → name `red-carpet` → **Private** (recommended) → Create.
2. Click **uploading an existing file** → drag **all files and folders from inside this folder** (index.html, js, css, admin, kitchen, assets, vercel.json …) → **Commit changes**.
   (Index.html must be at the top level of the repo, not inside another folder.)

## 4. Deploy on Vercel (free)
1. https://vercel.com → sign in with GitHub → **Add New → Project** → import `red-carpet`.
2. **Framework Preset: Other.** Leave Build Command and Output Directory empty. → **Deploy**.
3. Copy your live link (e.g. `https://red-carpet.vercel.app`).
4. Firebase Console → **Authentication → Settings → Authorized domains → Add domain** → paste your Vercel domain (and your own domain later).
5. Every time you push a change to GitHub, Vercel updates the site automatically.

## 5. First-time setup in the Admin panel
1. Open `https://YOUR-SITE/admin/` → log in with the owner email.
2. **মেনু ও দাম** → click **ডিফল্ট ইমপোর্ট করুন** (loads your 65 dishes with Bangla names). **Check every price** — a few were estimated (see notes below).
3. **গ্যালারি** → import defaults or upload your real photos. **সাইটের লেখা ও সেটিং** → set phone, address, hours, banner photo, number of tables.
4. **টেবিল QR** → print one QR per table. Customers scan → menu opens with their table already selected.
5. Place a test order from your phone, open `/kitchen/` on the kitchen tablet, and press the buttons.

## How an order moves
Customer places order (no login) → kitchen screen beeps, status **প্রস্তুত হচ্ছে (Preparing)** →
kitchen presses **রেডি করুন** → customer's phone shows **রেডি (Ready)** → customer picks up →
kitchen presses **সম্পন্ন** → **Completed**. Kitchen can also cancel, or move an order back by one step.

## Bookings
Website form → saved in the database → **Admin → বুকিং** (live, with a beep + red counter on a new one; call/WhatsApp buttons; export CSV).
Optional email copy: put the owner's email in `OWNER_NOTIFY_EMAIL` in `js/config.js` (uses free FormSubmit.co; it sends a one-time confirmation email — click it).

## Developer credit (locked)
The footer line "Developed By : AISHORJO" is written in `js/credit.js`, not in the database, so **nothing in the Admin panel can change it**, and a small guard restores it if someone removes it in the browser.
Honest limit: anyone who has the **source code / GitHub access** can edit any file. To protect your name when handing over: keep the GitHub repository in **your** account (give the new owner only the admin login and the Vercel/Firebase access he needs), or only transfer it after you are comfortable.

## Notes
- Staff UI is Bangla. The public site is Bangla by default with an English switch (remembered per visitor).
- Photos uploaded in the admin are resized and stored inside Firebase (free plan is enough). Prefer ≤ 40 gallery photos.
- Order totals are calculated in the customer's browser (payment is at the counter, so this is fine). There is no online payment.
- Free Firebase limits (50k reads / 20k writes per day) are far above what a restaurant needs, but the live kitchen screen does count reads.
- To add staff accounts later: create the user in Firebase Authentication, then add the email to `STAFF` in `js/config.js` **and** to `firestore.rules`, and Publish the rules.
- To change a password: Firebase Console → Authentication → Users → ⋮ → Reset password.
