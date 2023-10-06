import {LOGROCKET_KEY,ROOT_HOSTNAME} from './constants'
import LogRocket from 'logrocket';
LogRocket.init(LOGROCKET_KEY, {
    rootHostname:ROOT_HOSTNAME,
});
