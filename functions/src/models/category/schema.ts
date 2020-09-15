import { TimestampInterface, TimestampType, ContentStorage } from '../common/schema'
import { Timestamp } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

export interface CategoryInterface extends TimestampInterface {
    shopId: string
    categoryId: string
    parentCategoryId: string
    name: string
    description: string
    images: ContentStorage[]
    subCategoryId: string[]
    parentCategoryIds: string[]
    productId: string[]
}

export type CategoryType = TimestampType & {
    shopId?: string
    categoryId?: string
    parentCategoryId?: string
    name?: string
    description?: string
    images?: ContentStorage[]
    subCategoryId?: string[]
    parentCategoryIds?: string[]
    productId?: string[]
}

export class Category extends Timestamp implements CategoryInterface {
    shopId: string
    categoryId: string
    parentCategoryId: string
    name: string
    description: string
    images: ContentStorage[]
    subCategoryId: string[]
    parentCategoryIds: string[]
    productId: string[]

    constructor(data: CategoryType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.categoryId = data.categoryId ? data.categoryId : ''
        this.parentCategoryId = data.parentCategoryId ? data.parentCategoryId : ''
        this.name = data.name ? data.name : ''
        this.description = data.description ? data.description : ''
        this.images = data.images ? data.images : []
        this.subCategoryId = data.subCategoryId ? uniqueArr(data.subCategoryId) : []
        this.parentCategoryIds = data.parentCategoryIds ? uniqueArr(data.parentCategoryIds) : []
        this.productId = data.productId ? data.productId : []
    }

    get(): CategoryInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            categoryId: this.categoryId,
            parentCategoryId: this.parentCategoryId,
            name: this.name,
            description: this.description,
            images: this.images,
            subCategoryId: this.subCategoryId,
            parentCategoryIds: this.parentCategoryIds,
            productId: this.productId
        }
    }

}
