const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
    if (event.httpMethod === 'POST') {
        const formData = new FormData();
        const data = event.body;

        const name = data.name;
        const rating = data.rating;
        const comment = data.comment;
        const photo = data.photo;

        // Aquí podrías guardar la valoración en una base de datos
        // Por ejemplo, en un archivo o base de datos MongoDB, MySQL, etc.

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Valoración guardada correctamente.' }),
        };
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Método no permitido' }),
        };
    }
};
