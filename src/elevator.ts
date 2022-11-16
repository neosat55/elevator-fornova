import {Logger} from '../lib/logger';
import {Direction, ElevatorState, IElevatorConfig, RequestType} from './ifaces';
import {Passenger} from './passenger';
import {Queue} from '../lib/queue';
import {ExternalRequest, GeneralRequest, InternalRequest} from './requests';
import {Floor} from './floor';
import {Node} from '../lib/doubleLinkedList';
import {EventEmitter} from 'events';

const LEVEL_TIMEOUT = 2000; //time to move one floor
const DOOR_TIMEOUT = 3000; //time to wait for inner commands when doors open

export class Elevator extends EventEmitter {
  private readonly logger: Logger;
  private readonly passengers: Passenger[] = [];
  public readonly innerQueue = new Queue<InternalRequest>();
  public outerQueue = new Queue<ExternalRequest>();

  public direction: Direction;
  public running: InternalRequest | null = null;
  public id: number;
  public currentFloor: Node<Floor>;
  public state: ElevatorState = 'IDLE';
  public maxPassengers: number = 5;

  constructor(config: IElevatorConfig) {
    super();

    this.id = config.id;
    this.currentFloor = config.currentFloor;
    this.state = config.state || 'IDLE';
    this.maxPassengers = config.maxPassengers || 5;

    this.logger = new Logger(Elevator.name, this.id);

    this.on('eval', () => {
      setTimeout(() => {
        this.evaluate();
      }, 1000);
    });
  }

  command(type: RequestType, floor: Node<Floor>, direction: Direction) {
    if (type === 'INTERNAL') {
      this.innerQueue.enqueue(new InternalRequest(floor));
    } else if (type === 'EXTERNAL') {
      this.direction = direction;
      this.outerQueue.enqueue(new ExternalRequest(direction, floor));
    }

    if (!this.running) {
      this.emit('eval');
    }
  }

  evaluate() {
    // cannot perform new requests while running
    if (this.running) {
      return;
    }

    if (!this.innerQueue.isEmpty()) {
      const current = this.innerQueue.dequeue();

      this.logger.log(`picked internal request to ${current?.floorNode.data}`);

      this.running = current;
      this.move(current as InternalRequest);
    } else if (!this.outerQueue.isEmpty()) {
      const current = this.outerQueue.dequeue();

      this.logger.log(`picked external request to ${current?.floorNode.data}`);

      this.running = current;
      this.move(current as ExternalRequest);
    }
  }

  move(request: GeneralRequest) {
    if (this.isSameLevel(request.floorNode)) {
      if (request.type === 'EXTERNAL') {
        let optimize: ExternalRequest | undefined;
        let matches;

        if ((request as ExternalRequest).direction === 'UP') {
          matches = this.outerQueue.filter((q) => {
            return q.getLevel() < request.getLevel() && q.direction === 'UP';
          });

          matches.sort((a, b) => a.getLevel() - b.getLevel());
        } else {
          matches = this.outerQueue.filter((q) => {
            return q.getLevel() > request.getLevel() && q.direction === 'DOWN';
          });

          matches.sort((a, b) => b.getLevel() - a.getLevel());
        }

        optimize = matches.shift();

        if (optimize !== undefined) {
          this.outerQueue.clearBy((q) => {
            return q.getLevel() !== optimize?.getLevel();
          });

          this.outerQueue.putAtStart(request as ExternalRequest);

          this.move(optimize);
          return;
        }
      }

      setTimeout(() => {
        this.running = null;

        this.logger.log(`Opening doors at destination: ${this.getFloorLevel(this.currentFloor)}`);

        if (!this.innerQueue.isEmpty() || !this.outerQueue.isEmpty()) {
          this.emit('eval');
        } else {
          this.state = 'IDLE';
        }

        if (this.state === 'IDLE') {
          this.emit('can_enter');
          this.emit('can_exit');
        }
      }, DOOR_TIMEOUT);

      return;
    }

    this.state = 'MOVING';
    this.direction = this.currentFloor.data.level > request.floorNode.data.level ? 'DOWN' : 'UP';

    setTimeout(() => {
      const floor = this.direction === 'UP' ?
        this.currentFloor.next :
        this.currentFloor.prev;

      if (!floor) {
        console.log(`something wrong; cannot reach floor: ${request.floorNode.data.level}`);

        return;
      }

      this.currentFloor = floor;

      /**
       * if we need to make a middle stop we do it here, delaying our leave.
       * It's possible that someone wants to get off or that someone outside wants to go in the same direction so we
       * stop for a pick-up
       */
      const found = this.getRequest(
        'INTERNAL', this.currentFloor.data, this.direction,
      ) || this.getRequest(
        'EXTERNAL', this.currentFloor.data, this.direction,
      );

      this.logger.log(`After ${this.state} ${this.direction} reach floor ${this.currentFloor.data.toString()}`);

      if (found) {
        this.logger.log(`[OPTIMIZE] Opening doors at destination: ${this.getFloorLevel(this.currentFloor)}`);
        this.offload(found.type, this.currentFloor.data, this.direction);

        setTimeout(() => {
          this.emit('can_exit');
          this.emit('can_enter');

          this.move(request);
        }, DOOR_TIMEOUT);
      } else {
        this.move(request);
      }
    }, LEVEL_TIMEOUT);
  }

  passengerEnter(passenger: Passenger) {
    if (this.isFull()) {
      this.logger.log('full load');

      return;
    }

    if (
      this.currentFloor.data.level !== passenger.currentFloor.data.level ||
      this.currentFloor.data.level === passenger.destinationFloor.data.level
    ) {
      return;
    }

    const ok = passenger.enter(this);

    if (ok) {
      this.logger.log(`passenger#${passenger.id} enter`);
      this.passengers.push(passenger);
    }
  }

  passengerExit(passenger: Passenger): boolean {
    const passIdx = this.passengers.findIndex((pass) => pass === passenger);

    if (passIdx === -1) {
      return false;
    }

    if (this.currentFloor.data.level !== passenger.destinationFloor.data.level) {
      return false;
    }

    // remove passenger from passengers
    this.passengers.splice(passIdx, 1);

    return true;
  }

  isFull() {
    return this.passengers.length === this.maxPassengers;
  }

  isEmpty() {
    return this.passengers.length === 0;
  }

  getFloorLevel(floor: Node<Floor>) {
    return floor.data.level;
  }

  currentFloorLevel(): number {
    return this.currentFloor.data.level;
  }

  isSameLevel(other: Node<Floor>): boolean {
    return this.currentFloor.data.isSameLevel(other.data);
  }

  private unloadPassengers() {
    if (this.isEmpty()) {
      this.logger.log('No passengers in elevator');

      return;
    }

    // remove passengers from elevator
    // if passenger reach the destination passenger called elevator.passengerExit method
    this.passengers.forEach((passenger) => passenger.exit(this));
  }

  private getRequest(type: RequestType, floor: Floor, direction: Direction): GeneralRequest | null {
    if (type === 'INTERNAL') {
      return this.innerQueue.find((q) => q.getLevel() === floor.level);
    }

    return this.outerQueue.find((q) => q.getLevel() === floor.level && q.direction === direction);
  }

  private offload(type: RequestType, floor: Floor, direction: Direction) {
    if (type === 'INTERNAL') {
      this.innerQueue.clearBy((q) => {
        return q.getLevel() !== floor.level;
      });
    } else {
      this.outerQueue.clearBy((q) => {
        return q.getLevel() !== floor.level || q.direction !== direction;
      });
    }
  }
}
