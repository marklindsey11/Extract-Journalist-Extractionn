
import { ILink } from '../types';
import { FormEvent, useEffect, useState } from 'react';
import { getClusterLink } from '..//util';
import { Button, HotkeyConfig, HotkeysTarget2, RadioGroup } from '@blueprintjs/core';
import { useFetchClusterQuery } from '../services/clusters';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SectionLoading, TagType } from '../components/util';
import { useFetchOntologyQuery } from '../services/ontology';
import { useFetchLinksQuery, useSaveLinkMutation } from '../services/links';
import ArticleCorefList from '../components/ArticleCorefList';
import ArticlePreview from '../components/ArticlePreview';

import styles from '../styles/Linker.module.scss';

export default function Linker() {
  const navigate = useNavigate();
  const { data: ontology } = useFetchOntologyQuery();
  const [params] = useSearchParams();
  const anchorId = params.get('anchor');
  const otherId = params.get('other');
  const articleId = params.get('article');
  const relatedMode = params.get('related') !== null;
  if (anchorId === null) {
    navigate('/clusters');
  }
  if (otherId === null) {
    navigate(`/clusters/${anchorId}`);
  }
  const [link, setLink] = useState({
    source: anchorId,
    target: otherId,
    type: 'UNRELATED'
  } as ILink);
  const { data: anchor, isLoading: anchorLoading } = useFetchClusterQuery(anchorId || '');
  const { data: other, isLoading: otherLoading } = useFetchClusterQuery(otherId || '');
  const linkParams = { cluster: [anchorId, otherId], limit: 1 }
  const { data: linksListing } = useFetchLinksQuery(linkParams);
  const [saveLink, { isLoading: isSaving }] = useSaveLinkMutation()

  useEffect(() => {
    if (linksListing !== undefined && linksListing.results.length) {
      setLink((l) => ({ ...l, type: linksListing.results[0].type }))
    }
  }, [linksListing]);

  if (anchor === undefined || other === undefined || linksListing === undefined ||
    anchorLoading || otherLoading || ontology === undefined || isSaving) {
    return <SectionLoading />
  }

  const linkType = ontology.link_types.find((lt) => lt.name === link.type) || ontology.link_types[0]
  const linkOptions = ontology.link_types.map(l => ({ value: l.name, label: l.label }));
  const source = link.source === anchorId ? anchor : other;
  const target = link.target === anchorId ? anchor : other;

  const save = async function () {
    const saved = await saveLink(link).unwrap();
    const newAnchor = link.source === anchorId ? saved.source_cluster : saved.target_cluster;
    if (relatedMode) {
      navigate(`/linker/related?anchor=${newAnchor}&previous=${otherId}`);
    } else {
      navigate(`/clusters/${newAnchor}`)
    }
  }

  const onSubmit = async function (event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await save()
  }

  const onFlip = function () {
    setLink({ ...link, source: link.target, target: link.source })
  }

  const onChangeType = (event: FormEvent<HTMLInputElement>) => {
    setLink({ ...link, type: event.currentTarget.value })
  }

  const loomHotkeys: HotkeyConfig[] = [
    {
      combo: "s",
      group: "Link editor",
      global: true,
      label: "Same",
      onKeyDown: async () => {
        setLink({ ...link, type: 'SAME' });
        await save()
      },
    },
    {
      combo: "u",
      group: "Link editor",
      global: true,
      label: "Unrelated",
      onKeyDown: async () => {
        setLink({ ...link, type: 'UNRELATED' });
        await save()
      },
    },
    {
      combo: "f",
      group: "Link editor",
      global: true,
      label: "Flip direction",
      onKeyDown: onFlip,
    },
  ];

  return (
    <div>
      <HotkeysTarget2 hotkeys={loomHotkeys}>
        <>
          <h3>
            <strong>
              <TagType type={source.type} />
              {' '}
              <Link to={getClusterLink(source)}>{source.label}</Link>
            </strong>
            {' '}
            {linkType.phrase}
            {' '}
            <strong>
              <TagType type={target.type} />
              {' '}
              <Link to={getClusterLink(target)}>{target.label}</Link>
            </strong>
          </h3>
          <div className="page-column-area">
            <div className="page-column">
              <form onSubmit={onSubmit}>
                <RadioGroup
                  label="Link type"
                  name="type"
                  onChange={onChangeType}
                  selectedValue={link.type}
                  options={linkOptions}
                >
                </RadioGroup>
                <Button type="submit">Save</Button>
                <Button onClick={onFlip}>Flip direction</Button>
              </form>
            </div>
            <div className="page-column">
              <ArticleCorefList clusters={[source.id, target.id]} />
            </div>
            <div className="page-column">
              {articleId && (
                <div className={styles.articlePreview}>
                  <ArticlePreview articleId={articleId} tags={[anchor.labels, other.labels]} />
                </div>
              )}
            </div>
          </div>
        </>
      </HotkeysTarget2>
    </div>
  )
}
