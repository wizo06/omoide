const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../config/serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

exports.db = getFirestore();