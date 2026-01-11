import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BastionService } from '../../services/bastion.service';
import { ToastService } from '../../services/toast.service';
import {
  Bastion,
  BastionOwner,
  BastionFacility,
  BastionHireling,
  BastionEvent,
  BastionOrder,
  BastionOrderType,
  FacilityType,
  FacilityDefinition,
  GoldTransaction,
  Trophy,
  BastionDefender,
  CraftOption,
  HarvestOption,
  TradeOption,
  ResearchOption,
  EmpowerOption,
  RecruitOption,
  GuildType,
  GuildDefinition,
  FACILITY_DEFINITIONS,
  GUILD_DEFINITIONS,
  getAvailableFacilities,
  getFacilityDefinition,
  getGuildDefinition,
  getMaxFacilitiesForLevel,
  ORDER_ICONS,
  ORDER_NAMES_IT,
  OWNER_COLORS,
  OWNER_ICONS
} from '../../models/bastion.models';
import { BastionStats } from '../../services/bastion.service';

type ActiveTab = 'overview' | 'owners' | 'facilities' | 'hirelings' | 'events' | 'treasury' | 'trophies' | 'stats' | 'calendar' | 'defenders';
type ModalType = 'none' | 'add-owner' | 'edit-owner' | 'add-facility' | 'facility-detail' | 'add-hireling' | 'add-gold' | 'add-trophy' | 'event-detail' | 'add-defender' | 'casualty-report' | 'create-order';

@Component({
  selector: 'app-bastion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bastion.html',
  styleUrl: './bastion.scss'
})
export class BastionComponent implements OnInit {
  // State
  bastion = signal<Bastion | null>(null);
  activeTab = signal<ActiveTab>('overview');
  modalType = signal<ModalType>('none');
  isLoading = signal(true);

  // Form data (oggetti mutabili per ngModel)
  newOwnerName = '';
  newOwnerLevel = 5;
  newOwnerClass = '';
  
  editingOwnerData: BastionOwner | null = null;
  selectedOwnerId = '';
  selectedFacilityType: FacilityType | '' = '';
  selectedFacility: BastionFacility | null = null;
  selectedGuildType: GuildType | '' = ''; // Per Guildhall
  
  newHirelingName = '';
  newHirelingRole = '';
  newHirelingFacilityId = '';
  
  facilityCustomName = '';
  
  // Guild definitions per template
  guildDefinitions = GUILD_DEFINITIONS;

  // Gold Transaction form
  goldAmount = 0;
  goldReason = '';

  // Trophy form
  trophyName = '';
  trophyDescription = '';
  trophyAcquiredFrom = '';
  trophyValue = 0;

  // Event detail
  selectedEvent: BastionEvent | null = null;

  // Defender form
  defenderName = '';
  defenderSource: 'barracks' | 'guest' | 'hired' | 'other' = 'barracks';
  defenderCost = 0;
  defenderIsTemporary = false;
  defenderNotes = '';
  lastCasualtyReport: { deaths: number; rolls: number[]; survivors: number } | null = null;

  // Order form
  orderFacility: BastionFacility | null = null;
  selectedOrderType: BastionOrderType | null = null;
  selectedOrderOption: CraftOption | HarvestOption | TradeOption | ResearchOption | EmpowerOption | RecruitOption | null = null;
  orderDescription = '';

  // Search/Filter
  searchTerm = '';

  // Computed
  totalSlots = computed(() => {
    const b = this.bastion();
    return b ? this.bastionService.getTotalAvailableSlots(b) : 0;
  });

  usedSlots = computed(() => {
    const b = this.bastion();
    return b ? this.bastionService.getUsedSlots(b) : 0;
  });

  maxLevel = computed(() => {
    const b = this.bastion();
    return b ? this.bastionService.getMaxOwnerLevel(b) : 5;
  });

  availableFacilityTypes = computed(() => {
    const ownerId = this.selectedOwnerId;
    const b = this.bastion();
    if (!b || !ownerId) return [];
    
    const owner = b.owners.find(o => o.id === ownerId);
    if (!owner) return [];
    
    return getAvailableFacilities(owner.level);
  });

