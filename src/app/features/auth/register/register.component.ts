import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  // Variables del formulario
  userData = { nombres: '', email: '', password: '' };
  confirmPassword = '';
  otpCode = '';
  
  // Estado de la vista (1: Formulario, 2: OTP)
  step: 1 | 2 = 1;
  
  errorMsg = '';
  successMsg = '';
  loading = false;

  passwordStrength = 0; 
  passwordFeedback = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn && this.authService.isLoggedIn()) {
      this.router.navigate(['/cv-analyzer']);
    }
  }

  // ... (Mantén tu función onPasswordInput exactamente igual) ...
  onPasswordInput() {
    const p = this.userData.password;
    let force = 0; let missing = [];
    if (p.length >= 8) force += 1; else missing.push('8 caracteres mínimos');
    if (/[A-Za-z]/.test(p)) force += 1; else missing.push('una letra');
    if (/\d/.test(p)) force += 1; else missing.push('un número');
    if (/[^A-Za-z0-9]/.test(p)) force += 1; else missing.push('un carácter especial');
    this.passwordStrength = force;
    if (force === 0 && p.length === 0) this.passwordFeedback = '';
    else if (force < 4) this.passwordFeedback = 'Falta: ' + missing.join(', ');
    else this.passwordFeedback = '¡Contraseña segura!';
  }

  onSubmit() {
    this.errorMsg = '';

    if (!this.userData.nombres || !this.userData.email || !this.userData.password || !this.confirmPassword) {
      this.errorMsg = 'Por favor, completa todos los campos.'; return;
    }
    if (this.userData.password !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.'; return;
    }
    if (this.passwordStrength < 4) {
      this.errorMsg = 'La contraseña no cumple con los requisitos mínimos de seguridad.'; return;
    }
    
    this.loading = true;

    this.authService.register(this.userData).subscribe({
      next: (res: any) => {
        this.loading = false;
        // Al registrarse, ya no recibimos token, recibimos un mensaje de éxito.
        // Pasamos al paso 2 (Validar OTP)
        this.successMsg = 'Te hemos enviado un código de 6 dígitos a tu correo.';
        this.step = 2;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Ocurrió un error inesperado al intentar registrar la cuenta.';
      }
    });
  }

onVerifyOtp() {
    if (this.otpCode.length !== 6) {
      this.errorMsg = 'El código debe tener 6 dígitos.'; return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.authService.verifyOtp({ email: this.userData.email, otp: this.otpCode }).subscribe({
      next: (res: any) => {
        if (res && res.access_token) {
          // Limpiamos cualquier rastro de sesiones viejas por seguridad
          localStorage.removeItem('botisfy_token'); 
          localStorage.setItem('token', res.access_token);
        }
        this.loading = false;
        this.router.navigate(['/cv-analyzer']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Código incorrecto o expirado.';
      }
    });
  }
  goBack() {
    this.step = 1;
    this.errorMsg = '';
    this.successMsg = '';
    this.otpCode = '';
  }
}