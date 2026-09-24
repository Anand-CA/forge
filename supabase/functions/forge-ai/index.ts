import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

console.info("Forge AI server started");

const tools = [
  {
    type: "function",
    name: "update_exercise",
    description: "Update an existing exercise in the user's Forge workout.",
    parameters: {
      type: "object",
      properties: {
        exercise: { type: "string", description: "Current exercise name" },
        newName: { type: "string", description: "New exercise name if changing it" },
        muscle: { type: "string", description: "Muscle group" },
        sets: { type: "number", description: "Number of sets" },
        reps: { type: "number", description: "Number of reps per set" },
        weight: { type: "number", description: "Weight in kilograms" }
      },
      required: ["exercise"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "add_exercise",
    description: "Add a new exercise to the user's Forge workout.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Exercise name" },
        muscle: { type: "string", description: "Muscle group" },
        sets: { type: "number", description: "Number of sets" },
        reps: { type: "number", description: "Number of reps" },
        weight: { type: "number", description: "Starting weight in kilograms" }
      },
      required: ["name", "muscle"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "delete_exercise",
    description: "Delete an existing exercise from the user's Forge workout.",
    parameters: {
      type: "object",
      properties: {
        exercise: { type: "string", description: "Exercise name" }
      },
      required: ["exercise"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "replace_exercise",
    description: "Replace one existing exercise with another exercise.",
    parameters: {
      type: "object",
      properties: {
        exercise: { type: "string", description: "Exercise to replace" },
        newName: { type: "string", description: "Replacement exercise name" },
        muscle: { type: "string", description: "Replacement muscle group" },
        sets: { type: "number", description: "Number of sets" },
        reps: { type: "number", description: "Number of reps" },
        weight: { type: "number", description: "Starting weight" }
      },
      required: ["exercise", "newName"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "update_meal",
    description: "Update an existing meal in the user's Forge diet.",
    parameters: {
      type: "object",
      properties: {
        meal: { type: "string", description: "Current meal name or id" },
        time: { type: "string", description: "Meal time in HH:MM format" },
        newName: { type: "string", description: "New meal name" },
        food: { type: "string", description: "New food description" }
      },
      required: ["meal"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "add_meal",
    description: "Add a new meal to the user's Forge diet.",
    parameters: {
      type: "object",
      properties: {
        time: { type: "string", description: "Meal time in HH:MM format" },
        name: { type: "string", description: "Meal name" },
        food: { type: "string", description: "Food description" }
      },
      required: ["name", "food"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "delete_meal",
    description: "Delete an existing meal from the user's Forge diet.",
    parameters: {
      type: "object",
      properties: {
        meal: { type: "string", description: "Meal name or id" }
      },
      required: ["meal"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "replace_meal",
    description: "Replace the contents of an existing meal.",
    parameters: {
      type: "object",
      properties: {
        meal: { type: "string", description: "Meal name or id" },
        time: { type: "string", description: "Meal time in HH:MM format" },
        name: { type: "string", description: "Replacement meal name" },
        food: { type: "string", description: "Replacement food description" }
      },
      required: ["meal", "food"],
      additionalProperties: false
    }
  }
];

export default {
  fetch: withSupabase(
    { auth: ["user", "publishable", "secret"] },
    async (req, ctx) => {
      try {
        if (req.method !== "POST") {
          return Response.json({ error: "POST method required" }, { status: 405 });
        }

        const { message, context } = await req.json();

        if (!message || typeof message !== "string") {
          return Response.json({ error: "Message is required" }, { status: 400 });
        }

        const apiKey = Deno.env.get("GEMINI_API_KEY");
        if (!apiKey) {
          return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        const safeContext = {
          today: context?.today ?? "unknown",
          exercises: Array.isArray(context?.exercises) ? context.exercises.slice(0, 100) : [],
          diet: Array.isArray(context?.diet) ? context.diet.slice(0, 30) : []
        };

        const prompt = `User request:
${message}

Current Forge data:
${JSON.stringify(safeContext)}

Rules:
- Use a tool when the user asks to change workout or diet data.
- Match exercise and meal names case-insensitively.
- Never invent an existing exercise or meal.
- If the request is ambiguous, ask a short clarification instead of making a destructive change.
- For sets/reps, only include values explicitly requested or clearly implied.
- Keep normal replies concise.`;

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/interactions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
              model: "gemini-3.6-flash",
              input: prompt,
              store: false,
              tools
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("Gemini error:", data);
          return Response.json(
            { error: "Gemini request failed", details: data },
            { status: response.status }
          );
        }

        const functionCall = data.steps?.find((step: any) => step.type === "function_call");

        if (functionCall) {
          return Response.json({
            type: "tool_call",
            tool: functionCall.name,
            arguments: functionCall.arguments ?? {},
            call_id: functionCall.id ?? null
          });
        }

        const modelOutput = data.steps?.find((step: any) => step.type === "model_output");
        const reply = modelOutput?.content
          ?.filter((item: any) => item.type === "text")
          ?.map((item: any) => item.text)
          ?.join("") || "I couldn't determine a change to make.";

        return Response.json({ type: "message", reply });
      } catch (error) {
        console.error("Forge AI error:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
      }
    }
  )
};
