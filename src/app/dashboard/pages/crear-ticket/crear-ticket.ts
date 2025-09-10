import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MATERIAL_IMPORTS } from '../../../material.imports';
import { TicketService, CreateTicketRequest } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-crear-ticket',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Usamos Formularios Reactivos
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './crear-ticket.html',
  styleUrls: ['./crear-ticket.css']
})
export class CrearTicketComponent implements OnInit {
  ticketForm!: FormGroup;
  isLoading = false;
  currentUser: any;

  // Configuración de validación
  readonly maxTituloLength = 100;
  readonly minDescripcionLength = 20;
  readonly maxDescripcionLength = 1000;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.ticketForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(this.maxTituloLength)]],
      descripcion: ['', [Validators.required, Validators.minLength(this.minDescripcionLength), Validators.maxLength(this.maxDescripcionLength)]]
    });
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      this.showError('Por favor, completa el formulario correctamente.');
      return;
    }

    this.isLoading = true;
    const ticketData: CreateTicketRequest = this.ticketForm.value;

    this.ticketService.createTicket(ticketData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess(`Ticket ${response.data.ticket.numero_ticket} creado con éxito`);
          this.snackBar.open(response.data.siguiente_paso || 'El ticket será revisado por un administrador.', 'OK', { duration: 10000 });
          setTimeout(() => this.router.navigate(['/dashboard/tickets']), 3000);
        } else {
          this.isLoading = false;
          this.showError(response.message || 'Ocurrió un error inesperado.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creando ticket:', err);
        this.showError('Error de conexión con el servidor. Inténtalo más tarde.');
      }
    });
  }

  aplicarPlantilla(tipo: string): void {
    let data = { titulo: '', descripcion: '' };
    switch (tipo) {
      case 'hardware':
        data.titulo = 'Problema con equipo de hardware (PC, Impresora, etc.)';
        data.descripcion = '• Equipo afectado:\n• Modelo/Marca:\n• ¿Qué ocurre exactamente? (ej: no enciende, hace ruidos):\n• ¿Desde cuándo ocurre?:\n• Pasos que ya he intentado:';
        break;
      case 'software':
        data.titulo = 'Incidencia con aplicación o software (Office, SAP, etc.)';
        data.descripcion = '• Aplicación afectada:\n• ¿Qué estaba haciendo cuando ocurrió el error?:\n• Mensaje de error exacto (si lo hay):\n• ¿Es un problema recurrente?:';
        break;
      case 'acceso':
        data.titulo = 'Solicitud de acceso o permisos';
        data.descripcion = '• Tipo de acceso solicitado:\n• Sistema o aplicación:\n• Justificación del acceso:\n• ¿Es temporal o permanente?:';
        break;
    }
    this.ticketForm.setValue(data);
  }

  limpiarFormulario(): void {
    if (this.ticketForm.dirty) {
      if (confirm('¿Estás seguro de que quieres limpiar el formulario? Se perderán los datos escritos.')) {
        this.ticketForm.reset({ titulo: '', descripcion: '' });
      }
    }
  }

  cancelar(): void {
    if (this.ticketForm.dirty) {
      if (confirm('¿Estás seguro de que quieres cancelar? Se perderán los datos no guardados.')) {
        this.router.navigate(['/dashboard/tickets']);
      }
    } else {
      this.router.navigate(['/dashboard/tickets']);
    }
  }

  get titulo() { return this.ticketForm.get('titulo'); }
  get descripcion() { return this.ticketForm.get('descripcion'); }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000, panelClass: ['snackbar-success'] });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 6000, panelClass: ['snackbar-error'] });
  }
}