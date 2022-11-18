import { ControlGroup, Classes, HTMLTable, Button, Checkbox } from '@blueprintjs/core';
import classnames from "classnames";
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import { ErrorSection, Numeric, SectionLoading, TagType } from '../components/util';

import { useFetchClusterListingQuery, useMergeClustersMutation } from '../services/clusters';
import { asString, getClusterLink, listToggle } from "../util";

export default function ClusterIndex() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(asString(params.get('q')) || '');
  const [merges, setMerges] = useState([] as string[]);
  const [postMerge, { isLoading: isUpdating }] = useMergeClustersMutation();
  const { data: listing, error } = useFetchClusterListingQuery({
    q: params.get('q')
  });

  const onMerge = async () => {
    if (merges.length > 1) {
      const [anchor, ...other] = merges;
      const response = await postMerge({ anchor: anchor, other: other }).unwrap()
      setMerges([]);
    }
  }

  const toggleMerge = async (id: string) => {
    setMerges(listToggle(merges, id));
  }

  const onSubmit = function (e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setParams({ q: query });
  }

  if (error !== undefined) {
    return <ErrorSection title="Cannot get cluster listing" />
  }

  return (
    <div>
      {listing === undefined && (
        <h1>Entities in the StoryWeb database</h1>
      )}
      {listing !== undefined && (
        <h1><Numeric value={listing.total} /> entities in the StoryWeb database</h1>
      )}

      <section className="section">
        <form onSubmit={onSubmit}>
          <ControlGroup fill>
            <input
              className={classnames(Classes.INPUT, Classes.FILL)}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entities..."
            />
            <Button type="submit">Search</Button>
          </ControlGroup>
        </form>
      </section>
      {listing === undefined && (
        <SectionLoading />
      )}
      {listing !== undefined && (
        <HTMLTable condensed bordered className="wide">
          <thead>
            <tr>
              <th>Label</th>
              <th>Type</th>
              <th className="numeric">Articles</th>
              <th>
                <Button small onClick={onMerge} disabled={merges.length < 2}>
                  Merge
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {listing.results.map((cluster) => (
              <tr key={cluster.id}>
                <td>
                  <Link to={getClusterLink(cluster)}>{cluster.label}</Link>
                </td>
                <td><TagType type={cluster.type} /></td>
                <td className="numeric">
                  <Numeric value={cluster.articles} />
                </td>
                <td>
                  <Checkbox
                    checked={merges.indexOf(cluster.id) !== -1}
                    onClick={() => toggleMerge(cluster.id)}
                    disabled={isUpdating}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      )}
    </div>
  )
}
