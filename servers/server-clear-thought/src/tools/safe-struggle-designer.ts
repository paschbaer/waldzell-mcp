import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SessionState } from '../state/SessionState.js';

export function registerSafeStruggleDesigner(server: McpServer, _sessionState: SessionState) {
  server.tool(
    'safe_struggle_designer',
    'Design a safe skill improvement plan: level ladder derived from the ' +
      'level gap, safety measures and a review interval derived from the gap',
    {
      skill: z.string().trim().min(1),
      current_level: z.number().int().min(0),
      target_level: z.number().int().min(0),
      constraints: z.record(z.any()).optional()
    },
    async ({ skill, current_level, target_level }) => {
      if (target_level <= current_level) {
        throw new Error(
          `target_level (${target_level}) must be greater than current_level (${current_level})`
        );
      }

      const gap = target_level - current_level;
      const scaffold_steps = [] as string[];
      for (let lvl = current_level + 1; lvl <= target_level; lvl++) {
        scaffold_steps.push(
          `Practice ${skill} at level ${lvl} until ${skill} tasks at this level feel routine`
        );
      }

      const review_intervals = gap <= 2 ? 'weekly' : gap <= 4 ? 'biweekly' : 'monthly';

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                skill,
                level_gap: gap,
                scaffold_steps,
                safety_measures: [
                  'Take breaks before frustration compounds',
                  'Monitor progress against explicit success criteria per step',
                  'Keep a fallback: stay productive at the current level while practising'
                ],
                review_intervals,
                nextSteps: [
                  'Schedule the first review to check whether the lowest step is truly routine.',
                  'If a step stalls twice, split it into a smaller level.'
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
