export const social = (facebook?: string, twitter?: string, instagram?: string) => {
    if (!facebook && !twitter && !instagram) {
        return ''
    }
    return `
    <div style="background-color:transparent;">
        <div class="block-grid"
            style="min-width: 320px; max-width: 620px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: transparent;">
            <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:620px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="620" style="background-color:transparent;width:620px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:0px;"><![endif]-->
                <div class="col num12"
                    style="min-width: 320px; max-width: 620px; display: table-cell; vertical-align: top; width: 620px;">
                    <div class="col_cont" style="width:100% !important;">
                        <!--[if (!mso)&(!IE)]><!-->
                        <div
                            style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
                            <!--<![endif]-->
                            <table cellpadding="0" cellspacing="0" class="social_icons" role="presentation"
                                style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                valign="top" width="100%">
                                <tbody>
                                    <tr style="vertical-align: top;" valign="top">
                                        <td style="word-break: break-word; vertical-align: top; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px;"
                                            valign="top">
                                            <table align="center" cellpadding="0" cellspacing="0" class="social_table"
                                                role="presentation"
                                                style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-tspace: 0; mso-table-rspace: 0; mso-table-bspace: 0; mso-table-lspace: 0;"
                                                valign="top">
                                                <tbody>
                                                    <tr align="center"
                                                        style="vertical-align: top; display: inline-block; text-align: center;"
                                                        valign="top">
                                                        ${facebook ? iconItem(facebook, 'Facebook') : ''}
                                                        ${instagram ? iconItem(instagram, 'Instagram') : ''}
                                                        ${twitter ? iconItem(twitter, 'Twitter') : ''}
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
    ${divider()}
    `
}

const iconItem = (link: string, type: 'Facebook' | 'Twitter' | 'Instagram') => {
    let image = ''
    switch (type) {
        case 'Facebook':
            image = facebookImage
            break
        case 'Twitter':
            image = twitterImage
            break
        case 'Instagram':
            image = instagramImage
            break
    }
    return `
    <td style="word-break: break-word; vertical-align: top; padding-bottom: 5px; padding-right: 5px; padding-left: 0;"
        valign="top"><a href="${link}" target="_blank"><img
            alt="${type}" height="32"
            src="${image}"
            style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; display: block;"
            title="Twitter" width="32" /></a></td>
    `
}

const facebookImage = 'https://firebasestorage.googleapis.com/v0/b/articshift-7f9cd.appspot.com/o/images%2Ffacebook2x.png?alt=media&token=5c88efd8-9376-45af-b95b-5755ec757af0'
const instagramImage = 'https://firebasestorage.googleapis.com/v0/b/articshift-7f9cd.appspot.com/o/images%2Finstagram2x.png?alt=media&token=4836f920-9179-42c8-b25f-a3f43fb95866'
const twitterImage = 'https://firebasestorage.googleapis.com/v0/b/articshift-7f9cd.appspot.com/o/images%2Ftwitter2x.png?alt=media&token=3e62f2e4-776f-47b8-ad2b-93a0e7fc12b3'