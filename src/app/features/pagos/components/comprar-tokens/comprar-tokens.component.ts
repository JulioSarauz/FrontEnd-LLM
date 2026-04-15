import { Component } from '@angular/core';
import { PagosService } from '../../services/pagos.service';

@Component({
  selector: 'app-comprar-tokens',
  templateUrl: './comprar-tokens.component.html',
  styleUrls: ['./comprar-tokens.component.css']
})
export class ComprarTokensComponent {
  planes = [
    { nombre: 'Básico', monto: 10, tokens: 50000 },
    { nombre: 'Pro', monto: 25, tokens: 150000 },
  ];

  ordenActualId: string | null = null;
  cargando = false;
  mensaje = '';

  constructor(private pagosService: PagosService) {}

  iniciarCompra(plan: any) {
    this.cargando = true;
    this.mensaje = 'Generando orden de pago segura...';

    // Aquí debes reemplazar esto con el ID real del usuario logueado.
    // Usualmente lo obtienes de tu AuthService o decodificando tu JWT.
    const usuarioId = localStorage.getItem('userId') || 'ID_DE_PRUEBA_MONGO';

    const request = {
      usuarioId: usuarioId,
      monto: plan.monto,
      tokens: plan.tokens
    };

    this.pagosService.crearOrden(request).subscribe({
      next: (res) => {
        this.ordenActualId = res.orderId;
        const approveLink = res.links.find(link => link.rel === 'approve');

        if (approveLink) {
          this.mensaje = 'Por favor, completa el pago en la ventana emergente de PayPal.';
          // Abre PayPal en una nueva pestaña
          window.open(approveLink.href, '_blank');
        }
        this.cargando = false;
      },
      error: (err) => {
        this.mensaje = 'Error al conectar con el servidor de pagos.';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  verificarPago() {
    if (!this.ordenActualId) return;

    this.cargando = true;
    this.mensaje = 'Verificando tu pago con PayPal...';

    this.pagosService.capturarOrden(this.ordenActualId).subscribe({
      next: (res) => {
        this.mensaje = '¡Pago completado! Tokens acreditados exitosamente a tu cuenta.';
        this.ordenActualId = null; // Reinicia el flujo
        this.cargando = false;
      },
      error: (err) => {
        this.mensaje = 'No se pudo verificar el pago. Asegúrate de haberlo aprobado en PayPal.';
        this.cargando = false;
        console.error(err);
      }
    });
  }
}