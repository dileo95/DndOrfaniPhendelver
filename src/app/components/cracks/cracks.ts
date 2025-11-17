import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cracks',
  imports: [],
  templateUrl: './cracks.html',
  styleUrl: './cracks.scss'
})
export class Cracks {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}
