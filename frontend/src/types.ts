
export interface IResponse {
  status: string
  debug_msg?: string
}

export interface IListingResponse<T> extends IResponse {
  limit: number
  offset: number
  total: number
  results: T[]
}

export interface IArticle {
  id: string
  title: string
  site: string
  url: string
  language: string
  tags: number
  mentions: number
}

export interface IArticleDetails extends IArticle {
  text: string
}

export interface IStoryBase {
  title: string
}

export interface IStory extends IStoryBase {
  id: number
}

export interface IStoryArticleToggle {
  story: number
  article: string
}

export interface IStoryArticleImport {
  story: number
  url: string
}

export interface IClusterBase {
  id: string
  label: string
  type: string
}

// export interface ITag extends IClusterBase {
//   cluster: string
//   article: string
//   fingerprint: string
//   count: number
// }

// export interface IArticleTag extends IClusterBase {
//   article: IArticle
//   cluster: string
//   fingerprint: string
//   count: number
//   link_type?: string
// }

export interface ICluster extends IClusterBase {
  articles: number
}

export interface IClusterDetails extends ICluster {
  labels: string[]
}

export interface IClusterPair {
  left: IClusterBase,
  right: IClusterBase,
  link_types: string[]
  articles: number
}

export interface IRelatedCluster extends IClusterBase {
  articles: number
  link_types: string[]
}

export interface ISimilarCluster extends IClusterBase {
  common: string[]
  common_count: number
}

export interface IClusterMerge {
  anchor: string
  other: string[]
}

export interface IUntagArticle {
  cluster: string
  article: string
}

export interface ISite {
  site: string
  articles: number
}

export interface ILink {
  source: string
  source_cluster: string
  target: string
  target_cluster: string
  type: string
  user?: string
  timestamp?: string
}

export interface ILinkType {
  name: string
  directed: boolean
  label: string
  phrase: string
  source_type: string
  target_type: string
}

export interface IClusterType {
  name: string
  label: string
  plural: string
  parent?: string
}

export interface IOntology {
  link_types: ILinkType[]
  cluster_types: IClusterType[]
}
