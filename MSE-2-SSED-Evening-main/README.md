# Mid-Semester Examination – Software Engineering and DevOps
## Set 2 – Evening Shift

**Practical Examination: Docker, Docker Compose, Docker Hub and CI/CD**

---

## 1. Examination Details

| Particular | Details |
|---|---|
| Subject | Software Engineering and DevOps |
| Examination | Mid-Semester Examination – 2 |
| Set | Set 2 – Evening Shift |
| Repository | [MSE-2-SSED-Evening](https://github.com/atindeRR/MSE-2-SSED-Evening) |
| Submission Mode | GitHub Pull Request + PDF on Moodle |

---

## 2. Problem Statement

You are required to containerize and deploy the provided full-stack application using Docker and Docker Compose.

Your task is to create optimized Docker images for the frontend and backend, configure container networking, implement health checks, manage persistent database storage, publish Docker images to Docker Hub, and implement an automated CI/CD pipeline using GitHub Actions.

The final application must run successfully using the published Docker images without requiring the frontend or backend source code to be built on the deployment machine.

**Important:** You must implement the solution independently. Merely copying configurations without understanding their functionality may affect your practical evaluation and viva.

---

## 3. Repository Setup

1. Open the examination repository:

   https://github.com/atindeRR/MSE-2-SSED-Evening

2. Fork the repository into your personal GitHub account.

3. Clone your forked repository:

   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/MSE-2-SSED-Evening.git
   cd MSE-2-SSED-Evening
   ```

4. Configure Git with your details if required.

5. Perform all implementation and testing in your forked repository.

---

## 4. Implementation Requirements

### Task 1: Optimized Dockerfiles

Create Dockerfiles for both frontend and backend.

**Frontend Dockerfile requirements:**

- Implement a multi-stage Docker build.
- Use a Node.js image for the build stage.
- Use Nginx or another suitable lightweight web server for the production runtime.
- Copy only the required production build artifacts into the final image.
- Expose the appropriate application port.
- Ensure the frontend application runs successfully.

**Backend Dockerfile requirements:**

- Use an appropriate Node.js base image.
- Install only the required dependencies.
- Avoid copying unnecessary files into the image.
- Use a production-oriented configuration.
- Expose the backend application port.
- Ensure the backend starts successfully.

**Deliverable:** Two working and optimized Dockerfiles.

### Task 2: Docker Compose – Networking and Health Checks

Create a `docker-compose.yml` file to run the complete application.

Your Compose configuration must include:

- Frontend service.
- Backend service.
- PostgreSQL service.
- Redis service.
- A custom Docker network.
- A named volume for PostgreSQL data.
- Appropriate health checks for PostgreSQL, Redis and backend.
- Proper service dependencies using health conditions wherever applicable.
- Environment variables for service configuration.

Additional requirements:

1. The backend must communicate with PostgreSQL and Redis using their Docker Compose service names.
2. The frontend must communicate with the backend successfully.
3. PostgreSQL and Redis should not unnecessarily expose their ports to the host machine.
4. Containers must communicate through the custom Docker network.
5. Database data must persist even when the PostgreSQL container is removed and recreated.

### Task 3: Docker Hub Image Publishing

Build and publish your frontend and backend Docker images to your personal Docker Hub account.

Use the following naming convention:

**Frontend:**

```text
YOUR_DOCKERHUB_USERNAME/frontend:v1
YOUR_DOCKERHUB_USERNAME/frontend:latest
```

**Backend:**

```text
YOUR_DOCKERHUB_USERNAME/backend:v1
YOUR_DOCKERHUB_USERNAME/backend:latest
```

Requirements:

- Create the required repositories on Docker Hub.
- Build the Docker images.
- Tag each image with both `v1` and `latest`.
- Push all four image tags to Docker Hub.
- Verify that the images are available in your Docker Hub account.

### Task 4: Image-Based Deployment

Create a separate file named:

```text
docker-compose.deploy.yml
```

This file must deploy the application using the images published on Docker Hub.

Requirements:

- Use the published frontend and backend Docker Hub images.
- Use the `latest` tag for deployment.
- Do not use `build:` for frontend and backend services.
- Use official PostgreSQL and Redis images.
- Configure the custom network.
- Configure PostgreSQL persistent storage using a named volume.
- Include appropriate health checks and service dependencies.
- Ensure all application services start and communicate successfully.

Run the deployment using:

```bash
docker compose -f docker-compose.deploy.yml up -d
```

Verify that the application is accessible and working.

### Task 5: Networking and Persistence Verification

Demonstrate and verify the following:

1. Frontend can communicate with the backend.
2. Backend can resolve and connect to PostgreSQL using the service name.
3. Backend can resolve and connect to Redis using the service name.
4. PostgreSQL data remains available after the PostgreSQL container is removed and recreated.
5. Redis service can be restarted successfully.
6. Health checks correctly report the status of the relevant services.

You must capture screenshots or terminal outputs demonstrating these tests.

### Task 6: GitHub Actions CI/CD Pipeline

Create a GitHub Actions workflow:

```text
.github/workflows/cd.yml
```

The workflow must execute automatically whenever code is pushed to the `main` branch.

Your pipeline must perform the following stages:

1. Checkout the source code.
2. Set up the Docker build environment.
3. Build the frontend Docker image.
4. Build the backend Docker image.
5. Authenticate with Docker Hub using GitHub Secrets.
6. Tag both images with `v1` and `latest`.
7. Push all image tags to Docker Hub.
8. Deploy the application using `docker-compose.deploy.yml`.
9. Verify that the application and required services are running successfully.

**Required GitHub Secrets:**

Configure the following secrets in your forked repository under:

`Settings → Secrets and variables → Actions → New repository secret`

| Secret Name | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Your Docker Hub access token |
| `POSTGRES_PASSWORD` | Password for PostgreSQL |

Do not hardcode credentials or access tokens in your source code or workflow files.

**Important:** Your pipeline must complete successfully. Capture screenshots of the completed workflow stages.

---

## 5. GitHub Pull Request Submission

After completing the implementation:

1. Commit and push all your changes to your forked repository.
2. Create a Pull Request from your fork to the original examination repository.
3. Target the `main` branch of the original repository.
4. Ensure your Pull Request contains all required implementation files.
5. Verify that the instructor's CI pipeline executes on your Pull Request.

Use the following Pull Request title format:

```text
DOCKER-SET-2 | ROLL-NUMBER | STUDENT-NAME | SECTION
```

**Example:**

```text
DOCKER-SET-2 | 123456 | Rahul Sharma | AIML-A
```

Do not submit an empty Pull Request. All implementation files must be committed before submission.

---

## 6. Mandatory PDF Documentation

Every student must prepare a PDF document containing the implementation details and evidence of successful execution.

**PDF filename format:**

```text
ROLL_NUMBER_STUDENT_NAME_SET2.pdf
```

Your PDF must contain the following information:

### A. Student Information

- Student Name
- Roll Number
- Section
- Branch
- GitHub Username
- Docker Hub Username

### B. Repository and Submission Details

- GitHub Fork Repository URL
- GitHub Pull Request URL
- Branch Name
- Docker Hub Frontend Image URL
- Docker Hub Backend Image URL
- GitHub Actions Workflow Run URL

### C. Implementation Evidence

Include screenshots demonstrating:

1. Frontend Docker image build.
2. Backend Docker image build.
3. Docker Compose services running.
4. Custom Docker network configuration.
5. PostgreSQL and Redis health checks.
6. PostgreSQL data persistence verification.
7. Docker Hub repositories containing `v1` and `latest` tags.
8. Successful image-based deployment using `docker-compose.deploy.yml`.
9. Frontend and backend application working successfully.
10. GitHub Actions CI/CD pipeline with all required stages passed.
11. Successful instructor CI checks on your Pull Request, wherever available.

### D. Declaration

Include the following declaration at the end of your PDF:

> I hereby declare that the submitted implementation has been completed by me. I have tested the Docker configurations, Docker Compose deployment, Docker Hub image publishing and GitHub Actions CI/CD pipeline. The screenshots and evidence included in this document represent my actual implementation.

**Submission Instructions:**

- Upload the completed PDF to Moodle.
- Attach the same PDF to your GitHub Pull Request.
- Ensure all URLs are accessible and point to your actual submissions.

---

## 7. Important Instructions

1. Every student must work on their own forked repository.
2. Use your personal GitHub and Docker Hub accounts.
3. Do not share GitHub or Docker Hub access tokens.
4. Do not hardcode passwords or credentials in the repository.
5. Ensure that all Docker images are pushed successfully to Docker Hub.
6. Ensure the deployment works using Docker Hub images rather than local builds.
7. All required GitHub Actions stages must pass.
8. The Pull Request must be created against the original examination repository.
9. PDF documentation is mandatory.
10. Screenshots must be genuine and should represent your actual implementation.
11. Be prepared to explain your Dockerfiles, Docker networking, volumes, health checks and CI/CD workflow during the viva.

**Incomplete implementations, missing screenshots, incorrect Docker Hub image links or missing PDF documentation may affect your practical evaluation.**

---

## 8. Final Submission Checklist

Before submitting, verify the following:

- [ ] Repository forked successfully.
- [ ] Frontend Dockerfile implemented using multi-stage build.
- [ ] Backend Dockerfile implemented.
- [ ] `docker-compose.yml` configured.
- [ ] Custom Docker network created.
- [ ] PostgreSQL named volume configured.
- [ ] Required health checks implemented.
- [ ] Frontend and backend images built successfully.
- [ ] Both `v1` and `latest` tags pushed to Docker Hub.
- [ ] `docker-compose.deploy.yml` uses published images.
- [ ] Image-based deployment tested successfully.
- [ ] Networking and persistence verified.
- [ ] GitHub Actions CD workflow executed successfully.
- [ ] Pull Request created against the original repository.
- [ ] Instructor CI checks passed, wherever available.
- [ ] PDF documentation prepared with all required screenshots.
- [ ] PDF uploaded to Moodle.
- [ ] PDF attached to the GitHub Pull Request.

**Good Luck!**