# LinkedIn Auto Engagement Chrome Extension

This Chrome Extension allows you to **automatically like and comment on LinkedIn feed posts** based on custom input counts. It's designed to help you boost engagement in a controlled and automated way — perfect for networking, visibility, or CFBR strategies.

---

## Features

- Set custom **Like Count** and **Comment Count**
- Smart check to avoid unliking already liked posts
- Automatically comments generic text (like “CFBR”)
- Scrolls through the LinkedIn feed and interacts post by post
- User stays in control (manual LinkedIn login required)

---

## Folder Structure

```
linkedin-auto-engagement-extension/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── style.css
└── icons/

---

## 🧪 How It Works

1. Install and pin the extension to your Chrome browser.
2. Log in to [LinkedIn](https://www.linkedin.com) manually.
3. Click the extension icon.
4. Enter:
   - `Like Count`: Number of posts to like
   - `Comment Count`: Number of posts to comment on
5. Click **Start Engaging**.
6. A new tab opens with LinkedIn Feed.
7. Extension auto-scrolls, likes, and comments based on inputs.
8. Stops automatically after limits are reached.

---

## 🛠️ Tech Stack

- **HTML**, **Tailwind CSS**, **JavaScript**
- **Chrome Extension APIs**: `chrome.tabs`, `chrome.storage`
- **Content Script + Popup architecture**

---

## 📂 Key Files Explained

### `manifest.json`
Defines the extension metadata, permissions, and script file connections.

### `popup.html`
Contains the user interface (input fields and button), styled with Tailwind and custom CSS.

### `popup.js`
Handles:
- Input validation
- Button enabling logic
- Opening LinkedIn feed tab
- Saving input values to local storage

### `content.js`
Handles:
- Reading stored like/comment counts
- Scrolling through LinkedIn feed
- Detecting and skipping already liked posts
- Commenting with predefined text like “CFBR”

---

## 🔒 Permissions Used

```json
"permissions": [
  "tabs",
  "activeTab",
  "storage",
  "scripting"
],
"host_permissions": [
  "https://www.linkedin.com/*"
]
