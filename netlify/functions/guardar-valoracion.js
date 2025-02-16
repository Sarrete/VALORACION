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

    const data = JSON.parse(event.body); // Convertir los datos JSON enviados por el frontend

    // Validar los datos recibidos
    if (!data.nombre || !data.comentario || !data.estrellas) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan datos requeridos" }),
      };
    }

    // Guardar la valoración en Firestore
    const nuevaValoracion = await db.collection("valoraciones").add({
      nombre: data.nombre,
      comentario: data.comentario,
      estrellas: data.estrellas,
      aprobado: false,  // La valoración necesita ser aprobada antes de ser publicada
      fecha: admin.firestore.Timestamp.now(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: nuevaValoracion.id, mensaje: "Valoración guardada correctamente" }),
    };
  } catch (error) {
    console.error("Error guardando valoración:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno del servidor" }),
    };
  }
};
