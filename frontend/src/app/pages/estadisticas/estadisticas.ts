import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';

import { CommonModule } from '@angular/common';
import { EstadisticasService } from '../../services/estadisticas.service';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Estadísticas</h1>

      @if (!cargando) {
        <div class="stats-grid">

          <div class="card">
            <h2>Proyectos por estado</h2>
            <div #donutProyectos class="donut-container"></div>
          </div>

          <div class="card">
            <h2>Tareas por estado</h2>
            <div #donutTareas class="donut-container"></div>
          </div>

          <div class="card card-full">
            <h2>Proyectos por cliente</h2>
            <div class="chart-wrapper">
              <canvas #barCanvas></canvas>
            </div>
          </div>

          <div class="card card-full">
            <h2>Alertas</h2>
            <div class="alerta" [class.danger]="stats.proyectosRetrasados > 0">
              <span>Proyectos activos retrasados</span>
              <strong>{{ stats.proyectosRetrasados }}</strong>
            </div>
            <div class="alerta">
              <span>Clientes activos sin proyectos</span>
              <strong>{{ stats.clientesSinProyectos }}</strong>
            </div>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card-full { grid-column: 1 / -1; }
    .donut-container { display: flex; align-items: center; gap: 20px; padding: 8px 0; min-height: 140px; }
    .chart-wrapper { position: relative; height: 260px; }
    .alerta {
      display: flex; justify-content: space-between;
      padding: 12px; border-radius: 6px;
      background: #f8f9fa; margin-bottom: 10px;
    }
    .alerta.danger { background: #f8d7da; color: #721c24; }
    .alerta strong { font-size: 20px; }
  `]
})
export class EstadisticasComponent implements OnInit, AfterViewInit {
  private estadisticasService = inject(EstadisticasService);

  @ViewChild('donutProyectos') donutProyectosRef!: ElementRef<HTMLDivElement>;
  @ViewChild('donutTareas') donutTareasRef!: ElementRef<HTMLDivElement>;
  @ViewChild('barCanvas') barCanvasRef!: ElementRef<HTMLCanvasElement>;

  stats: any = {};
  cargando = true;

  private colores: Record<string, string> = {
    ACTIVO: '#1D9E75',
    FINALIZADO: '#378ADD',
    BAJA: '#E24B4A',
    PENDIENTE: '#EF9F27',
  };

  ngOnInit() {
    this.estadisticasService.getEstadisticas().subscribe(data => {
      this.stats = data;
      this.cargando = false;
      setTimeout(() => this.renderizar(), 50);
    });
  }

  ngAfterViewInit() {}

  private renderizar() {
    this.buildDonut(this.donutProyectosRef, this.stats.proyectosPorEstado, 'estado');
    this.buildDonut(this.donutTareasRef, this.stats.tareasPorEstado, 'estado');
    this.buildBarras();
  }

  private buildDonut(ref: ElementRef<HTMLDivElement>, datos: any[], labelKey: string) {
    if (!ref?.nativeElement || !datos?.length) return;

    const total = datos.reduce((s: number, d: any) => s + Number(d.cantidad), 0);
    const size = 130, cx = 65, cy = 65, r = 52, innerR = 32;

    let paths = '';

    if (datos.length === 1) {
      const color = this.colores[datos[0][labelKey]] ?? '#aaa';
      paths = `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />
        <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="white" />
      `;
    } else {
      let angle = -Math.PI / 2;
      for (const d of datos) {
        const valor = Number(d.cantidad);
        const sweep = (valor / total) * 2 * Math.PI;
        const x1 = cx + r * Math.cos(angle);
        const y1 = cy + r * Math.sin(angle);
        const x2 = cx + r * Math.cos(angle + sweep);
        const y2 = cy + r * Math.sin(angle + sweep);
        const ix1 = cx + innerR * Math.cos(angle);
        const iy1 = cy + innerR * Math.sin(angle);
        const ix2 = cx + innerR * Math.cos(angle + sweep);
        const iy2 = cy + innerR * Math.sin(angle + sweep);
        const la = sweep > Math.PI ? 1 : 0;
        const color = this.colores[d[labelKey]] ?? '#aaa';
        paths += `<path d="M${x1} ${y1} A${r} ${r} 0 ${la} 1 ${x2} ${y2} L${ix2} ${iy2} A${innerR} ${innerR} 0 ${la} 0 ${ix1} ${iy1}Z"
                        fill="${color}" stroke="white" stroke-width="2"/>`;
        angle += sweep;
      }
    }

    const svg = `
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        ${paths}
        <text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="11" fill="#888">Total</text>
        <text x="${cx}" y="${cy + 13}" text-anchor="middle" font-size="18" font-weight="500" fill="#333">${total}</text>
      </svg>`;

    const legend = datos.map((d: any) => {
      const color = this.colores[d[labelKey]] ?? '#aaa';
      return `<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#555;margin-bottom:4px;">
        <span style="width:10px;height:10px;border-radius:2px;background:${color};flex-shrink:0;"></span>
        ${d[labelKey]} <strong style="color:#222;">${d.cantidad}</strong>
      </div>`;
    }).join('');

    ref.nativeElement.innerHTML = svg + `<div>${legend}</div>`;
  }

  private buildBarras() {
    if (!this.barCanvasRef?.nativeElement || !this.stats.proyectosPorCliente?.length) return;

    const datos = this.stats.proyectosPorCliente;

    new Chart(this.barCanvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: datos.map((d: any) => d.cliente),
        datasets: [{
          label: 'Proyectos',
          data: datos.map((d: any) => Number(d.cantidad)),
          backgroundColor: '#378ADD',
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: '#666' },
            grid: { color: 'rgba(0,0,0,0.06)' }
          },
          x: {
            ticks: { color: '#666', autoSkip: false },
            grid: { display: false }
          }
        }
      }
    });
  }
}