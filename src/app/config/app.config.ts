import { InjectionToken } from '@angular/core';
export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    home: 'home',
    login: 'login',
    dashboard: 'dashboard',
    createWallet: 'create-wallet',
    importWallet: 'import-wallet',
    audiApostille: 'audit-apostille',
    apostille: 'apostille',
    transactions: 'transactions-get',
    transferTransaction: 'transfer',
    addNode: 'add-node',
    selectNode: 'select-node',
    explorer: 'explorer',
    createPoll: 'create-poll',
    polls: 'polls',
    service: 'dashboard-service',
    services: 'services',
    account: 'account',
    explorerFile: 'explorer-file',
    addressBook: 'address-book',
    notFound: 'not-found',
    storage: 'storage',
    createMosaic: 'create-mosaic',
    MosaicSupplyChange: 'mosaic-supply-change',
    createNamespace: 'create-namespace',
    editNamespace: 'edit-namespace',
    LinkingNamespaceMosaic: 'linking-namespace-to-mosaic',
    createMultisignature: 'create-multisignature-contract',
    editMultisignatureContract: 'edit-multisignature-contract',
    signMultiSigTransactions: 'sign-multisignature-transactions'
  }
};

export const NameRoute = {
  [AppConfig.routes.home]: 'Home',
  [AppConfig.routes.login]: 'Login',
  [AppConfig.routes.dashboard]: 'Dashboard',
  [AppConfig.routes.createWallet]: 'Create wallet',
  [AppConfig.routes.importWallet]: 'Import wallet',
  [AppConfig.routes.audiApostille]: 'Apostille Audit',
  [AppConfig.routes.apostille]: 'Apostille create',
  [AppConfig.routes.transactions]: 'Transactions get',
  [AppConfig.routes.transferTransaction]: 'Transfer',
  [AppConfig.routes.addNode]: 'Add node',
  [AppConfig.routes.selectNode]: 'Select node',
  [AppConfig.routes.explorer]: 'Explorer Transaction',
  [AppConfig.routes.explorerFile]: 'Explorer File',
  [AppConfig.routes.createPoll]: 'Create a Poll',
  [AppConfig.routes.polls]: 'Vote and See Polls',
  [AppConfig.routes.services]: 'Services',
  [AppConfig.routes.account]: 'Account',
  [AppConfig.routes.service]: ' Dashboard service',
  [AppConfig.routes.addressBook]: 'Address Book',
  [AppConfig.routes.notFound]: '404 not found',
  [AppConfig.routes.storage]: 'storage',
  [AppConfig.routes.createMosaic]: 'Create Mosaic',
  [AppConfig.routes.MosaicSupplyChange]: 'Mosaic supply change',
  [AppConfig.routes.createNamespace]: 'Create namespace & sub-namespace',
  [AppConfig.routes.editNamespace]: 'Edit Namespace',
  [AppConfig.routes.createMultisignature]: 'Convert an account to multisig',
  [AppConfig.routes.editMultisignatureContract]: 'Edit multisignature contract',
  [AppConfig.routes.signMultiSigTransactions]: 'Sign multisignature transactions',

}

export interface Config {
  routes: {
    home: string;
    login: string;
    dashboard: string;
    createWallet: string;
    importWallet: string;
    audiApostille: string;
    apostille: string;
    transactions: string;
    transferTransaction: string;
    addNode: string;
    selectNode: string;
    explorer: string;
    createPoll: string;
    polls: string;
    service: string;
    services: string;
    account: string;
    explorerFile: string;
    addressBook: string;
    createMosaic: string;
    MosaicSupplyChange: string;
    LinkingNamespaceMosaic: string;
    createNamespace: string;
    editNamespace: string;
    createMultisignature: string;
    editMultisignatureContract: string;
    signMultiSigTransactions: string;
    notFound: string;
    storage: string;
  };
}
