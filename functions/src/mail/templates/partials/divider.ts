const divider = (solid?: boolean) => `
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
                        <table border="0" cellpadding="0" cellspacing="0" class="divider"
                            role="presentation"
                            style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                            valign="top" width="100%">
                            <tbody>
                                <tr style="vertical-align: top;" valign="top">
                                    <td class="divider_inner"
                                        style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;"
                                        valign="top">
                                        <table align="center" border="0" cellpadding="0"
                                            cellspacing="0" class="divider_content"
                                            role="presentation"
                                            style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 1px ${solid ? 'solid #1F2937' : 'dotted #D1D5DB'}; width: 100%;"
                                            valign="top" width="100%">
                                            <tbody>
                                                <tr style="vertical-align: top;" valign="top">
                                                    <td style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                        valign="top"><span></span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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