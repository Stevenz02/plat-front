import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';
  private userKey = 'userData';
  
  // BehaviorSubject para mantener el estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

login(credentials: { email: string; password: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/auth/login`, credentials)
    .pipe(
      tap((response: any) => {
        if (response && response.success) {
          // Los tokens están en response.data.tokens
          if (response.data && response.data.tokens) {
            localStorage.setItem(this.tokenKey, response.data.tokens.access_token);
            localStorage.setItem(this.refreshTokenKey, response.data.tokens.refresh_token);
          }
          
          if (response.data && response.data.user) {
            const userData = {
              id: response.data.user.id,
              email: response.data.user.email,
              nombres: response.data.user.nombres,
              apellidos: response.data.user.apellidos,
              telefono: response.data.user.telefono,
              departamento: response.data.user.departamento,
              cargo: response.data.user.cargo,
              rol_id: response.data.user.rol.id,
              rol_nombre: response.data.user.rol.nombre,
              activo: true, // Si llegó hasta aquí, está activo
              ultimo_acceso: response.data.user.ultimo_acceso,
              // ✅ AGREGAR PERMISOS TAMBIÉN
              permisos: response.data.permisos
            };
            localStorage.setItem(this.userKey, JSON.stringify(userData));
          }
          
          // Actualizar última actividad
          if (response.data && response.data.user && response.data.user.ultimo_acceso) {
            localStorage.setItem('ultimo_acceso', response.data.user.ultimo_acceso);
          }
          
          // Actualizar estado de autenticación
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
}

  // Logout
  logout(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/api/auth/logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearSession();
        })
      );
  }

  // Logout local (sin llamar al backend)
  logoutLocal(): void {
    this.clearSession();
  }

  // Limpiar sesión
  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('ultimo_acceso');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  // Obtener información del usuario actual
  getCurrentUserFromAPI(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/api/auth/me`, { headers });
  }

  // Registro de usuario
  register(userData: any): Observable<any> {
    // Asegurar que siempre se envíe rol_id: 3 y activo: false
    const registerData = {
      ...userData,
      rol_id: 3, // Siempre Usuario
      activo: false // Se activa por correo
    };
    
    return this.http.post(`${this.apiUrl}/api/usuarios`, registerData);
  }

  // Obtener token de acceso
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Obtener refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Verificar si hay token
  hasToken(): boolean {
    return !!this.getToken();
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Verificar si el token no ha expirado
    try {
      const tokenData = this.decodeToken(token);
      if (tokenData && tokenData.expires_in) {
        // El token incluye expires_in en la respuesta
        return true; // Por ahora asumimos que si existe es válido
      }
      return true;
    } catch {
      return false;
    }
  }

  // Decodificar token JWT
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  // Obtener datos del usuario desde localStorage
  getCurrentUser(): any {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  // Obtener rol_id del usuario
  getUserRoleId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.rol_id : null;
  }

  // Obtener nombre del rol
  getUserRoleName(): string | null {
    const user = this.getCurrentUser();
    return user ? user.rol_nombre : null;
  }

  // Verificar si es admin (rol_id = 1)
  isAdmin(): boolean {
    return this.getUserRoleId() === 1;
  }

  // Verificar si es técnico (rol_id = 2)
  isTechnician(): boolean {
    return this.getUserRoleId() === 2;
  }

  // Verificar si es usuario final (rol_id = 3)
  isEndUser(): boolean {
    return this.getUserRoleId() === 3;
  }

  // Verificar si es admin o técnico
  isAdminOrTechnician(): boolean {
    const roleId = this.getUserRoleId();
    return roleId === 1 || roleId === 2;
  }

  // Headers con token para peticiones autenticadas
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Refrescar token usando el refresh token
  refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post(`${this.apiUrl}/api/auth/refresh`, { 
      refresh_token: refreshToken 
    }).pipe(
      tap((response: any) => {
        if (response && response.access_token) {
          localStorage.setItem(this.tokenKey, response.access_token);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  // Verificar sesión (timeout de 30 minutos según requisitos)
  checkSessionTimeout(): void {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const timeDiff = Date.now() - parseInt(lastActivity);
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutos en millisegundos
      
      if (timeDiff > thirtyMinutes) {
        this.logoutLocal();
        alert('Su sesión ha expirado por inactividad');
      }
    }
    
    // Actualizar última actividad
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  // Actualizar actividad del usuario
  updateActivity(): void {
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  // Recuperar contraseña - generar token
forgotPassword(email: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/usuarios/recuperar-contrasena`, { 
    email: email 
  });
}

// Restablecer contraseña con token
resetPassword(token: string, newPassword: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/usuarios/restablecer-contrasena`, {
    token: token,
    passwordNueva: newPassword
  });
}
}