// admin-panel/src/components/UniformesList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './UniformesList.css';

const UniformesList = () => {
  const [uniformes, setUniformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUniformes();
  }, []);

  const fetchUniformes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/uniformes');
      // Ajusta según la estructura real de la respuesta de Laravel
      const data = response.data; // Si la API devuelve un arreglo directamente, usa response.data
      // Si la API envuelve los datos en 'data', usa response.data.data
      setUniformes(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      setError('Error al obtener uniformes: ' + error.message);
      console.error('Error al obtener uniformes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este uniforme?')) {
      try {
        await axios.delete(`http://localhost:8000/api/uniformes/${id}`);
        fetchUniformes();
      } catch (error) {
        setError('Error al eliminar el uniforme: ' + error.message);
        console.error('Error al eliminar el uniforme:', error);
      }
    }
  };

  return (
    <div className="admin-container">
      <h1>Administrar Uniformes</h1>
      <Link to="/nuevo" className="btn btn-primary">Agregar Uniforme</Link>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="error-message" style={{ color: 'red' }}>{error}</p>
      ) : (
        <div className="uniformes-grid">
          {uniformes.length === 0 ? (
            <p>No hay uniformes registrados.</p>
          ) : (
            uniformes.map(uniforme => (
              <div key={uniforme.id} className="uniforme-card">
                {uniforme.foto_path ? (
                  <img src={`http://localhost:8000/storage/${uniforme.foto_path}`} alt={uniforme.nombre} className="uniforme-image" />
                ) : (
                  <div className="uniforme-image placeholder">No hay foto</div>
                )}
                <div className="uniforme-content">
                  <h3>{uniforme.nombre}</h3>
                  <p>{uniforme.descripcion}</p>
                  <p>Categoría: {uniforme.categoria}</p>
                  <div className="uniforme-actions">
                    <Link to={`/editar/${uniforme.id}`} className="btn btn-primary-small">Editar</Link>
                    <button className="btn btn-secondary-small" onClick={() => handleDelete(uniforme.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UniformesList;