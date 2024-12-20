type ProfilerResult = {
    average: number;
    variance: number;
    min: number;
    max: number;
};
export const Profiler = {
    profilerTimer: 0,
    profilerExecutionInSeconds: 10,
    profilerEnabled: false,
    currentProfilingExecution: 0,
    framesExecutionTimes: Array<number>(),
    profilingName: "Default",
    copyToClipboard: false,
    sceneName: "",
    renderer: "",
    state: "Not running",

    initProfiler: () => {
        if (Profiler.profilerEnabled) {
            console.log("Profiler already running");
            return;
        }
        console.log("Starting profiler");
        Profiler.state = "Running";
        Profiler.framesExecutionTimes = new Array<number>();
        Profiler.currentProfilingExecution =
            Profiler.profilerExecutionInSeconds;
        Profiler.profilerTimer = 0;
        Profiler.profilerEnabled = true;
    },
    update: (deltaTime: number) => {
        if (Profiler.profilerEnabled == false) return;
        Profiler.profilerTimer += deltaTime;
        Profiler.framesExecutionTimes.push(deltaTime);
        if (
            Profiler.profilerTimer >=
            Profiler.profilerExecutionInSeconds * 1000
        ) {
            Profiler.profilerEnabled = false;
            Profiler.state = "Finished profiling";
            const result = Profiler.generateResult();
            if (Profiler.copyToClipboard) {
                Profiler.saveResultToClipboard(result);
            }
            console.log(result);
        }
    },
    generateResult: () => {
        const processed = processFramesExecutionTimes(
            Profiler.framesExecutionTimes
        );
        let resultString = "";
        resultString += `Profiler ${Profiler.profilingName} run in ${Profiler.profilerExecutionInSeconds} seconds\n`;
        resultString += `Renderer ${Profiler.renderer} Scene ${Profiler.sceneName}\n`;
        resultString += `FPS: ${(1000 / processed.average).toFixed(2)}\n`;
        resultString += `Average rendering time: ${processed.average.toFixed(2)} ms\n`;
        resultString += `Variance: ${processed.variance.toFixed(2)} ms\n`;
        resultString += `Min: ${processed.min.toFixed(2)} ms\n`;
        resultString += `Max: ${processed.max.toFixed(2)} ms\n`;
        return resultString;
    },
    saveResultToClipboard: (resultString: string) => {
        navigator.clipboard
            .writeText(resultString)
            .then(() => {
                console.log("Profiler result copied to clipboard");
            })
            .catch((err) => {
                console.error("Could not copy to clipboard:", err);
            });
        console.log("Saved result to clipboard:");
        console.log(resultString);
    }
};

const processFramesExecutionTimes = (data: Array<number>): ProfilerResult => {
    const average = data.reduce((a, b) => a + b, 0) / data.length;
    const variance =
        data.reduce((a, b) => a + (b - average) ** 2, 0) / data.length;
    const min = data.reduce((a, b) => Math.min(a, b), data[0]);
    const max = data.reduce((a, b) => Math.max(a, b), data[0]);
    return { average: average, variance: variance, min: min, max: max };
};
