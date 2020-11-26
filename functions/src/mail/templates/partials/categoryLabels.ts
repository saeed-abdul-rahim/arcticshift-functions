import { URL } from "../../../config"
import { CATEGORY } from "../../../config/constants"
import { CategoryInterface } from "../../../models/category/schema"
import { urlEncode } from "../../../utils/strUtils"

export const categoryLabels = (categories: CategoryInterface[]) => {

    const rowLimit = Math.ceil(categories.length / 2)
    const categorySet1 = categories.slice(0, rowLimit)
    const categorySet2 = categories.slice(rowLimit, rowLimit)
    const col1 = getCategoryLabel(categorySet1)
    const col2 = getCategoryLabel(categorySet2)
    
    return `
    <div style="background-color:transparent;">
        <div class="block-grid two-up"
            style="min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: transparent;">
            <div
                style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:480px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="240" style="background-color:transparent;width:240px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
                <div class="col num6"
                    style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 240px; width: 240px;">
                    <div class="col_cont" style="width:100% !important;">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                            style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
                            <!--<![endif]-->
                            ${col1}
                            <!--[if (!mso)&(!IE)]><!-->
                        </div>
                        <!--<![endif]-->
                    </div>
                </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                <!--[if (mso)|(IE)]></td><td align="center" width="240" style="background-color:transparent;width:240px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
                <div class="col num6"
                    style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 240px; width: 240px;">
                    <div class="col_cont" style="width:100% !important;">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                            style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
                            <!--<![endif]-->
                            ${col2}
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
    `
}

const itemLabel = (name: string, link: string) => `
    <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 15px; padding-left: 15px; padding-top: 15px; padding-bottom: 15px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
    <div
        style="color:#1f2937;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:15px;padding-right:15px;padding-bottom:15px;padding-left:15px;">
        <div
            style="font-size: 12px; line-height: 1.2; color: #1f2937; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
            <p
                style="font-size: 12px; line-height: 1.2; text-align: center; word-break: break-word; mso-line-height-alt: 14px; margin: 0;">
                <span style="color: #1F2937; font-size: 12px;"><a
                        href="${link}"
                        style="text-decoration: none; color: #1F2937;"
                        target="_blank">${(name)}</a></span></p>
        </div>
    </div>
    <!--[if mso]></td></tr></table><![endif]-->
`

const getCategoryLabel = (categories: CategoryInterface[]) => {
    let content = ''
    categories.forEach(category => {
        const { name, categoryId } = category
        const url = `${URL.base}/${CATEGORY}/${urlEncode(name)}/${categoryId}`
        content += itemLabel(name.toUpperCase(), url)
    })
    return content
}
