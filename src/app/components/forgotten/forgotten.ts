import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgotten',
  imports: [],
  templateUrl: './forgotten.html',
  styleUrl: './forgotten.scss',
})
export class Forgotten {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/intro']);
  }
}
