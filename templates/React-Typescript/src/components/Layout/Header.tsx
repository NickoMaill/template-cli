import { Link } from 'react-router-dom';
import { AppBar, Box, Toolbar } from '@mui/material';
import Logo from './Logo';

export default function Header() {
    return (
        <AppBar position="relative">
            <Toolbar disableGutters>
                <Box sx={{ flexWrap: 'wrap' }} className="container d-flex justify-content-between align-items-center p-1">
                    <Link to={'/'}>
                        <Logo />
                    </Link>
                </Box>
            </Toolbar>
        </AppBar>
    );
}