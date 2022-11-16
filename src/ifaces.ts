import {Node} from '../lib/doubleLinkedList';
import {Floor} from './floor';

export type ElevatorState = 'IDLE' | 'MAINTENANCE' | 'MOVING';
export type DoorState = 'OPEN' | 'CLOSE';
export type Direction = 'UP' | 'DOWN';
export type RequestType = 'INTERNAL' | 'EXTERNAL';

export interface IElevatorConfig {
  id: number,
  currentFloor: Node<Floor>,
  state: ElevatorState,
  maxPassengers: number,
}
