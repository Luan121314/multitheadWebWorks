export default class View {
  #csvFile = document.querySelector("#csv-file");
  #fileSize = document.querySelector("#file-size");
  #form = document.querySelector("#form");
  #debug = document.querySelector("#debug");
  #progress = document.querySelector("#progress");
  #progressOutput = document.querySelector("#progressOutput");
  #worker = document.querySelector("#worker");
  #columnSelected = document.querySelector("#columnSelected");
  #searchText = document.querySelector("#searchText");

  

  setFileSize(size) {
    this.#fileSize.innerText = `File size : ${size}\n`;
  }

  configureOnFileChange(fn) {
    this.#csvFile.addEventListener("change", (e) => {
      const file = e.target.files[0];

      fn(file);
    });
  }

  setSelectOptions(options) {
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.text = option;
      optionElement.value = option;
      this.#columnSelected.append(optionElement);
    });
  }

  enableSelect() {
    this.#columnSelected.disabled = false;
  }

  disableSelect() {
    this.#columnSelected.disabled = true;
  }

  enableSearchText() {
    this.#searchText.disabled = false;
  }

  disableSearchText() {
    this.#searchText.disabled = true;
  }

  resetSelect(){
    this.#columnSelected.querySelectorAll('option').forEach(optionElement=>{
        if(optionElement.disabled){
            return
        }
        optionElement.remove()
    })
  }

  configureOnFormSubmit(fn) {
    this.#form.reset();

    this.#form.addEventListener("submit", (e) => {
      e.preventDefault();
      // this.#columnSelected.reset()

      const file = this.#csvFile.files[0];

      const form = new FormData(e.currentTarget);
      const searchText = form.get("searchText");
      const column = form.get("columnSelected");

      fn({ column, searchText, file });

    });
  }

  updateDebugLog(text, reset = true) {
    if (reset) {
      this.#debug.innerText = text;
      return;
    }

    this.#debug.innerText += text;
  }

  updateProgress(value) {
    this.#progress.value = value;
    this.#progressOutput.value = `${value.toFixed(2)} %`
  }

  isWorkerEnabled() {
    return this.#worker.checked;
  }
}
