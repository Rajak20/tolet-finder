import api from '../services/api';

export async function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
    };
  });
}

export async function handleImageUpload(propertyId, fileList) {
  const formData = new FormData();
  for (const file of fileList) {
    const compressed = await compressImage(file);
    formData.append('images', compressed, file.name);
  }
  await api.post(`/owner/properties/${propertyId}/images`, formData);
}