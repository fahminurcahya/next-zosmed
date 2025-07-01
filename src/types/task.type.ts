export enum TaskType {
    IG_TRIGGER = "IG_TRIGGER",
    IG_USER_COMMENT = "IG_USER_COMMENT",
    IG_USER_DM = "IG_USER_DM",
    IG_SEND_MSG = "IG_SEND_MSG",
    IG_SEND_WITH_AI = "IG_SEND_WITH_AI",
    IG_SEND_MSG_FROM_DM = "IG_SEND_MSG_FROM_DM",
    IG_SAFETY_CONFIG = 'IG_SAFETY_CONFIG',
}

export enum TaskParamType {
    STRING = "STRING",
    BROWSER_INSTANCE = "BROWSER_INSTANCE",
    SELECT = "SELECT",
    CREDENTIAL = "CREDENTIAL",
    POPOVER = "POPOVER",
    TRIGGER = "TRIGGER",
}

export interface TaskParam {
    name: string;
    type: TaskParamType;
    helperText?: string;
    required?: boolean;
    hideHandle?: boolean;
    value?: string;
    [key: string]: any;
}
