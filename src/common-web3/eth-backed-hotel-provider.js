// @flow
import type { HotelInterface } from '../interfaces';
import Utils from './utils';
import Contracts from './contracts';
import RemotelyBacked from '../dataset/remotely-backed';

class EthBackedHotelProvider {
  address: Promise<?string> | ?string;

  // provided by eth backed dataset
  url: Promise<?string> | ?string;
  manager: Promise<?string> | ?string;
  
  web3Utils: Utils;
  web3Contracts: Contracts;
  indexContract: Object;
  contractInstance: Object;
  ethBackedDataset: RemotelyBacked;

  constructor (web3Utils: Utils, web3Contracts: Contracts, indexContract: Object, address?: string) {
    this.address = address;
    this.web3Utils = web3Utils;
    this.web3Contracts = web3Contracts;
    this.indexContract = indexContract;
  }

  async initialize (): Promise<void> {
    this.ethBackedDataset = new RemotelyBacked();
    this.ethBackedDataset.bindProperties({
      fields: {
        url: {
          remoteGetter: async (): Promise<?string> => {
            return (await this._getContractInstance()).methods.url().call();
          },
          remoteSetter: this._editInfo.bind(this),
        },
        manager: {
          remoteGetter: async (): Promise<?string> => {
            return (await this._getContractInstance()).methods.manager().call();
          },
        },
      },
    }, this);
    if (this.address) {
      this.ethBackedDataset.markDeployed();
    }
  }

  setLocalData (newData: HotelInterface) {
    this.manager = newData.manager || this.manager;
    this.url = newData.url;
  }

  async _getContractInstance (): Promise<Object> {
    if (!this.address) {
      throw new Error('Cannot get hotel instance without address');
    }
    if (!this.contractInstance) {
      this.contractInstance = await this.web3Contracts.getHotelInstance(this.address, this.web3Utils.getCurrentWeb3Provider());
    }
    return this.contractInstance;
  }

  async _editInfo (transactionOptions: Object): Promise<string> {
    // TODO replace this with
    // const data = (await this._getContractInstance()).methods.editInfo(await this.url).encodeABI();
    const data = this.web3Utils.encodeMethodCall((await this._getContractInstance()).options.jsonInterface, 'editInfo', [await this.url]);
    const estimate = await this.indexContract.methods.callHotel(this.address, data).estimateGas(transactionOptions);
    return new Promise(async (resolve, reject) => {
      return this.indexContract.methods.callHotel(this.address, data).send(Object.assign(transactionOptions, {
        gas: this.web3Utils.applyGasCoefficient(estimate),
      })).on('transactionHash', (hash) => {
        resolve(hash);
      }).on('error', (err) => {
        reject(new Error('Cannot update hotel info: ' + err));
      }).catch((err) => {
        reject(new Error('Cannot update hotel info: ' + err));
      });
    });
  }

  async createOnNetwork (transactionOptions: Object, dataUrl: string): Promise<Array<string>> {
    // Pre-compute hotel address, we need to use index for it's creating the contract
    this.address = this.web3Utils.determineDeployedContractFutureAddress(
      this.indexContract.options.address,
      await this.web3Utils.determineCurrentAddressNonce(this.indexContract.options.address)
    );
    // Create hotel on-network
    const estimate = await this.indexContract.methods.registerHotel(dataUrl).estimateGas(transactionOptions);
    return new Promise(async (resolve, reject) => {
      this.indexContract.methods.registerHotel(dataUrl).send(Object.assign({}, transactionOptions, {
        gas: this.web3Utils.applyGasCoefficient(estimate),
      })).on('transactionHash', (hash) => {
        resolve([
          hash,
        ]);
      }).on('receipt', () => {
        this.ethBackedDataset.markDeployed();
      }).on('error', (err) => {
        reject(new Error('Cannot create hotel: ' + err));
      }).catch((err) => {
        reject(new Error('Cannot create hotel: ' + err));
      });
    });
  }

  async updateOnNetwork (transactionOptions: Object): Promise<Array<string>> {
    // check if contract is available at all
    await this._getContractInstance();
    // We have to clone options for each dataset as they may get modified
    // along the way
    return this.ethBackedDataset.updateRemoteData(Object.assign({}, transactionOptions));
  }

  async removeFromNetwork (transactionOptions: Object): Promise<Array<string>> {
    if (!this.ethBackedDataset.isDeployed()) {
      throw new Error('Cannot remove hotel: not deployed');
    }
    const estimate = await this.indexContract.methods.deleteHotel(this.address).estimateGas(transactionOptions);
    return new Promise(async (resolve, reject) => {
      this.indexContract.methods.deleteHotel(this.address).send(Object.assign(transactionOptions, {
        gas: this.web3Utils.applyGasCoefficient(estimate),
      })).on('transactionHash', (hash) => {
        resolve([
          hash,
        ]);
      }).on('receipt', () => {
        this.ethBackedDataset.markObsolete();
      }).on('error', (err) => {
        reject(new Error('Cannot remove hotel: ' + err));
      }).catch((err) => {
        reject(new Error('Cannot remove hotel: ' + err));
      });
    });
  }
}

export default EthBackedHotelProvider;
