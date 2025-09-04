import { Component } from '@angular/core'; 
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AuthService } from '../services/auth.service';
import { MATERIAL_IMPORTS } from '../material.imports';
import { TerminosDialogComponent } from '../shared/dialogs/terminos-dialog/terminos';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonToggleModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdmin {
  menuAbierto = true;
  currentYear = new Date().getFullYear();
  showDashboard = true; // <-- Definir la propiedad showDashboard

  constructor(private authService: AuthService, private router: Router, private dialog: MatDialog) {}

  // Toggle para abrir/cerrar el menú
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  // Navegar a una ruta específica
  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  // Cerrar sesion
cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Sesión cerrada exitosamente:', response);
        // El AuthService ya maneja la limpieza y redirección en clearSession()
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        // Incluso si hay error en el servidor, hacer logout local
        this.authService.logoutLocal();
      }
    });
  }

  // Abrir el diálogo de términos
  abrirTerminos() {
    this.dialog.open(TerminosDialogComponent, {
      width: '600px'
    });
  }

  // Método para ir a un módulo específico
  irAModulo(ruta: string) {
    this.router.navigate([ruta]);
  }
}
