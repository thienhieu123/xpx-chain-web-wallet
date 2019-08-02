import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import {
  NamespaceInfo,
  NamespaceId,
  NamespaceName,
  Address,
  AliasActionType,
  NetworkType,
  AliasTransaction,
  Deadline
} from "tsjs-xpx-chain-sdk";
import { ProximaxProvider } from "../../shared/services/proximax.provider";
import { WalletService } from '../../wallet/services/wallet.service';

@Injectable({
  providedIn: "root"
})
export class NamespacesService {

  namespaceViewCache: NamespaceName[] = [];
  namespaceFromAccount: NamespaceInfo[] = null;
  network = this.walletService.network;
  private namespaceFromAccountSubject: BehaviorSubject<NamespaceInfo[]> = new BehaviorSubject<NamespaceInfo[]>(null);
  private namespaceFromAccount$: Observable<NamespaceInfo[]> = this.namespaceFromAccountSubject.asObservable();

  constructor(
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService
  ) { }


  addressAliasTransaction(
    aliasActionType: AliasActionType,
    namespaceId: NamespaceId,
    address: Address,
    common: any,
    network?: NetworkType
  ) {
    network = (network !== undefined) ? network : this.walletService.network;
    const addressAliasTransaction = AliasTransaction.createForAddress(
      Deadline.create(),
      aliasActionType,
      namespaceId,
      address,
      network
    );

    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
    const signedTransaction = account.sign(addressAliasTransaction);
    // this.proximaxProvider.announce(signedTransaction)
    return signedTransaction;
  }

  /**
     * Search and save namespace in cache
     *
     * @memberof NamespacesService
     */
  async buildNamespaceStorage() {
    //Gets array of NamespaceInfo for an account
    this.getNamespacesFromAccountAsync(this.walletService.address)
      .then(response => {
        this.namespaceFromAccount = response;
        this.namespaceFromAccountSubject.next(response);
        this.setNamespaceStorage(response);
      }).catch(() => {
        //Nothing!
      });
  }

  /**
   *
   *
   * @param {NamespaceId} namespaceId
   * @returns {Promise<NamespaceStorage>}
   * @memberof NamespacesService
   */
  async getNamespaceFromId(namespaceId: NamespaceId): Promise<NamespaceStorage> {
    const data = this.filterNamespace(namespaceId);
    if (data !== null && data !== undefined) {
      return data;
    }

    try {
      const namespaceInfo = await this.proximaxProvider.getNamespace(namespaceId).toPromise();
      if (namespaceInfo && Object.keys(namespaceInfo).length > 0) {
        await this.setNamespaceStorage([namespaceInfo]);
        return this.filterNamespace(namespaceId);
      }
    } catch (error) {
      //Nothing!
      return null;
    }

    return null;
  }

  /**
   * Gets array of NamespaceInfo for an account
   *
   * @param {Address} address
   * @returns
   * @memberof NamespacesService
   */
  async getNamespacesFromAccountAsync(address: Address): Promise<NamespaceInfo[]> {
    try {
      //Gets array of NamespaceInfo for an account
      const namespaceInfo = await this.proximaxProvider.namespaceHttp.getNamespacesFromAccount(address).toPromise();
      return namespaceInfo;
    } catch (error) {
      //Nothing!
      return [];
    }
  }

  /**
   *
   *
   * @param {NamespaceId[]} namespaceIds
   * @returns {Promise<NamespaceName[]>}
   * @memberof NamespacesService
   */
  async getNamespacesNameAsync(namespaceIds: NamespaceId[]): Promise<NamespaceName[]> {
    try {
      //Gets array of NamespaceName for an account
      const NamespaceName = await this.proximaxProvider.namespaceHttp.getNamespacesName(namespaceIds).toPromise();
      return NamespaceName;
    } catch (error) {
      //Nothing!
      return [];
    }
  }

  /**
   *
   *
   * @returns {Observable<any>}
   * @memberof NamespacesService
   */
  async searchNamespaceFromAccountStorage$(): Promise<NamespaceStorage[]> {
    const namespaceFound = [];
    if (this.namespaceFromAccount !== null) {
      for (let element of this.namespaceFromAccount) {
        const data = this.filterNamespace(element.id);
        if (data === null || data === undefined) {
          const namespaceStorage = await this.getNamespaceFromId(element.id);
          namespaceFound.push(namespaceStorage);
        } else {
          namespaceFound.push(data);
        }
      }
    }
    return namespaceFound;
  }

