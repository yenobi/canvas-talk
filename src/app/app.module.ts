import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SignatureComponent } from './signature/signature.component';
import { RiskMatrixComponent } from './risk-matrix/risk-matrix.component';

@NgModule({
  declarations: [
    AppComponent,
    SignatureComponent,
    RiskMatrixComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
