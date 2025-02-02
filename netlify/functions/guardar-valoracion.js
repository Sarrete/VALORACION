const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  try {
    // Leer y parsear los datos recibidos
    const data = JSON.parse(event.body);

    const { name, rating, comment } = data;

    if (!name || !rating) {
      return { statusCode: 400, body: JSON.stringify({ message: "El nombre y la valoración son obligatorios." }) };
    }

    // Crear objeto de valoración
    const review = { name, rating, comment };

    // Ruta del archivo donde se guardan las valoraciones
    const filePath = path.join(__dirname, 'reviews.json');
    let reviews = [];

    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      reviews = JSON.parse(fileData);
    }

    reviews.push(review);
    fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Valoración guardada correctamente." }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error al guardar la valoración." }),
    };
  }
};
