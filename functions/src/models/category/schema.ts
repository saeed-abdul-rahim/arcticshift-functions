import { TimestampInterface, TimestampType } from '../common/schema'
import { Timestamp } from '../common'

export interface CategoryInterface extends TimestampInterface {
    shopId: string
    categoryId: string
    parentCategoryId: string
    name: string
    description: string
    imageUrl: string[]
    subCategoryId: string[]
    parentCategoryIds: string[]
    productCount: number
}

export type CategoryType = TimestampType & {
    shopId: string
    categoryId?: string
    parentCategoryId?: string
    name?: string
    description?: string
    imageUrl?: string[]
    subCategoryId?: string[]
    parentCategoryIds?: string[]
    productCount?: number
}

export class Category extends Timestamp implements CategoryInterface {
    shopId: string
    categoryId: string
    parentCategoryId: string
    name: string
    description: string
    imageUrl: string[]
    subCategoryId: string[]
    parentCategoryIds: string[]
    productCount: number

    constructor(data: CategoryType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.categoryId = data.categoryId ? data.categoryId : ''
        this.parentCategoryId = data.parentCategoryId ? data.parentCategoryId : ''
        this.name = data.name ? data.name : ''
        this.description = data.description ? data.description : ''
        this.imageUrl = data.imageUrl ? data.imageUrl : []
        this.subCategoryId = data.subCategoryId ? data.subCategoryId : []
        this.parentCategoryIds = data.parentCategoryIds ? data.parentCategoryIds : []
        this.productCount = data.productCount ? data.productCount : 0
    }

    get(): CategoryInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            categoryId: this.categoryId,
            parentCategoryId: this.parentCategoryId,
            name: this.name,
            description: this.description,
            imageUrl: this.imageUrl,
            subCategoryId: this.subCategoryId,
            parentCategoryIds: this.parentCategoryIds,
            productCount: this.productCount
        }
    }

}
