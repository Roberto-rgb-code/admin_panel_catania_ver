// admin-panel/src/components/UniformeForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UniformeForm.css';

const UniformeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uniforme, setUniforme] = useState({ nombre: '', descripcion: '', categoria: '' });
  const [foto, setFoto] = useState(null);
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
      const response = await axios.get(`http://localhost:8000/api/uniformes/${id}`);
      setUniforme({
        nombre: response.data.data.nombre,
        descripcion: response.data.data.descripcion,
        categoria: response.data.data.categoria,
      });
    } catch (error) {
      setError('Error al obtener el uniforme: ' + error.message);
      console.error('Error al obtener el uniforme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUniforme({ ...uniforme, [name]: value });
  };

  const handleFileChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('nombre', uniforme.nombre);
    formData.append('descripcion', uniforme.descripcion);
    formData.append('categoria', uniforme.categoria);
    if (foto) {
      formData.append('foto', foto);
    }

    try {
      if (id) {
        await axios.put(`http://localhost:8000/api/uniformes/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('http://localhost:8000/api/uniformes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/');
    } catch (error) {
      setError('Error al guardar el uniforme: ' + error.message);
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
            </select>
          </div>
          <div className="form-group">
            <label>Foto</label>
            <input
              type="file"
              name="foto"
              onChange={handleFileChange}
              accept="image/*"
              className="form-input"
              required={!id}
            />
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