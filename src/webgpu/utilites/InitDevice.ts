export const InitDevice = async ()=>{
    if (!navigator.gpu) {
        console.error("No navigator")
        return null;
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        return null;
    }
    return await adapter.requestDevice();

}
