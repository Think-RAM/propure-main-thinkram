# Propure

Propure is an AI-powered application for conversational discovery and analysis of property investment strategies. It utilizes a multi-agent conversational architecture, integrating large language models for tailored property investment advice and market insights.

## Features

- **Conversational agent:** Interact with advanced Claude models to explore, analyze, and receive tailored investment strategies.
- **Multi-agent orchestration:** Claude Sonnet 4 orchestrator routes messages to specialist LLM agents for strategy, analysis, and research.
- **Dynamic UI updates:** Property lists, maps, and recommendations update in real time based on conversation context.
- **Financial & market data integration:** Robust analytics using real-world market and suburb data.

For a high-level architectural overview, see [docs/AI-AGENTS.md](docs/AI-AGENTS.md).

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- [pnpm](https://pnpm.io/) (v9+)
- PostgreSQL database (or your preferred SQL database for development)
- API keys for Google Maps, Google Generative AI, Clerk, Stripe, Inngest, Domain, Upstash, and Pusher
- Recommended: [direnv](https://direnv.net/) for environment variable management

### Installation

1. **Clone the repo:**

   ```sh
   git clone https://github.com/yourorg/propure.git
   cd propure
   ```

2. **Install dependencies:**

   ```sh
   pnpm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` (or the appropriate env file for your setup).
   - Fill in all required keys (see the `globalEnv` list in [turbo.json](turbo.json)):
     - `DATABASE_URL`
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - ... and others listed above

4. **Set up the database:**

   ```sh
   pnpm db:generate
   pnpm db:push
   pnpm db:migrate
   ```

5. **Run the development server:**
   ```sh
   pnpm dev
   ```
   By default, the app will be available at http://localhost:3000

---

## Development

- **Type Checking:**

  ```sh
  pnpm type-check
  ```

- **Linting:**

  ```sh
  pnpm lint
  ```

- **Formatting:**

  ```sh
  pnpm format
  ```

- **Cleaning:**

  ```sh
  pnpm clean
  ```

- **Database Migrations:**  
   See [package.json](package.json) for scripts like `db:generate`, `db:push`, and `db:migrate`.

- **TurboRepo:**  
   Propure uses [TurboRepo](https://turbo.build/) for advanced monorepo task orchestration.  
   See [turbo.json](turbo.json) for pipeline configuration.

---

## Project Structure

- `/apps` — App entrypoints (Next.js, etc.)
- `/packages` — Shared modules and libraries
- `/scripts` — Utility scripts (e.g., `preinstall.js`)
- `/docs` — Project documentation

---

## Contributing

1. Fork the repo and create your branch.
2. Make your changes and write clear, concise commit messages.
3. Ensure code passes linting, type checks, and is well formatted.
4. Submit a pull request and describe your changes.

---

## License

[MIT](LICENSE)

---
