# 🍔 AWS Three-Tier Online Ordering Application

A simple **three-tier online food ordering application** deployed on AWS using **Docker, Amazon ECR, ECS Fargate, Application Load Balancer, Amazon RDS MySQL, and GitHub Actions**.

The project demonstrates containerization, AWS networking, CI/CD, security groups, load balancing, and database integration.

---

## 🏗️ Architecture

```text
                         INTERNET
                            |
                            v
                    Application Load
                       Balancer
                            |
                 +----------+----------+
                 |                     |
                 v                     v
           Frontend Service      Backend Service
            ECS Fargate            ECS Fargate
                                      |
                                      |
                                      v
                                  RDS MySQL


                       CI/CD Pipeline

Developer
    |
    v
  GitHub
    |
    v
GitHub Actions
    |
    +------ Docker Build
    |
    +------ Push Image
    |
    v
   ECR
    |
    v
ECS Fargate
```

---

## 🎯 Project Objective

The objective of this project is to deploy a simple online ordering application using AWS managed services.

The application consists of:

* Frontend application
* Backend REST API
* MySQL database
* Containerized workloads
* Application Load Balancer
* CI/CD pipeline

---

## 🛠️ Technologies Used

| Technology                | Purpose                          |
| ------------------------- | -------------------------------- |
| AWS EC2                   | Administration / build machine   |
| AWS VPC                   | Networking                       |
| ECS Fargate               | Container execution              |
| Amazon ECR                | Docker image registry            |
| Application Load Balancer | Traffic distribution             |
| Amazon RDS MySQL          | Database                         |
| IAM                       | Authentication and authorization |
| GitHub                    | Source code management           |
| GitHub Actions            | CI/CD                            |
| Docker                    | Containerization                 |
| Node.js                   | Backend                          |
| Express.js                | REST API                         |
| Nginx                     | Frontend web server              |
| MySQL                     | Database                         |

---

# 📁 Project Structure

```text
ordering-app/
│
├── frontend/
│   ├── index.html
│   └── Dockerfile
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
└── README.md
```

---

# 🖥️ Application

The application provides a simple food ordering interface.

Example products:

```text
Burger     ₹150
Pizza      ₹250
Biryani    ₹200
```

Users can:

1. View available products
2. Select a product
3. Place an order
4. Receive an order ID

---

# 🔌 Backend APIs

## Health Check

```http
GET /health
```

Example:

```bash
curl http://<ALB-DNS>/health
```

---

## Get Products

```http
GET /api/products
```

Example:

```bash
curl http://<ALB-DNS>/api/products
```

Example response:

```json
[
  {
    "id": 1,
    "name": "Burger",
    "price": 150
  },
  {
    "id": 2,
    "name": "Pizza",
    "price": 250
  },
  {
    "id": 3,
    "name": "Biryani",
    "price": 200
  }
]
```

---

## Place Order

```http
POST /api/orders
```

Example:

```bash
curl -X POST \
  http://<ALB-DNS>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":1}'
```

Example response:

```json
{
  "message": "Order placed successfully",
  "orderId": 1
}
```

---

# 🐳 Docker

Both frontend and backend are containerized.

## Backend

Build:

```bash
docker build -t ordering-backend ./backend
```

Run:

```bash
docker run -d \
  --name ordering-backend \
  -p 8080:8080 \
  ordering-backend
```

Test:

```bash
curl http://localhost:8080/health
```

---

## Frontend

Build:

```bash
docker build -t ordering-frontend ./frontend
```

Run:

```bash
docker run -d \
  --name ordering-frontend \
  -p 8081:80 \
  ordering-frontend
```

Access:

```text
http://localhost:8081
```

---

# ☁️ AWS Architecture

## ECS Fargate

Two ECS services are deployed:

```text
ordering-frontend
ordering-backend
```

Each service runs its own container.

Example:

```text
ECS Cluster
│
├── ordering-frontend
│      └── Fargate Task
│
└── ordering-backend
       └── Fargate Task
```

