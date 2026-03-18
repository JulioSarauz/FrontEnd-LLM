import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface EvaluacionRespuesta {
  postulante: string;
  score: number;
  explanation: string;
}

@Injectable({ providedIn: 'root' })
export class CvAnalyzerService {
  private url = `${environment.apiBase}/evaluacion/evaluar`;

  constructor(private http: HttpClient) {}

  evaluarCVs(
    files: File[],
    keywords: string[]
  ): Observable<EvaluacionRespuesta | EvaluacionRespuesta[]> {
    const formData = new FormData();
    for (const f of files) formData.append('files', f, f.name);
    formData.append('keywords', JSON.stringify(keywords));

    return this.http
      .post<EvaluacionRespuesta | EvaluacionRespuesta[]>(this.url, formData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('[CV Analyzer API Error]', error);
    const msg = error.error?.message || 'Error al conectar con el servidor';
    return throwError(() => new Error(msg));
  }
}
