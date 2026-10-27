## Description
<!-- Provide a brief overview of changes and motivation. -->

## Type of Change
- [ ] 🚀 New feature (non-breaking change adding functionality)
- [ ] 🐛 Bug fix (non-breaking change resolving an issue)
- [ ] ⚡ Performance improvement / refactor
- [ ] 🔒 Security fix / governance policy update
- [ ] 📝 Documentation update

## Clean Architecture Layer Impact
- [ ] `Domain` (Entities, Value Objects, Enums)
- [ ] `Application` (Commands, Queries, DTOs, Behaviors)
- [ ] `Infrastructure` (EF Core, Repositories, Identity, File Storage, Notifications)
- [ ] `Api` (Minimal API endpoints, routing, middleware)
- [ ] `Client` (Angular 22 Zoneless Signals, Components, Design System)

## Quality Checklist
- [ ] Solution compiles cleanly without warnings (`dotnet build JobPortal.slnx`)
- [ ] Unit & Integration tests execute and pass (`dotnet test`)
- [ ] Angular production bundle compiles with 0 errors (`npm run build`)
- [ ] Automated verification script verified locally
- [ ] Scalar OpenAPI documentation verified at `/scalar/v1`
