# Property Path - Your Pathway to Property Investment 

A comprehensive property investment platform that provides financial calculators for lead generation and a robust client management system for property brokers.

## 📋 What It Does

### Lead Generation Features
- **Mortgage Calculator**: Interactive calculator helping users estimate monthly repayments with personalised reports
- **Borrowing Capacity Calculator**: Determines maximum borrowing capacity based on income, expenses, and personal circumstances
- **Investment Property Calculators**: Analyses cash flow, ROI, and future property values for investment decisions

### Client Management System
- **Dashboard Analytics**: Visualise client portfolios with interactive charts and graphs
- **Property Portfolio Management**: Track multiple properties, their performance, and projected returns
- **Client Data Management**: Comprehensive client profiles with financial details and investment preferences
- **Property Assignment**: Admin tools to assign properties to specific clients
- **Investment Modelling**: Advanced portfolio projections and scenario analysis

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI (shadcn/ui)
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualisation
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Authentication**: JWT tokens

### Backend
- **Framework**: Spring Boot 3.2.3
- **Language**: Java 17
- **Database**: PostgreSQL 15
- **ORM**: Spring Data JPA
- **Security**: Spring Security with JWT
- **Database Migration**: Flyway
- **Build Tool**: Maven
- **Monitoring**: Spring Boot Actuator with Prometheus metrics

### DevOps & Infrastructure
- **Containerisation**: Docker & Docker Compose
- **Database**: PostgreSQL in Docker container
- **Reverse Proxy**: Nginx (for frontend)
- **Server**: Ubuntu 24.10 x64 (1 vCPU, 1GB RAM)
- **Region**: Sydney (SYD1)
- **Monitoring**: Docker health checks and service monitoring

## 🌐 Live Application

- **Frontend**: [http://134.199.160.11:3001](http://134.199.160.11:3001)
- **Backend API**: [http://134.199.160.11:8080](http://134.199.160.11:8080)

## 🛠️ Local Development

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm (for frontend development)
- Java 17+ and Maven (for backend development)

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/lachho/property-path.git
   cd property-path
   ```

2. Start all services with Docker:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8080
   - Database: PostgreSQL on localhost:5432

### Development Workflow

#### Frontend Development
```bash
cd front-end
npm install
npm run dev  # Starts development server on http://localhost:5173
```

#### Backend Development
```bash
cd back-end
./mvnw spring-boot:run  # Starts Spring Boot application
```

#### Database Management
```bash
# Reset database
./restart-db.sh

# View logs
docker-compose logs -f postgres
```

## 🚀 Deployment

### Automated Deployment
Use the provided deployment script:

```bash
# Build frontend and deploy
./build-and-deploy.sh --build-frontend

# Deploy without building (if frontend already built)
./build-and-deploy.sh

# Build only (no deployment)
./build-and-deploy.sh --build-frontend --no-deploy
```

### Manual Deployment Steps

1. **Build Frontend** (if needed):
   ```bash
   cd front-end
   npm install
   npm run build
   ```

2. **Deploy with Docker**:
   ```bash
   docker-compose down
   docker-compose build backend
   docker-compose up -d
   ```

3. **Verify Deployment**:
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

## 📊 CI/CD and Dependency Management

### Frontend
- **Package Manager**: npm with `package-lock.json`
- **Note**: If you see `bun.lockb`, delete it as only npm is supported

### Backend
- **Build Tool**: Maven with dependency locking
- **Dependency Locking**: Enabled via `reproducible-build-maven-plugin`
- **Update Lock File**:
  ```bash
  mvn io.github.zlika:reproducible-build-maven-plugin:lock-dependencies
  ```

### Testing
- **Frontend**: Vitest for unit tests
- **Backend**: Spring Boot Test with JUnit 5
- **Note**: Placeholder tests are present to ensure CI passes - replace with real tests during development

## 🗄️ Database Schema

- **Database**: `property_db`
- **User**: `property_user`
- **Key Entities**: Users, Clients, Properties, Portfolios, Leads
- **Migration**: Managed by Flyway

## 📝 Environment Configuration

### Development
Configuration files:
- `.env.development.local` (root)
- `front-end/.env`
- `back-end/.env`

### Production
Environment variables are managed through Docker Compose and service-specific `.env` files.

## 🔍 Monitoring & Health Checks

- **Backend Health**: http://134.199.160.11:8080/actuator/health
- **Container Status**: `docker-compose ps`
- **Service Logs**: `docker-compose logs -f [service_name]`
- **Metrics**: Prometheus metrics available via Spring Boot Actuator

## 🤝 Contributing

1. Ensure all tests pass
2. Follow the existing code style
3. Update documentation as needed
4. Test deployment locally before pushing

## 📁 Project Structure

```
property-path/
├── front-end/          # React application
├── back-end/           # Spring Boot API
├── docker-compose.yml  # Service orchestration
├── build-and-deploy.sh # Deployment automation
├── restart-db.sh       # Database utility
└── server-info.md      # Infrastructure details
```

---

**Repository**: https://github.com/lachho/property-path/