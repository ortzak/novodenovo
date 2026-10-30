import { Component } from '@angular/core';

@Component({
  selector: 'app-icone-whatsapp',
  template: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9a5 5 0 0 1-2.8-2.8l.9-1-1-2Z" fill="currentColor"/>
    </svg>`,
  styles: `:host { display: inline-flex; }`,
})
export class IconeWhatsapp {}
