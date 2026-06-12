# DVC Backend — Cổng Dịch vụ công TP. Quảng Ngãi

.NET 8 + PostgreSQL REST API for the public-services portal (citizen, officer, admin).

## Architecture

Clean Architecture, 4 projects under `src/`:

| Project | Responsibility |
|---------|----------------|
| `DVC.Domain` | Entities (`BaseEntity`, enums, `IAuditableEntity`) — no dependencies |
| `DVC.Application` | Services, DTOs, abstractions (`IAppDbContext`, `IIdentityService`, `ICurrentUser`), FluentValidation |
| `DVC.Infrastructure` | `AppDbContext` (EF Core, snake_case), entity configs, DainnUser adapters, seeders, audit interceptor |
| `DVC.Api` | Controllers, JWT auth, CORS, exception middleware, Swagger |

### Identity / auth
The user/auth module is built on the **DainnUser** NuGet library (`DainnUser.Core/.Application/.Infrastructure` v1.0.2), isolated behind `IIdentityService` / `IUserAdminService` (only `DVC.Infrastructure/Identity/*Adapter.cs` reference DainnUser — swap those files to replace it). DainnUser owns the `Users`/`Roles`/`UserRoles` tables (PascalCase); our domain tables are snake_case in the same database. JWT bearer; roles `citizen` / `officer` / `admin` / `super`.

### Administrative units
2-tier (Province → Ward) per Vietnam's 2025 reform, seeded from `https://provinces.open-api.vn/api/v2/?depth=2` (34 provinces, ~3300 wards).

## Prerequisites

- .NET 8 SDK
- Docker (for PostgreSQL + a dev SMTP sink)

## Run locally

```bash
# 1. PostgreSQL
docker run -d --name dvc-postgres \
  -e POSTGRES_USER=dvc -e POSTGRES_PASSWORD=dvc_dev_pw -e POSTGRES_DB=dvc \
  -p 5432:5432 postgres:16

# 2. Mailpit (DainnUser sends a verification email on register; this catches it)
docker run -d --name dvc-mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit

# 3. Run the API (auto-creates/migrates schema, seeds roles + geo + feedback categories on startup)
cd src/DVC.Api
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

Swagger: http://localhost:5134/swagger · Mailpit UI: http://localhost:8025

Config lives in `src/DVC.Api/appsettings.Development.json` (`ConnectionStrings:Default`, the `DainnUser:` section, `Geo:`). For non-Development environments you must supply the same keys.

### Bootstrap an admin

Register a user, then grant the `super` role (no admin exists yet to do it via the API):

```bash
curl -X POST http://localhost:5134/api/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"admin@dvc.local","username":"admin","password":"P@ssw0rd123!"}'

docker exec dvc-postgres psql -U dvc -d dvc -c \
 "INSERT INTO \"UserRoles\" (\"UserId\",\"RoleId\",\"AssignedAt\") \
  SELECT u.\"Id\", r.\"Id\", now() FROM \"Users\" u, \"Roles\" r \
  WHERE u.\"Email\"='admin@dvc.local' AND r.\"Name\"='super';"
```

Then `POST /api/auth/login` and use the returned `accessToken` as a bearer token. Thereafter assign roles via `POST /api/admin/users/{id}/roles`.

## API surface

| Area | Routes |
|------|--------|
| Auth | `POST /api/auth/{register,login,refresh,logout}`, `GET /api/auth/me` |
| Geo (public) | `GET /api/provinces`, `GET /api/provinces/{code}/wards` |
| Catalog (public read / admin write) | `GET /api/service-categories`, `GET /api/public-services[/{id}]`, `POST|PUT|DELETE /api/admin/...` |
| Service points | `GET /api/service-points[/{id}]`, admin CRUD + `/images`, `GET|POST /api/service-points/{id}/ratings` |
| Feedback (citizen) | `POST /api/feedback`, `GET /api/feedback/{mine,{id}}`, `/attachments`, `/comments`, `GET /api/feedback/categories` |
| Feedback (officer) | `GET /api/manage/feedback`, `/{id}/{assign,status,comments}` |
| Service requests (citizen) | `POST /api/service-requests`, `GET .../{mine,{id}}`, `/documents`, `/cancel`, `POST .../{id}/rating` |
| Service requests (officer) | `GET /api/manage/service-requests`, `/{id}/{assign,status,request-supplement}` |
| Notifications | `GET /api/notifications`, `/{id}/read`, `/read-all` |
| Admin | `GET /api/admin/users`, role/lock ops, `/api/admin/officers`, `GET /api/admin/audit-logs` (super) |

Status workflows are enforced (`FeedbackWorkflow` / `RequestWorkflow`); illegal transitions return `409`. All writes to auditable entities are recorded in `audit_logs` (JSONB old/new) by an EF `SaveChanges` interceptor.

## Migrations

```bash
dotnet ef migrations add <Name> -p src/DVC.Infrastructure -s src/DVC.Api -c AppDbContext -o Persistence/Migrations
```

`AppDbContext` migrations are applied automatically at startup; the DainnUser identity schema is created via `EnsureCreated` (its shipped migration has a Postgres seed bug).

## Tests

`tests/DVC.Tests` is wired for xUnit + Testcontainers.PostgreSql (integration tests via `WebApplicationFactory`). Run with `dotnet test`.
