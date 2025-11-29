import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '../services/auth';
import { DatabaseService } from '../services/database.service';
import { ToastService } from '../services/toast.service';

export const combatGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const db = inject(DatabaseService);
  const toast = inject(ToastService);
  
  const characterRoute = route.paramMap.get('character');
  
  if (!characterRoute) {
    router.navigate(['/']);
    return false;
  }
  
  // Verifica autenticazione base
  const character = auth.getCharacterByRoute(characterRoute);
  
  if (!character) {
    router.navigate(['/']);
    return false;
  }
  
  if (!auth.isAuthenticated(character.name)) {
    router.navigate(['/']);
    return false;
  }
  
  // Verifica esistenza della scheda personaggio
  const sheet = await db.getCharacterSheet(characterRoute);
  
  if (!sheet) {
    // Scheda non ancora creata - reindirizza alla pagina della scheda
    toast.warning('Devi prima creare e salvare la scheda del personaggio per accedere al combattimento!');
    router.navigate([characterRoute, 'sheet']);
    return false;
  }
  
  // Verifica che i punti ferita siano > 0
  if (sheet.currentHP <= 0) {
    toast.error('Non puoi combattere con 0 punti ferita! Devi prima riposarti e recuperare HP.');
    router.navigate([characterRoute, 'sheet']);
    return false;
  }
  
  return true;
};
