import Service from "./service.js";
import View from "./view.js";
import Controller from "./controller.js";

const worker = new Worker('./src/worker.js', {
    type: 'module'
})

Controller.init({
    view: new View(),
    service: new Service(),
    worker
})