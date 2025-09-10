import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
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
  // Columnas a mostrar (se quitó 'prioridad')
  displayedColumns: string[] = [
    'numero_ticket', 
    'titulo', 
    'categoria', 
    'estado', 
    'fecha_creacion', 
    'tecnico_asignado',
    'acciones'
  ];
  
  dataSource = new MatTableDataSource<Ticket>();
  isLoading = true;
  totalTickets = 0;
  pageSize = 10;
  currentPage = 1;
  selectedStatus: string | null = null;

  // Estados para el filtro, ahora con tipo explícito
  estados: { value: string | null; label: string }[] = [
    { value: null, label: 'Todos los estados' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'En Progreso', label: 'En Progreso' },
    { value: 'Resuelto', label: 'Resuelto' },
    { value: 'Cerrado', label: 'Cerrado' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public ticketService: TicketService, // Público para usar métodos en la plantilla
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    
    // La lógica para decidir qué método del servicio llamar es correcta
    const observable = this.selectedStatus
      ? this.ticketService.getTicketsByStatus(this.selectedStatus, this.currentPage, this.pageSize)
      : this.ticketService.getMyTickets(this.currentPage, this.pageSize);

    observable.subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dataSource.data = response.data.tickets;
          this.totalTickets = response.data.pagination.total_items;
        } else {
          this.showError(response.message || 'Error al cargar los tickets');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error cargando tickets:', err);
        this.showError('Ocurrió un error al conectar con el servidor.');
      }
    });
  }

  onFilterChange(): void {
    this.paginator.pageIndex = 0;
    this.currentPage = 1;
    this.loadTickets();
  }

  clearFilters(): void {
    if (this.selectedStatus === null) return;
    this.selectedStatus = null;
    this.onFilterChange();
  }

  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTickets();
  }

  crearNuevoTicket(): void {
    this.router.navigate(['/dashboard/tickets/crear']);
  }

  verDetalle(ticketId: number): void {
    // Aquí puedes navegar a una vista de detalle si la tienes
    // Por ahora, solo como ejemplo:
    this.snackBar.open(`Navegando al detalle del ticket #${ticketId}`, 'Cerrar', { duration: 2000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['snackbar-error'] // Asegúrate de tener estilos para esto
    });
  }
}