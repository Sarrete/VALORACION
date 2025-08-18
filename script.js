// Seleccionar todas las estrellas del formulario
const stars = document.querySelectorAll('#ratingStars .star');
let currentRating = 0;

// Función para actualizar las estrellas visualmente
function updateStars(rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

// Al pasar el ratón por encima
stars.forEach((star, index) => {
    star.addEventListener('mouseover', () => {
        updateStars(index + 1); // Se ilumina hasta la estrella sobre la que estamos
    });

    star.addEventListener('mouseout', () => {
        updateStars(currentRating); // Vuelve al valor seleccionado
    });

    // Al hacer clic en la estrella
    star.addEventListener('click', () => {
        currentRating = index + 1; // Guardamos la valoración
        updateStars(currentRating);
    });
});

// Antes de enviar el formulario, guardamos el rating en un input oculto
const ratingInput = document.createElement('input');
ratingInput.type = 'hidden';
ratingInput.name = 'rating';
ratingInput.value = currentRating;
form.appendChild(ratingInput);

form.addEventListener('submit', () => {
    ratingInput.value = currentRating; // Actualizamos el input oculto con la valoración seleccionada
});
