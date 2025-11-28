import { Injectable } from '@angular/core';

export interface StoryEntity {
  id: string;
  name: string;
  type: 'character' | 'location' | 'event' | 'organization';
  description: string;
  importance: 1 | 2 | 3; // Dimensione nel grafo
  chapter: 'previous' | 'story';
  image?: string; // Immagine opzionale
}

export interface StoryRelation {
  source: string; // entity id
  target: string; // entity id
  type: 'knows' | 'located_at' | 'participated_in' | 'member_of' | 'allied_with' | 'enemy_of' | 'family';
  description?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string; // "Anno X" o data specifica
  description: string;
  entities: string[]; // character names
  location?: string;
  chapter: 'previous' | 'story';
  order: number; // Per ordinamento
  image?: string; // Immagine opzionale
}

@Injectable({
  providedIn: 'root'
})
export class StoryParserService {
  
  // ============================================
  // DATABASE PERSONAGGI, LUOGHI, EVENTI
  // Basato sulle storie di diary-previous e diary-story
  // ============================================
  
  private knownEntities: StoryEntity[] = [
    // ========== DRAGON BUSTERS (1490-1492 DR) ==========
    { id: 'fascal', name: 'Fascal Cuor\' di Leone', type: 'character', description: 'Giovane paladino di Bahamut di Neverwinter, dorme con il pigiama e un peluche', importance: 3, chapter: 'previous', image: './assets/img/37_Fascal.png' },
    { id: 'drosda', name: 'Don Drosda', type: 'character', description: 'Saggio chierico nano delle colline dedito a Marthammor, ama distribuire volantini', importance: 3, chapter: 'previous', image: './assets/img/36_Don Drosda.png' },
    { id: 'valinor', name: 'Valinor', type: 'character', description: 'Guerriera elfa dei boschi della foresta di Neverwinter, amica degli animali non antropomorfi', importance: 3, chapter: 'previous', image: './assets/img/38_Valynor (DB).png' },
    { id: 'mylo', name: 'Mylo Nightpot', type: 'character', description: 'Furbo ladro di Baldur\'s Gate, temuto per i motivi sbagliati', importance: 3, chapter: 'previous', image: './assets/img/35_mylo.png' },
    { id: 'runara', name: 'Runara', type: 'character', description: 'Sacerdotessa e Drago di Bronzo, madre di Aidron', importance: 2, chapter: 'previous' },
    { id: 'aidron', name: 'Aidron', type: 'character', description: 'Cucciolo di drago bronzo, figlio di Runara', importance: 1, chapter: 'previous' },
    { id: 'fondifaville', name: 'Fondifaville', type: 'character', description: 'Cucciolo di drago blu, vuole far risorgere Sharruth', importance: 2, chapter: 'previous' },
    { id: 'sharruth', name: 'Sharruth', type: 'character', description: 'Dragonessa rossa antica', importance: 2, chapter: 'previous' },
    { id: 'sara-glizoz', name: 'Sara Glizoz', type: 'character', description: 'Figlia adottiva di Falco, si spaccia per Sorella Garaele', importance: 2, chapter: 'previous' },
    { id: 'falco', name: 'Falco', type: 'character', description: 'Aveva una relazione con Runara, padre adottivo di Sara', importance: 2, chapter: 'previous' },
    { id: 'harbin-wester', name: 'Harbin Wester', type: 'character', description: 'Borgomastro di Phandalin, capo del Culto del Drago', importance: 3, chapter: 'previous' },
    { id: 'silkas', name: 'Silkas', type: 'character', description: 'Ex compagno di Mylo, capo del Culto del Drago', importance: 3, chapter: 'previous' },
    { id: 'criovenn', name: 'Criovenn', type: 'character', description: 'Drago bianco alla Guglia Ghiacciata', importance: 2, chapter: 'previous' },
    { id: 'doldur', name: 'Doldur', type: 'character', description: 'Fratello di Drosda, membro degli Zhentarim', importance: 2, chapter: 'previous' },
    { id: 'rezmir', name: 'Rezmir', type: 'character', description: 'Cultista a capo delle forze nel Castello Skyreach', importance: 2, chapter: 'previous' },
    { id: 'neronvhine', name: 'Neronvhine', type: 'character', description: 'Principe elfico dedito al culto', importance: 2, chapter: 'previous' },
    { id: 'lord-neverember', name: 'Lord Neverember', type: 'character', description: 'Membro del consiglio di Waterdeep', importance: 2, chapter: 'previous' },
    { id: 'garaele', name: 'Sorella Garaele', type: 'character', description: 'Dell\'ordine degli Arpisti', importance: 1, chapter: 'previous' },
    { id: 'tiamat', name: 'Tiamat', type: 'character', description: 'Dea dei draghi cromatici', importance: 3, chapter: 'previous' },
    
    // ========== I BAMBINI DI PRISMEER (1513 DR) ==========
    { id: 'arhabal', name: 'Arhabal', type: 'character', description: 'Draconide stregone alla ricerca di vendetta, pessimo senso dell\'orientamento', importance: 3, chapter: 'previous', image: './assets/img/30_ARHABAL.png' },
    { id: 'nioh', name: 'Ni-Oh', type: 'character', description: 'Leporidion monaco, vive per amore ma si veste male', importance: 3, chapter: 'previous', image: './assets/img/32_Nioh.png' },
    { id: 'shion', name: 'Shion', type: 'character', description: 'Tiefling druido, non sorride e non può salire le scale', importance: 3, chapter: 'previous', image: './assets/img/33_Shion.png' },
    { id: 'bowie', name: 'Bowie', type: 'character', description: 'Elfo ranger, figlio di Valinor, ha una civetta di nome Ziggy', importance: 3, chapter: 'previous', image: './assets/img/34_Bowie.png' },
    { id: 'strego', name: 'Signor Strego', type: 'character', description: 'Proprietario del circo Stregolumen', importance: 2, chapter: 'previous' },
    { id: 'lumen', name: 'Signor Lumen', type: 'character', description: 'Co-proprietario del circo Stregolumen', importance: 2, chapter: 'previous' },
    { id: 'bavlorna', name: 'Bavlorna', type: 'character', description: 'Megera simile a un rospo, membro della Congrega della Clessidra', importance: 3, chapter: 'previous' },
    { id: 'belladonna', name: 'Belladonna', type: 'character', description: 'Megera sorella di Bavlorna, risiede a Mantoscuro', importance: 3, chapter: 'previous' },
    { id: 'endelyn', name: 'Endelyn', type: 'character', description: 'Megera del castello Madrecorno ad Altrove', importance: 3, chapter: 'previous' },
    { id: 'vansel', name: 'Vansel', type: 'character', description: 'Satiro salvato dalla prigionia di Bavlorna', importance: 1, chapter: 'previous' },
    { id: 'champy', name: 'Champy', type: 'character', description: 'Simpatico funghetto che vive nella borsa di Arhabal', importance: 1, chapter: 'previous' },
    { id: 'will', name: 'Will', type: 'character', description: 'Leader dei bambini smarriti, in realtà un Oni', importance: 2, chapter: 'previous' },
    { id: 'lamorna', name: 'Lamorna', type: 'character', description: 'Unicorno salvato dall\'assalto di Zarak', importance: 1, chapter: 'previous' },
    { id: 'zarak', name: 'Zarak', type: 'character', description: 'Membro della Lega della Malvagità', importance: 2, chapter: 'previous' },
    { id: 'kelek', name: 'Kelek', type: 'character', description: 'Leader della Lega della Malvagità', importance: 2, chapter: 'previous' },
    { id: 'zargash', name: 'Zargash', type: 'character', description: 'Membro della Lega della Malvagità, riesce a fuggire', importance: 1, chapter: 'previous' },
    { id: 'tasha', name: 'Tasha / Iggvilw / Zybilna', type: 'character', description: 'Potente maga, madre adottiva dei bambini di Prismeer', importance: 3, chapter: 'previous' },
    { id: 'jabberwock', name: 'Jabberwock', type: 'character', description: 'Enorme creatura mostruosa di Prismeer', importance: 2, chapter: 'previous' },
    
    // ========== PROTAGONISTI ATTUALI (1513 DR - Storia) ==========
    { id: 'asriel', name: 'Asriel', type: 'character', description: 'Aasimar warlock legato a Graz\'zt, cerca vendetta contro chi lo ha torturato', importance: 3, chapter: 'story', image: './assets/img/18_Asriel.png' },
    { id: 'auryn', name: 'Auryn', type: 'character', description: 'Elfa particolare con foglie autunnali, il braccio sinistro sta diventando corteccia', importance: 3, chapter: 'story', image: './assets/img/19_Auryn.png' },
    { id: 'ravel', name: 'Ravel', type: 'character', description: 'Mezzelfo mago, amico d\'infanzia di Asriel, lo cercava da anni', importance: 3, chapter: 'story', image: './assets/img/16_Ravel.png' },
    { id: 'ruben', name: 'Ruben', type: 'character', description: 'Paladino, arriva con Gundren, reduce dal Katashaka', importance: 3, chapter: 'story', image: './assets/img/17_Ruben.png' },
    { id: 'gundren', name: 'Gundren', type: 'character', description: 'Nano che necessita scorta personale per il gruppo', importance: 2, chapter: 'story' },
    { id: 'jonah', name: 'Jonah', type: 'character', description: 'Accusa Ruben di essere un disertore, vuole che esegua Asriel e Auryn', importance: 3, chapter: 'story', image: './assets/img/01_Jonah.png' },
    { id: 'frank', name: 'Frank', type: 'character', description: 'Scaltro ladro che cattura Asriel con l\'inganno della moneta', importance: 2, chapter: 'story' },
    { id: 'elizabeth', name: 'Elizabeth', type: 'character', description: 'Maga dai capelli rosa, usa strumenti per catturare potere magico', importance: 2, chapter: 'story' },
    { id: 'grazzt', name: "Graz'zt", type: 'character', description: 'Principe Oscuro di Azzagrat, patron demoniaco di Asriel', importance: 3, chapter: 'previous' },
    { id: 'lyra', name: 'Lyra', type: 'character', description: 'Cangiante dalla pelle grigia, amica di Asriel nel laboratorio', importance: 2, chapter: 'previous' },
    { id: 'snickersnack', name: 'Snickersnack (Snack)', type: 'character', description: 'Enorme orco con forza sovrumana ma stupido, compagno di cella', importance: 2, chapter: 'previous' },
    { id: 'nova', name: 'Nova', type: 'character', description: 'Tiefling alata, prediletta di Graz\'zt prima di Asriel', importance: 2, chapter: 'previous' },
    
    // ========== LUOGHI - DRAGON BUSTERS ==========
    { id: 'sonno-drago', name: 'Sonno del Drago', type: 'location', description: 'Isola delle tempeste nell\'arcipelago Red Rocks, vicino a Waterdeep', importance: 2, chapter: 'previous' },
    { id: 'phandalin', name: 'Phandalin', type: 'location', description: 'Villaggio dove i Dragon Busters vengono chiamati per un drago bianco', importance: 3, chapter: 'previous' },
    { id: 'guglia-ghiacciata', name: 'Guglia Ghiacciata', type: 'location', description: 'Roccaforte dove risiede il drago bianco Criovenn', importance: 2, chapter: 'previous' },
    { id: 'waterdeep', name: 'Waterdeep', type: 'location', description: 'Grande città, sede del consiglio che combatte il Culto del Drago', importance: 3, chapter: 'previous' },
    { id: 'skyreach', name: 'Castello Skyreach', type: 'location', description: 'Isola volante costruita dai giganti delle nuvole', importance: 3, chapter: 'previous' },
    { id: 'tempio-tiamat', name: 'Tempio di Tiamat', type: 'location', description: 'Caverna nelle profondità dove si tenta di far risorgere Tiamat', importance: 3, chapter: 'previous' },
    
    // ========== LUOGHI - PRISMEER ==========
    { id: 'circo-stregolumen', name: 'Circo Stregolumen', type: 'location', description: 'Circo misterioso dove i bambini perdono qualcosa', importance: 2, chapter: 'previous' },
    { id: 'prismeer', name: 'Prismeer', type: 'location', description: 'Mondo magico luminoso oltre lo specchio', importance: 3, chapter: 'previous' },
    { id: 'quivi', name: 'Quivi', type: 'location', description: 'Regione paludosa di Prismeer, territorio di Bavlorna', importance: 2, chapter: 'previous' },
    { id: 'ivi', name: 'Ivi', type: 'location', description: 'Regione di Prismeer con impronte del Jabberwock', importance: 2, chapter: 'previous' },
    { id: 'mantoscuro', name: 'Mantoscuro', type: 'location', description: 'Enorme quercia caduta, dimora di Belladonna', importance: 2, chapter: 'previous' },
    { id: 'altrove', name: 'Altrove', type: 'location', description: 'Luogo oscuro di Prismeer, notte perenne e pioggia scrosciante', importance: 2, chapter: 'previous' },
    { id: 'madrecorno', name: 'Castello Madrecorno', type: 'location', description: 'Castello di Endelyn ad Altrove', importance: 2, chapter: 'previous' },
    { id: 'palazzo-desideri', name: 'Palazzo dei Desideri Reconditi', type: 'location', description: 'Palazzo sopra il cielo di Prismeer dove si trova Tasha', importance: 3, chapter: 'previous' },
    
    // ========== LUOGHI - STORIA ATTUALE ==========
    { id: 'neverwinter', name: 'Neverwinter', type: 'location', description: 'Grande città del Faerun, divisa in parte alta e bassa', importance: 3, chapter: 'story' },
    { id: 'rockguard', name: 'Rockguard', type: 'location', description: 'Palazzo della guardia di Inverno, estremamente controllato', importance: 2, chapter: 'story' },
    { id: 'biblioteca-neverwinter', name: 'Biblioteca di Neverwinter', type: 'location', description: 'Dove Auryn cerca risposte e Ravel litiga con i bibliotecari', importance: 1, chapter: 'story' },
    { id: 'orfanotrofio', name: 'Orfanotrofio', type: 'location', description: 'Dove Asriel e Ravel sono cresciuti insieme', importance: 2, chapter: 'previous' },
    { id: 'laboratorio', name: 'Laboratorio Segreto', type: 'location', description: 'Luogo degli esperimenti su Asriel, con il tatuaggio del drago', importance: 3, chapter: 'previous' },
    { id: 'palazzo-cristallo', name: 'Palazzo di Cristallo', type: 'location', description: 'Dimora di Graz\'zt ad Azzagrat', importance: 3, chapter: 'previous' },
    
    // ========== ORGANIZZAZIONI ==========
    { id: 'dragon-busters', name: 'Dragon Busters', type: 'organization', description: 'Gruppo di eroi sterminatori di draghi (Fascal, Drosda, Valinor, Mylo)', importance: 3, chapter: 'previous' },
    { id: 'culto-drago', name: 'Culto del Drago', type: 'organization', description: 'Vuole far risorgere Tiamat dall\'Avernus', importance: 3, chapter: 'previous' },
    { id: 'zhentarim', name: 'Zhentarim', type: 'organization', description: 'Società segreta di cui fa parte Fascal e Doldur', importance: 2, chapter: 'previous' },
    { id: 'arpisti', name: 'Ordine degli Arpisti', type: 'organization', description: 'Organizzazione di Sorella Garaele che combatte il male', importance: 2, chapter: 'previous' },
    { id: 'congrega-clessidra', name: 'Congrega della Clessidra', type: 'organization', description: 'Le tre megere: Bavlorna, Belladonna, Endelyn', importance: 3, chapter: 'previous' },
    { id: 'lega-malvagita', name: 'Lega della Malvagità', type: 'organization', description: 'Gruppo guidato da Kelek, con Zarak e Zargash', importance: 2, chapter: 'previous' },
    { id: 'org-tatuaggio', name: 'Organizzazione del Tatuaggio', type: 'organization', description: 'Responsabili degli esperimenti, tatuaggio: drago ucciso da spada', importance: 3, chapter: 'story' },
    { id: 'enclave-smeraldo', name: 'Enclave di Smeraldo', type: 'organization', description: 'Gruppo di Delaan Winterhound, partner di Valinor', importance: 1, chapter: 'previous' }
  ];

