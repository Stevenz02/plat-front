import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MATERIAL_IMPORTS } from '../../../material.imports';
import { TicketService, Ticket } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-cambiar-estado-ticket',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './cambiar-estado-ticket.html',
  styleUrls: ['./cambiar-estado-ticket.css']
})
export class CambiarEstadoTicketComponent implements OnInit {
  ticketId: number = 0;
  ticket: Ticket | null = null;
  isLoading = true;
  isSubmitting = false;
  
  // Estados disponibles con información detallada
  estados = [
    { 
      id: 1, 
      nombre: 'Pendiente', 
      descripcion: 'El ticket está pendiente de asignación o revisión',
      color: '#D97706',
      icon: 'schedule',
      requiresComment: false
    },
    { 
      id: 2, 
      nombre: 'En Progreso', 
      descripcion: 'El técnico está trabajando activamente en resolver el ticket',
      color: '#002d72',
      icon: 'trending_up',
      requiresComment: true
    },
    { 
      id: 3, 
      nombre: 'Resuelto', 
      descripcion: 'El problema ha sido resuelto, pendiente de confirmación del usuario',
      color: '#059669',
      icon: 'check_circle',
      requiresComment: true
    },
    { 
      id: 4, 
      nombre: 'Cerrado', 
      descripcion: 'El ticket ha sido cerrado definitivamente',
      color: '#6B7280',
      icon: 'lock',
      requiresComment: true
    }
  ];
  
  statusChangeData = {
    nuevo_estado_id: 0,
    comentario_tecnico: ''
  };

  // Historial de cambios de estado (simulado por ahora)
  historialEstados: any[] = [];

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

