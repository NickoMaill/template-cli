import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import moment from 'moment';
import { useContext } from 'react';
import { Regular } from '~/components/common/Text';
import InputTextAreaField from '~/components/formMaker/elements/InputTextAreaField';
import SessionContext from '~/context/sessionContext';
import { ApiErrorType } from '~/core/types/apiModels/Error';
import useResources from '~/hooks/useResources';
import '~/styles/ErrorBondaryStyles.scss';

export default function StandardError({ error }: IStandardError) {
    const Ses = useContext(SessionContext);
    const Resources = useResources();

    const errorDetails = [
        { label: Resources.translate('error.errorBoundary.diag'), data: error.message },
        { label: Resources.translate('error.errorBoundary.source'), data: error.stack },
        { label: Resources.translate('error.errorBoundary.page'), data: window.location.href },
        { label: Resources.translate('error.errorBoundary.clockDate'), data: moment().format('DD MMMM YYYY hh:mm:ss') },
        { label: Resources.translate('error.errorBoundary.browser'), data: Ses.gear },
        { label: Resources.translate('error.errorBoundary.address'), data: Ses.ip },
        { label: Resources.translate('error.errorBoundary.linkForward'), data: error.targetUrl },
    ];

    return (
        <>
            <Box className="errortext" sx={{ backgroundColor: '#DDDDDD', borderRadius: 1 }} minWidth="500px" width="100%" margin={1}>
                <Box>
                    <Box>
                        <Box className="errortext" padding={2}>
                            <Box component="form" action="SQLError.aspx" method="post" style={{ maxWidth: 800 }}>
                                <Regular fontSize={13} textAlign={'center'}>
                                    <b>{Resources.translate('error.errorBoundary.sorry')}</b> {Resources.translate('error.errorBoundary.firstErrorMessage')}{' '}
                                    <b style={{ textDecoration: 'underline', color: 'blue' }}>
                                        <a href={Resources.translate('error.errorBoundary.supportEmail')}>{Resources.translate('error.errorBoundary.technicalStaff')}</a>
                                    </b>
                                    <br />
                                    {Resources.translate('error.errorBoundary.thanks')}
                                    <br />
                                    <br />
                                    {Resources.translate('error.errorBoundary.toSendMessage')}
                                    <br />
                                    <Regular fontSize={13} fontWeight={'bold'} component={'span'} color={'#E00'}>
                                        {Resources.translate('error.errorBoundary.pleaseSend')}
                                    </Regular>{' '}
                                    {Resources.translate('error.errorBoundary.thenClick')} "<b>{Resources.translate('common.sendMessage')}</b>"
                                    <br />
                                </Regular>
                                <InputTextAreaField sx={{ width: '100%' }} showLabel={false} rows={5} id="Body" label="message" />
                                <br />
                                <input type="hidden" defaultValue={Ses.email} name="From" />
                                <Box display="flex" alignItems="center" justifyContent="center" marginBottom={1}>
                                    <Button type="submit" variant="contained" style={{ fontWeight: 'bold' }} sx={{ width: '30%', minWidth: 200, alignItems: 'center', backgroundColor: '#6599CC' }} name="Submit" className="button">
                                        {Resources.translate('common.sendMessage')}
                                    </Button>
                                </Box>
                                <input type="hidden" defaultValue={error.message} name="Diagnostic" />
                                <input type="hidden" defaultValue={error.stack} name="Source" />
                                <input type="hidden" defaultValue={error.stack} name="TableRowace" />
                                <input type="hidden" defaultValue={window.location.href} name="Page" />
                                <input type="hidden" defaultValue={moment().format('dd MMMM yyyy hh:mm:ss')} name="DateTime" />
                                <input type="hidden" defaultValue={Ses.gear} name="Browser" />
                                <input type="hidden" defaultValue={Ses.ip} name="Address" />
                                <input type="hidden" defaultValue={window.location.href} name="Referer" />
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        <Box style={{ padding: 0 }}>
                            <Table sx={{ border: 'solid', borderWidth: 1 }} className="error" cellSpacing={0} cellPadding={0} width="20%">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ padding: 0.5 }} colSpan={2}>
                                            {Resources.translate('error.errorBoundary.errorReport')}
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {errorDetails.map((err, i) => (
                                        <TableRow key={i} sx={{ border: 'solid', borderWidth: 1 }}>
                                            <TableCell sx={{ border: 'solid', padding: 0.5, borderWidth: 1 }} className="t">
                                                {err.label}
                                            </TableCell>
                                            <TableCell sx={{ border: 'solid', padding: 0.5, borderWidth: 1 }} style={{ fontSize: 12 }}>
                                                {err.data}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

interface IStandardError {
    error: ApiErrorType;
}
