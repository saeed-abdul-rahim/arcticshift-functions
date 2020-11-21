export const itemList = (name: string, currency: string, price: number, link?: string, quantity?: number, subItem?: string) => `
<div style="background-color:transparent;">
    <div class="block-grid mixed-two-up"
        style="min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: #FFFFFF;">
        <div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:480px"><tr class="layout-full-width" style="background-color:#FFFFFF"><![endif]-->
            <!--[if (mso)|(IE)]><td align="center" width="320" style="background-color:#FFFFFF;width:320px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:15px; padding-bottom:0px;"><![endif]-->
            <div class="col num8"
                style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 320px; width: 320px;">
                <div class="col_cont" style="width:100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                        style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
                        <!--<![endif]-->
                        <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 20px; padding-left: 20px; padding-top: 10px; padding-bottom: 10px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
                        <div
                            style="color:#1f2937;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:10px;padding-right:20px;padding-bottom:10px;padding-left:20px;">
                            <div
                                style="font-size: 12px; line-height: 1.2; color: #1f2937; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
                                <p
                                    style="font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin: 0;">
                                    <span style="color: #1F2937; font-size: 14px;">
                                        <a
                                            ${link ? 'href="' + link + '"' : ''}
                                            href="http://example.com"
                                            style="text-decoration: none; color: #1F2937;"
                                            target="_blank">
                                            ${quantity ? quantity + ' x ' : ''}${name}
                                            ${subItem ? '<br><span style="color: #6B7280">' + subItem + '</span>' : ''}
                                        </a>
                                    </span>
                                </p>
                            </div>
                        </div>
                        <!--[if mso]></td></tr></table><![endif]-->
                        <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                </div>
            </div>
            <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
            <!--[if (mso)|(IE)]></td><td align="center" width="160" style="background-color:#FFFFFF;width:160px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:15px; padding-bottom:0px;"><![endif]-->
            <div class="col num4"
                style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 160px; width: 160px;">
                <div class="col_cont" style="width:100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                        style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
                        <!--<![endif]-->
                        <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 20px; padding-left: 20px; padding-top: 10px; padding-bottom: 10px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
                        <div
                            style="color:#1f2937;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:10px;padding-right:20px;padding-bottom:10px;padding-left:20px;">
                            <div
                                style="font-size: 12px; line-height: 1.2; color: #1f2937; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
                                <p
                                    style="font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin: 0;">
                                    ${currency}${price}</p>
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