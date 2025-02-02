document.getElementById('ratingForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Evita que el formulario se recargue al enviarlo

    // Obtén los valores del formulario
    const name = document.getElementById('name').value.trim();  // Eliminar espacios en blanco al inicio y final
    const rating = document.querySelector('input[name="rating"]:checked')?.value; // Obtener el valor de las estrellas
    const comment = document.getElementById('comment').value;
    const photo = document.getElementById('photo').files[0]; // Obtener la foto seleccionada

    // Verificar si el nombre está vacío
    if (!name) {
        alert('Por favor, ingresa tu nombre.');
        return;
    }

    // Verificar si se ha seleccionado una valoración
    if (!rating) {
        alert('Por favor, selecciona una valoración.');
        return;
    }

    // Crear el objeto de valoración
    const review = {
        name: name,
        rating: rating,
        comment: comment || 'Sin comentario',  // Usamos un valor predeterminado si no hay comentario
        photoUrl: photo ? URL.createObjectURL(photo) : null  // Si hay foto, crear una URL de la imagen
    };
    
    console.log('Review object:', review);  // Asegúrate de ver el objeto que estás enviando

    try {
        // Enviar los datos al backend como JSON
        const response = await fetch('/.netlify/functions/guardar-valoracion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(review),  // Enviar como JSON
        });

        const result = await response.json();

        if (response.ok) {
            alert('Valoración enviada correctamente');
        } else {
            alert('Error al enviar la valoración: ' + result.message);
        }
    } catch (error) {
        // Manejo de errores
        alert('Error al conectar con el servidor: ' + error.message);
    }

    // Limpiar el formulario después de enviarlo
    document.getElementById('ratingForm').reset();
});
