// netlify/functions/guardar-valoracion.js
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Obtener los datos del formulario (nombre, valoración, comentario y foto)
    const formData = new URLSearchParams(event.body);

    const name = formData.get('name');
    const rating = formData.get('rating');
    const comment = formData.get('comment');
    const photo = event.files ? event.files.photo : null;

    if (!name || !rating) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'El nombre y la valoración son obligatorios.' }),
      };
    }

    // Creamos un objeto para almacenar la valoración
    const review = {
      name,
      rating,
      comment,
      photo: photo ? photo.name : null,
    };

    // Aquí puedes almacenar las valoraciones en un archivo JSON
    const filePath = path.join(__dirname, 'reviews.json');
    let reviews = [];
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      reviews = JSON.parse(data);
    }

    reviews.push(review);

    // Guardamos las valoraciones en el archivo
    fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2));

    // Devolver una respuesta indicando que la valoración se guardó correctamente
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Valoración guardada correctamente.' }),
    };
  } catch (error) {
    console.error('Error al guardar la valoración:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Hubo un error al procesar la valoración.' }),
    };
  }
};
