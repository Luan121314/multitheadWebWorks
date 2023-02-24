export default class Service {
  processFile({ query, file, onOcurrenceUpdate, onProgress }) {
    const linesLength = { counter: 0 };
    const progressFn = this.#setupProgress(file.size, onProgress);

    const startedAt = performance.now()
    const elapsed = ()=> `${((performance.now() - startedAt) / 1000).toFixed(2)} secs`

    const onUpdate = () => {
        return (found) => {
            onOcurrenceUpdate({
                found,
                took: elapsed(),
                linesLength: linesLength.counter
            })
        }
    }

    file
      .stream()
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(this.#csvToJson({ linesLength, progressFn }))
      .pipeTo(this.#findOcurrencies({ query, onOcurrenceUpdate: onUpdate() }));

  }

  #csvToJson({ linesLength, progressFn }) {
    let colums = [];
    return new TransformStream({
      transform(chunk, controller) {
        progressFn(chunk.length);
        const lines = chunk.split("\n");
        linesLength.counter += lines.length;

        if (!colums.length) {
          const firstLine = lines.shift();
          colums = firstLine.split(",");
          linesLength.counter--;
        }

        for (const line of lines) {
          if (!line.length) continue;

          let currentItem = {};
          const currentColumsItems = line.split(",");

          for (const columnIndex in currentColumsItems) {
            const columnItem = currentColumsItems[columnIndex];

            currentItem[colums[columnIndex]] = columnItem.trimEnd();
          }

          controller.enqueue(currentItem);
        }
      },
    });
  }

  #findOcurrencies({ query, onOcurrenceUpdate }) {
    const queryKeys = Object.keys(query);
    let found = {};

    return new WritableStream({
      write(jsonLine) {
        for (const keyIndex in queryKeys) {
          const key = queryKeys[keyIndex];
          const queryValue = query[key];
          found[queryValue] = found[queryValue] ?? 0;
          if (queryValue.test(jsonLine[key])) {
            found[queryValue]++;
            onOcurrenceUpdate(found);
          }
        }
      },
      close: () => {
        onOcurrenceUpdate(found);
      },
    });
  }

  #setupProgress(totalBytes, onProgress) {
    let totalUploaded = 0;
    onProgress(0);

    return (chunkLength) => {
      totalUploaded += chunkLength;
      const total = (100 / totalBytes) * totalUploaded;
      onProgress(total);
    };
  }

  readHeaderCSV({file, getHeader}){
    file
        .stream()
        .pipeThrough(new TextDecoderStream())
        .getReader()
        .read()
        .then(headerCSV => {
          const lines = headerCSV.value.split('\n')
          const header = lines[0].split(',')
          getHeader(header)
        })
  }


}
