import { JSX } from 'react';
import { ParsedUrlQuery } from 'querystring';
import { RecursiveKeyOf } from './custom';
import { UserAccessLevelEnum } from './apiModels/Session';

export type RouterDescription = {
    name: RecursiveKeyOf<RouteNameReference>;
    path: string;
    isAuthRequired: boolean;
    query?: ParsedUrlQuery;
    element: () => JSX.Element;
    title: string;
    levelAccess: UserAccessLevelEnum;
};

export type RouteNameReference = {
    Home;
};