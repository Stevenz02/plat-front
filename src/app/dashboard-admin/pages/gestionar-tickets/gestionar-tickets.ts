import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../../material.imports';
// El resto de los imports de Angular Material ya no son necesarios uno por uno
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Ticket } from '../../../services/ticket.service';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-gestionar-tickets',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './gestionar-tickets.html',
  styleUrls: ['./gestionar-tickets.css']
})
export class GestionarTicketsComponent implements OnInit {

  displayedColumns: string[] = [
    'numero_ticket',
    'titulo',
    'usuario_solicitante',
    'estado',
    'prioridad',
    'fecha_creacion',
    'tecnico_asignado',
    'acciones'
  ];

  dataSource = new MatTableDataSource<Ticket>();
  isLoading = true;
  isAdmin = false;

  totalTickets = 0;
  pageSize = 10;
  currentPage = 1;
  pageSizeOptions = [5, 10, 25, 100];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public ticketService: TicketService, 
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin(); // <-- Esta es la forma correcta
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.ticketService.getAllTickets(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dataSource.data = response.data.tickets;
          this.totalTickets = response.data.pagination.total_items;
        } else {
          console.error('La respuesta del API no fue exitosa:', response.message);
          this.dataSource.data = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los tickets:', err);
        this.isLoading = false;
      }
    });
  }

  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTickets();
  }

  asignarTicket(ticketId: number): void {
    this.router.navigate(['/dashboard-admin/tickets/asignar', ticketId]);
  }

  gestionarTicket(ticketId: number): void {
    this.router.navigate(['/dashboard-admin/tickets/cambiar-estado', ticketId]);
  }
}