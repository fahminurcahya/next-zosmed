"use client";

import type { ParamProps } from "@/types/app-node.type";
import React from "react";

export default function BrowserInstanceParam({ param }: ParamProps) {
    return <p className="text-xs">{param.name}</p>;
}
