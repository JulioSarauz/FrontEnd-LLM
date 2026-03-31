import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Asegúrate de importar tus componentes con las rutas correctas
import { LoginComponent } from './features/auth/login/login.component'; 
import { CvAnalyzerComponent } from './features/cv-analyzer/components/cv-analyzer.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirige la raíz al login
  { path: 'login', component: LoginComponent },          // Ruta para el login
  { path: 'analyzer', component: CvAnalyzerComponent },  // Ruta para el analizador de CV
  { path: '**', redirectTo: '/login' }                   // Ruta comodín (manejo de errores 404)
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }