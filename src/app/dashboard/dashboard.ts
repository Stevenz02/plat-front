import { Component } from '@angular/core'; 
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle'; // <-- Importar MatButtonToggleModule
import { MATERIAL_IMPORTS } from '../material.imports';
import { TerminosDialogComponent } from '../shared/dialogs/terminos-dialog/terminos';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonToggleModule, // <-- Asegúrate de importar este módulo
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'] // Cambié `styleUrl` por `styleUrls` ya que es el nombre correcto
})
export class DashboardComponent {
  menuAbierto = true;
  currentYear = new Date().getFullYear();
  showDashboard = true; // <-- Definir la propiedad showDashboard

  constructor(private router: Router, private dialog: MatDialog) {}

  // Toggle para abrir/cerrar el menú
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  // Navegar a una ruta específica
  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  // Volver al portal
  volverPortal() {
    window.location.href = 'https://intraepa.gov.co/dashboard';
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
