import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MATERIAL_IMPORTS } from '../../../material.imports';
import { TicketService, Ticket } from '../../../services/ticket.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-tickets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './mis-tickets.html',
  styleUrls: ['./mis-tickets.css']
})
export class MisTicketsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'numero_ticket', 
    'titulo', 
    'categoria', 
    'prioridad', 
    'estado', 
    'fecha_creacion', 
    'acciones'
  ];
  
  dataSource = new MatTableDataSource<Ticket>();
  isLoading = true;
  totalTickets = 0;
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  selectedStatus = '';

  // Estados disponibles para filtro
estados = [
  { value: '', label: 'Todos los estados' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'En Progreso', label: 'En Progreso' },
  { value: 'Resuelto', label: 'Resuelto' },
  { value: 'Cerrado', label: 'Cerrado' }
];

  constructor(
    private ticketService: TicketService,
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
    
    let observable;
    
    if (this.searchTerm) {
      observable = this.ticketService.searchTickets(this.searchTerm, this.currentPage, this.pageSize);
    } else if (this.selectedStatus) {
      observable = this.ticketService.getTicketsByStatus(this.selectedStatus, this.currentPage, this.pageSize);
    } else {
      observable = this.ticketService.getMyTickets(this.currentPage, this.pageSize);
    }

  observable.subscribe({
    next: (response) => {
      this.isLoading = false;
      if (response.success) {
        this.dataSource.data = response.data.tickets;
        this.totalTickets = response.data.pagination.total_items;  // Usar la nueva estructura
      } else {
        this.showError('Error al cargar los tickets');
      }
    },
      error: (error) => {
        this.isLoading = false;
        console.error('Error cargando tickets:', error);
        
        let errorMessage = 'Error al cargar los tickets';
        if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
          this.router.navigate(['/login']);
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.showError(errorMessage);
      }
    });
  }

  onSearchChange(): void {
    // Implementar debounce para no hacer muchas consultas
    setTimeout(() => {
      this.currentPage = 1;
      this.loadTickets();
    }, 500);
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.searchTerm = ''; // Limpiar búsqueda al filtrar por estado
    this.loadTickets();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadTickets();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTickets();
  }

  crearNuevoTicket(): void {
    this.router.navigate(['/dashboard/tickets/crear']);
  }

  verDetalle(ticket: Ticket): void {
    // Navegar al componente de detalle (lo implementaremos después)
    this.router.navigate(['/dashboard/tickets/detalle', ticket.id]);
  }

  // Métodos de utilidad para mostrar información formateada
  getEstadoColor(estado: string): string {
    return this.ticketService.getEstadoColor(estado);
  }

  getPrioridadColor(prioridad: string): string {
    return this.ticketService.getPrioridadColor(prioridad);
  }

  formatFecha(fecha: string): string {
    return this.ticketService.formatFecha(fecha);
  }

  getEstadoLabel(estado: string): string {
    // Los nombres ya vienen correctos desde la BD
    return estado || 'Sin estado';
  }

  getPrioridadLabel(prioridad: string): string {
    // Los nombres ya vienen correctos desde la BD
    return prioridad || 'No asignada';
  }

  // Método para truncar texto largo
  truncateText(text: string, maxLength: number = 50): string {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // Método para refrescar la lista
  refreshTickets(): void {
    this.currentPage = 1;
    this.loadTickets();
  }
}
