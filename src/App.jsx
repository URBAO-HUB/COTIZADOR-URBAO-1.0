import React, { useState } from 'react';
import jsPDF from 'jspdf';
import logo from './assets/Logotipo-Texto-Gris.png'; // Ruta correcta del logo
import firma from './assets/Firma Arq Hdz.png'; // Ruta correcta de la firma
import './index.css'; // Asegúrate de que los estilos estén importados

function App() {
  const serviciosConPrecios = [
    { nombre: 'Anteproyecto Arquitectónico', precio: 100 },
    { nombre: 'Proyecto Ejecutivo con Licencia de Construcción', precio: 250 },
    { nombre: 'Proyecto Ejecutivo sin Licencia de Construcción', precio: 200 },
    { nombre: 'Proyecto Estructural con Memoria de Calculo', precio: 100 },
    { nombre: 'Proyecto Estructural sin Memoria de Calculo', precio: 75 },
    { nombre: 'Proyecto Eléctrico', precio: 50 },
    { nombre: 'Render incluyendo modelado 3d', precio: 50 },
    { nombre: 'Recorrido Virtual Cinematográfico', precio: 25 },
    { nombre: 'Ampliación', precio: 250 },
    { nombre: 'Remodelación', precio: 300 },
    { nombre: 'Construcción Llave en Mano', precio: 16000 },
    { nombre: 'Construcción Obra Negra', precio: 7500 },
    { nombre: 'Mantenimiento', precio: 25 },
    { nombre: 'Urbanización', precio: 1200 },
    { nombre: 'Cálculo de Presupuesto Desglosado', precio: 25 },
    { nombre: 'Levantamiento Físico', precio: 40 },
    { nombre: 'Levantamiento Topográfico', precio: 5 },
    { nombre: 'Dictamen de Seguridad Estructural', precio: 11 }
  ];

  const preciosServiciosMap = serviciosConPrecios.reduce((acc, servicio) => {
    acc[servicio.nombre] = servicio.precio;
    return acc;
  }, {});

  const [form, setForm] = useState({
    cliente: '',
    asunto: '',
    domicilio: '', // Nuevo campo
    grupoServicios: [],
    tipoInmueble: '',
    superficie: '',
    porcentajeDescuento: '',
    iva: 16,
    secuencia: '01',
    periodoTrabajo: '',
    vigenciaPresupuesto: '15 días',
    formaPago: '50% Anticipo, 50% Finiquito Contra Entrega',
    observaciones: 'El cliente proveerá la documentación necesaria para procesar el servicio',
    ubicacionIVA: 'interior', // 'interior' o 'frontera'
    ubicacionServicio: '', // Nuevo campo
    consecutivoReferencia: '01', // Campo para modificar el consecutivo
  });

  const [nuevoServicio, setNuevoServicio] = useState('');
  const tiposInmueble = [
    'Casa Habitación', 'Casa Habitación tipo Residencial', 'Casa Prefabricada', 'Apartamento', 'Oficina',
    'Edificio de Condominio', 'Edificio de Oficinas', 'Local Comercial', 'Bodega', 
    'Nave Industrial', 'Escuela Kinder', 'Escuela Primaria', 'Escuela Secundaria', 
    'Escuela Preparatoria', 'Plantel Universitario', 'Hotel', 'Casa de Retiro', 'Iglesia', 
    'Tejaban', 'Fachada', 'Barda', 'Fraccionamiento'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const agregarServicio = () => {
    if (nuevoServicio && !form.grupoServicios.includes(nuevoServicio)) {
      setForm({
        ...form,
        grupoServicios: [...form.grupoServicios, nuevoServicio],
      });
      setNuevoServicio('');
    }
  };

  const eliminarServicio = (servicioAEliminar) => {
    setForm({
      ...form,
      grupoServicios: form.grupoServicios.filter(servicio => servicio !== servicioAEliminar),
    });
  };

  const obtenerFecha = () => {
    const fecha = new Date();
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    const diaSemana = dias[fecha.getDay()];
    return `${diaSemana}, ${dia} de ${mes} de ${anio}`;
  };

  const obtenerReferencia = () => {
    const fecha = new Date();
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear().toString().slice(-2);
    const hora = fecha.getHours().toString().padStart(2, '0'); 
    const minutos = fecha.getMinutes().toString().padStart(2, '0'); 

    const secuencia = `01${hora}${minutos}`; // Combinación fija + hora + minutos

    return `UR-${anio}${mes}${dia}-${secuencia}`;
  };

  const calcularTotal = () => {
    if (!form.superficie || form.superficie <= 0) {
      return {
        precioServiciosSeleccionados: 0,
        precioConDescuento: 0,
        iva: 0,
        total: 0,
        descuento: 0,
      };
    }
    const precioServiciosSeleccionados = form.grupoServicios.reduce((total, servicio) => {
      return total + (preciosServiciosMap[servicio] * form.superficie);
    }, 0);

    const descuento = (form.porcentajeDescuento / 100) * precioServiciosSeleccionados;
    const precioConDescuento = precioServiciosSeleccionados - descuento;
    const iva = (form.ubicacionIVA === 'frontera' ? 8 : form.iva) / 100 * precioConDescuento;
    const total = precioConDescuento + iva;
    return {
      precioServiciosSeleccionados,
      precioConDescuento,
      iva,
      total,
      descuento,
    };
  };

  const generarPDF = () => {
    if (!form.cliente || !form.superficie || form.grupoServicios.length === 0) {
      alert("Por favor, complete todos los campos necesarios.");
      return;
    }

    const { precioServiciosSeleccionados, precioConDescuento, iva, total, descuento } = calcularTotal();

    const doc = new jsPDF();
    doc.addImage(logo, 'PNG', 20, 10, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text('Cotización de Servicios Profesionales', 105, 30, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Fecha: ${obtenerFecha()}`, 20, 50);
    doc.text(`Ref. No.: ${obtenerReferencia()}`, 20, 55);
    doc.setFont("helvetica", "bold");
    doc.text(`Atención: ${form.cliente}`, 20, 60);
    doc.setFont("helvetica", "normal");

    doc.text('Estimable Cliente,', 20, 75,);

    // Modificar el "Asunto" para evitar que se desborde
    const asunto = `Nos complace presentarle a continuación nuestra propuesta para los Servicios Profesionales de ${form.grupoServicios.join(', ')} , para ${form.tipoInmueble} con una superficie aproximada de ${form.superficie} m²`;
    const lineas = doc.splitTextToSize(asunto, 170);
    let y = 85;
    lineas.forEach((linea, index) => {
      doc.text(linea, 20, y + index * 5);
  });

    doc.setFont("helvetica", "bold");
    doc.text(`Localizacion del Inmueble: ${form.domicilio}`, 20, 110);
    doc.setFont("helvetica", "normal");
    doc.text(`IMPORTE DE PRESUPUESTO: $${precioServiciosSeleccionados.toFixed(2)} MXN`, 20, 120);
    doc.text(`DESCUENTO: ${form.porcentajeDescuento}%`, 20, 130);
    doc.text(`IMPORTE CON DESCUENTO: $${precioConDescuento.toFixed(2)} MXN`, 20, 150);
    doc.text(`USTED AHORRA: $${descuento.toFixed(2)} MXN`, 20, 140);
    doc.text(`IVA (${form.ubicacionIVA === 'frontera' ? '8' : form.iva}%): $${iva.toFixed(2)} MXN`, 20, 160);
    doc.setFont("helvetica", "bold");    
    doc.setFontSize(10);
    doc.text(`TOTAL DEL PRESUPUESTO: $${total.toFixed(2)} MXN`, 20, 170);
    doc.setFont("helvetica", "normal");    
    doc.setFontSize(10);
    doc.text(`PERIODO DE TRABAJO: ${form.periodoTrabajo} meses`, 20, 190);
    doc.text(`VIGENCIA DEL PRESUPUESTO: ${form.vigenciaPresupuesto}`, 20, 200);
    doc.text(`FORMA DE PAGO: ${form.formaPago}`, 20, 210);
    doc.text(`OBSERVACIONES: ${form.observaciones}`, 20, 220);
    doc.text('Atentamente', 105, 235, { align: 'center' });
    doc.addImage(firma, 'PNG', 70, 237, 50, 20);
    doc.setFont("helvetica", "bold");    
    doc.setFontSize(10);
    doc.text('Arq. Luis D. Hernández,', 105, 260, { align: 'center' });
    doc.setFont("helvetica", "normal");    
    doc.setFontSize(10);
    doc.text('Director General', 105, 265, { align: 'center' });
    doc.text('Tijuana Baja California, México, Tel. 664-376-5871, correo electrónico: cubikmex@gmail.com', 105, 290, { align: 'center' });

    const pdfBlob = doc.output('blob');

    // Verifica si la Web Share API está disponible
    if (navigator.share) {
      navigator.share({
        files: [
          new File([pdfBlob], 'cotizacion.pdf', { type: 'application/pdf' })
        ],
        title: 'Cotización de Servicios Profesionales',
        text: 'Aquí está la cotización solicitada.',
      }).then(() => {
        console.log('Archivo enviado correctamente');
      }).catch((error) => {
        console.log('Error al intentar compartir:', error);
      });
    } else {
      alert('No se puede compartir el archivo en este navegador');
    }
  };

  return (
    <div className="form-container">
      <h1>Cotización de Servicios Profesionales</h1>
      <form>
        <div className="form-group">
          <label>Cliente:</label>
          <input
            type="text"
            name="cliente"
            value={form.cliente}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
  <label>Tipo de Inmueble:</label>
  <select
    name="tipoInmueble"
    value={form.tipoInmueble}
    onChange={handleChange}
  >
    <option value="">Selecciona un tipo de inmueble</option>
    {tiposInmueble.map((tipo, index) => (
      <option key={index} value={tipo}>
        {tipo}
      </option>
    ))}
  </select>
</div>

        <div className="form-group">
          <label>Grupo de Servicios:</label>
          <select
            name="grupoServicios"
            value={nuevoServicio}
            onChange={(e) => setNuevoServicio(e.target.value)}
          >
            <option value="">Selecciona un servicio</option>
            {serviciosConPrecios.map((servicio, index) => (
              <option key={index} value={servicio.nombre}>
                {servicio.nombre} - ${servicio.precio} MXN/m²
              </option>
            ))}
          </select>
          <button type="button" onClick={agregarServicio}>Agregar servicio</button>
        </div>

        <div className="form-group">
          <label>Servicios Seleccionados:</label>
          <ul>
            {form.grupoServicios.map((servicio, index) => (
              <li key={index}>
                {servicio} <button type="button" onClick={() => eliminarServicio(servicio)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </div>

        
        <div className="form-group">
          <label>Superficie (m²):</label>
          <input
            type="number"
            name="superficie"
            value={form.superficie}
            onChange={handleChange}
          />
        </div>
        

        <div className="form-group">
          <label>DOMICILIO:</label>
          <textarea
            name="domicilio"
            value={form.domicilio}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>% Descuento:</label>
          <input
            type="number"
            name="porcentajeDescuento"
            value={form.porcentajeDescuento}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>% IVA:</label>
          <input
            type="number"
            name="iva"
            value={form.iva}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>PERIODO DE TRABAJO (meses):</label>
          <input
            type="text"
            name="periodoTrabajo"
            value={form.periodoTrabajo}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>VIGENCIA DEL PRESUPUESTO:</label>
          <input
            type="text"
            name="vigenciaPresupuesto"
            value={form.vigenciaPresupuesto}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>FORMA DE PAGO:</label>
          <input
            type="text"
            name="formaPago"
            value={form.formaPago}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>OBSERVACIONES:</label>
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
          />
        </div>

        <div className="previsualizacion">
          <h3>Previsualización de la Cotización</h3>
          <p><strong>Precio de Servicios Seleccionados: </strong> ${calcularTotal().precioServiciosSeleccionados.toFixed(2)} MXN</p>
          <p><strong>Precio con Descuento: </strong> ${calcularTotal().precioConDescuento.toFixed(2)} MXN</p>
          <p><strong>IVA: </strong> ${calcularTotal().iva.toFixed(2)} MXN</p>
          <p><strong>Total: </strong> ${calcularTotal().total.toFixed(2)} MXN</p>
        </div>

        <button type="button" onClick={generarPDF}>Generar PDF</button>
      </form>
    </div>
  );
}

export default App;
