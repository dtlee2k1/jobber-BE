import { winstonLogger } from '@dtlee2k1/jobber-shared';
import { Client } from '@elastic/elasticsearch';
import { envConfig } from '@gateway/config';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'apiGatewayElasticSearchConnection', 'debug');

class ElasticSearch {
  private elasticSearchClient: Client;

  constructor() {
    this.elasticSearchClient = new Client({
      node: `${envConfig.ELASTIC_SEARCH_URL}`
    });
  }

  public async checkConnection() {
    let isConnected = false;
    while (!isConnected) {
      logger.info('ApiGatewayService connecting to ElasticSearch...');
      try {
        const health = await this.elasticSearchClient.cluster.health({});
        logger.info(`ApiGatewayService Elasticsearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        logger.error('Connection to ElasticSearch failed. Retrying ...');
        logger.log({ level: 'error', message: `ApiGatewayService checkConnection() method error: ${error}` });
      }
    }
  }
}

const elasticSearch = new ElasticSearch();
export default elasticSearch;
