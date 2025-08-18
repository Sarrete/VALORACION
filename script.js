// script.js
// Importar Firebase como módulo
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

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

// Función para enviar valoración
form.addEventListener('submit', async (e) => {
  e.preventDefault();

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
        const response = await fetch('/.netlify/functions/guardar-valoracion', {  // ← FIX URL
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
