import { spawn } from "node:child_process";

export async function POST({ request }) {
    const { airports } = await request.json();

    if (!airports || airports.length !== 3) {
        return new Response(
            JSON.stringify({ error: "Expected exactly 3 airport codes" }),
            { status: 400 }
        );
    }

    // Single argument: "MSP,SEA,DTW"
    const argString = airports.join(",");

    // ✔ FIX 1: args must be ONLY strings
    // ✔ FIX 2: cwd passed as third param (options object)
    const python = spawn(
        "/Users/hahnemann/dev/CSCI-5609/.venv/bin/python",
        ["scripts/dijkstra.py", argString],
        {
            cwd: "/Users/hahnemann/dev/CSCI-5609/route-wise"   // ✔ FIXED PATH (must start with /)
        }
    );

    let output = "";
    let error = "";

    for await (const chunk of python.stdout) {
        output += chunk;
    }
    for await (const chunk of python.stderr) {
        error += chunk;
    }

    console.log("PYTHON STDOUT:", output);
    console.log("PYTHON STDERR:", error);

    if (error.trim()) {
        console.error("PYTHON ERROR DETECTED:", error);
        return new Response(JSON.stringify({ error }), { status: 500 });
    }

    // Instead of JSON.parse, extract the LAST LINE as the meeting airport
    const lines = output.trim().split("\n");
    const lastLine = lines[lines.length - 1].trim();
    console.log("LAST LINE FROM PYTHON:", lastLine);

    console.error("INVALID MEETING AIRPORT FORMAT:", lastLine);
    // Validate that the output is a proper airport code
    if (!/^[A-Z]{3}$/.test(lastLine)) {
        return new Response(
            JSON.stringify({
                error: "Python did not return a valid airport code",
                raw: output
            }),
            { status: 500 }
        );
    }

    return new Response(
        JSON.stringify({ meeting: lastLine }),
        {
            headers: { "Content-Type": "application/json" }
        }
    );
}