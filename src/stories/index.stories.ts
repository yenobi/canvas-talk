import { storiesOf } from '@storybook/angular';
import {SignatureComponent} from '../app/signature/signature.component';


storiesOf('demo', module)
  .add('signature', () => ({
    component: SignatureComponent,
    props: {},
  }));

