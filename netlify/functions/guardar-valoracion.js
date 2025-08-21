const admin = require("firebase-admin");
const cloudinary = require("cloudinary").v2;

// Configurar Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Inicializar Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Método no permitido" };
    }

    const data = JSON.parse(event.body);

    // Validar datos
    if (!data.nombre || !data.comentario || !data.estrellas) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan datos requeridos" }),
      };
    }

    let imagenUrl = null;

    // Si hay imagen, subirla a Cloudinary
    if (data.imagenBase64) {
      const uploadResponse = await cloudinary.uploader.upload(data.imagenBase64, {
        folder: "valoraciones",
        upload_preset: "valoraciones_preset", // opcional si tienes uno
      });
      imagenUrl = uploadResponse.secure_url;
    }

    // Guardar en Firestore
    const nuevaValoracion = await db.collection("valoraciones").add({
      nombre: data.nombre,
      comentario: data.comentario,
      estrellas: data.estrellas,
      imagen: imagenUrl || null,
      aprobado: false,
      fecha: admin.firestore.Timestamp.now(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: nuevaValoracion.id,
        mensaje: "Valoración guardada correctamente",
        imagen: imagenUrl,
      }),
    };
  } catch (error) {
    console.error("Error guardando valoración:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno del servidor" }),
    };
  }
};
