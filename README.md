# Campaign Registration

## Overview

A landing page for the customer of OWNDAYS to register to get a free eye-exam and a chance to participate in-store events.

## Project Structure

```
owndays/
├── index.html
├── style.css
├── app.js
├── dashboard.html
├── dashboard.css
└── dashboard.js
├── images/
|   └── owndays.ico
└── README.md
```

## Technologies Used

* HTML
* CSS
* JavaScript

## Setup

No server required. Open `index.html` directly in a browser. Data will be saved in browser's localStorage.

Open `dashboard.html` to view the dashboard. Data will be read from the same localStorage origin.

## Part 1 — Landing Page

Collects visitor registrations via a form with client-side validation:
- Required field checks, email format, and phone format
- Store validated against an explicit allowlist
- Preferred date mustn't be in the past

On submit, the record is saved to `localStorage` and a success message is shown.

## Part 2 — Dashboard

Open `dashboard.html` to view the analyst view. Features:
- **Stat cards** — total sign-ups, registrations this week, most popular store, appointments in the next 7 days
- **Charts** — horizontal bar charts for sign-ups by store and by preferred date
- **Filters** — filter by store, date range, and free-text search across name, email, and phone
- **Table** — sortable columns; click any header to toggle sort
- **Export** — downloads currently filtered rows as a csv file
- **Visit counter** — displays how many times the landing page has been viewed

## Form Data Storage

All data is stored in `localStorage` under these keys:

`owndays_registrations` - Set of registration records
`owndays_registrations` - Landing page view count


Each registration record is a JSON object:

```json
{
  "id":             "uuid-v4",
  "name":           "John Doe",
  "email":          "john.doe@example.com",
  "phone":          "0812345678",
  "store":          "fashionisland",
  "preferred_date": "2026-06-11",
  "registered_at":  "2026-06-11T09:23:00.000Z"
}
```

To inspect in DevTools: Application → Local Storage → your origin.

## AI Usage Declaration

Artificial Intelligence (AI) tools were used during the development of this project to assist with certain tasks, including but not limited to:

* Code suggestions and debugging
* Documentation drafting
* UI/UX designing
* Content generation and refinement

All AI-generated outputs were reviewed, validated, modified, and integrated by the developer.

### AI Tools Used

* ChatGPT
* Claude.ai

## Future Improvements

* Implement internal authentication for dashboard
* Integrate more advanced analytics 
* Develop a backend system to support data persistence, and API integrations
* Consider migrating the project to modern frontend and backend frameworks