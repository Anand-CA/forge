# 🔥 FORGE — Workout & Fitness Tracker

> **Train hard. Track everything. Build yourself. 💪**

**FORGE** is a mobile-first fitness tracking PWA built to keep your workouts, progress, nutrition, and hydration in one place.  
Fast, lightweight, installable, and designed for everyday use. ⚡📱

---

## 🏋️ Features

| | Feature | |
|---|---|---|
| 🏋️ | **Workout Tracking** | Follow your weekly workout plan and track exercises |
| 📈 | **Progress Tracking** | Record weights and monitor your training progress |
| 🗓️ | **Workout History** | Keep a history of completed training sessions |
| 🍽️ | **Nutrition** | Track meals and daily nutrition |
| 💧 | **Hydration** | Stay on top of your water intake |
| 🔔 | **Push Notifications** | Receive water reminders every 2 hours |
| 📱 | **Installable PWA** | Install FORGE directly on your phone |
| 🌙 | **Dark Interface** | Mobile-focused dark UI |
| 💾 | **Local Persistence** | Keep app data available between sessions |
| ⚡ | **Lightweight** | Plain HTML, CSS & JavaScript with minimal overhead |

---

## 💧 Smart Hydration Reminders

FORGE supports **real browser push notifications** so you can get hydration reminders even when the app isn't open.

### 🔔 How it works

```
📱 FORGE
    ↓
🔔 Browser Push Subscription
    ↓
☁️ Netlify Function
    ↓
💾 Netlify Blobs
    ↓
⏰ Scheduled Function — Every 2 Hours
    ↓
💧 Push Notification
```

- 🔐 VAPID authentication secures Web Push.
- 💾 Push subscriptions are stored using **Netlify Blobs**.
- ⏰ A scheduled **Netlify Function** sends water reminders every 2 hours.
- 🔑 VAPID private keys stay in **Netlify environment variables**.
- 📴 Notifications can arrive while the app is closed, subject to browser/OS support and power-management behavior.

---

## 🧰 Tech Stack

### 🎨 Frontend
- 🧱 HTML
- 🎨 CSS
- ⚡ JavaScript
- 🧑‍💻 Service Worker
- 🔔 Web Push API
- 📲 PWA / Web App Manifest

### ☁️ Backend & Infrastructure
- ▲ **Netlify**
- ⚙️ **Netlify Functions**
- 💾 **Netlify Blobs**
- 🔔 **web-push**
- 🐙 **GitHub**

## 🔐 Username and password accounts

Forge accounts use a username and password. Usernames are case-insensitive and may contain spaces or punctuation. Passwords must be 8–72 characters. Supabase Auth hashes passwords before storing them; Forge never stores or logs a plaintext password. The browser only receives the normal Supabase session tokens.

Username signup and sign-in call Supabase Auth directly from the browser using the project's publishable key configured in `src/App.jsx`; no Netlify auth function or service role key is used. Usernames map to deterministic internal, non-deliverable email identifiers, so password recovery by email is not available in this username-only flow. To allow signup without an email address, disable email confirmation in the Supabase Auth settings. Existing accounts created by the previous Netlify flow use the same identifier and remain compatible. Existing anonymous installs can continue using their current session, but new username accounts are separate Supabase users.

---

## 🚀 Deployment

FORGE is connected to Netlify for automatic deployments from the `main` branch.

```
👨‍💻 GitHub
   ↓
📦 Push to main
   ↓
▲ Netlify
   ↓
🚀 Automatic Deployment
   ↓
📱 FORGE PWA
```

### 📲 Install FORGE

1. 🌐 Open the deployed FORGE website.
2. 📱 Use your browser's **Add to Home Screen / Install App** option.
3. 🔔 Allow notifications when prompted.
4. 💧 Enable the hydration reminder.
5. 🏋️ Start training.

---

## 📂 Project Structure

```
forge/
├── 🌐 index.html
├── 📋 manifest.json
├── 🎨 icon.svg
├── ⚙️ sw.js
├── 📦 package.json
├── 🚀 netlify.toml
└── ☁️ netlify/
    └── functions/
        ├── 🔔 subscribe.js
        └── 💧 send-water-reminder.js
```

---

## 🗓️ Weekly Workout Split

| Day | Workout |
|---|---|
| 🔴 **Monday** | 🟥 Chest + Triceps |
| 🔵 **Tuesday** | 🟦 Back + Biceps |
| 🟢 **Wednesday** | 😴 Rest |
| 🟡 **Thursday** | 🟨 Chest + Shoulders |
| 🟣 **Friday** | 🟪 Biceps + Triceps |
| 🟠 **Saturday** | 🟧 Legs |
| ⚫ **Sunday** | 😴 Rest |

---

## 🎯 FORGE Philosophy

> **Consistency beats motivation. 🔥**

Track the work.  
Show up.  
Add weight.  
Recover.  
Repeat. ♻️

**BUILD. TRAIN. FORGE. 💪**

---

## 📄 License

🔒 This project is for personal use.
