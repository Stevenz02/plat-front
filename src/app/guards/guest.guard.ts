import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Si el usuario NO está autenticado, permitir acceso
    if (!this.authService.isAuthenticated()) {
      return true;
    }

    // Si está autenticado, redirigir al dashboard apropiado
    const userRoleId = this.authService.getUserRoleId();
    
    if (userRoleId === 1 || userRoleId === 2) { // Admin o Técnico
      this.router.navigate(['/dashboard-admin']);
    } else { // Usuario Final
      this.router.navigate(['/dashboard']);
    }

    return false;
  }
}