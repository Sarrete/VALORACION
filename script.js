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
  const photoFile = document.getElementById('photo').files[0];

  if (!name) { alert('Por favor, ingresa tu nombre.'); return; }
  if (!rating) { alert('Por favor, selecciona una valoración.'); return; }

  try {
    let photoURL = null;

    // Subir foto si hay
    if (photoFile) {
      const photoRef = ref(storage, `valoraciones/${Date.now()}_${photoFile.name}`);
      const snapshot = await uploadBytes(photoRef, photoFile);
      photoURL = await getDownloadURL(snapshot.ref);
    }

    // Guardar valoración en Firestore
    await addDoc(collection(db, 'valoraciones'), {
      name,
      rating: parseInt(rating, 10),
      comment: comment || 'Sin comentario',
      photoURL: photoURL || null,
      timestamp: serverTimestamp(),
      aprobado: false // Revisar antes de publicar
    });

    alert('Valoración enviada correctamente. Se revisará antes de publicarla.');
    form.reset();
    loadReviews(); // Actualizar valoraciones mostradas

  } catch (error) {
    console.error('Error al enviar valoración:', error);
    alert('Ocurrió un error al enviar tu valoración.');
  }
});

// Función para cargar valoraciones aprobadas
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
        <p>${'★'.repeat(data.rating)}${'☆'.repeat(5 - data.rating)}</p>
        <p>${data.comment}</p>
        ${data.photoURL ? `<img src="${data.photoURL}" alt="Foto valoracion" style="max-width:200px;">` : ''}
        <hr>
      `;

      reviewsContainer.appendChild(div);
    });

  } catch (error) {
    console.error('Error al cargar valoraciones:', error);
  }
}

// Cargar valoraciones al iniciar
loadReviews();