import { Component } from '@angular/core';
import { CvAnalyzerService, EvaluacionRespuesta } from '../services/cv-analyzer.service';
// Asegúrate de importar el PagosService que creamos antes
import { PagosService } from '../../pagos/services/pagos.service';

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
  isUploading = false;
  errorMsg = '';
  successMsg = '';
  isDragOver = false;
  fechaActual = new Date();
  analisisEjecutado = false;

  tokens = 10;
  costoAnalisis = 5;
  
  // Variables para la pasarela de pagos
  showPlanModal = false;
  procesandoPago = false;
  ordenActualId: string | null = null;
  ordenActualTokens: number = 0; // Para saber cuántos tokens sumar al verificar

  selectedCandidate: any = null;
  selectedRank: number = 0;

  constructor(
    private cvService: CvAnalyzerService,
    private pagosService: PagosService // Inyectamos el servicio
  ) {}

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
      this.handleFiles(files);
    }
  }

  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.handleFiles(input.files);
    input.value = '';
  }

  private handleFiles(files: FileList | File[]) {
    this.isUploading = true;
    const nuevosArchivos = Array.from(files);
    setTimeout(() => {
      this.archivos = [...this.archivos, ...nuevosArchivos];
      this.successMsg = `${this.archivos.length} archivo(s) listo(s).`;
      this.errorMsg = '';
      this.isUploading = false;
    }, 500);
  }

  removeFile(i: number) {
    this.archivos.splice(i, 1);
  }

  clearFiles() {
    this.archivos = [];
    this.resultados = [];
    this.analisisEjecutado = false;
    this.successMsg = '';
    this.errorMsg = '';
  }

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

  analizarCVs() {
    this.errorMsg = '';
    this.successMsg = '';

    if (this.tokens < this.costoAnalisis) {
      this.abrirModalPlanes();
      return;
    }

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

    this.tokens -= this.costoAnalisis;
    this.cargando = true;

    this.cvService.evaluarCVs(this.archivos, this.keywords).subscribe({
      next: (resp: any) => {
        try {
          let payload: any = resp;
          if (typeof payload === 'string') {
            try { payload = JSON.parse(payload); } catch {}
          }

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

          this.resultados = (arr || [])
            .filter((r: any) => r && (typeof r.postulante === 'string' || typeof r.name === 'string'))
            .map((r: any) => ({
              postulante: (r.postulante || r.name || 'Postulante') as string,
              score: this.getScore(r) as number,
              explanation: (r.explanation || r.descripcion || '') as string
            }))
            .sort((a, b) => b.score - a.score);

          this.cargando = false;

          if (this.resultados.length > 0) {
            this.successMsg = 'Análisis completado correctamente.';
          } else {
            this.successMsg = '';
            this.errorMsg = 'No se encontraron coincidencias suficientes.';
          }
        } catch (e) {
          this.cargando = false;
          this.errorMsg = 'No se pudo interpretar la respuesta del servidor.';
        }
      },
      error: (err) => {
        this.errorMsg = err?.message || 'Error al analizar los CVs.';
        this.cargando = false;
        this.tokens += this.costoAnalisis;
      }
    });
  }

  verDetalle(candidato: any, index: number) {
    this.selectedCandidate = candidato;
    this.selectedRank = index;
  }

  cerrarDetalle() {
    this.selectedCandidate = null;
  }

  // --- LÓGICA DE PAGOS ---

  abrirModalPlanes() {
    this.showPlanModal = true;
    this.ordenActualId = null;
    this.procesandoPago = false;
  }

  closePlanModal() {
    this.showPlanModal = false;
    this.ordenActualId = null;
    this.procesandoPago = false;
  }

  iniciarCompra(monto: number, tokensAdquirir: number) {
  this.procesandoPago = true;
  
  // MANDAMOS SOLO MONTO Y TOKENS. El usuarioId lo pone el backend desde el JWT.
  this.pagosService.crearOrden({ monto, tokens: tokensAdquirir } as any).subscribe({
    next: (res) => {
      this.ordenActualId = res.orderId;
      this.ordenActualTokens = tokensAdquirir;
      const approveLink = res.links.find((l: any) => l.rel === 'approve');
      if (approveLink) {
        window.open(approveLink.href, '_blank');
      }
      this.procesandoPago = false;
    },
    error: (err) => {
      this.procesandoPago = false;
      this.errorMsg = 'Error al generar orden de pago.';
    }
  });
}

  verificarPago() {
    if (!this.ordenActualId) return;
    
    this.procesandoPago = true;
    
    this.pagosService.capturarOrden(this.ordenActualId).subscribe({
      next: (res:any) => {
        // Pago exitoso
        this.tokens += this.ordenActualTokens;
        this.successMsg = `¡Pago verificado! Se han añadido ${this.ordenActualTokens} tokens a tu cuenta.`;
        this.closePlanModal();
        
        setTimeout(() => { this.successMsg = ''; }, 5000);
      },
      error: (err:any) => {
        console.error(err);
        this.procesandoPago = false;
        // Mantenemos el modal abierto por si aún no aprueba en PayPal
        alert('El pago aún no se ha reflejado. Asegúrate de haber completado el proceso en la ventana de PayPal antes de verificar.');
      }
    });
  }

  cancelarOrden() {
    this.ordenActualId = null;
    this.procesandoPago = false;
  }
}