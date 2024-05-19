import { elasticSearchClient, getDocumentById } from '@auth/elasticsearch';
import { IHitsTotal, IPaginateProps, IQueryList, ISellerGig } from '@dtlee2k1/jobber-shared';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

export async function getSingeGig(index: string, gigId: string) {
  const gig: ISellerGig = await getDocumentById(index, gigId);
  return gig;
}

export async function gigsSearch(searchQuery: string, paginate: IPaginateProps, deliveryTime?: string, min?: number, max?: number) {
  const { from, size, type } = paginate;

  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: ['username', 'title', 'description', 'basicDescription', 'basicTitle', 'categories', 'subCategories'],
        query: `*${searchQuery}*`
      }
    },
    {
      term: {
        active: true
      }
    }
  ];

  // Filter by Delivery time
  if (deliveryTime !== 'undefined') {
    queryList.push({
      query_string: {
        fields: ['expectedDelivery'],
        query: `*${deliveryTime}*`
      }
    });
  }

  // Filter by range of prices
  if (!isNaN(parseInt(`${min}`)) && !isNaN(parseInt(`${max}`))) {
    queryList.push({
      range: {
        price: {
          gte: min,
          lte: max
        }
      }
    });
  }

  const result: SearchResponse = await elasticSearchClient.search({
    index: 'gigs',
    size,
    query: {
      bool: {
        must: [...queryList]
      }
    },
    sort: [
      {
        sortId: type === 'forward' ? 'asc' : 'desc'
      }
    ],
    ...(from !== '0' && { search_after: [from] })
  });
  const total: IHitsTotal = result.hits.total as IHitsTotal;

  return {
    total: total.value,
    hits: result.hits.hits
  };
}
