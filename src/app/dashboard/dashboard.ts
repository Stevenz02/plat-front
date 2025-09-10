import { Component } from '@angular/core'; 
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../services/auth.service';
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
    MatButtonModule,
    MatTooltipModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  menuAbierto = true;
  currentYear = new Date().getFullYear();

  constructor(private authService: AuthService, private router: Router, private dialog: MatDialog) {}

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
}