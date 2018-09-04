import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const appRoutes: Routes = [
    {
        path: '',
        loadChildren: './home/home.module#HomeModule'
    },
];
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {
    enableTracing: false,
    useHash: true,
    preloadingStrategy: PreloadAllModules
});
