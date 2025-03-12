import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UniformeForm.css';

const apiUrl = import.meta.env.VITE_API_URL;

const UniformeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Referencia para el input de archivos
  const fileInputRef = useRef(null);

  // Estado para los campos de texto del uniforme
  const [uniforme, setUniforme] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    tipo: '',
  });

  // Fotos que ya existen en la base de datos (vinculadas al uniforme)
  const [existingPhotos, setExistingPhotos] = useState([]); 
  // Archivos nuevos que el usuario selecciona
  const [newFiles, setNewFiles] = useState([]); 
  // Vista previa de los archivos nuevos
  const [newPreviews, setNewPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchUniforme();
    }
  }, [id]);

  const fetchUniforme = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/uniformes/${id}`, {
        headers: { 'Accept': 'application/json' },
      });
      const data = response.data;
      // Llenamos los campos del uniforme
      setUniforme({
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
        tipo: data.tipo || '',
      });
      // Si el backend retorna un array data.fotos, lo guardamos en existingPhotos
      if (data.fotos && data.fotos.length > 0) {
        setExistingPhotos(data.fotos);
      }
    } catch (error) {
      setError('Error al obtener el uniforme: ' + error.message);
      console.error('Error al obtener el uniforme:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de cambios en los inputs de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUniforme({ ...uniforme, [name]: value });
  };

  // Dispara el click del input de archivos
  const handleAddMoreFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Maneja la selección de archivos nuevos
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    // Agregamos los archivos nuevos a los que ya hubiéramos seleccionado antes
    setNewFiles(prev => [...prev, ...files]);

    const previews = files.map(file => URL.createObjectURL(file));
    setNewPreviews(prev => [...prev, ...previews]);
  };

  // (Opcional) Eliminar una foto existente
  const handleRemoveExistingPhoto = async (fotoId) => {
    // Podrías hacer una petición DELETE a algo como: /api/fotos/{fotoId} 
    // o un endpoint que elimine esa foto en la base de datos. 
    // Si no quieres un botón de eliminar, omite esto.
    try {
      if (!window.confirm('¿Eliminar esta foto?')) return;
      // Aquí deberías tener un endpoint para eliminar la foto
      await axios.delete(`${apiUrl}/api/fotos/${fotoId}`);
      // Quitar la foto del estado existingPhotos
      setExistingPhotos(prev => prev.filter(f => f.id !== fotoId));
    } catch (err) {
      console.error('Error al eliminar la foto:', err);
      alert('No se pudo eliminar la foto');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('nombre', uniforme.nombre);
    formData.append('descripcion', uniforme.descripcion);
    formData.append('categoria', uniforme.categoria);
    formData.append('tipo', uniforme.tipo);

    // Solo subimos los archivos nuevos 
    if (newFiles.length > 0) {
      newFiles.forEach((file, index) => {
        formData.append(`fotos[${index}]`, file);
      });
    }

    try {
      if (id) {
        // Actualizar uniforme
        await axios.put(`${apiUrl}/api/uniformes/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Crear nuevo uniforme
        await axios.post(`${apiUrl}/api/uniformes`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/');
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setError('Validación fallida: ' + JSON.stringify(error.response.data.errors));
      } else {
        setError('Error al guardar el uniforme: ' + error.message);
      }
      console.error('Error al guardar el uniforme:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>{id ? 'Editar Uniforme' : 'Agregar Uniforme'}</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="error-message" style={{ color: 'red' }}>{error}</p>
      ) : (
        <form onSubmit={handleSubmit} className="uniforme-form" encType="multipart/form-data">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={uniforme.nombre}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={uniforme.descripcion}
              onChange={handleChange}
              required
              className="form-textarea"
            ></textarea>
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select
              name="categoria"
              value={uniforme.categoria}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Selecciona una categoría</option>
              <option value="Industriales">Industriales</option>
              <option value="Médicos">Médicos</option>
              <option value="Escolares">Escolares</option>
              <option value="Corporativos">Corporativos</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tipo</label>
            <input
              type="text"
              name="tipo"
              value={uniforme.tipo}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Ej. Overol, Batas, Playeras, Blusas"
            />
          </div>
          {/* Sección de fotos existentes */}
          {existingPhotos.length > 0 && (
            <div className="form-group">
              <label>Fotos existentes</label>
              <div className="existing-photos">
                {existingPhotos.map((foto) => (
                  <div key={foto.id} className="existing-photo">
                    <img
                      src={`${apiUrl}/storage/${foto.foto_path}`}
                      alt="Foto existente"
                      className="existing-photo-img"
                    />
                    {/* Botón para eliminar la foto (opcional) */}
                    <button
                      type="button"
                      className="remove-existing-btn"
                      onClick={() => handleRemoveExistingPhoto(foto.id)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input oculto para cargar nuevos archivos */}
          <div className="form-group">
            <label>Nuevas Fotos</label>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple
              accept="image/*"
              onChange={handleFilesChange}
            />
            <button type="button" className="btn btn-primary" onClick={handleAddMoreFiles}>
              Agregar más fotos
            </button>
            {newPreviews.length > 0 && (
              <div className="preview-images">
                {newPreviews.map((src, index) => (
                  <div key={index} className="preview-image">
                    <img src={src} alt={`Vista previa ${index}`} className="preview-img" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UniformeForm;