  private knownRelations: StoryRelation[] = [
    // ========== DRAGON BUSTERS RELATIONS ==========
    { source: 'fascal', target: 'dragon-busters', type: 'member_of', description: 'Membro fondatore' },
    { source: 'drosda', target: 'dragon-busters', type: 'member_of', description: 'Membro fondatore' },
    { source: 'valinor', target: 'dragon-busters', type: 'member_of', description: 'Membro fondatore' },
    { source: 'mylo', target: 'dragon-busters', type: 'member_of', description: 'Membro fondatore' },
    { source: 'fascal', target: 'zhentarim', type: 'member_of', description: 'Membro segreto' },
    { source: 'doldur', target: 'zhentarim', type: 'member_of', description: 'Membro' },
    { source: 'doldur', target: 'drosda', type: 'family', description: 'Fratelli' },
    { source: 'runara', target: 'aidron', type: 'family', description: 'Madre e figlio' },
    { source: 'runara', target: 'falco', type: 'knows', description: 'Relazione amorosa' },
    { source: 'sara-glizoz', target: 'falco', type: 'family', description: 'Figlia adottiva' },
    { source: 'dragon-busters', target: 'sonno-drago', type: 'located_at', description: 'Prima avventura' },
    { source: 'fondifaville', target: 'aidron', type: 'enemy_of', description: 'Lo ha rapito' },
    { source: 'fondifaville', target: 'sharruth', type: 'knows', description: 'Vuole farla risorgere' },
    { source: 'dragon-busters', target: 'phandalin', type: 'located_at', description: 'Seconda avventura' },
    { source: 'dragon-busters', target: 'criovenn', type: 'enemy_of', description: 'Scontro mortale' },
    { source: 'criovenn', target: 'guglia-ghiacciata', type: 'located_at' },
    { source: 'mylo', target: 'silkas', type: 'knows', description: 'Ex compagno' },
    { source: 'silkas', target: 'culto-drago', type: 'member_of', description: 'Capo' },
    { source: 'harbin-wester', target: 'culto-drago', type: 'member_of', description: 'Capo' },
    { source: 'harbin-wester', target: 'phandalin', type: 'located_at', description: 'Borgomastro' },
    { source: 'garaele', target: 'arpisti', type: 'member_of' },
    { source: 'dragon-busters', target: 'skyreach', type: 'located_at', description: 'Scontro con Rezmir' },
    { source: 'rezmir', target: 'skyreach', type: 'located_at' },
    { source: 'rezmir', target: 'culto-drago', type: 'member_of' },
    { source: 'dragon-busters', target: 'waterdeep', type: 'located_at', description: 'Consiglio' },
    { source: 'lord-neverember', target: 'waterdeep', type: 'located_at' },
    { source: 'neronvhine', target: 'culto-drago', type: 'member_of' },
    { source: 'dragon-busters', target: 'tempio-tiamat', type: 'located_at', description: 'Ultimo viaggio' },
    { source: 'tiamat', target: 'tempio-tiamat', type: 'located_at' },
    { source: 'culto-drago', target: 'tiamat', type: 'knows', description: 'Vogliono farla risorgere' },
    { source: 'valinor', target: 'enclave-smeraldo', type: 'allied_with', description: 'Relazione con Delaan' },
    { source: 'valinor', target: 'bowie', type: 'family', description: 'Madre' },
    
    // ========== PRISMEER RELATIONS ==========
    { source: 'arhabal', target: 'circo-stregolumen', type: 'located_at', description: 'Inizio avventura' },
    { source: 'nioh', target: 'circo-stregolumen', type: 'located_at', description: 'Inizio avventura' },
    { source: 'shion', target: 'circo-stregolumen', type: 'located_at', description: 'Inizio avventura' },
    { source: 'bowie', target: 'circo-stregolumen', type: 'located_at', description: 'Inizio avventura' },
    { source: 'strego', target: 'circo-stregolumen', type: 'located_at', description: 'Proprietario' },
    { source: 'lumen', target: 'circo-stregolumen', type: 'located_at', description: 'Proprietario' },
    { source: 'arhabal', target: 'nioh', type: 'allied_with', description: 'Compagni' },
    { source: 'arhabal', target: 'shion', type: 'allied_with', description: 'Compagni' },
    { source: 'arhabal', target: 'bowie', type: 'allied_with', description: 'Compagni' },
    { source: 'nioh', target: 'shion', type: 'allied_with', description: 'Compagni' },
    { source: 'nioh', target: 'bowie', type: 'allied_with', description: 'Compagni' },
    { source: 'shion', target: 'bowie', type: 'allied_with', description: 'Compagni' },
    { source: 'bavlorna', target: 'congrega-clessidra', type: 'member_of' },
    { source: 'belladonna', target: 'congrega-clessidra', type: 'member_of' },
    { source: 'endelyn', target: 'congrega-clessidra', type: 'member_of' },
    { source: 'bavlorna', target: 'quivi', type: 'located_at' },
    { source: 'belladonna', target: 'mantoscuro', type: 'located_at' },
    { source: 'endelyn', target: 'madrecorno', type: 'located_at' },
    { source: 'vansel', target: 'bavlorna', type: 'enemy_of', description: 'Prigioniero' },
    { source: 'champy', target: 'arhabal', type: 'allied_with', description: 'Vive nella sua borsa' },
    { source: 'will', target: 'ivi', type: 'located_at' },
    { source: 'lamorna', target: 'ivi', type: 'located_at' },
    { source: 'zarak', target: 'lega-malvagita', type: 'member_of' },
    { source: 'kelek', target: 'lega-malvagita', type: 'member_of', description: 'Leader' },
    { source: 'zargash', target: 'lega-malvagita', type: 'member_of' },
    { source: 'tasha', target: 'palazzo-desideri', type: 'located_at' },
    { source: 'jabberwock', target: 'prismeer', type: 'located_at' },
    { source: 'arhabal', target: 'lega-malvagita', type: 'enemy_of', description: 'Cerca vendetta' },
    { source: 'arhabal', target: 'org-tatuaggio', type: 'enemy_of', description: 'Cerca vendetta' },
    { source: 'nioh', target: 'jabberwock', type: 'enemy_of', description: 'Lo uccide con Snicker-snak' },
    { source: 'tasha', target: 'arhabal', type: 'knows', description: 'Madre adottiva' },
    { source: 'tasha', target: 'nioh', type: 'knows', description: 'Madre adottiva' },
    { source: 'tasha', target: 'shion', type: 'knows', description: 'Madre adottiva' },
    { source: 'tasha', target: 'bowie', type: 'knows', description: 'Madre adottiva' },
    
    // ========== STORIA ATTUALE - NEVERWINTER ==========
    { source: 'asriel', target: 'neverwinter', type: 'located_at', description: 'Arriva cercando risposte' },
    { source: 'auryn', target: 'neverwinter', type: 'located_at', description: 'Cerca nella biblioteca' },
    { source: 'ravel', target: 'neverwinter', type: 'located_at', description: 'Litiga in biblioteca' },
    { source: 'ruben', target: 'neverwinter', type: 'located_at', description: 'Arriva con Gundren' },
    { source: 'ruben', target: 'gundren', type: 'knows', description: 'Lo accompagna' },
    { source: 'asriel', target: 'frank', type: 'enemy_of', description: 'Lo inganna e cattura' },
    { source: 'frank', target: 'elizabeth', type: 'allied_with' },
    { source: 'elizabeth', target: 'auryn', type: 'enemy_of', description: 'Cattura il suo potere' },
    { source: 'jonah', target: 'ruben', type: 'knows', description: 'Lo accusa di diserzione' },
    { source: 'jonah', target: 'rockguard', type: 'located_at' },
    { source: 'asriel', target: 'rockguard', type: 'located_at', description: 'Prigioniero' },
    { source: 'auryn', target: 'rockguard', type: 'located_at', description: 'Prigioniera' },
    { source: 'asriel', target: 'auryn', type: 'allied_with', description: 'Compagni di cella e poi party' },
    { source: 'asriel', target: 'ravel', type: 'allied_with', description: 'Amici d\'infanzia, ora party' },
    { source: 'asriel', target: 'ruben', type: 'allied_with', description: 'Party member' },
    { source: 'auryn', target: 'ravel', type: 'allied_with', description: 'Party member' },
    { source: 'auryn', target: 'ruben', type: 'allied_with', description: 'Party member' },
    { source: 'ravel', target: 'ruben', type: 'allied_with', description: 'Party member' },
    { source: 'ravel', target: 'lord-neverember', type: 'knows', description: 'Si infiltra come Eindra' },
    
    // ========== ASRIEL BACKSTORY ==========
    { source: 'asriel', target: 'orfanotrofio', type: 'located_at', description: 'Cresciuto qui' },
    { source: 'asriel', target: 'ravel', type: 'knows', description: 'Amico dall\'orfanotrofio' },
    { source: 'ravel', target: 'orfanotrofio', type: 'located_at', description: 'Cresciuto qui' },
    { source: 'asriel', target: 'laboratorio', type: 'located_at', description: 'Prigioniero per anni' },
    { source: 'asriel', target: 'lyra', type: 'allied_with', description: 'Amica nel laboratorio' },
    { source: 'asriel', target: 'snickersnack', type: 'allied_with', description: 'Amico nel laboratorio' },
    { source: 'lyra', target: 'laboratorio', type: 'located_at' },
    { source: 'snickersnack', target: 'laboratorio', type: 'located_at' },
    { source: 'asriel', target: 'grazzt', type: 'knows', description: 'Patron warlock' },
    { source: 'asriel', target: 'palazzo-cristallo', type: 'located_at', description: 'Prigioniero' },
    { source: 'grazzt', target: 'palazzo-cristallo', type: 'located_at' },
    { source: 'nova', target: 'palazzo-cristallo', type: 'located_at' },
    { source: 'asriel', target: 'nova', type: 'enemy_of', description: 'Rivalità' },
    { source: 'org-tatuaggio', target: 'laboratorio', type: 'located_at', description: 'Responsabili' },
    { source: 'asriel', target: 'org-tatuaggio', type: 'enemy_of', description: 'Cerca vendetta' }
  ];

