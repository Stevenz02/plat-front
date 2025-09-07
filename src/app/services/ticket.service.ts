import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface CreateTicketRequest {
  titulo: string;
  descripcion: string;
  categoria_id?: number | null;
  prioridad_id?: number | null;
  equipo_afectado_id?: number | null;
}

export interface Ticket {
  id: number;
  numero_ticket: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  prioridad_nivel: number;
  estado: string;
  usuario_solicitante: string;
  email_solicitante: string;
  tecnico_asignado: string | null;
  equipo_afectado: string | null;
  fecha_creacion: string;
  fecha_asignacion: string | null;
  fecha_resolucion: string | null;
  fecha_cierre: string | null;
}

export interface TicketResponse {
  success: boolean;
  message: string;
  data: {
    ticket: Ticket;
    siguiente_paso: string;
  };
}

export interface TicketsListResponse {
  success: boolean;
  message: string;
  data: {
    tickets: Ticket[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
      has_next: boolean;
      has_prev: boolean;
    };
    estadisticas: {
      total_tickets: number;
      pendientes: number;
      en_progreso: number;
      resueltos: number;
      cerrados: number;
    };
    filters_applied: {
      rol: string;
      estado_id: number | null;
      categoria_id: number | null;
      prioridad_id: number | null;
      fecha_desde: string | null;
      fecha_hasta: string | null;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Crear un nuevo ticket
  createTicket(ticketData: CreateTicketRequest): Observable<TicketResponse> {
    const headers = this.authService.getAuthHeaders();
    
    // Por ahora enviar los campos como null según tu requerimiento
    const requestData = {
      titulo: ticketData.titulo,
      descripcion: ticketData.descripcion,
      categoria_id: null,
      prioridad_id: null,
      equipo_afectado_id: null
    };

    return this.http.post<TicketResponse>(`${this.apiUrl}/api/tickets`, requestData, { headers });
  }

  // Obtener tickets del usuario actual
  getMyTickets(page: number = 1, limit: number = 10): Observable<TicketsListResponse> {
    const headers = this.authService.getAuthHeaders();
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };

    return this.http.get<TicketsListResponse>(`${this.apiUrl}/api/tickets`, { 
      headers, 
      params 
    });
  }

  // Obtener un ticket específico por ID
  getTicketById(ticketId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/tickets/${ticketId}`, { headers });
  }

  // Actualizar un ticket (para futuras funcionalidades)
  updateTicket(ticketId: number, ticketData: Partial<CreateTicketRequest>): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/api/tickets/${ticketId}`, ticketData, { headers });
  }

  // Obtener categorías disponibles (para futuro uso)
  getCategories(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/categorias`, { headers });
  }

  // Obtener prioridades disponibles (para futuro uso)
  getPriorities(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/prioridades`, { headers });
  }

  // Obtener equipos disponibles (para futuro uso)
  getEquipment(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/equipos`, { headers });
  }

// Filtrar tickets por estado - CORREGIDO
getTicketsByStatus(status: string, page: number = 1, limit: number = 10): Observable<TicketsListResponse> {
  const headers = this.authService.getAuthHeaders();
  
  // Necesitas usar el estado_id según tu BD
  let estado_id: string = '';
  switch (status.toLowerCase()) {
    case 'pendiente': estado_id = '1'; break;
    case 'en progreso': estado_id = '2'; break;
    case 'resuelto': estado_id = '3'; break;
    case 'cerrado': estado_id = '4'; break;
  }
  
  const params = {
    page: page.toString(),
    limit: limit.toString(),
    estado_id: estado_id
  };

  return this.http.get<TicketsListResponse>(`${this.apiUrl}/api/tickets`, { 
    headers, 
    params 
  });
}

// Buscar tickets - ACTUALIZAR cuando sepas qué parámetro usar para búsqueda
searchTickets(searchTerm: string, page: number = 1, limit: number = 10): Observable<TicketsListResponse> {
  const headers = this.authService.getAuthHeaders();
  const params = {
    page: page.toString(),
    limit: limit.toString(),
    // Necesitarías saber cómo se llama el parámetro de búsqueda en tu API
    // Por ejemplo: 'titulo' o 'buscar' o 'q'
    titulo: searchTerm  // Ajustar según tu API
  };

  return this.http.get<TicketsListResponse>(`${this.apiUrl}/api/tickets`, { 
    headers, 
    params 
  });
}

  // Métodos de utilidad
getEstadoColor(estado: string): string {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return '#ff9800'; // Naranja
    case 'en progreso':
      return '#2196f3'; // Azul
    case 'resuelto':
      return '#4caf50'; // Verde
    case 'cerrado':
      return '#9e9e9e'; // Gris
    default:
      return '#757575';
  }
}

getPrioridadColor(prioridad: string): string {
  switch (prioridad.toLowerCase()) {
    case 'alta':
      return '#f44336'; // Rojo
    case 'media':
      return '#ff9800'; // Naranja  
    case 'baja':
      return '#4caf50'; // Verde
    default:
      return '#757575';
  }
}

  formatFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtener estadísticas básicas de tickets del usuario
  getMyTicketStats(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/tickets/mis-tickets/estadisticas`, { headers });
  }
}