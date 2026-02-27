# Cyber Knights -- Next-Gen APK Upload and Threat Analysis Platform

## System Specification Document

------------------------------------------------------------------------

# 1. System Overview

Cyber Knights is a cloud-based web cybersecurity platform designed to
perform pre-installation static analysis of Android APK files and URLs.

The system detects threats by: - Analyzing dangerous permissions -
Performing malware signature matching - Extracting embedded URLs -
Detecting suspicious API usage - Computing a transparent weighted risk
score

------------------------------------------------------------------------

# 2. System Architecture

User → React Frontend → Node.js Backend → Analysis Engine → Supabase
Database → Risk Engine → Report Generation

------------------------------------------------------------------------

# 3. Technology Stack

## Frontend

-   Vite + React
-   HTML5
-   CSS3
-   JavaScript (ES6+)
-   Axios / Fetch API
-   React Router

## Backend

-   Node.js (JavaScript)
-   Express.js
-   REST API Architecture

## Database

-   Supabase (PostgreSQL-based)

## Authentication

-   Supabase Authentication
-   JWT-based session management

## Storage

-   Supabase Storage

------------------------------------------------------------------------

# 4. Functional Specification

## 4.1 User Management

-   Register/Login using Supabase Auth
-   JWT validation
-   Role-based access control

## 4.2 APK Analysis Module

The system shall: - Accept only .apk files - Validate file type and
size - Extract AndroidManifest.xml - Count dangerous permissions (P) -
Generate SHA-256 hash - Compare with malware signature database (M) -
Extract embedded URLs (U) - Detect suspicious APIs (A)

## 4.3 Risk Engine

Risk Formula:

R = (P × 5) + (M × 40) + (U × 10) + (A × 8)

Risk Classification: - 0--30 → Safe - 31--60 → Medium Risk - 61--100 →
High Risk

------------------------------------------------------------------------

# 5. Non-Functional Requirements

## Performance

-   Scan time ≤ 15 seconds
-   Efficient memory usage
-   Support concurrent users

## Security

-   HTTPS encryption
-   Input sanitization
-   Rate limiting
-   Secure JWT validation

## Scalability

-   Cloud-native architecture
-   Supabase auto-scaling
-   Docker-ready backend

------------------------------------------------------------------------

# 6. Database Schema (Supabase PostgreSQL)

## Users (Supabase Auth Managed)

-   id (UUID)
-   email
-   role
-   created_at

## Scan_Reports

-   report_id
-   user_id
-   file_hash
-   permission_count
-   malware_match
-   url_count
-   api_count
-   risk_score
-   classification
-   timestamp

## Malware_Signatures

-   signature_id
-   sha256_hash
-   threat_name

------------------------------------------------------------------------

# 7. Deployment

Frontend: Vercel / Netlify\
Backend: Render / Railway / AWS\
Database/Auth/Storage: Supabase Cloud

------------------------------------------------------------------------

# 8. Constraints

-   Static analysis only
-   Signature database dependent
-   No dynamic sandbox execution (future enhancement)

------------------------------------------------------------------------

# 9. Future Enhancements

-   Machine Learning integration
-   Dynamic sandbox analysis
-   Explainable AI dashboard
-   Enterprise analytics support

------------------------------------------------------------------------

# 10. Conclusion

Cyber Knights is a scalable, secure, cloud-ready static APK analysis
platform built using:

-   Vite + React (Frontend)
-   Node.js (Backend)
-   Supabase (Database, Authentication, Storage)

The system is suitable for academic research, hackathons, and enterprise
cybersecurity deployment.
