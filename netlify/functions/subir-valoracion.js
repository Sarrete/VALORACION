import { v2 as cloudinary } from 'cloudinary';
import admin from 'firebase-admin';

// Configuración segura de Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración segura de Firebase
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

    // Subida a Cloudinary si hay imagen
    if (imageBase64) {
      const uploadRes = await cloudinary.uploader.upload(imageBase64, {
        folder: 'valoraciones',
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
      });
      imageUrl = uploadRes.secure_url;
    }

    // Guardar valoración en Firestore
    await db.collection('valoraciones').add({
      nombre,
      comentario,
      estrellas,
      imagen: imageUrl,
      fecha: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Valoración guardada correctamente',
        url: imageUrl
      })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al guardar la valoración' })
    };
  }
}
