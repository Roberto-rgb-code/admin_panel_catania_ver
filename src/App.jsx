// admin-panel/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UniformesList from './components/UniformesList';
import UniformeForm from './components/UniformeForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UniformesList />} />
        <Route path="/nuevo" element={<UniformeForm />} />
        <Route path="/editar/:id" element={<UniformeForm />} />
      </Routes>
    </Router>
  );
}

export default App;