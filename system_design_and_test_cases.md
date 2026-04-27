# Medinexus System Architecture & Testing Documentation

This document outlines the core architecture, data relationships, user workflows, and primary test cases for the Medinexus appointment management system.

## 1. Entity-Relationship (ER) Diagram

The following diagram illustrates the relationship between the primary data models in MongoDB.

```mermaid
erDiagram
    USER ||--o| DOCTOR : "has profile"
    USER ||--o| PATIENT : "has profile"
    DOCTOR ||--o{ SCHEDULE : "manages"
    SCHEDULE ||--o{ APPOINTMENT : "contains"
    PATIENT ||--o{ APPOINTMENT : "books"

    USER {
        string _id PK
        string name
        string email
        string password
        string role "admin, doctor, patient"
    }

    DOCTOR {
        string _id PK
        string user FK
        string tel
        string specialty
        string gender
    }

    PATIENT {
        string _id PK
        string user FK
        string phone
        string address
        date dob
        string gender
    }

    SCHEDULE {
        string _id PK
        string doctor FK
        string title
        date date
        string time
        number maxAppointments
        number currentlyServingToken
    }

    APPOINTMENT {
        string _id PK
        string patient FK
        string schedule FK
        string status "Pending, Reviewed, Cancelled, Rescheduled, Missed"
        number appointmentNumber
        date appointmentTime
        string priority
        string symptoms
        string history
        string document
        boolean doctorAttended
        boolean patientAttended
        object prescription
    }
```

## 2. Appointment Workflow (Flow Chart)

The following flowchart outlines the lifecycle of a patient's interaction with the booking and attendance system.

```mermaid
flowchart TD
    A[Patient logs in] --> B[View available Schedules]
    B --> C[Book Appointment]
    
    C --> D{Is Schedule Full?}
    D -- Yes --> E[Booking Failed]
    D -- No --> F[Appointment Created & Assigned Token Number]
    
    F --> G[Wait for Date/Time]
    
    subgraph "On Appointment Day"
        G --> H{Does patient attend?}
        H -- No --> I[Automated Job marks as 'Missed']
        H -- Yes --> J[Doctor calls Token Number]
        J --> K[Doctor reviews & adds prescription]
        K --> L[Status updated to 'Reviewed']
    end
    
    subgraph "Exceptions"
        F --> M[Patient/Admin Cancels]
        M --> N[Status updated to 'Cancelled']
        F --> O[Patient Reschedules]
        O --> P[Status updated to 'Rescheduled' / Old slot freed]
    end
```

## 3. Core System Test Cases

The following test cases cover the critical pathways for the system to ensure production readiness.

| Test Case ID | Module | Scenario | Pre-conditions | Action | Expected Result |
|--------------|--------|----------|----------------|--------|-----------------|
| **TC_01** | Auth | Valid Login | User registered | Enter valid email & password | Login successful, redirect to correct role dashboard |
| **TC_02** | Admin | Add Doctor | Admin logged in | Fill doctor form & submit | New doctor created; email must be unique; shows in list |
| **TC_03** | Admin | Create Schedule | Doctor exists | Select doctor, pick **future date**, submit | Schedule created, visible to patients |
| **TC_04** | Admin | Invalid Schedule | Doctor exists | Select **past date**, submit | Validation Error: "Cannot schedule a session in the past" |
| **TC_05** | Patient | Book Appointment | Schedule has open slots | Click book, enter symptoms, submit | Appointment created, sequential token (APT-...) assigned |
| **TC_06** | Patient | Queue Wait Time | Appointment booked | Doctor increments serving token | Patient UI dynamically updates wait time correctly |
| **TC_07** | Doctor | Mark Reviewed | Patient attended | Click "Review", add prescription | Status changes to "Reviewed", prescription saved |
| **TC_08** | System | Attendance Job | Pending past appointment | 5 mins pass after appointment time | Server cron job auto-updates status to "Missed" |
| **TC_09** | Patient | Print PDF | Booking exists | Click "Print PDF" | PDF confirmation opens, correctly formats APT-YYYYMMDD-XX |
| **TC_10** | System | File Upload | Creating booking | Upload PDF/Image, submit | File uploaded safely, accessible via backend URL |

> [!TIP]
> Use these test cases as a foundation for implementing End-to-End (E2E) testing frameworks like Cypress or Playwright.
