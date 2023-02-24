import Service from "./service.js";

const service = new Service()

console.log(`I'm alive`);
postMessage({eventType: 'alive'})

onmessage=({data})=>{
    const {file, query} = data

    service.processFile({
        query,
        file,
        onOcurrenceUpdate: (args)=> {
            postMessage({eventType: 'ocurrenceUpdate', ...args})
        },
        onProgress: (total)=>  {
            postMessage({eventType: 'progress', total})
        }
    })

    // postMessage({eventType: 'progress'})
    // postMessage({eventType: 'ocurrenceUpdate'})
    // console.log('hey from worker', data);
}