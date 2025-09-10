import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../../material.imports';

@Component({
  selector: 'app-inicio-admin',
  standalone: true,
  imports: [
    CommonModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './inicio-admin.html',
  styleUrls: ['./inicio-admin.css']
})
export class InicioAdminComponent {

  constructor(private router: Router) {}

  irAModulo(ruta: string): void {
    this.router.navigate([`/dashboard-admin${ruta}`]);
  }
}

