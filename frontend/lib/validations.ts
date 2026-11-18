import { z } from "zod";

export const exampleSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio").max(100),
});

export type ExampleFormData = z.infer<typeof exampleSchema>;
