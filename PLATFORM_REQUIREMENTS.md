# ChatGPT Platform Clone: Requirements & Feature Spec

## Core Features
- Modern, responsive web UI (chat window, sidebar, settings)
- User authentication (sign up, login, password reset, Google OAuth)
- Conversation history (view, delete, rename, organize)
- Prompt/response display (markdown, code, images)
- File upload/download in chat
- Model selector (switch between AI models)
- Custom instructions/system prompts
- Theme switcher (light/dark)
- Keyboard shortcuts
- Settings page (account, preferences)
- Subscription/billing (Stripe integration, mock for now)
- Mobile responsiveness & PWA support
- Accessibility (screen reader, ARIA, contrast)
- Error handling and notifications
- Plugin/API integration support (mocked)
- Multi-language UI
- Admin/user management 

## Tech Stack
- Frontend: React (TypeScript), Tailwind CSS, Redux/Context, React Router
- Backend: Node.js, Express, MongoDB, JWT
- Auth: Email/password, Google OAuth
- File handling: Multer (backend), HTML5 (frontend)
- Billing: Stripe (mocked)

## Pages
- Login / Sign Up
- Chat (main)
- Conversation history/sidebar
- Settings
- Billing/Subscription
- Error/404

## UI Elements
- Chat window (input, send, markdown rendering)
- Sidebar (history, new chat, model selector)
- Top bar (settings, account, theme, shortcuts)
- File upload/download buttons
- Model selector dropdown
- Notification/toast system

## Backend Endpoints (Mocked)
- /api/auth/* (login, signup, logout, reset)
- /api/chat/* (send, history, delete, rename)
- /api/models (list models)
- /api/user (profile, settings)
- /api/billing/* (mocked)
- /api/files/* (upload, download)

## Accessibility
- Full keyboard navigation
- ARIA labels
- High contrast mode

## Deployment
- Docker support
- Vercel/Netlify configs

## Notes
- All AI responses will be mocked/placeholder.
- No actual AI model integration until further notice.
