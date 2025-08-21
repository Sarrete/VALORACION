document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('#ratingStars .star');
  const form = document.getElementById('ratingForm');
  const reviewsContainer = document.getElementById('reviews');
  let currentRating = 0;

  const updateStars = (rating) => {
    stars.forEach((star, i) => star.classList.toggle('selected', i < rating));
  };

  stars.forEach((star, index) => {
    star.addEventListener('mouseover', () => updateStars(index + 1));
    star.addEventListener('mouseout', () => updateStars(currentRating));
    star.addEventListener('click', () => {
      currentRating = index + 1;
      updateStars(currentRating);
    });
  });

  // Nuevo flujo: envío directo con FormData
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('name').value.trim();
    const comentario = document.getElementById('comment').value.trim() || 'Sin comentario';
    const photoFile = document.getElementById('photo').files[0];

    if (!nombre) return alert('Ingresa tu nombre');
    if (currentRating === 0) return alert('Selecciona una valoración');

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('estrellas', currentRating);
    formData.append('comentario', comentario);
    if (photoFile) formData.append('imagen', photoFile);

    try {
      const res = await fetch('/.netlify/functions/subir-valoracion', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert('Valoración enviada correctamente');
      form.reset();
      currentRating = 0;
      updateStars(0);
      loadReviews();
    } catch (err) {
      console.error(err);
      alert('Error enviando valoración');
    }
  });

  async function loadReviews() {
    reviewsContainer.innerHTML = '<p>Cargando...</p>';
    try {
      const res = await fetch('/.netlify/functions/listar-valoraciones');
      const lista = await res.json();
      reviewsContainer.innerHTML = '';
      lista.forEach(d => {
        const div = document.createElement('div');
        div.classList.add('review');
        div.innerHTML = `
          <h3>${d.nombre}</h3>
          <p>${'★'.repeat(d.estrellas)}${'☆'.repeat(5 - d.estrellas)}</p>
          <p>${d.comentario}</p>
          ${d.imagen ? `<img src="${d.imagen}" alt="">` : ''}
        `;
        reviewsContainer.appendChild(div);
      });
    } catch {
      reviewsContainer.innerHTML = '<p>Error cargando valoraciones</p>';
    }
  }

  loadReviews();
});

