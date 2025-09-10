import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TicketService, TicketDetailUsuario} from '../../../services/ticket.service';
import { MATERIAL_IMPORTS } from '../../../material.imports';

@Component({
  selector: 'app-detalle-ticket-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink, ...MATERIAL_IMPORTS], // Importamos los módulos necesarios
  templateUrl: './detalle-ticket-usuario.html',
  styleUrls: ['./detalle-ticket-usuario.css']
})
export class DetalleTicketUsuarioComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);

  // Usamos una señal para manejar el estado del ticket de forma reactiva
  public ticket = signal<TicketDetailUsuario | null>(null);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    // Obtenemos el ID de los parámetros de la URL
    this.route.paramMap.subscribe(params => {
      const ticketId = params.get('id');
      if (ticketId) {
        this.loadTicketDetails(+ticketId); // El '+' convierte el string a número
      }
    });
  }

  loadTicketDetails(id: number): void {
    this.ticketService.getTicketDetailForUser(id).subscribe({
      next: (data) => {
        this.ticket.set(data); // Actualizamos la señal con los datos del ticket
        this.error.set(null); // Limpiamos cualquier error previo
      },
      error: (err) => {
        console.error('Error al cargar el ticket:', err);
        // La API devuelve errores claros, los mostramos al usuario
        this.error.set(err.message || 'No se pudo cargar la información del ticket.');
        this.ticket.set(null);
      }
    });
  }
}
