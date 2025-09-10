import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

// Módulos de Angular Material
import { MATERIAL_IMPORTS } from '../../../material.imports';

// Servicios e Interfaces
import { TicketService, Ticket, TicketState, ChangeStatusRequest } from '../../../services/ticket.service';

@Component({
  selector: 'app-cambiar-estado-ticket',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './cambiar-estado-ticket.html',
  styleUrls: ['./cambiar-estado-ticket.css']
})
export class CambiarEstadoTicketComponent implements OnInit {

  statusChangeForm!: FormGroup;
  ticket: Ticket | null = null;
  availableStates: TicketState[] = [];

  isLoading = true;
  isSubmitting = false;
  ticketId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public ticketService: TicketService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener el ID del ticket desde los parámetros de la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.handleError('Error: No se proporcionó un ID de ticket.');
      return;
    }
    this.ticketId = +id;

    // Inicializar el formulario reactivo
    this.statusChangeForm = this.fb.group({
      nuevo_estado_id: ['', [Validators.required]],
      comentario_tecnico: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    // Cargar en paralelo los detalles del ticket y los estados disponibles
    forkJoin({
      ticketResponse: this.ticketService.getTicketById(this.ticketId),
      statesResponse: this.ticketService.getActiveTicketStates()
    }).subscribe({
      next: ({ ticketResponse, statesResponse }) => {
        // Asignar los datos del ticket usando la estructura correcta que ya descubrimos
        this.ticket = ticketResponse.data.ticket;

        // Asignar los estados
        if (statesResponse.success) {
          this.availableStates = statesResponse.data;
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.handleError('Error al cargar la información del ticket.');
        console.error(err);
      }
    });
  }

// EN: cambiar-estado-ticket.component.ts

onSubmit(): void {
  if (this.statusChangeForm.invalid) {
    this.statusChangeForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;
  const formValue = this.statusChangeForm.value;

  // Creamos el objeto 'data' con la estructura exacta que la API espera
  const requestData: ChangeStatusRequest = {
    nuevo_estado_id: formValue.nuevo_estado_id,
    comentario_tecnico: formValue.comentario_tecnico,
    motivo_cambio: `Estado actualizado a '${this.availableStates.find(s => s.id === formValue.nuevo_estado_id)?.nombre || 'desconocido'}'`
  };

  // Llamamos al servicio con el nuevo objeto 'requestData'
  this.ticketService.changeTicketStatus(this.ticketId, requestData).subscribe({
    next: () => {
      this.snackBar.open('Estado del ticket actualizado exitosamente', 'Éxito', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.router.navigate(['/dashboard-admin/tickets/gestionar']);
    },
    error: (err) => {
      this.isSubmitting = false;
      this.snackBar.open('No se pudo actualizar el estado. Inténtelo de nuevo.', 'Error', {
        duration: 5000,
        panelClass: ['snackbar-error']
      });
      console.error(err);
    }
  });
}

  goBack(): void {
    this.router.navigate(['/dashboard-admin/tickets/gestionar']);
  }
  
  private handleError(message: string): void {
      this.isLoading = false;
      this.snackBar.open(message, 'Cerrar', { duration: 5000 });
      this.goBack();
  }
}