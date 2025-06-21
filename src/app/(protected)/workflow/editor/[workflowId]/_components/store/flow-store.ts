import type { FlowNode } from '@/types/flow.type'
import { create } from 'zustand'

interface FlowState {
    selectedNode: FlowNode | null
    setSelectedNode: (node: FlowNode | null) => void
}

export const useFlowStore = create<FlowState>((set) => ({
    selectedNode: null,
    setSelectedNode: (node) => set({ selectedNode: node }),
}))