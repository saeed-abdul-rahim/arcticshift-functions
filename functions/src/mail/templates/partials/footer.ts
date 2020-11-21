import { URL } from "../../../config"

export const footer = (name: string) => {
    const year = new Date().getFullYear()
    return `
    <div style="background-color:transparent;">
        <div class="block-grid"
            style="min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: transparent;">
            <div
                style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:480px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="480" style="background-color:transparent;width:480px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
                <div class="col num12"
                    style="min-width: 320px; max-width: 620px; display: table-cell; vertical-align: top; width: 480px;">
                    <div class="col_cont" style="width:100% !important;">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                            style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
                            <!--<![endif]-->
                            <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
                            <div
                                style="color:#374151;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
                                <div
                                    style="font-size: 12px; line-height: 1.2; color: #374151; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
                                    <p
                                        style="font-size: 12px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 14px; margin: 0;">
                                        <span style="font-size: 12px;">Copyright © ${year} <a href="${URL.base}" style="color: #9ca3af">${name}</a>, All
                                            rights reserved. </span><br /></p>
                                    <p
                                        style="font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin: 0;">
                                         <br /></p>
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