# MedCore API Documentation

**Base URL:** `http://localhost:5000/api/v1`

**Authentication:** All protected routes require header `Authorization: Bearer <token>`

**Standard Success Response:**
```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "error": "error message",
  "code": 400
}
```

---

## Table of Contents

1. [Auth](#1-auth)
2. [Doctors](#2-doctors)
3. [Patients](#3-patients)
4. [Appointments](#4-appointments)
5. [Queue](#5-queue)
6. [Consultations](#6-consultations)
7. [Invoices](#7-invoices)
8. [Audit Logs](#8-audit-logs)
9. [Notifications](#9-notifications)
10. [Analytics](#10-analytics)
11. [Query Parameters Reference](#11-query-parameters-reference)
12. [Frontend Integration Notes](#12-frontend-integration-notes)

---

## 1. Auth

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/register` | No | Register a new user with name, email, password, and role. Returns JWT token and user profile. |
| POST | `/auth/login` | No | Login with email and password. Returns JWT token and user profile with role for frontend redirect. |
| POST | `/auth/logout` | Yes | Invalidate the current session token. Call this on logout button click. |
| GET | `/auth/me` | Yes | Get the currently logged in user full profile. Call this on app load to restore session. |
| PATCH | `/auth/change-password` | Yes | Update password by sending current password and new password. Returns success message. |

### Request Bodies

**POST /auth/register**
```json
{
  "full_name": "Dr. Arjun Mehta",
  "email": "arjun@medcore.in",
  "password": "securepassword123",
  "role": "doctor"
}
```

**POST /auth/login**
```json
{
  "email": "arjun@medcore.in",
  "password": "securepassword123"
}
```

**PATCH /auth/change-password**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

---

## 2. Doctors

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/doctors` | Yes | Get all doctors. Accepts query param `status=approved` to filter by approval status. Used in patient booking and admin user management. |
| GET | `/doctors/:id` | Yes | Get a single doctor full profile including specialization, experience, rating, and license number. |
| PATCH | `/doctors/:id` | Yes | Update doctor profile fields like specialization, experience, or contact details. Doctor can only update their own profile. |
| GET | `/doctors/:id/stats` | Yes | Get today's stats for doctor dashboard — total patients seen, completed consultations, pending queue count, average wait time. |
| GET | `/doctors/pending` | Yes | Get all doctors with status pending. Used on admin approvals page to show pending applications. |
| PATCH | `/doctors/:id/approve` | Yes | Change doctor status to approved. Admin only. Creates an audit log entry automatically. |
| PATCH | `/doctors/:id/reject` | Yes | Change doctor status to rejected. Send rejection reason in request body. Admin only. |

### Request Bodies

**PATCH /doctors/:id**
```json
{
  "specialization": "Cardiology",
  "experience": 12,
  "phone": "9876543210"
}
```

**PATCH /doctors/:id/reject**
```json
{
  "reason": "Incomplete documents submitted"
}
```

### Response Examples

**GET /doctors/:id/stats**
```json
{
  "success": true,
  "data": {
    "total_patients_today": 8,
    "completed_consultations": 5,
    "pending_queue": 3,
    "average_wait_time": 24
  }
}
```

---

## 3. Patients

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/patients` | Yes | Get all patients with optional search query param `search=name` for real-time search. Used on doctor patients page and staff reception. |
| GET | `/patients/:id` | Yes | Get a single patient complete profile including demographics, allergies, and conditions. |
| POST | `/patients` | Yes | Create a new patient record. Used when staff adds a walk-in patient at reception. |
| PATCH | `/patients/:id` | Yes | Update patient details like address, emergency contact, or conditions. |
| DELETE | `/patients/:id` | Yes | Soft delete a patient record. Admin only. Sets inactive flag rather than removing from database. |
| GET | `/patients/:id/consultations` | Yes | Get all past consultations for a specific patient sorted by date descending. Used on EMR consultation history tab. |
| GET | `/patients/:id/prescriptions` | Yes | Get all prescriptions for a patient grouped by consultation. Used on patient prescriptions page. |
| GET | `/patients/:id/metrics` | Yes | Get all health metric readings for a patient sorted by date. Used on vitals chart in EMR and patient health metrics page. |
| POST | `/patients/:id/metrics` | Yes | Add a new health metric reading for a patient with all vital sign values. |

### Request Bodies

**POST /patients**
```json
{
  "full_name": "Aarav Sharma",
  "phone": "9876543210",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "blood_group": "A+",
  "allergies": ["Penicillin"],
  "conditions": ["Hypertension"],
  "address": "123 MG Road, Mumbai",
  "emergency_contact": "Priya Sharma - 9876543211"
}
```

**POST /patients/:id/metrics**
```json
{
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "temperature": 98.6,
  "weight": 70,
  "blood_sugar": 95,
  "spo2": 98
}
```

---

## 4. Appointments

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/appointments` | Yes | Get all appointments. Accepts query params `date`, `status`, `doctorId`, `patientId` for filtering. Used on staff appointments calendar. |
| GET | `/appointments/:id` | Yes | Get a single appointment full details. |
| POST | `/appointments` | Yes | Create a new appointment. Also automatically creates a queue entry if the appointment date is today. |
| PATCH | `/appointments/:id` | Yes | Update appointment fields like date, time slot, type, or notes. Used for rescheduling. |
| PATCH | `/appointments/:id/cancel` | Yes | Cancel an appointment and update its status. Sends a notification to the patient automatically. |
| GET | `/appointments/doctor/:doctorId` | Yes | Get all appointments for a specific doctor. Accepts `date` query param to filter by day. Used on doctor dashboard schedule. |
| GET | `/appointments/patient/:patientId` | Yes | Get all appointments for a specific patient split into upcoming and past. Used on patient appointments page. |
| GET | `/appointments/slots/:doctorId` | Yes | Get available and booked time slots for a doctor on a specific date. Send `date` as query param. Used in booking flow step 2. |

### Request Bodies

**POST /appointments**
```json
{
  "patient_id": "patient_mongo_id",
  "doctor_id": "doctor_mongo_id",
  "date": "2025-04-10",
  "time_slot": "10:30 AM",
  "type": "general",
  "notes": "Routine checkup"
}
```

**PATCH /appointments/:id**
```json
{
  "date": "2025-04-11",
  "time_slot": "11:00 AM",
  "type": "followup"
}
```

### Response Examples

**GET /appointments/slots/:doctorId?date=2025-04-10**
```json
{
  "success": true,
  "data": {
    "available": ["09:00 AM", "09:30 AM", "10:00 AM"],
    "booked": ["10:30 AM", "11:00 AM"]
  }
}
```

---

## 5. Queue

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/queue` | Yes | Get today's full queue. Accepts `doctorId` query param to filter by doctor. Used on doctor queue page and staff queue management. |
| GET | `/queue/:id` | Yes | Get a single queue entry by its ID. |
| POST | `/queue` | Yes | Add a patient to today's queue and auto-assign the next token number. Used when staff checks in a patient at reception. |
| PATCH | `/queue/:id/status` | Yes | Update a queue entry status. Send new status in body — waiting, called, in-progress, or completed. |
| PATCH | `/queue/:id/priority` | Yes | Escalate a queue entry to emergency priority. Moves it to the top of the queue automatically. |
| GET | `/queue/doctor/:doctorId` | Yes | Get the active queue for a specific doctor showing only waiting and in-progress entries. Used on doctor dashboard queue preview. |
| GET | `/queue/next/:doctorId` | Yes | Get the next waiting patient for a doctor by lowest token number. Used by Call Next Patient button. |
| DELETE | `/queue/clear-completed` | Yes | Remove all completed entries from today's queue view. Used by staff on queue management page. |

### Request Bodies

**POST /queue**
```json
{
  "patient_id": "patient_mongo_id",
  "doctor_id": "doctor_mongo_id",
  "appointment_id": "appointment_mongo_id",
  "priority": "normal"
}
```

**PATCH /queue/:id/status**
```json
{
  "status": "in-progress"
}
```

### Response Examples

**GET /queue/next/:doctorId**
```json
{
  "success": true,
  "data": {
    "id": "queue_entry_id",
    "token_number": 4,
    "patient_name": "Aarav Sharma",
    "patient_id": "patient_id",
    "priority": "normal",
    "checked_in_at": "2025-04-04T09:15:00Z"
  }
}
```

---

## 6. Consultations

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/consultations` | Yes | Get all consultations with optional filters for doctorId, patientId, and date range. |
| GET | `/consultations/:id` | Yes | Get a single consultation full details including vitals, symptoms, diagnosis, and prescription. |
| POST | `/consultations` | Yes | Create a new completed consultation. Also updates the queue entry to completed and creates an audit log. |
| PATCH | `/consultations/:id` | Yes | Update a consultation to save a draft. Used by Save Draft button on consultation engine. |
| GET | `/consultations/doctor/:doctorId` | Yes | Get all consultations created by a specific doctor sorted by date. |
| GET | `/consultations/patient/:patientId` | Yes | Get full consultation history for a patient. Used on patient EMR and medical history page. |
| GET | `/consultations/today/:doctorId` | Yes | Get only today's completed consultations for a doctor. Used for stat cards on doctor dashboard. |

### Request Bodies

**POST /consultations**
```json
{
  "patient_id": "patient_mongo_id",
  "doctor_id": "doctor_mongo_id",
  "symptoms": ["Fever", "Cough", "Fatigue"],
  "chief_complaint": "Fever for 3 days with dry cough",
  "severity": 6,
  "diagnosis": "J06.9 URTI",
  "secondary_diagnosis": "J00 Common Cold",
  "clinical_findings": "Throat mildly inflamed, no lymphadenopathy",
  "notes": "Patient advised rest and hydration",
  "vitals": {
    "systolic": 118,
    "diastolic": 76,
    "pulse": 88,
    "temp": 99.2,
    "spo2": 97,
    "weight": 68
  },
  "prescription": [
    {
      "drug": "Paracetamol 500mg",
      "dose": "1 tablet",
      "frequency": "Three times daily",
      "duration": "5 days",
      "instructions": "After meals"
    },
    {
      "drug": "Cetirizine 10mg",
      "dose": "1 tablet",
      "frequency": "At bedtime",
      "duration": "5 days",
      "instructions": "Before sleep"
    }
  ],
  "queue_entry_id": "queue_mongo_id",
  "duration": 18
}
```

---

## 7. Invoices

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/invoices` | Yes | Get all invoices with optional filters for status, patientId, and date range. Used on staff billing page. |
| GET | `/invoices/:id` | Yes | Get a single invoice full detail including line items, tax calculation, and payment info. Used for invoice preview modal. |
| POST | `/invoices` | Yes | Create a new invoice with line items. Calculates subtotal, 5% GST, and total automatically on the backend. |
| PATCH | `/invoices/:id/status` | Yes | Update invoice payment status to paid, unpaid, or partial. Send payment method in body. |
| GET | `/invoices/patient/:patientId` | Yes | Get all invoices for a specific patient. |
| GET | `/invoices/summary` | Yes | Get revenue summary for admin dashboard — today, this week, this month, and payment method breakdown. |

### Request Bodies

**POST /invoices**
```json
{
  "patient_id": "patient_mongo_id",
  "consultation_id": "consultation_mongo_id",
  "items": [
    {
      "description": "Consultation Fee",
      "amount": 500
    },
    {
      "description": "ECG",
      "amount": 200
    }
  ],
  "payment_method": "card"
}
```

**PATCH /invoices/:id/status**
```json
{
  "status": "paid",
  "payment_method": "upi"
}
```

### Response Examples

**GET /invoices/summary**
```json
{
  "success": true,
  "data": {
    "today": 12500,
    "this_week": 87400,
    "this_month": 342000,
    "by_payment_method": {
      "cash": 45000,
      "card": 178000,
      "upi": 119000
    }
  }
}
```

---

## 8. Audit Logs

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/audit-logs` | Yes | Get all audit logs with filters for severity, actorRole, and date range. Supports pagination with `page` and `limit` query params. Used on admin audit logs page. |
| POST | `/audit-logs` | Yes | Create a new audit log entry. This is called internally by the backend after every significant action. Frontend should never call this directly. |

### Request Bodies

**POST /audit-logs**
```json
{
  "actor": "Dr. Arjun Mehta",
  "actor_role": "doctor",
  "action": "Consultation completed",
  "target": "Aarav Sharma",
  "severity": "info",
  "ip_address": "192.168.1.10"
}
```

### Response Examples

**GET /audit-logs?severity=critical&page=1&limit=25**
```json
{
  "success": true,
  "data": {
    "logs": [],
    "total": 142,
    "page": 1,
    "pages": 6
  }
}
```

---

## 9. Notifications

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/notifications` | Yes | Get the last 20 notifications for the currently logged in user filtered by their role and user ID. Used in notification dropdown. |
| PATCH | `/notifications/read-all` | Yes | Mark all notifications for the current user as read. Used by Mark All Read button in notification dropdown. |
| PATCH | `/notifications/:id/read` | Yes | Mark a single notification as read when the user clicks on it. |
| POST | `/notifications` | Yes | Create a new notification for a specific user or role. Called internally by backend after appointments, approvals, and consultations. |

### Request Bodies

**POST /notifications**
```json
{
  "for_user_id": "user_mongo_id",
  "for_role": "patient",
  "message": "Your appointment with Dr. Arjun Mehta is confirmed for 10 Apr at 10:30 AM",
  "type": "appointment"
}
```

---

## 10. Analytics

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/analytics/revenue` | Yes | Get revenue totals grouped by day for a date range. Send `from` and `to` as query params. Used for revenue area chart on admin dashboard. |
| GET | `/analytics/appointments` | Yes | Get appointment count grouped by day of week and hour of day. Used to build the heatmap on admin dashboard. |
| GET | `/analytics/patients` | Yes | Get patient count broken down by age group and gender. Used for demographics charts on admin analytics page. |
| GET | `/analytics/doctors` | Yes | Get top doctors ranked by consultation count for a date range. Used for top doctors table on admin analytics page. |
| GET | `/analytics/departments` | Yes | Get consultation count grouped by medical department or specialization. Used for department bar chart on admin analytics page. |

### Response Examples

**GET /analytics/revenue?from=2025-03-01&to=2025-04-04**
```json
{
  "success": true,
  "data": [
    { "date": "2025-03-01", "revenue": 18500 },
    { "date": "2025-03-02", "revenue": 22000 },
    { "date": "2025-03-03", "revenue": 15750 }
  ]
}
```

**GET /analytics/appointments**
```json
{
  "success": true,
  "data": [
    { "day": "Monday", "hour": 9, "count": 8 },
    { "day": "Monday", "hour": 10, "count": 12 },
    { "day": "Tuesday", "hour": 9, "count": 6 }
  ]
}
```

**GET /analytics/patients**
```json
{
  "success": true,
  "data": {
    "age_groups": [
      { "group": "0-18", "count": 45 },
      { "group": "19-35", "count": 120 },
      { "group": "36-50", "count": 98 },
      { "group": "51-65", "count": 76 },
      { "group": "65+", "count": 34 }
    ],
    "gender": [
      { "gender": "male", "count": 198 },
      { "gender": "female", "count": 175 }
    ]
  }
}
```

**GET /analytics/doctors**
```json
{
  "success": true,
  "data": [
    { "rank": 1, "name": "Dr. Arjun Mehta", "specialization": "General Medicine", "consultations": 48, "rating": 4.6 },
    { "rank": 2, "name": "Dr. Priya Sharma", "specialization": "Cardiology", "consultations": 41, "rating": 4.8 }
  ]
}
```

**GET /analytics/departments**
```json
{
  "success": true,
  "data": [
    { "department": "General Medicine", "count": 142 },
    { "department": "Cardiology", "count": 98 },
    { "department": "Orthopedics", "count": 76 }
  ]
}
```

---

## 11. Query Parameters Reference

| Endpoint | Parameter | Type | Example | Purpose |
|----------|-----------|------|---------|---------|
| GET /appointments | date | string | 2025-04-04 | Filter by specific date |
| GET /appointments | status | string | scheduled | Filter by appointment status |
| GET /appointments | doctorId | string | abc123 | Filter by doctor ID |
| GET /appointments | patientId | string | xyz789 | Filter by patient ID |
| GET /appointments/slots/:id | date | string | 2025-04-10 | Get available slots for this date |
| GET /patients | search | string | Aarav | Search patients by name or phone |
| GET /queue | doctorId | string | abc123 | Filter queue by doctor |
| GET /consultations | from | string | 2025-03-01 | Start of date range filter |
| GET /consultations | to | string | 2025-04-04 | End of date range filter |
| GET /consultations | doctorId | string | abc123 | Filter by doctor ID |
| GET /consultations | patientId | string | xyz789 | Filter by patient ID |
| GET /audit-logs | severity | string | critical | Filter logs by severity level |
| GET /audit-logs | actorRole | string | admin | Filter logs by user role |
| GET /audit-logs | page | number | 1 | Pagination page number |
| GET /audit-logs | limit | number | 25 | Number of results per page |
| GET /analytics/revenue | from | string | 2025-03-01 | Revenue data start date |
| GET /analytics/revenue | to | string | 2025-04-04 | Revenue data end date |
| GET /doctors | status | string | approved | Filter doctors by approval status |
| GET /invoices | status | string | unpaid | Filter invoices by payment status |
| GET /invoices | patientId | string | xyz789 | Filter invoices by patient |

---

## 12. Frontend Integration Notes

### Axios Instance Setup

Create a single Axios instance in `src/services/api.js`. Configure the base URL and add a request interceptor that automatically attaches the JWT token from localStorage to every request. Add a response interceptor that catches 401 errors and redirects to the login page automatically.

### Token Storage Keys

Store all auth data in localStorage using these exact keys so every part of the frontend reads from the same place:

| Key | Value |
|-----|-------|
| `medcore_token` | JWT token string |
| `medcore_user` | JSON stringified user profile object |
| `medcore_role` | Role string — doctor, patient, staff, admin |

### HTTP Status Codes Used

| Code | Meaning | Frontend Action |
|------|---------|-----------------|
| 200 | Success | Show data |
| 201 | Created | Show success toast |
| 400 | Bad request | Show validation error message |
| 401 | Unauthorized | Clear localStorage and redirect to login |
| 403 | Forbidden | Show access denied message |
| 404 | Not found | Show empty state |
| 500 | Server error | Show generic error toast |

### Loading State Pattern

Every API call in the frontend should follow this pattern — set loading true before the call, set loading false in the finally block regardless of success or failure. This drives the skeleton loaders on every page.

### Role Based Redirect After Login

After a successful login read the role from the response and redirect using this mapping:

| Role | Redirect To |
|------|-------------|
| doctor | /doctor/dashboard |
| patient | /patient/dashboard |
| staff | /staff/reception |
| admin | /admin/dashboard |

---

*Last updated: April 2025*
*Version: 1.0*
*Project: MedCore — Enterprise Healthcare Operating System*