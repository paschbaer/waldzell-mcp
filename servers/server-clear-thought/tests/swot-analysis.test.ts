import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { defaultConfig } from '../src/config.js';
import { SessionState } from '../src/state/SessionState.js';
import { registerSwotAnalysis } from '../src/tools/swot-analysis.js';
import { registerVisualizationToolset } from '../src/toolsets/visualization.js';

function setupServer() {
  const server = new McpServer({ name: 'test', version: '0.0.0' });
  const state = new SessionState('test', defaultConfig);
  return { server, state };
}

function getTool(server: McpServer, name: string): any {
  return (server as any)._registeredTools[name];
}

async function callSwot(server: McpServer, args: Record<string, unknown>) {
  const result = await getTool(server, 'swot_analysis').handler(args, {});
  return JSON.parse(result.content[0].text);
}

it('returns a facilitation scaffold when no quadrant content is provided', async () => {
  const { server, state } = setupServer();
  registerSwotAnalysis(server, state);
  const data = await callSwot(server, { subject: 'Polars vs DuckDB' });

  expect(data.mode).toBe('facilitation');
  expect(data.subject).toBe('Polars vs DuckDB');
  expect(data.strengths).toEqual([]);
  expect(data.weaknesses).toEqual([]);
  expect(data.opportunities).toEqual([]);
  expect(data.threats).toEqual([]);
  expect(data.guidingQuestions.strengths.length).toBeGreaterThan(0);
  expect(data.guidingQuestions.threats.length).toBeGreaterThan(0);
  expect(data.nextSteps.join(' ')).toMatch(/again/i);
  expect(data.status).toBe('success');
  expect(data.tows).toBeUndefined();
});

it('passes through quadrant content and derives TOWS strategies in analysis mode', async () => {
  const { server, state } = setupServer();
  registerSwotAnalysis(server, state);
  const data = await callSwot(server, {
    subject: 'Scanner rewrite',
    strengths: ['fast columnar engine', 'small memory footprint'],
    weaknesses: ['single maintainer'],
    opportunities: ['growing dataset sizes', 'cheap object storage'],
    threats: ['upstream API breaks']
  });

  expect(data.mode).toBe('analysis');
  // passthrough, no template interpolation
  expect(data.strengths).toEqual(['fast columnar engine', 'small memory footprint']);
  expect(data.tows.so).toHaveLength(4); // 2 strengths x 2 opportunities
  expect(data.tows.so[0]).toMatch(/^SO: Leverage "fast columnar engine" to capture "growing dataset sizes"\.$/);
  expect(data.tows.wo).toHaveLength(2); // 1 weakness x 2 opportunities
  expect(data.tows.wo[0]).toMatch(/^WO: Address "single maintainer" to unlock/);
  expect(data.tows.st).toHaveLength(2); // 2 strengths x 1 threat
  expect(data.tows.wt).toHaveLength(1); // 1 weakness x 1 threat

  expect(data.scores.strengths).toBe(2);
  expect(data.scores.weaknesses).toBe(1);
  expect(data.scores.opportunities).toBe(2);
  expect(data.scores.threats).toBe(1);
  // balance = 1 - (max-min)/total = 1 - 1/6
  expect(data.scores.balance).toBe(0.83);
  // riskExposure = (weaknesses + threats) / total = 2/6
  expect(data.scores.riskExposure).toBe(0.33);
  expect(data.nextSteps.join(' ')).toMatch(/decisionframework|mentalmodel/);
});

it('handles partial analysis with only negative quadrants filled', async () => {
  const { server, state } = setupServer();
  registerSwotAnalysis(server, state);
  const data = await callSwot(server, {
    subject: 'legacy import path',
    weaknesses: ['no test coverage'],
    threats: ['dependency drift']
  });

  expect(data.mode).toBe('analysis');
  expect(data.tows.so).toEqual([]);
  expect(data.tows.wo).toEqual([]);
  expect(data.tows.st).toEqual([]);
  expect(data.tows.wt).toHaveLength(1);
  expect(data.scores.riskExposure).toBe(1);
});

it('ignores whitespace-only entries', async () => {
  const { server, state } = setupServer();
  registerSwotAnalysis(server, state);
  const data = await callSwot(server, {
    subject: 'x',
    strengths: ['  ', 'real strength']
  });
  expect(data.mode).toBe('analysis');
  expect(data.strengths).toEqual(['real strength']);
  // single item in a single quadrant: total=1, max-min=1 -> balance 0
  expect(data.scores.balance).toBe(0);
});

it('advertises the quadrant fields via the visualization toolset', async () => {
  const { server, state } = setupServer();
  registerVisualizationToolset(server, state);
  const json: any = zodToJsonSchema(getTool(server, 'visualization').inputSchema);

  // toolset contract: only `operation` is required at the advertised level;
  // per-operation requiredness (subject) is enforced by the dispatcher
  expect(json.properties.subject).toBeDefined();
  expect(json.required).toEqual(['operation']);
  for (const field of ['strengths', 'weaknesses', 'opportunities', 'threats']) {
    expect(json.properties[field].type).toBe('array');
    expect(json.required).not.toContain(field);
  }

  // dispatcher enforces the missing subject for the swot_analysis operation
  const handler = getTool(server, 'visualization').handler;
  await expect(handler({ operation: 'swot_analysis' }, {})).rejects.toThrow(
    /Invalid arguments for operation 'swot_analysis'.*subject/
  );
});
