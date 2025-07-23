// Slides data
let slides = [
  {
    title: 'Executive Summary',
    content: '- Resumen de los hallazgos clave\n- Implicaciones para el negocio\n- Próximos pasos sugeridos',
    image: null,
    chart: null
  }
];
let currentSlide = 0;

const slideList = document.getElementById('slide-list');
const addSlideBtn = document.getElementById('add-slide');
const slideTitle = document.getElementById('slide-title');
const slideContent = document.getElementById('slide-content');
const slidePreview = document.getElementById('slide-preview');
const suggestBtn = document.getElementById('suggest-content');
const exportBtn = document.getElementById('export-pptx');
const fullscreenBtn = document.getElementById('fullscreen-preview');
const imageUpload = document.getElementById('image-upload');
const templateSelect = document.getElementById('template-select');
const addBarChartBtn = document.getElementById('add-bar-chart');

function renderSlideList() {
  slideList.innerHTML = '';
  slides.forEach((slide, idx) => {
    const li = document.createElement('li');
    li.textContent = slide.title || `Diapositiva ${idx+1}`;
    li.className = idx === currentSlide ? 'selected' : '';
    li.onclick = () => {
      saveCurrentSlide();
      currentSlide = idx;
      loadCurrentSlide();
      renderSlideList();
    };
    slideList.appendChild(li);
  });
}

function loadCurrentSlide() {
  slideTitle.value = slides[currentSlide].title;
  slideContent.value = slides[currentSlide].content;
  templateSelect.value = '';
  if (slides[currentSlide].image) {
    imageUpload.value = '';
  }
  renderPreview();
}

function saveCurrentSlide() {
  slides[currentSlide].title = slideTitle.value;
  slides[currentSlide].content = slideContent.value;
}

addSlideBtn.onclick = () => {
  saveCurrentSlide();
  slides.push({ title: '', content: '' });
  currentSlide = slides.length - 1;
  loadCurrentSlide();
  renderSlideList();
};

slideTitle.oninput = slideContent.oninput = () => {
  renderPreview();
};

imageUpload.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    slides[currentSlide].image = ev.target.result;
    renderPreview();
  };
  reader.readAsDataURL(file);
};

templateSelect.onchange = () => {
  const val = templateSelect.value;
  if (val === 'executive') {
    slideTitle.value = 'Executive Summary';
    slideContent.value = '- Resumen de los hallazgos clave\n- Implicaciones para el negocio\n- Próximos pasos sugeridos';
  } else if (val === 'keyfindings') {
    slideTitle.value = 'Key Findings';
    slideContent.value = '- Hallazgo 1\n- Hallazgo 2\n- Hallazgo 3';
  } else if (val === 'nextsteps') {
    slideTitle.value = 'Next Steps';
    slideContent.value = '- Acción 1\n- Acción 2\n- Acción 3';
  } else if (val === 'custom') {
    slideTitle.value = '';
    slideContent.value = '';
  }
  renderPreview();
};

addBarChartBtn.onclick = () => {
  // Simple bar chart data
  slides[currentSlide].chart = [
    { label: 'A', value: 4 },
    { label: 'B', value: 7 },
    { label: 'C', value: 3 }
  ];
  renderPreview();
};

function renderPreview() {
  const title = slideTitle.value;
  const content = slideContent.value;
  const image = slides[currentSlide].image;
  const chart = slides[currentSlide].chart;
  let html = `<div class='slide-title'>${title || ''}</div>`;
  if (image) {
    html += `<img class='slide-image' src='${image}' alt='Imagen de la diapositiva' />`;
  }
  if (chart) {
    const max = Math.max(...chart.map(b => b.value), 1);
    html += `<div class='bar-chart'>` +
      chart.map(bar => `<div class='bar' style='height:${40 + 100*bar.value/max}px;'>${bar.value}<br><span style='font-size:0.8em;'>${bar.label}</span></div>`).join('') +
      `</div>`;
  }
  html += `<div class='slide-content'>${parseContent(content)}</div>`;
  slidePreview.innerHTML = html;
  // Animación de entrada
  slidePreview.classList.remove('animate-in');
  void slidePreview.offsetWidth;
  slidePreview.classList.add('animate-in');
}

