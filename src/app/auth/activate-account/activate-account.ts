import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { MATERIAL_IMPORTS } from '../../material.imports';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './activate-account.html',
  styleUrls: ['./activate-account.css']
})
export class ActivateAccountComponent implements OnInit, AfterViewInit {
  @ViewChild('codigoInput') codigoInput!: ElementRef;
  
  email: string = '';
  codigo: string = '';
  isLoading: boolean = false;
  accountActivated: boolean = false;
  autoActivationAttempted: boolean = false;
  fromRegister: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
      if (params['fromRegister'] === 'true') {
        this.fromRegister = true;
      }
      if (params['codigo']) {
        this.codigo = params['codigo'];
        // Si tenemos ambos parámetros, intentar activación automática
        if (this.email && this.codigo) {
          this.autoActivationAttempted = true;
          this.activateAccount();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // Enfocar el campo de código si viene del registro
    if (this.fromRegister && this.codigoInput) {
      setTimeout(() => {
        this.codigoInput.nativeElement.focus();
      }, 500);
    }
  }

  onSubmit(): void {
    this.activateAccount();
  }

  activateAccount(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    this.authService.activateAccount(this.email, this.codigo).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.accountActivated = true;
        
        this.snackBar.open(
          response.message || '¡Felicitaciones Juan! Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión.',
          'Cerrar',
          {
            duration: 8000,
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
        
        let errorMessage = 'Error al activar la cuenta';
        
        if (error.status === 400) {
          if (error.error?.error === 'INVALID_EMAIL') {
            errorMessage = 'El email es requerido y debe ser válido';
          } else {
            errorMessage = 'Error en los datos de entrada o validación';
          }
        } else if (error.status === 404) {
          errorMessage = 'No se encontró ninguna cuenta asociada a este email';
        } else if (error.status === 500) {
          errorMessage = 'Error interno al activar la cuenta. Intenta nuevamente';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 8000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  validateForm(): boolean {
    if (!this.email) {
      this.snackBar.open('El email es requerido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      this.snackBar.open('Por favor ingrese un email válido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }

    if (!this.codigo) {
      this.snackBar.open('El código de activación es requerido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }

    if (this.codigo.length !== 6) {
      this.snackBar.open('El código debe tener exactamente 6 dígitos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }

    if (!/^\d{6}$/.test(this.codigo)) {
      this.snackBar.open('El código debe contener solo números', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Formatear el código mientras se escribe
  onCodigoInput(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Solo números
    if (value.length > 6) {
      value = value.substring(0, 6); // Máximo 6 dígitos
    }
    this.codigo = value;
    event.target.value = value;
  }

  // Resender activation code
  resendActivationCode(): void {
    if (!this.email || !this.isValidEmail(this.email)) {
      this.snackBar.open('Por favor ingrese un email válido primero', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Aquí podrías llamar a un endpoint para reenviar el código
    // Por ahora solo mostramos un mensaje
    this.snackBar.open(
      'Si el email está registrado, recibirás un nuevo código de activación',
      'Cerrar',
      {
        duration: 5000,
        panelClass: ['success-snackbar']
      }
    );
  }
}