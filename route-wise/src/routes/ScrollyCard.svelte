<script lang="ts">
    import { buildGraphFromCSV, findOptimalMeetingPoint } from "$lib/dijkstra";
    import type { Graph } from "$lib/dijkstra";
    import { base } from "$app/paths";
    import type { CPP_RouteWise } from "../types";
    type Props = {
        routes: CPP_RouteWise[];
    };
    let { routes }: Props = $props();

    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { Scrolly } from "$lib";
    import MapScene from "$lib/MapScene.svelte";
    import RankBar from "$lib/RankBar.svelte";
    import * as d3 from "d3";
    import { get } from "svelte/store";
    import FinalUSMap from "$lib/FinalUSMap.svelte";
    import PythonUSMap from "$lib/PythonUSMap.svelte";

    let flightGraph = $state<Graph>({});
    type MeetingRoute = {
        meeting_airport: string;
        total_cost: number;
        [key: string]: any;
    };
    let myProgress = $state(0);
    let animationStep = $state(0);
    let meetingRoutes = $state<MeetingRoute[]>([]);
    let activeIata: string | null = $state(null);
    let originIatas = $state<string[]>([]);

    let pythonAirportList = $state<string[]>([]);
    let airportList = $state<string[]>([]);
    let pythonAirports = $state<any[]>([]);
    let airports = $state<any[]>([]);
    let selectedIata1 = $state<string | null>(null);
    let selectedIata2 = $state<string | null>(null);
    let selectedIata3 = $state<string | null>(null);
    let meetingAirport = $state<string | null>(null);
    let isComputingMeeting = $state(false);
    let meetingError = $state<string | null>(null);

    const topRoutes = $derived(
        [...meetingRoutes]
            .sort((a, b) => a.total_cost - b.total_cost)
            .slice(0, 10),
    );

    const handleHover = (e: any) => {
        console.log("Hover event received:", e.detail);
        activeIata = e.detail.iata;
    };

    async function computeMeeting() {
        if (!selectedIata1 || !selectedIata2 || !selectedIata3) return;

        isComputingMeeting = true;
        meetingError = null;

        try {
            // Run the calculation locally in the browser
            const result = findOptimalMeetingPoint(flightGraph, [
                selectedIata1,
                selectedIata2,
                selectedIata3,
            ]);

            if (result.meetingPoint) {
                meetingAirport = result.meetingPoint;
            } else {
                meetingError =
                    "No common meeting point found for these airports.";
            }
        } catch (e) {
            console.error(e);
            meetingError = "Error calculating optimal route.";
        } finally {
            isComputingMeeting = false;
        }
    }

    $effect(() => {
        console.log(
            "Dropdown values:",
            selectedIata1,
            selectedIata2,
            selectedIata3,
        );
    });

    $effect(() => {
        if (selectedIata1 && selectedIata2 && selectedIata3) {
            console.log("TRIGGERING computeMeeting() from $effect");
            computeMeeting();
        }
    });

    onMount(async () => {
        try {
            const pythonAirportData = await d3.csv(base + "/iata-icao-us.csv");
            // const pythonAirportData = await d3.csv("/iata-icao-us.csv");
            pythonAirportList = pythonAirportData
                .map((d) => d.iata)
                .filter((code) => code && code.trim().length > 0)
                .sort();
            pythonAirports = pythonAirportData
                .filter((d) => d.iata && d.latitude && d.longitude)
                .map((d) => ({
                    iata: d.iata,
                    lat: +d.latitude,
                    lon: +d.longitude,
                }));

            const airportData = await d3.csv(
                base + "/iata-icao-us-awards-2026.csv",
            );
            airportList = airportData
                .map((d) => d.iata)
                .filter((code) => code && code.trim().length > 0)
                .sort();
            airports = airportData
                .filter((d) => d.iata && d.latitude && d.longitude)
                .map((d) => ({
                    iata: d.iata,
                    lat: +d.latitude,
                    lon: +d.longitude,
                }));

            const rawRows = await d3.csv(base + "/meeting_msp_lax.csv");

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

            originIatas = ["MSP", "LAX"];

            // NEW: Load the flight fare data to build the graph
            const flightData = await d3.csv(base + "/awards_us_2026.csv");
            flightGraph = buildGraphFromCSV(flightData);
        } catch (err) {
            console.error("Failed to load meeting routes:", err);
        }
    });
</script>

<p></p>

