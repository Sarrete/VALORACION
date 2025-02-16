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

    // Convertir los datos recibidos
    const data = JSON.parse(event.body);

    // Validar que los datos contienen lo necesario
    if (!data.nombre || !data.comentario || !data.estrellas) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan datos requeridos" }),
      };
    }

    // Guardar en Firestore en la colección "valoraciones"
    const nuevaValoracion = await db.collection("valoraciones").add({
      nombre: data.nombre,
      comentario: data.comentario,
      estrellas: data.estrellas,
      aprobado: false, // Para que las revises antes de publicar
      fecha: admin.firestore.Timestamp.now(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: nuevaValoracion.id, mensaje: "Valoración guardada correctamente" }),
    };
  } catch (error) {
    console.error("Error guardando valoración:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Error interno del servidor" }) };
  }
};