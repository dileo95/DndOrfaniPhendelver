import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const router = inject(Router);
  
  const characterRoute = route.paramMap.get('character');
  
  if (!characterRoute) {
    router.navigate(['/']);
    return false;
  }
  
  // Ottieni il personaggio dalla route
  const character = auth.getCharacterByRoute(characterRoute);
  
  if (!character) {
    router.navigate(['/']);
    return false;
  }
  
  if (auth.isAuthenticated(character.name)) {
    return true;
  }
  
  // Reindirizza alla home se non autenticato
  router.navigate(['/']);
  return false;
};
