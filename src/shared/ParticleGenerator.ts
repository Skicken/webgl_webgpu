import Rand from 'rand-seed';
export const GenerateParticleBuffer = (count:number, seed:string=''):Float32Array => {

    const rand = new Rand(seed);
    const particles:number[] = [];
    for (let i = 0; i < count; i++) {
        const angularSpeed = [rand.next()+0.1 , rand.next()+0.1 ];
        const position = [rand.next()*3+1, 0, 0];
        particles.push(...position,...angularSpeed);
    }
    return new Float32Array(particles);


}
