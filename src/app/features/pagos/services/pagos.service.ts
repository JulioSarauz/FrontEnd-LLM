import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CrearOrdenRequest, CrearOrdenResponse } from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  // Asegúrate de que environment.apiUrl apunte a tu backend (ej. 'http://localhost:3000/api')
  private apiUrl = `${environment.apiUrl}/pagos`; 

  constructor(private http: HttpClient) {}

  crearOrden(data: CrearOrdenRequest): Observable<CrearOrdenResponse> {
    return this.http.post<CrearOrdenResponse>(`${this.apiUrl}/crear-orden`, data);
  }

  capturarOrden(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/capturar-orden/${orderId}`, {});
  }
}