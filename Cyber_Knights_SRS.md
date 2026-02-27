# Cyber Knights -- Next-Gen APK Upload and Threat Analysis Platform

## Software Requirements Specification (SRS)

------------------------------------------------------------------------

# 1. Introduction

## 1.1 Purpose

This document specifies the software requirements for Cyber Knights --
Next-Gen APK Upload and Threat Analysis Platform.

The purpose of the system is to provide a web-based pre-installation
security analysis platform that scans Android APK files and URLs to
detect malware threats, analyze risky permissions, identify malicious
signatures, and generate transparent risk assessment reports.

This SRS is intended for: - Developers - Project evaluators - Academic
reviewers - Security analysts - Cloud deployment engineers

------------------------------------------------------------------------

## 1.2 Scope

Cyber Knights is a cloud-based cybersecurity solution that enables users
to:

-   Upload APK files securely
-   Scan embedded URLs
-   Perform static malware analysis
-   Detect dangerous permissions
-   Compare file hashes against malware signatures
-   Generate explainable risk scores
-   Download structured security reports

The system does NOT: - Replace full antivirus software - Perform dynamic
sandbox execution (future enhancement) - Monitor installed apps on
devices

------------------------------------------------------------------------

## 1.3 Definitions, Acronyms, and Abbreviations

  Term      Description
  --------- ------------------------------------
  APK       Android Package Kit
  SHA-256   Secure Hash Algorithm 256-bit
  API       Application Programming Interface
  ML        Machine Learning
  DoS       Denial of Service
  HTTPS     HyperText Transfer Protocol Secure

------------------------------------------------------------------------

# 2. Overall Description

## 2.1 Product Perspective

Cyber Knights is a standalone web-based SaaS platform deployed on cloud
infrastructure (AWS / GCP).

It integrates: - Web frontend - Backend analysis engine - Malware
signature database - Threat intelligence APIs - Secure relational
database

------------------------------------------------------------------------

## 2.2 Product Functions

The system provides the following core functions:

1.  User registration and login
2.  Secure APK file upload
3.  URL input and scanning
4.  Manifest extraction
5.  Permission risk analysis
6.  Malware signature detection
7.  Embedded URL extraction and verification
8.  Suspicious API detection
9.  Risk score computation
10. Risk classification
11. Report generation (downloadable)
12. Scan history storage
13. Admin monitoring panel

------------------------------------------------------------------------

## 2.3 User Classes

### General User

-   Uploads APK files
-   Views risk reports
-   Downloads reports

### Administrator

-   Monitors logs
-   Updates malware signature database
-   Manages users

------------------------------------------------------------------------

# 3. Functional Requirements

## 3.1 Authentication Module

FR-1: Allow user registration\
FR-2: Encrypt passwords\
FR-3: Authenticate users before uploads\
FR-4: Maintain secure sessions

## 3.2 APK Upload Module

FR-5: Accept only .apk files\
FR-6: Validate file size\
FR-7: Verify MIME type\
FR-8: Reject invalid files

## 3.3 Analysis Modules

FR-9: Extract AndroidManifest.xml\
FR-10: Retrieve permissions\
FR-11: Count dangerous permissions (P)\
FR-12: Generate SHA-256 hash\
FR-13: Compare hash with malware database (M)\
FR-14: Extract embedded URLs (U)\
FR-15: Detect suspicious APIs (A)

## 3.4 Risk Engine

Risk Formula:

R = (P × 5) + (M × 40) + (U × 10) + (A × 8)

Classification: - 0--30 → Safe - 31--60 → Medium Risk - 61--100 → High
Risk

## 3.5 Report Generation

FR-16: Generate structured report\
FR-17: Store report in database\
FR-18: Allow PDF download

------------------------------------------------------------------------

# 4. Non-Functional Requirements

## Performance

-   Scan time ≤ 15 seconds
-   Optimized CPU & memory usage
-   Support concurrent users

## Security

-   HTTPS encryption
-   Input sanitization
-   Parameterized SQL queries
-   Rate limiting

## Reliability

-   ≥ 95% uptime
-   Backup storage

## Scalability

-   Horizontal scaling
-   ML integration capability

------------------------------------------------------------------------

# 5. System Architecture

User → Web UI → Backend → Analyzer → Risk Engine → Database → Report

Cloud-based SaaS deployment with modular backend.

------------------------------------------------------------------------

# 6. Future Enhancements

-   Machine Learning integration
-   Dynamic sandbox analysis
-   Real-time behavioral monitoring
-   Explainable AI layer
-   Enterprise dashboard analytics

------------------------------------------------------------------------

# 7. Conclusion

This SRS defines the functional and non-functional requirements of the
Cyber Knights platform.\
The system is secure, scalable, explainable, cloud-ready, and
research-oriented for Android pre-installation malware detection.
