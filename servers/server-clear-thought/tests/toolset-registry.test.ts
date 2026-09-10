import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { defaultConfig } from '../src/config.js';
import { SessionState } from '../src/state/SessionState.js';
import { registerUtilityToolset } from '../src/toolsets/utility.js';
import { registerReasoningToolset } from '../src/toolsets/reasoning.js';

function setupServer() {
  const server = new McpServer({ name: 'test', version: '0.0.0' });
  const state = new SessionState('test', defaultConfig);
  return { server, state };
}

function getTool(server: McpServer, name: string): any {
  return (server as any)._registeredTools[name];
}

it('advertises an operation enum covering every utility operation', () => {
  const { server, state } = setupServer();
  registerUtilityToolset(server, state);
  const json: any = zodToJsonSchema(getTool(server, 'utility').inputSchema);
  const op = json.properties.operation;
  expect(op.type).toBe('string');
  expect(op.enum).toEqual(
    expect.arrayContaining([
      'analogical_mapper',
      'assumption_xray',
      'comparative_advantage',
      'drag_point_audit',
      'safe_struggle_designer',
      'seven_seekers_orchestrator',
      'value_of_information',
      'existing_tool_example'
    ])
  );
  expect(json.required).toContain('operation');
});

it('advertises field schemas for reasoning operations', () => {
  const { server, state } = setupServer();
  registerReasoningToolset(server, state);
  const json: any = zodToJsonSchema(getTool(server, 'reasoning').inputSchema);
  expect(json.properties.operation.enum).toContain('sequentialthinking');
  expect(json.properties.thought).toBeDefined();
  expect(json.properties.thought.description).toBeDefined();
});

it('rejects unknown operations with a descriptive error', async () => {
  const { server, state } = setupServer();
  registerUtilityToolset(server, state);
  const handler = getTool(server, 'utility').handler;
  await expect(handler({ operation: 'nope' }, {})).rejects.toThrow(/Invalid arguments for operation 'nope'/);
});

it('rejects operations with missing required fields', async () => {
  const { server, state } = setupServer();
  registerUtilityToolset(server, state);
  const handler = getTool(server, 'utility').handler;
  // assumption_xray requires `claim`; a valid operation with a missing field
  // must fail strict per-operation validation, not dispatch with undefined.
  await expect(handler({ operation: 'assumption_xray', context: 'x' }, {})).rejects.toThrow(/Invalid arguments/);
});

it('dispatches sequentialthinking through the reasoning toolset', async () => {
  const { server, state } = setupServer();
  registerReasoningToolset(server, state);
  const handler = getTool(server, 'reasoning').handler;
  const result = await handler(
    {
      operation: 'sequentialthinking',
      thought: 'step one',
      thoughtNumber: 1,
      totalThoughts: 2,
      nextThoughtNeeded: true
    },
    {}
  );
  const data = JSON.parse(result.content[0].text);
  expect(data.status).toBe('success');
});
