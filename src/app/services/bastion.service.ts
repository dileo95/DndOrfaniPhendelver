import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { 
  Bastion, 
  BastionOwner, 
  BastionFacility, 
  BastionHireling, 
  BastionEvent,
  BastionOrder,
  BastionOrderType,
  FacilityType,
  GuildType,
  GoldTransaction,
  Trophy,
  BastionDefender,
  generateId,
  getMaxFacilitiesForLevel,
  OWNER_COLORS,
  getFacilityDefinition,
  rollBastionEvent
} from '../models/bastion.models';

@Injectable({
  providedIn: 'root'
})
export class BastionService extends Dexie {
  bastions!: Table<Bastion, number>;

  constructor() {
    super('PhendelverBastionDB');
    
    this.version(1).stores({
      bastions: '++id, name, createdAt, updatedAt'
    });
  }

  // ============================================================
  // BASTION CRUD
  // ============================================================

  /**
   * Ottiene il bastion principale (o lo crea se non esiste)
   */
  async getOrCreateBastion(): Promise<Bastion> {
    const existing = await this.bastions.toCollection().first();
    
    if (existing) {
      return existing;
    }

    // Crea un nuovo bastion vuoto
    const newBastion: Omit<Bastion, 'id'> = {
      name: 'Maniero Trasendar',
      location: 'Phendelver',
      gold: 0,
      goldHistory: [],
      currentTurn: 1,
      turnStartDate: new Date(),
      owners: [],
      facilities: [],
      hirelings: [],
      defenders: [],
      events: [],
      notes: '',
      trophies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await this.bastions.add(newBastion as Bastion);
    return { ...newBastion, id } as Bastion;
  }

  /**
   * Salva/aggiorna il bastion
   */
  async saveBastion(bastion: Bastion): Promise<void> {
    bastion.updatedAt = new Date();
    
    if (bastion.id) {
      await this.bastions.put(bastion);
    } else {
      bastion.createdAt = new Date();
      await this.bastions.add(bastion);
    }
  }

  // ============================================================
  // OWNERS MANAGEMENT
  // ============================================================

  /**
   * Aggiunge un nuovo proprietario (PG) al bastion
   */
  async addOwner(bastion: Bastion, name: string, level: number, characterClass?: string): Promise<BastionOwner> {
    const usedColors = bastion.owners.map(o => o.color);
    const availableColor = OWNER_COLORS.find(c => !usedColors.includes(c)) || OWNER_COLORS[0];

    const owner: BastionOwner = {
      id: generateId(),
      name,
      level,
      class: characterClass,
      maxFacilities: getMaxFacilitiesForLevel(level),
      color: availableColor
    };

    bastion.owners.push(owner);
    await this.saveBastion(bastion);
    return owner;
  }

  /**
   * Aggiorna un proprietario
   */
  async updateOwner(bastion: Bastion, ownerId: string, updates: Partial<BastionOwner>): Promise<void> {
    const owner = bastion.owners.find(o => o.id === ownerId);
    if (owner) {
      Object.assign(owner, updates);
      if (updates.level !== undefined) {
        owner.maxFacilities = getMaxFacilitiesForLevel(updates.level);
      }
      await this.saveBastion(bastion);
    }
  }

  /**
   * Rimuove un proprietario (e le sue facility)
   */
  async removeOwner(bastion: Bastion, ownerId: string): Promise<void> {
    bastion.owners = bastion.owners.filter(o => o.id !== ownerId);
    bastion.facilities = bastion.facilities.filter(f => f.ownerId !== ownerId);
    bastion.hirelings = bastion.hirelings.filter(h => {
      const facility = bastion.facilities.find(f => f.id === h.facilityId);
      return facility !== undefined;
    });
    await this.saveBastion(bastion);
  }

  // ============================================================
  // FACILITIES MANAGEMENT
  // ============================================================

  /**
   * Aggiunge una nuova facility
   */
  async addFacility(
    bastion: Bastion, 
    ownerId: string, 
    type: FacilityType,
    customName?: string,
    guildType?: GuildType
  ): Promise<BastionFacility | null> {
    const owner = bastion.owners.find(o => o.id === ownerId);
    if (!owner) return null;

    // Verifica che il proprietario possa avere più facility
    const ownerFacilities = bastion.facilities.filter(f => f.ownerId === ownerId);
    if (ownerFacilities.length >= owner.maxFacilities) {
      return null; // limite raggiunto
    }

    const definition = getFacilityDefinition(type);
    if (!definition) return null;

    // Verifica livello minimo
    if (owner.level < definition.minLevel) {
      return null;
    }

    const facility: BastionFacility = {
      id: generateId(),
      type,
      customName,
      ownerId,
      size: definition.size,
      isBuilding: false,
      orderHistory: [],
      guildType: type === 'guildhall' ? guildType : undefined
    };

    bastion.facilities.push(facility);
    await this.saveBastion(bastion);
    return facility;
  }

  /**
   * Aggiorna una facility
   */
  async updateFacility(bastion: Bastion, facilityId: string, updates: Partial<BastionFacility>): Promise<void> {
    const facility = bastion.facilities.find(f => f.id === facilityId);
    if (facility) {
      Object.assign(facility, updates);
      await this.saveBastion(bastion);
    }
  }

  /**
   * Rimuove una facility
   */
  async removeFacility(bastion: Bastion, facilityId: string): Promise<void> {
    bastion.facilities = bastion.facilities.filter(f => f.id !== facilityId);
    bastion.hirelings = bastion.hirelings.filter(h => h.facilityId !== facilityId);
    await this.saveBastion(bastion);
  }

  // ============================================================
  // HIRELINGS MANAGEMENT
  // ============================================================

  /**
   * Aggiunge un hireling a una facility
   */
  async addHireling(
    bastion: Bastion, 
    facilityId: string, 
    name: string, 
    role: string,
    salary?: number
  ): Promise<BastionHireling> {
    const hireling: BastionHireling = {
      id: generateId(),
      name,
      role,
      facilityId,
      salary
    };

    bastion.hirelings.push(hireling);
    await this.saveBastion(bastion);
    return hireling;
  }

  /**
   * Aggiorna un hireling
   */
  async updateHireling(bastion: Bastion, hirelingId: string, updates: Partial<BastionHireling>): Promise<void> {
    const hireling = bastion.hirelings.find(h => h.id === hirelingId);
    if (hireling) {
      Object.assign(hireling, updates);
      await this.saveBastion(bastion);
    }
  }

  /**
   * Rimuove un hireling
   */
  async removeHireling(bastion: Bastion, hirelingId: string): Promise<void> {
    bastion.hirelings = bastion.hirelings.filter(h => h.id !== hirelingId);
    await this.saveBastion(bastion);
  }

  /**
   * Ottiene gli hirelings di una facility
   */
  getHirelingsForFacility(bastion: Bastion, facilityId: string): BastionHireling[] {
    return bastion.hirelings.filter(h => h.facilityId === facilityId);
  }

  // ============================================================
  // ORDERS MANAGEMENT
  // ============================================================

  /**
   * Assegna un ordine a una facility
   */
  async assignOrder(
    bastion: Bastion, 
    facilityId: string, 
    order: Omit<BastionOrder, 'id'>
  ): Promise<void> {
    const facility = bastion.facilities.find(f => f.id === facilityId);
    if (facility) {
      const fullOrder: BastionOrder = {
        ...order,
        id: generateId()
      };
      facility.currentOrder = fullOrder;
      await this.saveBastion(bastion);
    }
  }

  // ============================================================
  // EVENTS MANAGEMENT
  // ============================================================

  /**
   * Aggiunge un evento al bastion
   */
  async addEvent(bastion: Bastion, event: Omit<BastionEvent, 'id'>): Promise<void> {
    const fullEvent: BastionEvent = {
      ...event,
      id: generateId()
    };
    bastion.events.push(fullEvent);
    await this.saveBastion(bastion);
  }

  // ============================================================
  // TURN MANAGEMENT
  // ============================================================

  /**
   * Avanza di un turno bastion (7 giorni)
   */
  async advanceTurn(bastion: Bastion): Promise<void> {
    bastion.currentTurn++;
    bastion.turnStartDate = new Date();
    
    // Completa automaticamente gli ordini in corso
    for (const facility of bastion.facilities) {
      if (facility.currentOrder && facility.currentOrder.status === 'in-progress') {
        if (new Date() >= new Date(facility.currentOrder.completesAt)) {
          facility.currentOrder.status = 'completed';
          facility.orderHistory.push(facility.currentOrder);
          facility.currentOrder = undefined;
        }
      }
    }

    await this.saveBastion(bastion);
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Calcola il totale delle facility per proprietario
   */
  getFacilitiesCountByOwner(bastion: Bastion): Map<string, number> {
    const counts = new Map<string, number>();
    for (const owner of bastion.owners) {
      counts.set(owner.id, bastion.facilities.filter(f => f.ownerId === owner.id).length);
    }
    return counts;
  }

  /**
   * Calcola lo spazio totale disponibile
   */
  getTotalAvailableSlots(bastion: Bastion): number {
    return bastion.owners.reduce((sum, owner) => sum + owner.maxFacilities, 0);
  }

  /**
   * Calcola lo spazio utilizzato
   */
  getUsedSlots(bastion: Bastion): number {
    return bastion.facilities.length;
  }

  /**
   * Ottiene il livello massimo tra tutti i proprietari
   */
  getMaxOwnerLevel(bastion: Bastion): number {
    if (bastion.owners.length === 0) return 0;
    return Math.max(...bastion.owners.map(o => o.level));
  }

  /**
   * Ottiene le facility di un proprietario
   */
  getFacilitiesForOwner(bastion: Bastion, ownerId: string): BastionFacility[] {
    return bastion.facilities.filter(f => f.ownerId === ownerId);
  }

  /**
   * Calcola il numero totale di hirelings
   */
  getTotalHirelings(bastion: Bastion): number {
    return bastion.hirelings.length;
  }

  /**
   * Ottiene tutte le facility con ordini attivi
   */
  getActiveOrders(bastion: Bastion): { facility: BastionFacility; order: BastionOrder; turnsRemaining: number }[] {
    return bastion.facilities
      .filter(f => f.currentOrder && f.currentOrder.status === 'in-progress')
      .map(f => ({
        facility: f,
        order: f.currentOrder!,
        turnsRemaining: Math.max(0, 
          (f.currentOrder!.startTurn + f.currentOrder!.turnsRequired) - bastion.currentTurn
        )
      }));
  }

  /**
   * Avvia un nuovo ordine su una facility
   */
  async startOrder(bastion: Bastion, facilityId: string, orderType: BastionOrderType, description: string, turnsRequired: number = 1, goldCost?: number): Promise<void> {
    const facility = bastion.facilities.find(f => f.id === facilityId);
    if (!facility) return;

    const order: BastionOrder = {
      id: generateId(),
      type: orderType,
      description,
      startedAt: new Date(),
      completesAt: new Date(Date.now() + turnsRequired * 7 * 24 * 60 * 60 * 1000), // 7 giorni per turno
      startTurn: bastion.currentTurn,
      turnsRequired,
      status: 'in-progress',
      goldCost
    };

    facility.currentOrder = order;
    await this.saveBastion(bastion);
  }

  /**
   * Completa un ordine
   */
  async completeOrder(bastion: Bastion, facilityId: string, result?: string, goldEarned?: number): Promise<{ recruitedDefenders?: number }> {
    const facility = bastion.facilities.find(f => f.id === facilityId);
    if (!facility || !facility.currentOrder) return {};

    const orderType = facility.currentOrder.type;
    const orderDescription = facility.currentOrder.description;
    const craftOption = facility.currentOrder.craftOption;
    let recruitedDefenders: number | undefined;

    // Gestisci effetti speciali in base al tipo di ordine
    if (orderType === 'recruit') {
      // DMG 2024: Barracks Recruit - ottieni 1d4 Bastion Defenders
      recruitedDefenders = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < recruitedDefenders; i++) {
        await this.addDefender(
          bastion,
          `Guardia Reclutata #${bastion.defenders.length + 1}`,
          'barracks',
          0,
          true, // temporanei fino al prossimo evento
          'Reclutati dalla Caserma'
        );
      }
      result = result || `Reclutati ${recruitedDefenders} difensori!`;
    }

    facility.currentOrder.status = 'completed';
    facility.currentOrder.result = result;
    facility.currentOrder.goldEarned = goldEarned;
    facility.orderHistory.push({ ...facility.currentOrder });
    
    // Genera evento di completamento ordine
    const facilityDef = getFacilityDefinition(facility.type);
    const facilityName = facility.customName || facilityDef?.nameIt || facility.type;
    
    const orderEvent: BastionEvent = {
      id: crypto.randomUUID(),
      turn: bastion.currentTurn,
      type: 'order-completed',
      title: this.getOrderCompletionTitle(orderType, craftOption),
      description: this.getOrderCompletionDescription(orderType, facilityName, orderDescription, craftOption, recruitedDefenders),
      mechanics: craftOption ? `Oggetto creato: ${craftOption}` : undefined,
      resolved: true,
      resolvedDate: new Date(),
      date: new Date(),
      facilityId: facility.id,
      orderType: orderType,
      craftedItem: craftOption
    };
    
    bastion.events.push(orderEvent);
    
    facility.currentOrder = undefined;

    await this.saveBastion(bastion);
    return { recruitedDefenders };
  }

  /**
   * Genera titolo per evento completamento ordine
   */
  private getOrderCompletionTitle(orderType: BastionOrderType, craftOption?: string): string {
    if (orderType === 'craft') {
      if (craftOption?.toLowerCase().includes('magic') || craftOption?.toLowerCase().includes('magico')) {
        return '✨ Oggetto Magico Creato!';
      }
      return `🔨 Creazione Completata`;
    }
    
    const titles: Record<BastionOrderType, string> = {
      'none': '📜 Ordine Completato',
      'craft': '🔨 Creazione Completata',
      'trade': '💰 Commercio Concluso',
      'recruit': '⚔️ Reclutamento Completato',
      'research': '📚 Ricerca Conclusa',
      'harvest': '🌿 Raccolta Completata',
      'empower': '✨ Potenziamento Attivato'
    };
    return titles[orderType] || '📜 Ordine Completato';
  }

  /**
   * Genera descrizione per evento completamento ordine
   */
  private getOrderCompletionDescription(
    orderType: BastionOrderType, 
    facilityName: string, 
    orderDescription: string,
    craftOption?: string,
    recruitedDefenders?: number
  ): string {
    if (orderType === 'craft' && craftOption) {
      return `${facilityName} ha completato la creazione: ${orderDescription}. L'oggetto è pronto per essere ritirato!`;
    }
    
    if (orderType === 'recruit' && recruitedDefenders) {
      return `${facilityName}: ${recruitedDefenders} nuovi difensori sono stati reclutati e sono pronti a servire!`;
    }
    
    return `${facilityName}: ${orderDescription}`;
  }

  /**
   * Trova la prima Barracks disponibile (senza ordine in corso)
   */
  getAvailableBarracks(bastion: Bastion): BastionFacility | undefined {
    return bastion.facilities.find(f => f.type === 'barracks' && !f.currentOrder);
  }

  /**
   * Avvia rapidamente l'ordine Recruit sulla prima Barracks disponibile
   */
  async startRecruitOrder(bastion: Bastion): Promise<{ success: boolean; facilityId?: string; message: string }> {
    const barracks = this.getAvailableBarracks(bastion);
    if (!barracks) {
      // Cerca se c'è una barracks occupata
      const anyBarracks = bastion.facilities.find(f => f.type === 'barracks');
      if (!anyBarracks) {
        return { success: false, message: 'Nessuna Caserma costruita! Costruiscine una prima.' };
      }
      return { success: false, message: 'Tutte le Caserme hanno ordini in corso. Attendi il completamento.' };
    }

    await this.startOrder(
      bastion,
      barracks.id,
      'recruit',
      'Reclutamento difensori dalla popolazione locale',
      1 // 1 turno per completare
    );

    return { 
      success: true, 
      facilityId: barracks.id, 
      message: `Ordine di reclutamento avviato! Completerai al turno ${bastion.currentTurn + 1}.` 
    };
  }

  /**
   * Verifica se ci sono ordini recruit pronti da completare
   */
  getPendingRecruitOrders(bastion: Bastion): BastionFacility[] {
    return bastion.facilities.filter(f => 
      f.type === 'barracks' && 
      f.currentOrder?.type === 'recruit' &&
      f.currentOrder.status === 'in-progress' &&
      bastion.currentTurn >= (f.currentOrder.startTurn + (f.currentOrder.turnsRequired || 1))
    );
  }

  // ============================================================
  // GOLD TRANSACTIONS
  // ============================================================

  /**
   * Aggiunge una transazione di oro
   */
  async addGoldTransaction(bastion: Bastion, amount: number, reason: string): Promise<void> {
    const transaction: GoldTransaction = {
      id: generateId(),
      amount,
      reason,
      date: new Date(),
      bastionTurn: bastion.currentTurn,
      balanceAfter: bastion.gold + amount
    };

    if (!bastion.goldHistory) {
      bastion.goldHistory = [];
    }
    
    bastion.gold += amount;
    bastion.goldHistory.push(transaction);
    await this.saveBastion(bastion);
  }

  /**
   * Ottiene le ultime N transazioni
   */
  getRecentTransactions(bastion: Bastion, limit: number = 10): GoldTransaction[] {
    if (!bastion.goldHistory) return [];
    return [...bastion.goldHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  // ============================================================
  // RANDOM EVENTS
  // ============================================================

  /**
   * Tira un evento casuale e lo registra (DMG 2024)
   */
  async rollAndRecordEvent(bastion: Bastion, triggeringOwnerId?: string): Promise<BastionEvent> {
    const { roll, event: eventData, subRoll } = rollBastionEvent();
    
    // Determina il risultato della sottotabella se presente
    let subTableResult: string | undefined;
    if (eventData.subTable && subRoll !== undefined) {
      const subEntry = eventData.subTable.find(s => subRoll <= s.roll) || eventData.subTable[0];
      subTableResult = subEntry.descriptionIt || subEntry.description;
    }

    const event: BastionEvent = {
      id: generateId(),
      turn: bastion.currentTurn,
      roll: roll,
      subRoll: subRoll,
      type: eventData.type,
      title: eventData.titleIt || eventData.title,
      description: eventData.descriptionIt || eventData.description,
      mechanics: eventData.mechanics,
      subTableResult: subTableResult,
      resolved: eventData.type === 'all-is-well', // All Is Well auto-risolto
      date: new Date(),
      triggeringOwnerId
    };

    bastion.events.push(event);
    await this.saveBastion(bastion);
    return event;
  }

  // ============================================================
  // BASTION DEFENDERS
  // ============================================================

  /**
   * Aggiunge un Bastion Defender
   */
  async addDefender(
    bastion: Bastion, 
    name: string, 
    source: 'barracks' | 'guest' | 'hired' | 'other',
    cost?: number,
    isTemporary: boolean = false,
    notes?: string
  ): Promise<Bastion> {
    if (!bastion.defenders) {
      bastion.defenders = [];
    }

    const defender: BastionDefender = {
      id: generateId(),
      name,
      type: source === 'barracks' ? 'hired' : source === 'guest' ? 'mercenary' : 'hired',
      source: source,
      hiredDate: new Date(),
      monthlyCost: cost,
      notes
    };

    bastion.defenders.push(defender);
    await this.saveBastion(bastion);
    return bastion;
  }

  /**
   * Rimuove un Bastion Defender (morto o congedato)
   */
  async removeDefender(bastion: Bastion, defenderId: string): Promise<Bastion> {
    if (!bastion.defenders) return bastion;
    bastion.defenders = bastion.defenders.filter(d => d.id !== defenderId);
    await this.saveBastion(bastion);
    return bastion;
  }

  /**
   * Conta i defender attivi
   */
  getDefenderCount(bastion: Bastion): number {
    return bastion.defenders?.length || 0;
  }

  /**
   * Simula un attacco al Bastion (DMG 2024 Attack Event)
   * Tira 6d6, per ogni 1 un defender muore
   */
  async rollDefenderCasualties(bastion: Bastion, diceCount: number = 6): Promise<{
    bastion: Bastion;
    rolls: number[];
    deaths: number;
    killedDefenders: BastionDefender[];
  }> {
    const rolls: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    
    const deaths = rolls.filter(d => d === 1).length;
    const killedDefenders: BastionDefender[] = [];
    
    // Rimuovi defender casuali
    if (bastion.defenders && bastion.defenders.length > 0) {
      for (let i = 0; i < Math.min(deaths, bastion.defenders.length); i++) {
        const randomIndex = Math.floor(Math.random() * bastion.defenders.length);
        const killed = bastion.defenders.splice(randomIndex, 1)[0];
        killedDefenders.push(killed);
      }
      await this.saveBastion(bastion);
    }
    
    return { bastion, rolls, deaths, killedDefenders };
  }

  /**
   * Simula una Request for Aid (DMG 2024)
   * Tira 1d6 per ogni defender inviato
   */
  simulateRequestForAid(defendersSent: number): { 
    diceResults: number[]; 
    total: number; 
    success: boolean; 
    reward: number;
    defenderDied: boolean;
  } {
    const diceResults: number[] = [];
    for (let i = 0; i < defendersSent; i++) {
      diceResults.push(Math.floor(Math.random() * 6) + 1);
    }
    
    const total = diceResults.reduce((sum, d) => sum + d, 0);
    const success = total >= 10;
    const baseReward = (Math.floor(Math.random() * 6) + 1) * 100; // 1d6 × 100
    const reward = success ? baseReward : Math.floor(baseReward / 2);
    const defenderDied = !success;
    
    return { diceResults, total, success, reward, defenderDied };
  }

  // ============================================================
  // TROPHY ROOM
  // ============================================================

  /**
   * Aggiunge un trofeo
   */
  async addTrophy(bastion: Bastion, trophy: Omit<Trophy, 'id'>): Promise<void> {
    const newTrophy: Trophy = {
      ...trophy,
      id: generateId()
    };

    if (!bastion.trophies) {
      bastion.trophies = [];
    }

    bastion.trophies.push(newTrophy);
    await this.saveBastion(bastion);
  }

  /**
   * Rimuove un trofeo
   */
  async removeTrophy(bastion: Bastion, trophyId: string): Promise<void> {
    if (!bastion.trophies) return;
    bastion.trophies = bastion.trophies.filter(t => t.id !== trophyId);
    await this.saveBastion(bastion);
  }

  /**
   * Calcola il valore totale dei trofei
   */
  getTotalTrophyValue(bastion: Bastion): number {
    if (!bastion.trophies) return 0;
    return bastion.trophies.reduce((sum, t) => sum + (t.estimatedValue || 0), 0);
  }

  // ============================================================
  // STATISTICS & COSTS
  // ============================================================

  /**
   * Calcola i costi totali degli hirelings per turno
   */
  getHirelingCostsPerTurn(bastion: Bastion): number {
    return bastion.hirelings.reduce((sum, h) => sum + (h.salary || 0), 0);
  }

  /**
   * Ottiene le statistiche del bastion
   */
  getBastionStats(bastion: Bastion): BastionStats {
    const totalSlots = this.getTotalAvailableSlots(bastion);
    const usedSlots = this.getUsedSlots(bastion);
    
    return {
      // Owners
      totalOwners: bastion.owners.length,
      averageLevel: bastion.owners.length > 0 
        ? bastion.owners.reduce((sum, o) => sum + o.level, 0) / bastion.owners.length
        : 0,
      
      // Facilities
      totalFacilities: bastion.facilities.length,
      crampedFacilities: bastion.facilities.filter(f => f.size === 'cramped').length,
      roomyFacilities: bastion.facilities.filter(f => f.size === 'roomy').length,
      vastFacilities: bastion.facilities.filter(f => f.size === 'vast').length,
      facilitiesInProgress: bastion.facilities.filter(f => f.isBuilding).length,
      
      // Slots
      totalSlots,
      usedSlots,
      availableSlots: totalSlots - usedSlots,
      slotPercentage: totalSlots > 0 ? (usedSlots / totalSlots) * 100 : 0,
      
      // Hirelings
      totalHirelings: bastion.hirelings.length,
      hirelingCostPerTurn: this.getHirelingCostsPerTurn(bastion),
      
      // Economy
      currentGold: bastion.gold,
      totalEarned: bastion.goldHistory?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0,
      totalSpent: Math.abs(bastion.goldHistory?.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0) || 0),
      trophyValue: this.getTotalTrophyValue(bastion),
      
      // Events
      totalEvents: bastion.events.length,
      unresolvedEvents: bastion.events.filter(e => !e.resolved).length,
      
      // Orders
      activeOrders: this.getActiveOrders(bastion).length,
      completedOrders: bastion.facilities.reduce((sum, f) => sum + f.orderHistory.length, 0),
      
      // Turns
      currentTurn: bastion.currentTurn
    };
  }
}

// Interface for stats
export interface BastionStats {
  totalOwners: number;
  averageLevel: number;
  totalFacilities: number;
  crampedFacilities: number;
  roomyFacilities: number;
  vastFacilities: number;
  facilitiesInProgress: number;
  totalSlots: number;
  usedSlots: number;
  availableSlots: number;
  slotPercentage: number;
  totalHirelings: number;
  hirelingCostPerTurn: number;
  currentGold: number;
  totalEarned: number;
  totalSpent: number;
  trophyValue: number;
  totalEvents: number;
  unresolvedEvents: number;
  activeOrders: number;
  completedOrders: number;
  currentTurn: number;
}
