document.getElementById('ratingForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Evita que el formulario se recargue al enviarlo

    // Obtén los valores del formulario
    const name = document.getElementById('name').value;
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value;

    // Crea un objeto de valoración
    const review = {
        name: name,
        rating: rating,
        comment: comment
    };

    // Almacena la valoración en localStorage (puedes usar un backend más adelante)
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    reviews.push(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));

    // Limpiar el formulario
    document.getElementById('ratingForm').reset();

    // Actualiza la lista de valoraciones
    displayReviews();
});

// Función para mostrar las valoraciones
function displayReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const reviewsContainer = document.getElementById('reviews');
    reviewsContainer.innerHTML = '';  // Limpiar el contenedor antes de añadir nuevas valoraciones

    reviews.forEach(review => {
        const reviewDiv = document.createElement('div');
        reviewDiv.classList.add('review');
        reviewDiv.innerHTML = `
            <strong>${review.name}</strong> - <span>${review.rating} estrellas</span>
            <p>${review.comment}</p>
        `;
        reviewsContainer.appendChild(reviewDiv);
    });
}

// Mostrar valoraciones almacenadas cuando se carga la página
displayReviews();
