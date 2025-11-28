# 🔥 SMASHER

**A location-based social app to meet, chat, and connect with gay men nearby.**

---

## 📦 Current Release

- **App version:** `4.0.10`
- **Platform:** Android (8.0+)
- **Download:**
  - **Latest APK:** https://github.com/honkyhank82/Smasher/releases/latest

Go to the latest GitHub Release and install the attached APK on your Android device.

> **Note:** SMASHER is distributed outside the Play Store. You may need to enable
> "install unknown apps" for your browser or file manager. See the full user guide
> for step‑by‑step instructions.

---

## ✨ Key Features

- **Find nearby users**
  - Location‑based feed of men near you
  - Distance displayed in **miles**, with adjustable range

- **Rich profiles**
  - Photos (profile + gallery)
  - Bio and display name
  - Profile details: age visibility toggle, height (inches), weight (lbs),
    ethnicity, body type, sexual position, relationship status, and what
    you're looking for (friends, dates, chat, relationship, hookup)

- **Messaging & favorites**
  - 1:1 real‑time chat
  - Mark users as favorites and manage from the Favorites tab

- **Location sharing**
  - Optional location sharing from chat/profile actions so you can let
    someone know where you are

- **Safety & privacy**
  - **Screenshot protection** on Android via `FLAG_SECURE` (prevents
    screenshots and screen recording of the app)
  - Block & report users
  - Account deactivation and deletion from Settings

---

## 👤 Sign‑Up & Login Flow (Current Behavior)

- **Age gate:** you must confirm you are 18+ before creating an account.
- **Registration:**
  - Email
  - Password
  - Birthdate (for age verification)
- **Login:** standard **email + password**.
- After login, you are guided to **create your profile** (photo, bio,
  profile details) before entering the main app.

---

## 🛠 Tech Overview

- **Mobile app:** React Native + Expo (managed workflow)
- **Backend:** NestJS + TypeORM
- **Database:** PostgreSQL (Fly.io)

This repository contains:

- `app-rn/` – React Native mobile app
- `server/` – NestJS backend API

---

## 📚 Full User Guide

For detailed install instructions, troubleshooting, FAQs, and a more
marketing‑oriented description of SMASHER, see:

- [`USER_README.md`](./USER_README.md)

That document includes:

- Step‑by‑step Android install guide
- Common error messages and fixes
- Privacy & safety notes
- Support contact information

---

## 🚀 Contributing / Issues

This project is currently closed‑source for personal/non‑commercial use.

If you:

- Find a bug,
- Have a feature request,
- Or need help installing the app,

please open a GitHub Issue or email: **smashermain@gmail.com**.

