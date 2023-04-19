const {app} = require('electron');
const log = require('electron-log');
const path = require('path');
const mkdirp = require('mkdirp');
const NEDB = require('nedb');
var EventEmitter = require('events');

log.info('product labels datastore module loaded');
class ImportResultsDatastore extends EventEmitter {
    constructor() {
        super();
        this.db = null;
        this._initDatabase();
    }

    _initDatabase() {
        let dataDirectory = app.getPath('userData');
            
        let dbPath = path.join(dataDirectory, "db");
        mkdirp(dbPath);
        dbPath = path.join(dbPath, "import-results.db");
    
        this.db = new NEDB(
            {
                filename: dbPath,
                autoload: true,
                timestampData: true, //automatically add createdAt and updatedAt fields
            }
        );
    
        //compact the database every second
        this.db.persistence.setAutocompactionInterval(1000);
    }
    
    _notifyDataStoreChanged() {
        log.info('notifying data store changed!');
        this.emit('product-labels-changed');
    }

    // replace(labels) {
    //     return new Promise((resolve, reject) => {
    //         if (labels === undefined) {
    //             reject();
    //         } else {
    //             this.purgeLabels(false).then(() => {
    //                 this.db.insert(labels, (err) => {
    //                     this._notifyDataStoreChanged();
    //                     if (err === null) {
    //                         resolve();
    //                     } else {
    //                         reject();
    //                     }
    //                 })
    //             }).catch(err => {
    //                 reject(err);
    //             })
    //         }
    //     });
    // }
    
    addResult(result) {
        log.info(`asked to add result ${result}`);
        return new Promise((resolve, reject) => {
            if (result === undefined && result === null) {
                reject("null or undefined label");
            } else {
                this.db.insert(result, (err, newDoc) => {
                    log.info(result);
                    log.error(err);
                    if (err === null) {
                        this._notifyDataStoreChanged();
                        resolve(newDoc);
                    } else {
                        reject(err);
                    }
                });
            }
        });
    }
    
    purgeLabels(notify) {
        notify = notify === undefined ? 'true' : notify;
        return new Promise((resolve, reject) => {
            this.db.remove({}, {multi: true}, (err) => {
                if (notify) this._notifyDataStoreChanged();
                if (err === null) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }
    
    deleteLabel(id) {
        log.info(`asked to delete label ${id}`);
        return new Promise((resolve, reject) => {
            if (id === undefined && id === null) {
                reject("null or undefined label id");
            } else {
                this.db.remove({_id: id}, {}, (err) => {
                    log.error(err);
                    if (err === null) {
                        this._notifyDataStoreChanged();
                        resolve(id);
                    } else {
                        reject(err);
                    }
                });
            }
        });
    }
    
    getLabels() {
        log.info(`looking for all labels`);
        return new Promise((resolve, reject) => {
            this.db.find({}, (err, labels) => {
                if (err === null) {
                    resolve(labels);
                } else {
                    reject(err);
                }
            });
        })
    }
}


let instance = new ImportResultsDatastore();

module.exports = instance;
