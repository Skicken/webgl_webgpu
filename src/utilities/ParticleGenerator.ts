import Rand from 'rand-seed';
export const GenerateParticleBuffer = (count: number, seed: string = ''): Float32Array => {
    const rand = new Rand(seed);
    const particleBuffer = new Float32Array(count * 5); 

    for (let i = 0; i < count; i++) {
        const baseIndex = i * 5; 
        particleBuffer[baseIndex] = rand.next() * 3 + 1;   
        particleBuffer[baseIndex + 1] = 0;                 
        particleBuffer[baseIndex + 2] = 0;                 
        particleBuffer[baseIndex + 3] = rand.next() + 0.1; 
        particleBuffer[baseIndex + 4] = rand.next() + 0.1; 
    }

    return particleBuffer;
};
