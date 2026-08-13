import { z } from "zod";

export const linkBudgetFormSchema = z.object({
  fiberLength: z.number().positive("Fiber length must be greater than 0"),
  attenuation: z.number().positive("Attenuation must be greater than 0"),
  spliceCount: z.number().min(0, "Splice count cannot be negative"),
  spliceLoss: z.number().min(0, "Splice loss cannot be negative"),
  connectorCount: z.number().min(0, "Connector count cannot be negative"),
  connectorLoss: z.number().min(0, "Connector loss cannot be negative"),
  additionalLoss: z.number().min(0, "Additional loss cannot be negative"),
  txPower: z.number(),
  rxSensitivity: z.number(),
  safetyMargin: z.number().min(0, "Safety margin cannot be negative"),
});

export type LinkBudgetFormInput = z.infer<typeof linkBudgetFormSchema>;
