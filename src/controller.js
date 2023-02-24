export default class Controller {
  #view;
  #worker;
  #service;
  #events = {
    alive: () => {},
    progress: ({ total }) => {
      this.#view.updateProgress(total);
    },
    ocurrenceUpdate: ({ found, linesLength, took }) => {
      const [[key, value]] = Object.entries(found);
      this.#view.updateDebugLog(
        `found ${value} occurrences of ${key} - over ${linesLength} - took: ${took}`
      );
    },
  };

  constructor({ view, worker, service }) {
    this.#view = view;
    this.#worker = this.#configureWorker(worker);
    this.#service = service;
  }

  static init(deps) {
    const controller = new Controller(deps);
    controller.init();
    return controller;
  }

  init() {
    this.#view.configureOnFileChange(this.#configureOnFileChange.bind(this));

    this.#view.configureOnFormSubmit(this.#configureOnFormSubmit.bind(this));
  }

  #configureWorker(worker) {
    worker.onmessage = ({ data }) => {
      const eventName = data.eventType;
      const event = this.#events[eventName];
      event(data);
    };

    return worker;
  }

  #formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];

    let i = 0;

    for (i; bytes >= 1024 && i < 4; i++) {
      bytes /= 1024;
    }

    return `${bytes.toFixed(2)} ${units[i]}`;
  }

  #IsFieldsEmpty(fields){
    return Object.values(fields).every(field => !!field)
  }

  #configureOnFileChange(file) {
    if (!file) {
      this.#view.disableSelect();
      this.#view.disableSearchText();

      return;
    }

    this.#view.enableSelect();
    this.#view.enableSearchText();
    this.#view.resetSelect();
    

    const sizeFormated = this.#formatBytes(file.size);
    this.#view.setFileSize(sizeFormated);

    this.#service.readHeaderCSV({
      file,
      getHeader: (options) => {
        this.#view.setSelectOptions(options);
      },
    });
  }

  #configureOnFormSubmit({ column, searchText, file }) {

    if (!this.#IsFieldsEmpty({ column, searchText, file})) {
      alert("please fill the fields ");
      return;
    }

    this.#view.updateDebugLog("")

    const query = {};

    query[column] = new RegExp(searchText, "i");

    console.log(query);

    if (this.#view.isWorkerEnabled()) {
      this.#worker.postMessage({ query, file });

      console.log("Execute on worker thread");

      return;
    }

    console.log("Execute on main thread");
    this.#service.processFile({
      query,
      file,
      onProgress: (total) => {
        this.#events.progress({ total });
      },
      onOcurrenceUpdate: (...args) => {
        this.#events.ocurrenceUpdate(...args);
      },
    });
  }
}
