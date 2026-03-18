import { Component } from '@angular/core';
import { CvAnalyzerService, EvaluacionRespuesta } from 'src/app/services/cv-analyzer.service';

@Component({
  selector: 'app-cv-analyzer',
  templateUrl: './cv-analyzer.component.html',
  styleUrls: ['./cv-analyzer.component.css']
})
export class CvAnalyzerComponent {
  archivos: File[] = [];
  keywords: string[] = [];
  nuevaKeyword = '';
  resultados: EvaluacionRespuesta[] = [];
  cargando = false;
  errorMsg = '';
  successMsg = '';
  isDragOver = false;
  fechaActual = new Date();
  analisisEjecutado = false;

  constructor(private cvService: CvAnalyzerService) {}

  // ========== DRAG & DROP ==========
  onDragOver(evt: DragEvent) {
    evt.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    this.isDragOver = false;
  }

  onDrop(evt: DragEvent) {
    evt.preventDefault();
    this.isDragOver = false;
    const files = evt.dataTransfer?.files;
    if (files && files.length > 0) {
      this.archivos = [...this.archivos, ...Array.from(files)];
      this.successMsg = `${files.length} archivo(s) agregado(s).`;
      this.errorMsg = '';
    }
  }

  // ========== INPUT FILE ==========
  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.archivos = [...this.archivos, ...Array.from(input.files)];
    this.successMsg = `${input.files.length} archivo(s) agregado(s).`;
    this.errorMsg = '';
    input.value = '';
  }

  removeFile(i: number) {
    this.archivos.splice(i, 1);
  }

  clearFiles() {
    this.archivos = [];
    this.resultados = [];
    this.analisisEjecutado = false;
  }

  // ========== KEYWORDS ==========
  addKeywordFromInput() {
    const val = (this.nuevaKeyword || '').trim();
    if (!val) return;
    if (!this.keywords.includes(val)) {
      this.keywords.push(val);
    }
    this.nuevaKeyword = '';
  }

  addKeywordFromSuggestion(s: string) {
    if (!this.keywords.includes(s)) this.keywords.push(s);
  }

  removeKeyword(i: number) {
    this.keywords.splice(i, 1);
  }

  clearKeywords() {
    this.keywords = [];
  }

  // ========== UTILS ==========
  getIniciales(nombre?: string): string {
    const safe = (nombre || '').trim();
    if (!safe) return '??';
    const partes = safe.split(/\s+/).slice(0, 2);
    return partes.map(p => p[0]?.toUpperCase() || '').join('');
  }

  getScore(r: any): number {
    const n = Number(r?.score);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  // ========== CONSUMO BACKEND ==========
  analizarCVs() {
    this.errorMsg = '';
    this.successMsg = '';
    this.resultados = [];
    this.analisisEjecutado = true;

    if (this.archivos.length === 0) {
      this.errorMsg = 'Por favor, agrega al menos un archivo (PDF/DOCX/TXT).';
      return;
    }
    if (this.keywords.length === 0) {
      this.errorMsg = 'Por favor, agrega al menos una palabra clave.';
      return;
    }

    this.cargando = true;

    this.cvService.evaluarCVs(this.archivos, this.keywords).subscribe({
      next: (resp: any) => {
        try {
          let payload: any = resp;

          // Si vino como string, intentar parsear
          if (typeof payload === 'string') {
            try { payload = JSON.parse(payload); } catch { /* ignorar */ }
          }

          // Extraer arreglo de resultados
          let arr: any[] = [];
          if (Array.isArray(payload)) {
            arr = payload;
          } else if (payload?.RespuestaModelo && Array.isArray(payload.RespuestaModelo)) {
            arr = payload.RespuestaModelo;
          } else if (payload?.respuestaModelo && Array.isArray(payload.respuestaModelo)) {
            arr = payload.respuestaModelo;
          } else if (payload?.data?.RespuestaModelo && Array.isArray(payload.data.RespuestaModelo)) {
            arr = payload.data.RespuestaModelo;
          }

          // Normalizar, filtrar y ordenar de MAYOR a MENOR puntuación
          this.resultados = (arr || [])
            .filter((r: any) => r && (typeof r.postulante === 'string' || typeof r.name === 'string'))
            .map((r: any) => ({
              postulante: (r.postulante || r.name || 'Postulante') as string,
              score: this.getScore(r) as number,
              explanation: (r.explanation || r.descripcion || '') as string
            }))
            .sort((a, b) => b.score - a.score); // 👈 aquí el orden descendente

          this.cargando = false;

          if (this.resultados.length > 0) {
            this.successMsg = 'Análisis completado correctamente.';
          } else {
            this.successMsg = '';
            this.errorMsg = 'No se recibieron resultados del modelo.';
          }
        } catch (e) {
          this.cargando = false;
          this.errorMsg = 'No se pudo interpretar la respuesta del servidor.';
        }
      },
      error: (err) => {
        this.errorMsg = err?.message || 'Error al analizar los CVs.';
        this.cargando = false;
      }
    });
  }
}
