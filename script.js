// script.js
// Importar Firebase como módulo
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBqGTWa97hI7Olw1LqRKlXtKi6Y5yV0Yks",
  authDomain: "valoracion-web-11af4.firebaseapp.com",
  projectId: "valoracion-web-11af4",
  storageBucket: "valoracion-web-11af4.appspot.com",
  messagingSenderId: "281280264244",
  appId: "1:281280264244:web:6a07b7c0b61872ecf73261",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Referencias a elementos HTML
const form = document.getElementById('ratingForm');
const reviewsContainer = document.getElementById('reviews');

// --- FUNCIONALIDAD ESTRELLAS ---
const stars = document.querySelectorAll('.star');
let selectedRating = 0;

stars.forEach(star => {
    star.addEventListener('mouseover', () => highlightStars(star.dataset.value));
    star.addEventListener('mouseout', () => highlightStars(selectedRating));
    star.addEventListener('click', () => {
        selectedRating = star.dataset.value;
        highlightStars(selectedRating);
    });
});

function highlightStars(value) {
    stars.forEach(star => {
        if (star.dataset.value <= value) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

// --- FUNCIONALIDAD ENVÍO VALORACIÓN ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const comment = document.getElementById('comment').value;

    if (!name) {
        alert('Por favor, ingresa tu nombre.');
        return;
    }

    if (!selectedRating) {
        alert('Por favor, selecciona una valoración.');
        return;
    }

    const review = {
        name: name,
        rating: parseInt(selectedRating, 10),
        comment: comment || 'Sin comentario'
    };
    
    console.log('Enviando:', review);

    try {
        const response = await fetch('/.netlify/functions/guardar-valoracion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Valoración enviada correctamente');
            displayReview(review); // Mostrar inmediatamente
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Error de conexión: ' + error.message);
    }

    form.reset();
    selectedRating = 0;
    highlightStars(0);
});

// --- FUNCIONALIDAD MOSTRAR RESEÑAS ---
function displayReview(review) {
    const container = document.createElement('div');
    container.classList.add('review');

    // Texto limitado a 3 líneas
    const text = document.createElement('p');
    text.classList.add('review-text');
    text.innerText = review.comment;
    container.appendChild(text);

    const seeMore = document.createElement('span');
    seeMore.classList.add('see-more');
    seeMore.innerText = ' Ver más';
    seeMore.addEventListener('click', () => {
        text.style.maxHeight = 'none';
        seeMore.style.display = 'none';
    });

    if (text.scrollHeight > 60) { // aprox. 3 líneas
        text.style.maxHeight = '60px';
        text.style.overflow = 'hidden';
        container.appendChild(seeMore);
    }

    // Estrellas doradas
    const starsContainer = document.createElement('div');
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.classList.add('review-stars');
        star.innerHTML = '&#9733;';
        if (i > review.rating) star.style.opacity = 0.3; // estrellas no seleccionadas
        starsContainer.appendChild(star);
    }
    container.appendChild(starsContainer);

    reviewsContainer.appendChild(container);
}
