import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Testimonial {
  text: string;
  name: string;
  role: string;
}

interface Agent {
  name: string;
  role: string;
  color: string;
  bg: string;
  emoji: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  testimonials: Testimonial[] = [
    { text: '"ResumeAnalyzer IA redujo nuestro tiempo de selección en un 80%. Encontramos al candidato ideal en días, no semanas."', name: 'Laura Martínez', role: 'Directora de RRHH · TechCorp' },
    { text: '"La ponderación automática de habilidades nos permite enfocarnos en las entrevistas. Es una herramienta indispensable para nuestro equipo."', name: 'Andrés Gómez', role: 'Talent Acquisition Manager' },
    { text: '"Encontramos talento oculto que habríamos pasado por alto con un filtro manual. La precisión del análisis es impresionante."', name: 'Sofía Castro', role: 'CEO · Startup Innovadora' },
    { text: '"El proceso de contratación ahora es justo y basado en datos. Eliminamos sesgos y mejoramos la calidad de nuestras contrataciones."', name: 'Javier Ruiz', role: 'Head of People · Empresa de Servicios' },
  ];

  agents: Agent[] = [
    { name: 'Extractor', role: 'Extracción de Datos', color: '#7c6bff', bg: 'rgba(124,107,255,0.15)', emoji: '📄' },
    { name: 'Analista', role: 'Análisis Semántico', color: '#00e5c0', bg: 'rgba(0,229,192,0.12)', emoji: '🧠' },
    { name: 'Ponderador', role: 'Scoring & Ranking', color: '#fb923c', bg: 'rgba(251,146,60,0.12)', emoji: '⚖️' },
    { name: 'Matchmaker', role: 'Búsqueda Ideal', color: '#ff5c7a', bg: 'rgba(255,92,122,0.12)', emoji: '🎯' },
  ];

  currentTestimonial = 0;
  email = '';
  password = '';
  loading = false;
  oauthLoading = '';
  error = '';
  showPass = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    setInterval(() => {
      this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
    }, 4000);
  }

  handleLogin(e: Event) {
    e.preventDefault();
    if (!this.email || !this.password) { this.error = 'Por favor completa todos los campos'; return; }
    if (!this.email.includes('@')) { this.error = 'Ingresa un email válido'; return; }
    
    this.loading = true;
    this.error = '';
    
    // Simulación de login
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/analyzer']); // Navega al analizador tras el login exitoso
    }, 1800);
  }

  handleOAuth(provider: string) {
    this.oauthLoading = provider;
    
    // Simulación de login con OAuth
    setTimeout(() => {
      this.oauthLoading = '';
      this.router.navigate(['/analyzer']); // Navega al analizador
    }, 2000);
  }

  get t(): Testimonial {
    return this.testimonials[this.currentTestimonial];
  }

  setCurrent(index: number) {
    this.currentTestimonial = index;
  }
}