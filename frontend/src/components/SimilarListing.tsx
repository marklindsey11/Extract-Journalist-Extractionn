import { Button, ButtonGroup, Checkbox, HTMLTable, Intent, NonIdealState } from "@blueprintjs/core"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useFetchSimilarClusterListingQuery, useMergeClustersMutation } from "../services/clusters"
import { ICluster } from "../types"
import { getClusterLink, listToggle } from "../util"
import { SectionLoading, SpacedList, TagType, TagLabel } from "./util"

type SimilarListingProps = {
  cluster: ICluster,
}

export default function SimilarListing({ cluster }: SimilarListingProps) {
  const { data: listing, isLoading } = useFetchSimilarClusterListingQuery({ clusterId: cluster.id, params: {} });
  const navigate = useNavigate();
  const [postMerge, { isLoading: isUpdating }] = useMergeClustersMutation();
  const [merges, setMerges] = useState([] as string[]);

  if (listing === undefined || isLoading) {
    return <SectionLoading />
  }
  const allSelected = merges.length === listing.results.length;

  const onMerge = async () => {
    const response = await postMerge({ anchor: cluster.id, other: merges }).unwrap()
    setMerges([]);
    if (response.id !== cluster.id) {
      navigate(`/clusters/${response.id}`);
    }
  }

  const toggleAll = async () => {
    if (allSelected) {
      setMerges([]);
    } else {
      setMerges(listing.results.map(r => r.id));
    }
  }

  const toggleOne = async (id: string) => {
    setMerges(listToggle(merges, id));
  }

  return (
    <>
      <ButtonGroup>
        <Button
          disabled={merges.length === 0 || isUpdating}
          onClick={() => onMerge()}
          intent={Intent.PRIMARY}
        >
          Merge ({merges.length})
        </Button>
        <Button
          onClick={() => toggleAll()}
          disabled={isUpdating}
        >
          {allSelected && <>Select none</>}
          {!allSelected && <>Select all</>}
        </Button>
      </ButtonGroup>
      {listing.total < 1 && (
        <NonIdealState
          icon="heart-broken"
          title="No similar entities"
          description="There are no un-linked entities in other articles with the same name."
        />
      )}
      {listing.total > 0 && (
        <HTMLTable condensed bordered className="wide">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Common tags</th>
              <th>Count</th>
              <th>Same</th>
            </tr>
          </thead>
          <tbody>
            {listing.results.map((similar) => (
              <tr key={similar.id}>
                <td>
                  <Link to={getClusterLink(similar)}>{similar.label}</Link>
                </td>
                <td><TagType type={similar.type} /></td>
                <td>
                  <SpacedList values={similar.common.map((l) => <TagLabel key={l} label={l} />)} />
                </td>
                <td>
                  {similar.common_count}
                </td>
                <td>
                  <Checkbox
                    checked={merges.indexOf(similar.id) !== -1}
                    onClick={() => toggleOne(similar.id)}
                    disabled={isUpdating}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      )}

      {/* <code>{listing.debug_msg}</code> */}
    </>
  )
}