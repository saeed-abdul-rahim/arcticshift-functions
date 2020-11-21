import { ContentStorage } from "../../../models/common/schema"

export const header = (logoLong?: ContentStorage, showDate = false) => {
    let url = ''
    let name = ''
    if (logoLong) {
        url = logoLong.url || ''
        name = logoLong.name || ''
    }
    const date = new Date()
    const month = date.toLocaleDateString(undefined, { month: 'long'})
    const year = date.getFullYear()
    return `
    <div style="background-color:transparent;">
        <div class="block-grid two-up"
            style="min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: transparent;">
            <div
                style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:480px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="240" style="background-color:transparent;width:240px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top:5px; padding-bottom:5px;"><![endif]-->
                <div class="col num6"
                    style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 240px; width: 240px;">
                    <div class="col_cont" style="width:100% !important;">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                            style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 10px; padding-left: 10px;">
                            <!--<![endif]-->
                            <div align="left" class="img-container left autowidth"
                                style="padding-right: 0px;padding-left: 0px;">
                                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="line-height:0px"><td style="padding-right: 0px;padding-left: 0px;" align="left"><![endif]-->
                                <div style="font-size:1px;line-height:15px"> </div><img alt="${name}"
                                    border="0" class="left autowidth"
                                    src="${url}"
                                    style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 100%; max-width: 186px; display: block;"
                                    title="Image" width="186" />
                                <div style="font-size:1px;line-height:15px"> </div>
                                <!--[if mso]></td></tr></table><![endif]-->
                            </div>
                            <!--[if (!mso)&(!IE)]><!-->
                        </div>
                        <!--<![endif]-->
                    </div>
                </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                <!--[if (mso)|(IE)]></td><td align="center" width="240" style="background-color:transparent;width:240px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top:5px; padding-bottom:5px;"><![endif]-->
                <div class="col num6"
                    style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 240px; width: 240px;">
                    <div class="col_cont" style="width:100% !important;">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                            style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 10px; padding-left: 10px;">
                            <!--<![endif]-->
                            <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 15px; padding-left: 15px; padding-top: 15px; padding-bottom: 15px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
                            <div
                                style="color:#4b5563;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:15px;padding-right:15px;padding-bottom:15px;padding-left:15px;">
                                <div
                                    style="font-size: 12px; line-height: 1.2; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; color: #4b5563; mso-line-height-alt: 14px;">
                                    <p
                                        style="font-size: 14px; line-height: 1.2; text-align: right; word-break: break-word; font-family: Montserrat, 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 17px; margin: 0;">
                                        ${showDate ? month + ' ' + year : ''}</p>
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
    `
}