document.getElementById('ratingForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Evita que el formulario se recargue al enviarlo

    // Obtén los valores del formulario
    const name = document.getElementById('name').value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value; // Obtener el valor de las estrellas
    const comment = document.getElementById('comment').value;
    const photo = document.getElementById('photo').files[0]; // Obtener la foto seleccionada

    // Verificar si se ha seleccionado una valoración
    if (!rating) {
        alert('Por favor, selecciona una valoración.');
        return;
    }

    // Crear el objeto de valoración
    const review = {
        name: name,
        rating: rating,
        comment: comment || 'Sin comentario',  // Si no hay comentario, poner un texto predeterminado
        photoUrl: photo ? URL.createObjectURL(photo) : null  // Crear una URL para la imagen si se sube una
    };

    // Crear el FormData para enviar al backend
    const formData = new FormData();
    formData.append('name', name);
    formData.append('rating', rating);
    formData.append('comment', comment);
    if (photo) {
        formData.append('photo', photo); // Subir la foto si se seleccionó
    }

    // Enviar los datos del formulario a la función de Netlify (backend)
    try {
        const response = await fetch('/.netlify/functions/guardar-valoracion', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            // Mostrar mensaje de éxito
            alert('Valoración enviada correctamente');
        } else {
            // Mostrar mensaje de error
            alert('Error al enviar la valoración: ' + result.message);
        }
    } catch (error) {
        // Manejo de errores
        alert('Error al conectar con el servidor: ' + error.message);
    }

    // Limpiar el formulario después de enviarlo
    document.getElementById('ratingForm').reset();
});
