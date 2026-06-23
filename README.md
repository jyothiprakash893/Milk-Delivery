# Milk Delivery Management System

> A full-stack microservices-based milk delivery management system for daily tracking, billing, and payments.

**Developer:** Jyothi Prakash (jyothiprakash893)

## Architecture

```
frontend (React 18) ──> api-gateway (Spring Cloud Gateway :8080)
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
 auth-service  customer-service  delivery-service  billing-service  payment-service  notification-service
 (:8081)          (:8082)           (:8083)           (:8084)           (:8085)           (:8086)
       │              │               │                │                 │                  │
       ▼              ▼               ▼                ▼                 ▼                  ▼
    users_db      customers_db    deliveries_db    billing_db        payments_db       Kafka/Redis
       │              │               │                │                 │                  │
       └──────────────┴───────────────┴────────────────┴─────────────────┴──────────────────┘
                                        │
                              eureka-server (:8761)
                              config-server (:8888)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router 6, React Query, Axios, Bootstrap 5, Recharts, React Hook Form, React Toastify |
| **Backend** | Java 17, Spring Boot 3, Spring Security 6, JWT (jjwt), Spring Cloud Gateway, Eureka, Config Server |
| **Database** | MySQL 8, Redis 7, Spring Data JPA + Hibernate |
| **Messaging** | Apache Kafka (async events) |
| **Infra** | Docker Compose, Kubernetes, Prometheus, Grafana |
| **CI/CD** | GitHub Actions |

## Services

| Service | Port | Description |
|---------|------|-------------|
| Eureka Server | 8761 | Service discovery |
| Config Server | 8888 | Centralized configuration |
| API Gateway | 8080 | Single entry point with JWT validation |
| Auth Service | 8081 | JWT login/register/logout/refresh |
| Customer Service | 8082 | Customer CRUD management |
| Delivery Service | 8083 | Daily delivery tracking |
| Billing Service | 8084 | Monthly bill auto-generation + PDF |
| Payment Service | 8085 | Payment collection & tracking |
| Notification Service | 8086 | WhatsApp/SMS/Email alerts |
| Frontend | 3000 | React UI |

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- MySQL 8

### Run with Docker
```bash
# Clone and start all services
docker-compose up -d

# Frontend: http://localhost:3000
# API Gateway: http://localhost:8080
# Eureka Dashboard: http://localhost:8761
```

### Run locally (development)

**Backend:**
```bash
# Start Eureka Server first
cd eureka-server
mvn spring-boot:run

# Start Config Server
cd ../config-server
mvn spring-boot:run

# Start Auth Service
cd ../auth-service
mvn spring-boot:run

# Start other services in any order
cd ../api-gateway
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/logout` | Logout (blacklist token) |
| POST | `/api/auth/refresh` | Refresh access token |

### Customers (`/api/customers`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers/all` | All customers (ADMIN) |
| GET | `/api/customers/active` | Active customers |
| POST | `/api/customers/add` | Add customer (ADMIN) |
| GET | `/api/customers/{id}` | Get by ID |
| PUT | `/api/customers/{id}` | Update (ADMIN) |
| DELETE | `/api/customers/{id}` | Delete (ADMIN) |

### Deliveries (`/api/deliveries`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deliveries/today` | Today's list (ADMIN) |
| PUT | `/api/deliveries/mark/{custId}` | Mark delivered (ADMIN) |
| PUT | `/api/deliveries/skip/{custId}` | Mark skipped (ADMIN) |
| GET | `/api/deliveries/history/{id}` | Delivery history |
| GET | `/api/deliveries/report/{month}/{year}` | Monthly report |

### Billing (`/api/billing`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/billing/generate/{month}/{year}` | Generate bills (ADMIN) |
| GET | `/api/billing/all/{month}/{year}` | All bills for month |
| GET | `/api/billing/customer/{id}` | Customer bills |
| GET | `/api/billing/unpaid` | Unpaid bills |
| GET | `/api/billing/pdf/{billId}` | Download PDF |

### Payments (`/api/payments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/collect` | Record payment (ADMIN) |
| GET | `/api/payments/history/{custId}` | Payment history |
| GET | `/api/payments/outstanding` | Outstanding dues |

## Frontend Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login (Admin + Customer) |
| `/register` | Public | Customer self-registration |
| `/dashboard` | Admin | Metrics, charts, stats |
| `/customers` | Admin | Customer list, CRUD |
| `/customers/add` | Admin | Add customer form |
| `/deliveries` | Admin | Mark delivered/skipped |
| `/billing` | Admin | Generate & view bills |
| `/payments` | Admin | Record payments |
| `/notifications` | Admin | Send alerts |
| `/reports` | Admin | Charts & exports |
| `/my-deliveries` | Customer | My delivery history |
| `/my-bills` | Customer | My bills |
| `/my-payments` | Customer | My payments |

## Database Schema

5 MySQL databases:
- **users_db** — User accounts and roles
- **customers_db** — Customer profiles
- **deliveries_db** — Daily delivery records
- **billing_db** — Monthly bills
- **payments_db** — Payment records

Monthly bill formula:
```
Total Bill = Σ (quantity × price_per_litre) for each delivered day
```

## Kafka Events

| Topic | Producer | Consumer(s) |
|-------|----------|-------------|
| `delivery-marked` | delivery-service | billing-service |
| `bill-generated` | billing-service | notification-service |
| `payment-received` | payment-service | billing-service |

## Project Structure

```
milk-web/
├── database/              # MySQL schemas & init scripts
├── eureka-server/         # Service discovery
├── config-server/         # Central config
├── api-gateway/           # API gateway + JWT filter
├── auth-service/          # Authentication & authorization
├── customer-service/      # Customer management
├── delivery-service/      # Daily deliveries
├── billing-service/       # Monthly billing + PDF
├── payment-service/       # Payment processing
├── notification-service/  # Notifications
├── frontend/              # React SPA
├── k8s/                   # Kubernetes manifests
├── prometheus/            # Monitoring config
└── .github/workflows/     # CI/CD pipeline
```

## License

MIT