  slotPercentage = computed(() => {
    const total = this.totalSlots();
    if (total === 0) return 0;
    return Math.round((this.usedSlots() / total) * 100);
  });

  recentTransactions = computed(() => {
    const b = this.bastion();
    return b ? this.bastionService.getRecentTransactions(b, 10) : [];
  });

  filteredFacilities = computed(() => {
    const b = this.bastion();
    if (!b) return [];
    const term = this.searchTerm.toLowerCase();
    if (!term) return b.facilities;
    return b.facilities.filter(f => {
      const def = getFacilityDefinition(f.type);
      return f.customName?.toLowerCase().includes(term) ||
             def?.nameIt.toLowerCase().includes(term) ||
             def?.name.toLowerCase().includes(term);
    });
  });

  activeOrders = computed(() => {
    const b = this.bastion();
    return b ? this.bastionService.getActiveOrders(b) : [];
  });

  bastionStats = computed((): BastionStats | null => {
    const b = this.bastion();
    return b ? this.bastionService.getBastionStats(b) : null;
  });

  hirelingCostPerTurn = computed(() => {
    const b = this.bastion();
    return b ? this.bastionService.getHirelingCostsPerTurn(b) : 0;
  });

  defenderCount = computed(() => {
    const b = this.bastion();
    return b ? this.bastionService.getDefenderCount(b) : 0;
  });

  activeDefenders = computed(() => {
    const b = this.bastion();
    return b ? b.defenders.filter(d => d.type !== 'mercenary') : [];
  });

  // Helpers
  readonly facilityDefinitions = FACILITY_DEFINITIONS;
  readonly orderIcons = ORDER_ICONS;
  readonly orderNamesIt = ORDER_NAMES_IT;
  readonly ownerColors = OWNER_COLORS;
  readonly ownerIcons = OWNER_ICONS;

  constructor(
    private bastionService: BastionService,
    private toastService: ToastService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadBastion();
  }

  async loadBastion(): Promise<void> {
    this.isLoading.set(true);
    try {
      const bastion = await this.bastionService.getOrCreateBastion();
      this.bastion.set(bastion);
    } catch (error) {
      console.error('Errore caricamento bastion:', error);
      this.toastService.error('Errore nel caricamento del bastion');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.router.navigate(['/diary']);
  }

  // ============================================================
  // MODAL MANAGEMENT
  // ============================================================

  openModal(type: ModalType): void {
    this.modalType.set(type);
  }

  closeModal(): void {
    this.modalType.set('none');
    this.resetForms();
  }

  resetForms(): void {
    this.newOwnerName = '';
    this.newOwnerLevel = 5;
    this.newOwnerClass = '';
    this.editingOwnerData = null;
    this.selectedOwnerId = '';
    this.selectedFacilityType = '';
    this.selectedFacility = null;
    this.newHirelingName = '';
    this.newHirelingRole = '';
    this.newHirelingFacilityId = '';
    this.facilityCustomName = '';
    this.goldAmount = 0;
    this.goldReason = '';
    this.trophyName = '';
    this.trophyDescription = '';
    this.trophyAcquiredFrom = '';
    this.trophyValue = 0;
    this.selectedEvent = null;
    this.resetDefenderForm();
    this.resetOrderForm();
  }

  resetOrderForm(): void {
    this.orderFacility = null;
    this.selectedOrderType = null;
    this.selectedOrderOption = null;
    this.orderDescription = '';
  }

  // ============================================================
  // OWNERS
  // ============================================================

  async addOwner(): Promise<void> {
    const b = this.bastion();
    
    if (!b || !this.newOwnerName.trim()) {
      this.toastService.warning('Inserisci un nome per il personaggio');
      return;
    }

    if (this.newOwnerLevel < 5 || this.newOwnerLevel > 20) {
      this.toastService.warning('Il livello deve essere tra 5 e 20');
      return;
    }

    try {
      await this.bastionService.addOwner(b, this.newOwnerName.trim(), this.newOwnerLevel, this.newOwnerClass || undefined);
      await this.loadBastion();
      this.closeModal();
      this.toastService.success(`${this.newOwnerName} aggiunto al bastion!`);
    } catch (error) {
      this.toastService.error('Errore nell\'aggiunta del personaggio');
    }
  }

  openEditOwner(owner: BastionOwner): void {
    this.editingOwnerData = { ...owner };
    this.openModal('edit-owner');
  }

  async saveOwnerEdit(): Promise<void> {
    const b = this.bastion();
    const owner = this.editingOwnerData;
    
    if (!b || !owner) return;

    try {
      await this.bastionService.updateOwner(b, owner.id, {
        name: owner.name,
        level: owner.level,
        class: owner.class,
        icon: owner.icon
      });
      await this.loadBastion();
      this.closeModal();
      this.toastService.success('Personaggio aggiornato!');
    } catch (error) {
      this.toastService.error('Errore nell\'aggiornamento');
    }
  }

  async removeOwner(owner: BastionOwner): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    if (!confirm(`Rimuovere ${owner.name} e tutte le sue facility?`)) return;

    try {
      await this.bastionService.removeOwner(b, owner.id);
      await this.loadBastion();
      this.toastService.success(`${owner.name} rimosso dal bastion`);
    } catch (error) {
      this.toastService.error('Errore nella rimozione');
    }
  }

