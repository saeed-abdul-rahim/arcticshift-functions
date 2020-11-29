import { Content } from "../../models/common/schema";

export function getImage(images: Content[], type: 'logo' | 'longLogo') {
    if (images && images.length > 0) {
        return images.find(i => i.id === type)
    }
    return undefined
}