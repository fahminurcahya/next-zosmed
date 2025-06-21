import { TinyInstagram } from "@/icons/tiny-instagram";
import type { JSX } from "react";
import { v4 } from "uuid";


export type AutomationListenerProps = {
    id: string;
    label: string;
    icon: JSX.Element;
    description: string;
    type: "SMARTAI" | "MESSAGE";
};
export type AutomationsTriggerProps = {
    id: string;
    label: string;
    icon: JSX.Element;
    description: string;
    type: "COMMENT" | "DM";
};

export const AUTOMATION_TRIGGERS: AutomationsTriggerProps[] = [
    {
        id: v4(),
        label: "User comments on my post",
        icon: <TinyInstagram />,
        description: "Select if you want to automate comments on your post",
        type: "COMMENT",
    },
    {
        id: v4(),
        label: "User sends me a dm with a keyword",
        icon: <TinyInstagram />,
        description: "Select if you want to automate DMs on your profile",
        type: "DM",
    },
];