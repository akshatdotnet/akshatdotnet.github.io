import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'] // ✅ corrected plural
})
export class HeaderComponent {
  // Function to open an external eCommerce site in a new tab
  openEcommerceSite() {
    window.open('https://mydukaan.io/surajteahouse', '_blank');
  }
}
