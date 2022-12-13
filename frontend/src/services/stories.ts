import queryString from 'query-string';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { API_URL } from '../constants'
import type { IArticle, IClusterPair, IListingResponse, IStory, IStoryArticleImport, IStoryArticleToggle, IStoryBase } from '../types'

export const storiesApi = createApi({
  reducerPath: 'storiesApi',
  tagTypes: ['Story', 'Article', "Cluster", "Link"],
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    fetchStory: builder.query<IStory, string>({
      query: (articleId) => `stories/${articleId}`,
      providesTags: ["Story"]
    }),
    fetchStoryListing: builder.query<IListingResponse<IStory>, any>({
      query: (params) => queryString.stringifyUrl({
        'url': `stories`,
        'query': params
      }),
      providesTags: ["Story"]
    }),
    fetchStoryPairs: builder.query<IListingResponse<IClusterPair>, any>({
      query: ({ storyId, params }) => queryString.stringifyUrl({
        'url': `stories/${storyId}/pairs`,
        'query': params
      }),
      providesTags: ["Story", "Cluster", "Link"]
    }),
    fetchStoryGraph: builder.query<string, any>({
      query: ({ storyId, params }) => ({
        url: queryString.stringifyUrl({
          'url': `stories/${storyId}/gexf`,
          'query': params
        }),
        responseHandler: (response) => response.text(),
      }),
      providesTags: ["Story", "Cluster", "Link"],

    }),
    createStory: builder.mutation<IStory, IStoryBase>({
      query(story) {
        return {
          url: `stories`,
          method: 'POST',
          body: story,
        }
      },
      invalidatesTags: ['Story'],
    }),
    toggleStoryArticle: builder.mutation<IStory, IStoryArticleToggle>({
      query(data) {
        return {
          url: `stories/${data.story}/articles`,
          method: 'POST',
          body: { article: data.article },
        }
      },
      invalidatesTags: ['Story', 'Article'],
    }),
    importStoryArticle: builder.mutation<IArticle, IStoryArticleImport>({
      query(data) {
        return {
          url: `stories/${data.story}/articles/import-url`,
          method: 'POST',
          body: { url: data.url },
        }
      },
      invalidatesTags: ['Story', 'Article'],
    }),
  }),
})

export const { useFetchStoryListingQuery, useFetchStoryQuery, useFetchStoryGraphQuery, useCreateStoryMutation, useToggleStoryArticleMutation, useImportStoryArticleMutation, useFetchStoryPairsQuery } = storiesApi