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
	};    let myProgress = $state(0);
    let meetingRoutes = $state<MeetingRoute[]>([]);
    let activeIata: string | null = $state(null);
    let originIatas = $state<string[]>([]);
    
    const topRoutes = $derived(
        [...meetingRoutes]
            .sort((a, b) => a.total_cost - b.total_cost)
            .slice(0, 10)
    );

    const handleHover = (e: any) => {
        // eslint-disable-next-line no-console
        console.log('Hover event received:', e.detail);
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
                .filter((key) => key.startsWith('path') && /^\d+$/.test(key.slice(4)))
                .sort((a, b) => {
                    const numA = parseInt(a.slice(4), 10);
                    const numB = parseInt(b.slice(4), 10);
                    return numA - numB;
                });
            
            // Parse rows with dynamic columns
            const rows: MeetingRoute[] = rawRows.map((d) => {
                const row: MeetingRoute = {
                    meeting_airport: (d.meeting_airport || "").toUpperCase(),
                    total_cost: Number(d.total_cost)
                };
                
                // Copy all path and cost columns dynamically
                pathKeys.forEach((pathKey) => {
                    const costKey = 'cost' + pathKey.slice(4);
                    row[pathKey] = d[pathKey];
                    if (d[costKey]) {
                        row[costKey] = Number(d[costKey]);
                    }
                });
                
                return row;
            });
            
            meetingRoutes = rows.filter((r) => r.meeting_airport && Number.isFinite(r.total_cost));
            
            // Store origin IATAs - we'll need airport names from an external source or hardcode them
            // For now, assume path1 is from first origin, path2 from second, etc.
            // You may need to load this from a config or data source
            originIatas = ['MSP', 'LAX']; // Default, but this could be detected or passed in
            
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
                Imagine two colleagues — one in Minneapolis, another in Los Angeles.
                They need to fly and meet somewhere for a one-day training.
                Should the person in Minnesota fly to California? Or should the
                person in California fly north? Maybe neither — perhaps they should
                meet halfway, in Denver, or even at a smaller nearby
                airport.
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
                Visualizing the solution and provide a definitive answer to the travel problem, as recommended by GAO.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 7: The Optimal Meeting Place</h3>
            <p>
                The final step visualizes the optimal meeting destination on a
                map. Factors like pollution will be considered as we work out a final story.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>
    </div>

    <div slot="viz" class="viz-panel">
        <div class="viz-content">
            <p>Progress: {myProgress.toFixed(1)}%</p>
            <!-- <p>Current Progress: **{myProgress.toFixed(1)}%**</p> -->
            {#if myProgress < 14.29}
                <div class="dashboard-scene-1">
                    <h2>FY 2023 Federal Travel Spending</h2>
                    <div class="dashboard-stats">
                        <div class="stat-item fade-in-up" style="--delay: 0.1s">
                            <div class="stat-icon">💵</div>
                            <div class="stat-number">$4.7B</div>
                            <div class="stat-label">Total Travel Expenses</div>
                        </div>
                        <div class="stat-item fade-in-up" style="--delay: 0.2s">
                            <div class="stat-icon">✈️</div>
                            <div class="stat-number">12.1M</div>
                            <div class="stat-label">Total Trips</div>
                        </div>
                        <div class="stat-item fade-in-up" style="--delay: 0.3s">
                            <div class="stat-icon">🇺🇸</div>
                            <div class="stat-number">$3.6B</div>
                            <div class="stat-label">Domestic Travel</div>
                        </div>
                        <div class="stat-item fade-in-up" style="--delay: 0.4s">
                            <div class="stat-icon">🌍</div>
                            <div class="stat-number">$1.1B</div>
                            <div class="stat-label">Foreign Travel</div>
                        </div>
                    </div>

                    <div class="expense-breakdown fade-in" style="--delay: 0.5s">
                        <h3>Expense Breakdown</h3>
                        <div class="expense-row">
                            <span class="expense-label">Airfare</span>
                            <div class="expense-bar">
                                <div class="expense-fill" style="width: 34%"></div>
                            </div>
                            <span class="expense-amount">$1.6B (34%)</span>
                        </div>
                        <div class="expense-row">
                            <span class="expense-label">Lodging</span>
                            <div class="expense-bar">
                                <div class="expense-fill" style="width: 26%"></div>
                            </div>
                            <span class="expense-amount">$1.2B (26%)</span>
                        </div>
                        <div class="expense-row">
                            <span class="expense-label">Per Diem</span>
                            <div class="expense-bar">
                                <div class="expense-fill" style="width: 21%"></div>
                            </div>
                            <span class="expense-amount">$1.0B (21%)</span>
                        </div>
                        <div class="expense-row">
                            <span class="expense-label">Other</span>
                            <div class="expense-bar">
                                <div class="expense-fill" style="width: 19%"></div>
                            </div>
                            <span class="expense-amount">$0.9B (19%)</span>
                        </div>
                    </div>
                </div>
            {:else if myProgress < 28.57}
                <p>Scene 2</p>
                <p>
                    In 2013, the Treasury Inspector General for Tax
                    Administration (TIGTA) released a report revealing that the
                    IRS spent over $4 million on a single Anaheim conference and
                    did not use a data-driven method to select the meeting
                    location.
                </p>
                <p>
                    In 2016 the Government Accountability Office (GAO)
                    recommended a travel data management approach that would
                    provide the government with more consistent travel cost data
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
                    It sounds simple, but once you add just one more traveler,
                    the choices explode. Each possible meeting city adds new
                    combinations, new flight paths, new costs.
                </p>
                <p>
                    <strong
                        >We need to find a city with an airport that minimizes
                        total travel cost for everyone, no matter where they
                        start.
                    </strong>
                </p>
                <div class="map-chart">
                    <MapScene
                        width={Math.min(1000, Math.max(500, window.innerWidth - 100))}
                        height={350}
                        filterIatas={topRoutes.map((r) => r.meeting_airport)}
                        highlightIata={activeIata}
                        originIatas={originIatas}
                        routeData={meetingRoutes}
                    />
                    <RankBar
                        routes={topRoutes}
                        width={Math.min(550, Math.max(300, window.innerWidth - 350))}
                        height={300}
                        originIatas={originIatas}
                        on:hover={handleHover}
                    />
                </div>
            {:else if myProgress < 57.14}
                <p>Scene 4</p>
                <p>
                    To solve the meeting-city problem, we turned to Dijkstra's
                    algorithm — a classic method for finding the shortest path
                    across a network.
                </p>
                <p>
                    In our case, the network is made of airports, and each edge
                    between them represents a fixed travel cost from the
                    <a
                        href="https://www.gsa.gov/travel/plan-a-trip/transportation-airfare-rates-pov-rates-etc/airfare-rates-city-pair-program"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        City-Pair-Program (CPP)
                    </a> dataset.
                </p>
                <p>
                    It's a simple but powerful search: efficient, deterministic,
                    and perfectly suited for mapping travel decisions at scale.
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
                    We plan to connect the Svelte visualization to Python code
                    designed to execute the Dijkstra algorithm and identify the
                    single, optimal route, fulfilling the goal of making the
                    data usable - <strong>in real time.</strong>
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
                            Figure 6: Kansas City - Optimal Meeting Place between Minnesota and Texas.
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
                            Figure 7: Optimal Meeting Place between Minnesota and Texas.
                        </figcaption>
                    </figure>
                </div>
            {/if}
        </div>
    </div>
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
    .map-container {
        width: 100%;
        margin: 20px 0;
    }
    .map-chart {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        width: 100%;
        margin-top: 1rem;
    }

    /* Dashboard Scene 1 Styles */
    .dashboard-scene-1 {
        width: 100%;
        padding: 20px 20px 20px 20px;
    }

    .dashboard-scene-1 h2 {
        font-size: 1.8em;
        color: #433417;
        margin-bottom: 20px;
        text-align: center;
    }

    .dashboard-scene-1 h3 {
        font-size: 1.2em;
        color: #433417;
        margin-bottom: 12px;
        margin-top: 0;
    }

    .dashboard-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-bottom: 25px;
    }

    .stat-item {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        color: white;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        cursor: default;
    }

    .stat-item:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 16px 28px rgba(102, 126, 234, 0.4);
    }

    .stat-item.fade-in-up {
        animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        opacity: 0;
    }

    .stat-icon {
        font-size: 2.2em;
        margin-bottom: 8px;
        display: block;
        animation: bounce 2s infinite;
        animation-delay: var(--delay, 0s);
    }

    .stat-number {
        font-size: 1.8em;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 6px;
        animation: countUp 1.2s ease-out var(--delay, 0s) both;
    }

    .stat-label {
        font-size: 0.85em;
        opacity: 0.9;
        line-height: 1.3;
        animation: fadeInUp 0.8s ease-out calc(var(--delay, 0s) + 0.3s) both;
    }

    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-8px);
        }
    }

    @keyframes countUp {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .expense-breakdown {
        background: #f8f4f7;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 20px;
    }

    .expense-row {
        display: grid;
        grid-template-columns: 100px 1fr 120px;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        animation: slideInLeft 0.6s ease-out forwards;
        opacity: 0;
    }

    .expense-row:nth-child(2) { animation-delay: 0.5s; }
    .expense-row:nth-child(3) { animation-delay: 0.6s; }
    .expense-row:nth-child(4) { animation-delay: 0.7s; }
    .expense-row:nth-child(5) { animation-delay: 0.8s; }

    .expense-label {
        font-size: 0.95em;
        color: #433417;
        font-weight: 500;
        transition: color 0.3s ease;
    }

    .expense-row:hover .expense-label {
        color: #764ba2;
    }

    .expense-bar {
        height: 20px;
        background: #e5d5e0;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
    }

    .expense-bar::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
    }

    .expense-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        border-radius: inherit;
        animation: fillBar 1.2s ease-out;
        position: relative;
        z-index: 1;
    }

    .expense-amount {
        font-size: 0.9em;
        color: #764ba2;
        font-weight: 600;
        text-align: right;
        animation: fadeIn 0.8s ease-out 0.6s both;
    }

    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes fillBar {
        from {
            width: 0;
            opacity: 0;
        }
        to {
            width: 100%;
            opacity: 1;
        }
    }

    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    .images-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .image-card {
        margin: 0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .image-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .image-card img {
        width: 100%;
        height: auto;
        display: block;
    }

    .image-card figcaption {
        padding: 12px;
        background: #f8f4f7;
        font-size: 0.9em;
        color: #433417;
        font-weight: 500;
    }

    .fade-in {
        animation: fadeIn 0.8s ease-in forwards;
        opacity: 0;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .dashboard-scene-1 h2 {
        font-size: 1.8em;
        color: #433417;
        margin-bottom: 20px;
        text-align: center;
        animation: slideDown 0.8s ease-out;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
