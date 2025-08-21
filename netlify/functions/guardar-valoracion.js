const admin = require("firebase-admin");
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }
  try {
    const data = JSON.parse(event.body);

    if (!data.nombre || !data.estrellas) {
      return { statusCode: 400, body: JSON.stringify({ error: "Faltan datos requeridos" }) };
    }

    const nuevaValoracion = {
      nombre: data.nombre,
      comentario: data.comentario || "Sin comentario",
      estrellas: data.estrellas,
      imagen: data.imagen || null,
      aprobado: false,
      fecha: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("valoraciones").add(nuevaValoracion);
    return { statusCode: 200, body: JSON.stringify({ id: docRef.id, mensaje: "Valoración guardada correctamente" }) };
  } catch (error) {
    console.error("Error guardando valoración:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Error interno del servidor" }) };
  }
};
