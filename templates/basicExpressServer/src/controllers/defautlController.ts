import { Router } from 'express';
import logManager from '~/managers/logManager';
import { AppRequest, AppResponse } from '../core/controllerBase';

const Route = Router();

/**
// ROUTE SPEC
* @description -> Default Controller
* @route -> /album
* @access public
**/

/**
 * @route /init/
 * @description init route
 * @state used
 */

Route.get('/', (_req: AppRequest, res: AppResponse) => {
    logManager.info("defaultController.get", "default init route requested");
    res.json({ message: 'Default init route' });
});

export { Route as DefaultController };