# Clear Thought MCP Server

[![smithery badge](https://smithery.ai/badge/@waldzellai/clear-thought)](https://smithery.ai/server/@waldzellai/clear-thought)

A Model Context Protocol (MCP) server that provides systematic thinking, mental models, and debugging approaches for enhanced problem-solving capabilities.

## Features

### Mental Models

- First Principles Thinking
- Opportunity Cost Analysis
- Error Propagation Understanding
- Rubber Duck Debugging
- Pareto Principle
- Occam's Razor
- And many more...

### Design Patterns

- Modular Architecture
- API Integration Patterns
- State Management
- Asynchronous Processing
- Scalability Considerations
- Security Best Practices
- Agentic Design Patterns

Note: Compatible with various modern web frameworks and architectures.

### Programming Paradigms

- Imperative Programming
- Procedural Programming
- Object-Oriented Programming
- Functional Programming
- Declarative Programming
- Logic Programming
- Event-Driven Programming
- Aspect-Oriented Programming
- Concurrent Programming
- Reactive Programming

### Debugging Approaches

- Binary Search
- Reverse Engineering
- Divide and Conquer
- Backtracking
- Cause Elimination
- Program Slicing
- Advanced debugging patterns
- Log Analysis
- Static Analysis
- Root Cause Analysis
- Delta Debugging
- Fuzzing
- Incremental Testing

### Sequential Thinking

- Structured thought process
- Revision and branching support
- Progress tracking
- Context maintenance

## Tool Selection Guide

Each tool in the Clear Thought MCP Server has specific strengths. Here are some scenarios where each tool might be particularly useful:

### Mental Models

Best suited for:

- Initial problem understanding
- Breaking down complex systems
- Analyzing trade-offs
- Finding root causes
- Making strategic decisions

Example scenarios:

- Analyzing system architecture choices
- Evaluating competing solutions
- Understanding error patterns

### Design Patterns

Best suited for:

- Implementing proven solutions
- Structuring new features
- Ensuring maintainable code
- Scaling applications
- Managing technical debt

Example scenarios:

- Building new system components
- Refactoring existing code
- Implementing cross-cutting concerns

### Debugging Approaches

Best suited for:

- Troubleshooting issues
- Performance optimization
- System analysis
- Error resolution
- Quality assurance

Example scenarios:

- Fixing production issues
- Optimizing slow processes
- Resolving integration problems

### Sequential Thinking

Best suited for:

- Complex problem-solving
- Multi-step analysis
- Decision refinement
- Process improvement
- Comprehensive planning

Example scenarios:

- Planning major features
- Analyzing system-wide changes
- Making architectural decisions

Note: These are suggestions rather than rules. Tools can be used in any order or combination that best serves your needs.

## Installation

### Installing via Smithery

To install Clear Thought MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@waldzellai/clear-thought):

```bash
npx -y @smithery/cli install @waldzellai/clear-thought --client claude
```

### Manual Installation

```bash
npm install @waldzellai/clear-thought
```

Or run with npx:

```bash
npx @waldzellai/clear-thought
```

## Agent Guide

Building an agent that consumes this server? Copy
[`AGENTS.template.md`](./AGENTS.template.md) to your project root as
`AGENTS.md` — it contains a tool routing table, workflow recipes, and usage
rules optimized for LLM consumption.

The server also exposes this guide as the `agents_guide` tool (also in the
`utility` toolset): call it to get the guide rendered for your project
(`project_name`, `domain_context`, `codebase_root`), or pass your existing
`AGENTS.md` content as `existing_agents_md` to merge the guide in — repeat
calls update the inserted block in place instead of duplicating it.

## Usage

Each individual tool (e.g., `sequentialthinking`, `mentalmodel`, `debuggingapproach`, ...) is
registered on its own. In addition, four grouped toolset tools are available — `reasoning`,
`visualization`, `utility`, and `session` — which select the underlying tool via an
`operation` parameter (e.g., operation `mentalmodel` within the `reasoning` toolset).
The examples below use the toolset form.

Note on naming: individual tool names follow their historical naming — the earlier tools use
compact lowercase (`sequentialthinking`, `mentalmodel`), while later additions use snake_case
(`analogical_mapper`, `session_info`). These names are part of the public API and are kept stable.

### SWOT analysis

`swot_analysis` works in two modes. Without quadrant content it returns a facilitation
scaffold with per-quadrant guiding questions. With content provided via the optional
`strengths` / `weaknesses` / `opportunities` / `threats` arrays it returns the structured
analysis, TOWS strategies (SO/WO/ST/WT) derived from 2x2 pairings, and scores (per-quadrant
counts, balance, risk exposure).

### Mental Models

```typescript
const response = await mcp.callTool('reasoning', {
  operation: 'mentalmodel',
  modelName: 'first_principles',
  problem: 'How to implement a new feature?',
  steps: ['Break down the problem', 'Analyze components', 'Build solution']
});
```

### Debugging Approaches

```typescript
const response = await mcp.callTool('reasoning', {
  operation: 'debuggingapproach',
  approachName: 'binary_search',
  issue: 'Performance degradation in the system',
  steps: ['Identify performance metrics', 'Locate bottleneck', 'Implement solution'],
  findings: 'Database connections spiking during peak hours',
  resolution: 'Optimized connection pooling'
});
```

### Sequential Thinking

```typescript
const response = await mcp.callTool('reasoning', {
  operation: 'sequentialthinking',
  thought: 'Initial analysis of the problem',
  thoughtNumber: 1,
  totalThoughts: 3,
  nextThoughtNeeded: true
});
```

## Docker

Build the Docker image:

```bash
docker build -t waldzellai/clear-thought .
```

Run the container:

```bash
docker run -it waldzellai/clear-thought
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Start the server: `npm run start:http` (or `npm start`) — listens on the `PORT` environment variable (default: `3000`)
5. Run tests: `npm test`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE for details.

## Acknowledgments

- Based on the Model Context Protocol (MCP) by Anthropic, and uses the code for the sequentialthinking server
- Mental Models framework inspired by [James Clear's comprehensive guide to mental models](https://jamesclear.com/mental-models), which provides an excellent overview of how these thinking tools can enhance decision-making and problem-solving capabilities
