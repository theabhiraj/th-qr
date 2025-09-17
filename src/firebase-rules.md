rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection: each user can access only their own doc
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // QR codes collection: users can only access their own QR codes
    match /qrcodes/{qrId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Other collections (optional) can be public or restricted
    match /public/{docId} {
      allow read: if true;  // anyone can read
      allow write: if request.auth != null; // only logged-in users can write
    }
  }
}