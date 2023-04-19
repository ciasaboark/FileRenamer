class ImportFile  {
    constructor(uuid, path, status, progress) {
        this.uuid = uuid;
        this.path = path;
        this.status = status;
        this.progress = progress;
    }
}

module.exports = ImportFile;