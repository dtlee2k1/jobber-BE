import { winstonLogger } from '@dtlee2k1/jobber-shared';
import { Client } from '@elastic/elasticsearch';
import envConfig from '@review/config';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'reviewElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: `${envConfig.ELASTIC_SEARCH_URL}`
});

export async function checkConnection() {
  let isConnected = false;
  while (!isConnected) {
    logger.info('ReviewService connecting to ElasticSearch...');
    try {
      const health = await elasticSearchClient.cluster.health({});
      logger.info(`ReviewService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      logger.error('Connection to ElasticSearch failed. Retrying ...');
      logger.log({ level: 'error', message: `ReviewService checkConnection() method error: ${error}` });
    }
  }
}