  private timelineEvents: TimelineEvent[] = [
    // ========== DRAGON BUSTERS (1490-1492 DR) ==========
    { id: 'db-1', title: 'L\'Isola delle Tempeste', date: '1490 DR', description: 'Fascal, Drosda, Valinor e Mylo si incontrano sulla nave verso Sonno del Drago. Scoprono che Runara è un Drago di Bronzo.', entities: ['Fascal', 'Drosda', 'Valinor', 'Mylo', 'Runara'], location: 'Sonno del Drago', chapter: 'previous', order: 1, image: './assets/img/37_Fascal.png' },
    { id: 'db-2', title: 'Salvataggio di Aidron', date: '1490 DR', description: 'Il gruppo salva il draghetto Aidron da Fondifaville, che vuole far risorgere la dragonessa Sharruth.', entities: ['Fondifaville', 'Aidron', 'Runara'], location: 'Sonno del Drago', chapter: 'previous', order: 2 },
    { id: 'db-3', title: 'Scontro con Fondifaville', date: '1490 DR', description: 'Battaglia mortale col drago blu. Runara interviene per salvarli. Fondifaville viene "ucciso".', entities: ['Fascal', 'Drosda', 'Valinor', 'Mylo', 'Fondifaville', 'Runara'], location: 'Sonno del Drago', chapter: 'previous', order: 3 },
    { id: 'db-4', title: 'Festa a Phandalin', date: '1490 DR', description: 'Il gruppo si riunisce a Phandalin per la festa di fine anno. Sara Glizoz (spacciandosi per Sorella Garaele) chiede aiuto per un drago bianco.', entities: ['Fascal', 'Drosda', 'Valinor', 'Mylo', 'Sara Glizoz'], location: 'Phandalin', chapter: 'previous', order: 4, image: './assets/img/36_Don Drosda.png' },
    { id: 'db-5', title: 'Tradimento di Fascal', date: '1490 DR', description: 'Si scopre che Fascal è membro degli Zhentarim insieme a Doldur (fratello di Drosda). Fascal non riesce a tradire i compagni e decidono di uccidere Doldur.', entities: ['Fascal', 'Doldur', 'Drosda'], location: 'Phandalin', chapter: 'previous', order: 5 },
    { id: 'db-6', title: 'Attacco del Drago Bianco', date: '1490 DR', description: 'Phandalin viene attaccata dal drago bianco. Una misteriosa entità salva la situazione.', entities: ['Criovenn'], location: 'Phandalin', chapter: 'previous', order: 6 },
    { id: 'db-7', title: 'Guglia Ghiacciata', date: '1490 DR', description: 'Il gruppo affronta Criovenn ma viene massacrato da Silkas. Runara muore salvandoli. Mylo è distrutto dal ritorno del suo ex compagno.', entities: ['Fascal', 'Drosda', 'Valinor', 'Mylo', 'Criovenn', 'Silkas', 'Runara'], location: 'Guglia Ghiacciata', chapter: 'previous', order: 7, image: './assets/img/35_mylo.png' },
    { id: 'db-8', title: 'Nascono i Dragon Busters', date: '1490 DR', description: 'Il gruppo viene accreditato come sterminatori di draghi e adotta ufficialmente il nome Dragon Busters.', entities: ['Fascal', 'Drosda', 'Valinor', 'Mylo'], location: 'Phandalin', chapter: 'previous', order: 8, image: './assets/img/dragon_busters.jpg' },
    { id: 'db-9', title: 'Il Culto del Drago', date: '1491 DR', description: 'Sorella Garaele degli Arpisti chiede ai Dragon Busters di indagare sul Culto del Drago che vuole far risorgere Tiamat.', entities: ['Garaele', 'Silkas', 'Harbin Wester'], location: 'Waterdeep', chapter: 'previous', order: 9 },
    { id: 'db-10', title: 'Castello Skyreach', date: '1491 DR', description: 'Scontro sull\'isola volante dei giganti delle nuvole contro la cultista Rezmir. Fascal li salva a un passo dalla morte.', entities: ['Fascal', 'Drosda', 'Valinor', 'Mylo', 'Rezmir'], location: 'Castello Skyreach', chapter: 'previous', order: 10 },
    { id: 'db-11', title: 'Ricerca del Draakhorn', date: '1491 DR', description: 'Il consiglio di Waterdeep chiede di trovare il Draakhorn, strumento per richiamare i draghi. La missione fallisce: Silkas e Neronvhine li uccidono.', entities: ['Lord Neverember', 'Silkas', 'Neronvhine'], location: 'Waterdeep', chapter: 'previous', order: 11 },
    { id: 'db-12', title: 'Resurrezione', date: '1491 DR', description: 'Sara Glizoz riporta in vita i Dragon Busters.', entities: ['Sara Glizoz', 'Fascal', 'Drosda', 'Valinor', 'Mylo'], chapter: 'previous', order: 12 },
    { id: 'db-13', title: 'Tempio di Tiamat', date: '1492 DR', description: 'L\'ultimo viaggio. Sconfiggono i cultisti, Silkas rinsavisce. Harbin fa risorgere Tiamat ma il tempio crolla e la dea torna nell\'Avernus. Fuga con teletrasporto.', entities: ['Fascal', 'Drosda', 'Valinor', 'Mylo', 'Silkas', 'Harbin Wester', 'Tiamat'], location: 'Tempio di Tiamat', chapter: 'previous', order: 13 },
    { id: 'db-14', title: 'Separazione dei Dragon Busters', date: '1492 DR', description: 'Valinor parte con Delaan dell\'Enclave di Smeraldo. Drosda lavora a Phandalin. Fascal vive col padre Fatalbert. Mylo e Silkas si ricongiungono.', entities: ['Valinor', 'Drosda', 'Fascal', 'Mylo', 'Silkas'], location: 'Faerun', chapter: 'previous', order: 14, image: './assets/img/38_Valynor (DB).png' },
    { id: 'db-15', title: 'Scomparsa dei Dragon Busters', date: '1492 DR - 3° trimestre', description: 'Drosda, Fascal e Mylo scompaiono misteriosamente. Nessuno sa cosa sia successo...', entities: ['Drosda', 'Fascal', 'Mylo'], chapter: 'previous', order: 15 },

    // ========== I BAMBINI DI PRISMEER (1513 DR, 2 settimane prima di Neverwinter) ==========
    { id: 'pr-1', title: 'Il Circo Stregolumen', date: '1513 DR - Autunno', description: 'Arhabal, Ni-Oh, Shion e Bowie si incontrano davanti al circo. Ognuno ha perso qualcosa entrando lì.', entities: ['Arhabal', 'Ni-Oh', 'Shion', 'Bowie', 'Strego', 'Lumen'], location: 'Circo Stregolumen', chapter: 'previous', order: 16, image: './assets/img/30_ARHABAL.png' },
    { id: 'pr-2', title: 'Attraverso lo Specchio', date: '1513 DR - Autunno', description: 'Arhabal viene incoronato monarca. Strego e Lumen chiedono ai ragazzi di entrare nello specchio per recuperare ciò che hanno perso.', entities: ['Arhabal', 'Strego', 'Lumen'], location: 'Circo Stregolumen', chapter: 'previous', order: 17 },
    { id: 'pr-3', title: 'Quivi - La Palude', date: '1513 DR - Autunno', description: 'Il gruppo arriva in una palude luminosa e magica. Incontrano Bavlorna (megera simile a un rospo) e salvano il satiro Vansel.', entities: ['Arhabal', 'Ni-Oh', 'Shion', 'Bowie', 'Bavlorna', 'Vansel'], location: 'Quivi', chapter: 'previous', order: 18, image: './assets/img/33_Shion.png' },
    { id: 'pr-4', title: 'Missione: Rubare i Dipinti', date: '1513 DR - Autunno', description: 'Bavlorna chiede di rubare dipinti dalla sorella Belladonna a Ivi. Strani sogni tormentano i ragazzi.', entities: ['Bavlorna', 'Belladonna'], location: 'Quivi', chapter: 'previous', order: 19 },
    { id: 'pr-5', title: 'Ivi - Champy e i Bambini Smarriti', date: '1513 DR - Autunno', description: 'Conoscono Champy (funghetto) e Will con i bambini smarriti. Notano impronte del Jabberwock. Salvano l\'unicorno Lamorna da Zarak.', entities: ['Arhabal', 'Champy', 'Will', 'Lamorna', 'Zarak'], location: 'Ivi', chapter: 'previous', order: 20, image: './assets/img/34_Bowie.png' },
    { id: 'pr-6', title: 'Assalto a Mantoscuro', date: '1513 DR - Autunno', description: 'Tentano l\'assalto alla dimora di Belladonna. Nioh ruba i ritratti ma Will si rivela un Oni. Will combatte Belladonna per salvarli.', entities: ['Ni-Oh', 'Will', 'Belladonna'], location: 'Mantoscuro', chapter: 'previous', order: 21, image: './assets/img/32_Nioh.png' },
    { id: 'pr-7', title: 'Altrove - Notte Eterna', date: '1513 DR - Autunno', description: 'Regione oscura con pioggia perenne. Il gruppo deve unire le fazioni e infiltrarsi nel castello Madrecorno attraverso le miniere dei Brigganock.', entities: ['Arhabal', 'Ni-Oh', 'Shion', 'Bowie', 'Endelyn'], location: 'Altrove', chapter: 'previous', order: 22 },
    { id: 'pr-8', title: 'Recita per Endelyn', date: '1513 DR - Autunno', description: 'Scoprono che Arhabal cerca vendetta contro chi porta il tatuaggio drago-spada. Costretti a recitare per Endelyn, ricordano l\'infanzia manipolata.', entities: ['Arhabal', 'Endelyn'], location: 'Madrecorno', chapter: 'previous', order: 23 },
    { id: 'pr-9', title: 'Scontro con le Megere', date: '1513 DR - Autunno', description: 'Affrontano Endelyn ma Bavlorna e Belladonna intervengono. Fuggono verso il Palazzo dei Desideri Reconditi.', entities: ['Bavlorna', 'Belladonna', 'Endelyn'], location: 'Madrecorno', chapter: 'previous', order: 24 },
    { id: 'pr-10', title: 'Palazzo dei Desideri Reconditi', date: '1513 DR - Autunno', description: 'Jabberwock e Sanguine pronti a scontrarsi. Battaglia finale contro la Lega della Malvagità di Kelek. Zargash fugge.', entities: ['Kelek', 'Zarak', 'Zargash', 'Jabberwock'], location: 'Palazzo dei Desideri Reconditi', chapter: 'previous', order: 25 },
    { id: 'pr-11', title: 'Morte del Jabberwock', date: '1513 DR - Autunno', description: 'Nioh afferra la Snicker-snak e uccide il Jabberwock. Liberano Tasha/Iggvilw/Zybilna.', entities: ['Ni-Oh', 'Jabberwock', 'Tasha'], location: 'Palazzo dei Desideri Reconditi', chapter: 'previous', order: 26 },
    { id: 'pr-12', title: 'Addio a Prismeer', date: '1513 DR - Autunno', description: 'Tasha rivela di essere stata la loro madre adottiva. Le megere scompaiono. Shion torna dalle aquile, Bowie da Valinor, Nioh sulle montagne, Arhabal regna su Altrove.', entities: ['Tasha', 'Shion', 'Bowie', 'Ni-Oh', 'Arhabal'], location: 'Prismeer', chapter: 'previous', order: 27 },
    
    // ========== BACKSTORY ASRIEL ==========
    { id: 'as-1', title: 'Abbandono all\'Orfanotrofio', date: '~1495 DR', description: 'Asriel viene lasciato neonato davanti all\'orfanotrofio. Cresce timido e silenzioso, scoprendo di poter guarire con un tocco.', entities: ['Asriel'], location: 'Orfanotrofio', chapter: 'previous', order: 28 },
    { id: 'as-2', title: 'Amicizia con Ravel', date: '~1500 DR', description: 'Asriel lega con Ravel, più grande di lui. Ravel lo protegge dai bulli dell\'orfanotrofio.', entities: ['Asriel', 'Ravel'], location: 'Orfanotrofio', chapter: 'previous', order: 29 },
    { id: 'as-3', title: 'Il Rapimento', date: '~1508 DR', description: 'A 13 anni, Asriel viene portato via di notte. Si risveglia nel Laboratorio Segreto con Lyra e Snickersnack.', entities: ['Asriel', 'Lyra', 'Snickersnack'], location: 'Laboratorio Segreto', chapter: 'previous', order: 30 },
    { id: 'as-4', title: 'Anni di Esperimenti', date: '1508-1511 DR', description: 'Prigioniero nel laboratorio, Asriel scopre di essere un Aasimar. Gli sperimentatori hanno il tatuaggio del drago-spada.', entities: ['Asriel', 'Lyra', 'Snickersnack'], location: 'Laboratorio Segreto', chapter: 'previous', order: 31 },
    { id: 'as-5', title: 'Fuga Fallita', date: '~1511 DR', description: 'Ultimo tentativo di fuga fallisce. Asriel viene separato da Lyra e Snack. Non li vedrà mai più.', entities: ['Asriel', 'Lyra', 'Snickersnack'], location: 'Laboratorio Segreto', chapter: 'previous', order: 32 },
    { id: 'as-6', title: 'Il Patto con Graz\'zt', date: '~1511 DR', description: 'Graz\'zt appare e offre libertà in cambio di un patto. Asriel accetta e viene portato nel Palazzo di Cristallo.', entities: ['Asriel', 'Graz\'zt'], location: 'Laboratorio Segreto', chapter: 'previous', order: 33 },
    { id: 'as-7', title: 'Prigioniero nel Palazzo', date: '1511-1513 DR', description: 'Graz\'zt sviluppa un interesse morboso per Asriel, l\'unico che non cerca il suo favore. Nova diventa sua nemica.', entities: ['Asriel', 'Graz\'zt', 'Nova'], location: 'Palazzo di Cristallo', chapter: 'previous', order: 34 },
    { id: 'as-8', title: 'Liberazione', date: '1513 DR', description: 'Dopo l\'ennesimo rifiuto, Graz\'zt lascia andare Asriel: potrà cercare vendetta, ma poi dovrà tornare.', entities: ['Asriel', 'Graz\'zt'], location: 'Palazzo di Cristallo', chapter: 'previous', order: 35 },
    
    // ========== STORIA ATTUALE - NEVERWINTER (1513 DR) ==========
    { id: 'nw-1', title: 'Arrivo a Neverwinter', date: '1513 DR - 1° mese d\'autunno', description: 'Un falco vola sul fiume. Asriel cerca risposte. Auryn si muove tra i mercati, un venditore mascherato le offre una bambolina. Ravel litiga in biblioteca.', entities: ['Asriel', 'Auryn', 'Ravel'], location: 'Neverwinter', chapter: 'story', order: 36, image: './assets/img/18_Asriel.png' },
    { id: 'nw-2', title: 'La Trappola di Frank', date: '1513 DR', description: 'Asriel nota una moneta col simbolo drago-spada in un vicolo. Frank lo inganna e lo cattura. Auryn viene addormentata da una cartomante.', entities: ['Asriel', 'Frank', 'Auryn'], location: 'Neverwinter', chapter: 'story', order: 37 },
    { id: 'nw-3', title: 'Ravel segue il carro', date: '1513 DR', description: 'Ravel vede Auryn portata in un carro prigione e nota Asriel svenuto - qualcuno che non vedeva da tempo. Decide di seguirli.', entities: ['Ravel', 'Auryn', 'Asriel'], location: 'Neverwinter', chapter: 'story', order: 38, image: './assets/img/16_Ravel.png' },
    { id: 'nw-4', title: 'Ruben arriva in città', date: '1513 DR', description: 'Ruben accompagna Gundren che cerca avventurieri. Viene intercettato dalle guardie: Jonah vuole "premiarlo" per i risultati nel Katashaka.', entities: ['Ruben', 'Gundren', 'Jonah'], location: 'Neverwinter', chapter: 'story', order: 39, image: './assets/img/17_Ruben.png' },
    { id: 'nw-5', title: 'Prigionieri a Rockguard', date: '1513 DR', description: 'Asriel si sveglia in cella. Frank ed Elizabeth usano uno strumento metallico per catturare potere magico da Auryn. Cercano una guida.', entities: ['Asriel', 'Auryn', 'Frank', 'Elizabeth'], location: 'Rockguard', chapter: 'story', order: 40 },
    { id: 'nw-6', title: 'L\'Ultimatum di Jonah', date: '1513 DR', description: 'Jonah accusa Ruben di diserzione e gli ordina di giustiziare Asriel e Auryn per dimostrare fedeltà. Presenti anche la cartomante, un cavaliere giovane simile a Jonah, e Frank.', entities: ['Jonah', 'Ruben', 'Asriel', 'Auryn', 'Frank'], location: 'Rockguard', chapter: 'story', order: 41, image: './assets/img/01_Jonah.png' },
    { id: 'nw-7', title: 'Ravel si spaccia per Neverember', date: '1513 DR', description: 'Ravel entra fingendosi Lord Neveramber. Elizabeth lo ignora e lancia una palla di fuoco sul gruppo.', entities: ['Ravel', 'Elizabeth'], location: 'Rockguard', chapter: 'story', order: 42 },
    { id: 'nw-8', title: 'Fuga da Rockguard', date: '1513 DR', description: 'Nel caos, il gruppo si lancia dal palazzo. La bambolina di pezza si ingrandisce e offre un atterraggio morbido.', entities: ['Asriel', 'Auryn', 'Ravel', 'Ruben'], location: 'Rockguard', chapter: 'story', order: 43 },
    { id: 'nw-9', title: 'Inseguimento di Frank', date: '1513 DR', description: 'Frank li insegue. Rubano un carro e fuggono da Neverwinter. Viene mandato contro di loro un drago guardiano nero.', entities: ['Asriel', 'Auryn', 'Ravel', 'Ruben', 'Frank'], location: 'Fuori Neverwinter', chapter: 'story', order: 44 },
    { id: 'nw-10', title: 'Scontro col Drago Nero', date: '1513 DR', description: 'Battaglia senza esclusioni di colpi. Riescono a far cadere il drago da un precipizio.', entities: ['Asriel', 'Auryn', 'Ravel', 'Ruben'], location: 'Strada per Phandalin', chapter: 'story', order: 45, image: './assets/img/diary.jpg' },
    { id: 'nw-11', title: 'Gli Incubi', date: '1513 DR - Notte', description: 'Asriel e Ravel si riavvicinano. Quella notte, intensi incubi tormentano tutti: un filo bianco verso un cuore, una città di cenere, un quadro con luce grigia, una guerra sotto un cielo di morte.', entities: ['Asriel', 'Ravel', 'Auryn', 'Ruben'], location: 'Accampamento', chapter: 'story', order: 46 }
  ];

