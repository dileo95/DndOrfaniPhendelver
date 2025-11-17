import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface CharacterHistoryConfig {
  name: string;
  backgroundColor: string;
  story: string;
}

@Component({
  selector: 'app-character-history',
  imports: [],
  templateUrl: './character-history.html',
  styleUrl: './character-history.scss',
})
export class CharacterHistory implements OnInit, OnDestroy {
  characterName = '';
  backgroundColor = '';
  storyContent: SafeHtml = '';
  characterRoute = '';

  private characterConfigs: Record<string, CharacterHistoryConfig> = {
    'asriel': {
      name: 'Asriel',
      backgroundColor: '#39933894',
      story: this.getAsrielStory()
    },
    'auryn': {
      name: 'Auryn',
      backgroundColor: '#b8b81e78',
      story: this.getAurynStory()
    },
    'ravel': {
      name: 'Ravel',
      backgroundColor: '#a8385794',
      story: this.getRavelStory()
    },
    'ruben': {
      name: 'Ruben',
      backgroundColor: '#120ebc66',
      story: this.getRubenStory()
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.characterRoute = this.route.snapshot.paramMap.get('character') || '';
    const config = this.characterConfigs[this.characterRoute];
    
    if (config) {
      this.characterName = config.name;
      this.backgroundColor = config.backgroundColor;
      this.storyContent = this.sanitizer.bypassSecurityTrustHtml(config.story);
    }

    // Abilita lo scroll rimuovendo le classi e gli stili che lo bloccano
    const body = document.body;
    body.classList.remove('no-scroll');
    body.style.position = '';
    body.style.overflow = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
  }

  ngOnDestroy(): void {
    // Pulisci gli stili quando il componente viene distrutto
    const body = document.body;
    body.style.position = '';
    body.style.overflow = '';
  }

  goBack(): void {
    this.router.navigate([this.characterRoute, 'home']);
  }

  private getAsrielStory(): string {
    return `
      <h1>Orfanotrofio</h1>
      <p><img src="/assets/img/asriel-portrait.png" alt="diary" style="width: 30%;border-radius: 10px; border: 2px solid black;float: left;margin-right: 10px;">
      Asriel fu lasciato davanti alle porte di un orfanotrofio fin da neonato. Visse nell'orfanotrofio fino ai 13 anni insieme ad altri bambini e ragazzi come lui. Legò moltissimo con un bambino di nome Ravel, di qualche anno più grande. Timido e silenzioso, veniva spesso bullizzato dagli altri orfani, ma Ravel lo proteggeva sempre. Asriel aveva un piccolo segreto: riusciva a guarire piccole ferite con un semplice tocco.
      Una notte, fu portato via da qualcuno dell'orfanotrofio. Intontito dal sonno, non riuscì a capire cosa stesse succedendo. Lo fecero salire su un carro senza finestre e si addormentò.</p>
      
      <h1>Il laboratorio</h1>
      <img src="/assets/img/prison.jpg" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      <p>Al risveglio, Asriel si ritrovò in una stanza con una minuscola finestrella, da cui poteva vedere solo un piccolo spicchio di cielo. Non era solo: con lui c'era un enorme orco di nome Snickersnack (chiamato Snack), che aveva una forza sovrumana ma era molto stupido, e una piccola ragazzina dalla pelle grigia, un cangiante, di nome Lyra. La ragazzina raccontò ad Asriel che si trovavano in un luogo dove venivano fatti esperimenti su creature come loro. Preso dal panico, Asriel tentò di scappare, ma Snack e Lyra, che erano lì già da tempo, gli dissero che era impossibile. Lyra aveva già provato molte volte a scappare, trasformandosi in qualcuno del laboratorio, ma fallendo sempre.
      Da quel momento, Asriel trascorse alcuni anni intrappolato nel laboratorio, sottoposto a esperimenti di ogni tipo. Le persone del laboratorio avevano sempre il viso coperto; l'unica cosa che Asriel poteva vedere era il tatuaggio che avevano sulla mano.
      Lyra, Snack e Asriel divennero molto legati. Con il tempo, gli esperimenti divennero sempre più sporadici e i tre rimanevano chiusi nella cella. Lyra e Asriel concepirono un ultimo piano per fuggire, ma anche questo fallì e furono separati in celle diverse. Asriel non seppe più nulla dei suoi due amici. Quando si era ormai rassegnato al fatto che sarebbe morto in quella cella, una voce lo chiamò e qualcuno apparve sulla porta della cella. Gli promise libertà, ma in realtà era solo l'inizio di un'altra prigionia.</p>
      
      <h1>Il palazzo di Cristallo</h1>
      <img src="/assets/img/grazzt.jpg" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      <p>Asriel fu preso da Graz'zt, il Principe Oscuro di Azzagrat, attratto dalla sua bellezza, che lo voleva con sé. Graz'zt, in cambio della libertà dal laboratorio, legò Asriel a sé come warlock. Lo portò nel suo palazzo di cristallo e lo costrinse a vivere con lui e tutti gli altri fedeli servitori. Asriel era intrappolato in quel palazzo, da cui nessuno poteva uscire né entrare senza il diretto volere di Graz'zt. Durante il soggiorno nel palazzo, Asriel scoprì di più sulla sua natura: era un Aasimar, e per questo era stato preso per gli esperimenti. Graz'zt non gli rivelò mai nulla riguardo alla natura del laboratorio e a chi ne faceva parte. Asriel chiedeva incessantemente di poter tornare a casa per scoprire cosa fosse successo alla gente nel laboratorio e per vendicarsi di chi lo aveva torturato, ma Graz'zt non glielo permetteva.
      Il demone sviluppò un interesse morboso per Asriel perché, a differenza di tutti gli altri warlock raccolti nel suo palazzo, era l'unico che non era interessato ad entrare nelle grazie del demone. Rimaneva sempre distante e scontroso, il che provocò invidie e attriti tra gli altri warlock presenti nel palazzo, soprattutto una tiefling alata di nome Nova, che prima dell'arrivo di Asriel era considerata la prediletta di Graz'zt.
      Ad un certo punto, senza preavviso, Graz'zt convocò Asriel e, dopo l'ennesimo rifiuto da parte del ragazzo, il demone decise di lasciarlo andare e di dargli la possibilità di capire meglio il suo passato, a patto che una volta ottenuta la sua vendetta, sarebbe tornato al palazzo di cristallo.</p>
      <img src="/assets/img/nova.png" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      
      <h1>Di nuovo nel Faerun</h1>
      <p>Da qualche mese, Asriel viaggia in lungo e in largo alla ricerca del laboratorio e delle persone con il tatuaggio sulla mano. Ha anche un altro obiettivo: sta cercando qualcuno che, una volta ottenuta la sua vendetta, possa liberarlo dal patto con Graz'zt. Ha sentito dire che a Phandalin vive un potente chierico che ha sconfitto Tiamat in passato.</p>
    `;
  }

  private getAurynStory(): string {
    return `
      <h1>Persa a Toril</h1>
      <p><img src="/assets/img/auryn-portrait.png" alt="diary" style="width: 30%;border-radius: 10px; border: 2px solid black;float: left;margin-right: 10px;">
      Auryn non ricorda nulla del suo passato, ma si è risvegliata in una foresta nel cuore dell'autunno. La stagione autunnale è l'unica cosa a cui sente un legame forte, come se fosse parte di lei. Nel bosco in cui si è svegliata, sentiva una presenza che l'osservava, ma non riusciva a trovare nessuno. Non sa che aspetto avesse prima, ma sente che qualcosa è cambiato in lei. Ha capito solo dopo che il suo aspetto cambia con le stagioni: in autunno, il suo aspetto è quello di un elfo silvano, mentre in inverno, primavera ed estate il suo corpo cambia radicalmente. Ha scoperto che può modificare il suo aspetto a piacimento e che la fiamma è dentro di lei, l'unica cosa che ricorda.</p>
      
      <h1>Il braccio sinistro</h1>
      <img src="/assets/img/prison.jpg" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      <p>Auryn ha sempre sentito che c'era qualcosa di sbagliato nel suo braccio sinistro. Si è accorta che, col passare del tempo, la pelle del suo braccio stava diventando sempre più simile a una corteccia scura. Non sente più il tocco su quella parte del corpo, e dalle fessure della corteccia crescono delle foglie. Ha paura che questa cosa si espanda, e sta cercando qualcuno che possa aiutarla a capire cosa le sta succedendo. Nel frattempo, continua a nascondere il braccio sotto guanti e maniche lunghe.</p>
      
      <h1>Ricerca di risposte</h1>
      <img src="/assets/img/grazzt.jpg" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      <p>Durante la sua ricerca di risposte, Auryn è stata imprigionata per un breve periodo. Non ricorda bene cosa sia successo, ma sa che è scappata da lì grazie alla sua abilità di cambiare forma. Da allora, viaggia cercando qualcuno che possa aiutarla a capire cosa le sta succedendo e chi era prima di svegliarsi in quel bosco. Ha sentito parlare di un potente druido che vive nei pressi di Phandalin, e spera che possa darle delle risposte.</p>
      <img src="/assets/img/nova.png" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
    `;
  }

  private getRavelStory(): string {
    return `
      <h1>Orfanotrofio</h1>
      <p><img src="/assets/img/ravel-portrait.png" alt="diary" style="width: 30%;border-radius: 10px; border: 2px solid black;float: left;margin-right: 10px;">
      Ravel è cresciuto nello stesso orfanotrofio di Asriel. Era più grande di lui di qualche anno e si sentiva in dovere di proteggerlo dagli altri bambini che lo prendevano in giro. Ravel era sempre stato un bambino molto intelligente e curioso, e aveva imparato a leggere e scrivere da solo. Quando Asriel scomparve dall'orfanotrofio, Ravel fu distrutto. Non riusciva a capacitarsi di cosa fosse successo e iniziò a fare domande, ma nessuno gli dava risposte. Fu allora che decise che avrebbe fatto di tutto per trovarlo.</p>
      
      <h1>Scuola di magia</h1>
      <img src="/assets/img/prison.jpg" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      <p>Ravel riuscì a entrare in una scuola di magia grazie alle sue capacità innate. Durante gli anni di studio, divenne ossessionato dall'idea di trovare Asriel e scoprì che c'era un'organizzazione segreta che rapiva bambini con abilità speciali. Iniziò a indagare e scoprì che questa organizzazione aveva ramificazioni in tutta la Sword Coast. Ravel si laureò con il massimo dei voti e iniziò a lavorare come investigatore per conto proprio, cercando di infiltrarsi nell'organizzazione.</p>
      
      <h1>Eindra</h1>
      <img src="/assets/img/grazzt.jpg" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      <p>Durante le sue indagini, Ravel scoprì che Lord Neverember aveva collegamenti con l'organizzazione. Decise allora di infiltrarsi a Rockguard sotto falso nome, spacciandosi per un nobile di nome Eindra Silverfrond. Riuscì a entrare nelle grazie di Neverember e a scoprire molte informazioni sull'organizzazione, ma non abbastanza per trovare Asriel. Fu durante questo periodo che iniziò a sviluppare le sue abilità da stregone, scoprendo di avere un legame con la magia selvaggia.</p>
      
      <h1>Omicidio e risentimento</h1>
      <img src="/assets/img/nova.png" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      <p>Dopo anni di ricerche infruttuose, Ravel si ritrovò faccia a faccia con Asriel in circostanze inaspettate. Il risentimento che aveva accumulato in tutti quegli anni di ricerca si manifestò in modi che non si aspettava. Asriel non lo riconosceva più, ed era cambiato profondamente. Ravel si rese conto che forse la persona che stava cercando non esisteva più, ma non poteva ancora arrendersi. Ora viaggia insieme ad Asriel, sperando di ricostruire il legame che avevano un tempo e di aiutarlo a liberarsi dal patto con Graz'zt.</p>
    `;
  }

  private getRubenStory(): string {
    return `
      <h1>Akkomodin</h1>
      <p><img src="/assets/img/ruben-portrait.png" alt="diary" style="width: 30%;border-radius: 10px; border: 2px solid black;float: left;margin-right: 10px;">
      Ruben è nato e cresciuto ad Akkomodin, una piccola città mineraria nelle montagne. Suo padre era un fabbro molto rispettato e sua madre lavorava nella locanda del paese. Ruben ha sempre avuto un talento naturale per la forgiatura e passava gran parte del suo tempo nella bottega del padre, imparando l'arte della lavorazione dei metalli. Era un ragazzo tranquillo e riservato, con pochi amici ma molto dedito al suo lavoro. Quando aveva 16 anni, una False Hydra attaccò il villaggio e uccise molte persone, tra cui i suoi genitori. Ruben fu uno dei pochi sopravvissuti e, dopo l'attacco, decise di lasciare Akkomodin per sempre.</p>
      
      <h1>Una nuova casa</h1>
      <img src="/assets/img/false_hydra.jpg" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      <p>Dopo aver lasciato Akkomodin, Ruben vagò per mesi senza una meta precisa. Arrivò infine a Phandalin, un piccolo villaggio che stava cercando di riprendersi da anni di attacchi e razzie. Qui trovò lavoro come fabbro e iniziò a ricostruirsi una vita. Conobbe Drosda, una chierico nanica che era arrivata a Phandalin per aiutare a ricostruire il tempio locale. I due divennero molto amici e Ruben iniziò a sentirsi di nuovo parte di una comunità.</p>
      <img src="/assets/img/phandalin.jpg" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      
      <h1>La guerra</h1>
      <img src="/assets/img/Drosda.jpg" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      <p>Quando Tiamat attaccò il Faerun, Ruben si unì a Drosda e a un gruppo di avventurieri per combattere contro le forze del drago. Durante la battaglia, Ruben dimostrò un coraggio straordinario e salvò la vita di molti compagni. Fu durante questo periodo che iniziò a sviluppare le sue abilità da paladino, guidato dalla fede in Moradin che Drosda gli aveva trasmesso. Dopo la vittoria contro Tiamat, Ruben tornò a Phandalin, ma qualcosa in lui era cambiato. Aveva visto cose che non avrebbe mai dimenticato e sentiva che il suo destino non era quello di rimanere fermo in un villaggio.</p>
      <img src="/assets/img/Jonah.png" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      
      <h1>Ritorno a Phandalin</h1>
      <img src="/assets/img/dragon_profile.jpeg" alt="diary" style="width: 100%;border-radius: 10px; border: 2px solid black;">
      <p>Ruben ha viaggiato per qualche anno, aiutando le persone in difficoltà e combattendo contro le ingiustizie. Ha sentito parlare di strani eventi che stanno accadendo nei dintorni di Phandalin e ha deciso di tornare per investigare. Sa che Drosda è ancora lì e spera di poterla rivedere. Ha anche sentito dire che ci sono altri avventurieri diretti a Phandalin, e forse il destino li porterà a collaborare per affrontare le nuove minacce che incombono sulla regione.</p>
    `;
  }
}
