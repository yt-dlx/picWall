import { ImageMetadata } from "../types/database";

function createPreviewLink(img: ImageMetadata) {
  return `https://raw.githubusercontent.com/yt-dlx/picWall/${img.branch}/${img.folder}/min/${img.original_file_name}`;
}
function createDownloadLink(img: ImageMetadata) {
  return `https://github.com/yt-dlx/picWall/blob/${img.branch}/${img.folder}/min/${img.original_file_name}`;
}

export { createPreviewLink, createDownloadLink };