  getOwnerFacilitiesCount(ownerId: string): number {
    const b = this.bastion();
    if (!b) return 0;
    return b.facilities.filter(f => f.ownerId === ownerId).length;
  }

  // ============================================================
  // FACILITIES
  // ============================================================

  openAddFacility(ownerId: string): void {
    this.selectedOwnerId = ownerId;
    this.selectedFacilityType = '';
    this.facilityCustomName = '';
    this.selectedGuildType = '';
    this.openModal('add-facility');
  }

  async addFacility(): Promise<void> {
    const b = this.bastion();
    const ownerId = this.selectedOwnerId;
    const type = this.selectedFacilityType;
    
    if (!b || !ownerId || !type) {
      this.toastService.warning('Seleziona un tipo di facility');
      return;
    }

    // Per Guildhall, verifica che sia selezionato un tipo di gilda
    if (type === 'guildhall' && !this.selectedGuildType) {
      this.toastService.warning('Seleziona un tipo di gilda per la Guildhall');
      return;
    }

    try {
      const facility = await this.bastionService.addFacility(
        b, 
        ownerId, 
        type as FacilityType,
        this.facilityCustomName || undefined,
        this.selectedGuildType as GuildType || undefined
      );

      if (facility) {
        await this.loadBastion();
        this.closeModal();
        const def = getFacilityDefinition(type as FacilityType);
        this.toastService.success(`${def?.nameIt || type} aggiunta!`);
      } else {
        this.toastService.error('Impossibile aggiungere la facility (limite raggiunto o livello insufficiente)');
      }
    } catch (error) {
      this.toastService.error('Errore nell\'aggiunta della facility');
    }
  }

  openFacilityDetail(facility: BastionFacility): void {
    this.selectedFacility = facility;
    this.openModal('facility-detail');
  }

  async removeFacility(facility: BastionFacility): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    const def = getFacilityDefinition(facility.type);
    if (!confirm(`Rimuovere ${facility.customName || def?.nameIt}?`)) return;