// Permitir editar el gráfico de barras
slidePreview.addEventListener('click', function(e) {
  if (e.target.classList.contains('bar')) {
    const idx = Array.from(e.target.parentNode.children).indexOf(e.target);
    const newVal = prompt('Nuevo valor para la barra:', slides[currentSlide].chart[idx].value);
    if (newVal !== null && !isNaN(newVal)) {
      slides[currentSlide].chart[idx].value = Number(newVal);
      renderPreview();
    }
  }
});

function parseContent(text) {
  // Convierte líneas con - o * en bullets
  const lines = text.split(/\n/).filter(l => l.trim());
  if (lines.every(l => l.trim().startsWith('-') || l.trim().startsWith('*'))) {
    return '<ul>' + lines.map(l => `<li>${l.replace(/^[-*]\s*/, '')}</li>`).join('') + '</ul>';
  }
  return lines.map(l => `<div>${l}</div>`).join('');
}

suggestBtn.onclick = () => {
  alert('Simulación: Claude sugeriría contenido relevante aquí.');
};

exportBtn.onclick = () => {
  saveCurrentSlide();
  if (typeof PptxGenJS === 'undefined') {
    alert('PptxGenJS no está cargado. Descarga la librería para exportar a PPTX.');
    return;
  }
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  slides.forEach(slide => {
    const slideObj = pptx.addSlide({
      background: { fill: 'FFFFFF' }
    });
    slideObj.addText(slide.title || '', {
      x: 0.5, y: 0.5, w: 8, h: 1,
      fontSize: 32,
      bold: true,
      color: '003366',
      fontFace: 'Arial',
      align: 'left'
    });
    let y = 1.6;
    if (slide.image) {
      slideObj.addImage({ data: slide.image, x: 1.5, y: y, w: 5.5, h: 2.2 });
      y += 2.4;
    }
    if (slide.chart) {
      slideObj.addChart(pptx.ChartType.bar, [
        {
          name: 'Datos',
          labels: slide.chart.map(b => b.label),
          values: slide.chart.map(b => b.value)
        }
      ], {
        x: 1.5, y: y, w: 5.5, h: 2.2,
        barDir: 'col',
        chartColors: ['003366'],
        showLegend: false,
        showValue: true
      });
      y += 2.4;
    }
    if (slide.content) {
      const lines = slide.content.split(/\n/).filter(l => l.trim());
      if (lines.every(l => l.trim().startsWith('-') || l.trim().startsWith('*'))) {
        slideObj.addText(lines.map(l => l.replace(/^[-*]\s*/, '')).join('\n'), {
          x: 0.7, y: y, w: 7.5, h: 4.5,
          fontSize: 20,
          color: '222222',
          fontFace: 'Arial',
          bullet: true,
          align: 'left',
          lineSpacingMultiple: 1.3
        });
      } else {
        slideObj.addText(slide.content, {
          x: 0.7, y: y, w: 7.5, h: 4.5,
          fontSize: 20,
          color: '222222',
          fontFace: 'Arial',
          align: 'left',
          lineSpacingMultiple: 1.3
        });
      }
    }
  });
  pptx.writeFile({ fileName: 'Presentacion-Consultora.pptx' });
};

fullscreenBtn.onclick = () => {
  if (slidePreview.requestFullscreen) {
    slidePreview.requestFullscreen();
  } else if (slidePreview.webkitRequestFullscreen) { /* Safari */
    slidePreview.webkitRequestFullscreen();
  } else if (slidePreview.msRequestFullscreen) { /* IE11 */
    slidePreview.msRequestFullscreen();
  }
};

// Inicialización
renderSlideList();
loadCurrentSlide(); 