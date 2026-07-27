// Konfigurasi Firebase - GANTI DENGAN DATA PROYEK ANDA
const firebaseConfig = {
    apiKey: "AIzaSyABlB8w5fWEuMK_9t0UO1r_1Z52xU30YSk",
    authDomain: "daftar-hadir-tamu.firebaseapp.com",
    projectId: "daftar-hadir-tamu",
    storageBucket: "daftar-hadir-tamu.firebasestorage.app",
    messagingSenderId: "254299988407",
    appId: "1:254299988407:web:ded31d799741a413148832",
    measurementId: "G-9QP59BFEYC"
  };

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Inisialisasi Firestore
const db = firebase.firestore();

// Optional: Gunakan pengaturan offline agar tetap bisa digunakan tanpa internet
db.enablePersistence()
    .then(() => {
        console.log('🔥 Firestore persistence enabled');
    })
    .catch((err) => {
        console.warn('⚠️ Firestore persistence error:', err);
    });
    firebase.firestore().settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});