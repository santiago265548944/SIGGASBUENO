import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { MemoryService } from '../cache/memory.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private memoryService: MemoryService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.memoryService.containKey('currentUser') && this.memoryService.containKey('currentPass')) {
      // logged in so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
