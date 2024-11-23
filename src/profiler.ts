export const timer = {
    profilerTimer: 0,
    profilerExecutionInSeconds: 10,
    profilerEnabled: false,
    lastTimestamp: 0,
    currentTimestamp: 0,
    deltaTime: 0,
    currentProfilingExecution: 0,
    framesExecutionTimes: Array<number>(),

    startProfiler: () => {
        if (timer.profilerEnabled) {
            console.log("Profiler already running");
            return;
        }
        console.log("Starting profiler");
        timer.framesExecutionTimes = new Array<number>();
        timer.currentProfilingExecution = timer.profilerExecutionInSeconds;
        timer.profilerTimer = 0;
        timer.profilerEnabled = true;
    },
    stopProfiler: () => {
        console.log("Stoping profiler");
        timer.profilerEnabled = false;
    },
    updateProfiler: () => {
        timer.deltaTime = timer.currentTimestamp - timer.lastTimestamp;
        if (timer.profilerEnabled == false) return;
        timer.profilerTimer += timer.deltaTime;
        timer.framesExecutionTimes.push(timer.deltaTime);
        if (timer.profilerTimer >= timer.profilerExecutionInSeconds * 1000) {
            timer.profilerEnabled = false;
            console.log("Profiler done");
            processFramesExecutionTimes(timer.framesExecutionTimes);
        }
    }
};
const processFramesExecutionTimes = (data: Array<number>) => {
    const average = data.reduce((a, b) => a + b, 0) / data.length;
    const variance =
        data.reduce((a, b) => a + (b - average) ** 2, 0) / data.length;

    console.log("FPS: " + 1000 / average);
    console.log("Average execution time: " + average + " ms");
    console.log("Variance: " + variance + " ms");
};