---

# 📦 Amazon ECR

Two ECR repositories are used:

```text
ordering-frontend
ordering-backend
```

Docker images are built and pushed to ECR.

Example:

```bash
aws ecr get-login-password \
  --region ap-south-1 |
docker login \
  --username AWS \
  --password-stdin \
  <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
```

Push backend:

```bash
docker push \
  <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/ordering-backend:latest
```

Push frontend:

```bash
docker push \
  <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/ordering-frontend:latest
```

---

# ⚖️ Application Load Balancer

The Application Load Balancer receives internet traffic.

Routing:

```text
ALB
│
├── /          → Frontend Target Group
│
└── /api/*     → Backend Target Group
```

Example:

```text
http://<ALB-DNS>/
```

goes to the frontend.

```text
http://<ALB-DNS>/api/products
```

goes to the backend.

---

# 🗄️ Amazon RDS

The database uses:

```text
Amazon RDS MySQL
```

Database:

```text
ordering
```

Tables:

```text
products
orders
```

Example `products` table:

```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2)
);
```

Example `orders` table:

```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    status VARCHAR(50)
);
```

---

# 🔐 Security Groups

Traffic is restricted between application tiers.

```text
Internet
    |
    | TCP 80
    v
 ALB-SG
    |
    +----------+
    |          |
    | TCP 80   | TCP 8080
    v          v
Frontend-SG  Backend-SG
                |
                | TCP 3306
                v
              RDS-SG
```

### ALB Security Group

Allows:

```text
TCP 80 from Internet
```

### Frontend Security Group

Allows:

```text
TCP 80 from ALB-SG
```

### Backend Security Group

Allows:

```text
TCP 8080 from ALB-SG
```

### RDS Security Group

Allows:

```text
TCP 3306 from Backend-SG
```

The database should not be directly exposed to the internet.

---

# 🔄 CI/CD Pipeline

GitHub Actions automates the deployment.

```text
Developer
    |
    | git push
    v
GitHub
    |
    v
GitHub Actions
    |
    +---- Checkout
    |
    +---- Docker Build
    |
    +---- ECR Login
    |
    +---- Push Docker Image
    |
    +---- Update ECS Service
    |
    v
ECS Fargate
```

---

# 🔑 GitHub OIDC

GitHub Actions uses **OIDC** to authenticate with AWS.

The pipeline does not need long-lived AWS access keys stored in GitHub.

```text
GitHub Actions
      |
      | OIDC
      v
AWS IAM Role
      |
      +---- ECR
      |
      +---- ECS
```

GitHub repository secret:

```text
AWS_ROLE_ARN
```

---

# 🚀 Deployment Process

When code is pushed to the `main` branch:

```text
1. Developer pushes code
        ↓
2. GitHub Actions starts
        ↓
3. Source code is checked out
        ↓
4. AWS authentication through OIDC
        ↓
5. Docker images are built
        ↓
6. Images are pushed to ECR
        ↓
7. ECS services are updated
        ↓
8. New Fargate tasks are started
        ↓
9. ALB health checks the tasks
        ↓
10. Application serves the new version
```

---

# 🧪 Testing

## Check Backend

```bash
curl http://<ALB-DNS>/api/products
```

## Check Order API

```bash
curl -X POST \
  http://<ALB-DNS>/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":1}'
```

## Check ECS

```bash
aws ecs describe-services \
  --cluster ordering-cluster \
  --services ordering-frontend ordering-backend
```

## Check ALB Target Health

```bash
aws elbv2 describe-target-health \
  --target-group-arn <TARGET_GROUP_ARN>
```

Expected:

```text
healthy
```

---

# 📊 Application Flow

When a customer views products:

```text
Browser
   |
   v
ALB
   |
   | /api/products
   v
Backend Fargate
   |
   v
RDS MySQL
   |
   v
Products
   |
   v
Backend
   |
   v
Browser
```

When a customer places an order:

