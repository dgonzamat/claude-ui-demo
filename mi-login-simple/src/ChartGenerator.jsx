import React, { useState, useEffect, useRef } from 'react';
import PptxGenJS from 'pptxgenjs';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as XLSX from 'xlsx';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { CHART_TYPES, COLOR_PALETTES, colorPalettesData, initialChartData } from './constants';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels);

export default function ChartGenerator() {
  const [chartType, setChartType] = useState(CHART_TYPES.BAR);
  const [chartData, setChartData] = useState(initialChartData[CHART_TYPES.BAR]);
  const [title, setTitle] = useState('Título del Gráfico');
  const [designOptions, setDesignOptions] = useState({
    legend: true,
    colorPalette: COLOR_PALETTES.BLUE,
    showDataLabels: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleResetData = () => {
    setChartType(CHART_TYPES.BAR);
    setChartData(initialChartData[CHART_TYPES.BAR]);
    setTitle('Título del Gráfico');
    setDesignOptions({ legend: true, colorPalette: COLOR_PALETTES.BLUE, showDataLabels: false });
  };

  const isMultiSeriesDisabled = chartType === CHART_TYPES.PIE || chartType === CHART_TYPES.DOUGHNUT;

  useEffect(() => {
    if (isMultiSeriesDisabled && chartData.datasets.length > 1) {
      setChartData(prevData => ({
        ...prevData,
        datasets: [prevData.datasets[0]]
      }));
    }
  }, [chartType, chartData.datasets.length, isMultiSeriesDisabled]);

  const handleTypeChange = (newType) => {
    setChartType(newType);
    setChartData(initialChartData[newType]);
  };
  
  const handleDesignChange = (option, value) => {
    setDesignOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleLabelChange = (index, value) => {
    const newLabels = chartData.labels.map((oldLabel, labelIndex) => 
      labelIndex === index ? value : oldLabel
    );
    setChartData(prevData => ({ ...prevData, labels: newLabels }));
  };

  const handleDatasetLabelChange = (datasetIndex, value) => {
    const newDatasets = chartData.datasets.map((dataset, i) => {
      if (i === datasetIndex) {
        return { ...dataset, label: value };
      }
      return dataset;
    });
    setChartData(prevData => ({ ...prevData, datasets: newDatasets }));
  };

  const handleDataValueChange = (datasetIndex, dataIndex, value) => {
    const newDatasets = chartData.datasets.map((dataset, i) => {
      if (i === datasetIndex) {
        const newData = dataset.data.map((d, j) => 
          j === dataIndex ? Number(value) || 0 : d
        );
        return { ...dataset, data: newData };
      }
      return dataset;
    });
    setChartData(prevData => ({ ...prevData, datasets: newDatasets }));
  };

  const handleAddColumn = () => {
    const newLabel = `Nueva Cat.`;
    setChartData(prevData => {
        const newLabels = [...prevData.labels, newLabel];
        const newDatasets = prevData.datasets.map(dataset => ({
            ...dataset,
            data: [...dataset.data, 0]
        }));
        return { ...prevData, labels: newLabels, datasets: newDatasets };
    });
  };

  const handleRemoveColumn = (indexToRemove) => {
      if (chartData.labels.length <= 1) {
          toast.error("Debe haber al menos una columna de datos.");
          return;
      }
      setChartData(prevData => {
          const newLabels = prevData.labels.filter((_, index) => index !== indexToRemove);
          const newDatasets = prevData.datasets.map(dataset => ({
              ...dataset,
              data: dataset.data.filter((_, index) => index !== indexToRemove)
          }));
          return { ...prevData, labels: newLabels, datasets: newDatasets };
      });
  };

  const handleAddRow = () => {
    if (isMultiSeriesDisabled) return;
    setChartData(prevData => {
      const newDataset = {
        label: `Serie ${prevData.datasets.length + 1}`,
        data: Array(prevData.labels.length).fill(0),
      };
      return { ...prevData, datasets: [...prevData.datasets, newDataset] };
    });
  };

  const handleRemoveRow = (indexToRemove) => {
    if (chartData.datasets.length <= 1) {
      // No mostramos toast aquí porque el botón estará deshabilitado y tendrá un title.
      return;
    }
    setChartData(prevData => ({
      ...prevData,
      datasets: prevData.datasets.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading('Procesando archivo de Excel...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        if (json.length < 2) {
          throw new Error("El Excel debe tener al menos 2 filas (cabeceras y una serie).");
        }

        const headerRow = json[0];
        const numberOfColumns = headerRow.length;

        if (numberOfColumns < 2) {
            throw new Error("El Excel debe tener al menos 2 columnas (nombre de serie y un valor).");
        }

        const labels = headerRow.slice(1);
        
        const datasets = json.slice(1).map((row, rowIndex) => {
            if (row.length !== numberOfColumns) {
                throw new Error(`La fila ${rowIndex + 2} tiene un número de columnas incorrecto. Se esperaban ${numberOfColumns}.`);
            }
            const dataPoints = row.slice(1).map((cell, cellIndex) => {
                const num = Number(cell);
                if (isNaN(num)) {
                    throw new Error(`Valor no numérico ('${cell}') encontrado en la fila ${rowIndex + 2}, columna ${cellIndex + 2}.`);
                }
                return num;
            });

            return {
              label: row[0] || `Serie ${rowIndex + 1}`,
              data: dataPoints,
            };
        });

        setChartData({ labels, datasets });
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
        toast.success('Gráfico actualizado con éxito.', { id: toastId });

      } catch (error) {
        console.error("Error al procesar el archivo:", error);
        toast.error(`Error de formato: ${error.message}`, { id: toastId, duration: 5000 });
      } finally {
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
        toast.error('No se pudo leer el archivo.', { id: toastId });
        setIsImporting(false);
    };
    reader.readAsArrayBuffer(file);
    event.target.value = null;
  };

  const triggerFileInput = () => {
      fileInputRef.current.click();
  };

  const getChartOptions = () => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: designOptions.legend, position: 'top', align: 'end' },
        title: { display: true, text: title, font: { size: 18 } },
        datalabels: {
          display: designOptions.showDataLabels,
          color: (context) => {
            if (chartType === CHART_TYPES.PIE || chartType === CHART_TYPES.DOUGHNUT) {
                // Para gráficos claros, texto oscuro
                const color = context.dataset.backgroundColor[context.dataIndex];
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                return brightness > 155 ? '#000000' : '#FFFFFF';
            }
            return '#FFFFFF';
          },
          font: {
            weight: 'bold',
          },
          formatter: (value) => {
            return value !== 0 ? value : null;
          },
          // Posicionamiento específico por tipo de gráfico
          anchor: chartType === CHART_TYPES.BAR ? 'center' : 'end',
          align: chartType === CHART_TYPES.BAR ? 'center' : 'end',
        },
      },
    };

    if (chartType === CHART_TYPES.BAR || chartType === CHART_TYPES.LINE) {
      options.scales = {
        x: { grid: { display: false } },
        y: { grid: { color: '#e0e3e8' } },
      };
    }
    
    return options;
  };

  const getChartDataWithColors = () => {
    // Ya no necesitamos una copia profunda aquí si el estado se maneja inmutablemente.
    // Los componentes del gráfico re-renderizarán de todos modos.
    const newChartData = { ...chartData };
    const palette = colorPalettesData[designOptions.colorPalette];
    
    if (isMultiSeriesDisabled) {
      if (newChartData.datasets.length > 0) {
        newChartData.datasets[0].backgroundColor = palette;
      }
    } else {
      newChartData.datasets.forEach((dataset, index) => {
        const color = palette[index % palette.length];
        if (chartType === CHART_TYPES.BAR) {
          dataset.backgroundColor = color;
        } else if (chartType === CHART_TYPES.LINE) {
          dataset.borderColor = color;
          dataset.backgroundColor = color;
          dataset.tension = 0.1;
        }
      });
    }
    return newChartData;
  };

  const handleExport = () => {
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();
    
    slide.addText(title, { x: 0.5, y: 0.25, w: '90%', h: 0.75, fontSize: 24, bold: true, color: '003366', align: 'center' });

    let chartPptxData = chartData.datasets.map(dataset => ({
      name: dataset.label,
      labels: chartData.labels,
      values: dataset.data,
    }));

    if (isMultiSeriesDisabled && chartPptxData.length > 0) {
        chartPptxData = [{
            name: chartData.datasets[0].label || title,
            labels: chartData.labels,
            values: chartData.datasets[0].data
        }];
    }

    let type = pptx.charts[chartType.toUpperCase()];
    const chartPptxOptions = {
      x: 1, y: 1.2, w: 8, h: 4,
      ...(!isMultiSeriesDisabled && { legendPos: designOptions.legend ? 't' : 'none' }),
      ...(isMultiSeriesDisabled && { dataLabelFormatCode: '#,##0.0"%"', showPercent: true }),
      chartColors: colorPalettesData[designOptions.colorPalette],
    };
    
    if (chartType === CHART_TYPES.BAR) chartPptxOptions.barDir = 'col';
    if (chartType === CHART_TYPES.DOUGHNUT) chartPptxOptions.holeSize = 50;
    
    slide.addChart(type, chartPptxData, chartPptxOptions);
    pptx.writeFile({ fileName: `${title}.pptx` });
  };

  // Componente interno para la tabla de datos, mejora la legibilidad
  const DataTable = () => (
    <table className="data-table">
      <thead>
        <tr>
          <th>
            <div className="header-content">
              <span>Nombre de Serie</span>
            </div>
          </th>
          {chartData.labels.map((label, index) => (
            <th key={index}>
              <div className="header-content">
                <input type="text" value={label} onChange={(e) => handleLabelChange(index, e.target.value)} className="header-input"/>
                <button onClick={() => handleRemoveColumn(index)} className="btn-remove-col" title="Eliminar Columna">×</button>
              </div>
            </th>
          ))}
          <th>
            <div className="header-content">
              <button onClick={handleAddColumn} className="btn-add-col" title="Agregar Columna">+</button>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {chartData.datasets.map((dataset, datasetIndex) => (
          <tr key={datasetIndex}>
            <td>
              <input type="text" value={dataset.label} onChange={(e) => handleDatasetLabelChange(datasetIndex, e.target.value)} placeholder={`Serie ${datasetIndex + 1}`} disabled={isMultiSeriesDisabled} />
            </td>
            {dataset.data.map((data, dataIndex) => (
              <td key={dataIndex}>
                <input type="number" value={data} onChange={(e) => handleDataValueChange(datasetIndex, dataIndex, e.target.value)} />
              </td>
            ))}
            <td>
              <button 
                onClick={() => handleRemoveRow(datasetIndex)} 
                className="btn-remove-row" 
                disabled={isMultiSeriesDisabled || chartData.datasets.length <= 1}
                title={chartData.datasets.length <= 1 ? "No se puede eliminar la última serie." : "Eliminar serie"}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="chart-generator-container">
      <div className="editor-panel">
        <h3>1. Tipo de Gráfico</h3>
        <div className="chart-type-selector">
          {Object.values(CHART_TYPES).map(type => (
            <button key={type} onClick={() => handleTypeChange(type)} className={chartType === type ? 'active' : ''}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="title-and-reset">
            <h3>2. Título y Datos</h3>
            <div>
                <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".xlsx, .xls" disabled={isImporting} />
                <button onClick={triggerFileInput} className="btn-import-excel" disabled={isImporting}>
                    {isImporting ? 'Importando...' : 'Importar Excel'}
                </button>
                <button onClick={handleResetData} className="btn-reset" disabled={isImporting}>Reiniciar</button>
            </div>
        </div>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del Gráfico" className="chart-title-input" />

        <div className="labels-editor-header">
            <h4>Tabla de Datos</h4>
            <button onClick={() => setIsModalOpen(true)} className="btn-expand-table">Expandir Tabla</button>
        </div>
        <div className="data-table-container-small">
            <div className="data-table-container">
              <DataTable />
            </div>
            <div className="add-row-container-small">
                <button onClick={handleAddRow} className="btn-add-row" disabled={isMultiSeriesDisabled}>
                    Agregar Serie
                </button>
            </div>
        </div>
        
        <h3>3. Diseño del Gráfico</h3>
        <div className="design-options">
          <div className="option-row">
            <label>Paleta de Colores</label>
            <select value={designOptions.colorPalette} onChange={(e) => handleDesignChange('colorPalette', e.target.value)}>
              {Object.values(COLOR_PALETTES).map(palette => (
                <option key={palette} value={palette}>{palette.charAt(0).toUpperCase() + palette.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="option-row">
            <label>Mostrar Leyenda</label>
            <input type="checkbox" checked={designOptions.legend} onChange={(e) => handleDesignChange('legend', e.target.checked)} />
          </div>
          <div className="option-row">
            <label>Mostrar Valores</label>
            <input type="checkbox" checked={designOptions.showDataLabels} onChange={(e) => handleDesignChange('showDataLabels', e.target.checked)} />
          </div>
        </div>

        <h3>4. Exportar</h3>
        <button onClick={handleExport} className="export-button">Exportar a PowerPoint</button>
      </div>
      <div className="preview-panel">
        <h3>Previsualización</h3>
        <div className="chart-preview">
          {chartType === CHART_TYPES.BAR && <Bar options={getChartOptions()} data={getChartDataWithColors()} />}
          {chartType === CHART_TYPES.LINE && <Line options={getChartOptions()} data={getChartDataWithColors()} />}
          {chartType === CHART_TYPES.PIE && <Pie options={getChartOptions()} data={getChartDataWithColors()} />}
          {chartType === CHART_TYPES.DOUGHNUT && <Doughnut options={getChartOptions()} data={getChartDataWithColors()} />}
        </div>
      </div>
       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="modal-table-container">
            <h2>Editar Tabla de Datos</h2>
            <div className="data-table-container">
                <DataTable />
                <button onClick={handleAddRow} className="btn-add-row" disabled={isMultiSeriesDisabled}>
                    Agregar Serie
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
} 