<Scrolly bind:progress={myProgress}>
    <div class="card-stack">
        <div class="card">
            <h3>The Challenge of Meeting in One Place</h3>
            <p>
                What if you had to gather people from all across the country in
                one place — quickly and cheaply?
            </p>
            <p>
                In FY 2023, federal travel represented a significant cost to the
                government, reflecting the scale of official travel required to
                carry out agency missions. Spending was driven largely by
                airfare, lodging, and per diem expenses, with domestic travel
                accounting for the majority of trips and costs, while foreign
                travel made up a smaller but still notable share.
            </p>
            <!-- <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p> -->
        </div>

        <div class="card">
            <h3>Choosing the Meeting Spot</h3>
            <p>
                Imagine two colleagues — one in Minneapolis, another in Los
                Angeles. They need to fly and meet somewhere for a one-day
                training. Should the person in Minnesota fly to California? Or
                should the person in California fly north? Maybe neither —
                perhaps they should meet halfway, in Denver, or even at a
                smaller nearby airport.
            </p>
            <!-- <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p> -->
        </div>

        <div class="card">
            <h3>Solving with an Algorithm (Dijkstra)</h3>
            <div class="text-sequence-container">
                {#if animationStep === 0}
                    <p in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
                        We start with an empty map of the continental U.S.
                    </p>
                {:else if animationStep === 1}
                    <p in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
                        We add all airports with an International Air Transport
                        Association (IATA) code on the map.
                    </p>
                {:else if animationStep === 2}
                    <p in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
                        We keep only the airports that have airlines with
                        government contracts. Government employees are only
                        allowed to fly in these carriers.
                    </p>
                {:else if animationStep === 3}
                    <p in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
                        Suppose colleagues in
                        <span style="color: orange; font-weight: bold;"
                            >Detroit(DTW)</span
                        >,
                        <span style="color: deepskyblue; font-weight: bold;"
                            >Phoenix(PHX)</span
                        >, and
                        <span style="color: limegreen; font-weight: bold;"
                            >Las Vegas(LAS)</span
                        >
                        need to meet.
                    </p>
                {:else if animationStep === 4}
                    <p in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
                        If we were to guess the optimal meeting place, distance
                        comes to mind. One would think that shorter distances
                        reduce total airfare cost. In this case, flying to an
                        airport in <span style="color: red; font-weight: bold;"
                            >Kansas (MCI)</span
                        > makes sense.
                    </p>
                {:else if animationStep === 5}
                    <p in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
                        Algorithms like Dijkstra can find optimal (best)
                        solutions when the problem is well defined, in this
                        case, the lowest minimum airfare cost in total. Against
                        commmon sense due to a longer travel distance, the
                        optimal meeting place in this case is <span
                            style="color: red; font-weight: bold;"
                            >Seattle (SEA)</span
                        >.
                    </p>
                {/if}
            </div>
            <div class="button-group">
                <button
                    onclick={() =>
                        (animationStep = Math.max(0, animationStep - 1))}
                    disabled={animationStep === 0}
                    class="nav-button"
                >
                    Prev
                </button>
                <button
                    onclick={() =>
                        (animationStep = Math.min(5, animationStep + 1))}
                    disabled={animationStep === 5}
                    class="nav-button"
                >
                    Next
                </button>
            </div>
            <!-- <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p> -->
        </div>

        <div class="card">
            <h3>The Optimal Meeting Place</h3>
            <p>
                You try it! Choose three airports from the contiguous U.S. to
                determine the optimal meeting place.
            </p>
            <!-- Dropdown 1 -->
            <label><strong>Airport 1:</strong></label>
            <select
                bind:value={selectedIata1}
                style="padding: 6px; font-size: 1rem; margin-bottom: 10px;"
            >
                <option value="" disabled selected>Select an airport</option>
                {#each airportList as code}
                    <option value={code}>{code}</option>
                {/each}
            </select>
            <p></p>

            <!-- Dropdown 2 -->
            <label><strong>Airport 2:</strong></label>
            <select
                bind:value={selectedIata2}
                style="padding: 6px; font-size: 1rem; margin-bottom: 10px;"
            >
                <option value="" disabled selected>Select an airport</option>
                {#each airportList as code}
                    <option value={code}>{code}</option>
                {/each}
            </select>
            <p></p>

            <!-- Dropdown 3 -->
            <label><strong>Airport 3:</strong></label>
            <select
                bind:value={selectedIata3}
                style="padding: 6px; font-size: 1rem; margin-bottom: 10px;"
            >
                <option value="" disabled selected>Select an airport</option>
                {#each airportList as code}
                    <option value={code}>{code}</option>
                {/each}
            </select>
            <p></p>

            {#if meetingAirport}
                <p>Lowest cost meeting destination: {meetingAirport}</p>
            {:else if isComputingMeeting}
                <p>Computing lowest cost airfare ...</p>
            {:else if meetingError}
                <p class="error">
                    Error computing airfare: {meetingError}
                </p>
            {/if}
            <!-- <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p> -->
        </div>
    </div>

    {#snippet viz()}
        <div class="viz-panel">
            <div class="viz-content">
                <!-- <p>Progress: {myProgress.toFixed(1)}%</p> -->
                {#if myProgress < 20.0}
                    <div class="dashboard-scene-1">
                        <h2>FY 2023 Federal Travel Spending</h2>
                        <div class="dashboard-stats">
                            <div
                                class="stat-item fade-in-up"
                                style="--delay: 0.1s"
                            >
                                <div class="stat-icon">💵</div>
                                <div class="stat-number">$4.7B</div>
                                <div class="stat-label">
                                    Total Travel Expenses
                                </div>
                            </div>
                            <div
                                class="stat-item fade-in-up"
                                style="--delay: 0.2s"
                            >
                                <div class="stat-icon">✈️</div>
                                <div class="stat-number">12.1M</div>
                                <div class="stat-label">Total Trips</div>
                            </div>
                            <div
                                class="stat-item fade-in-up"
                                style="--delay: 0.3s"
                            >
                                <div class="stat-icon">🇺🇸</div>
                                <div class="stat-number">$3.6B</div>
                                <div class="stat-label">Domestic Travel</div>
                            </div>
                            <div
                                class="stat-item fade-in-up"
                                style="--delay: 0.4s"
                            >
                                <div class="stat-icon">🌍</div>
                                <div class="stat-number">$1.1B</div>
                                <div class="stat-label">Foreign Travel</div>
                            </div>
                        </div>
                        <div
                            class="expense-breakdown fade-in"
                            style="--delay: 0.5s"
                        >
                            <h3>Expense Breakdown</h3>
                            <div class="expense-row">
                                <span class="expense-label">Airfare</span>
                                <div class="expense-bar">
                                    <div
                                        class="expense-fill"
                                        style="width: 34%"
                                    ></div>
                                </div>
                                <span class="expense-amount">$1.6B (34%)</span>
                            </div>
                            <div class="expense-row">
                                <span class="expense-label">Lodging</span>
                                <div class="expense-bar">
                                    <div
                                        class="expense-fill"
                                        style="width: 26%"
                                    ></div>
                                </div>
                                <span class="expense-amount">$1.2B (26%)</span>
                            </div>
                            <div class="expense-row">
                                <span class="expense-label">Per Diem</span>
                                <div class="expense-bar">
                                    <div
                                        class="expense-fill"
                                        style="width: 21%"
                                    ></div>
                                </div>
                                <span class="expense-amount">$1.0B (21%)</span>
                            </div>
                            <div class="expense-row">
                                <span class="expense-label">Other</span>
                                <div class="expense-bar">
                                    <div
                                        class="expense-fill"
                                        style="width: 19%"
                                    ></div>
                                </div>
                                <span class="expense-amount">$0.9B (19%)</span>
                            </div>
                        </div>
                    </div>
                {:else if myProgress < 60.0}
                    <!-- <p>Scene 2</p> -->
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
                {:else if myProgress <= 97.0}
                    <PythonUSMap
                        width={900}
                        height={550}
                        {pythonAirports}
                        {airports}
                        {animationStep}
                    />
                {:else}
                    <!-- <p>Scene 6</p> -->
                    <FinalUSMap
                        width={900}
                        height={550}
                        {airports}
                        {selectedIata1}
                        {selectedIata2}
                        {selectedIata3}
                        {meetingAirport}
                    />
                {/if}
            </div>
        </div>
    {/snippet}
</Scrolly>

<style>
    .text-sequence-container {
        display: grid;
        grid-template-areas: "overlay";
        min-height: 80px; /* Adjust to fit your longest text */
        align-items: center;
        margin-bottom: 20px; [cite: 140]
    }

    .text-sequence-container p {
        grid-area: overlay;
        margin: 0; [cite: 141]
    }

    .button-group {
        display: flex;
        gap: 10px; [cite: 149]
    }
    
    .nav-button {
    padding: 8px 16px;
    background-color: #764ba2;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s;
    }
    
    .nav-button:hover {
        background-color: #667eea;
        transform: translateY(-2px);
    }
    
    .nav-button:disabled {
        background-color: #e5d5e0;
        color: #999;
        cursor: not-allowed;
        transform: none;
    }
    
    .card-stack {
        max-width: 400px;
    }

    .card {
        padding: 400px 0;
        text-align: left;
    }

    .card:first-child {
        padding-top: 150px;
    }

    .card:last-child {
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
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        background-color: #f7f7f7;
        border: 1px solid #ddd;
        padding: 20px;
        box-sizing: border-box;
    }

    .image-gallery {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;
    }

    .image-gallery figure {
        flex: 1;
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

    .map-chart {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        width: 100%;
        margin-top: 1rem;
    }

    .dashboard-scene-1 {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
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
        position: relative;
        z-index: 1;
        width: 0;
        animation: fillToTarget 1.2s ease-out forwards;
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

    @keyframes fillToTarget {
        from {
            width: 0;
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
