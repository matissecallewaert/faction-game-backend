"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
function getConfigVar(key) {
    const val = process.env[key];
    if (val === undefined) {
        throw new Error(`The variable with name ${key} is not set in .env.`);
    }
    return val;
}
class Config {
    static getAmpqUrl() {
        return getConfigVar("URL_PRODUCTION_QUEUE");
    }
    static getNotifyApiQueueName() {
        return getConfigVar("NOTIFY_API_SERVICE_QUEUE_NAME");
    }
    static getNotifyIngestDoneQueueName() {
        return getConfigVar("NOTIFY_INGEST_DONE_QUEUE_NAME");
    }
    static getNotifyConnectorQueueName() {
        return getConfigVar("NOTIFY_CONNECTOR_QUEUE_NAME");
    }
    static getNotifyNewInvoicesQueueName() {
        return getConfigVar("NOTIFY_NEW_INVOICES_QUEUE_NAME");
    }
    static getNotifyIngestDoneFailedQueueName() {
        return getConfigVar("NOTIFY_INGEST_DONE_FAILED_QUEUE_NAME");
    }
}
exports.Config = Config;
