import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TicketService, TicketDetailAdmin} from '../../../services/ticket.service';
import { MATERIAL_IMPORTS } from '../../../material.imports';

@Component({
  selector: 'app-detalle-ticket',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './detalle-ticket.html',
  styleUrls: ['./detalle-ticket.css']
})
export class DetalleTicketComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);

  public ticketDetails = signal<TicketDetailAdmin | null>(null);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const ticketId = params.get('id');
      if (ticketId) {
        this.loadTicketDetails(+ticketId);
      }
    });
  }

  loadTicketDetails(id: number): void {
    this.ticketService.getTicketDetailForAdmin(id).subscribe({
      next: (data) => {
        this.ticketDetails.set(data);
        this.error.set(null);
      },
      error: (err) => {
        console.error('Error al cargar el ticket:', err);
        this.error.set(err.message || 'No se pudo cargar la información del ticket.');
        this.ticketDetails.set(null);
      }
    });
  }
}
