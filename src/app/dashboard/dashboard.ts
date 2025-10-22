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

type Theme = 'theme-light' | 'theme-dark' | 'theme-high-contrast'; // Tipo para temas

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
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit { 
  menuAbierto = true;
  currentYear = new Date().getFullYear();

  // Propiedades de accesibilidad
  private currentScaleFactor = 1;
  private readonly SCALE_STEP = 0.1;
  private readonly MAX_SCALE = 1.5;
  private readonly MIN_SCALE = 0.8;
  public currentTheme: Theme = 'theme-light';
  public isGrayscale = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private renderer: Renderer2, 
    @Inject(DOCUMENT) private document: Document 
  ) {}

  ngOnInit(): void {
    // Cargar configuraciones guardadas al iniciar
    const savedTheme = localStorage.getItem('appTheme') as Theme;
    this.aplicarTema(savedTheme || 'theme-light');

    const savedScale = localStorage.getItem('fontScale');
    if (savedScale) {
        this.currentScaleFactor = parseFloat(savedScale);
        // Aplicar la escala guardada a la variable CSS global
        this.renderer.setStyle(this.document.documentElement, '--font-scale-factor', this.currentScaleFactor);
    }

    const savedGrayscale = localStorage.getItem('grayscale') === 'true';
    if (savedGrayscale) {
      // Aplicar escala de grises si estaba guardada
      this.isGrayscale = true; // Actualizar estado interno
      this.renderer.addClass(this.document.body, 'grayscale');
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

  // --- Métodos de Accesibilidad ---

  ajustarFuente(incremento: number): void {
    const newScaleFactor = this.currentScaleFactor + incremento * this.SCALE_STEP;
    // Aplicar solo si está dentro de los límites
    if (newScaleFactor >= this.MIN_SCALE && newScaleFactor <= this.MAX_SCALE) {
      this.currentScaleFactor = newScaleFactor;
      // Actualizar la variable CSS global
      this.renderer.setStyle(this.document.documentElement, '--font-scale-factor', this.currentScaleFactor);
      // Guardar preferencia
      localStorage.setItem('fontScale', this.currentScaleFactor.toString());
    }
  }

  cambiarTema(tema: Theme): void {
    this.aplicarTema(tema);
    // Guardar preferencia
    localStorage.setItem('appTheme', tema);
  }

  private aplicarTema(tema: Theme): void {
    // Simplemente actualizamos la propiedad que controla la clase en el HTML
    this.currentTheme = tema;
  }

  toggleGrayscale(): void {
    this.isGrayscale = !this.isGrayscale;
    // Añadir o quitar la clase 'grayscale' del body
    if (this.isGrayscale) {
      this.renderer.addClass(this.document.body, 'grayscale');
    } else {
      this.renderer.removeClass(this.document.body, 'grayscale');
    }
    // Guardar preferencia
    localStorage.setItem('grayscale', String(this.isGrayscale));
  }
}