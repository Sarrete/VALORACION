const admin = require("firebase-admin");
const fetch = require("node-fetch");
const FormData = require("form-data");
const busboy = require("busboy");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  return new Promise((resolve) => {
    const bb = busboy({ headers: event.headers });
    let nombre, estrellas, comentario, archivoBuffer, archivoNombre;

    bb.on("field", (fieldname, val) => {
      if (fieldname === "nombre") nombre = val;
      if (fieldname === "estrellas") estrellas = parseInt(val, 10);
      if (fieldname === "comentario") comentario = val;
    });

    bb.on("file", (fieldname, file, info) => {
      archivoNombre = info.filename;
      const chunks = [];
      file.on("data", (d) => chunks.push(d));
      file.on("end", () => {
        archivoBuffer = Buffer.concat(chunks);
      });
    });

    bb.on("finish", async () => {
      try {
        let imagenUrl = null;

        if (archivoBuffer) {
          const cf = new FormData();
          cf.append("file", archivoBuffer, archivoNombre);
          cf.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: "POST", body: cf }
          );

          const uploadData = await uploadRes.json();
          imagenUrl = uploadData.secure_url;
        }

        const docRef = await db.collection("valoraciones").add({
          nombre,
          comentario: comentario || "Sin comentario",
          estrellas,
          imagen: imagenUrl,
          aprobado: false,
          fecha: admin.firestore.FieldValue.serverTimestamp(),
        });

        resolve({
          statusCode: 200,
          body: JSON.stringify({
            id: docRef.id,
            mensaje: "Valoración guardada con imagen Cloudinary",
          }),
        });
      } catch (error) {
        console.error("Error en subir-valoracion:", error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: "Error interno del servidor" }),
        });
      }
    });

    const encoding = event.isBase64Encoded ? "base64" : "utf8";
    bb.end(Buffer.from(event.body, encoding));
  });
};
