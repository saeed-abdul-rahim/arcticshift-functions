const getSymbolFromCurrency = require('currency-symbol-map')
import { URL } from '../../config'
import { COLLECTION, IMAGE_FONT, IMAGE_L } from '../../config/constants';
import { getImage } from '../../controllers/storage/helper';
import { CategoryInterface } from '../../models/category/schema';
import { CollectionInterface } from '../../models/collection/schema';
import { ContentStorage } from '../../models/common/schema';
import { OrderInterface } from "../../models/order/schema";
import { GeneralSettingInterface } from '../../models/settings/schema';
import { getThumbnail } from '../../utils/content';
import { urlEncode } from '../../utils/strUtils';
import { banner } from './partials/banner';
import { categoryLabels } from './partials/categoryLabels';
import { divider } from './partials/divider';
import { footer } from './partials/footer';
import { headContent } from './partials/headContent';
import { header } from './partials/header';
import { itemList } from './partials/orderItemList';
import { social } from './partials/social';
import { success } from './partials/success';

export const orderPlacedHTML = (settings: GeneralSettingInterface, order: OrderInterface, collection?: CollectionInterface, categories?: CategoryInterface[]) => {
    const { base: homeUrl } = URL
    const { currency, images, name: shopName, facebook, twitter, instagram } = settings
    const longLogo = getImage(images, 'longLogo')
    const currencySymbol = getSymbolFromCurrency(currency)
    const { data, total, saleDiscount, voucherDiscount, taxCharge, shippingCharge } = order

    let logoContent: ContentStorage | undefined = undefined
    let productList = ''
    let saleDiscountStr = ''
    let voucherDiscountStr = ''
    let taxChargeStr = ''
    let shippingChargeStr = ''

    let collectionName = ''
    let collectionLink = ''
    let collectionImageLink = ''

    if (longLogo) {
        const image = getThumbnail(longLogo, IMAGE_FONT)
        if (image) {
            logoContent = image
        }
    }
    if (collection) {
        collectionName = collection.name
        collectionLink = `${URL.base}/${COLLECTION}/${urlEncode(collectionName)}/${collection.collectionId}`
        if (collection.images.length > 0) {
            const collectionImage = collection.images[0]
            collectionImageLink = getThumbnail(collectionImage, IMAGE_L)?.url || ''
        }
    }
    if (data && data.productsData) {
        const { productsData } = data
        productsData.forEach(product => {
            const { baseProduct, orderQuantity, price, name: variantName } = product
            const { name: productName, productId} = baseProduct
            const productLink = `${homeUrl}/${productName}/${productId}`
            productList += itemList(productName, currencySymbol, price, productLink, orderQuantity, variantName)
        })
    }
    if (saleDiscount > 0) {
        saleDiscountStr = itemList('Sale Discount', currencySymbol, saleDiscount)
    }
    if (voucherDiscount > 0) {
        voucherDiscountStr = itemList('Voucher', currencySymbol, voucherDiscount)
    }
    if (taxCharge > 0) {
        taxChargeStr = itemList('Taxes', currencySymbol, taxCharge)
    }
    if (shippingCharge > 0) {
        shippingChargeStr = itemList('Shipping Charge', currencySymbol, shippingCharge)
    }
    return `
    <!DOCTYPE html
        PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:v="urn:schemas-microsoft-com:vml">

    ${headContent}

    <body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #FFFFFF;">
        <!--[if IE]><div class="ie-browser"><![endif]-->
        <table bgcolor="#FFFFFF" cellpadding="0" cellspacing="0" class="nl-container" role="presentation"
            style="table-layout: fixed; vertical-align: top; min-width: 320px; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF; width: 100%;"
            valign="top" width="100%">
            <tbody>
                <tr style="vertical-align: top;" valign="top">
                    <td style="word-break: break-word; vertical-align: top;" valign="top">
                        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color:#FFFFFF"><![endif]-->
                        
                        <!-- HEADER -->
                        ${header(logoContent, true)}

                        <!-- DIVIDER -->
                        ${divider(true)}

                        ${success('Thank you for placing your order', 'with our store!', 'This email is to confirm your recent order.')}

                        <div style="background-color:transparent;">
                            <div class="block-grid mixed-two-up"
                                style="min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: #4b5563;">
                                <div style="border-collapse: collapse;display: table;width: 100%;background-color:#4b5563;">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:480px"><tr class="layout-full-width" style="background-color:#4b5563"><![endif]-->
                                    <!--[if (mso)|(IE)]><td align="center" width="320" style="background-color:#4b5563;width:320px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:0px;"><![endif]-->
                                    <div class="col num8"
                                        style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 320px; width: 320px;">
                                        <div class="col_cont" style="width:100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div
                                                style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:0px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
                                                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 20px; padding-left: 20px; padding-top: 10px; padding-bottom: 10px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
                                                <div
                                                    style="color:#FFFFFF;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:10px;padding-right:20px;padding-bottom:10px;padding-left:20px;">
                                                    <div
                                                        style="font-size: 12px; line-height: 1.2; color: #FFFFFF; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
                                                        <p
                                                            style="font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin: 0;">
                                                            PRODUCTS</p>
                                                    </div>
                                                </div>
                                                <!--[if mso]></td></tr></table><![endif]-->
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                    <!--[if (mso)|(IE)]></td><td align="center" width="160" style="background-color:#4b5563;width:160px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:0px;"><![endif]-->
                                    <div class="col num4"
                                        style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 160px; width: 160px;">
                                        <div class="col_cont" style="width:100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div
                                                style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:0px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
                                                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 20px; padding-left: 20px; padding-top: 10px; padding-bottom: 10px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
                                                <div
                                                    style="color:#FFFFFF;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:10px;padding-right:20px;padding-bottom:10px;padding-left:20px;">
                                                    <div
                                                        style="font-size: 12px; line-height: 1.2; color: #FFFFFF; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
                                                        <p
                                                            style="font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin: 0;">
                                                            <span style="font-size: 14px;">PRICE</span><br /></p>
                                                    </div>
                                                </div>
                                                <!--[if mso]></td></tr></table><![endif]-->
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>

                        <!-- PRODUCT LIST -->
                        ${productList}

                        <!-- SALE DISCOUNT -->
                        ${saleDiscountStr}

                        <!-- TAXES -->
                        ${taxChargeStr}

                        <!-- SHIPPING CHARGE -->
                        ${shippingChargeStr}

                        <!-- VOUCHER -->
                        ${voucherDiscountStr}

                        <!-- DIVIDER -->
                        ${divider()}

                        <!-- TOTAL -->
                        <div style="background-color:transparent;">
                            <div class="block-grid mixed-two-up"
                                style="min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: #FFFFFF;">
                                <div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:480px"><tr class="layout-full-width" style="background-color:#FFFFFF"><![endif]-->
                                    <!--[if (mso)|(IE)]><td align="center" width="320" style="background-color:#FFFFFF;width:320px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:0px;"><![endif]-->
                                    <div class="col num8"
                                        style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 320px; width: 320px;">
                                        <div class="col_cont" style="width:100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div
                                                style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
                                                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 20px; padding-left: 20px; padding-top: 5px; padding-bottom: 5px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
                                                <div
                                                    style="color:#1f2937;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:5px;padding-right:20px;padding-bottom:5px;padding-left:20px;">
                                                    <div
                                                        style="font-size: 12px; line-height: 1.2; color: #1f2937; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
                                                        <p
                                                            style="font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin: 0;">
                                                            <strong>TOTAL</strong><br /></p>
                                                    </div>
                                                </div>
                                                <!--[if mso]></td></tr></table><![endif]-->
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                    <!--[if (mso)|(IE)]></td><td align="center" width="160" style="background-color:#FFFFFF;width:160px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:0px;"><![endif]-->
                                    <div class="col num4"
                                        style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 160px; width: 160px;">
                                        <div class="col_cont" style="width:100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div
                                                style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
                                                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 20px; padding-left: 20px; padding-top: 5px; padding-bottom: 5px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
                                                <div
                                                    style="color:#1f2937;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:5px;padding-right:20px;padding-bottom:5px;padding-left:20px;">
                                                    <div
                                                        style="font-size: 12px; line-height: 1.2; color: #1f2937; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
                                                        <p
                                                            style="font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin: 0;">
                                                            <strong>${currencySymbol + total}</strong></p>
                                                    </div>
                                                </div>
                                                <!--[if mso]></td></tr></table><![endif]-->
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>
                        
                        <!-- DIVIDER -->
                        ${divider()}

                        ${collection ? banner(collectionName, collectionLink, collectionImageLink) + divider() : ''}

                        ${categories ? categoryLabels(categories) + divider() : ''}

                        ${social(facebook, twitter, instagram)}

                        <!-- FOOTER -->
                        ${footer(shopName)}

                        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                    </td>
                </tr>
            </tbody>
        </table>
        <!--[if (IE)]></div><![endif]-->
    </body>

    </html>
    `
}
