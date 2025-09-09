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
export class CambiarEstadoTicketComponent {
}