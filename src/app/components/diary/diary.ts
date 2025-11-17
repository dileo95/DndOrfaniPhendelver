import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Scroll } from '../../services/scroll';

@Component({
  selector: 'app-diary',
  imports: [],
  templateUrl: './diary.html',
  styleUrl: './diary.scss'
})
export class Diary implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private scrollService: Scroll
  ) {}

  ngOnInit(): void {
    this.scrollService.disable();
  }

  ngOnDestroy(): void {
    this.scrollService.enable();
  }

  navigate(section: string): void {
    this.router.navigate(['/diary', section]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
