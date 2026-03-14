# Contributing to Beacon Point

Welcome! This guide will help new developers get started and contribute effectively.

## Project Structure
- **/apps/web-dashboard**: Next.js dashboard (React, TypeScript, MUI)
- **/apps/screen-player**: Python client for physical screens
- **/packages/ui**: Shared React UI components
- **/packages/database**: Database schema, migrations (Prisma/SQLAlchemy)
- **/packages/api**: Shared API types
- **/services/**: Backend microservices (FastAPI, Node, etc.)
- **/infra/**: Infrastructure as code, scripts

## Getting Started
1. Clone the repo and open in VS Code (Codespaces recommended)
2. Run `npm install` at the root
3. Start all apps/services with `npm run dev` (see README for details)
4. For backend Python services, use `uvicorn` or `python main.py` in the service folder

## Development Workflow
- Use feature branches for new work (`feature/your-feature`)
- Write clear, atomic commits
- Run `npm run lint` and `npm run test` before pushing
- Open a pull request for review
- Group related changes into a single PR when possible

## Code Style
- Frontend: Prettier, ESLint, TypeScript strict mode
- Backend: Black (Python), isort, mypy for type checks
- Use environment variables for secrets/config

## Testing
- Frontend: Jest, React Testing Library
- Backend: Pytest (Python), Jest (Node)
- Add/maintain tests for new features and bugfixes

## Documentation
- Update README.md and this file as needed
- Add code comments for complex logic

## Troubleshooting
- If you see errors, check the terminal output and logs
- Ensure all dependencies are installed
- Ask in the team chat or open an issue if stuck

## Contact
- For questions, contact the project maintainer or open a GitHub issue.

Thanks for contributing!