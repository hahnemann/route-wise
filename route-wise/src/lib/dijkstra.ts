export type EdgeMap = Record<string, { to: string; cost: number }[]>;

export type DijkstraResult = {
    path: string[];
    totalCost: number;
};

export function dijkstra(edges: EdgeMap, start: string, end: string): DijkstraResult {
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();

    for (const node in edges) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;

    while (true) {
        let current: string | null = null;
        let smallest = Infinity;

        for (const node in distances) {
            if (!visited.has(node) && distances[node] < smallest) {
                smallest = distances[node];
                current = node;
            }
        }

        if (current === null) break;
        if (current === end) break;

        visited.add(current);

        for (const neighbor of edges[current] ?? []) {
            const newDist = distances[current] + neighbor.cost;
            if (newDist < distances[neighbor.to]) {
                distances[neighbor.to] = newDist;
                previous[neighbor.to] = current;
            }
        }
    }

    // Build path
    const path: string[] = [];
    let step: string | null = end;

    while (step) {
        path.unshift(step);
        step = previous[step];
    }

    if (path[0] !== start) {
        return { path: [], totalCost: Infinity };
    }

    return {
        path,
        totalCost: distances[end]
    };
}