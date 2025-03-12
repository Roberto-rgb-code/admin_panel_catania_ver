import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './UniformesList.css';

const UniformesList = () => {
  const [uniformes, setUniformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL base definida en el .env
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUniformes();
  }, []);

  const fetchUniformes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/uniformes`, {
        headers: { 'Accept': 'application/json' },
      });
      // Se espera que el backend retorne uniformes con la relación "fotos"
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setUniformes(data);
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
        await axios.delete(`${apiUrl}/api/uniformes/${id}`);
        fetchUniformes();
      } catch (error) {
        setError('Error al eliminar el uniforme: ' + error.message);
        console.error('Error al eliminar el uniforme:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 text-red-600">
          <p className="text-xl mb-2">{error}</p>
          <button onClick={() => fetchUniformes()} className="mt-4 btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>Administrar Uniformes</h1>
      <Link to="/nuevo" className="btn btn-primary">Agregar Uniforme</Link>
      {uniformes.length === 0 ? (
        <p>No hay uniformes registrados.</p>
      ) : (
        <div className="uniformes-grid">
          {uniformes.map((uniforme) => (
            <div key={uniforme.id} className="uniforme-card">
              <div className="uniforme-images">
                {uniforme.fotos && uniforme.fotos.length > 0 ? (
                  <img
                    src={`${apiUrl}/storage/${uniforme.fotos[0].foto_path}`}
                    alt={uniforme.nombre}
                    className="uniforme-image"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=No+image';
                    }}
                  />
                ) : uniforme.foto_path ? (
                  <img
                    src={`${apiUrl}/storage/${uniforme.foto_path}`}
                    alt={uniforme.nombre}
                    className="uniforme-image"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=No+image';
                    }}
                  />
                ) : (
                  <div className="uniforme-image placeholder">No hay foto</div>
                )}
              </div>
              <div className="uniforme-content">
                <h3>{uniforme.nombre}</h3>
                <p>{uniforme.descripcion}</p>
                <p>Categoría: {uniforme.categoria}</p>
                <p>Tipo: {uniforme.tipo}</p>
                <div className="uniforme-actions">
                  <Link to={`/editar/${uniforme.id}`} className="btn btn-primary-small">
                    Editar
                  </Link>
                  <button
                    className="btn btn-secondary-small"
                    onClick={() => handleDelete(uniforme.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniformesList;