    try {
      await this.bastionService.removeFacility(b, facility.id);
      await this.loadBastion();
      this.closeModal();
      this.toastService.success('Facility rimossa');
    } catch (error) {
      this.toastService.error('Errore nella rimozione');
    }
  }

  async saveFacilityNotes(): Promise<void> {
    const b = this.bastion();
    const facility = this.selectedFacility;
    if (!b || !facility) return;

    const idx = b.facilities.findIndex(f => f.id === facility.id);
    if (idx !== -1) {
      b.facilities[idx].notes = facility.notes;
      await this.bastionService.saveBastion(b);
    }
  }

  getFacilityDef(type: FacilityType): FacilityDefinition | undefined {
    return getFacilityDefinition(type);
  }

  getGuildDef(type: GuildType): GuildDefinition | undefined {
    return getGuildDefinition(type);
  }

  getOwnerById(ownerId: string): BastionOwner | undefined {
    return this.bastion()?.owners.find(o => o.id === ownerId);
  }

  getFacilitiesForOwner(ownerId: string): BastionFacility[] {
    const b = this.bastion();
    return b ? this.bastionService.getFacilitiesForOwner(b, ownerId) : [];
  }

  // ============================================================
  // HIRELINGS
  // ============================================================

  openAddHireling(facilityId: string): void {
    this.newHirelingName = '';
    this.newHirelingRole = '';
    this.newHirelingFacilityId = facilityId;
    this.openModal('add-hireling');
  }

  async addHireling(): Promise<void> {
    const b = this.bastion();
    
    if (!b || !this.newHirelingName.trim() || !this.newHirelingFacilityId) {
      this.toastService.warning('Inserisci un nome per l\'hireling');
      return;
    }

    try {
      await this.bastionService.addHireling(
        b, 
        this.newHirelingFacilityId, 
        this.newHirelingName.trim(), 
        this.newHirelingRole || 'Servitore'
      );
      await this.loadBastion();
      this.closeModal();
      this.toastService.success(`${this.newHirelingName} assunto!`);
    } catch (error) {
      this.toastService.error('Errore nell\'aggiunta dell\'hireling');
    }
  }

  async removeHireling(hireling: BastionHireling): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    if (!confirm(`Licenziare ${hireling.name}?`)) return;

    try {
      await this.bastionService.removeHireling(b, hireling.id);
      await this.loadBastion();
      this.toastService.success(`${hireling.name} licenziato`);
    } catch (error) {
      this.toastService.error('Errore nella rimozione');
    }
  }

  getHirelingsForFacility(facilityId: string): BastionHireling[] {
    const b = this.bastion();
    return b ? this.bastionService.getHirelingsForFacility(b, facilityId) : [];
  }

  // ============================================================
  // GOLD & SETTINGS
  // ============================================================

  async updateGold(amount: number): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    b.gold = Math.max(0, b.gold + amount);
    await this.bastionService.saveBastion(b);
    await this.loadBastion();
  }

  openAddGold(isPositive: boolean): void {
    this.goldAmount = isPositive ? 100 : -100;
    this.goldReason = '';
    this.openModal('add-gold');
  }

  async addGoldTransaction(): Promise<void> {
    const b = this.bastion();
    if (!b || this.goldAmount === 0) {
      this.toastService.warning('Inserisci un importo valido');
      return;
    }

    const reason = this.goldReason.trim() || (this.goldAmount > 0 ? 'Entrata' : 'Spesa');
    
    try {
      await this.bastionService.addGoldTransaction(b, this.goldAmount, reason);
      await this.loadBastion();
      this.closeModal();
      const sign = this.goldAmount > 0 ? '+' : '';
      this.toastService.success(`${sign}${this.goldAmount} GP registrati`);
    } catch (error) {
      this.toastService.error('Errore nella transazione');
    }
  }

  async updateBastionName(name: string): Promise<void> {
    const b = this.bastion();
    if (!b || !name.trim()) return;

    b.name = name.trim();
    await this.bastionService.saveBastion(b);
    await this.loadBastion();
    this.toastService.success('Nome aggiornato');
  }

  async advanceTurn(): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    if (!confirm('Avanzare al prossimo turno bastion (7 giorni)?')) return;

    await this.bastionService.advanceTurn(b);
    await this.loadBastion();
    this.toastService.success(`Turno ${b.currentTurn + 1} iniziato!`);
  }

  // ============================================================
  // RANDOM EVENTS
  // ============================================================

  async rollRandomEvent(): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    try {
      const event = await this.bastionService.rollAndRecordEvent(b);
      await this.loadBastion();
      this.selectedEvent = event;
      this.openModal('event-detail');
      this.toastService.info(`🎲 d100: ${event.roll} → ${event.title}`);
    } catch (error) {
      this.toastService.error('Errore nel roll evento');
    }
  }

  openEventDetail(event: BastionEvent): void {
    this.selectedEvent = event;
    this.openModal('event-detail');
  }

  async resolveEvent(event: BastionEvent): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    const idx = b.events.findIndex(e => e.id === event.id);
    if (idx !== -1) {
      b.events[idx].resolved = true;
      b.events[idx].resolvedDate = new Date();
      await this.bastionService.saveBastion(b);
      await this.loadBastion();
      this.closeModal();
      this.toastService.success('Evento risolto!');
    }
  }

  getUnresolvedEvents(): BastionEvent[] {
    const b = this.bastion();
    return b ? b.events.filter(e => !e.resolved) : [];
  }

  getEventTypeIcon(type: string): string {
    switch (type) {
      case 'all-is-well': return '✅';
      case 'attack': return '⚔️';
      case 'criminal-hireling': return '🦹';
      case 'opportunity': return '✨';
      case 'friendly-visitors': return '👋';
      case 'guest': return '🏠';
      case 'lost-hirelings': return '😢';
      case 'magical-discovery': return '🔮';
      case 'refugees': return '🏃';
      case 'request-for-aid': return '🆘';
      case 'treasure': return '💎';
      default: return '📜';
    }
  }

  // ============================================================
  // TROPHY ROOM
  // ============================================================

  openAddTrophy(): void {
    this.trophyName = '';
    this.trophyDescription = '';
    this.trophyAcquiredFrom = '';
    this.trophyValue = 0;
    this.openModal('add-trophy');
  }

  async addTrophy(): Promise<void> {
    const b = this.bastion();
    if (!b || !this.trophyName.trim()) {
      this.toastService.warning('Inserisci un nome per il trofeo');
      return;
    }

    try {
      const trophy: Omit<Trophy, 'id'> = {
        name: this.trophyName.trim(),
        description: this.trophyDescription.trim() || undefined,
        acquiredFrom: this.trophyAcquiredFrom.trim() || undefined,
        acquiredDate: new Date(),
        estimatedValue: this.trophyValue > 0 ? this.trophyValue : undefined
      };
      
      await this.bastionService.addTrophy(b, trophy);
      await this.loadBastion();
      this.closeModal();
      this.toastService.success(`🏆 ${this.trophyName} aggiunto!`);
    } catch (error) {
      this.toastService.error('Errore nell\'aggiunta del trofeo');
    }
  }

  async removeTrophy(trophy: Trophy): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    if (!confirm(`Rimuovere "${trophy.name}" dalla collezione?`)) return;

    try {
      await this.bastionService.removeTrophy(b, trophy.id);
      await this.loadBastion();
      this.toastService.success('Trofeo rimosso');
    } catch (error) {
      this.toastService.error('Errore nella rimozione');
    }
  }

  getTotalTrophyValue(): number {
    const b = this.bastion();
    return b ? this.bastionService.getTotalTrophyValue(b) : 0;
  }

  // ============================================================
  // ORDERS (Timer/Countdown)
  // ============================================================

  getOrderTypeName(type: BastionOrderType): string {
    const names: Record<BastionOrderType, string> = {
      'none': 'Nessuno',
      'craft': 'Fabbricazione',
      'trade': 'Commercio',
      'recruit': 'Reclutamento',
      'research': 'Ricerca',
      'harvest': 'Raccolta',
      'empower': 'Potenziamento'
    };
    return names[type] || type;
  }

  getOrderProgress(order: BastionOrder): number {
    if (!order.turnsRequired || !order.startTurn) return 0;
    const b = this.bastion();
    if (!b) return 0;
    
    const turnsElapsed = b.currentTurn - order.startTurn;
    return Math.min(100, (turnsElapsed / order.turnsRequired) * 100);
  }

  getTurnsRemaining(order: BastionOrder): number {
    if (!order.turnsRequired || !order.startTurn) return 0;
    const b = this.bastion();
    if (!b) return 0;
    
    const turnsElapsed = b.currentTurn - order.startTurn;
    return Math.max(0, order.turnsRequired - turnsElapsed);
  }

  async completeOrderFromActive(activeOrder: { facility: BastionFacility; order: BastionOrder; turnsRemaining: number }): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    try {
      await this.bastionService.completeOrder(b, activeOrder.facility.id);
      await this.loadBastion();
      this.toastService.success('Ordine completato!');
    } catch (error) {
      this.toastService.error('Errore nel completamento');
    }
  }

  // Order Creation
  openCreateOrder(facility: BastionFacility, orderType: BastionOrderType): void {
    if (facility.currentOrder) {
      this.toastService.warning('Questa facility ha già un ordine in corso');
      return;
    }
    this.orderFacility = facility;
    this.selectedOrderType = orderType;
    this.selectedOrderOption = null;
    this.orderDescription = '';
    this.openModal('create-order');
  }

  selectOrderOption(option: CraftOption | HarvestOption | TradeOption | ResearchOption | EmpowerOption | RecruitOption): void {
    this.selectedOrderOption = option;
    // Auto-fill description if empty
    if (!this.orderDescription) {
      this.orderDescription = option.nameIt;
    }
  }

  // Ritorna le opzioni disponibili per l'ordine corrente
  getOrderOptions(def: FacilityDefinition | undefined): (CraftOption | HarvestOption | TradeOption | ResearchOption | EmpowerOption | RecruitOption)[] {
    if (!def || !this.selectedOrderType) return [];
    
    switch (this.selectedOrderType) {
      case 'craft': return def.craftOptions || [];
      case 'harvest': return def.harvestOptions || [];
      case 'trade': return def.tradeOptions || [];
      case 'research': return def.researchOptions || [];
      case 'empower': return def.empowerOptions || [];
      case 'recruit': return def.recruitOptions || [];
      default: return [];
    }
  }

  getOrderDuration(): number {
    // Se c'è un'opzione selezionata, usa quella
    if (this.selectedOrderOption && this.selectedOrderOption.daysRequired > 0) {
      return this.selectedOrderOption.daysRequired;
    }
    // Default: 1 turno per la maggior parte degli ordini
    return 1;
  }

  getOrderCost(): number {
    if (this.selectedOrderOption) {
      return this.selectedOrderOption.goldCost;
    }
    return 0;
  }

  async confirmCreateOrder(): Promise<void> {
    const b = this.bastion();
    if (!b || !this.orderFacility || !this.selectedOrderType) return;

    const def = getFacilityDefinition(this.orderFacility.type);
    
    // Per ordini con opzioni, verifica che sia selezionata un'opzione
    const hasOptions = this.getOrderOptions(def).length > 0;
    if (hasOptions && !this.selectedOrderOption) {
      this.toastService.warning('Seleziona un\'opzione per questo ordine');
      return;
    }

    const duration = this.getOrderDuration();
    const cost = this.getOrderCost();

    // Verifica oro disponibile
    if (cost > b.gold) {
      this.toastService.warning(`Oro insufficiente! Servono ${cost} GP`);
      return;
    }

    try {
      // Crea descrizione completa
      let description = this.orderDescription || this.orderNamesIt[this.selectedOrderType];
      if (this.selectedOrderOption) {
        description = `${this.selectedOrderOption.nameIt}${this.orderDescription !== this.selectedOrderOption.nameIt ? ': ' + this.orderDescription : ''}`;
      }

      const order: Omit<BastionOrder, 'id'> = {
        type: this.selectedOrderType,
        status: 'in-progress',
        description,
        startTurn: b.currentTurn,
        turnsRequired: duration,
        completesAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
        goldCost: cost,
        craftOption: this.selectedOrderOption?.name
      };

      await this.bastionService.assignOrder(b, this.orderFacility.id, order);
      
      // Sottrai l'oro se c'è un costo
      if (cost > 0) {
        await this.bastionService.addGoldTransaction(b, -cost, `Ordine ${description}`);
      }

      await this.loadBastion();
      this.closeModal();
      this.toastService.success(`Ordine avviato: ${description}`);
    } catch (error) {
      console.error('Errore creazione ordine:', error);
      this.toastService.error('Errore nella creazione dell\'ordine');
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  getLevelColor(level: number): string {
    if (level >= 17) return '#9b59b6'; // viola
    if (level >= 13) return '#e74c3c'; // rosso
    if (level >= 9) return '#3498db'; // blu
    return '#27ae60'; // verde
  }

  getCRColor(minLevel: number): string {
    if (minLevel >= 17) return '#9b59b6';
    if (minLevel >= 13) return '#e74c3c';
    if (minLevel >= 9) return '#f39c12';
    return '#27ae60';
  }

  getFacilityDefForHireling(hireling: BastionHireling): FacilityDefinition | undefined {
    const b = this.bastion();
    if (!b) return undefined;
    const facility = b.facilities.find(f => f.id === hireling.facilityId);
    if (!facility) return undefined;
    return getFacilityDefinition(facility.type);
  }

  // ============================================================
  // CALENDAR / TIMELINE
  // ============================================================

  getTimelineEntries(): TimelineEntry[] {
    const b = this.bastion();
    if (!b) return [];

    const entries: TimelineEntry[] = [];

    // Aggiungi eventi recenti
    b.events.slice(-10).forEach(event => {
      entries.push({
        id: event.id,
        type: 'event',
        icon: this.getEventTypeIcon(event.type),
        title: event.title,
        description: event.description,
        turn: event.turn,
        date: event.date
      });
    });

    // Aggiungi ordini completati recenti
    b.facilities.forEach(facility => {
      facility.orderHistory.slice(-3).forEach(order => {
        entries.push({
          id: order.id,
          type: 'order',
          icon: this.orderIcons[order.type] || '📜',
          title: `${this.getFacilityDef(facility.type)?.name || 'Facility'}: ${this.getOrderTypeName(order.type)}`,
          description: order.result || order.description,
          turn: order.startTurn + (order.turnsRequired || 1),
          date: typeof order.completesAt === 'string' ? new Date(order.completesAt) : order.completesAt
        });
      });
    });

    // Aggiungi transazioni oro recenti
    (b.goldHistory || []).slice(-5).forEach(tx => {
      entries.push({
        id: tx.id,
        type: 'gold',
        icon: tx.amount > 0 ? '💰' : '💸',
        title: tx.amount > 0 ? `+${tx.amount} GP` : `${tx.amount} GP`,
        description: tx.reason,
        turn: tx.bastionTurn,
        date: tx.date
      });
    });

    // Ordina per turno decrescente (più recenti prima)
    return entries.sort((a, b) => b.turn - a.turn).slice(0, 15);
  }

  // ============================================================
  // DEFENDERS MANAGEMENT
  // ============================================================

  async addDefender(): Promise<void> {
    const b = this.bastion();
    if (!b || !this.defenderName.trim()) return;

    try {
      const updated = await this.bastionService.addDefender(
        b,
        this.defenderName.trim(),
        this.defenderSource,
        this.defenderCost || undefined,
        this.defenderIsTemporary,
        this.defenderNotes.trim() || undefined
      );
      this.bastion.set(updated);
      this.toastService.success(`Difensore "${this.defenderName}" aggiunto!`);
      this.closeModal();
    } catch (error) {
      console.error('Errore aggiunta defender:', error);
      this.toastService.error('Errore nell\'aggiunta del difensore');
    }
  }

  async removeDefender(defenderId: string): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    const defender = b.defenders.find(d => d.id === defenderId);
    if (!defender) return;

    if (confirm(`Rimuovere il difensore "${defender.name}"?`)) {
      try {
        const updated = await this.bastionService.removeDefender(b, defenderId);
        this.bastion.set(updated);
        this.toastService.success('Difensore rimosso');
      } catch (error) {
        console.error('Errore rimozione defender:', error);
        this.toastService.error('Errore nella rimozione');
      }
    }
  }

  async rollDefenderCasualties(): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    try {
      const result = await this.bastionService.rollDefenderCasualties(b);
      this.bastion.set(result.bastion);
      this.lastCasualtyReport = {
        deaths: result.deaths,
        rolls: result.rolls,
        survivors: this.bastionService.getDefenderCount(result.bastion)
      };
      this.openModal('casualty-report');
      
      if (result.deaths > 0) {
        this.toastService.error(`${result.deaths} difensori caduti in battaglia!`);
      } else {
        this.toastService.success('Tutti i difensori sono sopravvissuti!');
      }
    } catch (error) {
      console.error('Errore calcolo casualties:', error);
      this.toastService.error('Errore nel calcolo delle perdite');
    }
  }

  getDefenderSourceLabel(source: string): string {
    const labels: Record<string, string> = {
      'barracks': '🏛️ Caserma',
      'guest': '🎭 Ospite',
      'hired': '💰 Assoldato',
      'other': '📜 Altro'
    };
    return labels[source] || source;
  }

  getDefenderSourceIcon(source: string): string {
    const icons: Record<string, string> = {
      'barracks': '🏛️',
      'guest': '🎭',
      'hired': '💰',
      'other': '📜'
    };
    return icons[source] || '👤';
  }

  resetDefenderForm(): void {
    this.defenderName = '';
    this.defenderSource = 'barracks';
    this.defenderCost = 0;
    this.defenderIsTemporary = false;
    this.defenderNotes = '';
  }

  getDefendersBySource(source: string): number {
    const b = this.bastion();
    if (!b) return 0;
    return b.defenders.filter(d => d.source === source).length;
  }

  getTemporaryDefendersCount(): number {
    const b = this.bastion();
    if (!b) return 0;
    return b.defenders.filter(d => d.type === 'mercenary').length;
  }

  // Helper per mostrare icone difensori nella vista castello (max 6)
  getDefenderIconsForBarracks(): number[] {
    const count = Math.min(this.defenderCount(), 6);
    return Array.from({ length: count }, (_, i) => i);
  }

  // ============================================================
  // BARRACKS RECRUITMENT
  // ============================================================

  hasBarracks(): boolean {
    const b = this.bastion();
    return b ? b.facilities.some(f => f.type === 'barracks') : false;
  }

  hasAvailableBarracks(): boolean {
    const b = this.bastion();
    return b ? !!this.bastionService.getAvailableBarracks(b) : false;
  }

  getRecruitOrdersInProgress(): number {
    const b = this.bastion();
    if (!b) return 0;
    return b.facilities.filter(f => 
      f.type === 'barracks' && 
      f.currentOrder?.type === 'recruit' &&
      f.currentOrder.status === 'in-progress'
    ).length;
  }

  getPendingRecruitCount(): number {
    const b = this.bastion();
    if (!b) return 0;
    return this.bastionService.getPendingRecruitOrders(b).length;
  }

  async startRecruitment(): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    const result = await this.bastionService.startRecruitOrder(b);
    
    if (result.success) {
      this.bastion.set({...b}); // refresh
      this.toastService.success(result.message);
    } else {
      this.toastService.warning(result.message);
    }
  }

  async completeRecruitment(): Promise<void> {
    const b = this.bastion();
    if (!b) return;

    const pendingBarracks = this.bastionService.getPendingRecruitOrders(b);
    if (pendingBarracks.length === 0) {
      this.toastService.info('Nessun ordine di reclutamento da completare');
      return;
    }

    let totalRecruited = 0;
    for (const barracks of pendingBarracks) {
      const result = await this.bastionService.completeOrder(b, barracks.id);
      if (result.recruitedDefenders) {
        totalRecruited += result.recruitedDefenders;
      }
    }

    await this.loadBastion(); // Ricarica per avere i nuovi defenders
    this.toastService.success(`🛡️ ${totalRecruited} nuovi difensori reclutati!`);
  }
}

interface TimelineEntry {
  id: string;
  type: 'event' | 'order' | 'gold';
  icon: string;
  title: string;
  description?: string;
  turn: number;
  date: Date;
}
