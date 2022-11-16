import {Direction, RequestType} from './ifaces';
import {Floor} from './floor';
import {Node} from '../lib/doubleLinkedList';

// Command from floor
export class ExternalRequest {
  constructor(
    public direction: Direction,
    public floorNode: Node<Floor>,
  ) {
  }

  get type(): RequestType {
    return 'EXTERNAL';
  }

  getLevel(): number {
    return this.floorNode.data.level;
  }
}

// Command inside elevator
export class InternalRequest {
  constructor(public floorNode: Node<Floor>) {
  }

  get type(): RequestType {
    return 'INTERNAL';
  }

  getLevel(): number {
    return this.floorNode.data.level;
  }
}

export type GeneralRequest = ExternalRequest | InternalRequest;

// General command
export class Request {
  constructor(
    public val: ExternalRequest | InternalRequest
  ) {
  }

  static of(val: ExternalRequest | InternalRequest): Request {
    return new Request(val);
  }
}
