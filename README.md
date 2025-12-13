# ShipStation Capstone Project

## Overview
This project is a Next.js application that integrates with ShipStation-style workflows to manage authenticated image transfers and ZIP downloads. Users can log in, view image thumbnails, download ZIP archives, and manage transfer history.

## Tech Stack
- **Frontend:** Next.js (App Router), React
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Authentication:** Token-based authentication using Context API
- **Hosting:** Render

## Features
- Secure authentication and authorization
- Authenticated image thumbnails
- ZIP download of images
- Transfer history with clear/reset functionality
- MongoDB-backed data persistence

## API Overview

### External APIs
This application integrates with the **ShipStation API** to retrieve order and shipment-related data used during the image transfer and processing workflow. ShipStation acts as the upstream data source for identifying orders and associated assets.

### Internal APIs (Next.js API Routes)
The application exposes internal REST-style API routes to handle authenticated access, processing, and downloads:

- `GET /api/auth/images/:store/:file`
  - Serves authenticated image thumbnails
  - Requires a valid auth token

- `GET /api/auth/download-zip`
  - Generates and returns a ZIP archive of images for a selected store
  - Requires authentication

- Additional internal routes manage application logic, data persistence, and communication between the frontend and backend layers.

### Authentication
All protected routes require a valid token, which is validated server-side before accessing ShipStation data or internal resources.


## Database Operations (CRUD)
- **Create:** Records created when transfers occur
- **Read:** Transfer records and image metadata fetched from MongoDB
- **Update:** Records updated during processing
- **Delete:** Old or cleared history entries removed as needed

## State Management
- React Context API is used to manage authentication and shared application state.

## Testing
- Jest is used for basic unit testing.
- A sanity test is included to validate the testing setup.

## Deployment
The application is deployed on Render and configured to build and run using Node.js.

## Setup Instructions
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install

## Environment variables
- SHIPSTATION_API_KEY=2d67b318fa06467d94c9c159aa987f5d
- SHIPSTATION_API_SECRET=14ccebfdb07748748663e66fa98c3a28
- MONGODB_URI="mongodb+srv://cmcd1091_db_user:uoRBspLvVb7qhyom@shipstation.nht6wyl.mongodb.net/shipstation?retryWrites=true&w=majority&appName=shipstation"
- JWT_SECRET=loginauthsecret
- ADMIN_EMAIL=admin@example.com
- ADMIN_PASSWORD=test123

<!-- Capstone Step 6 submission -->
