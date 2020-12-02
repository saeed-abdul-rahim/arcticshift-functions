import { ContentStorage } from "../models/common/schema"

export function createManifest(name: string, images: ContentStorage[]): string {
    return JSON.stringify({
        name,
        short_name: name,
        theme_color: '#1F2937',
        background_color: '#F9FAFB',
        display: 'standalone',
        icons: [
            getIcon(images, 72),
            getIcon(images, 96),
            getIcon(images, 128),
            getIcon(images, 144),
            getIcon(images, 152),
            getIcon(images, 192),
            getIcon(images, 384),
            getIcon(images, 512)
        ]
    } as Manifest)
}

function getIcon(images: ContentStorage[], size: number) {
    return {
        src: images.find(image => image.dimension === size)?.url || '',
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'maskable any'
    } as ManifestIcon
}

type Manifest = {
    name: string
    short_name: string
    theme_color: string
    background_color: string
    display: string
    icons: ManifestIcon[]
}

type ManifestIcon = {
    src: string
    sizes: ManifestIconSize
    type: 'image/png'
    purpose: string
}

type ManifestIconSize = '72x72' | '96x96' | '128x128' | '144x144' | '152x152' | '192x192' | '384x384' | '512x512'
