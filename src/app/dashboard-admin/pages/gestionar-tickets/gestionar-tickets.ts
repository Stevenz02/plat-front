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
export class GestionarTicketsComponent {

}