<script lang="ts">
    import { T } from "@threlte/core";
    import { OrbitControls, ContactShadows, HTML } from "@threlte/extras";
    import * as d3 from "d3";

    type Props = {
        airports: any[];
        meetingAirport: string | null;
        top10MeetingPoints: { iata: string; totalCost: number }[];
    };

    let { airports, meetingAirport, top10MeetingPoints }: Props = $props();
    let displayHeight = $derived(meetingAirport ? 1.5 : 0);

    // Create a lookup for the rank (0-9)
    const rankLookup = $derived(
        new Map(top10MeetingPoints.map((p, index) => [p.iata, index + 1])),
    );

    // Point 1 & 3: Mapping 2D coordinates to a 3D plane
    const projection = d3.geoAlbersUsa().scale(1000).translate([0, 0]);

    const getPos = (lon: number, lat: number) => {
        const p = projection([lon, lat]);
        return p ? [p[0] / 50, 0, p[1] / 50] : [0, 0, 0];
    };

    // State for interaction (Rubric Point 2)
    let hoveredIata = $state<string | null>(null);

    const costLookup = $derived(
        new Map(top10MeetingPoints.map((p) => [p.iata, p.totalCost])),
    );
</script>

<T.PerspectiveCamera makeDefault position={[0, 10, 15]} fov={45}>
    <OrbitControls enableDamping target={[0, 0, 0]} />
</T.PerspectiveCamera>

<T.DirectionalLight position={[10, 10, 5]} intensity={1.5} />
<T.AmbientLight intensity={0.5} />

<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
    <T.PlaneGeometry args={[25, 15]} />
    <T.MeshStandardMaterial color="#222" />
</T.Mesh>

{#each airports as ap}
    {@const cost = costLookup.get(ap.iata)}
    {@const rank = rankLookup.get(ap.iata)}
    {@const [x, y, z] = getPos(ap.lon, ap.lat)}
    {@const isMeeting = ap.iata === meetingAirport}

    <T.Group position={[x, 0, z]}>
        <T.Mesh
            onpointerenter={() => (hoveredIata = ap.iata)}
            onpointerleave={() => (hoveredIata = null)}
            position.y={isMeeting ? 1 : 0.25}
        >
            <T.CylinderGeometry args={[0.1, 0.1, isMeeting ? 2 : 0.5, 12]} />
            <T.MeshStandardMaterial
                color={isMeeting
                    ? "#ff3e00"
                    : hoveredIata === ap.iata
                      ? "white"
                      : "#444"}
                emissive={isMeeting ? "#ff3e00" : "black"}
                emissiveIntensity={0.5}
            />
        </T.Mesh>

        {#if hoveredIata === ap.iata || isMeeting || cost !== undefined}
            <HTML position={[0, isMeeting ? 2.2 : 0.8, 0]} center>
                <div class="label" class:is-optimal={isMeeting}>
                    {#if rank}
                        <span class="rank">#{rank}</span>
                    {/if}
                    {ap.iata}
                    {#if cost !== undefined}
                        ({isMeeting ? "Optimal " : ""}${Math.round(
                            cost,
                        ).toLocaleString()})
                    {/if}
                </div>
            </HTML>
        {/if}
    </T.Group>
{/each}

<ContactShadows opacity={0.5} scale={20} blur={2} far={10} />

<style>
    .label {
        background: rgba(
            0,
            0,
            0,
            0.85
        ); /* Slightly darker for better contrast */
        color: white;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-family: sans-serif;
        white-space: nowrap;
        pointer-events: none;
        border: 1px solid rgba(255, 255, 255, 0.3); /* Subtle border for the top 10 */
        transition: all 0.2s ease;
    }

    .rank {
        opacity: 0.8;
        font-weight: bold;
        margin-right: 4px;
        background: rgba(255, 255, 255, 0.2);
        padding: 1px 4px;
        border-radius: 3px;
        font-size: 0.9em;
    }

    .label.is-optimal .rank {
        background: rgba(
            0,
            0,
            0,
            0.2
        ); /* Contrast better against the orange background */
    }

    /* Style specifically for the #1 Optimal Airport */
    .label.is-optimal {
        background: #ff3e00; /* Use your theme's orange color */
        border: 2px solid white;
        font-weight: bold;
        font-size: 14px; /* Make it slightly larger */
        z-index: 10; /* Ensure it floats above others if they overlap */
        box-shadow: 0 0 15px rgba(255, 62, 0, 0.6); /* Add a glow effect */
    }
</style>
