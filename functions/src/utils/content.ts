import { Content } from "../models/common/schema";

export function getThumbnail(content: Content, size: number) {
    const { thumbnails } = content
    return thumbnails.find(thumbnail => thumbnail.dimension === size)
}
