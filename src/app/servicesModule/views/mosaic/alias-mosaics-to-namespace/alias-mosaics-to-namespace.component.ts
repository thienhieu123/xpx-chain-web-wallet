import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NamespaceId, MosaicId, UInt64, AliasActionType } from 'tsjs-xpx-chain-sdk';
import { AppConfig } from '../../../../config/app.config';
import { MosaicService } from '../../../../servicesModule/services/mosaic.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NamespacesService, NamespaceStorageInterface } from '../../../../servicesModule/services/namespaces.service';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { SharedService, ConfigurationForm } from '../../../../shared/services/shared.service';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { HeaderServicesInterface } from '../../../services/services-module.service';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-alias-mosaics-to-namespace',
  templateUrl: './alias-mosaics-to-namespace.component.html',
  styleUrls: ['./alias-mosaics-to-namespace.component.css']
})
export class AliasMosaicsToNamespaceComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Mosaics',
    componentName: 'LINK TO NAMESPACE',
  };
  arrayNamespaceStorage: NamespaceStorageInterface[] = [];
  currentBlock: number = 0;
  configurationForm: ConfigurationForm = {};
  linkingNamespaceToMosaic: FormGroup;
  blockSend: boolean = false;
  loading = false;
  mosaicSelect: Array<object> = [
    {
      value: '1',
      label: 'Select mosaic',
      selected: true,
      disabled: true
    }
  ];
  namespaceSelect: Array<object> = [
    {
      value: '1',
      label: 'Select namespace',
      selected: true,
      disabled: true
    }
  ];

  typeAction: any = [{
    value: AliasActionType.Link,
    label: 'Link',
    selected: true,
    disabled: false
  }, {
    value: AliasActionType.Unlink,
    label: 'Unlink',
    selected: false,
    disabled: false
  }];


  transactionSigned: any;
  subscription: Subscription[] = [];
  mosaicId: any;
  namespaceId: any;
  action: any;
  mosaicSupplyChangeTransaction: any;
  fee: any;
  amountAccount: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private namespaceService: NamespacesService,
    private mosaicService: MosaicService,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
    private dataBridge: DataBridgeService,
    private transactionService: TransactionsService
  ) { }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.getNamespaces();
    this.getMosaic();

    this.subscription.push(this.dataBridge.getBlock().subscribe(next => {
      this.currentBlock = next;
    }));
    this.builder();
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  captureAction() {
     const action = this.linkingNamespaceToMosaic.get('typeAction').value;
     this.action = action;
     this.builder();
  }

  captureNamespace() {
    const namespaceId = new NamespaceId(this.linkingNamespaceToMosaic.get('namespace').value);
    this.namespaceId = namespaceId;
    this.builder();
    this.getAmountAccount();
  }

  captureMmosaic() {
    const mosaicId = new MosaicId(this.linkingNamespaceToMosaic.get('mosaic').value);
    this.mosaicId = mosaicId;
    this.builder()
  }

  builder(){
    this.mosaicSupplyChangeTransaction = this.proximaxProvider.linkingNamespaceToMosaic(
      this.action,
      this.namespaceId,
      this.mosaicId,
      this.walletService.currentAccount.network
    );
    this.fee = this.transactionService.amountFormatterSimple(this.mosaicSupplyChangeTransaction.maxFee.compact());
  }

  getAmountAccount() {
    const account = this.walletService.filterAccountInfo(this.proximaxProvider.createFromRawAddress(this.walletService.currentAccount.address).pretty(), true);
    let mosaics = account.accountInfo.mosaics;
    let amoutMosaic = mosaics.filter(mosaic => mosaic.id.toHex() == environment.mosaicXpxInfo.id);
    this.amountAccount = amoutMosaic[0].amount.compact()

  }

  async buildSelectNamespace($event = null) {
    console.log('--arrayNamespaceStorage--', this.arrayNamespaceStorage);
    if ($event !== null) {
      this.linkingNamespaceToMosaic.get('namespace').setValue('1');
      const namespaceSelect = [];
      this.loading = true;
      if (this.arrayNamespaceStorage && this.arrayNamespaceStorage.length > 0) {
        for (let namespaceStorage of this.arrayNamespaceStorage) {
          if (namespaceStorage.namespaceInfo) {
            let isLinked = false;
            let disabled = false;
            // let label = await this.namespaceService.getNameParentNamespace(namespaceStorage);
            let label = namespaceStorage.namespaceName.name
            const name = label;
            const type = namespaceStorage.namespaceInfo.alias.type;
            if (type === 2) {
              isLinked = true;
              disabled = true;
              label = `${label}- (Linked to address)`;
            } else if (type === 1) {
              isLinked = true;
              disabled = (this.linkingNamespaceToMosaic.get('typeAction').value === 0) ? true : false;
              label = `${label}- (Linked to mosaic)`;
            } else {
              disabled = (this.linkingNamespaceToMosaic.get('typeAction').value === 1) ? true : false;
            }

            namespaceSelect.push({
              label: `${label}`,
              value: `${name}`,
              selected: false,
              disabled: disabled
            });
          }
        };
      }

      this.namespaceSelect = namespaceSelect.sort(function (a: any, b: any) {
        return a.label === b.label ? 0 : +(a.label > b.label) || -1;
      });

      this.loading = false;
    } else {
      this.linkingNamespaceToMosaic.get('typeAction').setValue(AliasActionType.Link);
    }
  }

  /**
   *
   *
   * @memberof LinkingNamespaceToMosaicComponent
   */
  createForm() {
    this.linkingNamespaceToMosaic = this.fb.group({
      namespace: ['', [Validators.required]],
      typeAction: [AliasActionType.Link, [
        Validators.required
      ]],
      mosaic: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]]
    });
  }



  clearForm() {
    this.linkingNamespaceToMosaic.reset({
      namespace: '',
      mosaic: '',
      password: ''
    },
      {
        emitEvent: false
      });
  }

  /**
   *
   *
   * @memberof AliasMosaicsToNamespaceComponent
   */
  getNamespaces() {
    this.subscription.push(this.namespaceService.getNamespaceChanged().subscribe(
      async (arrayNamespaceStorage: NamespaceStorageInterface[]) => {
        this.arrayNamespaceStorage = arrayNamespaceStorage;
        this.buildSelectNamespace(this.linkingNamespaceToMosaic.get('typeAction').value);
      }
    ));
  }

  /**
   *
   *
   * @memberof LinkingNamespaceToMosaicComponent
   */
  getNameNamespace() {
    this.subscription.push(this.namespaceService.getNamespaceChanged().subscribe(
      async namespaceInfo => {
        const namespaceSelect = this.namespaceSelect.slice(0);
        if (namespaceInfo !== undefined && namespaceInfo.length > 0) {
          console.log(namespaceInfo);
          for (let data of namespaceInfo) {
            namespaceSelect.push({
              value: `${data.namespaceName.name}`,
              label: `${data.namespaceName.name}`,
              selected: false,
              disabled: false
            });
            /*  if (data.namespaceInfo.depth === 1) {
                namespaceSelect.push({
                  value: `${data.namespaceName.name}`,
                  label: `${data.namespaceName.name}`,
                  selected: false,
                  disabled: false
                });
              } else {
                let name = '';
                if (data.namespaceInfo.depth === 2) {
                  //Assign level 2
                  const level2 = data.namespaceName.name;
                  //Search level 1
                  const level1: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId(
                    [this.proximaxProvider.getNamespaceId([data.namespaceName.parentId.id.lower, data.namespaceName.parentId.id.higher])]
                  );

                  name = `${level1[0].namespaceName.name}.${level2}`;
                  namespaceSelect.push({
                    value: `${name}`,
                    label: `${name}`,
                    selected: false,
                    disabled: false
                  });
                } else if (data.namespaceInfo.depth === 3) {
                  //Assign el level3
                  const level3 = data.namespaceName.name;
                  //search level 2
                  const level2: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId(
                    [this.proximaxProvider.getNamespaceId([data.namespaceName.parentId.id.lower, data.namespaceName.parentId.id.higher])]
                  );

                  //search level 1
                  const level1: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId(
                    [this.proximaxProvider.getNamespaceId([level2[0].namespaceName.parentId.id.lower, level2[0].namespaceName.parentId.id.higher])]
                  );
                  name = `${level1[0].namespaceName.name}.${level2[0].namespaceName.name}.${level3}`;
                  namespaceSelect.push({
                    value: `${name}`,
                    label: `${name}`,
                    selected: false,
                    disabled: false
                  });
                }
              }*/
          }
        }

        this.namespaceSelect = namespaceSelect;
      }, error => {
        this.router.navigate([AppConfig.routes.home]);
        this.sharedService.showError('', 'Please check your connection and try again');
      }));
  }

  /**
   *
   *
   * @memberof LinkingNamespaceToMosaicComponent
   */
  async getMosaic() {
    this.subscription.push(this.mosaicService.getMosaicChanged().subscribe(
      async next => {
        const data = await this.mosaicService.filterMosaics();
        console.log(data);
        //this.mosaicSelect.slice(0);
        const mosaicsSelect: any = [{
          value: '1',
          label: 'Select',
          selected: true,
          disabled: true
        }];

        if (data) {
          data.forEach(element => {
            const nameMosaic = (element.mosaicNames.names.length > 0) ? element.mosaicNames.names[0].name : this.proximaxProvider.getMosaicId(element.idMosaic).toHex();
            const addressOwner = this.proximaxProvider.createAddressFromPublicKey(
              element.mosaicInfo.owner.publicKey,
              element.mosaicInfo.owner.address['networkType']
            );

            let expired = false;
            let nameExpired = '';

            const durationMosaic = new UInt64([
              element.mosaicInfo['properties']['duration']['lower'],
              element.mosaicInfo['properties']['duration']['higher']
            ]);

            const createdBlock = new UInt64([
              element.mosaicInfo.height.lower,
              element.mosaicInfo.height.higher
            ]);


            if (durationMosaic.compact() > 0) {
              if (this.currentBlock >= durationMosaic.compact() + createdBlock.compact()) {
                expired = true;
                nameExpired = ' - Expired';
              }
            }

            const currentAccount = Object.assign({}, this.walletService.getCurrentAccount());
            const isOwner = (
              addressOwner.pretty() ===
              this.proximaxProvider.createFromRawAddress(currentAccount.address).pretty()
            ) ? true : false;

            if (isOwner) {
              mosaicsSelect.push({
                value: element.idMosaic,
                label: `${nameMosaic}${nameExpired}`,
                selected: false,
                disabled: expired
              });
            }
          });
        }
        this.mosaicSelect = mosaicsSelect;
      }
    ));
  }

  /**
   *
   *
   * @memberof AliasMosaicsToNamespaceComponent
   */
  getTransactionStatus() {
    this.subscription['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
          const match = statusTransactionHash === this.transactionSigned.hash;

          if (match) {
            this.blockSend = false;
            this.clearForm();
          }
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.transactionSigned = null;
            this.sharedService.showSuccess('', 'Transaction confirmed');
            this.mosaicService.resetMosaicsStorage();
            this.namespaceService.resetNamespaceStorage();
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionSigned = null;
            this.sharedService.showInfo('', 'Transaction unconfirmed');
          } else if (match) {
            this.transactionSigned = null;
            this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
          }
        }
      }
    );
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof AliasMosaicsToNamespaceComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.linkingNamespaceToMosaic.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.linkingNamespaceToMosaic.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.linkingNamespaceToMosaic.get(nameInput);
    }
    return validation;
  }


  /**
   *
   *
   * @memberof AliasMosaicsToNamespaceComponent
   */
  sendTransaction() {
    if (this.linkingNamespaceToMosaic.valid && !this.blockSend) {
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(this.amountAccount, Number(this.fee), 0)
      if (validateAmount) {
        this.blockSend = true;
        const common = {
          password: this.linkingNamespaceToMosaic.get('password').value,
          privateKey: ''
        }

        if (this.walletService.decrypt(common)) {
          // const action = this.linkingNamespaceToMosaic.get('typeAction').value;
          const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
          // const namespaceId = new NamespaceId(this.linkingNamespaceToMosaic.get('namespace').value);
          // const mosaicId = new MosaicId(this.linkingNamespaceToMosaic.get('mosaic').value);
          // const mosaicSupplyChangeTransaction = this.proximaxProvider.linkingNamespaceToMosaic(
          //   action,
          //   namespaceId,
          //   mosaicId,
          //   this.walletService.currentAccount.network
          // );
          const generationHash = this.dataBridge.blockInfo.generationHash;
          const signedTransaction = account.sign(this.mosaicSupplyChangeTransaction, generationHash); //Update-sdk-dragon
          this.transactionSigned = signedTransaction;
          this.proximaxProvider.announce(signedTransaction).subscribe(
            x => {

              // this.sharedService.showSuccess('success', 'Transaction sent');
              if (this.subscription['transactionStatus'] === undefined || this.subscription['transactionStatus'] === null) {
                this.getTransactionStatus();
              }
            },
            err => {
              this.blockSend = false;
              this.clearForm();
              this.sharedService.showError('', 'An unexpected error has occurred');
            });
        } else {
          this.blockSend = false;
        }
      } else {
        this.sharedService.showError('', 'insufficient balance');
      }
    }

  }

}
