import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Node } from "@xyflow/react";
import type { ReactNode } from "react";

const PopoverNode = ({ children }: { children: ReactNode }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="rounded-none">Select Trigger</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
                {children}
            </PopoverContent>
        </Popover>

    );
}

export default PopoverNode;