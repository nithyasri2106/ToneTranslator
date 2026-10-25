# ToneTranslator

ToneTranslator is a responsive AI message rewriting app built with Next.js App Router, TypeScript, and Tailwind CSS. Select up to three tones, optionally describe the recipient, and get rewrites with a short explanation of each change.

## Features

- Seven tones: Professional, Friendly, Firm / Assertive, Empathetic, Concise, Formal, Casual / Gen-Z
- Strict system prompt focused on preserving meaning, facts, intent, and language
- Groq chat-completions API integration with JSON-mode output
- Responsive light/dark interface, loading skeletons, validation and error states
- Copy-to-clipboard actions, example messages, character count, original-message comparison
- Last five rewrites stored locally in the browser
- API key remains on the server and is never exposed to client-side code

## Requirements

- Node.js 18.17 or later
- A Groq API key from [Groq Console](https://console.groq.com/keys)

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Add your key to `.env.local`:

   ```env
   GROQ_API_KEY=your_real_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

   You can change `GROQ_MODEL` to another model available to your Groq account. Never prefix the API key with `NEXT_PUBLIC_`.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push the project to a Git repository and import it into Vercel.
2. In **Project Settings → Environment Variables**, add `GROQ_API_KEY` and optionally `GROQ_MODEL`.
3. Deploy. Redeploy after changing environment variables.

## API

`POST /api/rewrite`

Request body:

```json
{
  "message": "hey, can you send the report today?",
  "recipient": "my manager",
  "tones": ["Professional", "Friendly"]
}
```

Response body:

```json
{
  "results": [
    {
      "tone": "Professional",
      "text": "Could you please send the report today?",
      "explanation": "Uses a polished, courteous request while keeping the deadline unchanged."
    }
  ]
}
```

The API validates the message length, tone selection, API key, and model response. The system prompt explicitly prohibits inventing details, changing intent, or altering facts. As with any generative model, review sensitive or high-stakes wording before sending it.

## Project structure

```text
app/
  api/rewrite/route.ts   # Server-side Groq integration and validation
  globals.css            # Tailwind base and global styles
  layout.tsx             # App metadata and root layout
  page.tsx               # Main single-page UI
components/               # Reserved for extracted reusable UI components
lib/types.ts              # Tone list and shared types
.env.example              # Environment variable template
```

## Notes

- API keys are server-side only.
- Recent messages are stored in browser local storage on the current device/browser; clearing site data removes them.
- This project uses Tailwind-styled accessible controls and Lucide icons. The UI components are local rather than generated shadcn/ui components, so you can add shadcn/ui later if you want its component primitives.
