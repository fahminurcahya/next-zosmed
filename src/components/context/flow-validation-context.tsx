import type { AppNodeMissingInputs } from "@/types/app-node.type";
import {
    createContext,

    useCallback,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";

type FlowValidationContextType = {
    invalidInputs: AppNodeMissingInputs[];
    setInvalidInputs: Dispatch<SetStateAction<AppNodeMissingInputs[]>>;
    clearErrors: () => void;
};

export const FlowValidationContext =
    createContext<FlowValidationContextType | null>(null);

export function FlowValidationContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [invalidInputs, setInvalidInputs] = useState<AppNodeMissingInputs[]>(
        []
    );

    const clearErrors = () => {
        setInvalidInputs([]);
    };

    return (
        <FlowValidationContext.Provider
            value={{
                invalidInputs,
                setInvalidInputs,
                clearErrors,
            }}
        >
            {children}
        </FlowValidationContext.Provider>
    );
}
