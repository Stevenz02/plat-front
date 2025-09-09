import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MATERIAL_IMPORTS } from '../../../material.imports';
import { TicketService, Ticket } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-asignar-ticket',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './asignar-ticket.html',
  styleUrls: ['./asignar-ticket.css']
})
export class AsignarTicketComponent implements OnInit {
  ticketId: number = 0;
  ticket: Ticket | null = null;
  isLoading = true;
  isSubmitting = false;
  
  // Datos locales basados en la BD
  categorias: any[] = [
    { id: 1, nombre: 'Hardware', descripcion: 'Problemas con equipos físicos' },
    { id: 2, nombre: 'Software', descripcion: 'Problemas con aplicaciones y sistemas' },
    { id: 3, nombre: 'Red', descripcion: 'Problemas de conectividad y red' },
    { id: 4, nombre: 'Permisos', descripcion: 'Solicitudes de acceso y permisos' }
  ];
  
  prioridades: any[] = [
    { id: 1, nombre: 'Alta', descripcion: 'Requiere atención inmediata', color: '#DC2626' },
    { id: 2, nombre: 'Media', descripcion: 'Atención en horario normal', color: '#D97706' },
    { id: 3, nombre: 'Baja', descripcion: 'No es urgente', color: '#059669' }
  ];
  
  // Técnicos cargados desde API
  tecnicos: any[] = [];
  
  assignmentData = {
    tecnico_id: 0,
    categoria_id: 0,
    prioridad_id: 0,
    comentario_asignacion: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.ticketId) {
      this.showError('ID de ticket no válido');
      this.router.navigate(['/dashboard-admin/tickets/gestionar']);
      return;
    }

    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    // Cargar ticket y técnicos en paralelo
    Promise.all([
      this.loadTicket(),
      this.loadTecnicos()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  private async loadTicket(): Promise<void> {
    try {
      const response = await this.ticketService.getTicketById(this.ticketId).toPromise();
      
      if (response?.success) {
        this.ticket = response.data;
        this.initializeAssignmentData();
      } else {
        this.showError('No se pudo cargar el ticket');
        this.router.navigate(['/dashboard-admin/tickets/gestionar']);
      }
    } catch (error) {
      this.handleError(error, 'Error al cargar el ticket');
      this.router.navigate(['/dashboard-admin/tickets/gestionar']);
    }
  }

  private async loadTecnicos(): Promise<void> {
    try {
      const response = await this.ticketService.getTechnicians().toPromise();
      
      if (response?.success) {
        this.tecnicos = response.data.filter((t: any) => t.activo);
      } else {
        this.tecnicos = [];
      }
    } catch (error) {
      console.error('Error loading technicians:', error);
      this.tecnicos = [];
    }
  }

  private initializeAssignmentData(): void {
    if (this.ticket) {
      this.assignmentData = {
        tecnico_id: 0,
        categoria_id: this.getCategoriaIdByName(this.ticket.categoria || '') || 0,
        prioridad_id: this.ticket.prioridad_nivel || 0,
        comentario_asignacion: ''
      };
    }
  }

  private getCategoriaIdByName(categoriaNombre: string): number {
    const categoria = this.categorias.find(c => 
      c.nombre.toLowerCase() === categoriaNombre.toLowerCase()
    );
    return categoria?.id || 0;
  }

  // ===== MÉTODOS DE VALIDACIÓN =====
  
  isFormValid(): boolean {
    return this.assignmentData.tecnico_id > 0 && 
           this.assignmentData.categoria_id > 0 && 
           this.assignmentData.prioridad_id > 0;
  }

  canAssignTicket(): boolean {
    if (!this.ticket) return false;
    return this.ticket.estado === 'Pendiente' && this.authService.isAdmin();
  }

  // ===== MÉTODOS DE FORMULARIO =====

  onTecnicoChange(): void {
    // Lógica adicional cuando cambia el técnico si es necesario
  }

  onCategoriaChange(): void {
    // Lógica adicional cuando cambia la categoría si es necesario
  }

  onPrioridadChange(): void {
    // Lógica adicional cuando cambia la prioridad si es necesario
  }

  // ===== MÉTODOS DE ACCIÓN =====

  assignTicket(): void {
    if (!this.ticket || !this.isFormValid()) {
      this.showError('Por favor complete todos los campos obligatorios');
      return;
    }

    if (!this.canAssignTicket()) {
      this.showError('No tiene permisos para asignar este ticket');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      tecnico_id: this.assignmentData.tecnico_id,
      categoria_id: this.assignmentData.categoria_id,
      prioridad_id: this.assignmentData.prioridad_id,
      comentario_asignacion: this.assignmentData.comentario_asignacion
    };

    this.ticketService.assignTicket(this.ticket.id, payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.showSuccess('Ticket asignado exitosamente');
          this.router.navigate(['/dashboard-admin/tickets/gestionar']);
        } else {
          this.showError(response.message || 'Error al asignar ticket');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.handleError(error, 'Error al asignar el ticket');
      }
    });
  }

  cancelAssignment(): void {
    this.router.navigate(['/dashboard-admin/tickets/gestionar']);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  formatFecha(fecha: string): string {
    return this.ticketService.formatFecha(fecha);
  }

  getEstadoClass(estado: string): string {
    if (!estado) return '';
    
    const estadoLower = estado.toLowerCase().trim().replace(' ', '-');
    switch (estadoLower) {
      case 'pendiente':
        return 'estado-pendiente';
      case 'en-progreso':
        return 'estado-en-progreso';
      case 'resuelto':
        return 'estado-resuelto';
      case 'cerrado':
        return 'estado-cerrado';
      default:
        return '';
    }
  }

  getPrioridadColor(prioridadId: number): string {
    const prioridad = this.prioridades.find(p => p.id === prioridadId);
    return prioridad?.color || '#6B7280';
  }

  getTecnicoById(id: number): any {
    return this.tecnicos.find(t => t.id === id);
  }

  getCategoriaById(id: number): any {
    return this.categorias.find(c => c.id === id);
  }

  getPrioridadById(id: number): any {
    return this.prioridades.find(p => p.id === id);
  }

  truncateText(text: string, maxLength: number = 60): string {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // ===== MANEJO DE ERRORES =====

  private handleError(error: any, defaultMessage: string): void {
    let errorMessage = defaultMessage;
    
    if (error.status === 401) {
      errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
      this.router.navigate(['/login']);
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 404) {
      errorMessage = 'El ticket no fue encontrado';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    this.showError(errorMessage);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
