function getConfigVar(key: string): string {
  const val = process.env[key];
  if (val === undefined) {
    throw new Error(`The variable with name ${key} is not set in .env.`);
  }
  return val;
}

export class Config {
  static getAmpqUrl(): string {
    return getConfigVar("URL_PRODUCTION_QUEUE");
  }

  static getNotifyApiQueueName(): string {
    return getConfigVar("NOTIFY_API_SERVICE_QUEUE_NAME");
  }

  static getNotifyIngestDoneQueueName(): string {
    return getConfigVar("NOTIFY_INGEST_DONE_QUEUE_NAME");
  }

  static getNotifyConnectorQueueName(): string {
    return getConfigVar("NOTIFY_CONNECTOR_QUEUE_NAME");
  }

  static getNotifyNewInvoicesQueueName(): string {
    return getConfigVar("NOTIFY_NEW_INVOICES_QUEUE_NAME");
  }

  static getNotifyIngestDoneFailedQueueName(): string {
    return getConfigVar("NOTIFY_INGEST_DONE_FAILED_QUEUE_NAME");
  }
}
