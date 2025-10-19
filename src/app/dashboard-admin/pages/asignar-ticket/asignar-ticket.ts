import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MATERIAL_IMPORTS } from '../../../material.imports';
import { TicketService, Ticket, Technician, Category, Priority, AsociarEquipoRequest } from '../../../services/ticket.service';
import { InventoryService, Equipo } from '../../../services/inventory.service';

@Component({
  selector: 'app-asignar-ticket',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './asignar-ticket.html',
  styleUrls: ['./asignar-ticket.css']
})
export class AsignarTicketComponent implements OnInit {

  assignmentForm!: FormGroup;
  ticket: Ticket | null = null;
  technicians: Technician[] = [];
  categories: Category[] = [];
  priorities: Priority[] = [];
  equipos: Equipo[] = [];

  isLoading = true;
  isSubmitting = false;
  ticketId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public ticketService: TicketService,
    private inventoryService: InventoryService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener el ID del ticket desde la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.snackBar.open('Error: No se proporcionó un ID de ticket.', 'Cerrar', { duration: 5000 });
      this.router.navigate(['/dashboard-admin/tickets/gestionar']);
      return;
    }
    this.ticketId = +id;

    // Inicializar el formulario
    this.assignmentForm = this.fb.group({
      tecnico_id: ['', [Validators.required]],
      categoria_id: ['', [Validators.required]],
      prioridad_id: ['', [Validators.required]],
      comentario_asignacion: [''],
      equipo_id: [null]
    });

    this.loadInitialData();
  }

  /**
   * Carga todos los datos necesarios en paralelo: detalles del ticket, técnicos, categorías y prioridades.
   */
  loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      ticket: this.ticketService.getTicketById(this.ticketId),
      technicians: this.ticketService.getTechnicians(),
      categories: this.ticketService.getActiveCategories(),
      priorities: this.ticketService.getPrioritiesOrderedByLevel(),
      equipos: this.inventoryService.getEquipos()
    }).subscribe({
      next: (data) => {
        // La API de ticket por ID devuelve { success: true, data: Ticket }
        this.ticket = data.ticket.data.ticket;
        // La API de técnicos devuelve { success: true, data: { usuarios: Technician[] } }
        this.technicians = data.technicians.data; 
        this.categories = data.categories;
        this.priorities = data.priorities;
        this.equipos = data.equipos.success ? data.equipos.data : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al cargar datos iniciales:", err);
        this.isLoading = false;
        this.snackBar.open('Error al cargar la información para la asignación.', 'Cerrar', { duration: 5000 });
      }
    });
  }

/**
   * Procesa el envío del formulario: asigna técnico y asocia equipo si se seleccionó.
   */
  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.assignmentForm.value;

    // Datos para la asignación del técnico (PUT /api/tickets/{id}/asignar)
    const assignmentData = {
      tecnico_id: formValue.tecnico_id,
      categoria_id: formValue.categoria_id,
      prioridad_id: formValue.prioridad_id,
      comentario_asignacion: formValue.comentario_asignacion
    };

    // 1. Asignar el ticket al técnico
    this.ticketService.assignTicket(this.ticketId, assignmentData).pipe(
      // 2. Después de asignar, si se seleccionó un equipo, lo asociamos
      switchMap((assignResponse) => {
        // Verifica si la asignación fue exitosa antes de continuar (opcional pero recomendado)
        // if (!assignResponse || !assignResponse.success) {
        //    throw new Error('Fallo al asignar el técnico.');
        // }

        if (formValue.equipo_id) {
          // Datos para asociar el equipo (POST /api/tickets/{id}/asignar-equipo)
          const equipoData: AsociarEquipoRequest = {
            equipo_id: formValue.equipo_id,
            // Puedes poner una descripción genérica o tomarla de algún campo si lo añades
            descripcion: `Equipo asociado al ticket #${this.ticket?.numero_ticket} durante la asignación.`
            // accion_realizada: '' // Podrías añadir un campo para esto si es relevante al asignar
          };
          return this.ticketService.asociarEquipo(this.ticketId, equipoData);
        }
        // Si no se seleccionó equipo, retornamos un observable que emite 'null' y completa.
        return of(null);
      })
    ).subscribe({
      next: (associateResponse) => {
        // Comprobar si hubo respuesta de asociar equipo (si no, fue null)
        const successMessage = formValue.equipo_id && associateResponse
          ? 'Ticket asignado y equipo asociado correctamente.'
          : 'Ticket asignado correctamente.';

        this.snackBar.open(successMessage, 'Éxito', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard-admin/tickets/gestionar']);
      },
      error: (err) => {
        console.error("Error en el proceso de asignación:", err);
        this.isSubmitting = false;
        // Muestra un mensaje de error más específico si es posible
        const errorMessage = err.error?.message || 'Hubo un error al asignar el ticket o asociar el equipo.';
        this.snackBar.open(errorMessage, 'Error', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Navega de vuelta a la lista de tickets.
   */
  goBack(): void {
    this.router.navigate(['/dashboard-admin/tickets/gestionar']);
  }
}