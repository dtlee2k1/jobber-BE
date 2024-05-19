import { ISellerGig, winstonLogger } from '@dtlee2k1/jobber-shared';
import { Client } from '@elastic/elasticsearch';
import envConfig from '@auth/config';
import { GetResponse } from '@elastic/elasticsearch/lib/api/types';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'authElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: `${envConfig.ELASTIC_SEARCH_URL}`
});

async function checkConnection() {
  let isConnected = false;
  while (!isConnected) {
    logger.info('AuthService connecting to ElasticSearch...');
    try {
      const health = await elasticSearchClient.cluster.health({});
      logger.info(`AuthService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      logger.error('Connection to ElasticSearch failed. Retrying ...');
      logger.log({ level: 'error', message: `AuthService checkConnection() method error: ${error}` });
    }
  }
}

async function checkIfIndexExist(indexName: string) {
  const result = await elasticSearchClient.indices.exists({ index: indexName });
  return result;
}

async function createIndex(indexName: string) {
  try {
    const result = await checkIfIndexExist(indexName);
    if (result) {
      logger.info(`Index '${indexName}' already exist`);
    } else {
      await elasticSearchClient.indices.create({ index: indexName });
      await elasticSearchClient.indices.refresh({ index: indexName });
      logger.info(`Created index ${indexName}`);
    }
  } catch (error) {
    logger.error(`An error occurred while creating the index ${indexName}`);
    logger.log({ level: 'error', message: `AuthService createIndex() method error: ${error}` });
  }
}

async function getDocumentById(indexName: string, gigId: string): Promise<ISellerGig> {
  try {
    const result: GetResponse = await elasticSearchClient.get({ index: indexName, id: gigId });
    return result._source as ISellerGig;
  } catch (error) {
    logger.log({ level: 'error', message: `AuthService elasticsearch getDocumentById() method error: ${error}` });
    return {} as ISellerGig;
  }
}

export { elasticSearchClient, checkConnection, createIndex, getDocumentById };
