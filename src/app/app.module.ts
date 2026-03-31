import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CvAnalyzerComponent } from './features/cv-analyzer/components/cv-analyzer.component';
import { LoginComponent } from './features/auth/login/login.component';
import { CvDetailComponent } from './features/cv-analyzer/components/cv-detail/cv-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    CvAnalyzerComponent,
    LoginComponent,
    CvDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
