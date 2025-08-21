// netlify/functions/subir-valoracion.js
import { v2 as cloudinary } from 'cloudinary';
import admin from 'firebase-admin';

// --- Configuración Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Configuración Firebase Admin ---
if (!admin.apps.length) {
  const creds = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  admin.initializeApp({
    credential: admin.credential.cert(creds)
  });
}
const db = admin.firestore();

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  try {
    const { nombre, comentario, estrellas, imageBase64 } = JSON.parse(event.body);
    let imageUrl = null;

    if (imageBase64) {
      const uploadRes = await cloudinary.uploader.upload(imageBase64, {
        folder: 'valoraciones'
      });
      imageUrl = uploadRes.secure_url;
    }

    await db.collection('valoraciones').add({
      nombre,
      comentario,
      estrellas,
      imagen: imageUrl,
      fecha: Date.now()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Valoración guardada' })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al guardar valoración' })
    };
  }
}
