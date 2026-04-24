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
    // Tomamos los valores reales que vienen de Gemini (o 0 si fallan)
    this.scoreGlobal = this.getScore(this.candidato?.score);
    this.scoreTecnico = this.getScore(this.candidato?.scoreTecnico);
    this.scoreExperiencia = this.getScore(this.candidato?.scoreExperiencia);
    this.scoreBlando = this.getScore(this.candidato?.scoreBlando);
    
    // Si Gemini devolvió datos de heatmap, los usamos. Si no, generamos uno por defecto de seguridad
    if (this.candidato?.heatmapData && Array.isArray(this.candidato.heatmapData)) {
      this.heatmapData = this.candidato.heatmapData;
    } else {
      this.generateFallbackHeatmap();
    }
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

  getDashOffset(val: number): number {
    return 157 - (157 * val / 100);
  }

  getHeatmapColor(intensity: number): string {
    // Usamos el color de la marca (Verde agua) basado en la intensidad
    return `rgba(0, 229, 192, ${Math.max(0.1, intensity)})`;
  }

  generateFallbackHeatmap() {
    const categories = ['Afinidad General', 'Requisitos Cumplidos'];
    const blocks = [1, 2, 3, 4, 5, 6, 7, 8];
    
    this.heatmapData = categories.map(cat => {
      return {
        category: cat,
        cells: blocks.map(() => {
          const base = this.scoreGlobal / 100;
          return Math.min(1, Math.max(0.1, base));
        })
      };
    });
  }
}