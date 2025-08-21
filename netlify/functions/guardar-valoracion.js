const admin = require("firebase-admin");

// Cargar las credenciales desde las variables de entorno en Netlify
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

    // Validar los datos requeridos (nombre, estrellas obligatorios; comentario opcional)
    if (!data.nombre || !data.estrellas) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan datos requeridos" }),
      };
    }

    // Preparar documento para Firestore
    const nuevaValoracion = {
      nombre: data.nombre,
      comentario: data.comentario || "Sin comentario",
      estrellas: data.estrellas,
      imagen: data.imagen || null, // URL de Cloudinary si hay
      aprobado: false, // pendiente de revisión
      fecha: admin.firestore.Timestamp.now(),
    };

    const docRef = await db.collection("valoraciones").add(nuevaValoracion);

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: docRef.id,
        mensaje: "Valoración guardada correctamente",
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
