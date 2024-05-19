import { winstonLogger } from '@dtlee2k1/jobber-shared';
import { Client } from '@elastic/elasticsearch';
import envConfig from '@chat/config';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'chatElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: `${envConfig.ELASTIC_SEARCH_URL}`
});

export async function checkConnection() {
  let isConnected = false;
  while (!isConnected) {
    logger.info('ChatService connecting to ElasticSearch...');
    try {
      const health = await elasticSearchClient.cluster.health({});
      logger.info(`ChatService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      logger.error('Connection to ElasticSearch failed. Retrying ...');
      logger.log({ level: 'error', message: `ChatService checkConnection() method error: ${error}` });
    }
  }
}
