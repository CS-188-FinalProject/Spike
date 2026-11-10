**ChatGPT created this documentation based off of our initial plan.**


# Spike

A campus-focused prediction market platform designed to increase student engagement with Drake University athletics, campus events, and student culture through friendly competition and interactive predictions.

## Overview

Drake Prediction Markets is a digital prediction platform that allows Drake University students (18+) and fans to predict the outcomes of Drake-specific events using a virtual currency system.

The goal is to make Drake events more exciting and engaging by allowing students to put their predictions to the test, compete with other members of the campus community, and track their performance over time.

Users can browse available prediction markets, place predictions on upcoming events, view potential outcomes, and earn virtual winnings for correct predictions.

Administrators can create markets, manage events, and resolve predictions once official outcomes are available.

## Problem Statement

Drake University athletics and campus events provide opportunities for student engagement, but students may not always have a strong incentive to follow or participate in them.

This application aims to solve that problem by:

- Encouraging students to follow Drake athletics and campus events.
- Creating friendly competition between students.
- Allowing users to compare predictions with the campus community.
- Increasing interest in Drake sports teams and university events.
- Providing an entertaining way to engage with campus culture.

## Target Audience

The application is designed for:

- Drake University students aged 18 and older.
- Drake athletics fans.
- Students interested in sports and campus events.
- Students who enjoy friendly competition.
- Members of the Drake community interested in making predictions.

## Features

### Core Features

- User registration and account creation.
- Secure user authentication.
- User profiles and virtual currency portfolios.
- Browse available prediction markets.
- View individual market and event details.
- Place predictions using virtual currency.
- Lock predictions after the applicable deadline.
- Track virtual currency balances and winnings.
- Automatic payouts for correct predictions.
- Admin market and event creation.
- Admin market resolution.

### Basic Features

- Sports categories and search filters.
- Notifications and reminders.
- Other user profiles.
- Prediction probabilities.
- Prediction history.
- Age verification.
- Game details and player statistics.
- Account settings.
- Transaction history.
- Cash-out functionality, subject to applicable legal and regulatory requirements.

### Stretch Features

- Expansion to other colleges and universities.
- Leaderboards displaying top-performing users.
- Social networking features.
- Achievements and rewards.
- Parlays and combined predictions.
- Responsible gambling resources and hotline information.
- User-created prediction markets.

## Technology & External APIs

### The Odds API

The application plans to integrate with [The Odds API](https://the-odds-api.com/) to retrieve sports betting odds and event information.

Potential uses include:

- Retrieving upcoming sporting events.
- Synchronizing current betting odds.
- Displaying game information.
- Supporting prediction probabilities.
- Keeping market information up to date.

## API Documentation

The backend provides REST API endpoints for authentication, user management, markets, transactions, and external API integration.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Creates a new user profile. |
| POST | `/login` | Authenticates a user and creates an active session. |
| POST | `/logout` | Logs out the currently authenticated user. |

### User Information

| Method | Endpoint | Description |
|---|---|---|
| GET | `/myself` | Retrieves the current user's profile and balance. |
| PATCH | `/myself` | Updates the current user's information. |
| GET | `/leaderboard` | Retrieves the current leaderboard. |

### Markets

| Method | Endpoint | Description |
|---|---|---|
| GET | `/market` | Retrieves available prediction markets. |
| POST | `/market` | Creates a new market (Admin only). |
| GET | `/markets/{market_id}` | Retrieves details about a specific market. |
| GET | `/market/{market_id}/events/{event_id}` | Retrieves details about a specific event. |
| POST | `/market/{market_id}/events/{event_id}` | Creates an event within a market (Admin only). |
| POST | `/market/{market_id}/events/{event_id}/resolve` | Resolves an event and triggers payouts (Admin only). |

### Transactions & Predictions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/wagers` | Places a prediction on an active event. |
| GET | `/myself/wagers` | Retrieves the user's current and historical predictions. |

### External API Integration

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/sync-odds` | Retrieves and synchronizes sports odds from The Odds API (Admin only). |

## Application Navigation

The general application navigation follows this flow:

1. **Authentication:** Users register or log into their accounts.
2. **Dashboard:** Users view their profile, balance, and available markets.
3. **Browse Markets:** Users explore available sports and campus event predictions.
4. **Market Details:** Users review event information, available outcomes, and probabilities.
5. **Place Prediction:** Users select an outcome and commit virtual currency.
6. **Track Predictions:** Users monitor active and completed predictions.
7. **Receive Payouts:** Correct predictions receive virtual currency after an event is resolved.
8. **Leaderboard:** Users compare their performance against other students.

## User Accounts & Security

The application includes an authentication system to protect user accounts and personal information.

Security considerations include:

- Secure password storage and authentication.
- Session management.
- Protected user information.
- Authorization for administrative endpoints.
- Input validation.
- Age verification.
- Secure transaction and balance management.

## Future Development

Potential future improvements include:

- Expanding markets beyond Drake athletics.
- Introducing social features and student interactions.
- Developing a comprehensive leaderboard.
- Integrating additional sports data providers.
- Implementing achievements and rewards.
- Allowing users to create their own markets.

## Disclaimer

This project is intended to explore student engagement through prediction markets and virtual currency.

Any implementation involving real-money wagers, cash-outs, or gambling-related functionality must undergo appropriate legal, regulatory, and university policy review before deployment. Age verification alone does not establish legal authorization to operate a gambling platform.

## Project Goals

The primary goal of Drake Prediction Markets is to make Drake athletics and campus events more engaging by giving students an interactive platform to make predictions, compete with friends, and become more involved in the Drake community.
