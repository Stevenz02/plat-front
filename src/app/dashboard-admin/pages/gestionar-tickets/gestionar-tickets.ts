import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MATERIAL_IMPORTS } from '../../../material.imports';
import { TicketService, Ticket } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-gestionar-tickets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './gestionar-tickets.html',
  styleUrls: ['./gestionar-tickets.css']
})
export class GestionarTicketsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'numero_ticket',
    'titulo', 
    'usuario_solicitante',
    'categoria',
    'prioridad',
    'estado',
    'tecnico_asignado',
    'fecha_creacion',
    'horas_transcurridas',
    'acciones'
  ];
  
  dataSource = new MatTableDataSource<Ticket>();
  isLoading = true;
  totalTickets = 0;
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  selectedStatus = '';
  selectedCategory = '';
  selectedPriority = '';
  
  // Datos para filtros
  estados = [
    { value: '', label: 'Todos los estados' },
    { value: '1', label: 'Pendiente' },
    { value: '2', label: 'En Progreso' },
    { value: '3', label: 'Resuelto' },
    { value: '4', label: 'Cerrado' }
  ];

  categorias: any[] = [
    { id: '', nombre: 'Todas las categorías' },
    { id: '1', nombre: 'Hardware' },
    { id: '2', nombre: 'Software' },
    { id: '3', nombre: 'Red' },
    { id: '4', nombre: 'Permisos' }
  ];
  
  prioridades: any[] = [
    { id: '', nombre: 'Todas las prioridades' },
    { id: '1', nombre: 'Alta' },
    { id: '2', nombre: 'Media' },
    { id: '3', nombre: 'Baja' }
  ];
  
  estadisticas: any = {
    total_tickets: 0,
    pendientes: 0,
    en_progreso: 0,
    resueltos: 0,
    cerrados: 0
  };

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTickets(): void {
    this.isLoading = true;
    
    const filters: any = {};
    if (this.selectedStatus) filters.estado_id = this.selectedStatus;
    if (this.selectedCategory) filters.categoria_id = this.selectedCategory;
    if (this.selectedPriority) filters.prioridad_id = this.selectedPriority;
    
    let observable;
    
    if (this.searchTerm) {
      observable = this.ticketService.searchTickets(this.searchTerm, this.currentPage, this.pageSize);
    } else {
      observable = this.ticketService.getAllTickets(this.currentPage, this.pageSize, filters);
    }

    observable.subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.dataSource.data = response.data.tickets;
          this.totalTickets = response.data.pagination.total_items;
          this.calcularEstadisticasDesdeTickets();
        } else {
          this.showError('Error al cargar los tickets');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error, 'Error al cargar los tickets');
      }
    });
  }

  private calcularEstadisticasDesdeTickets(): void {
    const tickets = this.dataSource.data;
    this.estadisticas = {
      total_tickets: tickets.length,
      pendientes: tickets.filter(t => t.estado?.toLowerCase() === 'pendiente').length,
      en_progreso: tickets.filter(t => t.estado?.toLowerCase() === 'en progreso').length,
      resueltos: tickets.filter(t => t.estado?.toLowerCase() === 'resuelto').length,
      cerrados: tickets.filter(t => t.estado?.toLowerCase() === 'cerrado').length
    };
  }

  // ===== MÉTODOS PARA CLASES CSS =====
  getPrioridadClass(prioridad: string | null): string {
    if (!prioridad) return '';
    
    const prioridadLower = prioridad.toLowerCase().trim();
    switch (prioridadLower) {
      case 'alta':
      case 'high':
        return 'prioridad-alta';
      case 'media':
      case 'medium':
        return 'prioridad-media';
      case 'baja':
      case 'low':
        return 'prioridad-baja';
      default:
        return '';
    }
  }

  getEstadoClass(estado: string): string {
    if (!estado) return '';
    
    const estadoLower = estado.toLowerCase().trim().replace(' ', '-');
    switch (estadoLower) {
      case 'pendiente':
      case 'pending':
        return 'estado-pendiente';
      case 'en-progreso':
      case 'in-progress':
        return 'estado-en-progreso';
      case 'resuelto':
      case 'resolved':
        return 'estado-resuelto';
      case 'cerrado':
      case 'closed':
        return 'estado-cerrado';
      default:
        return '';
    }
  }

  // ===== MÉTODOS DE FILTRADO =====
  onSearchChange(): void {
    setTimeout(() => {
      this.currentPage = 1;
      this.loadTickets();
    }, 500);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.searchTerm = '';
    this.loadTickets();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.selectedPriority = '';
    this.currentPage = 1;
    this.loadTickets();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTickets();
  }

  refreshTickets(): void {
    this.currentPage = 1;
    this.loadTickets();
  }

  // ===== NAVEGACIÓN A VISTAS =====
  verDetalle(ticket: Ticket): void {
    this.router.navigate(['/dashboard-admin/tickets/detalle', ticket.id]);
  }

  irAsignarTicket(ticket: Ticket): void {
    this.router.navigate(['/dashboard-admin/tickets/asignar', ticket.id]);
  }

  irCambiarEstado(ticket: Ticket): void {
    this.router.navigate(['/dashboard-admin/tickets/cambiar-estado', ticket.id]);
  }

  // ===== MÉTODOS DE UTILIDAD =====
  formatFecha(fecha: string): string {
    return this.ticketService.formatFecha(fecha);
  }

  getUrgencyClass(ticket: Ticket): string {
    if (ticket.es_urgente) return 'urgente';
    if (ticket.horas_transcurridas > 48) return 'atrasado';
    return '';
  }

  truncateText(text: string, maxLength: number = 40): string {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  canAssignTicket(ticket: Ticket): boolean {
    return ticket.estado === 'Pendiente' && this.authService.isAdmin();
  }

  canChangeStatus(ticket: Ticket): boolean {
    return this.authService.isAdminOrTechnician();
  }

  // ===== MANEJO DE ERRORES =====
  private handleError(error: any, defaultMessage: string): void {
    let errorMessage = defaultMessage;
    
    if (error.status === 401) {
      errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
      this.router.navigate(['/login']);
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
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