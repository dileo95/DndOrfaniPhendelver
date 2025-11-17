import { Component, signal, PLATFORM_ID, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { PageFlip } from 'page-flip';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss'
})
export class Gallery implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  @ViewChild('flipBook', { static: false }) flipBookRef!: ElementRef<HTMLDivElement>;
  
  private pageFlip: PageFlip | null = null;
  currentPage = signal(0);
  totalPages = signal(0);
  
  coverImage = 'dragon_busters.jpg';
  images = [
    'Screenshot_2024-12-17_alle_11.52.33.png',
    'Screenshot_2024-12-17_alle_13.00.08.png',
    'Screenshot_2024-12-17_alle_18.41.17.png',
    'diary.jpg',
    'ruben-art.jpg',
    'auryn copia (1).jpg',
    'ravel copia (1).jpg',
    'ASRIEL_pact of the blade.png',
    'sketches.png',
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
      usePortrait: false,
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

  goBack(): void {
    this.router.navigate(['/diary']);
  }
}
