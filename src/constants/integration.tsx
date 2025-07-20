import { InstagramDuoToneBlue } from "@/icons/instagram-duotone-blue";

type Props = {
    title: string;
    icon: React.ReactNode;
    description: string;
    strategy: "INSTAGRAM";
};

export const INTEGRATION_CARDS: Props[] = [
    {
        title: "Connect Instagram",
        description: "Integrate your account to an instagram user",
        icon: <InstagramDuoToneBlue />,
        strategy: "INSTAGRAM" as const,
    }
];

export const FEE = 5000;