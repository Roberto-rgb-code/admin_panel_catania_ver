import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UniformeForm.css';

const apiUrl = import.meta.env.VITE_API_URL;
console.log("Valor de VITE_API_URL:", apiUrl);


const UniformeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uniforme, setUniforme] = useState({ nombre: '', descripcion: '', categoria: '', tipo: '', foto: null });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Usamos la variable de entorno para la URL base de la API
  const apiUrl = import.meta.env.VITE_API_URL;

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
      setUniforme({
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
        tipo: data.tipo || '',
        foto: null,
      });
      if (data.foto_path) {
        setFotoPreview(`${apiUrl}/storage/${data.foto_path}`);
      }
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
    const file = e.target.files[0];
    if (file) {
      setUniforme({ ...uniforme, foto: file });
      setFotoPreview(URL.createObjectURL(file));
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
    if (uniforme.foto) {
      formData.append('foto', uniforme.foto);
    }

    try {
      if (id) {
        await axios.put(`${apiUrl}/api/uniformes/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
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
          <div className="form-group">
            <label>Foto</label>
            <input
              type="file"
              name="foto"
              onChange={handleFileChange}
              accept="image/*"
              className="form-input"
            />
            {fotoPreview && (
              <img src={fotoPreview} alt="Vista previa" className="preview-img" style={{ maxWidth: '200px', marginTop: '10px' }} />
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
