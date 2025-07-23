export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
};

export const COLOR_PALETTES = {
  BLUE: 'blue',
  GREEN: 'green',
  GRAY: 'gray',
};

export const colorPalettesData = {
  [COLOR_PALETTES.BLUE]: ['#003366', '#00509E', '#74ADC8', '#9EBDD3', '#C8DDE8'],
  [COLOR_PALETTES.GREEN]: ['#007A33', '#5A9E53', '#8CB886', '#B2D2AF', '#D9E9D8'],
  [COLOR_PALETTES.GRAY]: ['#333333', '#666666', '#999999', '#CCCCCC', '#E6E6E6'],
};

export const initialChartData = {
  [CHART_TYPES.BAR]: {
    labels: ['Categoría 1', 'Categoría 2', 'Categoría 3', 'Categoría 4'],
    datasets: [{ label: 'Serie 1', data: [45, 62, 75, 55] }],
  },
  [CHART_TYPES.LINE]: {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [{ label: 'Tendencia 1', data: [33, 45, 52, 48, 60], tension: 0.1 }],
  },
  [CHART_TYPES.PIE]: {
    labels: ['Mercado A', 'Mercado B', 'Mercado C'],
    datasets: [{ label: 'Distribución', data: [300, 50, 100] }],
  },
  [CHART_TYPES.DOUGHNUT]: {
    labels: ['Producto X', 'Producto Y', 'Producto Z'],
    datasets: [{ label: 'Cuota', data: [120, 150, 180] }],
  },
}; 