// @flow
import ethJsUtil from 'ethereumjs-util';
import type { OffChainDataAccessorInterface } from '../interfaces';

/**
 * Simple in-memory key value store that creates
 * its keys with ethereum based sha3 hash function.
 */
export class Storage {
  _storage: Object;

  constructor () {
    this._storage = {};
  }

  /**
   * Private method that hashes arbitrary data with SHA-3.
   * Before hashing, data is JSON.stringified and a current
   * timestamp is prepended to prevent collisions.
   *
   * @param  {Object} data to be hashed
   * @return {string} resulting sha3 hash
   */
  _computeHash (data: Object): string {
    return ethJsUtil.bufferToHex(ethJsUtil.sha3(Date.now() + ':' + JSON.stringify(data)));
  }

  /**
   * Adds new data to the in-memory storage.
   * @param  {Object} data
   * @return {string} hash under which the data is stored
   */
  create (data: Object): string {
    const keyHash = this._computeHash(data);
    this._storage[keyHash] = data;
    return keyHash;
  }

  /**
   * Update data under certain key
   * @param  {string} hash under which to store new data
   * @param  {Object} data
   */
  update (hash: string, data: Object) {
    this._storage[hash] = data;
  }

  /**
   * Retrieve data from a certain hash
   * @param  {string} hash under which is the desired data
   * @return {Object}
   */
  get (hash: string): Object {
    return this._storage[hash];
  }
}

/**
 * Single instance of Storage that should be used
 * throughout the whole application.
 * @type {Storage}
 */
export const storageInstance = new Storage();

/**
 * OffChainDataAccessorInterface based on a simple in-memory key-value
 * storage.
 */
class InMemoryAccessor implements OffChainDataAccessorInterface {
  _getHash (url: string): string {
    const matchResult = url.match(/\w+:\/\/(.+)/i);
    if (!matchResult || matchResult.length < 2) {
      throw new Error(`Cannot use InMemoryAccessor with ${url}, no schema detected.`);
    }
    return matchResult[1];
  }

  /**
   * Retrieves data stored under a hash derived from url `json://<hash>`
   * @throws {Error} When hash cannot be detected.
   */
  async download (url: string): Promise<?{[string]: Object}> {
    const hash = this._getHash(url);
    return storageInstance.get(hash);
  }

  /**
   * Stores data under some hash.
   * @return {string} Resulting url such as `json://<hash>`
   */
  async upload (data: {[string]: Object}): Promise<string> {
    return 'json://' + storageInstance.create(data);
  }
  
  /**
   * Changes data stored under certain hash derived from url such as `json://<hash>`
   * @return {string} url
   */
  async update (url: string, data: {[string]: Object}): Promise<string> {
    const hash = this._getHash(url);
    storageInstance.update(hash, data);
    return url;
  }
}

export default InMemoryAccessor;
