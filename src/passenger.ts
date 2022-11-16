import {Logger} from '../lib/logger';
import {Floor} from './floor';
import {Elevator} from './elevator';
import {Node} from '../lib/doubleLinkedList';

export class Passenger {
  private readonly logger: Logger;
  public destinationFloor: Node<Floor>;
  private done = false;

  constructor(
    public id: number,
    public currentFloor: Node<Floor>,
  ) {
    this.logger = new Logger(Passenger.name, this.id);
  }

  pressFloorButton(destination: Node<Floor>) {
    this.logger.log('pressed floor button');

    const direction = this.currentFloor.data.getDirection(destination.data);

    this.destinationFloor = destination;
    this.currentFloor.data.call(direction, this);
  }

  enter(elevator: Elevator): boolean {
    if (this.done) {
      return false;
    }

    this.logger.log('enter');

    const direction = this.currentFloor.data.getDirection(this.destinationFloor.data);

    elevator.command('INTERNAL', this.destinationFloor, direction);

    return true;
  }

  exit(elevator: Elevator) {
    const ok = elevator.passengerExit(this);

    // Can happen if we haven't picked up the passenger yet
    // and are trying to get him to come out
    if (!ok) {
      return;
    }

    if (elevator.currentFloor !== this.destinationFloor) {
      return;
    }

    // Exit when we reach the destination
    this.currentFloor = elevator.currentFloor;
    this.done = true;
    this.logger.log('exit');
  }
}
