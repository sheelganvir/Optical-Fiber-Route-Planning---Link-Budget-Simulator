import { z } from "zod";

export const routeFormSchema = z.object({
  route_name: z.string().min(3, "Route name must be at least 3 characters"),
  source_site_id: z.string().min(1, "Source site is required"),
  destination_site_id: z.string().min(1, "Destination site is required"),
  number_of_splices: z.number().min(0),
  number_of_connectors: z.number().min(0),
});

export type RouteFormInput = z.infer<typeof routeFormSchema>;
