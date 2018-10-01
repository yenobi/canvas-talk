import { storiesOf } from '@storybook/angular';
import {SignatureComponent} from '../app/signature/signature.component';
import {RiskMatrixComponent} from '../app/risk-matrix/risk-matrix.component';


storiesOf('demo', module)
  .add('signature', () => ({
    component: SignatureComponent,
    props: {},
  }))
  .add('risk-matrix', () => ({
    component: RiskMatrixComponent
  }))
;
