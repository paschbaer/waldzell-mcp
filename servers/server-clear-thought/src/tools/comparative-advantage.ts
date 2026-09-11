import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SessionState } from '../state/SessionState.js';

export function registerComparativeAdvantage(server: McpServer, _sessionState: SessionState) {
  server.tool(
    'comparative_advantage',
    'Map tasks to the skill holder with highest capability. Skills are ' +
      'matched per task: each agent is scored by its (average) level on the ' +
      'skills the task requires; missing skills count as 0',
    {
      skills: z
        .record(z.string(), z.record(z.string(), z.number()))
        .describe('Map of agent name to that agent\u2019s skill levels, e.g. { "alice": { "sql": 4, "python": 5 } }'),
      tasks: z
        .record(z.string(), z.array(z.string()))
        .describe('Map of task name to the skills the task requires, e.g. { "migrate_db": ["sql", "python"] }')
    },
    async ({ skills, tasks }) => {
      const warnings: string[] = [];
      const advantage_map = Object.entries(tasks).map(([task, required]) => {
        const breakdown = Object.entries(skills)
          .map(([agent, levels]) => {
            const score =
              required.length > 0
                ? required.reduce((sum, skill) => sum + (levels[skill] ?? 0), 0) / required.length
                : Object.values(levels).reduce((s, v) => s + v, 0) / (Object.keys(levels).length || 1);
            return { agent, score: Number(score.toFixed(2)) };
          })
          .sort((a, b) => b.score - a.score || a.agent.localeCompare(b.agent));

        const missing_skills = required.filter(
          (skill) => !Object.values(skills).some((levels) => (levels[skill] ?? 0) > 0)
        );

        return {
          task,
          assignee: breakdown[0]?.agent ?? null,
          score: breakdown[0]?.score ?? 0,
          breakdown,
          missing_skills
        };
      });

      for (const entry of advantage_map) {
        if (entry.missing_skills.length > 0) {
          warnings.push(
            `Task "${entry.task}": no agent has any level in [${entry.missing_skills.join(', ')}]`
          );
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                advantage_map,
                ...(warnings.length ? { warnings } : {}),
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
