
import { z } from "zod";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { useAppSelector, type AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { TRIGGER } from "@/redux/slices/automation";
import { api } from "@/trpc/react";

export const useTriggers = (id: string) => {
  const types = useAppSelector(
    (state) => state.AutomationReducer.trigger?.types
  );
  const dispatch: AppDispatch = useDispatch();
  const onSetTrigger = (type: "COMMENT" | "DM") =>
    dispatch(TRIGGER({ trigger: { type } }));

  const automation = api.automation.addTriger.useMutation();

  return { types, onSetTrigger, automation };
};

