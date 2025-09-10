import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Primero verificar si está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Obtener los roles permitidos desde la configuración de la ruta
    const allowedRoles = route.data['roles'] as Array<string>;
    
    if (!allowedRoles || allowedRoles.length === 0) {
      // Si no se especifican roles, permitir acceso
      return true;
    }

    // Obtener el rol del usuario actual
    const userRole = this.authService.getUserRoleName();
    const userRoleId = this.authService.getUserRoleId();
    
    // Verificar si el usuario tiene uno de los roles permitidos
    const hasPermission = allowedRoles.some(role => {
      switch (role.toLowerCase()) {
        case 'admin':
        case 'administrador':
          return userRoleId === 1 || this.authService.isAdmin();
        
        case 'tecnico':
        case 'technician':
          return userRoleId === 2 || this.authService.isTechnician();
        
        case 'usuario':
        case 'user':
        case 'usuario_final':
          return userRoleId === 3 || this.authService.isEndUser();
        
        case 'admin_tecnico':
          return this.authService.isAdminOrTechnician();
        
        default:
          return userRole?.toLowerCase() === role.toLowerCase();
      }
    });

    if (hasPermission) {
      // Actualizar actividad del usuario
      this.authService.updateActivity();
      return true;
    }

    // Si no tiene permisos, mostrar mensaje y redirigir
    const userRoleName = userRole || 'Usuario';
    this.snackBar.open(
      `Acceso denegado. Se requiere permisos de: ${allowedRoles.join(' o ')}. Tu rol actual: ${userRoleName}`,
      'Cerrar',
      {
        duration: 6000,
        panelClass: ['error-snackbar']
      }
    );

    // Redirigir según el rol del usuario
    if (this.authService.isAdminOrTechnician()) {
      this.router.navigate(['/dashboard-admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }

    return false;
  }
}