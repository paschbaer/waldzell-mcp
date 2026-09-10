import { z, ZodTypeAny } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface OperationSpec {
  name: string;
  description: string;
  schema: Record<string, ZodTypeAny>;
  handler: (args: any) => Promise<any>;
}

export class ToolsetRegistry {
  private operations: OperationSpec[] = [];

  constructor(private slug: string, private description: string) {}

  addOperation(op: OperationSpec): void {
    this.operations.push(op);
  }

  register(server: McpServer): void {
    if (this.operations.length === 0) return;

    // Strict per-operation schema (discriminated by the `operation` literal),
    // used to validate incoming arguments before dispatching.
    const strict = this.operations.map((op) =>
      z.object({ operation: z.literal(op.name), ...op.schema })
    );
    const validator =
      strict.length === 1
        ? strict[0]
        : z.union(
            [strict[0], strict[1], ...strict.slice(2)] as [
              z.ZodTypeAny,
              z.ZodTypeAny,
              ...z.ZodTypeAny[]
            ]
          );

    // The advertised input schema must be a flat OBJECT schema: the MCP SDK
    // serializes only object schemas in tools/list (a z.union would degrade
    // to an empty schema, leaving `operation` undeclarable for clients).
    // Every operation field is therefore advertised as optional; per-operation
    // requiredness is enforced by the strict validator in the dispatcher.
    const advertised: Record<string, ZodTypeAny> = {
      operation: z
        .enum(this.operations.map((o) => o.name) as [string, ...string[]])
        .describe(
          `Operation to perform. One of: ${this.operations.map((o) => o.name).join(', ')}`
        )
    };
    for (const op of this.operations) {
      for (const [key, field] of Object.entries(op.schema)) {
        if (!(key in advertised)) advertised[key] = field.optional();
      }
    }

    const dispatcher = async (args: any) => {
      const parsed = validator.safeParse(args);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const path = issue.path.length ? `${issue.path.join('.')}: ` : '';
        throw new Error(
          `Invalid arguments for operation '${args?.operation}' of toolset '${this.slug}' — ${path}${issue.message}`
        );
      }
      const data: any = parsed.data;
      const op = this.operations.find((o) => o.name === data.operation)!;
      return op.handler(data);
    };

    server.registerTool(
      this.slug,
      {
        description: this.description,
        inputSchema: advertised
      },
      dispatcher
    );
  }
}

export function collectOperations(
  registerFn: (server: McpServer, state: any) => void,
  state: any
): OperationSpec[] {
  const ops: OperationSpec[] = [];
  const fakeServer = {
    tool(name: string, description: string, schema: any, handler: any) {
      ops.push({ name, description, schema, handler });
    }
  } as unknown as McpServer;
  registerFn(fakeServer, state);
  return ops;
}
