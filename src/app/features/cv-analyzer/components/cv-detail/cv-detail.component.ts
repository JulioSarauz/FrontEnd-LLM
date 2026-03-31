import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-cv-detail',
  templateUrl: './cv-detail.component.html'
})
export class CvDetailComponent implements OnInit {
  @Input() candidato: any;
  @Input() rank: number = 0;
  @Output() volver = new EventEmitter<void>();

  scoreGlobal: number = 0;
  scoreTecnico: number = 0;
  scoreExperiencia: number = 0;
  scoreBlando: number = 0;
  
  heatmapData: any[] = [];

  ngOnInit() {
    this.scoreGlobal = this.getScore(this.candidato?.score);
    this.scoreTecnico = Math.min(100, this.scoreGlobal + Math.floor(Math.random() * 10));
    this.scoreExperiencia = Math.max(0, this.scoreGlobal - (this.rank * 3));
    this.scoreBlando = Math.min(100, this.scoreGlobal + (Math.random() * 15 - 5));
    this.generateHeatmap();
  }

  getScore(score: any): number {
    const n = Number(score);
    return isNaN(n) ? 0 : Math.max(0, Math.min(100, Math.round(n)));
  }

  getIniciales(nombre?: string): string {
    const safe = (nombre || '').trim();
    if (!safe) return '??';
    return safe.split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
  }

  getColor(val: number): string {
    if (val >= 80) return '#00e5c0';
    if (val >= 60) return '#fb923c';
    return '#ff5c7a';
  }

  getRotation(val: number): number {
    return (val * 1.8) - 90;
  }

  getDashOffset(val: number): number {
    return 157 - (157 * val / 100);
  }

  generateHeatmap() {
    const categories = ['Frontend', 'Backend', 'Arquitectura', 'Bases de Datos', 'DevOps', 'Agile'];
    const blocks = [1, 2, 3, 4, 5, 6, 7, 8];
    
    this.heatmapData = categories.map(cat => {
      return {
        category: cat,
        cells: blocks.map(() => {
          const base = this.scoreGlobal / 100;
          const variance = Math.random() * 0.5 - 0.2;
          const intensity = Math.min(1, Math.max(0.05, base + variance));
          return intensity;
        })
      };
    });
  }

  getHeatmapColor(intensity: number): string {
    return `rgba(0, 229, 192, ${intensity})`;
  }
}
