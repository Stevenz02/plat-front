import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

// Importa el array de módulos de Material
import { MATERIAL_IMPORTS } from '../../../material.imports';

// Tus servicios e interfaces
import { TicketService, Ticket, Technician, Category, Priority } from '../../../services/ticket.service';

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

  isLoading = true;
  isSubmitting = false;
  ticketId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public ticketService: TicketService, // Público para usar métodos en la plantilla
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
      comentario_asignacion: ['']
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
      priorities: this.ticketService.getPrioritiesOrderedByLevel()
    }).subscribe({
      next: (data) => {
        // La API de ticket por ID devuelve { success: true, data: Ticket }
        this.ticket = data.ticket.data.ticket;
        
        // La API de técnicos devuelve { success: true, data: { usuarios: Technician[] } }
        this.technicians = data.technicians.data; 
        
        this.categories = data.categories;
        this.priorities = data.priorities;
        
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
   * Procesa el envío del formulario.
   */
  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const assignmentData = this.assignmentForm.value;

    this.ticketService.assignTicket(this.ticketId, assignmentData).subscribe({
      next: () => {
        this.snackBar.open('Ticket asignado correctamente', 'Éxito', { 
          duration: 3000,
          panelClass: ['snackbar-success'] 
        });
        this.router.navigate(['/dashboard-admin/tickets/gestionar']);
      },
      error: (err) => {
        console.error("Error al asignar el ticket:", err);
        this.isSubmitting = false;
        this.snackBar.open('Hubo un error al asignar el ticket. Por favor, inténtelo de nuevo.', 'Error', { 
          duration: 5000,
          panelClass: ['snackbar-error']
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