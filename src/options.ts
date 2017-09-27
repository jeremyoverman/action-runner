import { registerNewAction, removeAction } from './config';

export const options = {
    'register': (params: string[]) => {
        console.log(params);
        registerNewAction(params[0], params[1]);
    },
    'unregister': (params: string[]) => {
        removeAction(params[0]);
    }
};