```text
Browser
   |
   v
ALB
   |
   v
Backend Fargate
   |
   | INSERT
   v
RDS MySQL
   |
   v
Order ID
   |
   v
Browser
```

---

# 🔒 Security Considerations

The project uses:

* IAM roles instead of hard-coded AWS credentials
* GitHub OIDC authentication
* Security groups between tiers
* RDS without direct public access
* ECS Fargate instead of managing EC2 servers for application containers
* ECR for private Docker image storage

For production, the following improvements should be added:

* AWS Secrets Manager for database credentials
* Private subnets for ECS tasks
* HTTPS using ACM
* Route 53
* AWS WAF
* CloudWatch alarms
* ECS Service Auto Scaling
* RDS Multi-AZ
* RDS automated backups
* Least-privilege IAM policies
* Immutable Docker image tags
* Vulnerability scanning using Trivy

---

# 📈 Future Improvements

Possible improvements:

```text
Route 53
    |
    v
ACM / HTTPS
    |
    v
ALB
    |
    v
ECS Fargate
    |
    +---- Auto Scaling
    |
    +---- CloudWatch
    |
    v
RDS Multi-AZ
```

CI/CD can also be enhanced with:

```text
GitHub Actions
      |
      +---- Unit Tests
      |
      +---- Docker Build
      |
      +---- Trivy Scan
      |
      +---- ECR
      |
      +---- ECS Deployment
      |
      +---- Deployment Verification
```

---

# 💰 Cost Considerations

This project uses several AWS resources that can incur charges, including:

* ECS Fargate
* Application Load Balancer
* RDS
* ECR storage
* CloudWatch
* NAT Gateway if added later

Resources should be stopped or deleted when they are no longer required.

---

# 🧹 Cleanup

Before deleting resources, verify that the project is no longer needed.

Example ECS cleanup:

```bash
aws ecs update-service \
  --cluster ordering-cluster \
  --service ordering-frontend \
  --desired-count 0
```

```bash
aws ecs update-service \
  --cluster ordering-cluster \
  --service ordering-backend \
  --desired-count 0
```

Remove RDS:

```bash
aws rds delete-db-instance \
  --db-instance-identifier ordering-db \
  --skip-final-snapshot
```

Delete ECS services:

```bash
aws ecs delete-service \
  --cluster ordering-cluster \
  --service ordering-frontend
```

```bash
aws ecs delete-service \
  --cluster ordering-cluster \
  --service ordering-backend
```

Additional AWS resources such as the ALB, target groups, security groups, ECR repositories, and IAM roles should also be removed when the project is completely finished.

---

# 🎤 Interview Explanation

### Project Summary

> I built a three-tier online ordering application on AWS. The frontend and backend were containerized using Docker and deployed as separate ECS Fargate services. An Application Load Balancer handled incoming traffic and used path-based routing to send `/api/*` requests to the backend service. The backend connected to Amazon RDS MySQL for persistent data. Docker images were stored in Amazon ECR. GitHub Actions automated the CI/CD pipeline, and GitHub OIDC was used to securely authenticate with AWS without storing long-lived AWS access keys.

### Why Fargate?

> Fargate provides serverless container execution, so I don't need to manage the underlying EC2 instances for the application containers.

### Why ALB?

> ALB provides HTTP/HTTPS load balancing, health checks, and path-based routing between the frontend and backend services.

### Why ECR?

> ECR provides private storage and version management for the Docker images used by ECS.

### Why RDS?

> RDS provides managed MySQL with automated infrastructure management, backups and database operations.

### Why GitHub OIDC?

> OIDC allows GitHub Actions to assume an AWS IAM role using short-lived credentials instead of storing long-lived AWS access keys.

---

# 👨‍💻 Author

**DevOps / Cloud Engineering Project**

Technologies:

```text
AWS
Docker
ECS Fargate
ECR
ALB
RDS MySQL
IAM
GitHub Actions
Node.js
Nginx
```
