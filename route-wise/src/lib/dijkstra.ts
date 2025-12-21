export type AirportCode = string;

export interface Edge {
  to: AirportCode;
  cost: number;
}

export type Graph = Record<AirportCode, Edge[]>;

/**
 * Builds the graph from the CSV data, replacing the Python pandas logic.
 */
export function buildGraphFromCSV(csvData: any[]): Graph {
  const graph: Graph = {};

  for (const row of csvData) {
    const start = row['ORIGIN_AIRPORT_ABBREV'];
    const goal = row['DESTINATION_AIRPORT_ABBREV'];
    const weight = parseFloat(row['YCA_FARE']);

    if (!start || !goal || isNaN(weight)) continue;

    if (!graph[start]) graph[start] = [];
    if (!graph[goal]) graph[goal] = [];

    // Assuming bidirectional flights as per your Python script
    graph[start].push({ to: goal, cost: weight });
    graph[goal].push({ to: start, cost: weight });
  }

  return graph;
}

/**
 * Calculates distances from a start airport to ALL other airports in the graph.
 * This is much faster than running a search for every single destination individually.
 */
function dijkstraToAll(graph: Graph, start: AirportCode): Record<AirportCode, number> {
  const distances: Record<AirportCode, number> = {};
  const queue: { node: AirportCode; dist: number }[] = [];

  for (const node in graph) {
    distances[node] = Infinity;
  }

  distances[start] = 0;
  queue.push({ node: start, dist: 0 });

  while (queue.length > 0) {
    // Basic priority queue (sort by distance)
    queue.sort((a, b) => a.dist - b.dist);
    const { node: current, dist: currentDist } = queue.shift()!;

    if (currentDist > distances[current]) continue;

    for (const edge of graph[current] || []) {
      const newDist = currentDist + edge.cost;
      if (newDist < distances[edge.to]) {
        distances[edge.to] = newDist;
        queue.push({ node: edge.to, dist: newDist });
      }
    }
  }

  return distances;
}

/**
 * Replaces your Python optimal_meeting_point function.
 */
export function findOptimalMeetingPoint(
  graph: Graph,
  startPoints: AirportCode[]
): { meetingPoint: AirportCode | null; totalCost: number } {
  // 1. Run Dijkstra once for each traveler
  const travelDistances = startPoints.map(start => dijkstraToAll(graph, start));

  let bestAirport: AirportCode | null = null;
  let minTotalCost = Infinity;

  // 2. For every airport in the country, sum the cost for all travelers to get there
  for (const airport in graph) {
    let totalCostForThisAirport = 0;
    let reachableByAll = true;

    for (const dists of travelDistances) {
      if (dists[airport] === Infinity) {
        reachableByAll = false;
        break;
      }
      totalCostForThisAirport += dists[airport];
    }

    if (reachableByAll && totalCostForThisAirport < minTotalCost) {
      minTotalCost = totalCostForThisAirport;
      bestAirport = airport;
    }
  }

  return { meetingPoint: bestAirport, totalCost: minTotalCost };
}