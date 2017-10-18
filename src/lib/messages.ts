export interface IText {
    [locale: string]: string;
}
export interface IMessage {
    id: number;
    text: IText
}

export interface IMessages {
    [key: string]: IMessage;
}

export const messages: IMessages = {
    create_new_config: {
        id: 1,
        text: {
            'en-us': 'Config does not exist. Creating new one...'
        }
    },
    create_base_directory: {
        id: 2,
        text: {
            'en-us': 'Created base actions directory at "{0}"'
        }
    },
    create_base_directory_fail: {
        id: 3,
        text: {
            'en-us': 'Failed to create actions directory: {0}'
        }
    },
    optional_args_must_be_at_end: {
        id: 4,
        text: {
            'en-us': 'Optional arguments must be at the end of args'
        }
    },
    no_actions_defined: {
        id: 5,
        text: {
            'en-us': 'No actions have been defined for action "{0}"'
        }
    },
    parent_action_not_found: {
        id: 6,
        text: {
            'en-us': 'Parent Action not found'
        }
    },
    available_actions: {
        id: 7,
        text: {
            'en-us': 'Available actions'
        }
    },
    action_does_not_exist: {
        id: 8,
        text: {
            'en-us': 'Action does not exist'
        }
    },
    cant_have_duplicate_action: {
        id: 9,
        text: {
            'en-us': 'Action does not exist'
        }
    }
}