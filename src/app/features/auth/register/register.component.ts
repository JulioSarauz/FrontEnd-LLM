import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  userData = { nombres: '', email: '', password: '' };
  errorMsg = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.userData.nombres || !this.userData.email || !this.userData.password) return;
    
    this.loading = true;
    this.errorMsg = '';

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.router.navigate(['/cv-analyzer']);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Error al crear la cuenta';
        this.loading = false;
      }
    });
  }
}