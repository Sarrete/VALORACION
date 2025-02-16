document.getElementById('ratingForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Evita que el formulario se recargue al enviarlo

    const name = document.getElementById('name').value.trim();
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const comment = document.getElementById('comment').value;

    if (!name) {
        alert('Por favor, ingresa tu nombre.');
        return;
    }

    if (!rating) {
        alert('Por favor, selecciona una valoración.');
        return;
    }

    // Crear objeto de valoración
    const review = {
        name: name,
        rating: parseInt(rating, 10), // Convertir a número
        comment: comment || 'Sin comentario'
    };
    
    console.log('Enviando:', review); 

    try {
        const response = await fetch('/..netlify/functions/guardar-valoracion', {  // ← FIX URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(review)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Valoración enviada correctamente');
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Error de conexión: ' + error.message);
    }

    document.getElementById('ratingForm').reset();
});
