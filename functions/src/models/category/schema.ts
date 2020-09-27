import { Common, CommonInterface, CommonType, ContentStorage, Condition } from '../common/schema'
import { uniqueArr } from '../../utils/uniqueArr'

export interface CategoryInterface extends CommonInterface {
    shopId: string
    categoryId: string
    parentCategoryId: string
    name: string
    description: string
    images: ContentStorage[]
    subCategoryId: string[]
    parentCategoryIds: string[]
    productId: string[]
    saleDiscountId: string
    voucherId: string
}

export type CategoryType = CommonType & {
    shopId?: string
    categoryId?: string
    parentCategoryId?: string
    name?: string
    description?: string
    images?: ContentStorage[]
    subCategoryId?: string[]
    parentCategoryIds?: string[]
    productId?: string[]
    saleDiscountId?: string
    voucherId?: string
}

export class Category extends Common implements CategoryInterface {
    shopId: string
    categoryId: string
    parentCategoryId: string
    name: string
    description: string
    images: ContentStorage[]
    subCategoryId: string[]
    parentCategoryIds: string[]
    productId: string[]
    saleDiscountId: string
    voucherId: string

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
        this.saleDiscountId = data.saleDiscountId ? data.saleDiscountId : ''
        this.voucherId = data.voucherId ? data.voucherId : ''
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
            productId: this.productId,
            saleDiscountId: this.saleDiscountId,
            voucherId: this.voucherId
        }
    }

}

export type CategoryCondition = Condition & {
    field: CategoryFields
    parentFields?: (keyof CategoryType)[]
}

type CategoryFields = keyof (CategoryType & ContentStorage)
