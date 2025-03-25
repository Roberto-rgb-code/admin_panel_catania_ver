import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UniformeForm.css';

const apiUrl = import.meta.env.VITE_API_URL;

const UniformeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [uniforme, setUniforme] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    tipo: '',
  });

  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
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
      const response = await axios.get(`${apiUrl}/api/${id}`, {
        headers: { 'Accept': 'application/json' },
      });
      const data = response.data;
      setUniforme({
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        categoria: data.categoria || '',
        tipo: data.tipo || '',
      });
      if (data.fotos && data.fotos.length > 0) {
        setExistingPhotos(data.fotos);
      }
    } catch (error) {
      setError('Error al obtener el uniforme: ' + (error.response?.data?.message || error.message));
      console.error('Error al obtener el uniforme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUniforme({ ...uniforme, [name]: value });
  };

  const handleAddMoreFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewPreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveExistingPhoto = async (fotoId) => {
    try {
      if (!window.confirm('¿Eliminar esta foto?')) return;
      await axios.delete(`${apiUrl}/api/fotos/${fotoId}`);
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
    if (uniforme.nombre) formData.append('nombre', uniforme.nombre);
    if (uniforme.descripcion) formData.append('descripcion', uniforme.descripcion);
    if (uniforme.categoria) formData.append('categoria', uniforme.categoria);
    if (uniforme.tipo) formData.append('tipo', uniforme.tipo);

    if (newFiles.length > 0) {
      newFiles.forEach((file, index) => {
        formData.append(`fotos[${index}]`, file);
      });
    }

    console.log('Datos enviados al backend:', [...formData]);

    try {
      if (id) {
        await axios.put(`${apiUrl}/api/uniformes-destacados/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${apiUrl}/api/uniformes-destacados`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/');
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        setError('Validación fallida: ' + Object.values(validationErrors).flat().join(', '));
        console.error('Errores de validación del backend:', validationErrors);
      } else {
        setError('Error al guardar el uniforme: ' + (error.response?.data?.message || error.message));
      }
      console.error('Error completo:', error.response?.data || error);
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
              required={!id} // Obligatorio solo al crear
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={uniforme.descripcion}
              onChange={handleChange}
              required={!id} // Obligatorio solo al crear
              className="form-textarea"
            ></textarea>
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select
              name="categoria"
              value={uniforme.categoria}
              onChange={handleChange}
              required={!id} // Obligatorio solo al crear
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
              required={!id} // Obligatorio solo al crear
              className="form-input"
              placeholder="Ej. Overol, Batas, Playeras, Blusas"
            />
          </div>
          {existingPhotos.length > 0 && (
            <div className="form-group">
              <label>Fotos Existentes</label>
              <div className="existing-photos">
                {existingPhotos.map((foto) => (
                  <div key={foto.id} className="existing-photo">
                    <img
                      src={`${apiUrl}/storage/${foto.foto_path}`}
                      alt="Foto existente"
                      className="existing-photo-img"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+image';
                        console.error('Error al cargar imagen:', `${apiUrl}/storage/${foto.foto_path}`);
                      }}
                    />
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
              onClick={() => navigate('/')} // Corregido de onChange a onClick
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
