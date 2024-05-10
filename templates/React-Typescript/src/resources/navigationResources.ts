import { RouterDescription } from '~/core/types/route';
import Homepage from '~/pages/Homepage';
import Login from '~/pages/Login';
import { UserAccessLevelEnum } from '~/core/types/apiModels/Session';

class NavigationResource {
    public static get routesPath() {
        return {
            home: '/',
            users: '/users',
            login: '/login',
            center: '/center',
            profile: '/profile',
            proxy: '/proxy',
        };
    }

    public static get routes(): RouterDescription[] {
        return [
            // #region COMMON ROUTES -> ///////////////////////////////////////////////////////
            { name: 'Login', element: Login, path: this.routesPath.login, isAuthRequired: false, title: 'Connexion', levelAccess: UserAccessLevelEnum.NOBODY },
            { name: 'Home', element: Homepage, path: this.routesPath.home, isAuthRequired: true, title: 'Bienvenue', levelAccess: UserAccessLevelEnum.TEAMMATE },
            // #endregion COMMON ROUTES -> ////////////////////////////////////////////////////

            // #region AUTH REQUIRED -> ///////////////////////////////////////////////////////
            // #endregion ROUTES -> ///////////////////////////////////////////////////////////
        ];
    }
}

export default NavigationResource;
