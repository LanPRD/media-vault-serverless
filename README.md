# Media Vault

A personal media storage API built with AWS Serverless, designed to demonstrate
clean architecture patterns and event-driven processing.

**Live Demo:**
[Swagger UI](https://x0mue43gqj.execute-api.sa-east-1.amazonaws.com/docs)

## What is this?

A REST API for uploading, storing, and retrieving media files (images and
videos). Users can upload files directly to S3 via presigned URLs, and the
system automatically generates thumbnails for images.

**What this project is NOT:** A social network, Google Photos clone, or
multi-tenant platform.

## Architecture

### Upload Flow

```
                         1. POST /uploads/presign
┌────────┐          ┌─────────────┐          ┌──────────────────┐
│ Client │ ───────► │ API Gateway │ ───────► │ Lambda           │
└────────┘          └─────────────┘          │ (generateUrl)    │
    │                                        └────────┬─────────┘
    │                                                 │
    │                                                 │ 2. Save metadata
    │                                                 │    (status: uploading)
    │                                                 ▼
    │                                        ┌──────────────────┐
    │                                        │    DynamoDB      │
    │                                        └──────────────────┘
    │                                                 ▲
    │  3. PUT file (presigned URL)                    │
    │                                                 │ 5. Update status
    ▼                                                 │    (status: ready)
┌────────┐  4. S3 Event (ObjectCreated)      ┌────────┴─────────┐
│   S3   │ ────────────────────────────────► │ Lambda           │
│        │                                   │ (processUpload)  │
│        │ ◄──────────────────────────────── │ + thumbnail      │
└────────┘   6. Save thumbnail               └──────────────────┘
```

### Download Flow

```
                         1. GET /files/{id}/download
┌────────┐          ┌─────────────┐          ┌──────────────────┐
│ Client │ ───────► │ API Gateway │ ───────► │ Lambda           │
└────────┘          └─────────────┘          │ (downloadFile)   │
    │                                        └────────┬─────────┘
    │                                                 │
    │                                                 │ 2. Validate ownership
    │                                                 ▼
    │                                        ┌──────────────────┐
    │                                        │    DynamoDB      │
    │                                        └──────────────────┘
    │
    │  3. GET file (presigned URL)
    ▼
┌────────┐
│   S3   │
└────────┘
```

## Tech Stack

- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Serverless Framework
- **AWS Services:** Lambda, API Gateway (HTTP API), S3, DynamoDB
- **Image Processing:** Sharp
- **Testing:** Vitest
- **Documentation:** Swagger/OpenAPI (zod-to-openapi)

## Project Structure

```
src/
├── application/          # Use cases and DTOs
│   ├── dtos/
│   └── use-cases/
├── core/                 # Shared kernel (entities, errors, types)
│   ├── entities/
│   └── errors/
├── domain/               # Business rules
│   ├── entities/
│   ├── repositories/
│   ├── services/
│   └── value-objects/
└── infra/                # External implementations
    ├── database/
    ├── http/
    └── services/
```

The project follows **Clean Architecture** principles with clear separation
between domain logic and infrastructure. **DDD** concepts are applied through
entities, value objects, and repository patterns. Development was done using
**TDD**.

## API Endpoints

| Method | Endpoint                               | Description                   |
| ------ | -------------------------------------- | ----------------------------- |
| POST   | `/auth`                                | Generate JWT token (dev only) |
| POST   | `/uploads/presign`                     | Get presigned URL for upload  |
| GET    | `/files`                               | List user's files (paginated) |
| GET    | `/files/{createdAt}/{fileId}/download` | Get presigned download URL    |

## Architecture Decisions

### Why presigned URLs?

Direct uploads to S3 eliminate Lambda payload limits (6MB) and reduce execution
time. The client uploads directly to S3 after receiving a presigned URL.

### Why DynamoDB?

Pay-per-request pricing fits the access pattern (key-value lookups by userId +
fileId). No connection pooling issues common with RDS in serverless.

### Why async thumbnail processing?

S3 Events trigger a separate Lambda after upload completes. This keeps the
upload flow fast and allows automatic retries on failure.

### Why HTTP API instead of REST API?

~70% cheaper, lower latency, and native JWT authorizer support. REST API
features (API keys, usage plans) weren't needed.

### Why custom JWT instead of Cognito?

Simpler setup for a portfolio project. In production, Cognito would be preferred
for features like MFA and password reset.

## Running Locally

**Prerequisites:** Node.js 20+, Docker (for LocalStack)

```bash
# Install dependencies
npm install

# Start LocalStack (S3 + DynamoDB)
npm run localstack:up

# Start serverless offline
npm run offline

# Run tests
npm test
```

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm test -- --watch
```

Tests are organized in:

- `__tests__/unit/` - Use case tests with mocked dependencies
- `__tests__/integration/` - Handler tests with LocalStack
- `__tests__/fakes/` - Test doubles (repositories, services)

## Deployment

```bash
# Deploy to dev
npm run deploy:dev

# Deploy to production
npm run deploy:prod
```

## What I Learned

- **Presigned URLs** eliminate Lambda payload limits and shift bandwidth costs
  to S3
- **Event-driven architecture** decouples heavy processing from the main request
  flow
- **Single-table DynamoDB design** works well for simple access patterns
- **HTTP API vs REST API** trade-offs: cost savings vs feature availability
- **Clean Architecture** in serverless: adapters make testing and swapping
  implementations easier
