import { Component, OnInit, OnDestroy, signal, PLATFORM_ID, inject, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { PageFlip } from 'page-flip';

@Component({
  selector: 'app-gallery-artbook',
  imports: [CommonModule],
  templateUrl: './gallery-artbook.html',
  styleUrl: './gallery-artbook.scss',
})
export class GalleryArtbook implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  @ViewChild('flipBook', { static: false }) flipBookRef!: ElementRef<HTMLDivElement>;
  
  private pageFlip: PageFlip | null = null;
  currentPage = signal(0);
  totalPages = signal(0);
  isMobile = signal(false);
  
  // Copertina dedicata
  coverImage = 'sfondo_portrait.png';
  
  // Struttura sezioni con titoli separatori
  sections: { title: string; subtitle?: string; images: string[] }[] = [
    {
      title: 'I Protagonisti',
      subtitle: 'Gli eroi della nostra storia',
      images: [
        'asriel-portrait.png',
        'auryn-portrait.png',
        'ravel-portrait.png',
        'ruben-portrait.png',
        'asriel.png',
        'auryn.png',
        'Ravel.png',
        'Ruben.png',
        'ASRIEL_pact of the blade.png',
        'auryn-lateral.png',
        'ravel-lateral.png',
        'ruben-lateral.png',
        'ruben-art.jpg'
      ]
    },
    {
      title: 'Personaggi',
      subtitle: 'Alleati e compagni di viaggio',
      images: [
        '01_Jonah.png',
        'Jonah.png',
        '16_Ravel.png',
        '17_Ruben.png',
        '18_Asriel.png',
        '19_Auryn.png',
        '30_ARHABAL.png',
        '32_Nioh.png',
        '33_Shion.png',
        '34_Bowie.png',
        '35_mylo.png',
        '36_Don Drosda.png',
        '37_Fascal.png',
        '38_Valynor (DB).png',
        '39_Arhabal_prismeer.png',
        'Annabelle.png',
        'Drosda.jpg'
      ]
    },
    {
      title: 'Scene Memorabili',
      subtitle: 'Momenti indimenticabili',
      images: [
        'prison.jpg',
        'phandalin.jpg',
        'false_hydra.jpg',
        'fight_scene1.png',
        'crossover.png'
      ]
    },
    {
      title: 'Creature',
      subtitle: 'Draghi e mostri leggendari',
      images: [
        'dragon_profile.jpeg',
        'time_dragon.png',
        'grazzt.jpg'
      ]
    },
    {
      title: 'Galleria',
      subtitle: 'Artwork e illustrazioni',
      images: [
        'nova.png',
        'ancient.png',
        'ShatteredAltArt1.jpg',
        'ShatteredAltArt2.jpg',
        'sketches.png',
        'stylish.png',
        'stylish2.png'
      ]
    },
    {
      title: 'Dietro le Quinte',
      subtitle: 'Screenshot della campagna',
      images: [
        '1732548390648444.png',
        '1732611316478019.png',
        '1732615783594140.png',
        'Screenshot_2024-12-17_alle_11.52.33.png',
        'Screenshot_2024-12-17_alle_13.00.08.png',
        'Screenshot_2024-12-17_alle_18.41.17.png',
        'Screenshot_2024-12-20_alle_19.54.02.png'
      ]
    },
    {
      title: 'Paesaggi',
      subtitle: "I luoghi dell'avventura",
      images: [
        'lake.png',
        'dawn.jpg',
        'night.jpg',
        'rainbow.jpg'
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkMobile();
      // Preload images
      this.sections.forEach(section => {
        section.images.forEach(img => {
          const image = new Image();
          image.src = `./assets/img/${img}`;
        });
      });
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
    if (this.pageFlip) {
      // Reinizializza per adattarsi alle nuove dimensioni
      setTimeout(() => {
        this.initPageFlip();
      }, 100);
    }
  }

  private checkMobile(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(window.innerWidth <= 768);
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

    // Rimuovi istanza precedente se esiste
    if (this.pageFlip) {
      this.pageFlip.destroy();
    }

    const isMobileView = this.isMobile();
    const containerWidth = Math.min(window.innerWidth - 40, 900);
    const containerHeight = Math.min(window.innerHeight - 180, 600);
    
    // Calcola dimensioni pagina mantenendo aspect ratio
    const pageWidth = isMobileView ? containerWidth : Math.min(containerWidth / 2, 450);
    const pageHeight = isMobileView ? containerHeight : Math.min(containerHeight, 600);

    this.pageFlip = new PageFlip(this.flipBookRef.nativeElement, {
      width: pageWidth,
      height: pageHeight,
      size: isMobileView ? 'stretch' : 'fixed',
      minWidth: isMobileView ? 280 : 270,
      minHeight: isMobileView ? 400 : 360,
      maxWidth: isMobileView ? window.innerWidth - 20 : 450,
      maxHeight: isMobileView ? window.innerHeight - 150 : 600,
      showCover: true,
      mobileScrollSupport: true,
      swipeDistance: 30,
      clickEventForward: true,
      startPage: 0,
      drawShadow: true,
      flippingTime: 800,
      useMouseEvents: true,
      autoSize: isMobileView,
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
    // Cleanup prima della navigazione
    if (this.pageFlip) {
      this.pageFlip.destroy();
      this.pageFlip = null;
    }
    
    // Ripristina scroll
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.documentElement.style.overflow = '';
    }
    
    this.router.navigate(['/diary']);
  }

  ngOnDestroy(): void {
    // Cleanup PageFlip e ripristina scroll del body
    if (this.pageFlip) {
      this.pageFlip.destroy();
      this.pageFlip = null;
    }
    
    // Ripristina lo scroll del body (in caso sia stato bloccato)
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      this.nextPage();
    } else if (event.key === 'ArrowLeft') {
      this.prevPage();
    }
  }

  // Touch gesture per mobile
  private touchStartX = 0;
  
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const touchEndX = event.changedTouches[0].clientX;
    const diff = this.touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        this.nextPage();
      } else {
        this.prevPage();
      }
    }
  }

  // Tipo per le pagine: può essere immagine o separatore
  getPages(): Array<{type: 'image' | 'separator', left?: string, right?: string, title?: string, subtitle?: string}> {
    const pages: Array<{type: 'image' | 'separator', left?: string, right?: string, title?: string, subtitle?: string}> = [];
    
    this.sections.forEach((section) => {
      // Aggiungi pagina separatore per ogni sezione
      pages.push({
        type: 'separator',
        title: section.title,
        subtitle: section.subtitle
      });
      
      // Aggiungi le immagini della sezione
      for (let i = 0; i < section.images.length; i += 2) {
        pages.push({
          type: 'image',
          left: `./assets/img/${section.images[i]}`,
          right: i + 1 < section.images.length ? `./assets/img/${section.images[i + 1]}` : undefined
        });
      }
    });
    
    return pages;
  }
}
