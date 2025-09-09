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
export class AsignarTicketComponent {
}