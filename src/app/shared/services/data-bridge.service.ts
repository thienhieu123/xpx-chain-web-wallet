import { Injectable } from '@angular/core';
import { first } from "rxjs/operators";
import { Listener, MosaicInfo } from "proximax-nem2-sdk";
import { WalletService } from "./wallet.service";
import { TransactionsService } from "../../transactions/service/transactions.service";
import { NodeService } from '../../servicesModule/services/node.service';
import { environment } from '../../../environments/environment';
import { NemProvider } from './nem.provider';
import { ProximaxProvider } from './proximax.provider';
import { SharedService } from './shared.service';


@Injectable({
  providedIn: 'root'
})
export class DataBridgeService {

  url: any
  connector: Listener;
  constructor(
    private walletService: WalletService,
    private _transactionsService: TransactionsService,
    private nodeService: NodeService,
    private nemProvider: NemProvider,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService
  ) { }


  /**
   *   Set default socket connect
   *
   * @returns
   * @memberof DataBridgeService
   */
  connectnWs() {
    this.url = environment.socketProtocol + '://' + `${this.nodeService.getNodeSelected()}`;
    this.connector = new Listener(this.url, WebSocket);
    // Try to open the connection
    console.log(this.url);
    this.openConnection(this.connector);
    return;
  }

  closeConenection() {
    this.connector.close();
  }

  /**
   * Open websocket connection
   *
   * @param {*} connector
   * @memberof DataBridgeService
   */
  openConnection(connector: Listener) {
    connector.open().then(() => {
      console.log("aqui abre una nueva conexión");
      const audio = new Audio('assets/audio/ding2.ogg');
      this.getTransactionsConfirmedSocket(connector, audio);
      this.getTransactionsUnConfirmedSocket(connector, audio);
      this.getStatusSocket(connector, audio);
    }, (error) => {
      console.error("errroooor de soquer", error);
      this.reconnect(connector);
    });
  }


  /**
   * Get the confirmed transactions from the socket
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getTransactionsConfirmedSocket(connector: Listener, audio: HTMLAudioElement) {
    connector.confirmed(this.walletService.address).subscribe(incomingTransaction => {
      console.log("Transacciones confirmadas entrantes", incomingTransaction);
      audio.play();

      //Search transactions in cache
      this._transactionsService.getConfirmedTransactionsCache$().pipe(first()).subscribe(
        allTransactionConfirmed => {
          const transactionPushed = allTransactionConfirmed.slice(0);
          //Obtain mosaic information and format the amount
          this.proximaxProvider.getInfoMosaic(incomingTransaction['mosaics'][0].id).then((mosaicInfo: MosaicInfo) => {
            incomingTransaction['amount'] = this.nemProvider.formatterAmount(incomingTransaction['mosaics'][0].amount.compact(), mosaicInfo.divisibility);
            const transactionFormated = this._transactionsService.formatTransaction(incomingTransaction);
            transactionPushed.unshift(transactionFormated);
            this._transactionsService.setConfirmedTransaction$(transactionPushed);

            //subscribe to transactions unconfirmed to valid if isset and delete
            this._transactionsService.getTransactionsUnconfirmedCache$().pipe(first()).subscribe(
              response => {
                let allTransactionUnConfirmed = response;
                let unconfirmed = [];
                allTransactionUnConfirmed.forEach((element: { transactionInfo: { hash: any; }; }) => {
                  if (element.transactionInfo.hash !== transactionFormated.transactionInfo.hash) {
                    unconfirmed.unshift(element);
                  }
                });
                this._transactionsService.setTransactionsUnconfirmed$(unconfirmed);
              });
          });
        });
    }, err => {
      console.error(err)
    });
  }


  /**
   * Get the unconfirmed transactions from the socket
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getTransactionsUnConfirmedSocket(connector: Listener, audio: HTMLAudioElement) {
    //Get transactions unconfirmed
    connector.unconfirmedAdded(this.walletService.address).subscribe(transaction => {
      if (Object.keys(transaction).length > 0) {
        this.proximaxProvider.getInfoMosaic(transaction['mosaics'][0].id).then((mosaicInfo: MosaicInfo) => {
          audio.play();
          this._transactionsService.getTransactionsUnconfirmedCache$().pipe(first()).subscribe(
            transactionsUnconfirmed => {
              transaction['amount'] = this.nemProvider.formatterAmount(transaction['mosaics'][0].amount.compact(), mosaicInfo.divisibility);
              if (transactionsUnconfirmed.length > 0) {
                const transactionsUnconfirmedCopy = transactionsUnconfirmed.slice(0);
                transactionsUnconfirmedCopy.push(this._transactionsService.formatTransaction(transaction));
                this._transactionsService.setTransactionsUnconfirmed$(transactionsUnconfirmedCopy);
              } else {
                this._transactionsService.setTransactionsUnconfirmed$([this._transactionsService.formatTransaction(transaction)]);
              }
            });
        }, err => {
          console.error(err);
        });
      }
    });
  }

  /**
   * Get the status from the socket
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getStatusSocket(connector: Listener, audio: HTMLAudioElement) {
    connector.status(this.walletService.address).subscribe(status => {
      console.log("Status::::: ", status);
    }, err => {
      console.error("err::::::", err)
    });
  }

  /**
   *  reconnection to the  websocket
   *
   * @param {*} connector
   * @returns
   * @memberof DataBridgeService
   */
  reconnect(connector: Listener) {
    // Close connector
    connector.close();
    this.openConnection(connector);
    return;
  }
}
