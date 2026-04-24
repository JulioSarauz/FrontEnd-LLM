import { Component, OnInit } from '@angular/core';
import { CvAnalyzerService, EvaluacionRespuesta } from '../services/cv-analyzer.service';
import { PagosService } from '../../pagos/services/pagos.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-cv-analyzer',
  templateUrl: './cv-analyzer.component.html',
  styleUrls: ['./cv-analyzer.component.css']
})
export class CvAnalyzerComponent implements OnInit {
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

  tokens = 0;
  costoAnalisis = 5;
  nombreUsuario = '';
  inicialesUsuario = '';
  showUserMenu = false;
  
  showPlanModal = false;
  procesandoPago = false;
  ordenActualId: string | null = null;
  ordenActualTokens: number = 0;

  selectedCandidate: any = null;
  selectedRank: number = 0;

  showHistorialModal = false;
  cargandoHistorial = false;
  historialEvaluaciones: any[] = [];

  constructor(
    private cvService: CvAnalyzerService,
    private pagosService: PagosService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarDatosEstaticosUsuario();
    this.actualizarTokensDesdeBD();
  }

  cargarDatosEstaticosUsuario() {
    const token = localStorage.getItem('botisfy_token') || localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.nombreUsuario = payload.name || payload.given_name || payload.email || 'Usuario';
        const partes = this.nombreUsuario.split(/[\s.@]+/);
        this.inicialesUsuario = partes.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
      } catch (e) {
        this.nombreUsuario = 'Usuario';
        this.inicialesUsuario = 'US';
      }
    }
  }

  actualizarTokensDesdeBD() {
    this.authService.getPerfil().subscribe({
      next: (perfil: any) => {
        this.tokens = perfil.tokens || 0;
      },
      error: () => {
        this.tokens = 0;
      }
    });
  }

  cerrarSesion() {
    this.showUserMenu = false;
    localStorage.removeItem('token');
    localStorage.removeItem('botisfy_token');
    this.authService.logout();
  }

  abrirHistorial() {
    this.showHistorialModal = true;
    this.cargandoHistorial = true;
    this.cvService.obtenerHistorial().subscribe({
      next: (data) => {
        this.historialEvaluaciones = data;
        this.cargandoHistorial = false;
      },
      error: (err) => {
        this.errorMsg = 'Error al cargar el historial.';
        this.cargandoHistorial = false;
      }
    });
  }

  cerrarHistorial() {
    this.showHistorialModal = false;
  }

  cargarResultadosDelHistorial(evaluacion: any) {
    this.keywords = evaluacion.keywords || [];
    this.resultados = evaluacion.resultados || [];
    this.analisisEjecutado = true;
    this.archivos = new Array(this.resultados.length).fill({name: 'Documento Analizado (Historial)'});
    this.cerrarHistorial();
  }

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
    const todosArchivos = Array.from(files);
    const pdfs = todosArchivos.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));

    if (pdfs.length < todosArchivos.length) {
      this.errorMsg = 'Solo se permiten archivos en formato PDF.';
      return;
    }

    if (this.archivos.length + pdfs.length > 5) {
      this.errorMsg = 'Solo puedes subir un máximo de 5 currículums a la vez para el análisis.';
      return;
    }

    this.isUploading = true;
    setTimeout(() => {
      this.archivos = [...this.archivos, ...pdfs];
      this.successMsg = `${this.archivos.length} archivo(s) listo(s).`;
      this.errorMsg = '';
      this.isUploading = false;
    }, 500);
  }

  removeFile(i: number) {
    this.archivos.splice(i, 1);
    if (this.archivos.length === 0) {
      this.successMsg = '';
    } else {
      this.successMsg = `${this.archivos.length} archivo(s) listo(s).`;
    }
  }

  clearFiles() {
    this.archivos = [];
    this.keywords = [];
    this.resultados = [];
    this.analisisEjecutado = false;
    this.successMsg = '';
    this.errorMsg = '';
    this.selectedCandidate = null;
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
    this.analisisEjecutado = false;

    if (this.archivos.length === 0) {
      this.errorMsg = 'Por favor, agrega al menos un archivo (PDF).';
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
              explanation: (r.explanation || r.descripcion || '') as string,
              scoreTecnico: r.scoreTecnico,
              scoreExperiencia: r.scoreExperiencia,
              scoreBlando: r.scoreBlando,
              heatmapData: r.heatmapData
            }))
            .sort((a, b) => b.score - a.score);

          this.cargando = false;

          if (this.resultados.length > 0) {
            this.analisisEjecutado = true;
            this.successMsg = 'Análisis completado correctamente.';
            this.actualizarTokensDesdeBD();
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
        this.successMsg = `¡Pago verificado exitosamente!`;
        this.actualizarTokensDesdeBD();
        this.closePlanModal();
        
        setTimeout(() => { this.successMsg = ''; }, 5000);
      },
      error: (err:any) => {
        this.procesandoPago = false;
        alert('El pago aún no se ha reflejado. Asegúrate de haber completado el proceso en la ventana de PayPal antes de verificar.');
      }
    });
  }

  cancelarOrden() {
    this.ordenActualId = null;
    this.procesandoPago = false;
  }
}