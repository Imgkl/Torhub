import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { Torrent } from "../services/torrentApi";
import { getTorrentHealth } from "../utils/formatters";
import { getCategoryIconAndTextFromId } from "../utils/tpb-category";

interface TorrentListItemProps {
  torrent: Torrent;
  index: number;
}

export function TorrentListItem({ torrent, index }: TorrentListItemProps) {
  const health = getTorrentHealth(torrent.seeders);

  let healthIcon = { source: Icon.CircleFilled, tintColor: Color.Red };
  if (health === "excellent") {
    healthIcon = { source: Icon.CircleFilled, tintColor: Color.Green };
  } else if (health === "good") {
    healthIcon = { source: Icon.CircleFilled, tintColor: Color.Yellow };
  } else if (health === "fair") {
    healthIcon = { source: Icon.CircleFilled, tintColor: Color.Orange };
  }

  const metadata = (
    <List.Item.Detail
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Title" text={torrent.title} />
          {torrent.size && <List.Item.Detail.Metadata.Label title="Size" text={torrent.size} />}
          {torrent.imdbRating && (
            <List.Item.Detail.Metadata.Label title="IMDB Rating" text={`⭐ ${torrent.imdbRating}`} />
          )}
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Seeders" text={torrent.seeders.toString()} />
          <List.Item.Detail.Metadata.Label title="Leechers" text={torrent.leechers.toString()} />
          <List.Item.Detail.Metadata.Label
            title="Category"
            text={getCategoryIconAndTextFromId(torrent.category ?? "Other").text}
          />
          {torrent.dateUploaded && <List.Item.Detail.Metadata.Label title="Uploaded" text={torrent.dateUploaded} />}
          {torrent.year && <List.Item.Detail.Metadata.Label title="Year" text={torrent.year} />}
          <List.Item.Detail.Metadata.Label title="Source" text={torrent.website} />
        </List.Item.Detail.Metadata>
      }
      markdown={torrent.thumbnail ? `![${torrent.title}](${torrent.thumbnail})` : `Image not available`}
    />
  );

  return (
    <List.Item
      key={index}
      title={torrent.title}
      icon={healthIcon}
      subtitle={torrent.website}
      accessories={torrent.category ? [{ icon: getCategoryIconAndTextFromId(torrent.category).icon }] : []}
      detail={metadata}
      actions={
        <ActionPanel>
          <Action.Open title="Open Magnet URL" target={torrent.magnetUrl} icon={Icon.Download} />
          <Action.CopyToClipboard title="Copy Magnet URL" content={torrent.magnetUrl} />
        </ActionPanel>
      }
    />
  );
}
