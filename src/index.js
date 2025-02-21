// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Importa tu archivo de estilos
import App from './App'; // El componente principal de tu aplicación
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // Asegúrate de que este archivo existe

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Registra el service worker para convertir tu app en una PWA
serviceWorkerRegistration.register();
