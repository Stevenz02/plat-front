import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../services/auth.service';
import { MATERIAL_IMPORTS } from '../material.imports';
import { TerminosDialogComponent } from '../shared/dialogs/terminos-dialog/terminos';

type Theme = 'theme-light' | 'theme-dark' | 'theme-high-contrast';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css']
})
export class DashboardAdminComponent implements OnInit {
  menuAbierto = true;
  currentYear = new Date().getFullYear();

  private currentScaleFactor = 1;
  private readonly SCALE_STEP = 0.1;
  private readonly MAX_SCALE = 1.5;
  private readonly MIN_SCALE = 0.8;
  public currentTheme: Theme = 'theme-light';
  public isGrayscale = false; // NUEVA PROPIEDAD

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
    ) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('appTheme') as Theme;
    this.aplicarTema(savedTheme || 'theme-light');

    const savedScale = localStorage.getItem('fontScale');
    if (savedScale) {
        this.currentScaleFactor = parseFloat(savedScale);
        this.renderer.setStyle(this.document.documentElement, '--font-scale-factor', this.currentScaleFactor);
    }

    const savedGrayscale = localStorage.getItem('grayscale') === 'true';
    if (savedGrayscale) {
      this.toggleGrayscale();
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Sesión cerrada exitosamente:', response);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        this.authService.logoutLocal();
      }
    });
  }

  abrirTerminos() {
    this.dialog.open(TerminosDialogComponent, {
      width: '600px'
    });
  }

  ajustarFuente(incremento: number): void {
    const newScaleFactor = this.currentScaleFactor + incremento * this.SCALE_STEP;
    if (newScaleFactor >= this.MIN_SCALE && newScaleFactor <= this.MAX_SCALE) {
      this.currentScaleFactor = newScaleFactor;
      this.renderer.setStyle(this.document.documentElement, '--font-scale-factor', this.currentScaleFactor);
      localStorage.setItem('fontScale', this.currentScaleFactor.toString());
    }
  }

  cambiarTema(tema: Theme): void {
    this.aplicarTema(tema);
    localStorage.setItem('appTheme', tema);
  }

  private aplicarTema(tema: Theme): void {
    this.currentTheme = tema;
  }

  // NUEVO MÉTODO para escala de grises
  toggleGrayscale(): void {
    this.isGrayscale = !this.isGrayscale;
    if (this.isGrayscale) {
      this.renderer.addClass(this.document.body, 'grayscale');
    } else {
      this.renderer.removeClass(this.document.body, 'grayscale');
    }
    localStorage.setItem('grayscale', String(this.isGrayscale));
  }
}