  /**
   *
   *
   * @param {*} namespaces
   * @memberof NamespacesService
   */
  async setNamespaceStorage(namespacesParam: NamespaceInfo[]) {
    if (namespacesParam.length > 0) {
      const idsToSearch = [];
      //Get the storage namespace
      const namespacesStorage = this.getNamespaceFromStorage();
      // Map and get an array of ids from NamespaceInfo []
      const namespacesId = namespacesParam.map(e => { return e.id; });
      namespacesId.forEach(id => {
        // Filter if the namespace id exists in the storage
        const filterNamespace = this.filterNamespace(id);
        if (filterNamespace === undefined || filterNamespace === null) {
          idsToSearch.push(id);
        }
      });

      if (idsToSearch.length > 0) {
        // Gets array of NamespaceName for different namespaceIds
        const namespacesName = await this.getNamespacesNameAsync(idsToSearch);
        if (namespacesName) {
          namespacesParam.forEach(async element => {
            // Check if the namespace id exists in storage
            /* const existNamespace = namespacesStorage.find(k => this.proximaxProvider.getNamespaceId(k.id).toHex() === element.id.toHex());
             // If existNamespace is undefined
             if (existNamespace === undefined) {*/
            // Filter by namespaceId the namespaceName from the array of namespacesName
            const namespaceName = namespacesName.find(data => data.namespaceId.toHex() === element.id.toHex());
            if (namespaceName) {
              const data: NamespaceStorage = {
                id: [namespaceName.namespaceId.id.lower, namespaceName.namespaceId.id.higher],
                namespaceName: namespaceName,
                NamespaceInfo: element
              };
              namespacesStorage.push(data);
            }
            // }

            //Build mosaics storage
            //this.mosaicsService.buildMosaicsFromNamespace(element.id);
          });

          localStorage.setItem(this.getNameStorage(), JSON.stringify(namespacesStorage));
          //console.log(namespacesStorage);
          return namespacesStorage;
        }
      }
    }

    return [];
  }

  /**
   *
   *
   * @memberof NamespacesService
   */
  destroyDataNamespace() {
    this.namespaceFromAccountSubject.next(null);
  }

  /**
   * Validate if a namespace is in the storage
   *
   * @param {NamespaceId} namespaceId
   * @returns {NamespaceStorage}
   * @memberof NamespacesService
   */
  filterNamespace(namespaceId: NamespaceId): NamespaceStorage {
    if (namespaceId !== undefined) {
      const namespaceStorage = this.getNamespaceFromStorage();
      if (namespaceStorage !== null && namespaceStorage !== undefined) {
        if (namespaceStorage.length > 0) {
          const filtered = namespaceStorage.find(element => {
            return this.getNamespaceId(element.id).id.toHex() === namespaceId.id.toHex();
          });

          return filtered;
        }
      }
    }

    return null;
  }

  /**
   *
   *
   * @param {(string | number[])} id
   * @returns {NamespaceId}
   * @memberof NamespacesService
   */
  getNamespaceId(id: string | number[]): NamespaceId {
    return this.proximaxProvider.getNamespaceId(id);
  }

  /**
   *
   *
   * @returns
   * @memberof NamespacesService
   */
  getNamespaceFromStorage(): NamespaceStorage[] {
    const dataStorage = localStorage.getItem(this.getNameStorage());
    return (dataStorage !== null && dataStorage !== undefined) ? JSON.parse(dataStorage) : [];
  }

  /**
   *
   *
   * @returns
   * @memberof NamespacesService
   */
  getNameStorage() {
    return `proximax-namespaces`;
  }

  /**
   *
   *
   * @returns {Observable<NamespaceInfo[]>}
   * @memberof NamespacesService
   */
  getNamespaceFromAccountAsync(): Observable<NamespaceInfo[]> {
    return this.namespaceFromAccount$;
  }

  /**
   *
   *
   * @memberof NamespacesService
   */
  resetNamespaceStorage() {
    localStorage.removeItem(this.getNameStorage());
  }
}


export interface NamespaceStorage {
  id: number[];
  namespaceName: NamespaceName;
  NamespaceInfo: NamespaceInfo;
}