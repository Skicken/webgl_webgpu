const Timer = {
    //Delta time in ms
    deltaTime: 0,
    currentTimestamp: 0,
    previousTimestamp: 0,
    update: () => {
        Timer.previousTimestamp = Timer.currentTimestamp;
        Timer.currentTimestamp = performance.now();
        Timer.deltaTime = Timer.currentTimestamp - Timer.previousTimestamp;
    },
}
export default Timer;