  constructor() {}

  getEntities(): StoryEntity[] {
    return [...this.knownEntities];
  }

  getRelations(): StoryRelation[] {
    return [...this.knownRelations];
  }

  getTimelineEvents(): TimelineEvent[] {
    return [...this.timelineEvents].sort((a, b) => a.order - b.order);
  }

  getEntitiesByType(type: StoryEntity['type']): StoryEntity[] {
    return this.knownEntities.filter(e => e.type === type);
  }

  getEntitiesByChapter(chapter: 'previous' | 'story'): StoryEntity[] {
    return this.knownEntities.filter(e => e.chapter === chapter);
  }

  getRelationsForEntity(entityId: string): StoryRelation[] {
    return this.knownRelations.filter(r => r.source === entityId || r.target === entityId);
  }

  getTimelineByChapter(chapter: 'previous' | 'story'): TimelineEvent[] {
    return this.timelineEvents
      .filter(e => e.chapter === chapter)
      .sort((a, b) => a.order - b.order);
  }

  // Metodo per aggiungere nuove entità manualmente
  addEntity(entity: Omit<StoryEntity, 'id'>): string {
    const id = entity.name.toLowerCase().replace(/\s+/g, '-');
    this.knownEntities.push({ ...entity, id });
    return id;
  }

  addRelation(relation: StoryRelation): void {
    this.knownRelations.push(relation);
  }

  addTimelineEvent(event: Omit<TimelineEvent, 'id'>): string {
    const id = `evt-${Date.now()}`;
    this.timelineEvents.push({ ...event, id });
    return id;
  }
}
