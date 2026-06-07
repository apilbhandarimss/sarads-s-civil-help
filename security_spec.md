# Security Specification - Sarad's Civil Help

## 1. Data Invariants

- **Authentication**: All writes (create, update, delete) require a signed-in user (`request.auth != null`). Reads are public (`true`) so that any user can study the engineering materials without forcing login, but listing and viewing remain secure from data structure abuse.##
- **Creator Identity**: A user can only create a Note where the `userId` in the document matches `request.auth.uid` and the `authorEmail` matches `request.auth.token.email`.
- **Note Fields Validation**:
  - `title` must be a string between 3 and 100 characters.
  - `description` must be a string between 5 and 1000 characters.
  - `category` must be one of: `['loksewa', 'license', 'bachelors', 'entrance', 'masters']`.
  - `subcategory` must be a string up to 100 characters.
  - `imageUrls` must be a list of strings (limited to 10 images max).
  - `pdfUrl` must be a string of reasonable length (up to 500 characters).
  - `likesCount` must initialize to `0` or be incremented/decremented by `1` synchronously when liking.
  - `createdAt` must be set to `request.time` on creation and is immutable thereafter.
- **Comment Validation**:
  - `userId` must match `request.auth.uid`.
  - `text` must be between 1 and 500 characters.
  - `createdAt` must match `request.time`.

---

## 2. The "Dirty Dozen" Malicious Payloads

We define 12 attack vectors attempting to bypass security constraints. All of these must return `PERMISSION_DENIED`:

1. **Anonymous Spoofing**: Attempting to create a note without authentication.
2. **Identity Spoofing**: Signed-in User A tries to create a note with User B's `userId`.
3. **Admin Field Escalation**: Trying to create a note with extra unexpected fields like `isAdmin` or `approved`.
4. **Category Poisoning**: Attempting to set `category` to a forbidden string like `admin_announcements` or `unauthorized_folder`.
5. **Title Injection**: Creating a note with a massive `title` string (1MB) to cause DoW (Denial of Wallet).
6. **Immutable Hijacking**: Attempting to update the `createdAt` timestamp of a note post-creation.
7. **Creator Takeover**: User B attempts to change the `userId` or `authorEmail` of an existing note owned by User A.
8. **Malicious Likes Increment**: Attempting to edit a note's `likesCount` from `1` to `999999` directly.
9. **Spam Comments Injection**: Attempting to write a 10MB long text inside a comments document.
10. **Spoofed User Comment**: User A trying to write a Comment under User B's username & UID inside a Note's comment section.
11. **Illegal Document ID Creation**: Trying to create a note with a weird, malicious path or junk characters as ID (e.g. `../../badpath`).
12. **Comment Modification**: Attempting to update or delete someone else's comment (comments once posted are read-only or only delete-authorized by owner).

---

## 3. Test Cases (TDD Mapping)

We will implement security checks inside `/firestore.rules` to reject all 12 dirty payloads. We will deploy the secure gate rules and run validation checks.
