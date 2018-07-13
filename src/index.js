// @flow

import type { DataModelOptionsType } from './data-model';
import type { OffChainDataClientOptionsType } from './off-chain-data-client';
import type { WTIndexInterface, AdaptedTxResultsInterface, OffChainDataAdapterInterface, WalletInterface, KeystoreV3Interface } from './interfaces';
import DataModel from './data-model';
import OffChainDataClient from './off-chain-data-client';

import {
  WTLibsError,
  SmartContractInstantiationError,
  WalletError,
  MalformedWalletError,
  WalletStateError,
  WalletPasswordError,
  WalletSigningError,
  InputDataError,
  OffChainDataError,
  OffChainDataConfigurationError,
  OffChainDataRuntimeError,
  StoragePointerError,
  RemotelyBackedDatasetError,
  RemoteDataAccessError,
  RemoteDataReadError,
} from './errors';

/**
 * General options for wt-libs-js. Holds all things necessary
 * for successful setup of Winding Tree network.
 *
 * @type WtLibsOptionsType
 */
type WtLibsOptionsType = {
  dataModelOptions: DataModelOptionsType,
  offChainDataOptions: OffChainDataClientOptionsType
};

/**
 * Main public interface of wt-libs-js.
 */
class WTLibs {
  static errors: Object;
  dataModel: DataModel;
  offChainDataClient: OffChainDataClient;
  options: WtLibsOptionsType;

  /**
   * Call this to create wt-libs-js instance.
   * @param options
   * @return WTLibs
   */
  static createInstance (options: WtLibsOptionsType): WTLibs {
    return new WTLibs(options);
  }

  constructor (options: WtLibsOptionsType) {
    this.options = options || {};
    this.dataModel = DataModel.createInstance(this.options.dataModelOptions);
    OffChainDataClient.setup(this.options.offChainDataOptions);
  }

  /**
   * Get an instance of Winding Tree index from the underlying `data-model`.
   *
   * @param address of the Winding Tree index
   * @type Promise<WTIndexInterface>
   */
  async getWTIndex (address: string): Promise<WTIndexInterface> {
    return this.dataModel.getWindingTreeIndex(address);
  }

  /**
   * Get a transactions status from the underlying `data-model`
   */
  async getTransactionsStatus (transactionHashes: Array<string>): Promise<AdaptedTxResultsInterface> {
    return this.dataModel.getTransactionsStatus(transactionHashes);
  }

  async createWallet (jsonWallet: KeystoreV3Interface): Promise<WalletInterface> {
    return this.dataModel.createWallet(jsonWallet);
  }

  async getOffChainDataClient (schema: string): Promise<OffChainDataAdapterInterface> {
    return OffChainDataClient.getAdapter(schema);
  }
}

/**
 * A map of errors that WTLibs can throw, useful
 * for checking what happened in your code.
 */
WTLibs.errors = {
  WTLibsError,
  SmartContractInstantiationError,
  WalletError,
  MalformedWalletError,
  WalletStateError,
  WalletPasswordError,
  WalletSigningError,
  InputDataError,
  OffChainDataError,
  OffChainDataConfigurationError,
  OffChainDataRuntimeError,
  StoragePointerError,
  RemotelyBackedDatasetError,
  RemoteDataAccessError,
  RemoteDataReadError,
};

export default WTLibs;
