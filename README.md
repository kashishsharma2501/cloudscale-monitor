CloudScale Monitor

Real-time cloud monitoring and auto-scaling platform built with **React, Flask, AWS ECS Fargate, CloudWatch, and Docker**.

Features
Live CPU & Memory metrics from AWS CloudWatch (5s refresh)
Auto Scaling — 1 to 3 ECS tasks based on CPU load (60% threshold)
Integrated HTTP load testing (Apache Bench)
 Real-time email alerts via AWS SNS
Dockerised and deployed on AWS Fargate
CI/CD pipeline simulation (Code → Docker → ECR → ECS)

Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts |
| Backend | Python Flask, boto3 |
| Cloud | AWS ECS, Fargate, CloudWatch, SNS, ECR |
| Load Testing | Apache Bench |
| Container | Docker |

Architecture
User → React Dashboard → Flask API → AWS (ECS + CloudWatch + SNS)

Live Demo
Deployed on AWS ECS Fargate — ap-south-1 (Mumbai)
