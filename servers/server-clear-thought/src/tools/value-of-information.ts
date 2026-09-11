import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SessionState } from '../state/SessionState.js';

export function registerValueOfInformation(server: McpServer, _sessionState: SessionState) {
  server.tool(
    'value_of_information',
    'Estimate the value of resolving each uncertainty (EVPI-style, uniform ' +
      'prior): payoffs[i] is the opportunity cost if uncertainty i resolves ' +
      'unfavorably; returns a per-uncertainty ranking to prioritize research',
    {
      decision_options: z
        .array(z.string())
        .describe('The options under consideration'),
      uncertainties: z
        .array(z.string())
        .describe('Open questions whose resolution could change the decision'),
      payoffs: z
        .array(z.number())
        .describe(
          'Opportunity cost per uncertainty (same order as uncertainties): how much value is lost if it resolves unfavorably. Missing entries count as 0.'
        )
    },
    async ({ decision_options, uncertainties, payoffs }) => {
      const warnings: string[] = [];
      if (payoffs.length > uncertainties.length) {
        warnings.push('More payoffs than uncertainties — extra entries were ignored.');
      }
      if (payoffs.length < uncertainties.length) {
        warnings.push('Fewer payoffs than uncertainties — missing entries were treated as 0.');
      }

      const impacts = uncertainties.map((_, i) => payoffs[i] ?? 0);
      const positiveTotal = impacts.reduce((sum, v) => sum + Math.max(0, v), 0);
      const voi_score = Number((positiveTotal / (impacts.length || 1)).toFixed(2));

      const ranked_uncertainties = uncertainties
        .map((uncertainty, i) => ({ uncertainty, impact: impacts[i] }))
        .sort((a, b) => b.impact - a.impact);

      const high_impact_questions = ranked_uncertainties
        .filter((r) => r.impact > 0)
        .slice(0, 3)
        .map(
          (r) =>
            `Resolve "${r.uncertainty}" early — opportunity cost ${r.impact} if it resolves unfavorably.`
        );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                decision_options,
                baseline: 'uniform prior over uncertainties; EVPI-style estimate',
                voi_score,
                ranked_uncertainties,
                high_impact_questions,
                ...(warnings.length ? { warnings } : {}),
                nextSteps: [
                  'voi_score is the expected value per resolved uncertainty — compare it against the cost of the research.',
                  'Resolve the top-ranked uncertainty first, then re-run with updated payoffs.'
                ],
                status: 'success'
              },
              null,
              2
            )
          }
        ]
      };
    }
  );
}
