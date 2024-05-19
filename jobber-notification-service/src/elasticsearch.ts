import { winstonLogger } from '@dtlee2k1/jobber-shared';
import { Client } from '@elastic/elasticsearch';
import envConfig from './config';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'notificationElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: `${envConfig.ELASTIC_SEARCH_URL}`
});

export async function checkConnection() {
  let isConnected = false;
  while (!isConnected) {
    logger.info('NotificationService connecting to ElasticSearch...');
    try {
      const health = await elasticSearchClient.cluster.health({});
      logger.info(`NotificationService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      logger.error('Connection to ElasticSearch failed. Retrying ...');
      logger.log({ level: 'error', message: `NotificationService checkConnection() method error: ${error}` });
    }
  }
}
