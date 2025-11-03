<script lang="ts">
    import { Scrolly } from "$lib";
    import { slide, fly } from "svelte/transition";

    type Props = {
        routeNum: number;
    };
    let { routeNum }: Props = $props();

    let progress: number = $state(0);
</script>

<Scrolly bind:progress --scrolly-story-width="0">
    <div id="virtual"></div>
    <div slot="viz" class="header">
        <h1>RouteWise</h1>

        {#if progress > 30}
            <p
                in:slide={{
                    duration: 1000,
                    axis: "x",
                }}
                class="text-xl font-medium"
            >
                The Challenge of Traveling to Meet in One Place
            </p>
            <p
                in:slide={{
                    duration: 1000,
                    axis: "x",
                    delay: 500, // Slight delay for sequential appearance
                }}
                class="text-xl font-medium mt-1"
            >
                Choosing from {routeNum} Destinations
            </p>
        {/if}

        <!-- {#if progress > 70}
            <p in:fly={{ duration: 800, x: 0, y: 200 }}>
                with data visualizations
            </p>
        {/if} -->
    </div>
</Scrolly>

<!-- <svelte:window bind:scrollY={progress} /> -->

<style>
    .header {
        background-color: #F8F8F4;
        padding: 80px 60px;
        height: 60vh;
        width: 100%;
    }
    #virtual {
        height: 150vh; /* Make the page scrollable with a 150% view height */
    }
    h1 {
        font-size: 10vh;
        color: #36454F;
        font-weight: 600; /* Slightly bolder font weight */
    }
    p {
        font-size: 3vh;
        color: #778899;
    }
</style>
