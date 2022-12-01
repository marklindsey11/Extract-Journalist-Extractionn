from typing import Generator, List, Optional
from fastapi import APIRouter, Depends, Path, Query
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware

from storyweb.ontology import OntologyModel, ontology
from storyweb.db import engine, Conn
from storyweb.logic.articles import fetch_article, list_articles, list_sites
from storyweb.logic.clusters import (
    fetch_cluster,
    list_clusters,
    list_related,
    list_similar,
    merge_cluster,
    explode_cluster,
    untag_article,
)
from storyweb.logic.links import (
    create_link,
    list_links,
    untag_article,
)
from storyweb.logic.stories import (
    list_stories,
    fetch_story,
    create_story,
    toggle_story_article,
)
from storyweb.routes.util import get_conn, get_listing
from storyweb.models import (
    Article,
    ArticleDetails,
    StoryCreate,
    StoryArticleToggle,
    Story,
    Cluster,
    ClusterDetails,
    Link,
    LinkBase,
    Listing,
    ListingResponse,
    MergeRequest,
    ExplodeRequest,
    UntagRequest,
    RelatedCluster,
    SimilarCluster,
    Site,
)

router = APIRouter()


@router.get("/links", response_model=ListingResponse[Link])
def links_index(
    conn: Conn = Depends(get_conn),
    listing: Listing = Depends(get_listing),
    cluster: List[str] = Query([]),
):
    clusters = [i for i in cluster if i is not None and len(i.strip())]
    return list_links(conn, listing, clusters)


@router.post("/links", response_model=Link)
def links_save(
    link: LinkBase,
    conn: Conn = Depends(get_conn),
):
    # * make a link (any type)
    #   * see all sentences that mention both tags/identities
    #   * pick a relationship type
    result = create_link(conn, link.source, link.target, link.type)
    return result


@router.post("/links/_merge", response_model=ClusterDetails)
def merge_cluster_save(
    data: MergeRequest,
    conn: Conn = Depends(get_conn),
):
    cluster = merge_cluster(conn, data.anchor, data.other)
    return fetch_cluster(conn, cluster)


@router.post("/links/_explode", response_model=ClusterDetails)
def explode_cluster_save(
    data: ExplodeRequest,
    conn: Conn = Depends(get_conn),
):
    cluster = explode_cluster(conn, data.cluster)
    return fetch_cluster(conn, cluster)


@router.post("/links/_untag", response_model=ClusterDetails)
def untag_article_save(
    data: UntagRequest,
    conn: Conn = Depends(get_conn),
):
    cluster = untag_article(conn, data.cluster, data.article)
    return fetch_cluster(conn, cluster)
