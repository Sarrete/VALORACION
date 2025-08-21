// netlify/functions/subir-foto.js
import fetch from 'node-fetch';
import FormData from 'form-data';

export default async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { imageBase64 } = req.body || {};
    if (!imageBase64) return res.status(400).json({ message: 'No image' });

    const form = new FormData();
    form.append('file', imageBase64);
    form.append('upload_preset', process.env.CLOUD_PRESET); // preset sin firma
    // o con firma: generar signature con API_SECRET en backend

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`,
      { method: 'POST', body: form }
    );
    const data = await cloudRes.json();

    if (data.secure_url) {
      return res.status(200).json({ imageUrl: data.secure_url });
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
