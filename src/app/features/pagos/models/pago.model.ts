export interface CrearOrdenRequest {
  usuarioId: string;
  monto: number;
  tokens: number;
}

export interface CrearOrdenResponse {
  orderId: string;
  links: Array<{ href: string; rel: string; method: string }>;
}