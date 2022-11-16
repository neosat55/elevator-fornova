import {Logger} from '../lib/logger';
import {Dispatcher} from './dispatcher';
import {Direction} from './ifaces';
import {Passenger} from './passenger';

export class Floor {
  private readonly logger: Logger;

  constructor(
    private dispatcher: Dispatcher,
    public level: number = 1,
  ) {
    this.logger = new Logger(Floor.name, level);
  }

  call(direction: Direction, passenger: Passenger) {
    this.logger.log(`call elevator`);

    this.dispatcher.callElevator(direction, passenger);
  }

  getDirection(other: Floor): Direction {
    return other.level > this.level ? 'UP' : 'DOWN';
  }

  /**
   * @param other
   */
  compareTo(other: Floor): number {
    return this.level - other.level;
  }

  isSameLevel(other: Floor): boolean {
    return this.compareTo(other) === 0;
  }

  toString() {
    return this.level;
  }
}
