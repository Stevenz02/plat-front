import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../../material.imports';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class InicioComponent {

  constructor(private router: Router) {}

  irAModulo(ruta: string): void {
    this.router.navigate([`/dashboard${ruta}`]);
  }
}
