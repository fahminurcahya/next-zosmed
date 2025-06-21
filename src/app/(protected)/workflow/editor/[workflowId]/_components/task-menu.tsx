"use client";

import React, { type ReactNode } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function TaskMenu({ children }: { children: ReactNode }) {
    return (
        <Accordion
            type="multiple"
            className="w-full"
            defaultValue={[
                "then",
            ]}
        >
            <AccordionItem value="then">
                <AccordionTrigger className="font-bold">
                    Then
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1">
                    {children}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

