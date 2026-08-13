import { z } from "zod";

export const siteFormSchema = z.object({
  site_name: z.string().min(2, "Site name must be at least 2 characters"),
  site_code: z.string().min(2, "Site code must be at least 2 characters").max(20),
  site_type: z.enum(["POP", "Data Center", "Customer Site", "Base Station", "NOC", "Aggregation Site"]),
  latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  description: z.string().optional(),
});

export type SiteFormInput = z.infer<typeof siteFormSchema>;
