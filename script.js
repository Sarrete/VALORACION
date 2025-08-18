// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

document.addEventListener('DOMContentLoaded', () => {

    // --- Inicializar Firebase ---
    const firebaseConfig = {
        apiKey: "AIzaSyBqGTWa97hI7Olw1LqRKlXtKi6Y5yV0Yks",
        authDomain: "valoracion-web-11af4.firebaseapp.com",
        projectId: "valoracion-web-11af4",
        storageBucket: "valoracion-web-11af4.appspot.com",
        messagingSenderId: "281280264244",
        appId: "1:281280264244:web:6a07b7c0b61872ecf73261"
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const storage = getStorage(app);

    // --- Variables del DOM ---
    const stars = document.querySelectorAll('#ratingStars .star');
    const form = document.getElementById('ratingForm');
    const reviewsContainer = document.getElementById('reviews');
    let currentRating = 0;

    // --- Función para actualizar visualmente las estrellas ---
    function updateStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    // --- Eventos de estrellas ---
    stars.forEach((star, index) => {
        star.addEventListener('mouseover', () => {
            updateStars(index + 1);
        });
        star.addEventListener('mouseout', () => {
            updateStars(currentRating);
        });
        star.addEventListener('click', () => {
            currentRating = index + 1;
            updateStars(currentRating);
        });
    });

    // --- Input oculto para enviar rating en el formulario ---
    const ratingInput = document.createElement('input');
    ratingInput.type = 'hidden';
    ratingInput.name = 'rating';
    ratingInput.value = currentRating;
    form.appendChild(ratingInput);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        ratingInput.value = currentRating;

        const name = document.getElementById('name').value.trim();
        const comment = document.getElementById('comment').value;
        const photoFile = document.getElementById('photo').files[0];

        if (!name) { alert('Por favor, ingresa tu nombre.'); return; }
        if (currentRating === 0) { alert('Por favor, selecciona una valoración.'); return; }

        try {
            let photoURL = null;
            if (photoFile) {
                const photoRef = ref(storage, `valoraciones/${Date.now()}_${photoFile.name}`);
                const snapshot = await uploadBytes(photoRef, photoFile);
                photoURL = await getDownloadURL(snapshot.ref);
            }

            await addDoc(collection(db, 'valoraciones'), {
                name,
                rating: currentRating,
                comment: comment || 'Sin comentario',
                photoURL: photoURL || null,
                timestamp: serverTimestamp(),
                aprobado: false
            });

            alert('Valoración enviada correctamente. Se revisará antes de publicarla.');
            form.reset();
            currentRating = 0;
            updateStars(0);
            loadReviews();

        } catch (err) {
            console.error(err);
            alert('Error al enviar la valoración.');
        }
    });

    // --- Función para cargar valoraciones ---
    async function loadReviews() {
        reviewsContainer.innerHTML = '';
        try {
            const q = query(
                collection(db, 'valoraciones'),
                where('aprobado', '==', true),
                orderBy('timestamp', 'desc')
            );
            const snapshot = await getDocs(q);

            snapshot.forEach(doc => {
                const data = doc.data();
                const div = document.createElement('div');
                div.classList.add('review');
                div.innerHTML = `
                    <h3>${data.name}</h3>
                    <p style="color: gold; font-size: 1.5rem; margin: 0;">
                        ${'★'.repeat(data.rating)}${'☆'.repeat(5 - data.rating)}
                    </p>
                    <p>${data.comment}</p>
                    ${data.photoURL ? `<img src="${data.photoURL}" alt="Foto valoracion">` : ''}
                `;
                reviewsContainer.appendChild(div);
            });

        } catch (err) {
            console.error(err);
        }
    }

    // --- Cargar reseñas al iniciar ---
    loadReviews();
});
