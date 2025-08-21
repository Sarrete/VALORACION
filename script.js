document.addEventListener('DOMContentLoaded', () => {
    // --- Variables del DOM ---
    const stars = document.querySelectorAll('#ratingStars .star');
    const form = document.getElementById('ratingForm');
    const reviewsContainer = document.getElementById('reviews');
    let currentRating = 0;

    // --- Función para actualizar visualmente las estrellas ---
    function updateStars(rating) {
        stars.forEach((star, index) => {
            star.classList.toggle('selected', index < rating);
        });
    }

    // --- Eventos de estrellas ---
    stars.forEach((star, index) => {
        star.addEventListener('mouseover', () => updateStars(index + 1));
        star.addEventListener('mouseout', () => updateStars(currentRating));
        star.addEventListener('click', () => {
            currentRating = index + 1;
            updateStars(currentRating);
        });
    });

    // --- Enviar valoración ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const comment = document.getElementById('comment').value;
        const photoFile = document.getElementById('photo').files[0];

        if (!name) return alert('Por favor, ingresa tu nombre.');
        if (currentRating === 0) return alert('Por favor, selecciona una valoración.');

        let imageUrl = null;

        // 1. Si hay foto, subir a Cloudinary mediante la función serverless
        if (photoFile) {
            const base64 = await convertirImagenABase64(photoFile);
            try {
                const resFoto = await fetch('/.netlify/functions/subir-foto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageBase64: base64 })
                });
                const dataFoto = await resFoto.json();
                if (!resFoto.ok) throw new Error(dataFoto.message || 'Error al subir imagen');
                imageUrl = dataFoto.imageUrl;
            } catch (err) {
                console.error('Error subiendo imagen:', err);
                return alert('Error al subir la imagen. Intenta de nuevo.');
            }
        }

        // 2. Enviar todo a la función que guarda en Firebase
        const payload = {
            nombre: name,
            comentario: comment || 'Sin comentario',
            estrellas: currentRating,
            imagen: imageUrl
        };

        try {
            const res = await fetch('/.netlify/functions/guardar-valoracion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (res.ok) {
                alert('Valoración enviada correctamente. Se revisará antes de publicarla.');
                form.reset();
                currentRating = 0;
                updateStars(0);
                loadReviews();
            } else {
                alert('Error: ' + (result.message || 'No se pudo guardar'));
            }
        } catch (err) {
            console.error(err);
            alert('Error al enviar la valoración.');
        }
    });

    function convertirImagenABase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // --- Cargar valoraciones aprobadas ---
    async function loadReviews() {
        reviewsContainer.innerHTML = '';
        try {
            const res = await fetch('/.netlify/functions/listar-valoraciones'); // si tienes endpoint o reemplaza por Firestore client
            const lista = await res.json();
            lista.forEach(data => {
                const div = document.createElement('div');
                div.classList.add('review');
                div.innerHTML = `
                    <h3>${data.nombre}</h3>
                    <p class="stars-display">
                        ${'★'.repeat(data.estrellas)}${'☆'.repeat(5 - data.estrellas)}
                    </p>
                    <p>${data.comentario}</p>
                    ${data.imagen ? `<img src="${data.imagen}" alt="Foto valoración">` : ''}
                `;
                reviewsContainer.appendChild(div);
            });
        } catch (err) {
            console.error(err);
        }
    }

    loadReviews();
});
