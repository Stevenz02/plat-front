import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Verificar si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      // Actualizar actividad del usuario
      this.authService.updateActivity();
      
      // Verificar timeout de sesión
      this.authService.checkSessionTimeout();
      
      return true;
    }

    // Si no está autenticado, mostrar mensaje y redirigir al login
    this.snackBar.open(
      'Debes iniciar sesión para acceder a esta página',
      'Cerrar',
      {
        duration: 4000,
        panelClass: ['error-snackbar']
      }
    );

    // Redirigir al login guardando la URL de destino
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });

    return false;
  }
}