<script lang="ts">
    import type { CPP_RouteWise } from "../types";
    type Props = {
        routes: CPP_RouteWise[];
    };
    let { routes }: Props = $props();

    import { onMount } from "svelte";
    import { Scrolly } from "$lib";
    import MapScene from "$lib/MapScene.svelte";
    import RankBar from "$lib/RankBar.svelte";
    import * as d3 from "d3";
    import { get } from "svelte/store";

    type MeetingRoute = {
        meeting_airport: string;
        total_cost: number;
        [key: string]: any; // Allow dynamic path and cost columns
    };
    let myProgress = $state(0);
    let meetingRoutes = $state<MeetingRoute[]>([]);
    let activeIata: string | null = $state(null);
    let originIatas = $state<string[]>([]);

    const topRoutes = $derived(
        [...meetingRoutes]
            .sort((a, b) => a.total_cost - b.total_cost)
            .slice(0, 10),
    );

    const handleHover = (e: any) => {
        // eslint-disable-next-line no-console
        console.log("Hover event received:", e.detail);
        activeIata = e.detail.iata;
    };

    onMount(async () => {
        try {
            // Load raw data first
            const rawRows = await d3.csv("/meeting_msp_lax.csv");

            if (rawRows.length === 0) return;

            // Detect origin indices from the first row by finding path/cost columns
            const firstRow = rawRows[0];
            const pathKeys = Object.keys(firstRow)
                .filter(
                    (key) =>
                        key.startsWith("path") && /^\d+$/.test(key.slice(4)),
                )
                .sort((a, b) => {
                    const numA = parseInt(a.slice(4), 10);
                    const numB = parseInt(b.slice(4), 10);
                    return numA - numB;
                });

            // Parse rows with dynamic columns
            const rows: MeetingRoute[] = rawRows.map((d) => {
                const row: MeetingRoute = {
                    meeting_airport: (d.meeting_airport || "").toUpperCase(),
                    total_cost: Number(d.total_cost),
                };

                // Copy all path and cost columns dynamically
                pathKeys.forEach((pathKey) => {
                    const costKey = "cost" + pathKey.slice(4);
                    row[pathKey] = d[pathKey];
                    if (d[costKey]) {
                        row[costKey] = Number(d[costKey]);
                    }
                });

                return row;
            });

            meetingRoutes = rows.filter(
                (r) => r.meeting_airport && Number.isFinite(r.total_cost),
            );

            // Store origin IATAs - we'll need airport names from an external source or hardcode them
            // For now, assume path1 is from first origin, path2 from second, etc.
            // You may need to load this from a config or data source
            originIatas = ["MSP", "LAX"]; // Default, but this could be detected or passed in
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Failed to load meeting routes:", err);
        }
    });
</script>

<p></p>

