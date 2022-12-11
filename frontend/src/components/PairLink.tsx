import { Icon } from "@blueprintjs/core";
import { Link } from "react-router-dom";
import { IClusterBase } from "../types";
import { getLinkLoomLink } from "../util";
import { LinkType, SpacedList } from "./util";

type PairLinkProps = {
  left: IClusterBase,
  right: IClusterBase,
  link_types: string[]
}

export default function PairLink({ left, right, link_types }: PairLinkProps) {
  return (
    <>
      <Link to={getLinkLoomLink(left, right)}>
        <SpacedList values={link_types.map(t => <LinkType type={t} />)} />
        {link_types.length === 0 && (
          <Icon icon="new-link" />
        )}
      </Link>
    </>
  )
}