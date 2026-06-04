# Security Specification: Colmedikal Real-Time Database Architecture

This security specification outlines the data invariants and access controls for the Colmedikal persistent database powered by Google Cloud Firestore and Firebase Authentication.

---

## 1. Data Invariants

1. **Hierarchy and Isolation**:
   - Access to clinical data (refunds and authorizations) is private. Standard users can create them but can never query the full collection.
   - Administrative tasks are strictly bounded to authenticated corporate supervisors checkable by verified Google credentials (e.g. `edox54@gmail.com`).

2. **Temporal Integrity**:
   - Every transaction and state transition must preserve strict timeline order (e.g., matching client action timestamps or server event times). 

3. **Immutability Filters**:
   - Document IDs, cost thresholds, and specific user identifiers (`id`, `userEmail`, etc.) cannot be changed after submission.

4. **Schema Discipline**:
   - No dynamic fields. All incoming updates must strictly conform to allowed partial keys depending on the current status of the document.

---

## 2. The "Dirty Dozen" Malicious Payloads (Vulnerability Scenarios)

These 12 scenarios test the robustness of our rules. Each scenario represents a malicious attempt that must be rejected with `PERMISSION_DENIED`.

### Scenario 1: Doctor Privilege Escalation
An unauthenticated user attempts to create a new doctor with custom rating or permissions.
```json
// Collection: doctors
{
  "id": "dr-spoofed",
  "name": "Dr. Malicious Agent",
  "specialty": "Neurology",
  "rating": "5.00 (Admin Bypass)"
}
```

### Scenario 2: Administrative Doctor Update
An unauthenticated attacker attempts to overwrite doctor status or information.
```json
// Collection: doctors
{
  "active": true,
  "cost": 1000
}
```

### Scenario 3: Anonymous Doctor Deletion
An attacker tries to purge a doctor from the directory without administrative authorization.
```json
// Collection: doctors
// DELETE /doctors/dr-alejandro-mendoza -> EXPECT: PERMISSION_DENIED
```

### Scenario 4: Refund Query Scraping
A malicious user tries to list all refunds in the collection instead of querying their own metadata.
```json
// Action: LIST /refunds
// QUERY: db.collection("refunds").get() -> EXPECT: PERMISSION_DENIED
```

### Scenario 5: Refund Modification Hijack
An adversary attempts to self-approve a processing refund to steal funds.
```json
// Collection: refunds/REF-83145
{
  "status": "Reembolsado",
  "amount": 5000.00
}
```

### Scenario 6: ID Poisoning Attack (Denial of Wallet)
An attacker injects a 1MB string of junk characters as a refund ID to cause storage quota exhaustion.
```json
// TARGET Path: refunds/aaaaaaaaaaaaaaaa[1MB of text]...
{
  "id": "too-long...",
  "familyMember": "Poisoner",
  "amount": 25.00
}
```

### Scenario 7: State Machine Shortcircuit (Timeline Corruption)
An attacker tries to update an authorization status skipping the "Audit" stage to directly mark it as approved without an auditor signature.
```json
// Collection: authorizations/AUT-77140
{
  "status": "Aprobado",
  "adminComment": "Bypassed automatic checks"
}
```

### Scenario 8: Lead Pricing Spoofing
A customer tries to manipulate their insurance lead plan quote to store an unrealistic estimated price of $1.00 USD.
```json
// Collection: leads/LEAD-cotizador
{
  "estimatedPrice": 1.00
}
```

### Scenario 9: Sibling Synchronization Break
A user updates an appointment date but injects a mock modality that breaks medical validation.
```json
// Collection: appointments/APT-10492
{
  "modality": "spoofed-modality",
  "aptDate": "2026-10-10"
}
```

### Scenario 10: Email Fraud (Identity Theft)
A client tries to alter their submitted refund's `userEmail` to direct payment to an external address.
```json
// Collection: refunds/REF-92051
{
  "userEmail": "attacker@gmail.com"
}
```

### Scenario 11: Immature Field Overwrite
A user tries to modify the `requestDate` of an existing authorization back to a date in 2020 to bypass claim windows.
```json
// Collection: authorizations/AUT-88125
{
  "requestDate": "2020-01-01"
}
```

### Scenario 12: Administrative Token Emulation
An attacker signs in with a spoofed email that resembles administrative staff, e.g., `edox54@gmail.com` but with `email_verified: false` to request administrative views.
```json
// auth.token = { email: "edox54@gmail.com", email_verified: false } -> EXPECT: PERMISSION_DENIED on write.
```

---

## 3. Test Runner Architecture

A comprehensive test environment using `@firebase/rules-unit-testing` checks that each of these 12 malicious payloads fails immediately, preventing unauthorized read, write, update, or deletion operations.