<Scrolly bind:progress={myProgress}>
    <div class="card-stack">
        <div class="card">
            <h3>Scene 1: The Challenge of Meeting in One Place</h3>
            <p>
                What if you had to gather people from all across the country in
                one place — quickly and cheaply?
            </p>
            <!-- <p>The federal government's travel
                system involves a vast number of potential destinations and
                millions in spending, but the sheer volume of options is
                difficult to evaluate because agencies
                <a
                    href="https://www.gao.gov/assets/gao-16-657.pdf#page=2.23"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    lack common metrics
                </a>
                and consistent reporting practices for travel costs.
            </p> -->
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 2: Real World Motivation</h3>
            <p>When meeting logistics waste taxpayer dollars.</p>
            <!-- <p>
                The government's City Pair Program (CPP) currently offers over
                11,000 different routes. As we scroll, the visualization begins
                to filter this
                <a
                    href="https://www.gsa.gov/travel/plan-a-trip/transportation-airfare-rates-pov-rates-etc/airfare-rates-city-pair-program"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    massive number of destinations
                </a>
                to isolate the most affordable options for a potential meeting spot.
            </p> -->
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 3: Choosing the Meeting Spot</h3>
            <p>
                Imagine two colleagues — one in Minneapolis, another in Los
                Angeles. They need to fly and meet somewhere for a one-day
                training. Should the person in Minnesota fly to California? Or
                should the person in California fly north? Maybe neither —
                perhaps they should meet halfway, in Denver, or even at a
                smaller nearby airport.
            </p>
            <!-- <p>
                Travel decisions are universally constrained by two critical
                factors: cost and time. These two dictate the specific
                performance metrics—like average fare and total journey
                time—that we must visualize to identify the single, optimal
                route for a group of people to meet.
            </p> -->
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 4: The Algorithm</h3>
            <p>Finding the most efficient path.</p>
            <!-- <p>
                When we consider cost and time as weights on the connections
                (edges) between cities (nodes) as a graph, this problem becomes
                a classic shortest path challenge. We can use
                <a
                    href="https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Dijkstra's algorithm
                </a>
                to mathematically solve this network problem and find the most efficient
                route.
            </p> -->
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 5: What is Optimal?</h3>
            <p>
                An optimal solution is not just the cheapest or fastest route,
                but the one that provides the best balance between those two
                conflicting metrics, often determined by a weighted combination
                of cost and time based on the traveler's priorities. For now we
                are only considering cost.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 6: Solving with Python</h3>
            <p>
                Visualizing the solution and provide a definitive answer to the
                travel problem, as recommended by GAO.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 7: The Optimal Meeting Place</h3>
            <p>
                The final step visualizes the optimal meeting destination on a
                map. Factors like pollution will be considered as we work out a
                final story.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>
    </div>

    {#snippet viz()}
        <div class="viz-panel">
            <div class="viz-content">
                <p>Progress: {myProgress.toFixed(1)}%</p>
                <!-- <p>Current Progress: **{myProgress.toFixed(1)}%**</p> -->
                {#if myProgress < 14.29}
                    <p>Scene 1</p>
                    <p>
                        A nationwide workforce of 3 million federal employees
                        often travel for conferences, training, and cross-agency
                        meetings
                    </p>
                    <p>
                        <strong
                            >Where should everyone meet to minimize total cost
                            and travel time?</strong
                        >
                    </p>
                    <div class="image-gallery">
                        <figure>
                            <img
                                src="/images/fy23_category.png"
                                alt="Total (Approximate) Travel Cost in Fiscal
                            Year 2023"
                            />
                            <figcaption>
                                Table 1: Total (Approximate) Travel Cost in
                                Fiscal Year 2023
                            </figcaption>
                        </figure>
                        <p></p>
                        <figure>
                            <img
                                src="/images/fy23_type.png"
                                alt="Total (Approximate) Travel Cost in Fiscal
                            Year 2023 by Category"
                            />
                            <figcaption>
                                Table 2: Total (Approximate) Travel Cost in
                                Fiscal Year 2023 by Category
                            </figcaption>
                        </figure>
                    </div>
                {:else if myProgress < 28.57}
                    <p>Scene 2</p>
                    <p>
                        In 2013, the Treasury Inspector General for Tax
                        Administration (TIGTA) released a report revealing that
                        the IRS spent over $4 million on a single Anaheim
                        conference and did not use a data-driven method to
                        select the meeting location.
                    </p>
                    <p>
                        In 2016 the Government Accountability Office (GAO)
                        recommended a travel data management approach that would
                        provide the government with more consistent travel cost
                        data
                    </p>
                    <p>
                        <strong
                            >What if federal agencies used smart algorithms to
                            minimize cost and travel time for meetings?</strong
                        >
                    </p>
                    <div class="image-gallery">
                        <figure>
                            <img
                                src="/images/gao_report.png"
                                alt="GAO Report (2016) to improve data and
                            information sharing."
                            />
                            <figcaption>
                                Figure 1: GAO Report (2016) to improve data and
                                information sharing.
                            </figcaption>
                        </figure>
                    </div>
                    <!-- <p>Showing **Scene 2** logic (Thousands of Travel Choices).</p> -->
                {:else if myProgress < 42.86}
                    <p>Scene 3</p>
                    <p>
                        It sounds simple, but once you add just one more
                        traveler, the choices explode. Each possible meeting
                        city adds new combinations, new flight paths, new costs.
                    </p>
                    <p>
                        <strong
                            >We need to find a city with an airport that
                            minimizes total travel cost for everyone, no matter
                            where they start.
                        </strong>
                    </p>
                    <div class="map-chart">
                        <MapScene
                            width={Math.min(
                                1000,
                                Math.max(500, window.innerWidth - 100),
                            )}
                            height={350}
                            filterIatas={topRoutes.map(
                                (r) => r.meeting_airport,
                            )}
                            highlightIata={activeIata}
                            {originIatas}
                            routeData={meetingRoutes}
                        />
                        <RankBar
                            routes={topRoutes}
                            width={Math.min(
                                550,
                                Math.max(300, window.innerWidth - 350),
                            )}
                            height={300}
                            {originIatas}
                            on:hover={handleHover}
                        />
                    </div>
                {:else if myProgress < 57.14}
                    <p>Scene 4</p>
                    <p>
                        To solve the meeting-city problem, we turned to
                        Dijkstra's algorithm — a classic method for finding the
                        shortest path across a network.
                    </p>
                    <p>
                        In our case, the network is made of airports, and each
                        edge between them represents a fixed travel cost from
                        the
                        <a
                            href="https://www.gsa.gov/travel/plan-a-trip/transportation-airfare-rates-pov-rates-etc/airfare-rates-city-pair-program"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            City-Pair-Program (CPP)
                        </a> dataset.
                    </p>
                    <p>
                        It's a simple but powerful search: efficient,
                        deterministic, and perfectly suited for mapping travel
                        decisions at scale.
                    </p>
                    <p>
                        <strong
                            >The algorithm explores all possible routes,
                            continuously updating the lowest-cost paths until it
                            finds the optimal meeting point — the city that
                            minimizes the total cost for everyone involved.</strong
                        >
                    </p>
                    <div class="image-gallery">
                        <figure>
                            <img
                                src="/images/dijkstra_animated.gif"
                                alt="Dijkstra's Algorithm (Stony Brook University)"
                            />
                            <figcaption>
                                Figure 3: Dijkstra's Algorithm (Stony Brook
                                University).
                            </figcaption>
                        </figure>
                    </div>
                {:else if myProgress < 71.43}
                    <p>Scene 5</p>
                    <div class="image-gallery">
                        <figure>
                            <img
                                src="/images/a_star.gif"
                                alt="A-Star Algorithm (Wikimedia Commons)"
                            />
                            <figcaption>
                                Figure 4: A-Star Algorithm (Wikimedia Commons).
                            </figcaption>
                        </figure>
                    </div>
                {:else if myProgress < 85.71}
                    <p>Scene 6</p>
                    <p>
                        We plan to connect the Svelte visualization to Python
                        code designed to execute the Dijkstra algorithm and
                        identify the single, optimal route, fulfilling the goal
                        of making the data usable - <strong
                            >in real time.</strong
                        >
                    </p>
                    <div class="image-gallery">
                        <figure>
                            <img
                                src="/images/vscode.png"
                                alt="Visual Studio Code Solver."
                            />
                            <figcaption>
                                Figure 5: Visual Studio Code Solver.
                            </figcaption>
                        </figure>
                    </div>
                {:else}
                    <p>Scene 7</p>
                    <div class="image-gallery">
                        <figure>
                            <img
                                src="/images/mci.png"
                                alt="Kansas City - Optimal Meeting Place between Minnesota and Texas"
                            />
                            <figcaption>
                                Figure 6: Kansas City - Optimal Meeting Place
                                between Minnesota and Texas.
                            </figcaption>
                        </figure>
                    </div>
                    <p></p>
                    <div class="image-gallery">
                        <figure>
                            <img
                                src="/images/msp_hou.png"
                                alt="Optimal Meeting Place between Minnesota and Texas"
                            />
                            <figcaption>
                                Figure 7: Optimal Meeting Place between
                                Minnesota and Texas.
                            </figcaption>
                        </figure>
                    </div>
                {/if}
            </div>
        </div>
    {/snippet}
</Scrolly>

<style>
    .card-stack {
        /* This container ensures the cards are the main scrollable content */
        max-width: 400px; /* Optional: Constrain width for better readability */
    }
    .card {
        /* Add vertical padding to each card to force scrolling */
        padding: 400px 0;
        text-align: left;
    }
    .card:first-child {
        /* Reduce padding on the top card to prevent a huge initial gap */
        padding-top: 150px;
    }
    .card:last-child {
        /* Reduce padding on the bottom card to prevent excessive final scroll */
        padding-bottom: 150px;
    }
    h3 {
        font-size: 1.5em;
        margin-bottom: 10px;
        color: #433417;
    }
    .progress-indicator {
        font-size: 0.9em;
        color: #999;
        margin-top: 20px;
    }
    .viz-panel {
        /* Ensure the visualization panel takes up vertical space within its sticky container */
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        background-color: #f7f7f7; /* Light background for the viz area */
        border: 1px solid #ddd;
        padding: 20px;
        box-sizing: border-box;
    }
    .image-gallery {
        display: flex; /* Use flexbox to put them next to each other */
        gap: 20px;
        margin-bottom: 15px;
    }
    .image-gallery figure {
        flex: 1; /* Make both images take equal space */
        margin: 0;
        text-align: center;
    }
    .image-gallery img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
    }
    figcaption {
        font-size: 0.8em;
        color: #666;
        margin-top: 5px;
    }
    /* .map-container {
        width: 100%;
        margin: 20px 0;
    } */
    .map-chart {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        width: 100%;
        margin-top: 1rem;
    }
</style>