    this.loadTicket();
  }

  private async loadTicket(): Promise<void> {
    this.isLoading = true;
    
    try {
      const response = await this.ticketService.getTicketById(this.ticketId).toPromise();
      
      if (response?.success) {
        this.ticket = response.data;
        this.initializeStatusData();
        this.loadHistorialEstados();
      } else {
        this.showError('No se pudo cargar el ticket');
        this.router.navigate(['/dashboard-admin/tickets/gestionar']);
      }
    } catch (error) {
      this.handleError(error, 'Error al cargar el ticket');
      this.router.navigate(['/dashboard-admin/tickets/gestionar']);
    } finally {
      this.isLoading = false;
    }
  }

  private initializeStatusData(): void {
    if (this.ticket) {
      const estadoActual = this.getEstadoIdByName(this.ticket.estado || '');
      this.statusChangeData = {
        nuevo_estado_id: estadoActual,
        comentario_tecnico: ''
      };
    }
  }

  private loadHistorialEstados(): void {
    // Por ahora simulamos el historial, en el futuro esto vendría del API
    this.historialEstados = [
      {
        estado: 'Pendiente',
        fecha: this.ticket?.fecha_creacion,
        usuario: 'Sistema',
        comentario: 'Ticket creado por el usuario'
      }
    ];
    
    if (this.ticket?.tecnico_asignado) {
      this.historialEstados.push({
        estado: 'Asignado',
        fecha: this.ticket.fecha_creacion, // En el futuro sería fecha_asignacion
        usuario: 'Administrador',
        comentario: `Asignado a ${this.ticket.tecnico_asignado}`
      });
    }
  }

  // ===== MÉTODOS DE LÓGICA DE ESTADOS =====

  private getEstadoIdByName(estadoNombre: string): number {
    const estado = this.estados.find(e => 
      e.nombre.toLowerCase() === estadoNombre?.toLowerCase()
    );
    return estado?.id || 1;
  }

  getEstadosDisponibles(): any[] {
    if (!this.ticket) return [];

    const estadoActual = this.ticket.estado?.toLowerCase();
    
    // Lógica de transiciones de estado según las reglas de negocio
    switch (estadoActual) {
      case 'pendiente':
        return this.estados.filter(e => 
          e.nombre.toLowerCase() === 'en progreso' || 
          e.nombre.toLowerCase() === 'cerrado'
        );
      case 'en progreso':
        return this.estados.filter(e => 
          e.nombre.toLowerCase() === 'resuelto' || 
          e.nombre.toLowerCase() === 'pendiente' ||
          e.nombre.toLowerCase() === 'cerrado'
        );
      case 'resuelto':
        return this.estados.filter(e => 
          e.nombre.toLowerCase() === 'cerrado' || 
          e.nombre.toLowerCase() === 'en progreso'
        );
      case 'cerrado':
        return this.estados.filter(e => 
          e.nombre.toLowerCase() === 'en progreso'
        );
      default:
        return this.estados;
    }
  }

  // ===== MÉTODOS DE VALIDACIÓN =====

  isFormValid(): boolean {
    const estadoActualId = this.getEstadoIdByName(this.ticket?.estado || '');
    return this.statusChangeData.nuevo_estado_id > 0 && 
           this.statusChangeData.nuevo_estado_id !== estadoActualId;
  }

  isComentarioRequired(): boolean {
    const estadoSeleccionado = this.getEstadoById(this.statusChangeData.nuevo_estado_id);
    return estadoSeleccionado?.requiresComment || false;
  }

  isFormCompletelyValid(): boolean {
    const baseValid = this.isFormValid();
    
    if (this.isComentarioRequired()) {
      return baseValid && this.statusChangeData.comentario_tecnico.trim().length > 0;
    }
    
    return baseValid;
  }

  canChangeStatus(): boolean {
    if (!this.ticket) return false;
    
    // Solo admins y técnicos pueden cambiar estado
    if (!this.authService.isAdminOrTechnician()) return false;
    
    // Si es técnico, solo puede cambiar sus propios tickets asignados
    if (this.authService.isTechnician() && !this.authService.isAdmin()) {
      const currentUser = this.authService.getCurrentUser();
      return this.ticket.tecnico_asignado === currentUser?.email || 
             this.ticket.tecnico_asignado === `${currentUser?.nombres} ${currentUser?.apellidos}`;
    }
    
    return true;
  }

  // ===== MÉTODOS DE FORMULARIO =====

  onEstadoChange(): void {
    // Limpiar comentario si el nuevo estado no lo requiere
    if (!this.isComentarioRequired()) {
      this.statusChangeData.comentario_tecnico = '';
    }
  }

  // ===== MÉTODOS DE ACCIÓN =====

  changeStatus(): void {
    if (!this.ticket || !this.isFormCompletelyValid()) {
      this.showError('Por favor complete todos los campos obligatorios');
      return;
    }

    if (!this.canChangeStatus()) {
      this.showError('No tiene permisos para cambiar el estado de este ticket');
      return;
    }

    this.isSubmitting = true;

    this.ticketService.changeTicketStatus(
      this.ticket.id, 
      this.statusChangeData.nuevo_estado_id,
      this.statusChangeData.comentario_tecnico
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.showSuccess('Estado del ticket actualizado exitosamente');
          this.router.navigate(['/dashboard-admin/tickets/gestionar']);
        } else {
          this.showError(response.message || 'Error al cambiar estado');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.handleError(error, 'Error al cambiar el estado del ticket');
      }
    });
  }

  cancelChange(): void {
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

  getEstadoById(id: number): any {
    return this.estados.find(e => e.id === id);
  }

  getSelectedEstadoNombre(): string {
    const estado = this.getEstadoById(this.statusChangeData.nuevo_estado_id);
    return estado?.nombre || '';
  }

  getSelectedEstadoDescripcion(): string {
    const estado = this.getEstadoById(this.statusChangeData.nuevo_estado_id);
    return estado?.descripcion || '';
  }

  getSelectedEstadoColor(): string {
    const estado = this.getEstadoById(this.statusChangeData.nuevo_estado_id);
    return estado?.color || '#6B7280';
  }

  getSelectedEstadoIcon(): string {
    const estado = this.getEstadoById(this.statusChangeData.nuevo_estado_id);
    return estado?.icon || 'help';
  }

  getWarningMessage(): string {
    const estadoNombre = this.getSelectedEstadoNombre().toLowerCase();
    
    switch (estadoNombre) {
      case 'cerrado':
        return 'Una vez cerrado, el ticket requerirá justificación para reabrir. Esta acción debe realizarse solo cuando el problema esté completamente resuelto.';
      case 'resuelto':
        return 'Al marcar como resuelto, se notificará al usuario para que confirme la solución. El usuario podrá reabrir el ticket si el problema persiste.';
      case 'en progreso':
        return 'El ticket se marcará como activo y se iniciará el seguimiento del tiempo de resolución.';
      case 'pendiente':
        return 'El ticket volverá a la cola de pendientes y podrá ser reasignado.';
      default:
        return '';
    }
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