import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MATERIAL_IMPORTS } from '../../../material.imports';
import { TicketService, CreateTicketRequest } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-crear-ticket',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './crear-ticket.html',
  styleUrls: ['./crear-ticket.css']
})
export class CrearTicketComponent {
  ticketData: CreateTicketRequest = {
    titulo: '',
    descripcion: ''
  };

  isLoading = false;
  isSubmitted = false;
  currentUser: any;

  // Configuración de caracteres
  maxTituloLength = 100;
  maxDescripcionLength = 1000;
  minDescripcionLength = 20;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (!this.isFormValid()) {
      this.showError('Por favor, completa todos los campos requeridos correctamente');
      return;
    }

    this.isLoading = true;

    this.ticketService.createTicket(this.ticketData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success) {
          this.showSuccess(
            response.message || 'Ticket creado exitosamente'
          );

          // Mostrar información adicional del ticket creado
          if (response.data?.ticket?.numero_ticket) {
            setTimeout(() => {
              this.showSuccess(
                `Tu ticket ${response.data.ticket.numero_ticket} ha sido creado. ${response.data.siguiente_paso || ''}`
              );
            }, 1000);
          }

          // Redirigir a mis tickets después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/dashboard/tickets']);
          }, 3000);
        } else {
          this.showError(response.message || 'Error al crear el ticket');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creando ticket:', error);
        
        let errorMessage = 'Error al crear el ticket';
        
        if (error.status === 400) {
          if (error.error?.error === 'TITULO_REQUERIDO') {
            errorMessage = 'El título es requerido';
          } else {
            errorMessage = 'Datos de entrada inválidos. Verifica el título y descripción';
          }
        } else if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
          this.router.navigate(['/login']);
        } else if (error.status === 409) {
          errorMessage = 'Error de duplicación de datos';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor. Intenta nuevamente';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.showError(errorMessage);
      }
    });
  }

  isFormValid(): boolean {
    return this.isTituloValid() && this.isDescripcionValid();
  }

  isTituloValid(): boolean {
    return this.ticketData.titulo.trim().length > 0 && 
           this.ticketData.titulo.trim().length <= this.maxTituloLength;
  }

  isDescripcionValid(): boolean {
    return this.ticketData.descripcion.trim().length >= this.minDescripcionLength && 
           this.ticketData.descripcion.trim().length <= this.maxDescripcionLength;
  }

  getTituloErrorMessage(): string {
    if (!this.ticketData.titulo.trim()) {
      return 'El título es requerido';
    }
    if (this.ticketData.titulo.trim().length > this.maxTituloLength) {
      return `El título no puede exceder ${this.maxTituloLength} caracteres`;
    }
    return '';
  }

  getDescripcionErrorMessage(): string {
    if (this.ticketData.descripcion.trim().length < this.minDescripcionLength) {
      return `La descripción debe tener al menos ${this.minDescripcionLength} caracteres`;
    }
    if (this.ticketData.descripcion.trim().length > this.maxDescripcionLength) {
      return `La descripción no puede exceder ${this.maxDescripcionLength} caracteres`;
    }
    return '';
  }

  getTituloCharacterCount(): string {
    return `${this.ticketData.titulo.length}/${this.maxTituloLength}`;
  }

  getDescripcionCharacterCount(): string {
    return `${this.ticketData.descripcion.length}/${this.maxDescripcionLength}`;
  }

  isDescripcionCountWarning(): boolean {
    return this.ticketData.descripcion.length > this.maxDescripcionLength * 0.8;
  }

  cancelar(): void {
    if (this.hasUnsavedChanges()) {
      const confirmLeave = confirm(
        '¿Estás seguro de que quieres cancelar? Se perderán los datos ingresados.'
      );
      if (confirmLeave) {
        this.router.navigate(['/dashboard/tickets']);
      }
    } else {
      this.router.navigate(['/dashboard/tickets']);
    }
  }

  hasUnsavedChanges(): boolean {
    return this.ticketData.titulo.trim().length > 0 || 
           this.ticketData.descripcion.trim().length > 0;
  }

  limpiarFormulario(): void {
    const confirmClear = confirm('¿Estás seguro de que quieres limpiar el formulario?');
    if (confirmClear) {
      this.ticketData = {
        titulo: '',
        descripcion: ''
      };
      this.isSubmitted = false;
    }
  }

  // Métodos para autocompletar y sugerencias
  onTituloInput(): void {
    // Lógica futura para sugerencias de título
  }

  onDescripcionInput(): void {
    // Lógica futura para sugerencias de descripción
  }

  // Plantillas de texto predefinidas
  aplicarPlantilla(tipo: string): void {
    switch (tipo) {
      case 'hardware':
        this.ticketData.titulo = 'Problema con equipo de hardware';
        this.ticketData.descripcion = 'Descripción del problema:\n\nEquipo afectado:\nModelo/Marca:\nSíntomas:\nCuándo comenzó el problema:\nPasos ya realizados:';
        break;
      case 'software':
        this.ticketData.titulo = 'Incidencia con aplicación/software';
        this.ticketData.descripcion = 'Descripción del problema:\n\nAplicación afectada:\nVersión:\nMensaje de error (si aplica):\nPasos para reproducir:\nCuándo ocurre:';
        break;
      case 'acceso':
        this.ticketData.titulo = 'Solicitud de acceso o permisos';
        this.ticketData.descripcion = 'Tipo de acceso solicitado:\n\nSistema/Aplicación:\nJustificación:\nNivel de acceso requerido:\nFecha necesaria:';
        break;
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 6000,
      panelClass: ['error-snackbar']
    });
  }
}
