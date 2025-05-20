# Server Information

## Server Details
- **Name**: ubuntu-s-1vcpu-1gb-syd1-01
- **Type**: Ubuntu 24.10 x64
- **Region**: SYD1
- **Resources**: 1 vCPU, 1GB RAM, 25GB Disk ($6/mo)
- **IP Address**: 134.199.160.11
- **Private IP**: 10.126.0.2
- **VPC**: default-syd1

## Application Access
- **Frontend**: [http://134.199.160.11:3001](http://134.199.160.11:3001)
- **Backend API**: [http://134.199.160.11:8080](http://134.199.160.11:8080)
- **Database**: PostgreSQL on port 5432 (accessible within Docker network)

## Docker Services
1. **PostgreSQL Database**
   - Container name: property_postgres
   - Port: 5432
   - Credentials:
     - Database: property_db
     - Username: property_user
     - Password: property_pass

2. **Spring Boot Backend**
   - Container name: property_backend
   - Port: 8080
   - Health check: http://localhost:8080/actuator/health

3. **React Frontend**
   - Container name: property_frontend
   - Port: 3001
   - Environment: 
     - API URL: http://134.199.160.11:8080

## Network Configuration
- All services are connected via Docker's internal network
- The frontend connects to the backend using the server's public IP
- The backend connects to the database using the Docker service name 'postgres'

## Deployment
Run the deployment script to start all services:
```bash
./deploy.sh
```

## Monitoring
- View logs: `docker-compose logs -f`
- Check container status: `docker-compose ps` 