import React from 'react';
import ReactDOM from 'react-dom';
import Icon from '../components/icon';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Icon type="up" />, document.getElementById('root'));
registerServiceWorker();
