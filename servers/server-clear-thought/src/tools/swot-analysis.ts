import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SessionState } from '../state/SessionState.js';

interface Quadrants {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

type QuadrantKey = keyof Quadrants;

/** Facilitation prompts per quadrant — the calling model fills the content. */
const GUIDING_QUESTIONS: Record<QuadrantKey, string[]> = {
  strengths: [
    'What internal advantages does the subject have (skills, assets, position)?',
    'What does it demonstrably do better than the alternatives?',
    'Which unique resources are hard for others to copy?'
  ],
  weaknesses: [
    'Where does the subject lack capability, data, or coverage?',
    'What do critics of the subject point out first?',
    'Which internal dependencies slow it down?'
  ],
  opportunities: [
    'Which external trends or gaps play into the subject\'s hands?',
    'What could it enable that is currently out of reach?',
    'Where is demand unmet by today\'s alternatives?'
  ],
  threats: [
    'Which external forces could make the subject obsolete or risky?',
    'What happens if key assumptions change (cost, regulation, competition)?',
    'What is the realistic worst case within the next 6-12 months?'
  ]
};

function clean(value?: string[]): string[] {
  return (value ?? []).map((item) => item.trim()).filter((item) => item.length > 0);
}

/** Cap each TOWS family at 2x2 pairings to keep the response focused. */
function buildTows(quads: Quadrants): Record<string, string[]> {
  const firstTwo = (items: string[]) => items.slice(0, 2);
  return {
    so: firstTwo(quads.strengths).flatMap((strength) =>
      firstTwo(quads.opportunities).map(
        (opportunity) => `SO: Leverage "${strength}" to capture "${opportunity}".`
      )
    ),
    wo: firstTwo(quads.weaknesses).flatMap((weakness) =>
      firstTwo(quads.opportunities).map(
        (opportunity) => `WO: Address "${weakness}" to unlock "${opportunity}".`
      )
    ),
    st: firstTwo(quads.strengths).flatMap((strength) =>
      firstTwo(quads.threats).map(
        (threat) => `ST: Use "${strength}" to mitigate "${threat}".`
      )
    ),
    wt: firstTwo(quads.weaknesses).flatMap((weakness) =>
      firstTwo(quads.threats).map(
        (threat) => `WT: Reduce exposure where "${weakness}" meets "${threat}".`
      )
    )
  };
}

function buildScores(quads: Quadrants): Record<string, number> {
  const counts = [
    quads.strengths.length,
    quads.weaknesses.length,
    quads.opportunities.length,
    quads.threats.length
  ];
  const total = counts.reduce((sum, count) => sum + count, 0);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  return {
    strengths: quads.strengths.length,
    weaknesses: quads.weaknesses.length,
    opportunities: quads.opportunities.length,
    threats: quads.threats.length,
    // 1 = quadrants evenly filled, 0 = single quadrant dominates an empty
    // set. Empty quadrants DO lower the balance on purpose: a deliberately
    // half-filled SWOT reads as less balanced, signaling incomplete coverage.
    balance: total === 0 ? 0 : Number((1 - (max - min) / total).toFixed(2)),
    // share of internal + external negative factors
    riskExposure: total === 0 ? 0 : Number(((quads.weaknesses.length + quads.threats.length) / total).toFixed(2))
  };
}

export function registerSwotAnalysis(server: McpServer, _sessionState: SessionState) {
  server.tool(
    'swot_analysis',
    'Structured SWOT analysis: returns a facilitation scaffold by default; ' +
      'with quadrant content provided it returns the structured analysis, ' +
      'scores, and TOWS (SO/WO/ST/WT) strategies',
    {
      subject: z
        .string()
        .trim()
        .min(1)
        .describe('Subject of the analysis (e.g. an architecture or technology decision)'),
      strengths: z
        .array(z.string())
        .optional()
        .describe('Internal, positive factors. Providing any quadrant content switches to analysis mode.'),
      weaknesses: z
        .array(z.string())
        .optional()
        .describe('Internal, negative factors'),
      opportunities: z
        .array(z.string())
        .optional()
        .describe('External, positive factors'),
      threats: z
        .array(z.string())
        .optional()
        .describe('External, negative factors')
    },
    async (args) => {
      const quads: Quadrants = {
        strengths: clean(args.strengths),
        weaknesses: clean(args.weaknesses),
        opportunities: clean(args.opportunities),
        threats: clean(args.threats)
      };
      const hasContent = Object.values(quads).some((items) => items.length > 0);
      const mode = hasContent ? 'analysis' : 'facilitation';

      const response: Record<string, unknown> = {
        subject: args.subject,
        mode,
        ...quads,
        status: 'success'
      };

      if (hasContent) {
        response.tows = buildTows(quads);
        response.scores = buildScores(quads);
        response.nextSteps = [
          'Prioritize each entry by impact x likelihood before acting.',
          'Derive concrete actions from the TOWS strategies (SO grow, WO fix, ST defend, WT protect).',
          'Feed the prioritized result into decisionframework or mentalmodel (first_principles) for the follow-up decision.'
        ];
      } else {
        response.guidingQuestions = GUIDING_QUESTIONS;
        response.nextSteps = [
          'Answer the guiding questions per quadrant (the calling model supplies the content).',
          'Call swot_analysis again with the filled strengths/weaknesses/opportunities/threats arrays to receive TOWS strategies and scoring.'
        ];
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }
        ]
      };
    }
  );
}
