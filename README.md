# FORGE

FORGE is a mobile-first workout and fitness tracking PWA for managing workouts, progress, nutrition, and hydration reminders.

## Features

- Workout plans and exercise tracking
- Exercise weight and progress tracking
- Workout history and progress data
- Nutrition and meal tracking
- Hydration reminders
- Real push notifications for water reminders
- Installable Progressive Web App (PWA)
- Mobile-focused dark interface
- Local data persistence
- Lightweight HTML, CSS, and JavaScript frontend

## Push Notifications

FORGE uses Web Push with Netlify Functions and Web Push VAPID authentication.

- Browser push subscriptions are registered through the service worker.
- Push subscriptions are stored using Netlify Blobs.
- A scheduled Netlify Function sends water reminders every 2 hours.
- VAPID private keys are kept in Netlify environment variables.

## Tech Stack

- HTML
- CSS
- JavaScript
- Service Worker / Web Push API
- Netlify Functions
- Netlify Blobs
- GitHub
- Netlify

## Deployment

The project is connected to Netlify for automatic deployments from the main branch.

1. Push changes to GitHub.
2. Netlify automatically deploys the latest version.
3. Open the deployed site on a supported browser.
4. Install FORGE as a PWA if desired.
5. Enable notification permission to receive hydration reminders.

## Project Structure

- index.html
- manifest.json
- icon.svg
- sw.js
- package.json
- netlify.toml
- netlify/functions/subscribe.js
- netlify/functions/send-water-reminder.js

## Workout Schedule

- Monday — Chest + Triceps
- Tuesday — Back + Biceps
- Wednesday — Rest
- Thursday — Chest + Shoulders
- Friday — Biceps + Triceps
- Saturday — Legs
- Sunday — Rest

## License

This project is for personal use.