// ============================================================
//  RED CARPET — CONFIG  (এই ফাইলটিই আপনাকে এডিট করতে হবে / the only file you must edit)
//  README.md-তে ধাপে ধাপে দেখানো আছে কোথা থেকে এই মানগুলো পাবেন।
// ============================================================

// 1) Firebase → Project settings → Your apps → Web app → "firebaseConfig" এখানে পেস্ট করুন।
//    এগুলো খালি থাকলে সাইট DEMO MODE-এ চলে (ডেটা শুধু ঐ ব্রাউজারে থাকে — টেস্টের জন্য)।
export const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// 2) স্টাফের ইমেইল (Firebase → Authentication-এ এই ইমেইল দিয়ে ইউজার বানাবেন)।
//    ⚠ একই ইমেইল firestore.rules ফাইলেও বসাতে হবে।
export const STAFF = {
  admin:   ["admin@redcarpet.com"],      // মালিক / অ্যাডমিন — সব কিছু বদলাতে পারবে
  kitchen: ["kitchen@redcarpet.com"]     // কিচেন — শুধু অর্ডারের স্ট্যাটাস বদলাতে পারবে
};

// 3) (ঐচ্ছিক) নতুন বুকিং এলে মালিকের ইমেইলে কপি পাঠাতে — FormSubmit.co ব্যবহার করে (ফ্রি)।
//    ইমেইল দিন, তারপর সাইট থেকে একটি টেস্ট বুকিং দিন, FormSubmit-এর পাঠানো কনফার্মেশন মেইলে ক্লিক করুন।
export const OWNER_NOTIFY_EMAIL = "";

// DEMO MODE-এর লগইন (শুধু টেস্টের জন্য; Firebase সেট করলে এগুলো কাজ করে না)
export const DEMO_STAFF = {
  "admin@redcarpet.com":   "admin123",
  "kitchen@redcarpet.com": "kitchen123"
};
