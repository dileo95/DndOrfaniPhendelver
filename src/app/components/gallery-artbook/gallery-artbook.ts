import { Component, OnInit, signal, PLATFORM_ID, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { PageFlip } from 'page-flip';

@Component({
  selector: 'app-gallery-artbook',
  imports: [CommonModule],
  templateUrl: './gallery-artbook.html',
  styleUrl: './gallery-artbook.scss',
})
export class GalleryArtbook implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  @ViewChild('flipBook', { static: false }) flipBookRef!: ElementRef<HTMLDivElement>;
  
  private pageFlip: PageFlip | null = null;
  currentPage = signal(0);
  totalPages = signal(0);
  
  coverImage = 'dragon_busters.jpg';
  images: string[] = [
    'asriel-portrait.png',
    'auryn-portrait.png',
    'ravel-portrait.png',
    'ruben-portrait.png',
    'asriel-face.png',
    'auryn-face.png',
    'Ravel-face.png',
    'Ruben-face.png',
    'prison.jpg',
    'grazzt.jpg',
    'nova.png',
    'false_hydra.jpg',
    'phandalin.jpg',
    'Drosda.jpg',
    'Jonah.png',
    'dragon_profile.jpeg',
    'time_dragon-face.png'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Preload images
      this.images.forEach(img => {
        const image = new Image();
        image.src = `/assets/img/${img}`;
      });
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initPageFlip();
      }, 100);
    }
  }

  private initPageFlip(): void {
    if (!this.flipBookRef) return;

    this.pageFlip = new PageFlip(this.flipBookRef.nativeElement, {
      width: 450,
      height: 600,
      size: 'fixed',
      minWidth: 270,
      minHeight: 360,
      maxWidth: 450,
      maxHeight: 600,
      showCover: true,
      mobileScrollSupport: false,
      swipeDistance: 30,
      clickEventForward: true,
      startPage: 0,
      drawShadow: true,
      flippingTime: 1000,
      useMouseEvents: true,
      autoSize: false,
      maxShadowOpacity: 0.5,
      showPageCorners: true,
      disableFlipByClick: false
    });

    this.pageFlip.loadFromHTML(document.querySelectorAll('.page'));

    this.pageFlip.on('flip', (e: any) => {
      this.currentPage.set(e.data);
    });

    this.totalPages.set(this.pageFlip.getPageCount());
  }

  nextPage(): void {
    if (this.pageFlip) {
      this.pageFlip.flipNext();
    }
  }

  prevPage(): void {
    if (this.pageFlip) {
      this.pageFlip.flipPrev();
    }
  }

  goBack(): void {
    this.router.navigate(['/diary']);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      this.nextPage();
    } else if (event.key === 'ArrowLeft') {
      this.prevPage();
    }
  }

  getPages(): Array<{left: string | null, right: string | null}> {
    const pages = [];
    for (let i = 0; i < this.images.length; i += 2) {
      pages.push({
        left: `/assets/img/${this.images[i]}`,
        right: i + 1 < this.images.length ? `/assets/img/${this.images[i + 1]}` : null
      });
    }
    return pages;
  }
}
