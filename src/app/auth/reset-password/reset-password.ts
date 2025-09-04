import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { MATERIAL_IMPORTS } from '../../material.imports';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  hideNewPassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isLoading: boolean = false;
  isValidToken: boolean = true;
  passwordResetSuccess: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener el token de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.isValidToken = false;
        this.snackBar.open('Token de recuperación inválido o expirado', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.passwordResetSuccess = true;
        
        this.snackBar.open(
          response.message || 'Contraseña restablecida exitosamente',
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        
        let errorMessage = 'Error al restablecer la contraseña';
        
        if (error.status === 400) {
          errorMessage = 'Token inválido o expirado';
          this.isValidToken = false;
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor. Intente más tarde';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  validateForm(): boolean {
    if (!this.newPassword) {
      this.snackBar.open('La nueva contraseña es requerida', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }

    if (this.newPassword.length < 8) {
      this.snackBar.open('La contraseña debe tener al menos 8 caracteres', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }

    if (!this.confirmPassword) {
      this.snackBar.open('Debe confirmar la nueva contraseña', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }

    if (!this.isStrongPassword(this.newPassword)) {
      this.snackBar.open(
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
        'Cerrar',
        {
          duration: 5000,
          panelClass: ['error-snackbar']
        }
      );
      return false;
    }

    return true;
  }

  isStrongPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber;
  }

  getPasswordStrength(): string {
    if (!this.newPassword) return '';
    
    const length = this.newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(this.newPassword);
    const hasLowerCase = /[a-z]/.test(this.newPassword);
    const hasNumber = /\d/.test(this.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword);
    
    const strength = [length, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
    
    if (strength < 3) return 'weak';
    if (strength < 4) return 'medium';
    return 'strong';
  }

  // Métodos para evaluar requisitos de contraseña
  hasMinLength(): boolean {
    return this.newPassword.length >= 8;
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.newPassword);
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.newPassword);
  }

  hasNumber(): boolean {
    return /\d/.test(this.newPassword);
  }

  goBackToLogin(): void {
    this.router.navigate(['/login']);
  }

  requestNewToken(): void {
    this.router.navigate(['/forgot-password']);
  }
}