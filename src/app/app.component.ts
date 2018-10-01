import { Component } from '@angular/core';
import {SignatureComponent} from './signature/signature.component';
import {RiskMatrixComponent} from './risk-matrix/risk-matrix.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public demos = [
    {
      name: 'digital signature',
      component: SignatureComponent
    },
    {
      name: 'risk matrix',
      component: RiskMatrixComponent
    }
  ];
}
