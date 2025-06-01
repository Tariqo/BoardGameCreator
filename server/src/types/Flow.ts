export type FlowCondition = {
  condition: string;
  nextStepId: string;
};

export type FlowStep = {
  id: string;
  label: string;
  next?: string | null;
  conditionalNext?: FlowCondition[];
  x: number;
  y: number;
  locked?: boolean;
};